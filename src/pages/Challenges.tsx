import React from 'react';
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
    default:
      return <Award className={className} />;
  }
};

const Challenges: React.FC = () => {
  const { t } = useLanguage();
  const { badges, quests, unlockedBadges } = useAppState();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Badges Achievements grid */}
      <div className="flex flex-col gap-5">
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
                    ? 'border-eco-green/25 bg-eco-green/5 hover:border-eco-green/45'
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

      {/* Quests active challenges */}
      <div className="flex flex-col gap-5 border-t border-white/5 pt-8">
        <div>
          <h2 className="text-white font-bold font-outfit text-xl mb-1">
            {t('quests.activeQuests')}
          </h2>
          <p className="text-xs text-eco-muted leading-relaxed">{t('quests.activeQuestsDesc')}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {quests.map((quest) => {
            const isCompleted = quest.current >= quest.target;
            const progressPercent = Math.round((quest.current / quest.target) * 100);

            return (
              <div
                key={quest.id}
                className={`glass-card p-6 border flex flex-col justify-between gap-5 relative transition-all duration-300 ${
                  isCompleted ? 'border-eco-green/30 bg-eco-green/3' : 'border-white/5'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-white font-bold font-outfit text-base mb-1">
                      {quest.name}
                    </h3>
                    <p className="text-[11.5px] text-eco-muted leading-relaxed max-w-sm">
                      {quest.desc}
                    </p>
                  </div>
                  <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-eco-muted shrink-0 leading-none">
                    Reward: Badge
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-eco-muted font-medium">Progress</span>
                    <span className="text-white font-bold font-outfit">
                      {quest.current} / {quest.target} {quest.unit} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
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
  );
};

export default Challenges;
