import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
  ChevronRight,
  Calculator,
  BarChart2,
  Newspaper,
  Clock,
  Check,
  ArrowUpRight,
  Coins,
  Globe,
  Sliders,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';
import { CoinOpportunity, LiveTickerItem, AppNavView } from '../types';

interface TradeByKADashboardProps {
  lang: 'my' | 'en';
  coins: CoinOpportunity[];
  liveTickers: LiveTickerItem[];
  onSelectCoin: (coin: CoinOpportunity) => void;
  onTradeInDemo: (symbol: string, side: 'LONG' | 'SHORT') => void;
  onOpenAI: (mode?: any, symbol?: string) => void;
  onNavigateView: (view: AppNavView) => void;
  onOpenNews: () => void;
  onOpenSettings?: () => void;
  walletBalance: number;
}

export const TradeByKADashboard: React.FC<TradeByKADashboardProps> = ({
  lang,
  coins,
  liveTickers,
  onSelectCoin,
  onTradeInDemo,
  onOpenAI,
  onNavigateView,
  onOpenNews,
  onOpenSettings,
  walletBalance,
}) => {
  const isMy = lang === 'my';

  // Hero investment amount input state
  const [heroAmount, setHeroAmount] = useState<string>('100');
  const [isHeroAnalyzing, setIsHeroAnalyzing] = useState<boolean>(false);

  // Investment calculator state
  const [calcAmount, setCalcAmount] = useState<string>('1000');
  const [calcTimeframe, setCalcTimeframe] = useState<string>('1-3 Years');
  const [calcReturnRange, setCalcReturnRange] = useState<{ min: number; max: number }>({
    min: 8.6,
    max: 15.3,
  });

  // Market analysis tab state
  const [marketTab, setMarketTab] = useState<'crypto' | 'forex' | 'favorites'>('crypto');

  // Clock carousel index
  const [clockOffset, setClockOffset] = useState<number>(0);

  // Quick 4 Opportunity Cards Data matching image
  const opportunityCards = [
    {
      type: 'Best Opportunity',
      typeMy: 'အကောင်းဆုံး အခွင့်အလမ်း',
      symbol: 'BTC',
      name: 'Bitcoin',
      returnRate: '+12.8%',
      horizon: '(1M-3Y)',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      side: 'LONG' as const,
    },
    {
      type: 'High Potential',
      typeMy: 'မြင့်မားသော အလားအလာ',
      symbol: 'ETH',
      name: 'Ethereum',
      returnRate: '+10.4%',
      horizon: '(1M-3Y)',
      iconBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      side: 'LONG' as const,
    },
    {
      type: 'Steady Growth',
      typeMy: 'တည်ငြိမ်စွာ တိုးတက်မှု',
      symbol: 'SOL',
      name: 'Solana',
      returnRate: '+8.7%',
      horizon: '(1M-3Y)',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      side: 'LONG' as const,
    },
    {
      type: 'Balanced',
      typeMy: 'မျှတသော စွန့်စားမှု',
      symbol: 'BNB',
      name: 'BNB',
      returnRate: '+7.3%',
      horizon: '(1M-3Y)',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
      side: 'LONG' as const,
    },
  ];

  // Top Long-Term Picks matching table in image
  const longTermPicks = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      pair: 'BTC/USDT',
      targetReturn: '+12.8%',
      confidence: 'High',
      confidenceMy: 'မြင့်မား',
      confidenceBadge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      reason: 'Strong institutional demand, ETF inflows, halving cycle',
      reasonMy: 'အဖွဲ့အစည်းကြီးများ ဝယ်လိုအားမြင့်၊ ETF စီးဝင်မှုနှင့် Halving စက်ဝန်း',
      logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      pair: 'ETH/USDT',
      targetReturn: '+10.4%',
      confidence: 'High',
      confidenceMy: 'မြင့်မား',
      confidenceBadge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      reason: 'Layer 2 growth, DeFi expansion, ETH ETF potential',
      reasonMy: 'Layer 2 တိုးတက်မှု၊ DeFi ချဲ့ထွင်မှုနှင့် Spot ETF ဝယ်လိုအား',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      pair: 'SOL/USDT',
      targetReturn: '+8.7%',
      confidence: 'Medium-High',
      confidenceMy: 'အလယ်အလတ်-မြင့်',
      confidenceBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      reason: 'Ecosystem growth, high adoption, low fees',
      reasonMy: 'Ecosystem တိုးတက်မှု၊ သုံးစွဲသူများပြားမှုနှင့် သက်သာသော ကုန်ကျစရိတ်',
      logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      pair: 'BNB/USDT',
      targetReturn: '+7.3%',
      confidence: 'Medium',
      confidenceMy: 'အလယ်အလတ်',
      confidenceBadge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      reason: 'Exchange utility, burn program, web3 growth',
      reasonMy: 'Exchange Utility အသုံးဝင်မှု၊ Token Burn အစီအစဉ်နှင့် Web3 ချဲ့ထွင်မှု',
      logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    },
    {
      symbol: 'XRP',
      name: 'XRP',
      pair: 'XRP/USDT',
      targetReturn: '+6.9%',
      confidence: 'Medium',
      confidenceMy: 'အလယ်အလတ်',
      confidenceBadge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      reason: 'Regulatory progress, financial institutions',
      reasonMy: 'တရားဥပဒေ ရှင်းလင်းမှုတိုးတက်၊ ဘဏ်နှင့် ငွေရေးကြေးရေး ချိတ်ဆက်မှု',
      logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      pair: 'ADA/USDT',
      targetReturn: '+5.8%',
      confidence: 'Medium',
      confidenceMy: 'အလယ်အလတ်',
      confidenceBadge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      reason: 'Smart contract development, partnerships',
      reasonMy: 'Smart Contract အဆင့်မြှင့်တင်မှုများနှင့် မိတ်ဖက်ပူးပေါင်းဆောင်ရွက်မှု',
      logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    },
  ];

  // Curated news items matching image
  const latestNews = [
    {
      id: 1,
      title: 'Bitcoin ETF Inflows Reach $1.2B This Week',
      titleMy: 'ယခုသီတင်းပတ်အတွင်း Bitcoin ETF ထဲသို့ $1.2B စီးဝင်ခဲ့',
      time: '2h ago',
      category: 'Crypto',
      avatarBg: 'bg-amber-500/20 text-amber-400',
      avatarText: '₿',
    },
    {
      id: 2,
      title: 'Fed Keeps Interest Rates Steady at 5.25%',
      titleMy: 'Fed ဗဟိုဘဏ်က အတိုးနှုန်းကို 5.25% တွင် မပြောင်းလဲဘဲ ဆက်လက်ထားရှိ',
      time: '3h ago',
      category: 'Macro',
      avatarBg: 'bg-indigo-500/20 text-indigo-400',
      avatarText: '🏛️',
    },
    {
      id: 3,
      title: 'Binance Adds 5 New Futures Pairs',
      titleMy: 'Binance က စာချုပ်အသစ် ၅ ခုကို Futures တွင် ထပ်မံထည့်သွင်း',
      time: '4h ago',
      category: 'Exchange',
      avatarBg: 'bg-amber-500/20 text-amber-400',
      avatarText: '⚡',
    },
    {
      id: 4,
      title: 'Ethereum Dencun Upgrade Boosts Network',
      titleMy: 'Ethereum Dencun Upgrade အောင်မြင်စွာပြီးမြောက်ပြီး ကွန်ရက်အားကောင်းလာ',
      time: '6h ago',
      category: 'Crypto',
      avatarBg: 'bg-indigo-500/20 text-indigo-400',
      avatarText: '🔷',
    },
  ];

  // Global Market Clocks matching image
  const marketClocks = [
    {
      city: 'New York',
      cityMy: 'နယူးယောက်',
      time: '09:32',
      utc: 'UTC-4',
      status: 'Open',
      statusColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      flag: '🇺🇸',
      isOpen: true,
    },
    {
      city: 'London',
      cityMy: 'လန်ဒန်',
      time: '14:32',
      utc: 'UTC+0',
      status: 'Open',
      statusColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      flag: '🇬🇧',
      isOpen: true,
    },
    {
      city: 'Tokyo',
      cityMy: 'တိုကျို',
      time: '23:32',
      utc: 'UTC+9',
      status: 'Closed',
      statusColor: 'text-slate-400 bg-slate-800 border-slate-700',
      flag: '🇯🇵',
      isOpen: false,
    },
    {
      city: 'Sydney',
      cityMy: 'ဆစ်ဒနီ',
      time: '00:32',
      utc: 'UTC+10',
      status: 'Closed',
      statusColor: 'text-slate-400 bg-slate-800 border-slate-700',
      flag: '🇦🇺',
      isOpen: false,
    },
  ];

  // Forex ticker fallbacks
  const forexTickers = [
    { symbol: 'EUR/USD', price: '1.0842', change: '+0.24%', isUp: true },
    { symbol: 'GBP/USD', price: '1.2915', change: '+0.18%', isUp: true },
    { symbol: 'USD/JPY', price: '154.20', change: '-0.32%', isUp: false },
    { symbol: 'AUD/USD', price: '0.6654', change: '+0.45%', isUp: true },
    { symbol: 'XAU/USD', price: '2,412.50', change: '+1.15%', isUp: true },
  ];

  // Dynamic price calculation helper
  const getTickerPrice = (sym: string, fallback: string) => {
    const found = liveTickers.find((t) => t.symbol === sym);
    if (!found) return fallback;
    return found.lastPrice >= 100
      ? found.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : found.lastPrice.toString();
  };

  const getTickerChange = (sym: string, fallback: string) => {
    const found = liveTickers.find((t) => t.symbol === sym);
    if (!found) return fallback;
    const sign = found.change24h >= 0 ? '+' : '';
    return `${sign}${found.change24h.toFixed(2)}%`;
  };

  const handleHeroAnalyze = () => {
    setIsHeroAnalyzing(true);
    setTimeout(() => {
      setIsHeroAnalyzing(false);
      onNavigateView('long_term');
    }, 600);
  };

  const handleCalcAnalyze = () => {
    const parsed = parseFloat(calcAmount) || 1000;
    if (calcTimeframe === '1 Month') {
      setCalcReturnRange({ min: 4.2, max: 8.5 });
    } else if (calcTimeframe === '3 Months') {
      setCalcReturnRange({ min: 6.5, max: 11.8 });
    } else if (calcTimeframe === '6 Months') {
      setCalcReturnRange({ min: 7.4, max: 13.5 });
    } else {
      setCalcReturnRange({ min: 8.6, max: 15.3 });
    }
  };

  return (
    <div className="space-y-6 text-slate-100 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. HERO CARD: AI INVESTMENT PLANNER (LONG TERM 1M - 3Y)  */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/80 border border-slate-800 shadow-2xl p-6 sm:p-8">
        {/* Glow & Backdrop Accents */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Title, Description, Input and Action */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
                <span className="font-black text-sm font-mono tracking-tighter">AI</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isMy ? 'AI ရင်းနှီးမြှုပ်နှံမှု အစီအစဉ် (AI Investment Planner)' : 'AI Investment Planner'}
                </h2>
                <span className="text-xs font-bold text-amber-400 font-mono tracking-wider">
                  Long Term (1M – 3Y)
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              {isMy
                ? 'သင့်ရင်းနှီးမြှုပ်နှံမှု ပမာဏကို ထည့်သွင်းပြီး စျေးကွက်ဒေတာ၊ နည်းပညာပိုင်း၊ သတင်းများနှင့် အခြေခံအချက်များပေါ် အခြေခံ၍ အကောင်းဆုံး အခွင့်အလမ်းများကို AI ဖြင့် ခွဲခြမ်းစိတ်ဖြာပါ။'
                : 'Enter your investment amount and let AI analyze the best opportunities based on market data, technicals, news and fundamentals.'}
            </p>

            {/* Input and Analyze button */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isMy ? 'ရင်းနှီးမြှုပ်နှံမှု ပမာဏ ထည့်ရန် (USD)' : 'Enter your investment amount (USD)'}
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={heroAmount}
                    onChange={(e) => setHeroAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500 transition shadow-inner"
                  />
                </div>
                <button
                  id="hero-analyze-btn"
                  onClick={handleHeroAnalyze}
                  disabled={isHeroAnalyzing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>{isHeroAnalyzing ? (isMy ? 'စစ်ဆေးနေသည်...' : 'Analyzing...') : (isMy ? 'ခွဲခြမ်းစိတ်ဖြာမည်' : 'Analyze')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual illustration + AI Analysis checklist */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-6 lg:pt-0 lg:pl-6">
            {/* Visual 3D style bitcoin illustration */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
              {/* Graphic container with rising arrow */}
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950/60 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-3xl font-black text-amber-300">₿</span>
                  <div className="absolute bottom-1 right-1 flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded">
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 w-full sm:w-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {isMy ? 'AI စစ်ဆေးချက်များတွင် ပါဝင်သည်' : 'AI Analysis Includes'}
              </div>
              {[
                { en: 'Technical Analysis', my: 'Technical Chart ခွဲခြမ်းစိတ်ဖြာခြင်း' },
                { en: 'Fundamental Analysis', my: 'အခြေခံ Tokenomics စစ်ဆေးခြင်း' },
                { en: 'Market Trends & News', my: 'စျေးကွက် Trend နှင့် နောက်ဆုံးသတင်း' },
                { en: 'Risk Assessment', my: 'အန္တရာယ်ဖြစ်နိုင်ခြေ အဆင့်တိုင်းတာခြင်း' },
                { en: 'Potential Returns', my: 'မျှော်မှန်းအကျိုးအမြတ် ရာခိုင်နှုန်း' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{isMy ? item.my : item.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ROW OF 4 OPPORTUNITY CARDS                            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {opportunityCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => {
              const matched = coins.find((c) => c.symbol === card.symbol);
              if (matched) onSelectCoin(matched);
              onTradeInDemo(card.symbol, card.side);
            }}
            className="group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-xl cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center p-2 shrink-0 ${card.iconBg}`}>
                <img src={card.logo} alt={card.symbol} className="w-6 h-6 object-contain" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isMy ? card.typeMy : card.type}
                </div>
                <div className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                  {card.symbol}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="font-bold text-emerald-400">{card.returnRate}</span>
                  <span className="text-slate-500 text-[10px]">{card.horizon}</span>
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-slate-800/80 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN DASHBOARD CONTENT (TWO-COLUMN SPLIT)             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN (7 COLS): TOP PICKS + OUTLOOK & RISK       */}
        {/* ====================================================== */}
        <div className="xl:col-span-7 space-y-6">
          {/* Top Long-Term Picks Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-black text-white tracking-wide">
                  {isMy ? 'ရေရှည် အကောင်းဆုံးရွေးချယ်မှုများ (Top Long-Term Picks)' : 'Top Long-Term Picks'}
                </h3>
              </div>
              <button
                onClick={() => onNavigateView('long_term')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-1"
              >
                <span>{isMy ? 'အားလုံးကြည့်ရှုမည်' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    <th className="pb-3 font-bold pl-1">{isMy ? 'ငွေကြေး' : 'Coin'}</th>
                    <th className="pb-3 font-bold">{isMy ? 'ပစ်မှတ်ရလဒ် (1M-3Y)' : 'Target Return (1M-3Y)'}</th>
                    <th className="pb-3 font-bold">{isMy ? 'ယုံကြည်စိတ်ချရမှု' : 'Confidence'}</th>
                    <th className="pb-3 font-bold">{isMy ? 'အကြောင်းပြချက်' : 'Reason'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {longTermPicks.map((pick, idx) => (
                    <tr
                      key={idx}
                      onClick={() => onTradeInDemo(pick.symbol, 'LONG')}
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      {/* Coin */}
                      <td className="py-3 pl-1">
                        <div className="flex items-center gap-2.5">
                          <img src={pick.logo} alt={pick.name} className="w-5 h-5 rounded-full object-contain" />
                          <div>
                            <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
                              {pick.name}
                            </span>{' '}
                            <span className="text-slate-500 font-mono text-[11px]">({pick.symbol})</span>
                          </div>
                        </div>
                      </td>

                      {/* Target Return */}
                      <td className="py-3 font-mono font-black text-emerald-400">
                        {pick.targetReturn}
                      </td>

                      {/* Confidence */}
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pick.confidenceBadge}`}>
                          {isMy ? pick.confidenceMy : pick.confidence}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3 text-slate-400 max-w-xs truncate text-[11px]">
                        {isMy ? pick.reasonMy : pick.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Widgets Side-by-Side: Market Outlook & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Widget 1: Market Outlook */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isMy ? 'စျေးကွက်အလားအလာ (Market Outlook)' : 'Market Outlook'}
                </h4>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1">
                  {isMy ? 'ခြုံငုံ စျေးကွက်စိတ်ဓာတ်' : 'Overall Market Sentiment'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-black text-emerald-400">
                    {isMy ? 'အဝယ်အားသာချက် (Bullish)' : 'Bullish'}
                  </span>
                </div>
                {/* Segmented bar */}
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1.5 flex-1 rounded-full bg-emerald-500" />
                  <div className="h-1.5 flex-1 rounded-full bg-emerald-500" />
                  <div className="h-1.5 flex-1 rounded-full bg-emerald-500" />
                  <div className="h-1.5 flex-1 rounded-full bg-slate-800" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  {isMy ? 'အဓိက တွန်းအားများ' : 'Key Factors'}
                </div>
                {[
                  { en: 'ETF inflows', my: 'Spot ETF ငွေကြေးစီးဝင်မှု' },
                  { en: 'Halving cycle', my: 'Halving ၄ နှစ် စက်ဝန်း' },
                  { en: 'Institutional adoption', my: 'အဖွဲ့အစည်းကြီးများ လက်ခံသုံးစွဲမှု' },
                  { en: 'Global economic conditions', my: 'ကမ္ဘာ့မေခရို စီးပွားရေးအခြေအနေ' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{isMy ? item.my : item.en}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Risk Assessment */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isMy ? 'စွန့်စားမှု အကဲဖြတ်ချက် (Risk Assessment)' : 'Risk Assessment'}
                </h4>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1">
                  {isMy ? 'စွန့်စားမှု အဆင့်' : 'Risk Level'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-sm font-black text-amber-400">
                    {isMy ? 'အလယ်အလတ် (Medium)' : 'Medium'}
                  </span>
                </div>
                {/* Segmented bar */}
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1.5 flex-1 rounded-full bg-amber-500" />
                  <div className="h-1.5 flex-1 rounded-full bg-amber-500" />
                  <div className="h-1.5 flex-1 rounded-full bg-slate-800" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  {isMy ? 'ဖြစ်နိုင်ချေရှိသော စွန့်စားမှုများ' : 'Potential Risks'}
                </div>
                {[
                  { en: 'Market volatility', my: 'စျေးကွက် လှိုင်းထန်မှု (Volatility)' },
                  { en: 'Regulatory changes', my: 'စည်းမျဉ်းဥပဒေ ပြောင်းလဲမှုများ' },
                  { en: 'Macro economic events', my: 'မေခရို စီးပွားရေး အခြေအနေများ' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{isMy ? item.my : item.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN (5 COLS): CALCULATOR, MARKET, NEWS, CLOCK */}
        {/* ====================================================== */}
        <div className="xl:col-span-5 space-y-6">
          {/* 1. Investment Calculator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white tracking-wide">
                {isMy ? 'ရင်းနှီးမြှုပ်နှံမှု တွက်ချက်စက် (Investment Calculator)' : 'Investment Calculator'}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {isMy ? 'ရင်းနှီးမြှုပ်နှံမှု ပမာဏ (USD)' : 'Investment Amount (USD)'}
                </label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {isMy ? 'အချိန်ကာလ (Time Frame)' : 'Time Frame'}
                </label>
                <select
                  value={calcTimeframe}
                  onChange={(e) => setCalcTimeframe(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="1-3 Years">1–3 Years</option>
                </select>
              </div>

              <button
                id="analyze-portfolio-btn"
                onClick={handleCalcAnalyze}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs tracking-wide transition shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer"
              >
                {isMy ? 'Portfolio ခွဲခြမ်းစိတ်ဖြာမည်' : 'Analyze Portfolio'}
              </button>

              {/* Estimated Growth Result with Sparkline */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isMy ? 'မျှော်မှန်း Portfolio ကြီးထွားနှုန်း' : 'Estimated Portfolio Growth'}</span>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                  +{calcReturnRange.min}% – +{calcReturnRange.max}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {isMy ? '(လက်ရှိ စျေးကွက်အခြေအနေများအပေါ် အခြေခံသည်)' : '(Based on current market conditions)'}
                </div>

                {/* Vibrant green smooth SVG sparkline */}
                <div className="mt-3 w-full h-12">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 35 Q 30 30, 60 25 T 120 18 T 160 10 T 200 4"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 0 35 Q 30 30, 60 25 T 120 18 T 160 10 T 200 4 L 200 40 L 0 40 Z"
                      fill="url(#growthGradient)"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Market Analysis Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white tracking-wide">
                  {isMy ? 'စျေးကွက် စောင့်ကြည့်လေ့လာမှု (Market Analysis)' : 'Market Analysis'}
                </h3>
              </div>
            </div>

            {/* Tabs: Crypto | Forex | Favorites */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              {(['crypto', 'forex', 'favorites'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMarketTab(tab)}
                  className={`flex-1 py-1 px-2 rounded-lg font-bold transition capitalize cursor-pointer ${
                    marketTab === tab
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'crypto' ? 'Crypto' : tab === 'forex' ? 'Forex' : isMy ? 'စိတ်ကြိုက်' : 'Favorites'}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="divide-y divide-slate-800/60">
              {marketTab === 'crypto'
                ? [
                    { pair: 'BTC/USDT', sym: 'BTC', fallbackPrice: '67,452.32', fallbackChange: '+3.60%', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
                    { pair: 'ETH/USDT', sym: 'ETH', fallbackPrice: '3,248.17', fallbackChange: '+2.85%', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
                    { pair: 'BNB/USDT', sym: 'BNB', fallbackPrice: '586.32', fallbackChange: '+1.42%', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
                    { pair: 'SOL/USDT', sym: 'SOL', fallbackPrice: '152.76', fallbackChange: '+4.21%', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
                    { pair: 'XRP/USDT', sym: 'XRP', fallbackPrice: '0.5231', fallbackChange: '+1.87%', logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => onTradeInDemo(item.sym, 'LONG')}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-xl transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={item.logo} alt={item.sym} className="w-5 h-5 rounded-full object-contain" />
                        <span className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                          {item.pair}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          ${getTickerPrice(item.sym, item.fallbackPrice)}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {getTickerChange(item.sym, item.fallbackChange)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </div>
                  ))
                : forexTickers.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-xl transition cursor-pointer group"
                    >
                      <span className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                        {item.symbol}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-200">{item.price}</span>
                        <span className={`text-xs font-mono font-bold ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.change}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* 3. Latest News Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white tracking-wide">
                  {isMy ? 'နောက်ဆုံးရ သတင်းများ (Latest News)' : 'Latest News'}
                </h3>
              </div>
              <button
                onClick={onOpenNews}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
              >
                {isMy ? 'အားလုံး' : 'See All'}
              </button>
            </div>

            <div className="space-y-2.5">
              {latestNews.map((news) => (
                <div
                  key={news.id}
                  onClick={onOpenNews}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${news.avatarBg}`}>
                      {news.avatarText}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        {isMy ? news.titleMy : news.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {news.time} • {news.category}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Global Market Clock Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white tracking-wide">
                  {isMy ? 'ကမ္ဘာ့စျေးကွက် နာရီများ (Global Market Clock)' : 'Global Market Clock'}
                </h3>
              </div>
              <button
                onClick={() => onNavigateView('world_clocks')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
              >
                {isMy ? 'အားလုံး' : 'See All'}
              </button>
            </div>

            {/* Circular Clocks Grid */}
            <div className="grid grid-cols-3 gap-2">
              {marketClocks.slice(0, 3).map((clock, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-inner relative"
                >
                  <span className="text-base mb-1">{clock.flag}</span>
                  <div className="text-xs font-black text-white">{clock.city}</div>
                  <div className="text-sm font-mono font-black text-amber-400 mt-0.5">{clock.time}</div>
                  <div className="text-[10px] font-mono text-slate-500">{clock.utc}</div>
                  <div className={`mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${clock.statusColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${clock.isOpen ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span>{clock.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
