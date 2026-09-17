import React, { useState, useEffect } from 'react';
import {
  Menu,
  Activity,
  RefreshCw,
  Globe,
  Zap,
  Clock,
  ShieldCheck,
  BarChart2,
  Newspaper,
  Flame,
  Lock,
  Sun,
  Moon,
  Home,
  Layers,
  Calculator,
  Target,
  GraduationCap,
  DollarSign,
  Sparkles,
  Settings,
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  TrendingUp,
  Search,
  Bell,
  User,
  Cpu,
} from 'lucide-react';
import { DualTime, getDualTime, formatTimeAgo } from '../utils/time';
import {
  LiveTickerItem,
  CoinOpportunity,
  AppNavView,
  DeviceLayoutOption,
  DeviceLayoutSelection,
  CustomLogoSettings,
  LiveFearAndGreedData,
} from '../types';
import { MarketSentimentGauge } from './MarketSentimentGauge';
import { DeviceLayoutSwitcher } from './layout/DeviceLayoutSwitcher';

interface HeaderProps {
  lang: 'my' | 'en';
  setLang: (l: 'my' | 'en') => void;
  onRefresh: () => void;
  onOpenGlossary: () => void;
  onOpenNews: () => void;
  onOpenMenu: () => void;
  onLockApp?: () => void;
  isLoading: boolean;
  lastScannedTime: DualTime;
  activeView: AppNavView;
  onSelectView: (view: AppNavView) => void;
  liveTickers?: LiveTickerItem[];
  coins?: CoinOpportunity[];
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  scanMode?: 'manual' | 'auto';
  onToggleScanMode?: (mode: 'manual' | 'auto') => void;
  autoIntervalSec?: number;
  onSetAutoIntervalSec?: (sec: number) => void;
  onOpenSettings?: () => void;
  onOpenBranding?: () => void;
  onBackToHome?: () => void;
  logoSettings?: CustomLogoSettings;
  currentLayoutSelection?: DeviceLayoutSelection;
  activeLayout?: DeviceLayoutOption;
  onSelectLayout?: (selection: DeviceLayoutSelection) => void;
  activeAlertsCount?: number;
  onOpenPriceAlerts?: () => void;
  fearAndGreed?: LiveFearAndGreedData | null;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  onRefresh,
  onOpenGlossary,
  onOpenNews,
  onOpenMenu,
  onLockApp,
  isLoading,
  lastScannedTime,
  activeView,
  onSelectView,
  liveTickers = [],
  coins = [],
  theme = 'dark',
  toggleTheme,
  scanMode = 'manual',
  onToggleScanMode,
  autoIntervalSec = 60,
  onSetAutoIntervalSec,
  onOpenSettings,
  onOpenBranding,
  onBackToHome,
  logoSettings,
  currentLayoutSelection = 'auto',
  activeLayout = 'desktop',
  onSelectLayout,
  activeAlertsCount = 0,
  onOpenPriceAlerts,
  fearAndGreed,
}) => {
  // Live ticking clock (ticks every 1 second)
  const [currentTime, setCurrentTime] = useState<DualTime>(getDualTime());
  const [timeAgoText, setTimeAgoText] = useState<string>('ယခုလေးတင်');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = getDualTime();
      setCurrentTime(now);
      setTimeAgoText(formatTimeAgo(lastScannedTime.timestamp, lang));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastScannedTime.timestamp, lang]);

  // Simplified, elegant primary view switcher for the header to avoid crowded redundant tabs
  const primaryNavButtons = [
    { id: 'home' as AppNavView, labelMy: 'ပင်မ', labelEn: 'Overview', icon: Home },
    { id: 'dual_engine' as AppNavView, labelMy: '⚡ သတ်မှတ်နည်းလမ်း & AI', labelEn: '⚡ Strategy Terminal', icon: Cpu },
    { id: 'long_term' as AppNavView, labelMy: '💎 ရေရှည် (Long-Term)', labelEn: '💎 Long-Term', icon: TrendingUp },
    { id: 'signals_copy' as AppNavView, labelMy: '⚡ Easy Signals', labelEn: '⚡ Easy Signals', icon: Zap },
    { id: 'ai' as AppNavView, labelMy: '🧠 AI Assistant', labelEn: '🧠 AI Assistant', icon: Sparkles },
    { id: 'learning' as AppNavView, labelMy: 'Crypto သင်ယူမှု', labelEn: 'Crypto School', icon: GraduationCap },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 shadow-xs w-full max-w-full overflow-hidden">
      {/* Top Ticker & Dual Timezone Bar - Streamlined, single-line horizontal scroller */}
      <div className="bg-slate-950 text-slate-300 px-2.5 sm:px-4 py-1.5 border-b border-slate-800 text-[10px] sm:text-[11px] font-mono flex items-center justify-between gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        {/* Live Status & Both Timezones - Fluid and seamlessly aligned */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>LIVE</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* Myanmar Time */}
          <div className="flex items-center gap-1">
            <span className="text-amber-400 font-bold">🇲🇲 MMT:</span>
            <span className="text-white font-bold">{currentTime.mmtTime}</span>
            <span className="text-slate-500 hidden md:inline">({currentTime.mmtDate})</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* US Eastern Time */}
          <div className="flex items-center gap-1">
            <span className="text-indigo-400 font-bold">🇺🇸 US:</span>
            <span className="text-white font-bold">{currentTime.usTime}</span>
            <span className="text-slate-500 hidden md:inline">({currentTime.usDate})</span>
          </div>
        </div>

        {/* Verification Status, Last Refresh Info & User Control Mode Badge */}
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] sm:text-[11px] shrink-0">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>
            {lang === 'my' ? 'စစ်ဆေး:' : 'Scan:'}{' '}
            <strong className="text-slate-200 font-mono">
              {lastScannedTime.mmtTime}
            </strong>{' '}
            <span className="text-emerald-400 hidden sm:inline">({timeAgoText})</span>
          </span>

          <span className="text-slate-600 hidden sm:inline">•</span>

          {/* Interactive Scan Mode Switcher: Auto & Manual Toggle (User Request) */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-700/80 text-[10px] font-bold">
            {/* Manual (ကိုယ်တိုင်) Button */}
            <button
              id="top-scan-manual-btn"
              type="button"
              onClick={() => {
                if (onToggleScanMode) onToggleScanMode('manual');
                onRefresh();
              }}
              title={lang === 'my' ? 'ကိုယ်တိုင် ချက်ချင်း စစ်ဆေးမည် (Manual Scan)' : 'Manual Scan Now'}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer active:scale-95 ${
                scanMode === 'manual'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>✋</span>
              <span>{lang === 'my' ? 'ကိုယ်တိုင်' : 'Manual'}</span>
              {isLoading && scanMode === 'manual' && (
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-slate-950" />
              )}
            </button>

            {/* Auto (အော်တို) Button */}
            <button
              id="top-scan-auto-btn"
              type="button"
              onClick={() => {
                if (onToggleScanMode) onToggleScanMode('auto');
              }}
              title={lang === 'my' ? `စက္ကန့် ${autoIntervalSec} တိုင်း အလိုအလျောက် စစ်ဆေးမည် (Auto Scan)` : `Auto scan every ${autoIntervalSec}s`}
              className={`px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer active:scale-95 ${
                scanMode === 'auto'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={scanMode === 'auto' ? 'animate-pulse' : ''}>⚡</span>
              <span>{lang === 'my' ? `အော်တို (${autoIntervalSec}s)` : `Auto (${autoIntervalSec}s)`}</span>
              {isLoading && scanMode === 'auto' && (
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-slate-950" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Single Line, NO awkward multi-row wrapping */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 min-w-0">
        {/* Left: Hamburger Menu Button + Custom Logo + Brand & Back navigation */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {/* HAMBURGER MENU BUTTON */}
          <button
            id="open-hamburger-menu-btn"
            onClick={onOpenMenu}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs shrink-0 group"
            title={lang === 'my' ? 'မီနူး ဖွင့်မည် (Menu)' : 'Open Navigation Menu'}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 dark:text-slate-200 group-hover:scale-110 transition-transform" />
          </button>

          {/* Integrated Clean Back Button when viewing subpages */}
          {activeView !== 'home' && (
            <button
              onClick={() => {
                if (onBackToHome) {
                  onBackToHome();
                } else {
                  onSelectView('home');
                }
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer shrink-0"
              title={lang === 'my' ? 'ပင်မ စျေးကွက်သို့ ပြန်သွားမည်' : 'Back to Market Overview'}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'ပင်မသို့' : 'Back'}</span>
            </button>
          )}

          {/* Logo Container (Single authoritative brand logo) */}
          {logoSettings?.customLogoUrl ? (
            <div className="shrink-0 flex items-center">
              <img
                src={logoSettings.customLogoUrl}
                alt="Terminal Logo"
                style={{ height: `${logoSettings.logoHeight || 34}px` }}
                className={`object-contain max-w-[130px] shadow-xs ${
                  logoSettings.shape === 'circle'
                    ? 'rounded-full'
                    : logoSettings.shape === 'pill'
                    ? 'rounded-2xl'
                    : logoSettings.shape === 'rounded'
                    ? 'rounded-xl'
                    : 'rounded-none'
                }`}
              />
            </div>
          ) : (
            <div
              className={`bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm shrink-0 ${
                logoSettings?.shape === 'circle'
                  ? 'rounded-full'
                  : logoSettings?.shape === 'pill'
                  ? 'rounded-2xl'
                  : logoSettings?.shape === 'rounded'
                  ? 'rounded-xl'
                  : 'rounded-none'
              }`}
              style={{
                width: `${logoSettings?.logoHeight || 34}px`,
                height: `${logoSettings?.logoHeight || 34}px`,
              }}
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
          )}

          {/* Brand Title and Subtitle */}
          {(logoSettings?.showText ?? true) && (
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                  {logoSettings?.logoText || 'Trade by KA'}
                </h1>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:block truncate">
                Smarter Trade · Bigger Opportunities
              </p>
            </div>
          )}
        </div>

        {/* Center: Search bar matching layout */}
        <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm mx-3">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === 'my' ? 'ရှာဖွေရန် (Coin, Pair)...' : 'Search coin, pair...'}
              className="w-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition shadow-inner"
            />
          </div>
        </div>

        {/* Right: Controls & Layout Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 justify-end shrink-0">
          {/* Quick Tabs: Primary View Switcher (Desktop XL only) */}
          {activeLayout !== 'phone' && (
            <div className="hidden 2xl:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl items-center gap-1 border border-slate-200 dark:border-slate-700">
              {primaryNavButtons.map((btn) => {
                const Icon = btn.icon;
                const isActive = activeView === btn.id;
                return (
                  <button
                    key={btn.id}
                    id={`header-nav-${btn.id}-btn`}
                    onClick={() => onSelectView(btn.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-amber-500 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{lang === 'my' ? btn.labelMy : btn.labelEn}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3 Device Layout Options Switcher: Visible on ALL screens (Compact on mobile, full on desktop) */}
          {onSelectLayout && (
            <div className="shrink-0">
              <div className="sm:hidden">
                <DeviceLayoutSwitcher
                  currentSelection={currentLayoutSelection}
                  activeLayout={activeLayout}
                  onSelectLayout={onSelectLayout}
                  lang={lang}
                  compact={true}
                />
              </div>
              <div className="hidden sm:block">
                <DeviceLayoutSwitcher
                  currentSelection={currentLayoutSelection}
                  activeLayout={activeLayout}
                  onSelectLayout={onSelectLayout}
                  lang={lang}
                  compact={false}
                />
              </div>
            </div>
          )}

          {/* Live / Demo Mode Switcher pill */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0">
            <button
              onClick={() => onSelectView('home')}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer text-[11px] ${
                activeView !== 'demo'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeView !== 'demo' ? 'bg-slate-950 animate-pulse' : 'bg-emerald-500'}`} />
              <span>Live</span>
            </button>
            <button
              onClick={() => onSelectView('demo')}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer text-[11px] ${
                activeView === 'demo'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <span>Demo</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Top 5 Market Sentiment Compact Gauge in Header */}
            <div className="hidden lg:block shrink-0">
              <MarketSentimentGauge tickers={liveTickers} coins={coins} lang={lang} fearAndGreed={fearAndGreed} />
            </div>

            {/* Price Alert Bell */}
            <button
              id="header-price-alert-btn"
              onClick={onOpenPriceAlerts || onOpenNews}
              className="relative p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer group shrink-0"
              title={
                lang === 'my'
                  ? `စျေးနှုန်း သတိပေးချက်များ (${activeAlertsCount})`
                  : `Live Price Alerts (${activeAlertsCount} active)`
              }
              aria-label="Price Alerts"
            >
              <Bell
                className={`w-3.5 h-3.5 transition-transform ${
                  activeAlertsCount > 0 ? 'text-amber-500 group-hover:rotate-12' : ''
                }`}
              />
              {activeAlertsCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
                  {activeAlertsCount > 9 ? '9+' : activeAlertsCount}
                </span>
              ) : null}
            </button>

            {/* CURATED NEWS BUTTON (Hidden on very small screens, present in hamburger menu) */}
            <button
              id="market-news-btn"
              onClick={onOpenNews}
              className="hidden md:flex px-2 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition items-center gap-1 cursor-pointer shadow-xs shrink-0"
              title="Crypto Market News (သတင်း အနှစ်ချုပ်)"
            >
              <Newspaper className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">{lang === 'my' ? 'သတင်း' : 'News'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            </button>

            {/* Language Toggle */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLang(lang === 'my' ? 'en' : 'my')}
              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'my' ? '🇲🇲' : '🇺🇸'}</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            {toggleTheme && (
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>
            )}

            {/* Settings Center Modal Button */}
            {onOpenSettings && (
              <button
                id="header-settings-btn"
                onClick={onOpenSettings}
                className="hidden sm:flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
                title={lang === 'my' ? 'စနစ်ချိန်ညှိမှု ဗဟို (Settings)' : 'Settings Center'}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Scan Live Market Button */}
            <button
              id="refresh-market-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-sm shadow-amber-500/20 shrink-0"
              title={
                lang === 'my'
                  ? 'စျေးကွက်ဒေတာကို ယခုချက်ချင်း စစ်ဆေးမည်'
                  : 'Rescan and verify current market data right now'
              }
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isLoading
                  ? lang === 'my'
                    ? '...'
                    : 'Scanning...'
                  : lang === 'my'
                  ? 'စစ်မည်'
                  : 'Scan'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Crypto & Market Strip matching design in image */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-1.5 overflow-x-auto scrollbar-none text-xs font-mono flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-bold text-white">BTC</span>
            <span className="text-slate-300">$67,452.32</span>
            <span className="text-emerald-400 font-bold">+3.60%</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="font-bold text-white">ETH</span>
            <span className="text-slate-300">$3,248.17</span>
            <span className="text-emerald-400 font-bold">+2.85%</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="font-bold text-white">SOL</span>
            <span className="text-slate-300">$152.76</span>
            <span className="text-emerald-400 font-bold">+4.21%</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="font-bold text-white">BNB</span>
            <span className="text-slate-300">$586.32</span>
            <span className="text-emerald-400 font-bold">+1.42%</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold text-white">XRP</span>
            <span className="text-slate-300">$0.5231</span>
            <span className="text-emerald-400 font-bold">+1.87%</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-slate-400 border-l border-slate-800 pl-4">
            <span>Total Market Cap:</span>
            <span className="text-white font-bold">$2.41T</span>
            <span className="text-emerald-400 font-bold">+2.36%</span>
          </div>
        </div>

        {/* Live sync indicator */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME STREAM</span>
        </div>
      </div>
    </header>
  );
};

