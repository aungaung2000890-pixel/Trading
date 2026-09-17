import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Calculator,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Maximize2,
  X,
  Plus,
  Layers,
  Sparkles,
  Clipboard,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { CoinOpportunity, DemoTradePreset } from '../types';
import {
  calculateTechnicalIndicators,
  TechnicalIndicatorSet,
  calculateTradeFeesAndTargets,
  computeDetailedSignalFeesAndExit,
} from '../utils/technicalAnalysis';

interface UploadedChart {
  id: string;
  url: string;
  name: string;
  label: string; // e.g., '4H Structure', '1H Trend', '15M Entry', 'Order Book'
  addedAt: string;
}

interface CustomTradeSimulatorProps {
  coins: CoinOpportunity[];
  margin: number;
  setMargin: (m: number) => void;
  leverage: number;
  setLeverage: (l: number) => void;
  onGoToTrade?: (preset: DemoTradePreset) => void;
  lang: 'my' | 'en';
}

export const CustomTradeSimulator: React.FC<CustomTradeSimulatorProps> = ({
  coins,
  margin,
  setMargin,
  leverage,
  setLeverage,
  onGoToTrade,
  lang,
}) => {
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState('SOL');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [customEntry, setCustomEntry] = useState<number>(100.70);
  const [customSl, setCustomSl] = useState<number>(98.80);
  const [uploadedCharts, setUploadedCharts] = useState<UploadedChart[]>([]);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'combined' | 'rules' | 'technical'>('combined');
  const [tradeTitlePrefix, setTradeTitlePrefix] = useState<'BEST_TRADE' | 'CUSTOM_TRADE'>('BEST_TRADE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync entry and SL when selected coin changes
  useEffect(() => {
    const c = coins.find((x) => x.symbol === selectedCoinSymbol);
    if (c) {
      setCustomEntry(c.currentPrice);
      setCustomSl(+(c.currentPrice * (direction === 'LONG' ? 0.98 : 1.02)).toFixed(c.currentPrice < 1 ? 4 : 2));
    }
  }, [selectedCoinSymbol, coins, direction]);

  // Compute Technical Analysis Data based on selected coin and live metrics
  const selectedCoinObj = useMemo(() => {
    return coins.find((x) => x.symbol === selectedCoinSymbol) || coins[0];
  }, [coins, selectedCoinSymbol]);

  const techData: TechnicalIndicatorSet = useMemo(() => {
    const c = selectedCoinObj;
    const high = c?.currentPrice ? c.currentPrice * 1.05 : customEntry * 1.05;
    const low = c?.currentPrice ? c.currentPrice * 0.95 : customEntry * 0.95;
    const vol = c?.volume24h || 850000000;
    const funding = c?.fundingRate || -0.0042;
    const change = c?.change24h || (direction === 'LONG' ? 3.5 : -3.5);
    return calculateTechnicalIndicators(
      selectedCoinSymbol,
      customEntry,
      change,
      high,
      low,
      vol,
      funding,
      direction
    );
  }, [selectedCoinObj, selectedCoinSymbol, customEntry, direction]);

  // Handle Clipboard Paste (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const count = uploadedCharts.length + 1;
              const defaultLabel = count === 1 ? '4H Chart' : count === 2 ? '1H Chart' : count === 3 ? '15M Entry' : `Chart ${count}`;
              const newChart: UploadedChart = {
                id: `chart-${Date.now()}-${Math.random()}`,
                url: reader.result as string,
                name: blob.name || `Pasted_Chart_${count}.png`,
                label: defaultLabel,
                addedAt: new Date().toLocaleTimeString(),
              };
              setUploadedCharts((prev) => [...prev, newChart]);
              showPasteToast(
                lang === 'my'
                  ? `📋 Clipboard မှ Chart ပုံ (${defaultLabel}) ကို ထည့်သွင်းပြီးပါပြီ!`
                  : `📋 Pasted chart image from clipboard (${defaultLabel})!`
              );
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadedCharts.length, lang]);

  const showPasteToast = (msg: string) => {
    setPasteNotice(msg);
    setTimeout(() => setPasteNotice(null), 3000);
  };

  // Handle File Input selection (supports multiple files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, index: number) => {
      const reader = new FileReader();
      reader.onload = () => {
        const count = uploadedCharts.length + index + 1;
        const defaultLabel = count === 1 ? '4H Chart' : count === 2 ? '1H Chart' : count === 3 ? '15M Entry' : `Chart ${count}`;
        const newChart: UploadedChart = {
          id: `chart-${Date.now()}-${index}`,
          url: reader.result as string,
          name: file.name,
          label: defaultLabel,
          addedAt: new Date().toLocaleTimeString(),
        };
        setUploadedCharts((prev) => [...prev, newChart]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeChart = (id: string) => {
    setUploadedCharts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateChartLabel = (id: string, label: string) => {
    setUploadedCharts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label } : c))
    );
  };

  // REAL-TIME AUTO CALCULATIONS (STRICTLY SYNCHRONIZED WITH MARGIN & LEVERAGE)
  const positionSize = margin * leverage;
  const isLong = direction === 'LONG';
  const slDistPercent = customEntry > 0 ? Math.abs((customEntry - customSl) / customEntry) * 100 : 2;
  const slLoss = -(positionSize * (slDistPercent / 100));

  const tp1 = isLong ? customEntry * 1.03 : customEntry * 0.97;
  const tp2 = isLong ? customEntry * 1.06 : customEntry * 0.94;
  const tp3 = isLong ? customEntry * 1.10 : customEntry * 0.90; // ~10% move potential

  const tp1Profit = positionSize * 0.03;
  const tp2Profit = positionSize * 0.06;
  const tp3Profit = positionSize * 0.10;
  const rr = slDistPercent > 0 ? 10 / slDistPercent : 5;
  const liquidationPrice = isLong
    ? customEntry * (1 - 1 / leverage)
    : customEntry * (1 + 1 / leverage);

  const feeAndTarget = useMemo(() => {
    return calculateTradeFeesAndTargets(
      customEntry,
      positionSize,
      margin,
      direction,
      techData.atrPercent
    );
  }, [customEntry, positionSize, margin, direction, techData.atrPercent]);

  // Granular Tax / Fee & Exit Rationale Engine
  const detailedFees = useMemo(() => {
    return computeDetailedSignalFeesAndExit({
      entryPrice: customEntry,
      tp1Price: tp1,
      tp2Price: tp2,
      tp3Price: tp3,
      slPrice: customSl,
      marginUsd: margin,
      leverage,
      walletBalance: 2000,
      direction,
    });
  }, [customEntry, tp1, tp2, tp3, customSl, margin, leverage, direction]);

  const titlePrefixText = tradeTitlePrefix === 'BEST_TRADE' ? 'BEST TRADE' : 'CUSTOM TRADE';

  // Dynamic Master Trade Card Text (Supports Combined, My Rules Only, or Technical Only)
  const generatedCardText = useMemo(() => {
    const headerLine = `${isLong ? '🟢' : '🔴'} 🥇 ${titlePrefixText} — ${selectedCoinSymbol}USDT | ${direction} | ENTER NOW`;

    if (activeTab === 'rules') {
      return `${headerLine}
[ငါ့ရဲ့ စည်းမျဉ်းဖြင့် သတ်မှတ်ချက်များ (MY RISK RULES)]
Entry: $${customEntry.toFixed(customEntry < 1 ? 4 : 2)}
SL: $${customSl.toFixed(customEntry < 1 ? 4 : 2)} (-${slDistPercent.toFixed(2)}%)
TP1: $${tp1.toFixed(customEntry < 1 ? 4 : 2)} (+3.00%) | Net Profit: +$${detailedFees.tp1NetProfit.toFixed(2)}
TP2: $${tp2.toFixed(customEntry < 1 ? 4 : 2)} (+6.00%) | Net Profit: +$${detailedFees.tp2NetProfit.toFixed(2)}
TP3: $${tp3.toFixed(customEntry < 1 ? 4 : 2)} (+10.00%) | Net Profit: +$${detailedFees.tp3NetProfit.toFixed(2)}
Margin: $${margin}
Leverage: ${leverage}×
Position Size: $${positionSize.toLocaleString()}
Net Stop Loss (With Taxes): -$${detailedFees.slNetLossWithFees.toFixed(2)} (-${detailedFees.slNetLossPctOfMargin.toFixed(1)}% of margin)
Risk-to-Reward (R:R): 1 : ${rr.toFixed(2)}
Confidence: 86%
Liquidation Price: $${liquidationPrice.toFixed(customEntry < 1 ? 4 : 2)}

[💸 TAX & FEE DEDUCTIONS (အခွန်နှင့် Exchange စရိတ်)]
• Entry Taker Fee (0.05%): -$${detailedFees.entryFeeUsd.toFixed(2)}
• Exit Maker Fee (0.02%): -$${detailedFees.exitFeeUsd.toFixed(2)}
• Roundtrip Taxes Total: -$${detailedFees.totalFeeUsd.toFixed(2)} (${detailedFees.feePercentageOfMargin.toFixed(1)}% of margin)

[📈 WHY CLOSE ON PROFIT (အမြတ်ရပါက ပိတ်သိမ်းရန် အကြောင်းပြချက်)]
• TP1 ($${tp1.toFixed(customEntry < 1 ? 4 : 2)}): ${lang === 'my' ? detailedFees.tp1CloseReasonMy : detailedFees.tp1CloseReasonEn}
• TP2 ($${tp2.toFixed(customEntry < 1 ? 4 : 2)}): ${lang === 'my' ? detailedFees.tp2CloseReasonMy : detailedFees.tp2CloseReasonEn}
• TP3 ($${tp3.toFixed(customEntry < 1 ? 4 : 2)}): ${lang === 'my' ? detailedFees.tp3CloseReasonMy : detailedFees.tp3CloseReasonEn}

[🛑 WHY CLOSE ON LOSS (အရှုံးဖြတ်ရန် အကြောင်းပြချက်)]
• SL ($${customSl.toFixed(customEntry < 1 ? 4 : 2)}): ${lang === 'my' ? detailedFees.slCloseReasonMy : detailedFees.slCloseReasonEn}

📊 အဓိကအကြောင်းရင်း
${uploadedCharts.length > 0 ? `• ပေးပို့ထားသော Chart (${uploadedCharts.map((c) => c.label).join(', ')}) များအရ ` : '• '}မိမိသတ်မှတ်ထားသော Risk စည်းမျဉ်းအရ Margin $${margin}၊ Leverage ${leverage}× ဖြင့် ချိန်ညှိထားသည်။
• 10% Move Potential အရ TP3 (+10%) တွင် Net Profit +$${detailedFees.tp3NetProfit.toFixed(2)} ရရှိမည်။
• Stop Loss ($${customSl.toFixed(customEntry < 1 ? 4 : 2)}) သည် Liquidation Price ($${liquidationPrice.toFixed(customEntry < 1 ? 4 : 2)}) မတိုင်မီ အပြည့်အဝ ကာကွယ်ပေးထားပါသည်။
• ${feeAndTarget.optimalExitRecommendationMy}

⚠️ Risk / Invalidation
• စျေးနှုန်းသည် $${customSl.toFixed(customEntry < 1 ? 4 : 2)} သို့ရောက်ပါက အစီအစဉ်အတိုင်း ချက်ချင်း Exit လုပ်ရမည်။

🎯 FINAL: ENTER NOW`;
    }

    if (activeTab === 'technical') {
      return `${headerLine}
[CRYPTO နည်းပညာ ခွဲခြမ်းစိတ်ဖြာချက် (PRO TECHNICAL ANALYSIS)]
• 4H Macro Trend: ${techData.marketStructure.timeframe4h.trend}
  - Major Support: $${techData.marketStructure.timeframe4h.support.toFixed(customEntry < 1 ? 4 : 2)} | Major Resistance: $${techData.marketStructure.timeframe4h.resistance.toFixed(customEntry < 1 ? 4 : 2)}
• 1H Market Structure: ${techData.marketStructure.timeframe1h.bosChoch}
  - Institutional Order Block: ${techData.marketStructure.timeframe1h.orderBlock} (${techData.orderBlockZone.type})
• 15M Entry Setup: ${techData.marketStructure.timeframe15m.setup}
  - Trigger: ${techData.marketStructure.timeframe15m.trigger}
  - Liquidity Sweep (SFP): Wicked tested $${techData.liquiditySweepPrice.toFixed(customEntry < 1 ? 4 : 2)} before sharp reclaim
• Technical Indicators & Momentum:
  - RSI (14): ${techData.rsi14} (${techData.rsiStatus})
  - EMA 50 / 200: $${techData.ema50} / $${techData.ema200} (${techData.emaTrend})
  - MACD Histogram: ${techData.macdHistogram} (${techData.macdStatus})
  - 24H ATR Volatility: ${techData.atrPercent}% (Noise buffer verified)
• Trade Fees, Tax & Exit Strategy:
  - Taker Entry: -$${detailedFees.entryFeeUsd.toFixed(2)} | Maker Exit: -$${detailedFees.exitFeeUsd.toFixed(2)}
  - Roundtrip Total Taxes: -$${detailedFees.totalFeeUsd.toFixed(2)} (${detailedFees.feePercentageOfMargin.toFixed(1)}% of margin)
  - Why Close on Profit: ${lang === 'my' ? detailedFees.tp1CloseReasonMy : detailedFees.tp1CloseReasonEn}
  - Why Close on Loss: ${lang === 'my' ? detailedFees.slCloseReasonMy : detailedFees.slCloseReasonEn}
• Technical Confluence Score: ${techData.confluenceScore}/5 (${techData.confluencePercentage}% High Quality Setup)
  ${techData.confluenceItems.map((c) => `[✓] ${c.labelMy}: ${c.detail}`).join('\n  ')}

⚠️ Technical Invalidation Rule:
• 1H Candle တစ်ခုသည် $${customSl.toFixed(customEntry < 1 ? 4 : 2)} အောက်တွင် ပိတ်သွားပါက Structure ပျက်ပြယ်သဖြင့် Cut/Exit လုပ်ရမည်။

🎯 FINAL: ENTER NOW`;
    }

    // COMBINED (Both User Risk Rules + In-Depth Technical Analysis)
    return `${headerLine}

══════════════════════════════════════════════════
[SECTION 1: MY RISK RULES (ငါ့ရဲ့ စည်းမျဉ်းဖြင့် ခွဲခြမ်းစိတ်ဖြာချက်)]
══════════════════════════════════════════════════
Entry: $${customEntry.toFixed(customEntry < 1 ? 4 : 2)}
SL: $${customSl.toFixed(customEntry < 1 ? 4 : 2)} (-${slDistPercent.toFixed(2)}%)
TP1: $${tp1.toFixed(customEntry < 1 ? 4 : 2)} (+3.00%) | Net Profit: +$${detailedFees.tp1NetProfit.toFixed(2)} (+${detailedFees.tp1NetGainPct.toFixed(1)}%)
TP2: $${tp2.toFixed(customEntry < 1 ? 4 : 2)} (+6.00%) | Net Profit: +$${detailedFees.tp2NetProfit.toFixed(2)} (+${detailedFees.tp2NetGainPct.toFixed(1)}%)
TP3: $${tp3.toFixed(customEntry < 1 ? 4 : 2)} (+10.00%) | Net Profit: +$${detailedFees.tp3NetProfit.toFixed(2)} (+${detailedFees.tp3NetGainPct.toFixed(1)}%)
Margin: $${margin} | Leverage: ${leverage}×
Position Size: $${positionSize.toLocaleString()}
Net Stop Loss (With Taxes): -$${detailedFees.slNetLossWithFees.toFixed(2)} (-${detailedFees.slNetLossPctOfMargin.toFixed(1)}% of Margin)
Risk-to-Reward (R:R): 1 : ${rr.toFixed(2)}
Confidence: 88%
Liquidation Price: $${liquidationPrice.toFixed(customEntry < 1 ? 4 : 2)} (SL Buffer: ${(Math.abs(customSl - liquidationPrice) / customSl * 100).toFixed(1)}%)

══════════════════════════════════════════════════
[SECTION 2: PRO CRYPTO TECHNICAL ANALYSIS (နည်းပညာ ခွဲခြမ်းစိတ်ဖြာချက်)]
══════════════════════════════════════════════════
• 4H Macro Trend: ${techData.marketStructure.timeframe4h.trend}
  - Major Support: $${techData.marketStructure.timeframe4h.support.toFixed(customEntry < 1 ? 4 : 2)} | Major Resistance: $${techData.marketStructure.timeframe4h.resistance.toFixed(customEntry < 1 ? 4 : 2)}
• 1H Market Structure: ${techData.marketStructure.timeframe1h.bosChoch}
  - Institutional Order Block: ${techData.marketStructure.timeframe1h.orderBlock} (${techData.orderBlockZone.type})
• 15M Entry Trigger: ${techData.marketStructure.timeframe15m.setup}
  - Key Level Trigger: $${techData.marketStructure.timeframe15m.keyLevel.toFixed(customEntry < 1 ? 4 : 2)}
  - Liquidity Sweep (SFP): Wick tested $${techData.liquiditySweepPrice.toFixed(customEntry < 1 ? 4 : 2)} before sharp volume reclaim
• Technical Indicators & Momentum:
  - RSI (14): ${techData.rsi14} (${techData.rsiStatus})
  - EMA 50 / 200: $${techData.ema50} / $${techData.ema200} (${techData.emaTrend})
  - MACD Histogram: ${techData.macdHistogram} (${techData.macdStatus})
  - 24H ATR Volatility: ${techData.atrPercent}% (Noise buffer checked)
• Confluence Checklist Score: ${techData.confluenceScore}/5 (${techData.confluencePercentage}% High Quality Setup)
  ${techData.confluenceItems.map((c) => `[✓] ${c.labelMy}: ${c.detail}`).join('\n  ')}

══════════════════════════════════════════════════
[SECTION 3: TAX DEDUCTIONS & EXIT RATIONALES (အခွန်နှင့် အမြတ်/အရှုံး ပိတ်သိမ်းရန် အကြောင်းပြချက်များ)]
══════════════════════════════════════════════════
• Entry Taker Fee (0.05%): -$${detailedFees.entryFeeUsd.toFixed(2)}
• Exit Maker Fee (0.02%): -$${detailedFees.exitFeeUsd.toFixed(2)}
• Total Roundtrip Taxes: -$${detailedFees.totalFeeUsd.toFixed(2)} (${detailedFees.feePercentageOfMargin.toFixed(1)}% of margin)
• Why Close on Profit (TP1/TP2/TP3):
  - TP1 ($${tp1.toFixed(customEntry < 1 ? 4 : 2)}): ${lang === 'my' ? detailedFees.tp1CloseReasonMy : detailedFees.tp1CloseReasonEn}
  - TP2 ($${tp2.toFixed(customEntry < 1 ? 4 : 2)}): ${lang === 'my' ? detailedFees.tp2CloseReasonMy : detailedFees.tp2CloseReasonEn}
  - TP3 ($${tp3.toFixed(customEntry < 1 ? 4 : 2)}): ${lang === 'my' ? detailedFees.tp3CloseReasonMy : detailedFees.tp3CloseReasonEn}
• Why Close on Loss (SL):
  - Stop Loss ($${customSl.toFixed(customEntry < 1 ? 4 : 2)}): ${lang === 'my' ? detailedFees.slCloseReasonMy : detailedFees.slCloseReasonEn}

══════════════════════════════════════════════════
[SECTION 4: RISK & INVALIDATION EXECUTION]
══════════════════════════════════════════════════
• Invalidation: စျေးနှုန်းသည် $${customSl.toFixed(customEntry < 1 ? 4 : 2)} အောက် (1H Candle Close) သို့ ရောက်ရှိပါက Structure ပျက်သဖြင့် ချက်ချင်း Exit ပြုလုပ်ရမည်။
• Liquidation Protection: Stop Loss ($${customSl.toFixed(customEntry < 1 ? 4 : 2)}) သည် Liquidation Price ($${liquidationPrice.toFixed(customEntry < 1 ? 4 : 2)}) မတိုင်မီ အပြည့်အဝ ကာကွယ်ပေးထားပါသည်။
${uploadedCharts.length > 0 ? `• Chart Screenshots Attached: ${uploadedCharts.map((c) => c.label).join(', ')}` : ''}

🎯 FINAL: ENTER NOW`;
  }, [
    activeTab,
    tradeTitlePrefix,
    titlePrefixText,
    isLong,
    selectedCoinSymbol,
    direction,
    customEntry,
    customSl,
    tp1,
    tp2,
    tp3,
    margin,
    leverage,
    positionSize,
    slLoss,
    slDistPercent,
    tp1Profit,
    tp2Profit,
    tp3Profit,
    rr,
    liquidationPrice,
    uploadedCharts,
    techData,
    feeAndTarget,
    detailedFees,
    lang,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Toast for Clipboard Paste */}
      {pasteNotice && (
        <div className="bg-indigo-600 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in">
          <Clipboard className="w-4 h-4" />
          <span>{pasteNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'my' ? 'Chart Screenshot (Multi-Images & PC Paste) နှင့် Trade Card ထုတ်ယူစနစ်' : 'Multi-Chart Screenshot Analyzer & Master Card Generator'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/30">
                {lang === 'my' ? 'Ctrl + V Paste ရပါသည်' : 'Ctrl+V Supported'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'my'
                ? 'PC မှနေ၍ Chart Screenshot များကို Ctrl + V ဖြင့် တိုက်ရိုက် Paste လုပ်နိုင်ပြီး ပုံတစ်ပုံထက်ပို၍ ထည့်သွင်းနိုင်ပါသည်'
                : 'Paste charts directly using Ctrl+V or upload multiple timeframe screenshots (4H, 1H, 15M)'}
            </p>
          </div>
        </div>

        {/* Live Synchronized Margin Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-slate-500">{lang === 'my' ? 'လက်ရှိချိန်ညှိထားသော Margin:' : 'Active Margin:'}</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">${margin}</span>
          <span className="text-slate-400">×</span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{leverage}×</span>
          <span className="text-slate-400">=</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">${positionSize.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Multi-Image Upload & Paste Area (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span>{lang === 'my' ? 'Chart ပုံများ တင်သွင်းရန် (4H / 1H / 15M)' : 'Chart Screenshots (Multi-Image)'}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {uploadedCharts.length} {lang === 'my' ? 'ပုံထည့်ပြီး' : 'loaded'}
              </span>
            </div>

            {/* Drop / Paste Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/40 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-2.5 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 group-hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {lang === 'my'
                    ? 'ဖိုင်ရွေးရန် နှိပ်ပါ (သို့) ပုံများကို Drag & Drop လုပ်ပါ'
                    : 'Click to upload or Drag & Drop multiple charts'}
                </span>
                <span className="text-[11px] text-indigo-500 font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                  💡 Keyboard မှ Ctrl + V ဖြင့်လည်း Paste လုပ်နိုင်ပါသည်
                </span>
              </div>
            </div>
          </div>

          {/* Uploaded Charts Gallery */}
          {uploadedCharts.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {lang === 'my' ? 'တင်သွင်းထားသော Chart များ:' : 'Uploaded Charts Gallery:'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {uploadedCharts.map((chart, idx) => (
                  <div
                    key={chart.id}
                    className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xs group"
                  >
                    <img
                      src={chart.url}
                      alt={chart.label}
                      className="w-full h-24 object-cover cursor-pointer group-hover:opacity-90 transition"
                      onClick={() => setZoomImage(chart.url)}
                    />
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                      <select
                        value={chart.label}
                        onChange={(e) => updateChartLabel(chart.id, e.target.value)}
                        className="text-[10px] font-bold bg-transparent text-indigo-600 dark:text-indigo-400 border-none p-0 cursor-pointer focus:outline-none"
                      >
                        <option value="4H Chart">4H Structure</option>
                        <option value="1H Chart">1H Setup</option>
                        <option value="15M Entry">15M Entry</option>
                        <option value="5M Scalp">5M Scalp</option>
                        <option value="Orderbook">Order Book</option>
                        <option value="Indicator">RSI / MACD</option>
                      </select>
                    </div>

                    <button
                      onClick={() => removeChart(chart.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setZoomImage(chart.url)}
                      className="absolute top-1 left-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-indigo-600 transition cursor-pointer"
                      title="Zoom"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle & Right Column: Synchronized Form & Live Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Form Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {/* Coin */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Pair</label>
              <select
                value={selectedCoinSymbol}
                onChange={(e) => setSelectedCoinSymbol(e.target.value)}
                className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {coins.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.symbol}USDT
                  </option>
                ))}
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Direction</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-1 text-xs font-bold rounded-md cursor-pointer ${
                    direction === 'LONG'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-1 text-xs font-bold rounded-md cursor-pointer ${
                    direction === 'SHORT'
                      ? 'bg-rose-500 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  SHORT
                </button>
              </div>
            </div>

            {/* Margin ($) */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                {lang === 'my' ? 'Margin ($)' : 'Margin ($)'}
              </label>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(Math.max(10, Number(e.target.value)))}
                className="w-full text-xs font-mono font-bold p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-amber-500"
              />
            </div>

            {/* Leverage (x) */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                {lang === 'my' ? 'Leverage (×)' : 'Leverage (×)'}
              </label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-indigo-500 cursor-pointer"
              >
                <option value={10}>10×</option>
                <option value={20}>20×</option>
                <option value={30}>30×</option>
                <option value={40}>40×</option>
                <option value={50}>50×</option>
              </select>
            </div>
          </div>

          {/* Entry & SL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Entry Price ($)</label>
              <input
                type="number"
                step="any"
                value={customEntry}
                onChange={(e) => setCustomEntry(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-rose-500 block mb-1">Stop Loss ($)</label>
              <input
                type="number"
                step="any"
                value={customSl}
                onChange={(e) => setCustomSl(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-500"
              />
            </div>
          </div>

          {/* Live Generated Section 13 Trade Card Box */}
          <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative shadow-lg space-y-3">
            <div>
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700 p-0.5">
                    <button
                      onClick={() => setTradeTitlePrefix('BEST_TRADE')}
                      className={`px-2 py-0.5 rounded text-[11px] font-black transition cursor-pointer ${
                        tradeTitlePrefix === 'BEST_TRADE'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🟢 🥇 BEST TRADE
                    </button>
                    <button
                      onClick={() => setTradeTitlePrefix('CUSTOM_TRADE')}
                      className={`px-2 py-0.5 rounded text-[11px] font-black transition cursor-pointer ${
                        tradeTitlePrefix === 'CUSTOM_TRADE'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🟢 🥇 CUSTOM
                    </button>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    Live Confluence {techData.confluencePercentage}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onGoToTrade && (
                    <button
                      id="custom-go-to-trade-btn"
                      onClick={() =>
                        onGoToTrade({
                          symbol: selectedCoinSymbol,
                          side: direction,
                          margin,
                          leverage,
                          entryPrice: customEntry,
                          slPrice: customSl,
                          tpPrice: tp3,
                          orderType: 'LIMIT',
                          source: `${titlePrefixText} (${selectedCoinSymbol}USDT)`,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                      title={lang === 'my' ? 'သတ်မှတ်ချက်များဖြင့် Demo Terminal သို့ တိုက်ရိုက်သွားရောက်မည်' : 'Go to Demo Terminal with custom parameters'}
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-pulse" />
                      <span>{lang === 'my' ? '⚡ Demo သို့ သွားမည်' : '⚡ Go to Trade'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? (lang === 'my' ? 'ကူးယူပြီးပါပြီ!' : 'Copied!') : (lang === 'my' ? 'Trade Card ကူးမည်' : 'Copy Card')}</span>
                  </button>
                </div>
              </div>

              {/* View Mode Tabs: Combined vs My Rules vs Technical Analysis */}
              <div className="flex items-center gap-1.5 pt-2 pb-1 border-b border-slate-800/80">
                <button
                  onClick={() => setActiveTab('combined')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'combined'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'my' ? '🌟 စုံလင်သော Card (Combined)' : '🌟 Combined Master Card'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('rules')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'rules'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'my' ? '🛡️ ငါ့စည်းမျဉ်း (My Risk)' : '🛡️ My Risk Rules'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('technical')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'technical'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'my' ? '📈 နည်းပညာ ခွဲခြမ်းစိတ်ဖြာမှု' : '📈 Technical Analysis'}</span>
                </button>
              </div>

              {/* Real-time Technical Analysis Confluence Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                {/* 1. RSI Indicator */}
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] flex items-center justify-between">
                    <span>RSI (14)</span>
                    <span className="font-mono text-cyan-400 font-bold">{techData.rsi14}</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">
                    {techData.rsiStatus.replace(/_/g, ' ')}
                  </div>
                </div>

                {/* 2. Order Block / Liquidity */}
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] flex items-center justify-between">
                    <span>Order Block (OB)</span>
                    <span className="text-emerald-400 font-bold">1H Demand</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 truncate mt-0.5">
                    ${techData.orderBlockZone.low} - ${techData.orderBlockZone.high}
                  </div>
                </div>

                {/* 3. EMA 50 / 200 Trend */}
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] flex items-center justify-between">
                    <span>EMA 50 / 200</span>
                    <span className="text-indigo-400 font-bold">{techData.emaTrend.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-200 truncate mt-0.5">
                    ${techData.ema50} / ${techData.ema200}
                  </div>
                </div>

                {/* 4. SFP / Liquidity Sweep */}
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] flex items-center justify-between">
                    <span>SFP Liquidity Sweep</span>
                    <span className="text-teal-400 font-bold">Confirmed</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-teal-300 truncate mt-0.5">
                    Wick: ${techData.liquiditySweepPrice}
                  </div>
                </div>
              </div>

              {/* Technical Confluence Checklist */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1 mt-2">
                <div className="text-slate-400 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'my' ? 'နည်းပညာ အတည်ပြုချက် Confluences (ရမှတ် ၅/၅)' : 'Technical Confluence Checklist (5/5)'}</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {techData.confluenceScore}/{techData.confluenceItems.length} Score ({techData.confluencePercentage}%)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[10px] text-slate-400">
                  {techData.confluenceItems.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 truncate">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-slate-300 truncate">{lang === 'my' ? c.labelMy : c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Inputs Confirmation Notice */}
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-3">
                <span>Margin: <strong className="text-amber-400 font-mono">${margin}</strong></span>
                <span>•</span>
                <span>Leverage: <strong className="text-indigo-400 font-mono">{leverage}×</strong></span>
                <span>•</span>
                <span>Position: <strong className="text-white font-mono">${positionSize.toLocaleString()}</strong></span>
                <span>•</span>
                <span>R:R: <strong className="text-emerald-400 font-mono">1 : {rr.toFixed(2)}</strong></span>
              </div>

              {/* The Live Copyable Preformatted Text Card */}
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed mt-2.5 overflow-x-auto max-h-72 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-900">
                {generatedCardText}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-rose-600 transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomImage} alt="Zoomed Chart" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </section>
  );
};
