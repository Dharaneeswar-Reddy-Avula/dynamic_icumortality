import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BarChart2, Image as ImageIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';

export default function Performance() {
  const [activeModel, setActiveModel] = useState("lightgbm");
  const [activeDay, setActiveDay] = useState(1);

  const models = [
    { id: "lightgbm", name: "LightGBM" },
    { id: "xgboost", name: "XGBoost" },
    { id: "randomforest", name: "Random Forest" },
    { id: "elasticnet", name: "Elastic Net" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <BarChart2 className="text-blue-600 w-8 h-8"/> 
            Analytics Hub
          </h1>
          <p className="text-slate-500 max-w-2xl">
            Retrospective evaluation of all trained models. Browse through the available models and prediction horizons to review their respective ROC, Precision-Recall curves, and accuracy screenshots.
          </p>
        </div>

        {/* Outer Tabs (Model Selection) */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setActiveModel(model.id)}
              className={`pb-4 px-6 text-sm font-medium transition-colors whitespace-nowrap ${
                activeModel === model.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          {/* Inner Tabs (Day Selection) */}
          <div className="flex bg-white p-1 rounded-lg border w-fit mb-8 shadow-sm">
            <button
              onClick={() => setActiveDay(1)}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                activeDay === 1 ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Day 1 Horizon
            </button>
            <button
              onClick={() => setActiveDay(2)}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                activeDay === 2 ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Day 2 Horizon
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeModel}-${activeDay}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* ROC Curve Placeholder */}
                <Card className="shadow-sm border-slate-200 overflow-hidden">
                  <CardHeader className="bg-white border-b">
                    <CardTitle className="text-lg">Receiver Operating Characteristic (ROC)</CardTitle>
                    <CardDescription>
                      Upload target: <code>src/assets/performance/{activeModel}_day{activeDay}_roc.png</code>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-slate-100/50 flex flex-col items-center justify-center min-h-[300px]">
                    {/* 
                      TODO: Replace this placeholder div below with an actual img tag once you drop the file in:
                      <img src={`/assets/performance/${activeModel}_day${activeDay}_roc.png`} alt="ROC Curve" className="w-full h-full object-cover" />
                    */}
                    <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-slate-400 font-medium px-8 text-center">
                      Replace code block with your {models.find(m => m.id === activeModel)?.name} (Day {activeDay}) ROC image.
                    </p>
                  </CardContent>
                </Card>

                {/* PR Curve / Accuracy Screenshot Placeholder */}
                <Card className="shadow-sm border-slate-200 overflow-hidden">
                  <CardHeader className="bg-white border-b">
                    <CardTitle className="text-lg">Precision-Recall & Accuracy Metrics</CardTitle>
                    <CardDescription>
                      Upload target: <code>src/assets/performance/{activeModel}_day{activeDay}_metrics.png</code>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-slate-100/50 flex flex-col items-center justify-center min-h-[300px]">
                    {/* 
                      TODO: Replace this placeholder div below with an actual img tag once you drop the file in:
                      <img src={`/assets/performance/${activeModel}_day${activeDay}_metrics.png`} alt="Metrics" className="w-full h-full object-cover" />
                    */}
                    <Activity className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-slate-400 font-medium px-8 text-center">
                      Replace code block with your {models.find(m => m.id === activeModel)?.name} (Day {activeDay}) Accuracy screenshot.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
