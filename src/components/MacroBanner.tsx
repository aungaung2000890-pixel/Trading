import React, { useState } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Activity,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { MACRO_DATA } from '../data/staticAnalysis';
import { DualTime } from '../utils/time';
import { LiveFearAndGreedData, LiveTickerItem } from '../types';

interface MacroBannerProps {
  lang: 'my' | 'en';
  lastScannedTime?: DualTime;
  fearAndGreed?: LiveFearAndGreedData | null;
  tickers?: LiveTickerItem[];
}

// Sparkline points for each macro metric (7-point normalized trend)
const SPARKLINE_DATA: Record<string, { points: number[]; trend: 'up' | 'down' | 'flat'; delta: string; color: string; actionableHintEn: string; actionableHintMy: string }> = {
  'CPI (YoY)': {
    points: [3.1, 3.2, 3.2, 3.3, 3.4, 3.4, 3.4],
    trend: 'up',
    delta: '+0.1%',
    color: '#f59e0b',
    actionableHintEn: 'Sticky inflation keeps Fed rate cuts deferred; suppresses high-risk altcoins.',
    actionableHintMy: 'ငွေကြေးဖောင်းပွမှု မကျသေးသဖြင့် အတိုးနှုန်းလျှော့ချခြင်း နောက်ကျမည်။ High-risk altcoins ရှောင်ပါ။',
  },
  'Core PCE (MoM)': {
    points: [0.2, 0.2, 0.3, 0.3, 0.28, 0.3, 0.3],
    trend: 'flat',
    delta: '+0.02%',
    color: '#f59e0b',
    actionableHintEn: 'In line with forecasts. No dovish surprises expected in the immediate 48h.',
    actionableHintMy: 'ခန့်မှန်းချက်နှင့် ကိုက်ညီသည်။ လာမည့် ၄၈ နာရီအတွင်း အတိုးနှုန်း အပြောင်းအလဲ မျှော်လင့်ရခက်သည်။',
  },
  'Fed Funds Rate': {
    points: [5.25, 5.25, 5.25, 5.5, 5.5, 5.5, 5.5],
    trend: 'flat',
    delta: '0.0%',
    color: '#60a5fa',
    actionableHintEn: '88% probability priced in for pause/25bps move. Dollar liquidity remains tight.',
    actionableHintMy: '၈၈% အတည်ပြုနှုန်းထား။ Dollar liquidity တင်းကျပ်နေဆဲဖြစ်၍ အရစ်ကျသာ ဝင်သင့်သည်။',
  },
  'BTC Dominance': {
    points: [55.2, 56.1, 56.8, 57.4, 57.9, 58.2, 58.4],
    trend: 'up',
    delta: '+1.4%',
    color: '#10b981',
    actionableHintEn: 'Dominance climbing to 58.4%. Altcoins bleed against BTC; only trade top volume pairs.',
    actionableHintMy: 'BTC Dominance 58.4% သို့ တက်နေသည်။ Altcoins များ အားနည်းသဖြင့် Volume အကြီးဆုံးများသာ ကုန်သွယ်ပါ။',
  },
  'Total Crypto 24h Vol': {
    points: [110, 115, 128, 134, 140, 138, 142],
    trend: 'up',
    delta: '+8.2B',
    color: '#10b981',
    actionableHintEn: 'Healthy institutional liquidity. Tight bid-ask spreads on Top 10 coins.',
    actionableHintMy: 'အရောင်းအဝယ်ပမာဏ ကောင်းမွန်ပြီး Spread ကျဉ်းသဖြင့် Top 10 coins များ စိတ်ချရသည်။',
  },
  'Global Liquidations 24h': {
    points: [90, 110, 180, 145, 160, 130, 145],
    trend: 'down',
    delta: '-15M',
    color: '#ef4444',
    actionableHintEn: '$145M flushed (68% Longs). Leveraged longs wiped; setup for local liquidity retest.',
    actionableHintMy: '$145M ဖျက်သိမ်းခံရ (Long ၆၈%)။ Over-leveraged Long များ ပြုတ်သွားသဖြင့် ပြန်လှည့်တက်ရန် အခွင့်အလမ်းရှိ။',
  },
};

