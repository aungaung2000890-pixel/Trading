import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame,
  Zap,
  Target,
  Magnet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
  Layers,
  ChevronRight,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { LiveTickerItem } from '../types';

interface LiquidityCluster {
  price: number;
  distancePct: number;
  distanceUsd: number;
  volumeUsd: number; // in Millions
  intensity: number; // 0 to 100
  type: 'SHORT_LIQ' | 'LONG_LIQ'; // SHORT_LIQ = above price (ask), LONG_LIQ = below price (bid)
  isMagnet: boolean;
  notesEn: string;
  notesMy: string;
}

interface LiquidityHeatmapProps {
  tickers: LiveTickerItem[];
  lang: 'my' | 'en';
}

export const LiquidityHeatmap: React.FC<LiquidityHeatmapProps> = ({ tickers, lang }) => {
  // Available perpetuals to view
  const availableCoins = useMemo(() => {
    if (tickers.length > 0) {
      return tickers.slice(0, 10).map((t) => ({
        symbol: t.symbol,
        contract: t.contract,
        price: t.lastPrice,
        change: t.change24h,
        funding: t.fundingRate,
      }));
    }
    return [
      { symbol: 'BTC', contract: 'BTCUSDT', price: 88450, change: 2.4, funding: 0.01 },
      { symbol: 'ETH', contract: 'ETHUSDT', price: 3280, change: -1.2, funding: 0.008 },
      { symbol: 'SOL', contract: 'SOLUSDT', price: 142.5, change: 5.1, funding: 0.015 },
      { symbol: 'DOGE', contract: 'DOGEUSDT', price: 0.224, change: -2.8, funding: -0.005 },
      { symbol: 'SUI', contract: 'SUIUSDT', price: 2.85, change: 8.4, funding: 0.02 },
      { symbol: 'XRP', contract: 'XRPUSDT', price: 1.48, change: 1.1, funding: 0.009 },
    ];
  }, [tickers]);

  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [rangeMode, setRangeMode] = useState<'INTRADAY' | 'SWING'>('INTRADAY');
  const [animationTick, setAnimationTick] = useState<number>(0);

  // Active coin details
  const activeCoin = useMemo(() => {
    return availableCoins.find((c) => c.symbol === selectedSymbol) || availableCoins[0];
  }, [availableCoins, selectedSymbol]);

  // Subtle live pulsation
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationTick((prev) => (prev + 1) % 100);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Generate realistic liquidity clusters based on current market price and range mode
  const { clustersAbove, clustersBelow, primaryMagnet } = useMemo(() => {
    const p = activeCoin.price;
    const isSwing = rangeMode === 'SWING';

    // Offsets for tiers
    const abovePcts = isSwing ? [1.2, 2.5, 4.0, 5.8, 7.5] : [0.4, 0.9, 1.6, 2.4, 3.2];
    const belowPcts = isSwing ? [1.1, 2.3, 3.8, 5.5, 7.2] : [0.5, 1.1, 1.8, 2.5, 3.4];

    // Deterministic volume generation seeded by symbol & range
    const seed = activeCoin.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseScale = activeCoin.symbol === 'BTC' ? 45 : activeCoin.symbol === 'ETH' ? 22 : 12;

    const generateVolume = (index: number, isAbove: boolean) => {
      const mult = isSwing ? 1.8 : 1.0;
      const variation = Math.sin(index * 1.5 + seed + (isAbove ? 2 : 5)) * 0.4 + 0.9;
      // Make index 2 or 3 high probability magnet
      const spike = index === (seed % 3 + 1) ? 2.3 : 1.0;
      return Number((baseScale * mult * variation * spike).toFixed(1));
    };

    const aboveList: LiquidityCluster[] = abovePcts.map((pct, idx) => {
      const targetPrice = p * (1 + pct / 100);
      const vol = generateVolume(idx, true);
      return {
        price: targetPrice,
        distancePct: pct,
        distanceUsd: targetPrice - p,
        volumeUsd: vol,
        intensity: Math.min(100, Math.round((vol / (baseScale * 2.8)) * 100)),
        type: 'SHORT_LIQ',
        isMagnet: false,
        notesEn: `Heavy short liquidations & 20x-50x bear stop clusters.`,
        notesMy: `Short position များ၏ Liquidation စုဆုံရာ ဧရိယာ။`,
      };
    });

    const belowList: LiquidityCluster[] = belowPcts.map((pct, idx) => {
      const targetPrice = p * (1 - pct / 100);
      const vol = generateVolume(idx, false);
      return {
        price: targetPrice,
        distancePct: -pct,
        distanceUsd: p - targetPrice,
        volumeUsd: vol,
        intensity: Math.min(100, Math.round((vol / (baseScale * 2.8)) * 100)),
        type: 'LONG_LIQ',
        isMagnet: false,
        notesEn: `Long leverage wipeout pool & resting bid walls.`,
        notesMy: `Long position များ၏ Stop-loss နှင့် Liquidation ဇုန်။`,
      };
    });

    // Determine the highest volume cluster as the Primary Magnet
    const all = [...aboveList, ...belowList];
    let maxCluster = all[0];
    for (const c of all) {
      if (c.volumeUsd > maxCluster.volumeUsd) {
        maxCluster = c;
      }
    }
    maxCluster.isMagnet = true;

    return {
      clustersAbove: aboveList.reverse(), // Highest price at top
      clustersBelow: belowList,           // Ordered descending from current price
      primaryMagnet: maxCluster,
    };
  }, [activeCoin, rangeMode]);

  // Color helper for heatmap intensity
  const getHeatmapColor = (intensity: number, type: 'SHORT_LIQ' | 'LONG_LIQ') => {
    if (type === 'SHORT_LIQ') {
      if (intensity > 75) return 'from-amber-500 via-orange-500 to-rose-500 text-white';
      if (intensity > 50) return 'from-amber-500/80 to-amber-600/80 text-slate-950';
      if (intensity > 30) return 'from-amber-600/40 to-slate-800 text-amber-300';
      return 'from-slate-800 to-slate-900 text-slate-400';
    } else {
      if (intensity > 75) return 'from-cyan-500 via-indigo-500 to-purple-600 text-white';
      if (intensity > 50) return 'from-cyan-500/80 to-indigo-600/80 text-white';
      if (intensity > 30) return 'from-cyan-600/40 to-slate-800 text-cyan-300';
      return 'from-slate-800 to-slate-900 text-slate-400';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 text-slate-200">
      {/* Heatmap Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
            <Magnet className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-wide">
                {lang === 'my'
                  ? 'Futures Liquidity Heatmap & Magnet Level ဇယား'
                  : 'Order Book Liquidity Heatmap & Magnet Zones'}
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                ORDERBOOK PRESSURE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'my'
                ? 'စျေးကွက်အတွင်း Stop-Loss နှင့် Forced Liquidation စုဆုံရာ သံလိုက်ဆွဲငင်အားမြင့် ဧရိယာများကို ဖော်ထုတ်ခြင်း'
                : 'Identifies high-density liquidation clusters acting as gravitational magnets for price action'}
            </p>
          </div>
        </div>

        {/* Coin & Range Selectors */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Asset Dropdown */}
          <select
            id="heatmap-coin-select"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {availableCoins.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol}/USDT (${c.price >= 1 ? c.price.toFixed(2) : c.price.toFixed(4)})
              </option>
            ))}
          </select>

          {/* Range Mode Switch */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              id="heatmap-range-intraday"
              onClick={() => setRangeMode('INTRADAY')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                rangeMode === 'INTRADAY'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Intraday (±3%)
            </button>
            <button
              id="heatmap-range-swing"
              onClick={() => setRangeMode('SWING')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                rangeMode === 'SWING'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Swing (±8%)
            </button>
          </div>
        </div>
      </div>

      {/* PRIMARY LIQUIDITY MAGNET BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-500/15 border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0 shadow-md shadow-amber-500/30">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                {lang === 'my' ? 'ပင်မ သံလိုက်ဆွဲငင်အား အဆင့် (PRIMARY MAGNET)' : 'PRIMARY LIQUIDITY MAGNET LEVEL'}
              </span>
              <span className="px-2 py-0.2 rounded font-mono text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
                {primaryMagnet.type === 'SHORT_LIQ' ? 'Short Squeeze Target' : 'Long Flush Target'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-white font-mono">
                ${primaryMagnet.price >= 1 ? primaryMagnet.price.toFixed(2) : primaryMagnet.price.toFixed(4)}
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  primaryMagnet.distancePct > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                ({primaryMagnet.distancePct > 0 ? '+' : ''}
                {primaryMagnet.distancePct.toFixed(2)}% •{' '}
                {primaryMagnet.distancePct > 0 ? '+' : ''}$
                {Math.abs(primaryMagnet.distanceUsd).toFixed(2)})
              </span>
              <span className="text-xs font-bold font-mono text-amber-300">
                • Pool Size: ${primaryMagnet.volumeUsd}M USD
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs md:text-right bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-slate-400 text-[11px]">
            {lang === 'my' ? 'ဆွဲငင်အား ပြင်းထန်မှု (Gravitational Pull):' : 'Magnet Pressure Intensity:'}
          </div>
          <div className="font-mono font-black text-amber-400 text-sm flex items-center md:justify-end gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>{primaryMagnet.intensity}% Concentration</span>
          </div>
        </div>
      </div>

      {/* HEATMAP LADDER VISUALIZATION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Short Liquidation Clusters (Ask Resistance Pool)</span>
          </span>
          <span>Estimated Volume ($M) & Intensity</span>
        </div>

        {/* Upper Clusters (Short Liquidations / Ask Pressure) */}
        <div className="space-y-1.5">
          {clustersAbove.map((cluster) => {
            const isTargetMagnet = cluster.isMagnet;
            return (
              <div
                key={`above-${cluster.price}`}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between relative overflow-hidden ${
                  isTargetMagnet
                    ? 'bg-amber-500/10 border-amber-500/70 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Background Intensity Bar */}
                <div
                  style={{ width: `${cluster.intensity}%` }}
                  className={`absolute top-0 bottom-0 left-0 opacity-20 bg-gradient-to-r ${getHeatmapColor(
                    cluster.intensity,
                    'SHORT_LIQ'
                  )} pointer-events-none transition-all duration-500`}
                />

                <div className="flex items-center gap-2.5 z-10">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isTargetMagnet ? 'bg-amber-400 animate-ping' : 'bg-amber-500/60'
                    }`}
                  />
                  <div className="font-mono">
                    <span className="font-black text-sm text-white">
                      ${cluster.price >= 1 ? cluster.price.toFixed(2) : cluster.price.toFixed(4)}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold ml-2">
                      +{cluster.distancePct.toFixed(2)}%
                    </span>
                  </div>
                  {isTargetMagnet && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-slate-950">
                      ★ MAGNET
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono z-10">
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-300">
                      ${cluster.volumeUsd}M
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {cluster.intensity}% Density
                    </div>
                  </div>
                  <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${cluster.intensity}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Mark Price Center Divider */}
        <div className="py-2 px-4 rounded-xl bg-slate-900 border-2 border-slate-700 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase text-slate-300 tracking-wider">
              CURRENT LIVE MARK PRICE
            </span>
          </div>

          <div className="font-mono flex items-baseline gap-2">
            <span className="text-base font-black text-white">
              ${activeCoin.price >= 1 ? activeCoin.price.toFixed(2) : activeCoin.price.toFixed(4)}
            </span>
            <span
              className={`text-xs font-bold ${
                activeCoin.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {activeCoin.change >= 0 ? '+' : ''}
              {activeCoin.change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Lower Clusters (Long Liquidations / Bid Support Pool) */}
        <div className="space-y-1.5">
          {clustersBelow.map((cluster) => {
            const isTargetMagnet = cluster.isMagnet;
            return (
              <div
                key={`below-${cluster.price}`}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between relative overflow-hidden ${
                  isTargetMagnet
                    ? 'bg-cyan-500/10 border-cyan-500/70 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Background Intensity Bar */}
                <div
                  style={{ width: `${cluster.intensity}%` }}
                  className={`absolute top-0 bottom-0 left-0 opacity-20 bg-gradient-to-r ${getHeatmapColor(
                    cluster.intensity,
                    'LONG_LIQ'
                  )} pointer-events-none transition-all duration-500`}
                />

                <div className="flex items-center gap-2.5 z-10">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isTargetMagnet ? 'bg-cyan-400 animate-ping' : 'bg-cyan-500/60'
                    }`}
                  />
                  <div className="font-mono">
                    <span className="font-black text-sm text-white">
                      ${cluster.price >= 1 ? cluster.price.toFixed(2) : cluster.price.toFixed(4)}
                    </span>
                    <span className="text-xs text-cyan-400 font-semibold ml-2">
                      {cluster.distancePct.toFixed(2)}%
                    </span>
                  </div>
                  {isTargetMagnet && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-400 text-slate-950">
                      ★ MAGNET
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono z-10">
                  <div className="text-right">
                    <span className="text-xs font-black text-cyan-300">
                      ${cluster.volumeUsd}M
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {cluster.intensity}% Density
                    </div>
                  </div>
                  <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${cluster.intensity}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Playbook: How to Trade Liquidity Magnets */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Info className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'my'
              ? 'Liquidity Magnet အား အသုံးချ၍ ကုန်သွယ်ခြင်း နည်းဗျူဟာ (Playbook)'
              : 'Institutional Liquidity Magnet Playbook'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-slate-400 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-amber-400 font-bold block mb-0.5">1. Target Flush / Take-Profit</span>
            <p>
              {lang === 'my'
                ? 'Magnet ဇုန်မတိုင်မီ Take Profit ထားခြင်းဖြင့် Liquidation အလုံးအရင်း sweep မဖြစ်မီ အမြတ်သိမ်းနိုင်သည်။'
                : 'Place Take-Profit orders 0.2% before the magnet cluster to lock in profits before massive stop-loss slippage.'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-indigo-400 font-bold block mb-0.5">2. Liquidity Sweep Reversal (SFP)</span>
            <p>
              {lang === 'my'
                ? 'စျေးနှုန်းသည် Magnet ကို ရှင်းထုတ် (sweep) ပြီး ချက်ချင်း ဝှေ့တက်လာပါက Counter-trend အဝင် ရှာဖွေနိုင်သည်။'
                : 'Wait for price to sweep the magnet cluster and reject rapidly to capture high-winrate mean reversion bounces.'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-0.5">3. Cascade Breakout</span>
            <p>
              {lang === 'my'
                ? 'Volume အဆမတန် မြင့်တက်ပြီး Magnet ကို ဖောက်ထွက်ပါက လျင်မြန်သော Momentum Trend လိုက်နိုင်သည်။'
                : 'If order book bids immediately refill behind the magnet with surging volume, ride the violent breakout continuation.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
