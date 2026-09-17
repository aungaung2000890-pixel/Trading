import React from 'react';
import {
  Home,
  Zap,
  BarChart2,
  Terminal,
  Sparkles,
  Menu,
  ShieldCheck,
  Compass,
  TrendingUp,
} from 'lucide-react';
import { AppNavView } from '../../types';

interface MobileBottomNavProps {
  activeView: AppNavView;
  onSelectView: (view: AppNavView) => void;
  onOpenMenu: () => void;
  lang: 'my' | 'en';
  contained?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onSelectView,
  onOpenMenu,
  lang,
  contained = false,
}) => {
  const navItems = [
    {
      id: 'home' as AppNavView,
      labelEn: 'Home',
      labelMy: 'ပင်မ',
      icon: Home,
    },
    {
      id: 'long_term' as AppNavView,
      labelEn: 'Long-Term',
      labelMy: 'ရေရှည်',
      icon: TrendingUp,
    },
    {
      id: 'signals_copy' as AppNavView,
      labelEn: 'Signals',
      labelMy: 'စစ်ဂနယ်',
      icon: Zap,
    },
    {
      id: 'demo' as AppNavView,
      labelEn: 'Terminal',
      labelMy: 'ဒေမို',
      icon: Terminal,
    },
    {
      id: 'ai' as AppNavView,
      labelEn: 'AI Bot',
      labelMy: 'AI',
      icon: Sparkles,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className={`${
        contained ? 'sticky bottom-0 w-full' : 'fixed bottom-0 left-0 right-0'
      } z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] ${
        contained ? 'pb-2.5 pt-1.5 px-2' : 'pb-[env(safe-area-inset-bottom,8px)] pt-1.5 px-2'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}-btn`}
              onClick={() => {
                onSelectView(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative min-h-[44px] active:scale-95 ${
                isActive
                  ? 'text-amber-500 dark:text-amber-400 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-amber-500 animate-pulse" />
              )}
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-amber-500/15 scale-110' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none whitespace-nowrap">
                {lang === 'my' ? item.labelMy : item.labelEn}
              </span>
            </button>
          );
        })}

        {/* Menu Drawer Opener */}
        <button
          id="mobile-nav-menu-btn"
          onClick={onOpenMenu}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95"
          aria-label="More Features"
        >
          <div className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 leading-none whitespace-nowrap">
            {lang === 'my' ? 'မီနူး' : 'More'}
          </span>
        </button>
      </div>
    </nav>
  );
};
