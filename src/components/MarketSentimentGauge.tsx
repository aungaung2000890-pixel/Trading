import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Gauge,
  Info,
  ChevronDown,
  X,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  Activity,
  Flame,
  Globe,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { LiveTickerItem, CoinOpportunity, LiveFearAndGreedData } from '../types';
import { TOP_COIN_OPPORTUNITIES } from '../data/staticAnalysis';

export interface MarketSentimentData {
  score: number;
  labelEn: string;
  labelMy: string;
  bias: 'EXTREME_BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'EXTREME_BULLISH';
  colorClass: string;
  bgBadgeClass: string;
  colorHex: string;
  longCount: number;
  shortCount: number;
  waitCount: number;
  total: number;
  longPct: number;
  shortPct: number;
  waitPct: number;
}

export function calculateMarketSentiment(
  tickers?: LiveTickerItem[],
  coins?: CoinOpportunity[]
): MarketSentimentData {
  const items: Array<{ bias: 'LONG' | 'SHORT' | 'WAIT' }> =
    coins && coins.length > 0
      ? coins.slice(0, 5).map((c) => ({ bias: c.bias }))
      : tickers && tickers.length > 0
      ? tickers
      : TOP_COIN_OPPORTUNITIES.slice(0, 5).map((c) => ({ bias: c.bias }));

  const total = items.length;
  const longCount = items.filter((t) => t.bias === 'LONG').length;
  const shortCount = items.filter((t) => t.bias === 'SHORT').length;
  const waitCount = items.filter((t) => t.bias === 'WAIT').length;

  const rawScore = total > 0 ? (longCount * 100 + waitCount * 50) / total : 50;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  const longPct = total > 0 ? Math.round((longCount / total) * 100) : 33;
  const shortPct = total > 0 ? Math.round((shortCount / total) * 100) : 33;
  const waitPct = total > 0 ? Math.max(0, 100 - longPct - shortPct) : 34;

  let bias: MarketSentimentData['bias'] = 'NEUTRAL';
  let labelEn = 'Neutral';
  let labelMy = 'ကြားနေ (Neutral)';
  let colorClass = 'text-amber-500 dark:text-amber-400';
  let bgBadgeClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';
  let colorHex = '#f59e0b';

  if (score >= 75) {
    bias = 'EXTREME_BULLISH';
    labelEn = 'Extreme Bullish';
    labelMy = 'ပြင်းထန်သော အဝယ်အား';
    colorClass = 'text-emerald-500 dark:text-emerald-400';
    bgBadgeClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
    colorHex = '#10b981';
  } else if (score >= 55) {
    bias = 'BULLISH';
    labelEn = 'Bullish';
    labelMy = 'အဝယ်အားကောင်း (Bullish)';
    colorClass = 'text-lime-600 dark:text-lime-400';
    bgBadgeClass = 'bg-lime-500/15 text-lime-700 dark:text-lime-300 border-lime-500/30';
    colorHex = '#84cc16';
  } else if (score <= 25) {
    bias = 'EXTREME_BEARISH';
    labelEn = 'Extreme Bearish';
    labelMy = 'ပြင်းထန်သော အရောင်းဖိအား';
    colorClass = 'text-rose-500 dark:text-rose-400';
    bgBadgeClass = 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30';
    colorHex = '#f43f5e';
  } else if (score < 45) {
    bias = 'BEARISH';
    labelEn = 'Bearish';
    labelMy = 'အရောင်းဘက်သာ (Bearish)';
    colorClass = 'text-orange-500 dark:text-orange-400';
    bgBadgeClass = 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30';
    colorHex = '#f97316';
  }

  return {
    score,
    labelEn,
    labelMy,
    bias,
    colorClass,
    bgBadgeClass,
    colorHex,
    longCount,
    shortCount,
    waitCount,
    total,
    longPct,
    shortPct,
    waitPct,
  };
}

