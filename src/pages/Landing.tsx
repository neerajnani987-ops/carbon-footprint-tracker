import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  ArrowRight,
  ShieldAlert,
  Globe,
  TrendingDown,
  ChevronDown,
  Lightbulb,
  Award,
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: '424 ppm', label: 'Atmospheric CO₂ Concentration', desc: 'Highest level in human history' },
    { value: '1.2°C', label: 'Average Global Temp Rise', desc: 'Approaching critical 1.5°C threshold' },
    { value: '80%', label: 'Daily Choice Influence', desc: 'Emissions directly controlled by individual habits' },
  ];

  const features = [
    { icon: Globe, title: 'Smart Carbon Calculator', desc: 'Accurately project your annual footprint using simple commute, home utility, diet, and consumption metrics.' },
    { icon: TrendingDown, title: 'Daily Savings Logger', desc: 'Log actions like public transit, plant-based diets, and turning down thermostats to watch your real-time savings grow.' },
    { icon: Award, title: 'Eco Quests & Achievements', desc: 'Form green habits by accepting challenges and unlocking badges. Watch your dashboard forest grow as you offset emissions.' },
    { icon: Lightbulb, title: 'AI Assistant Recommendations', desc: 'Chat with our sustainability chatbot for custom tips tailored to your highest emission categories.' },
  ];

  const faqs = [
    { q: 'How does the calculator project my annual carbon footprint?', a: 'The calculator asks for weekly transportation miles, flight habits, utility bills, diet preferences, and waste volumes, and applies regional carbon coefficient benchmarks to project your yearly impact in metric tons.' },
    { q: 'Can small daily habits really make an impact?', a: 'Absolutely! If every citizen makes small adjustments like air-drying laundry, using public transit, or eating plant-based meals once a week, we can prevent gigatons of CO₂ from entering the atmosphere annually.' },
    { q: 'Is my data secure?', a: 'Yes. EcoTrace stores your metrics locally in your browser cache. No private credentials or metrics are sent to unauthorized external tracking databases.' },
  ];

  return (
    <div className="min-h-screen bg-[#050c09] text-eco-text overflow-x-hidden relative font-jakarta">
      {/* Background glow effects */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-eco-green/10 rounded-xl">
            <Leaf className="w-6 h-6 text-eco-green" />
          </div>
          <span className="font-outfit font-extrabold text-xl tracking-wider text-white">EcoTrace</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl transition-all font-outfit text-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-5 py-2 bg-eco-green hover:bg-eco-emerald text-white rounded-xl transition-all font-outfit text-sm font-semibold shadow-md shadow-eco-green/10"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-eco-green/10 border border-eco-green/20 rounded-full text-eco-green text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Climate Action Assistant</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-outfit font-black tracking-tight text-white leading-[1.15] mb-6">
            Calculate, Track, and <span className="text-eco-green">Halve Your Carbon Footprint</span>
          </h1>
          <p className="text-eco-muted text-base md:text-lg mb-8 leading-relaxed">
            Become an active participant in environmental conservation. EcoTrace helps you understand your emissions, log daily eco-savings, and offset impact through AI-powered sustainability coaching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-eco-green hover:bg-eco-emerald text-white rounded-xl font-outfit font-bold shadow-lg shadow-eco-green/15 transition-all group"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-7 py-3.5 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl font-outfit font-semibold transition-all text-white"
            >
              Access Dashboard
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center relative"
        >
          {/* Animated visual of Eco-Earth sphere */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full bg-eco-forest/20 border border-white/10 flex items-center justify-center animate-float shadow-2xl shadow-eco-green/5 overflow-hidden">
            <div className="absolute inset-4 rounded-full border border-eco-green/20 border-dashed animate-[spin_40s_linear_infinite]"></div>
            <div className="absolute inset-10 rounded-full border border-eco-blue/20 border-dashed animate-[spin_20s_linear_infinite_reverse]"></div>
            
            <div className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-gradient-to-tr from-eco-forest via-eco-green to-eco-blue opacity-85 flex items-center justify-center relative">
              <Globe className="w-24 h-24 md:w-32 md:h-32 text-white/90 stroke-[1.2]" />
            </div>
            
            {/* Ambient nodes */}
            <div className="absolute top-1/4 left-1/4 w-3.5 h-3.5 bg-eco-green rounded-full shadow-lg shadow-eco-green animate-ping"></div>
            <div className="absolute bottom-1/4 right-1/4 w-3.5 h-3.5 bg-eco-blue rounded-full shadow-lg shadow-eco-blue animate-pulse"></div>
          </div>
        </motion.div>
      </header>

      {/* Climate Stats Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 border border-white/5">
              <div className="text-3xl md:text-4xl font-outfit font-extrabold text-white leading-none mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-eco-green uppercase tracking-wide mb-1">{stat.label}</div>
              <div className="text-xs text-eco-muted leading-relaxed">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Overview */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-outfit font-extrabold text-white leading-tight mb-4">
            Everything You Need to Live Sustainably
          </h2>
          <p className="text-eco-muted text-sm md:text-base leading-relaxed">
            Gain awareness, reduce emissions, and unlock real rewards through game-like feedback metrics.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-8 border border-white/5 flex gap-5 items-start">
              <div className="p-3 bg-eco-green/10 rounded-xl shrink-0 border border-eco-green/20">
                <feature.icon className="w-6 h-6 text-eco-green" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-eco-muted text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accordion FAQ Area */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 relative z-10 border-t border-white/5">
        <h2 className="text-3xl font-outfit font-extrabold text-white text-center leading-tight mb-12">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div key={i} className="glass-card border border-white/5 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-outfit font-bold text-white leading-snug">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-eco-muted transition-transform shrink-0 ${isOpen ? 'rotate-185' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-eco-muted leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="bg-black/40 border-t border-white/5 py-10 text-center relative z-10 text-xs text-eco-muted">
        <p className="mb-2">"The greatest threat to our planet is the belief that someone else will save it." — Robert Swan</p>
        <p>© {new Date().getFullYear()} EcoTrace Inc. Built with love for sustainability and active preservation.</p>
      </footer>
    </div>
  );
};

export default Landing;
