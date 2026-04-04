export const FEATURES = [
  "bilirubin_min", "temp_mean_delta2", "lactate_max", "mv_hours_day", "hr_min", "fio2_std", "pt_std", "temp_min", "bun_mean_delta1", "temp_mean_delta1", "wbc_mean_delta2", "alt_mean", "dbp_mean_delta2", "sodium_std", "spo2_mean_missing", "sbp_max", "albumin_std", "creatinine_min", "bilirubin_max", "dbp_mean_missing", "dbp_std", "temp_std", "ptt_max", "platelets_mean_delta2", "creatinine_max", "rdw_mean", "glucose_min", "rr_mean_delta2", "creatinine_std", "platelets_mean_delta1", "potassium_mean_delta2", "bicarbonate_mean_delta1", "temp_max", "albumin_mean_missing", "hr_mean_delta2", "sbp_std", "platelets_max", "hr_max", "norepinephrine_flag_delta2", "ast_max", "potassium_max", "rr_mean_delta1", "glucose_max", "potassium_mean_missing", "hr_mean_missing", "spo2_std", "spo2_mean", "bun_min", "bun_std", "ph_mean", "pt_min", "sodium_mean_missing", "lactate_std", "map_mean_missing", "sbp_mean_delta1", "ph_mean_missing", "bicarbonate_max", "wbc_mean_delta1", "sbp_mean_missing", "temp_mean", "albumin_min", "lactate_min", "ptt_mean", "sodium_min", "ph_mean_delta2", "mv_flag_delta2", "albumin_mean", "fio2_mean", "lactate_mean_delta2", "ph_std", "dbp_mean_delta1", "potassium_mean", "platelets_mean", "rr_max", "wbc_std", "bicarbonate_mean_delta2", "dbp_min", "wbc_max", "bicarbonate_min", "bilirubin_std", "ptt_std", "mv_flag_delta1", "gender_female", "rr_mean", "rdw_max", "map_mean_delta1", "creatinine_mean_delta2", "rrt_flag", "vasopressor_flag_delta1", "spo2_max", "albumin_mean_delta2", "temp_mean_missing", "pt_mean", "ast_mean", "sodium_mean_delta2", "rdw_std", "hr_mean", "dbp_max", "lactate_mean_delta1", "creatinine_mean", "bun_mean_delta2", "sodium_mean", "bicarbonate_std", "bun_max", "glucose_mean_delta2", "map_mean", "rr_min", "vasopressor_flag_delta2", "ptt_min", "sbp_min", "lactate_mean", "rr_std", "glucose_mean_missing", "bun_mean_missing", "map_mean_delta2", "spo2_mean_delta2", "sbp_mean", "wbc_mean_missing", "spo2_mean_delta1", "alt_max", "ph_min", "potassium_mean_delta1", "bicarbonate_mean_missing", "n_stay_days", "rdw_min", "norepinephrine_flag_delta1", "bicarbonate_mean", "glucose_mean_delta1", "spo2_min", "potassium_min", "platelets_std", "mv_flag", "glucose_std", "bilirubin_mean", "sodium_max", "glucose_mean", "bun_mean", "wbc_min", "sbp_mean_delta2", "albumin_max", "lactate_mean_missing", "fio2_max", "albumin_mean_delta1", "hr_std", "creatinine_mean_delta1", "potassium_std", "norepinephrine_flag", "vasopressor_flag", "icu_los_hours", "dbp_mean", "platelets_min", "ast_std", "ph_max", "hr_mean_delta1", "wbc_mean", "fio2_min", "ast_min", "alt_min", "creatinine_mean_missing", "ph_mean_delta1", "age", "sodium_mean_delta1", "pt_max", "rr_mean_missing", "alt_std", "high_risk_day", "consecutive_highrisk_days", "lactate_mean_trajectory", "creatinine_mean_trajectory", "map_mean_trajectory", "sbp_mean_trajectory"
];

export const NORMAL_CLINICAL_VALUES = {
  hr: 75.0, spo2: 98.0, bun: 15.0, creatinine: 0.9,
  lactate: 1.0, wbc: 7.5, rr: 16.0, sodium: 140.0,
  potassium: 4.0, glucose: 100.0, temp: 37.0, ast: 25.0,
  alt: 25.0, ph: 7.4, pco2: 40.0, po2: 95.0,
  sbp: 120.0, dbp: 80.0, mbp: 93.0, calcium: 9.5,
  magnesium: 2.0, chloride: 100.0, bicarbonate: 24.0,
  albumin: 4.0, ptt: 30.0, inr: 1.0, pt: 12.0,
  bilirubin: 0.8, platelets: 250.0, hematocrit: 42.0,
  hemoglobin: 14.0
};

