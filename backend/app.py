from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd
import shap
import io
import base64
import matplotlib
matplotlib.use('Agg') # Set backend to Agg for non-interactive rendering
import matplotlib.pyplot as plt
from fastapi import HTTPException
from xai import get_explanation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# =========================
# LOAD MODELS & EXPLAINERS
# =========================
with open("models/lgbm/model_day1_lgbm.pkl", "rb") as f:
    model_day1 = pickle.load(f)

with open("models/lgbm/model_day2_lgbm.pkl", "rb") as f:
    model_day2 = pickle.load(f)

with open("features.pkl", "rb") as f:
    FEATURES = pickle.load(f)

# Initialize explainers on startup to save time during requests
explainer_day1 = shap.TreeExplainer(model_day1)
explainer_day2 = shap.TreeExplainer(model_day2)

# =========================
# HELPER FUNCTIONS
# =========================
def get_risk_level(pred):
    if pred > 0.7:
        return "HIGH"
    elif pred > 0.4:
        return "MODERATE"
    else:
        return "LOW"


def prepare_input(data: dict, features_list: list = None):
    if features_list is None:
        features_list = FEATURES
    df = pd.DataFrame([data])

    # Ensure all features exist
    for col in features_list:
        if col not in df:
            df[col] = 0

    df = df[features_list]
    return df


# =========================
# MAIN ENDPOINT
# =========================
@app.post("/predict")
def predict(data: dict):

    stay_day = data.get("stay_day", 1)
    model_type = data.get("model_type", "lightgbm").lower()
    gemini_key = data.get("gemini_key", None)

    if model_type == "eicu_to_mimic_lightgbm":
        with open("features_eicu_to_mimic.pkl", "rb") as f:
            features_list = pickle.load(f)
    else:
        features_list = FEATURES

    # Prepare input
    df = prepare_input(data, features_list)

    # Model mapping based on user directory
    MODEL_MAP = {
        "lightgbm": {
            1: "models/lgbm/model_day1_lgbm.pkl",
            2: "models/lgbm/model_day2_lgbm.pkl"
        },
        "eicu_to_mimic_lightgbm": {
            1: "models/lgbm/model_day1_eicu_to_mimic_lgbm.pkl",
            2: "models/lgbm/model_day2_eicu_to_mimic-lgbm.pkl"
        },
        "xgboost": {
            1: "models/xgb/day1_xg_model.pkl",
            2: "models/xgb/day2_xg_model.pkl"
        },
        "randomforest": {
            1: "models/random_forest/model_rf_day1.pkl",
            2: "models/random_forest/model_rf_day2.pkl"
        },
        "elasticnet": {
            1: "models/logisticRegression/Elasticnetmodel_day1.pkl",
            2: "models/logisticRegression/Elasticnetmodel_day2.pkl"
        }
    }

    if model_type not in MODEL_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported model type: {model_type}")

    model_filename = MODEL_MAP[model_type].get(stay_day)
    
    try:
        scaler = None
        # For performance, only load if not already globally loaded (lightgbm is pre-loaded)
        if model_type == "lightgbm":
            if stay_day == 1:
                model, explainer = model_day1, explainer_day1
            else:
                model, explainer = model_day2, explainer_day2
        else:
            # Dynamic loading for other models
            try:
                with open(model_filename, "rb") as f:
                    loaded = pickle.load(f)
            except Exception:
                import joblib
                loaded = joblib.load(model_filename)
            
            # Extract nested model and scaler if wrapped in a dict
            if isinstance(loaded, dict):
                model = loaded.get("model", loaded)
                scaler = loaded.get("scaler", None)
            else:
                model = loaded
                scaler = None
                
            # Use TreeExplainer for XGBoost/RandomForest/LightGBM, or generic Explainer for others
            if "xg" in model_type or "random" in model_type or "lgbm" in model_type or "lightgbm" in model_type:
                explainer = shap.TreeExplainer(model)
            else:
                explainer = None # Will initialize after df filtering and scaling
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, 
            detail=f"The {model_type} model file for Day {stay_day} was not found. Please ensure '{model_filename}' is in the backend directory."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading {model_type} model: {str(e)}")

    # Prediction
    try:
        # AUTOMATIC REORDERING: Ensure features match the model's expected order
        model_features = []
        if 'loaded' in locals() and isinstance(loaded, dict) and 'features' in loaded:
            model_features = loaded['features']
        elif hasattr(model, 'feature_names_in_'):
            model_features = list(model.feature_names_in_)
        elif hasattr(model, 'get_booster'):
            model_features = model.get_booster().feature_names
        
        if model_features:
            # Ensure all required features are present
            for col in model_features:
                if col not in df:
                    df[col] = 0
            # Reorder DataFrame columns to match model's training order
            df = df[model_features]
            
        if 'scaler' in locals() and scaler:
            input_df = pd.DataFrame(scaler.transform(df), columns=df.columns)
        else:
            input_df = df
            
        # Initialize explainer for linear models here now that input_df is correctly scaled and shaped
        if explainer is None:
            explainer = shap.Explainer(model, input_df)
            
        risk = model.predict_proba(input_df)[0][1]
    except Exception as e:
        # Fallback for models without predict_proba or other common inference issues
        try:
            risk = float(model.predict(input_df)[0])
        except Exception as inner_e:
            raise HTTPException(
                status_code=500, 
                detail=f"Prediction error for {model_type}: {str(e)}. Fallback failed: {str(inner_e)}"
            )
        
    risk_level = get_risk_level(risk)
    
    # Explain Prediction (Wrap in try-except to prevent whole response failure if AI fails)
    try:
        explanation = get_explanation(model, explainer, df, model_features if model_features else features_list, risk_level, gemini_key=gemini_key)
    except Exception as e:
        explanation = f"AI Explanation generation failed but risk was calculated: {str(e)}"

    # Generate SHAP Plot Image
    shap_base64 = ""
    try:
        shap_obj = explainer(df)
        shap_to_plot = shap_obj[0, :, 1] if len(shap_obj.shape) == 3 else shap_obj[0]
        fig, ax = plt.subplots(figsize=(8, 6))
        shap.plots.waterfall(shap_to_plot, show=False)
        plt.tight_layout()
        
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight")
        buf.seek(0)
        shap_base64 = base64.b64encode(buf.read()).decode("utf-8")
        plt.close(fig)
    except Exception as e:
        try:
            # Fallback to summary plot if waterfall fails
            shap_values = explainer.shap_values(df)
            if isinstance(shap_values, list): shap_values = shap_values[1]
            fig, ax = plt.subplots(figsize=(8, 6))
            shap.summary_plot(shap_values, df, plot_type="bar", show=False)
            plt.tight_layout()
            
            buf = io.BytesIO()
            fig.savefig(buf, format="png", bbox_inches="tight")
            buf.seek(0)
            shap_base64 = base64.b64encode(buf.read()).decode("utf-8")
            plt.close(fig)
        except:
            shap_base64 = ""

    return {
        "risk_score": float(risk),
        "risk_level": risk_level,
        "explanation": explanation,
        "shap_plot": shap_base64
    }