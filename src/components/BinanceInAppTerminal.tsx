import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Zap,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Sliders,
  Wallet,
  Activity,
  Sparkles,
  Clock,
  Target,
  Info,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { CoinOpportunity, LiveTickerItem, DemoTradePreset } from '../types';
import {
  formatBinanceFuturesSymbol,
  getBinanceFuturesUrl,
  openBinanceFutures,
  copyValueToClipboard,
  formatBinanceSignalClipboardText,
  focusBinancePortal,
  BINANCE_PORTAL_WINDOW_NAME,
} from '../utils/binanceLink';
import { submitBinanceTrade } from '../services/binanceClient';

export interface InAppPosition {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  size: number;
  margin: number;
  leverage: number;
  tpPrice?: number;
  slPrice?: number;
  pnl: number;
  roePercent: number;
  openTime: string;
}

interface BinanceInAppTerminalProps {
  initialSymbol?: string;
  initialSide?: 'LONG' | 'SHORT';
  presetTrade?: DemoTradePreset | null;
  coins?: CoinOpportunity[];
  allTickers?: LiveTickerItem[];
  lang: 'my' | 'en';
  onBack?: () => void;
}

const COMMON_SYMBOLS = [
  'BTC', 'ETH', 'SOL', 'DOGE', 'BNB', 'XRP', 'ADA', 'AVAX', 'SUI', 'PEPE', 'NEAR', 'LINK',
];

