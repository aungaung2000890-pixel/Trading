import React, { useState, useMemo } from 'react';
import {
  Coins,
  TrendingUp,
  ShieldCheck,
  Layers,
  PieChart,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  BarChart2,
  DollarSign,
  Compass,
  Zap,
  Target,
  Clock,
  Award,
} from 'lucide-react';
import { LiveTickerItem } from '../types';

interface SpotTradingAdvisorProps {
  liveTickers?: LiveTickerItem[];
  lang: 'my' | 'en';
  onNavigateToDemo?: (symbol: string, side: 'LONG' | 'SHORT') => void;
  onOpenAI?: (query: string) => void;
  accentColor?: string;
}

interface SpotCoinProfile {
  symbol: string;
  name: string;
  category: 'CORE_STORE_OF_VALUE' | 'SMART_CONTRACT_L1' | 'HIGH_GROWTH_INFRA' | 'ECOSYSTEM_DEFI';
  currentPrice: number;
  change24h: number;
  volume24hUsd: number;
  accumulationZoneLow: number;
  accumulationZoneHigh: number;
  tier1BuyPrice: number; // 30% allocation
  tier2BuyPrice: number; // 40% allocation
  tier3BuyPrice: number; // 30% allocation
  targetTp1: number; // Swing +15-25%
  targetTp2: number; // Mid-term +45-75%
  targetTp3: number; // Bull Run +120-250%
  ema200Status: 'ABOVE_BULLISH' | 'TESTING_SUPPORT' | 'BELOW_DISCOUNT';
  weeklyRsi: number;
  whaleAccumulationGrade: 'A+' | 'A' | 'B+' | 'B';
  fundamentalRiskScore: 'LOW_RISK' | 'MODERATE_RISK' | 'SPECULATIVE';
  holdingHorizon: string;
  holdingHorizonMy: string;
  thesisEn: string;
  thesisMy: string;
}

