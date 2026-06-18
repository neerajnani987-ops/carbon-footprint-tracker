import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#050c09] text-eco-text p-6 md:p-12 font-jakarta relative overflow-hidden flex flex-col items-center"
    >
      {/* Background glow effects */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-eco-green/10 rounded-xl border border-eco-green/20">
              <Leaf className="w-5 h-5 text-eco-green" />
            </div>
            <span className="font-outfit font-black text-xl tracking-wider text-white">EcoTrace Privacy Center</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl font-outfit text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-eco-green shrink-0" />
          <h1 className="text-3xl font-outfit font-black text-white tracking-tight">Privacy Policy & Data Protection</h1>
        </div>

        {/* Policy Contents */}
        <div className="glass-card p-6 md:p-8 border border-white/5 flex flex-col gap-6 text-xs md:text-sm text-eco-muted leading-relaxed text-left">
          <div>
            <h3 className="text-white font-bold text-sm font-outfit mb-2">1. Information We Collect</h3>
            <p>
              EcoTrace collects data strictly to compute your estimated carbon footprint and track your daily sustainable savings. This information includes:
            </p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1 pl-2 font-medium">
              <li>Profile data: Full Name and Email Address.</li>
              <li>Footprint details: Transportation mileage, airline flight logs, home utility bills, diet preferences, and recycling rates.</li>
              <li>Daily Logs: Logged activities (such as using public transit or eating plant-based meals) and timestamps.</li>
            </ul>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          <div>
            <h3 className="text-white font-bold text-sm font-outfit mb-2">2. Data Storage & Ownership</h3>
            <p>
              Your privacy is our highest priority. All metrics, carbon calculator states, and logs are handled as follows:
            </p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1 pl-2 font-medium">
              <li>
                <strong>Local Storage:</strong> By default, data is securely stored within your local browser cache (LocalStorage) so that no credentials or inputs are exposed to third-party databases.
              </li>
              <li>
                <strong>Cloud Sync:</strong> If you register and authenticate using Firebase, your data is synchronized securely with a private Firestore Database. Access is restricted using strict authorization rules (only authenticated users can read or write their own documents).
              </li>
            </ul>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          <div>
            <h3 className="text-white font-bold text-sm font-outfit mb-2">3. How We Use Data</h3>
            <p>
              We use collected information solely to:
            </p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1 pl-2 font-medium">
              <li>Compute carbon score metrics and visual dashboards.</li>
              <li>Provide personalized sustainability insights and AI recommendations.</li>
              <li>Manage gamified quests, badge rewards, and day streaks.</li>
            </ul>
            <p className="mt-3">
              We never sell, rent, or trade user data. All processing occurs locally or within your dedicated Firebase environment.
            </p>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          <div>
            <h3 className="text-white font-bold text-sm font-outfit mb-2">4. Your Rights & Control</h3>
            <p>
              You maintain full ownership of your data. You can delete your browser storage at any time to remove all logs. Registered users can contact administrator portals or clear their dashboard databases to permanently remove cloud records.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-eco-muted/50 mt-10">
          Last updated: June 18, 2026. EcoTrace Inc. Supporting clean futures and data ownership.
        </p>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
