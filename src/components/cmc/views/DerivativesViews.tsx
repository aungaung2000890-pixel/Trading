import React, { useState } from 'react';
import {
  Layers,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
  Target,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { CmcSectionId } from '../CmcSidebar';
import {
  CMC_DERIVATIVES_MARKET_OVERVIEW,
  CMC_FUNDING_RATES_DASHBOARD,
  CMC_LIQUIDATIONS_DASHBOARD,
  CMC_BTC_LIQUIDATION_MAP,
  getTradeImpactGuide,
} from '../../../data/cmcData';
import { TradeImpactBanner } from '../TradeImpactBanner';

interface DerivativesViewsProps {
  lang: 'my' | 'en';
  section: CmcSectionId;
  onNavigateSection: (section: CmcSectionId) => void;
  onTradeInDemo?: (symbol?: string) => void;
  onOpenCalculator?: (symbol?: string) => void;
}

export const DerivativesViews: React.FC<DerivativesViewsProps> = ({
  lang,
  section,
  onNavigateSection,
  onTradeInDemo,
  onOpenCalculator,
}) => {
  const isMy = lang === 'my';
  const [fundingSearch, setFundingSearch] = useState('');

  // 1. DERIVATIVES MARKET OVERVIEW (Screenshot 21)
  if (section === 'derivatives_overview') {
    const data = CMC_DERIVATIVES_MARKET_OVERVIEW;
    const impactGuide = getTradeImpactGuide('derivatives_overview');

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Crypto Derivatives စျေးကွက် ခြုံငုံသုံးသပ်ချက်' : 'Derivatives Market Overview'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'Open Interest၊ Perpetual နှင့် Futures ပမာဏ၊ Volmex Implied Volatility နှင့် CEX/DEX စျေးကွက်ဝေစုများ'
              : 'Global open interest aggregates, perpetual vs traditional futures volume, Volmex implied volatility, and CEX/DEX distribution.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="DERIVATIVES POSITIONING"
        />

        {/* Row 1: Open Interest & 24h Volume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Open Interest */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isMy ? 'စုစုပေါင်း အဖွင့်အော်ဒါများ (Open Interest)' : 'Open Interest'}
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">Total $467.18B</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-mono">Traditional Futures</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                  {data.openInterest.futures.value}
                </div>
                <div className="text-[11px] font-bold font-mono text-rose-400 mt-0.5">
                  ▼ {data.openInterest.futures.change24h}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-mono">Perpetual Contracts</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                  {data.openInterest.perpetuals.value}
                </div>
                <div className="text-[11px] font-bold font-mono text-emerald-400 mt-0.5">
                  ▲ {data.openInterest.perpetuals.change24h}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">Yesterday</div>
                <div className="font-bold text-white mt-0.5">{data.openInterest.historical.yesterday.perpetuals}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">Last Week</div>
                <div className="font-bold text-white mt-0.5">{data.openInterest.historical.lastWeek.perpetuals}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <div className="text-[10px] text-slate-400">Last Month</div>
                <div className="font-bold text-white mt-0.5">{data.openInterest.historical.lastMonth.perpetuals}</div>
              </div>
            </div>
          </div>

          {/* Card 2: 24h Derivatives Volume */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isMy ? '၂၄ နာရီ ကုန်သွယ်မှုပမာဏ (Derivatives Volume)' : '24h Derivatives Volume'}
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] font-mono text-blue-400">Total $836.05B</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-mono">Futures Volume</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                  $476.3M
                </div>
                <div className="text-[11px] font-bold font-mono text-rose-400 mt-0.5">
                  ▼ -49.06%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-mono">Perpetuals Volume</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-blue-400 mt-1">
                  $835.57B
                </div>
                <div className="text-[11px] font-bold font-mono text-emerald-400 mt-0.5">
                  ▲ +268.76%
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isMy
                ? 'Perpetual စျေးကွက်တွင် အရောင်းအဝယ်ပမာဏ ၂၆၈% ထိုးတက်ခဲ့ပြီး အဖွဲ့အစည်းကြီးများနှင့် လက်လီကုန်သွယ်သူများ Leverage တိုးမြှင့်ကစားနေကြောင်း ပြသနေသည်။'
                : 'Perpetuals volume saw explosive +268.76% intraday expansion, signaling aggressive speculative positioning across major USDⓈ-M and Coin-M contracts.'}
            </p>
          </div>
        </div>

        {/* Row 2: Volmex Implied Volatility & CEX/DEX Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Volmex Implied Volatility (Screenshot 21) */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Volmex Implied Volatility (IV)
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                30-Day Forward
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Bitcoin Volatility Index</span>
                  <span className="font-bold text-amber-400">BVIV</span>
                </div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {data.volmexImpliedVolatility.bitcoin.iv}
                </div>
                <div className="text-[11px] font-bold font-mono text-rose-400 mt-0.5">
                  ▼ {data.volmexImpliedVolatility.bitcoin.change24h}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Ethereum Volatility Index</span>
                  <span className="font-bold text-indigo-400">EVIV</span>
                </div>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {data.volmexImpliedVolatility.ethereum.iv}
                </div>
                <div className="text-[11px] font-bold font-mono text-rose-400 mt-0.5">
                  ▼ {data.volmexImpliedVolatility.ethereum.change24h}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              {isMy
                ? 'IV နှုန်းများ ၄၀% ကျော် ကျဆင်းနေခြင်းသည် မကြာမီ စျေးပေါက်ကွဲမှု မတိုင်မီ စျေးကွက်ငြိမ်သက်နေသည့် လက္ခဏာဖြစ်သည် (Volatility Squeeze)။'
                : 'Severe volatility compression (-49% in BVIV) typically precedes explosive directional breakout moves. Option premiums are historically inexpensive.'}
            </p>
          </div>

          {/* CEX vs DEX Derivatives Market Share */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  CEX vs DEX Derivatives Volume
                </h3>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">24h Total $193.97B</span>
            </div>

            {/* Split Bar */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${data.cexDexVolumeSplit.cexPct}%` }}
                />
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${data.cexDexVolumeSplit.dexPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-300">CEX: {data.cexDexVolumeSplit.cexPct}% ({data.cexDexVolumeSplit.cexVolume})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">DEX: {data.cexDexVolumeSplit.dexPct}% ({data.cexDexVolumeSplit.dexVolume})</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isMy
                ? 'ဗဟိုချုပ်ကိုင်မှုရှိသော CEX (Binance, OKX, Bybit) က စျေးကွက်၏ ၉၆.၅% ကို ဆက်လက်ထိန်းချုပ်ထားပြီး On-chain DEX (Hyperliquid, dYdX) က ၃.၅% အထိ တိုးတက်လာသည်။'
                : 'Centralized platforms still control 96.52% of liquidity, while decentralized perps (Hyperliquid, dYdX) represent $5.85B in transparent non-custodial volume.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. FUNDING RATES (Screenshot 22)
  if (section === 'funding_rates') {
    const data = CMC_FUNDING_RATES_DASHBOARD;
    const impactGuide = getTradeImpactGuide('funding_rates');

    const filteredCoins = data.multiExchangeRates.filter(
      (c) =>
        c.symbol.toLowerCase().includes(fundingSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(fundingSearch.toLowerCase())
    );

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Crypto Futures ၏ Funding Rates ဇယားများ' : 'Crypto Funding Rates'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? '၈ နာရီတစ်ကြိမ် အခကြေးငွေနှုန်းထားများ၊ အမြင့်ဆုံး/အနိမ့်ဆုံး စာရင်းနှင့် Exchanges ပေါင်းစုံ နှိုင်းယှဉ်ချက်'
              : 'Real-time 8-hour funding rates across major exchanges. Positive rates mean Longs pay Shorts; negative rates signal short-squeeze potential.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="FUNDING RATE ARBITRAGE"
        />

        {/* Average Funding Rate Banner (Screenshot 22) */}
        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {isMy ? 'စျေးကွက် ပျမ်းမျှ Funding Rate' : 'Market Average Funding Rate'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {data.averageFundingRate}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (+0.00 pp) · {data.sentimentSummary}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
              Reset Interval: Every 8 Hours (00:00, 08:00, 16:00 UTC)
            </span>
          </div>
        </div>

        {/* Highest vs Lowest Funding Rates Cards (Screenshot 22) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Highest Funding Rates */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{isMy ? 'အမြင့်ဆုံး Funding Rates (Long သမားများ ပေးရ)' : 'Highest Funding Rates (Longs Pay)'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">Extreme Carry Cost</span>
            </div>
            <div className="space-y-2">
              {data.highestFundingRates.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.symbol}</span>
                    <span className="text-[11px] text-slate-400">({item.exchange})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">{item.rate}</div>
                    <div className="text-[10px] text-slate-400">{item.annualized} APR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lowest Funding Rates */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>{isMy ? 'အနိမ့်ဆုံး Funding Rates (Short Squeeze အန္တရာယ်)' : 'Lowest Funding Rates (Short Squeeze Risk)'}</span>
              </h3>
              <span className="text-[11px] text-amber-400 font-bold">Shorts Pay Longs</span>
            </div>
            <div className="space-y-2">
              {data.lowestFundingRates.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.symbol}</span>
                    <span className="text-[11px] text-slate-400">({item.exchange})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-rose-400">{item.rate}</div>
                    <div className="text-[10px] text-slate-400">{item.annualized} APR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Exchange Funding Rate Comparison Table (Screenshot 22) */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isMy ? 'အဓိက Exchanges ပေါင်းစုံ Funding Rate ဇယား' : 'Multi-Exchange Funding Matrix'}
              </h3>
              <p className="text-xs text-slate-400">
                Comparing live rates across Binance, OKX, Bybit, Gate, Bitget, MEXC, KuCoin, BingX, and Hyperliquid.
              </p>
            </div>
            <input
              type="text"
              placeholder={isMy ? 'ရှာဖွေရန် (BTC, ETH, SOL...)' : 'Search coin...'}
              value={fundingSearch}
              onChange={(e) => setFundingSearch(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 w-full sm:w-48 font-mono"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Avg Rate</th>
                  <th className="py-2.5 px-3">Annualized</th>
                  <th className="py-2.5 px-3">Binance</th>
                  <th className="py-2.5 px-3">OKX</th>
                  <th className="py-2.5 px-3">Bybit</th>
                  <th className="py-2.5 px-3">Gate</th>
                  <th className="py-2.5 px-3">Hyperliquid</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCoins.map((row) => (
                  <tr key={row.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                      <span>{row.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({row.symbol})</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-200">{row.price}</td>
                    <td
                      className={`py-3 px-3 font-black ${
                        row.avgRate.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {row.avgRate}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{row.annualizedApr}</td>
                    <td className="py-3 px-3 text-slate-300">{row.binance}</td>
                    <td className="py-3 px-3 text-slate-300">{row.okx}</td>
                    <td className="py-3 px-3 text-slate-300">{row.bybit}</td>
                    <td className="py-3 px-3 text-slate-300">{row.gate}</td>
                    <td className="py-3 px-3 text-blue-400 font-bold">{row.hyperliquid}</td>
                    <td className="py-3 px-3 text-right">
                      {onTradeInDemo && (
                        <button
                          onClick={() => onTradeInDemo(`${row.symbol}USDT`)}
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

  // 3. LIQUIDATIONS (Screenshot 23)
  if (section === 'liquidations') {
    const data = CMC_LIQUIDATIONS_DASHBOARD;
    const impactGuide = getTradeImpactGuide('liquidations');

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? '၂၄ နာရီ Crypto Liquidations ရှင်းလင်းမှုများ' : 'Crypto Liquidations Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'လွန်ခဲ့သော ၂၄ နာရီအတွင်း Long/Short ပျက်စီးမှုများ၊ အကြီးမားဆုံး သမိုင်းဝင် Liquidations များနှင့် ဒင်္ဂါးအလိုက် အရှုံးများ'
              : '24-hour aggregate liquidation data, long vs short distribution, historical all-time liquidation records, and coin breakdown.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="LIQUIDATION CASCADE PROTECTION"
        />

        {/* 24-Hour Total Summary Cards (Screenshot 23) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Total 24h Liquidated:</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
              {data.totalLiquidations24h}
            </div>
            <span className="text-[10px] text-slate-400">Across 102,480 traders</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Long Positions Liquidated:</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400 mt-1">
              {data.longLiquidations24h}
            </div>
            <span className="text-[10px] text-rose-400 font-mono">{data.ratio.longPct}% of total liquidated</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Short Positions Liquidated:</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
              {data.shortLiquidations24h}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">{data.ratio.shortPct}% (Short Squeeze Triggered)</span>
          </div>
        </div>

        {/* All-Time Top Liquidation Events (Screenshot 23) */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{isMy ? 'သမိုင်းတစ်လျှောက် အကြီးမားဆုံး Liquidations မှတ်တမ်းများ' : 'All-Time Top Liquidation Events'}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.allTimeTopEvents.map((evt) => (
              <div
                key={evt.rank}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    Rank #{evt.rank}
                  </span>
                  <span className="text-slate-400">{evt.date}</span>
                </div>
                <div className="text-lg font-black font-mono text-rose-400">{evt.liquidatedUsd}</div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{evt.trigger}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coin Breakdown Table (Screenshot 23) */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <h3 className="text-sm sm:text-base font-black text-white">
            {isMy ? 'ဒင်္ဂါးအလိုက် ၂၄ နာရီ Liquidations ဇယား' : '24h Liquidations by Asset'}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">24h Change</th>
                  <th className="py-2.5 px-3">Longs Rekt</th>
                  <th className="py-2.5 px-3">Shorts Rekt</th>
                  <th className="py-2.5 px-3 text-right">Total Liquidated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.coinsBreakdown.map((c) => (
                  <tr key={c.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-400 font-bold">#{c.rank}</td>
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.symbol})</span>
                    </td>
                    <td className="py-3 px-3 text-slate-200">{c.price}</td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        c.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {c.change24h >= 0 ? '▲' : '▼'} {Math.abs(c.change24h).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-rose-400">{c.longsLiquidatedUsd}</td>
                    <td className="py-3 px-3 text-emerald-400">{c.shortsLiquidatedUsd}</td>
                    <td className="py-3 px-3 text-right font-black text-white">{c.totalLiquidatedUsd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 4. LIQUIDATION MAP (Screenshot 24)
  if (section === 'liquidation_map') {
    const data = CMC_BTC_LIQUIDATION_MAP;
    const impactGuide = getTradeImpactGuide('liquidation_map');

    return (
      <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isMy ? 'Bitcoin Liquidation Heatmap & သံလိုက်ဇုန်များ' : 'Bitcoin Liquidation Heatmap'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMy
              ? 'အထက်/အောက်ရှိ Liquidity ကလပ်စတာများ၊ Short Squeeze နှင့် Long Flush စျေးတန်းများ'
              : 'Cumulative liquidation leverage pools, key magnet target prices, and short squeeze clusters.'}
          </p>
        </div>

        {/* Trade Impact Guide Banner */}
        <TradeImpactBanner
          guide={impactGuide}
          lang={lang}
          onTradeInDemo={onTradeInDemo}
          onOpenCalculator={onOpenCalculator}
          contextTitle="MAGNET TARGETING"
        />

        {/* Current Price & Key Magnets (Screenshot 24) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current BTC Price */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {isMy ? 'လက်ရှိ Bitcoin စျေးနှုန်း' : 'Current Bitcoin Price'}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {data.currentPrice}
            </div>
            <div className="text-xs font-bold text-emerald-400 font-mono">
              ▲ {data.currentChange24h} in 24h
            </div>
          </div>

          {/* Upper Short Squeeze Magnet */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-emerald-400">Short Squeeze Ceiling</span>
              <span className="font-mono">{data.keyLevels.shortsAbove.distancePct}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {data.keyLevels.shortsAbove.price}
            </div>
            <p className="text-xs text-slate-400">
              {data.keyLevels.shortsAbove.liquidationVolumeUsd} in clustered short stops waiting to be swept.
            </p>
          </div>

          {/* Lower Long Flush Floor */}
          <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-rose-400">Long Flush Floor</span>
              <span className="font-mono">{data.keyLevels.longsBelow.distancePct}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
              {data.keyLevels.longsBelow.price}
            </div>
            <p className="text-xs text-slate-400">
              {data.keyLevels.longsBelow.liquidationVolumeUsd} in clustered long margin floors.
            </p>
          </div>
        </div>

        {/* Visual Liquidation Cluster Depth Meter (Screenshot 24) */}
        <div className="p-5 rounded-2xl bg-[#131722] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-white">
              Cumulative Liquidation Depth Distribution
            </h3>
            <span className="text-xs font-mono text-amber-400">
              Largest Magnet: {data.largestMagnetZone.price} ({data.largestMagnetZone.potentialLiquidationsUsd})
            </span>
          </div>

          {/* Bar depth visualizer */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">Above Price (Short Liquidation Pool)</span>
                <span className="text-white font-bold">{data.cumulativeLiquidationDepth.totalAbovePrice}</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">Below Price (Long Liquidation Pool)</span>
                <span className="text-white font-bold">{data.cumulativeLiquidationDepth.totalBelowPrice}</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '55%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
            💡 {data.cumulativeLiquidationDepth.dominance}. Market makers frequently target the larger pool ({data.keyLevels.longsBelow.price}) first before running the short stops.
          </div>
        </div>
      </div>
    );
  }

  // Safe fallback to prevent blank/white screen if any unhandled section occurs
  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          {isMy ? 'Crypto Derivatives စျေးကွက် ခြုံငုံသုံးသပ်ချက်' : 'Derivatives Market Overview'}
        </h1>
      </div>
      <TradeImpactBanner
        guide={getTradeImpactGuide('derivatives_overview')}
        lang={lang}
        onTradeInDemo={onTradeInDemo}
        onOpenCalculator={onOpenCalculator}
        contextTitle="DERIVATIVES REGIME"
      />
    </div>
  );
};
