import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Info,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { LiveFearAndGreedData, LiveTickerItem, CoinOpportunity } from '../../../types';
import { CMC_MARKET_OVERVIEW, CMC_ALTCOIN_SEASON_DATA, CMC_TRADE_IMPACT_BY_SECTION } from '../../../data/cmcData';
import { analyzeTop5Sentiment, analyzeMajor5Sentiment } from '../../MarketSentimentIndicator';
import { CmcSectionId } from '../CmcSidebar';

import { CmcTopNav } from '../CmcTopNav';
import { CmcCryptocurrenciesTable } from '../CmcCryptocurrenciesTable';
import { TradeImpactBanner } from '../TradeImpactBanner';

interface MarketOverviewViewProps {
  lang: 'my' | 'en';
  fearAndGreed?: LiveFearAndGreedData | null;
  tickers?: LiveTickerItem[];
  coins: CoinOpportunity[];
  onNavigateSection: (section: CmcSectionId) => void;
  onSelectCoin?: (coin: CoinOpportunity) => void;
  onTradeInDemo?: (symbol: string, side: 'LONG' | 'SHORT') => void;
}

export const MarketOverviewView: React.FC<MarketOverviewViewProps> = ({
  lang,
  fearAndGreed,
  tickers = [],
  coins,
  onNavigateSection,
  onSelectCoin,
  onTradeInDemo,
}) => {
  const isMy = lang === 'my';
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showDualSentiment, setShowDualSentiment] = useState(false);
  const [cohort, setCohort] = useState<'majors' | 'opportunities'>('majors');

  // Fear & Greed values
  const fngValue = fearAndGreed?.value ?? 62;
  const fngClass = fearAndGreed?.classification || 'Greed';

  // Sentiment Divergence with Top 5
  const top5Sentiment = useMemo(() => {
    if (cohort === 'majors') return analyzeMajor5Sentiment(tickers);
    return analyzeTop5Sentiment(coins);
  }, [cohort, tickers, coins]);

  // Market coins list for the top carousel
  const carouselCoins = useMemo(() => {
    const list = [
      { symbol: 'BTC', name: 'Bitcoin', price: 76091.10, change: -0.96, spark: [76800, 76500, 76200, 76600, 76091] },
      { symbol: 'ETH', name: 'Ethereum', price: 2410.21, change: -1.01, spark: [2440, 2430, 2415, 2425, 2410] },
      { symbol: 'BNB', name: 'BNB', price: 719.61, change: -0.42, spark: [723, 721, 718, 720, 719] },
      { symbol: 'SOL', name: 'Solana', price: 98.55, change: -1.33, spark: [100.2, 99.4, 98.2, 99.1, 98.55] },
      { symbol: 'DOGE', name: 'Dogecoin', price: 0.1284, change: 2.45, spark: [0.125, 0.126, 0.127, 0.129, 0.1284] },
      { symbol: 'XRP', name: 'XRP', price: 0.584, change: 0.82, spark: [0.578, 0.581, 0.579, 0.583, 0.584] },
      { symbol: 'ADA', name: 'Cardano', price: 0.382, change: -0.65, spark: [0.385, 0.384, 0.381, 0.383, 0.382] },
      { symbol: 'SUI', name: 'Sui', price: 2.14, change: 4.80, spark: [2.04, 2.08, 2.10, 2.16, 2.14] },
    ];

    // Overlay with live ticker data if available
    return list.map((c) => {
      const live = tickers.find((t) => t.symbol.toUpperCase() === c.symbol);
      if (live && live.lastPrice > 0) {
        return {
          ...c,
          price: live.lastPrice,
          change: live.change24h,
        };
      }
      return c;
    });
  }, [tickers]);

  const visibleCoins = carouselCoins.slice(carouselIndex, carouselIndex + 4);

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
      {/* Top Horizontal Sub-Tabs (Unified 7 tabs as in Screenshot 1 & 2) */}
      <CmcTopNav
        lang={lang}
        activeSection="market_overview"
        onNavigateSection={onNavigateSection}
      />

      {/* Main Title Header & API Details Button */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isMy ? 'Crypto စျေးကွက် အကျဉ်းချုပ်' : 'Crypto Market Overview'}
            </h1>
            <button className="px-3 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition cursor-pointer">
              <span>{isMy ? 'API အချက်အလက်' : 'See API Details'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-4xl leading-relaxed">
          {isMy
            ? 'Bitcoin dominance၊ altcoin season၊ ETF အသားတင်ငွေစီးဆင်းမှုများနှင့် real-time market sentiment အပါအဝင် နောက်ဆုံးပေါ် cryptocurrency စျေးကွက်လမ်းကြောင်းများကို KA Market Intelligence ပလက်ဖောင်းပေါ်တွင် အချိန်နှင့်တပြေးညီ ကြည့်ရှုနိုင်ပါသည်။'
            : 'Stay updated on the latest cryptocurrency market trends, including Bitcoin dominance, altcoin season, ETF net flows, and real-time market sentiment, all conveniently accessible in one place on KA Market Intelligence.'}
        </p>
      </div>

      {/* Expert Trade Impact & Signals Playbook */}
      <TradeImpactBanner
        guide={CMC_TRADE_IMPACT_BY_SECTION['market_overview']}
        lang={lang}
        onTradeInDemo={onTradeInDemo ? (sym) => onTradeInDemo(sym || 'BTCUSDT', 'LONG') : undefined}
        contextTitle="OVERVIEW REGIME"
      />

      {/* Horizontal Coin Cards Carousel (Screenshot 1) */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {visibleCoins.map((coin) => {
            const isNegative = coin.change < 0;
            return (
              <div
                key={coin.symbol}
                onClick={() => {
                  const match = coins.find((c) => c.symbol.toUpperCase() === coin.symbol);
                  if (match && onSelectCoin) onSelectCoin(match);
                }}
                className="p-3.5 rounded-2xl bg-[#131722] border border-slate-800 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
                      {coin.symbol.slice(0, 3)}
                    </div>
                    <span className="text-xs font-bold text-slate-200">{coin.name}</span>
                  </div>
                  {/* Mini Sparkline SVG */}
                  <div className="w-16 h-7">
                    <svg className="w-full h-full" viewBox="0 0 100 40">
                      <path
                        d={
                          isNegative
                            ? "M 0,10 L 25,25 L 50,20 L 75,35 L 100,32"
                            : "M 0,35 L 25,20 L 50,25 L 75,10 L 100,8"
                        }
                        fill="none"
                        stroke={isNegative ? "#f43f5e" : "#10b981"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-sm sm:text-base font-black font-mono text-white">
                    ${coin.price > 10 ? coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price.toFixed(4)}
                  </div>
                  <div
                    className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
                      isNegative ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isNegative ? '▼' : '▲'} {Math.abs(coin.change).toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Prev/Next Buttons */}
        {carouselCoins.length > 4 && (
          <div className="flex justify-end gap-1 mt-2">
            <button
              onClick={() => setCarouselIndex((prev) => Math.max(0, prev - 2))}
              disabled={carouselIndex === 0}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 transition text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCarouselIndex((prev) => Math.min(carouselCoins.length - 4, prev + 2))}
              disabled={carouselIndex >= carouselCoins.length - 4}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 transition text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Row 2: Fear & Greed Index Gauge & Altcoin Season Index (Exact Screenshot 1 Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WIDGET 1: Fear and Greed Index */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">Fear and Greed Index</h3>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <button
              onClick={() => setShowDualSentiment(!showDualSentiment)}
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 transition flex items-center gap-1 cursor-pointer"
            >
              <Activity className="w-3 h-3" />
              <span>{showDualSentiment ? (isMy ? 'CMC Only' : 'Single Gauge') : (isMy ? 'Dual Compare' : 'Dual Compare')}</span>
            </button>
          </div>

          {/* Semicircular Arc Gauge (Exact visual from Screenshot 1) */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-48 h-28 flex items-end justify-center">
              <svg className="w-48 h-28" viewBox="0 0 200 110">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Active Colored Arc (Gradient from Red to Green) */}
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="35%" stopColor="#f97316" />
                    <stop offset="65%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * Math.min(100, Math.max(0, fngValue))) / 100}
                />
              </svg>

              {/* Number and Label inside gauge */}
              <div className="absolute bottom-1 text-center">
                <div className="text-3xl font-black font-mono text-white leading-none">
                  {fngValue}
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                  {fngClass}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Historical sentiment: Prev Close {fearAndGreed?.previousClose ?? 63} · Last Week {fearAndGreed?.previousWeek ?? 71}
            </p>
          </div>

          {/* Optional Dual Sentiment Compare View */}
          {showDualSentiment && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Designated Top 5 Bias:</span>
                <span className="font-mono font-bold text-amber-400">{top5Sentiment.score}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${top5Sentiment.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Spread: {top5Sentiment.score - fngValue > 0 ? `+${top5Sentiment.score - fngValue}` : top5Sentiment.score - fngValue} pts</span>
                <span>{top5Sentiment.bullishCount} Longs / {top5Sentiment.neutralCount} Neutral</span>
              </div>
            </div>
          )}

          <button
            onClick={() => onNavigateSection('fear_greed')}
            className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>View Detailed Sentiment</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* WIDGET 2: Altcoin Season Index */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">Altcoin Season Index</h3>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <button
              onClick={() => onNavigateSection('altcoin_season')}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Large Score (Screenshot 1: 34 / 100) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                {CMC_ALTCOIN_SEASON_DATA.score}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">/ 100</span>
            </div>

            {/* Gradient Slider with marker dot (Exact visual from Screenshot 1) */}
            <div className="space-y-2">
              <div className="relative w-full h-2 rounded-full bg-gradient-to-r from-amber-500 via-blue-500 to-indigo-500">
                {/* Pointer marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md transition-all"
                  style={{ left: `calc(${CMC_ALTCOIN_SEASON_DATA.score}% - 8px)` }}
                />
              </div>

              {/* Labels */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="text-amber-400">Bitcoin Season</span>
                <span className="text-indigo-400">Altcoin Season</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {CMC_ALTCOIN_SEASON_DATA.description}
            </p>
          </div>

          {/* Quick Historical Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[10px] text-slate-400">Yesterday</div>
              <div className="font-bold text-white mt-0.5">36</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[10px] text-slate-400">Last Week</div>
              <div className="font-bold text-white mt-0.5">39</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[10px] text-slate-400">Last Month</div>
              <div className="font-bold text-white mt-0.5">28</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Macro Indicators (Bitcoin Dominance, Market Cap, ETF Daily Net Flow) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Dominance */}
        <div
          onClick={() => onNavigateSection('btc_dominance')}
          className="p-4 rounded-2xl bg-[#131722] border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
        >
          <div className="text-xs font-bold text-slate-400">Bitcoin Dominance</div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-amber-400">
              {CMC_MARKET_OVERVIEW.btcDominance}%
            </div>
            <span className="text-xs font-bold text-emerald-400">
              ▲ +{CMC_MARKET_OVERVIEW.btcDominanceChange}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            ETH: {CMC_MARKET_OVERVIEW.ethDominance}% · Others: 27.8%
          </div>
        </div>

        {/* Spot Market Cap */}
        <div
          onClick={() => onNavigateSection('spot_market')}
          className="p-4 rounded-2xl bg-[#131722] border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
        >
          <div className="text-xs font-bold text-slate-400">Crypto Market Cap</div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-white">
              ${CMC_MARKET_OVERVIEW.totalMarketCapUsd}T
            </div>
            <span className="text-xs font-bold text-emerald-400">
              ▲ +{CMC_MARKET_OVERVIEW.marketCapChange24h}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            24h Volume: ${CMC_MARKET_OVERVIEW.volume24hUsd}B
          </div>
        </div>

        {/* Spot ETF Flows */}
        <div
          onClick={() => onNavigateSection('bitcoin_etfs')}
          className="p-4 rounded-2xl bg-[#131722] border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
        >
          <div className="text-xs font-bold text-slate-400">Spot ETF Daily Net Flow</div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono text-emerald-400">
              +$142.8M
            </div>
            <span className="text-xs font-bold text-blue-400">
              BlackRock IBIT
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Cumulative Inflows: $21.84B AUM
          </div>
        </div>
      </div>

      {/* 4. Complete CoinMarketCap Flagship Cryptocurrencies Table (1:1 with https://coinmarketcap.com/) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{isMy ? "ယနေ့ စျေးကွက်အရင်းအနှီးအလိုက် Cryptocurrency ပေါက်စျေးများ" : "Today's Cryptocurrency Prices by Market Cap"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isMy
                ? 'ကမ္ဘာ့ crypto စျေးကွက် အရင်းအနှီးသည် $2.41T ဖြစ်ပြီး လွန်ခဲ့သော ၂၄ နာရီအတွင်း 2.14% မြင့်တက်ခဲ့ပါသည်။'
                : 'The global crypto market cap is $2.41T, a 2.14% increase over the last day.'}
            </p>
          </div>
        </div>

        <CmcCryptocurrenciesTable
          lang={lang}
          tickers={tickers}
          fearAndGreed={fearAndGreed}
          coins={coins}
          onSelectCoin={onSelectCoin}
          onTradeInDemo={onTradeInDemo}
        />
      </div>
    </div>
  );
};
