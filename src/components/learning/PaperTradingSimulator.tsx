import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  AlertCircle,
  Plus,
  Shield,
  BarChart2,
  DollarSign,
} from 'lucide-react';

export interface PaperTrade {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  margin: number;
  leverage: number;
  positionSizeUsd: number;
  setupTag: string;
  timeframe: string;
  openTimestamp: number;
  closeTimestamp?: number;
  status: 'OPEN' | 'CLOSED';
  realizedPnlUsd?: number;
  realizedPnlPercent?: number;
  rMultiple?: number;
  outcome?: 'WIN' | 'LOSS' | 'BREAKEVEN';
  mistakeTag?: string;
}

const INITIAL_VIRTUAL_BALANCE = 100000;
const STORAGE_KEY_BALANCE = 'crypto_learning_paper_balance_v1';
const STORAGE_KEY_TRADES = 'crypto_learning_paper_trades_v1';

const COIN_BASE_PRICES: Record<string, number> = {
  'BTC/USDT': 65420,
  'ETH/USDT': 3420,
  'SOL/USDT': 148.5,
  'BNB/USDT': 585,
  'XRP/USDT': 0.585,
};

// Seed sample trades so analytics have immediate rich data
const SEED_TRADES: PaperTrade[] = [
  {
    id: 'seed-trade-1',
    symbol: 'BTC/USDT',
    side: 'LONG',
    entryPrice: 63200,
    exitPrice: 66360,
    stopLossPrice: 62100,
    takeProfitPrice: 66360,
    margin: 1000,
    leverage: 10,
    positionSizeUsd: 10000,
    setupTag: 'Support Pullback',
    timeframe: '4H',
    openTimestamp: Date.now() - 86400000 * 4,
    closeTimestamp: Date.now() - 86400000 * 3,
    status: 'CLOSED',
    realizedPnlUsd: 500,
    realizedPnlPercent: 50,
    rMultiple: 2.87,
    outcome: 'WIN',
    mistakeTag: 'Followed Plan Perfectly ✅',
  },
  {
    id: 'seed-trade-2',
    symbol: 'ETH/USDT',
    side: 'SHORT',
    entryPrice: 3550,
    exitPrice: 3620,
    stopLossPrice: 3620,
    takeProfitPrice: 3350,
    margin: 1000,
    leverage: 10,
    positionSizeUsd: 10000,
    setupTag: 'Resistance Rejection',
    timeframe: '1H',
    openTimestamp: Date.now() - 86400000 * 3,
    closeTimestamp: Date.now() - 86400000 * 2.5,
    status: 'CLOSED',
    realizedPnlUsd: -197.18,
    realizedPnlPercent: -19.7,
    rMultiple: -1.0,
    outcome: 'LOSS',
    mistakeTag: 'Moved Stop Loss ❌',
  },
  {
    id: 'seed-trade-3',
    symbol: 'SOL/USDT',
    side: 'LONG',
    entryPrice: 135.0,
    exitPrice: 151.2,
    stopLossPrice: 129.5,
    takeProfitPrice: 151.2,
    margin: 800,
    leverage: 5,
    positionSizeUsd: 4000,
    setupTag: 'Breakout & Retest',
    timeframe: '15m',
    openTimestamp: Date.now() - 86400000 * 2,
    closeTimestamp: Date.now() - 86400000 * 1.5,
    status: 'CLOSED',
    realizedPnlUsd: 480,
    realizedPnlPercent: 60,
    rMultiple: 2.94,
    outcome: 'WIN',
    mistakeTag: 'Followed Plan Perfectly ✅',
  },
  {
    id: 'seed-trade-4',
    symbol: 'BTC/USDT',
    side: 'LONG',
    entryPrice: 65100,
    exitPrice: 64200,
    stopLossPrice: 64200,
    takeProfitPrice: 67800,
    margin: 1000,
    leverage: 10,
    positionSizeUsd: 10000,
    setupTag: 'Liquidity Sweep',
    timeframe: '1H',
    openTimestamp: Date.now() - 86400000 * 1,
    closeTimestamp: Date.now() - 86400000 * 0.5,
    status: 'CLOSED',
    realizedPnlUsd: -138.25,
    realizedPnlPercent: -13.8,
    rMultiple: -1.0,
    outcome: 'LOSS',
    mistakeTag: 'FOMO Entry ❌',
  },
];

