import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface CalculatorState {
  vehicleType: string;
  vehicleMiles: number;
  flightsShort: number;
  flightsLong: number;
  electricBill: number;
  gasBill: number;
  cleanEnergyShare: number;
  dietType: string;
  localFoodShare: number;
  wasteBags: number;
  recyclingRate: number;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
}

export interface Quest {
  id: string;
  name: string;
  desc: string;
  target: number;
  current: number;
  unit: string;
  rewardBadge: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

interface AppStateContextType {
  calculator: CalculatorState;
  dailyLogs: Record<string, string[]>;
  totalSavings: number;
  streak: number;
  lastLoggedDate: string | null;
  hasCompletedCalc: boolean;
  unlockedBadges: Record<string, string>; // badgeId -> dateUnlocked
  toasts: ToastMessage[];
  badges: Badge[];
  quests: Quest[];
  updateCalculator: (updates: Partial<CalculatorState>) => void;
  saveCalculatorResults: () => void;
  submitDailyLog: (actionIds: string[]) => void;
  triggerToast: (title: string, desc: string, icon: string) => void;
  dismissToast: (id: string) => void;
  calculateBreakdown: () => {
    transport: number;
    energy: number;
    diet: number;
    waste: number;
    total: number;
  };
}

const BADGES: Badge[] = [
  { id: 'carbon-pioneer', name: 'Carbon Pioneer', desc: 'Completed your first carbon footprint calculation.', icon: 'compass', category: 'General' },
  { id: 'energy-guardian', name: 'Energy Guardian', desc: 'Maintained an annual home energy footprint below 1.5 tons CO₂e.', icon: 'zap', category: 'Energy' },
  { id: 'pedal-power', name: 'Pedal Power', desc: 'Logged walking, cycling, or transit commutes 3 or more times.', icon: 'bike', category: 'Transport' },
  { id: 'herbivore', name: 'Herbivore Hero', desc: 'Logged plant-based meals on 5 different days.', icon: 'salad', category: 'Diet' },
  { id: 'waste-ninja', name: 'Waste Ninja', desc: 'Achieved a household recycling rate of 75% or higher.', icon: 'trash-2', category: 'Waste' },
  { id: 'eco-champion', name: 'Eco Champion', desc: 'Avoided a total of 50 kg or more of carbon emissions through tracker logs.', icon: 'award', category: 'General' },
  { id: 'green-streak', name: 'Green Streak', desc: 'Logged your sustainable actions for 5 consecutive days.', icon: 'flame', category: 'General' },
  { id: 'tree-planter', name: 'Tree Planter', desc: 'Offset the equivalent carbon absorption of 5 mature trees (110 kg CO₂e).', icon: 'sprout', category: 'General' },
];

const INITIAL_CALCULATOR: CalculatorState = {
  vehicleType: 'petrol',
  vehicleMiles: 50,
  flightsShort: 2,
  flightsLong: 0,
  electricBill: 80,
  gasBill: 40,
  cleanEnergyShare: 0,
  dietType: 'moderate-meat',
  localFoodShare: 20,
  wasteBags: 2,
  recyclingRate: 30,
};

const COEFFS = {
  vehicle: { petrol: 0.411, diesel: 0.355, hybrid: 0.220, ev: 0.080, motorbike: 0.180, none: 0.0 } as Record<string, number>,
  flights: { short: 225, long: 820 },
  electric: { kwhCost: 0.15, co2PerKwh: 0.39 },
  gas: { thermCost: 1.0, co2PerTherm: 5.3 },
  diet: { 'heavy-meat': 3.3, 'moderate-meat': 2.5, 'low-meat': 1.7, 'vegetarian': 1.2, 'vegan': 0.9 } as Record<string, number>,
  waste: { perBag: 0.25 },
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calculator, setCalculator] = useState<CalculatorState>(INITIAL_CALCULATOR);
  const [dailyLogs, setDailyLogs] = useState<Record<string, string[]>>({});
  const [totalSavings, setTotalSavings] = useState(0.0);
  const [streak, setStreak] = useState(0);
  const [lastLoggedDate, setLastLoggedDate] = useState<string | null>(null);
  const [hasCompletedCalc, setHasCompletedCalc] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load state on startup
  useEffect(() => {
    const saved = localStorage.getItem('ecotrace_app_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.calculator) setCalculator(parsed.calculator);
        if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
        if (parsed.totalSavings) setTotalSavings(parsed.totalSavings);
        if (parsed.streak) setStreak(parsed.streak);
        if (parsed.lastLoggedDate) setLastLoggedDate(parsed.lastLoggedDate);
        if (parsed.hasCompletedCalc) setHasCompletedCalc(parsed.hasCompletedCalc);
        if (parsed.unlockedBadges) setUnlockedBadges(parsed.unlockedBadges);
      } catch (e) {
        console.error('Error loading app state:', e);
      }
    }
  }, []);

  // Sync back to localStorage when states change
  const saveToStorage = (updates: any) => {
    const saved = localStorage.getItem('ecotrace_app_state');
    let current = {};
    if (saved) {
      try { current = JSON.parse(saved); } catch (e) {}
    }
    const merged = { ...current, ...updates };
    localStorage.setItem('ecotrace_app_state', JSON.stringify(merged));
  };

  const triggerToast = (title: string, desc: string, icon: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, desc, icon }]);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateCalculator = (updates: Partial<CalculatorState>) => {
    setCalculator((prev) => {
      const next = { ...prev, ...updates };
      saveToStorage({ calculator: next });
      return next;
    });
  };

  const calculateBreakdown = () => {
    // 1. Transportation Annual Carbon (Tons)
    let transportCo2 = 0;
    if (calculator.vehicleType !== 'none') {
      const annualMiles = calculator.vehicleMiles * 52;
      const coeff = COEFFS.vehicle[calculator.vehicleType] || 0;
      transportCo2 += annualMiles * coeff;
    }
    transportCo2 += calculator.flightsShort * COEFFS.flights.short;
    transportCo2 += calculator.flightsLong * COEFFS.flights.long;
    transportCo2 = transportCo2 / 1000; // convert to tons

    // 2. Home Energy Annual Carbon (Tons)
    const annualKwh = (calculator.electricBill / COEFFS.electric.kwhCost) * 12;
    const standardGridShare = 1 - calculator.cleanEnergyShare / 100;
    const electricCo2 = (annualKwh * standardGridShare * COEFFS.electric.co2PerKwh) / 1000;

    const annualTherms = (calculator.gasBill / COEFFS.gas.thermCost) * 12;
    const gasCo2 = (annualTherms * COEFFS.gas.co2PerTherm) / 1000;
    const energyCo2 = electricCo2 + gasCo2;

    // 3. Diet Annual Carbon (Tons)
    const dietBase = COEFFS.diet[calculator.dietType] || 2.0;
    const dietDiscount = (calculator.localFoodShare / 100) * 0.1;
    const dietCo2 = dietBase * (1 - dietDiscount);

    // 4. Waste Annual Carbon (Tons)
    const wasteBase = calculator.wasteBags * COEFFS.waste.perBag;
    const wasteDiscount = (calculator.recyclingRate / 100) * 0.5;
    const wasteCo2 = wasteBase * (1 - wasteDiscount);

    const total = transportCo2 + energyCo2 + dietCo2 + wasteCo2;

    return {
      transport: parseFloat(transportCo2.toFixed(2)),
      energy: parseFloat(energyCo2.toFixed(2)),
      diet: parseFloat(dietCo2.toFixed(2)),
      waste: parseFloat(wasteCo2.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  };

  const saveCalculatorResults = () => {
    setHasCompletedCalc(true);
    saveToStorage({ hasCompletedCalc: true });
    unlockBadge('carbon-pioneer');
    
    // Check specific calculator badges
    const breakdown = calculateBreakdown();
    if (breakdown.energy <= 1.5) {
      unlockBadge('energy-guardian');
    }
    if (calculator.recyclingRate >= 75) {
      unlockBadge('waste-ninja');
    }
  };

  const unlockBadge = (badgeId: string) => {
    setUnlockedBadges((prev) => {
      if (prev[badgeId]) return prev; // already unlocked

      const badge = BADGES.find((b) => b.id === badgeId);
      if (badge) {
        const today = new Date().toISOString().split('T')[0];
        const updated = { ...prev, [badgeId]: today };
        saveToStorage({ unlockedBadges: updated });
        triggerToast('Badge Unlocked!', badge.name, badge.icon);
        return updated;
      }
      return prev;
    });
  };

  const getLocalDateString = (date = new Date()) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split('T')[0];
  };

  const submitDailyLog = (actionIds: string[]) => {
    const todayStr = getLocalDateString();
    
    // Determine streak logic
    let nextStreak = streak;
    if (lastLoggedDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      if (lastLoggedDate === yesterdayStr) {
        nextStreak += 1;
      } else {
        nextStreak = 1;
      }
    }
    setStreak(nextStreak);
    setLastLoggedDate(todayStr);

    // Track action values to calculate savings
    const actionSavings: Record<string, number> = {
      'transit-commute': 2.5,
      'bike-walk-commute': 3.2,
      'carpool': 1.8,
      'energy-standby': 0.3,
      'dryer-avoid': 0.8,
      'temp-thermostat': 1.2,
      'meatless-meals': 1.5,
      'zero-food-waste': 0.5,
      'plastic-free': 0.2,
      'composting': 0.4,
    };

    let todaySavings = 0;
    actionIds.forEach((id) => {
      todaySavings += actionSavings[id] || 0;
    });

    // Net adjustments for updates on the same day
    let previousSaved = 0;
    const oldActions = dailyLogs[todayStr] || [];
    oldActions.forEach((id) => {
      previousSaved += actionSavings[id] || 0;
    });

    const netSavings = todaySavings - previousSaved;
    const newTotalSavings = Math.max(0, totalSavings + netSavings);
    setTotalSavings(newTotalSavings);

    const updatedLogs = { ...dailyLogs, [todayStr]: actionIds };
    setDailyLogs(updatedLogs);

    saveToStorage({
      dailyLogs: updatedLogs,
      totalSavings: newTotalSavings,
      streak: nextStreak,
      lastLoggedDate: todayStr,
    });

    // Badge Check: Commute logs
    let transportCount = 0;
    Object.values(updatedLogs).forEach((log) => {
      if (log.includes('bike-walk-commute') || log.includes('transit-commute') || log.includes('carpool')) {
        transportCount++;
      }
    });
    if (transportCount >= 3) {
      unlockBadge('pedal-power');
    }

    // Badge Check: Plant meals logs
    let plantCount = 0;
    Object.values(updatedLogs).forEach((log) => {
      if (log.includes('meatless-meals')) {
        plantCount++;
      }
    });
    if (plantCount >= 5) {
      unlockBadge('herbivore');
    }

    // Badge Check: Streak
    if (nextStreak >= 5) {
      unlockBadge('green-streak');
    }

    // Badge Check: Total savings threshold
    if (newTotalSavings >= 50) {
      unlockBadge('eco-champion');
    }
    if (newTotalSavings >= 110) {
      unlockBadge('tree-planter');
    }
  };

  // Generate Quests dynamic state
  const getQuests = (): Quest[] => {
    let transportCount = 0;
    let plantCount = 0;
    Object.values(dailyLogs).forEach((log) => {
      if (log.includes('bike-walk-commute') || log.includes('transit-commute') || log.includes('carpool')) transportCount++;
      if (log.includes('meatless-meals')) plantCount++;
    });

    return [
      { id: 'commute-green', name: 'Commute Green', desc: 'Log public transit, walking, or cycling commutes 3 times.', target: 3, current: Math.min(transportCount, 3), unit: 'logs', rewardBadge: 'pedal-power' },
      { id: 'plant-based', name: 'Plant-Based Week', desc: 'Log plant-based meals on 5 separate days.', target: 5, current: Math.min(plantCount, 5), unit: 'days', rewardBadge: 'herbivore' },
      { id: 'eco-savings', name: 'Carbon Target 50kg', desc: 'Avoid 50 kg of carbon emissions from daily sustainable choices.', target: 50, current: Math.min(Math.round(totalSavings), 50), unit: 'kg', rewardBadge: 'eco-champion' },
      { id: 'forest-planter', name: 'Tree Planter', desc: 'Offset carbon equivalent to 5 mature trees (110 kg CO₂e).', target: 110, current: Math.min(Math.round(totalSavings), 110), unit: 'kg', rewardBadge: 'tree-planter' },
    ];
  };

  return (
    <AppStateContext.Provider
      value={{
        calculator,
        dailyLogs,
        totalSavings,
        streak,
        lastLoggedDate,
        hasCompletedCalc,
        unlockedBadges,
        toasts,
        badges: BADGES,
        quests: getQuests(),
        updateCalculator,
        saveCalculatorResults,
        submitDailyLog,
        triggerToast,
        dismissToast,
        calculateBreakdown,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
