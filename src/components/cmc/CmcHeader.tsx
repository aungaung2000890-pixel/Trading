import React from 'react';
import { Search, Menu, Diamond, Sparkles, Flame, Gauge, TrendingUp } from 'lucide-react';
import { LiveFearAndGreedData, LiveTickerItem } from '../../types';

interface CmcHeaderProps {
  lang: 'my' | 'en';
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSidebar?: () => void;
  fearAndGreed?: LiveFearAndGreedData | null;
  tickers?: LiveTickerItem[];
}

export const CmcHeader: React.FC<CmcHeaderProps> = ({
  lang,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  fearAndGreed,
  tickers = [],
}) => {
  const isMy = lang === 'my';
  const fngVal = fearAndGreed?.value ?? 62;
  const fngLabel = fearAndGreed?.classification ?? 'Greed';

  return (
    <div className="sticky top-0 z-30 shadow-md">
      {/* 1. CoinMarketCap Global Stats Top Ticker Bar (1:1 with https://coinmarketcap.com/) */}
      <div className="w-full bg-[#090D14] border-b border-slate-800/80 px-4 py-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono text-slate-400 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Cryptos:</span>
            <span className="text-blue-400 font-bold">2.4M+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Exchanges:</span>
            <span className="text-blue-400 font-bold">754</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Market Cap:</span>
            <span className="text-white font-bold">$2.41T</span>
            <span className="text-emerald-400 font-bold">▲ 2.14%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">24h Vol:</span>
            <span className="text-white font-bold">$76.84B</span>
            <span className="text-rose-400 font-bold">▼ 5.42%</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-400">Dominance:</span>
            <span className="text-blue-400 font-bold">BTC: 56.8%</span>
            <span className="text-indigo-400 font-bold">ETH: 14.2%</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-slate-400">ETH Gas:</span>
            <span className="text-amber-400 font-bold">12 Gwei</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/60">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Fear & Greed:</span>
            <span className="font-bold text-emerald-400">{fngVal}/100 ({fngLabel})</span>
          </div>
        </div>
      </div>

      {/* 2. Main CoinMarketCap Navigation Bar */}
      <header className="w-full bg-[#0D1117] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + CoinMarketCap Brand Emblem & Title */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Official CoinMarketCap Style Emblem & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <span className="text-white font-black text-xs font-mono tracking-wider">CMC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
                CoinMarketCap
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono font-bold border border-blue-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">
                {isMy ? '1:1 တရားဝင် စျေးကွက်ဒေတာစင်တာ' : '1:1 Official Market Intelligence'}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Search, Diamond Rewards, Live Feed Tag */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative w-40 sm:w-56 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isMy ? "အကြွေစေ့များ ရှာရန်..." : "Search coin, metrics..."}
              className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition font-mono"
            />
          </div>

          {/* Diamond Rewards Icon */}
          <button
            title="CMC Diamonds"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-400 border border-slate-700/60 transition flex items-center gap-1 cursor-pointer"
          >
            <Diamond className="w-4 h-4 fill-cyan-400/20" />
          </button>

          {/* Live Synchronized Tag */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Sync</span>
          </div>
        </div>
      </header>
    </div>
  );
};
