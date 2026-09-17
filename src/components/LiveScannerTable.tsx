import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  Percent,
  Zap,
  Bell,
  BellRing,
  BellOff,
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  LayoutGrid,
  List,
  Wallet,
  Scale,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Settings2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { LiveTickerItem } from '../types';
import { computeDualTrackRisk } from '../utils/dualTrackRisk';

export interface PriceAlert {
  id: string;
  symbol: string;
  contract: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'VOLATILITY_SURGE';
  targetValue: number;
  initialPrice: number;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
}

interface LiveScannerTableProps {
  tickers: LiveTickerItem[];
  onSelectTicker: (ticker: LiveTickerItem) => void;
  onGenerateTradeCard?: (ticker: LiveTickerItem) => void;
  onTradeInDemo?: (symbol: string, side: 'LONG' | 'SHORT', margin?: number, leverage?: number) => void;
  onOpenPriceAlert?: (symbol: string) => void;
  lang: 'my' | 'en';
  onRefresh?: () => void;
  isLoading?: boolean;
  scanMode?: 'manual' | 'auto';
  onToggleScanMode?: (mode: 'manual' | 'auto') => void;
  walletBalance?: number;
  onWalletBalanceChange?: (bal: number) => void;
}

// Generate realistic deterministic 24h price action points for sparkline
function generateSparklineData(
  lastPrice: number,
  change24h: number,
  high24h: number,
  low24h: number,
  symbol: string
): { val: number }[] {
  const startPrice = lastPrice / (1 + (change24h || 0) / 100);
  const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const points: { val: number }[] = [];
  const count = 10;
  const spread = Math.max(high24h - low24h, lastPrice * 0.02);

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    let val = startPrice + (lastPrice - startPrice) * progress;
    const wave = Math.sin(progress * Math.PI * 2 + (seed % 7)) * (spread * 0.15);
    val = Math.max(low24h * 0.998, Math.min(high24h * 1.002, val + wave));
    if (i === 0) val = startPrice;
    if (i === count - 1) val = lastPrice;
    points.push({ val: Number(val.toFixed(4)) });
  }
  return points;
}

