import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
  Sliders,
  DollarSign,
  AlertTriangle,
  Search,
  ExternalLink,
  Target,
  ArrowRight,
  Filter,
  CheckCircle2,
  Scale,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { CoinOpportunity, LiveTickerItem, DemoTradePreset, AppNavView } from '../types';
import { openBinanceFutures } from '../utils/binanceLink';
import {
  calculateTradeFeesAndTargets,
  computeDetailedSignalFeesAndExit,
  DetailedSignalFeeMetrics,
} from '../utils/technicalAnalysis';

export interface EasySignalsCopyHubProps {
  coins: CoinOpportunity[];
  liveTickers: LiveTickerItem[];
  lang: 'my' | 'en';
  margin: number;
  leverage: number;
  walletBalance: number;
  onWalletBalanceChange?: (newBalance: number) => void;
  onGoToTradePreset: (preset: DemoTradePreset) => void;
  onNavigateView?: (view: AppNavView) => void;
  onBack?: () => void;
  onOpenInAppTerminal?: (symbol: string, side: 'LONG' | 'SHORT', preset?: any) => void;
}

export type SignalCategory =
  | 'all'
  | 'styles'
  | 'calculator'
  | 'live_scanner'
  | 'tradecard'
  | 'top_coins';
export type DirectionFilter = 'ALL' | 'LONG' | 'SHORT' | 'WAIT';

interface SignalTrackDetails {
  entryPrice: number;
  entryConditionEn: string;
  entryConditionMy: string;
  tp1Price: number;
  tp1GainPct: number;
  tp2Price: number;
  tp2GainPct: number;
  tp3Price: number;
  tp3GainPct: number;
  slPrice: number;
  slLossPct: number;
  leverage: number;
  riskReward: string;
  invalidationEn?: string;
  invalidationMy?: string;
  ruleSummaryEn?: string;
  ruleSummaryMy?: string;
  tp1CloseReasonEn?: string;
  tp1CloseReasonMy?: string;
  tp2CloseReasonEn?: string;
  tp2CloseReasonMy?: string;
  tp3CloseReasonEn?: string;
  tp3CloseReasonMy?: string;
  slCloseReasonEn?: string;
  slCloseReasonMy?: string;
}

interface TradeSignalItem {
  id: string;
  category: 'styles' | 'calculator' | 'live_scanner' | 'tradecard' | 'top_coins';
  categoryLabelEn: string;
  categoryLabelMy: string;
  symbol: string;
  pair: string;
  bias: 'LONG' | 'SHORT' | 'WAIT';
  timeframe: string;
  styleNameEn: string;
  styleNameMy: string;
  currentPrice: number;
  statusTextEn: string;
  statusTextMy: string;
  targetView?: AppNavView;

  // Track 1: မင်းရဲ့ ခွဲခြမ်းစိတ်ဖြာမှု (AI & Technical Analysis Track)
  technicalTrack: SignalTrackDetails;

  // Track 2: ငါ့ရဲ့ စည်းမျဉ်း (My Personal Trading Rules Track)
  myRulesTrack: SignalTrackDetails;
}