export const PaperTradingSimulator: React.FC<{ lang: 'my' | 'en' }> = ({ lang }) => {
  const [balance, setBalance] = useState<number>(INITIAL_VIRTUAL_BALANCE);
  const [trades, setTrades] = useState<PaperTrade[]>(SEED_TRADES);

  // Form Inputs
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState<number>(COIN_BASE_PRICES['BTC/USDT']);
  const [stopLossPrice, setStopLossPrice] = useState<number>(64100);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(68500);
  const [margin, setMargin] = useState<number>(1000);
  const [leverage, setLeverage] = useState<number>(10);
  const [setupTag, setSetupTag] = useState<string>('Breakout & Retest');
  const [timeframe, setTimeframe] = useState<string>('15m');

  // Simulated real-time price fluctuation
  const [livePrices, setLivePrices] = useState<Record<string, number>>(COIN_BASE_PRICES);

  // Load persistence
  useEffect(() => {
    try {
      const savedBal = localStorage.getItem(STORAGE_KEY_BALANCE);
      if (savedBal) setBalance(Number(savedBal));
      const savedTrades = localStorage.getItem(STORAGE_KEY_TRADES);
      if (savedTrades) {
        setTrades(JSON.parse(savedTrades));
      }
    } catch {
      // fallback
    }
  }, []);

  // Price ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          const deltaPct = (Math.random() - 0.499) * 0.003;
          next[k] = Number((next[k] * (1 + deltaPct)).toFixed(next[k] < 1 ? 4 : 2));
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Update entry price when pair changes
  useEffect(() => {
    const p = livePrices[selectedPair] || COIN_BASE_PRICES[selectedPair];
    setEntryPrice(p);
    if (side === 'LONG') {
      setStopLossPrice(Number((p * 0.98).toFixed(2)));
      setTakeProfitPrice(Number((p * 1.05).toFixed(2)));
    } else {
      setStopLossPrice(Number((p * 1.02).toFixed(2)));
      setTakeProfitPrice(Number((p * 0.95).toFixed(2)));
    }
  }, [selectedPair, side]);

  const saveTradesAndBalance = (newTrades: PaperTrade[], newBal: number) => {
    setTrades(newTrades);
    setBalance(newBal);
    localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(newTrades));
    localStorage.setItem(STORAGE_KEY_BALANCE, String(newBal));
  };

  const handleOpenTrade = () => {
    if (margin > balance) {
      alert(lang === 'my' ? 'လက်ကျန်ငွေ မလုံလောက်ပါ!' : 'Insufficient virtual balance!');
      return;
    }

    const currentPrice = livePrices[selectedPair] || entryPrice;
    const notional = margin * leverage;

    const newTrade: PaperTrade = {
      id: 'trade-' + Date.now(),
      symbol: selectedPair,
      side,
      entryPrice: currentPrice,
      stopLossPrice,
      takeProfitPrice,
      margin,
      leverage,
      positionSizeUsd: notional,
      setupTag,
      timeframe,
      openTimestamp: Date.now(),
      status: 'OPEN',
    };

    const newBal = balance - margin;
    saveTradesAndBalance([newTrade, ...trades], newBal);
  };

  const handleCloseTrade = (tradeId: string, customMistake?: string) => {
    const currentTrades = [...trades];
    const tradeIndex = currentTrades.findIndex((t) => t.id === tradeId);
    if (tradeIndex === -1) return;

    const t = currentTrades[tradeIndex];
    const currentPrice = livePrices[t.symbol] || t.entryPrice;

    const priceDeltaPercent =
      t.side === 'LONG'
        ? (currentPrice - t.entryPrice) / t.entryPrice
        : (t.entryPrice - currentPrice) / t.entryPrice;

    const pnlUsd = t.positionSizeUsd * priceDeltaPercent;
    const pnlPct = (pnlUsd / t.margin) * 100;

    const slDistance = Math.abs(t.entryPrice - t.stopLossPrice);
    const priceProfitDistance = Math.abs(currentPrice - t.entryPrice);
    const rMultiple = slDistance > 0 ? (priceDeltaPercent >= 0 ? priceProfitDistance / slDistance : -1.0) : 0;

    const updatedTrade: PaperTrade = {
      ...t,
      status: 'CLOSED',
      exitPrice: currentPrice,
      closeTimestamp: Date.now(),
      realizedPnlUsd: pnlUsd,
      realizedPnlPercent: pnlPct,
      rMultiple: Number(rMultiple.toFixed(2)),
      outcome: pnlUsd > 0 ? 'WIN' : pnlUsd < 0 ? 'LOSS' : 'BREAKEVEN',
      mistakeTag: customMistake || (pnlUsd >= 0 ? 'Followed Plan Perfectly ✅' : 'Disciplined Invalidation ✅'),
    };

    currentTrades[tradeIndex] = updatedTrade;
    const returnedBalance = balance + t.margin + pnlUsd;
    saveTradesAndBalance(currentTrades, Math.max(0, returnedBalance));
  };

  const handleResetSimulator = () => {
    if (confirm(lang === 'my' ? 'ဒေတာအားလုံးကို $100,000 ဖြင့် ပြန်လည်စတင်လိုပါသလား?' : 'Reset simulation to fresh $100,000 balance?')) {
      saveTradesAndBalance(SEED_TRADES, INITIAL_VIRTUAL_BALANCE);
    }
  };

  const openPositions = trades.filter((t) => t.status === 'OPEN');
  const closedTrades = trades.filter((t) => t.status === 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Top Banner with Virtual Balance */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/20 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              {lang === 'my' ? 'လက်တွေ့จำลอง စမ်းသပ်ကုန်သွယ်စနစ် ($100,000 Virtual Balance)' : 'Paper Trading Simulator ($100,000 Virtual Balance)'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            {lang === 'my'
              ? 'အမှန်တကယ်ငွေမသုံးဘဲ စျေးကွက်စစ်စစ်တွင် Long/Short ဖြင့် လေ့ကျင့်ပါ။ သင်၏ စည်းကမ်းလိုက်နာမှု၊ R-Multiple နှင့် အမှားများကို မှတ်တမ်းတင်ပါ။'
              : 'Practice real execution without risking real money. Execute Long/Short setups, track R-multiples, and log trading mistakes.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              {lang === 'my' ? 'လက်ကျန်ငွေ' : 'Virtual Balance'}
            </span>
            <span className="text-lg font-mono font-black text-emerald-400">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleResetSimulator}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset balance to $100,000"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Place Trade Order Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {lang === 'my' ? 'အော်ဒါသစ်ဖွင့်လှစ်မည်' : 'Open Virtual Position'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {selectedPair}: <strong className="text-white">${livePrices[selectedPair]}</strong>
            </span>
          </div>

          {/* Pair Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {lang === 'my' ? 'ကုန်သွယ်မည့် အတွဲ (Coin Pair):' : 'Select Coin Pair:'}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.keys(COIN_BASE_PRICES).map((pair) => (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                    selectedPair === pair
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {pair.split('/')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Direction Long / Short */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {lang === 'my' ? 'ဦးတည်ချက် (Direction):' : 'Direction:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSide('LONG')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  side === 'LONG'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>LONG</span>
              </button>
              <button
                onClick={() => setSide('SHORT')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  side === 'SHORT'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>SHORT</span>
              </button>
            </div>
          </div>

          {/* Stop Loss & Take Profit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-rose-400 block mb-1">
                Stop Loss ($):
              </label>
              <input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-1.5 text-xs text-rose-300 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-emerald-400 block mb-1">
                Take Profit ($):
              </label>
              <input
                type="number"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-mono"
              />
            </div>
          </div>

          {/* Margin & Leverage */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Margin ($):
              </label>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Leverage ({leverage}x):
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[2, 5, 10, 20].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                      leverage === lev
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Setup Tag & Timeframe */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Setup Type:
              </label>
              <select
                value={setupTag}
                onChange={(e) => setSetupTag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Breakout & Retest">Breakout & Retest</option>
                <option value="Support Pullback">Support Pullback</option>
                <option value="Resistance Rejection">Resistance Rejection</option>
                <option value="Liquidity Sweep">Liquidity Sweep</option>
                <option value="FVG Fill + Order Block">FVG Fill + Order Block</option>
                <option value="Range High/Low">Range High/Low</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Timeframe:
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
              >
                <option value="5m">5-Minute</option>
                <option value="15m">15-Minute</option>
                <option value="1H">1-Hour</option>
                <option value="4H">4-Hour</option>
                <option value="1D">1-Day</option>
              </select>
            </div>
          </div>

          {/* Order Summary & Submit */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Position Value:</span>
              <span className="text-white font-bold">${(margin * leverage).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Required Margin:</span>
              <span className="text-amber-400 font-bold">${margin.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleOpenTrade}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
              side === 'LONG'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            <span>
              {lang === 'my'
                ? `အော်ဒါဖွင့်လှစ်မည် (${side} ${selectedPair.split('/')[0]})`
                : `Execute Virtual ${side} Order`}
            </span>
          </button>
        </div>

        {/* Right Column: Open Positions & Closed Trade History (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Positions */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'my' ? 'လက်ရှိဖွင့်ထားသော အော်ဒါများ' : 'Active Open Positions'} ({openPositions.length})
              </span>
            </div>

            {openPositions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                {lang === 'my' ? 'လောလောဆယ် ဖွင့်ထားသော အော်ဒါမရှိသေးပါ' : 'No active positions right now. Open a setup on the left!'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {openPositions.map((pos) => {
                  const currPrice = livePrices[pos.symbol] || pos.entryPrice;
                  const deltaPct =
                    pos.side === 'LONG'
                      ? (currPrice - pos.entryPrice) / pos.entryPrice
                      : (pos.entryPrice - currPrice) / pos.entryPrice;
                  const unrealizedPnlUsd = pos.positionSizeUsd * deltaPct;
                  const unrealizedPnlPct = (unrealizedPnlUsd / pos.margin) * 100;
                  const isProfit = unrealizedPnlUsd >= 0;

                  return (
                    <div
                      key={pos.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              pos.side === 'LONG'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {pos.side} {pos.leverage}x
                          </span>
                          <span className="text-xs font-bold text-white font-mono">{pos.symbol}</span>
                          <span className="text-[10px] text-slate-500">[{pos.setupTag}]</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1 space-x-2">
                          <span>Entry: ${pos.entryPrice}</span>
                          <span>Live: ${currPrice}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xs font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}${unrealizedPnlUsd.toFixed(2)} ({isProfit ? '+' : ''}{unrealizedPnlPct.toFixed(1)}%)
                        </div>
                        <button
                          onClick={() => handleCloseTrade(pos.id)}
                          className="mt-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
                        >
                          {lang === 'my' ? 'အော်ဒါပိတ်မည်' : 'Close Position'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Closed Trades History with Mistakes Tagging */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                {lang === 'my' ? 'ပြီးဆုံးခဲ့သော ကုန်သွယ်မှုမှတ်တမ်း' : 'Closed Trade History & Log'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {closedTrades.length} Trades
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {closedTrades.map((trade) => {
                const isWin = (trade.realizedPnlUsd || 0) >= 0;
                return (
                  <div
                    key={trade.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isWin ? 'WIN' : 'LOSS'}
                        </span>
                        <span className="font-bold text-white font-mono">{trade.symbol}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{trade.side} {trade.leverage}x</span>
                        <span className="text-[10px] text-slate-500">[{trade.setupTag}]</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        R-Multiple: <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>{trade.rMultiple}R</span> • TF: {trade.timeframe}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isWin ? '+' : ''}${trade.realizedPnlUsd?.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-slate-800">
                        {trade.mistakeTag || 'Followed Plan'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