export const LiveScannerTable: React.FC<LiveScannerTableProps> = ({
  tickers,
  onSelectTicker,
  onGenerateTradeCard,
  onTradeInDemo,
  onOpenPriceAlert,
  lang,
  onRefresh,
  isLoading,
  scanMode = 'manual',
  onToggleScanMode,
  walletBalance = 2000,
  onWalletBalanceChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'gainers' | 'losers' | 'high_vol' | 'extreme_funding' | 'high_feasibility'
  >('all');

  // Futures Wallet Balance & Dual-Track Preference
  const [internalWallet, setInternalWallet] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('futures_wallet_balance');
      if (saved) return Number(saved) || 2000;
    } catch (e) {
      console.error(e);
    }
    return 2000;
  });

  const effectiveWallet = walletBalance && walletBalance > 0 ? walletBalance : internalWallet;

  const handleWalletChange = (newBal: number) => {
    const valid = Math.max(10, Math.min(1000000, newBal));
    setInternalWallet(valid);
    try {
      localStorage.setItem('futures_wallet_balance', String(valid));
    } catch (e) {
      console.error(e);
    }
    if (onWalletBalanceChange) {
      onWalletBalanceChange(valid);
    }
  };

  // User Custom Rules
  const [userMarginPct, setUserMarginPct] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dualtrack_user_margin_pct');
      if (saved) return Number(saved) || 10;
    } catch (e) {}
    return 10;
  });

  const [userLeverage, setUserLeverage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dualtrack_user_leverage');
      if (saved) return Number(saved) || 20;
    } catch (e) {}
    return 20;
  });

  // Global Preferred Track Mode: 'user' | 'technical' | 'both'
  const [activeGlobalTrack, setActiveGlobalTrack] = useState<'user' | 'technical' | 'both'>('both');

  // Per-coin user override track choice
  const [coinTrackChoices, setCoinTrackChoices] = useState<Record<string, 'user' | 'technical'>>({});

  // Compare Modal ticker
  const [compareModalTicker, setCompareModalTicker] = useState<LiveTickerItem | null>(null);

  // Expanded row in table view for detailed side-by-side comparison
  const [expandedTableSymbol, setExpandedTableSymbol] = useState<string | null>(null);

  // Quick Rules Editor Open
  const [showRulesConfig, setShowRulesConfig] = useState<boolean>(false);

  // Compute Dual-Track Risk & Sizing for any ticker
  const getTickerDualRisk = (ticker: LiveTickerItem) => {
    const userMargin = Math.round((effectiveWallet * userMarginPct) / 100);
    const estAtr = Math.max(2.2, Math.abs(ticker.change24h) * 0.75);
    const direction = ticker.bias === 'SHORT' ? 'SHORT' : 'LONG';
    const dual = computeDualTrackRisk({
      walletBalance: effectiveWallet,
      direction,
      entryPrice: ticker.lastPrice,
      userMargin,
      userLeverage,
      change24h: ticker.change24h,
      atr24hPercent: estAtr,
      coin: ticker.symbol,
    });
    return {
      estAtr,
      userMargin,
      dual,
    };
  };

  // Display Mode: 'cards' (optimal on phone screens with direct trade buttons) vs 'table'
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>(() => {
    try {
      const saved = localStorage.getItem('crypto_scanner_display_mode');
      if (saved === 'cards' || saved === 'table') return saved;
    } catch (e) {
      console.error(e);
    }
    // Default to cards on phones/small screens
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'cards';
  });

  // Custom Alerts State with localStorage persistence
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('crypto_futures_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [alertModalTicker, setAlertModalTicker] = useState<LiveTickerItem | null>(null);
  const [alertType, setAlertType] = useState<'PRICE_ABOVE' | 'PRICE_BELOW' | 'VOLATILITY_SURGE'>('PRICE_ABOVE');
  const [alertTargetValue, setAlertTargetValue] = useState<string>('');
  const [isManageAlertsOpen, setIsManageAlertsOpen] = useState<boolean>(false);

  // Active Toast Notifications when an alert fires
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    message: string;
    symbol: string;
    type: 'success' | 'warning';
  } | null>(null);

  // Persist alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('crypto_futures_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

  // Evaluate active alerts against live ticker data
  useEffect(() => {
    if (tickers.length === 0 || alerts.length === 0) return;

    let hasUpdates = false;
    const updatedAlerts = alerts.map((alert) => {
      if (alert.triggered) return alert;

      const live = tickers.find((t) => t.symbol === alert.symbol || t.contract === alert.contract);
      if (!live) return alert;

      let isHit = false;
      let hitMsg = '';

      if (alert.type === 'PRICE_ABOVE' && live.lastPrice >= alert.targetValue) {
        isHit = true;
        hitMsg = `${alert.symbol} target reached! Price is $${live.lastPrice >= 1 ? live.lastPrice.toFixed(2) : live.lastPrice.toFixed(4)} (Target: ≥ $${alert.targetValue})`;
      } else if (alert.type === 'PRICE_BELOW' && live.lastPrice <= alert.targetValue) {
        isHit = true;
        hitMsg = `${alert.symbol} dip target hit! Price is $${live.lastPrice >= 1 ? live.lastPrice.toFixed(2) : live.lastPrice.toFixed(4)} (Target: ≤ $${alert.targetValue})`;
      } else if (
        alert.type === 'VOLATILITY_SURGE' &&
        Math.abs(live.change24h) >= alert.targetValue
      ) {
        isHit = true;
        hitMsg = `${alert.symbol} volatility threshold hit! 24h change is ${live.change24h >= 0 ? '+' : ''}${live.change24h.toFixed(2)}% (Threshold: ${alert.targetValue}%)`;
      }

      if (isHit) {
        hasUpdates = true;
        setToastNotification({
          id: alert.id,
          message: hitMsg,
          symbol: alert.symbol,
          type: alert.type === 'PRICE_ABOVE' ? 'success' : 'warning',
        });
        return {
          ...alert,
          triggered: true,
          triggeredAt: Date.now(),
        };
      }
      return alert;
    });

    if (hasUpdates) {
      setAlerts(updatedAlerts);
    }
  }, [tickers, alerts]);

  // Auto-dismiss toast notification after 7 seconds
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Open alert modal for a specific ticker
  const handleOpenAlertModal = (ticker: LiveTickerItem) => {
    if (onOpenPriceAlert) {
      onOpenPriceAlert(ticker.symbol);
      return;
    }
    setAlertModalTicker(ticker);
    setAlertType('PRICE_ABOVE');
    // Pre-fill target price with +3% higher than current price
    const defaultTarget = ticker.lastPrice * 1.03;
    setAlertTargetValue(
      defaultTarget >= 1 ? defaultTarget.toFixed(2) : defaultTarget.toFixed(4)
    );
  };

  const handleSaveAlert = () => {
    if (!alertModalTicker) return;
    const val = parseFloat(alertTargetValue);
    if (isNaN(val) || val <= 0) return;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      symbol: alertModalTicker.symbol,
      contract: alertModalTicker.contract,
      type: alertType,
      targetValue: val,
      initialPrice: alertModalTicker.lastPrice,
      createdAt: Date.now(),
      triggered: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setAlertModalTicker(null);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredTickers = useMemo(() => {
    let list = tickers;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(term) ||
          t.contract.toLowerCase().includes(term)
      );
    }

    switch (activeFilter) {
      case 'gainers':
        return list.filter((t) => t.change24h > 0).sort((a, b) => b.change24h - a.change24h);
      case 'losers':
        return list.filter((t) => t.change24h < 0).sort((a, b) => a.change24h - b.change24h);
      case 'high_vol':
        return list.filter((t) => t.volume24hUsd > 100000000).sort((a, b) => b.volume24hUsd - a.volume24hUsd);
      case 'extreme_funding':
        return list.filter((t) => Math.abs(t.fundingRate) > 0.05).sort((a, b) => a.fundingRate - b.fundingRate);
      case 'high_feasibility':
        return list.filter((t) => t.feasibility === 'HIGH').sort((a, b) => b.volume24hUsd - a.volume24hUsd);
      default:
        return list;
    }
  }, [tickers, searchTerm, activeFilter]);

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    return `$${(vol / 1e3).toFixed(0)}K`;
  };

  const activeAlertCount = alerts.filter((a) => !a.triggered).length;

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 relative">
      {/* Toast Notification for Triggered Alert */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-top-5 duration-200">
          <div className="p-4 rounded-2xl bg-slate-950 text-white border border-amber-500/50 shadow-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    TARGET HIT ALERT
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                    {toastNotification.symbol}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium mt-0.5 leading-relaxed">
                  {toastNotification.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'my'
                ? 'Binance Futures စျေးကွက်တစ်ခုလုံး LIVE စကင်နာ'
                : 'Full Binance Futures Live Market Scanner'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'my'
                ? `${tickers.length} ခုသော Futures Pairs များအား Sparkline Trend၊ ငါ့ Risk စည်းမျဉ်း နှင့် Crypto နည်းပညာ ခွဲခြမ်းစိတ်ဖြာမှုများဖြင့် Trade Card ထုတ်ယူနိုင်သည်`
                : `Scanning ${tickers.length} perpetual contracts with 24h sparklines, custom risk rules, and pro crypto technical analysis`}
            </p>
          </div>
        </div>

        {/* Search Input & Manage Alerts & Scan Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Scan Mode Toggle & Refresh Button */}
          {onRefresh && (
            <div className="flex items-center gap-1.5">
              {onToggleScanMode && (
                <div
                  className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 text-xs"
                  title={lang === 'my' ? 'စစ်ဆေးမှုစနစ် ရွေးချယ်ရန် (ကိုယ်တိုင်စီမံ / အလိုအလျောက်)' : 'Scan Mode: Manual vs Auto'}
                >
                  <button
                    onClick={() => onToggleScanMode('manual')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      scanMode === 'manual'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={lang === 'my' ? 'ကိုယ်တိုင်စီမံမည် (Auto မလုပ်ပါ)' : 'Manual Mode'}
                  >
                    <span>✋</span>
                    <span className="hidden md:inline">{lang === 'my' ? 'ကိုယ်တိုင်' : 'Manual'}</span>
                  </button>
                  <button
                    onClick={() => onToggleScanMode('auto')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      scanMode === 'auto'
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={lang === 'my' ? 'အလိုအလျောက် စစ်ဆေးမည်' : 'Auto Refresh'}
                  >
                    <span>⚡</span>
                    <span className="hidden md:inline">{lang === 'my' ? 'Auto' : 'Auto'}</span>
                  </button>
                </div>
              )}

              <button
                id="scanner-refresh-btn"
                onClick={onRefresh}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm shadow-amber-500/20 shrink-0"
                title={
                  lang === 'my'
                    ? 'စျေးကွက်ဒေတာကို ယခုချက်ချင်း ကိုယ်တိုင်စစ်ဆေးမည်'
                    : 'Rescan live market right now'
                }
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {isLoading
                    ? lang === 'my'
                      ? 'စစ်ဆေးနေဆဲ...'
                      : 'Scanning...'
                    : lang === 'my'
                    ? 'စစ်ဆေးမည်'
                    : 'Scan Live'}
                </span>
              </button>
            </div>
          )}

          <button
            id="manage-alerts-btn"
            onClick={() => setIsManageAlertsOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Manage your custom price and volatility alerts"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'my' ? 'Alerts သတ်မှတ်ချက်များ' : 'Alerts'}</span>
            {activeAlertCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                {activeAlertCount}
              </span>
            )}
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="market-search-input"
              type="text"
              placeholder={lang === 'my' ? 'Coin ရှာဖွေပါ (ဥပမာ SOL, LSK, ETH)...' : 'Search symbol (e.g., SOL, LSK)...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* ── FUTURES WALLET BALANCE & DUAL-TRACK RISK CONTROLLER BAR ── */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Wallet Balance Input & Presets */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 font-sans flex items-center gap-1">
                  <span>{lang === 'my' ? 'Futures Wallet Balance (ငါ့လက်ကျန်ငွေ)' : 'Futures Wallet Balance'}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-bold text-amber-500 font-mono">$</span>
                  <input
                    id="scanner-wallet-balance-input"
                    type="number"
                    value={effectiveWallet}
                    onChange={(e) => handleWalletChange(Number(e.target.value))}
                    className="w-24 bg-slate-950 px-2 py-1 rounded-lg border border-slate-700 text-sm font-mono font-black text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[500, 1000, 2000, 5000, 10000].map((bal) => (
                <button
                  key={bal}
                  onClick={() => handleWalletChange(bal)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    effectiveWallet === bal
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  ${bal >= 1000 ? `${bal / 1000}k` : bal}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Dual-Track Mode Selector & Rules Config Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-sans">
              {/* Option 1: ငါ့စည်းမျဉ်း (My Rules) */}
              <button
                id="select-global-user-rules"
                onClick={() => setActiveGlobalTrack('user')}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeGlobalTrack === 'user'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'my' ? 'ငါ့စည်းမျဉ်းဖြင့် အမြဲသုံးစွဲမည်' : 'Always trade with My Rules'}
              >
                <span>👤 {lang === 'my' ? 'ငါ့စည်းမျဉ်း' : 'My Rules'}</span>
                <span className="text-[10px] font-mono opacity-85 font-normal">
                  (${Math.round((effectiveWallet * userMarginPct) / 100)} • {userLeverage}x)
                </span>
              </button>

              {/* Option 2: မင်းရွေးချယ်မှု (Pro Technical) */}
              <button
                id="select-global-tech-rules"
                onClick={() => setActiveGlobalTrack('technical')}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeGlobalTrack === 'technical'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'my' ? 'မင်းရွေးချယ်မှု နည်းပညာအကြံပြုချက်ဖြင့် သုံးစွဲမည်' : 'Always trade with System Choice'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🤖 {lang === 'my' ? 'မင်းရွေးချယ်မှု' : 'Technical Pro'}</span>
              </button>

              {/* Option 3: Compare Both */}
              <button
                id="select-global-both-rules"
                onClick={() => setActiveGlobalTrack('both')}
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeGlobalTrack === 'both'
                    ? 'bg-slate-800 text-white font-black shadow-xs border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'my' ? 'နှစ်ခုစလုံးကို ဘေးချင်းယှဉ်၍ ရွေးချယ်မည်' : 'Compare both side by side'}
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>⚖️ {lang === 'my' ? 'နှစ်ခုစလုံးယှဉ်ပြ' : 'Compare Both'}</span>
              </button>
            </div>

            {/* Quick Rules Config Toggle */}
            <button
              id="toggle-rules-config-btn"
              onClick={() => setShowRulesConfig(!showRulesConfig)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="ငါ့စည်းမျဉ်း Margin % နှင့် Leverage သတ်မှတ်ရန်"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'my' ? 'ငါ့စည်းမျဉ်းပြင်ရန်' : 'Edit Rules'}</span>
              {showRulesConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Quick Rules Config Drawer */}
        {showRulesConfig && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl">
            <div>
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>{lang === 'my' ? 'ငါ့ Margin သုံးစွဲမှု (Wallet ၏ ရာခိုင်နှုန်း):' : 'My Margin Allocation:'}</span>
                <span className="text-amber-400 font-mono font-black">{userMarginPct}% (${Math.round((effectiveWallet * userMarginPct) / 100)})</span>
              </label>
              <div className="flex gap-1.5 mt-1.5">
                {[5, 10, 15, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setUserMarginPct(pct);
                      try { localStorage.setItem('dualtrack_user_margin_pct', String(pct)); } catch (e) {}
                    }}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                      userMarginPct === pct
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>{lang === 'my' ? 'ငါ့ Leverage ရွေးချယ်မှု:' : 'My Preferred Leverage:'}</span>
                <span className="text-amber-400 font-mono font-black">{userLeverage}x</span>
              </label>
              <div className="flex gap-1.5 mt-1.5">
                {[5, 10, 20, 30, 50].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => {
                      setUserLeverage(lev);
                      try { localStorage.setItem('dualtrack_user_leverage', String(lev)); } catch (e) {}
                    }}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                      userLeverage === lev
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: lang === 'my' ? 'အားလုံး' : 'All Pairs' },
            { id: 'high_vol', label: lang === 'my' ? 'Volume အများဆုံး (> $100M)' : 'High Vol (> $100M)' },
            { id: 'gainers', label: lang === 'my' ? 'တက်နေသော Coins' : 'Top Gainers' },
            { id: 'losers', label: lang === 'my' ? 'ကျနေသော Coins' : 'Top Losers' },
            { id: 'extreme_funding', label: lang === 'my' ? 'Funding Rate အလွန်ကဲ' : 'Extreme Funding' },
            { id: 'high_feasibility', label: lang === 'my' ? '10% ဖြစ်နိုင်ချေမြင့်' : '10% High Feasibility' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Mobile Cards (with visible Trade buttons) vs Full Table */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
          <button
            id="view-mode-cards-btn"
            onClick={() => {
              setDisplayMode('cards');
              try { localStorage.setItem('crypto_scanner_display_mode', 'cards'); } catch (e) { console.error(e); }
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              displayMode === 'cards'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={lang === 'my' ? 'ဖုန်း screen အတွက် အကောင်းဆုံး ကတ်ပုံစံ (Trade ခလုတ်များ အပြည့်အစုံ)' : 'Mobile Cards View (Direct Trade Buttons visible on phone)'}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '📱 ဖုန်းကတ် (Cards)' : '📱 Mobile Cards'}</span>
          </button>

          <button
            id="view-mode-table-btn"
            onClick={() => {
              setDisplayMode('table');
              try { localStorage.setItem('crypto_scanner_display_mode', 'table'); } catch (e) { console.error(e); }
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              displayMode === 'table'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={lang === 'my' ? 'ကွန်ပျူတာ / ဇယားအပြည့်ပုံစံ' : 'Full Table View'}
          >
            <List className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '📊 ဇယား (Table)' : '📊 Full Table'}</span>
          </button>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (Direct trade entry buttons 100% visible on phone screen) */}
      {displayMode === 'cards' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-semibold">
            <span>
              {lang === 'my'
                ? `⚡ စုစုပေါင်း (${filteredTickers.length}) ခုအနက် အကောင်းဆုံး (၃၀) ခုပြသထားပါသည်`
                : `⚡ Showing top ${Math.min(filteredTickers.length, 30)} of ${filteredTickers.length} contracts`}
            </span>
            <span className="text-amber-500 font-bold">
              {lang === 'my' ? '🟢 LONG / 🔴 SHORT ခလုတ်များ ဖုန်းတွင် တိုက်ရိုက်နှိပ်နိုင်သည်' : 'Direct Trade Entry Buttons'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTickers.slice(0, 30).map((ticker) => {
              const isGainer = ticker.change24h >= 0;
              const hasAlert = alerts.some((a) => a.symbol === ticker.symbol && !a.triggered);
              const sparklinePoints = generateSparklineData(
                ticker.lastPrice,
                ticker.change24h,
                ticker.high24h,
                ticker.low24h,
                ticker.symbol
              );

              return (
                <div
                  key={`card-${ticker.contract}`}
                  className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-4 shadow-sm transition space-y-3 relative group"
                >
                  {/* Top Row: Symbol, Badges & Alert Bell */}
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => onSelectTicker(ticker)}
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs">
                        {ticker.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                          <span>{ticker.symbol}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">USDT</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Vol: {formatVolume(ticker.volume24hUsd)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Bias Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-sans ${
                          ticker.bias === 'LONG'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            : ticker.bias === 'SHORT'
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        }`}
                      >
                        {ticker.bias}
                      </span>

                      {/* 10% Feasibility Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ticker.feasibility === 'HIGH'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : ticker.feasibility === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                        title="10% Target Feasibility"
                      >
                        {ticker.feasibility}
                      </span>

                      {/* Alert Bell */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAlertModal(ticker);
                        }}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
                          hasAlert
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                            : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={hasAlert ? 'Alert is active' : 'Set Alert'}
                      >
                        {hasAlert ? <BellRing className="w-3.5 h-3.5 text-amber-500" /> : <Bell className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: Price, 24h Change, Funding & Sparkline */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {lang === 'my' ? 'လက်ရှိစျေး' : 'Price'}
                      </div>
                      <div className="text-sm font-black font-mono text-slate-900 dark:text-white leading-snug">
                        ${ticker.lastPrice >= 1 ? ticker.lastPrice.toFixed(2) : ticker.lastPrice.toFixed(4)}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {lang === 'my' ? '၂၄ နာရီ ပြောင်းလဲမှု' : '24h Change'}
                      </div>
                      <div
                        className={`text-xs font-black font-mono flex items-center justify-center gap-0.5 ${
                          isGainer ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {isGainer ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>
                          {isGainer ? '+' : ''}
                          {ticker.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-semibold">Funding</div>
                      <div
                        className={`text-[11px] font-mono font-bold ${
                          ticker.fundingRate < -0.05
                            ? 'text-rose-500'
                            : ticker.fundingRate > 0.05
                            ? 'text-emerald-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {ticker.fundingRate.toFixed(4)}%
                      </div>
                    </div>

                    {/* Sparkline */}
                    <div className="w-16 h-7 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklinePoints}>
                          <Line
                            type="monotone"
                            dataKey="val"
                            stroke={isGainer ? '#10b981' : '#f43f5e'}
                            strokeWidth={1.8}
                            dot={false}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* DUAL-TRACK SIZING SELECTOR (ငါ့စည်းမျဉ်း VS မင်းရွေးချယ်မှု) */}
                  {(() => {
                    const riskData = getTickerDualRisk(ticker);
                    const cardTrack =
                      coinTrackChoices[ticker.symbol] ||
                      (activeGlobalTrack === 'both' ? 'technical' : activeGlobalTrack);
                    const chosenMargin =
                      cardTrack === 'user' ? riskData.userMargin : riskData.dual.technical.recommendedMargin;
                    const chosenLeverage =
                      cardTrack === 'user' ? userLeverage : riskData.dual.technical.recommendedLeverage;

                    return (
                      <div className="space-y-2 pt-1">
                        <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Scale className="w-3 h-3 text-amber-500" />
                              <span>{lang === 'my' ? 'Sizing ရွေးချယ်မှု:' : 'Sizing Option:'}</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompareModalTicker(ticker);
                              }}
                              className="text-amber-500 hover:text-amber-400 text-[10px] font-bold underline cursor-pointer flex items-center gap-0.5"
                            >
                              <span>{lang === 'my' ? '⚖️ အပြည့်အစုံယှဉ်မည်' : '⚖️ Compare'}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Option 1: ငါ့စည်းမျဉ်း */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoinTrackChoices((prev) => ({ ...prev, [ticker.symbol]: 'user' }));
                              }}
                              className={`p-2 rounded-lg border transition cursor-pointer ${
                                cardTrack === 'user'
                                  ? 'bg-amber-500/15 border-amber-500/80 shadow-xs ring-1 ring-amber-500/30'
                                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-amber-500">
                                  👤 {lang === 'my' ? 'ငါ့စည်းမျဉ်း' : 'My Rules'}
                                </span>
                                {cardTrack === 'user' && (
                                  <span className="text-[9px] font-black px-1 rounded bg-amber-500 text-slate-950">✓</span>
                                )}
                              </div>
                              <div className="text-xs font-mono font-black text-slate-900 dark:text-white">
                                ${riskData.userMargin} <span className="text-amber-500">• {userLeverage}x</span>
                              </div>
                              <div className="text-[9px] text-rose-500 font-mono mt-0.5">
                                SL: -${riskData.dual.user.dollarLoss.toFixed(1)} (-{riskData.dual.user.accountLossPct.toFixed(1)}%)
                              </div>
                            </div>

                            {/* Option 2: မင်းရွေးချယ်မှု */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoinTrackChoices((prev) => ({ ...prev, [ticker.symbol]: 'technical' }));
                              }}
                              className={`p-2 rounded-lg border transition cursor-pointer ${
                                cardTrack === 'technical'
                                  ? 'bg-emerald-500/15 border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/30'
                                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>{lang === 'my' ? 'မင်းရွေးချယ်မှု' : 'Technical'}</span>
                                </span>
                                {cardTrack === 'technical' && (
                                  <span className="text-[9px] font-black px-1 rounded bg-emerald-500 text-slate-950">✓</span>
                                )}
                              </div>
                              <div className="text-xs font-mono font-black text-slate-900 dark:text-white">
                                ${riskData.dual.technical.recommendedMargin}{' '}
                                <span className="text-emerald-500">• {riskData.dual.technical.recommendedLeverage}x</span>
                              </div>
                              <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                                Safe (-{riskData.dual.technical.recommendedAccountLossPct.toFixed(1)}% DD)
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM TRADE ENTRY BUTTONS - WITH CHOSEN SIZING */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                          {/* 1. Direct LONG button with chosen sizing */}
                          <button
                            id={`mobile-trade-long-${ticker.symbol}`}
                            onClick={() => {
                              if (onTradeInDemo) {
                                onTradeInDemo(ticker.symbol, 'LONG', chosenMargin, chosenLeverage);
                              } else {
                                onSelectTicker(ticker);
                              }
                            }}
                            className="py-2.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-sm shadow-emerald-500/20 active:scale-95 transition cursor-pointer leading-tight"
                            title={lang === 'my' ? `${ticker.symbol} LONG စာချုပ် ကုန်သွယ်မည်` : `Trade LONG on ${ticker.symbol}`}
                          >
                            <div className="flex items-center gap-1">
                              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                              <span>{lang === 'my' ? 'LONG ဝင်မည်' : 'LONG'}</span>
                            </div>
                            <span className="text-[9px] font-mono opacity-85">
                              ${chosenMargin} • {chosenLeverage}x
                            </span>
                          </button>

                          {/* 2. Direct SHORT button with chosen sizing */}
                          <button
                            id={`mobile-trade-short-${ticker.symbol}`}
                            onClick={() => {
                              if (onTradeInDemo) {
                                onTradeInDemo(ticker.symbol, 'SHORT', chosenMargin, chosenLeverage);
                              } else {
                                onSelectTicker(ticker);
                              }
                            }}
                            className="py-2.5 px-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex flex-col items-center justify-center shadow-sm shadow-rose-500/20 active:scale-95 transition cursor-pointer leading-tight"
                            title={lang === 'my' ? `${ticker.symbol} SHORT စာချုပ် ကုန်သွယ်မည်` : `Trade SHORT on ${ticker.symbol}`}
                          >
                            <div className="flex items-center gap-1">
                              <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                              <span>{lang === 'my' ? 'SHORT ဝင်မည်' : 'SHORT'}</span>
                            </div>
                            <span className="text-[9px] font-mono opacity-85">
                              ${chosenMargin} • {chosenLeverage}x
                            </span>
                          </button>

                          {/* 3. Trade Card button */}
                          <button
                            id={`mobile-trade-card-${ticker.symbol}`}
                            onClick={() => {
                              if (onGenerateTradeCard) {
                                onGenerateTradeCard(ticker);
                              }
                            }}
                            className="py-2.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
                            title={lang === 'my' ? 'ငါ့ Risk စည်းမျဉ်း + နည်းပညာ Trade Card ထုတ်မည်' : 'Generate Trade Card'}
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>{lang === 'my' ? 'Trade Card' : 'Trade Card'}</span>
                          </button>

                          {/* 4. Multi-Timeframe Inspect button */}
                          <button
                            id={`mobile-inspect-${ticker.symbol}`}
                            onClick={() => onSelectTicker(ticker)}
                            className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
                            title={lang === 'my' ? '4H/1H/15M အသေးစိတ် စစ်ဆေးမည်' : 'Inspect Multi-Timeframe'}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span>{lang === 'my' ? '4H/1H/15M' : 'Inspect'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL TABLE VIEW (With enhanced Action column containing direct Long/Short buttons) */}
      {displayMode === 'table' && (
        <div className="space-y-2">
          {/* Mobile hint banner */}
          <div className="md:hidden bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>{lang === 'my' ? '💡 ဖုန်း screen တွင် Trade ခလုတ်များ တိုက်ရိုက်နှိပ်ရန် ဖုန်းကတ် (Cards) ကိုသုံးပါ' : '💡 Use Mobile Cards for quick thumb access to Trade buttons'}</span>
            <button
              onClick={() => setDisplayMode('cards')}
              className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-black text-[11px] shrink-0 cursor-pointer ml-2"
            >
              {lang === 'my' ? 'ကတ်သို့ ပြောင်းမည်' : 'Switch'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Contract</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">24H Change</th>
                  <th className="py-2.5 px-3 text-center">24H Trend (Sparkline)</th>
                  <th className="py-2.5 px-3 text-right">24H Volume</th>
                  <th className="py-2.5 px-3 text-right">Funding (8h)</th>
                  <th className="py-2.5 px-3 text-center">10% Feasibility</th>
                  <th className="py-2.5 px-3 text-center">Bias</th>
                  <th className="py-2.5 px-3 text-center">⚖️ ငါ့ VS မင်း (Dual-Track Sizing)</th>
                  <th className="py-2.5 px-3 text-center">Alert</th>
                  <th className="py-2.5 px-3 text-right">Trade / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredTickers.slice(0, 30).map((ticker) => {
                  const isGainer = ticker.change24h >= 0;
                  const sparklinePoints = generateSparklineData(
                    ticker.lastPrice,
                    ticker.change24h,
                    ticker.high24h,
                    ticker.low24h,
                    ticker.symbol
                  );
                  const hasAlert = alerts.some((a) => a.symbol === ticker.symbol && !a.triggered);
                  const riskData = getTickerDualRisk(ticker);
                  const cardTrack =
                    coinTrackChoices[ticker.symbol] ||
                    (activeGlobalTrack === 'both' ? 'technical' : activeGlobalTrack);
                  const chosenMargin =
                    cardTrack === 'user' ? riskData.userMargin : riskData.dual.technical.recommendedMargin;
                  const chosenLeverage =
                    cardTrack === 'user' ? userLeverage : riskData.dual.technical.recommendedLeverage;
                  const isExpanded = expandedTableSymbol === ticker.symbol;

                  return (
                    <React.Fragment key={ticker.contract}>
                      <tr
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group cursor-pointer ${
                          isExpanded ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''
                        }`}
                        onClick={() => onSelectTicker(ticker)}
                      >
                        <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{ticker.symbol}</span>
                          <span className="text-[10px] font-normal text-slate-400">USDT</span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-slate-200">
                          ${ticker.lastPrice >= 1 ? ticker.lastPrice.toFixed(2) : ticker.lastPrice.toFixed(4)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-bold ${
                            isGainer ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {isGainer ? '+' : ''}
                          {ticker.change24h.toFixed(2)}%
                        </td>

                        {/* Sparkline Chart Column */}
                        <td className="py-3 px-3 text-center">
                          <div className="w-20 h-6 mx-auto">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparklinePoints}>
                                <Line
                                  type="monotone"
                                  dataKey="val"
                                  stroke={isGainer ? '#10b981' : '#f43f5e'}
                                  strokeWidth={1.5}
                                  dot={false}
                                  isAnimationActive={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                          {formatVolume(ticker.volume24hUsd)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-semibold ${
                            ticker.fundingRate < -0.05
                              ? 'text-rose-500 font-bold'
                              : ticker.fundingRate > 0.05
                              ? 'text-emerald-500 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          {ticker.fundingRate.toFixed(4)}%
                        </td>
                        <td className="py-3 px-3 text-center font-sans">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              ticker.feasibility === 'HIGH'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : ticker.feasibility === 'MEDIUM'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {ticker.feasibility}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-sans">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ticker.bias === 'LONG'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-black'
                                : ticker.bias === 'SHORT'
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 font-black'
                                : 'text-amber-500'
                            }`}
                          >
                            {ticker.bias}
                          </span>
                        </td>

                        {/* DUAL-TRACK SIZING COLUMN (ငါ့ VS မင်း) */}
                        <td className="py-2.5 px-3 text-center font-sans">
                          <div className="inline-flex flex-col gap-1 items-start bg-slate-50 dark:bg-slate-900/90 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                            {/* ငါ့စည်းမျဉ်း Option */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoinTrackChoices((prev) => ({ ...prev, [ticker.symbol]: 'user' }));
                              }}
                              className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition cursor-pointer ${
                                cardTrack === 'user'
                                  ? 'bg-amber-500/20 text-amber-500 font-black ring-1 ring-amber-500/40'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                              }`}
                              title="ငါ့စည်းမျဉ်း ရွေးချယ်မည်"
                            >
                              <span className="text-[10px]">👤 ငါ့:</span>
                              <span className="font-mono font-bold">${riskData.userMargin} • {userLeverage}x</span>
                              {cardTrack === 'user' && <span className="text-[9px]">✓</span>}
                            </button>

                            {/* မင်းရွေးချယ်မှု Option */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoinTrackChoices((prev) => ({ ...prev, [ticker.symbol]: 'technical' }));
                              }}
                              className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition cursor-pointer ${
                                cardTrack === 'technical'
                                  ? 'bg-emerald-500/20 text-emerald-500 font-black ring-1 ring-emerald-500/40'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
                              }`}
                              title="မင်းရွေးချယ်မှု နည်းပညာအကြံပြုချက် ရွေးချယ်မည်"
                            >
                              <span className="text-[10px] flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>မင်း:</span>
                              </span>
                              <span className="font-mono font-bold">
                                ${riskData.dual.technical.recommendedMargin} • {riskData.dual.technical.recommendedLeverage}x
                              </span>
                              {cardTrack === 'technical' && <span className="text-[9px]">✓</span>}
                            </button>

                            {/* Quick Compare button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompareModalTicker(ticker);
                              }}
                              className="text-[10px] text-amber-500 hover:underline flex items-center gap-1 font-bold pt-0.5 cursor-pointer"
                            >
                              <Scale className="w-2.5 h-2.5" />
                              <span>{lang === 'my' ? 'ဘေးချင်းယှဉ်မည်' : 'Compare'}</span>
                            </button>
                          </div>
                        </td>

                        {/* Set Alert Bell Button */}
                        <td className="py-3 px-3 text-center font-sans">
                          <button
                            id={`set-alert-btn-${ticker.symbol}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAlertModal(ticker);
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              hasAlert
                                ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={hasAlert ? 'Alert is active for this coin' : 'Set custom price or volatility alert'}
                          >
                            {hasAlert ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        {/* Action Column with Direct Long/Short, Trade Card, Inline Drawer Toggle */}
                        <td className="py-3 px-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1">
                            {/* Direct LONG Button with active chosen sizing */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onTradeInDemo) {
                                  onTradeInDemo(ticker.symbol, 'LONG', chosenMargin, chosenLeverage);
                                } else {
                                  onSelectTicker(ticker);
                                }
                              }}
                              className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-black transition cursor-pointer shadow-2xs flex flex-col items-center leading-none"
                              title={lang === 'my' ? `${ticker.symbol} LONG (${chosenMargin}$ • ${chosenLeverage}x) ကုန်သွယ်မည်` : `Trade LONG (${chosenMargin}$ • ${chosenLeverage}x)`}
                            >
                              <span>LONG</span>
                              <span className="text-[8px] font-mono opacity-80 mt-0.5">${chosenMargin}</span>
                            </button>

                            {/* Direct SHORT Button with active chosen sizing */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onTradeInDemo) {
                                  onTradeInDemo(ticker.symbol, 'SHORT', chosenMargin, chosenLeverage);
                                } else {
                                  onSelectTicker(ticker);
                                }
                              }}
                              className="px-2 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black transition cursor-pointer shadow-2xs flex flex-col items-center leading-none"
                              title={lang === 'my' ? `${ticker.symbol} SHORT (${chosenMargin}$ • ${chosenLeverage}x) ကုန်သွယ်မည်` : `Trade SHORT (${chosenMargin}$ • ${chosenLeverage}x)`}
                            >
                              <span>SHORT</span>
                              <span className="text-[8px] font-mono opacity-80 mt-0.5">${chosenMargin}</span>
                            </button>

                            {/* Inline Dual-Track Expand Drawer Toggle */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTableSymbol(isExpanded ? null : ticker.symbol);
                              }}
                              className={`p-1 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-0.5 ${
                                isExpanded
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500'
                              }`}
                              title={lang === 'my' ? 'ငါ့စည်းမျဉ်း vs မင်းရွေးချယ်မှု အသေးစိတ်ယှဉ်ကြည့်ရန်' : 'Toggle inline comparison drawer'}
                            >
                              <Scale className="w-3 h-3" />
                            </button>

                            {/* Trade Card Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onGenerateTradeCard) {
                                  onGenerateTradeCard(ticker);
                                }
                              }}
                              className="px-1.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-0.5"
                              title={lang === 'my' ? 'Trade Card ထုတ်မည်' : 'Trade Card'}
                            >
                              <Zap className="w-2.5 h-2.5 fill-current" />
                              <span>Card</span>
                            </button>

                            {/* Inspect Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTicker(ticker);
                              }}
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                              title={lang === 'my' ? 'အသေးစိတ် စစ်ဆေးမည်' : 'Inspect'}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* INLINE DUAL-TRACK COMPARISON DRAWER FOR TABLE ROW */}
                      {isExpanded && (
                        <tr className="bg-slate-950 text-white border-b border-slate-800 font-sans">
                          <td colSpan={11} className="p-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                  <Scale className="w-4 h-4 text-amber-400" />
                                  <span className="text-xs font-black text-amber-400 uppercase">
                                    {ticker.symbol} USDT — {lang === 'my' ? 'ငါ့စည်းမျဉ်း VS မင်းရွေးချယ်မှု စစ်ဆေးခြင်း' : 'Dual-Track Analysis'}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono">
                                  Wallet: <strong className="text-white">${effectiveWallet}</strong> | ATR Volatility: <strong className="text-amber-400">{riskData.estAtr.toFixed(1)}%</strong>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Track 1: ငါ့စည်းမျဉ်း */}
                                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-amber-400">
                                      👤 {lang === 'my' ? 'ငါ့စည်းမျဉ်း (My Rules)' : 'My Rules'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Margin: ${riskData.userMargin} ({userMarginPct}%) • {userLeverage}x
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono bg-slate-900 p-2 rounded-lg">
                                    <div>
                                      <div className="text-[9px] text-slate-400 font-sans">Notional:</div>
                                      <div className="font-bold text-white">${riskData.dual.user.notional}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] text-slate-400 font-sans">SL Loss (-2%):</div>
                                      <div className="font-bold text-rose-400">-${riskData.dual.user.dollarLoss.toFixed(1)}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] text-slate-400 font-sans">TP Gain (+10%):</div>
                                      <div className="font-bold text-emerald-400">+${riskData.dual.user.dollarProfit.toFixed(1)}</div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => {
                                        if (onTradeInDemo) {
                                          onTradeInDemo(ticker.symbol, 'LONG', riskData.userMargin, userLeverage);
                                        }
                                      }}
                                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs cursor-pointer text-center"
                                    >
                                      👤 ငါ့စည်းမျဉ်းဖြင့် LONG (${riskData.userMargin} • {userLeverage}x)
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (onTradeInDemo) {
                                          onTradeInDemo(ticker.symbol, 'SHORT', riskData.userMargin, userLeverage);
                                        }
                                      }}
                                      className="flex-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer text-center"
                                    >
                                      👤 ငါ့စည်းမျဉ်းဖြင့် SHORT (${riskData.userMargin} • {userLeverage}x)
                                    </button>
                                  </div>
                                </div>

                                {/* Track 2: မင်းရွေးချယ်မှု */}
                                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>{lang === 'my' ? 'မင်းရွေးချယ်မှု (Pro Technical)' : 'Technical Recommendation'}</span>
                                    </span>
                                    <span className="text-[10px] text-emerald-500/80 font-mono">
                                      Safe: ${riskData.dual.technical.recommendedMargin} (1.5%) • {riskData.dual.technical.recommendedLeverage}x
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono bg-slate-900 p-2 rounded-lg">
                                    <div>
                                      <div className="text-[9px] text-slate-400 font-sans">Notional:</div>
                                      <div className="font-bold text-white">${riskData.dual.technical.recommendedNotional}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] text-slate-400 font-sans">SL Loss:</div>
                                      <div className="font-bold text-rose-400">-${riskData.dual.technical.recommendedDollarLoss.toFixed(1)}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] text-slate-400 font-sans">TP Gain (+10%):</div>
                                      <div className="font-bold text-emerald-400">+${riskData.dual.technical.recommendedDollarProfit.toFixed(1)}</div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => {
                                        if (onTradeInDemo) {
                                          onTradeInDemo(ticker.symbol, 'LONG', riskData.dual.technical.recommendedMargin, riskData.dual.technical.recommendedLeverage);
                                        }
                                      }}
                                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs cursor-pointer text-center"
                                    >
                                      🤖 မင်းရွေးချယ်မှုဖြင့် LONG (${riskData.dual.technical.recommendedMargin} • {riskData.dual.technical.recommendedLeverage}x)
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (onTradeInDemo) {
                                          onTradeInDemo(ticker.symbol, 'SHORT', riskData.dual.technical.recommendedMargin, riskData.dual.technical.recommendedLeverage);
                                        }
                                      }}
                                      className="flex-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer text-center"
                                    >
                                      🤖 မင်းရွေးချယ်မှုဖြင့် SHORT (${riskData.dual.technical.recommendedMargin} • {riskData.dual.technical.recommendedLeverage}x)
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredTickers.length > 30 && (
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Showing top 30 results out of {filteredTickers.length} contracts matching filter.
        </div>
      )}

      {/* Set Alert Modal */}
      {alertModalTicker && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setAlertModalTicker(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'my' ? `${alertModalTicker.symbol} အတွက် Alert သတ်မှတ်မည်` : `Set Alert for ${alertModalTicker.symbol}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Current: ${alertModalTicker.lastPrice >= 1 ? alertModalTicker.lastPrice.toFixed(2) : alertModalTicker.lastPrice.toFixed(4)} • 24h: {alertModalTicker.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAlertModalTicker(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                {lang === 'my' ? 'Alert အမျိုးအစား' : 'Condition'}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'PRICE_ABOVE', label: 'Price ≥ Target', icon: TrendingUp },
                  { id: 'PRICE_BELOW', label: 'Price ≤ Target', icon: TrendingDown },
                  { id: 'VOLATILITY_SURGE', label: 'Volatility ≥ X%', icon: Activity },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAlertType(item.id as any);
                      if (item.id === 'VOLATILITY_SURGE') {
                        setAlertTargetValue('10');
                      } else if (item.id === 'PRICE_ABOVE') {
                        const val = alertModalTicker.lastPrice * 1.03;
                        setAlertTargetValue(val >= 1 ? val.toFixed(2) : val.toFixed(4));
                      } else {
                        const val = alertModalTicker.lastPrice * 0.97;
                        setAlertTargetValue(val >= 1 ? val.toFixed(2) : val.toFixed(4));
                      }
                    }}
                    className={`p-2 rounded-xl border text-center transition font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                      alertType === item.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {lang === 'my' ? 'အမြန် သတ်မှတ်ချက်များ' : 'Quick Target Presets'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {alertType === 'VOLATILITY_SURGE' ? (
                  [5, 8, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setAlertTargetValue(pct.toString())}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-mono transition cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))
                ) : (
                  [
                    { label: '+2%', mult: 1.02 },
                    { label: '+5%', mult: 1.05 },
                    { label: '+10%', mult: 1.10 },
                    { label: '-2%', mult: 0.98 },
                    { label: '-5%', mult: 0.95 },
                  ].map((p) => {
                    const price = alertModalTicker.lastPrice * p.mult;
                    return (
                      <button
                        key={p.label}
                        onClick={() =>
                          setAlertTargetValue(price >= 1 ? price.toFixed(2) : price.toFixed(4))
                        }
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-mono transition cursor-pointer"
                      >
                        {p.label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Value Input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {alertType === 'VOLATILITY_SURGE'
                  ? 'Volatility Threshold (±% Move in 24h)'
                  : 'Target Price (USD)'}
              </label>
              <input
                id="alert-threshold-input"
                type="number"
                step="any"
                value={alertTargetValue}
                onChange={(e) => setAlertTargetValue(e.target.value)}
                className="w-full font-mono text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter target threshold..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAlertModalTicker(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="save-alert-confirm-btn"
                onClick={handleSaveAlert}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                {lang === 'my' ? 'Alert သတ်မှတ်မည်' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Active Alerts Modal */}
      {isManageAlertsOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsManageAlertsOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'my' ? 'Alerts အားလုံး စီမံခန့်ခွဲမှု' : 'Manage Custom Alerts'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {alerts.length} alerts configured • {activeAlertCount} active
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsManageAlertsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert List */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {alerts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <BellOff className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <span>No alerts created yet. Click the bell icon on any ticker to set an alert.</span>
                </div>
              ) : (
                alerts.map((al) => (
                  <div
                    key={al.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      al.triggered
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                        : 'bg-white dark:bg-slate-800 border-amber-500/30 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {al.symbol}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            al.type === 'PRICE_ABOVE'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : al.type === 'PRICE_BELOW'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-indigo-500/10 text-indigo-500'
                          }`}
                        >
                          {al.type === 'PRICE_ABOVE'
                            ? `≥ $${al.targetValue}`
                            : al.type === 'PRICE_BELOW'
                            ? `≤ $${al.targetValue}`
                            : `Vol ≥ ${al.targetValue}%`}
                        </span>

                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            al.triggered
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {al.triggered ? 'TRIGGERED' : 'ACTIVE'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Set when price was ${al.initialPrice >= 1 ? al.initialPrice.toFixed(2) : al.initialPrice.toFixed(4)} • {new Date(al.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(al.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {alerts.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <button
                  onClick={() => setAlerts([])}
                  className="text-rose-500 hover:underline cursor-pointer"
                >
                  Clear All Alerts
                </button>
                <button
                  onClick={() => setIsManageAlertsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FULL DUAL-TRACK COMPARISON MODAL (ငါ့စည်းမျဉ်း VS မင်းရွေးချယ်မှု ဘေးချင်းယှဉ်) ── */}
      {compareModalTicker && (() => {
        const riskData = getTickerDualRisk(compareModalTicker);
        const isGainer = compareModalTicker.change24h >= 0;

        return (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={() => setCompareModalTicker(null)}
          >
            <div
              className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center font-black">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white font-sans">
                        {compareModalTicker.symbol} USDT
                      </h3>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        ${compareModalTicker.lastPrice >= 1 ? compareModalTicker.lastPrice.toFixed(2) : compareModalTicker.lastPrice.toFixed(4)}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isGainer ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isGainer ? '+' : ''}{compareModalTicker.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-xs text-amber-400 font-sans">
                      {lang === 'my'
                        ? 'Futures Sizing: ငါ့စည်းမျဉ်း VS မင်းရွေးချယ်မှု စစ်ဆေးခြင်း'
                        : 'Dual-Track Risk & Sizing Comparison'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCompareModalTicker(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wallet Balance Adjuster & Volatility Info */}
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400 font-sans">{lang === 'my' ? 'Wallet Balance:' : 'Wallet:'}</span>
                  <span className="font-mono font-bold text-white">${effectiveWallet.toLocaleString()}</span>
                  <div className="flex gap-1 ml-1">
                    {[1000, 2000, 5000].map((b) => (
                      <button
                        key={b}
                        onClick={() => handleWalletChange(b)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${
                          effectiveWallet === b
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ${b >= 1000 ? `${b / 1000}k` : b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-sans">
                  <span>ATR Volatility:</span>
                  <span className="font-mono font-bold text-amber-400">{riskData.estAtr.toFixed(1)}%</span>
                  <span>• Funding:</span>
                  <span className="font-mono font-bold text-slate-300">{compareModalTicker.fundingRate.toFixed(4)}%</span>
                </div>
              </div>

              {/* Modal Body: Side-by-Side Comparison */}
              <div className="p-4 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Track 1: ငါ့စည်းမျဉ်း (User Rules) */}
                  <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-3.5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <h4 className="text-xs font-black text-amber-400 uppercase">
                          {lang === 'my' ? '👤 ငါ့စည်းမျဉ်း (My Rules)' : '👤 My Rules (Custom)'}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {userMarginPct}% Margin • {userLeverage}x
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-sans">Margin:</span>
                        <div className="text-sm font-black text-white">${riskData.userMargin}</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-sans">Position Notional:</span>
                        <div className="text-sm font-black text-amber-400">${riskData.dual.user.notional}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-sans">SL Loss (-2%):</span>
                        <span className="text-rose-400 font-bold">
                          -${riskData.dual.user.dollarLoss.toFixed(2)} (-{riskData.dual.user.accountLossPct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-sans">TP Gain (+10%):</span>
                        <span className="text-emerald-400 font-bold">
                          +${riskData.dual.user.dollarProfit.toFixed(2)} (+{riskData.dual.user.accountGainPct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Risk / Reward:</span>
                        <span className="text-white font-bold">1 : {riskData.dual.user.riskReward.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-sans">50% DD Cushion:</span>
                        <span className="text-amber-400 font-bold">{riskData.dual.user.consecutiveLossesTo50Pct} Trades</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (onTradeInDemo) {
                            onTradeInDemo(compareModalTicker.symbol, 'LONG', riskData.userMargin, userLeverage);
                          }
                          setCompareModalTicker(null);
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                        <span>LONG (${riskData.userMargin} • {userLeverage}x)</span>
                      </button>
                      <button
                        onClick={() => {
                          if (onTradeInDemo) {
                            onTradeInDemo(compareModalTicker.symbol, 'SHORT', riskData.userMargin, userLeverage);
                          }
                          setCompareModalTicker(null);
                        }}
                        className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                        <span>SHORT (${riskData.userMargin} • {userLeverage}x)</span>
                      </button>
                    </div>
                  </div>

                  {/* Track 2: မင်းရွေးချယ်မှု (Pro Technical AI) */}
                  <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3.5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <h4 className="text-xs font-black text-emerald-400 uppercase">
                          {lang === 'my' ? '🤖 မင်းရွေးချယ်မှု (Pro Technical)' : '🤖 System Recommendation'}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        1.5% Safe Margin • ATR Immune
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-sans">Safe Margin:</span>
                        <div className="text-sm font-black text-emerald-400">${riskData.dual.technical.recommendedMargin}</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-sans">Safe Leverage:</span>
                        <div className="text-sm font-black text-emerald-400">{riskData.dual.technical.recommendedLeverage}x</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-sans">SL Loss (Preserve):</span>
                        <span className="text-rose-400 font-bold">
                          -${riskData.dual.technical.recommendedDollarLoss.toFixed(2)} (-{riskData.dual.technical.recommendedAccountLossPct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-sans">TP Gain (+10%):</span>
                        <span className="text-emerald-400 font-bold">
                          +${riskData.dual.technical.recommendedDollarProfit.toFixed(2)} (+{riskData.dual.technical.recommendedAccountGainPct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Risk / Reward:</span>
                        <span className="text-white font-bold">1 : {riskData.dual.technical.riskReward.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-emerald-400/90 font-sans line-clamp-1">
                        {lang === 'my' ? riskData.dual.technical.leverageLogicMy : riskData.dual.technical.leverageLogic}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (onTradeInDemo) {
                            onTradeInDemo(
                              compareModalTicker.symbol,
                              'LONG',
                              riskData.dual.technical.recommendedMargin,
                              riskData.dual.technical.recommendedLeverage
                            );
                          }
                          setCompareModalTicker(null);
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                        <span>LONG (${riskData.dual.technical.recommendedMargin} • {riskData.dual.technical.recommendedLeverage}x)</span>
                      </button>
                      <button
                        onClick={() => {
                          if (onTradeInDemo) {
                            onTradeInDemo(
                              compareModalTicker.symbol,
                              'SHORT',
                              riskData.dual.technical.recommendedMargin,
                              riskData.dual.technical.recommendedLeverage
                            );
                          }
                          setCompareModalTicker(null);
                        }}
                        className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                        <span>SHORT (${riskData.dual.technical.recommendedMargin} • {riskData.dual.technical.recommendedLeverage}x)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {onGenerateTradeCard && (
                    <button
                      onClick={() => {
                        onGenerateTradeCard(compareModalTicker);
                        setCompareModalTicker(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'my' ? 'Trade Card ထုတ်မည်' : 'Generate Trade Card'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onSelectTicker(compareModalTicker);
                      setCompareModalTicker(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>{lang === 'my' ? '4H/1H/15M စစ်ဆေးမည်' : 'Inspect Details'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setCompareModalTicker(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};
