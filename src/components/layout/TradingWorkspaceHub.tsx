import React, { useState } from 'react';
import {
  Sparkles,
  Timer,
  Clock,
  Compass,
  Zap,
  BarChart2,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Flame,
  ChevronRight,
  Target,
  Terminal,
  Coins,
  Cpu,
} from 'lucide-react';
import {
  CoinOpportunity,
  LiveTickerItem,
  DemoTradePreset,
  AppNavView,
  AppSettings,
  MarketClockSettings,
  DeviceLayoutOption,
  LiveFearAndGreedData,
} from '../../types';
import { DualTime } from '../../utils/time';
import { MarketTimingEngine } from '../MarketTimingEngine';
import { WorldMarketClocks } from '../WorldMarketClocks';
import { MacroBanner } from '../MacroBanner';
import { MarketRegimeRiskWidget } from '../MarketRegimeRiskWidget';
import { RecentLiquidationsFeed } from '../RecentLiquidationsFeed';
import { LiveScannerTable } from '../LiveScannerTable';
import { MarketSentimentIndicator, analyzeTop5Sentiment } from '../MarketSentimentIndicator';
import { SpotTradingAdvisor } from '../SpotTradingAdvisor';
import { CoinMarketCapHub } from '../CoinMarketCapHub';
import { CryptoCraftCalendar } from '../CryptoCraftCalendar';
import { Globe, Calendar } from 'lucide-react';

interface TradingWorkspaceHubProps {
  layout: DeviceLayoutOption;
  lang: 'my' | 'en';
  coins: CoinOpportunity[];
  selectedCoin: CoinOpportunity;
  onSelectCoin: (coin: CoinOpportunity) => void;
  onTradeInDemo: (symbol: string, side: 'LONG' | 'SHORT', customMargin?: number, customLeverage?: number) => void;
  onOpenAI: (mode?: any, coinSymbol?: string) => void;
  onGenerateTradeCard: (coin: CoinOpportunity) => void;
  onSelectTicker: (ticker: LiveTickerItem) => void;
  onGenerateInstantCard: (ticker: LiveTickerItem) => void;
  liveTickers: LiveTickerItem[];
  walletBalance: number;
  onWalletBalanceChange: (val: number) => void;
  lastScannedTime: DualTime;
  settings: AppSettings;
  onUpdateClockSettings: (partial: Partial<MarketClockSettings>) => void;
  onUpdateActiveCities: (cityIds: string[]) => void;
  onUpdateCityWallpaper: (cityId: string, url: string | null) => void;
  onResetAllWallpapers: () => void;
  onNavigateView: (view: AppNavView) => void;
  onOpenNews: () => void;
  isLoading: boolean;
  scanMode: 'manual' | 'auto';
  onToggleScanMode: (mode: 'manual' | 'auto') => void;
  onRefresh: () => void;
  onOpenPriceAlert?: (symbol: string) => void;
  fearAndGreed?: LiveFearAndGreedData | null;
}