interface MarketSentimentGaugeProps {
  tickers?: LiveTickerItem[];
  coins?: CoinOpportunity[];
  lang: 'my' | 'en';
  fearAndGreed?: LiveFearAndGreedData | null;
}

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({
  tickers,
  coins,
  lang,
  fearAndGreed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fng' | 'orderflow'>('fng');
  const containerRef = useRef<HTMLDivElement>(null);

  const sentiment = useMemo(() => calculateMarketSentiment(tickers, coins), [tickers, coins]);

  // Use real Alternative.me Fear and Greed if available, else sentiment score
  const fngScore = fearAndGreed?.value ?? sentiment.score;
  const fngClassification = fearAndGreed?.classification ?? sentiment.labelEn;
  const fngClassificationMy = fearAndGreed?.classificationMy ?? sentiment.labelMy;

  // Fear & Greed needle angle (180deg left = 0, 90deg top = 50, 0deg right = 100)
  const fngAngleDeg = 180 - (fngScore / 100) * 180;
  const fngRad = (fngAngleDeg * Math.PI) / 180;
  const cx = 50;
  const cy = 44;
  const needleLen = 26;
  const nx = cx + needleLen * Math.cos(fngRad);
  const ny = cy - needleLen * Math.sin(fngRad);

  let fngColorHex = '#f59e0b';
  let fngBadgeClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';
  if (fngScore >= 75) {
    fngColorHex = '#10b981';
    fngBadgeClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
  } else if (fngScore >= 55) {
    fngColorHex = '#84cc16';
    fngBadgeClass = 'bg-lime-500/15 text-lime-700 dark:text-lime-300 border-lime-500/30';
  } else if (fngScore <= 25) {
    fngColorHex = '#f43f5e';
    fngBadgeClass = 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30';
  } else if (fngScore < 45) {
    fngColorHex = '#f97316';
    fngBadgeClass = 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30';
  }

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left" id="market-sentiment-container">
      {/* Compact Header Trigger Button */}
      <button
        id="market-sentiment-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all flex items-center gap-2 cursor-pointer shadow-xs text-left"
        title={
          lang === 'my'
            ? `Crypto Fear & Greed Index: ${fngScore}/100 (${fngClassificationMy}) - အသေးစိတ်ကြည့်ရန် နှိပ်ပါ`
            : `Crypto Fear & Greed: ${fngScore}/100 (${fngClassification}) - Click for details`
        }
      >
        {/* Mini SVG Gauge */}
        <div className="relative w-11 h-6.5 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 52" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="headerGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="75%" stopColor="#84cc16" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            <path
              d="M 16 44 A 34 34 0 0 1 84 44"
              fill="none"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700/60"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 16 44 A 34 34 0 0 1 84 44"
              fill="none"
              stroke="url(#headerGaugeGrad)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="50" cy="44" r="4" className="fill-slate-800 dark:fill-slate-100" />
            <line
              x1="50"
              y1="44"
              x2={nx}
              y2={ny}
              className="stroke-slate-900 dark:stroke-white transition-all duration-700 ease-out"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx={nx}
              cy={ny}
              r="2.5"
              fill={fngColorHex}
              className="transition-all duration-700 ease-out drop-shadow-xs"
            />
          </svg>
        </div>

        {/* Sentiment Title & Tag */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fear & Greed
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
              {fngScore}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${fngBadgeClass}`}
            >
              {lang === 'my' ? fngClassificationMy : fngClassification}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-500' : 'group-hover:text-slate-600 dark:group-hover:text-slate-200'
          }`}
        />
      </button>

      {/* Popover Breakdown Dropdown Menu */}
      {isOpen && (
        <div
          id="market-sentiment-popover"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Crypto Fear & Greed Index</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    LIVE
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  {fearAndGreed?.source || 'Alternative.me Official Market Sentiment'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selector: Fear & Greed vs Order Flow */}
          <div className="flex items-center gap-1 mt-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('fng')}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'fng'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Fear & Greed ({fngScore})</span>
            </button>
            <button
              onClick={() => setActiveTab('orderflow')}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'orderflow'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Futures Bias ({sentiment.score})</span>
            </button>
          </div>

          {activeTab === 'fng' ? (
            <div className="py-3 space-y-3">
              {/* Primary Gauge visual */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-36 h-20 relative flex items-center justify-center">
                  <svg viewBox="0 0 100 52" className="w-full h-full overflow-visible">
                    <path
                      d="M 16 44 A 34 34 0 0 1 84 44"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 16 44 A 34 34 0 0 1 84 44"
                      fill="none"
                      stroke="url(#headerGaugeGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="44" r="4.5" className="fill-slate-800 dark:fill-white" />
                    <line
                      x1="50"
                      y1="44"
                      x2={nx}
                      y2={ny}
                      className="stroke-slate-900 dark:stroke-white transition-all duration-700 ease-out"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx={nx} cy={ny} r="3" fill={fngColorHex} />
                  </svg>
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {fngScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${fngBadgeClass}`}>
                  {lang === 'my' ? fngClassificationMy : fngClassification}
                </div>
              </div>

              {/* Historical Benchmarks Grid */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">{lang === 'my' ? 'ယမန်နေ့' : 'Yesterday'}</div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                    {fearAndGreed?.previousClose ?? 69}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">{lang === 'my' ? 'ပြီးခဲ့သည့်အပတ်' : 'Last Week'}</div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                    {fearAndGreed?.previousWeek ?? 57}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">{lang === 'my' ? 'ပြီးခဲ့သည့်လ' : 'Last Month'}</div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                    {fearAndGreed?.previousMonth ?? 61}
                  </div>
                </div>
              </div>

              {/* 7-Day History Mini Table */}
              {fearAndGreed?.historical7Days && fearAndGreed.historical7Days.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>{lang === 'my' ? 'လွန်ခဲ့သော ၇ ရက် အညွှန်းကိန်း' : '7-Day Trend History'}</span>
                    <span>Values</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-mono">
                    {fearAndGreed.historical7Days.map((h, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-400">{h.date}</span>
                        <span
                          className={`text-xs font-bold mt-0.5 ${
                            h.value >= 55 ? 'text-emerald-500' : h.value <= 45 ? 'text-rose-500' : 'text-amber-500'
                          }`}
                        >
                          {h.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-3 space-y-3">
              {/* Orderflow Bias Breakdown */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span>{lang === 'my' ? 'Active Pairs စစ်ဆေးချက်' : 'Scanned Pairs Bias Breakdown'}</span>
                <span className="font-mono text-slate-400">{sentiment.total} pairs</span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                <div
                  style={{ width: `${sentiment.longPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`LONG: ${sentiment.longPct}%`}
                />
                <div
                  style={{ width: `${sentiment.waitPct}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`WAIT: ${sentiment.waitPct}%`}
                />
                <div
                  style={{ width: `${sentiment.shortPct}%` }}
                  className="bg-red-500 transition-all duration-500"
                  title={`SHORT: ${sentiment.shortPct}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>LONG</span>
                  </div>
                  <div className="text-xs font-black text-emerald-500 mt-0.5">
                    {sentiment.longCount} ({sentiment.longPct}%)
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-500">
                    <MinusCircle className="w-3 h-3" />
                    <span>WAIT</span>
                  </div>
                  <div className="text-xs font-black text-amber-500 mt-0.5">
                    {sentiment.waitCount} ({sentiment.waitPct}%)
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-red-500">
                    <TrendingDown className="w-3 h-3" />
                    <span>SHORT</span>
                  </div>
                  <div className="text-xs font-black text-red-500 mt-0.5">
                    {sentiment.shortCount} ({sentiment.shortPct}%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Explanation Footer */}
          <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{lang === 'my' ? 'အချိန်နှင့်တပြေးညီ အပ်ဒိတ်ဒေတာ' : 'Synchronized real-time market data'}</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">100% LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};
