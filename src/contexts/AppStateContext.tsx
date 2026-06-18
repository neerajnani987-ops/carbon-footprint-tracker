import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CalculatorState, Quest, ToastMessage, AppStateContextType } from '../types';
import { BADGES, INITIAL_CALCULATOR, ACTION_SAVINGS } from '../constants';
import { calculateCarbonBreakdown } from '../utils';
import { saveUserData, getUserData } from '../services/firebase';
import { AuthContext } from './AuthContext';

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authCtx = useContext(AuthContext);
  const user = authCtx ? authCtx.user : null;

  const [calculator, setCalculator] = useState<CalculatorState>(INITIAL_CALCULATOR);
  const [dailyLogs, setDailyLogs] = useState<Record<string, string[]>>({});
  const [totalSavings, setTotalSavings] = useState(0.0);
  const [streak, setStreak] = useState(0);
  const [lastLoggedDate, setLastLoggedDate] = useState<string | null>(null);
  const [hasCompletedCalc, setHasCompletedCalc] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load user-specific state on startup or user change
  useEffect(() => {
    const loadState = async () => {
      if (!user) {
        // Reset state for guest / logged out users
        setCalculator(INITIAL_CALCULATOR);
        setDailyLogs({});
        setTotalSavings(0.0);
        setStreak(0);
        setLastLoggedDate(null);
        setHasCompletedCalc(false);
        setUnlockedBadges({});
        return;
      }

      try {
        const userId = user.uid || user.email;
        const data = await getUserData(userId);
        if (data) {
          if (data.calculator) setCalculator(data.calculator);
          if (data.dailyLogs) setDailyLogs(data.dailyLogs);
          if (data.totalSavings) setTotalSavings(data.totalSavings);
          if (data.streak) setStreak(data.streak);
          if (data.lastLoggedDate) setLastLoggedDate(data.lastLoggedDate);
          if (data.hasCompletedCalc) setHasCompletedCalc(data.hasCompletedCalc);
          if (data.unlockedBadges) setUnlockedBadges(data.unlockedBadges);
        } else {
          // No remote database document exists yet, try migrating local un-authenticated items
          const saved = localStorage.getItem('ecotrace_app_state');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.calculator) setCalculator(parsed.calculator);
            if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
            if (parsed.totalSavings) setTotalSavings(parsed.totalSavings);
            if (parsed.streak) setStreak(parsed.streak);
            if (parsed.lastLoggedDate) setLastLoggedDate(parsed.lastLoggedDate);
            if (parsed.hasCompletedCalc) setHasCompletedCalc(parsed.hasCompletedCalc);
            if (parsed.unlockedBadges) setUnlockedBadges(parsed.unlockedBadges);
            
            // Auto sync this migrated state to user db document
            await saveUserData(userId, parsed);
          } else {
            // Reset to defaults
            setCalculator(INITIAL_CALCULATOR);
            setDailyLogs({});
            setTotalSavings(0.0);
            setStreak(0);
            setLastLoggedDate(null);
            setHasCompletedCalc(false);
            setUnlockedBadges({});
          }
        }
      } catch (e) {
        console.error('Failed to load user state:', e);
      }
    };

    loadState();
  }, [user]);

  // Synchronizes changes to database/storage scoped strictly by user UID
  const syncState = async (updates: any) => {
    if (!user) return;
    const userId = user.uid || user.email;
    try {
      const currentData = {
        calculator,
        dailyLogs,
        totalSavings,
        streak,
        lastLoggedDate,
        hasCompletedCalc,
        unlockedBadges,
        ...updates
      };
      await saveUserData(userId, currentData);
      
      // Also backup locally
      localStorage.setItem('ecotrace_app_state', JSON.stringify(currentData));
    } catch (e) {
      console.error('State sync failed:', e);
    }
  };

  const triggerToast = (title: string, desc: string, icon: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, desc, icon }]);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateCalculator = (updates: Partial<CalculatorState>) => {
    setCalculator((prev) => {
      const next = { ...prev, ...updates };
      syncState({ calculator: next });
      return next;
    });
  };

  const liveBreakdown = () => {
    return calculateCarbonBreakdown(calculator);
  };

  const saveCalculatorResults = () => {
    setHasCompletedCalc(true);
    syncState({ hasCompletedCalc: true });
    unlockBadge('carbon-pioneer');
    
    // Check specific calculator badges
    const breakdown = calculateCarbonBreakdown(calculator);
    if (breakdown.energy <= 1.5) {
      unlockBadge('energy-guardian');
    }
    if (calculator.recyclingRate >= 75) {
      unlockBadge('waste-ninja');
    }
  };

  const unlockBadge = (badgeId: string) => {
    setUnlockedBadges((prev) => {
      if (prev[badgeId]) return prev;

      const badge = BADGES.find((b) => b.id === badgeId);
      if (badge) {
        const today = new Date().toISOString().split('T')[0];
        const updated = { ...prev, [badgeId]: today };
        syncState({ unlockedBadges: updated });
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

    let todaySavings = 0;
    actionIds.forEach((id) => {
      todaySavings += ACTION_SAVINGS[id] || 0;
    });

    let previousSaved = 0;
    const oldActions = dailyLogs[todayStr] || [];
    oldActions.forEach((id) => {
      previousSaved += ACTION_SAVINGS[id] || 0;
    });

    const netSavings = todaySavings - previousSaved;
    const newTotalSavings = Math.max(0, totalSavings + netSavings);

    const updatedLogs = { ...dailyLogs, [todayStr]: actionIds };

    setStreak(nextStreak);
    setLastLoggedDate(todayStr);
    setTotalSavings(newTotalSavings);
    setDailyLogs(updatedLogs);

    syncState({
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
        calculateBreakdown: liveBreakdown,
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
export default AppStateProvider;
