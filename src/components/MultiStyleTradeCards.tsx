import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  BarChart2,
  Calendar,
  DollarSign,
  Compass,
  ArrowRight,
  Sliders,
  RotateCcw,
  Scale,
  Wallet,
  Percent,
  Activity,
  CheckCircle2,
  XCircle,
  Cpu,
  Bot,
  ListChecks,
} from 'lucide-react';
import { DemoTradePreset, CoinOpportunity } from '../types';
import { calculateTradeFeesAndTargets } from '../utils/technicalAnalysis';
import { computeDualEngineSignal, DualEngineSignalPayload } from '../utils/dualEngineSignal';
import { RiskRewardVisualizer } from './RiskRewardVisualizer';
import { DualTrackWalletBanner } from './DualTrackWalletBanner';

export type TradingStyleType = 'scalping' | 'day_trading' | 'swing' | 'position' | 'long_term';

interface TradingStyleConfig {
  id: TradingStyleType;
  nameEn: string;
  nameMy: string;
  durationEn: string;
  durationMy: string;
  requiredTimeframes: string[];
  timeframeExplanationEn: string;
  timeframeExplanationMy: string;
  defaultLeverage: number;
  maxRecommendedLeverage: number;
  tpPercent: number; // Primary TP
  tp2Percent: number;
  slPercent: number;
  holdingDaysEstimated: number;
  riskRating: 'High' | 'Moderate' | 'Low';
  descriptionEn: string;
  descriptionMy: string;
}

export const TRADING_STYLES: TradingStyleConfig[] = [
  {
    id: 'scalping',
    nameEn: 'Scalping',
    nameMy: 'Scalping (မြန်ဆန် တိုတောင်း)',
    durationEn: 'Minutes (2m – 45m)',
    durationMy: 'မိနစ်ပိုင်း (၂ မိနစ် မှ ၄၅ မိနစ်)',
    requiredTimeframes: ['1M', '3M', '5M'],
    timeframeExplanationEn:
      'Requires 1M (order flow & tight entry timing), 3M (immediate momentum), and 5M (local high/low liquidity barrier).',
    timeframeExplanationMy:
      'လိုအပ်သော Timeframes: 1M (အဝင်တိကျမှု), 3M (လက်ငင်း အရှိန်အဟုန်), 5M (ဒေသတွင်း အတားအဆီး)',
    defaultLeverage: 20,
    maxRecommendedLeverage: 30,
    tpPercent: 1.2,
    tp2Percent: 2.2,
    slPercent: 0.5,
    holdingDaysEstimated: 0.05,
    riskRating: 'High',
    descriptionEn: 'High-frequency intraday trades capitalizing on rapid orderbook imbalances.',
    descriptionMy: 'စျေးကွက်အဝယ်/အရောင်း အလျင်အမြန် စီးဆင်းမှုမှ မိနစ်ပိုင်းအတွင်း အမြတ်ထုတ်ယူခြင်း။',
  },
  {
    id: 'day_trading',
    nameEn: 'Day Trading',
    nameMy: 'Day Trading (နေ့စဉ် ကုန်သွယ်မှု)',
    durationEn: 'Intraday (Same Day Session)',
    durationMy: 'တစ်ရက်အတွင်း (Session ပြီးဆုံးမီ)',
    requiredTimeframes: ['15M', '1H'],
    timeframeExplanationEn:
      'Requires 15M (BOS/ChoCH structure & execution triggers) and 1H (session high/low range & overall trend bias).',
    timeframeExplanationMy:
      'လိုအပ်သော Timeframes: 15M (Market Structure အချိုးအကွေ့), 1H (နေ့စဉ် Session အတက်အကျ အလားအလာ)',
    defaultLeverage: 12,
    maxRecommendedLeverage: 20,
    tpPercent: 3.5,
    tp2Percent: 6.0,
    slPercent: 1.4,
    holdingDaysEstimated: 0.5,
    riskRating: 'Moderate',
    descriptionEn: 'Trades opened and closed within the same trading session. No overnight fee risk.',
    descriptionMy: 'ညအိပ်မထားဘဲ ထိုနေ့အတွင်း အပြီးသတ်ဖွင့်လှစ် ပိတ်သိမ်းသော ကုန်သွယ်မှုပုံစံ။',
  },
  {
    id: 'swing',
    nameEn: 'Swing Trading',
    nameMy: 'Swing Trading (ရက်သတ္တပတ်အတွင်း)',
    durationEn: '2 Days – 1 Week (Same-Week Moves)',
    durationMy: '၂ ရက် မှ ၁ ပတ် (တစ်ပတ်အတွင်း လှုပ်ရှားမှု)',
    requiredTimeframes: ['1H', '4H', '1D'],
    timeframeExplanationEn:
      'Requires 1H (entry confirmation pullbacks), 4H (dominant swing structure & key SFP), and 1D (daily macro support/resistance).',
    timeframeExplanationMy:
      'လိုအပ်သော Timeframes: 1H (Pullback အဝင်အတည်ပြုချက်), 4H (ပင်မ Swing Structure), 1D (နေ့စဉ် Trend)',
    defaultLeverage: 7,
    maxRecommendedLeverage: 10,
    tpPercent: 8.0,
    tp2Percent: 14.0,
    slPercent: 3.0,
    holdingDaysEstimated: 5,
    riskRating: 'Moderate',
    descriptionEn: 'Captures major multi-day price expansions within the same calendar week.',
    descriptionMy: 'ရက်သတ္တပတ်တစ်ခုအတွင်း ဖြစ်ပေါ်သည့် သိသာသော 4H Swing လှိုင်းများကို အမိအရ ဖမ်းယူခြင်း။',
  },
  {
    id: 'position',
    nameEn: 'Position Trading',
    nameMy: 'Position Trading (၁ ပတ် မှ ၁ လအထိ)',
    durationEn: '1 Week – 1 Month (Extended Trend)',
    durationMy: '၁ ပတ် မှ ၁ လ (ကာလရှည် Trend လိုက်ခြင်း)',
    requiredTimeframes: ['4H', '1D', '1W'],
    timeframeExplanationEn:
      'Requires 4H (institutional orderblocks), 1D (trend health & volume accumulation), and 1W (macro market cycle & weekly levels).',
    timeframeExplanationMy:
      'လိုအပ်သော Timeframes: 4H (Institutional Re-entry), 1D (Volume Accumulation), 1W (Macro Cycle အဓိက Trend)',
    defaultLeverage: 3,
    maxRecommendedLeverage: 5,
    tpPercent: 22.0,
    tp2Percent: 35.0,
    slPercent: 6.5,
    holdingDaysEstimated: 25,
    riskRating: 'Moderate',
    descriptionEn: 'Positions held from 1 week up to a month following dominant institutional trends.',
    descriptionMy: '၁ ပတ်မှ ၁ လအထိ Trend အကြီးကြီးကို စိတ်အေးလက်အေး စီးနင်းလိုက်ပါသော ကုန်သွယ်မှု။',
  },
  {
    id: 'long_term',
    nameEn: 'Long-Term Investing',
    nameMy: 'Long-Term Investing (ရေရှည် ရင်းနှီးမြှုပ်နှံမှု)',
    durationEn: '1 Month – 1 Year+ (Spot / Cycle Bottom)',
    durationMy: '၁ လ မှ ၁ နှစ်ကျော် (Spot / Cycle ကာလ)',
    requiredTimeframes: ['1D', '1W', '1M'],
    timeframeExplanationEn:
      'Requires 1D (DCA accumulation zones), 1W (halving & market cycle bottoms), and 1M (macro all-time historical pivots).',
    timeframeExplanationMy:
      'လိုအပ်သော Timeframes: 1D (DCA ဝယ်ယူဇုန်များ), 1W (Halving / Market Cycle Bottoms), 1M (သမိုင်းဝင် Macro Pivot)',
    defaultLeverage: 1,
    maxRecommendedLeverage: 2,
    tpPercent: 65.0,
    tp2Percent: 120.0,
    slPercent: 18.0,
    holdingDaysEstimated: 120,
    riskRating: 'Low',
    descriptionEn: 'Spot or ultra-low leverage macro positioning to ride full crypto bull cycles.',
    descriptionMy: 'Spot (သို့) 1x-2x ဖြင့် Liquidation ကင်းလွတ်စွာ Bull Market တစ်ခုလုံးကို ရင်းနှီးမြှုပ်နှံခြင်း။',
  },
];

