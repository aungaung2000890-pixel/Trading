import React, { useState, useEffect, useMemo } from 'react';
import { Flame, ArrowDownRight, ArrowUpRight, Filter, Volume2, VolumeX, ShieldAlert, Zap, Clock, RefreshCw, Magnet } from 'lucide-react';
import { LiveTickerItem } from '../types';
import { LiquidityHeatmap } from './LiquidityHeatmap';

export interface LiquidationEvent {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT'; // LONG = Long rekt (price dropped), SHORT = Short rekt (price pumped)
  notionalUsd: number;
  price: number;
  timestamp: number;
  timeFormatted: string;
  tier: 'WHALE' | 'LARGE' | 'NORMAL';
}

interface RecentLiquidationsFeedProps {
  tickers: LiveTickerItem[];
  lang: 'my' | 'en';
}

export const RecentLiquidationsFeed: React.FC<RecentLiquidationsFeedProps> = ({ tickers, lang }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'heatmap'>('feed');
  const [feedFilter, setFeedFilter] = useState<'all' | 'whale' | 'long' | 'short'>('all');
  const [isLivePaused, setIsLivePaused] = useState<boolean>(false);
  const [events, setEvents] = useState<LiquidationEvent[]>([]);

  // Generate initial baseline realistic liquidation events based on top volume coins
  useEffect(() => {
    const symbols = tickers.length > 0
      ? tickers.slice(0, 12).map((t) => ({ symbol: t.symbol, price: t.lastPrice, change: t.change24h }))
      : [
          { symbol: 'BTC', price: 88400, change: -1.8 },
          { symbol: 'ETH', price: 3280, change: -2.4 },
          { symbol: 'SOL', price: 142.5, change: 4.2 },
          { symbol: 'DOGE', price: 0.22, change: -3.5 },
          { symbol: 'SUI', price: 2.85, change: 6.8 },
          { symbol: 'XRP', price: 1.48, change: -1.2 },
        ];

    const now = Date.now();
    const initialEvents: LiquidationEvent[] = [];

    for (let i = 0; i < 15; i++) {
      const item = symbols[i % symbols.length];
      const isLongRekt = item.change < 0 ? Math.random() > 0.25 : Math.random() > 0.65;
      const side = isLongRekt ? 'LONG' : 'SHORT';
      // Varying sizes
      const rand = Math.random();
      let notionalUsd = 0;
      let tier: LiquidationEvent['tier'] = 'NORMAL';
      if (rand > 0.85) {
        notionalUsd = Math.round(500000 + Math.random() * 1800000);
        tier = 'WHALE';
      } else if (rand > 0.5) {
        notionalUsd = Math.round(120000 + Math.random() * 380000);
        tier = 'LARGE';
      } else {
        notionalUsd = Math.round(15000 + Math.random() * 85000);
        tier = 'NORMAL';
      }

      const eventTime = now - i * 38000 - Math.floor(Math.random() * 20000);
      const secondsAgo = Math.max(2, Math.floor((now - eventTime) / 1000));
      const timeStr =
        secondsAgo < 60
          ? `${secondsAgo}s ago`
          : `${Math.floor(secondsAgo / 60)}m ago`;

      initialEvents.push({
        id: `liq-${i}-${eventTime}`,
        symbol: item.symbol,
        side,
        notionalUsd,
        price: item.price,
        timestamp: eventTime,
        timeFormatted: timeStr,
        tier,
      });
    }

    setEvents(initialEvents);
  }, [tickers]);

  // Periodic simulated live ticker liquidation arrivals
  useEffect(() => {
    if (isLivePaused) return;

    const interval = setInterval(() => {
      const symbols = tickers.length > 0 ? tickers.slice(0, 15) : [];
      if (symbols.length === 0) return;

      const randomTarget = symbols[Math.floor(Math.random() * symbols.length)];
      const isLongRekt = randomTarget.change24h < 0 ? Math.random() > 0.3 : Math.random() > 0.6;
      const side: 'LONG' | 'SHORT' = isLongRekt ? 'LONG' : 'SHORT';

      const rand = Math.random();
      let notionalUsd = 0;
      let tier: LiquidationEvent['tier'] = 'NORMAL';
      if (rand > 0.88) {
        notionalUsd = Math.round(550000 + Math.random() * 2400000);
        tier = 'WHALE';
      } else if (rand > 0.55) {
        notionalUsd = Math.round(110000 + Math.random() * 340000);
        tier = 'LARGE';
      } else {
        notionalUsd = Math.round(18000 + Math.random() * 92000);
        tier = 'NORMAL';
      }

      const newEvent: LiquidationEvent = {
        id: `liq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        symbol: randomTarget.symbol,
        side,
        notionalUsd,
        price: randomTarget.lastPrice,
        timestamp: Date.now(),
        timeFormatted: 'Just now',
        tier,
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 24)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [tickers, isLivePaused]);

  // Aggregated Statistics
  const stats = useMemo(() => {
    const totalLiq = events.reduce((acc, curr) => acc + curr.notionalUsd, 0);
    const longLiqs = events
      .filter((e) => e.side === 'LONG')
      .reduce((acc, curr) => acc + curr.notionalUsd, 0);
    const shortLiqs = events
      .filter((e) => e.side === 'SHORT')
      .reduce((acc, curr) => acc + curr.notionalUsd, 0);

    const longPct = totalLiq > 0 ? Math.round((longLiqs / totalLiq) * 100) : 50;
    const shortPct = totalLiq > 0 ? 100 - longPct : 50;

    const whaleCount = events.filter((e) => e.tier === 'WHALE').length;

    return { totalLiq, longLiqs, shortLiqs, longPct, shortPct, whaleCount };
  }, [events]);

  const filteredEvents = useMemo(() => {
    switch (feedFilter) {
      case 'whale':
        return events.filter((e) => e.tier === 'WHALE' || e.notionalUsd >= 500000);
      case 'long':
        return events.filter((e) => e.side === 'LONG');
      case 'short':
        return events.filter((e) => e.side === 'SHORT');
      default:
        return events;
    }
  }, [events, feedFilter]);

  const formatUsd = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <section
      id="recent-liquidations-feed"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm"
    >
      {/* Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            {activeTab === 'heatmap' ? <Magnet className="w-5 h-5 text-amber-500 animate-bounce" /> : <Flame className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeTab === 'heatmap'
                  ? (lang === 'my' ? 'Liquidity Heatmap နှင့် Magnet စျေးနှုန်းအဆင့်များ' : 'Futures Liquidity Heatmap & Magnets')
                  : (lang === 'my' ? 'လတ်တလော Liquidation အချက်အလက်များ' : 'Recent Futures Liquidations')}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                activeTab === 'heatmap'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${activeTab === 'heatmap' ? 'bg-amber-500' : 'bg-rose-500 animate-ping'}`} />
                <span>{activeTab === 'heatmap' ? 'ORDERBOOK DEPTH' : 'LIVE FEED'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {activeTab === 'heatmap'
                ? (lang === 'my'
                    ? 'စျေးကွက်အတွင်း Order Book ဖိအားနှင့် သံလိုက်သဖွယ် ဆွဲဆောင်နေသော Liquidity Pool များကို လေ့လာပါ'
                    : 'Analyze high order book pressure clusters and identify potential liquidity magnet targets')
                : (lang === 'my'
                    ? 'စျေးကွက်အတွင်း Leverage ပြိုကျမှုနှင့် Forced Liquidation စီးဆင်းမှုများ'
                    : 'Real-time orderbook cascades, forced long/short wipeouts and whale alerts')}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Live Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              id="liq-tab-feed"
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === 'my' ? 'Liquidations စီးဆင်းမှု' : 'Live Stream'}</span>
            </button>
            <button
              id="liq-tab-heatmap"
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'heatmap'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Magnet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{lang === 'my' ? 'Liquidity Heatmap 🔥' : 'Liquidity Heatmap 🔥'}</span>
            </button>
          </div>

          {activeTab === 'feed' && (
            <button
              id="pause-liq-feed-btn"
              onClick={() => setIsLivePaused(!isLivePaused)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1 cursor-pointer ${
                isLivePaused
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              title={isLivePaused ? 'Resume live liquidation updates' : 'Pause live feed updates'}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isLivePaused ? (lang === 'my' ? 'ရပ်ထားသည်' : 'Paused') : (lang === 'my' ? 'တိုက်ရိုက်' : 'Live')}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'heatmap' ? (
        <div className="pt-3">
          <LiquidityHeatmap tickers={tickers} lang={lang} />
        </div>
      ) : (
        <>
          {/* Filter Sub-bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: lang === 'my' ? 'အားလုံး' : 'All' },
                { id: 'whale', label: lang === 'my' ? '🐋 Whale (> $500K)' : '🐋 Whale (> $500K)' },
                { id: 'long', label: lang === 'my' ? 'Long Rekt 🔴' : 'Longs 🔴' },
                { id: 'short', label: lang === 'my' ? 'Short Rekt 🟢' : 'Shorts 🟢' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  id={`liq-filter-${btn.id}`}
                  onClick={() => setFeedFilter(btn.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    feedFilter === btn.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              id="switch-to-heatmap-quick-btn"
              onClick={() => setActiveTab('heatmap')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'my' ? 'သံလိုက်ဆွဲငင်အား Heatmap ကြည့်မည်' : 'View Liquidity Heatmap'}</span>
              <Magnet className="w-3.5 h-3.5" />
            </button>
          </div>

      {/* Aggregate Volume Bar */}
      <div className="my-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between text-xs mb-1.5 font-mono">
          <div className="flex items-center gap-1.5 text-rose-500 font-bold">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Longs Liquidated: {formatUsd(stats.longLiqs)} ({stats.longPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Shorts Liquidated: {formatUsd(stats.shortLiqs)} ({stats.shortPct}%)</span>
          </div>
        </div>

        {/* Ratio bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
          <div
            style={{ width: `${stats.longPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Longs: ${stats.longPct}%`}
          />
          <div
            style={{ width: `${stats.shortPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Shorts: ${stats.shortPct}%`}
          />
        </div>
      </div>

      {/* Horizontal / Grid Stream of Recent Liquidations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredEvents.slice(0, 12).map((liq) => {
          const isLong = liq.side === 'LONG';
          return (
            <div
              key={liq.id}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                isLong
                  ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40'
                  : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isLong
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {isLong ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {liq.symbol}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        isLong
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isLong ? 'LONG REKT' : 'SHORT REKT'}
                    </span>
                    {liq.tier === 'WHALE' && (
                      <span className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        WHALE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    @ ${liq.price >= 1 ? liq.price.toFixed(2) : liq.price.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div
                  className={`text-xs font-black ${
                    isLong ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatUsd(liq.notionalUsd)}
                </div>
                <div className="text-[10px] text-slate-400">{liq.timeFormatted}</div>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
    </section>
  );
};
