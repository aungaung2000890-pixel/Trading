import React, { useState, useMemo } from 'react';
import {
  LiveFearAndGreedData,
  LiveTickerItem,
  CoinOpportunity,
} from '../../../types';
import {
  CMC_SOCIAL_MENTIONS,
  CMC_ALTCOIN_SEASON_DATA,
  CMC_MARKET_CYCLES,
  CMC_MARKET_OVERVIEW,
  getTradeImpactGuide,
} from '../../../data/cmcData';
import {
  analyzeTop5Sentiment,
  analyzeMajor5Sentiment,
} from '../../MarketSentimentIndicator';
import {
  Activity,
  Flame,
  Gauge,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
} from 'lucide-react';
import { CmcSectionId } from '../CmcSidebar';
import { TradeImpactBanner } from '../TradeImpactBanner';

interface IndicatorsViewsProps {
  lang: 'my' | 'en';
  section: CmcSectionId;
  fearAndGreed?: LiveFearAndGreedData | null;
  tickers?: LiveTickerItem[];
  coins: CoinOpportunity[];
  onNavigateSection: (section: CmcSectionId) => void;
  onTradeInDemo?: (symbol?: string) => void;
  onOpenCalculator?: (symbol?: string) => void;
}

export const IndicatorsViews: React.FC<IndicatorsViewsProps> = ({
  lang,
  section,
  fearAndGreed,
  tickers = [],
  coins,
  onNavigateSection,
  onTradeInDemo,
  onOpenCalculator,
}) => {
  const isMy = lang === 'my';
  const [cohort, setCohort] = useState<'majors' | 'opportunities'>('majors');

  // Fear & Greed values
  const fngValue = fearAndGreed?.value ?? 62;
  const fngClass = fearAndGreed?.classification || 'Greed';

  const top5Sentiment = useMemo(() => {
    if (cohort === 'majors') return analyzeMajor5Sentiment(tickers);
    return analyzeTop5Sentiment(coins);
  }, [cohort, tickers, coins]);

  // 1. FEAR AND GREED INDEX (FULL SCREEN WITH DUAL SENTIMENT DIVERGENCE)
  if (section === 'fear_greed') {
    const spread = top5Sentiment.score - fngValue;

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Fear and Greed စိတ်ခံစားမှု အညွှန်းကိန်း' : 'Fear and Greed Index'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'မက်ခရို စျေးကွက် စိတ်ခံစားမှုနှင့် သင့်လက်ရွေးစင် ထိပ်တန်းဒင်္ဂါး ၅ ခု၏ နည်းပညာဆိုင်ရာ အခြေအနေကို နှိုင်းယှဉ်ချက်'
              : 'Analyzing macroeconomic sentiment and comparing broad crypto market emotion with your specific top 5 coins.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={getTradeImpactGuide('fear_greed')}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="SENTIMENT BIAS"
        />

        {/* Dual Spread Highlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-amber-900/30 border border-blue-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-400">
                Sentiment Divergence Analysis
              </span>
              <h3 className="text-sm sm:text-base font-black text-white">
                {spread > 5
                  ? '🚀 Selected Coins Outperforming Global Sentiment (Strong Relative Strength)'
                  : spread < -5
                  ? '⚠️ Selected Coins Underperforming Global Sentiment (Caution / Defensive)'
                  : '⚖️ Selected Coins Aligned with Macro Market Sentiment'}
              </h3>
              <p className="text-xs text-slate-300">
                Global Fear & Greed: <span className="text-white font-bold">{fngValue}/100</span> vs Designated Top 5 Technical Bias: <span className="text-amber-400 font-bold">{top5Sentiment.score}/100</span> (Spread: {spread > 0 ? `+${spread}` : spread} pts)
              </p>
            </div>

            {/* Cohort Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs shrink-0 self-start sm:self-center">
              <button
                onClick={() => setCohort('majors')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  cohort === 'majors' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Top 5 Majors
              </button>
              <button
                onClick={() => setCohort('opportunities')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  cohort === 'opportunities' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Top 5 Setups
              </button>
            </div>
          </div>
        </div>

        {/* Dual Gauges Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Global Market */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">1. Global Crypto Market Index</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                CMC Official
              </span>
            </div>

            <div className="flex flex-col items-center justify-center pt-2">
              <div className="text-5xl font-black font-mono text-white">{fngValue}</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                {fngClass}
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${fngValue}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Prev Close</div>
                <div className="font-bold text-white">{fearAndGreed?.previousClose ?? 63}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Last Week</div>
                <div className="font-bold text-white">{fearAndGreed?.previousWeek ?? 71}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Last Month</div>
                <div className="font-bold text-white">{fearAndGreed?.previousMonth ?? 36}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Designated Portfolio */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">2. Designated Top 5 Coins</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Live Bias Score
              </span>
            </div>

            <div className="flex flex-col items-center justify-center pt-2">
              <div className="text-5xl font-black font-mono text-amber-400">
                {top5Sentiment.score}
              </div>
              <div className="text-sm font-bold text-amber-400 mt-1 uppercase tracking-wider">
                {top5Sentiment.labelEn}
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${top5Sentiment.score}%`,
                    backgroundColor: top5Sentiment.gaugeColor,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <div className="text-[10px]">LONG</div>
                <div className="font-bold">{top5Sentiment.bullishCount} ({top5Sentiment.bullishPct}%)</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <div className="text-[10px]">WAIT</div>
                <div className="font-bold">{top5Sentiment.neutralCount} ({top5Sentiment.neutralPct}%)</div>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <div className="text-[10px]">SHORT</div>
                <div className="font-bold">{top5Sentiment.bearishCount} ({top5Sentiment.bearishPct}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. SOCIAL MENTIONS
  if (section === 'social_mentions') {
    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Social Mentions & Community Sentiment</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking 24-hour social chatter across X (Twitter), Reddit, and Telegram with natural language sentiment classification.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">24h Mentions</th>
                  <th className="py-2.5 px-3">24h Social Growth</th>
                  <th className="py-2.5 px-3">Bullish Sentiment %</th>
                  <th className="py-2.5 px-3">Community Vibe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {CMC_SOCIAL_MENTIONS.map((item) => (
                  <tr key={item.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-400">
                          {item.symbol}
                        </span>
                        <span className="font-sans font-bold text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{item.mentions24h.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{item.change24h}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{item.bullishPct}%</span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${item.bullishPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {item.sentiment}
                      </span>
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

  // 3. ALTCOIN SEASON INDEX (DETAILED)
  if (section === 'altcoin_season') {
    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Altcoin Season အညွှန်းကိန်း' : 'Altcoin Season Index'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'လွန်ခဲ့သော ရက်ပေါင်း ၉၀ အတွင်း ထိပ်တန်း အကြွေစေ့ ၅၀ ၏ ၇၅% သည် Bitcoin ထက် စွမ်းဆောင်ရည် သာလွန်မှု ရှိမရှိ တိုင်းတာချက်။'
              : 'Measures if 75% of the Top 50 tokens performed better than Bitcoin over the last season (90 days).'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={getTradeImpactGuide('altcoin_season')}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="ALT ROTATION STRATEGY"
        />

        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-white">
              {CMC_ALTCOIN_SEASON_DATA.score}
            </span>
            <span className="text-slate-400 text-lg font-mono">/ 100</span>
            <span className="ml-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {CMC_ALTCOIN_SEASON_DATA.label}
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="relative w-full h-3 rounded-full bg-gradient-to-r from-amber-500 via-blue-500 to-indigo-500">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-slate-900 shadow-md"
                style={{ left: `calc(${CMC_ALTCOIN_SEASON_DATA.score}% - 10px)` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-400">0 - 25 (Bitcoin Season)</span>
              <span className="text-slate-400">25 - 75 (Neutral)</span>
              <span className="text-indigo-400">75 - 100 (Altcoin Season)</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-2">
            {CMC_ALTCOIN_SEASON_DATA.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-3">
            {CMC_ALTCOIN_SEASON_DATA.historical.map((h) => (
              <div key={h.label} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono">
                <div className="text-[10px] text-slate-400">{h.label}</div>
                <div className="text-base font-black text-white mt-0.5">{h.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. MARKET CYCLE INDICATORS
  if (section === 'market_cycles') {
    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'မက်ခရို စျေးကွက်စက်ဝန်း အညွှန်းကိန်းများ' : 'Market Cycle Indicators'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'Pi Cycle Top၊ MVRV Z-Score နှင့် 200-Week Moving Average အပါအဝင် ရေရှည် စျေးကွက်စက်ဝန်းတိုင်းတာချက်များ'
              : 'Macro cycle metrics including Pi Cycle Top, MVRV Z-Score, and 200-Week Moving Average heatmaps.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={getTradeImpactGuide('market_cycles')}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="CYCLE STAGE ANALYSIS"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Pi Cycle Top Indicator</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {CMC_MARKET_CYCLES.piCycleTop.status}
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div>111 DMA: {CMC_MARKET_CYCLES.piCycleTop.dma111}</div>
              <div>350 DMA x 2: {CMC_MARKET_CYCLES.piCycleTop.dma350x2}</div>
              <div className="text-slate-400">{CMC_MARKET_CYCLES.piCycleTop.distanceToTop}</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">MVRV Z-Score</span>
            <div className="text-2xl font-black text-blue-400 font-mono">
              {CMC_MARKET_CYCLES.mvrvZScore.value}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              {CMC_MARKET_CYCLES.mvrvZScore.zone}
            </div>
            <div className="text-[11px] text-slate-400">
              Values above 6.0 historically signify cycle peak euphoria.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">200-Week Moving Average</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {CMC_MARKET_CYCLES.twoHundredWeekMa.ma200w}
            </div>
            <div className="text-xs text-emerald-400 font-mono font-bold">
              {CMC_MARKET_CYCLES.twoHundredWeekMa.premiumPct} above floor
            </div>
            <div className="text-[11px] text-slate-400">
              {CMC_MARKET_CYCLES.twoHundredWeekMa.status}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. BITCOIN DOMINANCE
  if (section === 'btc_dominance') {
    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Bitcoin Dominance စျေးကွက်ရှယ်ယာ (BTC.D)' : 'Bitcoin Dominance (BTC.D)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'စုစုပေါင်း cryptocurrency စျေးကွက်တန်ဖိုးတွင် Bitcoin ၏ စျေးကွက်ဝေစုနှင့် Altcoins များအပေါ် လွှမ်းမိုးမှုအချိုးအစား'
              : 'Percentage of total cryptocurrency market capitalization held by Bitcoin compared to Ethereum and alternative assets.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={getTradeImpactGuide('btc_dominance')}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="DOMINANCE REGIME"
        />

        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black font-mono text-amber-400">
              {CMC_MARKET_OVERVIEW.btcDominance}%
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              ▲ +{CMC_MARKET_OVERVIEW.btcDominanceChange}% in 24h
            </span>
          </div>

          {/* Dominance Bar Breakdown */}
          <div className="space-y-2 pt-2">
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800">
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${CMC_MARKET_OVERVIEW.btcDominance}%` }}
                title="Bitcoin 58.4%"
              />
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${CMC_MARKET_OVERVIEW.ethDominance}%` }}
                title="Ethereum 13.8%"
              />
              <div
                className="bg-emerald-500 h-full"
                style={{ width: '6.4%' }}
                title="Stablecoins 6.4%"
              />
              <div
                className="bg-purple-500 h-full"
                style={{ width: '21.4%' }}
                title="Altcoins 21.4%"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300">Bitcoin: 58.4%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-300">Ethereum: 13.8%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Stablecoins: 6.4%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-300">Altcoins: 21.4%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. KA 20 & 100 INDEX
  if (section === 'cmc_20_index' || section === 'cmc_100_index') {
    const is20 = section === 'cmc_20_index';
    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {is20 ? (isMy ? 'KA 20 Mega-Cap အညွှန်းကိန်း' : 'KA 20 Mega-Cap Index') : (isMy ? 'KA 100 Broad Market အညွှန်းကိန်း' : 'KA 100 Broad Market Index')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {is20
              ? (isMy ? 'ထိပ်တန်း Crypto Mega-Cap ပိုင်ဆိုင်မှု ၂၀ ၏ စျေးကွက်တန်ဖိုး အချိုးကျ အညွှန်းကိန်း။' : 'Market-cap weighted index representing the top 20 crypto mega-cap assets.')
              : (isMy ? 'ထိပ်တန်း ဒစ်ဂျစ်တယ် ပိုင်ဆိုင်မှု ၁၀၀ ၏ စွမ်းဆောင်ရည်ကို ခြုံငုံပြသသော စျေးကွက်စံနှုန်း အညွှန်းကိန်း။' : 'Broad-market crypto index benchmarking performance across the top 100 digital assets.')}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black font-mono text-white">
              {is20 ? CMC_MARKET_OVERVIEW.cmc20Index.value : CMC_MARKET_OVERVIEW.cmc100Index.value}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              ▲ +{is20 ? CMC_MARKET_OVERVIEW.cmc20Index.change24h : CMC_MARKET_OVERVIEW.cmc100Index.change24h}% (24h)
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isMy
              ? 'အဖွဲ့အစည်းအဆင့် ရင်းနှီးမြှုပ်နှံမှု စံနှုန်းများနှင့်အညီ သုံးလတစ်ကြိမ် ပြန်လည်ချိန်ညှိ (Rebalance) ထားပြီး ကျောထောက်နောက်ခံမဲ့ algorithmic stablecoin များကို ဖယ်ထုတ်ထားပါသည်။'
              : 'Rebalanced quarterly to maintain strict institutional diversification standards, excluding non-backed algorithmic stablecoins.'}
          </p>
        </div>
      </div>
    );
  }

  // Safe fallback to prevent blank/white screen if any unhandled section occurs
  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          {isMy ? 'Fear and Greed စိတ်ခံစားမှု အညွှန်းကိန်း' : 'Fear and Greed Index'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {isMy
            ? 'မက်ခရို စျေးကွက် စိတ်ခံစားမှုနှင့် သင့်လက်ရွေးစင် ထိပ်တန်းဒင်္ဂါး ၅ ခု၏ နည်းပညာဆိုင်ရာ အခြေအနေကို နှိုင်းယှဉ်ချက်'
            : 'Analyzing macroeconomic sentiment and comparing broad crypto market emotion with your specific top 5 coins.'}
        </p>
      </div>

      <TradeImpactBanner
        guide={getTradeImpactGuide('fear_greed')}
        lang={lang}
        onTradeInDemo={onTradeInDemo}
        onOpenCalculator={onOpenCalculator}
        contextTitle="SENTIMENT BIAS"
      />
    </div>
  );
};
