import React, { useState, useMemo } from 'react';
import {
  Cpu,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Target,
  BarChart2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Scale,
  Activity,
  Calculator,
  Sliders,
  Wallet,
  Coins,
  Search,
} from 'lucide-react';
import { CoinOpportunity, LiveTickerItem } from '../types';
import { computeDualEngineSignal, DualEngineSignalPayload } from '../utils/dualEngineSignal';

interface DualEngineDecisionTerminalProps {
  coins: CoinOpportunity[];
  selectedCoin: CoinOpportunity;
  onSelectCoin: (coin: CoinOpportunity) => void;
  walletBalance: number;
  onWalletBalanceChange: (val: number) => void;
  onTradeInDemo: (symbol: string, side: 'LONG' | 'SHORT', customMargin?: number, customLeverage?: number) => void;
  lang: 'my' | 'en';
  liveTickers?: LiveTickerItem[];
  onOpenAI?: (mode?: any, coinSymbol?: string) => void;
}

export const DualEngineDecisionTerminal: React.FC<DualEngineDecisionTerminalProps> = ({
  coins,
  selectedCoin,
  onSelectCoin,
  walletBalance,
  onWalletBalanceChange,
  onTradeInDemo,
  lang,
  liveTickers = [],
  onOpenAI,
}) => {
  // Trading style
  const [selectedStyle, setSelectedStyle] = useState<'SCALPING' | 'DAY_TRADING' | 'SWING'>('DAY_TRADING');
  
  // User Capital Allocation input (ငါဘယ်လောက်သုံးမယ်လို့ထည့်ရမယ့်ဟာ)
  const [customMargin, setCustomMargin] = useState<number>(() => Math.max(50, Math.round(walletBalance * 0.1)));
  const [customLeverage, setCustomLeverage] = useState<number>(10);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [coinSearch, setCoinSearch] = useState<string>('');

  // Synchronize live ticker data if available
  const activeTicker = useMemo(() => {
    return liveTickers.find((t) => t.symbol.toUpperCase() === selectedCoin.symbol.toUpperCase());
  }, [liveTickers, selectedCoin.symbol]);

  const currentPrice = activeTicker && activeTicker.lastPrice > 0 ? activeTicker.lastPrice : selectedCoin.currentPrice;
  const change24h = activeTicker ? activeTicker.change24h : selectedCoin.change24h;
  const high24h = activeTicker && activeTicker.high24h > 0 ? activeTicker.high24h : currentPrice * 1.05;
  const low24h = activeTicker && activeTicker.low24h > 0 ? activeTicker.low24h : currentPrice * 0.95;
  const volume24hUsd = activeTicker && activeTicker.volume24hUsd > 0 ? activeTicker.volume24hUsd : selectedCoin.volume24h;
  const fundingRate = activeTicker ? activeTicker.fundingRate : selectedCoin.fundingRate;

  // Filtered coins for selector
  const filteredCoins = useMemo(() => {
    if (!coinSearch.trim()) return coins;
    const q = coinSearch.trim().toLowerCase();
    return coins.filter((c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [coins, coinSearch]);

  // Compute Dual-Engine Signal:
  // 1. စနစ်နှင့် AI နည်းပညာ စိစစ်ချက် (Technical & Crypto Knowledge)
  // 2. သတ်မှတ်ထားသော စည်းမျဉ်းများ စိစစ်ချက် (Discipline Rules)
  // 3. နည်းပညာနှင့် စည်းမျဉ်း ပေါင်းစပ်ဆုံးဖြတ်ချက် (Balanced Consensus Recommendation)
  const dualEngine: DualEngineSignalPayload = useMemo(() => {
    return computeDualEngineSignal({
      symbol: selectedCoin.symbol,
      currentPrice,
      change24h,
      high24h,
      low24h,
      volume24hUsd,
      fundingRate,
      accountBalance: walletBalance,
      userMargin: customMargin,
      userLeverage: customLeverage,
      timeframeStyle: selectedStyle,
    });
  }, [
    selectedCoin.symbol,
    currentPrice,
    change24h,
    high24h,
    low24h,
    volume24hUsd,
    fundingRate,
    walletBalance,
    customMargin,
    customLeverage,
    selectedStyle,
  ]);

  const isBuy = dualEngine.consensus.recommendedDirection === 'LONG';
  const confidence = dualEngine.technical.confidenceScore;
  const winProbability = dualEngine.consensus.winrateExpectancy;
  const edge = dualEngine.consensus.edgeRating;

  // Capital & Position Calculations
  const positionValue = customMargin * customLeverage;
  const slDistancePct = Math.abs(currentPrice - dualEngine.technical.slPrice) / currentPrice;
  const dollarLossAtSl = positionValue * slDistancePct;
  const tp1GainPct = Math.abs(dualEngine.technical.tp1Price - currentPrice) / currentPrice;
  const dollarGainAtTp1 = positionValue * tp1GainPct;
  const tp2GainPct = Math.abs(dualEngine.technical.tp2Price - currentPrice) / currentPrice;
  const dollarGainAtTp2 = positionValue * tp2GainPct;
  const tp3GainPct = Math.abs(dualEngine.technical.tp3Price - currentPrice) / currentPrice;
  const dollarGainAtTp3 = positionValue * tp3GainPct;

  const fmtP = (p: number) => (p >= 1 ? p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.toFixed(4));

  const handleCopySetup = () => {
    const text = `Trade by KA • Strategy & AI Decision Setup:
Coin: ${selectedCoin.symbol}/USDT
Current Price: $${fmtP(currentPrice)}
Recommended Action: ${isBuy ? 'BUY (LONG) 🟢' : 'SELL (SHORT) 🔴'}
Winrate Expectancy: ${winProbability}% (Edge ${edge})
Optimal Entry: $${fmtP(dualEngine.technical.entryPrice)}
TP 1: $${fmtP(dualEngine.technical.tp1Price)} (Est. Profit: +$${dollarGainAtTp1.toFixed(1)})
TP 2: $${fmtP(dualEngine.technical.tp2Price)} (Est. Profit: +$${dollarGainAtTp2.toFixed(1)})
TP 3: $${fmtP(dualEngine.technical.tp3Price)} (Est. Profit: +$${dollarGainAtTp3.toFixed(1)})
Stop Loss: $${fmtP(dualEngine.technical.slPrice)} (Est. Loss: -$${dollarLossAtSl.toFixed(1)})
Allocated Margin: $${customMargin} USDT | Leverage: ${customLeverage}x
Discipline Rules Status: ${dualEngine.rules.passedCount}/${dualEngine.rules.totalRules} Rules Passed`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div id="dual-engine-decision-terminal" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {lang === 'my'
                  ? 'သတ်မှတ်နည်းလမ်း & AI နည်းပညာ စိစစ်မှု စနစ်'
                  : 'Strategy & AI Quantitative Decision Terminal'}
              </h1>
              <p className="text-xs text-slate-500">
                {lang === 'my'
                  ? 'နည်းပညာနှင့် ခရစ်ပတို အသိပညာ၊ သတ်မှတ်စည်းမျဉ်းများနှင့် ပေါင်းစပ်ဆုံးဖြတ်ချက် သုံးခု ခွဲခြမ်းစိတ်ဖြာမှု'
                  : '3-Way Comprehensive Analysis: Technical Crypto Intelligence, Discipline Rules & Balanced Consensus'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Balance Indicator */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shrink-0">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px]">{lang === 'my' ? 'လက်ကျန် အရင်းအနှီး' : 'Wallet Balance'}</span>
              <strong className="font-mono text-slate-900 dark:text-white">${walletBalance.toLocaleString()} USDT</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Capital Allocation & Risk Settings Bar (ငါဘယ်လောက်သုံးမယ်လို့ထည့်ရမယ့်ဟာ) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {lang === 'my' ? 'အသုံးပြုမည့် အရင်းအနှီးနှင့် အချိုးအစား သတ်မှတ်ရန်' : 'Capital Allocation & Trade Sizing'}
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            {lang === 'my' ? 'ဤကုန်သွယ်မှုအတွက် အသုံးပြုမည့် Margin နှင့် Leverage' : 'Specify margin and leverage for this position'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Margin Input Field */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{lang === 'my' ? 'ထည့်သွင်းအသုံးပြုမည့် Margin (USDT)' : 'Position Margin (USDT)'}</span>
              <span className="text-[11px] font-mono text-amber-500 font-bold">
                {walletBalance > 0 ? ((customMargin / walletBalance) * 100).toFixed(1) : 0}% of wallet
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
              <input
                type="number"
                min="10"
                max={walletBalance * 2}
                value={customMargin}
                onChange={(e) => setCustomMargin(Math.max(10, Number(e.target.value) || 10))}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-16 py-2 text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                USDT
              </span>
            </div>

            {/* Quick Percentage Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {[10, 25, 50, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setCustomMargin(Math.max(10, Math.round((walletBalance * pct) / 100)))}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer active:scale-95 ${
                    Math.abs(customMargin - Math.round((walletBalance * pct) / 100)) < 5
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCustomMargin(50)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                $50
              </button>
              <button
                type="button"
                onClick={() => setCustomMargin(100)}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                $100
              </button>
            </div>
          </div>

          {/* Leverage Selector */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{lang === 'my' ? 'Leverage အချိုး' : 'Leverage Multiplier'}</span>
              <span className="text-[11px] font-mono text-emerald-500 font-bold">
                Buffer: ±{(100 / customLeverage).toFixed(1)}%
              </span>
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[1, 2, 5, 10, 15, 20, 50].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setCustomLeverage(lev)}
                  className={`flex-1 min-w-[38px] py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                    customLeverage === lev
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
              <span>{lang === 'my' ? 'အကြံပြု Leverage:' : 'Noise-immune cap:'}</span>
              <strong className="text-amber-500">{dualEngine.technical.recommendedLeverage}x</strong>
            </div>
          </div>

          {/* Summary Metric Output Card */}
          <div className="md:col-span-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{lang === 'my' ? 'စုစုပေါင်း Position တန်ဖိုး' : 'Total Position Size'}:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">${positionValue.toLocaleString()} USDT</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{lang === 'my' ? 'SL ထိပါက အများဆုံး ဆုံးရှုံးငွေ' : 'Max Dollar Risk at SL'}:</span>
              <span className="font-mono font-bold text-rose-500">-${dollarLossAtSl.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{lang === 'my' ? 'TP 1 တွင် ရရှိမည့် အမြတ်ငွေ' : 'Estimated Gain at TP1'}:</span>
              <span className="font-mono font-bold text-emerald-500">+${dollarGainAtTp1.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Coin Selection & Timeframe Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Coin Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
          {coins.slice(0, 8).map((coin) => {
            const isSelected = coin.symbol === selectedCoin.symbol;
            return (
              <button
                key={coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {coin.symbol}
              </button>
            );
          })}
        </div>

        {/* Style Selector Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
          {(
            [
              { id: 'SCALPING', labelEn: 'Scalp (5m)', labelMy: 'Scalp (၅ မိနစ်)' },
              { id: 'DAY_TRADING', labelEn: 'Day (15m/1h)', labelMy: 'Day (နေ့စဉ်)' },
              { id: 'SWING', labelEn: 'Swing (4h/1D)', labelMy: 'Swing (ရက်ပိုင်း)' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStyle(s.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                selectedStyle === s.id
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'my' ? s.labelMy : s.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Executive Consensus Decision Banner (Zero Guesswork) */}
      <div
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 border shadow-sm transition-all ${
          isBuy
            ? 'bg-linear-to-r from-emerald-500/15 via-emerald-500/5 to-slate-900 border-emerald-500/30'
            : 'bg-linear-to-r from-rose-500/15 via-rose-500/5 to-slate-900 border-rose-500/30'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isBuy ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}
              >
                {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isBuy
                    ? lang === 'my'
                      ? 'ရှင်းလင်းသော အဝယ် အကြံပြုချက်: BUY (LONG)'
                      : 'CLEAR ACTION: BUY (LONG)'
                    : lang === 'my'
                    ? 'ရှင်းလင်းသော အရောင်း အကြံပြုချက်: SELL (SHORT)'
                    : 'CLEAR ACTION: SELL (SHORT)'}
                </span>
              </span>

              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-900/80 text-amber-400 border border-amber-500/30">
                Edge {edge} • {winProbability}% {lang === 'my' ? 'အနိုင်ရနိုင်ခြေ' : 'Winrate'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {lang === 'my' ? dualEngine.consensus.headlineMy : dualEngine.consensus.headlineEn}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {lang === 'my' ? dualEngine.consensus.subtextMy : dualEngine.consensus.subtextEn}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopySetup}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? (lang === 'my' ? 'ကူးယူပြီး' : 'Copied') : lang === 'my' ? 'အချက်အလက် ကူးယူရန်' : 'Copy Setup'}</span>
            </button>

            {/* Launch into Dedicated Trading Terminal with Preloaded Values */}
            <button
              onClick={() => {
                onTradeInDemo(
                  selectedCoin.symbol,
                  isBuy ? 'LONG' : 'SHORT',
                  customMargin,
                  customLeverage
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition active:scale-95 ${
                isBuy
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              <span>
                {lang === 'my'
                  ? `ဒေမို ကုန်သွယ်မှု မျက်နှာပြင်သို့ (${selectedCoin.symbol})`
                  : `Open in Demo Trading (${selectedCoin.symbol})`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. THE THREE IN-DEPTH ANALYTICAL PILLARS (ဘေးချင်းကပ် သုံးခု ခွဲခြမ်းစိတ်ဖြာချက်) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* PILLAR 1: စနစ်နှင့် AI နည်းပညာ & ခရစ်ပတို အသိပညာ စိစစ်ချက်       */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {lang === 'my' ? '၁။ နည်းပညာနှင့် ခရစ်ပတို အသိပညာ' : '1. Technical & Crypto Engine'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'my'
                    ? 'EMA Trend, RSI, MACD, Volume & Order Flow'
                    : 'Multi-timeframe trend, momentum & order flow'}
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {confidence}% Confidence
            </span>
          </div>

          {/* Indicator Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">4H Trend</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5 text-[11px] truncate">
                {dualEngine.technical.trend4h.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">RSI (14)</span>
              <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-[11px]">
                {dualEngine.technical.rsiLevel}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Funding</span>
              <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-[11px]">
                {(fundingRate * 100).toFixed(3)}%
              </div>
            </div>
          </div>

          {/* Key Execution Levels */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {lang === 'my' ? 'အကောင်းဆုံး အဝင်စျေး (Entry)' : 'Optimal Entry Price'}
              </span>
              <span className="font-mono font-black text-slate-900 dark:text-white">
                ${fmtP(dualEngine.technical.entryPrice)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">TP 1</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-[11px]">
                  ${fmtP(dualEngine.technical.tp1Price)}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">TP 2</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-[11px]">
                  ${fmtP(dualEngine.technical.tp2Price)}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">TP 3</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-[11px]">
                  ${fmtP(dualEngine.technical.tp3Price)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {lang === 'my' ? 'Stop Loss သတ်မှတ်စျေး' : 'Strict Stop Loss Level'}
              </span>
              <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                ${fmtP(dualEngine.technical.slPrice)}
              </span>
            </div>
          </div>

          {/* Detailed Technical Rationale */}
          <div className="p-3 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {lang === 'my' ? 'နည်းပညာ အဓိက အကြောင်းပြချက်:' : 'Key Technical Rationale:'}
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === 'my' ? dualEngine.technical.rationaleMy : dualEngine.technical.rationaleEn}
            </p>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* PILLAR 2: သတ်မှတ်ထားသော စည်းမျဉ်းများ စိစစ်ချက်                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {lang === 'my' ? '၂။ သတ်မှတ်ထားသော စည်းမျဉ်းများ' : '2. Established Rules Engine'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'my'
                    ? 'အရင်းအနှီးလုံခြုံရေး၊ R:R ၂.၀+၊ Drawdown & Cushion စစ်ဆေးမှု'
                    : 'Capital defense, R:R >= 2.0, max loss caps & liquidation buffer'}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                dualEngine.rules.passedCount === dualEngine.rules.totalRules
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}
            >
              {dualEngine.rules.passedCount}/{dualEngine.rules.totalRules} {lang === 'my' ? 'ကိုက်ညီ' : 'Passed'}
            </span>
          </div>

          {/* Checklist of Established Rules */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {dualEngine.rules.rules.map((rule) => {
              return (
                <div
                  key={rule.id}
                  className={`p-2.5 rounded-2xl border text-xs transition flex items-start justify-between gap-2.5 ${
                    rule.passed
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {rule.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                        {lang === 'my' ? rule.titleMy : rule.titleEn}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 pl-5 leading-tight">
                      {lang === 'my' ? rule.explanationMy : rule.explanationEn}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[11px] font-black font-mono ${
                        rule.passed ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      {rule.currentValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rules Summary Card */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-[11px]">
              <span>{lang === 'my' ? 'စည်းမျဉ်း သုံးသပ်ချက်:' : 'Discipline Verdict:'}</span>
              <span className="text-amber-500 font-mono">
                {lang === 'my' ? dualEngine.rules.verdictMy : dualEngine.rules.verdictEn}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {lang === 'my' ? dualEngine.rules.actionAdviceMy : dualEngine.rules.actionAdviceEn}
            </p>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* PILLAR 3: နည်းပညာနှင့် စည်းမျဉ်း မျှတစွာ ပေါင်းစပ်ဆုံးဖြတ်ချက်       */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {lang === 'my' ? '၃။ မျှတသော ပေါင်းစပ် ဆုံးဖြတ်ချက်' : '3. Balanced AI Consensus'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'my'
                    ? 'နည်းပညာနှင့် စည်းမျဉ်း ချိန်ညှိ၍ အတည်ပြုချက်နှင့် အမြတ်တွက်ချက်မှု'
                    : 'Harmonized verdict, financial projection & execution steps'}
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Edge {edge}
            </span>
          </div>

          {/* Financial Outcomes Table */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
              <span>{lang === 'my' ? 'ဘဏ္ဍာရေး အမြတ်/အရှုံး တွက်ချက်မှု' : 'Projected PnL Breakdown'}</span>
              <span className="text-slate-400 text-[10px]">${customMargin} × {customLeverage}x</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Stop Loss Hit:</span>
              <span className="font-mono font-bold text-rose-500">-${dollarLossAtSl.toFixed(2)} (-{((dollarLossAtSl / customMargin) * 100).toFixed(1)}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">TP 1 Hit:</span>
              <span className="font-mono font-bold text-emerald-500">+${dollarGainAtTp1.toFixed(2)} (+{((dollarGainAtTp1 / customMargin) * 100).toFixed(1)}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">TP 2 Hit:</span>
              <span className="font-mono font-bold text-emerald-500">+${dollarGainAtTp2.toFixed(2)} (+{((dollarGainAtTp2 / customMargin) * 100).toFixed(1)}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">TP 3 Hit:</span>
              <span className="font-mono font-bold text-emerald-500">+${dollarGainAtTp3.toFixed(2)} (+{((dollarGainAtTp3 / customMargin) * 100).toFixed(1)}%)</span>
            </div>
          </div>

          {/* AI Strategic Steps */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] space-y-1">
              <strong className="text-amber-500 block">
                {lang === 'my' ? 'အဆင့် ၁: စျေးဝင်ရောက်မှု' : 'Step 1: Order Execution'}
              </strong>
              <p className="text-slate-600 dark:text-slate-400">
                ${fmtP(dualEngine.technical.entryPrice)} သို့ စျေးရောက်ရှိချိန်တွင် Limit Order သို့မဟုတ် 15M candle confirm ဖြစ်ပါက {isBuy ? 'LONG' : 'SHORT'} စတင်ဖွင့်ပါ။
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] space-y-1">
              <strong className="text-emerald-500 block">
                {lang === 'my' ? 'အဆင့် ၂: အမြတ်ခွဲထုတ်မှု' : 'Step 2: Partial Take Profit'}
              </strong>
              <p className="text-slate-600 dark:text-slate-400">
                TP 1 (${fmtP(dualEngine.technical.tp1Price)}) ရောက်ရှိချိန်တွင် ၅၀% အမြတ်ယူပြီး ကျန် ၅၀% အား Stop Loss ကို Break-even စျေးသို့ ရွှေ့ပါ။
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              onTradeInDemo(
                selectedCoin.symbol,
                isBuy ? 'LONG' : 'SHORT',
                customMargin,
                customLeverage
              );
            }}
            className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-95 ${
              isBuy
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-rose-500 hover:bg-rose-400 text-white'
            }`}
          >
            <span>
              {lang === 'my'
                ? `ဒေမိုတွင် ${customMargin}$ ဖြင့် ချက်ချင်း ကုန်သွယ်မည်`
                : `Trade in Demo with $${customMargin}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
