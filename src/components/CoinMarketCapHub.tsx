import React, { useState } from 'react';
import { LiveFearAndGreedData, LiveTickerItem, CoinOpportunity } from '../types';
import { CmcHeader } from './cmc/CmcHeader';
import { CmcSidebar, CmcSectionId } from './cmc/CmcSidebar';
import { CmcTopNav } from './cmc/CmcTopNav';
import { CmcCryptocurrenciesTable } from './cmc/CmcCryptocurrenciesTable';
import { MarketOverviewView } from './cmc/views/MarketOverviewView';
import { SpotMarketView } from './cmc/views/SpotMarketView';
import { MarketsOtherViews } from './cmc/views/MarketsOtherViews';
import { IndicatorsViews } from './cmc/views/IndicatorsViews';
import { EtfFlowsViews } from './cmc/views/EtfFlowsViews';
import { DerivativesViews } from './cmc/views/DerivativesViews';
import { TechnicalViews } from './cmc/views/TechnicalViews';
import { ErrorBoundary } from './ErrorBoundary';
import { X } from 'lucide-react';

interface CoinMarketCapHubProps {
  lang: 'my' | 'en';
  fearAndGreed?: LiveFearAndGreedData | null;
  tickers?: LiveTickerItem[];
  coins: CoinOpportunity[];
  onSelectCoin?: (coin: CoinOpportunity) => void;
  onTradeInDemo?: (symbol: string, side: 'LONG' | 'SHORT') => void;
  initialTab?: 'markets' | 'indicators' | 'etf' | 'derivatives' | 'technical';
}

