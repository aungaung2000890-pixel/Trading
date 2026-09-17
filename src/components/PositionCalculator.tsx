import React, { useState, useMemo } from 'react';
import {
  Calculator,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  FileText,
  Download,
  X,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Zap,
  RotateCcw,
  Target,
  Percent,
  Layers,
  Scale,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { CoinOpportunity, DemoTradePreset } from '../types';
import { calculateTradeFeesAndTargets } from '../utils/technicalAnalysis';

interface PositionCalculatorProps {
  coins: CoinOpportunity[];
  selectedCoin: CoinOpportunity;
  onSelectCoin: (coin: CoinOpportunity) => void;
  onGoToTrade?: (preset: DemoTradePreset) => void;
  lang: 'my' | 'en';
  walletBalance?: number;
  onWalletBalanceChange?: (bal: number) => void;
}

export const PositionCalculator: React.FC<PositionCalculatorProps> = ({
  coins,
  selectedCoin,
  onSelectCoin,
  onGoToTrade,
  lang,
  walletBalance: externalWalletBalance,
  onWalletBalanceChange,
}) => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. ACCOUNT-LEVEL STATE
  // ─────────────────────────────────────────────────────────────────────────────
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

  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const isLong = direction === 'LONG';
  const entryPrice = selectedCoin.currentPrice;

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PART 1: USER'S RULES & MANUAL INPUTS
  // ─────────────────────────────────────────────────────────────────────────────
  const [userMargin, setUserMargin] = useState<number>(150);
  const [userLeverage, setUserLeverage] = useState<number>(25);
  const [userTpPercent, setUserTpPercent] = useState<number>(10.0);
  const [userSlPercent, setUserSlPercent] = useState<number>(2.0);

  // User Custom Rule Criteria for 10% move qualification
  const [userMinRR, setUserMinRR] = useState<number>(2.5);
  const [userMaxAccountRiskPct, setUserMaxAccountRiskPct] = useState<number>(2.5);
  const [userMaxLeverageCeiling, setUserMaxLeverageCeiling] = useState<number>(25);
  const [userHoldingPreference, setUserHoldingPreference] = useState<'INTRADAY' | 'SWING'>('INTRADAY');

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. EXPORT MODAL STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. DERIVED USER CALCULATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const userNotional = userMargin * userLeverage;
  const userMarginPctOfBalance = accountBalance > 0 ? (userMargin / accountBalance) * 100 : 0;
  const userLiqBufferPct = userLeverage > 1 ? 100 / userLeverage : 100;

  const userTpPrice = isLong
    ? entryPrice * (1 + userTpPercent / 100)
    : entryPrice * (1 - userTpPercent / 100);

  const userSlPrice = isLong
    ? entryPrice * (1 - userSlPercent / 100)
    : entryPrice * (1 + userSlPercent / 100);

  const userLiqPrice = isLong
    ? entryPrice * (1 - userLiqBufferPct / 100)
    : entryPrice * (1 + userLiqBufferPct / 100);

  const userDollarProfit = userNotional * (userTpPercent / 100);
  const userDollarLoss = userNotional * (userSlPercent / 100);
  const userAccountGainPct = accountBalance > 0 ? (userDollarProfit / accountBalance) * 100 : 0;
  const userAccountLossPct = accountBalance > 0 ? (userDollarLoss / accountBalance) * 100 : 0;
  const userRR = userSlPercent > 0 ? userTpPercent / userSlPercent : 0;

  // Number of consecutive losses before 50% account drawdown
  const userConsecutiveLossesTo50Pct =
    userAccountLossPct > 0 ? Math.floor(50 / userAccountLossPct) : 999;

  // User Rule Audit Checks
  const userRuleRRPass = userRR >= userMinRR;
  const userRuleRiskPass = userAccountLossPct <= userMaxAccountRiskPct;
  const userRuleLeveragePass = userLeverage <= userMaxLeverageCeiling;
  const userRuleMarginPass = userMarginPctOfBalance <= 25; // max 25% margin commitment
  const userAllRulesPass =
    userRuleRRPass && userRuleRiskPass && userRuleLeveragePass && userRuleMarginPass;

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. PART 2: INDEPENDENT TECHNICAL ENGINE AUDIT & RECOMMENDATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const technicalAnalysis = useMemo(() => {
    // Determine 24H volatility/spread from asset data
    const highLowSpread =
      selectedCoin.currentPrice > 0
        ? Math.abs(selectedCoin.change24h) * 1.6 + 4.2
        : 5.0;
    const atr24h = Math.min(16, Math.max(3.0, highLowSpread));

    // Dynamic recommended leverage: Liquidation buffer must stay >= 1.6x ATR
    // So buffer >= atr * 1.6 => 100 / leverage >= atr * 1.6 => leverage <= 100 / (atr * 1.6)
    const rawSafeLeverage = Math.floor(100 / (atr24h * 1.5));
    const recLeverage = Math.min(15, Math.max(3, rawSafeLeverage));
    const recLiqBuffer = 100 / recLeverage;

    // Technical Stop Loss: set just beyond 1.1x ATR or structural support/resistance
    const recSlPercent = Number((atr24h * 0.45).toFixed(1)); // usually 1.8% - 3.5%
    const recSlPrice = isLong
      ? entryPrice * (1 - recSlPercent / 100)
      : entryPrice * (1 + recSlPercent / 100);

    // Technical Take Profit: 10% or key expansion target
    const recTpPercent = selectedCoin.feasibility10Percent === 'HIGH' ? 10.0 : 8.5;
    const recTpPrice = isLong
      ? entryPrice * (1 + recTpPercent / 100)
      : entryPrice * (1 - recTpPercent / 100);

    const recRR = recSlPercent > 0 ? recTpPercent / recSlPercent : 3.0;

    // Technical Margin: enforce institutional 1.5% portfolio risk rule
    // Risk $ = Balance * 1.5%
    // Risk $ = Notional * recSlPercent = Margin * recLeverage * recSlPercent
    // Margin = (Balance * 0.015) / (recLeverage * (recSlPercent / 100))
    const targetRiskDollar = accountBalance * 0.015;
    const calculatedMargin =
      recLeverage > 0 && recSlPercent > 0
        ? Math.round(targetRiskDollar / (recLeverage * (recSlPercent / 100)))
        : 100;
    const recMargin = Math.max(20, Math.min(Math.round(accountBalance * 0.15), calculatedMargin));
    const recNotional = recMargin * recLeverage;
    const recDollarProfit = recNotional * (recTpPercent / 100);
    const recDollarLoss = recNotional * (recSlPercent / 100);
    const recAccountLossPct = accountBalance > 0 ? (recDollarLoss / accountBalance) * 100 : 1.5;
    const recAccountGainPct = accountBalance > 0 ? (recDollarProfit / accountBalance) * 100 : 0;

    const recLiqPrice = isLong
      ? entryPrice * (1 - recLiqBuffer / 100)
      : entryPrice * (1 + recLiqBuffer / 100);

    // Probability & Feasibility Engine for 10% move
    let probabilityScore = 50;
    const dangerWarnings: string[] = [];
    const dangerWarningsMy: string[] = [];

    // Factor 1: 24h Volume
    if (selectedCoin.volume24h > 400000000) {
      probabilityScore += 18;
    } else if (selectedCoin.volume24h > 150000000) {
      probabilityScore += 10;
    } else {
      probabilityScore -= 8;
      dangerWarnings.push('Low 24H volume increases slippage during sudden directional moves.');
      dangerWarningsMy.push('၂၄ နာရီ Volume နည်းပါးသဖြင့် အလှုပ်အခတ်မြန်ချိန်တွင် Slippage များပြားနိုင်သည်။');
    }

    // Factor 2: Funding Rate
    if (isLong && selectedCoin.fundingRate > 0.02) {
      probabilityScore -= 12;
      dangerWarnings.push('High positive funding rate (+0.02%+) signals overcrowded longs prone to liquidation flushes.');
      dangerWarningsMy.push('Funding rate အလွန်မြင့်မားနေသဖြင့် Longs များအား ရှင်းထုတ်သည့် Flush ဖြစ်နိုင်ခြေရှိသည်။');
    } else if (!isLong && selectedCoin.fundingRate < -0.015) {
      probabilityScore -= 12;
      dangerWarnings.push('Negative funding rate makes shorting expensive and prone to short-squeeze spikes.');
      dangerWarningsMy.push('Negative funding rate ဖြစ်နေသဖြင့် Short Squeeze အထက်သို့ တွန်းကန်နိုင်ခြေရှိသည်။');
    } else {
      probabilityScore += 10;
    }

    // Factor 3: Multi-Timeframe Alignment
    if (selectedCoin.bias === direction) {
      probabilityScore += 15;
    } else if (selectedCoin.bias === 'WAIT') {
      probabilityScore -= 5;
    } else {
      probabilityScore -= 18;
      dangerWarnings.push(`Trade direction (${direction}) is counter to 4H trend bias (${selectedCoin.bias}).`);
      dangerWarningsMy.push(`ရွေးချယ်ထားသော Direction (${direction}) သည် 4H Trend Bias (${selectedCoin.bias}) နှင့် ဆန့်ကျင်ဘက်ဖြစ်နေသည်။`);
    }

    // Factor 4: User Leverage Danger Warning
    if (userLeverage > recLeverage * 1.8) {
      dangerWarnings.push(
        `Your chosen ${userLeverage}x leverage leaves only a ${userLiqBufferPct.toFixed(1)}% buffer, which sits inside the normal daily ATR (${atr24h.toFixed(1)}%). Normal market noise can liquidate you.`
      );
      dangerWarningsMy.push(
        `သင်ရွေးချယ်ထားသော ${userLeverage}x Leverage သည် ${userLiqBufferPct.toFixed(1)}% သာ ကွာဟပြီး နေ့စဉ်လှုပ်ရှားမှု (${atr24h.toFixed(1)}%) အတွင်း ကျရောက်နေသဖြင့် ပုံမှန် noise ကြောင့်ပင် Liquidation ဖြစ်နိုင်သည်။`
      );
    }

    probabilityScore = Math.min(94, Math.max(25, probabilityScore));

    const feasibilityVerdict: 'HIGH' | 'MEDIUM' | 'LOW' =
      probabilityScore >= 75 ? 'HIGH' : probabilityScore >= 55 ? 'MEDIUM' : 'LOW';

    const technicalReason =
      feasibilityVerdict === 'HIGH'
        ? `10% expansion is supported by strong volume ($${(selectedCoin.volume24h / 1e6).toFixed(0)}M) and clean ${selectedCoin.technical.timeframe4h.trend} alignment.`
        : feasibilityVerdict === 'MEDIUM'
        ? `10% move is possible but requires multi-hour consolidation or catalyst breakout through ${selectedCoin.technical.timeframe15m.keyLevel}.`
        : `10% move is statistically unfavorable right now due to counter-trend headwinds and volatility exhaustion.`;

    const technicalReasonMy =
      feasibilityVerdict === 'HIGH'
        ? `ခိုင်မာသော Volume ($${(selectedCoin.volume24h / 1e6).toFixed(0)}M) နှင့် ${selectedCoin.technical.timeframe4h.trend} လမ်းကြောင်းညီညွတ်မှုကြောင့် 10% ပန်းတိုင် ဖြစ်နိုင်ချေ မြင့်မားသည်။`
        : feasibilityVerdict === 'MEDIUM'
        ? `10% စျေးနှုန်းလှုပ်ရှားမှု ဖြစ်နိုင်သော်လည်း Key Level (${selectedCoin.technical.timeframe15m.keyLevel}) အား ဖောက်ထွက်ရန် အချိန်ယူရနိုင်သည်။`
        : `လက်ရှိ Trend ဆန့်ကျင်ဘက် အခြေအနေနှင့် Volatility လျော့ကျမှုကြောင့် 10% ရွေ့လျားမှု ဖြစ်နိုင်ချေ နည်းပါးသည်။`;

    return {
      atr24hPercent: atr24h,
      recommendedLeverage: recLeverage,
      recommendedMargin: recMargin,
      recommendedTpPercent: recTpPercent,
      recommendedSlPercent: recSlPercent,
      recommendedTpPrice: recTpPrice,
      recommendedSlPrice: recSlPrice,
      recommendedLiqPrice: recLiqPrice,
      liquidationBufferPercent: recLiqBuffer,
      riskRewardRatio: recRR,
      recommendedNotional: recNotional,
      recommendedDollarProfit: recDollarProfit,
      recommendedDollarLoss: recDollarLoss,
      recommendedAccountGainPct: recAccountGainPct,
      recommendedAccountLossPct: recAccountLossPct,
      feasibilityProbability: probabilityScore,
      feasibilityVerdict,
      technicalReason,
      technicalReasonMy,
      dangerWarnings,
      dangerWarningsMy,
    };
  }, [selectedCoin, direction, isLong, entryPrice, accountBalance, userLeverage, userLiqBufferPct]);

  const userFeeAndTarget = useMemo(() => {
    return calculateTradeFeesAndTargets(
      entryPrice,
      userNotional,
      userMargin,
      direction,
      technicalAnalysis.atr24hPercent
    );
  }, [entryPrice, userNotional, userMargin, direction, technicalAnalysis.atr24hPercent]);

  const techFeeAndTarget = useMemo(() => {
    return calculateTradeFeesAndTargets(
      entryPrice,
      technicalAnalysis.recommendedNotional,
      technicalAnalysis.recommendedMargin,
      direction,
      technicalAnalysis.atr24hPercent
    );
  }, [entryPrice, technicalAnalysis.recommendedNotional, technicalAnalysis.recommendedMargin, direction, technicalAnalysis.atr24hPercent]);

  // Handle syncing recommended technical settings into user plan
  const handleAdoptTechnical = () => {
    setUserLeverage(technicalAnalysis.recommendedLeverage);
    setUserMargin(technicalAnalysis.recommendedMargin);
    setUserTpPercent(technicalAnalysis.recommendedTpPercent);
    setUserSlPercent(technicalAnalysis.recommendedSlPercent);
  };

  // Handle Trade in Demo
  const handleSendToTrade = (useTechnical: boolean) => {
    if (!onGoToTrade) return;
    const preset: DemoTradePreset = {
      symbol: selectedCoin.symbol,
      side: direction,
      margin: useTechnical ? technicalAnalysis.recommendedMargin : userMargin,
      leverage: useTechnical ? technicalAnalysis.recommendedLeverage : userLeverage,
      entryPrice,
      tpPrice: useTechnical ? technicalAnalysis.recommendedTpPrice : userTpPrice,
      slPrice: useTechnical ? technicalAnalysis.recommendedSlPrice : userSlPrice,
      orderType: 'MARKET',
      source: useTechnical ? 'Technical Risk Engine' : 'User Risk Rules',
      timestamp: Date.now(),
    };
    onGoToTrade(preset);
  };

  // Text-formatted export report
  const [copiedTechnicalCard, setCopiedTechnicalCard] = useState<boolean>(false);

  const technicalTradeCardText = useMemo(() => {
    return `╔══════════════════════════════════════════╗
  ⚡ BINANCE FUTURES — TECHNICAL TRADE CARD
╚══════════════════════════════════════════╝
Pair: ${selectedCoin.symbol}/USDT (Rank #${selectedCoin.rank})
Direction: ${direction} ${isLong ? '🟢 (LONG)' : '🔴 (SHORT)'}
Entry Price: $${entryPrice >= 1 ? entryPrice.toFixed(2) : entryPrice.toFixed(4)}

[TARGETS & INVALIDATION]
Take Profit (+${technicalAnalysis.recommendedTpPercent.toFixed(1)}%): $${technicalAnalysis.recommendedTpPrice >= 1 ? technicalAnalysis.recommendedTpPrice.toFixed(2) : technicalAnalysis.recommendedTpPrice.toFixed(4)}
Stop Loss (-${technicalAnalysis.recommendedSlPercent.toFixed(1)}%): $${technicalAnalysis.recommendedSlPrice >= 1 ? technicalAnalysis.recommendedSlPrice.toFixed(2) : technicalAnalysis.recommendedSlPrice.toFixed(4)}
Risk-to-Reward: 1 : ${technicalAnalysis.riskRewardRatio.toFixed(2)}

[CAPITAL PRESERVATION METRICS]
Wallet Balance: $${accountBalance.toLocaleString()} USD
Preservation Margin: $${technicalAnalysis.recommendedMargin} USD (${((technicalAnalysis.recommendedMargin / accountBalance) * 100).toFixed(1)}% of balance)
Noise-Immune Leverage: ${technicalAnalysis.recommendedLeverage}×
Notional Size: $${(technicalAnalysis.recommendedMargin * technicalAnalysis.recommendedLeverage).toLocaleString()} USD
Projected Profit at TP: +$${technicalAnalysis.recommendedDollarProfit.toFixed(1)} (+${technicalAnalysis.recommendedAccountGainPct.toFixed(2)}% Acct Growth)
Estimated Fees: $${techFeeAndTarget.totalFeeUsd.toFixed(2)}
Max Risk at SL: -$${technicalAnalysis.recommendedDollarLoss.toFixed(1)} (-${technicalAnalysis.recommendedAccountLossPct.toFixed(2)}% Max Drawdown)
Liquidation Buffer: ±${technicalAnalysis.liquidationBufferPercent.toFixed(1)}% (Outside 24h ATR)

[FEES & EXIT PLAN]
• ${techFeeAndTarget.optimalExitRecommendation}

[10% MOVEMENT FEASIBILITY]
Verdict: ${technicalAnalysis.feasibilityVerdict} (${technicalAnalysis.feasibilityProbability}% Score)
Reason: ${technicalAnalysis.technicalReason}
══════════════════════════════════════════`;
  }, [selectedCoin, direction, isLong, entryPrice, accountBalance, technicalAnalysis]);

  const handleCopyTechnicalTradeCard = () => {
    navigator.clipboard.writeText(technicalTradeCardText);
    setCopiedTechnicalCard(true);
    setTimeout(() => setCopiedTechnicalCard(false), 2500);
  };

  const simulationReport = useMemo(() => {
    const timestamp = new Date().toLocaleString();
    return `╔════════════════════════════════════════════════════════════════════╗
  ⚡ DUAL-TRACK RISK MANAGEMENT & 10% MOVEMENT COMPARATIVE AUDIT
╚════════════════════════════════════════════════════════════════════╝
Asset / Contract     : ${selectedCoin.symbol}/USDT (Rank #${selectedCoin.rank})
Direction            : ${direction} ${isLong ? '🟢 (LONG)' : '🔴 (SHORT)'}
Live Entry Price     : $${entryPrice >= 1 ? entryPrice.toFixed(2) : entryPrice.toFixed(4)}
User Account Balance : $${accountBalance.toLocaleString()} USD
24H Est. ATR Spread  : ±${technicalAnalysis.atr24hPercent.toFixed(2)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: TRADER'S SELF-DEFINED RULES & MANUAL PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Margin Setting     : $${userMargin} USD (${userMarginPctOfBalance.toFixed(1)}% of total account)
• Leverage Setting   : ${userLeverage}x (Notional: $${userNotional.toLocaleString()} USD)
• Take-Profit Target : +${userTpPercent.toFixed(1)}% ($${userTpPrice >= 1 ? userTpPrice.toFixed(2) : userTpPrice.toFixed(4)})
• Stop-Loss Setting  : -${userSlPercent.toFixed(1)}% ($${userSlPrice >= 1 ? userSlPrice.toFixed(2) : userSlPrice.toFixed(4)})
• Risk/Reward Ratio  : 1 : ${userRR.toFixed(2)}
• Liquidation Price  : $${userLiqPrice >= 1 ? userLiqPrice.toFixed(2) : userLiqPrice.toFixed(4)} (±${userLiqBufferPct.toFixed(2)}% buffer)
• Estimated Fees     : $${userFeeAndTarget.totalFeeUsd.toFixed(2)} (${userFeeAndTarget.feePercentageOfMargin.toFixed(1)}% of margin)
• Dollar Profit at TP: +$${userDollarProfit.toFixed(2)} (+${userAccountGainPct.toFixed(2)}% Account Gain)
• Dollar Risk at SL  : -$${userDollarLoss.toFixed(2)} (-${userAccountLossPct.toFixed(2)}% Portfolio Drawdown)
• Exit Plan          : ${userFeeAndTarget.optimalExitRecommendation}
• User Rule Audit    : ${userAllRulesPass ? 'PASS (Qualified under your rules)' : 'FAIL (Violates personal risk limits)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: AI / TECHNICAL RISK ENGINE RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Recommended Margin : $${technicalAnalysis.recommendedMargin} USD (Institutional 1.5% Rule)
• Recommended Lev    : ${technicalAnalysis.recommendedLeverage}x (Buffers normal daily noise)
• Technical TP       : +${technicalAnalysis.recommendedTpPercent.toFixed(1)}% ($${technicalAnalysis.recommendedTpPrice >= 1 ? technicalAnalysis.recommendedTpPrice.toFixed(2) : technicalAnalysis.recommendedTpPrice.toFixed(4)})
• Technical SL       : -${technicalAnalysis.recommendedSlPercent.toFixed(1)}% ($${technicalAnalysis.recommendedSlPrice >= 1 ? technicalAnalysis.recommendedSlPrice.toFixed(2) : technicalAnalysis.recommendedSlPrice.toFixed(4)})
• Technical R:R      : 1 : ${technicalAnalysis.riskRewardRatio.toFixed(2)} (Asymmetric Edge)
• Liquidation Price  : $${technicalAnalysis.recommendedLiqPrice >= 1 ? technicalAnalysis.recommendedLiqPrice.toFixed(2) : technicalAnalysis.recommendedLiqPrice.toFixed(4)} (±${technicalAnalysis.liquidationBufferPercent.toFixed(2)}% buffer)
• Estimated Fees     : $${techFeeAndTarget.totalFeeUsd.toFixed(2)}
• Projected at TP    : +$${technicalAnalysis.recommendedDollarProfit.toFixed(2)} (+${technicalAnalysis.recommendedAccountGainPct.toFixed(2)}% Account Gain)
• Strict Risk at SL  : -$${technicalAnalysis.recommendedDollarLoss.toFixed(2)} (-${technicalAnalysis.recommendedAccountLossPct.toFixed(2)}% Account Loss)
• Exit Strategy      : ${techFeeAndTarget.optimalExitRecommendation}
• 10% Move Feasib.   : ${technicalAnalysis.feasibilityVerdict} (${technicalAnalysis.feasibilityProbability}% Probability Index)
• Technical Reason   : ${technicalAnalysis.technicalReason}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL SAFETY NOTICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${technicalAnalysis.dangerWarnings.map((w) => `• ${w}`).join('\n')}

Generated via Binance USDⓈ-M Terminal • ${timestamp}
════════════════════════════════════════════════════════════════════`;
  }, [
    selectedCoin,
    direction,
    isLong,
    entryPrice,
    accountBalance,
    userMargin,
    userMarginPctOfBalance,
    userLeverage,
    userNotional,
    userTpPercent,
    userSlPercent,
    userTpPrice,
    userSlPrice,
    userLiqPrice,
    userLiqBufferPct,
    userRR,
    userDollarProfit,
    userDollarLoss,
    userAccountGainPct,
    userAccountLossPct,
    userAllRulesPass,
    technicalAnalysis,
    userFeeAndTarget,
    techFeeAndTarget,
  ]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(simulationReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([simulationReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCoin.symbol}_dual_track_risk_report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="dual-track-risk-management"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6"
    >
      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION HEADER & ASSET CONTROLS
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {lang === 'my'
                  ? 'Dual-Track Risk Management & 10% Movement Analyzer'
                  : 'Dual-Track Risk Management & 10% Movement Analyzer'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                USER RULES VS. TECHNICAL AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'my'
                ? 'သင်သတ်မှတ်ထားသော စည်းကမ်းချက်များနှင့် စနစ်၏ လွတ်လပ်သော နည်းပညာပိုင်းဆိုင်ရာ တွက်ချက်မှုများကို ဘေးချင်းယှဉ် နှိုင်းယှဉ်ပါ'
                : 'Compare your custom risk rules side-by-side with independent technical volatility, ATR buffer, and 10% probability'}
            </p>
          </div>
        </div>

        {/* Coin Selector & Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">{lang === 'my' ? 'ရွေးချယ်ထားသော Coin:' : 'Asset:'}</span>
            <select
              id="risk-sim-coin-select"
              value={selectedCoin.symbol}
              onChange={(e) => {
                const found = coins.find((c) => c.symbol === e.target.value);
                if (found) onSelectCoin(found);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              {coins.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  #{c.rank} {c.symbol} (${c.currentPrice >= 1 ? c.currentPrice.toFixed(2) : c.currentPrice.toFixed(4)})
                </option>
              ))}
            </select>
          </div>

          <button
            id="export-risk-report-btn"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export full comparison report"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'Report ထုတ်ယူမည်' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          GLOBAL CONTROLLER 1: USER ACCOUNT BALANCE & PORTFOLIO RISK HEALTH BAR
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Account Balance Input with Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>{lang === 'my' ? 'သင်၏ စုစုပေါင်း Futures Wallet Balance' : 'Your Total Futures Account Balance'}</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm font-bold">$</span>
                <input
                  id="user-account-balance-input"
                  type="number"
                  min={50}
                  max={1000000}
                  step={50}
                  value={accountBalance}
                  onChange={(e) => handleBalanceUpdate(Number(e.target.value) || 0)}
                  className="pl-7 pr-3 py-1.5 w-36 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-1">
                {[500, 1000, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    id={`bal-preset-${amt}`}
                    onClick={() => handleBalanceUpdate(amt)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                      accountBalance === amt
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trade Direction Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-semibold">{lang === 'my' ? 'Direction:' : 'Direction:'}</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                id="dual-dir-long-btn"
                onClick={() => setDirection('LONG')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                  isLong ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>LONG</span>
              </button>
              <button
                id="dual-dir-short-btn"
                onClick={() => setDirection('SHORT')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                  !isLong ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>SHORT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Portfolio Health Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
          {/* Metric 1: Margin Commitment % */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Margin Allocation:</div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-bold text-white">${userMargin}</span>
              <span
                className={`font-bold ${
                  userMarginPctOfBalance <= 15
                    ? 'text-emerald-400'
                    : userMarginPctOfBalance <= 30
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {userMarginPctOfBalance.toFixed(1)}% of Balance
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, userMarginPctOfBalance)}%` }}
                className={`h-full ${
                  userMarginPctOfBalance <= 15
                    ? 'bg-emerald-500'
                    : userMarginPctOfBalance <= 30
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>
          </div>

          {/* Metric 2: Portfolio Risk at Stop Loss */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Actual Risk at SL:</div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-bold text-rose-400">-${userDollarLoss.toFixed(2)}</span>
              <span
                className={`font-bold ${
                  userAccountLossPct <= 2.0
                    ? 'text-emerald-400'
                    : userAccountLossPct <= 5.0
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                -{userAccountLossPct.toFixed(2)}% Equity
              </span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1">
              {userAccountLossPct <= 2.0
                ? '✔ Meets Institutional 2% Rule'
                : userAccountLossPct <= 5.0
                ? '⚠️ Moderate Drawdown'
                : '🚨 Severe Account Ruin Risk'}
            </div>
          </div>

          {/* Metric 3: Target Account Growth */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Target Growth at TP:</div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-bold text-emerald-400">+${userDollarProfit.toFixed(2)}</span>
              <span className="font-bold text-emerald-300">+{userAccountGainPct.toFixed(2)}%</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1">
              R:R Expectancy: 1 : {userRR.toFixed(2)}
            </div>
          </div>

          {/* Metric 4: Consecutive Losses to 50% Drawdown */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Consecutive Loss Buffer:</div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-bold text-amber-400">{userConsecutiveLossesTo50Pct} losses</span>
              <span className="text-[10px] text-slate-400">to -50% DD</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1">
              {userConsecutiveLossesTo50Pct >= 20
                ? '★ High Capital Longevity'
                : userConsecutiveLossesTo50Pct >= 10
                ? 'Moderate cushion'
                : '⚠️ Fast ruin danger'}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DUAL-TRACK SIDE-BY-SIDE PANELS
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════════════════════════════════
            PART 1: USER DEFINED RULES & SETTINGS (LEFT SIDE)
            ═══════════════════════════════════════════════════════════════════════════ */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-300 dark:border-slate-800 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                  <span>{lang === 'my' ? 'အပိုင်း (၁) - သင်သတ်မှတ်ထားသော စည်းမျဉ်းများ (ငါ့စည်းမျဉ်း)' : 'Part 1: Your Custom Rules & Limits (My Rules)'}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'my'
                    ? 'သင်ကိုယ်တိုင် သတ်မှတ်ထားသော Margin, Leverage, TP & SL ဘောင်များ'
                    : 'Configured strictly according to your manual inputs and risk tolerances'}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                userAllRulesPass
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {userAllRulesPass ? '✔ Rules Satisfied' : '⚠️ Limits Exceeded'}
            </span>
          </div>

          {/* User Leverage & Margin Controls */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>1. Your Margin & Leverage Limits</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                Notional: ${userNotional.toLocaleString()}
              </span>
            </div>

            {/* Margin Slider & Input */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Margin Collateral:</span>
                <span className="font-mono font-bold text-amber-500">${userMargin} USD</span>
              </div>
              <input
                id="user-margin-slider"
                type="range"
                min={20}
                max={Math.min(2000, accountBalance)}
                step={10}
                value={userMargin}
                onChange={(e) => setUserMargin(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min: $20</span>
                <span>{userMarginPctOfBalance.toFixed(1)}% of your wallet</span>
                <span>Max: ${Math.min(2000, accountBalance)}</span>
              </div>
            </div>

            {/* Leverage Slider */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Leverage Multiplier:</span>
                <span className="font-mono font-bold text-indigo-500">{userLeverage}×</span>
              </div>
              <input
                id="user-leverage-slider"
                type="range"
                min={2}
                max={50}
                step={1}
                value={userLeverage}
                onChange={(e) => setUserLeverage(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>2x (Safe)</span>
                <span className="text-rose-400 font-bold">
                  Liq Buffer: ±{userLiqBufferPct.toFixed(2)}%
                </span>
                <span>50x (Ultra Risk)</span>
              </div>
            </div>
          </div>

          {/* User TP & SL Controls */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>2. Your TP & SL Targets</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                R:R Ratio 1 : {userRR.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* TP Control */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-500">
                  <span>Take Profit (TP)</span>
                  <span className="font-mono font-bold">+{userTpPercent.toFixed(1)}%</span>
                </div>
                <input
                  id="user-tp-slider"
                  type="range"
                  min={2}
                  max={25}
                  step={0.5}
                  value={userTpPercent}
                  onChange={(e) => setUserTpPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>Target: ${userTpPrice >= 1 ? userTpPrice.toFixed(2) : userTpPrice.toFixed(4)}</span>
                  <span className="text-emerald-400 font-bold">+${userDollarProfit.toFixed(1)}</span>
                </div>
              </div>

              {/* SL Control */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-500/30 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-rose-500">
                  <span>Stop Loss (SL)</span>
                  <span className="font-mono font-bold">-{userSlPercent.toFixed(1)}%</span>
                </div>
                <input
                  id="user-sl-slider"
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={userSlPercent}
                  onChange={(e) => setUserSlPercent(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>Price: ${userSlPrice >= 1 ? userSlPrice.toFixed(2) : userSlPrice.toFixed(4)}</span>
                  <span className="text-rose-400 font-bold">-${userDollarLoss.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Custom 10% Movement Opportunity Rules Checklist */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span>3. 10% Movement Check (Your Personal Rules)</span>
              </span>
              <span
                className={`font-mono text-[10px] font-black px-2 py-0.5 rounded ${
                  userAllRulesPass ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {userAllRulesPass ? 'PASSED' : 'DISQUALIFIED'}
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Rule 1: Min R:R Ratio &ge; {userMinRR.toFixed(1)}:</span>
                <span className={userRuleRRPass ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {userRuleRRPass ? `✔ PASS (1 : ${userRR.toFixed(2)})` : `✖ FAIL (1 : ${userRR.toFixed(2)})`}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Rule 2: Max Account Risk &le; {userMaxAccountRiskPct}%:</span>
                <span className={userRuleRiskPass ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {userRuleRiskPass
                    ? `✔ PASS (${userAccountLossPct.toFixed(2)}% risk)`
                    : `✖ FAIL (${userAccountLossPct.toFixed(2)}% exceeds ${userMaxAccountRiskPct}%)`}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-500">Rule 3: Leverage &le; {userMaxLeverageCeiling}x limit:</span>
                <span className={userRuleLeveragePass ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {userRuleLeveragePass ? `✔ PASS (${userLeverage}x)` : `✖ FAIL (${userLeverage}x > ${userMaxLeverageCeiling}x)`}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="trade-user-plan-btn"
                onClick={() => handleSendToTrade(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lang === 'my' ? 'သင်၏ Setup ဖြင့် စမ်းသပ်မည်' : 'Execute Your Custom Plan'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            PART 2: AI / TECHNICAL RISK ENGINE RECOMMENDATIONS (RIGHT SIDE)
            ═══════════════════════════════════════════════════════════════════════════ */}
        <div className="p-5 rounded-2xl bg-indigo-950/20 dark:bg-indigo-950/40 border-2 border-indigo-500/40 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-indigo-500/30">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                  <span>{lang === 'my' ? 'အပိုင်း (၂) - နည်းပညာပိုင်းဆိုင်ရာ သုံးသပ်အကြံပြုချက် (မင်းရွေးချယ်မှု)' : 'Part 2: Technical Risk Engine Analysis (AI Choice)'}</span>
                </h3>
                <p className="text-[11px] text-indigo-300/80">
                  {lang === 'my'
                    ? 'ATR Volatility, Market Noise နှင့် Capital Preservation ပေါ် အခြေခံသော လွတ်လပ်သည့် အကြံပြုချက်'
                    : 'Independent volatility, ATR noise absorption, and 1.5% capital preservation audit'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="copy-technical-card-top-btn"
                onClick={handleCopyTechnicalTradeCard}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Copy ready-to-share technical trade card"
              >
                {copiedTechnicalCard ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>
                  {copiedTechnicalCard
                    ? lang === 'my'
                      ? 'ကူးယူပြီး!'
                      : 'Card Copied!'
                    : lang === 'my'
                    ? 'Trade Card ကူးယူမည်'
                    : 'Copy Trade Card'}
                </span>
              </button>

              <button
                id="adopt-technical-plan-btn"
                onClick={handleAdoptTechnical}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-600/30"
                title="Copy technical recommendation into your plan"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'my' ? 'အကြံပြုချက် အသုံးပြုမည်' : 'Adopt Technical'}</span>
              </button>
            </div>
          </div>

          {/* Technical Leverage & Margin Recommendations */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center justify-between">
              <span>1. Recommended Margin & Leverage</span>
              <span className="font-mono text-amber-400 font-bold">
                24H ATR Spread: ±{technicalAnalysis.atr24hPercent.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              {/* Recommended Margin */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-indigo-500/30 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Preservation Margin:</div>
                <div className="text-lg font-black text-white">${technicalAnalysis.recommendedMargin} USD</div>
                <div className="text-[10px] text-emerald-400 font-sans">
                  Limits loss strictly to 1.5% of ${accountBalance.toLocaleString()} account
                </div>
              </div>

              {/* Recommended Leverage */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-indigo-500/30 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Noise-Immune Leverage:</div>
                <div className="text-lg font-black text-indigo-400">{technicalAnalysis.recommendedLeverage}×</div>
                <div className="text-[10px] text-slate-300 font-sans">
                  Liquidation Buffer: ±{technicalAnalysis.liquidationBufferPercent.toFixed(1)}% (outside ATR)
                </div>
              </div>
            </div>

            {/* Technical explanation callout */}
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-bold">Technical Leverage Logic: </span>
              {userLeverage > technicalAnalysis.recommendedLeverage ? (
                <span>
                  {lang === 'my'
                    ? `သင်ရွေးချယ်ထားသော ${userLeverage}x Leverage သည် နေ့စဉ်ပုံမှန်လှုပ်ရှားမှု (${technicalAnalysis.atr24hPercent.toFixed(1)}%) အတွင်း ကျရောက်နေသဖြင့် အကြံပြုထားသော ${technicalAnalysis.recommendedLeverage}x သို့ လျှော့ချခြင်းက Liquidation Buffer ကို ${technicalAnalysis.liquidationBufferPercent.toFixed(1)}% အထိ ကျယ်ပြန့်စေပါသည်။`
                    : `Your ${userLeverage}x leverage is prone to noise liquidation. The engine recommends ${technicalAnalysis.recommendedLeverage}x to keep your liquidation barrier (±${technicalAnalysis.liquidationBufferPercent.toFixed(1)}%) safely outside normal 24h fluctuations.`}
                </span>
              ) : (
                <span>
                  {lang === 'my'
                    ? `သင်၏ ${userLeverage}x Leverage သည် စိတ်ချရသော အကွာအဝေးအတွင်း ရှိနေပါသည်။`
                    : `Your ${userLeverage}x leverage aligns well with current volatility and maintains an adequate liquidation safety cushion.`}
                </span>
              )}
            </div>
          </div>

          {/* Technical TP & SL Targets */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center justify-between">
              <span>2. Technically Appropriate TP & SL</span>
              <span className="font-mono text-emerald-400 font-bold">
                Edge R:R 1 : {technicalAnalysis.riskRewardRatio.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Structural Take-Profit:</div>
                <div className="text-base font-black text-emerald-400">
                  +{technicalAnalysis.recommendedTpPercent.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-300">
                  ${technicalAnalysis.recommendedTpPrice >= 1 ? technicalAnalysis.recommendedTpPrice.toFixed(2) : technicalAnalysis.recommendedTpPrice.toFixed(4)}
                </div>
                <div className="text-[10px] text-emerald-400 font-sans">
                  Est. +${technicalAnalysis.recommendedDollarProfit.toFixed(1)} (+{technicalAnalysis.recommendedAccountGainPct.toFixed(1)}% Acct)
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-rose-500/40 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Invalidation Stop-Loss:</div>
                <div className="text-base font-black text-rose-400">
                  -{technicalAnalysis.recommendedSlPercent.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-300">
                  ${technicalAnalysis.recommendedSlPrice >= 1 ? technicalAnalysis.recommendedSlPrice.toFixed(2) : technicalAnalysis.recommendedSlPrice.toFixed(4)}
                </div>
                <div className="text-[10px] text-rose-400 font-sans">
                  Est. -${technicalAnalysis.recommendedDollarLoss.toFixed(1)} (-{technicalAnalysis.recommendedAccountLossPct.toFixed(1)}% Acct)
                </div>
              </div>
            </div>
          </div>

          {/* Independent 10% Movement Opportunity Technical Analysis */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-indigo-500/30 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. 10% Movement Check (Technical Engine Audit)</span>
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    technicalAnalysis.feasibilityVerdict === 'HIGH'
                      ? 'bg-emerald-500 text-slate-950'
                      : technicalAnalysis.feasibilityVerdict === 'MEDIUM'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {technicalAnalysis.feasibilityVerdict} FEASIBILITY
                </span>
                <span className="text-indigo-300 font-bold">
                  ({technicalAnalysis.feasibilityProbability}% Score)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {lang === 'my' ? technicalAnalysis.technicalReasonMy : technicalAnalysis.technicalReason}
            </p>

            {/* Technical Danger Warnings */}
            {technicalAnalysis.dangerWarnings.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-800">
                {(lang === 'my' ? technicalAnalysis.dangerWarningsMy : technicalAnalysis.dangerWarnings).map(
                  (warn, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[10px] text-amber-300">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                      <span>{warn}</span>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                id="copy-technical-card-bottom-btn"
                onClick={handleCopyTechnicalTradeCard}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Copy ready-to-share technical trade card"
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
                id="trade-technical-plan-btn"
                onClick={() => handleSendToTrade(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'my' ? 'နည်းပညာ အကြံပြုချက်ဖြင့် စမ်းသပ်မည်' : 'Execute Technical Recommendation'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 3: SIDE-BY-SIDE COMPARATIVE MATRIX TABLE
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>
              {lang === 'my'
                ? 'မဆုံးဖြတ်မီ ဘေးချင်းယှဉ် နှိုင်းယှဉ်စစ်ဆေးမှု ဇယား (Decision Comparison Matrix)'
                : 'Side-by-Side Decision Comparison Matrix'}
            </span>
          </h3>
          <span className="text-[11px] text-slate-500">
            {lang === 'my' ? 'သင်၏ စည်းမျဉ်း vs စနစ်၏ နည်းပညာ အကြံပြုချက်' : 'Your Plan vs. Technical Recommendation'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3 font-semibold">Parameter / Risk Metric</th>
                <th className="py-2 px-3 font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900/80 rounded-l-lg">
                  1. Your Custom Setup
                </th>
                <th className="py-2 px-3 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-r-lg">
                  2. Technical Engine Recommendation
                </th>
                <th className="py-2 px-3 font-semibold">Safety & Edge Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Leverage */}
              <tr>
                <td className="py-2.5 px-3 text-slate-500 font-sans font-medium">Leverage Multiplier</td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/40">
                  {userLeverage}×
                </td>
                <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                  {technicalAnalysis.recommendedLeverage}×
                </td>
                <td className="py-2.5 px-3 text-[11px] font-sans">
                  {userLeverage > technicalAnalysis.recommendedLeverage ? (
                    <span className="text-amber-500 font-semibold">
                      ⚠️ User leverage is aggressive ({userLeverage}x vs safe {technicalAnalysis.recommendedLeverage}x)
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-semibold">
                      ✔ User leverage aligns with safe noise boundary
                    </span>
                  )}
                </td>
              </tr>

              {/* Margin */}
              <tr>
                <td className="py-2.5 px-3 text-slate-500 font-sans font-medium">Margin Allocation</td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/40">
                  ${userMargin} ({userMarginPctOfBalance.toFixed(1)}%)
                </td>
                <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                  ${technicalAnalysis.recommendedMargin} (
                  {((technicalAnalysis.recommendedMargin / accountBalance) * 100).toFixed(1)}%)
                </td>
                <td className="py-2.5 px-3 text-[11px] font-sans">
                  {userMarginPctOfBalance > 25 ? (
                    <span className="text-rose-500 font-semibold">
                      🚨 Over-allocated (&gt;{userMarginPctOfBalance.toFixed(0)}% of account)
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-semibold">✔ Safe capital allocation</span>
                  )}
                </td>
              </tr>

              {/* Stop Loss Distance */}
              <tr>
                <td className="py-2.5 px-3 text-slate-500 font-sans font-medium">Stop-Loss Distance</td>
                <td className="py-2.5 px-3 font-bold text-rose-500 bg-slate-50 dark:bg-slate-900/40">
                  -{userSlPercent.toFixed(1)}% (${userSlPrice >= 1 ? userSlPrice.toFixed(2) : userSlPrice.toFixed(4)})
                </td>
                <td className="py-2.5 px-3 font-bold text-rose-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                  -{technicalAnalysis.recommendedSlPercent.toFixed(1)}% ($
                  {technicalAnalysis.recommendedSlPrice >= 1 ? technicalAnalysis.recommendedSlPrice.toFixed(2) : technicalAnalysis.recommendedSlPrice.toFixed(4)})
                </td>
                <td className="py-2.5 px-3 text-[11px] font-sans">
                  {userSlPercent < technicalAnalysis.recommendedSlPercent ? (
                    <span className="text-amber-500 font-semibold">
                      ⚠️ User SL may be too tight for coin ATR ({userSlPercent}% vs {technicalAnalysis.recommendedSlPercent}%)
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-semibold">✔ Adequate breathing room</span>
                  )}
                </td>
              </tr>

              {/* Take Profit Target */}
              <tr>
                <td className="py-2.5 px-3 text-slate-500 font-sans font-medium">Take-Profit Target</td>
                <td className="py-2.5 px-3 font-bold text-emerald-500 bg-slate-50 dark:bg-slate-900/40">
                  +{userTpPercent.toFixed(1)}% (${userTpPrice >= 1 ? userTpPrice.toFixed(2) : userTpPrice.toFixed(4)})
                </td>
                <td className="py-2.5 px-3 font-bold text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                  +{technicalAnalysis.recommendedTpPercent.toFixed(1)}% ($
                  {technicalAnalysis.recommendedTpPrice >= 1 ? technicalAnalysis.recommendedTpPrice.toFixed(2) : technicalAnalysis.recommendedTpPrice.toFixed(4)})
                </td>
                <td className="py-2.5 px-3 text-[11px] font-sans">
                  <span className="text-slate-600 dark:text-slate-300">
                    Both target realistic momentum expansion
                  </span>
                </td>
              </tr>

              {/* R:R Ratio */}
              <tr>
                <td className="py-2.5 px-3 text-slate-500 font-sans font-medium">Risk/Reward Asymmetry</td>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/40">
                  1 : {userRR.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                  1 : {technicalAnalysis.riskRewardRatio.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-[11px] font-sans">
                  {userRR >= 2.0 ? (
                    <span className="text-emerald-500 font-semibold">✔ Favorable R:R profile</span>
                  ) : (
                    <span className="text-rose-500 font-semibold">⚠️ Sub-optimal R:R (&lt; 2.0)</span>
                  )}
                </td>
              </tr>

              {/* Portfolio Risk at SL */}
              <tr>
                <td className="py-2.5 px-3 text-slate-500 font-sans font-medium">Portfolio Risk at SL</td>
                <td className="py-2.5 px-3 font-bold text-rose-500 bg-slate-50 dark:bg-slate-900/40">
                  -${userDollarLoss.toFixed(2)} (-{userAccountLossPct.toFixed(2)}% of wallet)
                </td>
                <td className="py-2.5 px-3 font-bold text-rose-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                  -${technicalAnalysis.recommendedDollarLoss.toFixed(2)} (-{technicalAnalysis.recommendedAccountLossPct.toFixed(2)}% of wallet)
                </td>
                <td className="py-2.5 px-3 text-[11px] font-sans">
                  {userAccountLossPct > 3.0 ? (
                    <span className="text-rose-500 font-semibold">
                      🚨 High drawdown risk: 1 loss damages {userAccountLossPct.toFixed(1)}% of total capital
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-semibold">
                      ✔ Institutional capital preservation compliant
                    </span>
                  )}
                </td>
              </tr>

              {/* 10% Movement Evaluation */}
              <tr>
                <td className="py-2.5 px-3 text-slate-500 font-sans font-medium">10% Movement Feasibility</td>
                <td className="py-2.5 px-3 font-bold bg-slate-50 dark:bg-slate-900/40">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      userAllRulesPass ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {userAllRulesPass ? 'USER APPROVED' : 'LIMITS BREACHED'}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-bold bg-indigo-50/50 dark:bg-indigo-950/20">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      technicalAnalysis.feasibilityVerdict === 'HIGH'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : technicalAnalysis.feasibilityVerdict === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {technicalAnalysis.feasibilityVerdict} ({technicalAnalysis.feasibilityProbability}%)
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[11px] font-sans text-slate-500">
                  {technicalAnalysis.feasibilityProbability >= 70
                    ? 'Strong technical momentum supports 10% move'
                    : 'Caution: Momentum requires consolidation'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          EXPORT MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      {isExportModalOpen && (
        <div
          id="dual-track-export-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsExportModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'my'
                      ? 'Dual-Track Risk & Feasibility Audit Report'
                      : 'Dual-Track Risk & Feasibility Audit Report'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'my'
                      ? 'ကုန်သည်များအကြား Discord / Telegram သို့မဟုတ် ကိုယ်ပိုင် မှတ်တမ်းတွင် မျှဝေနိုင်သည်'
                      : 'Text-formatted comparison report formatted for Telegram, Discord or trading journals'}
                  </p>
                </div>
              </div>

              <button
                id="close-dual-export-modal-btn"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <textarea
                readOnly
                value={simulationReport}
                rows={15}
                className="w-full font-mono text-[11px] p-3 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 focus:outline-none select-all leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                {lang === 'my' ? 'Ctrl+A ဖြင့် အားလုံးရွေးချယ်ပြီး Copy ပြုလုပ်နိုင်ပါသည်' : 'Ready to paste directly into community channels'}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="download-dual-txt-report-btn"
                  onClick={handleDownloadReport}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>

                <button
                  id="copy-dual-text-report-btn"
                  onClick={handleCopyReport}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (lang === 'my' ? 'ကူးယူပြီးပါပြီ!' : 'Copied!') : (lang === 'my' ? 'Report အား Copy ယူမည်' : 'Copy to Clipboard')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
