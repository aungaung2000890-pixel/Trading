import React, { useState } from 'react';
import { CmcTopNav } from '../CmcTopNav';
import { CmcSectionId } from '../CmcSidebar';
import { ExternalLink, TrendingUp, Layers, Activity } from 'lucide-react';
import { TradeImpactBanner } from '../TradeImpactBanner';
import { CMC_TRADE_IMPACT_BY_SECTION } from '../../../data/cmcData';

interface CryptocurrenciesViewProps {
  lang: 'my' | 'en';
  onNavigateSection: (section: CmcSectionId) => void;
  onTradeInDemo?: (symbol?: string) => void;
  onOpenCalculator?: (symbol?: string) => void;
}

export const CryptocurrenciesView: React.FC<CryptocurrenciesViewProps> = ({
  lang,
  onNavigateSection,
  onTradeInDemo,
  onOpenCalculator,
}) => {
  const isMy = lang === 'my';

  // Interactive controls for Chart 1 (Cryptocurrencies by Chain)
  const [chainMetric, setChainMetric] = useState<'market_share' | 'total'>('market_share');
  const [chainTimeframe, setChainTimeframe] = useState<'30d' | '1y' | 'all'>('1y');

  // Interactive controls for Chart 2 (Total Tracked)
  const [totalTimeframe, setTotalTimeframe] = useState<'30d' | '1y' | 'all'>('1y');

  // Categories for the sector table
  const categories = [
    { name: 'Layer 1 (L1)', count: 284, cap: '$1.82T', share: '70.5%' },
    { name: 'Layer 2 (L2)', count: 142, cap: '$42.1B', share: '1.6%' },
    { name: 'DeFi & Lending', count: 1250, cap: '$88.5B', share: '3.4%' },
    { name: 'AI & Big Data', count: 320, cap: '$36.4B', share: '1.4%' },
    { name: 'Meme Coins', count: 2450, cap: '$58.2B', share: '2.2%' },
    { name: 'Real World Assets (RWA)', count: 180, cap: '$12.8B', share: '0.5%' },
    { name: 'DePIN Infrastructure', count: 210, cap: '$24.6B', share: '0.9%' },
  ];

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
      {/* Top Horizontal Sub-Tabs (Image 1 & 2 requirement) */}
      <CmcTopNav
        lang={lang}
        activeSection="cryptocurrencies"
        onNavigateSection={onNavigateSection}
      />

      {/* Main Title Header with Custom Identity (No literal CoinMarketCap) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isMy ? 'KA Tracked Cryptocurrencies ဒေတာဘေ့စ်' : 'Cryptocurrencies Tracked by KA Terminal'}
            </h1>
            <button className="px-3 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition cursor-pointer">
              <span>{isMy ? 'API အချက်အလက်' : 'See API Details'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-4xl leading-relaxed">
          {isMy
            ? 'လက်ရှိတည်ရှိနေသော cryptocurrencies စုစုပေါင်းအရေအတွက်နှင့် အချိန်နှင့်အမျှ စဉ်ဆက်မပြတ် တိုးတက်လာသော ဒေတာများကို လေ့လာနိုင်ပါသည်။ သမိုင်းဝင်အရေအတွက်များ၊ နှစ်အလိုက် တိုးချဲ့မှုများနှင့် blockchain တစ်ခုချင်းစီပေါ်တွင် စောင့်ကြည့်မှတ်တမ်းတင်ထားသော coin/token ပမာဏများကို တိကျစွာ ခွဲခြမ်းစိတ်ဖြာနိုင်ပါသည်။'
            : 'Explore our cryptocurrency count page, showcasing the total number of cryptocurrencies in existence and the ongoing growth in the number of coins and tokens tracked by our intelligence network. Dive into historical counts, yearly expansions, and the number of cryptos tracked on each chain.'}
        </p>
      </div>

      {/* Trade Impact Guide Banner */}
      <TradeImpactBanner
        guide={CMC_TRADE_IMPACT_BY_SECTION['market_overview']}
        lang={lang}
        onTradeInDemo={onTradeInDemo}
        onOpenCalculator={onOpenCalculator}
        contextTitle="TOKEN DILUTION & LIQUIDITY"
      />

      {/* Top Section: Left Metric Cards + Overview Chart (Image 1 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (3 Cards exactly as seen in Image 1) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Total Number of Cryptos Tracked */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400">
              {isMy ? 'စောင့်ကြည့်မှတ်တမ်းတင်ထားသော Crypto စုစုပေါင်း' : 'Total Number of Cryptos Tracked'}
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
              60.64M
            </div>
            <div className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1 pt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+135,672 added in last 24h</span>
            </div>
          </div>

          {/* Card 2: Total Cryptos Created */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-400">
              {isMy ? 'အသစ်ဖန်တီးထားသော Cryptos စုစုပေါင်း' : 'Total Cryptos Created'}
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/70">
                <span className="text-slate-400">{isMy ? 'လွန်ခဲ့သော ၂၄ နာရီ' : 'Last 24h'}</span>
                <span className="font-bold text-white">135,672</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/70">
                <span className="text-slate-400">{isMy ? 'လွန်ခဲ့သော ၇ ရက်' : 'Last 7d'}</span>
                <span className="font-bold text-white">675,805</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">{isMy ? 'လွန်ခဲ့သော ၃၀ ရက်' : 'Last 30d'}</span>
                <span className="font-bold text-white">3,493,632</span>
              </div>
            </div>
          </div>

          {/* Card 3: Yearly Performance */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-400">
              {isMy ? 'နှစ်အလိုက် အမြင့်ဆုံး/အနိမ့်ဆုံး စွမ်းဆောင်ရည်' : 'Yearly Performance'}
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/70">
                <div className="text-slate-400">
                  <span>Yearly High </span>
                  <span className="text-[10px] text-slate-400">(Mar 18, 2026)</span>
                </div>
                <span className="font-bold text-emerald-400">7,681,147</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="text-slate-400">
                  <span>Yearly Low </span>
                  <span className="text-[10px] text-slate-400">(Sep 15, 2026)</span>
                </div>
                <span className="font-bold text-rose-400">77</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column in Image 1: Highlight preview summary */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#131722] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-black text-white">
                {isMy ? 'Crypto ထုတ်လုပ်မှု အရှိန်အဟုန်နှင့် တိုးတက်မှုနှုန်း' : 'Crypto Generation & Multi-Chain Expansion'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMy ? 'Solana, Base, BSC နှင့် အခြားသော စမတ်ကန်ထရိုက်များပေါ်ရှိ တိုကင်ထုတ်လုပ်မှုများ' : 'Token deployments across Solana, Base, BSC, Sui, Ethereum, and emerging L1/L2 networks'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Live Feed
            </span>
          </div>

          {/* Quick macro distribution telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Solana Share:</span>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">48.2%</div>
              <span className="text-[10px] text-slate-400">Pump.fun & DEX Pools</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Base (L2) Share:</span>
              <div className="text-xl font-black font-mono text-rose-400 mt-1">26.8%</div>
              <span className="text-[10px] text-slate-400">Rapid 2026 expansion</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">BSC Share:</span>
              <div className="text-xl font-black font-mono text-cyan-400 mt-1">15.4%</div>
              <span className="text-[10px] text-slate-400">PancakeSwap ecosystem</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Ethereum + Sui:</span>
              <div className="text-xl font-black font-mono text-amber-400 mt-1">9.6%</div>
              <span className="text-[10px] text-slate-400">DeFi & High-Value Caps</span>
            </div>
          </div>

          {/* Micro Trendline visualization preview */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>2026 Growth Acceleration Phase</span>
              <span className="text-emerald-400 font-bold">+162% vs 2025</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '48.2%' }} title="Solana 48.2%" />
              <div className="bg-rose-400 h-full" style={{ width: '26.8%' }} title="Base 26.8%" />
              <div className="bg-cyan-400 h-full" style={{ width: '15.4%' }} title="BSC 15.4%" />
              <div className="bg-amber-400 h-full" style={{ width: '5.2%' }} title="Ethereum 5.2%" />
              <div className="bg-blue-500 h-full" style={{ width: '4.4%' }} title="SUI + Others 4.4%" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: The Exact Two Charts from Image 3 (Full Detail, No Detail Missing) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: Cryptocurrencies by Chain (Exact Image 3 Left Component) */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 flex flex-col justify-between space-y-4">
          {/* Header & Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Cryptocurrencies by Chain
              </h3>

              <div className="flex items-center gap-2">
                {/* Market Share / Total Toggle (Image 3) */}
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setChainMetric('market_share')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      chainMetric === 'market_share'
                        ? 'bg-slate-700/90 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Market Share
                  </button>
                  <button
                    onClick={() => setChainMetric('total')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      chainMetric === 'total'
                        ? 'bg-slate-700/90 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Total
                  </button>
                </div>

                {/* Timeframe Buttons: 30d, 1y, All (Image 3) */}
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['30d', '1y', 'all'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setChainTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg font-bold font-mono transition cursor-pointer ${
                        chainTimeframe === tf
                          ? 'bg-slate-700/90 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf === 'all' ? 'All' : tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chain Legend (Image 3 exact colors and items): SUI, Solana, Ethereum, Base, BSC, Others */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                <span className="text-slate-300">SUI</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-slate-300">Solana</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="text-slate-300">Ethereum</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
                <span className="text-slate-300">Base</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                <span className="text-slate-300">BSC</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" />
                <span className="text-slate-300">Others</span>
              </span>
            </div>
          </div>

          {/* SVG Stacked Area Chart (Exact visual as seen in Image 3) */}
          <div className="relative w-full h-64 sm:h-72 pt-2">
            <div className="flex w-full h-full">
              {/* Left Y-axis labels: 100%, 75%, 50%, 25%, 0% */}
              <div className="w-10 flex flex-col justify-between text-[11px] font-mono text-slate-500 py-1 text-right pr-2 select-none">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Chart SVG Stage */}
              <div className="flex-1 relative h-full">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 220"
                  preserveAspectRatio="none"
                >
                  {/* Subtle horizontal grid lines */}
                  <line x1="0" y1="0" x2="500" y2="0" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="55" x2="500" y2="55" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="165" x2="500" y2="165" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="220" x2="500" y2="220" stroke="#1e293b" />

                  {/* LAYER 1 (Bottom): Solana (Green #10b981) */}
                  {/* In Image 3: Solana fills from bottom (y=220) up to roughly 50% (y=110) at start, and expands */}
                  <path
                    d="M 0,220 L 0,110 L 120,115 L 240,125 L 250,145 L 375,145 L 500,145 L 500,220 Z"
                    fill="#10b981"
                  />

                  {/* LAYER 2: Base (Coral #f87171) */}
                  {/* In Image 3: Base starts thin around Jan 2026 and then expands into a massive block */}
                  <path
                    d="M 0,110 L 0,95 L 120,100 L 240,105 L 250,75 L 375,77 L 500,92 L 500,145 L 375,145 L 250,145 L 240,125 L 120,115 L 0,110 Z"
                    fill="#f87171"
                  />

                  {/* LAYER 3: BSC (Cyan #06b6d4) */}
                  {/* In Image 3: BSC sits on top of Base from roughly 75% to 90% */}
                  <path
                    d="M 0,95 L 0,35 L 120,38 L 240,42 L 250,30 L 375,32 L 500,40 L 500,92 L 375,77 L 250,75 L 240,105 L 120,100 L 0,95 Z"
                    fill="#06b6d4"
                  />

                  {/* LAYER 4: Ethereum (Gold #f59e0b) */}
                  <path
                    d="M 0,35 L 0,22 L 120,24 L 240,26 L 250,20 L 375,22 L 500,28 L 500,40 L 375,32 L 250,30 L 240,42 L 120,38 L 0,35 Z"
                    fill="#f59e0b"
                  />

                  {/* LAYER 5: SUI (Blue #3b82f6) */}
                  <path
                    d="M 0,22 L 0,10 L 120,12 L 240,14 L 250,10 L 375,11 L 500,15 L 500,28 L 375,22 L 250,20 L 240,26 L 120,24 L 0,22 Z"
                    fill="#3b82f6"
                  />

                  {/* LAYER 6 (Top): Others (Gray #94a3b8) */}
                  <path
                    d="M 0,10 L 0,0 L 500,0 L 500,15 L 375,11 L 250,10 L 240,14 L 120,12 L 0,10 Z"
                    fill="#94a3b8"
                  />
                </svg>

                {/* Subtle watermark in bottom-right (as seen in Image 3) */}
                <div className="absolute right-4 bottom-4 flex items-center gap-1.5 opacity-25 pointer-events-none select-none">
                  <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[9px] font-black font-mono">
                    KA
                  </div>
                  <span className="text-xs font-bold text-white tracking-wider">Terminal</span>
                </div>
              </div>
            </div>

            {/* X-axis date labels: Sep 2025, Jan 2026, May 2026 (Image 3) */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pl-10 pr-2 pt-2">
              <span>Sep 2025</span>
              <span>Jan 2026</span>
              <span>May 2026</span>
            </div>
          </div>
        </div>

        {/* CHART 2: Total Tracked (Exact Image 3 Right Component) */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 flex flex-col justify-between space-y-4">
          {/* Header & Controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Total Tracked
            </h3>

            {/* Timeframe Buttons: 30d, 1y, All (Image 3) */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {(['30d', '1y', 'all'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTotalTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg font-bold font-mono transition cursor-pointer ${
                    totalTimeframe === tf
                      ? 'bg-slate-700/90 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf === 'all' ? 'All' : tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart (Exact visual as seen in Image 3) */}
          <div className="relative w-full h-64 sm:h-72 pt-2">
            <div className="flex w-full h-full">
              {/* Left Y-axis labels: 80M, 60M, 40M, 20M, 0 (Image 3) */}
              <div className="w-10 flex flex-col justify-between text-[11px] font-mono text-slate-500 py-1 text-right pr-2 select-none">
                <span>80M</span>
                <span>60M</span>
                <span>40M</span>
                <span>20M</span>
                <span>0</span>
              </div>

              {/* Chart SVG Stage */}
              <div className="flex-1 relative h-full">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 220"
                  preserveAspectRatio="none"
                >
                  {/* Subtle dashed horizontal grid lines matching Image 3 */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="170" x2="500" y2="170" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="220" x2="500" y2="220" stroke="#1e293b" strokeDasharray="2 2" />

                  {/* Gradient Area Fill Under Line */}
                  <defs>
                    <linearGradient id="totalTrackedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <path
                    d="M 0,185 C 80,180 150,170 210,158 C 245,150 250,120 255,108 C 290,95 340,90 390,82 C 430,75 465,65 490,53 L 490,220 L 0,220 Z"
                    fill="url(#totalTrackedGradient)"
                  />

                  {/* The crisp blue rising curve line (Image 3) */}
                  <path
                    d="M 0,185 C 80,180 150,170 210,158 C 245,150 250,120 255,108 C 290,95 340,90 390,82 C 430,75 465,65 490,53"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* End marker point */}
                  <circle cx="490" cy="53" r="4.5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                </svg>

                {/* The Bright Blue Pill Badge attached to the end (Image 3: 60.64M) */}
                <div
                  className="absolute right-0 top-[18%] -translate-y-1/2 px-2 py-1 rounded-md bg-blue-600 text-white font-mono font-black text-xs shadow-lg shadow-blue-600/30 select-none z-10 flex items-center"
                  style={{ right: '0px' }}
                >
                  60.64M
                </div>

                {/* Subtle watermark logo in bottom-right (Image 3) */}
                <div className="absolute right-4 bottom-4 flex items-center gap-1.5 opacity-25 pointer-events-none select-none">
                  <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[9px] font-black font-mono">
                    KA
                  </div>
                  <span className="text-xs font-bold text-white tracking-wider">Terminal</span>
                </div>
              </div>
            </div>

            {/* X-axis date labels: Sep 2025, Jan 2026, May 2026 (Image 3) */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pl-10 pr-2 pt-2">
              <span>Sep 2025</span>
              <span>Jan 2026</span>
              <span>May 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Sectors Breakdown Table (from Image 2) */}
      <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {isMy ? 'Cryptocurrency Sectors ခွဲခြမ်းစိတ်ဖြာမှု' : 'Cryptocurrency Sectors Breakdown'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isMy ? 'ဂေဟစနစ်ကဏ္ဍအလိုက် စျေးကွက်အရင်းအနှီးနှင့် အချိုးအစားများ' : 'Market capitalization weights and coins distribution by ecosystem sector'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Coins: 14,820 Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Coins Count</th>
                <th className="py-2.5 px-3">Total Market Cap</th>
                <th className="py-2.5 px-3">Market Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.map((c) => (
                <tr key={c.name} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-sans font-bold text-white">{c.name}</td>
                  <td className="py-3 px-3 text-slate-300">{c.count.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-blue-400">{c.cap}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-slate-300 font-bold">{c.share}</span>
                      <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: c.share }}
                        />
                      </div>
                    </div>
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
