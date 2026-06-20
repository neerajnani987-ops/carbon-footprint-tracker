import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useLanguage } from '../hooks/useLanguage';
import {
  Compass,
  Zap,
  Bike,
  Salad,
  Trash2,
  Award,
  Flame,
  Sprout,
  Lock,
  CheckCircle,
  Leaf,
  Shield,
  Globe,
  Save,
  Trophy,
  Calendar,
} from 'lucide-react';

const BadgeIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  switch (name) {
    case 'compass':
      return <Compass className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'bike':
      return <Bike className={className} />;
    case 'salad':
      return <Salad className={className} />;
    case 'trash-2':
      return <Trash2 className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'sprout':
      return <Sprout className={className} />;
    case 'leaf':
      return <Leaf className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'globe':
      return <Globe className={className} />;
    default:
      return <Award className={className} />;
  }
};

const Challenges: React.FC = () => {
  const { t } = useLanguage();
  const {
    badges,
    quests,
    unlockedBadges,
    monthlyGoal,
    yearlyGoal,
    updateGoals,
    ecoPoints,
    addEcoPoints,
    dailyLogs,
    triggerToast,
  } = useAppState();

  const [localMonthlyGoal, setLocalMonthlyGoal] = useState(monthlyGoal || 50);
  const [localYearlyGoal, setLocalYearlyGoal] = useState(yearlyGoal || 600);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLocalMonthlyGoal(monthlyGoal || 50);
    setLocalYearlyGoal(yearlyGoal || 600);
  }, [monthlyGoal, yearlyGoal]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoals(localMonthlyGoal, localYearlyGoal);
    triggerToast('Goals Saved', 'Your carbon savings goals have been updated.', 'check');
  };

  // Helper to compute week number
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const currentWeekStr = `${new Date().getFullYear()}-W${getWeekNumber(new Date())}`;

  // Read/write claimed challenges list locally
  const [claimedList, setClaimedList] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ecotrace_claimed_challenges');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveClaimed = (newList: Record<string, boolean>) => {
    setClaimedList(newList);
    localStorage.setItem('ecotrace_claimed_challenges', JSON.stringify(newList));
  };

  const handleClaimPoints = (claimId: string, points: number) => {
    if (claimedList[claimId]) return;
    addEcoPoints(points);
    const nextList = { ...claimedList, [claimId]: true };
    saveClaimed(nextList);
    triggerToast('Points Claimed!', `You received +${points} Eco Points!`, 'award');
  };

  // Dynamically calculate progress for the challenges
  const activeChallenges = useMemo(() => {
    const actionSavings: Record<string, number> = {
      'transit-commute': 2.5,
      'bike-walk-commute': 3.2,
      carpool: 1.8,
      'energy-standby': 0.3,
      'dryer-avoid': 0.8,
      'temp-thermostat': 1.2,
      'meatless-meals': 1.5,
      'zero-food-waste': 0.5,
      'plastic-free': 0.2,
      composting: 0.4,
    };

    // Calculate last 7 days keys
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    let weeklyCommutes = 0;
    let weeklyComposting = 0;
    last7Days.forEach((dateStr) => {
      const log = dailyLogs[dateStr] || [];
      if (
        log.includes('transit-commute') ||
        log.includes('bike-walk-commute') ||
        log.includes('carpool')
      ) {
        weeklyCommutes++;
      }
      if (log.includes('composting')) {
        weeklyComposting++;
      }
    });

    // Calculate monthly logger status
    let monthlyLoggedDays = 0;
    let monthlySavings = 0;
    Object.entries(dailyLogs).forEach(([dateStr, actions]) => {
      if (dateStr.startsWith(currentMonthStr)) {
        if (actions.length > 0) {
          monthlyLoggedDays++;
        }
        actions.forEach((act) => {
          monthlySavings += actionSavings[act] || 0;
        });
      }
    });

    const todayActions = dailyLogs[todayStr] || [];

    return {
      daily: [
        {
          id: 'phantom-buster',
          claimId: `${todayStr}_phantom-buster`,
          name: 'Phantom Power Buster',
          desc: 'Unplug phantom standby loads and appliances today.',
          current: todayActions.includes('energy-standby') ? 1 : 0,
          target: 1,
          points: 10,
        },
        {
          id: 'meatless-hero',
          claimId: `${todayStr}_meatless-hero`,
          name: 'Meatless meals hero',
          desc: 'Eat plant-based lunch and dinner meals today.',
          current: todayActions.includes('meatless-meals') ? 1 : 0,
          target: 1,
          points: 10,
        },
      ],
      weekly: [
        {
          id: 'weekly-commuter',
          claimId: `weekly_${currentWeekStr}_commuter`,
          name: 'Weekly Transit Commuter',
          desc: 'Log walks, cycling, transit commutes 3 or more times in the last 7 days.',
          current: weeklyCommutes,
          target: 3,
          points: 50,
        },
        {
          id: 'weekly-compost',
          claimId: `weekly_${currentWeekStr}_compost`,
          name: 'Composting Habit Builder',
          desc: 'Compost organic scraps 3 or more times in the last 7 days.',
          current: weeklyComposting,
          target: 3,
          points: 40,
        },
      ],
      monthly: [
        {
          id: 'monthly-logger',
          claimId: `monthly_${currentMonthStr}_consistent`,
          name: 'Eco-Habit Consistency Logger',
          desc: 'Log sustainable actions on 10 different days of this month.',
          current: monthlyLoggedDays,
          target: 10,
          points: 100,
        },
        {
          id: 'monthly-saver',
          claimId: `monthly_${currentMonthStr}_saver`,
          name: 'Carbon Saver Champion',
          desc: 'Avoid a total of 30 kg or more CO₂ emissions this month.',
          current: Math.round(monthlySavings),
          target: 30,
          points: 100,
        },
      ],
    };
  }, [dailyLogs, todayStr, currentMonthStr, currentWeekStr]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Eco Goals and Points Card */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Editor Form */}
        <form
          onSubmit={handleSaveGoals}
          className="md:col-span-2 glass-card p-6 border border-white/5 flex flex-col gap-4"
        >
          <div>
            <h3 className="text-white font-bold font-outfit text-sm tracking-wider uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4 text-eco-green" />
              <span>{t('quests.setGoals')}</span>
            </h3>
            <p className="text-[10px] text-eco-muted mt-0.5">
              Set monthly and yearly targets to lower your carbon footprint.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="goals-monthly"
                className="text-[10px] font-bold text-eco-muted uppercase tracking-wider"
              >
                {t('quests.monthlyLabel')}
              </label>
              <input
                id="goals-monthly"
                type="number"
                min="5"
                max="500"
                value={localMonthlyGoal}
                onChange={(e) => setLocalMonthlyGoal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white text-xs font-semibold focus:outline-none transition-all font-outfit"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="goals-yearly"
                className="text-[10px] font-bold text-eco-muted uppercase tracking-wider"
              >
                {t('quests.yearlyLabel')}
              </label>
              <input
                id="goals-yearly"
                type="number"
                min="50"
                max="5000"
                value={localYearlyGoal}
                onChange={(e) => setLocalYearlyGoal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white text-xs font-semibold focus:outline-none transition-all font-outfit"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-eco-green hover:bg-eco-emerald text-white rounded-lg text-xs font-bold font-outfit shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('quests.saveGoals')}</span>
            </button>
          </div>
        </form>

        {/* Eco points status card */}
        <div className="glass-card p-6 border border-white/5 flex flex-col justify-between text-center items-center">
          <div className="w-12 h-12 rounded-full bg-eco-green/10 text-eco-green flex items-center justify-center border border-eco-green/20 mb-2">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-white font-bold font-outfit text-sm leading-none mb-1">
              {t('dashboard.ecoPoints')}
            </h4>
            <p className="text-[10.5px] text-eco-muted leading-relaxed mb-3">
              Unlock achievements and complete challenges to gather points.
            </p>
          </div>
          <div className="text-3xl font-black font-outfit text-white leading-none">
            {ecoPoints}{' '}
            <span className="text-xs text-eco-green font-bold uppercase tracking-wider">pts</span>
          </div>
        </div>
      </div>

      {/* Badges Achievements grid */}
      <div className="flex flex-col gap-5 border-t border-white/5 pt-8">
        <div>
          <h2 className="text-white font-bold font-outfit text-xl mb-1">{t('quests.title')}</h2>
          <p className="text-xs text-eco-muted leading-relaxed">{t('quests.desc')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const unlockDate = unlockedBadges[badge.id];
            const isUnlocked = !!unlockDate;

            return (
              <div
                key={badge.id}
                className={`glass-card p-5.5 border flex flex-col justify-between items-center text-center relative transition-all duration-300 ${
                  isUnlocked
                    ? 'border-eco-green/25 bg-eco-green/5 hover:border-eco-green/45 shadow-md'
                    : 'border-white/5 opacity-55'
                }`}
              >
                {/* Lock icon overlay for locked items */}
                {!isUnlocked && (
                  <div className="absolute top-3 right-3 text-eco-muted/30">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border mb-4 shrink-0 transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-eco-green/15 text-eco-green border-eco-green/20'
                      : 'bg-white/5 text-eco-muted border-white/10'
                  }`}
                >
                  <BadgeIcon name={badge.icon} className="w-7 h-7 stroke-[1.8]" />
                </div>

                <div>
                  <h4 className="text-white font-bold font-outfit text-sm leading-none mb-2">
                    {badge.name}
                  </h4>
                  <p className="text-[10.5px] text-eco-muted leading-relaxed max-w-[180px] mb-3">
                    {badge.desc}
                  </p>
                </div>

                {isUnlocked ? (
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-eco-green flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Unlocked {unlockDate}</span>
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-wider font-bold text-eco-muted">
                    Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Eco-Quests & Challenges section */}
      <div className="flex flex-col gap-6 border-t border-white/5 pt-8">
        <div>
          <h2 className="text-white font-bold font-outfit text-xl mb-1">
            {t('quests.activeQuests')}
          </h2>
          <p className="text-xs text-eco-muted leading-relaxed">{t('quests.activeQuestsDesc')}</p>
        </div>

        {/* Daily Challenges */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold font-outfit text-sm border-b border-white/5 pb-2 uppercase tracking-wider">
            {t('quests.dailyChallenges')}
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {activeChallenges.daily.map((challenge) => {
              const isCompleted = challenge.current >= challenge.target;
              const progressPercent = Math.round((challenge.current / challenge.target) * 100);
              const isClaimed = !!claimedList[challenge.claimId];

              return (
                <div
                  key={challenge.id}
                  className={`glass-card p-5 border flex flex-col justify-between gap-4 relative transition-all duration-300 ${
                    isClaimed
                      ? 'border-eco-green/10 opacity-70 bg-white/2'
                      : isCompleted
                        ? 'border-eco-green/30 bg-eco-green/3'
                        : 'border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-white font-bold font-outfit text-xs mb-1">
                        {challenge.name}
                      </h3>
                      <p className="text-[10px] text-eco-muted leading-relaxed">{challenge.desc}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-eco-green shrink-0 font-bold font-outfit">
                      +{challenge.points} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-eco-muted">Progress</span>
                        <span className="text-white font-bold">
                          {challenge.current} / {challenge.target} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-eco-green' : 'bg-eco-green/60'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimPoints(challenge.claimId, challenge.points)}
                      disabled={!isCompleted || isClaimed}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold font-outfit shrink-0 cursor-pointer transition-all ${
                        isClaimed
                          ? 'bg-white/5 text-eco-muted border border-white/10 cursor-not-allowed'
                          : isCompleted
                            ? 'bg-eco-green hover:bg-eco-emerald text-white shadow-md'
                            : 'bg-white/5 text-eco-muted border border-white/10 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isClaimed ? t('quests.completed') : t('quests.claimPoints')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div className="flex flex-col gap-4 mt-2">
          <h4 className="text-white font-bold font-outfit text-sm border-b border-white/5 pb-2 uppercase tracking-wider">
            {t('quests.weeklyChallenges')}
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {activeChallenges.weekly.map((challenge) => {
              const isCompleted = challenge.current >= challenge.target;
              const progressPercent = Math.round((challenge.current / challenge.target) * 100);
              const isClaimed = !!claimedList[challenge.claimId];

              return (
                <div
                  key={challenge.id}
                  className={`glass-card p-5 border flex flex-col justify-between gap-4 relative transition-all duration-300 ${
                    isClaimed
                      ? 'border-eco-green/10 opacity-70 bg-white/2'
                      : isCompleted
                        ? 'border-eco-green/30 bg-eco-green/3'
                        : 'border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-white font-bold font-outfit text-xs mb-1">
                        {challenge.name}
                      </h3>
                      <p className="text-[10px] text-eco-muted leading-relaxed">{challenge.desc}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-eco-green shrink-0 font-bold font-outfit">
                      +{challenge.points} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-eco-muted">Progress</span>
                        <span className="text-white font-bold">
                          {challenge.current} / {challenge.target} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-eco-green' : 'bg-eco-green/60'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimPoints(challenge.claimId, challenge.points)}
                      disabled={!isCompleted || isClaimed}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold font-outfit shrink-0 cursor-pointer transition-all ${
                        isClaimed
                          ? 'bg-white/5 text-eco-muted border border-white/10 cursor-not-allowed'
                          : isCompleted
                            ? 'bg-eco-green hover:bg-eco-emerald text-white shadow-md'
                            : 'bg-white/5 text-eco-muted border border-white/10 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isClaimed ? t('quests.completed') : t('quests.claimPoints')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Challenges */}
        <div className="flex flex-col gap-4 mt-2">
          <h4 className="text-white font-bold font-outfit text-sm border-b border-white/5 pb-2 uppercase tracking-wider">
            {t('quests.monthlyChallenges')}
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {activeChallenges.monthly.map((challenge) => {
              const isCompleted = challenge.current >= challenge.target;
              const progressPercent = Math.round((challenge.current / challenge.target) * 100);
              const isClaimed = !!claimedList[challenge.claimId];

              return (
                <div
                  key={challenge.id}
                  className={`glass-card p-5 border flex flex-col justify-between gap-4 relative transition-all duration-300 ${
                    isClaimed
                      ? 'border-eco-green/10 opacity-70 bg-white/2'
                      : isCompleted
                        ? 'border-eco-green/30 bg-eco-green/3'
                        : 'border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-white font-bold font-outfit text-xs mb-1">
                        {challenge.name}
                      </h3>
                      <p className="text-[10px] text-eco-muted leading-relaxed">{challenge.desc}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-eco-green shrink-0 font-bold font-outfit">
                      +{challenge.points} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-eco-muted">Progress</span>
                        <span className="text-white font-bold">
                          {challenge.current} / {challenge.target} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-eco-green' : 'bg-eco-green/60'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimPoints(challenge.claimId, challenge.points)}
                      disabled={!isCompleted || isClaimed}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold font-outfit shrink-0 cursor-pointer transition-all ${
                        isClaimed
                          ? 'bg-white/5 text-eco-muted border border-white/10 cursor-not-allowed'
                          : isCompleted
                            ? 'bg-eco-green hover:bg-eco-emerald text-white shadow-md'
                            : 'bg-white/5 text-eco-muted border border-white/10 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isClaimed ? t('quests.completed') : t('quests.claimPoints')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Existing Quests list */}
        <div className="flex flex-col gap-4 mt-2">
          <h4 className="text-white font-bold font-outfit text-sm border-b border-white/5 pb-2 uppercase tracking-wider">
            Adventure Quests
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {quests.map((quest) => {
              const isCompleted = quest.current >= quest.target;
              const progressPercent = Math.round((quest.current / quest.target) * 100);

              return (
                <div
                  key={quest.id}
                  className={`glass-card p-5 border flex flex-col justify-between gap-4 relative transition-all duration-300 ${
                    isCompleted ? 'border-eco-green/30 bg-eco-green/3' : 'border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-white font-bold font-outfit text-xs mb-1">
                        {quest.name}
                      </h3>
                      <p className="text-[10px] text-eco-muted leading-relaxed">{quest.desc}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-eco-muted shrink-0 leading-none">
                      Reward: Badge
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-eco-muted">Progress</span>
                      <span className="text-white font-bold font-outfit">
                        {quest.current} / {quest.target} {quest.unit} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-eco-green' : 'bg-eco-green/60'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
