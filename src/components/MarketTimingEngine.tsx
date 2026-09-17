import React, { useState, useEffect } from 'react';
import {
  Timer,
  Activity,
  AlertTriangle,
  Zap,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { MarketTimingAssessment, EconomicNewsEvent, CryptoNewsCatalyst } from '../types';
import { evaluateMarketTiming } from '../utils/marketTiming';

interface MarketTimingEngineProps {
  language: 'en' | 'my';
  onNavigateToNews?: () => void;
}

export const MarketTimingEngine: React.FC<MarketTimingEngineProps> = ({
  language,
  onNavigateToNews,
}) => {
  const [timing, setTiming] = useState<MarketTimingAssessment>(evaluateMarketTiming());
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'catalysts' | 'formula'>('overview');
  const [selectedSessionId, setSelectedSessionId] = useState<'asia' | 'london' | 'ny' | 'overlap' | null>(null);

  // Re-evaluate every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTiming(evaluateMarketTiming());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Compute UTC hour progress for timeline cursor
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const utcTimelinePercent = Math.min(100, Math.max(0, (utcHours / 24) * 100));
  const utcTimeString = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`;

  const getStatusBadge = () => {
    switch (timing.windowStatus) {
      case 'PRIME':
        return {
          labelEn: '🟢 PRIME TRADING WINDOW',
          labelMy: '🟢 PRIME — အခွင့်အလမ်း အကောင်းဆုံးအချိန်',
          descEn: 'High institutional participation, tight spreads, and optimal breakout continuation.',
          descMy: 'ငွေဖြစ်လွယ်မှု အမြင့်ဆုံးနှင့် Trend အတိုင်း ခိုင်မာစွာ စီးမျောနိုင်သော အကောင်းဆုံး အချိန်ကာလ။',
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-950/40',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'CAUTION':
        return {
          labelEn: '🟡 CAUTION TRADING WINDOW',
          labelMy: '🟡 CAUTION — သတိထားကုန်သွယ်ရမည့်အချိန်',
          descEn: 'Lower liquidity or range-bound consolidation. Strict confirmation required.',
          descMy: 'စျေးကွက် အပိုင်းအခြား (Range) အတွင်း ချီတုံချတုံဖြစ်နေနိုင်သည်။ သေချာမှသာ ဝင်ပါ။',
          border: 'border-amber-500/50',
          bg: 'bg-amber-950/40',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'AVOID':
        return {
          labelEn: '🔴 AVOID WINDOW — HIGH EVENT RISK',
          labelMy: '🔴 AVOID — စျေးကွက်ရှောင်ရှားရမည့်အချိန် (သတင်းအန္တရာယ်)',
          descEn: 'Major economic catalyst imminent. Do not enter high leverage blindly.',
          descMy: 'အရေးကြီးသတင်းထွက်ပေါ်ချိန်ဖြစ်၍ အော်ဒါအသစ်မဖွင့်ဘဲ ဘေးမှ စောင့်ကြည့်သင့်ပါသည်။',
          border: 'border-rose-500/50',
          bg: 'bg-rose-950/40',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'WAIT':
      default:
        return {
          labelEn: '⚪ WAIT — NO STRUCTURAL SETUP',
          labelMy: '⚪ WAIT — အတည်ပြုချက် စောင့်ဆိုင်းပါ',
          descEn: 'Preserving capital is the highest priority when market conditions are unclear.',
          descMy: 'အရင်းအနှီးကို မဆုံးရှုံးစေရန် မဝင်ဘဲ စောင့်ဆိုင်းခြင်းသည် အကောင်းဆုံး ဖြစ်သည်။',
          border: 'border-slate-700',
          bg: 'bg-slate-900/60',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md p-3.5 sm:p-5 md:p-6 mb-4 sm:mb-6">
      {/* Top Banner with Timing Score and Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <Timer className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {language === 'my' ? 'စျေးကွက် အချိန်ကိုက် တိုင်းတာမှု အင်ဂျင်' : 'Market Timing Engine'}
              </h3>
              <span className={`px-2.5 py-0.5 text-[11px] sm:text-xs font-bold tracking-wider rounded-full border ${statusInfo.badgeBg}`}>
                {language === 'my' ? statusInfo.labelMy : statusInfo.labelEn}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'my' ? timing.currentSessionSummaryMy : timing.currentSessionSummary}
            </p>
          </div>
        </div>

        {/* Radial Timing Quality Meter */}
        <div className="flex items-center justify-between sm:justify-end gap-3 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 w-full sm:w-auto shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
              {language === 'my' ? 'အချိန်ကိုက် ရမှတ်' : 'TIMING SCORE'}
            </span>
            <div className="flex items-baseline gap-1 justify-start sm:justify-end">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-400">
                {timing.timingScore.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">/ 10</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 block sm:text-right">
              {timing.timingScore >= 7.5 ? '● HIGH CONVICTION' : '● SELECTIVE ONLY'}
            </span>
          </div>

          {/* Mini Circular Progress */}
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#1e293b" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={timing.timingScore >= 7.5 ? '#10b981' : timing.timingScore >= 5.5 ? '#f59e0b' : '#ef4444'}
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 * (1 - timing.timingScore / 10)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-black text-white">
              {Math.round((timing.timingScore / 10) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 mb-4 border-b border-slate-800/80 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {language === 'my' ? 'အကျဉ်းချုပ် (Overview)' : 'Timing Overview'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {language === 'my' ? 'စီးပွားရေး သတင်းပြက္ခဒိန် (Macro News)' : 'Economic Events'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('catalysts')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'catalysts'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {language === 'my' ? 'Crypto အထူးသတင်းများ (Catalysts)' : 'Crypto Catalysts'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('formula')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'formula'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {language === 'my' ? 'သတင်း + နည်းပညာ အတည်ပြုဖော်မြူလာ' : 'News + Tech Formula'}
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Key Metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {language === 'my' ? 'စျေးကွက် ငွေဖြစ်လွယ်မှု' : 'MARKET LIQUIDITY'}
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {timing.volumeLevel === 'HIGH' ? '🟢 VERY HIGH' : timing.volumeLevel === 'MEDIUM' ? '🟡 MODERATE' : '⚪ LOW'}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {language === 'my' ? 'Crypto လှိုင်းခတ်မှု' : 'BTC VOLATILITY'}
              </span>
              <span className="text-sm font-bold text-amber-400">
                {timing.btcVolatility === 'HIGH' ? '🔥 HIGH EXPANSION' : '⚡ STABLE RANGE'}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {language === 'my' ? 'Forex စက်ရှင်အရှိန်' : 'FOREX VOLATILITY'}
              </span>
              <span className="text-sm font-bold text-cyan-400">
                {timing.forexVolatility === 'HIGH' ? '🚀 LONDON/NY ACTIVE' : '💤 INTER-SESSION'}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {language === 'my' ? 'သတင်းအန္တရာယ်' : 'EVENT NEWS RISK'}
              </span>
              <span className={`text-sm font-bold ${timing.newsRiskLevel === 'EXTREME' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {timing.newsRiskLevel}
              </span>
            </div>
          </div>

          {/* 24-Hour Global Session Timeline & Heatmap Bar (Bloomberg/Bybit Terminal Style) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  {language === 'my' ? '၂၄ နာရီ ကမ္ဘာ့ကုန်သွယ်မှု စက်ရှင် အချိန်ဇယား (24H Timeline)' : '24-Hour Global Trading Session Radar'}
                </h4>
              </div>

              {/* Current Time Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>CURRENT: {utcTimeString}</span>
                </span>
              </div>
            </div>

            {/* Interactive Session Switcher Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedSessionId(selectedSessionId === 'asia' ? null : 'asia')}
                className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                  selectedSessionId === 'asia'
                    ? 'bg-blue-500/15 border-blue-500/60 ring-1 ring-blue-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-blue-400 font-bold">ASIA / TOKYO</span>
                  <span className="text-slate-500">00-09 UTC</span>
                </div>
                <div className="text-[11px] font-bold mt-0.5 truncate">
                  {language === 'my' ? 'အာရှ စက်ရှင် (Range)' : 'Range Building'}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">Vol: ~22% | Spread: Normal</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSessionId(selectedSessionId === 'london' ? null : 'london')}
                className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                  selectedSessionId === 'london'
                    ? 'bg-indigo-500/15 border-indigo-500/60 ring-1 ring-indigo-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-indigo-400 font-bold">LONDON / EU</span>
                  <span className="text-slate-500">07-16 UTC</span>
                </div>
                <div className="text-[11px] font-bold mt-0.5 truncate">
                  {language === 'my' ? 'လန်ဒန် စက်ရှင် (Trend)' : 'Trend Ignition'}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">Vol: ~38% | Judas Swings</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSessionId(selectedSessionId === 'ny' ? null : 'ny')}
                className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                  selectedSessionId === 'ny'
                    ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-400 font-bold">NEW YORK / US</span>
                  <span className="text-slate-500">12-21 UTC</span>
                </div>
                <div className="text-[11px] font-bold mt-0.5 truncate">
                  {language === 'my' ? 'နယူးယောက် (Expansion)' : 'Max Institutional'}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">Vol: ~45% | High Impact</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSessionId(selectedSessionId === 'overlap' ? null : 'overlap')}
                className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                  selectedSessionId === 'overlap'
                    ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold">LDN + NY GOLDEN</span>
                  <span className="text-emerald-400 font-bold">12-16 UTC</span>
                </div>
                <div className="text-[11px] font-bold mt-0.5 truncate text-emerald-400">
                  {language === 'my' ? '★ ထပ်တူကျ အမြင့်ဆုံး' : '★ Peak Overlap'}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">Liquidity 9.8/10 | Prime</div>
              </button>
            </div>

            {/* Visual 24-Hour Timeline Bar */}
            <div className="relative pt-6 pb-2">
              {/* Animated Live UTC Cursor */}
              <div
                className="absolute top-0 transform -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-all duration-1000"
                style={{ left: `${utcTimelinePercent}%` }}
              >
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-black bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30">
                  NOW
                </span>
                <div className="w-0.5 h-12 bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              </div>

              {/* Multi-Track Session Bars */}
              <div className="relative h-6 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex">
                {/* Asia Track: 00:00 to 09:00 UTC (37.5%) */}
                <div
                  className="h-full bg-blue-500/25 border-r border-blue-500/40 relative flex items-center justify-center text-[9px] font-mono font-bold text-blue-300 truncate px-1"
                  style={{ width: '37.5%' }}
                  title="Asia Session: 00:00 - 09:00 UTC"
                >
                  ASIA (00-09)
                </div>

                {/* Gap 09:00 to 12:00: London Solo */}
                <div
                  className="h-full bg-indigo-500/30 border-r border-indigo-500/40 relative flex items-center justify-center text-[9px] font-mono font-bold text-indigo-300 truncate px-1"
                  style={{ width: '12.5%' }}
                  title="London Morning: 07:00 - 12:00 UTC"
                >
                  LDN
                </div>

                {/* Overlap: 12:00 to 16:00 UTC (16.6%) */}
                <div
                  className="h-full bg-gradient-to-r from-emerald-500/40 via-amber-500/30 to-emerald-500/40 border-r border-emerald-500/60 relative flex items-center justify-center text-[9px] font-mono font-black text-emerald-300 truncate px-1 shadow-inner"
                  style={{ width: '16.6%' }}
                  title="Golden Overlap: 12:00 - 16:00 UTC"
                >
                  ★ OVERLAP (12-16)
                </div>

                {/* NY Afternoon: 16:00 to 21:00 UTC (20.8%) */}
                <div
                  className="h-full bg-amber-500/25 border-r border-amber-500/40 relative flex items-center justify-center text-[9px] font-mono font-bold text-amber-300 truncate px-1"
                  style={{ width: '20.8%' }}
                  title="NY Session: 16:00 - 21:00 UTC"
                >
                  NY (16-21)
                </div>

                {/* Off-Hours: 21:00 to 24:00 UTC (12.5%) */}
                <div
                  className="h-full bg-slate-950/60 relative flex items-center justify-center text-[8px] font-mono text-slate-500 truncate px-1"
                  style={{ width: '12.5%' }}
                  title="Pacific / Inter-session quiet hours"
                >
                  OFF
                </div>
              </div>

              {/* Hourly Grid Ticks */}
              <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-1 px-0.5">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span className="text-emerald-400 font-bold">12:00 UTC</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>24:00</span>
              </div>

              {/* Volume Profile Heatmap Strip */}
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                  <span>LIQUIDITY VOLUME HEATMAP</span>
                  <span className="text-emerald-400 font-bold">PEAK AT 13:30 - 15:30 UTC</span>
                </div>
                <div className="grid grid-cols-24 gap-0.5 h-2">
                  {[2, 3, 3, 2, 2, 3, 4, 6, 7, 7, 6, 8, 10, 10, 9, 8, 7, 6, 5, 4, 3, 2, 2, 2].map((lvl, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xs transition ${
                        lvl >= 9
                          ? 'bg-emerald-400'
                          : lvl >= 7
                          ? 'bg-amber-400'
                          : lvl >= 5
                          ? 'bg-blue-400'
                          : 'bg-slate-800'
                      }`}
                      title={`Hour ${idx}:00 UTC - Vol Level ${lvl}/10`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Session Drill-Down Card */}
            {selectedSessionId && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                    {selectedSessionId === 'asia'
                      ? 'Asia/Tokyo Session Characteristics'
                      : selectedSessionId === 'london'
                      ? 'London/Frankfurt Session Characteristics'
                      : selectedSessionId === 'ny'
                      ? 'New York Session Characteristics'
                      : 'London + NY Golden Overlap Playbook'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSessionId(null)}
                    className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedSessionId === 'asia'
                    ? (language === 'my'
                      ? 'အာရှစက်ရှင်သည် များသောအားဖြင့် Support/Resistance ဘောင်အတွင်း လှုပ်ရှားသည်။ London စဖွင့်ချိန်တွင် အာရှ High/Low များကို Liquidity Sweep လုပ်လေ့ရှိသည်။'
                      : 'Consolidation and range creation. Watch for London open to sweep Asia High/Low liquidity pools.')
                    : selectedSessionId === 'london'
                    ? (language === 'my'
                      ? 'ဥရောပနှင့် လန်ဒန်ဘဏ်များ ဝင်ရောက်ချိန်ဖြစ်၍ Judas Swing (အထင်မှားစေသော Fakeout) များ ပေါ်ပေါက်တတ်သည်။ နေ့စဉ် Trend စစ်စတင်ရာ အချိန်ဖြစ်သည်။'
                      : 'Institutions establish the true daily trend. Beware of Judas swing fakeouts at 07:00-08:30 UTC before genuine expansion.')
                    : selectedSessionId === 'ny'
                    ? (language === 'my'
                      ? 'အမေရိကန် စျေးကွက်ဖွင့်ချိန်ဖြစ်ပြီး Macro Data (CPI/FOMC) သတင်းများ ထွက်ပေါ်လေ့ရှိသည်။ Volume အကြီးမားဆုံးဖြစ်၍ Trend ဆက်လက်စီးမျောရန် အကောင်းဆုံးဖြစ်သည်။'
                      : 'Wall Street flow joins crypto perps. Highest momentum continuation and major economic release window.')
                    : (language === 'my'
                      ? '၁၂:၀၀ မှ ၁၆:၀၀ UTC သည် တစ်နေ့တာအတွင်း ကမ္ဘာ့အရင်းအနှီး အများဆုံး ထပ်တူကျချိန်ဖြစ်သည်။ Spreads အကျဉ်းဆုံးဖြစ်ပြီး 10% ပစ်မှတ်များ အမြန်ဆုံးရောက်ရှိနိုင်သည်။'
                      : 'The 4-hour golden window where London + New York overlap. Spreads are narrowest, slippage lowest, and structural breakouts possess maximum follow-through.')}
                </p>
              </div>
            )}
          </div>

          {/* Timing Guidance Advice Box */}
          <div className={`p-4 rounded-xl border ${statusInfo.bg} ${statusInfo.border}`}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  {language === 'my' ? 'စျေးကွက်အချိန်ကိုက် အကြံပြုချက် (AI Guidance):' : 'Execution Timing Advisory:'}
                </h5>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {language === 'my' ? timing.guidanceMy : timing.guidanceEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Economic News Calendar */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">
              {language === 'my'
                ? 'မေခရိုစီးပွားရေး အချက်အလက်များ မထွက်မီ မိနစ် ၃၀ အတွင်း အော်ဒါအသစ် ဖွင့်လှစ်ခြင်းကို ရှောင်ရှားပါ'
                : 'Avoid blind high-leverage entry 30 mins before major red-folder events'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timing.upcomingEconomicEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3.5 rounded-xl border bg-slate-950/80 ${
                  Math.abs(event.minutesUntil) <= 30
                    ? 'border-rose-500/50 ring-1 ring-rose-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {event.currency} • {event.impact} IMPACT
                    </span>
                    <h5 className="text-xs font-bold text-white mt-1.5">
                      {language === 'my' ? event.titleMy : event.title}
                    </h5>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {event.timeStr}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 my-2">
                  <span>Forecast: <strong className="text-slate-200">{event.forecast}</strong></span>
                  <span>Previous: <strong className="text-slate-200">{event.previous}</strong></span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-amber-400 font-bold mr-1">
                    {language === 'my' ? 'လုပ်ဆောင်ရန်နည်းလမ်း:' : 'Protocol:'}
                  </span>
                  {language === 'my' ? event.adviceMy : event.adviceEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Crypto Catalysts */}
      {activeTab === 'catalysts' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {timing.cryptoCatalysts.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {cat.category}
                    </span>
                    <span className={`text-[10px] font-bold ${cat.sentiment === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {cat.sentiment}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-white mb-2 leading-snug">
                    {language === 'my' ? cat.titleMy : cat.title}
                  </h5>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    {language === 'my' ? cat.adviceMy : cat.adviceEn}
                  </p>
                </div>

                <span className="text-[10px] text-slate-500 mt-2 block text-right">
                  {cat.timeAgo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: News + Technical Confirmation Formula */}
      {activeTab === 'formula' && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white">
              {language === 'my'
                ? 'သတင်းနှင့် နည်းပညာ ပေါင်းစပ်အတည်ပြု ဖော်မြူလာ'
                : 'News + Technical Confirmation Formula'}
            </h4>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 border border-amber-500/30 text-center font-mono text-xs md:text-sm font-black text-amber-300 tracking-wider">
            {language === 'my' ? timing.actionFormulaMy : timing.actionFormulaEn}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xs font-bold text-amber-400 block mb-1">
                {language === 'my' ? '၁။ သတင်းမထွက်မီ (Before News)' : '1. Before Major News'}
              </span>
              <p className="text-xs text-slate-300">
                {language === 'my'
                  ? 'သတင်းထွက်ခါနီးတွင် Spread ချဲ့ထွင်ခြင်း၊ Fakeout wicks ထိုးခြင်းများ ဖြစ်တတ်သဖြင့် အော်ဒါအသစ် မဖွင့်ပါနှင့်။'
                  : 'Avoid opening blind orders 30 minutes before high-impact economic news releases.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xs font-bold text-rose-400 block mb-1">
                {language === 'my' ? '၂။ သတင်းထွက်ချိန် (During News Spike)' : '2. During News Spike'}
              </span>
              <p className="text-xs text-slate-300">
                {language === 'my'
                  ? 'ပထမဆုံး spike နောက်သို့ မလိုက်ပါနှင့်။ အဖွဲ့အစည်းကြီးများသည် Liquidity စားသုံးရန် နှစ်ဖက်စလုံး wick ထိုးတတ်ပါသည်။'
                  : 'Never chase the initial 1-minute spike. Slippage is high and algorithms harvest liquidity on both sides.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 block mb-1">
                {language === 'my' ? '၃။ သတင်းထွက်ပြီးနောက် (After News Retest)' : '3. After Retest Confirmation'}
              </span>
              <p className="text-xs text-slate-300">
                {language === 'my'
                  ? 'ဖယောင်းတိုင် ပိတ်သည်အထိ စောင့်ပါ။ Key Support/Resistance ကို Retest ဆင်းပြီး Structure အတည်ပြုမှသာ ဝင်ရောက်ပါ။'
                  : 'Wait for 15M candle close and retest of key level with confirmed volume before executing.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
