import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  X,
  Flame,
  Clock,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Radio,
  Layers,
  TrendingUp,
  TrendingDown,
  Globe,
} from 'lucide-react';
import { CURATED_CRYPTO_NEWS, CryptoNewsItem } from '../data/newsData';
import { LiveBreakingNewsItem } from '../types';

interface MarketNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'my' | 'en';
  onSelectCoin?: (symbol: string) => void;
  liveNews?: LiveBreakingNewsItem[];
  onRefreshNews?: () => void;
  isLoadingNews?: boolean;
}

export const MarketNewsModal: React.FC<MarketNewsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectCoin,
  liveNews = [],
  onRefreshNews,
  isLoadingNews = false,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'curated'>(
    liveNews.length > 0 ? 'live' : 'curated'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({
    'news-1': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    CURATED_CRYPTO_NEWS.forEach((n) => {
      allExpanded[n.id] = true;
    });
    liveNews.forEach((n) => {
      allExpanded[n.id] = true;
    });
    setExpandedArticles(allExpanded);
  };

  const collapseAll = () => {
    setExpandedArticles({});
  };

  const filteredCuratedNews = useMemo(() => {
    return CURATED_CRYPTO_NEWS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q) || item.titleMy.includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q) || item.summaryMy.includes(q);
        const matchesStory = item.fullStory.toLowerCase().includes(q) || item.fullStoryMy.includes(q);
        const matchesCoins = item.affectedCoins.some((c) => c.toLowerCase().includes(q));
        return matchesTitle || matchesSummary || matchesStory || matchesCoins;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const filteredLiveNews = useMemo(() => {
    return liveNews.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q) || item.titleMy.includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q) || item.summaryMy.includes(q);
        const matchesCoins = item.affectedCoins.some((c) => c.toLowerCase().includes(q));
        return matchesTitle || matchesSummary || matchesCoins;
      }
      return true;
    });
  }, [liveNews, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {lang === 'my'
                    ? 'Crypto အချိန်နှင့်တပြေးညီ သတင်းနှင့် လေ့လာချက်'
                    : 'Crypto Real-Time Market News Hub'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'my'
                  ? 'ကမ္ဘာလုံးဆိုင်ရာ သတင်းမီဒီယာများ (Cointelegraph / Decrypt) မှ တိုက်ရိုက် သတင်းလတ်လတ်ဆတ်ဆတ်များနှင့် ဗျူဟာမြောက်သုံးသပ်ချက်များ'
                  : 'Live breaking news direct from global crypto feeds (Cointelegraph, Decrypt) with strategic analysis'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshNews && (
              <button
                onClick={onRefreshNews}
                disabled={isLoadingNews}
                className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                title={lang === 'my' ? 'သတင်း အသစ်ပြန်စစ်မည်' : 'Refresh Live News'}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingNews ? 'animate-spin text-amber-500' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Tab Switcher: Live Breaking News vs Curated Deep Analysis */}
        <div className="px-5 sm:px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>{lang === 'my' ? 'လက်ငင်းသတင်းများ (Live Feeds)' : 'Live Breaking News'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-mono">
                {liveNews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('curated')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'curated'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'my' ? 'အတွင်းကျကျ သုံးသပ်ချက် (Deep Analysis)' : 'Curated Deep Analysis'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                {CURATED_CRYPTO_NEWS.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition"
            >
              {lang === 'my' ? 'အားလုံးချဲ့ရန်' : 'Expand All'}
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition"
            >
              {lang === 'my' ? 'အားလုံးခေါက်ရန်' : 'Collapse All'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/30 dark:bg-slate-950/40">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'my'
                  ? 'သတင်းများ ရှာဖွေပါ (BTC, CPI, ETF, Solana, Fed, Regulation...)'
                  : 'Search news by keyword, coin, macro topic (BTC, CPI, ETF, Solana, Fed)...'
              }
              className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-5 sm:px-6 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs bg-white dark:bg-slate-900 scrollbar-none">
          {[
            { id: 'all', label: lang === 'my' ? 'သတင်းအားလုံး' : 'All Topics' },
            { id: 'macro', label: 'FOMC & Macro' },
            { id: 'institutional', label: lang === 'my' ? 'ETF & အဖွဲ့အစည်း' : 'ETF & Inflows' },
            { id: 'catalysts', label: lang === 'my' ? 'အဓိက အဖြစ်အပျက်' : 'Catalysts' },
            { id: 'liquidations', label: lang === 'my' ? 'Liquidations' : 'Liquidations' },
            { id: 'regulations', label: lang === 'my' ? 'ဥပဒေ & SEC' : 'Regulations' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* News Feed Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: LIVE BREAKING NEWS FEED */}
          {activeTab === 'live' && (
            <>
              {filteredLiveNews.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Globe className="w-8 h-8 mx-auto text-slate-400 animate-pulse" />
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {lang === 'my'
                      ? 'အချိန်နှင့်တပြေးညီ သတင်းဒေတာများကို ဆာဗာမှ ရယူနေဆဲဖြစ်ပါသည်။'
                      : 'Connecting to real-time crypto news feeds (Cointelegraph / Decrypt)...'}
                  </p>
                  {onRefreshNews && (
                    <button
                      onClick={onRefreshNews}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                    >
                      {lang === 'my' ? 'ပြန်လည်စစ်ဆေးမည်' : 'Fetch Now'}
                    </button>
                  )}
                </div>
              ) : (
                filteredLiveNews.map((news) => {
                  const isExpanded = !!expandedArticles[news.id];

                  return (
                    <article
                      key={news.id}
                      className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/40 transition space-y-3 shadow-xs"
                    >
                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              news.impact === 'BULLISH'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : news.impact === 'BEARISH'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {news.impact === 'BULLISH'
                              ? '🟢 BULLISH (အဝယ်အားသာ)'
                              : news.impact === 'BEARISH'
                              ? '🔴 BEARISH (အရောင်းဖိအား)'
                              : '⚡ VOLATILITY (အတက်အကျကြမ်း)'}
                          </span>

                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-emerald-500 dark:text-emerald-400 font-bold">{news.timeAgo}</span>
                            <span className="text-slate-400 hidden sm:inline">({news.mmtTime})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {news.source}
                          </span>
                          {news.affectedCoins.map((coin) => (
                            <button
                              key={coin}
                              onClick={() => {
                                if (onSelectCoin) {
                                  onSelectCoin(coin);
                                  onClose();
                                }
                              }}
                              className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-mono font-bold transition cursor-pointer"
                            >
                              {coin}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {lang === 'my' ? news.titleMy : news.title}
                        </h3>
                        {lang === 'my' && (
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            EN: {news.title}
                          </p>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{lang === 'my' ? 'သတင်း အနှစ်ချုပ်' : 'Live Summary'}</span>
                        </div>
                        <p>{lang === 'my' ? news.summaryMy : news.summary}</p>
                      </div>

                      {/* Bottom row */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{lang === 'my' ? 'အချိန်နှင့်တပြေးညီ တိုက်ရိုက်သတင်း' : 'Verified live publisher RSS'}</span>
                        </span>

                        {news.link && (
                          <a
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition cursor-pointer"
                          >
                            <span>{lang === 'my' ? 'မူရင်းသတင်းဖတ်ရန်' : 'Source Article'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: CURATED STRATEGY & DEEP ANALYSIS */}
          {activeTab === 'curated' && (
            <>
              {filteredCuratedNews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {lang === 'my'
                    ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော သတင်း မရှိသေးပါ။'
                    : 'No news found matching your search query.'}
                </div>
              ) : (
                filteredCuratedNews.map((news) => {
                  const isExpanded = !!expandedArticles[news.id];

                  return (
                    <article
                      key={news.id}
                      className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/40 transition space-y-3.5 shadow-xs"
                    >
                      {/* Top metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              news.impact === 'BULLISH'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : news.impact === 'BEARISH'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {news.impact === 'BULLISH'
                              ? '🟢 BULLISH (အတက် သတင်း)'
                              : news.impact === 'BEARISH'
                              ? '🔴 BEARISH (အကျ သတင်း)'
                              : '⚡ HIGH VOLATILITY (အတက်အကျကြမ်း)'}
                          </span>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>{news.mmtTime}</span>
                            <span className="text-slate-500 hidden sm:inline">({news.usTime})</span>
                          </div>
                        </div>

                        {/* Source & Coin Tags */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
                            {news.source}
                          </span>
                          {news.affectedCoins.map((coin) => (
                            <button
                              key={coin}
                              onClick={() => {
                                if (onSelectCoin) {
                                  onSelectCoin(coin);
                                  onClose();
                                }
                              }}
                              className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer"
                            >
                              {coin}USDT
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title & Summary */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {lang === 'my' ? news.titleMy : news.title}
                        </h3>

                        {/* Summary Block */}
                        <div className="mt-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{lang === 'my' ? 'သတင်း အနှစ်ချုပ် (Summary)' : 'Executive Summary'}</span>
                          </div>
                          <p>{lang === 'my' ? news.summaryMy : news.summary}</p>
                        </div>
                      </div>

                      {/* In-Depth Full Story (Expandable) */}
                      {isExpanded && (
                        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                          <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                              <Layers className="w-3.5 h-3.5" />
                              <span>{lang === 'my' ? 'နောက်ခံ အကြောင်းအရာနှင့် အသေးစိတ် အချက်အလက် (Full In-Depth Story)' : 'In-Depth Analytical Breakdown'}</span>
                            </div>
                            <p>{lang === 'my' ? news.fullStoryMy : news.fullStory}</p>
                          </div>

                          {news.dataPoints && news.dataPoints.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {news.dataPoints.map((dp, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800"
                                >
                                  <div className="text-[10px] text-slate-400">
                                    {lang === 'my' ? dp.labelMy : dp.label}
                                  </div>
                                  <div className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5 flex items-center justify-between">
                                    <span>{dp.value}</span>
                                    {dp.trend === 'up' && (
                                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    )}
                                    {dp.trend === 'down' && (
                                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {news.technicalActionPlan && (
                            <div className="bg-gradient-to-r from-emerald-500/10 via-slate-100 to-indigo-500/10 dark:from-emerald-500/10 dark:via-slate-900 dark:to-indigo-500/10 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>
                                    {lang === 'my' ? 'Technical Trade Plan' : 'Actionable Technical Trigger'}
                                  </span>
                                </span>
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold">
                                  Support: {news.technicalActionPlan.keySupport} | Resistance: {news.technicalActionPlan.keyResistance}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-[12px]">
                                {lang === 'my'
                                  ? news.technicalActionPlan.triggerConditionMy
                                  : news.technicalActionPlan.triggerCondition}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom Action Bar */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start gap-2 text-xs flex-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-900 dark:text-white font-semibold">
                              {lang === 'my' ? 'အဓိက သတိပြုရန်:' : 'Trader Takeaway:'}{' '}
                            </strong>
                            {lang === 'my' ? news.takeawayMy : news.takeaway}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleExpand(news.id)}
                          className="self-end sm:self-center px-3 py-1 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <span>
                            {isExpanded
                              ? lang === 'my'
                                ? 'အကျဉ်းချုပ်သာ'
                                : 'Show Summary Only'
                              : lang === 'my'
                              ? 'အပြည့်အစုံဖတ်ရန်'
                              : 'Read In-Depth Story'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
