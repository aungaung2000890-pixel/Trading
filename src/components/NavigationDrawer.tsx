import React from 'react';
import {
  X,
  Home,
  Layers,
  Calculator,
  BarChart2,
  Target,
  Zap,
  Newspaper,
  BookOpen,
  Lock,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  Flame,
  Activity,
  Compass,
  GraduationCap,
  DollarSign,
  Sparkles,
  Copy,
  Timer,
  Clock,
  Settings,
  TrendingUp,
  Bell,
  Coins,
  Cpu,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { AppNavView, DeviceLayoutOption, DeviceLayoutSelection } from '../types';
import { DeviceLayoutSwitcher } from './layout/DeviceLayoutSwitcher';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: AppNavView;
  onSelectView: (view: AppNavView) => void;
  onOpenNews: () => void;
  onOpenGlossary: () => void;
  onLockApp?: () => void;
  onOpenSettings?: () => void;
  onOpenPriceAlerts?: () => void;
  activeAlertsCount?: number;
  lang: 'my' | 'en';
  setLang: (l: 'my' | 'en') => void;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  currentLayoutSelection?: DeviceLayoutSelection;
  activeLayout?: DeviceLayoutOption;
  onSelectLayout?: (selection: DeviceLayoutSelection) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  onOpenNews,
  onOpenGlossary,
  onLockApp,
  onOpenSettings,
  onOpenPriceAlerts,
  activeAlertsCount = 0,
  lang,
  setLang,
  theme = 'dark',
  toggleTheme,
  currentLayoutSelection = 'auto',
  activeLayout = 'desktop',
  onSelectLayout,
}) => {
  if (!isOpen) return null;

  const handleNavClick = (view: AppNavView) => {
    onSelectView(view);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      id: 'home' as AppNavView,
      titleEn: 'Main Overview (Home)',
      titleMy: 'ပင်မ စာမျက်နှာ (အနှစ်ချုပ်)',
      descEn: 'Macro status, #1 Best Coin, and Top 5 curated setups',
      descMy: 'စျေးကွက်အခြေအနေ၊ အကောင်းဆုံး Coin နှင့် Top 5 ပစ်မှတ်များ',
      icon: Home,
      badge: 'CORE',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      activeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'cryptocraft_calendar' as AppNavView,
      titleEn: 'CryptoCraft Economic Calendar',
      titleMy: '📅 စီးပွားရေးနှင့် Crypto ပြက္ခဒိန် (CryptoCraft)',
      descEn: 'Real-time Wall Street & crypto catalysts: CPI, FOMC, Rate decisions & major token unlocks',
      descMy: 'CryptoCraft.com စတိုင် မက်ခရို စီးပွားရေးသတင်းများ၊ အတိုးနှုန်းကြေညာချက်နှင့် Token သော့ဖွင့်မှု အပြည့်အစုံ',
      icon: Calendar,
      badge: 'LIVE SYNC',
      badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
      activeColor: 'bg-red-600 text-white font-black',
    },
    {
      id: 'cmc' as AppNavView,
      titleEn: 'CoinMarketCap Intelligence Hub',
      titleMy: 'CoinMarketCap စျေးကွက်ဗဟို & Fear/Greed',
      descEn: 'Global vs Top 5 Fear & Greed comparison, ETF flows, chain rankings, treasuries & derivatives',
      descMy: 'ကမ္ဘာ့စျေးကွက် vs Top 5 Fear & Greed နှိုင်းယှဉ်ချက်၊ ETF စီးဆင်းမှု၊ Chain TVL နှင့် အဖွဲ့အစည်းပိုင်ဆိုင်မှုများ',
      icon: Globe,
      badge: 'CMC LIVE',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      activeColor: 'bg-blue-600 text-white font-black',
    },
    {
      id: 'dual_engine' as AppNavView,
      titleEn: 'Strategy & AI Decision Terminal',
      titleMy: '⚡ သတ်မှတ်နည်းလမ်း & AI စိစစ်ချက် စနစ်',
      descEn: '3-way analysis: Technical Crypto Intelligence, Established Rules & Balanced Consensus',
      descMy: 'နည်းပညာနှင့် ခရစ်ပတို အသိပညာ၊ သတ်မှတ်စည်းမျဉ်းများနှင့် ပေါင်းစပ်ဆုံးဖြတ်ချက် သုံးခု ခွဲခြမ်းစိတ်ဖြာမှု',
      icon: Cpu,
      badge: '3-WAY AI',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      activeColor: 'bg-purple-600 text-white font-black',
    },
    {
      id: 'spot_advisor' as AppNavView,
      titleEn: 'Spot Trading Advisor',
      titleMy: '💎 စပေါ့ အရောင်းအဝယ် & စုဆောင်းမှု အကြံပေး',
      descEn: 'Wyckoff accumulation zones, 3-tier DCA ladder, take-profit stages & portfolio allocation',
      descMy: 'အကောင်းဆုံး နည်းပညာနှင့် အသိပညာပေါင်းစပ်ထားသော စပေါ့ DCA အဝယ်ဇုန်နှင့် အမြတ်ထုတ်ယူမှု စနစ်',
      icon: Coins,
      badge: 'SPOT DCA',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      activeColor: 'bg-emerald-600 text-white font-black',
    },
    {
      id: 'long_term' as AppNavView,
      titleEn: 'Long-Term Investment Hub (1M - 3Y)',
      titleMy: '💎 ရေရှည် ရင်းနှီးမြှုပ်နှံမှု အကြံပေး (၁ လ မှ ၃ နှစ်)',
      descEn: 'AI institutional analysis: 1M, 3M, 6M, 1Y, 3Y probability returns & asset allocation',
      descMy: 'ငွေပမာဏ ထည့်ရုံဖြင့် AI က Macro၊ TA၊ FA၊ On-Chain စစ်ဆေးပြီး အလားအလာအမြင့်ဆုံး Asset များနှင့် Scenario များ တွက်ချက်ပေးသည်',
      icon: TrendingUp,
      badge: 'PRO WEALTH',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      activeColor: 'bg-amber-500 text-slate-950 font-black',
    },
    {
      id: 'wallet_advisor' as AppNavView,
      titleEn: 'Futures Wallet Risk Advisor',
      titleMy: 'Futures Wallet Risk & Strategy အကြံပေး',
      descEn: 'Dual-Track Audit (AI Tech vs My Rules), Trade Count & Sizing, Style Recommendations',
      descMy: 'Wallet အလိုက် နည်းပညာ vs ငါ့စည်းမျဉ်း ၂ ပိုင်းခွဲစိစစ်မှု၊ Trade အရေအတွက်နှင့် အကြံပြုချက်များ',
      icon: Compass,
      badge: 'WALLET RISK',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      activeColor: 'bg-amber-500 text-slate-950 font-black',
    },
    {
      id: 'market_timing' as AppNavView,
      titleEn: 'Market Timing & News Engine',
      titleMy: 'စျေးကွက် အချိန်ကိုက် & သတင်းစနစ်',
      descEn: 'PRIME / CAUTION / AVOID / WAIT status, session overlaps & economic countdown',
      descMy: 'ကုန်သွယ်ရန် အကောင်းဆုံးအချိန်၊ စက်ရှင်ထပ်တူကျမှုနှင့် သတင်းသတိပေးချက်',
      icon: Timer,
      badge: 'TIMING',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      activeColor: 'bg-emerald-600 text-white font-black',
    },
    {
      id: 'world_clocks' as AppNavView,
      titleEn: 'Global World Market Clocks',
      titleMy: 'ကမ္ဘာ့စျေးကွက် နာရီများ (ပင်မနှင့် ပေါင်းစပ်ထားသည်)',
      descEn: 'Integrated in Home: Live analog clocks for Yangon, NY, London, Tokyo, Singapore, Dubai',
      descMy: 'ပင်မစာမျက်နှာတွင် တိုက်ရိုက် ကြည့်ရှုနိုင်သော ကမ္ဘာ့နာရီလက်တံများနှင့် စျေးကွက်စက်ရှင်များ',
      icon: Clock,
      badge: 'ON HOME',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      activeColor: 'bg-cyan-600 text-white font-black',
    },
    {
      id: 'high_leverage' as AppNavView,
      titleEn: 'High-Leverage Trading Mode',
      titleMy: 'High-Leverage စွန့်စားမှု ထိန်းချုပ်မုဒ်',
      descEn: '10x-100x Leverage risk audit, liquidation distance & maximum dollar loss protection',
      descMy: 'Leverage မြင့်မားစွာ သုံးသော်လည်း အကောင့်ဆုံးရှုံးနိုင်ခြေ ၂% အောက်တွင် ထိန်းချုပ်သော စနစ်',
      icon: Flame,
      badge: '10x-100x',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      activeColor: 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black',
    },
    {
      id: 'ai' as AppNavView,
      titleEn: 'AI Trading Assistant (3 Modes)',
      titleMy: 'AI ကုန်သွယ်မှု လက်ထောက် (Mode ၃ မျိုး)',
      descEn: '⚡ Quick Trade • 🧠 Deep Analysis (24 Points) • 💬 Ask AI Q&A',
      descMy: 'အမြန်ဆုံးဖြတ်ချက်၊ ၂၄ ချက်ပြည့် အဆင့်မြင့်စစ်ဆေးမှု နှင့် အမေးအဖြေ',
      icon: Sparkles,
      badge: '3 AI MODES',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      activeColor: 'bg-amber-500 text-slate-950 font-black',
    },
    {
      id: 'signals_copy' as AppNavView,
      titleEn: '⚡ Easy Signals Copy Mode',
      titleMy: '⚡ အမြန် စစ်ဂနယ် ကော်ပီမုဒ် (Easy Copy)',
      descEn: 'Instant signals for Binance • 5 styles • Dual-Track (AI vs My Rules) • PnL & 1-Click copy',
      descMy: 'Binance သို့ တိုက်ရိုက်ကူးယူရန် Signal သီးသန့်စနစ် • Trade နည်းအားလုံးစုစည်းမှု • အရှုံး/အမြတ်တွက်ချက်မှု',
      icon: Copy,
      badge: 'EASY COPY',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      activeColor: 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-black',
    },
    {
      id: 'learning' as AppNavView,
      titleEn: 'Crypto Learning Center',
      titleMy: 'Crypto သင်ယူမှု ဗဟိုဌာန (Learning Center)',
      descEn: 'From beginner to advanced trader with 14 visual modules & simulator',
      descMy: 'အခြေခံမှစ၍ အဆင့်မြင့် ကုန်သွယ်မှုအထိ မာတိကာ ၁၄ ခန်းနှင့် လေ့ကျင့်ရေးစနစ်',
      icon: GraduationCap,
      badge: 'CRYPTO MASTERCLASS',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      activeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'strategy' as AppNavView,
      titleEn: 'Strategy Hub (5 Styles)',
      titleMy: 'ကုန်သွယ်မှု စတိုင်လ်များ (Strategy Hub)',
      descEn: 'Scalping, Day, Swing, Position & Long-Term (Dual-Track + Trade Card)',
      descMy: 'Scalping မှ Long-Term အထိ မိမိသတ်မှတ်ချက် vs နည်းပညာအကြံပြုချက်',
      icon: Layers,
      badge: '5 STYLES',
      badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      activeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'calculator' as AppNavView,
      titleEn: 'Risk & 10% Move Calculator',
      titleMy: 'အန္တရာယ်စီမံခန့်ခွဲမှု & 10% ခန့်မှန်းတွက်ချက်စနစ်',
      descEn: 'Noise-immune leverage, capital preservation & feasibility score',
      descMy: 'အကောင့်ဆုံးရှုံးမှုကာကွယ်ခြင်း၊ Leverage ချိန်ညှိမှုနှင့် 10% ဖြစ်နိုင်ခြေ',
      icon: Calculator,
      badge: 'AUDIT',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      activeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'scanner' as AppNavView,
      titleEn: 'Live Market Scanner',
      titleMy: 'စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား (Live Scanner)',
      descEn: 'Binance USDⓈ-M pairs, 24h volatility, funding & instant cards',
      descMy: 'Binance Futures စျေးကွက်စစ်ဆေးမှု၊ Funding Rates နှင့် Trade Cards',
      icon: BarChart2,
      badge: 'LIVE',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      activeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'tradecard' as AppNavView,
      titleEn: 'Master Trade Card & Chart Analyzer',
      titleMy: 'Master Trade Card နှင့် ပုံတင်စနစ်',
      descEn: 'Section 13 Master Card & custom chart screenshot analysis',
      descMy: 'Master Trade Setup နှင့် မိမိ TradingView ပုံများတင်၍ စစ်ဆေးမှု',
      icon: Target,
      badge: 'PRO',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      activeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'binance_live' as AppNavView,
      titleEn: '⚡ Binance In-App Live Terminal',
      titleMy: '⚡ Binance အက်ပ်တွင်း ကုန်သွယ်မှု ဗဟို (In-App)',
      descEn: 'All-in-one embedded Binance workspace with single persistent login, live chart & instant orders',
      descMy: 'အက်ပ်ထဲတွင် တစ်ခါတည်းရှိနေသော စနစ် (Log in တစ်ခါဝင်ရုံဖြင့် အမြဲသုံးနိုင်ပြီး အက်ပ်တွင်းမှလည်း တိုက်ရိုက်ကုန်သွယ်နိုင်သည်)',
      icon: ExternalLink,
      badge: 'LIVE TERMINAL',
      badgeColor: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/40',
      activeColor: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black',
    },
    {
      id: 'demo' as AppNavView,
      titleEn: 'Futures Demo Terminal',
      titleMy: 'Binance USDⓈ-M ဒေမိုစနစ်',
      descEn: '$10,000 USDⓈ-M virtual simulator with live order book and PnL',
      descMy: 'Virtual $10,000 ဖြင့် အမှန်တကယ် လက်တွေ့လေ့ကျင့် ကုန်သွယ်ခြင်း',
      icon: Zap,
      badge: '$10k VIRTUAL',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      activeColor: 'bg-amber-500 text-slate-950',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-out Menu Panel */}
      <aside className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-left duration-250">
        {/* Top Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {lang === 'my' ? 'ကုန်သွယ်မှု မီနူးကဏ္ဍများ' : 'Navigation Hub'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'my' ? 'စိတ်ကြိုက်ကဏ္ဍကို ရွေးချယ်ကြည့်ရှုပါ' : 'Select a focused workspace section'}
              </p>
            </div>
          </div>

          <button
            id="close-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
            {lang === 'my' ? 'အဓိက ကဏ္ဍများ (Workspace Sections)' : 'Core Modules'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                id={`drawer-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer group ${
                  isActive
                    ? `${item.activeColor} border-transparent shadow-md`
                    : 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black truncate">
                      {lang === 'my' ? item.titleMy : item.titleEn}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : `${item.badgeColor}`
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    {lang === 'my' ? item.descMy : item.descEn}
                  </p>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 ${
                    isActive ? 'text-white/80' : 'text-slate-400'
                  }`}
                />
              </button>
            );
          })}

          {/* Quick Tools Divider */}
          <div className="pt-3 pb-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
              {lang === 'my' ? 'အထောက်အကူပြု ကိရိယာများ' : 'Quick Utilities'}
            </div>
          </div>

          {/* News Modal Trigger */}
          <button
            id="drawer-news-btn"
            onClick={() => {
              onClose();
              onOpenNews();
            }}
            className="w-full text-left p-3 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>{lang === 'my' ? 'စျေးကွက် သတင်း အနှစ်ချုပ်' : 'Curated Crypto News'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-400">
                  {lang === 'my' ? 'ဒေါ်လာဘီလီယံချီ သက်ရောက်နိုင်သော သတင်းများ' : 'High-impact market catalysts & events'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Glossary Modal Trigger */}
          <button
            id="drawer-glossary-btn"
            onClick={() => {
              onClose();
              onOpenGlossary();
            }}
            className="w-full text-left p-3 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {lang === 'my' ? 'ဝေါဟာရ အဘိဓာန် (Rule 14)' : 'Technical Terms Glossary'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {lang === 'my' ? 'BOS, ChoCH, Order Block နှင့် Funding Rate ရှင်းလင်းချက်များ' : 'Definitions of key trading terms'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* 3 Device Layout Options: Phone, Tablet, Desktop */}
          {onSelectLayout && (
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{lang === 'my' ? '📱 စခရင် ပုံစံရွေးချယ်ရန် (Layouts)' : '📱 Device Layout'}</span>
                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase">{activeLayout}</span>
              </div>
              <DeviceLayoutSwitcher
                currentSelection={currentLayoutSelection}
                activeLayout={activeLayout}
                onSelectLayout={onSelectLayout}
                lang={lang}
                compact={false}
              />
            </div>
          )}

          {/* Price Alerts Hub */}
          {onOpenPriceAlerts && (
            <button
              id="drawer-price-alerts-btn"
              onClick={() => {
                onClose();
                onOpenPriceAlerts();
              }}
              className="w-full text-left p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 relative">
                  <Bell className="w-4 h-4" />
                  {activeAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 text-slate-950 text-[8px] font-black flex items-center justify-center">
                      {activeAlertsCount}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{lang === 'my' ? 'စျေးနှုန်း သတိပေးချက်များ (Price Alerts)' : 'Live Price Alerts'}</span>
                    {activeAlertsCount > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950">
                        {activeAlertsCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {lang === 'my'
                      ? 'Coin ပစ်မှတ်စျေးနှုန်း စောင့်ကြည့်မှု & Visual Toast'
                      : 'Live threshold monitoring with visual notifications'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Settings Center Modal */}
          {onOpenSettings && (
            <button
              id="drawer-settings-btn"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full text-left p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {lang === 'my' ? 'စနစ်ချိန်ညှိမှု ဗဟို (Settings)' : 'Settings Center'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {lang === 'my' ? 'ဘာသာစကား၊ အပြင်အဆင်၊ စျေးကွက်နာရီနှင့် စွန့်စားမှု' : 'Theme, Clocks, Leverage & Session Alerts'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Lock App with PIN */}
          {onLockApp && (
            <button
              id="drawer-lock-btn"
              onClick={() => {
                onClose();
                onLockApp();
              }}
              className="w-full text-left p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">
                    {lang === 'my' ? 'Terminal အား လော့ခ်ချမည်' : 'Lock Terminal (PIN)'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {lang === 'my' ? 'PIN ၄ လုံးဖြင့် ပြန်လည်ကာကွယ်ထားမည်' : 'Secure with 4-digit PIN'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Drawer Bottom Controls: Language & Theme */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between gap-3">
          {/* Language Toggle */}
          <button
            id="drawer-lang-toggle"
            onClick={() => setLang(lang === 'my' ? 'en' : 'my')}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'my' ? '🇲🇲 မြန်မာ' : '🇺🇸 English'}</span>
          </button>

          {/* Theme Toggle */}
          {toggleTheme && (
            <button
              id="drawer-theme-toggle"
              onClick={toggleTheme}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
