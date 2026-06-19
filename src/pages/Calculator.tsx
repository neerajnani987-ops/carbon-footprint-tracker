import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useLanguage } from '../hooks/useLanguage';
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

  // Unit toggles state
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi');
  const [electricUnit, setElectricUnit] = useState<'usd' | 'kwh'>('usd');
  const [gasUnit, setGasUnit] = useState<'usd' | 'therm'>('usd');

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

  // Helper converters
  // 1 mile = 1.609 km
  const getDisplayDistance = () => {
    if (distanceUnit === 'mi') return calculator.vehicleMiles;
    return Math.round(calculator.vehicleMiles * 1.609);
  };

  const handleDistanceChange = (val: number) => {
    // strict validation
    const clamped = Math.max(0, Math.min(distanceUnit === 'mi' ? 500 : 800, val));
    if (distanceUnit === 'mi') {
      updateCalculator({ vehicleMiles: clamped });
    } else {
      updateCalculator({ vehicleMiles: Math.round(clamped / 1.609) });
    }
  };

  // 1 kWh = $0.15 electricity cost
  const getDisplayElectric = () => {
    if (electricUnit === 'usd') return calculator.electricBill;
    return Math.round(calculator.electricBill / 0.15);
  };

  const handleElectricChange = (val: number) => {
    // strict validation
    const clamped = Math.max(0, Math.min(electricUnit === 'usd' ? 400 : 2666, val));
    if (electricUnit === 'usd') {
      updateCalculator({ electricBill: clamped });
    } else {
      updateCalculator({ electricBill: Math.round(clamped * 0.15) });
    }
  };

  // 1 Therm = $1.00 natural gas cost
  const getDisplayGas = () => {
    if (gasUnit === 'usd') return calculator.gasBill;
    return Math.round(calculator.gasBill / 1.0);
  };

  const handleGasChange = (val: number) => {
    // strict validation
    const clamped = Math.max(0, Math.min(gasUnit === 'usd' ? 300 : 300, val));
    if (gasUnit === 'usd') {
      updateCalculator({ gasBill: clamped });
    } else {
      updateCalculator({ gasBill: Math.round(clamped * 1.0) });
    }
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
            <span className="text-xs text-eco-muted font-semibold">t CO₂e / yr</span>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-outfit shrink-0 text-left w-full cursor-pointer ${
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

        {/* Dynamic Forms Panel & Real-time carbon details breakdown */}
        <div className="md:col-span-3 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-card p-6 md:p-8 border border-white/5 flex flex-col justify-between min-h-[420px]">
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
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="vehicleType"
                          className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                        >
                          <span>Primary Commute Vehicle</span>
                          <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="tooltip-text">
                              Select your primary mode of private transport. EV stands for Electric
                              Vehicle.
                            </span>
                          </span>
                        </label>
                      </div>
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
                      <div className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-center">
                          <label
                            htmlFor="vehicleMiles"
                            className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                          >
                            <span>Weekly Commute Distance</span>
                            <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span className="tooltip-text">
                                Estimate the total distance driven weekly in this vehicle.
                              </span>
                            </span>
                          </label>
                          {/* Unit Selector */}
                          <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-bold">
                            <button
                              type="button"
                              onClick={() => setDistanceUnit('mi')}
                              className={`px-1.5 py-0.5 rounded ${distanceUnit === 'mi' ? 'bg-eco-green text-white' : 'text-eco-muted hover:text-white'}`}
                            >
                              Miles
                            </button>
                            <button
                              type="button"
                              onClick={() => setDistanceUnit('km')}
                              className={`px-1.5 py-0.5 rounded ${distanceUnit === 'km' ? 'bg-eco-green text-white' : 'text-eco-muted hover:text-white'}`}
                            >
                              KM
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <input
                            id="vehicleMiles"
                            type="range"
                            min="0"
                            max={distanceUnit === 'mi' ? '500' : '800'}
                            step={distanceUnit === 'mi' ? '10' : '16'}
                            value={getDisplayDistance()}
                            onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
                            className="flex-1 accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer eco-slider mr-4"
                          />
                          <span className="text-xs font-bold text-eco-green font-outfit w-20 text-right">
                            {getDisplayDistance()} {distanceUnit}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-eco-muted">
                          <span>0 {distanceUnit}</span>
                          <span>{distanceUnit === 'mi' ? '250 mi' : '400 km'}</span>
                          <span>{distanceUnit === 'mi' ? '500 mi' : '800 km'}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Plane className="w-5 h-5 text-eco-green" />
                        <h4 className="text-white font-bold font-outfit text-sm">
                          Flights & Air Travel
                        </h4>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex flex-col">
                            <label className="text-xs font-semibold text-white flex items-center">
                              <span>Short Flights</span>
                              <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span className="tooltip-text">
                                  Domestic or regional trips under 3 hours each way.
                                </span>
                              </span>
                            </label>
                            <span className="text-[10px] text-eco-muted">
                              Regional commutes (&lt; 3 hrs)
                            </span>
                          </div>
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 w-36">
                            <button
                              type="button"
                              onClick={() => adjustFlights('flightsShort', -1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg text-white font-extrabold transition-all cursor-pointer"
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
                              type="button"
                              onClick={() => adjustFlights('flightsShort', 1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg text-white font-extrabold transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <div className="flex flex-col">
                            <label className="text-xs font-semibold text-white flex items-center">
                              <span>Long Flights</span>
                              <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span className="tooltip-text">
                                  Long-haul or international trips over 3 hours each way.
                                </span>
                              </span>
                            </label>
                            <span className="text-[10px] text-eco-muted">
                              International trips (&gt; 3 hrs)
                            </span>
                          </div>
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 w-36">
                            <button
                              type="button"
                              onClick={() => adjustFlights('flightsLong', -1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg text-white font-extrabold transition-all cursor-pointer"
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
                              type="button"
                              onClick={() => adjustFlights('flightsLong', 1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-lg text-white font-extrabold transition-all cursor-pointer"
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
                        <label
                          htmlFor="electricBill"
                          className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                        >
                          <span>Monthly Electricity Bill</span>
                          <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="tooltip-text">
                              Enter in currency ($) or direct power usage (kWh). 1 kWh is estimated
                              at $0.15.
                            </span>
                          </span>
                        </label>
                        {/* Unit selector */}
                        <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-bold">
                          <button
                            type="button"
                            onClick={() => setElectricUnit('usd')}
                            className={`px-1.5 py-0.5 rounded ${electricUnit === 'usd' ? 'bg-eco-green text-white' : 'text-eco-muted hover:text-white'}`}
                          >
                            USD ($)
                          </button>
                          <button
                            type="button"
                            onClick={() => setElectricUnit('kwh')}
                            className={`px-1.5 py-0.5 rounded ${electricUnit === 'kwh' ? 'bg-eco-green text-white' : 'text-eco-muted hover:text-white'}`}
                          >
                            kWh
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <input
                          id="electricBill"
                          type="range"
                          min="0"
                          max={electricUnit === 'usd' ? '400' : '2666'}
                          step={electricUnit === 'usd' ? '10' : '66'}
                          value={getDisplayElectric()}
                          onChange={(e) => handleElectricChange(parseInt(e.target.value))}
                          className="flex-1 accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer eco-slider mr-4"
                        />
                        <span className="text-xs font-bold text-eco-green font-outfit w-20 text-right">
                          {electricUnit === 'usd' ? '$' : ''}
                          {getDisplayElectric()} {electricUnit === 'kwh' ? 'kWh' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-eco-muted">
                        <span>0</span>
                        <span>{electricUnit === 'usd' ? '$200' : '1333 kWh'}</span>
                        <span>{electricUnit === 'usd' ? '$400' : '2666 kWh'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="gasBill"
                          className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                        >
                          <span>Monthly Natural Gas Bill</span>
                          <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="tooltip-text">
                              Enter in currency ($) or usage (Therms). 1 Therm is estimated at
                              $1.00.
                            </span>
                          </span>
                        </label>
                        {/* Unit selector */}
                        <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-bold">
                          <button
                            type="button"
                            onClick={() => setGasUnit('usd')}
                            className={`px-1.5 py-0.5 rounded ${gasUnit === 'usd' ? 'bg-eco-green text-white' : 'text-eco-muted hover:text-white'}`}
                          >
                            USD ($)
                          </button>
                          <button
                            type="button"
                            onClick={() => setGasUnit('therm')}
                            className={`px-1.5 py-0.5 rounded ${gasUnit === 'therm' ? 'bg-eco-green text-white' : 'text-eco-muted hover:text-white'}`}
                          >
                            Therms
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <input
                          id="gasBill"
                          type="range"
                          min="0"
                          max="300"
                          step="10"
                          value={getDisplayGas()}
                          onChange={(e) => handleGasChange(parseInt(e.target.value))}
                          className="flex-1 accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer eco-slider mr-4"
                        />
                        <span className="text-xs font-bold text-eco-green font-outfit w-20 text-right">
                          {gasUnit === 'usd' ? '$' : ''}
                          {getDisplayGas()} {gasUnit === 'therm' ? 'Therms' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-eco-muted">
                        <span>0</span>
                        <span>{gasUnit === 'usd' ? '$150' : '150 Therms'}</span>
                        <span>{gasUnit === 'usd' ? '$300' : '300 Therms'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="cleanEnergyShare"
                          className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                        >
                          <span>Clean / Solar Grid Share</span>
                          <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="tooltip-text">
                              Percentage of your electricity derived from solar panels or certified
                              clean renewable tariffs.
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
                        onChange={(e) =>
                          updateCalculator({ cleanEnergyShare: parseInt(e.target.value) })
                        }
                        className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer eco-slider"
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
                      <h3 className="text-white font-bold font-outfit">
                        Diet Habits & Food Consumption
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="dietType"
                        className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                      >
                        <span>Diet Pattern</span>
                        <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span className="tooltip-text">
                            Select your daily eating habits. Heavy beef/pork consumption carries the
                            highest carbon coefficients.
                          </span>
                        </span>
                      </label>
                      <select
                        id="dietType"
                        value={calculator.dietType}
                        onChange={(e) => updateCalculator({ dietType: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white text-sm focus:outline-none transition-all font-outfit"
                      >
                        <option value="heavy-meat">Heavy Meat Lover (Beef/Pork daily)</option>
                        <option value="moderate-meat">
                          Average Meat Eater (Mixed meat/poultry)
                        </option>
                        <option value="low-meat">
                          Low Meat / Pescatarian (Fish & poultry, no red meat)
                        </option>
                        <option value="vegetarian">
                          Vegetarian (No meat/fish, includes dairy/eggs)
                        </option>
                        <option value="vegan">Vegan (Fully plant-based)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="localFoodShare"
                          className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                        >
                          <span>Local / Organic Sourced Share</span>
                          <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="tooltip-text">
                              Percentage of groceries grown locally or organically, reducing freight
                              emissions (food miles).
                            </span>
                          </span>
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
                        onChange={(e) =>
                          updateCalculator({ localFoodShare: parseInt(e.target.value) })
                        }
                        className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer eco-slider"
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
                      <h3 className="text-white font-bold font-outfit">
                        Household Waste Production
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="wasteBags"
                          className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                        >
                          <span>Weekly Landfill Waste Volume</span>
                          <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="tooltip-text">
                              Estimate the number of standard trash bags sent to landfill weekly.
                            </span>
                          </span>
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
                        className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer eco-slider"
                      />
                      <div className="flex justify-between text-[10px] text-eco-muted">
                        <span>0 (Zero Waste)</span>
                        <span>5 bags</span>
                        <span>10 bags</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="recyclingRate"
                          className="text-xs font-semibold text-eco-muted uppercase tracking-wider flex items-center"
                        >
                          <span>Household Recycling Rate</span>
                          <span className="eco-tooltip ml-1.5 cursor-help text-eco-muted/50 hover:text-white">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="tooltip-text">
                              Percentage of recyclable waste (paper, plastic, glass, tins) sorted
                              correctly.
                            </span>
                          </span>
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
                        onChange={(e) =>
                          updateCalculator({ recyclingRate: parseInt(e.target.value) })
                        }
                        className="w-full accent-eco-green bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer eco-slider"
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
                type="button"
                onClick={handleBack}
                disabled={activeStep === 0}
                className="px-5 py-2.5 border border-white/10 hover:border-white/20 disabled:border-white/5 hover:bg-white/5 text-white disabled:text-eco-muted/30 rounded-xl text-xs font-semibold font-outfit transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('calc.back')}</span>
              </button>

              {activeStep === steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-eco-green hover:bg-eco-emerald text-white rounded-xl text-xs font-bold font-outfit transition-all shadow-md shadow-eco-green/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('calc.save')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-eco-green hover:bg-eco-emerald text-white rounded-xl text-xs font-bold font-outfit transition-all shadow-md shadow-eco-green/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('calc.next')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Real-time Category Emissions details sidebar */}
          <div className="lg:col-span-4 glass-card p-6 border border-white/5 flex flex-col gap-4">
            <h4 className="text-white font-bold font-outfit text-xs uppercase tracking-wider pb-2 border-b border-white/5">
              Live Emissions Share
            </h4>

            <div className="flex flex-col gap-4.5 mt-2">
              {[
                { label: 'Transportation', value: liveBreakdown.transport, color: 'bg-indigo-500' },
                { label: 'Home Energy', value: liveBreakdown.energy, color: 'bg-blue-500' },
                { label: 'Diet & Food', value: liveBreakdown.diet, color: 'bg-eco-green' },
                { label: 'Waste', value: liveBreakdown.waste, color: 'bg-amber-500' },
              ].map((item, i) => {
                const percent =
                  liveBreakdown.total > 0
                    ? Math.round((item.value / liveBreakdown.total) * 100)
                    : 0;
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-eco-muted font-medium">{item.label}</span>
                      <span className="text-white font-bold font-outfit">
                        {item.value} t ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-full h-px bg-white/5 my-2"></div>

            <div className="text-[10.5px] text-eco-muted leading-relaxed">
              Target emission ceiling is{' '}
              <span className="text-white font-semibold">3.5 metric tons</span>. Swapping commutes
              to hybrid/EV, adjusting home HVAC, eating vegetarian/vegan, and recycling sorts can
              lower your live projections.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
