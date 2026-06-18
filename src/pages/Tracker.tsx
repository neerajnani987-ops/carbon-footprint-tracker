import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'framer-motion';
import {
  Bus,
  Zap,
  Utensils,
  Package,
  Check,
  Lightbulb,
} from 'lucide-react';

const ACTION_GROUPS = [
  {
    category: 'Transportation',
    icon: Bus,
    color: 'indigo',
    actions: [
      { id: 'transit-commute', title: 'Took Public Transit', desc: 'Swapped personal car for train, bus, or subway.', saving: 2.5 },
      { id: 'bike-walk-commute', title: 'Biked, Walked, or Scooted', desc: 'Zero emissions commuting to work, school, or errands.', saving: 3.2 },
      { id: 'carpool', title: 'Carpooled with Others', desc: 'Shared a ride to halve commute footprint.', saving: 1.8 },
    ],
  },
  {
    category: 'Energy Conservation',
    icon: Zap,
    color: 'blue',
    actions: [
      { id: 'energy-standby', title: 'Unplugged Phantom Loads', desc: 'Turned off power strips and standby electronic appliances.', saving: 0.3 },
      { id: 'dryer-avoid', title: 'Air-Dried Laundry', desc: 'Avoided tumble dryer; used a drying rack or washing line.', saving: 0.8 },
      { id: 'temp-thermostat', title: 'Eco-Thermostat Setting', desc: 'Adjusted heating down or A/C up by 2°F for the day.', saving: 1.2 },
    ],
  },
  {
    category: 'Plant-Based Food',
    icon: Utensils,
    color: 'green',
    actions: [
      { id: 'meatless-meals', title: 'Ate Plant-Based Meals', desc: 'Substituted beef, pork, or dairy with plant protein.', saving: 1.5 },
      { id: 'zero-food-waste', title: 'Zero Food Waste Day', desc: 'Finished all leftovers and avoided spoiling items.', saving: 0.5 },
    ],
  },
  {
    category: 'Sustainable Consumption',
    icon: Package,
    color: 'amber',
    actions: [
      { id: 'plastic-free', title: 'Single-Use Plastic Free', desc: 'Brought canvas bags, steel flasks, or metal straws.', saving: 0.2 },
      { id: 'composting', title: 'Composted Organic Waste', desc: 'Diverted organic waste from landfills to prevent methane.', saving: 0.4 },
    ],
  },
];

const ECO_TIPS = [
  'Replacing just 5 incandescent light bulbs with LEDs saves about $75 a year and avoids 150 kg of CO₂.',
  'Washing your laundry in cold water instead of hot saves up to 90% of the energy consumed by the washing machine.',
  'Drying laundry on a simple clothesline or drying rack instead of using a gas/electric dryer avoids 0.8 kg of CO₂ per load.',
  'Reducing your driving speed from 75 mph to 65 mph can improve highway fuel efficiency by up to 15%, saving emissions and fuel.',
  'Eliminating beef from your diet for just one day saves more carbon than swapping a standard car for a hybrid for that day.',
  'Leaving chargers plugged in when not in use still draws phantom load electricity. Unplugging them saves up to 10% on power bills.',
  'Composting food leftovers prevents food waste from rotting anaerobically in landfills, which otherwise releases methane gas.',
  'Eating locally grown foods reduces emissions associated with transcontinental food freight shipping, known as food miles.',
];

