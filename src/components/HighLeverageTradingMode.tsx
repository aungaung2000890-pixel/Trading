import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Percent,
  Calculator,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Info,
  ChevronRight,
  Newspaper,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Sliders,
  DollarSign,
  Clock,
  Filter,
} from 'lucide-react';
import { MarketType, AIAssistantResponse, CoinOpportunity, LiveTickerItem } from '../types';
import { TOP_COIN_OPPORTUNITIES, MACRO_DATA } from '../data/staticAnalysis';
import { CURATED_CRYPTO_NEWS } from '../data/newsData';
import { queryAITradingAssistant } from '../services/aiAssistantClient';
import { computeDetailedSignalFeesAndExit } from '../utils/technicalAnalysis';

interface MultiplierCoinMeta {
  symbol: string;
  name: string;
  maxLeverage: number;
  liquidityTier: 'TIER_1' | 'TIER_2' | 'VOLATILE_ALT';
  feasibility: 'HIGH' | 'MEDIUM' | 'CAUTION';
  defaultSpread: string;
  catalystTag?: string;
  catalystTagMy?: string;
}

const MULTIPLIER_COIN_SPECS: MultiplierCoinMeta[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    maxLeverage: 100,
    liquidityTier: 'TIER_1',
    feasibility: 'HIGH',
    defaultSpread: '< 0.01%',
    catalystTag: 'ETF Inflows & $78k Resistance',
    catalystTagMy: 'ETF ငွေစီးဝင်မှု & $78k Resistance',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    maxLeverage: 100,
    liquidityTier: 'TIER_1',
    feasibility: 'HIGH',
    defaultSpread: '< 0.02%',
    catalystTag: '$2,450 Demand Zone Test',
    catalystTagMy: '$2,450 Demand Zone စမ်းသပ်မှု',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    maxLeverage: 50,
    liquidityTier: 'TIER_1',
    feasibility: 'HIGH',
    defaultSpread: '< 0.03%',
    catalystTag: 'Network Upgrade & $100 Psychological S/R',
    catalystTagMy: 'Network Upgrade & $100 စိတ်ပိုင်းဆိုင်ရာ အဆင့်',
  },
  {
    symbol: 'LSK',
    name: 'Lisk',
    maxLeverage: 30,
    liquidityTier: 'VOLATILE_ALT',
    feasibility: 'CAUTION',
    defaultSpread: '~ 0.15%',
    catalystTag: '100M Token Burn Proposal (Extreme Volatility)',
    catalystTagMy: '100M LSK Burn သတင်း (အလွန်လှိုင်းခတ်)',
  },
  {
    symbol: 'CVC',
    name: 'Civic',
    maxLeverage: 25,
    liquidityTier: 'VOLATILE_ALT',
    feasibility: 'CAUTION',
    defaultSpread: '~ 0.20%',
    catalystTag: 'Negative Funding Rate (-2.00%) Squeeze',
    catalystTagMy: 'Funding Rate အနုတ်ပြ Short Squeeze',
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    maxLeverage: 50,
    liquidityTier: 'TIER_2',
    feasibility: 'HIGH',
    defaultSpread: '< 0.04%',
    catalystTag: 'Retail Volume & Meme S/R Rotation',
    catalystTagMy: 'Retail Volume & Support စမ်းသပ်မှု',
  },
  {
    symbol: 'STEEM',
    name: 'Steem',
    maxLeverage: 25,
    liquidityTier: 'VOLATILE_ALT',
    feasibility: 'CAUTION',
    defaultSpread: '~ 0.18%',
    catalystTag: 'Derivatives Volume Influx (+33.7%)',
    catalystTagMy: 'Futures Volume စီးဝင်မှု (+33.7%)',
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    maxLeverage: 50,
    liquidityTier: 'TIER_1',
    feasibility: 'HIGH',
    defaultSpread: '< 0.02%',
    catalystTag: 'Launchpool Ecosystem Demand',
    catalystTagMy: 'Launchpool Ecosystem ဝယ်လိုအား',
  },
];

interface HighLeverageTradingModeProps {
  currentPrice?: number;
  symbol?: string;
  language: 'en' | 'my';
  coins?: CoinOpportunity[];
  liveTickers?: LiveTickerItem[];
  walletBalance?: number;
  onWalletBalanceChange?: (newBalance: number) => void;
  onExecuteTrade?: (trade: {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    leverage: number;
    margin: number;
  }) => void;
  onBack?: () => void;
}