export const MacroBanner: React.FC<MacroBannerProps> = ({
  lang,
  lastScannedTime,
  fearAndGreed,
  tickers = [],
}) => {
  const [selectedMacroIdx, setSelectedMacroIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'breakdown'>('radar');

  const isMy = lang === 'my';

  const btcTicker = tickers.find((t) => t.symbol.toUpperCase() === 'BTC');

  // Overall Macro Friction Score (0 = Calm Bullish, 100 = Severe Drag/Risk)
  // Dynamically blend with Fear & Greed: When market is neutral/greedy, friction lowers
  const fngVal = fearAndGreed?.value ?? 51;
  const macroFrictionScore = Math.max(15, Math.min(90, Math.round(100 - fngVal * 0.4 - 10)));
  const gaugeCircumference = 2 * Math.PI * 34; // r = 34
  const gaugeOffset = gaugeCircumference - (macroFrictionScore / 100) * gaugeCircumference;

  return (
    <section className="bg-slate-900/95 dark:bg-slate-950 text-slate-100 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl w-full max-w-full overflow-hidden backdrop-blur-md">
      {/* Top Header: Title, Regime Badge & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {isMy ? 'BLOOMBERG MACRO RADAR' : 'TERMINAL MACRO RADAR'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isMy ? 'REGIME: DEFENSIVE / PRE-FOMC' : 'REGIME: DEFENSIVE / PRE-FOMC'}
              </span>
              {lastScannedTime && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{lastScannedTime.mmtTime} MMT</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
              {isMy
                ? 'စက်တင်ဘာ FOMC အစည်းအဝေးမတိုင်မီ CPI 3.4% ကြောင့် အတိုးနှုန်းတက်ရန် 88% အလားအလာရှိနေသဖြင့် BTC Dominance 58.4% တွင် တင်းခံထားပြီး Altcoins များတွင် ရွေးချယ်မှုအလွန်ကျဉ်းမြောင်းသည်။'
                : 'Pre-FOMC environment with CPI at 3.4% holding Fed rate odds high. BTC Dominance at 58.4% channels liquidity strictly to high-cap leaders.'}
            </p>
          </div>
        </div>

        {/* View Switcher / Fast Stats */}
        <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{isMy ? 'Radar' : 'Radar'}</span>
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'breakdown'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isMy ? 'Metrics' : 'Metrics'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Matrix */}
      {activeTab === 'radar' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3.5 items-center">
          {/* Left: Radial Macro Friction Gauge (4 cols) */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                {/* Background Track */}
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="7"
                />
                {/* Friction Fill Arc */}
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="transparent"
                  stroke="url(#macroGradient)"
                  strokeWidth="7"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="macroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-black font-mono text-amber-400">{macroFrictionScore}</span>
                <span className="text-[8px] font-mono uppercase text-slate-400">FRICTION</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1">
                <span>{isMy ? 'စျေးကွက် ဖိအားညွှန်းကိန်း' : 'Market Friction Index'}</span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                {isMy ? '⚠️ Defensive (အထိုင်စောင့်ဆိုင်း)' : '⚠️ Defensive (Wait for Triggers)'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                {isMy ? 'Leverage ကို 10x အောက်သာ သုံးရန်နှင့် Breakout အတုများကို သတိထားရန် အကြံပြုသည်။' : 'High leverage faces acute shakeout risks. Restrict exposure to ≤10x.'}
              </p>
            </div>
          </div>

          {/* Right: Interactive 4 Key Macro Gauges (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* BTC Live Price / DOM */}
            <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 transition">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{btcTicker ? 'BTC LIVE' : 'BTC DOM'}</span>
                <span className={btcTicker && btcTicker.change24h >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {btcTicker ? `${btcTicker.change24h >= 0 ? '+' : ''}${btcTicker.change24h.toFixed(1)}%` : '+1.4%'}
                </span>
              </div>
              <div className="text-sm font-black font-mono text-white mt-1">
                {btcTicker ? btcTicker.priceFormatted : '58.4%'}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: btcTicker ? '68%' : '78%' }}
                />
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-1">
                {btcTicker ? 'Binance Futures Real-Time' : 'Target Zone: 60%'}
              </div>
            </div>

            {/* Official Fear & Greed Index */}
            <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 transition">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>FEAR & GREED</span>
                <span className="text-amber-400 font-bold">
                  {fearAndGreed?.classification || 'Neutral'}
                </span>
              </div>
              <div className="text-sm font-black font-mono text-amber-400 mt-1 flex items-baseline gap-1">
                <span>{fearAndGreed?.value ?? 51}</span>
                <span className="text-[10px] text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    (fearAndGreed?.value ?? 51) >= 55
                      ? 'bg-emerald-500'
                      : (fearAndGreed?.value ?? 51) <= 45
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${fearAndGreed?.value ?? 51}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-1">
                Prev Close: {fearAndGreed?.previousClose ?? 69}
              </div>
            </div>

            {/* FOMC Rate Probability */}
            <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 transition">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>FOMC ODDS</span>
                <span className="text-amber-400 font-bold">88%</span>
              </div>
              <div className="text-sm font-black font-mono text-white mt-1">5.50%</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '88%' }} />
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-1">Pause/Hold Expected</div>
            </div>

            {/* 24h Liquidations */}
            <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 transition">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>24H FLUSH</span>
                <span className="text-red-400 font-bold">68% L</span>
              </div>
              <div className="text-sm font-black font-mono text-red-400 mt-1">$145M</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
                <div className="bg-red-500 h-full" style={{ width: '68%' }} title="Longs Rekt: 68%" />
                <div className="bg-emerald-500 h-full" style={{ width: '32%' }} title="Shorts Rekt: 32%" />
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-1">Long Squeeze Bias</div>
            </div>
          </div>
        </div>
      ) : (
        /* Breakdown View with Sparkline Curves */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3.5">
          {MACRO_DATA.map((macro, idx) => {
            const meta = SPARKLINE_DATA[macro.name] || {
              points: [1, 2, 3, 2, 4, 3, 5],
              trend: 'flat',
              delta: '0.0%',
              color: '#94a3b8',
              actionableHintEn: macro.detail,
              actionableHintMy: macro.detailMy,
            };

            const isSelected = selectedMacroIdx === idx;

            // Generate simple SVG path for sparkline
            const min = Math.min(...meta.points);
            const max = Math.max(...meta.points);
            const range = max - min || 1;
            const w = 55;
            const h = 20;
            const coords = meta.points.map((p, i) => {
              const x = (i / (meta.points.length - 1)) * w;
              const y = h - ((p - min) / range) * (h - 4) - 2;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            });
            const pathData = `M ${coords.join(' L ')}`;

            return (
              <div
                key={idx}
                onClick={() => setSelectedMacroIdx(isSelected ? null : idx)}
                className={`bg-slate-950/80 border rounded-xl p-2.5 transition cursor-pointer relative group ${
                  isSelected
                    ? 'border-amber-500/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono font-medium text-slate-400 truncate">{macro.name}</div>
                  <span className="text-[9px] font-mono font-bold" style={{ color: meta.color }}>
                    {meta.delta}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-xs font-mono font-bold text-white truncate">{macro.value}</div>
                  {/* Micro Sparkline */}
                  <svg width={w} height={h} className="shrink-0 overflow-visible opacity-80 group-hover:opacity-100 transition">
                    <path
                      d={pathData}
                      fill="none"
                      stroke={meta.color}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="text-[9px] text-slate-400 mt-1 line-clamp-1 group-hover:line-clamp-none transition">
                  {isMy ? macro.detailMy : macro.detail}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actionable Playbook Note for Selected Item or Default */}
      <div className="mt-3 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] leading-tight">
            <strong>{isMy ? 'ကုန်သွယ်မှု အကြံပြုချက်:' : 'Trader Playbook:'}</strong>{' '}
            {selectedMacroIdx !== null
              ? (isMy ? SPARKLINE_DATA[MACRO_DATA[selectedMacroIdx]?.name]?.actionableHintMy : SPARKLINE_DATA[MACRO_DATA[selectedMacroIdx]?.name]?.actionableHintEn)
              : (isMy
                ? 'FOMC မတိုင်မီ Altcoins များတွင် 30x ကဲ့သို့ High Leverage အသုံးမပြုပါနှင့်။ 3.3% Adverse Move ဖြင့် Liquidation ဖြစ်နိုင်သည်။'
                : 'Prior to FOMC, avoid >10x leverage on altcoins. A 3.3% shakeout triggers liquidation on overextended longs.')}
          </span>
        </div>
        {selectedMacroIdx !== null && (
          <button
            onClick={() => setSelectedMacroIdx(null)}
            className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
          >
            {isMy ? 'ပိတ်မည်' : 'Clear'}
          </button>
        )}
      </div>
    </section>
  );
};
