import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, ShieldCheck, HeartPulse } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Home() {
  const features = [
    {
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      title: "Real-time Analytics",
      description: "Process up to 171 clinical parameters dynamically to assess dynamic mortality risk.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-500" />,
      title: "Clinical Trust",
      description: "Powered by interpretable machine learning models trained on ICU cohorts.",
    },
    {
      icon: <HeartPulse className="w-6 h-6 text-red-500" />,
      title: "Actionable Insights",
      description: "Clear visualization of high-risk factors for proactive critical care.",
    },
  ];

  return (
    <div className="flex flex-col items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-32 mt-16 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 left-0 -ml-32 mt-32 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-3xl mt-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600" />
          Production Ready UI
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Dynamic Risks, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
            Smarter Care.
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Empowering clinicians with advanced AI to predict ICU mortality using expansive patient parameters. Built for reliability, designed for humans.
        </p>

        <div className="mt-10 flex gap-4 justify-center">
          <Link to="/predict">
            <Button size="lg" className="rounded-full gap-2 text-md px-8 py-6">
              Start Prediction <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="outline" className="rounded-full text-md px-8 py-6">
              How it works
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-32 grid md:grid-cols-3 gap-8 w-full z-10"
      >
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
