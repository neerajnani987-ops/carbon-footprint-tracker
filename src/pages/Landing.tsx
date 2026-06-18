import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  ArrowRight,
  Globe,
  TrendingDown,
  ChevronDown,
  Lightbulb,
  Award,
  Menu,
  X,
  Sprout,
  Zap,
  BarChart3,
  Target,
  ShieldCheck,
  DollarSign,
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Live counter states to simulate active preservation
  const [liveStats, setLiveStats] = useState({
    co2: 12450.4,
    trees: 565,
    energy: 34200,
    plastic: 8900
  });

  // Increment counters periodically to show "live" community impact
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        co2: prev.co2 + 0.15,
        trees: prev.trees + (Math.random() > 0.8 ? 1 : 0),
        energy: prev.energy + Math.floor(Math.random() * 3) + 1,
        plastic: prev.plastic + (Math.random() > 0.5 ? 1 : 0)
      }));
    }, 2500);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: Globe,
      title: 'Carbon Footprint Calculator',
      desc: 'Calculate transport emissions, electricity usage, food impacts, and waste generation using regional coefficients.',
      bullet: 'Transportation, energy, diet, and waste tracking'
    },
    {
      icon: Sparkles,
      title: 'AI Sustainability Assistant',
      desc: 'Receive personalized eco-advice, carbon reductions analysis, and smart suggestions via your sustainability chatbot companion.',
      bullet: 'AI-driven coaching and habit adjustment'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      desc: 'Observe historical carbon emission trends, view monthly analytics breakdown, and compare scores with benchmarks.',
      bullet: 'Clean interactive charts & comparisons'
    },
    {
      icon: Target,
      title: 'Sustainability Goals',
      desc: 'Establish personal reduction targets, track daily milestone checkpoints, and watch your carbon footprint shrink.',
      bullet: 'Streak milestones and reduction targets'
    },
    {
      icon: Award,
      title: 'Eco Challenges',
      desc: 'Participate in community challenges, log actions like meatless days or public transit, and unlock gamified badges.',
      bullet: 'Streaks, active quests, and achievement rewards'
    }
  ];

  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Reduce Environmental Impact',
      desc: 'Gain detailed insights on where your emissions originate and actionable items to minimize them.'
    },
    {
      icon: DollarSign,
      title: 'Save Electricity & Fuel Costs',
      desc: 'Implementing simple habits like turning down thermostats or air-drying clothes saves real money.'
    },
    {
      icon: Flame,
      title: 'Build Sustainable Habits',
      desc: 'Streaks and daily reminders keep you engaged and build permanent climate preservation routines.'
    },
    {
      icon: TrendingDown,
      title: 'Track Personal Improvement',
      desc: 'Watch your progress trend downward over time and visualize your real contribution to the planet.'
    },
    {
      icon: Lightbulb,
      title: 'AI-Driven Recommendations',
      desc: 'Our assistant continually checks your dashboard to generate hyper-personalized eco-adjustments.'
    }
  ];

  const faqs = [
    {
      q: 'How does the calculator project my annual carbon footprint?',
      a: 'The calculator collects information regarding your weekly transportation commutes, airline flight frequency, home energy utility costs, dietary preferences, and recycling habits. It then applies regional emission coefficients to compute your net annual CO₂ equivalent.'
    },
    {
      q: 'Can small daily habits really make a measurable impact?',
      a: 'Absolutely! If every citizen makes minor adjustments like air-drying laundry, using public transit, or skipping meat once a week, we can prevent gigatons of CO₂ from entering the atmosphere annually. It is about collective compounding interest.'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. EcoTrace stores your profile metrics and daily log data locally within your browser cache using local storage. None of your inputs or private credentials are sold or sent to unauthorized external tracking databases.'
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050c09] text-eco-text overflow-x-hidden relative font-jakarta">
      {/* Background glow effects */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#050c09]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="p-2.5 bg-eco-green/10 rounded-xl border border-eco-green/20">
              <Leaf className="w-5 h-5 text-eco-green" />
            </div>
            <span className="font-outfit font-black text-xl tracking-wider text-white">EcoTrace</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {['features', 'benefits', 'impact', 'faqs'].map(sec => (
              <button
                key={sec}
                onClick={() => scrollToSection(sec)}
                className="text-xs uppercase tracking-wider text-eco-muted hover:text-white transition-all font-semibold"
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/signin')}
              className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl transition-all font-outfit text-xs font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 bg-eco-green hover:bg-eco-emerald text-white rounded-xl transition-all font-outfit text-xs font-bold shadow-md shadow-eco-green/10 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-white/5 rounded-xl border border-white/10 text-white"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 md:hidden flex flex-col justify-between p-6"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-eco-green/10 rounded-lg">
                    <Leaf className="w-5 h-5 text-eco-green" />
                  </div>
                  <span className="font-outfit font-bold text-lg text-white">EcoTrace</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-5">
                {['features', 'benefits', 'impact', 'faqs'].map(sec => (
                  <button
                    key={sec}
                    onClick={() => scrollToSection(sec)}
                    className="text-left text-lg font-outfit font-semibold text-eco-muted hover:text-white"
                  >
                    {sec.charAt(0).toUpperCase() + sec.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/signin')}
                className="w-full py-3.5 border border-white/10 hover:bg-white/5 rounded-xl font-outfit font-semibold text-center text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3.5 bg-eco-green hover:bg-eco-emerald text-white rounded-xl font-outfit font-bold text-center text-sm shadow-lg shadow-eco-green/10"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-32 pb-16 md:pt-44 md:pb-24 grid md:grid-cols-12 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7 flex flex-col items-start text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-eco-green/10 border border-eco-green/20 rounded-full text-eco-green text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-eco-green animate-pulse" />
            <span>AI-Powered Climate Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-outfit font-black tracking-tight text-white leading-[1.12] mb-6">
            Measure Your Carbon. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-green via-eco-teal to-eco-blue">
              Transform Your Future.
            </span>
          </h1>
          <p className="text-eco-muted text-base md:text-lg mb-8 leading-relaxed max-w-xl">
            An intelligent AI assistant helping individuals reduce environmental impact through personalized insights and sustainable choices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 px-7 py-4 bg-eco-green hover:bg-eco-emerald text-white rounded-xl font-outfit font-bold shadow-lg shadow-eco-green/15 transition-all group cursor-pointer"
            >
              <span>Start Carbon Assessment</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-7 py-4 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl font-outfit font-semibold transition-all text-white text-center cursor-pointer"
            >
              View Sustainability Insights
            </button>
          </div>
        </motion.div>

        {/* Animated Planet SVG Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-5 flex justify-center relative"
        >
          <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] rounded-full bg-eco-forest/10 border border-white/5 flex items-center justify-center animate-float shadow-2xl shadow-eco-green/5 overflow-visible">
            {/* Rotating Orbits */}
            <div className="absolute inset-4 rounded-full border border-eco-green/20 border-dashed animate-[spin_40s_linear_infinite]"></div>
            <div className="absolute inset-12 rounded-full border border-eco-blue/15 border-dashed animate-[spin_25s_linear_infinite_reverse]"></div>
            
            {/* Core Earth Sphere */}
            <div className="w-52 h-52 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-eco-forest/90 via-eco-green/80 to-eco-blue/70 flex items-center justify-center relative shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.8),_0_0_50px_rgba(16,185,129,0.2)]">
              <Globe className="w-28 h-28 md:w-36 md:h-36 text-white/95 stroke-[1.1] animate-pulse-glow" />
              
              {/* Outer Glow ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping opacity-25"></div>
            </div>

            {/* Orbiting Leaf Icons */}
            <div className="absolute w-full h-full animate-[spin_30s_linear_infinite] pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 p-2 bg-eco-green/20 border border-eco-green/45 rounded-xl text-eco-green">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute w-full h-full animate-[spin_20s_linear_infinite_reverse] pointer-events-none">
              <div className="absolute bottom-6 left-10 p-2 bg-eco-blue/20 border border-eco-blue/45 rounded-xl text-eco-blue">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            
            {/* Ambient nodes */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-eco-green rounded-full shadow-lg shadow-eco-green animate-ping"></div>
            <div className="absolute bottom-1/4 right-1/4 w-3.5 h-3.5 bg-eco-blue rounded-full shadow-lg shadow-eco-blue animate-pulse"></div>
          </div>
        </motion.div>
      </header>

      {/* Features Showcase Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[10px] uppercase font-bold tracking-widest text-eco-green bg-eco-green/10 border border-eco-green/20 px-3 py-1 rounded-full">
            Key Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-outfit font-black text-white leading-tight mt-4 mb-4">
            Everything You Need to Live Sustainably
          </h2>
          <p className="text-eco-muted text-sm md:text-base leading-relaxed">
            Take carbon tracking to the next level with dynamic modules structured to lower atmospheric footprint.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card p-8 border border-white/5 flex flex-col justify-between transition-all duration-300 hover:border-eco-green/35 hover:-translate-y-1 group"
            >
              <div>
                <div className="p-3 bg-eco-green/10 border border-eco-green/20 text-eco-green rounded-2xl w-fit mb-6 transition-all group-hover:bg-eco-green group-hover:text-white">
                  <feature.icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-outfit font-bold text-white text-lg mb-3">{feature.title}</h3>
                <p className="text-eco-muted text-xs leading-relaxed mb-6">{feature.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-[10.5px] font-semibold text-eco-green">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feature.bullet}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section id="benefits" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-eco-green bg-eco-green/10 border border-eco-green/20 px-3 py-1 rounded-full">
              Platform Benefits
            </span>
            <h2 className="text-3xl md:text-4xl font-outfit font-black text-white leading-tight mt-4 mb-5">
              Why Choose EcoTrace?
            </h2>
            <p className="text-eco-muted text-sm leading-relaxed mb-8">
              We empower citizens to transition to active preservation through real-time rewards, analytical progress charts, and tailored AI assistant coaching.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold font-outfit transition-all cursor-pointer"
            >
              <span>Build Sustainable Habits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            {benefits.slice(0, 4).map((benefit, i) => (
              <div
                key={i}
                className="p-6 bg-eco-forest/15 border border-white/5 hover:border-white/10 rounded-2xl transition-all flex gap-4 items-start"
              >
                <div className="p-2.5 bg-eco-green/10 border border-eco-green/20 text-eco-green rounded-xl shrink-0">
                  <benefit.icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="font-outfit font-bold text-white text-xs mb-1.5">{benefit.title}</h4>
                  <p className="text-eco-muted text-[11px] leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Impact Visualization */}
      <section id="impact" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase font-bold tracking-widest text-eco-green bg-eco-green/10 border border-eco-green/20 px-3 py-1 rounded-full">
            Community Preservation Impact
          </span>
          <h2 className="text-3xl md:text-4xl font-outfit font-black text-white leading-tight mt-4 mb-4">
            Our Compounding Carbon Savings
          </h2>
          <p className="text-eco-muted text-xs md:text-sm leading-relaxed">
            Real-time dashboard displaying the cumulative preservation actions logged by active EcoTrace citizens.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              value: liveStats.co2.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg',
              label: 'Total CO₂ Offset',
              desc: 'Emissions prevented from entering atmosphere',
              icon: Sprout,
              color: 'text-eco-green'
            },
            {
              value: liveStats.trees.toLocaleString(),
              label: 'Mature Trees Equivalent',
              desc: 'Annual carbon absorption equivalence',
              icon: Leaf,
              color: 'text-emerald-400'
            },
            {
              value: liveStats.energy.toLocaleString() + ' kWh',
              label: 'Clean Energy Saved',
              desc: 'Utility and appliance energy conserved',
              icon: Zap,
              color: 'text-amber-400'
            },
            {
              value: liveStats.plastic.toLocaleString() + ' items',
              label: 'Single-Use Plastics Avoided',
              desc: 'Landfill and ocean waste diverted',
              icon: ShieldCheck,
              color: 'text-eco-blue'
            }
          ].map((stat, i) => (
            <div key={i} className="glass-card-premium p-6 text-center flex flex-col items-center">
              <div className={`p-3.5 bg-white/5 rounded-2xl border border-white/10 mb-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="text-2xl md:text-3xl font-outfit font-black text-white mb-2 tracking-tight select-none">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-white mb-1">{stat.label}</div>
              <div className="text-[10px] text-eco-muted leading-relaxed max-w-[180px]">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faqs" className="max-w-4xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 scroll-mt-16">
        <h2 className="text-3xl font-outfit font-black text-white text-center leading-tight mb-12">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div
                key={i}
                className="glass-card border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-outfit font-bold text-white leading-snug text-sm md:text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-eco-muted transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-6 text-xs md:text-sm text-eco-muted leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* SaaS Landing Footer */}
      <footer className="bg-black/60 border-t border-white/5 pt-16 pb-8 relative z-10 text-xs text-eco-muted">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-eco-green" />
              <span className="font-outfit font-black text-lg text-white">EcoTrace</span>
            </div>
            <p className="text-[11px] leading-relaxed max-w-[200px]">
              Providing intelligent utility diagnostics, green habit metrics, and AI carbon analytics to build sustainable futures.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white text-xs mb-3 font-outfit uppercase tracking-wider">Product</h5>
            <ul className="flex flex-col gap-2">
              <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-all text-left">Calculator</button></li>
              <li><button onClick={() => navigate('/signin')} className="hover:text-white transition-all text-left">AI Assistant</button></li>
              <li><button onClick={() => navigate('/signin')} className="hover:text-white transition-all text-left">Dashboard Insights</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-xs mb-3 font-outfit uppercase tracking-wider">Resources</h5>
            <ul className="flex flex-col gap-2 font-medium">
              <li><button onClick={() => scrollToSection('faqs')} className="hover:text-white transition-all text-left">FAQs</button></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-all">GitHub Repo</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-xs mb-3 font-outfit uppercase tracking-wider font-extrabold">Company</h5>
            <p className="text-[10px] leading-relaxed mb-1">
              "The greatest threat to our planet is the belief that someone else will save it."
            </p>
            <span className="text-[10px] font-bold text-eco-green font-outfit">— Robert Swan</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 text-center text-[10px] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} EcoTrace Inc. Built with love for global environmental conservation.</p>
          <div className="flex gap-4 font-semibold">
            <button onClick={() => navigate('/privacy')} className="hover:text-white transition-all cursor-pointer">Privacy Policy</button>
            <span className="cursor-help hover:text-white">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
