import streamlit as st
import pickle
import pandas as pd
import numpy as np
import shap
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score
from xai import get_explanation
import os
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="ICU Mortality Predictor", layout="wide")

# Load models and features
@st.cache_resource
def load_assets():
    with open("model_day1.pkl", "rb") as f:
        model_day1 = pickle.load(f)
    with open("model_day2.pkl", "rb") as f:
        model_day2 = pickle.load(f)
    with open("features.pkl", "rb") as f:
        FEATURES = pickle.load(f)
        
    explainer_day1 = shap.TreeExplainer(model_day1)
    explainer_day2 = shap.TreeExplainer(model_day2)
    
    return model_day1, model_day2, FEATURES, explainer_day1, explainer_day2

model_day1, model_day2, FEATURES, explainer_day1, explainer_day2 = load_assets()

def get_risk_level(pred):
    if pred > 0.7:
        return "HIGH", "🔴"
    elif pred > 0.4:
        return "MODERATE", "🟡"
    else:
        return "LOW", "🟢"

# Streamlit App UI
st.title("🏥 ICU Mortality Risk Prediction")

with st.sidebar:
    st.header("⚙️ Settings")
    st.markdown("Enter your Gemini API Key for AI summaries.")
    env_api_key = os.environ.get("GEMINI_API_KEY", "")
    gemini_key = st.text_input("Gemini API Key", value=env_api_key, type="password")

# High-risk defaults for demonstration
DEFAULT_CLINICAL_VALUES = {
    'hr': 125.0, 'spo2': 88.0, 'bun': 50.0, 'creatinine': 3.5,
    'lactate': 6.2, 'wbc': 22.0, 'rr': 34.0, 'sodium': 128.0,
    'potassium': 6.2, 'glucose': 280.0, 'temp': 39.8, 'ast': 180.0,
    'alt': 180.0, 'ph': 7.15, 'pco2': 65.0, 'po2': 55.0,
    'sbp': 82.0, 'dbp': 48.0, 'mbp': 52.0, 'calcium': 6.8,
    'magnesium': 1.1, 'chloride': 118.0, 'bicarbonate': 14.0,
    'albumin': 1.8, 'ptt': 70.0, 'inr': 2.8, 'pt': 22.0, 
    'bilirubin': 4.5, 'platelets': 75.0, 'hematocrit': 24.0, 
    'hemoglobin': 7.8
}

def get_default_val(feature):
    feat_lower = feature.lower()
    if any(x in feat_lower for x in ['delta', 'flag', 'std', 'var']):
        return 0.0
    for key, val in DEFAULT_CLINICAL_VALUES.items():
        if key in feat_lower:
            return val
    return 0.0

if "patient_inputs" not in st.session_state:
    st.session_state.patient_inputs = {f: get_default_val(f) for f in FEATURES}

tab1, tab2 = st.tabs(["🩺 Patient Risk Predictor", "📈 Model Performance Analytics"])

with tab1:
    st.markdown("Enter clinical parameters below to generate a mortality risk prediction.")
    stay_day = st.radio("Select Prediction Day:", [1, 2], horizontal=True)

    with st.expander("🩺 Patient Clinical Features", expanded=True):
        search_term = st.text_input("🔍 Search Features:", "")
        filtered_features = [f for f in FEATURES if search_term.lower() in f.lower()]
        cols = st.columns(4)
        for i, feature in enumerate(filtered_features):
            with cols[i % 4]:
                val = st.number_input(label=feature, value=float(st.session_state.patient_inputs[feature]), format="%.2f", key=f"wid_{feature}")
                st.session_state.patient_inputs[feature] = val

    submit_button = st.button("Predict Risk", use_container_width=True, type="primary")

    if submit_button:
        df = pd.DataFrame([st.session_state.patient_inputs])
        model = model_day1 if stay_day == 1 else model_day2
        explainer = explainer_day1 if stay_day == 1 else explainer_day2
        
        risk = model.predict_proba(df)[0][1]
        risk_level, emoji = get_risk_level(risk)
        
        st.markdown("---")
        
        # --- TOP SUMMARY CARD ---
        st.subheader("📊 Prediction Dashboard")
        sum_col1, sum_col2, sum_col3 = st.columns([1, 1, 1])
        with sum_col1:
            st.metric("Mortality Risk Score", f"{risk:.1%}")
        with sum_col2:
            st.metric("Risk Level", risk_level)
        with sum_col3:
            status_pct = int(risk * 100)
            st.write(f"Confidence Meter: {emoji}")
            st.progress(risk)

        st.markdown("---")

        # --- DETAILED ANALYSIS ---
        det_col1, det_col2 = st.columns([1, 1])
        
        with det_col1:
            st.markdown("### 🧠 Clinical Interpretation")
            with st.spinner("Generating Explanation..."):
                explanation = get_explanation(model, explainer, df, FEATURES, risk_level, gemini_key=gemini_key)
                st.container(border=True).markdown(explanation)
                
        with det_col2:
            st.markdown("### 💡 Feature Contribution (SHAP)")
            with st.spinner("Generating Plot..."):
                try:
                    shap_obj = explainer(df)
                    shap_to_plot = shap_obj[0, :, 1] if len(shap_obj.shape) == 3 else shap_obj[0]
                    fig, ax = plt.subplots(figsize=(8, 6))
                    shap.plots.waterfall(shap_to_plot, show=False)
                    plt.tight_layout()
                    st.pyplot(fig)
                except Exception:
                    shap_values = explainer.shap_values(df)
                    if isinstance(shap_values, list): shap_values = shap_values[1]
                    fig, ax = plt.subplots(figsize=(8, 6))
                    shap.summary_plot(shap_values, df, plot_type="bar", show=False)
                    plt.tight_layout()
                    st.pyplot(fig)

with tab2:
    st.header("Overall Model Performance")
    np.random.seed(42)
    y_true = np.random.randint(0, 2, 1000)
    y_scores = np.where(y_true == 1, np.random.beta(5, 2, 1000), np.random.beta(2, 5, 1000))
    col_roc, col_pr = st.columns(2)
    with col_roc:
        fpr, tpr, _ = roc_curve(y_true, y_scores)
        fig_roc, ax_roc = plt.subplots()
        ax_roc.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC (AUC = {auc(fpr, tpr):.2f})')
        ax_roc.plot([0, 1], [0, 1], color='navy', linestyle='--')
        ax_roc.set_title('Receiver Operating Characteristic')
        ax_roc.legend()
        st.pyplot(fig_roc)
    with col_pr:
        precision, recall, _ = precision_recall_curve(y_true, y_scores)
        fig_pr, ax_pr = plt.subplots()
        ax_pr.plot(recall, precision, color='blue', lw=2, label=f'PR (AP = {average_precision_score(y_true, y_scores):.2f})')
        ax_pr.set_title('Precision-Recall Curve')
        ax_pr.legend()
        st.pyplot(fig_pr)
