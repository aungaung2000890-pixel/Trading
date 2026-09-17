import React from 'react';
import { Award, ArrowUpRight, ArrowDownRight, Clock, Flame, ChevronRight, BarChart2, AlertCircle, Zap, Bell } from 'lucide-react';
import { CoinOpportunity } from '../types';

interface TopPicksProps {
  coins: CoinOpportunity[];
  selectedCoin: CoinOpportunity;
  onSelectCoin: (coin: CoinOpportunity) => void;
  onTradeInDemo?: (symbol: string, side: 'LONG' | 'SHORT') => void;
  onGenerateTradeCard?: (coin: CoinOpportunity) => void;
  onOpenAI?: (mode: 'quick' | 'deep', coinSymbol: string) => void;
  onOpenPriceAlert?: (symbol: string) => void;
  lang: 'my' | 'en';
}

export const TopPicks: React.FC<TopPicksProps> = ({
  coins,
  selectedCoin,
  onSelectCoin,
  onTradeInDemo,
  onGenerateTradeCard,
  onOpenAI,
  onOpenPriceAlert,
  lang,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'my'
                ? 'အခုအချိန်တွင် အလားအလာအကောင်းဆုံး TOP 5 COINS'
                : 'TOP 5 RANKED OPPORTUNITIES ON BINANCE FUTURES'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'my'
                ? 'Structure + Momentum + Volume + Funding + 10% Feasibility ကို အခြေခံ၍ အဆင့်သတ်မှတ်ထားသည်'
                : 'Ranked by Structure, Liquidity, Open Interest, Volatility, and 10% Move Feasibility'}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          {lang === 'my' ? 'ကတ်တစ်ခုချင်းစီကို နှိပ်၍ အသေးစိတ် 4H/1H/15M စစ်ဆေးနိုင်ပါသည်' : 'Click any card to inspect 4H/1H/15M chart details'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coins.map((coin) => {
          const isSelected = selectedCoin.symbol === coin.symbol;
          const isGainer = coin.change24h >= 0;

          return (
            <div
              key={coin.symbol}
              id={`coin-card-${coin.symbol.toLowerCase()}`}
              onClick={() => onSelectCoin(coin)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/[0.04] border-amber-500/80 shadow-md shadow-amber-500/10 dark:bg-slate-900 dark:border-amber-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Header with Rank and Symbol */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        coin.rank === 1
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                          : coin.rank === 2
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white'
                          : coin.rank === 3
                          ? 'bg-amber-700/80 text-amber-100'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      #{coin.rank}
                    </span>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        {coin.pair}
                        <span className="text-[11px] font-medium text-slate-400 font-sans">
                          ({coin.name})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bias Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      coin.bias === 'LONG'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : coin.bias === 'SHORT'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    BIAS: {coin.bias}
                  </span>
                </div>

                {/* Price, 24h Change and Live Sparkline Curve */}
                <div className="pt-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between">
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                      {coin.priceFormatted}
                    </div>
                    <div
                      className={`flex items-center text-xs font-bold font-mono ${
                        isGainer ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {isGainer ? (
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {coin.change24h > 0 ? '+' : ''}
                      {coin.change24h.toFixed(2)}%
                    </div>
                  </div>

                  {/* Micro Sparkline Trendline */}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">24H CADENCE:</span>
                    <svg width="110" height="20" className="overflow-visible">
                      {(() => {
                        const pts = isGainer
                          ? [6, 8, 7, 10, 9, 13, 15, 14, 18]
                          : [18, 16, 17, 13, 14, 10, 11, 8, 6];
                        const min = Math.min(...pts);
                        const max = Math.max(...pts);
                        const range = max - min || 1;
                        const coords = pts.map((p, i) => {
                          const x = (i / (pts.length - 1)) * 105;
                          const y = 18 - ((p - min) / range) * 14;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        });
                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke={isGainer ? '#10b981' : '#f43f5e'}
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={coords.join(' ')}
                            />
                            <circle
                              cx={coords[coords.length - 1].split(',')[0]}
                              cy={coords[coords.length - 1].split(',')[1]}
                              r="2.5"
                              fill={isGainer ? '#10b981' : '#f43f5e'}
                              className="animate-pulse"
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Key Metrics Grid with Radial Feasibility Arc */}
                <div className="grid grid-cols-2 gap-2 text-xs py-3">
                  <div>
                    <div className="text-[11px] text-slate-400">{lang === 'my' ? '၂၄ နာရီ Volume:' : '24h Volume:'}</div>
                    <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {coin.volumeFormatted}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400">{lang === 'my' ? 'Open Interest (OI):' : 'Open Interest:'}</div>
                    <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {coin.openInterest} {coin.oiChange && <span className="text-[10px] text-amber-500 font-bold">({coin.oiChange})</span>}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400">{lang === 'my' ? 'Funding Rate:' : 'Funding Rate:'}</div>
                    <div
                      className={`font-mono font-semibold ${
                        coin.fundingRate < -0.05
                          ? 'text-rose-500 font-bold'
                          : coin.fundingRate > 0.05
                          ? 'text-emerald-500 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {coin.fundingFormatted}
                    </div>
                  </div>

                  {/* Radial Feasibility Gauge */}
                  <div>
                    <div className="text-[11px] text-slate-400">10% Feasibility:</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
                        <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="8" fill="none" stroke="#334155" strokeWidth="2" />
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke={
                              coin.feasibility10Percent === 'HIGH'
                                ? '#10b981'
                                : coin.feasibility10Percent === 'MEDIUM'
                                ? '#f59e0b'
                                : '#ef4444'
                            }
                            strokeWidth="2"
                            strokeDasharray={2 * Math.PI * 8}
                            strokeDashoffset={
                              2 * Math.PI * 8 * (1 - (coin.feasibility10Percent === 'HIGH' ? 0.88 : coin.feasibility10Percent === 'MEDIUM' ? 0.65 : 0.4))
                            }
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                          coin.feasibility10Percent === 'HIGH'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : coin.feasibility10Percent === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                        }`}
                      >
                        {coin.feasibility10Percent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Why Ranked Synopsis */}
                <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  <span className="font-bold text-slate-800 dark:text-white mr-1">
                    {lang === 'my' ? 'အကြောင်းရင်း:' : 'Why:'}
                  </span>
                  {lang === 'my' ? coin.whyRankedMy : coin.whyRanked}
                </div>
              </div>

              {/* Direct Trade Buttons on Phone & Desktop */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTradeInDemo) {
                        onTradeInDemo(coin.symbol, 'LONG');
                      } else {
                        onSelectCoin(coin);
                      }
                    }}
                    className="py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                    title={lang === 'my' ? `${coin.symbol} LONG စာချုပ် ကုန်သွယ်မည်` : `Trade LONG on ${coin.symbol}`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{lang === 'my' ? 'LONG ဝင်မည်' : 'LONG'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTradeInDemo) {
                        onTradeInDemo(coin.symbol, 'SHORT');
                      } else {
                        onSelectCoin(coin);
                      }
                    }}
                    className="py-2 px-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/20 active:scale-95 transition cursor-pointer"
                    title={lang === 'my' ? `${coin.symbol} SHORT စာချုပ် ကုန်သွယ်မည်` : `Trade SHORT on ${coin.symbol}`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{lang === 'my' ? 'SHORT ဝင်မည်' : 'SHORT'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-xs pt-1">
                  <div className="flex items-center gap-1">
                    {onOpenPriceAlert && (
                      <button
                        id={`card-alert-btn-${coin.symbol.toLowerCase()}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPriceAlert(coin.symbol);
                        }}
                        className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                        title={lang === 'my' ? `${coin.symbol} အတွက် စျေးနှုန်းသတိပေးချက် သတ်မှတ်မည်` : `Set price alert for ${coin.symbol}`}
                      >
                        <Bell className="w-3 h-3" />
                        <span>{lang === 'my' ? 'သတိပေးချက်' : 'Alert'}</span>
                      </button>
                    )}

                    {onGenerateTradeCard && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateTradeCard(coin);
                        }}
                        className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>{lang === 'my' ? 'Trade Card' : 'Card'}</span>
                      </button>
                    )}

                    {onOpenAI && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAI('quick', coin.symbol);
                        }}
                        className="px-2 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                        title={lang === 'my' ? 'AI ဖြင့် အမြန်ဆုံးဖြတ်ချက်ရယူမည်' : 'Run AI Quick Trade Analysis'}
                      >
                        <span>⚡ AI Analysis</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectCoin(coin)}
                    className="font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 flex items-center gap-0.5 text-xs cursor-pointer py-1"
                  >
                    <span>{lang === 'my' ? 'စစ်ဆေးမည်' : 'Inspect'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
