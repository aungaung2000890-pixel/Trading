import React, { useState } from 'react';
import {
  CMC_CHAIN_RANKINGS,
  CMC_TREASURIES,
  CMC_BNB_TREASURIES_DATA,
  CMC_EXCHANGE_FLOWS,
  getTradeImpactGuide,
} from '../../../data/cmcData';
import { CmcSectionId } from '../CmcSidebar';
import { CmcTopNav } from '../CmcTopNav';
import { CryptocurrenciesView } from './CryptocurrenciesView';
import { TradeImpactBanner } from '../TradeImpactBanner';

interface MarketsOtherViewsProps {
  lang: 'my' | 'en';
  section: CmcSectionId;
  onNavigateSection: (section: CmcSectionId) => void;
  onTradeInDemo?: (symbol?: string) => void;
  onOpenCalculator?: (symbol?: string) => void;
}

export const MarketsOtherViews: React.FC<MarketsOtherViewsProps> = ({
  lang,
  section,
  onNavigateSection,
  onTradeInDemo,
  onOpenCalculator,
}) => {
  const isMy = lang === 'my';
  const [treasuryFilter, setTreasuryFilter] = useState<'ALL' | 'PUBLIC' | 'GOVERNMENT' | 'PRIVATE'>('ALL');

  // 1. NO. OF CRYPTOCURRENCIES (Full-Fidelity Implementation matching Image 1 & 3)
  if (section === 'cryptocurrencies') {
    return (
      <CryptocurrenciesView
        lang={lang}
        onNavigateSection={onNavigateSection}
      />
    );
  }

  // 2. CHAIN RANKING (Screenshot 18)
  if (section === 'chain_ranking') {
    const impactGuide = getTradeImpactGuide('chain_ranking');

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <CmcTopNav
          lang={lang}
          activeSection="chain_ranking"
          onNavigateSection={onNavigateSection}
        />

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Chain Ranking (Total Value Locked အဆင့်)' : 'Chain Ranking (Total Value Locked)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'TVL၊ စျေးကွက်ရှယ်ယာ၊ protocol လှုပ်ရှားမှုများနှင့် DEX အရောင်းအဝယ်ပမာဏများအရ ထိပ်တန်း smart contract blockchains များ၏ အဆင့်သတ်မှတ်ချက်များ။'
              : 'Top smart contract blockchains ranked by TVL, market share, protocol activity, and decentralized exchange volume.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="CHAIN TVL ROTATION"
        />

        {/* Total TVL Banner (Screenshot 18: Total TVL $114.17B -0.21%) */}
        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {isMy ? 'စုစုပေါင်း ပိတ်လှောင်တန်ဖိုး (Total Value Locked):' : 'Total Value Locked (All Chains):'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                $114.17B
              </span>
              <span className="text-xs font-bold text-rose-400 font-mono">
                ▼ -0.21% (24h)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
              Ethereum Dominance: 56.76% ($64.80B)
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Chain</th>
                  <th className="py-2.5 px-3">TVL</th>
                  <th className="py-2.5 px-3">DEX Liquidity</th>
                  <th className="py-2.5 px-3">7d TVL Change</th>
                  <th className="py-2.5 px-3">7d DEX Volume</th>
                  <th className="py-2.5 px-3">Protocols</th>
                  <th className="py-2.5 px-3 text-right">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {CMC_CHAIN_RANKINGS.map((chain) => (
                  <tr key={chain.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-400 font-bold">#{chain.rank}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-400 font-mono">
                          {chain.symbol.slice(0, 3)}
                        </span>
                        <div>
                          <div className="font-sans font-bold text-white">{chain.name}</div>
                          <div className="text-[10px] text-slate-400">{chain.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-black text-white">{chain.tvlFormatted}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span>{chain.dexLiqUsd}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-3 font-bold ${(chain.tvlChange7dPct ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(chain.tvlChange7dPct ?? 0) >= 0 ? '+' : ''}{chain.tvlChange7dPct}%
                    </td>
                    <td className="py-3 px-3 text-slate-300">{chain.dexVol7dUsd}</td>
                    <td className="py-3 px-3 text-slate-300">{chain.activeProtocols}</td>
                    <td className="py-3 px-3 text-right">
                      {onTradeInDemo && (
                        <button
                          onClick={() => onTradeInDemo(`${chain.symbol}USDT`)}
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
  }

  // 3. BITCOIN TREASURIES (Screenshot 19)
  if (section === 'btc_treasuries') {
    const impactGuide = getTradeImpactGuide('btc_treasuries');

    const filteredTreasuries = CMC_TREASURIES.filter((t) => {
      if (treasuryFilter === 'ALL') return true;
      if (treasuryFilter === 'PUBLIC') return t.ticker !== 'GOV' && t.ticker !== 'PRIV';
      if (treasuryFilter === 'GOVERNMENT') return t.country.includes('Government') || t.entity.includes('Government');
      if (treasuryFilter === 'PRIVATE') return t.ticker === 'PRIV' || t.ticker === 'CEP';
      return true;
    });

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <CmcTopNav
          lang={lang}
          activeSection="btc_treasuries"
          onNavigateSection={onNavigateSection}
        />

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Bitcoin အရန်ပိုင်ဆိုင်မှု (Crypto Treasuries)' : 'Crypto Treasuries'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'အများပိုင်ကုမ္ပဏီများ၊ ပုဂ္ဂလိကအဖွဲ့အစည်းများနှင့် နိုင်ငံတော်အစိုးရများ balance sheet ပေါ်တွင် သိမ်းဆည်းထားသော Bitcoin ပမာဏများ။'
              : 'Tracking public corporations, private institutions, and sovereign nations holding Bitcoin on their balance sheets.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="TREASURY ACCUMULATION"
        />

        {/* Key Benchmark Cards (Screenshot 19) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">
              {isMy ? 'စုစုပေါင်း အဖွဲ့အစည်းပိုင် BTC:' : 'Total Institutional BTC:'}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1">
              883.65K BTC
            </div>
            <span className="text-[10px] text-slate-400">$67.14B Total Value (~4.21% of 21M)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">
              {isMy ? 'အကြီးဆုံး ကော်ပိုရိတ် ကိုင်ဆောင်သူ:' : 'Top Corporate Holder:'}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 truncate">
              MicroStrategy
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">499,200 BTC ($37.93B)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">
              {isMy ? 'အကြီးဆုံး နိုင်ငံတော် ကိုင်ဆောင်သူ:' : 'Top Sovereign Holder:'}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400 mt-1 truncate">
              US Government
            </div>
            <span className="text-[10px] text-slate-400">208,109 BTC ($15.80B Custodied)</span>
          </div>
        </div>

        {/* Filter Pills & Treasury Table */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-black text-white">
              {isMy ? 'အဖွဲ့အစည်းအလိုက် BTC ပိုင်ဆိုင်မှု အသေးစိတ်' : 'Institutional Holdings Breakdown'}
            </h3>

            {/* Filter Buttons */}
            <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setTreasuryFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  treasuryFilter === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTreasuryFilter('PUBLIC')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  treasuryFilter === 'PUBLIC' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Public Co.
              </button>
              <button
                onClick={() => setTreasuryFilter('GOVERNMENT')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  treasuryFilter === 'GOVERNMENT' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Governments
              </button>
              <button
                onClick={() => setTreasuryFilter('PRIVATE')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  treasuryFilter === 'PRIVATE' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Private Co.
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Ticker</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">BTC Held</th>
                  <th className="py-2.5 px-3">USD Value</th>
                  <th className="py-2.5 px-3">Entry Avg</th>
                  <th className="py-2.5 px-3">Unrealized PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTreasuries.map((t) => (
                  <tr key={t.entity} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-sans font-bold text-white">{t.entity}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-blue-400 font-bold border border-slate-700">
                        {t.ticker}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{t.country}</td>
                    <td className="py-3 px-3 font-black text-amber-400">{t.btcHoldings.toLocaleString()} BTC</td>
                    <td className="py-3 px-3 font-bold text-white">{t.usdValue}</td>
                    <td className="py-3 px-3 text-slate-400">{t.entryAvgPrice}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{t.unrealizedProfitUsd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 4. BNB TREASURIES
  if (section === 'bnb_treasuries') {
    const impactGuide = getTradeImpactGuide('bnb_treasuries');

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <CmcTopNav
          lang={lang}
          activeSection="bnb_treasuries"
          onNavigateSection={onNavigateSection}
        />

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'BNB အရန်ပိုင်ဆိုင်မှုနှင့် ဂေဟစနစ်သိုလှောင်မှု' : 'BNB Treasuries & Ecosystem Reserves'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'BNB Chain အတွက် အရန်ငွေကြေးစစ်ဆေးချက်၊ သုံးလတစ်ကြိမ် အလိုအလျောက်မီးရှို့မှု (Auto-Burn) နှင့် validator စတိတ်ထားရှိမှုများ။'
              : 'Proof of reserves, quarterly auto-burn telemetry, and validator-staked treasury for BNB Chain.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="BNB TOKENOMICS"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Ecosystem Reserve:</span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {CMC_BNB_TREASURIES_DATA.ecosystemReserve}
            </div>
            <span className="text-[10px] text-slate-400">{CMC_BNB_TREASURIES_DATA.usdValue} value</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">28th Auto-Burn Completed:</span>
            <div className="text-2xl font-black font-mono text-rose-400 mt-1">
              {CMC_BNB_TREASURIES_DATA.autoBurn28th}
            </div>
            <span className="text-[10px] text-slate-400">Permanently removed from supply</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">BSC Validator Stake:</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {CMC_BNB_TREASURIES_DATA.bscStaked}
            </div>
            <span className="text-[10px] text-slate-400">{CMC_BNB_TREASURIES_DATA.circulatingPct}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
          <h3 className="text-base font-black text-white">BNB Proof of Reserves Audit</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The BNB Chain ecosystem maintains transparent on-chain reserves verified by third-party audit reports. BNB tokens allocated to community incentives and ecosystem grants are time-locked in transparent multisig smart contracts.
          </p>
        </div>
      </div>
    );
  }

  // 5. EXCHANGE INFLOWS / OUTFLOWS
  if (section === 'exchange_flows') {
    const impactGuide = getTradeImpactGuide('exchange_flows');

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <CmcTopNav
          lang={lang}
          activeSection="exchange_flows"
          onNavigateSection={onNavigateSection}
        />

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'ဗဟိုချုပ်ကိုင်မှုရှိသော Exchanges ငွေအဝင်/အထွက် (၂၄ နာရီ)' : 'Exchange Inflows / Outflows (24h)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'ဗဟိုချုပ်ကိုင်မှုရှိသော exchanges များအတွင်း အသားတင်ငွေဝင်ရောက်မှုနှင့် ထွက်ခွာမှုများကို အချိန်နှင့်တပြေးညီ ခြေရာခံခြင်း။ ငွေအထွက်များခြင်းသည် ရေရှည်စုဆောင်းမှု (Cold storage) ကို ညွှန်ပြသည်။'
              : 'Real-time tracking of net capital moving in and out of centralized exchanges. Outflows indicate long-term cold storage accumulation.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="EXCHANGE RESERVES SHIFT"
        />

        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Exchange</th>
                  <th className="py-2.5 px-3">Total Assets</th>
                  <th className="py-2.5 px-3">24h Net Flow</th>
                  <th className="py-2.5 px-3">7d Net Flow</th>
                  <th className="py-2.5 px-3">Market Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {CMC_EXCHANGE_FLOWS.map((flow) => {
                  const isAccumulation = flow.signal === 'ACCUMULATION';
                  return (
                    <tr key={flow.exchange} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-sans font-bold text-white">{flow.exchange}</td>
                      <td className="py-3 px-3 text-slate-300 font-bold">{flow.totalAssetsUsd}</td>
                      <td
                        className={`py-3 px-3 font-black ${
                          flow.netFlow24hUsd < 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {flow.netFlow24hFormatted}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{flow.netFlow7dFormatted}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAccumulation
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : flow.signal === 'DEPOSIT_PRESSURE'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-700/30 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {isAccumulation
                            ? 'Cold Storage Outflow (Accumulation)'
                            : flow.signal === 'DEPOSIT_PRESSURE'
                            ? 'Exchange Inflow (Deposit Pressure)'
                            : 'Neutral Flow Balance'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Safe fallback if section is unhandled
  return (
    <CryptocurrenciesView
      lang={lang}
      onNavigateSection={onNavigateSection}
    />
  );
};
