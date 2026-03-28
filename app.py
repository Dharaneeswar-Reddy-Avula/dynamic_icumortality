from fastapi import FastAPI
import pickle
import pandas as pd
import shap
from xai import get_explanation

app = FastAPI()

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

    # Prepare input
    df = prepare_input(data)

    # Select model and explainer
    if stay_day == 1:
        model = model_day1
        explainer = explainer_day1
    else:
        model = model_day2
        explainer = explainer_day2

    # Prediction
    risk = model.predict_proba(df)[0][1]
    risk_level = get_risk_level(risk)
    
    # Explain Prediction
    explanation = get_explanation(model, explainer, df, FEATURES, risk_level)

    return {
        "risk_score": float(risk),
        "risk_level": risk_level,
        "explanation": explanation
    }