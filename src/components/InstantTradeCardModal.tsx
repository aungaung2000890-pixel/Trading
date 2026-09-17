import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calculator,
  Sliders,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { LiveTickerItem, DemoTradePreset } from '../types';
import { openBinanceFutures } from '../utils/binanceLink';
import {
  calculateTechnicalIndicators,
  buildUserRiskTradePlan,
  buildProTechnicalTradePlan,
  calculateTradeFeesAndTargets,
  computeDetailedSignalFeesAndExit,
} from '../utils/technicalAnalysis';
import { computeDualTrackRisk } from '../utils/dualTrackRisk';
import { DualTrackWalletBanner } from './DualTrackWalletBanner';

interface InstantTradeCardModalProps {
  ticker: LiveTickerItem;
  margin: number;
  leverage: number;
  onClose: () => void;
  onTradeInDemo?: (symbol: string, side: 'LONG' | 'SHORT') => void;
  onGoToTradePreset?: (preset: DemoTradePreset) => void;
  lang: 'my' | 'en';
  walletBalance?: number;
  onWalletBalanceChange?: (bal: number) => void;
  onOpenInAppTerminal?: (symbol: string, side: 'LONG' | 'SHORT', preset?: any) => void;
}

export const InstantTradeCardModal: React.FC<InstantTradeCardModalProps> = ({
  ticker,
  margin: initialMargin,
  leverage: initialLeverage,
  onClose,
  onTradeInDemo,
  onGoToTradePreset,
  lang,
  walletBalance: externalWalletBalance,
  onWalletBalanceChange,
  onOpenInAppTerminal,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedTechnicalCard, setCopiedTechnicalCard] = useState(false);
  const [activeTab, setActiveTab] = useState<'combined' | 'rules' | 'technical'>('combined');
  const [localMargin, setLocalMargin] = useState<number>(initialMargin || 50);
  const [localLeverage, setLocalLeverage] = useState<number>(initialLeverage || 20);

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

  const isLong = ticker.bias === 'LONG';
  const direction: 'LONG' | 'SHORT' = isLong ? 'LONG' : 'SHORT';
  const entry = ticker.lastPrice;

  // Disciplined 2% SL rule for User Risk
  const slPercent = 2.0;
  const sl = isLong ? entry * (1 - slPercent / 100) : entry * (1 + slPercent / 100);
  const tp1 = isLong ? entry * 1.03 : entry * 0.97;
  const tp2 = isLong ? entry * 1.06 : entry * 0.94;
  const tp3 = isLong ? entry * 1.10 : entry * 0.90; // 10% move potential

  const positionSize = localMargin * localLeverage;
  const slLoss = -(positionSize * (slPercent / 100));
  const tp1Profit = positionSize * 0.03;
  const tp2Profit = positionSize * 0.06;
  const tp3Profit = positionSize * 0.10;
  const rr = 10 / slPercent; // 5.00
  const liquidationPrice = isLong
    ? entry * (1 - 1 / localLeverage)
    : entry * (1 + 1 / localLeverage);

  // Technical Indicators Engine
  const techData = useMemo(() => {
    return calculateTechnicalIndicators(
      ticker.symbol,
      entry,
      ticker.change24h,
      ticker.high24h,
      ticker.low24h,
      ticker.volume24hUsd,
      ticker.fundingRate,
      direction
    );
  }, [
    ticker.symbol,
    entry,
    ticker.change24h,
    ticker.high24h,
    ticker.low24h,
    ticker.volume24hUsd,
    ticker.fundingRate,
    direction,
  ]);

  // Compute Dual-Track Risk using our unified engine
  const dualRisk = useMemo(() => {
    return computeDualTrackRisk({
      coin: `${ticker.symbol}USDT`,
      entryPrice: entry,
      atrPercent: techData.atrPercent,
      slPercent: slPercent,
      tpPercent: 10.0,
      walletBalance: accountBalance,
      direction: direction,
      userMargin: localMargin,
      userLeverage: localLeverage,
    });
  }, [ticker.symbol, entry, techData.atrPercent, slPercent, accountBalance, direction, localMargin, localLeverage]);

  const feeAndTarget = useMemo(() => {
    return calculateTradeFeesAndTargets(
      entry,
      positionSize,
      localMargin,
      direction,
      techData.atrPercent
    );
  }, [entry, positionSize, localMargin, direction, techData.atrPercent]);

  const detailedFees = useMemo(() => {
    return computeDetailedSignalFeesAndExit({
      entryPrice: entry,
      tp1Price: tp1,
      tp2Price: tp2,
      tp3Price: tp3,
      slPrice: sl,
      marginUsd: localMargin,
      leverage: localLeverage,
      walletBalance: accountBalance,
      direction,
    });
  }, [entry, tp1, tp2, tp3, sl, localMargin, localLeverage, accountBalance, direction]);

  const handleAdoptTechnical = () => {
    setLocalMargin(dualRisk.technicalAnalysis.recommendedMargin);
    setLocalLeverage(dualRisk.technicalAnalysis.recommendedLeverage);
  };

  // Formatted Trade Card Output Text
  const tradeCardText = useMemo(() => {
    const formattedEntry = entry >= 1 ? entry.toFixed(2) : entry.toFixed(4);
    const formattedSl = sl >= 1 ? sl.toFixed(2) : sl.toFixed(4);
    const formattedTp1 = tp1 >= 1 ? tp1.toFixed(2) : tp1.toFixed(4);
    const formattedTp2 = tp2 >= 1 ? tp2.toFixed(2) : tp2.toFixed(4);
    const formattedTp3 = tp3 >= 1 ? tp3.toFixed(2) : tp3.toFixed(4);
    const formattedLiq = liquidationPrice >= 1 ? liquidationPrice.toFixed(2) : liquidationPrice.toFixed(4);

    const header = `🟢 🥇 INSTANT MASTER TRADE CARD — ${ticker.symbol}USDT | ${direction} | ENTER NOW`;

    if (activeTab === 'rules') {
      return `${header}
[ငါ့ရဲ့ စည်းမျဉ်းဖြင့် ခွဲခြမ်းစိတ်ဖြာချက် (MY RISK RULES)]
Entry: $${formattedEntry}
SL: $${formattedSl} (-${slPercent.toFixed(2)}%)
TP1: $${formattedTp1} (+3.00%) | Net: +$${detailedFees.tp1NetProfit.toFixed(2)} (+${detailedFees.tp1NetGainPct.toFixed(1)}%)
TP2: $${formattedTp2} (+6.00%) | Net: +$${detailedFees.tp2NetProfit.toFixed(2)} (+${detailedFees.tp2NetGainPct.toFixed(1)}%)
TP3: $${formattedTp3} (+10.00%) | Net: +$${detailedFees.tp3NetProfit.toFixed(2)} (+${detailedFees.tp3NetGainPct.toFixed(1)}%)
Margin: $${localMargin}
Leverage: ${localLeverage}×
Position Size: $${positionSize.toLocaleString()}
Estimated Fees (Round-Trip Taxes): $${detailedFees.totalFeeUsd.toFixed(2)} (Entry: $${detailedFees.entryFeeUsd.toFixed(2)}, Exit: $${detailedFees.exitFeeUsd.toFixed(2)})
Risk / SL Loss (With Fees): -$${detailedFees.slNetLossWithFees.toFixed(2)} (-${detailedFees.slNetLossPctOfMargin.toFixed(1)}%)
Risk-to-Reward (R:R): 1 : ${rr.toFixed(2)}
Confidence: 86%
Liquidation Price: $${formattedLiq} (Protected before SL)

📊 အခွန်နှင့် စရိတ် ရှင်းတမ်း (FEE & TAX DEDUCTIONS)
• အဝင် Taker Fee (0.05%): -$${detailedFees.entryFeeUsd.toFixed(2)}
• အထွက် Maker Fee (0.02%): -$${detailedFees.exitFeeUsd.toFixed(2)}
• စုစုပေါင်း အခွန်/စရိတ်: -$${detailedFees.totalFeeUsd.toFixed(2)} (${detailedFees.feePercentageOfMargin.toFixed(1)}% of margin)

📈 အမြတ်ရပါက အော်ဒါပိတ်သိမ်းသင့်သည့် အကြောင်းရင်းများ (WHY CLOSE ON PROFIT)
• TP1 ($${formattedTp1}): ${detailedFees.tp1CloseReasonMy}
• TP2 ($${formattedTp2}): ${detailedFees.tp2CloseReasonMy}
• TP3 ($${formattedTp3}): ${detailedFees.tp3CloseReasonMy}

🛑 အရှုံးဖြစ်ပါက အော်ဒါပိတ်သိမ်းသင့်သည့် အကြောင်းရင်း (WHY CLOSE ON LOSS)
• SL ($${formattedSl}): ${detailedFees.slCloseReasonMy}

🎯 FINAL: ENTER NOW`;
    }

    if (activeTab === 'technical') {
      return `${header}
[CRYPTO နည်းပညာ ခွဲခြမ်းစိတ်ဖြာချက် (PRO TECHNICAL ANALYSIS)]
• 4H Macro Trend: ${techData.timeframe4hTrend}
  - Major Support: $${techData.macroSupport} | Major Resistance: $${techData.macroResistance}
• 1H Market Structure & Order Block: ${techData.timeframe1hStructure}
  - Order Block (OB Zone): $${techData.orderBlockZone.low} - $${techData.orderBlockZone.high} (${techData.orderBlockZone.type})
• 15M Entry Setup & Liquidity Sweep:
  - Sweep Wick: $${techData.liquiditySweepPrice}
  - Confirmation: ${techData.triggerReason}
• Technical Indicators & Momentum:
  - RSI (14): ${techData.rsi14} (${techData.rsiStatus.replace(/_/g, ' ')})
  - EMA 50 / 200: $${techData.ema50} / $${techData.ema200} (${techData.emaTrend.replace(/_/g, ' ')})
  - MACD Histogram: ${techData.macdHistogram}
  - 24H ATR Volatility: ${techData.atrVolatilityPercent}%
• Trade Fees & Taxes Breakdown:
  - Total Round-Trip: $${detailedFees.totalFeeUsd.toFixed(2)} (Entry: $${detailedFees.entryFeeUsd.toFixed(2)}, Exit: $${detailedFees.exitFeeUsd.toFixed(2)})
  - TP1 Net Profit: +$${detailedFees.tp1NetProfit.toFixed(2)} (+${detailedFees.tp1NetGainPct.toFixed(1)}%)
  - TP3 Net Profit: +$${detailedFees.tp3NetProfit.toFixed(2)} (+${detailedFees.tp3NetGainPct.toFixed(1)}%)
  - SL Net Loss: -$${detailedFees.slNetLossWithFees.toFixed(2)}
• Profit / Loss Rationales:
  - Profit Exit: ${lang === 'my' ? detailedFees.tp1CloseReasonMy : detailedFees.tp1CloseReasonEn}
  - Loss Cut: ${lang === 'my' ? detailedFees.slCloseReasonMy : detailedFees.slCloseReasonEn}
• Technical Confluence Score: ${techData.confluenceScore}/${techData.confluenceItems.length} (${techData.confluencePercentage}% High Quality Setup)
  ${techData.confluenceItems.map((c) => `[✓] ${lang === 'my' ? c.labelMy : c.label}`).join('\n  ')}

⚠️ Technical Invalidation:
• 1H Candle သည် $${formattedSl} အောက် ပိတ်သွားပါက Structure ပျက်ပြယ်သဖြင့် ချက်ချင်း Exit လုပ်ရမည်။

🎯 FINAL: ENTER NOW`;
    }

    // COMBINED (Both User Risk Rules + Pro Technical Analysis)
    return `${header}

══════════════════════════════════════════════════
[SECTION 1: MY RISK RULES (ငါ့ရဲ့ စည်းမျဉ်းဖြင့် ခွဲခြမ်းစိတ်ဖြာချက်)]
══════════════════════════════════════════════════
Entry: $${formattedEntry}
SL: $${formattedSl} (-${slPercent.toFixed(2)}%)
TP1: $${formattedTp1} (+3.00%) | Net: +$${detailedFees.tp1NetProfit.toFixed(2)} (+${detailedFees.tp1NetGainPct.toFixed(1)}%)
TP2: $${formattedTp2} (+6.00%) | Net: +$${detailedFees.tp2NetProfit.toFixed(2)} (+${detailedFees.tp2NetGainPct.toFixed(1)}%)
TP3: $${formattedTp3} (+10.00%) | Net: +$${detailedFees.tp3NetProfit.toFixed(2)} (+${detailedFees.tp3NetGainPct.toFixed(1)}%)
Margin: $${localMargin} | Leverage: ${localLeverage}×
Position Size: $${positionSize.toLocaleString()}
Estimated Fees (Round-Trip Taxes): $${detailedFees.totalFeeUsd.toFixed(2)}
Risk / SL Loss: -$${detailedFees.slNetLossWithFees.toFixed(2)} (-${detailedFees.slNetLossPctOfMargin.toFixed(1)}%)
Risk-to-Reward (R:R): 1 : ${rr.toFixed(2)}
Confidence: 86%
Liquidation Price: $${formattedLiq}

══════════════════════════════════════════════════
[SECTION 2: PRO CRYPTO TECHNICAL ANALYSIS (နည်းပညာ ခွဲခြမ်းစိတ်ဖြာချက်)]
══════════════════════════════════════════════════
• 4H Macro Trend: ${techData.timeframe4hTrend}
  - Major Support: $${techData.macroSupport} | Major Resistance: $${techData.macroResistance}
• 1H Market Structure & Order Block: ${techData.timeframe1hStructure}
  - Institutional Order Block: $${techData.orderBlockZone.low} - $${techData.orderBlockZone.high} (${techData.orderBlockZone.type})
• 15M Entry Setup & Liquidity Sweep:
  - Sweep: $${techData.liquiditySweepPrice}
  - Confirmation: ${techData.triggerReason}
• Technical Indicators & Momentum:
  - RSI (14): ${techData.rsi14} (${techData.rsiStatus.replace(/_/g, ' ')})
  - EMA 50 / 200: $${techData.ema50} / $${techData.ema200} (${techData.emaTrend.replace(/_/g, ' ')})
  - MACD Histogram: ${techData.macdHistogram}
  - 24H ATR Volatility: ${techData.atrVolatilityPercent}%
• Technical Confluence Score: ${techData.confluenceScore}/${techData.confluenceItems.length} (${techData.confluencePercentage}% High Quality Setup)
  ${techData.confluenceItems.map((c) => `[✓] ${lang === 'my' ? c.labelMy : c.label}`).join('\n  ')}

══════════════════════════════════════════════════
[SECTION 3: TAX & FEE BREAKDOWN (ကုန်ကျစရိတ်နှင့် အခွန်တွက်ချက်မှု)]
══════════════════════════════════════════════════
• Entry Taker Fee (0.05%): -$${detailedFees.entryFeeUsd.toFixed(2)}
• Exit Maker Fee (0.02%): -$${detailedFees.exitFeeUsd.toFixed(2)}
• စုစုပေါင်း ကုန်ကျစရိတ်: -$${detailedFees.totalFeeUsd.toFixed(2)} (${detailedFees.feePercentageOfMargin.toFixed(1)}% of margin)
• TP1 Net Profit: +$${detailedFees.tp1NetProfit.toFixed(2)} (Tax Deducted)
• TP2 Net Profit: +$${detailedFees.tp2NetProfit.toFixed(2)} (Tax Deducted)
• TP3 Net Profit: +$${detailedFees.tp3NetProfit.toFixed(2)} (Tax Deducted)

══════════════════════════════════════════════════
[SECTION 4: EXIT RATIONALES (အမြတ်/အရှုံး ပိတ်သိမ်းသင့်သည့် အကြောင်းရင်းများ)]
══════════════════════════════════════════════════
🟢 ဘာကြောင့် အမြတ်သိမ်းပိတ်သင့်လဲ (Why Close on Profit):
• TP1 ($${formattedTp1}): ${lang === 'my' ? detailedFees.tp1CloseReasonMy : detailedFees.tp1CloseReasonEn}
• TP2 ($${formattedTp2}): ${lang === 'my' ? detailedFees.tp2CloseReasonMy : detailedFees.tp2CloseReasonEn}
• TP3 ($${formattedTp3}): ${lang === 'my' ? detailedFees.tp3CloseReasonMy : detailedFees.tp3CloseReasonEn}

🔴 ဘာကြောင့် အရှုံးဖြတ်ပိတ်သင့်လဲ (Why Close on Loss):
• Stop Loss ($${formattedSl}): ${lang === 'my' ? detailedFees.slCloseReasonMy : detailedFees.slCloseReasonEn}

══════════════════════════════════════════════════
[SECTION 5: RISK & INVALIDATION EXECUTION]
══════════════════════════════════════════════════
• Invalidation: စျေးနှုန်းသည် $${formattedSl} သို့ ရောက်ရှိပါက Structure ပျက်သဖြင့် ချက်ချင်း Cut/Exit လုပ်ရမည်။
• Liquidation Protection: Stop Loss ($${formattedSl}) သည် Liquidation Price ($${formattedLiq}) မရောက်မီ အပြည့်အဝ ကာကွယ်ပေးထားပါသည်။
• Trade Management: TP1 ($${formattedTp1}) ရောက်ပါက 50% အမြတ်ယူပြီး SL ကို Breakeven ($${formattedEntry}) သို့ မဖြစ်မနေ ရွှေ့ရမည်။

🎯 FINAL: ENTER NOW`;
  }, [
    activeTab,
    ticker,
    direction,
    entry,
    sl,
    tp1,
    tp2,
    tp3,
    localMargin,
    localLeverage,
    positionSize,
    slLoss,
    slPercent,
    tp1Profit,
    tp2Profit,
    tp3Profit,
    rr,
    liquidationPrice,
    techData,
    feeAndTarget,
    detailedFees,
    lang,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tradeCardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExecuteDemoTrade = () => {
    if (onGoToTradePreset) {
      onGoToTradePreset({
        symbol: ticker.symbol,
        side: direction,
        margin: localMargin,
        leverage: localLeverage,
        entryPrice: entry,
        slPrice: sl,
        tpPrice: tp3,
        orderType: 'MARKET',
        source: `SCANNER (${ticker.symbol}USDT)`,
      });
      onClose();
    } else if (onTradeInDemo) {
      onTradeInDemo(ticker.symbol, direction);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  SECTION 13 MASTER TRADE CARD
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
                  ENTER NOW
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  Live Confluence {techData.confluencePercentage}%
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                <span>{ticker.symbol}USDT</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    isLong
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {ticker.bias}
                </span>
                <span className="text-xs text-slate-400 font-mono font-normal">
                  ${entry >= 1 ? entry.toFixed(2) : entry.toFixed(4)}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Tabs: Combined vs My Rules vs Technical */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('combined')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'combined'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '🌟 စုံလင်သော Card (Combined)' : '🌟 Combined Master Card'}</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '🛡️ ငါ့စည်းမျဉ်း (My Risk)' : '🛡️ My Risk Rules'}</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'technical'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '📈 နည်းပညာ ခွဲခြမ်းစိတ်ဖြာမှု' : '📈 Technical Analysis'}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Futures Wallet Balance Controller Banner */}
          <DualTrackWalletBanner
            walletBalance={accountBalance}
            onWalletBalanceChange={handleBalanceUpdate}
            direction={direction}
            onDirectionChange={() => {}}
            margin={localMargin}
            dollarLoss={Math.abs(slLoss)}
            dollarProfit={tp3Profit}
            accountGainPct={dualRisk.userPlan.gainPctOfBalance}
            accountLossPct={dualRisk.userPlan.lossPctOfBalance}
            riskReward={rr}
            consecutiveLosses={dualRisk.userPlan.consecutiveLossesTo50Pct}
            lang={lang}
          />

          {/* Dual-Track Comparative Cards: ငါ့စည်းမျဉ်း vs မင်းရွေးချယ်မှု */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Part 1: ငါ့စည်းမျဉ်း */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">
                      {lang === 'my' ? 'အပိုင်း (၁) - သင်သတ်မှတ်ထားသော စည်းမျဉ်းများ (ငါ့စည်းမျဉ်း)' : 'Part 1: Your Custom Rules (My Rules)'}
                    </h4>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    dualRisk.userPlan.allRulesPass
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {dualRisk.userPlan.allRulesPass ? '✔ Pass' : '⚠️ Exceeded'}
                </span>
              </div>

              {/* Margin & Leverage Controls */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{lang === 'my' ? 'Margin:' : 'Margin:'}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700">
                      <span className="text-xs text-amber-400 font-bold mr-1">$</span>
                      <input
                        type="number"
                        min={10}
                        value={localMargin}
                        onChange={(e) => setLocalMargin(Math.max(10, Number(e.target.value) || 0))}
                        className="w-16 bg-transparent text-xs font-mono font-bold text-white focus:outline-hidden text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {[50, 100, 200].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setLocalMargin(amt)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                            localMargin === amt ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{lang === 'my' ? 'Leverage:' : 'Leverage:'}</span>
                  <div className="flex items-center gap-1">
                    {[5, 10, 15, 20, 25, 50].map((lev) => (
                      <button
                        key={lev}
                        onClick={() => setLocalLeverage(lev)}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition cursor-pointer ${
                          localLeverage === lev
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {lev}×
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Position:</span>
                    <span className="font-bold text-white">${positionSize.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Loss at SL:</span>
                    <span className="font-bold text-rose-400">
                      -${Math.abs(slLoss).toFixed(2)} ({dualRisk.userPlan.lossPctOfBalance.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 2: မင်းရွေးချယ်မှု */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">
                      {lang === 'my' ? 'အပိုင်း (၂) - နည်းပညာပိုင်းဆိုင်ရာ သုံးသပ်အကြံပြုချက် (မင်းရွေးချယ်မှု)' : 'Part 2: Technical Recommendation (AI Choice)'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setCopiedTechnicalCard(true);
                      navigator.clipboard.writeText(tradeCardText);
                      setTimeout(() => setCopiedTechnicalCard(false), 2000);
                    }}
                    className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTechnicalCard ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTechnicalCard ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleAdoptTechnical}
                    className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === 'my' ? 'အသုံးပြုမည်' : 'Adopt'}</span>
                  </button>
                </div>
              </div>

              {/* Technical display */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-[10px] text-indigo-300 block">Preservation Margin (1.5% Risk):</span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    ${dualRisk.technicalAnalysis.recommendedMargin} USD
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-[10px] text-indigo-300 block">Noise-Immune Leverage:</span>
                  <span className="text-sm font-black font-mono text-indigo-300">
                    {dualRisk.technicalAnalysis.recommendedLeverage}× Safe
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/80 border border-indigo-500/20 text-[10px] text-slate-300 leading-tight">
                <span className="font-bold text-amber-400">💡 Technical Leverage Logic: </span>
                {ticker.symbol} ၏ 24H ATR {techData.atrPercent.toFixed(2)}% လှိုင်းထန်မှုအတွက် {dualRisk.technicalAnalysis.recommendedLeverage}× leverage သည် Noise-Immune ဖြစ်ပြီး Wallet Balance $${accountBalance.toLocaleString()} တွင် 1.5% Risk မကျော်လွန်စေရန် Margin အား ${dualRisk.technicalAnalysis.recommendedMargin} အကြံပြုထားသည်။
              </div>
            </div>
          </div>

          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Entry Price</span>
              <span className="text-base font-bold text-white">
                ${entry >= 1 ? entry.toFixed(2) : entry.toFixed(4)}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-rose-950/50">
              <span className="text-[10px] text-rose-400 block font-sans">Stop Loss (SL)</span>
              <span className="text-base font-bold text-rose-400">
                ${sl >= 1 ? sl.toFixed(2) : sl.toFixed(4)}
              </span>
              <span className="text-[9px] text-rose-300 block font-semibold">Net Loss w/ Fees: -${detailedFees.slNetLossWithFees.toFixed(2)}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-950/50">
              <span className="text-[10px] text-emerald-400 block font-sans">TP3 Target (Net)</span>
              <span className="text-base font-bold text-emerald-400">
                ${tp3 >= 1 ? tp3.toFixed(2) : tp3.toFixed(4)}
              </span>
              <span className="text-[9px] text-emerald-300 block font-semibold">Net Profit: +${detailedFees.tp3NetProfit.toFixed(2)}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-amber-400 block font-sans">Risk / Reward (R:R)</span>
              <span className="text-base font-bold text-amber-400">1 : {rr.toFixed(1)}</span>
              <span className="text-[9px] text-emerald-400 block font-sans font-bold">High Feasibility</span>
            </div>
          </div>

          {/* Real-time Technical Analysis Confluence Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {/* RSI */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] flex items-center justify-between">
                <span>RSI (14)</span>
                <span className="font-mono text-cyan-400 font-bold">{techData.rsi14}</span>
              </div>
              <div className="text-xs font-bold text-white truncate mt-0.5">
                {techData.rsiStatus.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Order Block */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] flex items-center justify-between">
                <span>1H Order Block</span>
                <span className="text-emerald-400 font-bold">{techData.orderBlockZone.type}</span>
              </div>
              <div className="text-xs font-mono font-bold text-amber-400 truncate mt-0.5">
                ${techData.orderBlockZone.low} - ${techData.orderBlockZone.high}
              </div>
            </div>

            {/* EMA Trend */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] flex items-center justify-between">
                <span>EMA 50 / 200</span>
                <span className="text-indigo-400 font-bold">{techData.emaTrend.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-200 truncate mt-0.5">
                ${techData.ema50} / ${techData.ema200}
              </div>
            </div>

            {/* SFP Sweep */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] flex items-center justify-between">
                <span>15M Liquidity Sweep</span>
                <span className="text-teal-400 font-bold">Confirmed</span>
              </div>
              <div className="text-xs font-mono font-bold text-teal-300 truncate mt-0.5">
                Wick: ${techData.liquiditySweepPrice}
              </div>
            </div>
          </div>

          {/* Technical Confluences Checklist */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'my' ? 'နည်းပညာ အတည်ပြုချက်များ (Confluence Score)' : 'Technical Confluence Score'}</span>
              </span>
              <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {techData.confluenceScore}/{techData.confluenceItems.length} ({techData.confluencePercentage}%)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px] text-slate-400">
              {techData.confluenceItems.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 truncate">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 truncate">{lang === 'my' ? c.labelMy : c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Breakdown & Exit Rationales Directive */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span>{lang === 'my' ? 'အခွန်တွက်ချက်မှုနှင့် အော်ဒါပိတ်သိမ်းရန် အကြောင်းပြချက်များ' : 'Tax Deduction Breakdown & Exit Rationales'}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Visible & Audited
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {lang === 'my'
                      ? 'ကုန်ကျစရိတ်/အခွန်နှုတ်ပြီး အသားတင်အမြတ် နှင့် ဘာကြောင့်အမြတ်/အရှုံးပိတ်သင့်သည်ကို ရှင်းပြချက်'
                      : 'Net profit post-exchange taxes, and explicit reasons for TP and SL exits'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">{lang === 'my' ? 'စုစုပေါင်းအခွန်:' : 'Total Fees:'}</span>
                <span className="font-mono font-bold text-amber-400">${detailedFees.totalFeeUsd.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500">({detailedFees.feePercentageOfMargin.toFixed(1)}% margin)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              {/* Fee breakdown (4 cols) */}
              <div className="md:col-span-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide flex items-center justify-between pb-1 border-b border-slate-800">
                  <span>{lang === 'my' ? '💸 အခွန်နှင့် Exchange စရိတ်' : '💸 Exchange Tax & Fee Audit'}</span>
                  <span className="text-[9px] text-slate-400 font-mono">0.07%</span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{lang === 'my' ? 'အဝင် Taker (0.05%):' : 'Entry Taker (0.05%):'}</span>
                    <span className="font-mono text-white font-bold">${detailedFees.entryFeeUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{lang === 'my' ? 'အထွက် Maker (0.02%):' : 'Exit Maker (0.02%):'}</span>
                    <span className="font-mono text-white font-bold">${detailedFees.exitFeeUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-semibold">
                    <span className="text-amber-300">{lang === 'my' ? 'အခွန်စုစုပေါင်း:' : 'Total Roundtrip:'}</span>
                    <span className="font-mono text-amber-400 font-black">${detailedFees.totalFeeUsd.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-emerald-400">
                    <span>TP1 Net Profit:</span>
                    <span className="font-bold">+${detailedFees.tp1NetProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>TP3 Net Profit:</span>
                    <span className="font-bold">+${detailedFees.tp3NetProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>SL Net Loss:</span>
                    <span className="font-bold">-${detailedFees.slNetLossWithFees.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Rationales (8 cols) */}
              <div className="md:col-span-8 space-y-2">
                {/* Why close on profit */}
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === 'my' ? 'ဘယ်လောက်မြတ်ရင် ဘာကြောင့် အော်ဒါပိတ်သင့်လဲ (Why Close on Profit):' : 'Why Close on Profit Targets:'}</span>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-300 leading-relaxed">
                    <div className="p-1.5 rounded-lg bg-slate-950/70 border border-emerald-500/20">
                      <span className="font-bold text-emerald-400 font-mono">TP1: </span>
                      {lang === 'my' ? detailedFees.tp1CloseReasonMy : detailedFees.tp1CloseReasonEn}
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950/70 border border-emerald-500/20">
                      <span className="font-bold text-emerald-400 font-mono">TP2/TP3: </span>
                      {lang === 'my' ? detailedFees.tp3CloseReasonMy : detailedFees.tp3CloseReasonEn}
                    </div>
                  </div>
                </div>

                {/* Why close on loss */}
                <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === 'my' ? 'ဘယ်လောက်ရှုံးရင် ဘာကြောင့် အော်ဒါပိတ်သင့်လဲ (Why Close on Loss):' : 'Why Cut Loss at Stop Loss:'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950/70 border border-rose-500/20 text-[10px] text-slate-300 leading-relaxed">
                    <span className="font-bold text-rose-400 font-mono">SL: </span>
                    {lang === 'my' ? detailedFees.slCloseReasonMy : detailedFees.slCloseReasonEn}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formatted Output Card (Copyable) */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {tradeCardText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteDemoTrade}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950 animate-pulse" />
              <span>{lang === 'my' ? '⚡ Demo သို့ သွားမည်' : '⚡ Go to Demo'}</span>
            </button>

            <button
              onClick={() => openBinanceFutures(ticker.symbol)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
              title={lang === 'my' ? 'Binance တွင် တိုက်ရိုက်ကုန်သွယ်မည် (Persistent Session)' : 'Trade in Binance'}
            >
              <ExternalLink className="w-4 h-4" />
              <span>{lang === 'my' ? 'Binance တွင် ကုန်သွယ်မည်' : 'Trade in Binance'}</span>
            </button>

            {onOpenInAppTerminal && (
              <button
                onClick={() => {
                  onOpenInAppTerminal(ticker.symbol, isLong ? 'LONG' : 'SHORT', {
                    symbol: ticker.symbol,
                    side: isLong ? 'LONG' : 'SHORT',
                    margin: localMargin,
                    leverage: localLeverage,
                    entryPrice: entry,
                    tpPrice: tp3,
                    slPrice: sl,
                  });
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]"
                title={lang === 'my' ? 'အက်ပ်အတွင်း တိုက်ရိုက်ကုန်သွယ်မည်' : 'Trade directly in In-App Terminal'}
              >
                <Zap className="w-4 h-4 fill-emerald-200 text-emerald-200" />
                <span>{lang === 'my' ? '⚡ အက်ပ်တွင်း ကုန်သွယ်မည်' : '⚡ Trade In-App'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
              <span>
                {copied
                  ? lang === 'my'
                    ? 'ကူးယူပြီးပါပြီ!'
                    : 'Copied!'
                  : lang === 'my'
                  ? 'Trade Card ကူးမည်'
                  : 'Copy Card'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