export const CoinMarketCapHub: React.FC<CoinMarketCapHubProps> = ({
  lang,
  fearAndGreed,
  tickers = [],
  coins,
  onSelectCoin,
  onTradeInDemo,
  initialTab = 'markets',
}) => {
  const isMy = lang === 'my';

  // Map initial tab if passed
  const defaultSection: CmcSectionId =
    initialTab === 'markets'
      ? 'market_overview'
      : initialTab === 'indicators'
      ? 'market_overview' // Starts directly at Market Overview as in Screenshot 1
      : initialTab === 'etf'
      ? 'bitcoin_etfs'
      : initialTab === 'derivatives'
      ? 'derivatives_overview'
      : initialTab === 'technical'
      ? 'technical_overview'
      : 'market_overview';

  const [activeSection, setActiveSection] = useState<CmcSectionId>(defaultSection);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Group handler for rendering corresponding view
  const renderActiveView = () => {
    switch (activeSection) {
      // 1. Markets
      case 'market_overview':
        return (
          <MarketOverviewView
            lang={lang}
            fearAndGreed={fearAndGreed}
            tickers={tickers}
            coins={coins}
            onNavigateSection={setActiveSection}
            onSelectCoin={onSelectCoin}
            onTradeInDemo={onTradeInDemo}
          />
        );
      case 'cryptocurrencies':
        return (
          <div className="space-y-6">
            <CmcTopNav
              lang={lang}
              activeSection="cryptocurrencies"
              onNavigateSection={setActiveSection}
            />
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isMy ? 'ယနေ့ Cryptocurrency ပေါက်စျေးများနှင့် အဆင့်သတ်မှတ်ချက်များ' : "Today's Cryptocurrency Prices by Market Cap"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-4xl leading-relaxed">
                {isMy
                  ? 'CoinMarketCap မှ တရားဝင် ဒေတာများအတိုင်း Top Cryptocurrencies များ၏ စျေးနှုန်း၊ ၂၄ နာရီ အရောင်းအဝယ်ပမာဏ၊ စျေးကွက်အရင်းအနှီးနှင့် 7D Sparkline လမ်းကြောင်းများကို အချိန်နှင့်တစ်ပြေးညီ စောင့်ကြည့်လေ့လာနိုင်ပါသည်။'
                  : 'Track live real-time prices, 24-hour volume, market capitalization, circulating supply, and 7-day sparkline charts for the top cryptocurrencies with 1:1 CoinMarketCap parity.'}
              </p>
            </div>
            <CmcCryptocurrenciesTable
              lang={lang}
              tickers={tickers}
              fearAndGreed={fearAndGreed}
              coins={coins}
              onSelectCoin={onSelectCoin}
              onTradeInDemo={onTradeInDemo}
            />
          </div>
        );
      case 'spot_market':
        return (
          <SpotMarketView
            lang={lang}
            onNavigateSection={setActiveSection}
          />
        );
      case 'chain_ranking':
      case 'btc_treasuries':
      case 'bnb_treasuries':
      case 'exchange_flows':
        return (
          <MarketsOtherViews
            lang={lang}
            section={activeSection}
            onNavigateSection={setActiveSection}
            onTradeInDemo={onTradeInDemo ? (sym) => onTradeInDemo(sym || 'BTCUSDT', 'LONG') : undefined}
          />
        );

      // 2. Indicators
      case 'fear_greed':
      case 'social_mentions':
      case 'altcoin_season':
      case 'market_cycles':
      case 'btc_dominance':
      case 'cmc_20_index':
      case 'cmc_100_index':
        return (
          <IndicatorsViews
            lang={lang}
            section={activeSection}
            fearAndGreed={fearAndGreed}
            tickers={tickers}
            coins={coins}
            onNavigateSection={setActiveSection}
            onTradeInDemo={onTradeInDemo ? (sym) => onTradeInDemo(sym || 'BTCUSDT', 'LONG') : undefined}
          />
        );

      // 3. ETF Flows
      case 'crypto_etfs':
      case 'bitcoin_etfs':
      case 'ethereum_etfs':
      case 'solana_etfs':
      case 'xrp_etfs':
      case 'hyperliquid_etfs':
        return (
          <EtfFlowsViews
            lang={lang}
            section={activeSection}
            onNavigateSection={setActiveSection}
            onTradeInDemo={onTradeInDemo ? (sym) => onTradeInDemo(sym || 'BTCUSDT', 'LONG') : undefined}
          />
        );

      // 4. Derivatives
      case 'derivatives_overview':
      case 'funding_rates':
      case 'liquidations':
      case 'liquidation_map':
        return (
          <DerivativesViews
            lang={lang}
            section={activeSection}
            onNavigateSection={setActiveSection}
            onTradeInDemo={onTradeInDemo ? (sym) => onTradeInDemo(sym || 'BTCUSDT', 'LONG') : undefined}
          />
        );

      // 5. Technical Analysis
      case 'technical_overview':
      case 'rsi_heatmap':
      case 'moving_averages':
      case 'macd_signals':
        return (
          <TechnicalViews
            lang={lang}
            section={activeSection}
            onNavigateSection={setActiveSection}
            onTradeInDemo={onTradeInDemo ? (sym) => onTradeInDemo(sym || 'BTCUSDT', 'LONG') : undefined}
          />
        );

      default:
        return (
          <MarketOverviewView
            lang={lang}
            fearAndGreed={fearAndGreed}
            tickers={tickers}
            coins={coins}
            onNavigateSection={setActiveSection}
            onSelectCoin={onSelectCoin}
            onTradeInDemo={onTradeInDemo}
          />
        );
    }
  };

  return (
    <div className="w-full bg-[#0B0E14] text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[780px]">
      {/* 1. CoinMarketCap Top Branding Header (Screenshot 1) */}
      <CmcHeader
        lang={lang}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        fearAndGreed={fearAndGreed}
        tickers={tickers}
      />

      {/* 2. Main Two-Column Layout (Sidebar + Content Workspace) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar (Screenshots 1, 3, 4) */}
        <CmcSidebar
          lang={lang}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          className="hidden lg:block"
        />

        {/* Mobile Slide-over Drawer for Sidebar */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-72 max-w-[85%] bg-[#0B0E14] border-r border-slate-800 p-3 flex flex-col z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  CMC Navigation
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <CmcSidebar
                lang={lang}
                activeSection={activeSection}
                onSelectSection={(sec) => {
                  setActiveSection(sec);
                  setMobileSidebarOpen(false);
                }}
                className="w-full border-none p-0"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#0B0E14] scrollbar-thin scrollbar-thumb-slate-800">
          <ErrorBoundary
            lang={lang}
            viewName={activeSection}
            onReset={() => setActiveSection('market_overview')}
          >
            {renderActiveView()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