export const TradingWorkspaceHub: React.FC<TradingWorkspaceHubProps> = ({
  layout,
  lang,
  coins,
  selectedCoin,
  onSelectCoin,
  onTradeInDemo,
  onOpenAI,
  onGenerateTradeCard,
  onSelectTicker,
  onGenerateInstantCard,
  liveTickers,
  walletBalance,
  onWalletBalanceChange,
  lastScannedTime,
  settings,
  onUpdateClockSettings,
  onUpdateActiveCities,
  onUpdateCityWallpaper,
  onResetAllWallpapers,
  onNavigateView,
  onOpenNews,
  isLoading,
  scanMode,
  onToggleScanMode,
  onRefresh,
  onOpenPriceAlert,
  fearAndGreed,
}) => {
  // 5 Focused, Non-Overlapping Tabs for Home (Trading Software style):
  // 1. 'markets': Pro Terminal Scanner, Sentiment & Liquidations (Default!)
  // 2. 'calendar': CryptoCraft Economic & Crypto Catalyst Calendar (1:1 with cryptocraft.com)
  // 3. 'cmc': CoinMarketCap Intelligence Hub (Global vs Top 5 Fear & Greed, ETF flows, Chains)
  // 4. 'spot': Spot Accumulation, DCA Ladder & Portfolio Advisor
  // 5. 'clocks': Global Clocks, Macro Timing & Regime Risk
  const [activeTab, setActiveTab] = useState<'markets' | 'calendar' | 'cmc' | 'spot' | 'clocks'>('markets');

  const tabs = [
    {
      id: 'markets' as const,
      labelEn: 'Markets & Scanner',
      labelMy: 'စျေးကွက် & စကန်နာ',
      shortEn: 'Markets',
      shortMy: 'စျေးကွက်',
      icon: BarChart2,
    },
    {
      id: 'calendar' as const,
      labelEn: 'CryptoCraft Calendar',
      labelMy: 'စီးပွားရေးပြက္ခဒိန်',
      shortEn: 'Calendar',
      shortMy: 'ပြက္ခဒိန်',
      icon: Calendar,
      badge: 'LIVE',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      id: 'cmc' as const,
      labelEn: 'CoinMarketCap Hub',
      labelMy: 'CoinMarketCap ဗဟို',
      shortEn: 'CMC Hub',
      shortMy: 'CMC ဗဟို',
      icon: Globe,
    },
    {
      id: 'spot' as const,
      labelEn: 'Spot Trading Advisor',
      labelMy: 'စပေါ့ အကြံပြုချက်စနစ်',
      shortEn: 'Spot Advisor',
      shortMy: 'စပေါ့ အကြံပြု',
      icon: Coins,
    },
    {
      id: 'clocks' as const,
      labelEn: 'World Clocks & Radar',
      labelMy: 'ကမ္ဘာ့နာရီ & မက်ခရို ရေဒါ',
      shortEn: 'Clocks',
      shortMy: 'ကမ္ဘာ့နာရီ',
      icon: Clock,
    },
  ];

  const top5Sentiment = React.useMemo(() => analyzeTop5Sentiment(coins), [coins]);

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Workspace Hub Category Switcher Header */}
      <div className="w-full max-w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`hub-tab-${tab.id}-btn`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>
                  {layout === 'phone'
                    ? lang === 'my'
                      ? tab.shortMy
                      : tab.shortEn
                    : lang === 'my'
                    ? tab.labelMy
                    : tab.labelEn}
                </span>

                {/* Live Top 5 Sentiment badge on Markets tab button */}
                {tab.id === 'markets' && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-black border uppercase tracking-wider hidden sm:inline-flex items-center gap-1 ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                        : `${top5Sentiment.badgeBg} ${top5Sentiment.badgeText} ${top5Sentiment.badgeBorder}`
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: top5Sentiment.gaugeColor }}
                    />
                    <span>{top5Sentiment.score}% {top5Sentiment.moodLevel.includes('BULL') ? 'Bull' : top5Sentiment.moodLevel.includes('BEAR') ? 'Bear' : 'Neutral'}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Jump Buttons to Dedicated Workspaces */}
        <div className="hidden sm:flex items-center gap-1.5 pr-1 text-xs">
          <button
            onClick={() => onNavigateView('dual_engine')}
            className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold flex items-center gap-1 cursor-pointer transition"
            title={lang === 'my' ? 'သတ်မှတ်နည်းလမ်း & AI စိစစ်ချက် Terminal သို့ သွားမည်' : 'Open Strategy & AI Decision Terminal'}
          >
            <Cpu className="w-3 h-3 text-purple-500" />
            <span>{lang === 'my' ? '⚡ သတ်မှတ်နည်းလမ်း & AI' : '⚡ Strategy Terminal'}</span>
          </button>
          <button
            onClick={() => onNavigateView('demo')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Terminal className="w-3 h-3 text-emerald-500" />
            <span>{lang === 'my' ? '⚡ ဒေမို ကုန်သွယ်စနစ်' : '⚡ Demo Terminal'}</span>
          </button>
          <button
            onClick={() => onNavigateView('long_term')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <TrendingUp className="w-3 h-3 text-amber-500" />
            <span>{lang === 'my' ? '💎 ရေရှည်' : '💎 Long-Term'}</span>
          </button>
          <button
            onClick={() => onNavigateView('ai')}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>{lang === 'my' ? '🧠 AI Assistant' : '🧠 AI Assistant'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MARKETS, SCANNER & OPPORTUNITIES (CORE HOME VIEW)  */}
      {/* Structured like genuine professional trading software   */}
      {/* (Binance / TradingView style terminal)                   */}
      {/* ======================================================== */}
      {activeTab === 'markets' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Access Strategy Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-linear-to-r from-purple-500/10 via-amber-500/5 to-slate-900 border border-purple-500/20 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {lang === 'my' ? 'သတ်မှတ်နည်းလမ်း & AI စိစစ်ချက် Terminal' : 'Strategy & AI Decision Terminal'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'my'
                    ? 'ခရစ်ပတို နည်းပညာ၊ သတ်မှတ်စည်းမျဉ်းများနှင့် ပေါင်းစပ်ဆုံးဖြတ်ချက် သုံးခု ခွဲခြမ်းစိတ်ဖြာမှု'
                    : '3-Way Analysis: Technical Crypto Engine, Established Rules & Balanced Consensus'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateView('dual_engine')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 active:scale-95 shadow-xs"
            >
              <span>{lang === 'my' ? 'စိစစ်ချက် ဖွင့်မည်' : 'Launch Terminal'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Market Sentiment Indicator: Aggregated Bias of Top Coins & Global Compare */}
          <MarketSentimentIndicator
            coins={coins}
            lang={lang}
            fearAndGreed={fearAndGreed}
            tickers={liveTickers}
            onRefresh={onRefresh}
            isLoading={isLoading}
            onOpenCmcHub={() => setActiveTab('cmc')}
            onSelectCoin={(c) => {
              onSelectCoin(c);
              onNavigateView('dual_engine');
            }}
            onTradeInDemo={onTradeInDemo}
          />

          {/* Liquidations Feed + Live Scanner Table */}
          <div className="grid grid-cols-1 gap-6 items-start">
            <RecentLiquidationsFeed
              tickers={liveTickers}
              lang={lang}
            />

            {/* Live Scanner Table (Full width responsive) */}
            <LiveScannerTable
              tickers={liveTickers}
              onSelectTicker={(t) => {
                onSelectTicker(t);
                const found = coins.find((c) => c.symbol === t.symbol);
                if (found) onSelectCoin(found);
                onNavigateView('dual_engine');
              }}
              onGenerateTradeCard={onGenerateInstantCard}
              onTradeInDemo={onTradeInDemo}
              onOpenPriceAlert={onOpenPriceAlert}
              lang={lang}
              onRefresh={onRefresh}
              isLoading={isLoading}
              scanMode={scanMode}
              onToggleScanMode={onToggleScanMode}
              walletBalance={walletBalance}
              onWalletBalanceChange={onWalletBalanceChange}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CRYPTOCRAFT ECONOMIC & CRYPTO CALENDAR            */}
      {/* 1:1 Implementation of https://www.cryptocraft.com/calendar */}
      {/* ======================================================== */}
      {activeTab === 'calendar' && (
        <div className="animate-in fade-in duration-200">
          <CryptoCraftCalendar
            lang={lang}
            onNavigateView={onNavigateView}
            onOpenTradeModal={(sym) => {
              const coinFound = coins.find((c) => c.symbol === sym);
              if (coinFound) onSelectCoin(coinFound);
              onTradeInDemo(sym, 'LONG', 100, 10);
            }}
            onSelectCoin={(sym) => {
              const coinFound = coins.find((c) => c.symbol === sym);
              if (coinFound) onSelectCoin(coinFound);
              onNavigateView('dual_engine');
            }}
            onAskAI={(prompt) => {
              if (onOpenAI) onOpenAI('ask_ai', prompt);
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COINMARKETCAP INTELLIGENCE HUB                     */}
      {/* ======================================================== */}
      {activeTab === 'cmc' && (
        <div className="animate-in fade-in duration-200">
          <CoinMarketCapHub
            lang={lang}
            fearAndGreed={fearAndGreed}
            tickers={liveTickers}
            coins={coins}
            onSelectCoin={(c) => {
              onSelectCoin(c);
              onNavigateView('dual_engine');
            }}
            onTradeInDemo={onTradeInDemo}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SPOT TRADING ADVISOR (NEW COMPONENT)              */}
      {/* Solves: "စပေါ့အရောင်းအဝယ်အတွက်လဲအကြံပြုနိုင်သည့်          */}
      {/* အကောင်းဆုံးနည်းပညာနဲ့အသိပညာပေါင်းစပ်ထားတဲ့ဟာတစ်ခုထပ်ပေါင်းပေးပါ" */}
      {/* ======================================================== */}
      {activeTab === 'spot' && (
        <div className="animate-in fade-in duration-200">
          <SpotTradingAdvisor
            liveTickers={liveTickers}
            lang={lang}
            onNavigateToDemo={(sym, side) => onTradeInDemo(sym, side, 100, 1)}
            onOpenAI={(q) => onOpenAI && onOpenAI('ask_ai', selectedCoin.symbol)}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: WORLD MARKET CLOCKS & MACRO RADAR                 */}
      {/* Consolidated without duplicates                          */}
      {/* ======================================================== */}
      {activeTab === 'clocks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <MarketTimingEngine
                language={lang}
                onNavigateToNews={onOpenNews}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col justify-between">
              <MacroBanner
                lang={lang}
                lastScannedTime={lastScannedTime}
                fearAndGreed={fearAndGreed}
                tickers={liveTickers}
              />
            </div>
          </div>

          <WorldMarketClocks
            clockSettings={settings.clock.settings}
            activeCityIds={settings.clock.activeCityIds}
            perCityWallpapers={settings.clock.perCityWallpapers}
            language={lang}
            onUpdateSettings={onUpdateClockSettings}
            onUpdateActiveCities={onUpdateActiveCities}
            onUpdateCityWallpaper={onUpdateCityWallpaper}
            onResetAllWallpapers={onResetAllWallpapers}
          />

          <MarketRegimeRiskWidget
            lang={lang}
            liveTickers={liveTickers}
            onNavigateToCalculator={() => onNavigateView('calculator')}
          />
        </div>
      )}
    </div>
  );
};
