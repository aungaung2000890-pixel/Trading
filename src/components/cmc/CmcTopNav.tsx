import React from 'react';
import { CmcSectionId } from './CmcSidebar';

interface CmcTopNavProps {
  lang: 'my' | 'en';
  activeSection: CmcSectionId;
  onNavigateSection: (section: CmcSectionId) => void;
}

export const CmcTopNav: React.FC<CmcTopNavProps> = ({
  lang,
  activeSection,
  onNavigateSection,
}) => {
  const isMy = lang === 'my';

  // The complete 7 top tabs exactly as seen in CoinMarketCap Image 1:
  // Overview | Spot | Cryptocurrencies | Chain Ranking | BTC Treasuries | BNB Treasuries | Exchange Inflows/Outflows
  const topTabs: { id: CmcSectionId; labelEn: string; labelMy: string }[] = [
    { id: 'market_overview', labelEn: 'Overview', labelMy: 'အကျဉ်းချုပ်' },
    { id: 'spot_market', labelEn: 'Spot', labelMy: 'စပေါ့' },
    { id: 'cryptocurrencies', labelEn: 'Cryptocurrencies', labelMy: 'Crypto အရေအတွက်' },
    { id: 'chain_ranking', labelEn: 'Chain Ranking', labelMy: 'Blockchains အဆင့်' },
    { id: 'btc_treasuries', labelEn: 'BTC Treasuries', labelMy: 'BTC အရန်ပိုင်ဆိုင်မှု' },
    { id: 'bnb_treasuries', labelEn: 'BNB Treasuries', labelMy: 'BNB အရန်ပိုင်ဆိုင်မှု' },
    { id: 'exchange_flows', labelEn: 'Exchange Inflows/Outflows', labelMy: 'ငွေအဝင်/အထွက်' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-slate-800/80">
      {topTabs.map((tab) => {
        const isActive = activeSection === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigateSection(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {isMy ? tab.labelMy : tab.labelEn}
          </button>
        );
      })}
    </div>
  );
};
