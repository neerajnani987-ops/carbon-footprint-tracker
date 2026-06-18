import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050c09] text-eco-text flex flex-col items-center justify-center p-6 relative overflow-hidden font-jakarta">
      {/* Background glow effects */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="text-center relative z-10 max-w-md flex flex-col items-center">
        {/* Animated Sprout Icon */}
        <motion.div
          initial={{ scale: 0.8, rotate: -15 }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full bg-eco-green/10 border border-eco-green/20 flex items-center justify-center text-eco-green mb-8 shadow-lg shadow-eco-green/5"
        >
          <Leaf className="w-12 h-12 stroke-[1.5]" />
        </motion.div>

        {/* Warning Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-4">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Error 404</span>
        </div>

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-outfit font-black text-white leading-tight mb-4">
          Lost in the Forest?
        </h1>
        
        {/* Description */}
        <p className="text-eco-muted text-xs md:text-sm leading-relaxed mb-8">
          The path you are looking for does not exist or has been cleared. Let's redirect you back to known preservation coordinates.
        </p>

        {/* Redirect Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-eco-green hover:bg-eco-emerald text-white rounded-xl font-outfit font-bold shadow-lg shadow-eco-green/15 transition-all group cursor-pointer text-xs"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Floating Forest Leaves in Background */}
      <div className="absolute top-1/4 left-1/10 w-2.5 h-2.5 bg-eco-green/20 rounded-full blur-xs animate-ping"></div>
      <div className="absolute bottom-1/4 right-1/10 w-3.5 h-3.5 bg-eco-blue/20 rounded-full blur-xs animate-pulse"></div>
    </div>
  );
};

export default NotFound;
