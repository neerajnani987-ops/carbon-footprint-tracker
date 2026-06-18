import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Plane,
  Home,
  Utensils,
  Trash2,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';

const Calculator: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { calculator, updateCalculator, saveCalculatorResults, calculateBreakdown } = useAppState();

  const [activeStep, setActiveStep] = useState(0); // 0: Transport, 1: Energy, 2: Diet, 3: Waste
  const steps = ['transport', 'energy', 'diet', 'waste'];

  const liveBreakdown = calculateBreakdown();

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSave = () => {
    saveCalculatorResults();
    navigate('/dashboard');
  };

  // Adjust counters helper
  const adjustFlights = (field: 'flightsShort' | 'flightsLong', amount: number) => {
    const currentVal = calculator[field];
    const nextVal = Math.max(0, Math.min(50, currentVal + amount));
    updateCalculator({ [field]: nextVal });
  };

  return (
    <div className="calculator-container flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Ticker Header banner */}
      <div className="glass-card p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-white font-bold font-outfit text-xl mb-1">{t('calc.title')}</h2>
          <p className="text-xs text-eco-muted max-w-xl leading-relaxed">{t('calc.desc')}</p>
        </div>
        <div className="bg-eco-forest/40 border border-white/5 rounded-2xl px-5 py-3 flex flex-col shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-eco-muted mb-1">
            {t('calc.liveTicker')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-outfit font-black text-eco-green leading-none">
              {liveBreakdown.total}
            </span>
            <span className="text-xs text-eco-muted">t CO₂e / yr</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 items-start">
        {/* Step-by-Step Navigation sidebar */}
        <div className="md:col-span-1 glass-card p-4 border border-white/5 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          {[
            { label: t('calc.step1'), icon: Car },
            { label: t('calc.step2'), icon: Home },
            { label: t('calc.step3'), icon: Utensils },
            { label: t('calc.step4'), icon: Trash2 },
          ].map((step, idx) => {
            const isActive = activeStep === idx;
            const isCompleted = activeStep > idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-outfit shrink-0 text-left w-full ${
                  isActive
                    ? 'bg-eco-green/10 border border-eco-green/30 text-white font-semibold'
                    : 'text-eco-muted hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive
                      ? 'bg-eco-green text-white'
                      : isCompleted
                      ? 'bg-eco-green/20 text-eco-green'
                      : 'bg-white/5 text-eco-muted border border-white/10'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </div>
                <span className="text-xs hidden md:inline">{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Forms Panel */}
        <div className="md:col-span-3 glass-card p-6 md:p-8 border border-white/5 flex flex-col justify-between min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              {/* Step 1: Transport */}
              {activeStep === 0 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                    <Car className="w-5 h-5 text-eco-green" />
                    <h3 className="text-white font-bold font-outfit">Vehicle Travel & Commute</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="vehicleType" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                      Primary Commute Vehicle
                    </label>
                    <select
                      id="vehicleType"
                      value={calculator.vehicleType}
                      onChange={(e) => updateCalculator({ vehicleType: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white text-sm focus:outline-none transition-all font-outfit"
                    >
                      <option value="none">None (Walk, Cycle, or WFH)</option>
                      <option value="petrol">Gasoline / Petrol Car</option>
                      <option value="diesel">Diesel Car</option>
                      <option value="hybrid">Hybrid Vehicle</option>
                      <option value="ev">Electric Vehicle (EV)</option>
                      <option value="motorbike">Motorcycle / Scooter</option>
                    </select>
                  </div>

                  {calculator.vehicleType !== 'none' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="vehicleMiles" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                          Weekly Driving Distance
                        </label>
                        <span className="text-xs font-bold text-eco-green font-outfit">
                          {calculator.vehicleMiles} miles/wk
                        </span>
                      </div>
                      <input
                        id="vehicleMiles"
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={calculator.vehicleMiles}
                        onChange={(e) => updateCalculator({ vehicleMiles: parseInt(e.target.value) })}
                        className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-eco-muted">
                        <span>0 mi</span>
                        <span>250 mi</span>
                        <span>500 mi</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Plane className="w-5 h-5 text-eco-green" />
                      <h4 className="text-white font-bold font-outfit text-sm">Flights & Air Travel</h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-white">Short Flights</label>
                          <span className="text-[10px] text-eco-muted">Regional commutes (&lt; 3 hrs)</span>
                        </div>
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 w-36">
                          <button
                            onClick={() => adjustFlights('flightsShort', -1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg text-white font-extrabold transition-all"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            readOnly
                            value={calculator.flightsShort}
                            className="w-14 text-center bg-transparent border-none text-white text-sm font-bold font-outfit outline-none"
                          />
                          <button
                            onClick={() => adjustFlights('flightsShort', 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg text-white font-extrabold transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-white">Long Flights</label>
                          <span className="text-[10px] text-eco-muted">International trips (&gt; 3 hrs)</span>
                        </div>
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 w-36">
                          <button
                            onClick={() => adjustFlights('flightsLong', -1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg text-white font-extrabold transition-all"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            readOnly
                            value={calculator.flightsLong}
                            className="w-14 text-center bg-transparent border-none text-white text-sm font-bold font-outfit outline-none"
                          />
                          <button
                            onClick={() => adjustFlights('flightsLong', 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg text-white font-extrabold transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Energy */}
              {activeStep === 1 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                    <Home className="w-5 h-5 text-eco-green" />
                    <h3 className="text-white font-bold font-outfit">Home Energy Utilities</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="electricBill" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                        Monthly Electricity Bill
                      </label>
                      <span className="text-xs font-bold text-eco-green font-outfit">
                        ${calculator.electricBill}/mo
                      </span>
                    </div>
                    <input
                      id="electricBill"
                      type="range"
                      min="0"
                      max="400"
                      step="10"
                      value={calculator.electricBill}
                      onChange={(e) => updateCalculator({ electricBill: parseInt(e.target.value) })}
                      className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-eco-muted">
                      <span>$0</span>
                      <span>$200</span>
                      <span>$400</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="gasBill" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                        Monthly Natural Gas Bill
                      </label>
                      <span className="text-xs font-bold text-eco-green font-outfit">
                        ${calculator.gasBill}/mo
                      </span>
                    </div>
                    <input
                      id="gasBill"
                      type="range"
                      min="0"
                      max="300"
                      step="10"
                      value={calculator.gasBill}
                      onChange={(e) => updateCalculator({ gasBill: parseInt(e.target.value) })}
                      className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-eco-muted">
                      <span>$0</span>
                      <span>$150</span>
                      <span>$300</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="cleanEnergyShare" className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center gap-1">
                        <span>Clean/Solar Grid Share</span>
                        <span className="relative group text-eco-muted/50 hover:text-white cursor-help">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2 bg-black border border-white/10 rounded-lg text-[10px] leading-tight font-outfit hidden group-hover:block z-10 shadow-lg text-center normal-case">
                            Percentage of your electricity derived from green clean energy sources or solar panels.
                          </span>
                        </span>
                      </label>
                      <span className="text-xs font-bold text-eco-green font-outfit">
                        {calculator.cleanEnergyShare}%
                      </span>
                    </div>
                    <input
                      id="cleanEnergyShare"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={calculator.cleanEnergyShare}
                      onChange={(e) => updateCalculator({ cleanEnergyShare: parseInt(e.target.value) })}
                      className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-eco-muted">
                      <span>Standard Grid (0%)</span>
                      <span>50%</span>
                      <span>100% Renewable</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Food */}
              {activeStep === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                    <Utensils className="w-5 h-5 text-eco-green" />
                    <h3 className="text-white font-bold font-outfit">Diet Habits & Food Consumption</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="dietType" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                      Diet Pattern
                    </label>
                    <select
                      id="dietType"
                      value={calculator.dietType}
                      onChange={(e) => updateCalculator({ dietType: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white text-sm focus:outline-none transition-all font-outfit"
                    >
                      <option value="heavy-meat">Heavy Meat Lover (Beef/Pork daily)</option>
                      <option value="moderate-meat">Average Meat Eater (Mixed meat/poultry)</option>
                      <option value="low-meat">Low Meat / Pescatarian (Fish & poultry, no red meat)</option>
                      <option value="vegetarian">Vegetarian (No meat/fish, includes dairy/eggs)</option>
                      <option value="vegan">Vegan (Fully plant-based)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="localFoodShare" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                        Local / Organic Food Share
                      </label>
                      <span className="text-xs font-bold text-eco-green font-outfit">
                        {calculator.localFoodShare}%
                      </span>
                    </div>
                    <input
                      id="localFoodShare"
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={calculator.localFoodShare}
                      onChange={(e) => updateCalculator({ localFoodShare: parseInt(e.target.value) })}
                      className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-eco-muted">
                      <span>0% (Imported/Processed)</span>
                      <span>50%</span>
                      <span>100% Locally Sourced</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Waste */}
              {activeStep === 3 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                    <Trash2 className="w-5 h-5 text-eco-green" />
                    <h3 className="text-white font-bold font-outfit">Household Waste Production</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="wasteBags" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                        Waste Produced (Bags per Week)
                      </label>
                      <span className="text-xs font-bold text-eco-green font-outfit">
                        {calculator.wasteBags} bag{calculator.wasteBags !== 1 ? 's' : ''}/wk
                      </span>
                    </div>
                    <input
                      id="wasteBags"
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={calculator.wasteBags}
                      onChange={(e) => updateCalculator({ wasteBags: parseInt(e.target.value) })}
                      className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-eco-muted">
                      <span>0 (Zero Waste)</span>
                      <span>5 bags</span>
                      <span>10 bags</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="recyclingRate" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                        Household Recycling Rate
                      </label>
                      <span className="text-xs font-bold text-eco-green font-outfit">
                        {calculator.recyclingRate}%
                      </span>
                    </div>
                    <input
                      id="recyclingRate"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={calculator.recyclingRate}
                      onChange={(e) => updateCalculator({ recyclingRate: parseInt(e.target.value) })}
                      className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-eco-muted">
                      <span>0% (No recycling)</span>
                      <span>50%</span>
                      <span>100% Complete Sort</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Stepper buttons wrapper */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="px-5 py-2.5 border border-white/10 hover:border-white/20 disabled:border-white/5 hover:bg-white/5 text-white disabled:text-eco-muted/30 rounded-xl text-xs font-semibold font-outfit transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('calc.back')}</span>
            </button>

            {activeStep === steps.length - 1 ? (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-eco-green hover:bg-eco-emerald text-white rounded-xl text-xs font-bold font-outfit transition-all shadow-md shadow-eco-green/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('calc.save')}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-eco-green hover:bg-eco-emerald text-white rounded-xl text-xs font-bold font-outfit transition-all shadow-md shadow-eco-green/10 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('calc.next')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
