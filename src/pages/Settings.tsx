import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useAppState } from '../hooks/useAppState';
import { User, Globe, Sun, Moon, Bell, Save } from 'lucide-react';
import { sanitizeText } from '../utils';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { triggerToast } = useAppState();

  const [name, setName] = useState(user?.name || 'Eco Citizen');
  const [email, setEmail] = useState(user?.email || 'eco@citizen.com');
  const [langVal, setLangVal] = useState<'en' | 'te'>(language);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [weeklyDigests, setWeeklyDigests] = useState(true);
  const [smartReminders, setSmartReminders] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const sanitizedName = sanitizeText(name);
    const sanitizedEmail = sanitizeText(email);
    setName(sanitizedName);
    setEmail(sanitizedEmail);

    // Save language context
    setLanguage(langVal);

    setTimeout(() => {
      setIsSaving(false);
      triggerToast(
        'Settings Saved',
        'Your configurations have been updated successfully.',
        'check'
      );
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-white font-bold font-outfit text-xl mb-1">{t('settings.title')}</h2>
        <p className="text-xs text-eco-muted leading-relaxed">
          Configure your personal details, default application languages, and notification
          schedules.
        </p>
      </div>

      {/* Profile Info block */}
      <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
          <User className="w-5 h-5 text-eco-green" />
          <h3 className="text-white font-bold font-outfit text-sm">{t('settings.profile')}</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-name"
              className="text-[10px] font-semibold text-eco-muted uppercase tracking-wider"
            >
              Full Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white text-xs focus:outline-none transition-all font-outfit"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-email"
              className="text-[10px] font-semibold text-eco-muted uppercase tracking-wider"
            >
              Email Address
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white text-xs focus:outline-none transition-all font-outfit"
              required
            />
          </div>
        </div>
      </div>

      {/* App Preferences block */}
      <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
          <Globe className="w-5 h-5 text-eco-green" />
          <h3 className="text-white font-bold font-outfit text-sm">App Preferences</h3>
        </div>

        <div className="flex flex-col gap-5">
          {/* Language Selector */}
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="text-xs font-semibold text-white">App Language</div>
              <p className="text-[10px] text-eco-muted leading-relaxed mt-0.5">
                Set default text values to English or Telugu.
              </p>
            </div>
            <select
              value={langVal}
              onChange={(e) => setLangVal(e.target.value as 'en' | 'te')}
              className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none transition-all font-outfit cursor-pointer"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          {/* Theme Mode selector */}
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="text-xs font-semibold text-white">{t('settings.theme')}</div>
              <p className="text-[10px] text-eco-muted leading-relaxed mt-0.5">
                Choose between dark and high-contrast light styling templates.
              </p>
            </div>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  themeMode === 'dark'
                    ? 'bg-eco-green text-white shadow'
                    : 'text-eco-muted hover:text-white'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  themeMode === 'light'
                    ? 'bg-eco-green text-white shadow'
                    : 'text-eco-muted hover:text-white'
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications configuration */}
      <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
          <Bell className="w-5 h-5 text-eco-green" />
          <h3 className="text-white font-bold font-outfit text-sm">
            {t('settings.notifications')}
          </h3>
        </div>

        <div className="flex flex-col gap-4.5">
          <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
            <div>
              <div className="text-xs font-semibold text-white">{t('settings.weeklyDigests')}</div>
              <p className="text-[10px] text-eco-muted leading-relaxed mt-0.5">
                Receive weekly statistics summary digests and eco tip logs.
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={weeklyDigests}
                onChange={() => setWeeklyDigests(!weeklyDigests)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-eco-muted peer-checked:after:bg-white after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-eco-green"></div>
            </div>
          </label>

          <div className="w-full h-px bg-white/5"></div>

          <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
            <div>
              <div className="text-xs font-semibold text-white">{t('settings.ecoReminders')}</div>
              <p className="text-[10px] text-eco-muted leading-relaxed mt-0.5">
                Get push notifications to log daily habits and maintain your streak.
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={smartReminders}
                onChange={() => setSmartReminders(!smartReminders)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-eco-muted peer-checked:after:bg-white after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-eco-green"></div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-eco-green hover:bg-eco-emerald disabled:bg-eco-green/50 text-white rounded-xl text-xs font-bold font-outfit shadow-lg shadow-eco-green/10 transition-all flex items-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t('settings.save')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default Settings;
