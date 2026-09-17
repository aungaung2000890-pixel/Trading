import React from 'react';
import {
  Layers,
  Calculator,
  BarChart2,
  Zap,
  ArrowRight,
  Target,
  Sparkles,
  ShieldAlert,
  Sliders,
  GraduationCap,
  DollarSign,
  Copy,
  Compass,
  Timer,
  Clock,
  Flame,
} from 'lucide-react';
import { AppNavView } from '../types';

interface HomeQuickNavProps {
  onSelectView: (view: AppNavView) => void;
  lang: 'my' | 'en';
}

export const HomeQuickNav: React.FC<HomeQuickNavProps> = ({
  onSelectView,
  lang,
}) => {
  const cards = [
    {
      id: 'binance_live' as AppNavView,
      titleEn: '⚡ Binance In-App Live Trading Terminal',
      titleMy: '⚡ Binance In-App တိုက်ရိုက်ကုန်သွယ်ရေး စနစ်',
      taglineEn: 'Embedded TradingView Chart • Position Tracker • 1-Click Sync to Binance Session',
      taglineMy: 'အက်ပ်ထဲတွင်ပင် ကုန်သွယ်မှုပြုလုပ်နိုင်သည် • Single Persistent Tab ဖြင့် Binance သို့ တိုက်ရိုက်ချိတ်ဆက်',
      descEn: 'Trade directly within your app workspace without tab clutter. Keeps your Binance session active and synced.',
      descMy: 'တက်ဘ်အသစ်တွေ အထပ်ထပ်မဖွင့်ဘဲ အက်ပ်ထဲတွင်ပင် Chart ကြည့်၊ အော်ဒါစီစဉ်ပြီး Binance Persistent Tab သို့ တစ်ချက်နှိပ် Sync ပြုလုပ်နိုင်သည်။',
      icon: Zap,
      color: 'from-amber-500/30 via-emerald-950/40 to-slate-900/50 text-amber-400 border-amber-500/50 hover:border-amber-400',
      btnColor: 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black',
      badge: '⚡ IN-APP LIVE',
    },
    {
      id: 'market_timing' as AppNavView,
      titleEn: 'Market Timing & News Engine',
      titleMy: 'စျေးကွက် အချိန်ကိုက် & သတင်းစနစ်',
      taglineEn: 'PRIME / CAUTION / AVOID / WAIT • Session Overlaps • Macro Catalysts',
      taglineMy: 'ကုန်သွယ်ရန် အကောင်းဆုံးအချိန် • စက်ရှင်ထပ်တူကျမှု • သတင်းသတိပေးချက်',
      descEn: 'Real-time timing engine evaluating London/NY overlap, high volatility catalysts, and trade condition safety.',
      descMy: 'စျေးကွက်အတွင်း မဝင်သင့်သော အချိန် (သတင်းမထွက်မီ) နှင့် အကောင်းဆုံး အချိန် (Overlap) ကို စက္ကန့်နှင့်အမျှ တွက်ချက်ပြသပေးသည်။',
      icon: Timer,
      color: 'from-emerald-500/30 via-emerald-950/40 to-slate-900/50 text-emerald-400 border-emerald-500/50 hover:border-emerald-400',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black',
      badge: '⏱️ MARKET TIMING',
    },
    {
      id: 'world_clocks' as AppNavView,
      titleEn: 'Global World Market Clocks',
      titleMy: 'ကမ္ဘာ့စျေးကွက် နာရီများ (ပင်မနှင့် ပေါင်းစပ်ထားသည်)',
      taglineEn: 'Integrated in Home • Live Analog Clocks • Yangon • NY • London • Tokyo',
      taglineMy: 'ပင်မစာမျက်နှာတွင် တိုက်ရိုက် ကြည့်ရှုနိုင်သော ကမ္ဘာ့နာရီလက်တံများ • စျေးကွက်စက်ရှင်များ',
      descEn: 'Live analog clocks tracking market sessions, local times, and UTC offsets directly inside your Home dashboard.',
      descMy: 'ရန်ကုန်စံတော်ချိန်အပါအဝင် နယူးယောက်၊ လန်ဒန်၊ တိုကျိုတို့၏ စျေးကွက်ပွင့်ချိန်၊ ပိတ်ချိန်များကို ပင်မစာမျက်နှာတွင် တိုက်ရိုက်ကြည့်ရှုပါ။',
      icon: Clock,
      color: 'from-cyan-500/30 via-cyan-950/40 to-slate-900/50 text-cyan-400 border-cyan-500/50 hover:border-cyan-400',
      btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black',
      badge: '🌍 ON HOME',
    },
    {
      id: 'high_leverage' as AppNavView,
      titleEn: 'High-Leverage Trading Mode',
      titleMy: 'High-Leverage စွန့်စားမှု ထိန်းချုပ်မုဒ်',
      taglineEn: '10x-100x Leverage • Capital Preservation • Strict Max Loss Control',
      taglineMy: 'Leverage မြင့်သော်လည်း အရင်းမဆုံးစေရန် အန္တရာယ်ကင်းသော Margin & Liquidation Buffer',
      descEn: 'Enforce professional mathematical risk boundaries for high leverage setups (10x-100x) while strictly capping account risk under 2%.',
      descMy: 'Leverage မြင့်မြင့်သုံးချင်သူများအတွက် အကောင့်ငွေ ၂% ထက် ပိုမရှုံးစေရန် Margin ပမာဏနှင့် Stop Loss ကို တင်းကျပ်စွာ စစ်ဆေးပေးသော စနစ်။',
      icon: Flame,
      color: 'from-rose-500/30 via-amber-950/40 to-slate-900/50 text-rose-400 border-rose-500/50 hover:border-rose-400',
      btnColor: 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black',
      badge: '🔥 10x-100x MODE',
    },
    {
      id: 'wallet_advisor' as AppNavView,
      titleEn: '🧭 Futures Wallet Risk & Strategy Advisor',
      titleMy: '🧭 Wallet Risk & Strategy အကြံပေးစနစ်',
      taglineEn: 'Dual-Track Risk • Sizing & Limits • Strategy Recommendations • Must-Know Checklist',
      taglineMy: 'နည်းပညာ vs ငါ့စည်းမျဉ်း ၂ ပိုင်းခွဲစိစစ်မှု • Trade အရေအတွက် & Margin ပမာဏ • မဖြစ်မနေသိသင့်သည်များ',
      descEn: 'Input your futures wallet to receive dual-track risk audits, exact trade counts and sizing, and tailored trading style matches.',
      descMy: 'သင့် Wallet လက်ကျန်ငွေပြလိုက်သည်နှင့် အန္တရာယ်ကင်းသော Leverage/Margin၊ တပြိုင်နက်ဖွင့်နိုင်သော Trade အရေအတွက်နှင့် သင့်တော်သော Trade နည်းများကို အကြံပေးပါသည်။',
      icon: Compass,
      color: 'from-amber-500/30 via-emerald-900/30 to-slate-900/50 text-amber-400 border-amber-500/50 hover:border-amber-400',
      btnColor: 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black',
      badge: '🧭 DUAL-TRACK ADVISOR',
    },
    {
      id: 'signals_copy' as AppNavView,
      titleEn: '⚡ Easy Signals Copy Mode',
      titleMy: '⚡ အမြန် စစ်ဂနယ် ကော်ပီမုဒ် (Easy Copy)',
      taglineEn: 'Instant Binance Copy • 5 Styles • Dual-Track • PnL Metrics',
      taglineMy: 'အချိန်မနှောင့်နှေးဘဲ Binance သို့ တိုက်ရိုက်ကူးရန် • နည်းအားလုံးစုစည်းမှု • အရှုံး/အမြတ် တွက်ချက်မှု',
      descEn: 'Clean signal-only cards across all trading methods. Copy entry, TP, and SL directly to Binance with zero delay.',
      descMy: 'အသေးစိတ်စာရှည်မပါဘဲ Entry, TP, SL, PnL သီးသန့်ထုတ်ပေးထားသော စနစ်ဖြစ်ပြီး မင်းရဲ့ခွဲခြမ်းစိတ်ဖြာမှု vs ငါ့စည်းမျဉ်း ၂ ပိုင်းခွဲထားပါသည်။',
      icon: Copy,
      color: 'from-amber-500/30 via-indigo-900/30 to-slate-900/50 text-amber-400 border-amber-500/50 hover:border-amber-400',
      btnColor: 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black',
      badge: '⚡ NEW EASY COPY',
    },
    {
      id: 'ai' as AppNavView,
      titleEn: 'AI Trading Assistant (3 Modes)',
      titleMy: 'AI ကုန်သွယ်မှု လက်ထောက်စနစ်',
      taglineEn: '⚡ Quick Trade • 🧠 Deep Analysis (24 Points) • 💬 Ask AI Q&A',
      taglineMy: '⚡ အမြန်ဆုံးဖြတ်ချက် • 🧠 ၂၄ ချက်ပြည့် အဆင့်မြင့်စစ်ဆေးမှု • 💬 အမေးအဖြေ',
      descEn: 'Decision support system featuring fast trade setups, exhaustive 24-point audits, and comprehensive Q&A.',
      descMy: 'အမြန် Trade စစ်ဆေးမှု (Entry/SL/TP/RR)၊ ၂၄ ချက်ပြည့် ဖွဲ့စည်းပုံနှင့် စျေးကွက်မေးခွန်းများအားလုံး အဖြေရှာနိုင်ပါသည်။',
      icon: Sparkles,
      color: 'from-amber-500/25 via-amber-500/10 to-transparent text-amber-400 border-amber-500/40 hover:border-amber-500',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
      badge: '⚡ 🧠 💬 3 AI MODES',
    },
    {
      id: 'learning' as AppNavView,
      titleEn: 'Crypto Learning Center',
      titleMy: 'Crypto သင်ယူမှု ဗဟိုဌာန (၁၄ ခန်း)',
      taglineEn: 'Beginner to Advanced • 14 Sections • Quizzes • Scam Radar',
      taglineMy: 'အခြေခံမှ အဆင့်မြင့်အထိ ၁၄ ခန်း၊ ဉာဏ်စမ်းနှင့် လိမ်လည်မှုစစ်ဆေးရေး',
      descEn: 'Learn, understand, see, practice, and test with structured visual lessons and instant quizzes.',
      descMy: 'ရိုးရှင်းသော ရှင်းလင်းချက်၊ ရုပ်ပုံကားချပ်၊ လက်တွေ့ဥပမာနှင့် ဉာဏ်စမ်းများဖြင့် စနစ်တကျ သင်ယူပါ။',
      icon: GraduationCap,
      color: 'from-amber-500/20 via-amber-500/10 to-transparent text-amber-500 border-amber-500/40 hover:border-amber-500',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
      badge: 'CRYPTO CURRICULUM',
    },
    {
      id: 'tradecard' as AppNavView,
      titleEn: 'Master Trade Card & Chart Analyzer',
      titleMy: 'Master Trade Card နှင့် ပုံတင်စနစ်',
      taglineEn: 'Section 13 Master Card • TradingView Screenshot Analysis',
      taglineMy: 'Master Trade Setup နှင့် မိမိ TradingView ပုံများတင်၍ စစ်ဆေးမှု',
      descEn: 'Section 13 Master Card & custom chart screenshot analysis with institutional confirmation.',
      descMy: 'Trade Setup အပြည့်အစုံထုတ်ယူခြင်းနှင့် မိမိ Chart ပုံများတင်၍ စစ်ဆေးနိုင်သော စနစ်။',
      icon: Target,
      color: 'from-purple-500/20 via-purple-500/10 to-transparent text-purple-400 border-purple-500/40 hover:border-purple-500',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white font-bold',
      badge: 'PRO SETUP',
    },
    {
      id: 'strategy' as AppNavView,
      titleEn: 'Strategy Hub (5 Styles)',
      titleMy: 'ကုန်သွယ်မှု စတိုင်လ် ၅ မျိုး (Strategy Hub)',
      taglineEn: 'Scalping • Day • Swing • Position • Long-Term',
      taglineMy: 'Scalping မှ Long-Term အထိ သင့်တော်သော Leverage နှင့် Setup',
      descEn: 'Compare your manual plan against independent technical rules with one-click Trade Card export.',
      descMy: 'မိမိချမှတ်ထားသော စည်းကမ်းနှင့် နည်းပညာအကြံပြုချက်ကို ဘေးချင်းယှဉ်တွက်ချက်ကာ Trade Card ရယူပါ။',
      icon: Layers,
      color: 'from-indigo-500/10 to-indigo-600/5 text-indigo-500 border-indigo-500/20 hover:border-indigo-500/50',
      btnColor: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      badge: '5 STYLES',
    },
    {
      id: 'calculator' as AppNavView,
      titleEn: 'Risk & 10% Move Calculator',
      titleMy: 'အန္တရာယ် & 10% ခန့်မှန်းတွက်ချက်စနစ်',
      taglineEn: 'Capital Preservation • Drawdown Guard • Feasibility',
      taglineMy: 'အကောင့်အရင်းအနှီးမပြုန်းတီးရေးနှင့် ၁၀% ဖြစ်နိုင်ခြေ စိစစ်မှု',
      descEn: 'Simulate account drawdown at SL, noise-immune leverage buffer, and 10% move probability score.',
      descMy: 'Stop Loss ထိလျှင် အကောင့်အရှုံး ၁.၅% တွင် ကန့်သတ်နိုင်သော Preservation Margin ကို တွက်ချက်ပါ။',
      icon: Calculator,
      color: 'from-amber-500/10 to-amber-600/5 text-amber-500 border-amber-500/20 hover:border-amber-500/50',
      btnColor: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black',
      badge: 'AUDIT',
    },
    {
      id: 'scanner' as AppNavView,
      titleEn: 'Live Market Scanner',
      titleMy: 'စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား (Live Scanner)',
      taglineEn: 'Binance USDⓈ-M • Volume • Funding Rates • Fast Cards',
      taglineMy: 'Binance Futures စျေးကွက်စစ်ဆေးမှု၊ Funding Rates နှင့် Instant Cards',
      descEn: 'Track top gainers, high-volume contracts, 8h funding rates, and launch instant Section 13 trade cards.',
      descMy: 'Futures Coins များ၏ ၂၄ နာရီ Volume၊ Funding Rates များကို စစ်ဆေးပြီး Instant Card ထုတ်ယူပါ။',
      icon: BarChart2,
      color: 'from-blue-500/10 to-blue-600/5 text-blue-500 border-blue-500/20 hover:border-blue-500/50',
      btnColor: 'bg-blue-600 hover:bg-blue-500 text-white',
      badge: 'LIVE TICKERS',
    },
    {
      id: 'demo' as AppNavView,
      titleEn: 'Futures Demo Terminal',
      titleMy: 'Binance USDⓈ-M ဒေမိုစနစ်',
      taglineEn: '$10,000 Virtual USDT • Live Order Book • Real Execution',
      taglineMy: '$10,000 Virtual Balance ဖြင့် စွန့်စားမှုမရှိဘဲ လက်တွေ့လေ့ကျင့်ပါ',
      descEn: 'Practice real order execution with leverage, TP/SL triggers, and interactive live orderbook ticks.',
      descMy: 'အမှန်တကယ် Binance Terminal ကဲ့သို့ Orderbook၊ Leverage နှင့် Position PnL တို့ဖြင့် လေ့ကျင့်ပါ။',
      icon: Zap,
      color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/50',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      badge: '$10k DEMO',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {lang === 'my' ? 'အထူးပြု ကိရိယာများနှင့် ကဏ္ဍခွဲများ' : 'Specialized Trading Modules'}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          {lang === 'my' ? 'မီနူး (☰) မှတစ်ဆင့်လည်း အလွယ်တကူ ကူးပြောင်းနိုင်ပါသည်' : 'Accessible anytime via (☰) menu'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              className={`p-4 rounded-3xl bg-gradient-to-b ${c.color} border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-current/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-current/20">
                    {c.badge}
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {lang === 'my' ? c.titleMy : c.titleEn}
                </h4>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {lang === 'my' ? c.taglineMy : c.taglineEn}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                  {lang === 'my' ? c.descMy : c.descEn}
                </p>
              </div>

              <div className="pt-4">
                <button
                  id={`home-nav-${c.id}-btn`}
                  onClick={() => {
                    onSelectView(c.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${c.btnColor}`}
                >
                  <span>{lang === 'my' ? 'ကဏ္ဍသို့ သွားမည်' : 'Open Module'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
