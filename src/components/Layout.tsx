import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppState } from '../context/AppStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  LayoutDashboard,
  Calculator,
  CheckSquare,
  Award,
  MessageSquare,
  TrendingUp,
  Settings,
  Flame,
  LogOut,
  Globe,
  Menu,
  X,
  Bell,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { streak, toasts, dismissToast } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.calculator'), path: '/calculator', icon: Calculator },
    { name: t('nav.tracker'), path: '/tracker', icon: CheckSquare },
    { name: t('nav.quests'), path: '/quests', icon: Award },
    { name: t('nav.assistant'), path: '/assistant', icon: MessageSquare },
    { name: t('nav.analytics'), path: '/analytics', icon: TrendingUp },
    { name: t('nav.settings'), path: '/settings', icon: Settings },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  return (
    <div className="min-h-screen bg-[#050c09] text-eco-text flex flex-col md:flex-row relative">
      {/* Ambient background glows */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-eco-forest/40 backdrop-blur-md border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-eco-green/10 rounded-lg">
            <Leaf className="w-6 h-6 text-eco-green" />
          </div>
          <span className="font-outfit font-bold text-lg tracking-wider text-white">EcoTrace</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 text-eco-muted hover:text-white"
            title="Switch Language"
            aria-label={`Switch language to ${language === 'en' ? 'Telugu' : 'English'}`}
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-white/5 rounded-lg border border-white/10 text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-4/5 max-w-xs h-full bg-[#050c09]/95 border-r border-white/10 flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-eco-green/10 rounded-lg">
                      <Leaf className="w-6 h-6 text-eco-green" />
                    </div>
                    <span className="font-outfit font-bold text-xl tracking-wider text-white">EcoTrace</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-outfit ${
                          isActive
                            ? 'bg-eco-green text-white font-medium shadow-md shadow-eco-green/20'
                            : 'hover:bg-white/5 text-eco-muted hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-eco-forest/35 border border-white/5 rounded-xl">
                  <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                  <div>
                    <div className="text-white font-bold font-outfit">{streak} {t('settings.save')}</div>
                    <div className="text-xs text-eco-muted">Day Streak</div>
                  </div>
                </div>

                <button
                  onClick={signOut}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl transition-all font-outfit"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-eco-forest/20 backdrop-blur-xl border-r border-white/5 flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-eco-green/10 rounded-xl">
              <Leaf className="w-7 h-7 text-eco-green" />
            </div>
            <div>
              <h1 className="font-outfit font-extrabold text-xl tracking-wider text-white">EcoTrace</h1>
              <span className="text-[10px] uppercase tracking-widest text-eco-green font-bold">Carbon Compass</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5" aria-label="Desktop Sidebar Navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3.5 w-full px-4.5 py-3 rounded-xl transition-all duration-300 font-outfit ${
                    isActive
                      ? 'bg-eco-green text-white font-semibold shadow-lg shadow-eco-green/15'
                      : 'hover:bg-white/5 text-eco-muted hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-eco-forest/40 border border-white/5 rounded-xl">
            <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
            <div>
              <div className="text-white font-bold text-lg font-outfit leading-none">{streak}</div>
              <div className="text-[11px] text-eco-muted font-medium mt-1">Day Streak</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-eco-green/20 flex items-center justify-center font-bold text-sm text-eco-green border border-eco-green/30">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-white font-medium text-xs font-outfit truncate w-28">{user?.name || 'User'}</div>
                <div className="text-[10px] text-eco-muted truncate w-28">{user?.email || ''}</div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-eco-muted hover:text-red-400 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4.5 bg-eco-forest/10 backdrop-blur-md border-b border-white/5 sticky top-0 z-10">
          <div>
            <h2 className="text-white font-bold text-lg font-outfit">{t('header.greeting')}</h2>
            <p className="text-xs text-eco-muted">
              {new Date().toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              aria-label={`Switch language to ${language === 'en' ? 'Telugu' : 'English'}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 text-eco-muted hover:text-white transition-all text-xs font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Telugu' : 'English'}</span>
            </button>

            <button
              aria-label="View notifications"
              className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 text-eco-muted hover:text-white transition-all relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-eco-green rounded-full"></span>
            </button>

            <div className="w-px h-6 bg-white/10"></div>

            <button
              onClick={() => navigate('/tracker')}
              className="flex items-center gap-2 px-4 py-2 bg-eco-green hover:bg-eco-emerald text-white rounded-lg transition-all font-outfit text-xs font-semibold shadow-md shadow-eco-green/10"
            >
              <span>{t('header.quickLog')}</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      {/* Real-time Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="glass-card p-4 border border-eco-green/30 flex gap-4 items-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-eco-green"></div>
              <div className="w-10 h-10 rounded-full bg-eco-green/15 flex items-center justify-center shrink-0 border border-eco-green/20">
                <Award className="w-6 h-6 text-eco-green" />
              </div>
              <div className="flex-1">
                <h4 className="font-outfit font-bold text-white leading-none">{toast.title}</h4>
                <p className="text-xs text-eco-muted mt-1 leading-tight">{toast.desc}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 hover:bg-white/10 rounded-lg text-eco-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;