interface MultiStyleTradeCardsProps {
  coins: CoinOpportunity[];
  selectedCoin: CoinOpportunity;
  onGoToTrade?: (preset: DemoTradePreset) => void;
  lang: 'my' | 'en';
  walletBalance?: number;
  onWalletBalanceChange?: (bal: number) => void;
  onNavigateToSignalsCopy?: () => void;
}

export const MultiStyleTradeCards: React.FC<MultiStyleTradeCardsProps> = ({
  coins,
  selectedCoin,
  onGoToTrade,
  lang,
  walletBalance: externalWalletBalance,
  onWalletBalanceChange,
  onNavigateToSignalsCopy,
}) => {
  const [activeStyle, setActiveStyle] = useState<TradingStyleType>('swing');
  const [targetCoinSymbol, setTargetCoinSymbol] = useState<string>(selectedCoin.symbol);
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');

  // Account Balance & Entry Sizing State
  const [internalAccountBalance, setInternalAccountBalance] = useState<number>(2000);
  const accountBalance = externalWalletBalance !== undefined ? externalWalletBalance : internalAccountBalance;

  const handleBalanceUpdate = (val: number) => {
    const nextVal = Math.max(10, val);
    if (onWalletBalanceChange) {
      onWalletBalanceChange(nextVal);
    } else {
      setInternalAccountBalance(nextVal);
    }
  };

  const [userMargin, setUserMargin] = useState<number>(150); // $150
  const [selectedAllocationPct, setSelectedAllocationPct] = useState<number | null>(15);

  const styleConfig = useMemo(
    () => TRADING_STYLES.find((s) => s.id === activeStyle) || TRADING_STYLES[2],
    [activeStyle]
  );

  const currentCoin = useMemo(() => {
    return coins.find((c) => c.symbol === targetCoinSymbol) || selectedCoin;
  }, [coins, targetCoinSymbol, selectedCoin]);

  // User manual plan settings
  const [userLeverage, setUserLeverage] = useState<number>(styleConfig.defaultLeverage);
  const [userTpPercent, setUserTpPercent] = useState<number>(styleConfig.tpPercent);
  const [userSlPercent, setUserSlPercent] = useState<number>(styleConfig.slPercent);

  // Copy States
  const [copiedTechnicalCard, setCopiedTechnicalCard] = useState<boolean>(false);
  const [copiedUserPlan, setCopiedUserPlan] = useState<boolean>(false);
  const [customLevels, setCustomLevels] = useState<{ entry: number; tp: number; sl: number } | null>(null);

  // When trading style changes, update defaults
  const handleStyleChange = (style: TradingStyleType) => {
    setActiveStyle(style);
    setCustomLevels(null);
    const cfg = TRADING_STYLES.find((s) => s.id === style);
    if (cfg) {
      setUserLeverage(cfg.defaultLeverage);
      setUserTpPercent(cfg.tpPercent);
      setUserSlPercent(cfg.slPercent);
    }
  };

  // Quick allocation chips
  const handleSetAllocationPercent = (pct: number) => {
    setSelectedAllocationPct(pct);
    const calculated = Math.max(10, Math.round(accountBalance * (pct / 100)));
    setUserMargin(calculated);
  };

  const handleCustomMarginChange = (val: number) => {
    setUserMargin(val);
    setSelectedAllocationPct(null);
  };

  const hasCustomLevels = customLevels !== null;
  const entryPrice = hasCustomLevels ? customLevels.entry : currentCoin.currentPrice;
  const isLong = direction === 'LONG';

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. USER'S MANUAL PLAN CALCULATIONS (ငါချမှတ်ထားတာ)
  // ─────────────────────────────────────────────────────────────────────────────
  const userMarginPctOfBalance = accountBalance > 0 ? (userMargin / accountBalance) * 100 : 0;
  const userNotional = userMargin * userLeverage;

  const effectiveUserTpPct = hasCustomLevels
    ? isLong
      ? ((customLevels.tp - entryPrice) / entryPrice) * 100
      : ((entryPrice - customLevels.tp) / entryPrice) * 100
    : userTpPercent;

  const effectiveUserSlPct = hasCustomLevels
    ? isLong
      ? ((entryPrice - customLevels.sl) / entryPrice) * 100
      : ((customLevels.sl - entryPrice) / entryPrice) * 100
    : userSlPercent;

  const userTpPrice = hasCustomLevels
    ? customLevels.tp
    : isLong
    ? entryPrice * (1 + effectiveUserTpPct / 100)
    : entryPrice * (1 - effectiveUserTpPct / 100);

  const userSlPrice = hasCustomLevels
    ? customLevels.sl
    : isLong
    ? entryPrice * (1 - effectiveUserSlPct / 100)
    : entryPrice * (1 + effectiveUserSlPct / 100);

  const userDollarProfit = userNotional * (effectiveUserTpPct / 100);
  const userDollarLoss = userNotional * (effectiveUserSlPct / 100);
  const userRoeProfit = userMargin > 0 ? (userDollarProfit / userMargin) * 100 : 0;
  const userRoeLoss = userMargin > 0 ? (userDollarLoss / userMargin) * 100 : 0;

  const userAccountGainPct = accountBalance > 0 ? (userDollarProfit / accountBalance) * 100 : 0;
  const userAccountLossPct = accountBalance > 0 ? (userDollarLoss / accountBalance) * 100 : 0;

  const userRRNumeric = effectiveUserSlPct > 0 ? Number((effectiveUserTpPct / effectiveUserSlPct).toFixed(2)) : 0;
  const userRR = userRRNumeric.toFixed(2);
  const userLiqBuffer = userLeverage > 1 ? 100 / userLeverage : 100;
  const userLiqPrice =
    userLeverage > 1
      ? isLong
        ? entryPrice * (1 - userLiqBuffer / 100)
        : entryPrice * (1 + userLiqBuffer / 100)
      : 0;

  // User Rules Checklist:
  const userRuleAllocationSafe = userMarginPctOfBalance <= 25;
  const userRuleLossSafe = userAccountLossPct <= 2.5;
  const userRuleRRSafe = Number(userRR) >= 1.5;
  const userAllRulesPass = userRuleAllocationSafe && userRuleLossSafe && userRuleRRSafe;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1.5 DUAL-ENGINE QUANTITATIVE & DISCIPLINE CONSENSUS (နည်းပညာ vs ငါ့စည်းမျဉ်း)
  // ─────────────────────────────────────────────────────────────────────────────
  const dualEngineData: DualEngineSignalPayload = useMemo(() => {
    return computeDualEngineSignal({
      symbol: currentCoin.symbol,
      currentPrice: currentCoin.currentPrice,
      change24h: currentCoin.change24h,
      high24h: currentCoin.high24h || currentCoin.currentPrice * 1.05,
      low24h: currentCoin.low24h || currentCoin.currentPrice * 0.95,
      volume24hUsd: currentCoin.volume24hUsd || 100000000,
      fundingRate: currentCoin.fundingRate || 0.0001,
      accountBalance,
      userMargin,
      userLeverage,
      userTpPct: effectiveUserTpPct,
      userSlPct: effectiveUserSlPct,
      timeframeStyle: activeStyle.toUpperCase(),
    });
  }, [
    currentCoin,
    accountBalance,
    userMargin,
    userLeverage,
    effectiveUserTpPct,
    effectiveUserSlPct,
    activeStyle,
  ]);

  // Automated smart sync: automatically set direction based on dual-engine consensus
  // so the user never has to guess or struggle choosing between BUY (LONG) or SELL (SHORT)!
  useEffect(() => {
    if (dualEngineData?.consensus?.recommendedDirection) {
      setDirection(dualEngineData.consensus.recommendedDirection);
    }
  }, [currentCoin.symbol, activeStyle]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. INDEPENDENT TECHNICAL RECOMMENDATION CALCULATIONS (နည်းပညာအကြံပြု)
  // ─────────────────────────────────────────────────────────────────────────────
  const atr24hPercent = useMemo(() => {
    const baseAtr = Math.max(2.2, Math.abs(currentCoin.change24h) * 0.75);
    return Number(baseAtr.toFixed(2));
  }, [currentCoin]);

  const technicalAnalysis = useMemo(() => {
    // Noise-immune recommended leverage:
    let recLeverage = styleConfig.defaultLeverage;
    if (styleConfig.id === 'scalping') {
      recLeverage = Math.min(20, Math.max(10, Math.round(50 / Math.max(2, atr24hPercent))));
    } else if (styleConfig.id === 'day_trading') {
      recLeverage = Math.min(14, Math.max(7, Math.round(35 / Math.max(2.5, atr24hPercent))));
    } else if (styleConfig.id === 'swing') {
      recLeverage = Math.min(8, Math.max(4, Math.round(25 / Math.max(3, atr24hPercent))));
    } else if (styleConfig.id === 'position') {
      recLeverage = Math.min(4, Math.max(2, Math.round(15 / Math.max(4, atr24hPercent))));
    } else {
      recLeverage = 1;
    }

    const recTp1Percent = styleConfig.tpPercent;
    const recTp2Percent = styleConfig.tp2Percent;
    const recSlPercent = styleConfig.slPercent;

    // Institutional Capital Preservation Margin:
    // Caps max dollar loss at SL to 1.5% of Account Balance:
    const targetLossDollar = accountBalance * 0.015;
    const rawRecMargin = targetLossDollar / (recLeverage * (recSlPercent / 100));
    const recMargin = Math.max(
      25,
      Math.min(Math.round(accountBalance * 0.25), Math.round(rawRecMargin))
    );

    const recNotional = recMargin * recLeverage;
    const recTp1Price = isLong
      ? entryPrice * (1 + recTp1Percent / 100)
      : entryPrice * (1 - recTp1Percent / 100);
    const recTp2Price = isLong
      ? entryPrice * (1 + recTp2Percent / 100)
      : entryPrice * (1 - recTp2Percent / 100);
    const recSlPrice = isLong
      ? entryPrice * (1 - recSlPercent / 100)
      : entryPrice * (1 + recSlPercent / 100);

    const recDollarProfitTp1 = recNotional * (recTp1Percent / 100);
    const recDollarProfitTp2 = recNotional * (recTp2Percent / 100);
    const recDollarLoss = recNotional * (recSlPercent / 100);

    const recAccountGainPct = accountBalance > 0 ? (recDollarProfitTp1 / accountBalance) * 100 : 0;
    const recAccountLossPct = accountBalance > 0 ? (recDollarLoss / accountBalance) * 100 : 0;
    const recRiskReward = (recTp1Percent / recSlPercent).toFixed(2);
    const recLiqBuffer = recLeverage > 1 ? 100 / recLeverage : 100;
    const recLiqPrice =
      recLeverage > 1
        ? isLong
          ? entryPrice * (1 - recLiqBuffer / 100)
          : entryPrice * (1 + recLiqBuffer / 100)
        : 0;

    return {
      recommendedLeverage: recLeverage,
      recommendedMargin: recMargin,
      recommendedTp1Percent: recTp1Percent,
      recommendedTp2Percent: recTp2Percent,
      recommendedSlPercent: recSlPercent,
      recommendedTp1Price: recTp1Price,
      recommendedTp2Price: recTp2Price,
      recommendedSlPrice: recSlPrice,
      recommendedDollarProfitTp1: recDollarProfitTp1,
      recommendedDollarProfitTp2: recDollarProfitTp2,
      recommendedDollarLoss: recDollarLoss,
      recommendedAccountGainPct: recAccountGainPct,
      recommendedAccountLossPct: recAccountLossPct,
      riskRewardRatio: recRiskReward,
      liquidationBufferPercent: recLiqBuffer,
      liquidationPrice: recLiqPrice,
      recommendedNotional: recNotional,
    };
  }, [styleConfig, atr24hPercent, accountBalance, isLong, entryPrice]);

  // Funding Drag Calculation over Style Holding Period
  const fundingIntervals = Math.max(1, Math.round(styleConfig.holdingDaysEstimated * 3));
  const avgFundingRatePer8h = currentCoin.fundingRate / 100;
  const estimatedFundingFee = technicalAnalysis.recommendedNotional * avgFundingRatePer8h * fundingIntervals;

  const userFeeAndTarget = useMemo(() => {
    return calculateTradeFeesAndTargets(
      entryPrice,
      userNotional,
      userMargin,
      direction,
      atr24hPercent
    );
  }, [entryPrice, userNotional, userMargin, direction, atr24hPercent]);

  const techFeeAndTarget = useMemo(() => {
    return calculateTradeFeesAndTargets(
      entryPrice,
      technicalAnalysis.recommendedNotional,
      technicalAnalysis.recommendedMargin,
      direction,
      atr24hPercent
    );
  }, [entryPrice, technicalAnalysis.recommendedNotional, technicalAnalysis.recommendedMargin, direction, atr24hPercent]);

  // ─────────────────────────────────────────────────────────────────────────────
  // READY-TO-COPY FORMATTED TECHNICAL TRADE CARD
  // ─────────────────────────────────────────────────────────────────────────────
  const technicalTradeCardText = useMemo(() => {
    return `╔════════════════════════════════════════════════════════════════════╗
  ⚡ BINANCE FUTURES — TECHNICAL STRATEGY TRADE CARD
╚════════════════════════════════════════════════════════════════════╝
Asset / Pair        : ${currentCoin.symbol}/USDT (Rank #${currentCoin.rank})
Strategy Style      : ${styleConfig.nameEn} (${styleConfig.durationEn})
Direction Bias      : ${direction} ${isLong ? '🟢 LONG (BUY)' : '🔴 SHORT (SELL)'}
Market Entry Price  : $${entryPrice >= 1 ? entryPrice.toFixed(2) : entryPrice.toFixed(4)}

[STRUCTURAL TARGETS & INVALIDATION]
Take Profit 1 (+${technicalAnalysis.recommendedTp1Percent.toFixed(1)}%): $${
      technicalAnalysis.recommendedTp1Price >= 1
        ? technicalAnalysis.recommendedTp1Price.toFixed(2)
        : technicalAnalysis.recommendedTp1Price.toFixed(4)
    }
Take Profit 2 (+${technicalAnalysis.recommendedTp2Percent.toFixed(1)}%): $${
      technicalAnalysis.recommendedTp2Price >= 1
        ? technicalAnalysis.recommendedTp2Price.toFixed(2)
        : technicalAnalysis.recommendedTp2Price.toFixed(4)
    }
Stop Loss (-${technicalAnalysis.recommendedSlPercent.toFixed(1)}%): $${
      technicalAnalysis.recommendedSlPrice >= 1
        ? technicalAnalysis.recommendedSlPrice.toFixed(2)
        : technicalAnalysis.recommendedSlPrice.toFixed(4)
    }
Risk-to-Reward Ratio: 1 : ${technicalAnalysis.riskRewardRatio}

[CAPITAL SIZING & PORTFOLIO HEALTH]
Account Balance     : $${accountBalance.toLocaleString()} USD
Preservation Margin : $${technicalAnalysis.recommendedMargin} USD (${(
      (technicalAnalysis.recommendedMargin / accountBalance) *
      100
    ).toFixed(1)}% of wallet)
Noise-Immune Leverage: ${technicalAnalysis.recommendedLeverage}×
Notional Position   : $${technicalAnalysis.recommendedNotional.toLocaleString()} USD
Est. Gain at TP1    : +$${technicalAnalysis.recommendedDollarProfitTp1.toFixed(2)} (+${technicalAnalysis.recommendedAccountGainPct.toFixed(2)}% Acct Growth)
Max Risk at SL      : -$${technicalAnalysis.recommendedDollarLoss.toFixed(2)} (-${technicalAnalysis.recommendedAccountLossPct.toFixed(2)}% Max Drawdown)
Liquidation Price   : ${
      technicalAnalysis.liquidationPrice > 0
        ? `$${
            technicalAnalysis.liquidationPrice >= 1
              ? technicalAnalysis.liquidationPrice.toFixed(2)
              : technicalAnalysis.liquidationPrice.toFixed(4)
          }`
        : 'Spot 1x (No Liq)'
    }
Liquidation Buffer  : ±${technicalAnalysis.liquidationBufferPercent.toFixed(1)}% (Outside 24h ATR noise)

[TIMEFRAME & FUNDING HORIZON]
Required Timeframes : ${styleConfig.requiredTimeframes.join(' + ')}
Timeframe Rule      : ${styleConfig.timeframeExplanationEn}
Est. Holding Period : ~${styleConfig.holdingDaysEstimated} days (${fundingIntervals} funding cycles)
Est. Funding Drag   : ~$${Math.abs(estimatedFundingFee).toFixed(2)} USD
════════════════════════════════════════════════════════════════════
Generated by Binance Futures Strategy Hub`;
  }, [
    currentCoin,
    styleConfig,
    direction,
    isLong,
    entryPrice,
    technicalAnalysis,
    accountBalance,
    fundingIntervals,
    estimatedFundingFee,
  ]);

  // Handle Copy Technical Trade Card
  const handleCopyTechnicalTradeCard = () => {
    navigator.clipboard.writeText(technicalTradeCardText);
    setCopiedTechnicalCard(true);
    setTimeout(() => setCopiedTechnicalCard(false), 2500);
  };

  // Adopt Technical Plan into User Plan
  const handleAdoptTechnical = () => {
    setUserLeverage(technicalAnalysis.recommendedLeverage);
    setUserMargin(technicalAnalysis.recommendedMargin);
    setUserTpPercent(technicalAnalysis.recommendedTp1Percent);
    setUserSlPercent(technicalAnalysis.recommendedSlPercent);
  };

  // Send to Demo Terminal
  const handleSendToDemo = (useTechnical: boolean) => {
    if (!onGoToTrade) return;
    const preset: DemoTradePreset = {
      symbol: currentCoin.symbol,
      side: direction,
      margin: useTechnical ? technicalAnalysis.recommendedMargin : userMargin,
      leverage: useTechnical ? technicalAnalysis.recommendedLeverage : userLeverage,
      entryPrice,
      tpPrice: useTechnical ? technicalAnalysis.recommendedTp1Price : userTpPrice,
      slPrice: useTechnical ? technicalAnalysis.recommendedSlPrice : userSlPrice,
      orderType: 'MARKET',
      source: useTechnical ? `Technical ${styleConfig.nameEn}` : `Custom ${styleConfig.nameEn}`,
      timestamp: Date.now(),
    };
    onGoToTrade(preset);
  };

  return (
    <section
      id="multi-style-trading-hub"
      className="bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-6"
    >
      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION HEADER: ASSET & STYLE NAVIGATION TABS
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-500">
                MULTI-TIMEFRAME STRATEGY HUB
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                5 DISTINCT STYLES
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {lang === 'my'
                ? 'ကုန်သွယ်မှု စတိုင်လ်အလိုက် ပြည့်စုံသော Setup နှင့် တွက်ချက်မှုစနစ်'
                : 'Custom Strategy Engine: Scalping to Long-Term Investing'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'my'
                ? 'မိမိချမှတ်ထားသော စည်းကမ်းချက်များနှင့် နည်းပညာအကြံပြုချက်ကို ဘေးချင်းယှဉ် နှစ်ပိုင်းခွဲ၍ တွက်ချက်ပါ'
                : 'Dual-track framework: your manual limits vs. independent technical strategy & recommended trade card'}
            </p>
          </div>
        </div>

        {/* Asset Selector & Easy Signals Quick Jump */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToSignalsCopy && (
            <button
              onClick={onNavigateToSignalsCopy}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 text-xs font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title={lang === 'my' ? 'Binance သို့ အမြန်ကော်ပီကူးယူနိုင်သော Easy Signals Mode သို့ သွားမည်' : 'Switch to Easy Signals Copy Hub'}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'my' ? '⚡ အမြန် ကော်ပီမုဒ် (Easy Signals)' : '⚡ Easy Signals Mode'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 pl-1">{lang === 'my' ? 'Coin:' : 'Asset:'}</span>
            <select
              id="multi-style-coin-select"
              value={targetCoinSymbol}
              onChange={(e) => setTargetCoinSymbol(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {coins.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} (Rank #{c.rank} • $
                  {c.currentPrice >= 1 ? c.currentPrice.toFixed(2) : c.currentPrice.toFixed(4)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5 Trading Style Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {TRADING_STYLES.map((style) => {
          const isActive = activeStyle === style.id;
          return (
            <button
              key={style.id}
              id={`style-tab-${style.id}`}
              onClick={() => handleStyleChange(style.id)}
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{style.nameEn}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {style.defaultLeverage}x
                  </span>
                </div>
                <div className="text-[10px] mt-1 opacity-90 truncate">
                  {lang === 'my' ? style.durationMy : style.durationEn}
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2.5">
                {style.requiredTimeframes.map((tf) => (
                  <span
                    key={tf}
                    className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${
                      isActive ? 'bg-indigo-900/50 text-indigo-100' : 'bg-indigo-500/10 text-indigo-500'
                    }`}
                  >
                    {tf}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* TIMEFRAME CALLOUT BANNER */}
      <div className="bg-indigo-500/5 dark:bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500 text-white shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                {lang === 'my' ? 'ဇယားတွင် ကြည့်ရှုရမည့် Timeframe များ:' : 'Required Chart Timeframes for this Trade:'}
              </span>
              <div className="flex items-center gap-1">
                {styleConfig.requiredTimeframes.map((tf) => (
                  <span
                    key={tf}
                    className="px-2 py-0.5 rounded-lg text-xs font-mono font-black bg-indigo-500 text-white shadow-xs"
                  >
                    {tf}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {lang === 'my' ? styleConfig.timeframeExplanationMy : styleConfig.timeframeExplanationEn}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
          <Calendar className="w-4 h-4" />
          <span>{lang === 'my' ? styleConfig.durationMy : styleConfig.durationEn}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          EXECUTIVE DUAL-ENGINE BUY/SELL DECISION CONSOLE (မင်းရဲ့ နည်းပညာ vs ငါ့စည်းမျဉ်း)
          အသုံးပြုသူ ရွေးချယ်စရာမလိုဘဲ နည်းပညာနှင့် စည်းမျဉ်း ၂ ခုလုံးဖြင့် တိုက်ရိုက်ဆုံးဖြတ်ချက်
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl p-5 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-xl space-y-4">
        {/* Consensus Executive Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-3 rounded-2xl shrink-0 ${
              dualEngineData.consensus.recommendedDirection === 'LONG'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
            }`}>
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-black tracking-widest text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === 'my'
                    ? 'Dual-Engine အဝယ်/အရောင်း ပေါင်းစပ်ဆုံးဖြတ်ချက်'
                    : 'Dual-Engine Algorithmic Consensus'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase font-mono tracking-wider ${
                  dualEngineData.consensus.recommendedDirection === 'LONG'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {dualEngineData.consensus.recommendedDirection === 'LONG'
                    ? '🟢 HIGH PROBABILITY BUY (LONG)'
                    : '🔴 HIGH PROBABILITY SELL (SHORT)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {lang === 'my'
                  ? dualEngineData.consensus.subtextMy
                  : dualEngineData.consensus.subtextEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <div className="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 font-sans">
                {lang === 'my' ? 'အောင်နိုင်ခြေ / Confluence' : 'Winrate Confluence'}
              </div>
              <div className="text-xs font-black text-amber-400 font-mono">
                {dualEngineData.technical.confidenceScore}% Score • {dualEngineData.consensus.winrateExpectancy}% Edge
              </div>
            </div>

            <button
              id="dual-engine-sync-dir-btn"
              onClick={() => setDirection(dualEngineData.consensus.recommendedDirection)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md ${
                direction === dualEngineData.consensus.recommendedDirection
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {direction === dualEngineData.consensus.recommendedDirection
                  ? lang === 'my'
                    ? `အတည်ပြုပြီး: ${direction}`
                    : `Active: ${direction}`
                  : lang === 'my'
                  ? `ဦးတည်ချက်ပြောင်း: ${dualEngineData.consensus.recommendedDirection}`
                  : `Adopt: ${dualEngineData.consensus.recommendedDirection}`}
              </span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Dual-Perspective Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Engine 1: မင်းရဲ့ Crypto နည်းပညာ (System Quantitative Technical Engine) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    {lang === 'my' ? '(၁) မင်းရဲ့ နည်းပညာ.Crypto.' : 'Engine 1: Crypto Quantitative Tech'}
                  </h4>
                  <div className="text-[10px] text-slate-400">
                    {lang === 'my' ? 'ATR, Trend, RSI & Liquidity မော်ဒယ်' : 'Noise-immune quantitative algorithms'}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                dualEngineData.technical.bias === 'LONG'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {dualEngineData.technical.bias === 'LONG' ? '🟢 BUY (LONG)' : '🔴 SELL (SHORT)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">4H Trend Bias</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">
                  {dualEngineData.technical.trend4h}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">15M/1H Trigger</div>
                <div className="font-bold text-amber-400 mt-0.5 truncate">
                  {lang === 'my' ? dualEngineData.technical.keyTriggerMy : dualEngineData.technical.keyTriggerEn}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">24h ATR Barrier</div>
                <div className="font-bold text-slate-200 mt-0.5">
                  ±{dualEngineData.technical.atrPercent}% Volatility
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">RSI Momentum</div>
                <div className="font-bold text-emerald-400 mt-0.5">
                  RSI {dualEngineData.technical.rsiLevel}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Smart Entry</span>
                <span className="text-white font-bold">${dualEngineData.technical.entryPrice.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-rose-400 text-[10px] block font-sans">Stop Loss</span>
                <span className="text-rose-400 font-bold">${dualEngineData.technical.slPrice.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-emerald-400 text-[10px] block font-sans">Target TP1</span>
                <span className="text-emerald-400 font-bold">${dualEngineData.technical.tp1Price.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Engine 2: ငါချမှတ်ထားတဲ့ စည်းမျဉ်းများ (Trader's Strict Discipline Rules) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ListChecks className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    {lang === 'my' ? '(၂) ငါချမှတ်ထားတဲ့ စည်းမျဉ်းများ' : 'Engine 2: Trader Discipline Rules'}
                  </h4>
                  <div className="text-[10px] text-slate-400">
                    {lang === 'my' ? 'အရင်းအနှီးကာကွယ်မှု စည်းမျဉ်း ၆ ချက်' : '6 Capital preservation requirements'}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                dualEngineData.rules.status.startsWith('APPROVED')
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {dualEngineData.rules.passedCount}/{dualEngineData.rules.totalRules} PASSED
              </span>
            </div>

            {/* 6 Rules Compact Checklist dynamically mapped */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {dualEngineData.rules.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1.5 rounded-lg border border-slate-800"
                >
                  {rule.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="text-slate-300 truncate font-mono text-[10px]">
                    {lang === 'my' ? rule.titleMy : rule.titleEn}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'my' ? dualEngineData.rules.verdictMy : dualEngineData.rules.verdictEn}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          PORTFOLIO & FUTURES WALLET BALANCE CONTROLLER (FUTURES WALLET BALANCE စနစ်)
          ───────────────────────────────────────────────────────────────────────────── */}
      <DualTrackWalletBanner
        walletBalance={accountBalance}
        onWalletBalanceChange={handleBalanceUpdate}
        direction={direction}
        onDirectionChange={setDirection}
        margin={userMargin}
        dollarLoss={userDollarLoss}
        dollarProfit={userDollarProfit}
        accountGainPct={userAccountGainPct}
        accountLossPct={userAccountLossPct}
        riskReward={userRRNumeric}
        consecutiveLosses={userAccountLossPct > 0 ? Math.floor(50 / userAccountLossPct) : 999}
        lang={lang}
        recommendedDirection={dualEngineData.consensus.recommendedDirection}
        technicalScore={dualEngineData.technical.confidenceScore}
        rulesPassed={dualEngineData.rules.passedCount}
        rulesTotal={dualEngineData.rules.totalRules}
        onApplyRecommendation={() => setDirection(dualEngineData.consensus.recommendedDirection)}
      />

      {/* ─────────────────────────────────────────────────────────────────────────────
          DUAL-TRACK COMPARATIVE ARCHITECTURE (ပထမလိုပဲ နှစ်ပိုင်းခွဲထားသော စနစ်)
          PART 1: USER'S CUSTOM PLAN (LEFT) vs. PART 2: TECHNICAL RECOMMENDATION (RIGHT)
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════════════════════════════════
            PART 1: ငါချမှတ်ထားတာ (TRADER'S MANUAL RULES & CUSTOM PLAN)
            ═══════════════════════════════════════════════════════════════════════════ */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border-2 border-slate-300 dark:border-slate-800 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    {lang === 'my' ? 'အပိုင်း (၁) - သင်သတ်မှတ်ထားသော စည်းမျဉ်းများ (ငါ့စည်းမျဉ်း)' : 'Part 1: Your Custom Plan & Rules (My Rules)'}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    MANUAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {lang === 'my'
                    ? 'မိမိစိတ်ကြိုက် Margin၊ Leverage၊ TP နှင့် SL ကို လွတ်လပ်စွာ သတ်မှတ်ပါ'
                    : 'Configure your preferred margin, leverage multiplier, and target exit levels'}
                </p>
              </div>
            </div>

            {hasCustomLevels && (
              <button
                id="reset-user-levels-btn"
                onClick={() => setCustomLevels(null)}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 cursor-pointer bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20"
                title="Reset to strategy preset targets"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Direction Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {lang === 'my' ? 'Direction (ကုန်သွယ်မည့် ဦးတည်ရာ)' : 'Trade Direction'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="custom-dir-long-btn"
                onClick={() => setDirection('LONG')}
                className={`py-2 rounded-xl text-xs font-black transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                  direction === 'LONG'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>LONG (ဝယ်)</span>
              </button>
              <button
                id="custom-dir-short-btn"
                onClick={() => setDirection('SHORT')}
                className={`py-2 rounded-xl text-xs font-black transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                  direction === 'SHORT'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>SHORT (ရောင်း)</span>
              </button>
            </div>
          </div>

          {/* Margin Slider & Number Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{lang === 'my' ? 'Margin ပမာဏ (အဝင်အရင်းအနှီး)' : 'Custom Margin'}</span>
              <div className="flex items-center gap-1 font-mono font-bold text-indigo-500">
                <span>${userMargin} USD</span>
                <span className="text-[10px] text-slate-400">({userMarginPctOfBalance.toFixed(1)}% Acct)</span>
              </div>
            </div>
            <input
              id="custom-margin-slider"
              type="range"
              min={25}
              max={Math.max(500, accountBalance)}
              step={25}
              value={userMargin}
              onChange={(e) => handleCustomMarginChange(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Leverage Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{lang === 'my' ? 'Leverage အဆ' : 'Custom Leverage'}</span>
              <span className="font-mono font-bold text-indigo-500">{userLeverage}×</span>
            </div>
            <input
              id="custom-leverage-slider"
              type="range"
              min={1}
              max={styleConfig.maxRecommendedLeverage}
              step={1}
              value={userLeverage}
              onChange={(e) => setUserLeverage(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1x (Spot)</span>
              <span>Style Default: {styleConfig.defaultLeverage}x</span>
              <span>Max Cap: {styleConfig.maxRecommendedLeverage}x</span>
            </div>
          </div>

          {/* Target TP & SL Interactive Sliders */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* TP Slider */}
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Take-Profit</span>
                <span className="font-mono">+{effectiveUserTpPct.toFixed(1)}%</span>
              </div>
              <input
                id="custom-tp-slider"
                type="range"
                min={0.5}
                max={Math.max(50, styleConfig.tp2Percent * 1.5)}
                step={0.5}
                value={userTpPercent}
                onChange={(e) => {
                  setUserTpPercent(Number(e.target.value));
                  setCustomLevels(null);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                <span>Price: ${userTpPrice >= 1 ? userTpPrice.toFixed(2) : userTpPrice.toFixed(4)}</span>
              </div>
            </div>

            {/* SL Slider */}
            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/30 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                <span>Stop-Loss</span>
                <span className="font-mono">-{effectiveUserSlPct.toFixed(1)}%</span>
              </div>
              <input
                id="custom-sl-slider"
                type="range"
                min={0.3}
                max={Math.max(20, styleConfig.slPercent * 2)}
                step={0.1}
                value={userSlPercent}
                onChange={(e) => {
                  setUserSlPercent(Number(e.target.value));
                  setCustomLevels(null);
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                <span>Price: ${userSlPrice >= 1 ? userSlPrice.toFixed(2) : userSlPrice.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* User Financial Outcomes */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Notional Size:</span>
              <span className="font-bold text-slate-900 dark:text-white">${userNotional.toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Projected Gain at TP:</span>
              <span className="font-bold text-emerald-500">
                +${userDollarProfit.toFixed(2)} (+{userRoeProfit.toFixed(1)}% ROE)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Max Dollar Risk at SL:</span>
              <span className="font-bold text-rose-500">
                -${userDollarLoss.toFixed(2)} (-{userRoeLoss.toFixed(1)}% ROE)
              </span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Liquidation Price:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {userLeverage > 1
                  ? `$${userLiqPrice >= 1 ? userLiqPrice.toFixed(2) : userLiqPrice.toFixed(4)} (±${userLiqBuffer.toFixed(1)}%)`
                  : 'Spot 1x (No Liq)'}
              </span>
            </div>
          </div>

          {/* Trade Fees & Exit Strategy UI Block */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-800 dark:text-amber-300/80 font-medium">{lang === 'my' ? 'ကုန်ကျစရိတ် (Est. Fees):' : 'Estimated Fees:'}</span>
              <span className="text-amber-900 dark:text-amber-200 font-bold">${userFeeAndTarget.totalFeeUsd.toFixed(2)} <span className="text-amber-600 dark:text-amber-400/70 font-normal">({userFeeAndTarget.feePercentageOfMargin.toFixed(1)}% margin)</span></span>
            </div>
            <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-bold text-amber-700 dark:text-amber-400">{lang === 'my' ? 'အကြံပြုချက်:' : 'Exit Plan:'}</span> {lang === 'my' ? userFeeAndTarget.optimalExitRecommendationMy : userFeeAndTarget.optimalExitRecommendation}
            </div>
          </div>

          {/* User Rule Checklist & Qualification Badge */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {lang === 'my' ? 'စည်းကမ်း သတ်မှတ်ချက် စစ်ဆေးမှု' : 'User Risk Rule Checklist'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  userAllRulesPass
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}
              >
                {userAllRulesPass ? 'QUALIFIED PLAN' : 'RISK WARNING'}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                {userRuleAllocationSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span className={userRuleAllocationSafe ? 'text-slate-600 dark:text-slate-300' : 'text-rose-500 font-bold'}>
                  Margin Allocation ≤ 25% of Account (Current: {userMarginPctOfBalance.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {userRuleLossSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span className={userRuleLossSafe ? 'text-slate-600 dark:text-slate-300' : 'text-rose-500 font-bold'}>
                  Max Loss at SL ≤ 2.5% of Account (Current: {userAccountLossPct.toFixed(2)}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {userRuleRRSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                )}
                <span className={userRuleRRSafe ? 'text-slate-600 dark:text-slate-300' : 'text-rose-500 font-bold'}>
                  Risk-to-Reward Ratio ≥ 1.5 (Current: 1 : {userRR})
                </span>
              </div>
            </div>
          </div>

          {/* User Plan Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              id="execute-user-plan-btn"
              onClick={() => handleSendToDemo(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>{lang === 'my' ? 'သင်၏ Setup ဖြင့် စမ်းသပ်မည်' : 'Execute Your Custom Plan'}</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            PART 2: အကြံပြုထားသော (INDEPENDENT TECHNICAL STRATEGY & TRADE CARD)
            ═══════════════════════════════════════════════════════════════════════════ */}
        <div className="p-5 rounded-3xl bg-indigo-950/20 dark:bg-indigo-950/40 border-2 border-indigo-500/40 space-y-5">
          {/* Header & Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/30">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">
                    {lang === 'my' ? 'အပိုင်း (၂) - နည်းပညာပိုင်းဆိုင်ရာ သုံးသပ်အကြံပြုချက် (မင်းရွေးချယ်မှု)' : 'Part 2: Technical Strategy Recommendation (AI Choice)'}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-indigo-500 text-white shadow-xs">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-indigo-300/80">
                  {lang === 'my'
                    ? 'ATR Volatility, Market Noise နှင့် Capital Preservation ပေါ် အခြေခံသော လွတ်လပ်သည့် အကြံပြုချက်'
                    : 'Independent volatility, ATR noise absorption, and capital preservation audit'}
                </p>
              </div>
            </div>

            {/* Top Action Buttons (Copy Trade Card + Adopt) */}
            <div className="flex items-center gap-2">
              <button
                id="copy-style-trade-card-top-btn"
                onClick={handleCopyTechnicalTradeCard}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Copy formatted ready-to-share trade card"
              >
                {copiedTechnicalCard ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>
                  {copiedTechnicalCard
                    ? lang === 'my'
                      ? 'ကူးယူပြီးပါပြီ!'
                      : 'Card Copied!'
                    : lang === 'my'
                    ? 'Trade Card ကူးယူမည်'
                    : 'Copy Trade Card'}
                </span>
              </button>

              <button
                id="adopt-style-technical-btn"
                onClick={handleAdoptTechnical}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-600/30"
                title="Adopt recommended levels into your custom inputs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'my' ? 'အကြံပြုချက် အသုံးပြုမည်' : 'Adopt'}</span>
              </button>
            </div>
          </div>

          {/* 1. Recommended Margin & Leverage */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center justify-between">
              <span>1. Recommended Safe Margin & Leverage</span>
              <span className="font-mono text-amber-400 font-bold">
                24H ATR Noise: ±{atr24hPercent.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              {/* Preservation Margin */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-indigo-500/30 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Preservation Margin:</div>
                <div className="text-lg font-black text-white">${technicalAnalysis.recommendedMargin} USD</div>
                <div className="text-[10px] text-emerald-400 font-sans">
                  Caps loss strictly to 1.5% of ${accountBalance.toLocaleString()} wallet
                </div>
              </div>

              {/* Noise-Immune Leverage */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-indigo-500/30 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Noise-Immune Leverage:</div>
                <div className="text-lg font-black text-indigo-400">
                  {technicalAnalysis.recommendedLeverage}×
                </div>
                <div className="text-[10px] text-slate-300 font-sans">
                  Liq Buffer: ±{technicalAnalysis.liquidationBufferPercent.toFixed(1)}% (outside normal noise)
                </div>
              </div>
            </div>

            {/* Explanation Callout */}
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-bold">Technical Logic: </span>
              {userLeverage > technicalAnalysis.recommendedLeverage ? (
                <span>
                  {lang === 'my'
                    ? `သင်ရွေးချယ်ထားသော ${userLeverage}x Leverage သည် ${styleConfig.nameEn} စတိုင်လ်၏ ပုံမှန်အတက်အကျ (${atr24hPercent}%) အတွင်း ကျရောက်နေသဖြင့် အကြံပြုထားသော ${technicalAnalysis.recommendedLeverage}x သို့ လျှော့ချခြင်းက စိတ်ချရစေပါသည်။`
                    : `Your ${userLeverage}x leverage is vulnerable to routine timeframe wicks. The engine recommends ${technicalAnalysis.recommendedLeverage}x to keep your liquidation barrier (±${technicalAnalysis.liquidationBufferPercent.toFixed(1)}%) safely outside daily noise.`}
                </span>
              ) : (
                <span>
                  {lang === 'my'
                    ? `သင်၏ ${userLeverage}x Leverage သည် ${styleConfig.nameEn} စတိုင်လ်နှင့် ကိုက်ညီပြီး အန္တရာယ်ကင်းသော အကွာအဝေးအတွင်း ရှိပါသည်။`
                    : `Your ${userLeverage}x leverage maintains an adequate liquidation safety cushion for this strategy timeframe.`}
                </span>
              )}
            </div>
          </div>

          {/* 2. Structural TP & SL Targets */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center justify-between">
              <span>2. Structurally Sound Targets</span>
              <span className="font-mono text-emerald-400 font-bold">
                Edge R:R 1 : {technicalAnalysis.riskRewardRatio}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              {/* Structural TP */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/40 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Structural Take-Profit:</div>
                <div className="text-base font-black text-emerald-400">
                  +{technicalAnalysis.recommendedTp1Percent.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-300">
                  ${technicalAnalysis.recommendedTp1Price >= 1 ? technicalAnalysis.recommendedTp1Price.toFixed(2) : technicalAnalysis.recommendedTp1Price.toFixed(4)}
                </div>
                <div className="text-[10px] text-emerald-400 font-sans">
                  Est. +${technicalAnalysis.recommendedDollarProfitTp1.toFixed(1)} (+{technicalAnalysis.recommendedAccountGainPct.toFixed(1)}% Acct Growth)
                </div>
              </div>

              {/* Invalidation SL */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-rose-500/40 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Invalidation Stop-Loss:</div>
                <div className="text-base font-black text-rose-400">
                  -{technicalAnalysis.recommendedSlPercent.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-300">
                  ${technicalAnalysis.recommendedSlPrice >= 1 ? technicalAnalysis.recommendedSlPrice.toFixed(2) : technicalAnalysis.recommendedSlPrice.toFixed(4)}
                </div>
                <div className="text-[10px] text-rose-400 font-sans">
                  Est. -${technicalAnalysis.recommendedDollarLoss.toFixed(1)} (-{technicalAnalysis.recommendedAccountLossPct.toFixed(1)}% Max Drawdown)
                </div>
              </div>
            </div>
          </div>

          {/* 3. Strategy Holding Duration & Cumulative Funding Impact */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. Expected Duration & Funding Impact</span>
              </span>
              <span className="font-mono text-indigo-300 font-bold">
                ~{styleConfig.holdingDaysEstimated} Days Horizon
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
              <span className="text-slate-400">Cumulative 8h Funding Drag:</span>
              <span className="font-mono font-bold text-amber-400">
                ~${Math.abs(estimatedFundingFee).toFixed(2)} USD ({fundingIntervals} intervals)
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {lang === 'my'
                ? `၈ နာရီတစ်ကြိမ် Funding Rate (${currentCoin.fundingRate.toFixed(4)}%) ပေါ် အခြေခံ၍ ကုန်ကျစရိတ်ကို ကြိုတင်ခန့်မှန်းတွက်ချက်ထားခြင်း`
                : `Based on current 8h rate (${currentCoin.fundingRate.toFixed(4)}%) across expected holding days.`}
            </div>
          </div>

          {/* Trade Fees & Exit Strategy UI Block */}
          <div className="bg-indigo-950/20 rounded-xl p-3 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-300/80 font-medium">{lang === 'my' ? 'ကုန်ကျစရိတ် (Est. Fees):' : 'Estimated Fees:'}</span>
              <span className="text-indigo-200 font-bold">${techFeeAndTarget.totalFeeUsd.toFixed(2)} <span className="text-indigo-400/70 font-normal">({techFeeAndTarget.feePercentageOfMargin.toFixed(1)}% margin)</span></span>
            </div>
            <div className="text-[11px] text-indigo-300 leading-relaxed">
              <span className="font-bold text-indigo-400">{lang === 'my' ? 'အကြံပြုချက်:' : 'Exit Plan:'}</span> {lang === 'my' ? techFeeAndTarget.optimalExitRecommendationMy : techFeeAndTarget.optimalExitRecommendation}
            </div>
          </div>

          {/* Technical Recommendation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              id="copy-style-trade-card-bottom-btn"
              onClick={handleCopyTechnicalTradeCard}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-indigo-500/40 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Copy formatted ready-to-share trade card"
            >
              {copiedTechnicalCard ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-indigo-400" />
              )}
              <span>
                {copiedTechnicalCard
                  ? lang === 'my'
                    ? 'Trade Card ကူးယူပြီးပါပြီ!'
                    : 'Trade Card Copied!'
                  : lang === 'my'
                  ? 'Trade Card ကူးယူမည်'
                  : 'Copy Trade Card'}
              </span>
            </button>

            {onGoToTrade && (
              <button
                id="trade-style-technical-demo-btn"
                onClick={() => handleSendToDemo(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'my' ? 'နည်းပညာ အကြံပြုချက်ဖြင့် Demo စမ်းသပ်မည်' : 'Execute Technical in Demo'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 3: SIDE-BY-SIDE COMPARATIVE MATRIX TABLE
          (ဘေးချင်းယှဉ် နှိုင်းယှဉ်ချက် ဇယား)
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>
              {lang === 'my'
                ? 'ဘေးချင်းယှဉ် နှိုင်းယှဉ်ချက်: ငါချမှတ်ထားတာ VS. နည်းပညာအကြံပြုချက်'
                : 'Comparative Matrix: Your Plan vs. Technical Recommendation'}
            </span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {currentCoin.symbol} • {styleConfig.nameEn}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2 px-3">Metric</th>
                <th className="py-2 px-3">Part 1: ငါချမှတ်ထားတာ (Your Plan)</th>
                <th className="py-2 px-3">Part 2: နည်းပညာအကြံပြု (Technical)</th>
                <th className="py-2 px-3">Variance / Safety Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {/* Row 1: Leverage */}
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-700 dark:text-slate-300">
                  Leverage Multiplier
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{userLeverage}×</td>
                <td className="py-2.5 px-3 font-bold text-indigo-500">
                  {technicalAnalysis.recommendedLeverage}×
                </td>
                <td className="py-2.5 px-3 font-sans text-[11px]">
                  {userLeverage <= technicalAnalysis.recommendedLeverage ? (
                    <span className="text-emerald-500 font-semibold">✔ Safe noise insulation</span>
                  ) : (
                    <span className="text-amber-500 font-semibold">
                      ⚠️ {userLeverage - technicalAnalysis.recommendedLeverage}x higher than noise threshold
                    </span>
                  )}
                </td>
              </tr>

              {/* Row 2: Margin & Wallet Allocation */}
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-700 dark:text-slate-300">
                  Margin Allocation
                </td>
                <td className="py-2.5 px-3">
                  ${userMargin} USD ({userMarginPctOfBalance.toFixed(1)}% of acct)
                </td>
                <td className="py-2.5 px-3 text-indigo-500 font-bold">
                  ${technicalAnalysis.recommendedMargin} USD (
                  {((technicalAnalysis.recommendedMargin / accountBalance) * 100).toFixed(1)}% of acct)
                </td>
                <td className="py-2.5 px-3 font-sans text-[11px]">
                  {userMarginPctOfBalance <= 25 ? (
                    <span className="text-emerald-500 font-semibold">✔ Healthy capital commitment</span>
                  ) : (
                    <span className="text-rose-500 font-semibold">
                      🚨 Over-allocated (&gt;25% of account balance)
                    </span>
                  )}
                </td>
              </tr>

              {/* Row 3: Stop-Loss Level & Portfolio Drawdown */}
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-700 dark:text-slate-300">
                  Stop Loss & Max Drawdown
                </td>
                <td className="py-2.5 px-3 text-rose-500 font-semibold">
                  -${userDollarLoss.toFixed(1)} (-{userAccountLossPct.toFixed(2)}% equity)
                </td>
                <td className="py-2.5 px-3 text-rose-400 font-semibold">
                  -${technicalAnalysis.recommendedDollarLoss.toFixed(1)} (-
                  {technicalAnalysis.recommendedAccountLossPct.toFixed(2)}% equity)
                </td>
                <td className="py-2.5 px-3 font-sans text-[11px]">
                  {userAccountLossPct <= 2.5 ? (
                    <span className="text-emerald-500 font-semibold">✔ Institutional 2% preservation</span>
                  ) : (
                    <span className="text-rose-500 font-semibold">
                      🚨 Exceeds standard capital preservation ceiling
                    </span>
                  )}
                </td>
              </tr>

              {/* Row 4: Take Profit & Portfolio Growth */}
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-700 dark:text-slate-300">
                  Take Profit & Account Growth
                </td>
                <td className="py-2.5 px-3 text-emerald-500 font-semibold">
                  +${userDollarProfit.toFixed(1)} (+{userAccountGainPct.toFixed(2)}% acct)
                </td>
                <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                  +${technicalAnalysis.recommendedDollarProfitTp1.toFixed(1)} (+
                  {technicalAnalysis.recommendedAccountGainPct.toFixed(2)}% acct)
                </td>
                <td className="py-2.5 px-3 font-sans text-[11px]">
                  <span>R:R User 1:{userRR} vs Tech 1:{technicalAnalysis.riskRewardRatio}</span>
                </td>
              </tr>

              {/* Row 5: Liquidation Buffer */}
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-700 dark:text-slate-300">
                  Liquidation Buffer
                </td>
                <td className="py-2.5 px-3">±{userLiqBuffer.toFixed(1)}% adverse move</td>
                <td className="py-2.5 px-3 text-indigo-500 font-bold">
                  ±{technicalAnalysis.liquidationBufferPercent.toFixed(1)}% adverse move
                </td>
                <td className="py-2.5 px-3 font-sans text-[11px]">
                  {userLiqBuffer >= atr24hPercent * 1.5 ? (
                    <span className="text-emerald-500 font-semibold">✔ Safely outside 24h ATR range</span>
                  ) : (
                    <span className="text-rose-500 font-semibold">⚠️ High liquidation risk during wicks</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 4: RISK/REWARD RATIO VISUALIZER MODULE
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <RiskRewardVisualizer
          currentPrice={currentCoin.currentPrice}
          symbol={currentCoin.symbol}
          activeStyle={activeStyle}
          onStyleChange={handleStyleChange}
          direction={direction}
          onDirectionChange={setDirection}
          margin={userMargin}
          leverage={userLeverage}
          onApplyCustomLevels={(entry, tp, sl) => {
            setCustomLevels({ entry, tp, sl });
          }}
          lang={lang}
        />
      </div>
    </section>
  );
};
