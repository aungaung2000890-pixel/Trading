import React from 'react';
import { CMC_EXTENDED_ETFS, getTradeImpactGuide } from '../../../data/cmcData';
import { Landmark, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Info } from 'lucide-react';
import { CmcSectionId } from '../CmcSidebar';
import { TradeImpactBanner } from '../TradeImpactBanner';

interface EtfFlowsViewsProps {
  lang: 'my' | 'en';
  section: CmcSectionId;
  onNavigateSection: (section: CmcSectionId) => void;
  onTradeInDemo?: (symbol?: string) => void;
  onOpenCalculator?: (symbol?: string) => void;
}

export const EtfFlowsViews: React.FC<EtfFlowsViewsProps> = ({
  lang,
  section,
  onNavigateSection,
  onTradeInDemo,
  onOpenCalculator,
}) => {
  const isMy = lang === 'my';

  const filterAsset =
    section === 'bitcoin_etfs'
      ? 'BTC'
      : section === 'ethereum_etfs'
      ? 'ETH'
      : section === 'solana_etfs'
      ? 'SOL'
      : section === 'xrp_etfs'
      ? 'XRP'
      : section === 'hyperliquid_etfs'
      ? 'HYPE'
      : null;

  const displayList = filterAsset
    ? CMC_EXTENDED_ETFS.filter((e) => e.asset === filterAsset)
    : CMC_EXTENDED_ETFS;

  const title =
    section === 'bitcoin_etfs'
      ? (isMy ? 'Bitcoin Spot ETFs အသားတင် စီးဆင်းမှု' : 'Bitcoin Spot ETFs')
      : section === 'ethereum_etfs'
      ? (isMy ? 'Ethereum Spot ETFs အသားတင် စီးဆင်းမှု' : 'Ethereum Spot ETFs')
      : section === 'solana_etfs'
      ? (isMy ? 'Solana ETFs (SEC တင်သွင်းမှုများ)' : 'Solana ETFs (S-1 Filings)')
      : section === 'xrp_etfs'
      ? (isMy ? 'XRP ETFs (ခွင့်ပြုချက် စောင့်ဆိုင်းဆဲ)' : 'XRP ETFs (Pending SEC)')
      : (isMy ? 'Crypto ETFs အသားတင် စီးဆင်းမှု ခြုံငုံသုံးသပ်ချက်' : 'Crypto ETFs Flow Overview');

  const impactGuide = getTradeImpactGuide(section);

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">{title}</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {isMy
            ? 'အမေရိကန် အဖွဲ့အစည်းကြီးများ (BlackRock, Fidelity စသည်) ၏ နေ့စဉ် Spot ETF အသားတင် ဝယ်ယူ/ရောင်းချမှုများနှင့် AUM ပမာဏများ'
            : 'Tracking institutional exchange-traded fund inflows, daily net capital movements, asset custody quantities, and SEC filing statuses.'}
        </p>
      </div>

      {/* Trade Impact Guide Banner */}
      <TradeImpactBanner
        guide={impactGuide}
        lang={lang}
        onTradeInDemo={onTradeInDemo}
        onOpenCalculator={onOpenCalculator}
        contextTitle="INSTITUTIONAL FLOW BIAS"
      />

      {/* Summary KPI Cards (Screenshot 20) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono uppercase">
            {isMy ? 'စုစုပေါင်း စုဆောင်းမိသော အသားတင်ငွေ:' : 'Cumulative Total Net Inflow:'}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
            +$31.84B
          </div>
          <span className="text-[10px] text-slate-400">Institutional Net Buy Absorption</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono uppercase">
            {isMy ? 'စုစုပေါင်း ETF ပိုင်ဆိုင်မှုတန်ဖိုး (AUM):' : 'Total Net Assets (AUM):'}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            $89.42B
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">~5.3% of circulating Bitcoin</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono uppercase">
            {isMy ? '၂၄ နာရီ ETF အရောင်းအဝယ်ပမာဏ:' : '24h ETF Trading Volume:'}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400 mt-1">
            $3.24B
          </div>
          <span className="text-[10px] text-slate-400">High Institutional Liquidity</span>
        </div>
      </div>

      {/* ETF Table */}
      <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-white">
            {isMy ? 'အမေရိကန် Spot ETF ရန်ပုံငွေများ ဇယား' : 'Approved Spot ETF Holdings & Daily Flows'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">Updated NYSE Close</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Fund Name</th>
                <th className="py-2.5 px-3">Issuer</th>
                <th className="py-2.5 px-3">24h Net Flow</th>
                <th className="py-2.5 px-3">Total AUM</th>
                <th className="py-2.5 px-3">Holdings Qty</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Trade Spot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayList.map((etf) => (
                <tr key={etf.ticker} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-bold text-amber-400">{etf.ticker}</td>
                  <td className="py-3 px-3 font-sans font-bold text-white">{etf.fundName}</td>
                  <td className="py-3 px-3 text-slate-300">{etf.issuer}</td>
                  <td
                    className={`py-3 px-3 font-black ${
                      etf.flowDailyUsd > 0
                        ? 'text-emerald-400'
                        : etf.flowDailyUsd < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {etf.flowDailyFormatted}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">{etf.totalAumUsd}</td>
                  <td className="py-3 px-3 text-slate-300">{etf.holdingsQty}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        etf.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {etf.status === 'ACTIVE' ? 'Active Trading' : 'SEC S-1 Review'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {onTradeInDemo && (
                      <button
                        onClick={() => onTradeInDemo(`${etf.asset}USDT`)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition text-[11px] font-bold cursor-pointer"
                      >
                        Trade
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
