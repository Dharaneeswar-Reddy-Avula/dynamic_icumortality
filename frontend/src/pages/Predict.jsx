import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, HeartPulse, RefreshCw, AlertCircle, Upload, KeyRound, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as XLSX from 'xlsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { predictRisk } from '../services/api';
import { FEATURES, initialize_patient_inputs } from '../utils/constants';

export default function Predict() {
  const [stayDay, setStayDay] = useState(1);
  const [inputsData, setInputsData] = useState({
    1: initialize_patient_inputs(),
    2: initialize_patient_inputs()
  });

  const inputs = inputsData[stayDay];
  const [modelType, setModelType] = useState('lightgbm');
  const [geminiKey, setGeminiKey] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  // Group most common clinical features logically
  const topFeatures = [
    { label: "Heart Rate (HR)", key: "hr" },
    { label: "SpO2 (%)", key: "spo2" },
    { label: "BUN", key: "bun" },
    { label: "Creatinine", key: "creatinine" },
    { label: "Lactate", key: "lactate" },
    { label: "WBC", key: "wbc" },
    { label: "Respiratory Rate (RR)", key: "rr" },
    { label: "Systolic BP", key: "sbp" }
  ];

  const handleInputChange = (key, val) => {
    setInputsData(prev => ({
      ...prev,
      [stayDay]: { ...prev[stayDay], [key]: Number(val) }
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Use header: 1 to get a 2D array of rows and columns
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data && data.length > 0) {

          setInputsData(prev => {
            const nextInputsData = { ...prev };
            const nextInputs = { ...nextInputsData[stayDay] };
            let importedCount = 0;

            // Helper function to map a key/value pair into inputs
            const mapFeature = (rawHeader, val) => {
              if (rawHeader == null || val == null || val === '') return;
              const cleanHeader = String(rawHeader).toLowerCase().trim();

              // Try exact match
              const exactMatch = FEATURES.find(f => f.toLowerCase() === cleanHeader);
              if (exactMatch) {
                nextInputs[exactMatch] = Number(val);
                importedCount++;
              } else {
                // Fuzzy match
                const partialMatches = FEATURES.filter(f => f.toLowerCase().includes(cleanHeader));
                let mappedAny = false;
                partialMatches.forEach(featureName => {
                  if (!['delta', 'flag', 'std', 'var', 'trajectory'].some(x => featureName.includes(x))) {
                    nextInputs[featureName] = Number(val);
                    mappedAny = true;
                  }
                });
                if (mappedAny) importedCount++;
              }
            };

            // Vertical processing only (Key-Value format)
            // Column A: Feature name
            // Column B (or C): Value
            data.forEach(rowArr => {
              if (rowArr && rowArr.length >= 2) {
                const key = rowArr[0];
                let val = rowArr[1];
                // If standard vertical has values in column C (idx 2) instead of B (idx 1), check it
                if (rowArr.length > 2 && (val === undefined || val === null || val === '')) val = rowArr[2];

                if (typeof key === 'string') {
                  if (key.toLowerCase().includes('parameter') || key.toLowerCase().includes('feature')) return;
                  mapFeature(key, val);
                }
              }
            });

            alert(`Successfully processed. Imported data mapped to ${importedCount} clinical parameters from Excel.`);
            nextInputsData[stayDay] = nextInputs;
            return nextInputsData;
          });
        }
      } catch (err) {
        alert("Failed to parse Excel file. Ensure it is a valid .xlsx or .csv.");
      }
      e.target.value = null; // reset input
    };
    reader.readAsBinaryString(file);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      stay_day: stayDay,
      model_type: modelType,
      gemini_key: geminiKey || null,
      ...inputs
    };

    try {
      const resp = await predictRisk(payload);
      setResult(resp);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputsData({
      1: initialize_patient_inputs(),
      2: initialize_patient_inputs()
    });
    setStayDay(1);
    setModelType('lightgbm');
    setSearchTerm('');
    setResult(null);
    setError(null);
    setGeminiKey('');
  };

  // Filter 171 features minus those we pin to the top
  const advancedFeatures = useMemo(() => {
    return FEATURES.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const getRiskColor = (level) => {
    if (level === 'HIGH') return 'destructive';
    if (level === 'MODERATE') return 'warning';
    return 'success';
  };

  const riskBadgeVariant = result ? getRiskColor(result.risk_level) : 'default';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Page Header */}
      <div className="mb-8 pl-1">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <HeartPulse className="text-red-500 w-8 h-8" />
          Risk Assessment Console
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Enter clinical parameters to simulate the day-1 or day-2 probability of ICU mortality based on AI modeling. Adjust advanced parameters as needed to see dynamic shifts.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Column: Input Form */}
        <div className="w-full lg:w-7/12 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b pb-4">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle className="text-lg">Clinical Inputs</CardTitle>
                  <CardDescription>Select Model, Stay Day, and provide vitals.</CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" /> Import Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">

              {/* Settings Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-1.5 flex flex-col justify-center">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><Database className="w-3 h-3" /> Predictive Model</label>
                  <select
                    value={modelType}
                    onChange={e => setModelType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lightgbm">LightGBM (Default)</option>
                    <option value="xgboost">XGBoost</option>
                    <option value="randomforest">Random Forest</option>
                    <option value="elasticnet">Elastic Net</option>
                  </select>
                </div>
                <div className="space-y-1.5 flex flex-col justify-center">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><Activity className="w-3 h-3" /> Prediction Horizon</label>
                  <div className="bg-white rounded-md border p-1 flex gap-1 h-10">
                    <button
                      onClick={() => { setStayDay(1); setResult(null); }}
                      className={`flex-1 px-3 text-sm rounded ${stayDay === 1 ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'} transition-colors`}
                    >
                      Day 1
                    </button>
                    <button
                      onClick={() => { setStayDay(2); setResult(null); }}
                      className={`flex-1 px-3 text-sm rounded ${stayDay === 2 ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'} transition-colors`}
                    >
                      Day 2
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 flex flex-col justify-center">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><KeyRound className="w-3 h-3" /> Gemini API Key</label>
                  <Input
                    type="password"
                    placeholder="Optional details..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {topFeatures.map(f => {
                  const exactKey = FEATURES.find(x => x === f.key) || FEATURES.find(x => x.includes(f.key));
                  if (!exactKey) return null;

                  return (
                    <div key={exactKey} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">{f.label}</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={inputs[exactKey] ?? ''}
                        onChange={(e) => handleInputChange(exactKey, e.target.value)}
                        className="bg-slate-50 focus:bg-white transition-colors border-slate-200"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Advanced Parameters */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    All Advanced Parameters ({FEATURES.length})
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search parameters..."
                      className="pl-9 h-8 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {advancedFeatures.map(feature => (
                      <div key={feature} className="flex gap-2 items-center bg-slate-50 p-2 border rounded-md hover:border-blue-200 transition-colors">
                        <label className="text-xs text-slate-600 w-full truncate font-medium" title={feature}>{feature}</label>
                        <Input
                          type="number"
                          step="0.01"
                          className="w-20 h-7 text-xs px-2 p-0 text-right font-medium"
                          value={inputs[feature] ?? 0}
                          onChange={(e) => handleInputChange(feature, e.target.value)}
                        />
                      </div>
                    ))}
                    {advancedFeatures.length === 0 && (
                      <p className="text-slate-400 text-sm italic col-span-3 py-4 text-center">No matching parameters found.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              className="flex-1 py-6 text-lg rounded-xl shadow-md border-blue-700/50"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <> <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Processing Risk Analytics... </>
              ) : (
                'Generate Risk Prediction'
              )}
            </Button>
            <Button
              variant="outline"
              className="py-6 px-6 rounded-xl"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Prediction Failed</h4>
                <p className="text-sm opacity-90">{typeof error === 'string' ? error : error.message}</p>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Dynamic Results Dashboard */}
        <div className="w-full lg:w-5/12">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <div className="border border-dashed border-slate-300 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-50/50 text-center">
                  <div className="w-16 h-16 bg-blue-100/50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                    <Activity className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Awaiting Parameters</h3>
                  <p className="text-slate-500 text-sm max-w-[250px]">
                    Fill out the clinical form and click Generate Prediction to reveal analytical insights.
                  </p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center min-h-[400px]"
              >
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium animate-pulse">Running complex ICU models...</p>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full space-y-6"
              >
                <Card className="overflow-hidden border-none shadow-md ring-1 ring-slate-200">
                  <div className={`h-2 w-full ${result.risk_level === 'HIGH' ? 'bg-red-500' :
                      result.risk_level === 'MODERATE' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardDescription className="uppercase tracking-wider font-semibold text-slate-500 mb-1">
                          Assessment Outcome
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold flex items-center gap-3">
                          {(result.risk_score * 100).toFixed(1)}%
                          <Badge variant={riskBadgeVariant} className="text-sm px-3 py-1 ml-1 rounded-md shadow-sm">
                            {result.risk_level} RISK
                          </Badge>
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex justify-between text-sm font-medium text-slate-600 mt-4">
                      <span>Survival Probability</span>
                      <span>Mortality Probability</span>
                    </div>
                    <Progress
                      value={result.risk_score * 100}
                      className="h-3 shadow-inner"
                      indicatorColor={
                        result.risk_level === 'HIGH' ? 'bg-red-500' :
                          result.risk_level === 'MODERATE' ? 'bg-yellow-500' : 'bg-green-500'
                      }
                    />
                  </CardContent>
                </Card>

                {result.explanation && (
                  <Card className="shadow-sm border-slate-200 bg-white">
                    <CardHeader className="bg-slate-50 border-b pb-4 rounded-t-xl">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                        <Activity className="w-4 h-4 text-blue-500" /> AI Clinical Interpretation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 pb-6 text-sm text-slate-700 leading-relaxed font-medium">
                      <div className="prose prose-sm prose-slate max-w-none prose-p:my-2 prose-headings:mb-3 prose-strong:text-slate-900 border-l-[3px] border-blue-200 pl-4">
                        <ReactMarkdown>{result.explanation}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {result.shap_plot && (
                  <Card className="shadow-sm border-slate-200 bg-white">
                    <CardHeader className="bg-slate-50 border-b pb-4 rounded-t-xl">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                        <Activity className="w-4 h-4 text-teal-500" /> Feature Contribution (SHAP)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 pb-6 flex justify-center bg-white rounded-b-xl overflow-hidden">
                      <img
                        src={`data:image/png;base64,${result.shap_plot}`}
                        alt="SHAP Feature Contribution Plot"
                        className="max-w-full rounded-md object-contain border border-slate-100"
                        style={{ background: 'white' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </CardContent>
                  </Card>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