// Exact parameters extrapolated from user's provided diagnostic image
export const HIGH_RISK_CLINICAL_VALUES = {
  age: 74, gender_female: 1, icu_los_hours: 19, n_stay_days: 2,
  high_risk_day: 1, consecutive_high_risk_days: 1, vasopressor_flag: 1,
  vasopressor_flag_delta1: 0, vasopressor_flag_delta2: 0, norepinephrine_flag: 0,
  norepinephrine_flag_delta1: 0, norepinephrine_flag_delta2: 0, mv_flag: 1,
  mv_flag_delta1: 0, mv_flag_delta2: 0, mv_hours_day: 24, rrt_flag: 0,
  hr_min: 110, hr_max: 140, hr_mean: 126, hr_std: 12.0, hr_mean_delta1: 10, hr_mean_delta2: 15, hr_mean_missing: 0,
  sbp_min: 80, sbp_max: 106, sbp_mean: 92, sbp_std: 8.4, sbp_mean_delta1: -10, sbp_mean_delta2: -15, sbp_mean_trajectory: -1.2, sbp_mean_missing: 0,
  dbp_min: 40, dbp_max: 70, dbp_mean: 52, dbp_std: 8.2, dbp_mean_delta1: -8, dbp_mean_delta2: -6, dbp_mean_missing: 0,
  mbp_min: 58, mbp_max: 86, mbp_mean: 70, mbp_std: 7.5, mbp_mean_delta1: -12, mbp_mean_delta2: -10, mbp_mean_trajectory: -0.8, mbp_mean_missing: 0,
  rr_min: 24, rr_max: 42, rr_mean: 32, rr_std: 5.4, rr_mean_delta1: 4, rr_mean_delta2: 6, rr_mean_missing: 0,
  temp_min: 38.2, temp_max: 40.1, temp_mean: 39.2, temp_std: 0.8, temp_mean_delta1: 1.2, temp_mean_delta2: 0.8, temp_mean_missing: 0,
  spo2_min: 84, spo2_max: 94, spo2_mean: 88, spo2_std: 2.1, spo2_mean_delta1: -4, spo2_mean_delta2: -6, spo2_mean_missing: 0,
  fio2_min: 0.4, fio2_max: 0.8, fio2_mean: 0.6, fio2_std: 0.15,
  glucose_min: 140, glucose_max: 250, glucose_mean: 190, glucose_std: 30, glucose_mean_delta1: 20, glucose_mean_delta2: 25, glucose_mean_missing: 0,
  bicarbonate_min: 14, bicarbonate_max: 20, bicarbonate_mean: 17.0, bicarbonate_std: 2.1, bicarbonate_mean_delta1: -4, bicarbonate_mean_delta2: -6, bicarbonate_mean_missing: 0,
  creatinine_min: 2.8, creatinine_max: 4.2, creatinine_mean: 3.5, creatinine_std: 0.5, creatinine_mean_delta1: 1.1, creatinine_mean_delta2: 1.5, creatinine_mean_trajectory: 0.4, creatinine_mean_missing: 0,
  potassium_min: 3.8, potassium_max: 5.9, potassium_mean: 4.9, potassium_std: 1.4, potassium_mean_delta1: 0.5, potassium_mean_delta2: 0.8, potassium_mean_missing: 0,
  sodium_min: 130, sodium_max: 148, sodium_mean: 137.0, sodium_std: 5.4, sodium_mean_delta1: -2, sodium_mean_delta2: -4, sodium_mean_missing: 0,
  bun_min: 70, bun_max: 94, bun_mean: 82.0, bun_std: 10.2, bun_mean_delta1: 15, bun_mean_delta2: 12, bun_mean_missing: 0,
  wbc_min: 14, wbc_max: 28, wbc_mean: 21.0, wbc_std: 5.1, wbc_mean_delta1: 4, wbc_mean_delta2: 6, wbc_mean_missing: 0,
  platelets_min: 90, platelets_max: 140, platelets_mean: 115.0, platelets_std: 22, platelets_mean_delta1: -20, platelets_mean_delta2: -35,
  lactate_min: 2.1, lactate_max: 6.8, lactate_mean: 4.45, lactate_std: 1.4, lactate_mean_delta1: 2.0, lactate_mean_delta2: 1.2, lactate_mean_trajectory: 0.5, lactate_mean_missing: 0,
  ph_min: 7.15, ph_max: 7.32, ph_mean: 7.23, ph_std: 0.08, ph_mean_delta1: 0.12, ph_mean_delta2: -0.05, ph_mean_missing: 0,
  inr_min: 1.4, inr_max: 2.8, inr_mean: 2.1, inr_std: 0.5,
  pt_min: 14, pt_max: 28, pt_mean: 21, pt_std: 3.2,
  ptt_min: 35, ptt_max: 70, ptt_mean: 52, ptt_std: 14.5,
  bilirubin_min: 1.2, bilirubin_max: 4.5, bilirubin_mean: 2.85, bilirubin_std: 1.1,
  ast_min: 45, ast_max: 180, ast_mean: 112.5, ast_std: 34,
  alt_min: 35, alt_max: 150, alt_mean: 92.5, alt_std: 28,
  albumin_min: 2.1, albumin_max: 2.8, albumin_mean: 2.45, albumin_std: 0.35, albumin_mean_delta1: -0.2, albumin_mean_missing: 0
};

// Set to HIGH_RISK_CLINICAL_VALUES to verify the high mortality prediction logic
const ACTIVE_DEFAULTS = HIGH_RISK_CLINICAL_VALUES;

export const get_default_val = (feature) => {
  const feat_lower = feature.toLowerCase();
  
  // 1. If it's an exact match in the dictionary, return it absolutely (preserves std, var, deltas etc)
  if (ACTIVE_DEFAULTS[feat_lower] !== undefined) {
    return ACTIVE_DEFAULTS[feat_lower];
  }
  
  // 2. Otherwise default the flags/variants to 0
  if (['delta', 'flag', 'std', 'var', 'trajectory'].some(x => feat_lower.includes(x))) {
    return 0.0;
  }
  
  // 3. Match generics like 'hr' against 'hr_mean' or 'hr'
  for (const [key, val] of Object.entries(ACTIVE_DEFAULTS)) {
    if (feat_lower.includes(key)) {
      return val;
    }
  }
  
  return 0.0;
};

export const initialize_patient_inputs = () => {
  const inputs = {};
  FEATURES.forEach(f => {
    inputs[f] = get_default_val(f);
  });
  return inputs;
};