export const HighLeverageTradingMode: React.FC<HighLeverageTradingModeProps> = ({
  currentPrice: initialPrice,
  symbol: initialSymbol = 'SOL',
  language,
  coins = TOP_COIN_OPPORTUNITIES,
  liveTickers = [],
  walletBalance = 2000,
  onWalletBalanceChange,
  onExecuteTrade,
  onBack,
}) => {
  // Selected Coin
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [coinFilter, setCoinFilter] = useState<'all' | '100x' | '50x' | 'catalyst'>('all');

  // Multiplier Coin Meta
  const coinSpec = useMemo(() => {
    return (
      MULTIPLIER_COIN_SPECS.find((c) => c.symbol === selectedSymbol) || {
        symbol: selectedSymbol,
        name: selectedSymbol,
        maxLeverage: 50,
        liquidityTier: 'TIER_2' as const,
        feasibility: 'MEDIUM' as const,
        defaultSpread: '~ 0.05%',
        catalystTag: 'Futures Perpetual Speculation',
        catalystTagMy: 'Futures စျေးကွက် ရင်းနှီးမြှုပ်နှံမှု',
      }
    );
  }, [selectedSymbol]);

  // Find active coin data from props or static
  const activeCoinData = useMemo(() => {
    const fromCoins = coins.find((c) => c.symbol === selectedSymbol);
    if (fromCoins) return fromCoins;
    const staticCoin = TOP_COIN_OPPORTUNITIES.find((c) => c.symbol === selectedSymbol);
    return staticCoin || null;
  }, [selectedSymbol, coins]);

  // Live Ticker data if available
  const activeTicker = useMemo(() => {
    return liveTickers.find((t) => t.symbol === selectedSymbol) || null;
  }, [selectedSymbol, liveTickers]);

  // Current Price resolution
  const livePrice = useMemo(() => {
    if (activeTicker?.lastPrice) return activeTicker.lastPrice;
    if (activeCoinData?.currentPrice) return activeCoinData.currentPrice;
    if (initialPrice && selectedSymbol === initialSymbol) return initialPrice;
    return 100;
  }, [activeTicker, activeCoinData, initialPrice, selectedSymbol, initialSymbol]);

  const change24h = useMemo(() => {
    if (activeTicker?.change24h !== undefined) return activeTicker.change24h;
    if (activeCoinData?.change24h !== undefined) return activeCoinData.change24h;
    return 0;
  }, [activeTicker, activeCoinData]);

  // Trade Setup State
  const [marketType, setMarketType] = useState<MarketType>('crypto');
  const [margin, setMargin] = useState<number>(200);
  const [leverage, setLeverage] = useState<number>(35);
  const [desiredRiskPercent, setDesiredRiskPercent] = useState<number>(2);
  const [direction, setDirection] = useState<'LONG' | 'SHORT' | 'AUTO'>('LONG');
  const [tradingStyle, setTradingStyle] = useState<'scalp' | 'breakout' | 'momentum'>('scalp');

  // Ensure leverage doesn't exceed coin max
  useEffect(() => {
    if (leverage > coinSpec.maxLeverage) {
      setLeverage(coinSpec.maxLeverage);
    }
  }, [coinSpec.maxLeverage, leverage]);

  // AI Audit State
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AIAssistantResponse | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Precision check
  const isDecimals = livePrice < 1;
  const price = livePrice > 0 ? livePrice : 100;

  // Selected coin news catalyst
  const currentNewsCatalyst = useMemo(() => {
    if (activeCoinData) {
      return language === 'my'
        ? activeCoinData.newsCatalystMy || activeCoinData.newsCatalyst
        : activeCoinData.newsCatalyst;
    }
    // Check curated news
    const relatedNews = CURATED_CRYPTO_NEWS.find((n) =>
      n.affectedCoins.includes(selectedSymbol)
    );
    if (relatedNews) {
      return language === 'my' ? relatedNews.summaryMy : relatedNews.summary;
    }
    return coinSpec.catalystTag
      ? language === 'my'
        ? coinSpec.catalystTagMy
        : coinSpec.catalystTag
      : 'Institutional derivatives volume and technical chart consolidation.';
  }, [activeCoinData, selectedSymbol, language, coinSpec]);

  // Direction Auto-determination if user chooses AUTO
  const resolvedDirection = useMemo<'LONG' | 'SHORT'>(() => {
    if (direction === 'LONG' || direction === 'SHORT') return direction;
    // AUTO recommendation
    if (activeCoinData?.bias === 'SHORT') return 'SHORT';
    if (activeCoinData?.bias === 'LONG') return 'LONG';
    if (change24h > 15) return 'SHORT'; // Mean-reversion scalp
    if (change24h < -4) return 'LONG'; // Support bounce
    return 'LONG';
  }, [direction, activeCoinData, change24h]);

  // News and Direction Alignment Check
  const directionNewsAnalysis = useMemo(() => {
    let aligned = true;
    let statusBadge: 'aligned' | 'warning' | 'conflict' = 'aligned';
    let reasoningMy = '';
    let reasoningEn = '';

    if (resolvedDirection === 'LONG') {
      if (change24h < -5) {
        aligned = false;
        statusBadge = 'warning';
        reasoningMy = `သတိပေးချက်: ${selectedSymbol} သည် ၂၄ နာရီအတွင်း ${change24h}% ကျဆင်းနေသည်။ Downward Momentum ရှိနေသဖြင့် Key Support ($${(price * 0.98).toFixed(isDecimals ? 4 : 2)}) မှ Rebound မဖြစ်မီ Long အလျင်စလို မဝင်သင့်ပါ။`;
        reasoningEn = `Caution: ${selectedSymbol} is down ${change24h}% in 24h. Counter-trend long requires confirmed support bounce to avoid knife-catching.`;
      } else if (change24h > 40) {
        aligned = false;
        statusBadge = 'warning';
        reasoningMy = `သတိပေးချက်: စျေးနှုန်းသည် Parabolic တက်နေပြီး RSI အလွန်မြင့်မားနေသည်။ Long အသစ်ဖွင့်ခြင်းထက် Pullback Support စောင့်ဆိုင်းသင့်သည်။`;
        reasoningEn = `Warning: Parabolic expansion with overheated momentum. High risk of immediate long-squeeze pullback.`;
      } else {
        statusBadge = 'aligned';
        reasoningMy = `သင့်လျော်မှုရှိသည်: ${selectedSymbol} ၏ လက်ရှိစျေးကွက်အနေအထားနှင့် သတင်းစီးဆင်းမှုသည် Long ဘက်သို့ ဦးတည်ချက် ကောင်းမွန်ပါသည်။`;
        reasoningEn = `Favorable alignment: Technical structure and order flow support a long position with tight stop control.`;
      }
    } else {
      // SHORT
      if (change24h > 20) {
        aligned = false;
        statusBadge = 'conflict';
        reasoningMy = `ပြင်းထန်သော သတိပေးချက်: ${selectedSymbol} သည် Short Squeeze ဖြစ်ပေါ်နေပြီး Funding Fee မြင့်မားနေသည်။ Short ရောင်းချခြင်းသည် အလွန်အန္တရာယ်ကြီးမားသည် (High Risk)။`;
        reasoningEn = `Severe Warning: Strong short squeeze in progress. Selling into violent momentum carries elevated liquidation risk.`;
      } else if (change24h < -10) {
        statusBadge = 'warning';
        reasoningMy = `သတိပေးချက်: စျေးကွက် ကျဆင်းမှုများပြားထားပြီးဖြစ်၍ Oversold Bounce ဖြစ်ပေါ်နိုင်ပါသည်။ Breakout Retest သေချာမှ Short ဝင်ပါ။`;
        reasoningEn = `Caution: Extended downward impulse may trigger sharp oversold mean-reversion bounces.`;
      } else {
        statusBadge = 'aligned';
        reasoningMy = `သင့်လျော်မှုရှိသည်: Resistance ဧရိယာအနီးတွင် ရောင်းအားကျဆင်းမှုနှင့်အတူ Short ဦးတည်ချက်သည် စွန့်စားမှု အချိုးညီပါသည်။`;
        reasoningEn = `Favorable alignment: Rejection at resistance confirms structural short opportunity.`;
      }
    }

    return { aligned, statusBadge, reasoningMy, reasoningEn };
  }, [resolvedDirection, change24h, selectedSymbol, price, isDecimals]);

  // Dynamic Smart Setup Recommendation Engine (Direction & Leverage)
  const smartSetupRecommendation = useMemo(() => {
    const usable = Math.max(1, margin);
    const balance = Math.max(10, walletBalance);
    const ratio = usable / balance; // percentage of wallet balance
    const coinMax = coinSpec.maxLeverage;
    const absChange = Math.abs(change24h);
    const slPct = tradingStyle === 'scalp' ? 1.0 : tradingStyle === 'breakout' ? 1.5 : 2.0;

    // -------------------------------------------------------------
    // 1. DIRECTION DETERMINATION (LONG vs SHORT)
    // -------------------------------------------------------------
    let recDirection: 'LONG' | 'SHORT' = 'LONG';
    let dirConfidence = 82;
    let dirSignalTagMy = 'Bullish Trend အားကောင်းမှု';
    let dirSignalTagEn = 'Strong Bullish Trend';
    let dirReasonMy = '';
    let dirReasonEn = '';

    if (activeCoinData?.bias === 'SHORT') {
      recDirection = 'SHORT';
      dirConfidence = 85;
      dirSignalTagMy = 'Bearish Reversal (ရောင်းအားဖိအား)';
      dirSignalTagEn = 'Bearish Reversal Pressure';
      dirReasonMy = `${selectedSymbol} ၏ နည်းပညာပိုင်းဆိုင်ရာ Technical Chart တွင် Resistance ဇုန်အောက်၌ ရောင်းအားဖိအား (Seller Volume) စုပြုံနေပြီး Breakdown ပြန်ကျနိုင်ခြေ မြင့်မားနေသဖြင့် SHORT (အရောင်း) ဖွင့်ရန် စနစ်မှ အလေးအနက် အကြံပြုပါသည်။`;
      dirReasonEn = `${selectedSymbol} technical structure shows heavy resistance rejection with seller dominance. Favorable for SHORT.`;
    } else if (activeCoinData?.bias === 'LONG') {
      recDirection = 'LONG';
      dirConfidence = 86;
      dirSignalTagMy = 'Bullish Expansion (အဝယ်အားကောင်း)';
      dirSignalTagEn = 'Bullish Expansion & Breakout';
      dirReasonMy = `${selectedSymbol} ၏ အဓိက Trend သည် အထက်သို့ ဦးတည်နေပြီး အဝယ်အား (Buyer Volume) အားကောင်းလျက်ရှိသဖြင့် Trend နှင့်အပြိုင် စီးမျောနိုင်ရန် LONG (အဝယ်) ဖွင့်ရန် စနစ်မှ အလေးအနက် အကြံပြုပါသည်။`;
      dirReasonEn = `Primary trend is strongly bullish with sustained accumulation. High probability for LONG continuation.`;
    } else if (change24h > 15) {
      recDirection = 'SHORT';
      dirConfidence = 78;
      dirSignalTagMy = 'Overheated Pullback (အဝယ်လွန် စျေးပြန်ဆင်းနိုင်ခြေ)';
      dirSignalTagEn = 'Overheated Mean Reversion';
      dirReasonMy = `${selectedSymbol} သည် ၂၄ နာရီအတွင်း +${change24h.toFixed(1)}% အထိ အလွန်အမင်းတက်ထားပြီး Resistance အနီးသို့ ရောက်ရှိနေ၍ စျေးပြန်ဆင်းနိုင်ခြေ (Mean-Reversion Pullback) များသဖြင့် အမြန်ဆတိုး SHORT (အရောင်း) ကို အကြံပြုပါသည်။`;
      dirReasonEn = `Parabolic rally (+${change24h.toFixed(1)}%) testing macro resistance. High likelihood of profit-taking pullback. Recommending SHORT.`;
    } else if (change24h < -4) {
      recDirection = 'LONG';
      dirConfidence = 80;
      dirSignalTagMy = 'Oversold Support Bounce (စျေးကျပြီး ပြန်တက်နိုင်ခြေ)';
      dirSignalTagEn = 'Oversold Support Bounce';
      dirReasonMy = `${selectedSymbol} သည် ၂၄ နာရီအတွင်း ${change24h.toFixed(1)}% ကျဆင်းထားပြီး အဓိက Key Demand Support ဧရိယာသို့ ရောက်ရှိနေသဖြင့် Rebound ပြန်တက်နိုင်ခြေ မြင့်မားသည်။ ထို့ကြောင့် LONG (အဝယ်) ဘက်မှ စောင့်ဆိုင်းဖမ်းယူရန် အကြံပြုပါသည်။`;
      dirReasonEn = `${selectedSymbol} is oversold at key support level with favorable risk-reward for an oversold LONG bounce.`;
    } else {
      recDirection = 'LONG';
      dirConfidence = 81;
      dirSignalTagMy = 'Trend Continuation (ပုံမှန်တက်ရိပ်)';
      dirSignalTagEn = 'Trend Continuation';
      dirReasonMy = `${selectedSymbol} ၏ စျေးကွက်အနေအထားနှင့် သတင်းစီးဆင်းမှုမှာ တည်ငြိမ်ပြီး အထက်သို့ ဦးတည်ချက် ကောင်းမွန်နေသဖြင့် စွန့်စားမှုနည်းသော LONG (အဝယ်) ကို အကြံပြုပါသည်။`;
      dirReasonEn = `Stable accumulation and positive market backdrop indicate favorable conditions for LONG.`;
    }

    // -------------------------------------------------------------
    // 2. LEVERAGE RECOMMENDATION (Based on Margin & Wallet Ratio)
    // -------------------------------------------------------------
    const maxMathSafeLev = Math.max(10, Math.floor(98 / (slPct * 1.5)));

    let optimalLev = 25;
    let conservativeLev = 15;
    let aggressiveLev = 35;
    let reasonMy = '';
    let reasonEn = '';
    let allocationCategory: 'LARGE_ALLOCATION' | 'BALANCED_ALLOCATION' | 'TACTICAL_SCALP' = 'BALANCED_ALLOCATION';

    if (ratio >= 0.25) {
      // High capital allocation (> 25% of wallet balance)
      allocationCategory = 'LARGE_ALLOCATION';
      conservativeLev = 10;
      optimalLev = Math.min(12, coinMax);
      aggressiveLev = Math.min(20, coinMax);
      reasonMy = `သင်ထည့်သွင်းထားသော အရင်းအနှီး $${usable.toLocaleString()} သည် သင့် Wallet လက်ကျန် ($${balance.toLocaleString()}) ၏ ${(ratio * 100).toFixed(1)}% ဖြစ်နေပါသည်။ အရင်းအနှီးများပြားသည့်အတွက် အကောင့်မဆုံးရှုံးစေရန် Leverage အနိမ့် (${optimalLev}x) ဖြင့်သာ ကစားရန် စနစ်မှ အလေးအနက် အကြံပြုပါသည်။ Position ကြီးမားသဖြင့် သေးငယ်သော ဆတိုးဖြင့်ပင် အမြတ်လုံလောက်စွာ ရရှိနိုင်ပါသည်။`;
      reasonEn = `Your usable amount of $${usable.toLocaleString()} is ${(ratio * 100).toFixed(1)}% of your wallet. Strict capital preservation requires lower leverage (${optimalLev}x) to protect your account.`;
    } else if (ratio >= 0.08) {
      // Moderate capital allocation (8% - 25% of wallet)
      allocationCategory = 'BALANCED_ALLOCATION';
      conservativeLev = Math.min(15, coinMax);
      optimalLev = Math.min(coinMax >= 50 ? 25 : 20, coinMax);
      aggressiveLev = Math.min(coinMax >= 50 ? 35 : 25, coinMax);
      reasonMy = `သင်ထည့်သွင်းထားသော အရင်းအနှီး $${usable.toLocaleString()} သည် သင့် Wallet ၏ ${(ratio * 100).toFixed(1)}% ဖြစ်ပြီး မျှတသော အချိုးအစားဖြစ်ပါသည်။ သတ်မှတ်ထားသော Stop Loss (-${slPct}%) ထက် Liquidation Distance (~${((1 / optimalLev) * 98).toFixed(1)}%) သည် ၃ ဆကျော် ပိုမိုဝေးကွာလုံခြုံမှုရှိစေရန် ${optimalLev}x Leverage ကို အကြံပြုပါသည်။`;
      reasonEn = `Your usable amount of $${usable.toLocaleString()} is ${(ratio * 100).toFixed(1)}% of your wallet. A balanced ${optimalLev}x leverage gives a safe 3x+ liquidation buffer over your ${slPct}% Stop Loss.`;
    } else {
      // Small tactical allocation (< 8% of wallet)
      allocationCategory = 'TACTICAL_SCALP';
      conservativeLev = Math.min(20, coinMax);
      if (coinSpec.liquidityTier === 'VOLATILE_ALT' || absChange > 15) {
        optimalLev = Math.min(25, coinMax);
        aggressiveLev = Math.min(35, coinMax);
        reasonMy = `သင်ထည့်သွင်းထားသော အရင်းအနှီး $${usable.toLocaleString()} သည် Wallet ၏ ${(ratio * 100).toFixed(1)}% သာရှိသော်လည်း ${selectedSymbol} ၏ စျေးကွက်လှိုင်းခတ်မှု (${change24h > 0 ? '+' : ''}${change24h.toFixed(1)}%) မြင့်မားနေသဖြင့် ဘေးကင်းစေရန် ${optimalLev}x Leverage ကို အကြံပြုပါသည်။`;
        reasonEn = `Small capital allocation with elevated market volatility. Recommending ${optimalLev}x for safety.`;
      } else {
        optimalLev = Math.min(coinMax >= 75 ? 50 : coinMax >= 50 ? 35 : 25, coinMax);
        aggressiveLev = Math.min(coinMax >= 75 ? 75 : 50, coinMax);
        reasonMy = `သင်ထည့်သွင်းထားသော အရင်းအနှီး $${usable.toLocaleString()} သည် Wallet ၏ ${(ratio * 100).toFixed(1)}% သာရှိသဖြင့် စွန့်စားရငွေ အနည်းငယ်သာဖြစ်ပြီး အမြန်ဆတိုး (High-Multiplier Scalp) ${optimalLev}x ဖြင့် အမြတ်ဖမ်းယူရန် အသင့်တော်ဆုံး ဖြစ်ပါသည်။ Stop Loss ကို တင်းကျပ်စွာ ထားရှိရပါမည်။`;
        reasonEn = `Small capital allocation (${(ratio * 100).toFixed(1)}% of wallet). Optimal for ${optimalLev}x high-multiplier scalping with strict stop loss discipline.`;
      }
    }

    // Final safety clamps
    optimalLev = Math.max(10, Math.min(optimalLev, coinMax, maxMathSafeLev));
    conservativeLev = Math.max(10, Math.min(conservativeLev, optimalLev, coinMax));
    aggressiveLev = Math.max(optimalLev, Math.min(aggressiveLev, coinMax, maxMathSafeLev));

    const estLiqAtOptimal = +((1 / optimalLev) * 98).toFixed(2);
    const positionAtOptimal = +(usable * optimalLev).toFixed(2);
    const slLossDollar = +(usable * (slPct / 100) * optimalLev).toFixed(2);
    const bufferRatio = +(estLiqAtOptimal / slPct).toFixed(1);

    return {
      // Direction Recommendations
      recDirection,
      dirConfidence,
      dirSignalTagMy,
      dirSignalTagEn,
      dirReasonMy,
      dirReasonEn,
      // Leverage Recommendations
      usableAmount: usable,
      amountRatioPercent: +(ratio * 100).toFixed(1),
      optimalLev,
      conservativeLev,
      aggressiveLev,
      reasonMy,
      reasonEn,
      allocationCategory,
      estLiqAtOptimal,
      positionAtOptimal,
      slLossDollar,
      slPct,
      bufferRatio,
    };
  }, [margin, walletBalance, coinSpec, change24h, tradingStyle, selectedSymbol, activeCoinData]);

  // Real-time Risk Engine Calculations
  const riskMetrics = useMemo(() => {
    const positionNotional = margin * leverage;
    // Liquidation distance estimate with 0.5% maintenance margin
    const liquidationDistancePct = +((1 / leverage) * 0.98 * 100).toFixed(2);
    const maxDollarLoss = +(walletBalance * (desiredRiskPercent / 100)).toFixed(2);

    // Dynamic SL based on trading style
    const slPct = tradingStyle === 'scalp' ? 1.0 : tradingStyle === 'breakout' ? 1.5 : 2.0;
    const slDistance = (price * slPct) / 100;

    const stopLossPrice =
      resolvedDirection === 'LONG'
        ? +(price - slDistance).toFixed(isDecimals ? 4 : 2)
        : +(price + slDistance).toFixed(isDecimals ? 4 : 2);

    const tp1Distance = slDistance * 1.8;
    const tp2Distance = slDistance * 3.0;

    const tp1Price =
      resolvedDirection === 'LONG'
        ? +(price + tp1Distance).toFixed(isDecimals ? 4 : 2)
        : +(price - tp1Distance).toFixed(isDecimals ? 4 : 2);

    const tp2Price =
      resolvedDirection === 'LONG'
        ? +(price + tp2Distance).toFixed(isDecimals ? 4 : 2)
        : +(price - tp2Distance).toFixed(isDecimals ? 4 : 2);

    const estLiquidationPrice =
      resolvedDirection === 'LONG'
        ? +(price * (1 - liquidationDistancePct / 100)).toFixed(isDecimals ? 4 : 2)
        : +(price * (1 + liquidationDistancePct / 100)).toFixed(isDecimals ? 4 : 2);

    // Projected Profit at TP1 & TP2 ($)
    const tp1ProfitDollar = +(positionNotional * (tp1Distance / price)).toFixed(2);
    const tp2ProfitDollar = +(positionNotional * (tp2Distance / price)).toFixed(2);

    // Safe Position Size Formula: Position Size = Max Risk $ / (SL Distance % / 100)
    const safePositionSize = +(maxDollarLoss / (slPct / 100)).toFixed(2);
    const safeMarginAtRequestedLeverage = +(safePositionSize / leverage).toFixed(2);

    // Approval logic
    let approvalStatus: 'APPROVED' | 'HIGH_RISK' | 'REJECTED' = 'HIGH_RISK';
    let rejectionReason = '';

    if (slPct >= liquidationDistancePct) {
      approvalStatus = 'REJECTED';
      rejectionReason =
        language === 'my'
          ? `Stop Loss (${slPct}%) သည် Liquidation Distance (${liquidationDistancePct}%) ထက် ကျယ်နေသဖြင့် Stop Loss မထိမီ စာရင်းရှင်းခံရမည် (Liquidated)!`
          : `Stop Loss distance (${slPct}%) exceeds Liquidation distance (${liquidationDistancePct}%). You will be liquidated before SL hits!`;
    } else if (leverage >= 75) {
      approvalStatus = 'HIGH_RISK';
      rejectionReason =
        language === 'my'
          ? `${leverage}x leverage သည် အလွန်အန္တရာယ်ကြီးမားသည်။ Margin ကို $${safeMarginAtRequestedLeverage} သာ သုံးစွဲရန် အကြံပြုသည်။`
          : `${leverage}x leverage is extreme. Max loss must be preserved by reducing margin to $${safeMarginAtRequestedLeverage}.`;
    } else if (leverage <= 35 && slPct < liquidationDistancePct * 0.7 && directionNewsAnalysis.aligned) {
      approvalStatus = 'APPROVED';
    } else {
      approvalStatus = 'HIGH_RISK';
    }

    return {
      positionNotional,
      liquidationDistancePct,
      maxDollarLoss,
      slPct,
      stopLossPrice,
      tp1Price,
      tp2Price,
      tp1ProfitDollar,
      tp2ProfitDollar,
      estLiquidationPrice,
      safePositionSize,
      safeMarginAtRequestedLeverage,
      approvalStatus,
      rejectionReason,
    };
  }, [
    margin,
    leverage,
    desiredRiskPercent,
    walletBalance,
    resolvedDirection,
    tradingStyle,
    price,
    isDecimals,
    language,
    directionNewsAnalysis.aligned,
  ]);

  // Granular Tax/Fee & Exit Rationale Engine
  const detailedFees = useMemo(() => {
    return computeDetailedSignalFeesAndExit({
      entryPrice: price,
      tp1Price: riskMetrics.tp1Price,
      tp2Price: riskMetrics.tp2Price,
      tp3Price: riskMetrics.tp2Price * (resolvedDirection === 'LONG' ? 1.04 : 0.96),
      slPrice: riskMetrics.stopLossPrice,
      marginUsd: margin,
      leverage,
      walletBalance,
      direction: resolvedDirection,
    });
  }, [price, riskMetrics.tp1Price, riskMetrics.tp2Price, riskMetrics.stopLossPrice, margin, leverage, walletBalance, resolvedDirection]);

  // Request AI High-Leverage Audit
  const handleRunAIAudit = async () => {
    setIsLoadingAudit(true);
    setAuditError(null);
    try {
      const data = await queryAITradingAssistant({
        mode: 'high_leverage',
        symbol: selectedSymbol,
        currentPrice: price,
        change24h,
        margin,
        leverage,
        desiredRiskPercent,
        walletBalance,
        desiredDirection: direction,
        newsCatalyst: currentNewsCatalyst,
        economicNews: 'Fed FOMC interest rate decision anticipation & CPI inflation (3.4%)',
        tradingStyle,
        marketType,
        marketContext: `${selectedSymbol} trading at $${price} (${change24h}% 24h). Max coin leverage: ${coinSpec.maxLeverage}x. News: ${currentNewsCatalyst}`,
      });
      setAuditResult(data);
    } catch (e: any) {
      console.warn('AI audit request error:', e);
      setAuditError(e?.message || 'Could not connect to AI service.');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleCopySetup = () => {
    const text = `[⚡ HIGH-LEVERAGE SETUP — ${selectedSymbol} (${leverage}x)]
Direction: ${resolvedDirection} (Recommended: ${smartSetupRecommendation.recDirection})
Entry Price: $${price}
Usable Capital: $${margin}
Selected Leverage: ${leverage}x (System Recommended: ${smartSetupRecommendation.optimalLev}x)
Stop Loss: $${riskMetrics.stopLossPrice} (-${riskMetrics.slPct}%)
Take Profit 1: $${riskMetrics.tp1Price} | Net Profit: +$${detailedFees.tp1NetProfit.toFixed(2)} (+${detailedFees.tp1NetGainPct.toFixed(1)}%)
Take Profit 2: $${riskMetrics.tp2Price} | Net Profit: +$${detailedFees.tp2NetProfit.toFixed(2)} (+${detailedFees.tp2NetGainPct.toFixed(1)}%)
Est. Liquidation: $${riskMetrics.estLiquidationPrice} (~${riskMetrics.liquidationDistancePct}%)
Position Notional: $${riskMetrics.positionNotional.toLocaleString()}
Net Stop Loss (With Taxes/Fees): -$${detailedFees.slNetLossWithFees.toFixed(2)} (-${detailedFees.slNetLossPctOfMargin.toFixed(1)}% of margin)

[💸 TAX & FEE DEDUCTIONS (အခွန်နှင့် Exchange စရိတ်)]
• Entry Taker Fee (0.05%): -$${detailedFees.entryFeeUsd.toFixed(2)}
• Exit Maker Fee (0.02%): -$${detailedFees.exitFeeUsd.toFixed(2)}
• Total Roundtrip Taxes: -$${detailedFees.totalFeeUsd.toFixed(2)} (${detailedFees.feePercentageOfMargin.toFixed(1)}% of margin)

[📈 WHY CLOSE ON PROFIT (အမြတ်ရပါက ပိတ်သိမ်းရန် အကြောင်းပြချက်)]
• TP1 ($${riskMetrics.tp1Price}): ${language === 'my' ? detailedFees.tp1CloseReasonMy : detailedFees.tp1CloseReasonEn}
• TP2 ($${riskMetrics.tp2Price}): ${language === 'my' ? detailedFees.tp2CloseReasonMy : detailedFees.tp2CloseReasonEn}

[🛑 WHY CLOSE ON LOSS (အရှုံးဖြတ်ရန် အကြောင်းပြချက်)]
• SL ($${riskMetrics.stopLossPrice}): ${language === 'my' ? detailedFees.slCloseReasonMy : detailedFees.slCloseReasonEn}

News Catalyst: ${currentNewsCatalyst}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered Coins
  const filteredCoins = useMemo(() => {
    return MULTIPLIER_COIN_SPECS.filter((c) => {
      if (coinFilter === '100x') return c.maxLeverage >= 100;
      if (coinFilter === '50x') return c.maxLeverage >= 50 && c.maxLeverage < 100;
      if (coinFilter === 'catalyst') return c.liquidityTier === 'VOLATILE_ALT' || c.catalystTag !== undefined;
      return true;
    });
  }, [coinFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. HEADER & DEDICATED CONTROLS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider">
              {language === 'my' ? 'စွန့်စားမှု မြင့်မားသည်' : 'HIGH LEVERAGE 10x - 100x'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              PAIR: <strong className="text-slate-900 dark:text-white">{selectedSymbol}USDT</strong>
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <span>
              {language === 'my'
                ? 'High-Leverage စွန့်စားမှု ထိန်းချုပ်မုဒ် (ဆတိုးချခြင်း & စိစစ်ချက်)'
                : 'High-Leverage Multiplier Engine (10x - 100x)'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'my'
              ? 'သတင်းများနှင့် ချိန်ညှိကာ Long/Short ဦးတည်ချက်ဆန်းစစ်ခြင်း၊ ဆတိုးချနိုင်သော Coins ရွေးချယ်ခြင်းနှင့် အကောင့် Max Loss ၂% မကျော်စေရန် ထိန်းချုပ်စနစ်'
              : 'News-driven directional analysis, multiplier candidate screening, liquidation distance protection & AI audit'}
          </p>
        </div>

        {/* Live Wallet & Back Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {language === 'my' ? 'Wallet လက်ကျန်' : 'WALLET BALANCE'}
            </span>
            <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
              ${walletBalance.toLocaleString()}
            </span>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{language === 'my' ? 'နောက်သို့' : 'Back'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MULTIPLIER COIN CANDIDATES (ဆတိုးချလို့ရမယ့် COIN များ) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'my'
                  ? 'ဆတိုးချလို့ရမယ့် Coin များ (High-Leverage Multiplier Candidates)'
                  : 'High-Leverage Multiplier Candidates (Select Coin to Analyze)'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'my'
                ? 'အမြင့်ဆုံး Leverage ခွင့်ပြုချက်၊ Liquidity စီးဝင်မှုနှင့် သတင်းလှုပ်ရှားမှုအပေါ် မူတည်၍ ရွေးချယ်ထားသော စာရင်း'
                : 'Coins screened for order book depth, exchange multiplier ceilings, and news catalyst volatility'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(
              [
                { id: 'all', labelEn: 'All', labelMy: 'အားလုံး' },
                { id: '100x', labelEn: '100x Capable', labelMy: '100x အထိ' },
                { id: '50x', labelEn: '50x Capable', labelMy: '50x အထိ' },
                { id: 'catalyst', labelEn: 'Hot Catalysts', labelMy: 'သတင်းပြင်းဒင်္ဂါးများ' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCoinFilter(filter.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  coinFilter === filter.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'my' ? filter.labelMy : filter.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Coin Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredCoins.map((spec) => {
            const isSelected = spec.symbol === selectedSymbol;
            const coinData = coins.find((c) => c.symbol === spec.symbol);
            const ticker = liveTickers.find((t) => t.symbol === spec.symbol);
            const coinPrice = ticker?.lastPrice || coinData?.currentPrice || (spec.symbol === 'BTC' ? 77000 : spec.symbol === 'ETH' ? 2489 : 100);
            const coinChg = ticker?.change24h ?? coinData?.change24h ?? 0;
            const isPos = coinChg >= 0;

            return (
              <button
                key={spec.symbol}
                type="button"
                onClick={() => {
                  setSelectedSymbol(spec.symbol);
                  setAuditResult(null);
                  if (leverage > spec.maxLeverage) setLeverage(spec.maxLeverage);
                }}
                className={`p-3 rounded-xl text-left transition cursor-pointer border relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {spec.symbol}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        USDT-M
                      </span>
                    </div>

                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      MAX {spec.maxLeverage}x
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                      ${coinPrice < 1 ? coinPrice.toFixed(4) : coinPrice.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center font-mono ${
                        isPos ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {coinChg.toFixed(2)}%
                    </span>
                  </div>

                  {/* Catalyst / News Tag */}
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 bg-slate-200/60 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-300/40 dark:border-slate-800">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {language === 'my' ? 'သတင်း: ' : 'News: '}
                    </span>
                    {language === 'my' ? spec.catalystTagMy || spec.catalystTag : spec.catalystTag}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>
                    Spread: <strong className="font-mono text-slate-700 dark:text-slate-300">{spec.defaultSpread}</strong>
                  </span>
                  <span
                    className={`font-black ${
                      spec.feasibility === 'HIGH'
                        ? 'text-emerald-500'
                        : spec.feasibility === 'MEDIUM'
                        ? 'text-amber-500'
                        : 'text-rose-400'
                    }`}
                  >
                    {spec.feasibility} SUITABLE
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NEWS & MACRO CATALYST MATRIX (သတင်းများနှင့် ယှဉ်ပြိုင်သုံးသပ်ချက်) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {language === 'my'
              ? 'သတင်း & Macro Catalyst နှိုင်းယှဉ်ချက် (News-Based Analysis)'
              : 'News & Macro Catalyst Alignment Matrix'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Box 1: Coin Specific Catalyst */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
              {language === 'my' ? `${selectedSymbol} ဆိုင်ရာ သတင်းအခြေအနေ` : `${selectedSymbol} SPECIFIC CATALYST`}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {currentNewsCatalyst}
            </p>
          </div>

          {/* Box 2: Macro & Fed Expectation */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 block mb-1">
              {language === 'my' ? 'မက်ခရို စီးပွားရေး & အတိုးနှုန်း သတင်း' : 'MACRO & FED EXPECTATION'}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {language === 'my'
                ? 'ဩဂုတ် CPI (3.4%) မြင့်မားခဲ့သဖြင့် Fed အတိုးနှုန်း တင်းကျပ်ထားမည့် အလားအလာ 88% ရှိနေသည်။ ဒေါ်လာအညွှန်းကိန်း DXY 99.49 တွင် ရှိနေပြီး High Leverage ကစားသူများ သတင်းထွက်ချိန် ဇွတ်မဝင်သင့်ပါ။'
                : 'CPI inflation at 3.4% holds Fed policy expectations firm (88% rate hold prob). High leverage (50x+) must avoid news spike whipsaws.'}
            </p>
          </div>

          {/* Box 3: Strict High Leverage Safety Rule */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
              {language === 'my' ? 'သတင်းနှင့် စပ်လျဉ်းသော စည်းကမ်း' : 'HIGH LEVERAGE NEWS RULE'}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {language === 'my'
                ? 'အဓိက သတင်းကြီးများ (CPI, FOMC, NFP) မထွက်မီ မိနစ် ၃၀ အတွင်း 35x အထက် Leverage Position များ ဖွင့်လှစ်ခြင်း မပြုရ။ Spread ကျယ်ပြန့်ပြီး စက္ကန့်ပိုင်းအတွင်း Liquidation ဖြစ်နိုင်သည်။'
                : 'Never hold 35x+ leverage positions across high-impact economic releases (CPI, FOMC). Spreads widen instantly causing premature liquidation.'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. USER PARAMETERS & DIRECTION DECISION (LONG VS SHORT) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {language === 'my'
                ? 'မိမိသတ်မှတ်ချက်များ (Direction, Leverage & Risk Input)'
                : 'Trade Parameters & Direction Configuration'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['crypto', 'forex'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMarketType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer uppercase ${
                  marketType === t
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Trade Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Direction Buttons: LONG vs SHORT vs AUTO */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'my'
                    ? '၁။ ကုန်သွယ်မည့် ဦးတည်ချက် (Direction):'
                    : '1. Trade Direction (Long vs Short):'}
                </label>
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="text-slate-400 font-sans">
                    {language === 'my' ? 'စနစ်အကြံပြုချက်:' : 'AI Recommendation:'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-black flex items-center gap-1 text-[10px] ${
                    smartSetupRecommendation.recDirection === 'LONG'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}>
                    {smartSetupRecommendation.recDirection === 'LONG' ? '🟢 LONG (အဝယ်)' : '🔴 SHORT (အရောင်း)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDirection('LONG');
                    setAuditResult(null);
                  }}
                  className={`relative py-2.5 px-3 rounded-xl font-black text-xs transition cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                    direction === 'LONG'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-[1.01]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                  }`}
                >
                  {smartSetupRecommendation.recDirection === 'LONG' && (
                    <span className="absolute -top-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-400 shadow-xs flex items-center gap-0.5">
                      ⭐ {language === 'my' ? 'အကြံပြုချက်' : 'Recommended'}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>LONG (ဝယ်ယူမည်)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDirection('SHORT');
                    setAuditResult(null);
                  }}
                  className={`relative py-2.5 px-3 rounded-xl font-black text-xs transition cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                    direction === 'SHORT'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-[1.01]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-500/50'
                  }`}
                >
                  {smartSetupRecommendation.recDirection === 'SHORT' && (
                    <span className="absolute -top-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-400 shadow-xs flex items-center gap-0.5">
                      ⭐ {language === 'my' ? 'အကြံပြုချက်' : 'Recommended'}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4" />
                    <span>SHORT (ရောင်းချမည်)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDirection('AUTO');
                    setAuditResult(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                    direction === 'AUTO'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.01]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500/50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>AI AUTO ({resolvedDirection})</span>
                </button>
              </div>
            </div>

            {/* Margin ($) / Usable Amount & Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {language === 'my'
                      ? '၂။ ငါသုံးနိုင်သော ပမာဏ / အရင်းအနှီး Margin ($):'
                      : '2. Usable Capital / Available Margin ($):'}
                  </label>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {language === 'my' ? 'Wallet လက်ကျန်:' : 'Wallet Balance:'}{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-bold">${walletBalance.toLocaleString()}</strong>
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-mono font-bold">$</span>
                <input
                  type="number"
                  min="5"
                  max={walletBalance}
                  value={margin}
                  onChange={(e) => setMargin(Math.max(1, Number(e.target.value)))}
                  placeholder="ဥပမာ- 100"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-black font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>

              {/* Quick Amount Allocation Buttons */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <span className="text-[10px] text-slate-400 font-bold shrink-0">
                  {language === 'my' ? 'အမြန်ရွေး:' : 'Quick:'}
                </span>
                {[25, 50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMargin(amt)}
                    className={`px-2.5 py-1 rounded-lg font-bold font-mono transition cursor-pointer border ${
                      margin === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-500'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMargin(Math.max(10, Math.round(walletBalance * 0.1)))}
                  className={`px-2.5 py-1 rounded-lg font-bold font-mono transition cursor-pointer border shrink-0 ${
                    margin === Math.round(walletBalance * 0.1)
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                  }`}
                >
                  10% Wallet (${Math.round(walletBalance * 0.1)})
                </button>
                <button
                  type="button"
                  onClick={() => setMargin(Math.max(10, Math.round(walletBalance * 0.25)))}
                  className={`px-2.5 py-1 rounded-lg font-bold font-mono transition cursor-pointer border shrink-0 ${
                    margin === Math.round(walletBalance * 0.25)
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                  }`}
                >
                  25% Wallet (${Math.round(walletBalance * 0.25)})
                </button>
              </div>
            </div>

            {/* ================================================================= */}
            {/* SMART SETUP RECOMMENDATION CARD (Direction & Leverage Advice)     */}
            {/* ================================================================= */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-3.5 rounded-2xl border border-amber-500/30 space-y-3.5 shadow-xs">
              {/* Header: Title and Live Recommended Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 font-black text-sm">
                    ⭐
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>
                        {language === 'my'
                          ? `ထည့်သွင်းငွေ ($${margin}) အတွက် စနစ်မှ အကြံပြုသော Setup:`
                          : `Recommended Setup for $${margin} Capital:`}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'my'
                        ? `${selectedSymbol} ၏ စျေးကွက်လှိုင်းခတ်မှု၊ သတင်းနှင့် အရင်းအနှီးအချိုး (${smartSetupRecommendation.amountRatioPercent}%) ပေါ် အခြေခံသည်`
                        : `Based on volatility, momentum & allocation ratio (${smartSetupRecommendation.amountRatioPercent}%)`}
                    </p>
                  </div>
                </div>

                {/* Right side: Direction & Leverage Badges */}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-black border shadow-xs ${
                      smartSetupRecommendation.recDirection === 'LONG'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 ring-1 ring-rose-500/30'
                    }`}
                  >
                    {smartSetupRecommendation.recDirection === 'LONG' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span>
                      {language === 'my'
                        ? `အကြံပြု: ${smartSetupRecommendation.recDirection}`
                        : `REC: ${smartSetupRecommendation.recDirection}`}
                    </span>
                  </div>

                  <span className="text-xs font-black font-mono text-amber-500 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/40 shadow-xs">
                    {smartSetupRecommendation.optimalLev}x
                  </span>
                </div>
              </div>

              {/* Dual Advisory Grid: Direction Advice vs Leverage Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                {/* 1. Direction Advisor Block (5 cols) */}
                <div className="md:col-span-5 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {language === 'my' ? 'အကြံပြု ဦးတည်ချက်:' : 'Direction Advice:'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          smartSetupRecommendation.recDirection === 'LONG'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {language === 'my'
                          ? smartSetupRecommendation.dirSignalTagMy
                          : smartSetupRecommendation.dirSignalTagEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div
                        className={`p-2 rounded-lg ${
                          smartSetupRecommendation.recDirection === 'LONG'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-rose-500/20 text-rose-500'
                        }`}
                      >
                        {smartSetupRecommendation.recDirection === 'LONG' ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black flex items-center gap-1.5">
                          <span
                            className={
                              smartSetupRecommendation.recDirection === 'LONG'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {smartSetupRecommendation.recDirection === 'LONG'
                              ? language === 'my'
                                ? 'LONG (ဝယ်ယူရန် အကြံပြုသည်)'
                                : 'LONG (BUY RECOMMENDED)'
                              : language === 'my'
                              ? 'SHORT (ရောင်းချရန် အကြံပြုသည်)'
                              : 'SHORT (SELL RECOMMENDED)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                          {language === 'my'
                            ? smartSetupRecommendation.dirReasonMy
                            : smartSetupRecommendation.dirReasonEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direction 1-Click Select Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setDirection(smartSetupRecommendation.recDirection);
                      setAuditResult(null);
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      direction === smartSetupRecommendation.recDirection
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {direction === smartSetupRecommendation.recDirection ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>
                          {language === 'my'
                            ? `✓ ${smartSetupRecommendation.recDirection} ရွေးချယ်ပြီး`
                            : `✓ ${smartSetupRecommendation.recDirection} Active`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {language === 'my'
                            ? `👉 အကြံပြု ${smartSetupRecommendation.recDirection} ကို ရွေးမည်`
                            : `Apply ${smartSetupRecommendation.recDirection}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Leverage Tiers Block (7 cols) */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLeverage(smartSetupRecommendation.conservativeLev)}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                        leverage === smartSetupRecommendation.conservativeLev
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-xs ring-1 ring-emerald-500/50'
                          : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          🛡️ Safe
                        </span>
                        <span className="text-xs font-black font-mono">
                          {smartSetupRecommendation.conservativeLev}x
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'my' ? 'အလုံခြုံဆုံး' : 'Conservative'}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeverage(smartSetupRecommendation.optimalLev)}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                        leverage === smartSetupRecommendation.optimalLev
                          ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-xs ring-1 ring-amber-500/50'
                          : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-amber-500/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          ⭐ Optimal
                        </span>
                        <span className="text-xs font-black font-mono">
                          {smartSetupRecommendation.optimalLev}x
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'my' ? 'အကြံပြုချက်' : 'Balanced'}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeverage(smartSetupRecommendation.aggressiveLev)}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                        leverage === smartSetupRecommendation.aggressiveLev
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-xs ring-1 ring-rose-500/50'
                          : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-rose-500/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          🔥 Scalp
                        </span>
                        <span className="text-xs font-black font-mono">
                          {smartSetupRecommendation.aggressiveLev}x
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'my' ? 'အမြန်ဆတိုး' : 'High Scalp'}
                      </div>
                    </button>
                  </div>

                  {/* Leverage 1-Click Select Button */}
                  <button
                    type="button"
                    onClick={() => setLeverage(smartSetupRecommendation.optimalLev)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      leverage === smartSetupRecommendation.optimalLev
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {leverage === smartSetupRecommendation.optimalLev ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {language === 'my'
                            ? `✓ ${smartSetupRecommendation.optimalLev}x Leverage ရွေးချယ်ပြီး`
                            : `✓ ${smartSetupRecommendation.optimalLev}x Active`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {language === 'my'
                            ? `👉 အကြံပြု ${smartSetupRecommendation.optimalLev}x Leverage ကို ရွေးမည်`
                            : `Apply ${smartSetupRecommendation.optimalLev}x`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Master Combined 1-Click Action Button: Apply Both Direction & Leverage */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setDirection(smartSetupRecommendation.recDirection);
                    setLeverage(smartSetupRecommendation.optimalLev);
                    setAuditResult(null);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                    direction === smartSetupRecommendation.recDirection &&
                    leverage === smartSetupRecommendation.optimalLev
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 active:scale-98'
                  }`}
                >
                  {direction === smartSetupRecommendation.recDirection &&
                  leverage === smartSetupRecommendation.optimalLev ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>
                        {language === 'my'
                          ? `✓ စနစ်မှ အကြံပြုထားသော [${smartSetupRecommendation.recDirection} + ${smartSetupRecommendation.optimalLev}x] ဖြင့် သတ်မှတ်ထားပြီးပါပြီ`
                          : `✓ Recommended Setup [${smartSetupRecommendation.recDirection} + ${smartSetupRecommendation.optimalLev}x] Is Fully Applied`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-slate-950" />
                      <span>
                        {language === 'my'
                          ? `⚡ အကြံပြု Setup [${smartSetupRecommendation.recDirection} + ${smartSetupRecommendation.optimalLev}x] ဖြင့် တစ်ပြိုင်နက် သတ်မှတ်မည် (1-Click Apply)`
                          : `⚡ Apply Recommended Setup [${smartSetupRecommendation.recDirection} + ${smartSetupRecommendation.optimalLev}x] (1-Click)`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Rationale & Real-Time Calculation Insights */}
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/20 text-xs space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">💡</span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {language === 'my' ? 'ဘာကြောင့် ဤသို့ အကြံပြုရသနည်း: ' : 'Why this setup: '}
                    </strong>
                    {language === 'my'
                      ? `${smartSetupRecommendation.dirReasonMy} ${smartSetupRecommendation.reasonMy}`
                      : `${smartSetupRecommendation.dirReasonEn} ${smartSetupRecommendation.reasonEn}`}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-400 block">Direction:</span>
                    <strong
                      className={
                        smartSetupRecommendation.recDirection === 'LONG'
                          ? 'text-emerald-500 font-bold'
                          : 'text-rose-500 font-bold'
                      }
                    >
                      {smartSetupRecommendation.recDirection}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Position Size:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      ${(margin * leverage).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Liq Buffer:</span>
                    <strong className="text-amber-500 font-bold">
                      ~{riskMetrics.liquidationDistancePct}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">SL Drawdown:</span>
                    <strong className="text-rose-400 font-bold">
                      -${riskMetrics.maxDollarLoss}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* MANUAL SLIDER & PRESETS (Existing Controls Preserved)             */}
            {/* ================================================================= */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {language === 'my'
                      ? `၃။ Leverage ကို လက်ဖြင့် စိတ်ကြိုက်ချိန်ညှိရန် (${selectedSymbol} အများဆုံး: ${coinSpec.maxLeverage}x):`
                      : `3. Manual Leverage Multiplier (${selectedSymbol} Max: ${coinSpec.maxLeverage}x):`}
                  </span>
                </label>
                <span
                  className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                    leverage >= 50
                      ? 'bg-rose-500/10 text-rose-500'
                      : leverage >= 30
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}
                >
                  {leverage}x
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="10"
                max={coinSpec.maxLeverage}
                step="5"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />

              {/* Presets */}
              <div className="flex items-center justify-between gap-1 mt-2">
                {[10, 20, 35, 50, 75, 100]
                  .filter((l) => l <= coinSpec.maxLeverage)
                  .map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setLeverage(lev)}
                      className={`flex-1 py-1 text-xs font-mono font-bold rounded-lg transition cursor-pointer border ${
                        leverage === lev
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-white'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
              </div>
            </div>

            {/* Risk % & Style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'my' ? '၄။ ခွင့်ပြုဆုံးရှုံးငွေ Risk %:' : '4. Max Risk Limit:'}
                </label>
                <div className="flex items-center gap-1">
                  {[0.5, 1, 2, 3].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDesiredRiskPercent(r)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer border ${
                        desiredRiskPercent === r
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'my' ? '၅။ ကုန်သွယ်မှု စတိုင်လ်:' : '5. Trading Style:'}
                </label>
                <select
                  value={tradingStyle}
                  onChange={(e) => setTradingStyle(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="scalp">Scalp (1% tight stop)</option>
                  <option value="breakout">Breakout (1.5% stop)</option>
                  <option value="momentum">Momentum (2% stop)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Direction Alignment & Live Risk Math (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-slate-50 dark:bg-slate-950/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* Direction & News Verdict Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {language === 'my' ? 'ဦးတည်ချက် & သတင်း စိစစ်ချက်' : 'DIRECTION & NEWS VERDICT'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    directionNewsAnalysis.statusBadge === 'aligned'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                      : directionNewsAnalysis.statusBadge === 'warning'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                  }`}
                >
                  {directionNewsAnalysis.statusBadge.toUpperCase()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {language === 'my'
                  ? directionNewsAnalysis.reasoningMy
                  : directionNewsAnalysis.reasoningEn}
              </div>
            </div>

            {/* Live Risk Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  POSITION NOTIONAL
                </span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  ${riskMetrics.positionNotional.toLocaleString()}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  LIQ DISTANCE
                </span>
                <span className="font-bold font-mono text-amber-500">
                  ~{riskMetrics.liquidationDistancePct}%
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  STOP LOSS ({riskMetrics.slPct}%)
                </span>
                <span className="font-bold font-mono text-rose-500">
                  ${riskMetrics.stopLossPrice}
                </span>
                <span className="text-[9px] text-rose-400 block font-semibold font-mono">
                  Net Loss: -${detailedFees.slNetLossWithFees.toFixed(2)}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  EST. LIQUIDATION
                </span>
                <span className="font-bold font-mono text-slate-400">
                  ${riskMetrics.estLiquidationPrice}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  TARGET (TP1 NET)
                </span>
                <span className="font-bold font-mono text-emerald-500">
                  ${riskMetrics.tp1Price}
                </span>
                <span className="text-[9px] text-emerald-400 block font-semibold font-mono">
                  Net: +${detailedFees.tp1NetProfit.toFixed(2)} (+{detailedFees.tp1NetGainPct.toFixed(1)}%)
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  TARGET (TP2 NET)
                </span>
                <span className="font-bold font-mono text-emerald-400">
                  ${riskMetrics.tp2Price}
                </span>
                <span className="text-[9px] text-emerald-400 block font-semibold font-mono">
                  Net: +${detailedFees.tp2NetProfit.toFixed(2)} (+{detailedFees.tp2NetGainPct.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Tax Breakdown & Exit Rationales Block */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-amber-500/30 space-y-2.5 text-xs shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {language === 'my'
                      ? 'အခွန်တွက်ချက်မှုနှင့် အော်ဒါပိတ်သိမ်းရန် အကြောင်းပြချက်များ'
                      : 'Tax Audit & Exit Rationales'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                    {leverage}x High-Leverage
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{language === 'my' ? 'Roundtrip အခွန်စုစုပေါင်း:' : 'Total Roundtrip Tax:'}</span>
                  <span className="font-bold text-amber-500">${detailedFees.totalFeeUsd.toFixed(2)}</span>
                  <span>({detailedFees.feePercentageOfMargin.toFixed(1)}% margin)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                {/* Tax Breakdown (4 cols) */}
                <div className="md:col-span-4 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span>{language === 'my' ? '💸 အခွန်/စရိတ် စိစစ်ချက်' : '💸 Exchange Fees'}</span>
                    <span className="font-mono">0.07% Notional</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Taker Entry (0.05%):</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">-${detailedFees.entryFeeUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Maker Exit (0.02%):</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">-${detailedFees.exitFeeUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1 font-semibold text-amber-600 dark:text-amber-400">
                      <span>{language === 'my' ? 'စုစုပေါင်း အခွန်:' : 'Total Fees:'}</span>
                      <span className="font-mono font-black">-${detailedFees.totalFeeUsd.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Exit Rationales (8 cols) */}
                <div className="md:col-span-8 space-y-1.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      {language === 'my' ? '🟢 ဘယ်လောက်မြတ်ရင် ဘာကြောင့် ပိတ်သင့်လဲ (Why Close on Profit):' : '🟢 Why Close on Profit Targets:'}
                    </span>
                    <p className="text-[10px]">
                      {language === 'my' ? detailedFees.tp1CloseReasonMy : detailedFees.tp1CloseReasonEn}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                      {language === 'my' ? '🔴 ဘယ်လောက်ရှုံးရင် ဘာကြောင့် ပိတ်သင့်လဲ (Why Close on Loss):' : '🔴 Why Cut Loss at Stop Loss:'}
                    </span>
                    <p className="text-[10px]">
                      {language === 'my' ? detailedFees.slCloseReasonMy : detailedFees.slCloseReasonEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liquidation vs Stop Loss Safety Check */}
            <div
              className={`p-2.5 rounded-lg border text-xs font-semibold ${
                riskMetrics.approvalStatus === 'REJECTED'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {riskMetrics.approvalStatus === 'REJECTED' ? (
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {language === 'my'
                      ? `အရေးပေါ်: Stop Loss (${riskMetrics.slPct}%) သည် Liquidation Distance (${riskMetrics.liquidationDistancePct}%) ထက် ကျယ်နေ၍ Liquidation ဖြစ်ပါမည်!`
                      : `CRITICAL: Stop Loss (${riskMetrics.slPct}%) exceeds Liquidation distance (${riskMetrics.liquidationDistancePct}%)! Reduce leverage.`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'my'
                      ? `ဘေးကင်းမှု: Stop Loss သည် Liquidation မတိုင်မီ တားဆီးပေးပြီး Max Loss မှာ $${riskMetrics.maxDollarLoss} သာ ဖြစ်ပါမည်။`
                      : `Protected: Stop Loss triggers safely before liquidation; capped at $${riskMetrics.maxDollarLoss}.`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunAIAudit}
              disabled={isLoadingAudit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
              <span>
                {isLoadingAudit
                  ? language === 'my'
                    ? 'AI သတင်း & အန္တရာယ် စိစစ်နေသည်...'
                    : 'Auditing News & High-Leverage Risk...'
                  : language === 'my'
                  ? '⚡ AI High-Leverage စစ်ဆေးမည်'
                  : 'Run AI High-Leverage Audit'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopySetup}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>
                {copied
                  ? language === 'my'
                    ? 'ကူးယူပြီးပါပြီ'
                    : 'Copied!'
                  : language === 'my'
                  ? 'Setup ကူးယူမည်'
                  : 'Copy Setup'}
              </span>
            </button>
          </div>

          {onExecuteTrade && (
            <button
              type="button"
              onClick={() => {
                onExecuteTrade({
                  symbol: selectedSymbol,
                  side: resolvedDirection,
                  entry: price,
                  stopLoss: riskMetrics.stopLossPrice,
                  takeProfit: riskMetrics.tp1Price,
                  leverage,
                  margin,
                });
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
            >
              <span>
                {language === 'my'
                  ? `Demo Terminal တွင် ${resolvedDirection} ဖွင့်မည်`
                  : `Open ${resolvedDirection} in Demo Terminal`}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Error notice if audit fails */}
        {auditError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{auditError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. AI RISK AUDIT REPORT (DETAILED BURMESE OUTPUT) */}
      {/* ========================================================================= */}
      {auditResult && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'my'
                  ? `AI High-Leverage စိစစ်ချက် ရလဒ် — ${selectedSymbol} (${leverage}x)`
                  : `AI High-Leverage Risk Audit Report — ${selectedSymbol} (${leverage}x)`}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                  auditResult.highLeverageApproval === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : auditResult.highLeverageApproval === 'HIGH_RISK'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                }`}
              >
                {auditResult.highLeverageApproval || 'EVALUATED'}
              </span>

              <span className="text-[10px] font-mono text-slate-400">
                SOURCE: {auditResult.source?.toUpperCase() || 'ALGO'}
              </span>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {auditResult.summaryMarkdown}
          </div>

          {onExecuteTrade && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onExecuteTrade({
                    symbol: selectedSymbol,
                    side: resolvedDirection,
                    entry: typeof auditResult.entry === 'number' ? auditResult.entry : price,
                    stopLoss: typeof auditResult.stopLoss === 'number' ? auditResult.stopLoss : riskMetrics.stopLossPrice,
                    takeProfit: typeof auditResult.takeProfit1 === 'number' ? auditResult.takeProfit1 : riskMetrics.tp1Price,
                    leverage,
                    margin,
                  });
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
              >
                <span>{language === 'my' ? 'AI Setup ဖြင့် Demo Terminal သို့ တိုက်ရိုက်သွားမည်' : 'Execute AI Setup in Demo Terminal'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
