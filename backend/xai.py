# ============================================================
# 🔷 PRODUCTION-LEVEL EXPLAINABLE ICU MORTALITY SYSTEM
# ============================================================

import os
from dotenv import load_dotenv
import shap
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

load_dotenv()

# ============================================================
# 2. NORMAL CLINICAL RANGES
# ============================================================
normal_ranges = {
    'hr_mean': (60, 100),
    'spo2_mean': (92, 100),
    'bun_max': (7, 20),
    'creatinine': (0.6, 1.3),
    'lactate': (0.5, 2.0),
    'wbc_min': (4, 11),
    'rr_mean': (12, 20)
}

# ============================================================
# 3. CLINICAL RULES
# ============================================================
clinical_rules = [
    # Respiratory
    ('spo2_std', lambda v: "high variability in oxygen saturation" if v > 5 else "stable oxygen saturation"),
    ('spo2_mean', lambda v: f"low oxygen saturation ({int(v)}%, normal: >=92%)" if v < 92 else f"normal oxygen saturation ({int(v)}%)"),
    # Cardiovascular
    ('hr_mean', lambda v: f"high heart rate ({int(v)} bpm, normal: 60-100)" if v > 100 else f"low heart rate ({int(v)} bpm, normal: 60-100)" if v < 60 else f"normal heart rate ({int(v)} bpm)"),
    # Renal
    ('bun_max', lambda v: f"elevated BUN ({int(v)} mg/dL, normal: 7-20 mg/dL) suggesting renal dysfunction" if v > 20 else f"normal kidney function (BUN {int(v)} mg/dL)"),
    ('creatinine', lambda v: f"elevated creatinine ({round(v,2)} mg/dL, normal: 0.6-1.3 mg/dL) suggesting renal dysfunction" if v > 1.3 else f"normal creatinine ({round(v,2)} mg/dL)"),
    # Perfusion
    ('lactate', lambda v: f"elevated lactate ({round(v,2)} mmol/L, normal: <2 mmol/L) suggesting hypoperfusion" if v > 2 else f"normal lactate ({round(v,2)} mmol/L)"),
    # Infection
    ('wbc_min', lambda v: f"low WBC ({round(v,1)} x10^9/L, normal: 4-11 x10^9/L)" if v < 4 else f"normal WBC ({round(v,1)} x10^9/L)"),
    # Respiratory rate
    ('rr_mean', lambda v: f"abnormal respiratory rate ({int(v)} breaths/min, normal: 12-20)" if v > 20 or v < 12 else f"normal respiratory rate ({int(v)} breaths/min)")
]

# ============================================================
# 4. FEATURE FILTERING
# ============================================================
exclude_from_explanation = ['icu_los_hours', 'n_stay_days']

base_ignore_features = [
    'mv_flag', 'ast_std', 'fio2_min', 'rdw_max'
]

# ============================================================
# 6. FALLBACK FORMATTER
# ============================================================
def format_with_range(feature, value):
    clean_feature = feature.replace('_',' ').title()
    for key in normal_ranges:
        if key in feature:
            low, high = normal_ranges[key]
            prefix = "Elevated" if value > high else "Decreased" if value < low else "Normal"
            return f"{prefix} {clean_feature}: {round(value,2)} (normal: {low}-{high})"
    return f"{clean_feature}: {round(value,2)}"

# ============================================================
# 7. CORE EXPLANATION ENGINE
# ============================================================
def generate_explanation(model, explainer, df, features, idx=0):
    x = df[features].iloc[[idx]]
    pred = model.predict_proba(x)[0][1]
    
    shap_values = explainer.shap_values(x)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    elif hasattr(shap_values, "values"): 
        shap_values = shap_values.values
        if len(shap_values.shape) == 3: 
             shap_values = shap_values[:, :, 1]
    elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
        shap_values = shap_values[:, :, 1]
    
    shap_vals = shap_values[0]
    
    # Ensure it's 1-dimensional (Fallback failsafe)
    if len(shap_vals.shape) > 1:
        shap_vals = shap_vals[:, 1] if shap_vals.shape[1] > 1 else shap_vals.flatten()
    
    explanation = pd.DataFrame({
        'feature': features,
        'value': x.values[0],
        'shap': shap_vals
    })
    
    explanation = explanation[~explanation['feature'].isin(exclude_from_explanation)]
    explanation = explanation.sort_values(by='shap', ascending=False)
    
    return explanation, pred

# Gemini AI explanation is disabled.
# import google.generativeai as genai


# ============================================================
# 8. CLINICAL NARRATIVE ENGINE
# ============================================================
def generate_clinical_narrative(explanation_df, pred, features_list, risk_level):
    ignore_features = base_ignore_features + [f for f in features_list if 'delta' in f]
    
    narrative = "\n🧠 Clinical Explanation:\n\n"
    narrative += f"Overall Risk Level: {risk_level}\n\n"
    
    # Determine dynamic threshold to account for different shap value scales (log-odds vs probability)
    max_shap = explanation_df['shap'].abs().max() if not explanation_df.empty else 0.05
    threshold = max(0.01, max_shap * 0.1)

    # 🔴 Increasing risk
    narrative += "🔴 **Primary Factors Increasing Risk:**\n"
    
    count_pos = 0
    for _, row in explanation_df.iterrows():
        if row['shap'] <= 0:
            continue
        if abs(row['shap']) < threshold:
            continue
        
        feature = row['feature']
        value = row['value']
        
        if feature in ignore_features:
            continue
        
        description = ""
        for key, func in clinical_rules:
            if key in feature:
                description = func(value)
                break
        
        if description:
            narrative += f"- {description}\n"
        else:
            narrative += f"- {format_with_range(feature, value)}\n"
        
        count_pos += 1
        if count_pos >= 4:
            break
            
    if count_pos == 0:
        narrative += "- No major risk-increasing factors identified\n"
    
    # 🟢 Reduced risk
    narrative += "\n🟢 **Primary Factors Reducing Risk (Protective):**\n"
    
    count_neg = 0
    used = set()
    
    for _, row in explanation_df[::-1].iterrows():
        if row['shap'] >= 0:
            continue
        if abs(row['shap']) < threshold:
            continue
        
        feature = row['feature']
        value = row['value']
        
        if feature in ignore_features:
            continue
        
        description = ""
        for key, func in clinical_rules:
            if key in feature:
                description = func(value)
                break
        
        if description:
            if description not in used:
                narrative += f"- {description}\n"
                used.add(description)
                count_neg += 1
        else:
            fallback = "stable clinical condition"
            if fallback not in used:
                narrative += f"- {fallback}\n"
                used.add(fallback)
                count_neg += 1
        
        if count_neg >= 3:
            break
            
    if count_neg == 0:
        narrative += "- overall stable clinical parameters\n"
    
    return narrative

# ============================================================
# 9. FINAL PIPELINE FUNCTION
# ============================================================
def get_explanation(model, explainer, df, features_list, risk_level, idx=0, gemini_key=None):
    explanation_df, pred = generate_explanation(model, explainer, df, features_list, idx)
    
    # Generate the standard rule-based SHAP narrative only
    narrative = generate_clinical_narrative(explanation_df, pred, features_list, risk_level)

    # Gemini AI explanation disabled intentionally
    return narrative