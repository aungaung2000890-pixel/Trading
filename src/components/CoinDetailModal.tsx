import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Layers,
  Zap,
  Newspaper,
  Target,
  CheckCircle2,
  FlaskConical,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Scale,
  Sparkles,
  Bell,
} from 'lucide-react';
import { CoinOpportunity } from '../types';
import { computeDualTrackRisk } from '../utils/dualTrackRisk';

interface CoinDetailModalProps {
  coin: CoinOpportunity | null;
  onClose: () => void;
  lang: 'my' | 'en';
  walletBalance?: number;
  onWalletBalanceChange?: (bal: number) => void;
  onBacktestSetup?: (coin: CoinOpportunity) => void;
  onTradeInDemo?: (symbol: string, side: 'LONG' | 'SHORT', margin?: number, leverage?: number) => void;
  onGenerateTradeCard?: (coin: CoinOpportunity) => void;
  onOpenAI?: (mode: 'quick' | 'deep', coinSymbol: string) => void;
  onOpenPriceAlert?: (symbol: string) => void;
}

export const CoinDetailModal: React.FC<CoinDetailModalProps> = ({
  coin,
  onClose,
  lang,
  walletBalance = 2000,
  onWalletBalanceChange,
  onBacktestSetup,
  onTradeInDemo,
  onGenerateTradeCard,
  onOpenAI,
  onOpenPriceAlert,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState<'4H' | '1H' | '15M'>('15M');
  const [selectedTrack, setSelectedTrack] = useState<'user' | 'technical'>('technical');
  const [customMarginPct, setCustomMarginPct] = useState<number>(10);
  const [customLeverage, setCustomLeverage] = useState<number>(20);

  const effectiveBalance = walletBalance && walletBalance > 0 ? walletBalance : 2000;
  const userMargin = Math.round((effectiveBalance * customMarginPct) / 100);

  const dualRisk = useMemo(() => {
    if (!coin) return null;
    return computeDualTrackRisk({
      walletBalance: effectiveBalance,
      direction: coin.bias === 'SHORT' ? 'SHORT' : 'LONG',
      entryPrice: coin.currentPrice,
      userMargin,
      userLeverage: customLeverage,
      change24h: coin.change24h,
      coin: coin.symbol,
    });
  }, [effectiveBalance, coin, userMargin, customLeverage]);

  if (!coin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-500 text-sm">
              #{coin.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {coin.pair}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {coin.name}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                    coin.bias === 'LONG'
                      ? 'bg-emerald-500 text-white'
                      : coin.bias === 'SHORT'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  BIAS: {coin.bias}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'my'
                  ? 'အသေးစိတ် Technical Analysis (4H / 1H / 15M) နှင့် စျေးကွက် Catalyst'
                  : 'Multi-Timeframe Structure (4H / 1H / 15M) & Catalyst Analysis'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBacktestSetup && (
              <button
                id="modal-header-backtest-btn"
                onClick={() => {
                  onBacktestSetup(coin);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                title={lang === 'my' ? 'Backtesting Lab တွင် စစ်ဆေးမည်' : 'Backtest Setup in Lab'}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {lang === 'my' ? 'Backtest Setup စစ်ဆေးမည်' : 'Backtest Setup'}
                </span>
                <span className="sm:hidden">Backtest</span>
              </button>
            )}

            <button
              id="close-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-400">{lang === 'my' ? 'လက်ရှိစျေးနှုန်း' : 'Current Price'}</div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {coin.priceFormatted}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-400">{lang === 'my' ? '၂၄ နာရီပြောင်းလဲမှု' : '24h Change'}</div>
              <div
                className={`text-base font-bold font-mono ${
                  coin.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {coin.change24h > 0 ? '+' : ''}
                {coin.change24h.toFixed(2)}%
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-400">{lang === 'my' ? 'Futures Volume' : 'Futures Volume'}</div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {coin.volumeFormatted}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-400">{lang === 'my' ? 'Funding Rate' : 'Funding Rate'}</div>
              <div className="text-base font-bold font-mono text-amber-500">
                {coin.fundingFormatted}
              </div>
            </div>
          </div>

          {/* Timeframe Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>{lang === 'my' ? 'အချိန်ကာလအလိုက် စျေးကွက်ဖွဲ့စည်းပုံ' : 'Multi-Timeframe Structure'}</span>
              </div>

              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {(['4H', '1H', '15M'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      activeTimeframe === tf
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tf} Timeframe
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Content */}
            {activeTimeframe === '4H' && (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-500">4H Trend</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {coin.technical.timeframe4h.trend}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">Market Structure:</div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {coin.technical.timeframe4h.structure}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-emerald-600">Major Support:</span>
                    <div className="text-xs font-mono font-semibold mt-0.5">
                      {coin.technical.timeframe4h.support}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-rose-600">Major Resistance:</span>
                    <div className="text-xs font-mono font-semibold mt-0.5">
                      {coin.technical.timeframe4h.resistance}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTimeframe === '1H' && (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-500">1H Trend</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {coin.technical.timeframe1h.trend}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">BOS / CHoCH / MSS:</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {coin.technical.timeframe1h.bosChoch}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Momentum (RSI / MACD):</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {coin.technical.timeframe1h.momentum}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Breakout / Pullback Setup:</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                    {coin.technical.timeframe1h.setup}
                  </p>
                </div>
              </div>
            )}

            {activeTimeframe === '15M' && (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-500">{lang === 'my' ? 'လက်ရှိ 15M Setup' : 'Immediate 15M Setup'}</span>
                  <span className="text-xs font-bold text-amber-500">
                    {coin.technical.timeframe15m.keyLevel}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">Market Dynamics:</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                    {coin.technical.timeframe15m.immediateSetup}
                  </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {lang === 'my' ? 'ENTRY TRIGGER / သတိပြုရန်:' : 'ENTRY TRIGGER:'}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-medium">
                    {coin.technical.timeframe15m.entryTrigger}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* News and Catalysts */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Newspaper className="w-4 h-4 text-indigo-500" />
              <span>{lang === 'my' ? 'သတင်းနှင့် စျေးကွက် Catalyst (NEWS & CATALYSTS)' : 'NEWS & CATALYST RADAR'}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {lang === 'my' ? coin.newsCatalystMy : coin.newsCatalyst}
            </p>
          </div>

          {/* 10% Price Movement Feasibility */}
          <div className="bg-emerald-500/5 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>10% PRICE MOVEMENT TEST</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-500 text-white">
                FEASIBILITY: {coin.feasibility10Percent}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {coin.feasibilityReason}
            </p>
          </div>

          {/* DUAL-TRACK RISK & SIZING COMPARISON (ငါ့စည်းမျဉ်း VS မင်းရွေးချယ်မှု) */}
          {dualRisk && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-sans">
                    {lang === 'my' ? 'Futures Sizing: ငါ့စည်းမျဉ်း VS မင်းရွေးချယ်မှု' : 'Dual-Track Sizing Comparison'}
                  </span>
                </div>

                {/* Wallet Balance Display & Quick Input */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Wallet className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] text-slate-400 font-sans">{lang === 'my' ? 'Wallet:' : 'Wallet:'}</span>
                    <span className="text-xs font-mono font-bold text-white">${effectiveBalance.toLocaleString()}</span>
                  </div>
                  {onWalletBalanceChange && (
                    <div className="flex gap-1">
                      {[1000, 2000, 5000].map((bal) => (
                        <button
                          key={bal}
                          onClick={() => onWalletBalanceChange(bal)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                            effectiveBalance === bal
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          ${bal >= 1000 ? `${bal / 1000}k` : bal}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Side-by-Side Dual-Track Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
                {/* Track 1: ငါ့စည်းမျဉ်း (User Rules) */}
                <div
                  onClick={() => setSelectedTrack('user')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedTrack === 'user'
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="text-xs font-black text-amber-400">
                        {lang === 'my' ? '👤 ငါ့စည်းမျဉ်း (My Rules)' : '👤 My Rules (Custom)'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        selectedTrack === 'user'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {selectedTrack === 'user' ? '✓ ရွေးချယ်ထားသည်' : 'နှိပ်၍ ရွေးမည်'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans">Margin:</div>
                      <div className="text-sm font-black text-white">${userMargin}</div>
                      <div className="text-[9px] text-slate-500 font-sans">({customMarginPct}% Balance)</div>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans">Leverage:</div>
                      <div className="text-sm font-black text-amber-400">{customLeverage}x</div>
                      <div className="text-[9px] text-slate-500 font-sans">Notional: ${dualRisk.user.notional}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono bg-slate-900/70 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">SL Loss (-2%):</span>
                      <span className="text-rose-400 font-bold">-${dualRisk.user.dollarLoss.toFixed(2)} (-{dualRisk.user.accountLossPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">TP Gain (+10%):</span>
                      <span className="text-emerald-400 font-bold">+${dualRisk.user.dollarProfit.toFixed(2)} (+{dualRisk.user.accountGainPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Risk/Reward:</span>
                      <span className="text-white font-bold">1 : {dualRisk.user.riskReward.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Track 2: မင်းရွေးချယ်မှု (Pro Technical AI) */}
                <div
                  onClick={() => setSelectedTrack('technical')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedTrack === 'technical'
                      ? 'bg-emerald-500/10 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-black text-emerald-400">
                        {lang === 'my' ? '🤖 မင်းရွေးချယ်မှု (Technical)' : '🤖 System Recommendation'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        selectedTrack === 'technical'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {selectedTrack === 'technical' ? '✓ ရွေးချယ်ထားသည်' : 'နှိပ်၍ ရွေးမည်'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans">Preservation Margin:</div>
                      <div className="text-sm font-black text-emerald-400">${dualRisk.technical.recommendedMargin}</div>
                      <div className="text-[9px] text-emerald-500/80 font-sans">Capital Safe (1.5%)</div>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans">ATR Safe Leverage:</div>
                      <div className="text-sm font-black text-emerald-400">{dualRisk.technical.recommendedLeverage}x</div>
                      <div className="text-[9px] text-slate-500 font-sans">Wick-Immune</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono bg-slate-900/70 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">SL Loss (Preserve):</span>
                      <span className="text-rose-400 font-bold">-${dualRisk.technical.recommendedDollarLoss.toFixed(2)} (-{dualRisk.technical.recommendedAccountLossPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">TP Gain (+10%):</span>
                      <span className="text-emerald-400 font-bold">+${dualRisk.technical.recommendedDollarProfit.toFixed(2)} (+{dualRisk.technical.recommendedAccountGainPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Risk/Reward:</span>
                      <span className="text-white font-bold">1 : {dualRisk.technical.riskReward.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-emerald-400/90 font-sans line-clamp-1">
                    {lang === 'my' ? dualRisk.technical.leverageLogicMy : dualRisk.technical.leverageLogic}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Direct Trade Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Trade Buttons with Active Selected Track */}
            {onTradeInDemo && dualRisk && (
              <>
                <button
                  id="modal-trade-long-btn"
                  onClick={() => {
                    const chosenMargin = selectedTrack === 'user' ? userMargin : dualRisk.technical.recommendedMargin;
                    const chosenLeverage = selectedTrack === 'user' ? customLeverage : dualRisk.technical.recommendedLeverage;
                    onTradeInDemo(coin.symbol, 'LONG', chosenMargin, chosenLeverage);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                  <span>
                    LONG ({selectedTrack === 'user' ? `${userMargin}$ • ${customLeverage}x` : `${dualRisk.technical.recommendedMargin}$ • ${dualRisk.technical.recommendedLeverage}x`})
                  </span>
                </button>

                <button
                  id="modal-trade-short-btn"
                  onClick={() => {
                    const chosenMargin = selectedTrack === 'user' ? userMargin : dualRisk.technical.recommendedMargin;
                    const chosenLeverage = selectedTrack === 'user' ? customLeverage : dualRisk.technical.recommendedLeverage;
                    onTradeInDemo(coin.symbol, 'SHORT', chosenMargin, chosenLeverage);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-rose-500/20 active:scale-95 transition cursor-pointer"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                  <span>
                    SHORT ({selectedTrack === 'user' ? `${userMargin}$ • ${customLeverage}x` : `${dualRisk.technical.recommendedMargin}$ • ${dualRisk.technical.recommendedLeverage}x`})
                  </span>
                </button>
              </>
            )}

            {onOpenAI && (
              <>
                <button
                  id="modal-ai-quick-btn"
                  onClick={() => {
                    onOpenAI('quick', coin.symbol);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{lang === 'my' ? '⚡ AI Quick Trade' : '⚡ AI Quick'}</span>
                </button>
                <button
                  id="modal-ai-deep-btn"
                  onClick={() => {
                    onOpenAI('deep', coin.symbol);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/40 text-xs font-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'my' ? '🧠 AI Deep (24 pts)' : '🧠 AI Deep'}</span>
                </button>
              </>
            )}

            {onOpenPriceAlert && (
              <button
                id="modal-set-price-alert-btn"
                onClick={() => {
                  onOpenPriceAlert(coin.symbol);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                title={lang === 'my' ? 'စျေးနှုန်းသတိပေးချက် သတ်မှတ်မည်' : 'Set Price Alert'}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'Price Alert သတ်မှတ်မည်' : 'Set Price Alert'}</span>
              </button>
            )}

            {onGenerateTradeCard && (
              <button
                id="modal-generate-trade-card-btn"
                onClick={() => {
                  onGenerateTradeCard(coin);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'my' ? 'Trade Card ထုတ်မည်' : 'Trade Card'}</span>
              </button>
            )}

            {onBacktestSetup && (
              <button
                id="modal-footer-backtest-btn"
                onClick={() => {
                  onBacktestSetup(coin);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'Backtest Setup' : 'Backtest'}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer ml-auto"
          >
            {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
