import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
  Info,
} from 'lucide-react';
import { AppPriceAlert, LiveTickerItem } from '../types';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AppPriceAlert[];
  onAddAlert: (alert: {
    symbol: string;
    contract?: string;
    type: 'PRICE_ABOVE' | 'PRICE_BELOW';
    targetPrice: number;
    initialPrice: number;
    note?: string;
    soundEnabled?: boolean;
  }) => void;
  onDeleteAlert: (id: string) => void;
  onToggleAlertActive?: (id: string) => void;
  onToggleActive?: (id: string) => void;
  onRearmAlert: (id: string, newTarget?: number) => void;
  onClearHistory: () => void;
  onTestAlertToast: (symbol?: string) => void;
  initialCoinSymbol?: string;
  initialSymbol?: string;
  liveTickers: LiveTickerItem[];
  onSelectCoinForDetail?: (symbol: string) => void;
  lang: 'my' | 'en';
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onDeleteAlert,
  onToggleAlertActive: propToggleAlertActive,
  onToggleActive,
  onRearmAlert,
  onClearHistory,
  onTestAlertToast,
  initialCoinSymbol,
  initialSymbol,
  liveTickers,
  onSelectCoinForDetail,
  lang,
}) => {
  const handleToggleActive = propToggleAlertActive || onToggleActive || (() => {});
  const effectiveInitialSymbol = initialCoinSymbol || initialSymbol;
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'history'>('create');
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialCoinSymbol || 'BTC');
  const [alertType, setAlertType] = useState<'PRICE_ABOVE' | 'PRICE_BELOW'>('PRICE_ABOVE');
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [coinSearch, setCoinSearch] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Update selected symbol when initialCoinSymbol prop changes
  useEffect(() => {
    if (effectiveInitialSymbol) {
      setSelectedSymbol(effectiveInitialSymbol);
      setActiveTab('create');
    }
  }, [effectiveInitialSymbol]);

  // Current ticker for the selected coin
  const currentTicker = useMemo(() => {
    return (
      liveTickers.find(
        (t) =>
          t.symbol.toUpperCase() === selectedSymbol.toUpperCase() ||
          t.contract.toUpperCase().startsWith(selectedSymbol.toUpperCase())
      ) ||
      liveTickers[0] || {
        symbol: selectedSymbol,
        contract: `${selectedSymbol}_USDT`,
        lastPrice: 100,
        change24h: 0,
        volume24hUsd: 0,
        high24h: 105,
        low24h: 95,
        fundingRate: 0,
        feasibility: 'HIGH' as const,
        bias: 'LONG' as const,
      }
    );
  }, [liveTickers, selectedSymbol]);

  // When selected coin changes or modal opens, initialize target price to a smart default (+3% for above, -3% for below)
  useEffect(() => {
    if (currentTicker && currentTicker.lastPrice > 0) {
      const multiplier = alertType === 'PRICE_ABOVE' ? 1.03 : 0.97;
      const calcPrice = currentTicker.lastPrice * multiplier;
      setTargetPriceInput(
        calcPrice >= 1 ? calcPrice.toFixed(2) : calcPrice.toFixed(4)
      );
    }
  }, [selectedSymbol, alertType, currentTicker.lastPrice]);

  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => !a.triggered);
  }, [alerts]);

  const triggeredAlerts = useMemo(() => {
    return alerts.filter((a) => a.triggered);
  }, [alerts]);

  // Filtered coins for coin selector
  const filteredCoins = useMemo(() => {
    if (!coinSearch.trim()) return liveTickers.slice(0, 30);
    const query = coinSearch.toUpperCase();
    return liveTickers.filter(
      (t) => t.symbol.toUpperCase().includes(query) || t.contract.toUpperCase().includes(query)
    );
  }, [liveTickers, coinSearch]);

  const handleApplyPercentage = (pct: number) => {
    if (!currentTicker || currentTicker.lastPrice <= 0) return;
    const calc = currentTicker.lastPrice * (1 + pct / 100);
    setTargetPriceInput(calc >= 1 ? calc.toFixed(2) : calc.toFixed(4));
    setErrorMsg(null);
  };

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetPriceInput);

    if (isNaN(val) || val <= 0) {
      setErrorMsg(
        lang === 'my'
          ? 'ကျေးဇူးပြု၍ မှန်ကန်သော စျေးနှုန်းပစ်မှတ်ကို ရိုက်ထည့်ပါ'
          : 'Please enter a valid positive target price'
      );
      return;
    }

    if (alertType === 'PRICE_ABOVE' && val <= currentTicker.lastPrice) {
      setErrorMsg(
        lang === 'my'
          ? `သတိပြုရန်: အထက်ပစ်မှတ်သည် လက်ရှိစျေး ($${currentTicker.lastPrice}) ထက် ပိုမြင့်ရပါမည်`
          : `Target must be higher than current price ($${currentTicker.lastPrice}) for "Price Above" alert`
      );
      return;
    }

    if (alertType === 'PRICE_BELOW' && val >= currentTicker.lastPrice) {
      setErrorMsg(
        lang === 'my'
          ? `သတိပြုရန်: အောက်ပစ်မှတ်သည် လက်ရှိစျေး ($${currentTicker.lastPrice}) ထက် နိမ့်ရပါမည်`
          : `Target must be lower than current price ($${currentTicker.lastPrice}) for "Price Below" alert`
      );
      return;
    }

    onAddAlert({
      symbol: currentTicker.symbol,
      contract: currentTicker.contract,
      type: alertType,
      targetPrice: val,
      initialPrice: currentTicker.lastPrice,
      note: noteInput.trim() || undefined,
      soundEnabled,
    });

    setErrorMsg(null);
    setSuccessMsg(
      lang === 'my'
        ? `✅ ${currentTicker.symbol} အတွက် $${val} သတိပေးချက် အောင်မြင်စွာ သတ်မှတ်ပြီးပါပြီ`
        : `✅ Alert set for ${currentTicker.symbol} at $${val}`
    );
    setNoteInput('');
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveTab('active');
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div
      id="price-alert-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-alert-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="price-alert-modal-title"
                  className="text-base sm:text-lg font-black text-slate-900 dark:text-white"
                >
                  {lang === 'my' ? 'စျေးနှုန်း သတိပေးချက် (Price Alert)' : 'Live Price Alerts'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'my'
                  ? 'သတ်မှတ်စျေးနှုန်းသို့ ရောက်ရှိပါက Visual Toast နှင့် အသံဖြင့် ချက်ချင်းအသိပေးမည်'
                  : 'Get instant visual toast & audio alerts when targets are reached'}
              </p>
            </div>
          </div>

          <button
            id="close-price-alert-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/30 px-4 pt-2">
          <button
            id="tab-set-alert"
            onClick={() => setActiveTab('create')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'my' ? 'သတိပေးချက် အသစ်' : 'Set New Alert'}</span>
          </button>

          <button
            id="tab-active-alerts"
            onClick={() => setActiveTab('active')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'active'
                ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>{lang === 'my' ? 'လက်ရှိ အသက်ဝင်နေသော' : 'Active Alerts'}</span>
            <span
              className={`text-[11px] font-black px-1.5 py-0.2 rounded-full ${
                activeAlerts.length > 0
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {activeAlerts.length}
            </span>
          </button>

          <button
            id="tab-history-alerts"
            onClick={() => setActiveTab('history')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'my' ? 'ရောက်ရှိပြီး သမိုင်း' : 'History'}</span>
            <span
              className={`text-[11px] font-black px-1.5 py-0.2 rounded-full ${
                triggeredAlerts.length > 0
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {triggeredAlerts.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Create New Alert */}
        {activeTab === 'create' && (
          <form onSubmit={handleSaveAlert} className="p-4 sm:p-5 space-y-4">
            {/* Coin Picker & Quick Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'my' ? 'Coin ရွေးချယ်ရန် (Select Coin):' : 'Select Coin:'}
                </label>
                <span className="text-[11px] text-slate-400">
                  {liveTickers.length} {lang === 'my' ? 'အတွဲများ စစ်ဆေးထားသည်' : 'pairs available'}
                </span>
              </div>

              {/* Popular quick coins pill list */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB', 'SUI', 'PEPE'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      setSelectedSymbol(sym);
                      setCoinSearch('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition shrink-0 cursor-pointer ${
                      selectedSymbol.toUpperCase() === sym
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Searchable input / selector */}
              <div className="relative mt-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={lang === 'my' ? 'အခြား Coin ရှာဖွေပါ (ဥပမာ- SOL, ADA, SUI)...' : 'Search any coin symbol...'}
                  value={coinSearch}
                  onChange={(e) => setCoinSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />

                {/* Dropdown results when searching */}
                {coinSearch.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 p-1">
                    {filteredCoins.map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => {
                          setSelectedSymbol(item.symbol);
                          setCoinSearch('');
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span>{item.symbol}/USDT</span>
                        <span className="font-mono text-slate-400">
                          ${item.lastPrice >= 1 ? item.lastPrice.toFixed(2) : item.lastPrice.toFixed(4)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Coin Live Price Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-500 text-xs">
                  {currentTicker.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {currentTicker.symbol}/USDT
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        currentTicker.change24h >= 0
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {currentTicker.change24h >= 0 ? '+' : ''}
                      {currentTicker.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {lang === 'my' ? 'လက်ရှိ ပေါက်စျေး:' : 'Live Market Price:'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  $
                  {currentTicker.lastPrice >= 1
                    ? currentTicker.lastPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })
                    : currentTicker.lastPrice.toFixed(6)}
                </div>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Live Ticker
                </span>
              </div>
            </div>

            {/* Direction Selection: Above (≥) vs Below (≤) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                {lang === 'my' ? 'သတိပေးမှု အခြေအနေ (Condition):' : 'Alert Condition:'}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlertType('PRICE_ABOVE')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    alertType === 'PRICE_ABOVE'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-xs font-black block">
                      {lang === 'my' ? 'တက်ရောက်ပါက (≥)' : 'Rises To or Above (≥)'}
                    </span>
                    <span className="text-[10px] opacity-80 block">
                      {lang === 'my' ? 'Breakout သို့မဟုတ် TP ပစ်မှတ်' : 'Breakout or Take Profit'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAlertType('PRICE_BELOW')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    alertType === 'PRICE_BELOW'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <ArrowDownRight className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs font-black block">
                      {lang === 'my' ? 'ကျဆင်းပါက (≤)' : 'Drops To or Below (≤)'}
                    </span>
                    <span className="text-[10px] opacity-80 block">
                      {lang === 'my' ? 'Dip Buy သို့မဟုတ် Support ကျိုးခြင်း' : 'Dip entry or Stop alert'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Target Price Input with Quick Percent Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'my' ? 'ပစ်မှတ် စျေးနှုန်း (Target Price USD):' : 'Target Price (USD):'}
                </label>
                <span className="text-[11px] text-slate-400">
                  {alertType === 'PRICE_ABOVE'
                    ? lang === 'my'
                      ? 'လက်ရှိစျေးထက် ပိုမြင့်ရမည်'
                      : 'Must be higher than current'
                    : lang === 'my'
                    ? 'လက်ရှိစျေးထက် ပိုနိမ့်ရမည်'
                    : 'Must be lower than current'}
                </span>
              </div>

              {/* Quick Percent Buttons */}
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">Quick:</span>
                {(alertType === 'PRICE_ABOVE'
                  ? [1, 2, 3, 5, 10, 15]
                  : [-1, -2, -3, -5, -10, -15]
                ).map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleApplyPercentage(pct)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-[11px] font-bold transition shrink-0 cursor-pointer"
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  value={targetPriceInput}
                  onChange={(e) => {
                    setTargetPriceInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Note & Sound Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === 'my' ? 'မှတ်ချက် / အညွှန်း (Optional Note):' : 'Optional Label / Note:'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'my' ? 'ဥပမာ- TP 1 ပစ်မှတ်၊ Key Resistance' : 'e.g., Take Profit 1, Dip Entry'}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {soundEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{lang === 'my' ? 'အသံဖြင့် အသိပေးမည်' : 'Play audio chime'}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Error or Success Alert feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Footer Form Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onTestAlertToast(currentTicker.symbol)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title={lang === 'my' ? 'Visual Toast စမ်းသပ်ကြည့်မည်' : 'Trigger a test notification toast'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'my' ? '🔔 စမ်းသပ်ကြည့်မည် (Test Toast)' : 'Test Alert Toast'}</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
              >
                <Bell className="w-4 h-4" />
                <span>
                  {lang === 'my'
                    ? `${selectedSymbol} အတွက် သတိပေးချက် သတ်မှတ်မည်`
                    : `Set Price Alert for ${selectedSymbol}`}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Active Alerts List */}
        {activeTab === 'active' && (
          <div className="p-4 sm:p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'my' ? 'လက်ရှိ သတိပေးချက် မရှိသေးပါ' : 'No active alerts'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
                  {lang === 'my'
                    ? 'သင်လိုချင်သော Coin အတွက် စျေးနှုန်းပစ်မှတ် သတ်မှတ်ထားနိုင်ပါသည်'
                    : 'Set a target price for any coin and get notified instantly'}
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'my' ? 'သတိပေးချက် အသစ် သတ်မှတ်မည်' : 'Set New Alert'}</span>
                </button>
              </div>
            ) : (
              activeAlerts.map((alert) => {
                const live = liveTickers.find(
                  (t) => t.symbol.toUpperCase() === alert.symbol.toUpperCase()
                );
                const currentPrice = live ? live.lastPrice : alert.initialPrice;
                const isAbove = alert.type === 'PRICE_ABOVE';
                const diffPercent =
                  currentPrice > 0
                    ? ((alert.targetPrice - currentPrice) / currentPrice) * 100
                    : 0;

                return (
                  <div
                    key={alert.id}
                    id={`active-alert-${alert.id}`}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            isAbove
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          {isAbove ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {alert.symbol}
                            </span>
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                                isAbove
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {isAbove ? '≥ Rises To' : '≤ Drops To'}
                            </span>
                            {alert.note && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 truncate max-w-[120px]">
                                {alert.note}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>
                              {lang === 'my' ? 'ပစ်မှတ်:' : 'Target:'}{' '}
                              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                                ${alert.targetPrice >= 1 ? alert.targetPrice.toFixed(2) : alert.targetPrice.toFixed(4)}
                              </strong>
                            </span>
                            <span>
                              {lang === 'my' ? 'လက်ရှိ:' : 'Live:'}{' '}
                              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                                ${currentPrice >= 1 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right actions: View coin & Delete */}
                      <div className="flex items-center gap-1">
                        {onSelectCoinForDetail && (
                          <button
                            onClick={() => {
                              onSelectCoinForDetail(alert.symbol);
                              onClose();
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-500 transition cursor-pointer"
                            title={lang === 'my' ? 'Coin အသေးစိတ် ကြည့်မည်' : 'View coin details'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title={lang === 'my' ? 'ဖျက်မည်' : 'Delete alert'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress to target bar */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {lang === 'my' ? 'ပစ်မှတ်သို့ ရောက်ရန် ကွာဟချက်:' : 'Distance to target:'}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          Math.abs(diffPercent) < 2
                            ? 'text-amber-500 animate-pulse'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {diffPercent > 0 ? `+${diffPercent.toFixed(2)}%` : `${diffPercent.toFixed(2)}%`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: History of Triggered Alerts */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            {triggeredAlerts.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-400">
                <p className="text-xs">
                  {lang === 'my'
                    ? 'သတိပေးချက် ပစ်မှတ်ရောက်ရှိမှု သမိုင်း မရှိသေးပါ'
                    : 'No triggered alert history yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold">
                    {lang === 'my' ? 'ရောက်ရှိခဲ့သော သတိပေးချက်များ' : 'Triggered alerts history'}
                  </span>
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{lang === 'my' ? 'အားလုံး ရှင်းလင်းမည်' : 'Clear History'}</span>
                  </button>
                </div>

                {triggeredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black text-xs shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {alert.symbol}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            TARGET HIT
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Hit: ${alert.triggeredPrice ? alert.triggeredPrice.toFixed(2) : alert.targetPrice.toFixed(2)} (Target: ${alert.targetPrice.toFixed(2)})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onRearmAlert(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title={lang === 'my' ? 'သတိပေးချက် ပြန်ဖွင့်မည်' : 'Re-arm alert'}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{lang === 'my' ? 'ပြန်ဖွင့်' : 'Re-arm'}</span>
                      </button>

                      <button
                        onClick={() => onDeleteAlert(alert.id)}
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Modal Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {lang === 'my'
                ? 'စျေးကွက်ဒေတာ ပြောင်းလဲမှုတိုင်းတွင် စက္ကန့်ပိုင်းအတွင်း တိုက်စစ်ပေးပါသည်'
                : 'Checked continuously against live Binance / Gate.io ticker stream'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
