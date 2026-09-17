import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Zap,
  SlidersHorizontal,
  Flame,
  Rocket,
  Gauge,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CmcCoinItem, LiveTickerItem, CoinOpportunity, LiveFearAndGreedData } from '../../types';
import { INITIAL_CMC_TOP_COINS, INITIAL_CMC_GLOBAL_METRICS } from '../../data/cmcRankingsData';

interface CmcCryptocurrenciesTableProps {
  lang: 'my' | 'en';
  tickers?: LiveTickerItem[];
  fearAndGreed?: LiveFearAndGreedData | null;
  coins?: CoinOpportunity[];
  onSelectCoin?: (coin: CoinOpportunity) => void;
  onTradeInDemo?: (symbol: string, side: 'LONG' | 'SHORT') => void;
}

type SortField = 'rank' | 'name' | 'price' | 'change1h' | 'change24h' | 'change7d' | 'marketCap' | 'volume24hUsd';
type SortOrder = 'asc' | 'desc';
type Currency = 'USD' | 'MMK' | 'EUR';

export const CmcCryptocurrenciesTable: React.FC<CmcCryptocurrenciesTableProps> = ({
  lang,
  tickers = [],
  fearAndGreed,
  coins = [],
  onSelectCoin,
  onTradeInDemo,
}) => {
  const isMy = lang === 'my';

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTC', 'ETH', 'SOL', 'SUI']));
  const [marketCapFilter, setMarketCapFilter] = useState<'ALL' | 'LARGE' | 'MID' | 'SMALL'>('ALL');

  // Conversion rates (USD -> MMK ~ 4500, USD -> EUR ~ 0.92)
  const currencyRates: Record<Currency, { symbol: string; rate: number }> = {
    USD: { symbol: '$', rate: 1.0 },
    MMK: { symbol: 'Ks ', rate: 4500 },
    EUR: { symbol: '€', rate: 0.92 },
  };

  const currentRate = currencyRates[currency];

  const formatPrice = (usdPrice: number): string => {
    const converted = usdPrice * currentRate.rate;
    const sym = currentRate.symbol;

    if (currency === 'MMK') {
      if (converted >= 1e9) return `${sym}${(converted / 1e9).toFixed(2)}B`;
      if (converted >= 1e6) return `${sym}${(converted / 1e6).toFixed(2)}M`;
      if (converted >= 1e3) return `${sym}${Math.round(converted).toLocaleString('en-US')}`;
      return `${sym}${converted.toFixed(2)}`;
    }

    if (converted >= 1000) {
      return `${sym}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (converted >= 1) {
      return `${sym}${converted.toFixed(converted < 10 ? 3 : 2)}`;
    } else if (converted >= 0.001) {
      return `${sym}${converted.toFixed(4)}`;
    } else {
      return `${sym}${converted.toFixed(7)}`;
    }
  };

  const formatLargeUsd = (usdAmount: number): string => {
    const converted = usdAmount * currentRate.rate;
    const sym = currentRate.symbol;

    if (currency === 'MMK') {
      if (converted >= 1e12) return `${sym}${(converted / 1e12).toFixed(2)}T`;
      if (converted >= 1e9) return `${sym}${(converted / 1e9).toFixed(2)}B`;
      if (converted >= 1e6) return `${sym}${(converted / 1e6).toFixed(2)}M`;
      return `${sym}${Math.round(converted).toLocaleString('en-US')}`;
    }

    if (converted >= 1e12) return `${sym}${(converted / 1e12).toFixed(2)}T`;
    if (converted >= 1e9) return `${sym}${(converted / 1e9).toFixed(2)}B`;
    if (converted >= 1e6) return `${sym}${(converted / 1e6).toFixed(2)}M`;
    return `${sym}${converted.toLocaleString('en-US')}`;
  };

  // Synchronize base coin items with live tickers from Binance & Gate.io
  const mergedCoins = useMemo<CmcCoinItem[]>(() => {
    const tickerMap = new Map<string, LiveTickerItem>();
    for (const t of tickers) {
      tickerMap.set(t.symbol.toUpperCase(), t);
      tickerMap.set(`${t.symbol.toUpperCase()}USDT`, t);
    }

    return INITIAL_CMC_TOP_COINS.map((item) => {
      const live = tickerMap.get(item.symbol.toUpperCase()) || tickerMap.get(`${item.symbol.toUpperCase()}USDT`);
      if (!live || live.lastPrice <= 0) {
        return item;
      }

      // Update price, 24h change, and volume from live feed
      const newPrice = live.lastPrice;
      const newChange24h = live.change24h;
      const newVolume = live.volume24hUsd > 0 ? live.volume24hUsd : item.volume24hUsd;
      const newMarketCap = newPrice * item.circulatingSupply;

      // Dynamically tweak 7d sparkline last point to match live price
      const updatedSparkline = [...item.sparkline7d];
      if (updatedSparkline.length > 0) {
        updatedSparkline[updatedSparkline.length - 1] = newPrice;
      }

      return {
        ...item,
        price: newPrice,
        change24h: newChange24h,
        marketCap: newMarketCap,
        volume24hUsd: newVolume,
        volume24hQuantity: newPrice > 0 ? Math.round(newVolume / newPrice) : item.volume24hQuantity,
        sparkline7d: updatedSparkline,
      };
    });
  }, [tickers]);

  // Categories list
  const categories = [
    { id: 'All', labelEn: 'Cryptocurrencies', labelMy: 'အားလုံး' },
    { id: 'Layer 1', labelEn: 'Layer 1', labelMy: 'Layer 1' },
    { id: 'Layer 2', labelEn: 'Layer 2', labelMy: 'Layer 2' },
    { id: 'DeFi', labelEn: 'DeFi', labelMy: 'DeFi' },
    { id: 'Meme', labelEn: 'Meme', labelMy: 'Meme အကြွေစေ့များ' },
    { id: 'AI & Big Data', labelEn: 'AI & Big Data', labelMy: 'AI နည်းပညာ' },
    { id: 'Solana Ecosystem', labelEn: 'Solana Ecosystem', labelMy: 'Solana ဂေဟစနစ်' },
    { id: 'RWA', labelEn: 'Real World Assets (RWA)', labelMy: 'RWA ပိုင်ဆိုင်မှု' },
  ];

  // Highlights metrics
  const highlights = useMemo(() => {
    const sortedBy24h = [...mergedCoins].sort((a, b) => b.change24h - a.change24h);
    const topGainers = sortedBy24h.slice(0, 3);
    const trending = [
      mergedCoins.find((c) => c.symbol === 'SUI') || mergedCoins[11],
      mergedCoins.find((c) => c.symbol === 'PEPE') || mergedCoins[16],
      mergedCoins.find((c) => c.symbol === 'SOL') || mergedCoins[4],
    ].filter(Boolean);
    const mostVisited = [
      mergedCoins[0], // BTC
      mergedCoins[1], // ETH
      mergedCoins[4], // SOL
    ].filter(Boolean);

    return { topGainers, trending, mostVisited };
  }, [mergedCoins]);

  // Toggle favorite
  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  // Filter and sort items
  const filteredAndSortedCoins = useMemo(() => {
    let result = mergedCoins.filter((coin) => {
      // Category filter
      if (selectedCategory !== 'All' && coin.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = coin.name.toLowerCase().includes(q);
        const matchesSymbol = coin.symbol.toLowerCase().includes(q);
        if (!matchesName && !matchesSymbol) return false;
      }

      // Market Cap filter
      if (marketCapFilter === 'LARGE' && coin.marketCap < 10000000000) return false;
      if (marketCapFilter === 'MID' && (coin.marketCap >= 10000000000 || coin.marketCap < 1000000000)) return false;
      if (marketCapFilter === 'SMALL' && coin.marketCap >= 1000000000) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [mergedCoins, selectedCategory, searchQuery, marketCapFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCoins.length / rowsPerPage) || 1;
  const paginatedCoins = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedCoins.slice(start, start + rowsPerPage);
  }, [filteredAndSortedCoins, currentPage, rowsPerPage]);

  // Handle coin selection modal
  const handleCoinClick = (coin: CmcCoinItem) => {
    const match = coins.find((c) => c.symbol.toUpperCase() === coin.symbol.toUpperCase());
    if (match && onSelectCoin) {
      onSelectCoin(match);
    }
  };

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
      {/* 1. CoinMarketCap Highlights Cards Bar (🔥 Trending, 🚀 Top Gainers, 💎 Fear & Greed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* CARD 1: Trending Coins */}
        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isMy ? '🔥 လူကြိုက်အများဆုံး (Trending)' : '🔥 Trending'}
              </span>
            </div>
            <span className="text-[10px] text-blue-400 font-mono">24h Live</span>
          </div>
          <div className="space-y-2.5">
            {highlights.trending.map((coin, idx) => (
              <div
                key={coin.symbol}
                onClick={() => handleCoinClick(coin)}
                className="flex items-center justify-between hover:bg-slate-800/40 p-1.5 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-xs w-4">{idx + 1}</span>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
                    style={{ backgroundColor: coin.color || '#3b82f6' }}
                  >
                    {coin.symbol.slice(0, 1)}
                  </div>
                  <span className="text-xs font-bold text-white">{coin.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{coin.symbol}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white font-bold">{formatPrice(coin.price)}</span>
                  <span
                    className={`font-bold text-[11px] ${
                      coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: Top Gainers */}
        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isMy ? '🚀 အတက်ကြမ်းဆုံး (Top Gainers)' : '🚀 Top Gainers'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">High Surge</span>
          </div>
          <div className="space-y-2.5">
            {highlights.topGainers.map((coin, idx) => (
              <div
                key={coin.symbol}
                onClick={() => handleCoinClick(coin)}
                className="flex items-center justify-between hover:bg-slate-800/40 p-1.5 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-xs w-4">{idx + 1}</span>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
                    style={{ backgroundColor: coin.color || '#10b981' }}
                  >
                    {coin.symbol.slice(0, 1)}
                  </div>
                  <span className="text-xs font-bold text-white">{coin.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{coin.symbol}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white font-bold">{formatPrice(coin.price)}</span>
                  <span className="font-bold text-[11px] text-emerald-400">
                    ▲ {coin.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3: Fear & Greed Index */}
        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isMy ? 'Fear & Greed Index' : 'Fear & Greed Index'}
              </span>
            </div>
            <span className="text-[10px] text-blue-400 font-mono">
              {fearAndGreed?.source || 'CoinMarketCap'}
            </span>
          </div>

          <div className="flex items-center justify-around py-1">
            <div className="text-center">
              <div className="text-3xl font-black font-mono text-white">
                {fearAndGreed?.value ?? 62}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                {fearAndGreed?.classification ?? 'Greed'}
              </div>
            </div>

            <div className="text-xs font-mono space-y-1 text-slate-400">
              <div className="flex justify-between gap-4">
                <span>Yesterday:</span>
                <span className="font-bold text-slate-200">{fearAndGreed?.previousClose ?? 63}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Last Week:</span>
                <span className="font-bold text-slate-200">{fearAndGreed?.previousWeek ?? 71}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Status:</span>
                <span className="font-bold text-emerald-400">Bullish Bias</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-800/50">
            Updated continuously with global orderbooks & volatility
          </div>
        </div>
      </div>

      {/* 2. CoinMarketCap Category Tabs (Cryptocurrencies, DeFi, L1, L2, Meme, AI, Solana, RWA) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {isMy ? cat.labelMy : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Currency Selector & Quick Filters */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher (USD / MMK / EUR) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
            {(['USD', 'MMK', 'EUR'] as Currency[]).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-2 py-1 rounded-lg transition font-bold ${
                  currency === curr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Market Cap Size Filter */}
          <select
            value={marketCapFilter}
            onChange={(e) => {
              setMarketCapFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
          >
            <option value="ALL">{isMy ? 'All Market Caps' : 'All Market Caps'}</option>
            <option value="LARGE">{isMy ? 'Mega Cap (> $10B)' : 'Mega Cap (> $10B)'}</option>
            <option value="MID">{isMy ? 'Mid Cap ($1B - $10B)' : 'Mid Cap ($1B - $10B)'}</option>
            <option value="SMALL">{isMy ? 'Small Cap (< $1B)' : 'Small Cap (< $1B)'}</option>
          </select>
        </div>
      </div>

      {/* 3. Search and Table Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131722] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={isMy ? 'အကြွေစေ့ အမည် (သို့) သင်္ကေတ ရှာရန်...' : 'Search coin name or symbol...'}
              className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition font-mono"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isMy ? 'အချိန်နှင့်တပြေးညီ တိုက်ရိုက်ချိတ်ဆက်ထားသည်' : 'Live Orderbooks Connected'}</span>
          </div>
          <span className="hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <span>Show:</span>
            {[20, 50, 100].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setRowsPerPage(size);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded-lg ${
                  rowsPerPage === size ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Complete CoinMarketCap Cryptocurrency Table */}
      <div className="rounded-2xl bg-[#131722] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            {/* Table Header */}
            <thead className="bg-[#0D1117] text-slate-400 border-b border-slate-800 uppercase text-[11px] select-none sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 w-10 text-center">⭐</th>
                <th
                  onClick={() => handleSort('rank')}
                  className="py-3 px-2 w-12 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    {sortField === 'rank' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>{isMy ? 'အမည် (Name)' : 'Name'}</span>
                    {sortField === 'name' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition min-w-[110px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{isMy ? 'ပေါက်စျေး (Price)' : 'Price'}</span>
                    {sortField === 'price' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('change1h')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition w-20"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>1h %</span>
                    {sortField === 'change1h' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('change24h')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition w-24"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>24h %</span>
                    {sortField === 'change24h' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('change7d')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition w-24"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>7d %</span>
                    {sortField === 'change7d' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('marketCap')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition min-w-[130px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Market Cap</span>
                    {sortField === 'marketCap' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('volume24hUsd')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition min-w-[150px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume(24h)</span>
                    {sortField === 'volume24hUsd' && (
                      <span className="text-blue-400">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-3 text-right min-w-[160px]">
                  <span>Circulating Supply</span>
                </th>
                <th className="py-3 px-3 text-center min-w-[140px]">
                  <span>Last 7 Days</span>
                </th>
                <th className="py-3 px-3 text-center w-24">
                  <span>Action</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60">
              {paginatedCoins.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    {isMy ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော ဒေတာ မတွေ့ရှိပါ' : 'No cryptocurrencies found matching criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedCoins.map((coin) => {
                  const isFav = favorites.has(coin.symbol);
                  const isPositive1h = coin.change1h >= 0;
                  const isPositive24h = coin.change24h >= 0;
                  const isPositive7d = coin.change7d >= 0;

                  // Supply progress percentage
                  const supplyPercent = coin.maxSupply
                    ? Math.min(100, Math.round((coin.circulatingSupply / coin.maxSupply) * 100))
                    : null;

                  // SVG Sparkline path
                  const sparklinePoints = coin.sparkline7d;
                  const minSpark = Math.min(...sparklinePoints);
                  const maxSpark = Math.max(...sparklinePoints);
                  const range = maxSpark - minSpark || 1;
                  const sparkWidth = 120;
                  const sparkHeight = 32;

                  const pathData = sparklinePoints
                    .map((val, idx) => {
                      const x = (idx / (sparklinePoints.length - 1)) * sparkWidth;
                      const y = sparkHeight - ((val - minSpark) / range) * (sparkHeight - 6) - 3;
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ');

                  return (
                    <tr
                      key={coin.symbol}
                      className="hover:bg-slate-800/40 transition group border-b border-slate-800/40"
                    >
                      {/* Favorite Star */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(coin.symbol);
                          }}
                          className="text-slate-400 hover:text-amber-400 transition"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Rank */}
                      <td className="py-3.5 px-2 text-slate-400 font-bold">
                        {coin.rank}
                      </td>

                      {/* Name + Logo + Symbol + Badge */}
                      <td
                        onClick={() => handleCoinClick(coin)}
                        className="py-3.5 px-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                            style={{ backgroundColor: coin.color || '#2563eb' }}
                          >
                            {coin.symbol.slice(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white group-hover:text-blue-400 transition">
                                {coin.name}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">
                                {coin.symbol}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                {coin.category}
                              </span>
                              {coin.badge && (
                                <span className="hidden sm:inline text-blue-400/80">
                                  · {coin.badge}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-right font-bold text-white">
                        {formatPrice(coin.price)}
                      </td>

                      {/* 1h % */}
                      <td
                        className={`py-3.5 px-3 text-right font-bold ${
                          isPositive1h ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive1h ? '▲' : '▼'} {Math.abs(coin.change1h).toFixed(2)}%
                      </td>

                      {/* 24h % */}
                      <td
                        className={`py-3.5 px-3 text-right font-bold ${
                          isPositive24h ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive24h ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                      </td>

                      {/* 7d % */}
                      <td
                        className={`py-3.5 px-3 text-right font-bold ${
                          isPositive7d ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive7d ? '▲' : '▼'} {Math.abs(coin.change7d).toFixed(2)}%
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-3 text-right font-bold text-slate-200">
                        {formatLargeUsd(coin.marketCap)}
                      </td>

                      {/* Volume 24h */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-slate-200">
                          {formatLargeUsd(coin.volume24hUsd)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {coin.volume24hQuantity >= 1e9
                            ? `${(coin.volume24hQuantity / 1e9).toFixed(2)}B`
                            : coin.volume24hQuantity >= 1e6
                            ? `${(coin.volume24hQuantity / 1e6).toFixed(2)}M`
                            : coin.volume24hQuantity.toLocaleString('en-US')}{' '}
                          {coin.symbol}
                        </div>
                      </td>

                      {/* Circulating Supply */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-slate-200">
                          {coin.circulatingSupply >= 1e9
                            ? `${(coin.circulatingSupply / 1e9).toFixed(2)}B`
                            : coin.circulatingSupply >= 1e6
                            ? `${(coin.circulatingSupply / 1e6).toFixed(2)}M`
                            : coin.circulatingSupply.toLocaleString('en-US')}{' '}
                          {coin.supplySymbol}
                        </div>
                        {supplyPercent !== null && (
                          <div className="flex items-center justify-end gap-1.5 mt-1">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${supplyPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] text-slate-400">{supplyPercent}%</span>
                          </div>
                        )}
                      </td>

                      {/* Last 7 Days Sparkline */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="w-28 h-8 mx-auto flex items-center justify-center">
                          <svg className="w-full h-full" viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}>
                            <path
                              d={pathData}
                              fill="none"
                              stroke={isPositive7d ? '#10b981' : '#f43f5e'}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </td>

                      {/* Action Trade Button */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onTradeInDemo && onTradeInDemo(coin.symbol, 'LONG')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Trade Long on Futures"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Trade</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-[#0D1117] border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="text-slate-400">
            {isMy ? 'ပြသထားသည့် အရေအတွက်' : 'Showing'}{' '}
            <span className="font-bold text-white">
              {(currentPage - 1) * rowsPerPage + 1} -{' '}
              {Math.min(currentPage * rowsPerPage, filteredAndSortedCoins.length)}
            </span>{' '}
            of <span className="font-bold text-white">{filteredAndSortedCoins.length}</span>{' '}
            cryptocurrencies
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 px-2 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
