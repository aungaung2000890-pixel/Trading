import React, { useState } from 'react';
import {
  Sliders,
  Activity,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { CmcSectionId } from '../CmcSidebar';
import {
  CMC_RSI_DASHBOARD,
  CMC_MACD_DASHBOARD,
  getTradeImpactGuide,
} from '../../../data/cmcData';
import { TradeImpactBanner } from '../TradeImpactBanner';

interface TechnicalViewsProps {
  lang: 'my' | 'en';
  section: CmcSectionId;
  onNavigateSection: (section: CmcSectionId) => void;
  onTradeInDemo?: (symbol?: string) => void;
  onOpenCalculator?: (symbol?: string) => void;
}

export const TechnicalViews: React.FC<TechnicalViewsProps> = ({
  lang,
  section,
  onNavigateSection,
  onTradeInDemo,
  onOpenCalculator,
}) => {
  const isMy = lang === 'my';
  const [activeTimeframe, setActiveTimeframe] = useState<'15m' | '1h' | '4h' | '24h' | '7d'>('1h');
  const [filterCondition, setFilterCondition] = useState<string>('ALL');

  const impactGuide = getTradeImpactGuide(section);

  // 1. RSI HEATMAP & DASHBOARD (Screenshot 25)
  if (section === 'rsi_heatmap') {
    const data = CMC_RSI_DASHBOARD;

    const filteredCoins = data.coins.filter((coin) => {
      if (filterCondition === 'ALL') return true;
      return coin.condition === filterCondition;
    });

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Crypto RSI အညွှန်းကိန်း ဇယားများ' : 'Crypto RSI Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'စျေးကွက် ပျမ်းမျှ RSI၊ အဝယ်လွန် (Overbought) / အရောင်းလွန် (Oversold) အချိုးများနှင့် ဒင်္ဂါးအလိုက် အချိန်သတ်မှတ်ချက်များ'
              : 'Market-wide average 14-period Relative Strength Index, distribution breadth, and multi-timeframe oscillator readings.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="OSCILLATOR OVERVIEW"
        />

        {/* Row 1: Average RSI & Distribution Bar (Screenshot 25) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Average RSI Score */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isMy ? 'ပျမ်းမျှ RSI အညွှန်းကိန်း' : 'Average RSI'}
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs font-bold text-slate-300 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                14 Periods
              </span>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                {data.averageRsi}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">
                / 100 · Neutral (Cooling Down)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">Yesterday</div>
                <div className="font-bold text-white mt-0.5">{data.historicalAverage.yesterday}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">7d Ago</div>
                <div className="font-bold text-white mt-0.5">{data.historicalAverage.sevenDaysAgo}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">30d Ago</div>
                <div className="font-bold text-white mt-0.5">{data.historicalAverage.thirtyDaysAgo}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">90d Ago</div>
                <div className="font-bold text-white mt-0.5">{data.historicalAverage.ninetyDaysAgo}</div>
              </div>
            </div>
          </div>

          {/* Card 2: RSI Distribution Breadth Bar */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isMy ? 'RSI အချိုးအစား ပြန့်ကျဲမှု' : 'RSI Distribution'}
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-400 font-mono">Top 500 Cryptos</span>
            </div>

            {/* Tri-color breadth bar (Screenshot 25) */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-3.5 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${data.distribution.oversoldPct}%` }}
                />
                <div
                  className="h-full bg-slate-500 transition-all"
                  style={{ width: `${data.distribution.neutralPct}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${data.distribution.overboughtPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-400 font-bold">Oversold: {data.distribution.oversoldPct}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-300 font-bold">Neutral: {data.distribution.neutralPct}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-rose-400 font-bold">Overbought: {data.distribution.overboughtPct}%</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isMy
                ? 'စျေးကွက်၏ ၉၄.၂% သည် ပုံမှန်ဇုန်တွင် ရှိနေပြီး ၁.၇% သာ Overbought ဖြစ်နေသဖြင့် ပြင်းထန်သော အဝယ်အရူးအမူး မရှိသေးဘဲ ဆက်လက်တက်လှမ်းနိုင်သည့် နေရာလွတ် အများအပြား ရှိသည်။'
                : 'With only 1.7% of assets overbought and 94.2% neutral, the market possesses substantial runway before reaching euphoric macro peak exhaustion.'}
            </p>
          </div>
        </div>

        {/* Timeframe Filter Buttons & Table */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isMy ? 'ဒင်္ဂါးအလိုက် RSI တန်ဖိုးများ ဇယား' : 'Asset RSI Multi-Timeframe Ranking'}
              </h3>
              <p className="text-xs text-slate-400">
                15M, 1H, 4H, 24H, and 7D relative strength values.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Pills */}
              <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setFilterCondition('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterCondition === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterCondition('OVERBOUGHT')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterCondition === 'OVERBOUGHT' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Overbought
                </button>
                <button
                  onClick={() => setFilterCondition('NEUTRAL')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterCondition === 'NEUTRAL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Neutral
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">24h Change</th>
                  <th className="py-2.5 px-3">15m RSI</th>
                  <th className="py-2.5 px-3">1h RSI</th>
                  <th className="py-2.5 px-3">4h RSI</th>
                  <th className="py-2.5 px-3">1d RSI</th>
                  <th className="py-2.5 px-3">7d RSI</th>
                  <th className="py-2.5 px-3 text-right">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCoins.map((c) => (
                  <tr key={c.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-400 font-bold">#{c.rank}</td>
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.symbol})</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-200">{c.price}</td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        c.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {c.change24h >= 0 ? '▲' : '▼'} {Math.abs(c.change24h).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-300">{c.m15}</td>
                    <td className="py-3 px-3 font-bold text-slate-300">{c.h1}</td>
                    <td
                      className={`py-3 px-3 font-black ${
                        Number(c.h4) >= 70 ? 'text-rose-400' : Number(c.h4) <= 30 ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {c.h4}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{c.d1}</td>
                    <td className="py-3 px-3 text-slate-400">{c.d7}</td>
                    <td className="py-3 px-3 text-right">
                      {onTradeInDemo && (
                        <button
                          onClick={() => onTradeInDemo(`${c.symbol}USDT`)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition text-[11px] font-bold cursor-pointer"
                        >
                          Trade
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 2. MACD SIGNALS & DASHBOARD (Screenshot 26)
  if (section === 'macd_signals') {
    const data = CMC_MACD_DASHBOARD;

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'MACD Momentum အချက်ပြမှုများ' : 'Crypto MACD Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'စျေးကွက် ပျမ်းမျှ Normalized MACD၊ အတက်/အကျ Momentum အချိုးများနှင့် အချိန်သတ်မှတ်ချက်အလိုက် အရှိန်အဟုန်များ'
              : 'Market-wide average normalized MACD readings, bullish/bearish momentum ratio, and timeframe breakdown.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="MACD MOMENTUM"
        />

        {/* Row 1: Average Normalized MACD & Breadth Bar (Screenshot 26) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Average Normalized MACD */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isMy ? 'ပျမ်းမျှ Normalized MACD' : 'Average Normalized MACD'}
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs font-bold text-rose-400 font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                Mild Bearish Pullback
              </span>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl sm:text-5xl font-black font-mono text-rose-400">
                {data.averageNormalizedMacd}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">
                Momentum Retracement
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">Yesterday</div>
                <div className="font-bold text-white mt-0.5">{data.historicalNormalized.yesterday}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">7d Ago</div>
                <div className="font-bold text-white mt-0.5">{data.historicalNormalized.sevenDaysAgo}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">30d Ago</div>
                <div className="font-bold text-white mt-0.5">{data.historicalNormalized.thirtyDaysAgo}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">90d Ago</div>
                <div className="font-bold text-white mt-0.5">{data.historicalNormalized.ninetyDaysAgo}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Momentum Breadth Ratio */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isMy ? 'အပြု/အနုတ် Momentum အချိုး' : 'MACD Momentum Breadth'}
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-400 font-mono">Top 500 Cryptos</span>
            </div>

            {/* Split bar (Screenshot 26: 28.14% Positive, 71.86% Negative) */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-3.5 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${data.momentumBreadth.positivePct}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${data.momentumBreadth.negativePct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-400 font-bold">
                    Positive MACD: {data.momentumBreadth.positivePct}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-rose-400 font-bold">
                    Negative MACD: {data.momentumBreadth.negativePct}%
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isMy
                ? 'ဒင်္ဂါး ၇၁.၈၆% တွင် MACD အနုတ်ပြနေခြင်းသည် စျေးကွက်တစ်ခုလုံး အနားယူကာ အားစုဆောင်းနေကြောင်း ပြသနေပြီး၊ မကြာမီ Histogram ပြန်ကွေးတက်ချိန်တွင် အခွင့်အလမ်းကောင်းများ ပေါ်ပေါက်လာမည် ဖြစ်သည်။'
                : 'With 71.86% in negative MACD territory, the market is undergoing healthy mean-reversion consolidation. Upward histogram curl on blue-chips signals prime swing accumulation.'}
            </p>
          </div>
        </div>

        {/* Coins Table (Screenshot 26) */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-white">
              {isMy ? 'ဒင်္ဂါးအလိုက် MACD Momentum အဆင့်များ' : 'Asset MACD Momentum Rankings'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">15M · 1H · 4H · 1D · 7D</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">24h Change</th>
                  <th className="py-2.5 px-3">15m</th>
                  <th className="py-2.5 px-3">1h</th>
                  <th className="py-2.5 px-3">4h</th>
                  <th className="py-2.5 px-3">1d</th>
                  <th className="py-2.5 px-3">7d</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.coins.map((c) => (
                  <tr key={c.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-400 font-bold">#{c.rank}</td>
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.symbol})</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-200">{c.price}</td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        c.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {c.change24h >= 0 ? '▲' : '▼'} {Math.abs(c.change24h).toFixed(2)}%
                    </td>
                    <td className={`py-3 px-3 font-bold ${Number(c.m15) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.m15}
                    </td>
                    <td className={`py-3 px-3 font-bold ${Number(c.h1) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.h1}
                    </td>
                    <td className={`py-3 px-3 font-bold ${Number(c.h4) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.h4}
                    </td>
                    <td className={`py-3 px-3 ${Number(c.d1) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.d1}
                    </td>
                    <td className={`py-3 px-3 ${Number(c.d7) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.d7}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {onTradeInDemo && (
                        <button
                          onClick={() => onTradeInDemo(`${c.symbol}USDT`)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition text-[11px] font-bold cursor-pointer"
                        >
                          Trade
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. MOVING AVERAGES
  if (section === 'moving_averages') {
    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Moving Averages (20 EMA, 50 SMA, 200 SMA)' : 'Moving Averages Alignment'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'ရေတိုနှင့် ရေရှည် Trend ခွဲခြမ်းစိတ်ဖြာမှု၊ Golden Cross / Death Cross အခြေအနေများ'
              : 'Trend regime diagnostics, Golden Cross confirmations, and distance to 200-day simple moving average.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="MOVING AVERAGE REGIME"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase">BTC / 200-Day SMA</span>
            <div className="text-2xl font-black font-mono text-emerald-400">$64,820.00</div>
            <div className="text-xs text-emerald-400 font-mono">▲ +17.3% Above 200 SMA (Bull Trend)</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase">ETH / 200-Day SMA</span>
            <div className="text-2xl font-black font-mono text-rose-400">$2,710.00</div>
            <div className="text-xs text-rose-400 font-mono">▼ -11.1% Below 200 SMA (Bear Consolidation)</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase">SOL / 200-Day SMA</span>
            <div className="text-2xl font-black font-mono text-emerald-400">$84.50</div>
            <div className="text-xs text-emerald-400 font-mono">▲ +16.5% Above 200 SMA (Strong Structure)</div>
          </div>
        </div>
      </div>
    );
  }

  // 4. TECHNICAL OVERVIEW & DEFAULT FALLBACK (Screenshot 25 / Consensus)
  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          {isMy ? 'Technical Analysis ခြုံငုံသုံးသပ်ချက် (Technical Overview)' : 'Technical Analysis Overview'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {isMy
            ? 'RSI၊ MACD၊ Moving Averages နှင့် Momentum အညွှန်းကိန်းများအားလုံးကို တစ်နေရာတည်းတွင် ခြုံငုံသုံးသပ်ချက်'
            : 'Aggregated multi-indicator technical scanner across RSI, MACD signals, and Exponential Moving Averages.'}
        </p>
      </div>

      {/* Trade Impact Guide Banner */}
      <TradeImpactBanner
        guide={impactGuide}
        lang={lang}
        onTradeInDemo={onTradeInDemo}
        onOpenCalculator={onOpenCalculator}
        contextTitle="TECHNICAL MOMENTUM CONSENSUS"
      />

      {/* 3 Quick Navigation Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateSection('rsi_heatmap')}
          className="p-5 rounded-2xl bg-[#131722] border border-slate-800 hover:border-amber-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Oscillator 1</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">RSI (14)</span>
          </div>
          <div className="text-2xl font-black text-white mt-2 group-hover:text-amber-400 transition">
            {CMC_RSI_DASHBOARD?.averageRsi ? CMC_RSI_DASHBOARD.averageRsi.toFixed(1) : '43.8'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isMy ? 'စျေးကွက် ပျမ်းမျှ RSI - Neutral အဆင့်' : 'Market Avg RSI - Neutral territory'}
          </p>
          <div className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-3">
            <span>{isMy ? 'RSI Heatmap ကြည့်ရန်' : 'Explore RSI Heatmap'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateSection('macd_signals')}
          className="p-5 rounded-2xl bg-[#131722] border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Oscillator 2</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">MACD (12,26,9)</span>
          </div>
          <div className="text-2xl font-black text-white mt-2 group-hover:text-emerald-400 transition">
            {CMC_MACD_DASHBOARD?.momentumBreadth?.positivePct ?? 28}% Bull
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {CMC_MACD_DASHBOARD?.momentumBreadth?.positivePct ?? 28}% Bullish vs {CMC_MACD_DASHBOARD?.momentumBreadth?.negativePct ?? 72}% Bearish Momentum
          </p>
          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-3">
            <span>{isMy ? 'MACD အချက်ပြမှုများ' : 'Explore MACD Signals'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateSection('moving_averages')}
          className="p-5 rounded-2xl bg-[#131722] border border-slate-800 hover:border-blue-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Trend Regime</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">200 SMA</span>
          </div>
          <div className="text-2xl font-black text-white mt-2 group-hover:text-blue-400 transition">
            Bullish Trend
          </div>
          <p className="text-xs text-slate-400 mt-1">
            BTC $64.8k (+17.3% above 200 SMA support)
          </p>
          <div className="text-xs text-blue-400 font-bold flex items-center gap-1 mt-3">
            <span>{isMy ? 'Moving Averages ဇယား' : 'Explore Moving Averages'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Consolidated Technical Health Table */}
      <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          {isMy ? 'အဓိက ဒင်္ဂါးများ၏ နည်းပညာဆိုင်ရာ အခြေအနေ' : 'Top Assets Technical Matrix'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">RSI (14)</th>
                <th className="py-2.5 px-3">MACD Histogram</th>
                <th className="py-2.5 px-3">Trend (50/200 MA)</th>
                <th className="py-2.5 px-3">Consensus Signal</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                { symbol: 'BTC', name: 'Bitcoin', rsi: 44.5, rsiStatus: 'Neutral', macd: 'Bullish Divergence', trend: 'Above 200 SMA', consensus: 'BUY ON DIP', color: 'emerald' },
                { symbol: 'ETH', name: 'Ethereum', rsi: 38.2, rsiStatus: 'Near Oversold', macd: 'Bearish Cross', trend: 'Below 50 EMA', consensus: 'CAUTION / ACCUMULATE', color: 'amber' },
                { symbol: 'SOL', name: 'Solana', rsi: 56.4, rsiStatus: 'Moderate Bullish', macd: 'Bullish Cross', trend: 'Above 50 EMA', consensus: 'MOMENTUM BUY', color: 'emerald' },
                { symbol: 'BNB', name: 'BNB', rsi: 51.0, rsiStatus: 'Neutral', macd: 'Neutral Flat', trend: 'Consolidating', consensus: 'HOLD / RANGE TRADE', color: 'slate' },
                { symbol: 'XRP', name: 'XRP', rsi: 34.8, rsiStatus: 'Oversold Zone', macd: 'Histogram Curving Up', trend: 'Test Support', consensus: 'OVERSOLD BOUNCE', color: 'emerald' },
              ].map((item) => (
                <tr key={item.symbol} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white font-sans">{item.name}</span>
                    <span className="ml-1.5 text-slate-400 text-[10px]">({item.symbol})</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white">{item.rsi}</span>
                    <span className="ml-1 text-[10px] text-slate-400">({item.rsiStatus})</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{item.macd}</td>
                  <td className="py-3 px-3 text-slate-300">{item.trend}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.color === 'emerald'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.color === 'amber'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.consensus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onTradeInDemo?.(item.symbol)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold text-[10px] transition"
                    >
                      {isMy ? 'Demo ကုန်သွယ်မည်' : 'Trade Demo'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