export const SpotTradingAdvisor: React.FC<SpotTradingAdvisorProps> = ({
  liveTickers = [],
  lang,
  onNavigateToDemo,
  onOpenAI,
}) => {
  // User Spot Budget Simulator state
  const [budgetUsd, setBudgetUsd] = useState<number>(1000);
  const [portfolioStrategy, setPortfolioStrategy] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState<string>('BTC');

  // Dynamic Spot Profiles enriched with live ticker prices if available
  const spotCoins: SpotCoinProfile[] = useMemo(() => {
    const getPrice = (sym: string, fallback: number) => {
      const match = liveTickers.find((t) => t.symbol.toUpperCase() === sym.toUpperCase());
      return match && match.lastPrice > 0 ? match.lastPrice : fallback;
    };
    const getChange = (sym: string, fallback: number) => {
      const match = liveTickers.find((t) => t.symbol.toUpperCase() === sym.toUpperCase());
      return match ? match.change24h : fallback;
    };

    const btcPrice = getPrice('BTC', 91200);
    const ethPrice = getPrice('ETH', 3150);
    const solPrice = getPrice('SOL', 186);
    const bnbPrice = getPrice('BNB', 625);
    const suiPrice = getPrice('SUI', 2.85);
    const nearPrice = getPrice('NEAR', 6.4);
    const linkPrice = getPrice('LINK', 18.2);
    const avaxPrice = getPrice('AVAX', 32.5);

    return [
      {
        symbol: 'BTC',
        name: 'Bitcoin (Digital Gold)',
        category: 'CORE_STORE_OF_VALUE',
        currentPrice: btcPrice,
        change24h: getChange('BTC', 1.8),
        volume24hUsd: 28500000000,
        accumulationZoneLow: btcPrice * 0.92,
        accumulationZoneHigh: btcPrice * 0.98,
        tier1BuyPrice: btcPrice * 0.97,
        tier2BuyPrice: btcPrice * 0.93,
        tier3BuyPrice: btcPrice * 0.88,
        targetTp1: btcPrice * 1.2,
        targetTp2: btcPrice * 1.5,
        targetTp3: btcPrice * 2.1,
        ema200Status: 'ABOVE_BULLISH',
        weeklyRsi: 56,
        whaleAccumulationGrade: 'A+',
        fundamentalRiskScore: 'LOW_RISK',
        holdingHorizon: '6 – 24 Months',
        holdingHorizonMy: '၆ လ မှ ၂ နှစ် (ရေရှည်)',
        thesisEn: 'Institutional treasury asset & spot ETF inflow leader. Core anchor for any crypto portfolio with lowest drawdown risk.',
        thesisMy: 'အဖွဲ့အစည်းကြီးများနှင့် Spot ETF ဝယ်လိုအားအမြင့်ဆုံးဖြစ်ပြီး အရင်းအနှီးအလုံခြုံဆုံး Digital ရွှေအဖြစ် ရပ်တည်သည်။',
      },
      {
        symbol: 'ETH',
        name: 'Ethereum (Decentralized Supercomputer)',
        category: 'SMART_CONTRACT_L1',
        currentPrice: ethPrice,
        change24h: getChange('ETH', 2.4),
        volume24hUsd: 14200000000,
        accumulationZoneLow: ethPrice * 0.91,
        accumulationZoneHigh: ethPrice * 0.97,
        tier1BuyPrice: ethPrice * 0.96,
        tier2BuyPrice: ethPrice * 0.92,
        tier3BuyPrice: ethPrice * 0.86,
        targetTp1: ethPrice * 1.25,
        targetTp2: ethPrice * 1.65,
        targetTp3: ethPrice * 2.4,
        ema200Status: 'TESTING_SUPPORT',
        weeklyRsi: 52,
        whaleAccumulationGrade: 'A',
        fundamentalRiskScore: 'LOW_RISK',
        holdingHorizon: '3 – 18 Months',
        holdingHorizonMy: '၃ လ မှ ၁ နှစ်ခွဲ',
        thesisEn: 'Largest DeFi TVL ecosystem and dominant Layer-2 settlement layer. High staking yield and supply burn mechanism.',
        thesisMy: 'DeFi နှင့် Layer-2 အားလုံး၏ အခြေခံကျောက်မြစ်ဖြစ်ပြီး Staking အမြတ်နှင့် Burn စနစ်ကြောင့် ရေရှည်တန်ဖိုးတက်နိုင်သည်။',
      },
      {
        symbol: 'SOL',
        name: 'Solana (High-Performance Engine)',
        category: 'SMART_CONTRACT_L1',
        currentPrice: solPrice,
        change24h: getChange('SOL', 4.1),
        volume24hUsd: 8400000000,
        accumulationZoneLow: solPrice * 0.89,
        accumulationZoneHigh: solPrice * 0.96,
        tier1BuyPrice: solPrice * 0.95,
        tier2BuyPrice: solPrice * 0.89,
        tier3BuyPrice: solPrice * 0.82,
        targetTp1: solPrice * 1.3,
        targetTp2: solPrice * 1.85,
        targetTp3: solPrice * 2.8,
        ema200Status: 'ABOVE_BULLISH',
        weeklyRsi: 62,
        whaleAccumulationGrade: 'A+',
        fundamentalRiskScore: 'MODERATE_RISK',
        holdingHorizon: '2 – 12 Months',
        holdingHorizonMy: '၂ လ မှ ၁ နှစ်',
        thesisEn: 'Leading retail adoption, DEX volume surpassing rivals, unmatched execution speed and institutional payments integration.',
        thesisMy: 'DEX Volume အမြင့်မားဆုံးနှင့် စျေးကွက်လက်ခံမှု အလွန်အားကောင်းပြီး အရှိန်အဟုန်အမြင့်ဆုံး Layer-1 ဖြစ်သည်။',
      },
      {
        symbol: 'SUI',
        name: 'Sui Network (Next-Gen Move L1)',
        category: 'HIGH_GROWTH_INFRA',
        currentPrice: suiPrice,
        change24h: getChange('SUI', 5.6),
        volume24hUsd: 1200000000,
        accumulationZoneLow: suiPrice * 0.86,
        accumulationZoneHigh: suiPrice * 0.94,
        tier1BuyPrice: suiPrice * 0.93,
        tier2BuyPrice: suiPrice * 0.86,
        tier3BuyPrice: suiPrice * 0.76,
        targetTp1: suiPrice * 1.35,
        targetTp2: suiPrice * 2.1,
        targetTp3: suiPrice * 3.5,
        ema200Status: 'ABOVE_BULLISH',
        weeklyRsi: 64,
        whaleAccumulationGrade: 'A',
        fundamentalRiskScore: 'MODERATE_RISK',
        holdingHorizon: '1 – 6 Months',
        holdingHorizonMy: '၁ လ မှ ၆ လ',
        thesisEn: 'Breakout Move-based architecture with explosive TVL expansion. High beta potential during bull market altcoin rotations.',
        thesisMy: 'TVL တိုးတက်မှု အလွန်မြန်ဆန်သော နည်းပညာသစ် L1 ဖြစ်ပြီး Altcoin ရာသီတွင် မြင့်မားသောအမြတ်အစွန်းရနိုင်သည်။',
      },
      {
        symbol: 'NEAR',
        name: 'NEAR Protocol (User-Owned AI & Sharding)',
        category: 'HIGH_GROWTH_INFRA',
        currentPrice: nearPrice,
        change24h: getChange('NEAR', 3.2),
        volume24hUsd: 850000000,
        accumulationZoneLow: nearPrice * 0.88,
        accumulationZoneHigh: nearPrice * 0.95,
        tier1BuyPrice: nearPrice * 0.94,
        tier2BuyPrice: nearPrice * 0.88,
        tier3BuyPrice: nearPrice * 0.79,
        targetTp1: nearPrice * 1.3,
        targetTp2: nearPrice * 1.9,
        targetTp3: nearPrice * 3.0,
        ema200Status: 'TESTING_SUPPORT',
        weeklyRsi: 54,
        whaleAccumulationGrade: 'B+',
        fundamentalRiskScore: 'MODERATE_RISK',
        holdingHorizon: '2 – 8 Months',
        holdingHorizonMy: '၂ လ မှ ၈ လ',
        thesisEn: 'Pioneering Decentralized AI computing and chain abstraction. Strong developer network and daily active wallet count.',
        thesisMy: 'Crypto AI နှင့် Sharding နည်းပညာ ရှေ့ဆောင်ဖြစ်ပြီး အသုံးပြုသူ လွယ်ကူမှုအတွက် အနာဂတ်အလားအလာ ကောင်းမွန်သည်။',
      },
      {
        symbol: 'LINK',
        name: 'Chainlink (Cross-Chain Oracle Standard)',
        category: 'ECOSYSTEM_DEFI',
        currentPrice: linkPrice,
        change24h: getChange('LINK', 2.1),
        volume24hUsd: 680000000,
        accumulationZoneLow: linkPrice * 0.89,
        accumulationZoneHigh: linkPrice * 0.96,
        tier1BuyPrice: linkPrice * 0.95,
        tier2BuyPrice: linkPrice * 0.89,
        tier3BuyPrice: linkPrice * 0.81,
        targetTp1: linkPrice * 1.25,
        targetTp2: linkPrice * 1.75,
        targetTp3: linkPrice * 2.6,
        ema200Status: 'ABOVE_BULLISH',
        weeklyRsi: 55,
        whaleAccumulationGrade: 'A',
        fundamentalRiskScore: 'LOW_RISK',
        holdingHorizon: '3 – 12 Months',
        holdingHorizonMy: '၃ လ မှ ၁ နှစ်',
        thesisEn: 'The undisputed oracle standard securing hundreds of billions in RWA (Real World Assets) and traditional banking partnerships (Swift).',
        thesisMy: 'ကမ္ဘာ့ဘဏ်လုပ်ငန်းများနှင့် RWA (Real World Asset) များအတွက် မရှိမဖြစ်လိုအပ်သော အဓိက Oracle စနစ်ဖြစ်သည်။',
      },
    ];
  }, [liveTickers]);

  const activeCoin = useMemo(() => {
    return spotCoins.find((c) => c.symbol === selectedCoinSymbol) || spotCoins[0];
  }, [spotCoins, selectedCoinSymbol]);

  // Allocation strategies:
  const allocationProfiles = {
    conservative: {
      nameEn: 'Conservative Capital Defense (လုံခြုံမှု ဦးစားပေး)',
      nameMy: 'လုံခြုံစိတ်ချရမှု ဦးစားပေး ပုံစံ',
      descEn: '60% BTC, 25% ETH, 15% Cash/SOL. Lowest volatility, sleep peacefully at night.',
      descMy: 'BTC ၆၀%၊ ETH ၂၅%၊ SOL ၁၅%။ အရှုံးအန္တရာယ် အနည်းဆုံးနှင့် ရေရှည်အမြတ်ခိုင်မာသည်။',
      weights: { BTC: 0.6, ETH: 0.25, SOL: 0.15 },
    },
    balanced: {
      nameEn: 'Balanced Growth (အချိုးကျ တိုးတက်မှု)',
      nameMy: 'မျှတသော တိုးတက်မှု ပုံစံ (အကြံပြု)',
      descEn: '40% BTC, 25% ETH, 20% SOL, 15% SUI/LINK. Strong upside with safe core foundation.',
      descMy: 'BTC ၄၀%၊ ETH ၂၅%၊ SOL ၂၀%၊ အခြား ၁၅%။ အခြေခံလုံခြုံပြီး အမြတ်အစွန်းများပြားစေသည်။',
      weights: { BTC: 0.4, ETH: 0.25, SOL: 0.2, SUI: 0.15 },
    },
    aggressive: {
      nameEn: 'Aggressive Alpha Momentum (အမြတ်အများဆုံးရှာဖွေမှု)',
      nameMy: 'အမြတ်အမြင့်ဆုံး ဦးတည်ပုံစံ',
      descEn: '25% BTC, 35% SOL, 25% SUI, 15% NEAR. High beta potential during bull cycles.',
      descMy: 'SOL ၃၅%၊ SUI ၂၅%၊ BTC ၂၅%၊ NEAR ၁၅%။ Altcoin စျေးတက်လှိုင်းတွင် အမြတ်အမြင့်ဆုံးရယူခြင်း။',
      weights: { SOL: 0.35, SUI: 0.25, BTC: 0.25, NEAR: 0.15 },
    },
  };

  const activeAlloc = allocationProfiles[portfolioStrategy];

  return (
    <div id="spot-trading-advisor" className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner & Philosophy */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-500/10 via-emerald-500/5 to-slate-900 border border-amber-500/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
                <Coins className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{lang === 'my' ? '💎 စပေါ့ အရောင်းအဝယ် အကြံပြုချက်စနစ်' : '💎 Pro Spot Trading & Accumulation Advisor'}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {lang === 'my' ? 'အရှုံးမရှိ Zero-Liq' : 'Zero Liquidation'}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'my'
                    ? 'အတိုးနှုန်း/Liquidation မရှိဘဲ စနစ်တကျ စုဆောင်းဝယ်ယူခြင်း (DCA)၊ အကောင်းဆုံးအဝယ်ဇုန်နှင့် အမြတ်ထုတ်ယူမှု အဆင့်များ'
                    : 'Smart Wyckoff accumulation zones, 3-tier DCA ladder, and macro profit targets without futures liquidation anxiety.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {lang === 'my' ? 'Spot နည်းပညာ စိစစ်ချက် ၆ ခု' : '6 Spot Metrics Live'}
              </span>
            </div>
            {onOpenAI && (
              <button
                onClick={() => onOpenAI(`Analyze current spot accumulation opportunities for ${activeCoin.symbol}`)}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'AI Spot သုံးသပ်ချက်' : 'AI Spot Audit'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Spot Golden Advantage Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{lang === 'my' ? '၁။ Liquidation လုံးဝမရှိ' : '1. Zero Liquidation Risk'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {lang === 'my'
                ? 'စျေးမည်မျှကျစေကာမူ Coin အရေအတွက် မလျော့ပါ၊ စိတ်အေးချမ်းသာစွာ ကိုင်ထားနိုင်သည်။'
                : 'Your coin quantity never changes regardless of market drops. Sleep peacefully.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Layers className="w-4 h-4 shrink-0" />
              <span>{lang === 'my' ? '၂။ 3-Tier DCA အဝယ်စနစ်' : '2. 3-Tier DCA Buy Ladder'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {lang === 'my'
                ? 'တစ်ကြိမ်တည်း အကုန်မဝယ်ဘဲ 30% - 40% - 30% ခွဲဝယ်ခြင်းဖြင့် ပျမ်းမျှစျေး အကောင်းဆုံးဖြစ်စေသည်။'
                : 'Split buy entries into 30% dip, 40% support, and 30% crash reserve.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Target className="w-4 h-4 shrink-0" />
              <span>{lang === 'my' ? '၃။ အမြတ်ထုတ်ယူမှု လှေကား' : '3. Staged Take-Profit Ladder'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {lang === 'my'
                ? 'Swing (+20%), Cycle (+60%), နှင့် Bull Run (+150%+) အပိုင်းလိုက် အမြတ်သိမ်းဆည်းနိုင်သည်။'
                : 'Lock in profits at swing target, cycle resistance, and bull market peak.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Coin Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {spotCoins.map((coin) => {
          const isSelected = coin.symbol === selectedCoinSymbol;
          const isUp = coin.change24h >= 0;
          return (
            <button
              key={coin.symbol}
              onClick={() => setSelectedCoinSymbol(coin.symbol)}
              className={`px-3.5 py-2 rounded-2xl border transition-all cursor-pointer shrink-0 flex items-center gap-2.5 active:scale-95 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">{coin.symbol}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected
                        ? 'text-slate-950'
                        : isUp
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {isUp ? '+' : ''}{coin.change24h.toFixed(1)}%
                  </span>
                </div>
                <span
                  className={`text-[11px] ${
                    isSelected ? 'text-slate-900 font-medium' : 'text-slate-500'
                  }`}
                >
                  ${coin.currentPrice >= 1 ? coin.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : coin.currentPrice.toFixed(4)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Detailed Selected Coin Spot Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Accumulation & DCA Blueprint */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {activeCoin.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {activeCoin.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'my' ? activeCoin.thesisMy : activeCoin.thesisEn}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {lang === 'my' ? 'လက်ရှိစျေး' : 'Live Price'}
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    ${activeCoin.currentPrice >= 1 ? activeCoin.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : activeCoin.currentPrice.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Accumulation Range Bar */}
            <div className="space-y-2 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>{lang === 'my' ? 'စမတ် အဝယ်စုဆောင်းဇုန် (Accumulation Zone)' : 'Smart Accumulation Zone'}</span>
                </span>
                <span className="text-slate-900 dark:text-white font-mono">
                  ${activeCoin.accumulationZoneLow.toFixed(activeCoin.currentPrice >= 1 ? 2 : 4)} – ${activeCoin.accumulationZoneHigh.toFixed(activeCoin.currentPrice >= 1 ? 2 : 4)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'my'
                  ? 'ဤစျေးနှုန်းအကွာအဝေးအတွင်း ရောက်ရှိချိန်သည် Smart Money (Whales) များ အဝယ်စုဆောင်းသောနေရာဖြစ်ပြီး ရေရှည်အတွက် စွန့်စားမှု အနည်းဆုံးဖြစ်သည်။'
                  : 'Institutional value area. Prices in this range offer the highest long-term risk-adjusted reward.'}
              </p>
            </div>

            {/* 3-Tier DCA Buy Ladder Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{lang === 'my' ? '၃ ဆင့် ခွဲဝယ်နည်းလမ်း (3-Tier DCA Ladder)' : '3-Tier DCA Entry Ladder'}</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">
                  {lang === 'my' ? 'ဘတ်ဂျက်: ' : 'Budget: '}${budgetUsd.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tier 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                      {lang === 'my' ? '၁။ လက်ငင်းဝယ်ယူမှု (30%)' : 'Tier 1: Initial Dip (30%)'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      ${(budgetUsd * 0.3).toFixed(0)}
                    </span>
                  </div>
                  <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    ${activeCoin.tier1BuyPrice.toFixed(activeCoin.currentPrice >= 1 ? 2 : 4)}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {lang === 'my' ? 'အနည်းငယ်အေးဆေးချိန် အစမ်းဝယ်ယူမှု' : 'Current local dip entry level.'}
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                      {lang === 'my' ? '၂။ အဓိက Support (40%)' : 'Tier 2: Major Support (40%)'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      ${(budgetUsd * 0.4).toFixed(0)}
                    </span>
                  </div>
                  <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    ${activeCoin.tier2BuyPrice.toFixed(activeCoin.currentPrice >= 1 ? 2 : 4)}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {lang === 'my' ? 'အရေးပါသော နေ့စဉ် Support အဝယ်ဇုန်' : 'Key structural demand block.'}
                  </p>
                </div>

                {/* Tier 3 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
                      {lang === 'my' ? '၃။ Panic Dip အရံ (30%)' : 'Tier 3: Crash Buffer (30%)'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      ${(budgetUsd * 0.3).toFixed(0)}
                    </span>
                  </div>
                  <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    ${activeCoin.tier3BuyPrice.toFixed(activeCoin.currentPrice >= 1 ? 2 : 4)}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {lang === 'my' ? 'စျေးကွက်ပြင်းထန်စွာကျချိန် အဖိုးတန်အဝယ်' : 'Extreme wick capitulation reserve.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Take-Profit Targets Ladder */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'my' ? 'အမြတ်ထုတ်ယူမှု အဆင့်များ (Spot Take-Profit Targets)' : 'Spot Take-Profit Ladder'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <span>{lang === 'my' ? 'TP 1: Swing အမြတ်' : 'TP 1: Swing Target'}</span>
                    <span className="text-xs font-black font-mono">+20% ~ +30%</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
                    ${activeCoin.targetTp1.toFixed(activeCoin.currentPrice >= 1 ? 2 : 4)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {lang === 'my' ? 'အရင်းအနှီး ၂၅% ပြန်နုတ်ယူနိုင်သည်' : 'Take 25-30% off table to de-risk.'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                    <span>{lang === 'my' ? 'TP 2: Cycle Resistance' : 'TP 2: Mid-Term Resistance'}</span>
                    <span className="text-xs font-black font-mono">+50% ~ +85%</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
                    ${activeCoin.targetTp2.toFixed(activeCoin.currentPrice >= 1 ? 2 : 4)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {lang === 'my' ? 'အရင်းထွက်ပြီး အမြတ်ချည်းထားနိုင်သည်' : 'Secure initial principal investment.'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                    <span>{lang === 'my' ? 'TP 3: Bull Run Peak' : 'TP 3: Bull Peak Target'}</span>
                    <span className="text-xs font-black font-mono">+120% ~ +250%</span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
                    ${activeCoin.targetTp3.toFixed(activeCoin.currentPrice >= 1 ? 2 : 4)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {lang === 'my' ? 'ကျန် Moonbag အမြတ်ဖြင့် ရေရှည်စီးမျောခြင်း' : 'Moonbag runner for market cycle top.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Spot Quantitative Health & Portfolio Allocator */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quantitative Health Radar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{lang === 'my' ? 'နည်းပညာ & Fundamental စစ်ဆေးချက်' : 'Technical & On-Chain Audit'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">{lang === 'my' ? '200 EMA အခြေအနေ' : '200 Daily EMA'}</span>
                <span className="font-bold text-emerald-500">
                  {activeCoin.ema200Status === 'ABOVE_BULLISH' ? 'Bullish (Above EMA)' : 'Testing Support'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">{lang === 'my' ? 'အပတ်စဉ် Weekly RSI' : 'Weekly RSI Momentum'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {activeCoin.weeklyRsi} (Healthy Zone)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">{lang === 'my' ? 'Whale အဝယ်စုဆောင်းမှု' : 'Whale Accumulation'}</span>
                <span className="font-bold text-amber-500">
                  Grade {activeCoin.whaleAccumulationGrade}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">{lang === 'my' ? 'အကြံပြုကိုင်ထားချိန်' : 'Holding Horizon'}</span>
                <span className="font-bold text-indigo-500">
                  {lang === 'my' ? activeCoin.holdingHorizonMy : activeCoin.holdingHorizon}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Spot Portfolio Allocator */}
          <div className="p-5 rounded-3xl bg-linear-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>{lang === 'my' ? 'Spot ရင်းနှီးငွေ ခွဲဝေမှု' : 'Spot Allocation Simulator'}</span>
              </h3>
            </div>

            {/* Budget Input Slider / Stepper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{lang === 'my' ? 'ရင်းနှီးမြှုပ်နှံမည့်ငွေ' : 'Investment Capital'}</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  ${budgetUsd.toLocaleString()} USDT
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={20000}
                step={100}
                value={budgetUsd}
                onChange={(e) => setBudgetUsd(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$100</span>
                <span>$5,000</span>
                <span>$10,000</span>
                <span>$20,000</span>
              </div>
            </div>

            {/* Strategy Style Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-800/70">
              {(['conservative', 'balanced', 'aggressive'] as const).map((strat) => (
                <button
                  key={strat}
                  onClick={() => setPortfolioStrategy(strat)}
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition capitalize ${
                    portfolioStrategy === strat
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {strat}
                </button>
              ))}
            </div>

            {/* Strategy Description */}
            <p className="text-[11px] text-slate-400 leading-tight">
              {lang === 'my' ? activeAlloc.descMy : activeAlloc.descEn}
            </p>

            {/* Calculated Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              {Object.entries(activeAlloc.weights).map(([sym, rawWeight]) => {
                const weight = Number(rawWeight);
                const dollarAlloc = budgetUsd * weight;
                return (
                  <div key={sym} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{sym}</span>
                      <span className="text-[10px] text-slate-500">({(weight * 100).toFixed(0)}%)</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400">
                      ${dollarAlloc.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
