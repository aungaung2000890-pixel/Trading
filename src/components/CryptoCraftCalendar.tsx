import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  Zap,
  DollarSign,
  Activity,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CryptoCraftCalendarEvent,
  CryptoCraftImpact,
  CryptoCraftAsset,
  AppNavView,
} from '../types';
import { fetchCryptoCraftCalendar } from '../services/marketApi';

interface CryptoCraftCalendarProps {
  lang: 'my' | 'en';
  onNavigateView?: (view: AppNavView) => void;
  onSelectCoin?: (symbol: string) => void;
  onOpenTradeModal?: (symbol: string) => void;
  onAskAI?: (prompt: string) => void;
  refreshTrigger?: number;
}

export const CryptoCraftCalendar: React.FC<CryptoCraftCalendarProps> = ({
  lang,
  onNavigateView,
  onSelectCoin,
  onOpenTradeModal,
  onAskAI,
  refreshTrigger = 0,
}) => {
  const [events, setEvents] = useState<CryptoCraftCalendarEvent[]>([]);
  const [nextHighEvent, setNextHighEvent] = useState<CryptoCraftCalendarEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Filters
  const [selectedImpact, setSelectedImpact] = useState<CryptoCraftImpact | 'ALL'>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<CryptoCraftAsset>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Countdown timer calculation for sticky banner
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isPast: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  // Load calendar data
  const loadCalendarData = async (isManualForce = false) => {
    if (isManualForce) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetchCryptoCraftCalendar(isManualForce);
      if (response && Array.isArray(response.data)) {
        setEvents(response.data);
        setNextHighEvent(response.nextHighImpactEvent || null);
        setLastUpdated(Date.now());
        setSecondsAgo(0);
      }
    } catch (err) {
      console.warn('Failed to load CryptoCraft calendar:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCalendarData(false);

    // Auto-refresh calendar data every 60 seconds
    const interval = setInterval(() => {
      loadCalendarData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Respond to global app refresh button click
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadCalendarData(true);
    }
  }, [refreshTrigger]);

  // Update relative time seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Update live countdown to next high-impact release
  useEffect(() => {
    if (!nextHighEvent) return;

    const updateCountdown = () => {
      const diff = nextHighEvent.timestamp - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ hours, minutes, seconds, isPast: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextHighEvent]);

  // Filter events
  const filteredEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return events.filter((evt) => {
      // Impact Filter
      if (selectedImpact !== 'ALL' && evt.impact !== selectedImpact) {
        return false;
      }

      // Asset Filter
      if (selectedAsset !== 'ALL') {
        if (selectedAsset === 'USD' && evt.currency !== 'USD') return false;
        if (selectedAsset === 'BTC' && evt.currency !== 'BTC') return false;
        if (selectedAsset === 'ETH' && evt.currency !== 'ETH') return false;
        if (selectedAsset === 'SOL' && evt.currency !== 'SOL') return false;
        if (selectedAsset === 'ALTS' && ['USD', 'BTC'].includes(evt.currency)) return false;
      }

      // Date Range Filter
      if (selectedDateRange === 'today' && evt.date !== todayStr) return false;
      if (selectedDateRange === 'tomorrow' && evt.date !== tomorrowStr) return false;
      if (selectedDateRange === 'this_week') {
        const evtTime = new Date(evt.date).getTime();
        const now = Date.now();
        if (evtTime < now - 86400000 || evtTime > now + 4 * 86400000) return false;
      }
      if (selectedDateRange === 'next_week') {
        const evtTime = new Date(evt.date).getTime();
        const now = Date.now();
        if (evtTime <= now + 4 * 86400000) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchTitleMy = evt.titleMy.toLowerCase().includes(q);
        const matchCur = evt.currency.toLowerCase().includes(q);
        const matchCat = evt.category.toLowerCase().includes(q);
        if (!matchTitle && !matchTitleMy && !matchCur && !matchCat) return false;
      }

      return true;
    });
  }, [events, selectedImpact, selectedAsset, selectedDateRange, searchQuery]);

  // Group filtered events by date
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: CryptoCraftCalendarEvent[] } = {};
    for (const evt of filteredEvents) {
      if (!groups[evt.date]) {
        groups[evt.date] = [];
      }
      groups[evt.date].push(evt);
    }
    return groups;
  }, [filteredEvents]);

  const getImpactBadge = (impact: CryptoCraftImpact) => {
    switch (impact) {
      case 'high':
        return {
          color: 'bg-red-500 text-white',
          border: 'border-red-500/40',
          bgLight: 'bg-red-500/10 text-red-400',
          label: lang === 'my' ? 'ပြင်းထန် (High)' : 'High Impact',
          iconBg: 'bg-red-500',
        };
      case 'medium':
        return {
          color: 'bg-amber-500 text-white',
          border: 'border-amber-500/40',
          bgLight: 'bg-amber-500/10 text-amber-400',
          label: lang === 'my' ? 'အလယ်အလတ် (Medium)' : 'Medium Impact',
          iconBg: 'bg-amber-500',
        };
      case 'low':
        return {
          color: 'bg-yellow-400 text-neutral-900',
          border: 'border-yellow-400/40',
          bgLight: 'bg-yellow-500/10 text-yellow-400',
          label: lang === 'my' ? 'အနည်းငယ် (Low)' : 'Low Impact',
          iconBg: 'bg-yellow-400',
        };
      case 'non_economic':
      default:
        return {
          color: 'bg-neutral-600 text-white',
          border: 'border-neutral-600/40',
          bgLight: 'bg-neutral-800 text-neutral-300',
          label: lang === 'my' ? 'နည်းပညာ/ကွန်ရက်' : 'Protocol Event',
          iconBg: 'bg-neutral-500',
        };
    }
  };

  const getCurrencyIcon = (cur: string) => {
    switch (cur.toUpperCase()) {
      case 'USD':
        return <span className="text-base mr-1">🇺🇸</span>;
      case 'BTC':
        return <span className="text-amber-400 font-bold mr-1 text-sm">₿</span>;
      case 'ETH':
        return <span className="text-blue-400 font-bold mr-1 text-sm">Ξ</span>;
      case 'SOL':
        return <span className="text-purple-400 font-bold mr-1 text-sm">☀️</span>;
      default:
        return <span className="text-emerald-400 font-bold mr-1 text-sm">🪙</span>;
    }
  };

  const formatDateHeader = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (dateStr === todayStr) {
      return (
        <span className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">{lang === 'my' ? 'ယနေ့ (TODAY)' : 'TODAY'}</span>
          <span className="text-neutral-400 font-normal">| {dayName}, {formatted}</span>
        </span>
      );
    }
    if (dateStr === tomorrowStr) {
      return (
        <span className="flex items-center gap-2">
          <span className="text-blue-400 font-bold">{lang === 'my' ? 'မနက်ဖြန် (TOMORROW)' : 'TOMORROW'}</span>
          <span className="text-neutral-400 font-normal">| {dayName}, {formatted}</span>
        </span>
      );
    }
    return `${dayName}, ${formatted}`;
  };

  return (
    <div id="cryptocraft-calendar-container" className="w-full space-y-4">
      {/* 1. TOP HEADER & LIVE REAL-TIME CONTROLS */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-lg backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    CryptoCraft Economic Calendar
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    LIVE 1:1 SYNC
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 leading-relaxed">
                  {lang === 'my'
                    ? 'CryptoCraft စတိုင် မက်ခရို စီးပွားရေးနှင့် Crypto တိုကင် သော့ဖွင့်မှု အပြည့်အစုံ (မြန်မာစံတော်ချိန် နှင့် Wall Street EDT)'
                    : 'Real-time Macroeconomic & Crypto Catalyst Schedule (Synchronized with Wall Street & MMT)'}
                </p>
              </div>
            </div>
          </div>

          {/* Sync & Refresh Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-neutral-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-emerald-400 font-medium">
                  {secondsAgo <= 2 ? 'Just updated' : `Updated ${secondsAgo}s ago`}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500">MMT (UTC+6:30) & EDT (UTC-4)</div>
            </div>

            <button
              id="refresh-calendar-btn"
              onClick={() => loadCalendarData(true)}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                isRefreshing
                  ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRefreshing ? (lang === 'my' ? 'ဒေတာ ဆွဲယူနေသည်...' : 'Refreshing...') : (lang === 'my' ? 'တိုက်ရိုက် Refresh' : 'Live Refresh')}</span>
            </button>
          </div>
        </div>

        {/* 2. STICKY NEXT HIGH-IMPACT EVENT COUNTDOWN BANNER */}
        {nextHighEvent && (
          <div className="mt-4 p-3.5 rounded-lg bg-gradient-to-r from-red-950/40 via-neutral-900 to-red-950/30 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Flame className="w-4 h-4 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white tracking-wide uppercase">
                    {lang === 'my' ? 'နောက်ထပ် အကြီးစားသတင်း' : 'NEXT HIGH IMPACT'}
                  </span>
                  <span className="text-xs font-medium text-red-300 flex items-center gap-1">
                    {getCurrencyIcon(nextHighEvent.currency)}
                    {nextHighEvent.currency}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {nextHighEvent.time}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                  {lang === 'my' ? nextHighEvent.titleMy : nextHighEvent.title}
                </h2>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              {!timeLeft.isPast ? (
                <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm bg-neutral-950/80 px-3 py-1.5 rounded-md border border-red-500/30">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-neutral-400">{lang === 'my' ? 'ထွက်ရန်:' : 'Release in:'}</span>
                  <span className="text-red-400 font-black">
                    {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-medium border border-neutral-700">
                  {lang === 'my' ? 'ယခု ထုတ်ပြန်ပြီး' : 'Just Released'}
                </span>
              )}

              <button
                onClick={() => setExpandedEventId(expandedEventId === nextHighEvent.id ? null : nextHighEvent.id)}
                className="px-2.5 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium border border-red-500/30 transition flex items-center gap-1"
              >
                <span>{lang === 'my' ? 'နည်းဗျူဟာ ကြည့်ရန်' : 'Playbook'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedEventId === nextHighEvent.id ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. CRYPTOCRAFT FILTER TOOLBAR */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 sm:p-4 space-y-3">
        {/* Row 1: Search Bar & Date Range Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'my' ? 'သတင်း၊ အတိုးနှုန်း၊ CPI၊ Token သော့ဖွင့်မှု ရှာဖွေပါ...' : 'Search CPI, Fed rate, token unlock, upgrade...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950/70 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs px-1"
              >
                ×
              </button>
            )}
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', labelEn: 'All Days', labelMy: 'ရက်အားလုံး' },
              { id: 'today', labelEn: 'Today', labelMy: 'ယနေ့' },
              { id: 'tomorrow', labelEn: 'Tomorrow', labelMy: 'မနက်ဖြန်' },
              { id: 'this_week', labelEn: 'This Week', labelMy: 'ဒီအပတ်' },
              { id: 'next_week', labelEn: 'Next Week', labelMy: 'နောက်အပတ်' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDateRange(d.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedDateRange === d.id
                    ? 'bg-neutral-200 text-neutral-900 font-semibold shadow-sm'
                    : 'bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                {lang === 'my' ? d.labelMy : d.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Impact Badges & Currency Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
          {/* Impact Selector (Classic CryptoCraft / ForexFactory squares) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-neutral-400" />
              {lang === 'my' ? 'အကျိုးသက်ရောက်မှု:' : 'Impact:'}
            </span>

            <button
              onClick={() => setSelectedImpact('ALL')}
              className={`px-2 py-1 rounded text-xs transition font-medium ${
                selectedImpact === 'ALL'
                  ? 'bg-neutral-200 text-neutral-900 font-bold'
                  : 'bg-neutral-850 text-neutral-400 hover:text-white'
              }`}
            >
              {lang === 'my' ? 'အားလုံး' : 'All'}
            </button>

            <button
              onClick={() => setSelectedImpact('high')}
              className={`px-2 py-1 rounded text-xs transition flex items-center gap-1.5 ${
                selectedImpact === 'high'
                  ? 'bg-red-500 text-white font-bold ring-1 ring-red-400'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-red-950/40'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span>{lang === 'my' ? 'ပြင်းထန် (High)' : 'High Impact'}</span>
            </button>

            <button
              onClick={() => setSelectedImpact('medium')}
              className={`px-2 py-1 rounded text-xs transition flex items-center gap-1.5 ${
                selectedImpact === 'medium'
                  ? 'bg-amber-500 text-white font-bold ring-1 ring-amber-400'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-amber-950/40'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>{lang === 'my' ? 'အလယ်အလတ်' : 'Medium'}</span>
            </button>

            <button
              onClick={() => setSelectedImpact('low')}
              className={`px-2 py-1 rounded text-xs transition flex items-center gap-1.5 ${
                selectedImpact === 'low'
                  ? 'bg-yellow-400 text-neutral-900 font-bold ring-1 ring-yellow-400'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-yellow-950/40'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400" />
              <span>{lang === 'my' ? 'အနည်းငယ်' : 'Low'}</span>
            </button>

            <button
              onClick={() => setSelectedImpact('non_economic')}
              className={`px-2 py-1 rounded text-xs transition flex items-center gap-1.5 ${
                selectedImpact === 'non_economic'
                  ? 'bg-neutral-600 text-white font-bold ring-1 ring-neutral-400'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-500" />
              <span>{lang === 'my' ? 'ပရိုတိုကော' : 'Protocol'}</span>
            </button>
          </div>

          {/* Currency / Coin Selector */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mr-1">
              {lang === 'my' ? 'ငွေကြေး/Coin:' : 'Asset:'}
            </span>
            {(['ALL', 'USD', 'BTC', 'ETH', 'SOL', 'ALTS'] as CryptoCraftAsset[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setSelectedAsset(cur)}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  selectedAsset === cur
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                    : 'bg-neutral-800/50 text-neutral-400 hover:text-white'
                }`}
              >
                {cur === 'USD' ? '🇺🇸 USD' : cur === 'ALL' ? (lang === 'my' ? 'အားလုံး' : 'ALL') : cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. CALENDAR TABLE LIST */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 bg-neutral-950/70 border-b border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          <div className="col-span-2">{lang === 'my' ? 'အချိန် (MMT / EDT)' : 'Time (MMT / EDT)'}</div>
          <div className="col-span-1">{lang === 'my' ? 'ငွေကြေး' : 'Cur'}</div>
          <div className="col-span-1 text-center">{lang === 'my' ? 'အဆင့်' : 'Impact'}</div>
          <div className="col-span-4">{lang === 'my' ? 'ဖြစ်ရပ် / အစီအစဉ်' : 'Event / Description'}</div>
          <div className="col-span-1 text-right">{lang === 'my' ? 'အမှန်' : 'Actual'}</div>
          <div className="col-span-1 text-right">{lang === 'my' ? 'ခန့်မှန်း' : 'Forecast'}</div>
          <div className="col-span-1 text-right">{lang === 'my' ? 'ယခင်' : 'Previous'}</div>
          <div className="col-span-1 text-center">{lang === 'my' ? 'အသေးစိတ်' : 'Detail'}</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 text-red-500 animate-spin" />
            <p className="text-sm text-neutral-400">
              {lang === 'my' ? 'CryptoCraft ပြက္ခဒိန်အား အချိန်နှင့်တစ်ပြေးညီ ရယူနေပါသည်...' : 'Loading synchronized CryptoCraft economic events...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && Object.keys(groupedEvents).length === 0 && (
          <div className="py-12 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {lang === 'my' ? 'ကိုက်ညီသော ပြက္ခဒိန်အစီအစဉ် မတွေ့ပါ' : 'No Events Found Matching Filters'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
              {lang === 'my'
                ? 'စစ်ထုတ်မှုများကို ရှင်းလင်း၍ ထပ်မံကြည့်ရှုပါ သို့မဟုတ် Refresh ခလုတ်ကို နှိပ်ပါ။'
                : 'Try adjusting your search query, selecting "All Days" or changing the impact level.'}
            </p>
            <button
              onClick={() => {
                setSelectedImpact('ALL');
                setSelectedAsset('ALL');
                setSelectedDateRange('all');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
            >
              {lang === 'my' ? 'စစ်ထုတ်မှုများ အားလုံးရှင်းမည်' : 'Reset All Filters'}
            </button>
          </div>
        )}

        {/* Grouped Rows */}
        {!loading &&
          Object.keys(groupedEvents).map((dateKey) => {
            const dayEvents = groupedEvents[dateKey];
            return (
              <div key={dateKey} className="border-b border-neutral-800/80 last:border-b-0">
                {/* Date Group Banner */}
                <div className="px-4 py-2 bg-neutral-950/90 border-t border-b border-neutral-800/80 text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-red-400" />
                    <span>{formatDateHeader(dateKey)}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Event Items */}
                {dayEvents.map((evt) => {
                  const impactInfo = getImpactBadge(evt.impact);
                  const isExpanded = expandedEventId === evt.id;
                  const isPast = evt.timestamp < Date.now();

                  return (
                    <div
                      key={evt.id}
                      className={`border-b border-neutral-800/40 last:border-b-0 transition-colors ${
                        isExpanded ? 'bg-neutral-800/30' : 'hover:bg-neutral-800/20'
                      }`}
                    >
                      {/* Main Desktop Grid / Mobile Card */}
                      <div
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className="p-3 sm:px-4 sm:py-3 cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                      >
                        {/* Time */}
                        <div className="col-span-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:block" />
                          <div className="min-w-0">
                            <div className="text-xs font-mono font-medium text-white truncate">
                              {evt.time.split('(')[0].trim()}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-400 truncate">
                              {evt.time.includes('(') ? evt.time.split('(')[1].replace(')', '') : 'MMT'}
                            </div>
                          </div>
                        </div>

                        {/* Currency */}
                        <div className="col-span-1 flex items-center">
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-800/70 border border-neutral-700/50 text-xs font-bold text-neutral-200">
                            {getCurrencyIcon(evt.currency)}
                            <span>{evt.currency}</span>
                          </div>
                        </div>

                        {/* Impact Icon */}
                        <div className="col-span-1 flex md:justify-center">
                          <span
                            title={impactInfo.label}
                            className={`w-4 h-4 rounded-sm flex items-center justify-center shadow-sm ${impactInfo.iconBg}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                          </span>
                        </div>

                        {/* Title & Category */}
                        <div className="col-span-4 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-300 transition">
                              {lang === 'my' ? evt.titleMy : evt.title}
                            </span>
                            {evt.impact === 'high' && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                HOT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {lang === 'my' ? evt.title : evt.titleMy}
                          </div>
                        </div>

                        {/* Actual Value */}
                        <div className="col-span-1 flex md:justify-end items-center gap-1 text-xs font-mono font-bold">
                          <span className="md:hidden text-[11px] text-neutral-400 font-normal mr-1">{lang === 'my' ? 'အမှန်:' : 'Actual:'}</span>
                          {evt.actual ? (
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                evt.actualStatus === 'better'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : evt.actualStatus === 'worse'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'text-white'
                              }`}
                            >
                              {evt.actual}
                            </span>
                          ) : (
                            <span className="text-neutral-500 italic text-[11px]">{lang === 'my' ? 'စောင့်ဆိုင်း' : 'Pending'}</span>
                          )}
                        </div>

                        {/* Forecast */}
                        <div className="col-span-1 flex md:justify-end items-center text-xs font-mono text-neutral-300">
                          <span className="md:hidden text-[11px] text-neutral-400 font-normal mr-1">{lang === 'my' ? 'ခန့်မှန်း:' : 'Forecast:'}</span>
                          <span>{evt.forecast || '—'}</span>
                        </div>

                        {/* Previous */}
                        <div className="col-span-1 flex md:justify-end items-center text-xs font-mono text-neutral-400">
                          <span className="md:hidden text-[11px] text-neutral-400 font-normal mr-1">{lang === 'my' ? 'ယခင်:' : 'Previous:'}</span>
                          <span>{evt.previous || '—'}</span>
                        </div>

                        {/* Expand Action */}
                        <div className="col-span-1 flex md:justify-center items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedEventId(isExpanded ? null : evt.id);
                            }}
                            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* EXPANDED CRYPTOCRAFT DETAIL PLAYBOOK DRAWER */}
                      {isExpanded && (
                        <div className="px-4 py-4 sm:px-6 sm:py-5 bg-neutral-950/70 border-t border-neutral-800 space-y-4">
                          {/* Overview & Authority Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                              <span className="text-[11px] text-neutral-400 block mb-0.5">{lang === 'my' ? 'ထုတ်ပြန်သည့် အဖွဲ့အစည်း' : 'Source / Authority'}</span>
                              <span className="font-semibold text-white">{evt.source}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                              <span className="text-[11px] text-neutral-400 block mb-0.5">{lang === 'my' ? 'ထုတ်ပြန်မှု အကြိမ်ရေ' : 'Frequency'}</span>
                              <span className="font-semibold text-neutral-200">{evt.frequency}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                              <span className="text-[11px] text-neutral-400 block mb-0.5">{lang === 'my' ? 'မျှော်မှန်း လှုပ်ခတ်မှုနှုန်း' : 'BTC Volatility Swing'}</span>
                              <span className="font-bold text-red-400">{evt.historicalVolatility.expectedBtcMovePercent}</span>
                            </div>
                          </div>

                          {/* Why Crypto Traders Care */}
                          <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800/80">
                            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-blue-400" />
                              {lang === 'my' ? 'Crypto ကုန်သွယ်သူများ အဘယ်ကြောင့် အထူးဂရုပြုရသနည်း' : 'Why Crypto Traders Care'}
                            </h4>
                            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                              {lang === 'my' ? evt.whyTradersCareMy : evt.whyTradersCare}
                            </p>
                          </div>

                          {/* Actionable Crypto Playbook (Scenarios) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Bullish Case */}
                            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>{lang === 'my' ? 'အဝယ်အားသာမည့် အခြေအနေ (BULLISH PLAY)' : 'Bullish Market Trigger'}</span>
                              </div>
                              <p className="text-xs text-neutral-200 leading-relaxed">
                                {lang === 'my' ? evt.cryptoPlaybook.bullishConditionMy : evt.cryptoPlaybook.bullishCondition}
                              </p>
                            </div>

                            {/* Bearish Case */}
                            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1">
                                <TrendingDown className="w-3.5 h-3.5" />
                                <span>{lang === 'my' ? 'အရောင်းဖိအားဖြစ်မည့် အခြေအနေ (BEARISH RISK)' : 'Bearish Market Trigger'}</span>
                              </div>
                              <p className="text-xs text-neutral-200 leading-relaxed">
                                {lang === 'my' ? evt.cryptoPlaybook.bearishConditionMy : evt.cryptoPlaybook.bearishCondition}
                              </p>
                            </div>
                          </div>

                          {/* Futures Leverage Warning & Recommended Strategy */}
                          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-bold text-amber-300 block">
                                  {lang === 'my' ? 'Futures စည်းကမ်းနှင့် ဗျူဟာ အကြံပြုချက်:' : 'Recommended Futures Risk Strategy:'}
                                </span>
                                <span className="text-xs text-neutral-300">
                                  {lang === 'my' ? evt.cryptoPlaybook.recommendedStrategyMy : evt.cryptoPlaybook.recommendedStrategy}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {onAskAI && (
                                <button
                                  onClick={() =>
                                    onAskAI(
                                      `Analyze upcoming economic event: ${evt.title} (${evt.currency}). How should I position my BTC and crypto portfolio ahead of this release?`
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI Assistant</span>
                                </button>
                              )}

                              {onOpenTradeModal && evt.historicalVolatility.affectedPairs.length > 0 && (
                                <button
                                  onClick={() => {
                                    const pair = evt.historicalVolatility.affectedPairs[0];
                                    const coinSym = pair.split('_')[0];
                                    onOpenTradeModal(coinSym);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>{lang === 'my' ? 'ကုန်သွယ်မှု စနစ်ဖွင့်မည်' : 'Open Trade'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      {/* 5. RISK MANAGEMENT & VOLATILITY WARNING */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="leading-relaxed">
            {lang === 'my'
              ? 'သတိပေးချက်: အနီရောင် ပြင်းထန်အဆင့် (High Impact) သတင်းများ ထွက်ပေါ်ချိန်တွင် Futures Leverage ကို ၁၀ ဆအောက် လျှော့ချ၍ Stop Loss ကို တိကျစွာ အသုံးပြုပါ။'
              : 'Notice: High impact releases cause massive two-way volatility. Keep leverage low (<10x) and maintain strict stop loss execution.'}
          </span>
        </div>
        <div className="shrink-0 text-neutral-500">
          Source: CryptoCraft.com / US BLS / Federal Reserve
        </div>
      </div>
    </div>
  );
};