const Tracker: React.FC = () => {
  const { t, language } = useLanguage();
  const { dailyLogs, submitDailyLog } = useAppState();

  const getLocalDateString = () => {
    const offset = new Date().getTimezoneOffset();
    const adjustedDate = new Date(new Date().getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split('T')[0];
  };

  const todayStr = getLocalDateString();

  // Load today's log on mount
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  useEffect(() => {
    const todayLogs = dailyLogs[todayStr] || [];
    setSelectedActions(todayLogs);
  }, [dailyLogs, todayStr]);

  // Tip of the day selection
  const ecoTip = useMemo(() => {
    const dateNum = new Date().getDate();
    return ECO_TIPS[dateNum % ECO_TIPS.length];
  }, []);

  const handleToggleAction = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]
    );
  };

  // Savings math
  const currentSavings = useMemo(() => {
    let sum = 0;
    const actionSavings: Record<string, number> = {};
    ACTION_GROUPS.forEach((g) => {
      g.actions.forEach((a) => {
        actionSavings[a.id] = a.saving;
      });
    });
    selectedActions.forEach((id) => {
      sum += actionSavings[id] || 0;
    });
    return sum;
  }, [selectedActions]);

  const smartphoneCharges = useMemo(() => {
    return Math.round(currentSavings * 122); // 1kg ~ 122 charges
  }, [currentSavings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDailyLog(selectedActions);
  };

  // Recent logs history calculations
  const recentLogsList = useMemo(() => {
    const actionSavings: Record<string, number> = {};
    ACTION_GROUPS.forEach((g) => {
      g.actions.forEach((a) => {
        actionSavings[a.id] = a.saving;
      });
    });

    const sortedDates = Object.keys(dailyLogs)
      .sort()
      .reverse()
      .filter((date) => date !== todayStr) // exclude today
      .slice(0, 4);

    return sortedDates.map((dateStr) => {
      const actions = dailyLogs[dateStr] || [];
      let saved = 0;
      actions.forEach((id) => {
        saved += actionSavings[id] || 0;
      });

      const dateObj = new Date(dateStr + 'T00:00:00');
      const formattedDate = dateObj.toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      });

      return {
        date: formattedDate,
        savings: saved.toFixed(1),
        count: actions.length,
      };
    });
  }, [dailyLogs, todayStr, language]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto"
    >
      {/* Logger form wrapper */}
      <form onSubmit={handleSubmit} className="flex-1 glass-card p-6 md:p-8 border border-white/5 flex flex-col gap-6">
        <div>
          <h2 className="text-white font-bold font-outfit text-xl mb-1">{t('tracker.title')}</h2>
          <p className="text-xs text-eco-muted leading-relaxed">{t('tracker.desc')}</p>
        </div>

        <div className="flex flex-col gap-6.5">
          {ACTION_GROUPS.map((group, groupIdx) => {
            return (
              <div key={groupIdx} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                  <group.icon className="w-5 h-5 text-eco-green" />
                  <h4 className="text-white font-bold font-outfit text-sm">{group.category}</h4>
                </div>

                <div className="flex flex-col gap-3">
                  {group.actions.map((act) => {
                    const isChecked = selectedActions.includes(act.id);
                    return (
                      <label
                        key={act.id}
                        onClick={() => handleToggleAction(act.id)}
                        className={`flex items-center justify-between p-4 bg-eco-forest/15 hover:bg-eco-forest/25 border rounded-2xl cursor-pointer transition-all duration-300 ${
                          isChecked ? 'border-eco-green/45 bg-eco-green/5' : 'border-white/5'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 pr-4 select-none">
                          <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                            isChecked ? 'bg-eco-green border-eco-green text-white' : 'border-white/20'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-xs leading-none mb-1.5">{act.title}</div>
                            <div className="text-[11px] text-eco-muted leading-relaxed">{act.desc}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-eco-green shrink-0 font-outfit">
                          +{act.saving} kg CO₂
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-eco-green hover:bg-eco-emerald text-white rounded-xl text-xs font-bold font-outfit shadow-lg shadow-eco-green/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t('tracker.submit')}</span>
          </button>
        </div>
      </form>

      {/* Stats and Eco tips sidebar panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        
        {/* Today's savings dial */}
        <div className="glass-card p-6 border border-white/5 text-center flex flex-col justify-center items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-eco-muted mb-2">
            {t('tracker.todaySummary')}
          </span>
          <div className="text-3xl font-outfit font-black text-white leading-none my-1">
            {currentSavings.toFixed(1)}
          </div>
          <span className="text-xs text-eco-muted font-medium mb-4">kg CO₂e Saved</span>
          
          <div className="w-full h-px bg-white/5 my-3"></div>
          
          <p className="text-[11px] text-eco-green leading-relaxed max-w-[200px]">
            {t('tracker.smartphoneEq', { charges: smartphoneCharges })}
          </p>
        </div>

        {/* Eco Tip of the day widget */}
        <div className="glass-card p-6 border border-white/5 flex gap-3.5 items-start">
          <div className="p-2 bg-amber-500/15 rounded-xl border border-amber-500/25 shrink-0 text-amber-500 animate-pulse">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-outfit font-bold text-white text-xs mb-1.5">{t('tracker.tipTitle')}</h5>
            <p className="text-[11px] text-eco-muted leading-relaxed">{ecoTip}</p>
          </div>
        </div>

        {/* Recent logs history widget */}
        <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
          <h5 className="font-outfit font-bold text-white text-xs uppercase tracking-wider">
            {t('tracker.recentHistory')}
          </h5>

          {recentLogsList.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentLogsList.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/3 border border-white/5 rounded-xl text-xs"
                >
                  <div>
                    <div className="text-white font-medium mb-0.5">{log.date}</div>
                    <div className="text-[10px] text-eco-muted font-medium">{log.count} actions logged</div>
                  </div>
                  <span className="font-bold text-eco-green font-outfit">+{log.savings} kg</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-eco-muted text-center py-4 italic">
              {t('tracker.emptyHistory')}
            </p>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Tracker;