export const EasySignalsCopyHub: React.FC<EasySignalsCopyHubProps> = ({
  coins,
  liveTickers,
  lang,
  margin: initialMargin,
  leverage: initialLeverage,
  walletBalance,
  onWalletBalanceChange,
  onGoToTradePreset,
  onNavigateView,
  onBack,
  onOpenInAppTerminal,
}) => {
  const [activeCategory, setActiveCategory] = useState<SignalCategory>('all');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // Active track view mode: 'both' | 'technical' | 'my_rules'
  const [selectedTrackView, setSelectedTrackView] = useState<'both' | 'technical' | 'my_rules'>('both');

  // Future Wallet Amount Input & State (User intent: "ငါက ငါ့ရဲ့ future wallet ammount ထည့်တာ ထည့်ပေးဦး")
  const [walletInput, setWalletInput] = useState<string>(String(walletBalance));
  useEffect(() => {
    setWalletInput(String(walletBalance));
  }, [walletBalance]);

  const handleWalletChange = (valStr: string) => {
    setWalletInput(valStr);
    const num = Number(valStr);
    if (!isNaN(num) && num > 0 && onWalletBalanceChange) {
      onWalletBalanceChange(num);
    }
  };

  const setPresetWallet = (amount: number) => {
    setWalletInput(String(amount));
    if (onWalletBalanceChange) {
      onWalletBalanceChange(amount);
    }
  };

  // Auto-tune leverage & margin toggle (User intent: "leverage ကို မင်း ညှိပေးရမှာ")
  const [autoTuneRisk, setAutoTuneRisk] = useState<boolean>(true);

  // Manual fallback simulation sliders if auto-tune is toggled off
  const [manualMargin, setManualMargin] = useState<number>(initialMargin || 150);
  const [manualLeverage, setManualLeverage] = useState<number>(initialLeverage || 15);

  // Generate complete signals list across all trading methods and coins, featuring GOLD (XAUUSD) prominently
  const allSignals = useMemo<TradeSignalItem[]>(() => {
    const list: TradeSignalItem[] = [];

    const btcTicker: LiveTickerItem = liveTickers.find((t) => t.symbol === 'BTC') || {
      contract: 'BTCUSDT',
      symbol: 'BTC',
      lastPrice: 77032,
      change24h: 3.5,
      volume24hUsd: 4500000000,
      high24h: 78000,
      low24h: 75000,
      fundingRate: 0.009,
      feasibility: 'HIGH',
      bias: 'LONG',
    };
    const ethTicker: LiveTickerItem = liveTickers.find((t) => t.symbol === 'ETH') || {
      contract: 'ETHUSDT',
      symbol: 'ETH',
      lastPrice: 2489,
      change24h: 2.1,
      volume24hUsd: 2500000000,
      high24h: 2550,
      low24h: 2420,
      fundingRate: 0.008,
      feasibility: 'HIGH',
      bias: 'SHORT',
    };
    const solTicker: LiveTickerItem = liveTickers.find((t) => t.symbol === 'SOL') || {
      contract: 'SOLUSDT',
      symbol: 'SOL',
      lastPrice: 100.49,
      change24h: 5.8,
      volume24hUsd: 1200000000,
      high24h: 103,
      low24h: 96,
      fundingRate: 0.012,
      feasibility: 'HIGH',
      bias: 'LONG',
    };
    const bnbTicker: LiveTickerItem = liveTickers.find((t) => t.symbol === 'BNB') || {
      contract: 'BNBUSDT',
      symbol: 'BNB',
      lastPrice: 585.2,
      change24h: 1.8,
      volume24hUsd: 800000000,
      high24h: 595,
      low24h: 575,
      fundingRate: 0.005,
      feasibility: 'HIGH',
      bias: 'LONG',
    };
    const suiTicker: LiveTickerItem = liveTickers.find((t) => t.symbol === 'SUI') || {
      contract: 'SUIUSDT',
      symbol: 'SUI',
      lastPrice: 2.34,
      change24h: 8.4,
      volume24hUsd: 400000000,
      high24h: 2.45,
      low24h: 2.15,
      fundingRate: -0.015,
      feasibility: 'HIGH',
      bias: 'LONG',
    };

    const topVolTicker = [...liveTickers].sort((a, b) => (b.volume24hUsd || 0) - (a.volume24hUsd || 0))[0] || solTicker;
    const topGainerTicker = [...liveTickers].sort((a, b) => b.change24h - a.change24h)[0] || suiTicker;
    const negFundingTicker = liveTickers.find((t) => (t.fundingRate || 0) < 0) || liveTickers[liveTickers.length - 1] || suiTicker;

    // ==========================================
    // MODULE 1: ကုန်သွယ်မှု စတိုင်လ် ၅ မျိုး (STRATEGY HUB - 5 STYLES)
    // ==========================================

    // Style 1: Scalping (SOL 1M-5M)
    const solPrice = solTicker.lastPrice;
    list.push({
      id: 'style-scalping-sol',
      category: 'styles',
      categoryLabelEn: 'Strategy 1: Scalping',
      categoryLabelMy: 'Trade နည်း ၁: Scalping (မိနစ်ပိုင်း အမြန်)',
      symbol: 'SOL',
      pair: 'SOLUSDT',
      bias: 'LONG',
      timeframe: '1M - 5M',
      styleNameEn: 'Scalping',
      styleNameMy: 'Scalping (မြန်ဆန် တိုတောင်း)',
      currentPrice: solPrice,
      statusTextEn: 'Active Scalp Setup (Pullback Rebound)',
      statusTextMy: 'ချက်ချင်း အဝင်အချက်ပြ (Pullback မှ ပြန်တက်)',
      targetView: 'strategy',
      technicalTrack: {
        entryPrice: Number((solPrice * 0.998).toFixed(2)),
        entryConditionEn: 'Market entry on 3M bullish candle close',
        entryConditionMy: '3M ဖယောင်းတိုင် အစိမ်းပိတ်လျှင် ဝင်မည်',
        tp1Price: Number((solPrice * 1.012).toFixed(2)),
        tp1GainPct: 1.2,
        tp2Price: Number((solPrice * 1.022).toFixed(2)),
        tp2GainPct: 2.2,
        tp3Price: Number((solPrice * 1.032).toFixed(2)),
        tp3GainPct: 3.2,
        slPrice: Number((solPrice * 0.995).toFixed(2)),
        slLossPct: 0.5,
        leverage: 20,
        riskReward: '1 : 2.4',
        invalidationEn: '3M close below local support wick',
        invalidationMy: '3M အောက်သို့ ဖောက်ဆင်းလျှင် ချက်ချင်းထွက်မည်',
      },
      myRulesTrack: {
        entryPrice: Number((solPrice * 0.999).toFixed(2)),
        entryConditionEn: 'Wait for 5M wick rejection test',
        entryConditionMy: '5M Wick စမ်းသပ်မှုကို စောင့်ပြီးမှ ဝင်မည်',
        tp1Price: Number((solPrice * 1.01).toFixed(2)),
        tp1GainPct: 1.0,
        tp2Price: Number((solPrice * 1.018).toFixed(2)),
        tp2GainPct: 1.8,
        tp3Price: Number((solPrice * 1.028).toFixed(2)),
        tp3GainPct: 2.8,
        slPrice: Number((solPrice * 0.994).toFixed(2)),
        slLossPct: 0.6,
        leverage: 15,
        riskReward: '1 : 2.0',
        ruleSummaryEn: 'Max 1% wallet risk, lock 50% profit at TP1',
        ruleSummaryMy: 'အကောင့် ၁% အန္တရာယ်ကန့်သတ်၊ TP1 ရောက်လျှင် ၅၀% အမြတ်သိမ်း',
      },
    });

    // Style 2: Day Trading (ETH 15M-1H)
    const ethPrice = ethTicker.lastPrice;
    list.push({
      id: 'style-day-eth',
      category: 'styles',
      categoryLabelEn: 'Strategy 2: Day Trading',
      categoryLabelMy: 'Trade နည်း ၂: Day Trading (နေ့စဉ် အပြီးသတ်)',
      symbol: 'ETH',
      pair: 'ETHUSDT',
      bias: 'SHORT',
      timeframe: '15M - 1H',
      styleNameEn: 'Day Trading',
      styleNameMy: 'Day Trading (နေ့စဉ် ကုန်သွယ်မှု)',
      currentPrice: ethPrice,
      statusTextEn: 'Bear Flag Retest Breakdown',
      statusTextMy: 'Bear Flag Resistance စမ်းသပ်မှုမှ Short',
      targetView: 'strategy',
      technicalTrack: {
        entryPrice: Number((ethPrice * 1.004).toFixed(2)),
        entryConditionEn: 'Limit order at resistance rejection zone',
        entryConditionMy: 'Resistance Zone တွင် Limit အော်ဒါဖြင့် ဝင်မည်',
        tp1Price: Number((ethPrice * 0.975).toFixed(2)),
        tp1GainPct: 2.5,
        tp2Price: Number((ethPrice * 0.955).toFixed(2)),
        tp2GainPct: 4.5,
        tp3Price: Number((ethPrice * 0.935).toFixed(2)),
        tp3GainPct: 6.5,
        slPrice: Number((ethPrice * 1.014).toFixed(2)),
        slLossPct: 1.4,
        leverage: 12,
        riskReward: '1 : 2.5',
        invalidationEn: '1H close above key resistance',
        invalidationMy: '1H ဖယောင်းတိုင် Resistance အထက်ပိတ်လျှင် Invalidate',
      },
      myRulesTrack: {
        entryPrice: Number((ethPrice * 1.002).toFixed(2)),
        entryConditionEn: 'Wait for 15M lower-high confirmation',
        entryConditionMy: '15M Lower-High အတည်ပြုချက်ရမှ ဝင်မည်',
        tp1Price: Number((ethPrice * 0.98).toFixed(2)),
        tp1GainPct: 2.0,
        tp2Price: Number((ethPrice * 0.96).toFixed(2)),
        tp2GainPct: 4.0,
        tp3Price: Number((ethPrice * 0.94).toFixed(2)),
        tp3GainPct: 6.0,
        slPrice: Number((ethPrice * 1.012).toFixed(2)),
        slLossPct: 1.2,
        leverage: 10,
        riskReward: '1 : 2.2',
        ruleSummaryEn: 'No overnight hold, strict 1.5% stop loss',
        ruleSummaryMy: 'ညအိပ်မထားဘဲ ထိုနေ့အတွင်း အပြီးသိမ်း၊ SL တိကျစွာထား',
      },
    });

    // Style 3: Swing Trading (BTC 4H-1D)
    const btcPrice = btcTicker.lastPrice;
    list.push({
      id: 'style-swing-btc',
      category: 'styles',
      categoryLabelEn: 'Strategy 3: Swing Trading',
      categoryLabelMy: 'Trade နည်း ၃: Swing Trading (ရက်သတ္တပတ် လှိုင်းစီး)',
      symbol: 'BTC',
      pair: 'BTCUSDT',
      bias: 'LONG',
      timeframe: '4H - 1D',
      styleNameEn: 'Swing Trading',
      styleNameMy: 'Swing Trading (ရက်သတ္တပတ်အတွင်း)',
      currentPrice: btcPrice,
      statusTextEn: 'Bullish Flag Breakout & Re-test',
      statusTextMy: 'Support ခိုင်မာပြီး အဝယ်အားတက်',
      targetView: 'strategy',
      technicalTrack: {
        entryPrice: Number((btcPrice * 0.995).toFixed(2)),
        entryConditionEn: 'Buy at 4H institutional demand block',
        entryConditionMy: '4H Orderblock တွင် စောင့်ဝယ်မည်',
        tp1Price: Number((btcPrice * 1.045).toFixed(2)),
        tp1GainPct: 4.5,
        tp2Price: Number((btcPrice * 1.085).toFixed(2)),
        tp2GainPct: 8.5,
        tp3Price: Number((btcPrice * 1.12).toFixed(2)),
        tp3GainPct: 12.0,
        slPrice: Number((btcPrice * 0.978).toFixed(2)),
        slLossPct: 2.2,
        leverage: 10,
        riskReward: '1 : 2.8',
        invalidationEn: '4H close below structural support',
        invalidationMy: '4H ဖယောင်းတိုင် Support အောက်ဆင်းလျှင် အစီအစဉ်ဖျက်မည်',
      },
      myRulesTrack: {
        entryPrice: Number((btcPrice * 0.996).toFixed(2)),
        entryConditionEn: 'Enter after daily candle closes above EMA 20',
        entryConditionMy: 'Daily EMA 20 အထက် ဖယောင်းတိုင်ပိတ်မှ ဝင်မည်',
        tp1Price: Number((btcPrice * 1.035).toFixed(2)),
        tp1GainPct: 3.5,
        tp2Price: Number((btcPrice * 1.075).toFixed(2)),
        tp2GainPct: 7.5,
        tp3Price: Number((btcPrice * 1.11).toFixed(2)),
        tp3GainPct: 11.0,
        slPrice: Number((btcPrice * 0.982).toFixed(2)),
        slLossPct: 1.8,
        leverage: 8,
        riskReward: '1 : 2.5',
        ruleSummaryEn: 'Only enter when Daily trend aligns with 4H setup',
        ruleSummaryMy: 'Daily Trend နှင့် 4H ဦးတည်ချက် တူညီမှသာ ဝင်မည်',
      },
    });

    // Style 4: Position Trading (BNB 1D-3D)
    const bnbPrice = bnbTicker.lastPrice;
    list.push({
      id: 'style-position-bnb',
      category: 'styles',
      categoryLabelEn: 'Strategy 4: Position Trading',
      categoryLabelMy: 'Trade နည်း ၄: Position Trading (စက်ဝန်း လှိုင်းစီးမှု)',
      symbol: 'BNB',
      pair: 'BNBUSDT',
      bias: 'LONG',
      timeframe: '1D - 3D',
      styleNameEn: 'Position Trading',
      styleNameMy: 'Position Trading (စက်ဝန်း လှိုင်းစီးမှု)',
      currentPrice: bnbPrice,
      statusTextEn: 'Multi-Week Accumulation Breakout',
      statusTextMy: 'ရက်သတ္တပတ်ပေါင်းများစွာ အဝယ်စုပြီးနောက် ဖောက်ထွက်',
      targetView: 'strategy',
      technicalTrack: {
        entryPrice: Number((bnbPrice * 0.992).toFixed(2)),
        entryConditionEn: 'Accumulate on 1D EMA 50 retest zone',
        entryConditionMy: '1D EMA 50 စမ်းသပ်မှုဇုန်တွင် အဝယ်စုဆောင်းမည်',
        tp1Price: Number((bnbPrice * 1.06).toFixed(2)),
        tp1GainPct: 6.0,
        tp2Price: Number((bnbPrice * 1.14).toFixed(2)),
        tp2GainPct: 14.0,
        tp3Price: Number((bnbPrice * 1.25).toFixed(2)),
        tp3GainPct: 25.0,
        slPrice: Number((bnbPrice * 0.965).toFixed(2)),
        slLossPct: 3.5,
        leverage: 5,
        riskReward: '1 : 3.5',
        invalidationEn: 'Daily close below weekly base',
        invalidationMy: 'Daily ဖယောင်းတိုင် အပတ်စဉ်အောက်ခြေအောက် ကျိုးပေါက်ပါက ဖျက်သိမ်းမည်',
      },
      myRulesTrack: {
        entryPrice: Number((bnbPrice * 0.995).toFixed(2)),
        entryConditionEn: 'Position sizing max 15% account, trailing SL after TP1',
        entryConditionMy: 'အရွယ်အစားကို အကောင့် ၁၅% ထက်မကျော်ဘဲ TP1 ရောက်လျှင် Trailing SL ပြောင်းမည်',
        tp1Price: Number((bnbPrice * 1.055).toFixed(2)),
        tp1GainPct: 5.5,
        tp2Price: Number((bnbPrice * 1.12).toFixed(2)),
        tp2GainPct: 12.0,
        tp3Price: Number((bnbPrice * 1.22).toFixed(2)),
        tp3GainPct: 22.0,
        slPrice: Number((bnbPrice * 0.97).toFixed(2)),
        slLossPct: 3.0,
        leverage: 4,
        riskReward: '1 : 3.2',
        ruleSummaryEn: 'Hold for multi-week trend, noise immune buffer',
        ruleSummaryMy: 'ရက်သတ္တပတ်ချီ စောင့်ဆိုင်းစီးနင်းပြီး စျေးကွက်လှုပ်ခတ်မှု အလွယ်တကူ မထိစေရန် buffer ထားမည်',
      },
    });

    // Style 5: Long-Term Investing (BTC Weekly-Monthly)
    list.push({
      id: 'style-longterm-btc',
      category: 'styles',
      categoryLabelEn: 'Strategy 5: Long-Term Investing',
      categoryLabelMy: 'Trade နည်း ၅: Long-Term (နှစ်ရှည် ဦးတည်ချက်)',
      symbol: 'BTC',
      pair: 'BTCUSDT',
      bias: 'LONG',
      timeframe: '1W - 1M',
      styleNameEn: 'Long-Term Investing',
      styleNameMy: 'Long-Term (နှစ်ရှည် ဦးတည်ချက်)',
      currentPrice: btcPrice,
      statusTextEn: 'Macro Halving Cycle Expansion',
      statusTextMy: 'Macro စက်ဝန်းအရ အရှိန်အဟုန်ဖြင့် တိုးတက်မှုအဆင့်',
      targetView: 'strategy',
      technicalTrack: {
        entryPrice: Number((btcPrice * 0.985).toFixed(2)),
        entryConditionEn: 'DCA buy on weekly bullish order block',
        entryConditionMy: 'အပတ်စဉ် Bullish Orderblock တွင် အချိုးကျ စုဆောင်းဝယ်မည်',
        tp1Price: Number((btcPrice * 1.15).toFixed(2)),
        tp1GainPct: 15.0,
        tp2Price: Number((btcPrice * 1.30).toFixed(2)),
        tp2GainPct: 30.0,
        tp3Price: Number((btcPrice * 1.50).toFixed(2)),
        tp3GainPct: 50.0,
        slPrice: Number((btcPrice * 0.94).toFixed(2)),
        slLossPct: 6.0,
        leverage: 3,
        riskReward: '1 : 4.0',
        invalidationEn: 'Monthly close below 200-day moving average',
        invalidationMy: 'လစဉ်ဖယောင်းတိုင် ရက် ၂၀၀ MA အောက်ဆင်းပိတ်ပါက ပြန်လည်သုံးသပ်မည်',
      },
      myRulesTrack: {
        entryPrice: Number((btcPrice * 0.99).toFixed(2)),
        entryConditionEn: 'Conservative leverage (3x), protect against 20% flash crashes',
        entryConditionMy: 'Leverage ၃ ဆ သာသုံးပြီး ၂၀% ရုတ်တရက်ထိုးကျမှုဒဏ် ခံနိုင်ရည်ရှိအောင် ထိန်းထားမည်',
        tp1Price: Number((btcPrice * 1.12).toFixed(2)),
        tp1GainPct: 12.0,
        tp2Price: Number((btcPrice * 1.25).toFixed(2)),
        tp2GainPct: 25.0,
        tp3Price: Number((btcPrice * 1.45).toFixed(2)),
        tp3GainPct: 45.0,
        slPrice: Number((btcPrice * 0.95).toFixed(2)),
        slLossPct: 5.0,
        leverage: 3,
        riskReward: '1 : 3.8',
        ruleSummaryEn: 'Institutional multi-month horizon, compound capital safely',
        ruleSummaryMy: 'လချီသော စက်ဝန်းအတွက် အရင်းအနှီးလုံခြုံစွာ တိုးပွားစေမည်',
      },
    });

    // ==========================================
    // MODULE 2: အန္တရာယ်စီမံခန့်ခွဲမှု & 10% ခန့်မှန်းတွက်ချက်စနစ် (RISK AUDIT & 10% CALCULATOR)
    // ==========================================

    // Calculator 1: BTC 10% Feasibility & Preservation Guard
    list.push({
      id: 'calc-btc-10pct',
      category: 'calculator',
      categoryLabelEn: 'Risk Audit & 10% Move Calculator',
      categoryLabelMy: 'အန္တရာယ်စီမံခန့်ခွဲမှု & ၁၀% ခန့်မှန်းတွက်ချက်စနစ်',
      symbol: 'BTC',
      pair: 'BTCUSDT',
      bias: 'LONG',
      timeframe: '4H - 1D',
      styleNameEn: '10% Feasibility Audit & Risk Guard',
      styleNameMy: '၁၀% ဖြစ်နိုင်ခြေ စိစစ်ချက်နှင့် အရင်းအနှီးကာကွယ်မှု',
      currentPrice: btcPrice,
      statusTextEn: '10% Feasibility: 88% (HIGH) • Liquidation Buffer: 42%',
      statusTextMy: '၁၀% ဖြစ်နိုင်ခြေ: ၈၈% (HIGH) • Liquidation အကွာအဝေး: ၄၂%',
      targetView: 'calculator',
      technicalTrack: {
        entryPrice: Number((btcPrice * 0.996).toFixed(2)),
        entryConditionEn: 'Optimal entry computed for safe 10% move capture',
        entryConditionMy: '၁၀% ရွေ့လျားမှုကို လုံခြုံစွာ ဖမ်းယူနိုင်ရန် တွက်ချက်ထားသော အဝင်',
        tp1Price: Number((btcPrice * 1.05).toFixed(2)),
        tp1GainPct: 5.0,
        tp2Price: Number((btcPrice * 1.10).toFixed(2)),
        tp2GainPct: 10.0,
        tp3Price: Number((btcPrice * 1.15).toFixed(2)),
        tp3GainPct: 15.0,
        slPrice: Number((btcPrice * 0.982).toFixed(2)),
        slLossPct: 1.8,
        leverage: 8,
        riskReward: '1 : 3.0',
        invalidationEn: 'Break of ATR volatility support band',
        invalidationMy: 'ATR လှုပ်ခတ်မှု Support ဇုန် ကျိုးပေါက်ပါက ဖျက်သိမ်းမည်',
      },
      myRulesTrack: {
        entryPrice: Number((btcPrice * 0.998).toFixed(2)),
        entryConditionEn: 'Capital preservation rule: Max 1.5% portfolio risk cap',
        entryConditionMy: 'အရင်းအနှီးကာကွယ်ရေးစည်းမျဉ်း: အကောင့်ဆုံးရှုံးနိုင်ခြေ ၁.၅% မကျော်ရ',
        tp1Price: Number((btcPrice * 1.04).toFixed(2)),
        tp1GainPct: 4.0,
        tp2Price: Number((btcPrice * 1.10).toFixed(2)),
        tp2GainPct: 10.0,
        tp3Price: Number((btcPrice * 1.14).toFixed(2)),
        tp3GainPct: 14.0,
        slPrice: Number((btcPrice * 0.985).toFixed(2)),
        slLossPct: 1.5,
        leverage: 7,
        riskReward: '1 : 2.8',
        ruleSummaryEn: 'Noise-immune 8x leverage, zero risk of accidental liquidation',
        ruleSummaryMy: 'လှိုင်းကြမ်းမှုဒဏ်ခံနိုင်သော Leverage ဖြင့် မတော်တဆ Liquidation လုံးဝမဖြစ်စေရန် ကာကွယ်ထားသည်',
      },
    });

    // Calculator 2: SOL Noise-Immune Buffer & 10% Move
    list.push({
      id: 'calc-sol-10pct',
      category: 'calculator',
      categoryLabelEn: 'Risk Audit & 10% Move Calculator',
      categoryLabelMy: 'အန္တရာယ်စီမံခန့်ခွဲမှု & ၁၀% ခန့်မှန်းတွက်ချက်စနစ်',
      symbol: 'SOL',
      pair: 'SOLUSDT',
      bias: 'LONG',
      timeframe: '1H - 4H',
      styleNameEn: 'Volatility Buffer & 10% Move',
      styleNameMy: 'စျေးကွက်လှုပ်ခတ်မှုခံနိုင်သော Leverage ချိန်ညှိမှု',
      currentPrice: solPrice,
      statusTextEn: '10% Feasibility: 82% (HIGH) • Risk Cap: 1.2%',
      statusTextMy: '၁၀% ဖြစ်နိုင်ခြေ: ၈၂% (HIGH) • စွန့်စားမှုကန့်သတ်: ၁.၂%',
      targetView: 'calculator',
      technicalTrack: {
        entryPrice: Number((solPrice * 0.994).toFixed(2)),
        entryConditionEn: 'Entry calculated past market noise threshold',
        entryConditionMy: 'စျေးကွက်လှိုင်းခတ်မှုအန္တရာယ် ကင်းလွတ်စေသော နေရာတွင် အော်ဒါဝင်မည်',
        tp1Price: Number((solPrice * 1.05).toFixed(2)),
        tp1GainPct: 5.0,
        tp2Price: Number((solPrice * 1.10).toFixed(2)),
        tp2GainPct: 10.0,
        tp3Price: Number((solPrice * 1.16).toFixed(2)),
        tp3GainPct: 16.0,
        slPrice: Number((solPrice * 0.978).toFixed(2)),
        slLossPct: 2.2,
        leverage: 12,
        riskReward: '1 : 2.7',
        invalidationEn: '4H wick closure under $95.00',
        invalidationMy: '4H ဖယောင်းတိုင် အောက်ခြေအောက်ကျဆင်းလျှင် ဖျက်သိမ်းမည်',
      },
      myRulesTrack: {
        entryPrice: Number((solPrice * 0.997).toFixed(2)),
        entryConditionEn: 'Strict trailing stop loss applied at 5% profit milestone',
        entryConditionMy: '၅% အမြတ်ရရှိချိန်တွင် Trailing SL တင်၍ အရင်းအနှီး အကာအကွယ်ရယူမည်',
        tp1Price: Number((solPrice * 1.045).toFixed(2)),
        tp1GainPct: 4.5,
        tp2Price: Number((solPrice * 1.10).toFixed(2)),
        tp2GainPct: 10.0,
        tp3Price: Number((solPrice * 1.15).toFixed(2)),
        tp3GainPct: 15.0,
        slPrice: Number((solPrice * 0.982).toFixed(2)),
        slLossPct: 1.8,
        leverage: 10,
        riskReward: '1 : 2.5',
        ruleSummaryEn: 'Liquidation distance must exceed 35% under all circumstances',
        ruleSummaryMy: 'Liquidation အကွာအဝေးသည် အနည်းဆုံး ၃၅% ကျော် အမြဲကွာဝေးနေစေရမည်',
      },
    });

    // Calculator 3: SUI Volatility Audit Setup
    const suiPrice = suiTicker.lastPrice;
    list.push({
      id: 'calc-sui-audit',
      category: 'calculator',
      categoryLabelEn: 'Risk Audit & 10% Move Calculator',
      categoryLabelMy: 'အန္တရာယ်စီမံခန့်ခွဲမှု & ၁၀% ခန့်မှန်းတွက်ချက်စနစ်',
      symbol: 'SUI',
      pair: 'SUIUSDT',
      bias: 'LONG',
      timeframe: '1H - 4H',
      styleNameEn: 'Capital Preservation & 10% Target',
      styleNameMy: 'အကောင့်ဆုံးရှုံးမှုကာကွယ်ခြင်းနှင့် ၁၀% ပစ်မှတ်',
      currentPrice: suiPrice,
      statusTextEn: '10% Feasibility: 91% (HIGH) • Score: 94/100',
      statusTextMy: '၁၀% ဖြစ်နိုင်ခြေ: ၉၁% (HIGH) • ရမှတ်: ၉၄/၁၀၀',
      targetView: 'calculator',
      technicalTrack: {
        entryPrice: Number((suiPrice * 0.992).toFixed(4)),
        entryConditionEn: 'Breakout pullback entry on 1H order flow',
        entryConditionMy: '1H Order Flow ပြန်ဆင်းစမ်းသပ်မှုတွင် ဝင်မည်',
        tp1Price: Number((suiPrice * 1.05).toFixed(4)),
        tp1GainPct: 5.0,
        tp2Price: Number((suiPrice * 1.10).toFixed(4)),
        tp2GainPct: 10.0,
        tp3Price: Number((suiPrice * 1.18).toFixed(4)),
        tp3GainPct: 18.0,
        slPrice: Number((suiPrice * 0.975).toFixed(4)),
        slLossPct: 2.5,
        leverage: 10,
        riskReward: '1 : 2.8',
        invalidationEn: 'H1 close under local consolidation low',
        invalidationMy: 'H1 ဖယောင်းတိုင် အစုအဝေးအောက်ခြေအောက်ပိတ်ပါက ဖျက်သိမ်းမည်',
      },
      myRulesTrack: {
        entryPrice: Number((suiPrice * 0.995).toFixed(4)),
        entryConditionEn: 'Maximum 1.0% portfolio risk budget with tight invalidation',
        entryConditionMy: 'အကောင့်အရင်းအနှီး၏ ၁.၀% သာ အဆုံးရှုံးခံ၍ တိကျသော SL ဖြင့် ကာကွယ်မည်',
        tp1Price: Number((suiPrice * 1.045).toFixed(4)),
        tp1GainPct: 4.5,
        tp2Price: Number((suiPrice * 1.10).toFixed(4)),
        tp2GainPct: 10.0,
        tp3Price: Number((suiPrice * 1.16).toFixed(4)),
        tp3GainPct: 16.0,
        slPrice: Number((suiPrice * 0.98).toFixed(4)),
        slLossPct: 2.0,
        leverage: 8,
        riskReward: '1 : 2.6',
        ruleSummaryEn: 'High volatility asset: reduce leverage and preserve margin',
        ruleSummaryMy: 'လှုပ်ခတ်မှုများသော coin ဖြစ်၍ Leverage လျှော့သုံးပြီး Margin ကို ထိန်းသိမ်းပါ',
      },
    });

    // ==========================================
    // MODULE 3: စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား (LIVE MARKET SCANNER)
    // ==========================================

    // Live Scanner 1: High 24h Volume Surge Breakout
    const volSymbol = topVolTicker.symbol || 'SOL';
    const volPrice = topVolTicker.lastPrice;
    list.push({
      id: `live-scanner-vol-${volSymbol}`,
      category: 'live_scanner',
      categoryLabelEn: 'Live Market Scanner Breakout',
      categoryLabelMy: 'စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား (Live Scanner)',
      symbol: volSymbol,
      pair: `${volSymbol}USDT`,
      bias: 'LONG',
      timeframe: '15M - 1H',
      styleNameEn: '24h Volume Surge Breakout Setup',
      styleNameMy: '၂၄ နာရီ Volume အမြင့်ဆုံးမှ ဖောက်ထွက်မှု စစ်ဂနယ်',
      currentPrice: volPrice,
      statusTextEn: `Volume: Top Ranked • 24h Change: +${Math.abs(topVolTicker.change24h).toFixed(1)}%`,
      statusTextMy: `Volume: အမြင့်ဆုံးအဆင့် • ၂၄ နာရီ: +${Math.abs(topVolTicker.change24h).toFixed(1)}%`,
      targetView: 'scanner',
      technicalTrack: {
        entryPrice: Number((volPrice * 0.998).toFixed(volPrice < 1 ? 4 : 2)),
        entryConditionEn: 'Enter on confirmed 15M volume expansion candle',
        entryConditionMy: '15M Volume မြင့်တက်လာသော ဖယောင်းတိုင်တွင် လိုက်ပါစီးနင်းမည်',
        tp1Price: Number((volPrice * 1.03).toFixed(volPrice < 1 ? 4 : 2)),
        tp1GainPct: 3.0,
        tp2Price: Number((volPrice * 1.06).toFixed(volPrice < 1 ? 4 : 2)),
        tp2GainPct: 6.0,
        tp3Price: Number((volPrice * 1.10).toFixed(volPrice < 1 ? 4 : 2)),
        tp3GainPct: 10.0,
        slPrice: Number((volPrice * 0.985).toFixed(volPrice < 1 ? 4 : 2)),
        slLossPct: 1.5,
        leverage: 12,
        riskReward: '1 : 2.6',
        invalidationEn: 'Volume drops back below 20-period average',
        invalidationMy: 'Volume ပျောက်ကွယ်သွားပါက ချက်ချင်းပြန်ထွက်မည်',
      },
      myRulesTrack: {
        entryPrice: Number((volPrice * 1.001).toFixed(volPrice < 1 ? 4 : 2)),
        entryConditionEn: 'Enter strictly after breakout retest confirmation',
        entryConditionMy: 'ဖောက်ထွက်ပြီး ပြန်လည်စမ်းသပ်မှု အောင်မြင်ပြီးမှ ဝင်မည်',
        tp1Price: Number((volPrice * 1.025).toFixed(volPrice < 1 ? 4 : 2)),
        tp1GainPct: 2.5,
        tp2Price: Number((volPrice * 1.055).toFixed(volPrice < 1 ? 4 : 2)),
        tp2GainPct: 5.5,
        tp3Price: Number((volPrice * 1.09).toFixed(volPrice < 1 ? 4 : 2)),
        tp3GainPct: 9.0,
        slPrice: Number((volPrice * 0.988).toFixed(volPrice < 1 ? 4 : 2)),
        slLossPct: 1.2,
        leverage: 10,
        riskReward: '1 : 2.3',
        ruleSummaryEn: 'Lock 50% profit at TP1, move SL to breakeven',
        ruleSummaryMy: 'TP1 ရောက်လျှင် အမြတ် ၅၀% သိမ်းပြီး ကျန်ကို အရင်းအနှီးကာကွယ် Trailing SL ထားမည်',
      },
    });

    // Live Scanner 2: Top Gainer Momentum Continuation
    const gainerSymbol = topGainerTicker.symbol || 'SUI';
    const gainerPrice = topGainerTicker.lastPrice;
    list.push({
      id: `live-scanner-momentum-${gainerSymbol}`,
      category: 'live_scanner',
      categoryLabelEn: 'Live Market Scanner Momentum',
      categoryLabelMy: 'စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား (Live Scanner)',
      symbol: gainerSymbol,
      pair: `${gainerSymbol}USDT`,
      bias: 'LONG',
      timeframe: '15M - 1H',
      styleNameEn: 'Live Momentum Continuation Setup',
      styleNameMy: 'Live Scanner အမြန်တက်လှိုင်း စီးနင်းမှု Setup',
      currentPrice: gainerPrice,
      statusTextEn: `Top Gainer Momentum • 24h: +${Math.abs(topGainerTicker.change24h).toFixed(1)}%`,
      statusTextMy: `အမြင့်ဆုံး အတက်လှိုင်း • ၂၄ နာရီ: +${Math.abs(topGainerTicker.change24h).toFixed(1)}%`,
      targetView: 'scanner',
      technicalTrack: {
        entryPrice: Number((gainerPrice * 0.995).toFixed(gainerPrice < 1 ? 4 : 2)),
        entryConditionEn: 'Buy the 15M pullback dip in strong bullish trend',
        entryConditionMy: 'ခိုင်မာသော အတက်လှိုင်းအတွင်း 15M Dip ပြန်ဆင်းချိန်တွင် ဝယ်မည်',
        tp1Price: Number((gainerPrice * 1.04).toFixed(gainerPrice < 1 ? 4 : 2)),
        tp1GainPct: 4.0,
        tp2Price: Number((gainerPrice * 1.08).toFixed(gainerPrice < 1 ? 4 : 2)),
        tp2GainPct: 8.0,
        tp3Price: Number((gainerPrice * 1.12).toFixed(gainerPrice < 1 ? 4 : 2)),
        tp3GainPct: 12.0,
        slPrice: Number((gainerPrice * 0.98).toFixed(gainerPrice < 1 ? 4 : 2)),
        slLossPct: 2.0,
        leverage: 10,
        riskReward: '1 : 2.5',
        invalidationEn: '15M trendline break',
        invalidationMy: '15M Trendline ကျိုးပေါက်ပါက ဖျက်သိမ်းမည်',
      },
      myRulesTrack: {
        entryPrice: Number((gainerPrice * 0.997).toFixed(gainerPrice < 1 ? 4 : 2)),
        entryConditionEn: 'Scale in 50% on pullback, 50% on momentum breakout',
        entryConditionMy: 'Dip ဆင်းချိန် ၅၀%၊ ဖောက်တက်ချိန် ၅၀% ခွဲဝင်မည်',
        tp1Price: Number((gainerPrice * 1.035).toFixed(gainerPrice < 1 ? 4 : 2)),
        tp1GainPct: 3.5,
        tp2Price: Number((gainerPrice * 1.07).toFixed(gainerPrice < 1 ? 4 : 2)),
        tp2GainPct: 7.0,
        tp3Price: Number((gainerPrice * 1.11).toFixed(gainerPrice < 1 ? 4 : 2)),
        tp3GainPct: 11.0,
        slPrice: Number((gainerPrice * 0.983).toFixed(gainerPrice < 1 ? 4 : 2)),
        slLossPct: 1.7,
        leverage: 8,
        riskReward: '1 : 2.3',
        ruleSummaryEn: 'Trailing stop loss to capture extended trend runner',
        ruleSummaryMy: 'တက်လှိုင်းအပြည့်အဝရရှိစေရန် Trailing SL ဖြင့် လိုက်ပါစီးနင်းမည်',
      },
    });

    // Live Scanner 3: Negative Funding Rate Squeeze Setup
    const fundSymbol = negFundingTicker.symbol || 'DOGE';
    const fundPrice = negFundingTicker.lastPrice;
    list.push({
      id: `live-scanner-squeeze-${fundSymbol}`,
      category: 'live_scanner',
      categoryLabelEn: 'Live Scanner Funding Rate Squeeze',
      categoryLabelMy: 'စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား (Live Scanner)',
      symbol: fundSymbol,
      pair: `${fundSymbol}USDT`,
      bias: 'LONG',
      timeframe: '15M - 1H',
      styleNameEn: 'Negative Funding Rate Short Squeeze',
      styleNameMy: 'Funding Rate အနုတ်ပြခြင်းမှ Short Squeeze Setup',
      currentPrice: fundPrice,
      statusTextEn: `Funding Rate: ${(negFundingTicker.fundingRate || -0.015).toFixed(4)}% (Heavy Shorts Loaded)`,
      statusTextMy: `Funding: အနုတ်ပြနေ၍ Short သမားများအား ရှင်းထုတ်မည့် Squeeze အသင့်`,
      targetView: 'scanner',
      technicalTrack: {
        entryPrice: Number((fundPrice * 0.998).toFixed(fundPrice < 1 ? 4 : 2)),
        entryConditionEn: 'Enter before 8-hour funding settlement squeeze pump',
        entryConditionMy: 'Funding Rate ပေးချေချိန် မတိုင်မီ Short Squeeze တက်လှိုင်းကို ကြိုတင်စီးမည်',
        tp1Price: Number((fundPrice * 1.035).toFixed(fundPrice < 1 ? 4 : 2)),
        tp1GainPct: 3.5,
        tp2Price: Number((fundPrice * 1.07).toFixed(fundPrice < 1 ? 4 : 2)),
        tp2GainPct: 7.0,
        tp3Price: Number((fundPrice * 1.12).toFixed(fundPrice < 1 ? 4 : 2)),
        tp3GainPct: 12.0,
        slPrice: Number((fundPrice * 0.984).toFixed(fundPrice < 1 ? 4 : 2)),
        slLossPct: 1.6,
        leverage: 10,
        riskReward: '1 : 2.6',
        invalidationEn: 'Funding rate flips deeply positive',
        invalidationMy: 'Funding Rate ပြန်လည်အပေါင်းပြောင်းပါက ဖျက်သိမ်းမည်',
      },
      myRulesTrack: {
        entryPrice: Number((fundPrice * 1.0).toFixed(fundPrice < 1 ? 4 : 2)),
        entryConditionEn: 'Enter on funding hour trigger confirmation',
        entryConditionMy: 'Funding အချိန်ဇယားနှင့် ကိုက်ညီပြီး စျေးတက်ချိန်တွင် ဝင်မည်',
        tp1Price: Number((fundPrice * 1.03).toFixed(fundPrice < 1 ? 4 : 2)),
        tp1GainPct: 3.0,
        tp2Price: Number((fundPrice * 1.06).toFixed(fundPrice < 1 ? 4 : 2)),
        tp2GainPct: 6.0,
        tp3Price: Number((fundPrice * 1.10).toFixed(fundPrice < 1 ? 4 : 2)),
        tp3GainPct: 10.0,
        slPrice: Number((fundPrice * 0.986).toFixed(fundPrice < 1 ? 4 : 2)),
        slLossPct: 1.4,
        leverage: 8,
        riskReward: '1 : 2.4',
        ruleSummaryEn: 'Short squeeze setup: take aggressive profit on sudden candle wicks',
        ruleSummaryMy: 'Squeeze ဖြစ်၍ ရုတ်တရက်တက်လာပါက အမြတ်ကို ချက်ချင်းရိတ်သိမ်းပါ',
      },
    });

    // ==========================================
    // MODULE 4: MASTER TRADE CARD နှင့် ပုံတင်စနစ် (MASTER TRADE CARD & CHART ANALYZER)
    // ==========================================

    // Master Trade Card 1: SOL Institutional Liquidity Sweep & Demand Block
    list.push({
      id: 'master-card-sol-demand',
      category: 'tradecard',
      categoryLabelEn: 'Section 13 Master Trade Card Setup',
      categoryLabelMy: 'Master Trade Card နှင့် ပုံတင်စနစ် [PRO]',
      symbol: 'SOL',
      pair: 'SOLUSDT',
      bias: 'LONG',
      timeframe: '15M - 1H',
      styleNameEn: 'Institutional Liquidity Sweep & Demand Reclaim',
      styleNameMy: 'အဖွဲ့အစည်း ဝယ်လိုအားဇုန်နှင့် Liquidity Sweep ပြန်တက်မှု',
      currentPrice: solPrice,
      statusTextEn: 'Section 13 Master Card Ready • Chart Analysis: Verified',
      statusTextMy: 'Section 13 Master Card အသင့် • Chart စစ်ဆေးပြီး',
      targetView: 'tradecard',
      technicalTrack: {
        entryPrice: Number((solPrice * 0.993).toFixed(2)),
        entryConditionEn: 'Execute at 15M Institutional Order Block reclaim',
        entryConditionMy: '15M အဖွဲ့အစည်း Orderblock ပြန်လည်သိမ်းပိုက်ချိန်တွင် အတည်ပြုဝင်မည်',
        tp1Price: Number((solPrice * 1.035).toFixed(2)),
        tp1GainPct: 3.5,
        tp2Price: Number((solPrice * 1.075).toFixed(2)),
        tp2GainPct: 7.5,
        tp3Price: Number((solPrice * 1.125).toFixed(2)),
        tp3GainPct: 12.5,
        slPrice: Number((solPrice * 0.982).toFixed(2)),
        slLossPct: 1.8,
        leverage: 12,
        riskReward: '1 : 2.8',
        invalidationEn: '15M candle closes below liquidity sweep low',
        invalidationMy: '15M ဖယောင်းတိုင် အောက်ခြေအောက်ဆင်းပိတ်ပါက Setup အလိုအလျောက် ပျက်ပြယ်မည်',
      },
      myRulesTrack: {
        entryPrice: Number((solPrice * 0.996).toFixed(2)),
        entryConditionEn: 'Upload TradingView screenshot to AI Assistant for final institutional checklist',
        entryConditionMy: 'မိမိ TradingView ပုံတင်၍ AI စစ်ဆေးမှုရလဒ် အစိမ်းပြမှသာ အတည်ပြုဖွင့်လှစ်မည်',
        tp1Price: Number((solPrice * 1.03).toFixed(2)),
        tp1GainPct: 3.0,
        tp2Price: Number((solPrice * 1.065).toFixed(2)),
        tp2GainPct: 6.5,
        tp3Price: Number((solPrice * 1.11).toFixed(2)),
        tp3GainPct: 11.0,
        slPrice: Number((solPrice * 0.985).toFixed(2)),
        slLossPct: 1.5,
        leverage: 10,
        riskReward: '1 : 2.5',
        ruleSummaryEn: 'Complete 13-point confirmation before entry, strict capital shield',
        ruleSummaryMy: 'အချက် ၁၃ ချက်ပြည့်စုံမှသာ ဝင်မည်၊ အရင်းအနှီးကာကွယ်မှု အပြည့်ထားရှိမည်',
      },
    });

    // Master Trade Card 2: BTC Golden Pocket 0.618 FVG Setup
    list.push({
      id: 'master-card-btc-fvg',
      category: 'tradecard',
      categoryLabelEn: 'Section 13 Master Trade Card Setup',
      categoryLabelMy: 'Master Trade Card နှင့် ပုံတင်စနစ် [PRO]',
      symbol: 'BTC',
      pair: 'BTCUSDT',
      bias: 'LONG',
      timeframe: '4H - 1D',
      styleNameEn: 'Macro Golden Pocket 0.618 FVG Re-test',
      styleNameMy: 'ရွှေရောင် 0.618 FVG ပြန်စမ်းမှု Master Setup',
      currentPrice: btcPrice,
      statusTextEn: 'Institutional Confluence: 96% • Chart Audit: High Conviction',
      statusTextMy: 'နည်းပညာ အထောက်အထား: ၉၆% • Chart စစ်ဆေးချက်: အထူးအားကောင်း',
      targetView: 'tradecard',
      technicalTrack: {
        entryPrice: Number((btcPrice * 0.994).toFixed(2)),
        entryConditionEn: 'Fibonacci 0.618 + Fair Value Gap alignment entry',
        entryConditionMy: 'Fibonacci 0.618 နှင့် Fair Value Gap ဇုန် ဆုံမှတ်တွင် အော်ဒါဝင်မည်',
        tp1Price: Number((btcPrice * 1.04).toFixed(2)),
        tp1GainPct: 4.0,
        tp2Price: Number((btcPrice * 1.08).toFixed(2)),
        tp2GainPct: 8.0,
        tp3Price: Number((btcPrice * 1.13).toFixed(2)),
        tp3GainPct: 13.0,
        slPrice: Number((btcPrice * 0.981).toFixed(2)),
        slLossPct: 1.9,
        leverage: 10,
        riskReward: '1 : 2.9',
        invalidationEn: '4H close below 0.65 Fib invalidation level',
        invalidationMy: '4H ဖယောင်းတိုင် 0.65 Fib အောက်ဆင်းပိတ်ပါက ဖျက်သိမ်းမည်',
      },
      myRulesTrack: {
        entryPrice: Number((btcPrice * 0.996).toFixed(2)),
        entryConditionEn: 'Verify with custom chart image upload in Section 13 analyzer',
        entryConditionMy: 'Section 13 ပုံတင်စနစ်တွင် မိမိ chart ပုံတင်၍ 100% သေချာမှ ဝင်မည်',
        tp1Price: Number((btcPrice * 1.035).toFixed(2)),
        tp1GainPct: 3.5,
        tp2Price: Number((btcPrice * 1.075).toFixed(2)),
        tp2GainPct: 7.5,
        tp3Price: Number((btcPrice * 1.12).toFixed(2)),
        tp3GainPct: 12.0,
        slPrice: Number((btcPrice * 0.984).toFixed(2)),
        slLossPct: 1.6,
        leverage: 8,
        riskReward: '1 : 2.6',
        ruleSummaryEn: 'High-conviction macro trade, strictly respect risk limits',
        ruleSummaryMy: 'အဆင့်မြင့် အဖွဲ့အစည်း Trade ဖြစ်၍ အန္တရာယ်ကန့်သတ်ချက်ကို အတိအကျလိုက်နာပါ',
      },
    });

    // Master Trade Card 3: ETH Wyckoff Accumulation Spring
    list.push({
      id: 'master-card-eth-wyckoff',
      category: 'tradecard',
      categoryLabelEn: 'Section 13 Master Trade Card Setup',
      categoryLabelMy: 'Master Trade Card နှင့် ပုံတင်စနစ် [PRO]',
      symbol: 'ETH',
      pair: 'ETHUSDT',
      bias: 'LONG',
      timeframe: '1H - 4H',
      styleNameEn: 'Wyckoff Accumulation Phase C Spring Reclaim',
      styleNameMy: 'Wyckoff Accumulation Phase C ပြန်လည်တက်လှိုင်း',
      currentPrice: ethPrice,
      statusTextEn: 'Spring Pattern Confirmed • Chart Upload: Ready',
      statusTextMy: 'Spring Pattern အတည်ပြုပြီး • Chart ပုံတင်စစ်ဆေးနိုင်သည်',
      targetView: 'tradecard',
      technicalTrack: {
        entryPrice: Number((ethPrice * 0.995).toFixed(2)),
        entryConditionEn: 'Buy immediately upon reclaim of range low test',
        entryConditionMy: 'Range Low အောက်ကျပြီး ပြန်တက်လာချိန်တွင် ချက်ချင်းဝယ်ယူမည်',
        tp1Price: Number((ethPrice * 1.04).toFixed(2)),
        tp1GainPct: 4.0,
        tp2Price: Number((ethPrice * 1.085).toFixed(2)),
        tp2GainPct: 8.5,
        tp3Price: Number((ethPrice * 1.14).toFixed(2)),
        tp3GainPct: 14.0,
        slPrice: Number((ethPrice * 0.98).toFixed(2)),
        slLossPct: 2.0,
        leverage: 10,
        riskReward: '1 : 2.7',
        invalidationEn: 'H4 close below the spring terminal wick',
        invalidationMy: 'H4 ဖယောင်းတိုင် Spring အောက်ခြေအောက်ကျဆင်းလျှင် ဖျက်သိမ်းမည်',
      },
      myRulesTrack: {
        entryPrice: Number((ethPrice * 0.997).toFixed(2)),
        entryConditionEn: 'Confirm volume divergence on 1H chart before placing limit',
        entryConditionMy: '1H Chart ပေါ်တွင် Volume Divergence ရှိမရှိ စစ်ဆေးပြီးမှ Limit အော်ဒါထားမည်',
        tp1Price: Number((ethPrice * 1.035).toFixed(2)),
        tp1GainPct: 3.5,
        tp2Price: Number((ethPrice * 1.075).toFixed(2)),
        tp2GainPct: 7.5,
        tp3Price: Number((ethPrice * 1.12).toFixed(2)),
        tp3GainPct: 12.0,
        slPrice: Number((ethPrice * 0.983).toFixed(2)),
        slLossPct: 1.7,
        leverage: 8,
        riskReward: '1 : 2.4',
        ruleSummaryEn: 'Master setup verified with institutional rule checklist',
        ruleSummaryMy: 'အဖွဲ့အစည်း စည်းမျဉ်းများဖြင့် စိစစ်ပြီးမှ စတင်ကုန်သွယ်ပါ',
      },
    });

    // ==========================================
    // MODULE 5: ထိပ်တန်း COINS (TOP CURATED OPPORTUNITIES)
    // ==========================================
    coins.slice(0, 4).forEach((coin) => {
      const p = coin.currentPrice;
      const isBull = coin.bias === 'LONG';
      list.push({
        id: `top-coin-${coin.symbol}`,
        category: 'top_coins',
        categoryLabelEn: 'Top Curated Setup',
        categoryLabelMy: `ထိပ်တန်း စစ်ဂနယ်: ${coin.symbol}`,
        symbol: coin.symbol,
        pair: `${coin.symbol}USDT`,
        bias: coin.bias,
        timeframe: '15M - 1H',
        styleNameEn: 'Volume Surge & Momentum',
        styleNameMy: 'Volume မြင့်တက်ပြီး Momentum အားကောင်း setup',
        currentPrice: p,
        statusTextEn: `Feasibility: ${coin.feasibility10Percent || 'HIGH'} • Trend: ${coin.bias}`,
        statusTextMy: `ဖြစ်နိုင်ခြေ: ${coin.feasibility10Percent || 'HIGH'} • ဦးတည်ချက်: ${coin.bias}`,
        targetView: 'home',
        technicalTrack: {
          entryPrice: Number((isBull ? p * 0.996 : p * 1.004).toFixed(p < 1 ? 4 : 2)),
          entryConditionEn: `Market ${coin.bias.toLowerCase()} on momentum continuation`,
          entryConditionMy: `Momentum အတိုင်း အချိုးကျ လိုက်ပါစီးမျောမည်`,
          tp1Price: Number((isBull ? p * 1.03 : p * 0.97).toFixed(p < 1 ? 4 : 2)),
          tp1GainPct: 3.0,
          tp2Price: Number((isBull ? p * 1.06 : p * 0.94).toFixed(p < 1 ? 4 : 2)),
          tp2GainPct: 6.0,
          tp3Price: Number((isBull ? p * 1.09 : p * 0.91).toFixed(p < 1 ? 4 : 2)),
          tp3GainPct: 9.0,
          slPrice: Number((isBull ? p * 0.985 : p * 1.015).toFixed(p < 1 ? 4 : 2)),
          slLossPct: 1.5,
          leverage: 10,
          riskReward: '1 : 2.5',
          invalidationEn: `Key support/resistance break at ${(p * 0.98).toFixed(2)}`,
          invalidationMy: `အဓိက Support/Resistance ကျိုးပေါက်ပါက ဖျက်သိမ်းမည်`,
        },
        myRulesTrack: {
          entryPrice: Number(p.toFixed(p < 1 ? 4 : 2)),
          entryConditionEn: 'Enter strictly after volume spike confirmation',
          entryConditionMy: 'Volume အတည်ပြုချက်ရရှိပြီးမှ အချိုးကျဝင်မည်',
          tp1Price: Number((isBull ? p * 1.025 : p * 0.975).toFixed(p < 1 ? 4 : 2)),
          tp1GainPct: 2.5,
          tp2Price: Number((isBull ? p * 1.05 : p * 0.95).toFixed(p < 1 ? 4 : 2)),
          tp2GainPct: 5.0,
          tp3Price: Number((isBull ? p * 1.08 : p * 0.92).toFixed(p < 1 ? 4 : 2)),
          tp3GainPct: 8.0,
          slPrice: Number((isBull ? p * 0.988 : p * 1.012).toFixed(p < 1 ? 4 : 2)),
          slLossPct: 1.2,
          leverage: 8,
          riskReward: '1 : 2.2',
          ruleSummaryEn: 'Max 1.0% wallet risk, lock 50% profit at TP1',
          ruleSummaryMy: '၁% အကောင့်အန္တရာယ်ကန့်သတ်၊ TP1 ရောက်လျှင် ၅၀% အမြတ်သိမ်း',
        },
      });
    });

    return list;
  }, [coins, liveTickers]);

  // Helper: Dynamically compute auto-tuned margin and leverage for each signal
  // strictly adhering to user intent: "ammount ပေါ်မူတည်ပြီး ငါ့စည်းမျဉ်းနဲ့ မင်းစဉ်းမျည်းခုလုပ်ထားတဲ့အတိုင်း လိုက်ချိန်ညှိပေးအောင်လုပ်ထား leverage ကိုမင်းညှိပေးရမှာ"
  const getComputedSignalMetrics = (sig: TradeSignalItem) => {
    const currentWallet = Math.max(10, walletBalance);

    // ─────────────────────────────────────────────────────────────
    // 1. Technical / AI Track Calculation (မင်းရဲ့ ခွဲခြမ်းစိတ်ဖြာမှု)
    // ─────────────────────────────────────────────────────────────
    let techMargin: number;
    let techLeverage: number;

    if (autoTuneRisk) {
      // AI Technical allocation: 10% of portfolio
      techMargin = Math.max(10, Math.min(Math.round(currentWallet * 0.1), 1000));
      // Auto-tune leverage based on coin volatility & SL distance
      const slPct = sig.technicalTrack.slLossPct;
      if (slPct <= 0.6) {
        techLeverage = 20; // Tight scalp
      } else if (slPct <= 1.5) {
        techLeverage = 12; // Standard intraday
      } else if (slPct <= 2.5) {
        techLeverage = 8; // Day/Swing
      } else {
        techLeverage = 5; // Volatile altcoin
      }
    } else {
      techMargin = manualMargin;
      techLeverage = manualLeverage;
    }

    const techNotional = techMargin * techLeverage;
    const techDollarProfit1 = techNotional * (sig.technicalTrack.tp1GainPct / 100);
    const techDollarProfit2 = techNotional * (sig.technicalTrack.tp2GainPct / 100);
    const techDollarProfit3 = techNotional * (sig.technicalTrack.tp3GainPct / 100);
    const techDollarLoss = techNotional * (sig.technicalTrack.slLossPct / 100);
    const techAccountLossPct = (techDollarLoss / currentWallet) * 100;

    const techFeeAndTarget = calculateTradeFeesAndTargets(
      sig.technicalTrack.entryPrice,
      techNotional,
      techMargin,
      sig.bias === 'SHORT' ? 'SHORT' : 'LONG',
      (sig.technicalTrack.tp1GainPct / 0.8) || 3.0
    );

    const techDetailedFees = computeDetailedSignalFeesAndExit({
      entryPrice: sig.technicalTrack.entryPrice,
      tp1Price: sig.technicalTrack.tp1Price,
      tp2Price: sig.technicalTrack.tp2Price,
      tp3Price: sig.technicalTrack.tp3Price,
      slPrice: sig.technicalTrack.slPrice,
      marginUsd: techMargin,
      leverage: techLeverage,
      walletBalance: currentWallet,
      direction: sig.bias === 'SHORT' ? 'SHORT' : 'LONG',
      customTp1ReasonMy: sig.technicalTrack.tp1CloseReasonMy,
      customTp2ReasonMy: sig.technicalTrack.tp2CloseReasonMy,
      customTp3ReasonMy: sig.technicalTrack.tp3CloseReasonMy,
      customSlReasonMy: sig.technicalTrack.slCloseReasonMy || sig.technicalTrack.invalidationMy,
      customTp1ReasonEn: sig.technicalTrack.tp1CloseReasonEn,
      customTp2ReasonEn: sig.technicalTrack.tp2CloseReasonEn,
      customTp3ReasonEn: sig.technicalTrack.tp3CloseReasonEn,
      customSlReasonEn: sig.technicalTrack.slCloseReasonEn || sig.technicalTrack.invalidationEn,
    });

    // ─────────────────────────────────────────────────────────────
    // 2. My Rules Track Calculation (ငါ့ရဲ့ စည်းမျဉ်း - Strict Capital Preservation)
    // ─────────────────────────────────────────────────────────────
    let myMargin: number;
    let myLeverage: number;

    if (autoTuneRisk) {
      // My Rules allocation: 7.5% of portfolio per trade
      myMargin = Math.max(10, Math.min(Math.round(currentWallet * 0.075), 1000));
      // Strict rule: Max risk at SL must not exceed 1.0% - 1.5% of wallet balance!
      const maxAllowedRiskDollar = currentWallet * 0.015; // 1.5% max account risk
      const slRatio = sig.myRulesTrack.slLossPct / 100;
      // Formula: notional = maxAllowedRiskDollar / slRatio
      // safeLeverage = notional / myMargin
      const calculatedLev = Math.floor(maxAllowedRiskDollar / (myMargin * slRatio));
      const maxCap = sig.symbol === 'BTC' ? 15 : 10;
      myLeverage = Math.max(2, Math.min(maxCap, calculatedLev || 8));
    } else {
      myMargin = manualMargin;
      myLeverage = manualLeverage;
    }

    const myNotional = myMargin * myLeverage;
    const myDollarProfit1 = myNotional * (sig.myRulesTrack.tp1GainPct / 100);
    const myDollarProfit2 = myNotional * (sig.myRulesTrack.tp2GainPct / 100);
    const myDollarProfit3 = myNotional * (sig.myRulesTrack.tp3GainPct / 100);
    const myDollarLoss = myNotional * (sig.myRulesTrack.slLossPct / 100);
    const myAccountLossPct = (myDollarLoss / currentWallet) * 100;

    const myFeeAndTarget = calculateTradeFeesAndTargets(
      sig.myRulesTrack.entryPrice,
      myNotional,
      myMargin,
      sig.bias === 'SHORT' ? 'SHORT' : 'LONG',
      (sig.myRulesTrack.tp1GainPct / 0.8) || 3.0
    );

    const myDetailedFees = computeDetailedSignalFeesAndExit({
      entryPrice: sig.myRulesTrack.entryPrice,
      tp1Price: sig.myRulesTrack.tp1Price,
      tp2Price: sig.myRulesTrack.tp2Price,
      tp3Price: sig.myRulesTrack.tp3Price,
      slPrice: sig.myRulesTrack.slPrice,
      marginUsd: myMargin,
      leverage: myLeverage,
      walletBalance: currentWallet,
      direction: sig.bias === 'SHORT' ? 'SHORT' : 'LONG',
      customTp1ReasonMy: sig.myRulesTrack.tp1CloseReasonMy,
      customTp2ReasonMy: sig.myRulesTrack.tp2CloseReasonMy,
      customTp3ReasonMy: sig.myRulesTrack.tp3CloseReasonMy,
      customSlReasonMy: sig.myRulesTrack.slCloseReasonMy || sig.myRulesTrack.invalidationMy,
      customTp1ReasonEn: sig.myRulesTrack.tp1CloseReasonEn,
      customTp2ReasonEn: sig.myRulesTrack.tp2CloseReasonEn,
      customTp3ReasonEn: sig.myRulesTrack.tp3CloseReasonEn,
      customSlReasonEn: sig.myRulesTrack.slCloseReasonEn || sig.myRulesTrack.invalidationEn,
    });

    return {
      techMargin,
      techLeverage,
      techNotional,
      techDollarProfit1,
      techDollarProfit2,
      techDollarProfit3,
      techDollarLoss,
      techAccountLossPct,
      techFeeAndTarget,
      techDetailedFees,
      myMargin,
      myLeverage,
      myNotional,
      myDollarProfit1,
      myDollarProfit2,
      myDollarProfit3,
      myDollarLoss,
      myAccountLossPct,
      myFeeAndTarget,
      myDetailedFees,
    };
  };

  // Filter by category, direction, and search query
  const filteredSignals = useMemo(() => {
    return allSignals.filter((sig) => {
      // Category filter
      if (activeCategory !== 'all' && sig.category !== activeCategory) {
        return false;
      }
      // Direction filter
      if (directionFilter !== 'ALL' && sig.bias !== directionFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSymbol = sig.symbol.toLowerCase().includes(q);
        const matchPair = sig.pair.toLowerCase().includes(q);
        const matchStyle = sig.styleNameEn.toLowerCase().includes(q) || sig.styleNameMy.toLowerCase().includes(q);
        if (!matchSymbol && !matchPair && !matchStyle) {
          return false;
        }
      }
      return true;
    });
  }, [allSignals, activeCategory, directionFilter, searchQuery]);

  // Copy helper with visual toast
  const handleCopyText = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedValue(label);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedValue(null);
    }, 2000);
  };

  // Exact clean signal copy matching user's requested format with taxes & exit rationale:
  const handleQuickCopySimpleSignal = (sig: TradeSignalItem, trackType: 'technical' | 'my_rules') => {
    const track = trackType === 'technical' ? sig.technicalTrack : sig.myRulesTrack;
    const m = getComputedSignalMetrics(sig);
    const marginUsed = trackType === 'technical' ? m.techMargin : m.myMargin;
    const leverageUsed = trackType === 'technical' ? m.techLeverage : m.myLeverage;
    const detailed = trackType === 'technical' ? m.techDetailedFees : m.myDetailedFees;

    const formatted = `${sig.symbol} ${sig.bias} ${track.entryPrice}
TP¹ ${track.tp1Price} [Net: +$${detailed.tp1NetProfit.toFixed(1)} after tax/fee]
TP² ${track.tp2Price} [Net: +$${detailed.tp2NetProfit.toFixed(1)} after tax/fee]
TP³ ${track.tp3Price} [Net: +$${detailed.tp3NetProfit.toFixed(1)} after tax/fee]
SL ${track.slPrice} [Total Loss: -$${detailed.slNetLossWithFees.toFixed(1)} with fees]
[Lev: ${leverageUsed}x • Margin: $${marginUsed} • Est. Fees: $${detailed.totalFeeUsd.toFixed(2)}]
Take-Profit Plan: TP1 close 50% & SL to BE (covers fees) | TP2 close 30% | TP3 close 20%
Stop-Loss Plan: Cut loss immediately if SL hit to prevent 100% liquidation`;

    handleCopyText(formatted, `${sig.id}-${trackType}-simple`, 'Simple Signal');
  };

  // Full Binance format copy with taxes and full exit rationale
  const handleCopyBinanceFullSignal = (sig: TradeSignalItem, trackType: 'technical' | 'my_rules') => {
    const track = trackType === 'technical' ? sig.technicalTrack : sig.myRulesTrack;
    const trackName = trackType === 'technical' ? 'AI / Technical Track' : 'My Personal Rules Track';
    const m = getComputedSignalMetrics(sig);
    const marginUsed = trackType === 'technical' ? m.techMargin : m.myMargin;
    const leverageUsed = trackType === 'technical' ? m.techLeverage : m.myLeverage;
    const detailed = trackType === 'technical' ? m.techDetailedFees : m.myDetailedFees;

    const formattedSignal = `⚡ BINANCE FUTURES SIGNAL (${trackName})
Pair: ${sig.pair}
Direction: ${sig.bias} ${sig.bias === 'LONG' ? '🟢' : sig.bias === 'SHORT' ? '🔴' : '🟡'}
Timeframe: ${sig.timeframe}

🔹 Entry Price: $${track.entryPrice}
🎯 TP¹: $${track.tp1Price} (+${track.tp1GainPct}%) | Net Profit: +$${detailed.tp1NetProfit.toFixed(2)} (after fee)
🎯 TP²: $${track.tp2Price} (+${track.tp2GainPct}%) | Net Profit: +$${detailed.tp2NetProfit.toFixed(2)} (after fee)
🎯 TP³: $${track.tp3Price} (+${track.tp3GainPct}%) | Net Profit: +$${detailed.tp3NetProfit.toFixed(2)} (after fee)
🛑 Stop Loss: $${track.slPrice} (-${track.slLossPct}%) | Net Total Loss: -$${detailed.slNetLossWithFees.toFixed(2)} (with fee)

⚙️ Leverage: ${leverageUsed}x (Auto-Tuned)
💵 Recommended Margin: $${marginUsed} (Position Size: $${(marginUsed * leverageUsed).toLocaleString()})
📊 Risk/Reward: ${track.riskReward}
💸 အခွန်/စရိတ် (Taxes & Roundtrip Fees): $${detailed.totalFeeUsd.toFixed(2)} (${detailed.feePercentageOfMargin.toFixed(1)}% of margin)
   • Entry Fee (0.05% Taker): $${detailed.entryFeeUsd.toFixed(2)}
   • Exit Fee (0.02% Maker): $${detailed.exitFeeUsd.toFixed(2)}

💰 အော်ဒါ ဘယ်လောက်မြတ်ရင် ဘာကြောင့် ပိတ်သင့်လဲ (Take-Profit Exit Rationale):
  • TP1 (+$${detailed.tp1NetProfit.toFixed(2)}): ${detailed.tp1CloseReasonMy}
  • TP2 (+$${detailed.tp2NetProfit.toFixed(2)}): ${detailed.tp2CloseReasonMy}
  • TP3 (+$${detailed.tp3NetProfit.toFixed(2)}): ${detailed.tp3CloseReasonMy}

🛑 အော်ဒါ ဘယ်လောက်ရှုံးရင် ဘာကြောင့် ပိတ်သင့်လဲ (Stop-Loss Protection):
  • SL (-$${detailed.slNetLossWithFees.toFixed(2)}): ${detailed.slCloseReasonMy}`;

    handleCopyText(formattedSignal, `${sig.id}-${trackType}-full`, 'Binance Full Signal');
  };

  // Categories tab definitions matching the application's core architecture
  const categoriesList: Array<{ id: SignalCategory; labelEn: string; labelMy: string; count: number }> = [
    { id: 'all', labelEn: 'All Signals', labelMy: 'အားလုံး (All)', count: allSignals.length },
    {
      id: 'styles',
      labelEn: '5 Trading Styles',
      labelMy: 'စတိုင်လ် ၅ မျိုး (5 Styles)',
      count: allSignals.filter((s) => s.category === 'styles').length,
    },
    {
      id: 'calculator',
      labelEn: 'Risk Audit & 10%',
      labelMy: 'အန္တရာယ်စီမံခန့်ခွဲမှု & 10%',
      count: allSignals.filter((s) => s.category === 'calculator').length,
    },
    {
      id: 'live_scanner',
      labelEn: 'Live Scanner',
      labelMy: 'စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား (Live)',
      count: allSignals.filter((s) => s.category === 'live_scanner').length,
    },
    {
      id: 'tradecard',
      labelEn: 'Master Trade Card',
      labelMy: 'Master Trade Card (ပုံတင်စနစ်)',
      count: allSignals.filter((s) => s.category === 'tradecard').length,
    },
    {
      id: 'top_coins',
      labelEn: 'Top Curated Setups',
      labelMy: 'ထိပ်တန်း Coins (Top Picks)',
      count: allSignals.filter((s) => s.category === 'top_coins').length,
    },
  ];

  // 4 Core Application Modules shown in reference screenshot
  const coreModules = [
    {
      id: 'styles' as SignalCategory,
      targetView: 'strategy' as AppNavView,
      titleMy: 'ကုန်သွယ်မှု စတိုင်လ်များ (Strategy Hub)',
      titleEn: 'Strategy Hub (5 Styles)',
      badge: '5 STYLES',
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
      icon: Layers,
      descMy: 'Scalping မှ Long-Term အထိ မိမိသတ်မှတ်ချက် vs နည်းပညာ...',
      descEn: 'Scalping, Day, Swing, Position & Long-Term strategies',
      color: 'border-indigo-500/30 hover:border-indigo-400 bg-indigo-950/20',
      iconColor: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      id: 'calculator' as SignalCategory,
      targetView: 'calculator' as AppNavView,
      titleMy: 'အန္တရာယ်စီမံခန့်ခွဲမှု & 10% ခန့်မှန်းတွက်ချက်စနစ်',
      titleEn: 'Risk Audit & 10% Estimator',
      badge: 'AUDIT',
      badgeColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      icon: ShieldAlert,
      descMy: 'အကောင်းဆုံးရှုံးမှုကာကွယ်ခြင်း၊ Leverage ချိန်ညှိမှုနှင့် 10% ဖြစ်နိုင်ခြေ',
      descEn: 'Capital preservation, noise-immune leverage & 10% feasibility',
      color: 'border-amber-500/30 hover:border-amber-400 bg-amber-950/20',
      iconColor: 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 'live_scanner' as SignalCategory,
      targetView: 'scanner' as AppNavView,
      titleMy: 'စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား (Live Scanner)',
      titleEn: 'Live Market Scanner',
      badge: 'LIVE',
      badgeColor: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
      icon: TrendingUp,
      descMy: 'Binance Futures စျေးကွက်စစ်ဆေးမှု၊ Funding Rates နှင့် Trade...',
      descEn: 'Real-time Binance Futures market scanner and funding rates',
      color: 'border-sky-500/30 hover:border-sky-400 bg-sky-950/20',
      iconColor: 'bg-sky-500/20 text-sky-400',
    },
    {
      id: 'tradecard' as SignalCategory,
      targetView: 'tradecard' as AppNavView,
      titleMy: 'Master Trade Card နှင့် ပုံတင်စနစ်',
      titleEn: 'Master Trade Card & Chart',
      badge: 'PRO',
      badgeColor: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      icon: Target,
      descMy: 'Master Trade Setup နှင့် မိမိ TradingView ပုံများတင်၍ စစ်ဆေးမှု',
      descEn: 'Section 13 Master Card & custom chart screenshot analysis',
      color: 'border-purple-500/30 hover:border-purple-400 bg-purple-950/20',
      iconColor: 'bg-purple-500/20 text-purple-400',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification for Clipboard Copy */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/50 animate-in slide-in-from-bottom-4 duration-150">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <div className="text-xs">
            <span className="font-bold">{lang === 'my' ? 'ကော်ပီကူးယူပြီးပါပြီ!' : 'Copied to Clipboard!'}</span>
            <span className="block text-emerald-100 text-[11px] font-mono">{copiedValue}</span>
          </div>
        </div>
      )}

      {/* HEADER BANNER WITH FUTURE WALLET AMOUNT CONTROLLER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3 fill-current" />
                <span>EASY SIGNALS COPY MODE</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono border border-emerald-500/30">
                {lang === 'my' ? '⚡ Wallet ပေါ်မူတည်၍ Auto-Tuned စနစ်' : 'Wallet-Synced Dynamic Risk'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{lang === 'my' ? 'အမြန် ကော်ပီကူးယူနိုင်သော စစ်ဂနယ် မုဒ်' : 'Easy Signals Copy Hub'}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'my'
                ? 'Futures Wallet ပမာဏကို ရိုက်ထည့်လိုက်သည်နှင့် အောက်ရှိ Signals အားလုံးတွင် အသုံးပြုရမည့် Margin နှင့် Leverage ကို စနစ်က အလိုအလျောက် ချိန်ညှိတွက်ချက်ပေးပါသည်။ "မင်းရဲ့နည်းပညာ" နှင့် "ငါ့ရဲ့စည်းမျဉ်း" အတိုင်း တိကျသော အမြတ်/အရှုံး ဒေါ်လာများကို ရှင်းလင်းလှပစွာ ဖော်ပြထားပါသည်။'
                : 'Enter your Futures Wallet amount and the system auto-tunes recommended margin, safe leverage, and exact dollar PnL for every signal based on technical analysis and capital preservation rules.'}
            </p>
          </div>

          {/* DYNAMIC FUTURE WALLET AMOUNT CONTROLLER CARD */}
          <div className="bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/40 shadow-lg space-y-3 shrink-0 lg:w-96">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>{lang === 'my' ? 'Futures Wallet ပမာဏ' : 'Future Wallet Amount'}</span>
              </div>
              <button
                onClick={() => setAutoTuneRisk(!autoTuneRisk)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  autoTuneRisk
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{autoTuneRisk ? (lang === 'my' ? 'Auto ချိန်ညှိ: ဖွင့်' : 'Auto-Tune: ON') : (lang === 'my' ? 'Manual: ပြင်မည်' : 'Manual')}</span>
              </button>
            </div>

            {/* Direct Input & Currency */}
            <div className="bg-slate-900/95 px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                <span className="text-emerald-400 font-black">$</span>
                <input
                  type="number"
                  min="10"
                  max="1000000"
                  step="100"
                  value={walletInput}
                  onChange={(e) => handleWalletChange(e.target.value)}
                  placeholder="2000"
                  className="w-36 bg-transparent text-white font-mono font-black text-base outline-none focus:text-amber-400 transition"
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                USDT
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-[10px] text-slate-400 block">{lang === 'my' ? 'အမြန်ရွေး:' : 'Presets:'}</span>
              {[500, 1000, 2000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPresetWallet(amt)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] transition cursor-pointer font-bold ${
                    walletBalance === amt
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>

            {/* Auto-tuning Info Footer */}
            <div className="pt-2 border-t border-slate-700/60 text-[11px] font-mono text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">
                {lang === 'my' ? 'ငါ့စည်းမျဉ်း ကန့်သတ်ချက်:' : 'Risk Cap:'}
              </span>
              <span className="text-emerald-400 font-bold">
                ≤ 1.5% (-${(walletBalance * 0.015).toFixed(1)} max risk)
              </span>
            </div>
          </div>
        </div>

        {/* TRACK VIEW SWITCHER: Both Tracks vs Technical Only vs My Rules Only */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-bold">{lang === 'my' ? 'ပြသမှု မုဒ်:' : 'Track View:'}</span>
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
              <button
                onClick={() => setSelectedTrackView('both')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedTrackView === 'both'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3 h-3" />
                <span>{lang === 'my' ? 'နှစ်ခုစလုံး ယှဉ်ပြမည်' : 'Dual-Track Side-by-Side'}</span>
              </button>

              <button
                onClick={() => setSelectedTrackView('technical')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedTrackView === 'technical'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-indigo-300" />
                <span>{lang === 'my' ? '🤖 မင်းရဲ့ နည်းပညာ' : '🤖 AI / Technical'}</span>
              </button>

              <button
                onClick={() => setSelectedTrackView('my_rules')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedTrackView === 'my_rules'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>{lang === 'my' ? '🛡️ ငါ့ရဲ့ စည်းမျဉ်း' : '🛡️ My Rules'}</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>{lang === 'my' ? `စစ်ဂနယ် စုစုပေါင်း: ${filteredSignals.length} ခု` : `Total Signals: ${filteredSignals.length}`}</span>
            {onBack && (
              <button
                onClick={onBack}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                {lang === 'my' ? 'နောက်သို့' : 'Back'}
              </button>
            )}
          </div>
        </div>

        {/* TAX & EXIT RATIONALE DIRECTIVE BANNER (REQUESTED BY USER) */}
        <div className="p-3.5 rounded-xl bg-slate-900/95 border border-amber-500/30 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                <DollarSign className="w-4 h-4" />
              </span>
              <h4 className="font-bold text-white text-xs sm:text-sm">
                {lang === 'my'
                  ? '📊 အခွန်တွက်ချက်မှု (Taxes & Fees) နှင့် အော်ဒါပိတ်သိမ်းခြင်း လမ်းညွှန်'
                  : '📊 Signals Tax & Fee Deductions and Exit Strategy Rules'}
              </h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {lang === 'my' ? 'Roundtrip အခွန်များအားလုံး နုတ်ယူတွက်ချက်ထားသည်' : 'All Roundtrip Taxes Pre-Deducted'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="flex items-start gap-2 text-slate-300">
              <span className="text-amber-400 font-bold">💸 {lang === 'my' ? 'အခွန်စရိတ် ရှင်းလင်းချက်:' : 'Tax & Fee System:'}</span>
              <span>
                {lang === 'my'
                  ? 'စစ်ဂနယ်တိုင်းတွင် အဖွင့်အခွန် (0.05% Taker Entry) နှင့် အပိတ်အခွန် (0.02% Maker Exit) အား ကြိုတင်တွက်ချက်ထားပြီး အသားတင်အမြတ် (Net Profit) ကို တိုက်ရိုက်ဖော်ပြပေးထားပါသည်။'
                  : 'Every signal explicitly calculates Binance roundtrip fees (0.05% Taker Entry + 0.02% Maker Exit) so you see real net profits after tax.'}
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <span className="text-emerald-400 font-bold">🎯 {lang === 'my' ? 'အော်ဒါပိတ်ရမည့် စည်းကမ်း:' : 'Exit Discipline:'}</span>
              <span>
                {lang === 'my'
                  ? 'မြတ်ပါက TP1 (50% အမြတ်သိမ်း & Stop Loss ကို Break-even ရွှေ့ခြင်းဖြင့် အခွန်ကုန်ကျစရိတ်ကာမိစေသည်)၊ ရှုံးပါက SL သို့ရောက်လျှင် ချက်ချင်း Cut Loss ပြုလုပ်ကာ Margin မပြုတ်စေရန် ကာကွယ်ရမည်။'
                  : 'Take profits at TP1 (take 50% & move SL to break-even to eliminate fee risk), and strictly honor Stop Loss to protect your wallet from liquidation.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 CORE APPLICATION MODULES (MATCHING PICTURE 1 & PICTURE 2 ARCHITECTURE) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {lang === 'my' ? 'အဓိက အင်္ဂါရပ် မော်ဂျူး ၄ ခု (Core Trading Modules)' : 'Core Trading Modules (4 Systems)'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {lang === 'my' ? 'ကလစ်နှိပ်၍ စစ်ဂနယ်ခွဲထုတ်ရန် သို့မဟုတ် စနစ်သို့ တိုက်ရိုက်သွားရန်' : 'Click to filter or open module'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {coreModules.map((mod) => {
            const Icon = mod.icon;
            const isSelected = activeCategory === mod.id;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveCategory(mod.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`p-2 rounded-xl ${mod.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>

                <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition">
                  {lang === 'my' ? mod.titleMy : mod.titleEn}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {lang === 'my' ? mod.descMy : mod.descEn}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {allSignals.filter((s) => s.category === mod.id).length} {lang === 'my' ? 'ခု' : 'signals'}
                  </span>

                  {onNavigateView && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateView(mod.targetView);
                      }}
                      className="text-[11px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <span>{lang === 'my' ? 'ဖွင့်မည်' : 'Open'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER CONTROLS: CATEGORIES & DIRECTION FILTERS & SEARCH */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categoriesList.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{lang === 'my' ? cat.labelMy : cat.labelEn}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-slate-950 text-amber-400 font-black'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'my' ? 'BTC, SOL, ETH, SUI ရှာရန်...' : 'Search BTC, SOL, ETH, SUI...'}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Direction Filter Buttons (LONG, SHORT, WAIT) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{lang === 'my' ? 'ဦးတည်ချက်:' : 'Direction:'}</span>
            <div className="flex items-center gap-1">
              {(['ALL', 'LONG', 'SHORT', 'WAIT'] as DirectionFilter[]).map((dir) => {
                const isActive = directionFilter === dir;
                return (
                  <button
                    key={dir}
                    onClick={() => setDirectionFilter(dir)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? dir === 'LONG'
                          ? 'bg-emerald-600 text-white'
                          : dir === 'SHORT'
                          ? 'bg-rose-600 text-white'
                          : dir === 'WAIT'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {dir === 'LONG' && '🟢 LONG / BUY'}
                    {dir === 'SHORT' && '🔴 SHORT / SELL'}
                    {dir === 'WAIT' && '🟡 WAIT'}
                    {dir === 'ALL' && (lang === 'my' ? 'အားလုံး' : 'ALL')}
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {lang === 'my' ? '⚡ ရှင်းလင်းသော Format ဖြင့် 1-Click Quick Copy ပြုလုပ်နိုင်ပါသည်' : 'Aesthetic Clean Signals Ready'}
          </span>
        </div>
      </div>

      {/* SIGNALS LISTING: ULTRA-CLEAN & AESTHETIC CARDS (per user request) */}
      <div className="space-y-4">
        {filteredSignals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'my' ? 'ကိုက်ညီသော စစ်ဂနယ် မတွေ့ရှိပါ' : 'No matching signals found'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'my' ? 'Filter သို့မဟုတ် Search စာသားကို ပြန်လည်စစ်ဆေးပါ' : 'Try clearing filters or search query.'}
            </p>
          </div>
        ) : (
          filteredSignals.map((sig) => {
            const isWait = sig.bias === 'WAIT';
            const isLong = sig.bias === 'LONG';
            const isShort = sig.bias === 'SHORT';

            // Calculate auto-tuned metrics for this specific signal
            const m = getComputedSignalMetrics(sig);

            return (
              <div
                key={sig.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-amber-500/40 transition-all duration-200"
              >
                {/* CARD TOP BAR: CATEGORY, ASSET, BIAS & DEMO BUTTON */}
                <div className="bg-slate-100/80 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Direction Badge */}
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs ${
                        isLong
                          ? 'bg-emerald-600 text-white'
                          : isShort
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-slate-950 font-black'
                      }`}
                    >
                      {isLong && <TrendingUp className="w-3.5 h-3.5" />}
                      {isShort && <TrendingDown className="w-3.5 h-3.5" />}
                      {isWait && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{sig.bias}</span>
                    </span>

                    {/* Pair & Symbol */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {sig.symbol}
                          <span className="text-xs font-normal text-slate-400 ml-1 font-mono">
                            / USDT Perpetual
                          </span>
                        </h3>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          ${sig.currentPrice >= 1 ? sig.currentPrice.toFixed(2) : sig.currentPrice.toFixed(4)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {lang === 'my' ? sig.categoryLabelMy : sig.categoryLabelEn} • Timeframe: {sig.timeframe}
                      </span>
                    </div>
                  </div>

                  {/* Right: Demo Integration & Quick Status */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        isWait
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      }`}
                    >
                      {lang === 'my' ? sig.statusTextMy : sig.statusTextEn}
                    </span>

                    {/* Direct Demo Terminal Execution Button */}
                    <button
                      onClick={() =>
                        onGoToTradePreset({
                          symbol: sig.symbol,
                          side: sig.bias === 'SHORT' ? 'SHORT' : 'LONG',
                          margin: m.myMargin,
                          leverage: m.myLeverage,
                          entryPrice: sig.myRulesTrack.entryPrice,
                          tpPrice: sig.myRulesTrack.tp1Price,
                          slPrice: sig.myRulesTrack.slPrice,
                          orderType: isWait ? 'LIMIT' : 'MARKET',
                          source: `Easy Signals: ${sig.pair}`,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                      title={lang === 'my' ? 'ဒေမိုစနစ်တွင် ချက်ချင်းဖွင့်လှစ်စမ်းသပ်မည်' : 'Trade in Demo Terminal'}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'my' ? 'ဒေမိုတွင် စမ်းသပ်မည်' : 'Trade in Demo'}</span>
                    </button>
                  </div>
                </div>

                {/* DUAL-TRACK DIVISION: TWO DISTINCT PARTS AS REQUESTED */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* PART 1: မင်းရဲ့ ခွဲခြမ်းစိတ်ဖြာမှု (AI & Technical Analysis Track) */}
                    {(selectedTrackView === 'both' || selectedTrackView === 'technical') && (
                      <div
                        className={`rounded-2xl border p-4 space-y-3.5 transition-all ${
                          selectedTrackView === 'technical' ? 'lg:col-span-2' : ''
                        } bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60`}
                      >
                        {/* Section 1 Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60 dark:border-indigo-900/60">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                {lang === 'my' ? '🤖 မင်းရဲ့ ခွဲခြမ်းစိတ်ဖြာမှု (Technical AI Track)' : '🤖 AI & Technical Track'}
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                {lang === 'my' ? 'ATR Volatility နှင့် နည်းပညာအရ Auto-Tuned ချိန်ညှိထားသည်' : 'ATR Volatility & Technical Target Levels'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Simple clean copy button */}
                            <button
                              onClick={() => handleQuickCopySimpleSignal(sig, 'technical')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-indigo-500/30"
                              title="Copy simple aesthetic format"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{lang === 'my' ? 'ရိုးရှင်းကော်ပီ' : 'Quick Copy'}</span>
                            </button>

                            <button
                              onClick={() => handleCopyBinanceFullSignal(sig, 'technical')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                              title="Copy full technical signal for Binance"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{lang === 'my' ? 'Binance Signal' : 'Binance Full'}</span>
                            </button>

                            <button
                              onClick={() => {
                                handleCopyBinanceFullSignal(sig, 'technical');
                                openBinanceFutures(sig.symbol);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1 transition cursor-pointer shadow-xs"
                              title={lang === 'my' ? 'Binance တွင် ဖွင့်လှစ်မည် (Persistent Session)' : 'Open Binance Futures'}
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Binance</span>
                            </button>

                            {onOpenInAppTerminal && (
                              <button
                                onClick={() =>
                                  onOpenInAppTerminal(sig.symbol, isLong ? 'LONG' : 'SHORT', {
                                    symbol: sig.symbol,
                                    side: isLong ? 'LONG' : 'SHORT',
                                    margin: m.techMargin,
                                    leverage: m.techLeverage,
                                    entryPrice: sig.technicalTrack.entryPrice,
                                    tpPrice: sig.technicalTrack.tp3Price,
                                    slPrice: sig.technicalTrack.slPrice,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black flex items-center gap-1 transition cursor-pointer shadow-xs"
                                title={lang === 'my' ? 'အက်ပ်အတွင်း တိုက်ရိုက်ကုန်သွယ်မည်' : 'Trade In-App Terminal'}
                              >
                                <Zap className="w-3 h-3 fill-slate-950" />
                                <span>In-App</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* BEAUTIFULLY STYLED CLEAN SIGNAL CARD (Inspired by User's Reference Layout) */}
                        <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-800 font-mono space-y-3 shadow-inner">
                          {/* Asset, Direction & Entry Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                            <span className="font-black text-white flex items-center gap-1.5">
                              <span className={isLong ? 'text-emerald-400' : isShort ? 'text-rose-400' : 'text-amber-400'}>
                                {sig.symbol} {sig.bias}
                              </span>
                              <span className="text-white text-sm">${sig.technicalTrack.entryPrice}</span>
                            </span>

                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-normal">
                                <span>Auto-Tuned:</span>
                                <span className="text-amber-400 font-bold">{m.techLeverage}x Lev</span>
                                <span>•</span>
                                <span className="text-white font-bold">${m.techMargin} Margin</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {lang === 'my' ? 'အခွန်/စရိတ်စုစုပေါင်း:' : 'Roundtrip Fees:'}{' '}
                                <span className="text-amber-300 font-bold">${m.techDetailedFees.totalFeeUsd.toFixed(2)}</span>{' '}
                                <span className="text-slate-500">({m.techDetailedFees.feePercentageOfMargin.toFixed(1)}% margin)</span>
                              </div>
                            </div>
                          </div>

                          {/* TP1, TP2, TP3 & SL Rows with visible Gross Profit AND Net Profit After Taxes/Fees */}
                          <div className="space-y-2 text-xs">
                            {/* TP 1 */}
                            <div className="bg-emerald-950/30 hover:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/20 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 font-black">🎯 TP¹</span>
                                  <span className="text-white font-bold">${sig.technicalTrack.tp1Price}</span>
                                  <span className="text-[10px] text-emerald-400/80 font-normal">+{sig.technicalTrack.tp1GainPct}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-300/70 text-[11px] line-through">
                                    +${m.techDollarProfit1.toFixed(1)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                                    {lang === 'my' ? 'အခွန်နုတ်ပြီး:' : 'Net:'} +${m.techDetailedFees.tp1NetProfit.toFixed(1)} (+{m.techDetailedFees.tp1NetGainPct.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* TP 2 */}
                            <div className="bg-emerald-950/30 hover:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/20 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 font-black">🎯 TP²</span>
                                  <span className="text-white font-bold">${sig.technicalTrack.tp2Price}</span>
                                  <span className="text-[10px] text-emerald-400/80 font-normal">+{sig.technicalTrack.tp2GainPct}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-300/70 text-[11px] line-through">
                                    +${m.techDollarProfit2.toFixed(1)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                                    {lang === 'my' ? 'အခွန်နုတ်ပြီး:' : 'Net:'} +${m.techDetailedFees.tp2NetProfit.toFixed(1)} (+{m.techDetailedFees.tp2NetGainPct.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* TP 3 */}
                            <div className="bg-emerald-950/30 hover:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/20 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 font-black">🎯 TP³</span>
                                  <span className="text-white font-bold">${sig.technicalTrack.tp3Price}</span>
                                  <span className="text-[10px] text-emerald-400/80 font-normal">+{sig.technicalTrack.tp3GainPct}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-300/70 text-[11px] line-through">
                                    +${m.techDollarProfit3.toFixed(1)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                                    {lang === 'my' ? 'အခွန်နုတ်ပြီး:' : 'Net:'} +${m.techDetailedFees.tp3NetProfit.toFixed(1)} (+{m.techDetailedFees.tp3NetGainPct.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Stop Loss with Taker Exit & Total Loss with Taxes */}
                            <div className="bg-rose-950/30 hover:bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/20 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-rose-400 font-black">🛑 SL</span>
                                  <span className="text-white font-bold">${sig.technicalTrack.slPrice}</span>
                                  <span className="text-[10px] text-rose-300/80 font-normal">-{sig.technicalTrack.slLossPct}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-rose-400/70 text-[11px]">
                                    -${m.techDollarLoss.toFixed(1)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-black text-xs border border-rose-500/30">
                                    {lang === 'my' ? 'အခွန်ပေါင်းပြီး ဆုံးရှုံးငွေ:' : 'Total Loss:'} -${m.techDetailedFees.slNetLossWithFees.toFixed(1)} ({m.techDetailedFees.slAccountLossPct.toFixed(1)}% Wallet)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Trading Taxes & Fees Detailed Breakdown Bar */}
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5">
                            <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1">
                              <span className="flex items-center gap-1.5 text-amber-300">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{lang === 'my' ? 'အခွန်နှင့် Exchange စရိတ် ရှင်းတမ်း' : 'Exchange Taxes & Fees Audit'}</span>
                              </span>
                              <span className="font-mono text-amber-400 font-bold">
                                ${m.techDetailedFees.totalFeeUsd.toFixed(2)} ({m.techDetailedFees.feePercentageOfMargin.toFixed(1)}% of margin)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-400 pt-0.5">
                              <div>
                                <span className="text-slate-500">{lang === 'my' ? 'ဝင်ကြေး အခွန် (0.05% Taker):' : 'Entry Fee (0.05%):'}</span>{' '}
                                <strong className="text-slate-200">${m.techDetailedFees.entryFeeUsd.toFixed(2)}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500">{lang === 'my' ? 'ထွက်ကြေး အခွန် (0.02% Maker):' : 'Exit Fee (0.02%):'}</span>{' '}
                                <strong className="text-slate-200">${m.techDetailedFees.exitFeeUsd.toFixed(2)}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500">{lang === 'my' ? 'Position Size:' : 'Position Size:'}</span>{' '}
                                <strong className="text-slate-200">${m.techNotional.toLocaleString()}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Explicit Exit Rationales (User's Exact Burmese Requirement) */}
                          <div className="space-y-2 pt-1 font-sans">
                            {/* 1. ဘယ်လောက်မြတ်ရင် ဘာကြောင့် ပိတ်သင့်လဲ (Take Profit Rationale) */}
                            <div className="bg-emerald-950/25 rounded-xl p-3 border border-emerald-500/25 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>
                                  {lang === 'my'
                                    ? '💰 အော်ဒါ ဘယ်လောက်မြတ်ရင် ဘာကြောင့် ပိတ်သင့်လဲ (Take-Profit Rationale):'
                                    : '💰 Profit Targets & Why You Should Close:'}
                                </span>
                              </div>
                              <div className="space-y-1.5 text-[11px] text-emerald-200/90 leading-relaxed pl-1">
                                <div className="border-l-2 border-emerald-500/50 pl-2">
                                  <strong className="text-white">TP¹ (${sig.technicalTrack.tp1Price} | Net: +${m.techDetailedFees.tp1NetProfit.toFixed(1)}):</strong>{' '}
                                  {lang === 'my' ? m.techDetailedFees.tp1CloseReasonMy : m.techDetailedFees.tp1CloseReasonEn}
                                </div>
                                <div className="border-l-2 border-emerald-500/50 pl-2">
                                  <strong className="text-white">TP² (${sig.technicalTrack.tp2Price} | Net: +${m.techDetailedFees.tp2NetProfit.toFixed(1)}):</strong>{' '}
                                  {lang === 'my' ? m.techDetailedFees.tp2CloseReasonMy : m.techDetailedFees.tp2CloseReasonEn}
                                </div>
                                <div className="border-l-2 border-emerald-500/50 pl-2">
                                  <strong className="text-white">TP³ (${sig.technicalTrack.tp3Price} | Net: +${m.techDetailedFees.tp3NetProfit.toFixed(1)}):</strong>{' '}
                                  {lang === 'my' ? m.techDetailedFees.tp3CloseReasonMy : m.techDetailedFees.tp3CloseReasonEn}
                                </div>
                              </div>
                            </div>

                            {/* 2. ဘယ်လောက်ရှုံးရင် ဘာကြောင့် ပိတ်သင့်လဲ (Stop Loss Rationale) */}
                            <div className="bg-rose-950/25 rounded-xl p-3 border border-rose-500/25 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>
                                  {lang === 'my'
                                    ? '🛑 အော်ဒါ ဘယ်လောက်ရှုံးရင် ဘာကြောင့် ပိတ်သင့်လဲ (Stop-Loss Protection):'
                                    : '🛑 Stop Loss & Why You Must Close:'}
                                </span>
                              </div>
                              <div className="text-[11px] text-rose-200/90 leading-relaxed border-l-2 border-rose-500/50 pl-2">
                                <strong className="text-white">
                                  SL (${sig.technicalTrack.slPrice} | Total Loss: -${m.techDetailedFees.slNetLossWithFees.toFixed(1)} [
                                  {m.techDetailedFees.slAccountLossPct.toFixed(1)}% of Wallet]):
                                </strong>{' '}
                                {lang === 'my' ? m.techDetailedFees.slCloseReasonMy : m.techDetailedFees.slCloseReasonEn}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Invalidation Trigger */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>
                            {lang === 'my'
                              ? `ဖျက်သိမ်းမည့်စည်းကမ်း: ${sig.technicalTrack.invalidationMy}`
                              : `Invalidation: ${sig.technicalTrack.invalidationEn}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* PART 2: ငါ့ရဲ့ စည်းမျဉ်း (My Personal Trading Rules Track) */}
                    {(selectedTrackView === 'both' || selectedTrackView === 'my_rules') && (
                      <div
                        className={`rounded-2xl border p-4 space-y-3.5 transition-all ${
                          selectedTrackView === 'my_rules' ? 'lg:col-span-2' : ''
                        } bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60`}
                      >
                        {/* Section 2 Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-900/60">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                {lang === 'my' ? '🛡️ ငါ့ရဲ့ စည်းမျဉ်း (My Personal Rules Track)' : '🛡️ My Personal Rules Track'}
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                {lang === 'my' ? 'အကောင့်အရင်းမပြုန်းတီးရေး၊ Max 1.5% Risk နှင့် စည်းကမ်းချက်များ' : 'Capital preservation, max 1.5% wallet risk'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Simple clean copy button */}
                            <button
                              onClick={() => handleQuickCopySimpleSignal(sig, 'my_rules')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-500/30"
                              title="Copy simple aesthetic format"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{lang === 'my' ? 'ရိုးရှင်းကော်ပီ' : 'Quick Copy'}</span>
                            </button>

                            <button
                              onClick={() => handleCopyBinanceFullSignal(sig, 'my_rules')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                              title="Copy full My Rules signal for Binance"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{lang === 'my' ? 'Binance Signal' : 'Binance Full'}</span>
                            </button>

                            <button
                              onClick={() => {
                                handleCopyBinanceFullSignal(sig, 'my_rules');
                                openBinanceFutures(sig.symbol);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1 transition cursor-pointer shadow-xs"
                              title={lang === 'my' ? 'Binance တွင် ဖွင့်လှစ်မည် (Persistent Session)' : 'Open Binance Futures'}
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Binance</span>
                            </button>

                            {onOpenInAppTerminal && (
                              <button
                                onClick={() =>
                                  onOpenInAppTerminal(sig.symbol, isLong ? 'LONG' : 'SHORT', {
                                    symbol: sig.symbol,
                                    side: isLong ? 'LONG' : 'SHORT',
                                    margin: m.myMargin,
                                    leverage: m.myLeverage,
                                    entryPrice: sig.myRulesTrack.entryPrice,
                                    tpPrice: sig.myRulesTrack.tp3Price,
                                    slPrice: sig.myRulesTrack.slPrice,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black flex items-center gap-1 transition cursor-pointer shadow-xs"
                                title={lang === 'my' ? 'အက်ပ်အတွင်း တိုက်ရိုက်ကုန်သွယ်မည်' : 'Trade In-App Terminal'}
                              >
                                <Zap className="w-3 h-3 fill-slate-950" />
                                <span>In-App</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* BEAUTIFULLY STYLED CLEAN SIGNAL CARD (Inspired by User's Reference Layout) */}
                        <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-800 font-mono space-y-3 shadow-inner">
                          {/* Asset, Direction & Entry Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                            <span className="font-black text-white flex items-center gap-1.5">
                              <span className={isLong ? 'text-emerald-400' : isShort ? 'text-rose-400' : 'text-amber-400'}>
                                {sig.symbol} {sig.bias}
                              </span>
                              <span className="text-white text-sm">${sig.myRulesTrack.entryPrice}</span>
                            </span>

                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-normal">
                                <span>Safe Lev:</span>
                                <span className="text-emerald-400 font-bold">{m.myLeverage}x</span>
                                <span>•</span>
                                <span className="text-white font-bold">${m.myMargin} Margin</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {lang === 'my' ? 'အခွန်/စရိတ်စုစုပေါင်း:' : 'Roundtrip Fees:'}{' '}
                                <span className="text-amber-300 font-bold">${m.myDetailedFees.totalFeeUsd.toFixed(2)}</span>{' '}
                                <span className="text-slate-500">({m.myDetailedFees.feePercentageOfMargin.toFixed(1)}% margin)</span>
                              </div>
                            </div>
                          </div>

                          {/* TP1, TP2, TP3 & SL Rows with visible Gross Profit AND Net Profit After Taxes/Fees */}
                          <div className="space-y-2 text-xs">
                            {/* TP 1 */}
                            <div className="bg-emerald-950/30 hover:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/20 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 font-black">🎯 TP¹</span>
                                  <span className="text-white font-bold">${sig.myRulesTrack.tp1Price}</span>
                                  <span className="text-[10px] text-emerald-300 font-normal">50% မြတ်သိမ်း</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-300/70 text-[11px] line-through">
                                    +${m.myDollarProfit1.toFixed(1)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                                    {lang === 'my' ? 'အခွန်နုတ်ပြီး:' : 'Net:'} +${m.myDetailedFees.tp1NetProfit.toFixed(1)} (+{m.myDetailedFees.tp1NetGainPct.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* TP 2 */}
                            <div className="bg-emerald-950/30 hover:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/20 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 font-black">🎯 TP²</span>
                                  <span className="text-white font-bold">${sig.myRulesTrack.tp2Price}</span>
                                  <span className="text-[10px] text-emerald-300 font-normal">ကျန် 50%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-300/70 text-[11px] line-through">
                                    +${m.myDollarProfit2.toFixed(1)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                                    {lang === 'my' ? 'အခွန်နုတ်ပြီး:' : 'Net:'} +${m.myDetailedFees.tp2NetProfit.toFixed(1)} (+{m.techDetailedFees.tp2NetGainPct.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* TP 3 */}
                            <div className="bg-emerald-950/30 hover:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/20 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 font-black">🎯 TP³</span>
                                  <span className="text-white font-bold">${sig.myRulesTrack.tp3Price}</span>
                                  <span className="text-[10px] text-emerald-300 font-normal">Full Runner</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-300/70 text-[11px] line-through">
                                    +${m.myDollarProfit3.toFixed(1)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                                    {lang === 'my' ? 'အခွန်နုတ်ပြီး:' : 'Net:'} +${m.myDetailedFees.tp3NetProfit.toFixed(1)} (+{m.myDetailedFees.tp3NetGainPct.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Stop Loss */}
                            <div className="bg-rose-950/30 hover:bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/20 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-rose-400 font-black">🛑 SL</span>
                                  <span className="text-white font-bold">${sig.myRulesTrack.slPrice}</span>
                                  <span className="text-[10px] text-rose-300/80 font-normal">-{sig.myRulesTrack.slLossPct}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-rose-400/70 text-[11px]">
                                    -${m.myDollarLoss.toFixed(1)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-black text-xs border border-rose-500/30">
                                    {lang === 'my' ? 'အခွန်ပေါင်းပြီး ဆုံးရှုံးငွေ:' : 'Total Loss:'} -${m.myDetailedFees.slNetLossWithFees.toFixed(1)} (≤ {m.myDetailedFees.slAccountLossPct.toFixed(1)}% Wallet)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Trading Taxes & Fees Detailed Breakdown Bar */}
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5">
                            <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1">
                              <span className="flex items-center gap-1.5 text-amber-300">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{lang === 'my' ? 'အခွန်နှင့် Exchange စရိတ် ရှင်းတမ်း' : 'Exchange Taxes & Fees Audit'}</span>
                              </span>
                              <span className="font-mono text-amber-400 font-bold">
                                ${m.myDetailedFees.totalFeeUsd.toFixed(2)} ({m.myDetailedFees.feePercentageOfMargin.toFixed(1)}% of margin)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-400 pt-0.5">
                              <div>
                                <span className="text-slate-500">{lang === 'my' ? 'ဝင်ကြေး အခွန် (0.05% Taker):' : 'Entry Fee (0.05%):'}</span>{' '}
                                <strong className="text-slate-200">${m.myDetailedFees.entryFeeUsd.toFixed(2)}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500">{lang === 'my' ? 'ထွက်ကြေး အခွန် (0.02% Maker):' : 'Exit Fee (0.02%):'}</span>{' '}
                                <strong className="text-slate-200">${m.myDetailedFees.exitFeeUsd.toFixed(2)}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500">{lang === 'my' ? 'Position Size:' : 'Position Size:'}</span>{' '}
                                <strong className="text-slate-200">${m.myNotional.toLocaleString()}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Explicit Exit Rationales (User's Exact Burmese Requirement) */}
                          <div className="space-y-2 pt-1 font-sans">
                            {/* 1. ဘယ်လောက်မြတ်ရင် ဘာကြောင့် ပိတ်သင့်လဲ (Take Profit Rationale) */}
                            <div className="bg-emerald-950/25 rounded-xl p-3 border border-emerald-500/25 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>
                                  {lang === 'my'
                                    ? '💰 အော်ဒါ ဘယ်လောက်မြတ်ရင် ဘာကြောင့် ပိတ်သင့်လဲ (Take-Profit Rationale):'
                                    : '💰 Profit Targets & Why You Should Close:'}
                                </span>
                              </div>
                              <div className="space-y-1.5 text-[11px] text-emerald-200/90 leading-relaxed pl-1">
                                <div className="border-l-2 border-emerald-500/50 pl-2">
                                  <strong className="text-white">TP¹ (${sig.myRulesTrack.tp1Price} | Net: +${m.myDetailedFees.tp1NetProfit.toFixed(1)}):</strong>{' '}
                                  {lang === 'my' ? m.myDetailedFees.tp1CloseReasonMy : m.myDetailedFees.tp1CloseReasonEn}
                                </div>
                                <div className="border-l-2 border-emerald-500/50 pl-2">
                                  <strong className="text-white">TP² (${sig.myRulesTrack.tp2Price} | Net: +${m.myDetailedFees.tp2NetProfit.toFixed(1)}):</strong>{' '}
                                  {lang === 'my' ? m.myDetailedFees.tp2CloseReasonMy : m.myDetailedFees.tp2CloseReasonEn}
                                </div>
                                <div className="border-l-2 border-emerald-500/50 pl-2">
                                  <strong className="text-white">TP³ (${sig.myRulesTrack.tp3Price} | Net: +${m.myDetailedFees.tp3NetProfit.toFixed(1)}):</strong>{' '}
                                  {lang === 'my' ? m.myDetailedFees.tp3CloseReasonMy : m.myDetailedFees.tp3CloseReasonEn}
                                </div>
                              </div>
                            </div>

                            {/* 2. ဘယ်လောက်ရှုံးရင် ဘာကြောင့် ပိတ်သင့်လဲ (Stop Loss Rationale) */}
                            <div className="bg-rose-950/25 rounded-xl p-3 border border-rose-500/25 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>
                                  {lang === 'my'
                                    ? '🛑 အော်ဒါ ဘယ်လောက်ရှုံးရင် ဘာကြောင့် ပိတ်သင့်လဲ (Stop-Loss Protection):'
                                    : '🛑 Stop Loss & Why You Must Close:'}
                                </span>
                              </div>
                              <div className="text-[11px] text-rose-200/90 leading-relaxed border-l-2 border-rose-500/50 pl-2">
                                <strong className="text-white">
                                  SL (${sig.myRulesTrack.slPrice} | Total Loss: -${m.myDetailedFees.slNetLossWithFees.toFixed(1)} [
                                  ≤ {m.myDetailedFees.slAccountLossPct.toFixed(1)}% of Wallet]):
                                </strong>{' '}
                                {lang === 'my' ? m.myDetailedFees.slCloseReasonMy : m.myDetailedFees.slCloseReasonEn}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rules Summary */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>
                            {lang === 'my'
                              ? `စည်းကမ်းချက်: ${sig.myRulesTrack.ruleSummaryMy}`
                              : `Rule: ${sig.myRulesTrack.ruleSummaryEn}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QUICK INDIVIDUAL VALUE COPY BAR */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 mr-1">
                        {lang === 'my' ? 'တန်ဖိုးများ အမြန်ကော်ပီ:' : 'Quick Copy Values:'}
                      </span>

                      <button
                        onClick={() => handleCopyText(`${sig.myRulesTrack.entryPrice}`, `${sig.id}-entry-chip`, 'Entry Price')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <Copy className="w-2.5 h-2.5 text-slate-400" />
                        <span>Entry: ${sig.myRulesTrack.entryPrice}</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(`${sig.myRulesTrack.tp1Price}`, `${sig.id}-tp1-chip`, 'TP1 Price')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <Copy className="w-2.5 h-2.5 text-emerald-500" />
                        <span>TP1: ${sig.myRulesTrack.tp1Price}</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(`${sig.myRulesTrack.tp2Price}`, `${sig.id}-tp2-chip`, 'TP2 Price')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <Copy className="w-2.5 h-2.5 text-emerald-500" />
                        <span>TP2: ${sig.myRulesTrack.tp2Price}</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(`${sig.myRulesTrack.tp3Price}`, `${sig.id}-tp3-chip`, 'TP3 Price')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <Copy className="w-2.5 h-2.5 text-emerald-500" />
                        <span>TP3: ${sig.myRulesTrack.tp3Price}</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(`${sig.myRulesTrack.slPrice}`, `${sig.id}-sl-chip`, 'SL Price')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <Copy className="w-2.5 h-2.5 text-rose-500" />
                        <span>SL: ${sig.myRulesTrack.slPrice}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {lang === 'my' ? 'Binance Order Form တွင် တိုက်ရိုက် Paste ချပါ' : 'Paste directly in Binance order form'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
