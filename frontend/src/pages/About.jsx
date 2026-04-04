import { motion } from "framer-motion";
import { ShieldAlert, BookOpen } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">About the System</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-10">
          <p className="text-blue-900 font-medium">
            This predictive tool uses machine learning to estimate contextual ICU mortality probability 
            from multiple structured clinical variables (up to 171 features).
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 mb-4">
              <BookOpen className="text-teal-600" /> How It Works
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600">
              <p>
                The model processes features spanning vital signs, laboratory tests, demographic data, and treatments to generate a nuanced probability curve. Behind the scenes, we extract a holistic patient context and pass it to an underlying FastAPI-served model which calculates day-1 or day-2 mortality metrics.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 mb-4">
              <ShieldAlert className="text-red-500" /> Clinical Disclaimer
            </h2>
            <div className="bg-red-50 p-6 border border-red-100 rounded-xl text-red-900 text-sm leading-relaxed">
              <p className="font-semibold mb-2">Not for Direct Diagnostic Use</p>
              <p>
                This platform is engineered for demonstration and retrospective research, representing experimental artificial intelligence applications in critical care. It should never substitute professional medical judgment by qualified physicians. All predictive outputs are supplemental data points intended for clinician interpretation only.
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
