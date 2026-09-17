import React, { useState } from 'react';
import {
  Home,
  Zap,
  BarChart2,
  Terminal,
  Sparkles,
  Compass,
  Timer,
  Clock,
  Flame,
  Layers,
  Calculator,
  Target,
  GraduationCap,
  Newspaper,
  BookOpen,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Bell,
  Coins,
  Cpu,
  Globe,
  Calendar,
} from 'lucide-react';
import { AppNavView, CustomLogoSettings } from '../../types';

interface DesktopSidebarProps {
  activeView: AppNavView;
  onSelectView: (view: AppNavView) => void;
  onOpenNews: () => void;
  onOpenGlossary: () => void;
  onOpenSettings: () => void;
  onOpenPriceAlerts?: () => void;
  activeAlertsCount?: number;
  onLockApp?: () => void;
  walletBalance: number;
  lang: 'my' | 'en';
  logoSettings?: CustomLogoSettings;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeView,
  onSelectView,
  onOpenNews,
  onOpenGlossary,
  onOpenSettings,
  onOpenPriceAlerts,
  activeAlertsCount = 0,
  onLockApp,
  walletBalance,
  lang,
  logoSettings,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const navSections = [
    {
      groupEn: 'WORKSPACE',
      groupMy: 'ပင်မ လုပ်ငန်းခွင်',
      items: [
        {
          id: 'home' as AppNavView,
          labelEn: 'Home',
          labelMy: 'ပင်မစာမျက်နှာ',
          icon: Home,
        },
        {
          id: 'cryptocraft_calendar' as AppNavView,
          labelEn: 'CryptoCraft Calendar',
          labelMy: 'စီးပွားရေးပြက္ခဒိန်',
          icon: Calendar,
          badge: 'LIVE',
          badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
        },
        {
          id: 'cmc' as AppNavView,
          labelEn: 'CMC Intelligence',
          labelMy: 'CoinMarketCap ဗဟို',
          icon: Globe,
          badge: 'FEAR/GREED',
          badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
        {
          id: 'dual_engine' as AppNavView,
          labelEn: 'Decision Terminal',
          labelMy: 'သတ်မှတ်နည်းလမ်း & AI',
          icon: Cpu,
          badge: '3-WAY',
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        },
        {
          id: 'demo' as AppNavView,
          labelEn: 'Trade Center',
          labelMy: 'Futures ကုန်သွယ်မှု',
          icon: Terminal,
          badge: 'DEMO',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
          id: 'binance_live' as AppNavView,
          labelEn: 'Binance In-App Live',
          labelMy: 'Binance တိုက်ရိုက်ကုန်သွယ်',
          icon: Zap,
          badge: 'PORTAL',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          id: 'scanner' as AppNavView,
          labelEn: 'Markets',
          labelMy: 'စျေးကွက်များ',
          icon: BarChart2,
          badge: 'LIVE',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          id: 'spot_advisor' as AppNavView,
          labelEn: 'Spot Advisor',
          labelMy: 'စပေါ့ အကြံပြုချက်',
          icon: Coins,
          badge: 'DCA',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          id: 'long_term' as AppNavView,
          labelEn: 'AI Investment (1M-3Y)',
          labelMy: 'AI ရင်းနှီးမြှုပ်နှံမှု',
          icon: TrendingUp,
          badge: '1M-3Y',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
          id: 'signals_copy' as AppNavView,
          labelEn: 'Easy Signals',
          labelMy: 'အမြန် စစ်ဂနယ်',
          icon: Zap,
          badge: 'FAST',
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        },
        {
          id: 'ai' as AppNavView,
          labelEn: 'AI Assistant',
          labelMy: 'AI လက်ထောက်',
          icon: Sparkles,
          badge: '3-IN-1',
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        },
      ],
    },
    {
      groupEn: 'ANALYSIS & TIMING',
      groupMy: 'သတင်း & အချိန်ကိုက်',
      items: [
        {
          id: 'market_timing' as AppNavView,
          labelEn: 'News & Research',
          labelMy: 'သတင်း & သုတေသန',
          icon: Newspaper,
        },
        {
          id: 'world_clocks' as AppNavView,
          labelEn: 'Global Clocks',
          labelMy: 'ကမ္ဘာ့နာရီများ',
          icon: Clock,
        },
      ],
    },
    {
      groupEn: 'BACKTEST & RISK',
      groupMy: 'စွန့်စားမှု & စည်းမျဉ်း',
      items: [
        {
          id: 'calculator' as AppNavView,
          labelEn: 'Backtest & Journal',
          labelMy: 'အန္တရာယ် & မှတ်တမ်း',
          icon: Calculator,
          badge: 'AUDIT',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
          id: 'wallet_advisor' as AppNavView,
          labelEn: 'Wallet Advisor',
          labelMy: 'Wallet စစ်ဆေးမှု',
          icon: Compass,
        },
        {
          id: 'high_leverage' as AppNavView,
          labelEn: 'High Leverage',
          labelMy: '10x-100x စနစ်',
          icon: Flame,
          badge: 'RISK',
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        },
        {
          id: 'strategy' as AppNavView,
          labelEn: 'Strategy Hub',
          labelMy: 'စတိုင်လ် ၅ မျိုး',
          icon: Layers,
        },
        {
          id: 'tradecard' as AppNavView,
          labelEn: 'Master Trade Card',
          labelMy: 'ပုံတင်ခွဲခြမ်းစိတ်ဖြာ',
          icon: Target,
        },
      ],
    },
    {
      groupEn: 'ACADEMY',
      groupMy: 'လေ့လာရေး & အထောက်အကူ',
      items: [
        {
          id: 'learning' as AppNavView,
          labelEn: 'Crypto Masterclass',
          labelMy: 'သင်ခန်းစာ ၁၄ ခန်း',
          icon: GraduationCap,
        },
      ],
    },
  ];

  return (
    <aside
      id="desktop-pro-sidebar"
      className={`shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header Section - Streamlined with NO duplicate logo */}
      <div>
        <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'my' ? 'မီနူး မာတိကာ' : 'TERMINAL MENU'}
              </span>
            </div>
          )}

          <button
            id="toggle-desktop-sidebar-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-none">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {lang === 'my' ? sec.groupMy : sec.groupEn}
                </div>
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}-btn`}
                    onClick={() => {
                      onSelectView(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group relative ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                    title={lang === 'my' ? item.labelMy : item.labelEn}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400 group-hover:text-amber-500'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">
                        {lang === 'my' ? item.labelMy : item.labelEn}
                      </span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                          isActive
                            ? 'bg-slate-950 text-amber-400 border-slate-950'
                            : item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Active Indicator Dot */}
                    {isCollapsed && isActive && (
                      <span className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-slate-950 dark:bg-slate-950" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Auxiliary Controls & Wallet Summary */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
        {/* Wallet Balance Widget */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span>{lang === 'my' ? 'Futures လက်ကျန်' : 'Futures Wallet'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-sm font-black font-mono text-emerald-500 mt-0.5">
              ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-1" title={`Wallet: $${walletBalance.toFixed(2)} USDT`}>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}

        {/* Auxiliary Quick Action Icons */}
        <div className={`grid ${isCollapsed ? 'grid-cols-1 gap-1' : 'grid-cols-5 gap-1'}`}>
          {onOpenPriceAlerts && (
            <button
              id="sidebar-price-alerts-btn"
              onClick={onOpenPriceAlerts}
              className="relative p-2 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
              title={lang === 'my' ? `စျေးနှုန်း သတိပေးချက်များ (${activeAlertsCount})` : `Price Alerts (${activeAlertsCount})`}
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          )}
          <button
            onClick={onOpenNews}
            className="p-2 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
            title={lang === 'my' ? 'စျေးကွက်သတင်း' : 'Market News'}
          >
            <Newspaper className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenGlossary}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
            title={lang === 'my' ? 'ဝေါဟာရ မာတိကာ' : 'Terms Glossary'}
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
            title={lang === 'my' ? 'စနစ်ချိန်ညှိမှု' : 'Settings'}
          >
            <Settings className="w-4 h-4" />
          </button>
          {onLockApp && (
            <button
              onClick={onLockApp}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
              title={lang === 'my' ? 'PIN ဖြင့် လော့ခ်ချမည်' : 'Lock Terminal'}
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