export const BinanceInAppTerminal: React.FC<BinanceInAppTerminalProps> = ({
  initialSymbol = 'SOL',
  initialSide = 'LONG',
  presetTrade,
  coins = [],
  allTickers = [],
  lang,
  onBack,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    presetTrade?.symbol || initialSymbol || 'SOL'
  );
  const [side, setSide] = useState<'LONG' | 'SHORT'>(
    presetTrade?.side || initialSide || 'LONG'
  );
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [margin, setMargin] = useState<number>(presetTrade?.margin || 100);
  const [leverage, setLeverage] = useState<number>(presetTrade?.leverage || 20);
  const [entryPrice, setEntryPrice] = useState<number>(presetTrade?.entryPrice || 0);
  const [tpPrice, setTpPrice] = useState<number>(presetTrade?.tpPrice || 0);
  const [slPrice, setSlPrice] = useState<number>(presetTrade?.slPrice || 0);

  const [activeTab, setActiveTab] = useState<'chart' | 'orderbook' | 'orders'>('chart');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [clientApiKey, setClientApiKey] = useState<string>(() => {
    try { return localStorage.getItem('binance_client_api_key') || ''; } catch { return ''; }
  });
  const [clientApiSecret, setClientApiSecret] = useState<string>(() => {
    try { return localStorage.getItem('binance_client_api_secret') || ''; } catch { return ''; }
  });
  const [isRealTrade, setIsRealTrade] = useState<boolean>(false);
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('binance_client_api_key', clientApiKey);
      localStorage.setItem('binance_client_api_secret', clientApiSecret);
    } catch {}
  }, [clientApiKey, clientApiSecret]);

  // Positions persisted in local storage
  const [positions, setPositions] = useState<InAppPosition[]>(() => {
    try {
      const saved = localStorage.getItem('binance_in_app_positions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('binance_in_app_positions', JSON.stringify(positions));
    } catch {}
  }, [positions]);

  // Find live ticker or default coin data
  const currentTicker = useMemo(() => {
    const clean = selectedSymbol.toUpperCase().replace('USDT', '');
    const foundLive = allTickers.find(
      (t) => t.symbol.toUpperCase() === clean || t.contract.toUpperCase() === `${clean}_USDT`
    );
    if (foundLive) {
      return {
        symbol: clean,
        price: foundLive.lastPrice,
        change24h: foundLive.change24h,
        vol: `$${(foundLive.volume24hUsd / 1_000_000).toFixed(1)}M`,
        high: foundLive.high24h,
        low: foundLive.low24h,
        funding: foundLive.fundingRate,
      };
    }
    const foundCoin = coins.find((c) => c.symbol.toUpperCase() === clean);
    if (foundCoin) {
      return {
        symbol: clean,
        price: foundCoin.currentPrice,
        change24h: foundCoin.change24h,
        vol: foundCoin.volumeFormatted,
        high: foundCoin.currentPrice * 1.04,
        low: foundCoin.currentPrice * 0.96,
        funding: foundCoin.fundingRate,
      };
    }
    // Fallback baseline
    return {
      symbol: clean,
      price: clean === 'BTC' ? 92000 : clean === 'ETH' ? 2450 : clean === 'SOL' ? 185 : 1.0,
      change24h: 2.85,
      vol: '$840.5M',
      high: 192.4,
      low: 178.5,
      funding: 0.01,
    };
  }, [selectedSymbol, allTickers, coins]);

  // Live Simulated Price Ticks
  const [livePrice, setLivePrice] = useState<number>(currentTicker.price);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    setLivePrice(currentTicker.price);
    if (!entryPrice || entryPrice === 0) {
      setEntryPrice(currentTicker.price);
    }
    if (!tpPrice || tpPrice === 0) {
      const isLong = side === 'LONG';
      const defTp = isLong ? currentTicker.price * 1.08 : currentTicker.price * 0.92;
      setTpPrice(+defTp.toFixed(currentTicker.price < 1 ? 4 : 2));
    }
    if (!slPrice || slPrice === 0) {
      const isLong = side === 'LONG';
      const defSl = isLong ? currentTicker.price * 0.97 : currentTicker.price * 1.03;
      setSlPrice(+defSl.toFixed(currentTicker.price < 1 ? 4 : 2));
    }
  }, [currentTicker.price, selectedSymbol]);

  // Handle Preset updates
  useEffect(() => {
    if (presetTrade) {
      if (presetTrade.symbol) setSelectedSymbol(presetTrade.symbol);
      if (presetTrade.side) setSide(presetTrade.side);
      if (presetTrade.margin) setMargin(presetTrade.margin);
      if (presetTrade.leverage) setLeverage(presetTrade.leverage);
      if (presetTrade.entryPrice) setEntryPrice(presetTrade.entryPrice);
      if (presetTrade.tpPrice) setTpPrice(presetTrade.tpPrice);
      if (presetTrade.slPrice) setSlPrice(presetTrade.slPrice);
      showToast(
        lang === 'my'
          ? `⚡ ${presetTrade.symbol} Trade Setup အား In-App Terminal တွင် အသင့်ထည့်သွင်းပြီးပါပြီ`
          : `⚡ Loaded ${presetTrade.symbol} setup into In-App Terminal`
      );
    }
  }, [presetTrade]);

  // Dynamic PnL updates for open positions
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.495) * 0.002;
      setLivePrice((prev) => {
        const next = Math.max(0.0001, prev * (1 + delta));
        setPriceDirection(next > prev ? 'up' : 'down');
        return +next.toFixed(next < 1 ? 4 : 2);
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Update positions PnL
  useEffect(() => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.symbol === selectedSymbol) {
          const isL = pos.side === 'LONG';
          const priceDiff = isL ? livePrice - pos.entryPrice : pos.entryPrice - livePrice;
          const pnl = priceDiff * pos.size;
          const roe = (pnl / pos.margin) * 100;
          return {
            ...pos,
            currentPrice: livePrice,
            pnl: +pnl.toFixed(2),
            roePercent: +roe.toFixed(2),
          };
        }
        return pos;
      })
    );
  }, [livePrice, selectedSymbol]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = async (val: string | number, key: string) => {
    const success = await copyValueToClipboard(val);
    if (success) {
      setCopiedKey(key);
      showToast(lang === 'my' ? `✓ $${val} ကို Clipboard သို့ ကူးယူပြီးပါပြီ` : `✓ Copied $${val}`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Open & Sync with Persistent Binance Window
  const handleSyncToBinance = () => {
    setIsSyncing(true);
    // 1. Copy formatted signal to clipboard
    const fullText = formatBinanceSignalClipboardText({
      symbol: selectedSymbol,
      direction: side,
      entryPrice: orderType === 'MARKET' ? livePrice : entryPrice,
      tpPrice,
      slPrice,
      margin,
      leverage,
      orderType,
    });
    copyValueToClipboard(fullText);

    // 2. Open or navigate the single persistent tab
    openBinanceFutures(selectedSymbol);

    showToast(
      lang === 'my'
        ? `🚀 Binance (${selectedSymbol}USDT) စာမျက်နှာသို့ သွားနေပါသည် (TP/SL စာသားများ Clipboard တွင် ကူးယူပြီးပါပြီ)`
        : `🚀 Opening Binance (${selectedSymbol}USDT) in persistent tab (TP/SL copied to clipboard)`
    );

    setTimeout(() => setIsSyncing(false), 1200);
  };

  // Execute in-app trade
  const handleOpenInAppTrade = async () => {
    const execPrice = orderType === 'MARKET' ? livePrice : entryPrice;
    const notional = margin * leverage;
    const size = +(notional / execPrice).toFixed(4);

    if (isRealTrade) {
      if (!clientApiKey || !clientApiSecret) {
        showToast(lang === 'my' ? 'API Key နှင့် Secret ထည့်သွင်းပါ' : 'Please provide API Key and Secret in Settings');
        setShowApiSettings(true);
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await submitBinanceTrade({
          symbol: selectedSymbol,
          side,
          entryPrice: execPrice,
          slPrice,
          tpPrice,
          margin,
          leverage,
          orderType,
          apiKey: clientApiKey,
          apiSecret: clientApiSecret,
        });
        showToast(
          lang === 'my' 
            ? `✓ တိုက်ရိုက်ကုန်သွယ်မှု အောင်မြင်ပါသည် (Order ID: ${res.orderId})`
            : `✓ Real trade executed (Order ID: ${res.orderId})`
        );
      } catch (err: any) {
        showToast(`❌ Error: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Simulation
    const newPos: InAppPosition = {
      id: `pos-${Date.now()}`,
      symbol: selectedSymbol,
      side,
      entryPrice: execPrice,
      currentPrice: execPrice,
      size,
      margin,
      leverage,
      tpPrice,
      slPrice,
      pnl: 0,
      roePercent: 0,
      openTime: new Date().toLocaleTimeString(),
    };

    setPositions([newPos, ...positions]);
    showToast(
      lang === 'my'
        ? `✓ ${selectedSymbol} ${side} Position အောင်မြင်စွာ ဖွင့်လှစ်ပြီးပါပြီ ($${margin} @ ${leverage}x)`
        : `✓ Opened ${selectedSymbol} ${side} position ($${margin} @ ${leverage}x)`
    );
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    setPositions(positions.filter((p) => p.id !== id));
    if (pos) {
      showToast(
        lang === 'my'
          ? `✓ ${pos.symbol} Position ပိတ်သိမ်းပြီး (PnL: ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl})`
          : `✓ Closed ${pos.symbol} position (PnL: ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl})`
      );
    }
  };

  // Estimated Calculations
  const notionalAmount = margin * leverage;
  const estimatedSize = livePrice > 0 ? +(notionalAmount / livePrice).toFixed(4) : 0;
  const liqDistancePercent = 100 / leverage;
  const estimatedLiqPrice =
    side === 'LONG'
      ? livePrice * (1 - liqDistancePercent / 100)
      : livePrice * (1 + liqDistancePercent / 100);

  const cleanSymbol = formatBinanceFuturesSymbol(selectedSymbol);

  return (
    <div className="space-y-4">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-amber-300 px-4 py-2.5 rounded-xl border border-amber-500/50 shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner & Persistent Session Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-4 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span>{lang === 'my' ? '⚡ Binance In-App Terminal (တိုက်ရိုက် ကုန်သွယ်မှု ဗဟို)' : '⚡ Binance In-App Terminal (Live Trading)'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Single Persistent Session
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'my'
              ? 'အက်ပ်ထဲတွင် တစ်ခါတည်းရှိနေသော စနစ် (Tab အသစ်မပွင့်ဘဲ တစ်ခါ Log in ဝင်ရုံဖြင့် အမြဲသုံးနိုင်ပြီး အက်ပ်တွင်းမှလည်း တိုက်ရိုက်ကုန်သွယ်နိုင်သည်)'
              : 'All-in-one embedded Binance workspace: Reuses single persistent login tab, live charts, order ticket & in-app execution.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
            </button>
          )}

          <button
            onClick={handleSyncToBinance}
            className="text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5 active:scale-95 transition"
            title={lang === 'my' ? 'Binance Tab သို့ ချိတ်ဆက်မည် (Log in တစ်ခါဝင်ပြီး အမြဲအသုံးပြုနိုင်သည်)' : 'Focus Persistent Binance Tab'}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '🚀 Binance Web Tab တွင်ဖွင့်မည်' : '🚀 Open Persistent Binance Tab'}</span>
          </button>
        </div>
      </div>

      {/* Symbol Selector Bar */}
      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs text-slate-400 font-bold mr-1 shrink-0">Pairs:</span>
          {COMMON_SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition shrink-0 cursor-pointer ${
                selectedSymbol === sym
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Live Ticker Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">Price</span>
            <span
              className={`font-black ${
                priceDirection === 'up'
                  ? 'text-emerald-400'
                  : priceDirection === 'down'
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              ${livePrice >= 1 ? livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : livePrice.toFixed(4)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">24h Change</span>
            <span
              className={`font-bold ${
                currentTicker.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentTicker.change24h >= 0 ? '+' : ''}
              {currentTicker.change24h.toFixed(2)}%
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="text-slate-400 text-[10px] block">Funding</span>
            <span className="text-amber-400 font-bold">{currentTicker.funding}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Chart (Left 7/12) + Order Execution (Right 5/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Chart & Info */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{selectedSymbol}USDT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                USDⓈ-M Perpetual
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'chart'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Chart
              </button>
              <button
                onClick={() => setActiveTab('orderbook')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'orderbook'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Order Book
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas / TradingView Iframe */}
          {activeTab === 'chart' ? (
            <div className="relative h-[380px] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <iframe
                title={`TradingView ${selectedSymbol}`}
                src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE%3A${cleanSymbol}&interval=15&theme=dark&style=1&timezone=Etc%2FUTC&locale=en&hide_top_toolbar=0&hide_side_toolbar=0&allow_symbol_change=0&save_image=0`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="h-[380px] bg-slate-950 rounded-xl p-4 overflow-y-auto font-mono text-xs space-y-1">
              <div className="flex justify-between text-slate-500 pb-1 border-b border-slate-800">
                <span>Price (USDT)</span>
                <span>Size ({selectedSymbol})</span>
                <span>Total</span>
              </div>
              {/* Asks (Sell) */}
              {[
                { p: livePrice * 1.004, s: 2.45 },
                { p: livePrice * 1.003, s: 5.12 },
                { p: livePrice * 1.002, s: 8.90 },
                { p: livePrice * 1.001, s: 14.3 },
              ].map((row, i) => (
                <div key={i} className="flex justify-between text-rose-400">
                  <span>${row.p.toFixed(livePrice < 1 ? 4 : 2)}</span>
                  <span className="text-slate-300">{row.s}</span>
                  <span className="text-slate-500">${(row.p * row.s).toFixed(1)}</span>
                </div>
              ))}
              {/* Mid Price */}
              <div className="py-2 my-1 text-center font-black text-sm bg-slate-900 border-y border-slate-800 text-amber-400">
                ${livePrice.toFixed(livePrice < 1 ? 4 : 2)}
              </div>
              {/* Bids (Buy) */}
              {[
                { p: livePrice * 0.999, s: 12.1 },
                { p: livePrice * 0.998, s: 9.4 },
                { p: livePrice * 0.997, s: 6.2 },
                { p: livePrice * 0.996, s: 3.8 },
              ].map((row, i) => (
                <div key={i} className="flex justify-between text-emerald-400">
                  <span>${row.p.toFixed(livePrice < 1 ? 4 : 2)}</span>
                  <span className="text-slate-300">{row.s}</span>
                  <span className="text-slate-500">${(row.p * row.s).toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Assistant Quick Copy Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">Quick Values for Binance Form:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(tpPrice, 'tp')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono font-bold flex items-center gap-1 border border-emerald-500/30 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedKey === 'tp' ? '✓ Copied' : `TP: $${tpPrice}`}</span>
              </button>
              <button
                onClick={() => handleCopy(slPrice, 'sl')}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono font-bold flex items-center gap-1 border border-rose-500/30 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedKey === 'sl' ? '✓ Copied' : `SL: $${slPrice}`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Ticket (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-sm font-black text-white">Order Placement</span>
            <span className="text-xs text-amber-400 font-bold font-mono">
              Margin: ${margin} • {leverage}x
            </span>
          </div>

          {/* Direction Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide('LONG')}
              className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                side === 'LONG'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>LONG (BUY) 🟢</span>
            </button>
            <button
              onClick={() => setSide('SHORT')}
              className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                side === 'SHORT'
                  ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>SHORT (SELL) 🔴</span>
            </button>
          </div>

          {/* Order Type Toggle */}
          <div className="flex items-center gap-2">
            {(['MARKET', 'LIMIT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  orderType === type
                    ? 'bg-slate-700 text-white font-black'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Limit Price Input (if LIMIT) */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Limit Entry Price ($)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(+e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          )}

          {/* Leverage & Margin Controls */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Leverage:</span>
              <span className="font-bold font-mono text-amber-400">{leverage}x</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[5, 10, 20, 50, 75, 100].map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                    leverage === lev
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>

            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-400">Margin Amount:</span>
              <span className="font-bold font-mono text-white">${margin} USDT</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[25, 50, 100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setMargin(amt)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                    margin === amt
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* TP & SL Inputs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-emerald-400 font-bold block mb-1">Take Profit ($)</label>
              <input
                type="number"
                value={tpPrice}
                onChange={(e) => setTpPrice(+e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-rose-400 font-bold block mb-1">Stop Loss ($)</label>
              <input
                type="number"
                value={slPrice}
                onChange={(e) => setSlPrice(+e.target.value)}
                className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-xs font-mono text-rose-300 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          {/* Position Summary Audit */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5 text-slate-300 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Position Notional:</span>
              <span className="font-bold text-white">${notionalAmount.toLocaleString()} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Est. Liquidation Price:</span>
              <span className="font-bold text-rose-400">${estimatedLiqPrice.toFixed(livePrice < 1 ? 4 : 2)}</span>
            </div>
          </div>

          {/* Dual Action Execution Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-bold">{lang === 'my' ? 'မုဒ်ရွေးချယ်ရန်:' : 'Execution Mode:'}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRealTrade(false)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black transition cursor-pointer ${!isRealTrade ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  SIMULATE
                </button>
                <button
                  onClick={() => setIsRealTrade(true)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black transition cursor-pointer ${isRealTrade ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  REAL API
                </button>
                <button
                  onClick={() => setShowApiSettings(!showApiSettings)}
                  className="px-2 py-1 rounded-md text-[10px] font-black transition bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                </button>
              </div>
            </div>

            {showApiSettings && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-700 mb-3 space-y-2 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Binance API Key</label>
                  <input
                    type="password"
                    value={clientApiKey}
                    onChange={(e) => setClientApiKey(e.target.value)}
                    placeholder="Enter API Key"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Binance API Secret</label>
                  <input
                    type="password"
                    value={clientApiSecret}
                    onChange={(e) => setClientApiSecret(e.target.value)}
                    placeholder="Enter API Secret"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {lang === 'my' 
                    ? 'API Keys များကို သင်၏ Browser တွင်သာ သိမ်းဆည်းထားမည်ဖြစ်ပြီး အခြားသူများထံ မျှဝေခြင်း မပြုပါ။' 
                    : 'Keys are stored locally in your browser. Do not share them.'}
                </p>
              </div>
            )}

            {/* 1. In-App Immediate Order */}
            <button
              onClick={handleOpenInAppTrade}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] ${
                isRealTrade 
                  ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-rose-500/20 hover:from-rose-400 hover:to-rose-300'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-300'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Zap className={`w-4 h-4 ${isRealTrade ? 'fill-white text-white' : 'fill-slate-950 text-slate-950'}`} />
              <span>
                {isSubmitting ? 'Processing...' : (
                  lang === 'my'
                    ? `⚡ အက်ပ်အတွင်း တိုက်ရိုက် ${side} ${isRealTrade ? '(REAL)' : ''} ဖွင့်မည် ($${margin} @ ${leverage}x)`
                    : `⚡ Open In-App ${side} ${isRealTrade ? '(REAL)' : ''} Position ($${margin} @ ${leverage}x)`
                )}
              </span>
            </button>

            {/* 2. Sync to Persistent Binance Window */}
            <button
              onClick={handleSyncToBinance}
              className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-black text-xs transition flex items-center justify-center gap-2 border border-amber-500/40 cursor-pointer active:scale-[0.98]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>
                {lang === 'my'
                  ? '🚀 Binance Tab သို့ TP/SL ပို့မည် (Log in မပျက်ပါ)'
                  : '🚀 Sync TP/SL to Persistent Binance Tab'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Active In-App Positions Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black text-white">
              {lang === 'my' ? `လက်ရှိ ဖွင့်ထားသော Position များ (${positions.length})` : `Active In-App Positions (${positions.length})`}
            </span>
          </div>
          {positions.length > 0 && (
            <button
              onClick={() => setPositions([])}
              className="text-[11px] text-rose-400 hover:text-rose-300 transition cursor-pointer"
            >
              {lang === 'my' ? 'အားလုံး ပိတ်သိမ်းရန်' : 'Close All'}
            </button>
          )}
        </div>

        {positions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            {lang === 'my'
              ? 'လက်ရှိ ဖွင့်ထားသော Position မရှိသေးပါ (အထက်ပါ Order Ticket မှ အလွယ်တကူ စတင်နိုင်သည်)'
              : 'No open positions yet. Use the order ticket above to simulate or execute.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-left">
                  <th className="pb-2">Contract</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Margin</th>
                  <th className="pb-2">Entry Price</th>
                  <th className="pb-2">Mark Price</th>
                  <th className="pb-2">PnL (ROE%)</th>
                  <th className="pb-2">TP / SL</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-white">{pos.symbol}USDT</td>
                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          pos.side === 'LONG'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {pos.side} {pos.leverage}x
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">${pos.margin}</td>
                    <td className="py-2.5 text-slate-300">${pos.entryPrice}</td>
                    <td className="py-2.5 text-white font-bold">${pos.currentPrice}</td>
                    <td className="py-2.5">
                      <span
                        className={`font-black ${
                          pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl} ({pos.roePercent >= 0 ? '+' : ''}
                        {pos.roePercent}%)
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400 text-[10px]">
                      TP: ${pos.tpPrice || '—'} | SL: ${pos.slPrice || '—'}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleClosePosition(pos.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] transition cursor-pointer"
                      >
                        {lang === 'my' ? 'ပိတ်သိမ်းမည်' : 'Close'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
