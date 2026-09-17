import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
} from 'lucide-react';
import { CMC_SPOT_MARKET_DATA } from '../../../data/cmcData';
import { CmcSectionId } from '../CmcSidebar';
import { CmcTopNav } from '../CmcTopNav';

interface SpotMarketViewProps {
  lang: 'my' | 'en';
  onNavigateSection: (section: CmcSectionId) => void;
}

export const SpotMarketView: React.FC<SpotMarketViewProps> = ({
  lang,
  onNavigateSection,
}) => {
  const isMy = lang === 'my';
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '1Y' | 'ALL'>('7D');

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
      {/* Top Horizontal Sub-Tabs (Unified 7 tabs as in Screenshot 1 & 2) */}
      <CmcTopNav
        lang={lang}
        activeSection="spot_market"
        onNavigateSection={onNavigateSection}
      />

      {/* Main Title Header & API Details Button (Screenshot 2) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Spot Market
            </h1>
            <button className="px-3 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition">
              <span>See API Details</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-4xl leading-relaxed">
          Discover our cryptocurrency spot market data page, featuring crypto market cap, trading volumes, and historical performance. Analyze CEX and DEX activity, explore yearly trends, and make informed decisions with our easy-to-use API and detailed analytics tools.
        </p>
      </div>

      {/* 3 Metric Cards in Row (Exact Screenshot 2 Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: Crypto Market Cap */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Crypto Market Cap
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {CMC_SPOT_MARKET_DATA.cryptoMarketCapUsd}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold font-mono text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>▼ {Math.abs(CMC_SPOT_MARKET_DATA.marketCapChange24h)}%(24h)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            DEX / CEX Ratio: 8.68% · Global Liquid Supply
          </div>
        </div>

        {/* CARD 2: Market Cap Historical Values */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Market Cap Historical Values
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Yesterday</span>
              <span className="font-bold text-white">{CMC_SPOT_MARKET_DATA.historicalValues.yesterday}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Last Week</span>
              <span className="font-bold text-white">{CMC_SPOT_MARKET_DATA.historicalValues.lastWeek}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Last Month</span>
              <span className="font-bold text-white">{CMC_SPOT_MARKET_DATA.historicalValues.lastMonth}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1">
            Historical daily close snapshots
          </div>
        </div>

        {/* CARD 3: Market Cap Yearly Performance */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 flex flex-col justify-between space-y-3 relative group">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Market Cap Yearly Performance
            </div>
            <button className="p-1 rounded-lg text-slate-400 hover:text-white transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <div className="text-slate-400">
                <span>Yearly High </span>
                <span className="text-[10px] text-slate-400">({CMC_SPOT_MARKET_DATA.yearlyPerformance.yearlyHigh.date})</span>
              </div>
              <span className="font-bold text-emerald-400">{CMC_SPOT_MARKET_DATA.yearlyPerformance.yearlyHigh.value}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="text-slate-400">
                <span>Yearly Low </span>
                <span className="text-[10px] text-slate-400">({CMC_SPOT_MARKET_DATA.yearlyPerformance.yearlyLow.date})</span>
              </div>
              <span className="font-bold text-rose-400">{CMC_SPOT_MARKET_DATA.yearlyPerformance.yearlyLow.value}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1">
            Cycle Range: $2.04T - $4.20T (52-week envelope)
          </div>
        </div>
      </div>

      {/* Crypto Market Cap Chart (Exact Screenshot 2 Component) */}
      <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Crypto Market Cap Chart</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical market capitalization trend and exchange volume dynamics
            </p>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
            {(['1D', '7D', '1M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive SVG Area Chart */}
        <div className="w-full h-64 relative pt-4">
          <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="0" y1="40" x2="800" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="160" x2="800" y2="160" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="220" x2="800" y2="220" stroke="#1e293b" />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="marketCapGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area */}
            <path
              d="M 0,160 L 133,130 L 266,95 L 400,45 L 533,70 L 666,110 L 800,160 L 800,220 L 0,220 Z"
              fill="url(#marketCapGradient)"
            />

            {/* Area Line */}
            <path
              d="M 0,160 L 133,130 L 266,95 L 400,45 L 533,70 L 666,110 L 800,160"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Key Data Point Markers */}
            <circle cx="400" cy="45" r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
            <circle cx="800" cy="160" r="5" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
          </svg>

          {/* Chart Axis Labels */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2">
            <span>Sep 10 ($2.52T)</span>
            <span>Sep 12 ($2.61T)</span>
            <span className="text-blue-400 font-bold">Sep 13 Peak ($2.68T)</span>
            <span>Sep 15 ($2.63T)</span>
            <span className="text-white font-bold">Today ($2.58T)</span>
          </div>
        </div>

        {/* Volume & Activity Breakdown Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Centralized (CEX) Volume:</span>
            <div className="text-sm font-black font-mono text-white mt-1">
              {CMC_SPOT_MARKET_DATA.cexVolume24h}
            </div>
            <span className="text-[10px] text-slate-400">Binance, OKX, Bybit, Coinbase</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Decentralized (DEX) Volume:</span>
            <div className="text-sm font-black font-mono text-emerald-400 mt-1">
              {CMC_SPOT_MARKET_DATA.dexVolume24h}
            </div>
            <span className="text-[10px] text-slate-400">Uniswap, Raydium, PancakeSwap</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Vol / Market Cap Ratio:</span>
            <div className="text-sm font-black font-mono text-amber-400 mt-1">
              {CMC_SPOT_MARKET_DATA.volumeMarketCapRatio}
            </div>
            <span className="text-[10px] text-slate-400">High liquidity liquidity benchmark</span>
          </div>
        </div>
      </div>
    </div>
  );
};
