import React from 'react';
import {
  BarChart2,
  Gauge,
  Landmark,
  Layers,
  Sliders,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export type CmcSectionId =
  // Markets
  | 'market_overview'
  | 'spot_market'
  | 'cryptocurrencies'
  | 'chain_ranking'
  | 'btc_treasuries'
  | 'bnb_treasuries'
  | 'exchange_flows'
  // Indicators
  | 'fear_greed'
  | 'social_mentions'
  | 'altcoin_season'
  | 'market_cycles'
  | 'btc_dominance'
  | 'cmc_20_index'
  | 'cmc_100_index'
  // ETF Flows
  | 'crypto_etfs'
  | 'bitcoin_etfs'
  | 'ethereum_etfs'
  | 'solana_etfs'
  | 'xrp_etfs'
  | 'hyperliquid_etfs'
  // Derivatives
  | 'derivatives_overview'
  | 'funding_rates'
  | 'liquidations'
  | 'liquidation_map'
  // Technical Analysis
  | 'technical_overview'
  | 'rsi_heatmap'
  | 'moving_averages'
  | 'macd_signals';

export interface CmcSidebarCategory {
  id: string;
  nameEn: string;
  nameMy: string;
  icon: React.ElementType;
  items: {
    id: CmcSectionId;
    labelEn: string;
    labelMy: string;
    badge?: string;
  }[];
}

export const CMC_SIDEBAR_CATEGORIES: CmcSidebarCategory[] = [
  {
    id: 'markets',
    nameEn: 'Markets',
    nameMy: 'စျေးကွက်များ',
    icon: BarChart2,
    items: [
      { id: 'market_overview', labelEn: 'Market Overview', labelMy: 'စျေးကွက်အကျဉ်းချုပ်' },
      { id: 'spot_market', labelEn: 'Spot Market', labelMy: 'စပေါ့ စျေးကွက်' },
      { id: 'cryptocurrencies', labelEn: 'No. of Cryptocurrencies', labelMy: 'Crypto အရေအတွက်' },
      { id: 'chain_ranking', labelEn: 'Chain Ranking', labelMy: 'Blockchains အဆင့်' },
      { id: 'btc_treasuries', labelEn: 'Bitcoin Treasuries', labelMy: 'Bitcoin အရန်ပိုင်ဆိုင်မှု' },
      { id: 'bnb_treasuries', labelEn: 'BNB Treasuries', labelMy: 'BNB အရန်ပိုင်ဆိုင်မှု' },
      { id: 'exchange_flows', labelEn: 'Exchange Inflows/Outflows', labelMy: 'ငွေအဝင်/အထွက် စီးဆင်းမှု' },
    ],
  },
  {
    id: 'indicators',
    nameEn: 'Indicators',
    nameMy: 'အညွှန်းကိန်းများ',
    icon: Gauge,
    items: [
      { id: 'fear_greed', labelEn: 'Fear and Greed Index', labelMy: 'Fear & Greed အညွှန်း' },
      { id: 'social_mentions', labelEn: 'Social Mentions', labelMy: 'လူမှုမီဒီယာ ဖော်ပြမှုများ' },
      { id: 'altcoin_season', labelEn: 'Altcoin Season Index', labelMy: 'Altcoin ရာသီ အညွှန်း' },
      { id: 'market_cycles', labelEn: 'Market Cycle Indicators', labelMy: 'စျေးကွက် စက်ဝန်း အညွှန်း' },
      { id: 'btc_dominance', labelEn: 'Bitcoin Dominance', labelMy: 'BTC လွှမ်းမိုးမှု (Dominance)' },
      { id: 'cmc_20_index', labelEn: 'KA 20 Mega-Cap Index', labelMy: 'KA 20 အညွှန်းကိန်း' },
      { id: 'cmc_100_index', labelEn: 'KA 100 Broad Index', labelMy: 'KA 100 အညွှန်းကိန်း' },
    ],
  },
  {
    id: 'etf_flows',
    nameEn: 'ETF Flows',
    nameMy: 'ETF ငွေစီးဆင်းမှုများ',
    icon: Landmark,
    items: [
      { id: 'crypto_etfs', labelEn: 'Crypto ETFs', labelMy: 'Crypto ETFs စုစည်းမှု' },
      { id: 'bitcoin_etfs', labelEn: 'Bitcoin ETFs', labelMy: 'Bitcoin Spot ETFs' },
      { id: 'ethereum_etfs', labelEn: 'Ethereum ETFs', labelMy: 'Ethereum Spot ETFs' },
      { id: 'solana_etfs', labelEn: 'Solana ETFs', labelMy: 'Solana ETFs (S-1)' },
      { id: 'xrp_etfs', labelEn: 'XRP ETFs', labelMy: 'XRP ETFs (Pending)' },
      { id: 'hyperliquid_etfs', labelEn: 'Hyperliquid ETFs', labelMy: 'Hyperliquid အညွှန်း' },
    ],
  },
  {
    id: 'derivatives',
    nameEn: 'Derivatives',
    nameMy: 'ဆင်းသက်စျေးကွက်များ',
    icon: Layers,
    items: [
      { id: 'derivatives_overview', labelEn: 'Overview', labelMy: 'Futures အကျဉ်းချုပ်' },
      { id: 'funding_rates', labelEn: 'Funding Rates', labelMy: 'Funding နှုန်းထားများ' },
      { id: 'liquidations', labelEn: 'Liquidations', labelMy: 'Liquidations (24h)' },
      { id: 'liquidation_map', labelEn: 'Liquidation Map', labelMy: 'Liquidation မြေပုံ' },
    ],
  },
  {
    id: 'technical_analysis',
    nameEn: 'Technical Analysis',
    nameMy: 'နည်းပညာဆိုင်ရာ စိစစ်ချက်',
    icon: Sliders,
    items: [
      { id: 'technical_overview', labelEn: 'Overview', labelMy: 'နည်းပညာ အကျဉ်းချုပ်' },
      { id: 'rsi_heatmap', labelEn: 'RSI Heatmap', labelMy: 'RSI Heatmap' },
      { id: 'moving_averages', labelEn: 'Moving Averages', labelMy: 'ပျမ်းမျှ ရွေ့လျားမျဉ်းများ (MA)' },
      { id: 'macd_signals', labelEn: 'MACD Signals', labelMy: 'MACD အချက်ပြမှုများ' },
    ],
  },
];

interface CmcSidebarProps {
  lang: 'my' | 'en';
  activeSection: CmcSectionId;
  onSelectSection: (section: CmcSectionId) => void;
  className?: string;
  onCloseMobile?: () => void;
}

export const CmcSidebar: React.FC<CmcSidebarProps> = ({
  lang,
  activeSection,
  onSelectSection,
  className = '',
  onCloseMobile,
}) => {
  const isMy = lang === 'my';

  return (
    <aside
      className={`w-64 shrink-0 bg-[#0B0E14] border-r border-slate-800/80 p-3 overflow-y-auto select-none font-sans scrollbar-thin scrollbar-thumb-slate-800 ${className}`}
    >
      <div className="space-y-6">
        {CMC_SIDEBAR_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header with Vertical Accent */}
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <CategoryIcon className="w-4 h-4 text-slate-400" />
                <span>{isMy ? category.nameMy : category.nameEn}</span>
              </div>

              {/* Sub items list with left border connector like CMC */}
              <div className="relative pl-3 ml-2 border-l border-slate-800 space-y-0.5">
                {category.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`cmc-nav-${item.id}`}
                      onClick={() => {
                        onSelectSection(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-[#1E293B] text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="truncate">{isMy ? item.labelMy : item.labelEn}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
