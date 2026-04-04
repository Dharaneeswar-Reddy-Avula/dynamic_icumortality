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
with open("model_day1.pkl", "rb") as f:
    model_day1 = pickle.load(f)

with open("model_day2.pkl", "rb") as f:
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


def prepare_input(data: dict):
    df = pd.DataFrame([data])

    # Ensure all features exist
    for col in FEATURES:
        if col not in df:
            df[col] = 0

    df = df[FEATURES]
    return df


# =========================
# MAIN ENDPOINT
# =========================
@app.post("/predict")
def predict(data: dict):

    stay_day = data.get("stay_day", 1)
    model_type = data.get("model_type", "lightgbm").lower()
    gemini_key = data.get("gemini_key", None)

    # Prepare input
    df = prepare_input(data)

    # Select model and explainer
    if model_type == "lightgbm":
        if stay_day == 1:
            model = model_day1
            explainer = explainer_day1
        else:
            model = model_day2
            explainer = explainer_day2
    else:
        # Dynamic loading for newly requested models (xgboost, randomforest, elasticnet)
        model_filename = f"model_{model_type}_day{stay_day}.pkl"
        try:
            with open(model_filename, "rb") as f:
                model = pickle.load(f)
            explainer = shap.TreeExplainer(model)
        except FileNotFoundError:
            raise HTTPException(
                status_code=404, 
                detail=f"The {model_type} model file for Day {stay_day} was not found. Please place '{model_filename}' in the backend directory."
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Prediction
    try:
        risk = model.predict_proba(df)[0][1]
    except AttributeError:
        # Fallback if the user uploaded a model without `predict_proba`
        risk = float(model.predict(df)[0])
        
    risk_level = get_risk_level(risk)
    
    # Explain Prediction
    explanation = get_explanation(model, explainer, df, FEATURES, risk_level, gemini_key=gemini_key)

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