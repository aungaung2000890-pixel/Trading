// CoinMarketCap Real-World Market Intelligence Data & Models
// Reflecting all 26 official CMC Sections: Markets, Indicators, ETF Flows, Derivatives, Technical Analysis
// With Comprehensive Trade Impact, Priority Actions, and Hazard Avoidance models

export interface TradeImpactGuide {
  bias: 'BULLISH' | 'BEARISH' | 'RANGE_ACCUMULATION' | 'HIGH_VOLATILITY' | 'SHORT_SQUEEZE_RISK' | 'LONG_CASCADE_RISK';
  headlineEn: string;
  headlineMy: string;
  impactEn: string;
  impactMy: string;
  priorityActionsEn: string[];
  priorityActionsMy: string[];
  hazardsToAvoidEn: string[];
  hazardsToAvoidMy: string[];
  recommendedSetup?: {
    action: 'LONG' | 'SHORT' | 'WAIT_RETEST' | 'HEDGE';
    symbol: string;
    trigger: string;
    invalidation: string;
    target: string;
  };
}

export interface ChainRankingItem {
  rank: number;
  name: string;
  symbol: string;
  dexVol7dUsd: string;
  dexVol7dChangePct: number;
  dexLiqUsd: string;
  uniqueTraders7d: string;
  totalDexs: string;
  tvlFormatted: string;
  tvlChange7dPct: number;
  activeProtocols: number;
  newTokens7d?: string;
  revenue7d?: string;
}

export interface TreasuryHoldingItem {
  rank: number;
  entity: string;
  ticker: string;
  country: string;
  btcHoldings: number;
  usdValue: string;
  entryAvgPrice: string;
  unrealizedProfitUsd: string;
  pctOfSupply?: string;
  latestAcquisitions?: string;
}

export interface ExchangeFlowItem {
  rank: number;
  exchange: string;
  totalAssetsUsd: string;
  netFlow24hUsd: number;
  netFlow24hFormatted: string;
  netFlow7dFormatted: string;
  netFlow30dFormatted: string;
  openInterestUsd: string;
  signal: 'ACCUMULATION' | 'DEPOSIT_PRESSURE' | 'NEUTRAL';
}

export interface EtfFlowItem {
  ticker: string;
  fundName: string;
  issuer: string;
  asset: 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'HYPE';
  flowDailyUsd: number;
  flowDailyFormatted: string;
  totalAumUsd: string;
  holdingsQty: string;
  marketSharePct?: string;
  status: 'ACTIVE' | 'PENDING_SEC';
}

export interface MultiExchangeFundingRateItem {
  symbol: string;
  name: string;
  price: string;
  avgRate: string;
  annualizedApr: string;
  sentiment: 'Neutral' | 'Longs Pay' | 'Shorts Pay' | 'Elevated Longs' | 'Extreme Squeeze';
  binance?: string;
  okx?: string;
  bybit?: string;
  gate?: string;
  bitget?: string;
  mexc?: string;
  kucoin?: string;
  bingx?: string;
  hyperliquid?: string;
}

export interface LiquidationEventItem {
  rank: number;
  symbol: string;
  name: string;
  price: string;
  change24h: number;
  longsLiquidatedUsd: string;
  shortsLiquidatedUsd: string;
  totalLiquidatedUsd: string;
}

export interface TechnicalOscillatorItem {
  rank: number;
  symbol: string;
  name: string;
  price: string;
  change24h: number;
  m15: number | string;
  h1: number | string;
  h4: number | string;
  d1: number | string;
  d7: number | string;
  condition: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT' | 'BULLISH_EXPANSION' | 'BEARISH_DIVERGENCE';
}

// ==========================================
// 1. GLOBAL MARKET OVERVIEW (Screenshots 1 & 6)
// ==========================================
export const CMC_MARKET_OVERVIEW = {
  totalMarketCapUsd: 2.60, // $2.60 Trillion
  marketCapChange24h: 0.65,
  volume24hUsd: 87.95, // $87.95 Billion
  volumeChange24h: -14.44,
  btcDominance: 58.9,
  btcDominanceChange: 0.15,
  ethDominance: 11.3,
  ethDominanceChange: -0.86,
  othersDominance: 29.7,
  othersDominanceChange: -1.01,
  totalCryptocurrencies: '60.63M',
  totalCryptosRaw: 60630000,
  activeExchanges: 978,
  gasEthGwei: 0.18,
  gasSolCost: '0.000005 SOL',
  fearAndGreed: {
    score: 64,
    sentiment: 'Greed',
    prevClose: 63,
    lastWeek: 71,
    lastMonth: 36,
    yearlyHigh: { score: 82, label: 'Extreme Greed', date: 'Aug 26, 2026' },
    yearlyLow: { score: 5, label: 'Extreme Fear', date: 'Feb 05, 2026' },
  },
  altcoinSeasonScore: 32, // 0-100 (<25 BTC season, >75 Alt season)
  cmc20Index: { value: 158.50, change24h: 0.85 },
  cmc100Index: { value: 150.84, change24h: 0.73 },
  topCoins: [
    { symbol: 'BTC', name: 'Bitcoin', price: 76074.78, change24h: 0.52, sparkline: [75400, 75800, 75600, 76200, 76074] },
    { symbol: 'ETH', name: 'Ethereum', price: 2407.35, change24h: 0.34, sparkline: [2380, 2410, 2395, 2415, 2407] },
    { symbol: 'BNB', name: 'BNB', price: 719.33, change24h: 0.74, sparkline: [712, 715, 718, 716, 719] },
    { symbol: 'SOL', name: 'Solana', price: 98.44, change24h: 1.61, sparkline: [96.5, 97.2, 96.8, 98.1, 98.44] },
    { symbol: 'XRP', name: 'XRP', price: 1.3055, change24h: 2.85, sparkline: [1.26, 1.28, 1.27, 1.31, 1.3055] },
  ],
};

// ==========================================
// 2. SPOT MARKET & HISTORICAL SNAPSHOT (Screenshot 2)
// ==========================================
export const CMC_SPOT_MARKET_DATA = {
  cryptoMarketCapUsd: '$2.60T',
  marketCapChange24h: -2.54,
  historicalValues: {
    yesterday: '$2.66T',
    lastWeek: '$2.68T',
    lastMonth: '$2.17T',
  },
  yearlyPerformance: {
    yearlyHigh: { value: '$4.28T', date: 'Oct 06, 2025' },
    yearlyLow: { value: '$2.04T', date: 'Jun 30, 2026' },
  },
  cexVolume24h: '$80.79B',
  dexVolume24h: '$7.16B',
  volumeMarketCapRatio: '3.38%',
  chartPoints: [
    { date: 'Sep 10', cap: 2.52, vol: 78.4 },
    { date: 'Sep 11', cap: 2.56, vol: 84.2 },
    { date: 'Sep 12', cap: 2.61, vol: 92.1 },
    { date: 'Sep 13', cap: 2.68, vol: 96.4 },
    { date: 'Sep 14', cap: 2.66, vol: 88.5 },
    { date: 'Sep 15', cap: 2.63, vol: 91.0 },
    { date: 'Sep 16', cap: 2.60, vol: 87.95 },
  ],
};

// ==========================================
// 3. NUMBER OF CRYPTOCURRENCIES (Screenshot 5)
// ==========================================
export const CMC_TRACKED_CRYPTOS_DATA = {
  totalTracked: '60.64M',
  totalTrackedRaw: 60640000,
  created24h: 135672,
  created7d: 675805,
  created30d: 3493632,
  yearlyPerformance: {
    yearlyHigh: { count: '7,681,147', date: 'Mar 18, 2026' },
    yearlyLow: { count: '77', date: 'Sep 15, 2026' },
  },
  chainDistribution: [
    { chain: 'Solana', percentage: 48.2, color: '#14F195' },
    { chain: 'Base', percentage: 24.6, color: '#0052FF' },
    { chain: 'BNB Smart Chain', percentage: 14.8, color: '#F3BA2F' },
    { chain: 'Ethereum', percentage: 6.4, color: '#627EEA' },
    { chain: 'Sui', percentage: 3.5, color: '#4CA2FE' },
    { chain: 'Others', percentage: 2.5, color: '#94A3B8' },
  ],
};

// ==========================================
// 4. CHAIN RANKINGS LEADERBOARD (Screenshot 4)
// ==========================================
export const CMC_CHAIN_RANKINGS_LEADERBOARD: ChainRankingItem[] = [
  {
    rank: 1,
    name: 'Solana',
    symbol: 'SOL',
    dexVol7dUsd: '$43.33B',
    dexVol7dChangePct: -8.23,
    dexLiqUsd: '$217.46B',
    uniqueTraders7d: '4.70M',
    totalDexs: '68',
    tvlFormatted: '$5.72B',
    tvlChange7dPct: -3.41,
    activeProtocols: 281,
    newTokens7d: '346,448',
    revenue7d: '$625.94K (+3.19%)',
  },
  {
    rank: 2,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    dexVol7dUsd: '$18.42B',
    dexVol7dChangePct: 1.57,
    dexLiqUsd: '$11.89B',
    uniqueTraders7d: '1.46M',
    totalDexs: '4,020',
    tvlFormatted: '$5.49B',
    tvlChange7dPct: 0.84,
    activeProtocols: 1006,
    newTokens7d: '124,100',
    revenue7d: '$508.52K',
  },
  {
    rank: 3,
    name: 'Robinhood Chain',
    symbol: 'HOOD',
    dexVol7dUsd: '$13.89B',
    dexVol7dChangePct: 14.20,
    dexLiqUsd: '$1.16B',
    uniqueTraders7d: '1.35M',
    totalDexs: '12',
    tvlFormatted: '$928.76M',
    tvlChange7dPct: 11.45,
    activeProtocols: 34,
    revenue7d: '$310.20K',
  },
  {
    rank: 4,
    name: 'Base',
    symbol: 'BASE',
    dexVol7dUsd: '$5.74B',
    dexVol7dChangePct: 19.58,
    dexLiqUsd: '$21.22B',
    uniqueTraders7d: '284.25K',
    totalDexs: '420',
    tvlFormatted: '$5.49B',
    tvlChange7dPct: -2.50,
    activeProtocols: 480,
    revenue7d: '$2.20M (+172.2%)',
  },
  {
    rank: 5,
    name: 'Ethereum',
    symbol: 'ETH',
    dexVol7dUsd: '$5.24B',
    dexVol7dChangePct: 9.84,
    dexLiqUsd: '$7.30B',
    uniqueTraders7d: '144.33K',
    totalDexs: '1,639',
    tvlFormatted: '$48.85B',
    tvlChange7dPct: 2.10,
    activeProtocols: 1639,
    revenue7d: '$537.61K',
  },
  {
    rank: 6,
    name: 'Arbitrum One',
    symbol: 'ARB',
    dexVol7dUsd: '$1.17B',
    dexVol7dChangePct: -4.12,
    dexLiqUsd: '$3.41B',
    uniqueTraders7d: '98.50K',
    totalDexs: '710',
    tvlFormatted: '$1.37B',
    tvlChange7dPct: 1.45,
    activeProtocols: 640,
    revenue7d: '$184.20K',
  },
  {
    rank: 7,
    name: 'HyperEVM',
    symbol: 'HYPE',
    dexVol7dUsd: '$678.59M',
    dexVol7dChangePct: -7.10,
    dexLiqUsd: '$111.98M',
    uniqueTraders7d: '62.40K',
    totalDexs: '18',
    tvlFormatted: '$1.27B',
    tvlChange7dPct: 4.80,
    activeProtocols: 52,
    revenue7d: '$412.00K',
  },
  {
    rank: 8,
    name: 'Near Protocol',
    symbol: 'NEAR',
    dexVol7dUsd: '$631.84M',
    dexVol7dChangePct: 29.07,
    dexLiqUsd: '$84.20M',
    uniqueTraders7d: '45.10K',
    totalDexs: '42',
    tvlFormatted: '$129.96M',
    tvlChange7dPct: 18.20,
    activeProtocols: 110,
    revenue7d: '$94.50K',
  },
  {
    rank: 9,
    name: 'Polygon PoS',
    symbol: 'POL',
    dexVol7dUsd: '$523.33M',
    dexVol7dChangePct: 8.27,
    dexLiqUsd: '$312.40M',
    uniqueTraders7d: '82.60K',
    totalDexs: '512',
    tvlFormatted: '$796.16M',
    tvlChange7dPct: -1.10,
    activeProtocols: 580,
    revenue7d: '$112.40K',
  },
  {
    rank: 10,
    name: 'Avalanche C-Chain',
    symbol: 'AVAX',
    dexVol7dUsd: '$505.25M',
    dexVol7dChangePct: -42.08,
    dexLiqUsd: '$198.50M',
    uniqueTraders7d: '38.20K',
    totalDexs: '260',
    tvlFormatted: '$527.18M',
    tvlChange7dPct: -5.40,
    activeProtocols: 340,
    revenue7d: '$78.90K',
  },
];

export const CMC_CHAIN_RANKINGS = CMC_CHAIN_RANKINGS_LEADERBOARD;

// Highest Growth Movers (Screenshot 4)
export const CMC_HIGHEST_TVL_GROWTH = [
  { name: 'Persist', growth: '+379.04%', cat: 'RWA & Credit' },
  { name: 'Nolus', growth: '+197.48%', cat: 'DeFi Lending' },
  { name: 'Qual', growth: '+90.85%', cat: 'Yield Protocol' },
  { name: 'Bifrost', growth: '+70.92%', cat: 'Liquid Staking' },
  { name: 'Chihuahua', growth: '+47.87%', cat: 'Cosmos AppChain' },
];

export const CMC_HIGHEST_DEX_VOL_GROWTH = [
  { name: 'Merlin Chain', growth: '+471.59%', cat: 'BTC Layer 2' },
  { name: 'XDC Network', growth: '+385.43%', cat: 'Enterprise Token' },
  { name: 'IoTeX', growth: '+303.35%', cat: 'DePIN Infrastructure' },
  { name: 'Arc', growth: '+257.88%', cat: 'Cross-chain DEX' },
  { name: 'Blast', growth: '+229.75%', cat: 'L2 Rollup' },
];

// ==========================================
// 5. PUBLIC COMPANIES BITCOIN TREASURIES (Screenshot 4/Public)
// ==========================================
export const CMC_PUBLIC_BTC_TREASURIES: TreasuryHoldingItem[] = [
  {
    rank: 1,
    entity: 'Strategy Inc.',
    ticker: 'MSTR',
    country: 'US (United States)',
    btcHoldings: 843775,
    usdValue: '$64.23B',
    entryAvgPrice: '$75.47K',
    unrealizedProfitUsd: '+$520M (+0.81%)',
    pctOfSupply: '4.018%',
    latestAcquisitions: '-2,225 BTC (Portfolio adjustment)',
  },
  {
    rank: 2,
    entity: 'Twenty One Capital',
    ticker: 'XXI',
    country: 'US (United States)',
    btcHoldings: 43514,
    usdValue: '$3.31B',
    entryAvgPrice: '$76.09K',
    unrealizedProfitUsd: '+$12.4M (+0.38%)',
    pctOfSupply: '0.207%',
  },
  {
    rank: 3,
    entity: 'XXI Capital Trust',
    ticker: 'CEP',
    country: 'US (United States)',
    btcHoldings: 43500,
    usdValue: '$3.31B',
    entryAvgPrice: '$87.00K',
    unrealizedProfitUsd: '-$474M (-12.5%)',
    pctOfSupply: '0.207%',
  },
  {
    rank: 4,
    entity: 'Metaplanet Inc.',
    ticker: 'MPJPY',
    country: 'JP (Japan)',
    btcHoldings: 43000,
    usdValue: '$3.27B',
    entryAvgPrice: '$68.40K',
    unrealizedProfitUsd: '+$330M (+11.2%)',
    pctOfSupply: '0.205%',
  },
  {
    rank: 5,
    entity: 'MARA Holdings, Inc.',
    ticker: 'MARA',
    country: 'US (United States)',
    btcHoldings: 36303,
    usdValue: '$2.76B',
    entryAvgPrice: '$44.10K',
    unrealizedProfitUsd: '+$1.16B (+72.5%)',
    pctOfSupply: '0.173%',
    latestAcquisitions: '+2,247 BTC mined',
  },
  {
    rank: 6,
    entity: 'Bitcoin Standard Treasury',
    ticker: 'CEPO',
    country: 'US (United States)',
    btcHoldings: 30021,
    usdValue: '$2.28B',
    entryAvgPrice: '$62.10K',
    unrealizedProfitUsd: '+$420M (+22.5%)',
    pctOfSupply: '0.143%',
  },
  {
    rank: 7,
    entity: 'Bitcoin Standard Treasury Co',
    ticker: 'BSTR',
    country: 'US (United States)',
    btcHoldings: 30021,
    usdValue: '$2.28B',
    entryAvgPrice: '$64.80K',
    unrealizedProfitUsd: '+$339M (+17.4%)',
    pctOfSupply: '0.143%',
  },
  {
    rank: 8,
    entity: 'Bullish Global',
    ticker: 'BLSH',
    country: 'US (United States)',
    btcHoldings: 24300,
    usdValue: '$1.84B',
    entryAvgPrice: '$58.20K',
    unrealizedProfitUsd: '+$434M (+30.7%)',
    pctOfSupply: '0.116%',
  },
  {
    rank: 9,
    entity: 'Strive Asset Management',
    ticker: 'ASST',
    country: 'US (United States)',
    btcHoldings: 20000,
    usdValue: '$1.52B',
    entryAvgPrice: '$70.28K',
    unrealizedProfitUsd: '+$116M (+8.27%)',
    pctOfSupply: '0.095%',
  },
  {
    rank: 10,
    entity: 'SpaceX Corporation',
    ticker: 'SPCX',
    country: 'US (United States)',
    btcHoldings: 18712,
    usdValue: '$1.42B',
    entryAvgPrice: '$35.32K',
    unrealizedProfitUsd: '+$762M (+115.4%)',
    pctOfSupply: '0.089%',
  },
  {
    rank: 11,
    entity: 'Coinbase Global, Inc.',
    ticker: 'COIN',
    country: 'US (United States)',
    btcHoldings: 16492,
    usdValue: '$1.25B',
    entryAvgPrice: '$2.87K',
    unrealizedProfitUsd: '+$1.20B (+2550%)',
    pctOfSupply: '0.079%',
  },
  {
    rank: 12,
    entity: 'Hut 8 Mining Corp',
    ticker: 'HUT',
    country: 'US (United States)',
    btcHoldings: 16332,
    usdValue: '$1.24B',
    entryAvgPrice: '$38.50K',
    unrealizedProfitUsd: '+$613M (+97.6%)',
    pctOfSupply: '0.078%',
  },
  {
    rank: 13,
    entity: 'Riot Platforms, Inc.',
    ticker: 'RIOT',
    country: 'US (United States)',
    btcHoldings: 15680,
    usdValue: '$1.19B',
    entryAvgPrice: '$41.20K',
    unrealizedProfitUsd: '+$546M (+84.6%)',
    pctOfSupply: '0.075%',
  },
  {
    rank: 14,
    entity: 'CleanSpark, Inc.',
    ticker: 'CLSK',
    country: 'US (United States)',
    btcHoldings: 13924,
    usdValue: '$1.06B',
    entryAvgPrice: '$46.80K',
    unrealizedProfitUsd: '+$407M (+62.5%)',
    pctOfSupply: '0.066%',
  },
  {
    rank: 15,
    entity: 'Tesla, Inc.',
    ticker: 'TSLA',
    country: 'US (United States)',
    btcHoldings: 11509,
    usdValue: '$876.19M',
    entryAvgPrice: '$33.53K',
    unrealizedProfitUsd: '+$490M (+126.9%)',
    pctOfSupply: '0.055%',
  },
  {
    rank: 16,
    entity: 'Trump Media & Technology (DJT)',
    ticker: 'DJT',
    country: 'US (United States)',
    btcHoldings: 9542,
    usdValue: '$726.44M',
    entryAvgPrice: '$71.40K',
    unrealizedProfitUsd: '+$44.6M (+6.55%)',
    pctOfSupply: '0.045%',
  },
  {
    rank: 17,
    entity: 'Block, Inc. (Square)',
    ticker: 'XYZ',
    country: 'US (United States)',
    btcHoldings: 8488,
    usdValue: '$645.75M',
    entryAvgPrice: '$33.79K',
    unrealizedProfitUsd: '+$358M (+125.1%)',
    pctOfSupply: '0.040%',
  },
];

export const CMC_PUBLIC_BTC_MACRO = {
  totalSupplyHeld: '1.35M / 21.0M BTC (6.43% of total supply)',
  totalBtcHeldRaw: 1349662,
  totalHoldingValueUsd: '$102.68B',
  countriesBreakdown: [
    { country: 'United States (US)', pct: 92.6, color: '#3B82F6' },
    { country: 'Japan (JP)', pct: 3.3, color: '#EF4444' },
    { country: 'China (CN)', pct: 0.7, color: '#F59E0B' },
    { country: 'Canada (CA)', pct: 0.7, color: '#10B981' },
    { country: 'Others', pct: 2.7, color: '#94A3B8' },
  ],
};

// ==========================================
// 6. PUBLIC COMPANIES BNB TREASURIES (Screenshot 3)
// ==========================================
export const CMC_PUBLIC_BNB_TREASURIES = [
  {
    rank: 1,
    entity: 'CEA Industries Inc.',
    ticker: 'BNC',
    country: 'US (United States)',
    bnbHoldings: 515054,
    usdValue: '$370.57M',
    pctOfSupply: '75.07%',
  },
  {
    rank: 2,
    entity: 'Nano Labs Ltd',
    ticker: 'NA',
    country: 'CN (China)',
    bnbHoldings: 128000,
    usdValue: '$92.09M',
    pctOfSupply: '18.66%',
  },
  {
    rank: 3,
    entity: 'The Brooker Group BK',
    ticker: 'BTC',
    country: 'TH (Thailand)',
    bnbHoldings: 43022,
    usdValue: '$30.95M',
    pctOfSupply: '6.27%',
  },
];

export const CMC_TREASURIES = CMC_PUBLIC_BTC_TREASURIES;

export const CMC_BNB_TREASURIES_DATA = {
  ecosystemReserve: '32.40M BNB',
  usdValue: '$21.2B',
  autoBurn28th: '1.77M BNB',
  bscStaked: '22.8M BNB',
  circulatingPct: '15.4% of Circulating Supply',
};

export const CMC_BNB_TREASURIES_MACRO = {
  totalSupplyHeld: '686,076 BNB / 133.2M (0.52% of total supply)',
  totalValueUsd: '$493.61M',
  countriesBreakdown: [
    { country: 'United States (US)', pct: 75.1, color: '#3B82F6' },
    { country: 'China (CN)', pct: 18.7, color: '#EF4444' },
    { country: 'Thailand (TH)', pct: 6.3, color: '#10B981' },
  ],
};

// ==========================================
// 7. EXCHANGES ASSET INFLOWS & OUTFLOWS (Screenshot 7)
// ==========================================
export const CMC_EXCHANGE_INFLOWS_OUTFLOWS: ExchangeFlowItem[] = [
  {
    rank: 1,
    exchange: 'Binance',
    totalAssetsUsd: '$160.88B',
    netFlow24hUsd: 95730000,
    netFlow24hFormatted: '+$95.73M',
    netFlow7dFormatted: '-$185.13M',
    netFlow30dFormatted: '+$1.53B',
    openInterestUsd: '$31.91B',
    signal: 'DEPOSIT_PRESSURE',
  },
  {
    rank: 2,
    exchange: 'OKX',
    totalAssetsUsd: '$19.38B',
    netFlow24hUsd: 44970000,
    netFlow24hFormatted: '+$44.97M',
    netFlow7dFormatted: '+$195.37M',
    netFlow30dFormatted: '+$114.55M',
    openInterestUsd: '$7.03B',
    signal: 'DEPOSIT_PRESSURE',
  },
  {
    rank: 3,
    exchange: 'Bitfinex',
    totalAssetsUsd: '$18.57B',
    netFlow24hUsd: 59280000,
    netFlow24hFormatted: '+$59.28M',
    netFlow7dFormatted: '+$141.26M',
    netFlow30dFormatted: '+$26.17M',
    openInterestUsd: '$712.33M',
    signal: 'DEPOSIT_PRESSURE',
  },
  {
    rank: 4,
    exchange: 'Bybit',
    totalAssetsUsd: '$11.40B',
    netFlow24hUsd: -34110000,
    netFlow24hFormatted: '-$34.11M',
    netFlow7dFormatted: '-$5.93M',
    netFlow30dFormatted: '-$1.44B',
    openInterestUsd: '$5.90B',
    signal: 'ACCUMULATION',
  },
  {
    rank: 5,
    exchange: 'Bitget',
    totalAssetsUsd: '$6.35B',
    netFlow24hUsd: 42630000,
    netFlow24hFormatted: '+$42.63M',
    netFlow7dFormatted: '-$31.72M',
    netFlow30dFormatted: '-$302.14M',
    openInterestUsd: '$4.07B',
    signal: 'DEPOSIT_PRESSURE',
  },
  {
    rank: 6,
    exchange: 'Gate.io',
    totalAssetsUsd: '$5.22B',
    netFlow24hUsd: -5890000,
    netFlow24hFormatted: '-$5.89M',
    netFlow7dFormatted: '+$22.65M',
    netFlow30dFormatted: '-$3.76B',
    openInterestUsd: '$11.03B',
    signal: 'ACCUMULATION',
  },
  {
    rank: 7,
    exchange: 'MEXC',
    totalAssetsUsd: '$4.55B',
    netFlow24hUsd: 854650,
    netFlow24hFormatted: '+$854.65K',
    netFlow7dFormatted: '-$9.26M',
    netFlow30dFormatted: '-$904.62M',
    openInterestUsd: '$5.24B',
    signal: 'NEUTRAL',
  },
  {
    rank: 8,
    exchange: 'KuCoin',
    totalAssetsUsd: '$3.34B',
    netFlow24hUsd: 34210000,
    netFlow24hFormatted: '+$34.21M',
    netFlow7dFormatted: '+$83.67M',
    netFlow30dFormatted: '-$193.41M',
    openInterestUsd: '$2.86B',
    signal: 'DEPOSIT_PRESSURE',
  },
  {
    rank: 9,
    exchange: 'HTX (Huobi)',
    totalAssetsUsd: '$3.26B',
    netFlow24hUsd: 122980,
    netFlow24hFormatted: '+$122.98K',
    netFlow7dFormatted: '-$10.70M',
    netFlow30dFormatted: '-$8.53M',
    openInterestUsd: '$1.78B',
    signal: 'NEUTRAL',
  },
  {
    rank: 10,
    exchange: 'Crypto.com',
    totalAssetsUsd: '$2.02B',
    netFlow24hUsd: -87450000,
    netFlow24hFormatted: '-$87.45M',
    netFlow7dFormatted: '-$90.55M',
    netFlow30dFormatted: '-$368.30M',
    openInterestUsd: '$1.71B',
    signal: 'ACCUMULATION',
  },
  {
    rank: 11,
    exchange: 'BingX',
    totalAssetsUsd: '$952.79M',
    netFlow24hUsd: 3970000,
    netFlow24hFormatted: '+$3.97M',
    netFlow7dFormatted: '+$21.99M',
    netFlow30dFormatted: '+$87.61K',
    openInterestUsd: '$2.97B',
    signal: 'NEUTRAL',
  },
];

export const CMC_EXCHANGE_FLOWS = CMC_EXCHANGE_INFLOWS_OUTFLOWS;

// ==========================================
// 8. ALTCOIN SEASON INDEX (Screenshot 10)
// ==========================================
export const CMC_ALTCOIN_SEASON_DATA = {
  score: 32,
  label: 'Bitcoin Season',
  description: 'Only 32% of the top 50 altcoins outperformed Bitcoin over the last 90 days. Bitcoin dominance remains firmly in control of broader risk capital.',
  historical: [
    { label: 'Today', score: 32 },
    { label: 'Yesterday', score: 32 },
    { label: 'Last Week', score: 39 },
    { label: 'Last Month', score: 47 },
    { label: 'Yearly High', score: 78 },
    { label: 'Yearly Low', score: 14 },
  ],
  topMovers90d: [
    { symbol: 'PONS', name: 'Pons Token', gain90d: '+5781.47%', outperformingBtc: true },
    { symbol: 'LSK', name: 'Lisk', gain90d: '+690.67%', outperformingBtc: true },
    { symbol: 'ZEC', name: 'Zcash', gain90d: '+188.10%', outperformingBtc: true },
    { symbol: 'LIT', name: 'Litentry', gain90d: '+179.24%', outperformingBtc: true },
    { symbol: 'PUMP', name: 'Pump Science', gain90d: '+153.98%', outperformingBtc: true },
    { symbol: 'RAY', name: 'Raydium', gain90d: '+130.23%', outperformingBtc: true },
    { symbol: 'UNI', name: 'Uniswap', gain90d: '+111.35%', outperformingBtc: true },
    { symbol: 'ARB', name: 'Arbitrum', gain90d: '+92.12%', outperformingBtc: true },
    { symbol: 'CAKE', name: 'PancakeSwap', gain90d: '+69.20%', outperformingBtc: true },
    { symbol: 'PENDLE', name: 'Pendle Finance', gain90d: '+63.72%', outperformingBtc: true },
    { symbol: 'AAVE', name: 'Aave', gain90d: '+58.74%', outperformingBtc: true },
    { symbol: 'SOL', name: 'Solana', gain90d: '+41.14%', outperformingBtc: true },
    { symbol: 'ETH', name: 'Ethereum', gain90d: '+40.81%', outperformingBtc: false },
    { symbol: 'LINK', name: 'Chainlink', gain90d: '+37.48%', outperformingBtc: false },
  ],
};

// ==========================================
// 9. CRYPTO MARKET CYCLE INDICATORS (Screenshot 11)
// ==========================================
export const CMC_MARKET_CYCLE_INDICATORS = {
  puellMultiple: {
    value: 1.06,
    change24h: '-4.95%',
    threshold: '>= 2.2',
    status: 'Undervalued / Healthy Miner Supply',
    triggered: false,
  },
  piCycleTop: {
    status: "Didn't cross (Safe Hold Zone)",
    dma111: '$67,417.18',
    dma350x2: '$159,611.06',
    currentPrice: '$76,074.78',
    distanceToTop: '52.3% below cycle top threshold',
    hitIndicators: '0 / 30 Peak Thresholds Met (0.0%)',
    triggered: false,
  },
  ahr999Index: {
    value: 0.47,
    change24h: '-6.00%',
    threshold: '>= 4.0',
    status: 'Bottom DCA Accumulation Zone (< 0.45)',
    triggered: false,
  },
  rainbowChart: {
    colorBand: 'Band 1: Basically a Fire Sale',
    score: 1,
    threshold: '>= 5 (Is this a Bubble?)',
    triggered: false,
  },
  etfOutflowsDays: {
    consecutiveDays: 2,
    threshold: '>= 10 Consecutive Days',
    triggered: false,
  },
  etfToBtcRatio: {
    ratio: '0.10%',
    threshold: '<= 3.5%',
    triggered: false,
  },
};

export const CMC_SOCIAL_MENTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', mentions24h: 184520, change24h: '+14.2%', bullishPct: 78, sentiment: 'EXTREMELY_BULLISH' },
  { symbol: 'ETH', name: 'Ethereum', mentions24h: 96420, change24h: '+8.7%', bullishPct: 69, sentiment: 'BULLISH' },
  { symbol: 'SOL', name: 'Solana', mentions24h: 84120, change24h: '+21.4%', bullishPct: 82, sentiment: 'EXTREMELY_BULLISH' },
  { symbol: 'XRP', name: 'Ripple', mentions24h: 42190, change24h: '+5.1%', bullishPct: 64, sentiment: 'MODERATE_BULLISH' },
  { symbol: 'DOGE', name: 'Dogecoin', mentions24h: 38700, change24h: '-2.4%', bullishPct: 58, sentiment: 'NEUTRAL' },
  { symbol: 'ADA', name: 'Cardano', mentions24h: 19400, change24h: '+1.8%', bullishPct: 55, sentiment: 'NEUTRAL' },
  { symbol: 'AVAX', name: 'Avalanche', mentions24h: 14200, change24h: '+11.2%', bullishPct: 71, sentiment: 'BULLISH' },
  { symbol: 'SUI', name: 'Sui Network', mentions24h: 31200, change24h: '+44.8%', bullishPct: 86, sentiment: 'EXTREMELY_BULLISH' },
];

export const CMC_MARKET_CYCLES = {
  piCycleTop: {
    status: "Didn't cross (Safe Hold Zone)",
    dma111: '$67,417.18',
    dma350x2: '$159,611.06',
    distanceToTop: '52.3% below cycle top threshold',
  },
  mvrvZScore: {
    value: '2.14',
    zone: 'Mid-Cycle Healthy Growth Zone (1.5 - 3.5)',
  },
  twoHundredWeekMa: {
    ma200w: '$38,450.00',
    premiumPct: '+97.8%',
    status: 'Healthy Macro Bull Market Structure',
  },
};

// ==========================================
// 10. CMC 20 & CMC 100 INDEXES (Screenshots 13 & 14)
// ==========================================
export const CMC_20_INDEX_DATA = {
  price: '$158.50',
  change24h: '+0.85%',
  historical: {
    yesterday: '$157.16',
    lastWeek: '$163.00',
    lastMonth: '$131.37',
    yearlyHigh: '$275.48',
    yearlyLow: '$118.40',
  },
  constituents: [
    { symbol: 'BTC', name: 'Bitcoin', weight: 69.63, price: '$76,072.33', change24h: '+0.52%' },
    { symbol: 'ETH', name: 'Ethereum', weight: 13.39, price: '$2,407.56', change24h: '+0.34%' },
    { symbol: 'BNB', name: 'BNB', weight: 4.36, price: '$719.49', change24h: '+0.74%' },
    { symbol: 'XRP', name: 'XRP', weight: 3.74, price: '$1.3055', change24h: '+2.85%' },
    { symbol: 'SOL', name: 'Solana', weight: 2.63, price: '$98.46', change24h: '+1.61%' },
    { symbol: 'TRX', name: 'TRON', weight: 1.45, price: '$0.3354', change24h: '-0.12%' },
    { symbol: 'ZEC', name: 'Zcash', weight: 1.01, price: '$1,310.93', change24h: '+17.87%' },
    { symbol: 'HYPE', name: 'Hyperliquid', weight: 0.90, price: '$78.43', change24h: '-1.40%' },
    { symbol: 'DOGE', name: 'Dogecoin', weight: 0.57, price: '$0.08051', change24h: '+1.80%' },
    { symbol: 'LINK', name: 'Chainlink', weight: 0.37, price: '$10.95', change24h: '+0.95%' },
    { symbol: 'OTHERS', name: 'Remaining 10', weight: 1.95, price: 'Basket', change24h: '+0.40%' },
  ],
};

export const CMC_100_INDEX_DATA = {
  price: '$150.84',
  change24h: '+0.73%',
  historical: {
    yesterday: '$149.94',
    lastWeek: '$155.48',
    lastMonth: '$125.02',
    yearlyHigh: '$263.19',
    yearlyLow: '$112.93',
  },
  constituents: [
    { symbol: 'BTC', name: 'Bitcoin', weight: 66.85, price: '$76,072.33', change24h: '+0.52%' },
    { symbol: 'ETH', name: 'Ethereum', weight: 12.85, price: '$2,407.56', change24h: '+0.34%' },
    { symbol: 'BNB', name: 'BNB', weight: 4.19, price: '$719.49', change24h: '+0.74%' },
    { symbol: 'XRP', name: 'XRP', weight: 3.60, price: '$1.3055', change24h: '+2.85%' },
    { symbol: 'SOL', name: 'Solana', weight: 2.53, price: '$98.46', change24h: '+1.61%' },
    { symbol: 'TRX', name: 'TRON', weight: 1.39, price: '$0.3354', change24h: '-0.12%' },
    { symbol: 'ZEC', name: 'Zcash', weight: 0.97, price: '$1,310.93', change24h: '+17.87%' },
    { symbol: 'HYPE', name: 'Hyperliquid', weight: 0.86, price: '$78.43', change24h: '-1.40%' },
    { symbol: 'DOGE', name: 'Dogecoin', weight: 0.55, price: '$0.08051', change24h: '+1.80%' },
    { symbol: 'XMR', name: 'Monero', weight: 0.41, price: '$178.20', change24h: '+0.45%' },
    { symbol: 'OTHERS', name: 'Remaining 90', weight: 5.80, price: 'Basket', change24h: '+0.62%' },
  ],
};

// ==========================================
// 11. COMPLETE ETF FLOW TRACKER (Screenshots 15-20)
// ==========================================
export const CMC_GLOBAL_ETF_TRACKER = {
  netFlow24hUsd: -610100000,
  netFlow24hFormatted: '-$610.10M',
  byCoinBreakdown: {
    btc: '-$450.40M',
    eth: '-$157.10M',
    sol: '+$1.30M',
    xrp: '$0.00',
    hype: '-$3.90M',
  },
  historicalNetFlow: {
    lastWeek: '-$90.51M',
    lastMonth: '-$56.20M',
    last3Months: '-$112.80M',
  },
  yearlyPerformance: {
    strongestMonth: { month: 'Jul 2026', flow: '+$5.48B' },
    weakestMonth: { month: 'May 2026', flow: '-$5.05B' },
  },
  totalAumUsd: '$114.34B',
  aumAsPctOfMarketCap: {
    total: '6.31%',
    btc: '6.57% ($104.0B AUM)',
    eth: '5.01% ($15.0B AUM)',
    sol: 'Pending SEC / Custody $840M',
    xrp: '$1.63B (Trusts)',
  },
  funds: [
    { ticker: 'IBIT', fundName: 'iShares Bitcoin Trust', issuer: 'BlackRock', asset: 'BTC', flowDailyUsd: -184200000, flowDailyFormatted: '-$184.2M', totalAumUsd: '$61.80B', holdingsQty: '812,400 BTC', status: 'ACTIVE' },
    { ticker: 'FBTC', fundName: 'Fidelity Wise Origin BTC', issuer: 'Fidelity', asset: 'BTC', flowDailyUsd: -112400000, flowDailyFormatted: '-$112.4M', totalAumUsd: '$13.46B', holdingsQty: '176,900 BTC', status: 'ACTIVE' },
    { ticker: 'GBTC', fundName: 'Grayscale Bitcoin Trust', issuer: 'Grayscale', asset: 'BTC', flowDailyUsd: -94200000, flowDailyFormatted: '-$94.2M', totalAumUsd: '$9.75B', holdingsQty: '128,150 BTC', status: 'ACTIVE' },
    { ticker: 'ETHA', fundName: 'iShares Ethereum Trust', issuer: 'BlackRock', asset: 'ETH', flowDailyUsd: -88400000, flowDailyFormatted: '-$88.4M', totalAumUsd: '$8.61B', holdingsQty: '3,577,000 ETH', status: 'ACTIVE' },
    { ticker: 'BTC', fundName: 'Grayscale Bitcoin Mini Trust', issuer: 'Grayscale', asset: 'BTC', flowDailyUsd: -38200000, flowDailyFormatted: '-$38.2M', totalAumUsd: '$4.86B', holdingsQty: '63,900 BTC', status: 'ACTIVE' },
    { ticker: 'BITB', fundName: 'Bitwise Bitcoin ETF', issuer: 'Bitwise', asset: 'BTC', flowDailyUsd: -21400000, flowDailyFormatted: '-$21.4M', totalAumUsd: '$2.89B', holdingsQty: '37,980 BTC', status: 'ACTIVE' },
    { ticker: 'ARKB', fundName: 'ARK 21Shares Bitcoin ETF', issuer: 'ARK / 21Shares', asset: 'BTC', flowDailyUsd: 0, flowDailyFormatted: '$0.00', totalAumUsd: '$2.52B', holdingsQty: '33,120 BTC', status: 'ACTIVE' },
    { ticker: 'ETH', fundName: 'Grayscale Ethereum Mini Trust', issuer: 'Grayscale', asset: 'ETH', flowDailyUsd: -28100000, flowDailyFormatted: '-$28.1M', totalAumUsd: '$2.20B', holdingsQty: '914,000 ETH', status: 'ACTIVE' },
    { ticker: 'ETHE', fundName: 'Grayscale Ethereum Trust', issuer: 'Grayscale', asset: 'ETH', flowDailyUsd: -32400000, flowDailyFormatted: '-$32.4M', totalAumUsd: '$1.83B', holdingsQty: '760,200 ETH', status: 'ACTIVE' },
    { ticker: 'FETH', fundName: 'Fidelity Ethereum Fund', issuer: 'Fidelity', asset: 'ETH', flowDailyUsd: -8200000, flowDailyFormatted: '-$8.2M', totalAumUsd: '$1.37B', holdingsQty: '569,000 ETH', status: 'ACTIVE' },
    // Solana ETFs
    { ticker: 'BSOL', fundName: 'Bitwise Solana Staking ETP', issuer: 'Bitwise', asset: 'SOL', flowDailyUsd: 840000, flowDailyFormatted: '+$840K', totalAumUsd: '$340M', holdingsQty: '3,453,000 SOL', status: 'ACTIVE' },
    { ticker: 'VSOL', fundName: 'VanEck Solana Trust', issuer: 'VanEck', asset: 'SOL', flowDailyUsd: 460000, flowDailyFormatted: '+$460K', totalAumUsd: '$280M', holdingsQty: '2,844,000 SOL', status: 'ACTIVE' },
    { ticker: 'SOEZ', fundName: 'Franklin Solana Trust', issuer: 'Franklin Templeton', asset: 'SOL', flowDailyUsd: 0, flowDailyFormatted: 'S-1 Filed', totalAumUsd: 'Awaiting SEC', holdingsQty: 'Pending', status: 'PENDING_SEC' },
    // XRP ETFs
    { ticker: 'TOXR', fundName: '21Shares Core XRP ETP', issuer: '21Shares', asset: 'XRP', flowDailyUsd: 0, flowDailyFormatted: '$0.00', totalAumUsd: '$780M', holdingsQty: '597,400,000 XRP', status: 'ACTIVE' },
    { ticker: 'XRPC', fundName: 'Canary XRP ETF', issuer: 'Canary Capital', asset: 'XRP', flowDailyUsd: 0, flowDailyFormatted: 'S-1 Filed', totalAumUsd: 'Awaiting SEC', holdingsQty: 'Pending Review', status: 'PENDING_SEC' },
    // Hyperliquid ETFs
    { ticker: 'BHYP', fundName: 'Bitwise Hyperliquid Index', issuer: 'Bitwise', asset: 'HYPE', flowDailyUsd: -2400000, flowDailyFormatted: '-$2.4M', totalAumUsd: '$18.4M', holdingsQty: '234,600 HYPE', status: 'ACTIVE' },
    { ticker: 'HYPG', fundName: 'Grayscale Hyperliquid Fund', issuer: 'Grayscale', asset: 'HYPE', flowDailyUsd: -1500000, flowDailyFormatted: '-$1.5M', totalAumUsd: '$7.1M', holdingsQty: '90,500 HYPE', status: 'ACTIVE' },
  ] as EtfFlowItem[],
};

export const CMC_EXTENDED_ETFS = CMC_GLOBAL_ETF_TRACKER.funds;

// ==========================================
// 12. DERIVATIVES MARKET OVERVIEW (Screenshot 21)
// ==========================================
export const CMC_DERIVATIVES_MARKET_OVERVIEW = {
  openInterest: {
    futures: { value: '$1.27B', change24h: '-2.15%' },
    perpetuals: { value: '$465.91B', change24h: '+9.82%' },
    historical: {
      yesterday: { futures: '$1.30B', perpetuals: '$424.24B' },
      lastWeek: { futures: '$1.37B', perpetuals: '$432.28B' },
      lastMonth: { futures: '$2.12B', perpetuals: '$372.84B' },
    },
    yearlyPerformance: {
      yearlyHigh: '$1.14T',
      yearlyLow: '$1.27B',
    },
  },
  derivativesVolume: {
    futures24h: '$476.30M (-49.06%)',
    perpetuals24h: '$835.57B (+268.76%)',
  },
  volmexImpliedVolatility: {
    bitcoin: { iv: 38.87, change24h: '-49.09%' },
    ethereum: { iv: 55.52, change24h: '-43.87%' },
  },
  cexDexVolumeSplit: {
    cexPct: 96.52,
    cexVolume: '$188.12B',
    dexPct: 3.48,
    dexVolume: '$5.85B',
  },
};

// ==========================================
// 13. CRYPTO FUNDING RATES DASHBOARD (Screenshot 22)
// ==========================================
export const CMC_FUNDING_RATES_DASHBOARD = {
  averageFundingRate: '+0.005%',
  sentimentSummary: 'Longs pay shorts (+0.00 pp) · Healthy baseline carry cost',
  highestFundingRates: [
    { symbol: 'MON', exchange: 'CoinEx', rate: '+1.500%', annualized: '+1642%' },
    { symbol: 'STX', exchange: 'Bullbit', rate: '+1.170%', annualized: '+1281%' },
    { symbol: 'APT', exchange: 'Bullbit', rate: '+1.082%', annualized: '+1184%' },
    { symbol: 'HYPE', exchange: 'Bullbit', rate: '+1.070%', annualized: '+1171%' },
    { symbol: 'XRP', exchange: 'Bullbit', rate: '+1.060%', annualized: '+1160%' },
  ],
  lowestFundingRates: [
    { symbol: 'BDX', exchange: 'CoinEx', rate: '-1.500%', annualized: '-1642%' },
    { symbol: 'LSK', exchange: 'Bitbaby', rate: '-1.000%', annualized: '-1095%' },
    { symbol: 'ENA', exchange: 'LBank', rate: '-0.750%', annualized: '-821%' },
    { symbol: 'PEPE', exchange: 'XT.COM', rate: '-0.570%', annualized: '-624%' },
    { symbol: 'KAS', exchange: 'CoinEx', rate: '-0.480%', annualized: '-525%' },
  ],
  multiExchangeRates: [
    { symbol: 'BTC', name: 'Bitcoin', price: '$76,074.78', avgRate: '+0.009%', annualizedApr: '+9.85%', sentiment: 'Neutral', binance: '+0.0088%', okx: '+0.0092%', bybit: '+0.0095%', gate: '+0.0090%', bitget: '+0.0085%', mexc: '+0.0091%', kucoin: '+0.0089%', bingx: '+0.0093%', hyperliquid: '+0.0084%' },
    { symbol: 'ETH', name: 'Ethereum', price: '$2,407.35', avgRate: '+0.005%', annualizedApr: '+5.47%', sentiment: 'Neutral', binance: '+0.0048%', okx: '+0.0051%', bybit: '+0.0055%', gate: '+0.0050%', bitget: '+0.0047%', mexc: '+0.0052%', kucoin: '+0.0049%', bingx: '+0.0050%', hyperliquid: '+0.0045%' },
    { symbol: 'SOL', name: 'Solana', price: '$98.44', avgRate: '+0.008%', annualizedApr: '+8.76%', sentiment: 'Neutral', binance: '+0.0082%', okx: '+0.0084%', bybit: '+0.0089%', gate: '+0.0080%', bitget: '+0.0078%', mexc: '+0.0085%', kucoin: '+0.0081%', bingx: '+0.0083%', hyperliquid: '+0.0079%' },
    { symbol: 'BNB', name: 'BNB', price: '$719.33', avgRate: '0.000%', annualizedApr: '0.00%', sentiment: 'Neutral', binance: '+0.0002%', okx: '+0.0000%', bybit: '+0.0001%', gate: '-0.0001%', bitget: '+0.0000%', mexc: '+0.0001%', kucoin: '+0.0000%', bingx: '+0.0001%', hyperliquid: '+0.0000%' },
    { symbol: 'XRP', name: 'XRP', price: '$1.3055', avgRate: '+0.003%', annualizedApr: '+3.28%', sentiment: 'Neutral', binance: '+0.0031%', okx: '+0.0035%', bybit: '+0.0038%', gate: '+0.0030%', bitget: '+0.0029%', mexc: '+0.0032%', kucoin: '+0.0030%', bingx: '+0.0034%', hyperliquid: '+0.0028%' },
    { symbol: 'TRX', name: 'TRON', price: '$0.3354', avgRate: '-0.002%', annualizedApr: '-2.19%', sentiment: 'Shorts Pay', binance: '-0.0018%', okx: '-0.0022%', bybit: '-0.0025%', gate: '-0.0020%', bitget: '-0.0019%', mexc: '-0.0021%', kucoin: '-0.0020%', bingx: '-0.0018%', hyperliquid: '-0.0024%' },
    { symbol: 'ZEC', name: 'Zcash', price: '$1,310.93', avgRate: '-0.021%', annualizedApr: '-22.99%', sentiment: 'Extreme Squeeze', binance: '-0.0195%', okx: '-0.0224%', bybit: '-0.0240%', gate: '-0.0210%', bitget: '-0.0188%', mexc: '-0.0215%', kucoin: '-0.0205%', bingx: '-0.0230%', hyperliquid: '-0.0250%' },
    { symbol: 'HYPE', name: 'Hyperliquid', price: '$78.43', avgRate: '+0.005%', annualizedApr: '+5.47%', sentiment: 'Neutral', binance: '+0.0050%', okx: '+0.0052%', bybit: '+0.0058%', gate: '+0.0051%', bitget: '+0.0049%', mexc: '+0.0053%', kucoin: '+0.0050%', bingx: '+0.0052%', hyperliquid: '+0.0048%' },
    { symbol: 'DOGE', name: 'Dogecoin', price: '$0.08051', avgRate: '+0.008%', annualizedApr: '+8.76%', sentiment: 'Neutral', binance: '+0.0080%', okx: '+0.0082%', bybit: '+0.0088%', gate: '+0.0081%', bitget: '+0.0079%', mexc: '+0.0083%', kucoin: '+0.0080%', bingx: '+0.0084%', hyperliquid: '+0.0076%' },
    { symbol: 'XMR', name: 'Monero', price: '$178.20', avgRate: '+0.010%', annualizedApr: '+10.95%', sentiment: 'Elevated Longs', binance: '+0.0098%', okx: '+0.0102%', bybit: '+0.0108%', gate: '+0.0100%', bitget: '+0.0097%', mexc: '+0.0104%', kucoin: '+0.0099%', bingx: '+0.0105%', hyperliquid: '+0.0095%' },
    { symbol: 'LINK', name: 'Chainlink', price: '$10.95', avgRate: '+0.006%', annualizedApr: '+6.57%', sentiment: 'Neutral', binance: '+0.0058%', okx: '+0.0062%', bybit: '+0.0065%', gate: '+0.0060%', bitget: '+0.0057%', mexc: '+0.0063%', kucoin: '+0.0060%', bingx: '+0.0064%', hyperliquid: '+0.0055%' },
  ] as MultiExchangeFundingRateItem[],
};

// ==========================================
// 14. CRYPTO LIQUIDATIONS DASHBOARD (Screenshot 23)
// ==========================================
export const CMC_LIQUIDATIONS_DASHBOARD = {
  totalLiquidations24h: '$324.39M',
  longLiquidations24h: '$150.27M',
  shortLiquidations24h: '$174.12M',
  ratio: { longPct: 46.3, shortPct: 53.7 },
  allTimeTopEvents: [
    { rank: 1, date: 'Oct 10, 2025', trigger: 'Trump threatens 100% tariffs on China', liquidatedUsd: '$19.16B' },
    { rank: 2, date: 'Apr 18, 2021', trigger: 'Rumors of US Treasury AML crackdown on crypto', liquidatedUsd: '$9.94B' },
    { rank: 3, date: 'May 19, 2021', trigger: "Tesla's reversal on Bitcoin payments & China ban", liquidatedUsd: '$9.01B' },
  ],
  coinsBreakdown: [
    { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: '$76,074.78', change24h: 0.52, longsLiquidatedUsd: '$57.58M', shortsLiquidatedUsd: '$72.52M', totalLiquidatedUsd: '$80.86M' },
    { rank: 2, symbol: 'ETH', name: 'Ethereum', price: '$2,407.35', change24h: 0.34, longsLiquidatedUsd: '$38.42M', shortsLiquidatedUsd: '$40.91M', totalLiquidatedUsd: '$79.33M' },
    { rank: 3, symbol: 'ZEC', name: 'Zcash', price: '$1,310.93', change24h: 17.87, longsLiquidatedUsd: '$4.12M', shortsLiquidatedUsd: '$47.92M', totalLiquidatedUsd: '$52.04M' },
    { rank: 4, symbol: 'XRP', name: 'XRP', price: '$1.3055', change24h: 2.85, longsLiquidatedUsd: '$3.84M', shortsLiquidatedUsd: '$6.54M', totalLiquidatedUsd: '$10.38M' },
    { rank: 5, symbol: 'LSK', name: 'Lisk', price: '$0.6987', change24h: 109.62, longsLiquidatedUsd: '$1.22M', shortsLiquidatedUsd: '$8.65M', totalLiquidatedUsd: '$9.87M' },
    { rank: 6, symbol: 'SOL', name: 'Solana', price: '$98.44', change24h: 1.61, longsLiquidatedUsd: '$2.95M', shortsLiquidatedUsd: '$3.63M', totalLiquidatedUsd: '$6.58M' },
    { rank: 7, symbol: 'XAU', name: 'Gold Index', price: '$2,654.10', change24h: 0.42, longsLiquidatedUsd: '$1.82M', shortsLiquidatedUsd: '$3.92M', totalLiquidatedUsd: '$5.74M' },
    { rank: 8, symbol: 'ARB', name: 'Arbitrum', price: '$0.1626', change24h: 11.38, longsLiquidatedUsd: '$1.14M', shortsLiquidatedUsd: '$2.50M', totalLiquidatedUsd: '$3.64M' },
    { rank: 9, symbol: 'BR', name: 'Bedrock', price: '$0.6318', change24h: 147.34, longsLiquidatedUsd: '$680K', shortsLiquidatedUsd: '$2.77M', totalLiquidatedUsd: '$3.45M' },
  ] as LiquidationEventItem[],
};

// ==========================================
// 15. BITCOIN LIQUIDATION MAP (Screenshot 24)
// ==========================================
export const CMC_BTC_LIQUIDATION_MAP = {
  currentPrice: '$76,113.59',
  currentChange24h: '+0.55%',
  keyLevels: {
    shortsAbove: {
      price: '$77,650',
      distancePct: '+2.1%',
      liquidationVolumeUsd: '$40.91M',
      riskType: 'SHORT_SQUEEZE_MAGNET',
    },
    longsBelow: {
      price: '$72,575',
      distancePct: '-4.6%',
      liquidationVolumeUsd: '$60.85M',
      riskType: 'LONG_FLUSH_FLOOR',
    },
  },
  largestMagnetZone: {
    price: '$54,025',
    distance: 'Below price',
    potentialLiquidationsUsd: '$77.79M',
    type: 'Macro Institutional Flush Floor',
  },
  cumulativeLiquidationDepth: {
    totalAbovePrice: '$965.41M (Total Short Stops Up to $82,000)',
    totalBelowPrice: '$1.17B (Total Long Stops Down to $68,000)',
    dominance: 'Long leverage overhang exceeds short leverage by 21.2%',
  },
};

// ==========================================
// 16. RSI HEATMAP & OSCILLATOR DASHBOARD (Screenshot 25)
// ==========================================
export const CMC_RSI_DASHBOARD = {
  averageRsi: 43.77,
  distribution: { oversoldPct: 4.1, neutralPct: 94.2, overboughtPct: 1.7 },
  historicalAverage: {
    yesterday: 39.72,
    sevenDaysAgo: 43.07,
    thirtyDaysAgo: 48.55,
    ninetyDaysAgo: 43.52,
  },
  coins: [
    { rank: 1, symbol: 'DGrid AI', name: 'DGrid AI', price: '$0.9153', change24h: 20.42, m15: 88.2, h1: 87.4, h4: 86.5, d1: 69.7, d7: 74.2, condition: 'OVERBOUGHT' },
    { rank: 2, symbol: 'DRV', name: 'Derive', price: '$0.1901', change24h: 36.98, m15: 84.1, h1: 85.0, h4: 83.4, d1: 65.7, d7: 68.9, condition: 'OVERBOUGHT' },
    { rank: 3, symbol: 'LOB', name: 'Lobster', price: '$0.2252', change24h: 17.29, m15: 78.4, h1: 79.1, h4: 76.7, d1: 80.3, d7: 82.1, condition: 'OVERBOUGHT' },
    { rank: 4, symbol: 'SKYAI', name: 'SKYAI', price: '$0.06108', change24h: 18.32, m15: 75.0, h1: 77.2, h4: 76.0, d1: 54.0, d7: 61.4, condition: 'OVERBOUGHT' },
    { rank: 5, symbol: 'ZEC', name: 'Zcash', price: '$1,319.20', change24h: 17.87, m15: 72.5, h1: 73.8, h4: 74.0, d1: 67.9, d7: 84.5, condition: 'OVERBOUGHT' },
    { rank: 6, symbol: 'BR', name: 'Bedrock', price: '$0.6319', change24h: 147.43, m15: 68.2, h1: 71.0, h4: 69.0, d1: 65.9, d7: 78.4, condition: 'NEUTRAL' },
    { rank: 7, symbol: 'BULLA', name: 'Bulla', price: '$0.1168', change24h: 59.40, m15: 66.5, h1: 69.4, h4: 68.7, d1: 81.2, d7: 85.1, condition: 'NEUTRAL' },
    { rank: 8, symbol: 'JST', name: 'JUST', price: '$0.0384', change24h: 8.45, m15: 64.0, h1: 65.2, h4: 66.1, d1: 58.4, d7: 62.0, condition: 'NEUTRAL' },
    { rank: 9, symbol: 'ARB', name: 'Arbitrum', price: '$0.1626', change24h: 11.38, m15: 61.2, h1: 63.5, h4: 64.8, d1: 52.1, d7: 58.7, condition: 'NEUTRAL' },
    { rank: 10, symbol: 'NEAR', name: 'Near Protocol', price: '$3.84', change24h: 6.20, m15: 58.4, h1: 60.1, h4: 62.0, d1: 49.5, d7: 55.2, condition: 'NEUTRAL' },
    { rank: 11, symbol: 'SOL', name: 'Solana', price: '$98.44', change24h: 1.61, m15: 56.4, h1: 58.2, h4: 60.4, d1: 48.2, d7: 54.0, condition: 'NEUTRAL' },
    { rank: 12, symbol: 'BTC', name: 'Bitcoin', price: '$76,074.78', change24h: 0.52, m15: 52.1, h1: 53.4, h4: 54.2, d1: 46.8, d7: 51.5, condition: 'NEUTRAL' },
    { rank: 13, symbol: 'ETH', name: 'Ethereum', price: '$2,407.35', change24h: 0.34, m15: 47.8, h1: 48.5, h4: 49.1, d1: 42.4, d7: 46.2, condition: 'NEUTRAL' },
  ] as TechnicalOscillatorItem[],
};

// ==========================================
// 17. MACD MOMENTUM DASHBOARD (Screenshot 26)
// ==========================================
export const CMC_MACD_DASHBOARD = {
  averageNormalizedMacd: -0.17,
  momentumBreadth: { positivePct: 28.14, negativePct: 71.86 },
  historicalNormalized: {
    yesterday: -0.03,
    sevenDaysAgo: -0.14,
    thirtyDaysAgo: 0.01,
    ninetyDaysAgo: -0.30,
  },
  coins: [
    { rank: 1, symbol: 'BR', name: 'Bedrock', price: '$0.6318', change24h: 147.34, m15: -1.97, h1: 5.19, h4: 7.27, d1: 6.95, d7: 14.54, condition: 'BULLISH_EXPANSION' },
    { rank: 2, symbol: 'BULLA', name: 'Bulla', price: '$0.1168', change24h: 59.35, m15: -0.90, h1: 4.00, h4: 5.35, d1: -0.38, d7: 44.81, condition: 'BULLISH_EXPANSION' },
    { rank: 3, symbol: 'LSK', name: 'Lisk', price: '$0.6987', change24h: 109.62, m15: -2.51, h1: 1.96, h4: 3.80, d1: 17.69, d7: 37.63, condition: 'BULLISH_EXPANSION' },
    { rank: 4, symbol: 'DRV', name: 'Derive', price: '$0.1901', change24h: 37.07, m15: 0.41, h1: 0.15, h4: 3.77, d1: -0.80, d7: 3.50, condition: 'BULLISH_EXPANSION' },
    { rank: 5, symbol: 'ARB', name: 'Arbitrum', price: '$0.1626', change24h: 11.38, m15: 0.12, h1: 0.84, h4: 1.93, d1: -1.53, d7: 11.68, condition: 'BULLISH_EXPANSION' },
    { rank: 6, symbol: 'ZEC', name: 'Zcash', price: '$1,319.20', change24h: 17.87, m15: 0.24, h1: 0.65, h4: 1.74, d1: -0.95, d7: 9.23, condition: 'BULLISH_EXPANSION' },
    { rank: 7, symbol: 'SOL', name: 'Solana', price: '$98.44', change24h: 1.61, m15: 0.08, h1: 0.22, h4: 0.54, d1: -0.42, d7: 2.15, condition: 'NEUTRAL' },
    { rank: 8, symbol: 'BTC', name: 'Bitcoin', price: '$76,074.78', change24h: 0.52, m15: -0.05, h1: 0.14, h4: 0.28, d1: -0.65, d7: 1.42, condition: 'NEUTRAL' },
    { rank: 9, symbol: 'ETH', name: 'Ethereum', price: '$2,407.35', change24h: 0.34, m15: -0.18, h1: -0.09, h4: -0.32, d1: -1.84, d7: -2.45, condition: 'BEARISH_DIVERGENCE' },
  ] as TechnicalOscillatorItem[],
};

// ==========================================
// 18. COMPREHENSIVE EXPERT TRADE ACTION MATRIX
// Generating tailored Trade Impact, Priority Actions, and Hazards for each section
// ==========================================
export const CMC_TRADE_IMPACT_BY_SECTION: Record<string, TradeImpactGuide> = {
  market_overview: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Defensive Neutrality: Bitcoin Consolidates at $76K While Dominance (58.9%) Drains Altcoin Liquidity',
    headlineMy: 'ကာကွယ်ရေးအနေအထား- Bitcoin သည် $76K တွင် ငြိမ်နေသော်လည်း BTC Dominance (58.9%) ကြောင့် Altcoin များ ရုန်းကန်နေရ',
    impactEn: 'With Fear & Greed at 64 (Greed) but 24h volume contracting -14.44% to $87.95B, the market is absorbing institutional ETF outflows without panicking. This creates high-liquidity range scalp conditions on BTC and SOL, but punishes overleveraged long positions on low-liquidity alts.',
    impactMy: 'Fear & Greed သည် ၆၄ (Greed) တွင် ရှိနေပြီး ၂၄ နာရီ Volume သည် -၁၄.၄၄% ကျဆင်းကာ $87.95B ဖြစ်နေသဖြင့် စျေးကွက်သည် ETF အထွက်များကို ထိတ်လန့်မှုမရှိဘဲ စုပ်ယူထားနိုင်ပါသည်။ BTC နှင့် SOL တို့တွင် Range Scalp အတွက် အခွင့်အလမ်းကောင်းသော်လည်း Liquidity နည်းသော Altcoin များတွင် Long အလွန်အကျွံ ဖွင့်ခြင်းကို ရှောင်ရှားသင့်သည်။',
    priorityActionsEn: [
      'Focus 70% of margin on high-liquidity leaders (BTC, SOL) defending daily key moving averages.',
      'Scalp mean-reversions at range boundaries ($74,200 support floor / $77,650 resistance ceiling).',
      'Lock in partial profits at 1.5R to 2.0R to protect unrealized gains during low-volume sessions.',
    ],
    priorityActionsMy: [
      'အရင်းအနှီး၏ ၇၀% ကို အဓိကဒင်္ဂါးများ (BTC, SOL) ၏ အခိုင်အမာ Support ဇုန်များတွင်သာ အာရုံစိုက်ပါ။',
      'စျေးတန်းနယ်နိမိတ်များ ($74,200 Support နှင့် $77,650 Resistance) တွင် အရစ်ကျ Scalp ကုန်သွယ်ပါ။',
      'Volume နည်းချိန်တွင် အမြတ်မပျောက်စေရန် 1.5R မှ 2.0R ရောက်ပါက အမြတ်တစ်ဝက် သိမ်းဆည်းပါ။',
    ],
    hazardsToAvoidEn: [
      'NEVER chase high-green breakout candles on coins outside the Top 20 without volume confirmation.',
      'Avoid holding high-leverage (>20x) swing trades over the weekend when CEX liquidity drops.',
      'Do not average down on losing altcoin positions while Bitcoin dominance is rising.',
    ],
    hazardsToAvoidMy: [
      'Top 20 ပြင်ပဒင်္ဂါးများတွင် Volume မပါဘဲ စျေးထိုးတက်သည့် အစိမ်းတိုင်များကို အတင်းလိုက်မဝယ်ပါနှင့်။',
      'စနေ၊ တနင်္ဂနွေ CEX စျေးကွက်ငြိမ်ချိန်တွင် Leverage အဆ ၂၀ ထက်ကျော်လွန်၍ ညအိပ်မကိုင်ထားပါနှင့်။',
      'BTC Dominance တက်နေချိန်တွင် အရှုံးပြနေသော Altcoin များကို ဒေါ်လာထပ်ထည့်၍ ဆက်မဝယ်ပါနှင့်။',
    ],
    recommendedSetup: {
      action: 'LONG',
      symbol: 'BTCUSDT',
      trigger: 'Limit bid at $74,800 - $75,200 (Demand Wick Sweep)',
      invalidation: '4H candle close below $73,900',
      target: '$77,600 (Liquidation Sweep Target)',
    },
  },

  spot_market: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Healthy Mid-Cycle Consolidation: Market Cap $2.60T Flirts with 52-Week Range Midpoint',
    headlineMy: 'ကျန်းမာသော စျေးကွက်တန်းချိန်ညှိမှု- စျေးကွက်အရင်းအနှီး $2.60T သည် အလယ်အလတ်ဇုန်တွင် ခိုင်မာနေ',
    impactEn: 'The 24h market cap drop of -2.54% is an orderly mean-reversion following the $2.68T local peak on Sep 13. With CEX spot volume holding at $80.79B and DEX volume at $7.16B, institutional spot liquidity remains structurally supportive.',
    impactMy: '၂၄ နာရီအတွင်း စျေးကွက်တန်ဖိုး -၂.၅၄% ကျဆင်းမှုသည် စက်တင်ဘာ ၁၃ က $2.68T အထိ တက်ခဲ့ပြီးနောက် ပုံမှန်အနားယူခြင်း ဖြစ်သည်။ CEX Spot Volume $80.79B နှင့် DEX $7.16B ရှိနေသဖြင့် အဖွဲ့အစည်းကြီးများ၏ ပင်မဝယ်လိုအားသည် ဆက်လက်တည်ရှိနေသည်။',
    priorityActionsEn: [
      'Deploy dollar-cost averaging (DCA) into blue chips between $2.52T - $2.58T market cap floor.',
      'Monitor CEX-to-DEX volume ratios; DEX ratio above 8.5% signals aggressive on-chain meme rotation.',
      'Set alert triggers at $2.68T resistance breakout for multi-week momentum continuation.',
    ],
    priorityActionsMy: [
      'စျေးကွက်တန်ဖိုး $2.52T - $2.58T Support သို့ ကျဆင်းချိန်တွင် Blue-chip ဒင်္ဂါးများကို DCA စနစ်ဖြင့် စုဆောင်းပါ။',
      'CEX နှင့် DEX Volume အချိုးကို စောင့်ကြည့်ပါ၊ DEX အချိုး ၈.၅% ကျော်ပါက On-chain ကုန်သွယ်မှု အားကောင်းလာခြင်းဖြစ်သည်။',
      '$2.68T Resistance ကို ဖောက်ထွက်နိုင်ပါက အပတ်စဉ် Trend အတက်ကြီး စတင်နိုင်ရန် Alert သတ်မှတ်ထားပါ။',
    ],
    hazardsToAvoidEn: [
      'Do not mistake normal spot consolidation for a macro bear market reversal.',
      'Avoid panic-selling fundamentally solid spot bags during low-volume Tuesday retests.',
    ],
    hazardsToAvoidMy: [
      'သာမန် စျေးကွက်အနားယူမှုကို Bear Market အကြီးစား အကျကြီးဟု လွဲမှားစွာ မထင်မှတ်ပါနှင့်။',
      'Volume နည်းချိန်တွင် စိတ်လှုပ်ရှားပြီး အခြေခံကောင်းသော ဒင်္ဂါးများကို အရှုံးဖြင့် ထုတ်မရောင်းပါနှင့်။',
    ],
  },

  chain_ranking: {
    bias: 'BULLISH',
    headlineEn: 'Solana (#1) & Base (#4) Monopolize DEX Trading Velocity; Ethereum Captures High-Value TVL ($48.8B)',
    headlineMy: 'Solana နှင့် Base တို့ DEX အရောင်းအဝယ်အများဆုံးဖြစ်နေပြီး Ethereum က TVL $48.8B ဖြင့် အကြီးမားဆုံးဖြစ်နေ',
    impactEn: 'Solana processes $43.33B in 7-day DEX volume across 4.70M unique traders, outpacing Ethereum ($5.24B) by more than 8x in activity. Base revenue exploded +172.2% to $2.20M. This proves on-chain retail liquidity is overwhelmingly concentrated in SOL and BASE ecosystems.',
    impactMy: 'Solana သည် ကုန်သွယ်သူ ၄.၇ သန်းဖြင့် ၇ ရက်အတွင်း DEX Volume $43.33B အထိ စံချိန်တင်နေပြီး Ethereum ထက် ၈ ဆကျော် များပြားသည်။ Base ကွန်ရက်သည်လည်း ဝင်ငွေ ၁၇၂% အထိ ထိုးတက်ခဲ့သည်။ ထို့ကြောင့် လက်လီကုန်သွယ်သူများ၏ ငွေကြေးသည် SOL နှင့် BASE ဂေဟစနစ်များတွင် အဓိက စုပြုံနေသည်။',
    priorityActionsEn: [
      'Prioritize SOL and top Solana DeFi governance tokens (RAY, JTO, PYTH) for high-beta upside.',
      'Exploit Base layer-2 ecosystem tokens for fast speculative rotations on Coinbase news flow.',
      'Treat ETH as an institutional custody asset; look for staking yield or multi-month recovery plays.',
    ],
    priorityActionsMy: [
      'စျေးအတက်မြန်စေရန် SOL နှင့် ၎င်း၏ ဂေဟစနစ်ဒင်္ဂါးများ (RAY, JTO, PYTH) ကို ဦးစားပေး ကုန်သွယ်ပါ။',
      'Base Layer-2 အကြွေဒင်္ဂါးများကို သတင်းစီးဆင်းမှုအလိုက် အချိန်တိုအတွင်း အရစ်ကျ အမြတ်ယူပါ။',
      'ETH ကို ရေရှည်အဖွဲ့အစည်းသုံးအဖြစ် သဘောထားပြီး Staking သို့မဟုတ် လပေါင်းများစွာ ပြန်တက်မည့် အနေအထားကိုသာ စောင့်ကြည့်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Avoid trading low-cap tokens on dormant L1 chains with declining 7d TVL (<$200M).',
      'Watch out for high DEX slippage and MEV sandwich attacks on congested Solana pools.',
    ],
    hazardsToAvoidMy: [
      '၇ ရက်တာ TVL ကျဆင်းနေပြီး အရောင်းအဝယ်မရှိသော အိပ်ပျော်နေသည့် L1 ကွန်ရက်များမှ ဒင်္ဂါးများကို မကိုင်ပါနှင့်။',
      'Solana DEX များတွင် Slippage အလွန်များခြင်းနှင့် MEV Bot များ၏ ဖြတ်စားခံရခြင်းကို သတိပြုပါ။',
    ],
  },

  btc_treasuries: {
    bias: 'BULLISH',
    headlineEn: 'Corporate Supply Squeeze: 1.35 Million Bitcoins (6.43% of Supply) Locked in Public Balance Sheets',
    headlineMy: 'ကုမ္ပဏီကြီးများ၏ ပစ္စည်းပြတ်လပ်မှု- Bitcoin ၁.၃၅ သန်း (စုစုပေါင်း၏ ၆.၄၃%) ကို ကုမ္ပဏီများက သိမ်းဆည်းထား',
    impactEn: 'Strategy (MSTR) holds 843,775 BTC ($64.23B), with public corporate treasuries globally holding over 1,349,662 BTC. With US companies holding 92.6% of all corporate reserves, corporate accumulation creates a structural illiquid supply wall that buffers against deep bear dumps.',
    impactMy: 'MicroStrategy သည် Bitcoin ၈၄၃,၇၇၅ ပြား ($64.23B) ကို ကိုင်ထားပြီး အများပိုင်ကုမ္ပဏီများ စုစုပေါင်း ၁,၃၄၉,၆၆၂ ပြားအထိ ပိုင်ဆိုင်ထားသည်။ အမေရိကန်ကုမ္ပဏီများက ၉၂.၆% ကိုင်ထားသဖြင့် ဤသို့ ရေရှည်သော့ခတ်ထားခြင်းသည် စျေးကွက်အကြီးအကျယ် ကျဆင်းမှုကို တားဆီးပေးသော အခိုင်မာဆုံး ကျောက်ဆူး ဖြစ်သည်။',
    priorityActionsEn: [
      'Use corporate average cost basis ($75.47K for MSTR, $33.53K for TSLA) as critical macro psychological supports.',
      'Treat every 5% - 8% pullback toward corporate cost levels as prime institutional swing entry zones.',
    ],
    priorityActionsMy: [
      'MSTR ၏ ပျမ်းမျှဝယ်စျေး $75.47K နှင့် Tesla ၏ $33.53K တို့ကို စိတ်ပိုင်းဆိုင်ရာ အရေးကြီးသော Support များအဖြစ် မှတ်ယူပါ။',
      'ကုမ္ပဏီများ၏ ဝယ်ရင်းစျေးဝန်းကျင်သို့ ၅% မှ ၈% ပြန်လည်ကျဆင်းလာတိုင်း အဖွဲ့အစည်းအဆင့် Long ဝင်ရန် စောင့်ကြည့်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Do NOT attempt naked long-term shorts on BTC when corporate treasuries are actively issuing convertible notes to accumulate more.',
    ],
    hazardsToAvoidMy: [
      'ကုမ္ပဏီကြီးများက ငွေချေးစာချုပ်များထုတ်ပြီး Bitcoin ကို ဆက်တိုက်ဝယ်ယူနေချိန်တွင် ရေရှည် Short မရောင်းပါနှင့်။',
    ],
  },

  exchange_flows: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Mixed Exchange Net Flows: Bybit & Crypto.com See Heavy Cold-Storage Outflows (-$121M)',
    headlineMy: 'Exchanges များမှ အသားတင်ငွေစီးဆင်းမှု- Bybit နှင့် Crypto.com တို့တွင် Cold Storage သို့ ငွေထုတ်ယူမှု ဒေါ်လာ ၁၂၁ သန်း ရှိနေ',
    impactEn: 'While Binance recorded +$95.73M in 24h inflows, Bybit (-$34.11M) and Crypto.com (-$87.45M) registered heavy multi-million dollar net outflows to cold storage. Total exchange open interest stands at an enormous $31.91B on Binance alone, indicating high pending fuel for volatility sweeps.',
    impactMy: 'Binance တွင် ဒေါ်လာ ၉၅ သန်း စီးဝင်ခဲ့သော်လည်း Bybit နှင့် Crypto.com တို့မှ ဒေါ်လာ ၁၂၁ သန်းကျော် အပြင်သို့ ထုတ်ယူသွားခဲ့သည်။ Binance တစ်ခုတည်းတွင်ပင် Open Interest $31.91B ရှိနေသဖြင့် စျေးကွက်တွင် မကြာမီ ရုတ်တရက် အတက်အကျကြမ်းမည့် လှိုင်းများ ဖြစ်ပေါ်လာနိုင်သည်။',
    priorityActionsEn: [
      'Watch for Binance deposit surges as potential short-term sell walls; place limit buy bids below them.',
      'Follow persistent multi-week exchange outflows (Bybit 30d -$1.44B) as bullish accumulation confirmation.',
    ],
    priorityActionsMy: [
      'Binance သို့ ငွေအမြောက်အမြား ဝင်လာပါက ရောင်းဖိအား ပေါ်လာနိုင်သဖြင့် အောက်ဘက် Support တွင်သာ စောင့်ဝယ်ပါ။',
      'Bybit ကဲ့သို့ Exchanges များမှ ရက် ၃၀ အတွင်း ဒေါ်လာ ၁.၄၄ ဘီလီယံအထိ ထုတ်ယူသွားမှုများကို ရေရှည်အတက်လက္ခဏာအဖြစ် သတ်မှတ်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Never trade right after an abrupt 9-figure exchange deposit without checking whether it is stablecoins (buying power) or raw tokens (selling pressure).',
    ],
    hazardsToAvoidMy: [
      'Exchange ထဲသို့ ဒေါ်လာသန်းပေါင်းများစွာ ရုတ်တရက် ဝင်လာချိန်တွင် ၎င်းသည် Stablecoin (ဝယ်ရန်ငွေ) လား သို့မဟုတ် Coin များ (ရောင်းရန်) လား မစစ်ဆေးဘဲ အော်ဒါမဖွင့်ပါနှင့်။',
    ],
  },

  etf_flows: {
    bias: 'HIGH_VOLATILITY',
    headlineEn: 'Institutional Profit-Taking: -$610.10M Daily Net Outflow Across BTC & ETH ETFs',
    headlineMy: 'အဖွဲ့အစည်းကြီးများ၏ အမြတ်ယူမှု- BTC နှင့် ETH ETF များမှ တစ်ရက်တည်း အသားတင် ဒေါ်လာ ၆၁၀ သန်း ထွက်ခွာ',
    impactEn: 'Bitcoin spot ETFs shed -$450.40M and Ethereum ETFs lost -$157.10M in 24 hours, led by BlackRock IBIT (-$184.2M) and Fidelity FBTC (-$112.4M). Solana ETFs bucked the trend with +$1.30M net inflows. Heavy ETF outflows typically create a 48-hour headwind on spot prices, demanding strict risk controls.',
    impactMy: 'Bitcoin Spot ETF များမှ -$450.40M နှင့် Ethereum ETF များမှ -$157.10M အသီးသီး အသားတင် ထွက်ခွာခဲ့ပြီး BlackRock နှင့် Fidelity တို့ ဦးဆောင်ခဲ့သည်။ Solana ETF သို့မူ +$1.30M စီးဝင်ခဲ့သည်။ ဤသို့ ETF အထွက်များခြင်းသည် ၄၈ နာရီအတွင်း စျေးနှုန်းအပေါ် အတက်နှေးစေသော ဖိအားဖြစ်စေသဖြင့် Stop Loss ကို တင်းကျပ်စွာ ထားရှိရမည်။',
    priorityActionsEn: [
      'Trade with defensive position sizing (1% to 2% max portfolio risk) during consecutive negative ETF flow days.',
      'Prepare for strong bounce opportunities as daily ETF flows pivot from negative back to net positive.',
      'Take advantage of Solana relative strength (SOL ETF +$1.30M) while BTC/ETH take breathers.',
    ],
    priorityActionsMy: [
      'ETF ငွေအထွက်ပြနေသော ရက်များတွင် မိမိအရင်းအနှီး၏ ၁% မှ ၂% ထက် ပို၍ စွန့်စားမှုမပြုဘဲ ကာကွယ်ရေးအနေအထားဖြင့် ကုန်သွယ်ပါ။',
      'ETF စီးဝင်မှုသည် အနုတ်မှ အပေါင်းသို့ ပြန်လည်ဦးမော့လာမည့် အလှည့်အပြောင်းတွင် ခိုင်မာသော အတက်လှိုင်းကို ဖမ်းယူပါ။',
      'BTC နှင့် ETH အနားယူချိန်တွင် အပေါင်းလက္ခဏာပြနေသော Solana ကို အာရုံစိုက် ကုန်သွယ်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Avoid initiating aggressive breakout longs immediately before the 09:30 AM - 10:30 AM EDT US market open when ETF rebalancing occurs.',
      'Never ignore institutional ETF outflows; retail traders cannot overpower Wall Street net selling.',
    ],
    hazardsToAvoidMy: [
      'အမေရိကန် စျေးဖွင့်ချိန် (မြန်မာစံတော်ချိန် ည ၈:၀၀ မှ ၉:၀၀) တွင် ETF အရောင်းအဝယ်များ စတင်ချိန်ဖြစ်သဖြင့် မဆင်မခြင် အတင်း Long မလိုက်ပါနှင့်။',
      'အဖွဲ့အစည်းကြီးများ၏ ETF ရောင်းထုတ်မှုကို လျစ်လျူမရှုပါနှင့်၊ Wall Street ၏ ရောင်းအားကို လက်လီကုန်သွယ်သူများ တားဆီးနိုင်မည်မဟုတ်ပါ။',
    ],
  },

  derivatives_overview: {
    bias: 'HIGH_VOLATILITY',
    headlineEn: 'Perpetual Volume Explodes +268.76% to $835.57B; Open Interest Hits $465.91B',
    headlineMy: 'Perpetual Futures ပမာဏ ၂၆၈% ထိုးတက်ပြီး $835.57B ရောက်ရှိ၊ Open Interest $465.91B ရှိနေ',
    impactEn: 'Derivatives volume is 9.5x larger than spot volume, with CEX commanding 96.52% market share. Bitcoin implied volatility contracted to 38.87 (-49.09%). This massive volatility compression combined with record open interest is a classic pre-expansion coiling signal.',
    impactMy: 'Futures ကုန်သွယ်မှုပမာဏသည် Spot ထက် ၉.၅ ဆ ပိုမိုကြီးမားနေပြီး CEX က ၉၆.၅၂% ထိန်းချုပ်ထားသည်။ Bitcoin Volatility သည် ၃၈.၈၇ သို့ ကျဆင်းနေသည်။ ဤသို့ Volatility ကျဆင်းချိန်တွင် Open Interest အလွန်မြင့်မားနေခြင်းသည် ကြီးမားသော စျေးပေါက်ကွဲမှု မကြာမီ လာတော့မည့် အချက်ပြလက္ခဏာ ဖြစ်သည်။',
    priorityActionsEn: [
      'Expect an explosive 4% - 7% directional expansion within 48 to 72 hours.',
      'Reduce leverage to < 10x before the volatility expansion triggers widespread stop cascades.',
      'Place alert triggers at the breakout boundaries ($77,650 short squeeze or $72,575 long breakdown).',
    ],
    priorityActionsMy: [
      'နောက် ၄၈ မှ ၇၂ နာရီအတွင်း ၄% မှ ၇% အထိ ကြီးမားသော စျေးလှုပ်ရှားမှု ဖြစ်ပေါ်လာနိုင်ကြောင်း ကြိုတင်ပြင်ဆင်ပါ။',
      'စျေးကွက်မလှုပ်ခတ်မီ မိမိ၏ Leverage ကို ၁၀ ဆ အောက်သို့ လျှော့ချထားပါ။',
      'စျေးတန်းနယ်နိမိတ်များ ($77,650 အထက် သို့မဟုတ် $72,575 အောက်) သို့ စျေးရောက်ပါက သတိပေးရန် Alert ချိန်ထားပါ။',
    ],
    hazardsToAvoidEn: [
      'DO NOT use tight stop-losses during the initial expansion wick; wait for the candle to close before entering.',
      'Do not trade derivatives on illiquid low-cap contracts during high-spread volatility spikes.',
    ],
    hazardsToAvoidMy: [
      'စျေးကွက် စတင်လှုပ်ခတ်ချိန်တွင် Stop Loss အလွန်ကပ်မထားပါနှင့်၊ ဖယောင်းတိုင် ပိတ်ပြီးမှသာ Trend အတိုင်း ဝင်ရောက်ပါ။',
      'အရောင်းအဝယ်ပါးသော ဒင်္ဂါးငယ်များတွင် Spread ကွာဟမှု မြင့်မားချိန် Futures မကစားပါနှင့်။',
    ],
  },

  funding_rates: {
    bias: 'SHORT_SQUEEZE_RISK',
    headlineEn: 'Average Funding Rate Neutral (+0.005%); Severe Negative Outliers Trigger Squeeze Warnings',
    headlineMy: 'ပျမ်းမျှ Funding Rate ပုံမှန်ဖြစ်သော်လည်း အချို့ဒင်္ဂါးများတွင် အနုတ်လက္ခဏာပြင်းထန်ပြီး Short Squeeze ဖြစ်နိုင်ခြေမြင့်မား',
    impactEn: 'Major pairs (BTC +0.009%, ETH +0.005%, SOL +0.008%) show healthy, balanced leverage. However, extreme anomalies like ZEC (-0.021%), LSK (-1.000%), and BDX (-1.500%) signal heavily crowded short positions that are ripe for violent multi-session short squeezes.',
    impactMy: 'အဓိကဒင်္ဂါးများ (BTC +0.009%, ETH +0.005%, SOL +0.008%) တွင် Funding Rate သည် ပုံမှန်ငြိမ်သက်နေသည်။ သို့သော် ZEC (-0.021%) နှင့် LSK (-1.000%) ကဲ့သို့သော အနုတ်ပြင်းထန်သည့် ဒင်္ဂါးများတွင် Short ရောင်းချသူများ အလွန်များပြားနေသဖြင့် ရုတ်တရက် အပေါ်သို့ စျေးခုန်တက်မည့် Short Squeeze အန္တရာယ် အလွန်ကြီးမားသည်။',
    priorityActionsEn: [
      'Scan for coins with negative funding rate < -0.05% and look for 15M/1H bullish liquidity sweep setups.',
      'For positive high-funding coins (MON +1.5%, STX +1.17%), avoid chasing longs as long holders pay brutal fees.',
      'Consider funding rate arbitrage: buy spot and short futures on extreme positive funding tokens to earn risk-free APR.',
    ],
    priorityActionsMy: [
      'Funding Rate အနုတ် -၀.၀၅% အောက်ရောက်နေသော ဒင်္ဂါးများတွင် 15M/1H အတက်အချက်ပြ ပေါ်ပါက Short Squeeze ကို စီးနင်းပါ။',
      'Funding အပေါင်းအလွန်များသော ဒင်္ဂါးများ (MON, STX) တွင် Long ကိုင်ထားပါက ၈ နာရီတစ်ကြိမ် အခကြေးငွေ အများအပြား ပေးရမည်ကို သတိပြုပါ။',
      'အပေါင်းအလွန်များသော ဒင်္ဂါးများတွင် Spot ဝယ်ပြီး Futures တွင် Short ဖွင့်ကာ စွန့်စားမှုကင်းမဲ့သော Funding APR ရယူသည့် Arbitrage ပြုလုပ်နိုင်သည်။',
    ],
    hazardsToAvoidEn: [
      'NEVER open late market shorts on contracts where the funding rate is heavily negative (< -0.10%).',
      'Do not hold longs on coins with funding > +0.10% over the funding reset timestamp (00:00, 08:00, 16:00 UTC).',
    ],
    hazardsToAvoidMy: [
      'Funding Rate အနုတ်ပြင်းနေသော ဒင်္ဂါးများတွင် နောက်ကျမှ လိုက်လံ Short မရောင်းပါနှင့်၊ စျေးထိုးတက်ပြီး အကောင့်ပြုတ်နိုင်သည်။',
      'Funding ပေးရမည့် အချိန်များ (မြန်မာစံတော်ချိန် မနက် ၆:၃၀၊ နေ့လယ် ၂:၃၀၊ ည ၁၀:၃၀) မတိုင်မီ Funding အပေါင်းများသော ဒင်္ဂါးများတွင် Long မကိုင်ထားပါနှင့်။',
    ],
  },

  liquidations: {
    bias: 'LONG_CASCADE_RISK',
    headlineEn: '$324.39M Liquidated in 24h: Short Liquidations ($174.12M) Outpace Longs ($150.27M)',
    headlineMy: '၂၄ နာရီအတွင်း ဒေါ်လာ ၃၂၄ သန်း ရှင်းလင်းခံရပြီး Short အရှုံး ($174M) က Long ထက် ပိုမိုများပြားခဲ့',
    impactEn: 'Short liquidations dominated at 53.7% ($174.12M), led by violent short flushes on BTC ($72.52M shorts liquidated), ETH ($40.91M shorts), and ZEC ($47.92M shorts). When short liquidations peak, price often reaches local exhaustion and pulls back into deep support before continuing.',
    impactMy: 'Short ရှင်းလင်းခံရမှုသည် ၅၃.၇% ($174.12M) အထိ ဦးဆောင်ခဲ့ပြီး BTC, ETH နှင့် ZEC တို့တွင် Short သမားများ အကြီးအကျယ် ပြုတ်ထွက်ခဲ့သည်။ Short များ ရှင်းလင်းခံရပြီးချိန်တွင် စျေးသည် ခေတ္တအရှိန်လျော့သွားပြီး အောက်ခြေ Support သို့ ပြန်ဆင်းတတ်သည်။',
    priorityActionsEn: [
      'Wait for liquidation spikes to subside before entering fresh positions (allow order book depth to rebuild).',
      'Place buy orders at key demand zones where forced long liquidations typically trigger wick reversals.',
      'Trade coins with the highest short liquidation momentum (ZEC, LSK) on pullbacks for follow-through continuation.',
    ],
    priorityActionsMy: [
      'Liquidation အလုံးအရင်း ပြီးဆုံးသည်အထိ စောင့်ဆိုင်းပြီးမှသာ အော်ဒါအသစ် ဖွင့်ပါ (Order Book ပြန်လည်ပြည့်စုံစေရန်)။',
      'Long သမားများ Stop Loss ထိပြီး ပြန်တက်တတ်သော Demand Zone များတွင် ကြိုတင် Limit Buy အော်ဒါများ ချထားပါ။',
      'Short Liquidation အများဆုံး ဖြစ်ပေါ်ခဲ့သော ဒင်္ဂါးများတွင် စျေးပြန်ဆင်းချိန် Pullback ကို စောင့်၍ Trend အတိုင်း ဝင်ရောက်ပါ။',
    ],
    hazardsToAvoidEn: [
      'NEVER trade without a hard stop-loss; flash liquidation cascades can wipe out 10% of equity in under 90 seconds.',
      'Do not try to catch falling knives during an active liquidation cascade.',
    ],
    hazardsToAvoidMy: [
      'Stop Loss မပါဘဲ လုံးဝ ကုန်သွယ်မှု မပြုပါနှင့်၊ ရုတ်တရက် Liquidation ဖြစ်ပါက စက္ကန့် ၉၀ အတွင်း ၁၀% ကျော် ဆုံးရှုံးနိုင်သည်။',
      'စျေးကွက် အောက်သို့ ထိုးဆင်းနေချိန်တွင် အောက်ခြေကို အတင်းလိုက်မဖမ်းပါနှင့်။',
    ],
  },

  liquidation_map: {
    bias: 'HIGH_VOLATILITY',
    headlineEn: 'Liquidation Magnet Clocks: $77,650 Short Squeeze Ceiling vs $72,575 Long Flush Floor',
    headlineMy: 'Liquidation သံလိုက်ဇုန်များ- အထက်တွင် $77,650 Short Squeeze နှင့် အောက်တွင် $72,575 Long Flush ဇုန်တို့ တည်ရှိနေ',
    impactEn: 'Current BTC price ($76,113) sits between two major liquidity clusters: $40.91M in shorts clustered at $77,650 (+2.1%), and $60.85M in longs clustered at $72,575 (-4.6%). Total leverage below price ($1.17B) exceeds leverage above price ($965M), indicating smart money may sweep downward first before triggering the squeeze.',
    impactMy: 'လက်ရှိ Bitcoin စျေး ($76,113) သည် အဓိက Liquidity အစုအဝေး ၂ ခုကြားတွင် ရှိနေသည်- အထက် $77,650 တွင် Short ဒေါ်လာ ၄၀.၉ သန်း (+၂.၁%) နှင့် အောက် $72,575 တွင် Long ဒေါ်လာ ၆၀.၈ သန်း (-၄.၆%) တို့ ဖြစ်သည်။ အောက်ဘက်ရှိ Long Leverage စုစုပေါင်း ($1.17B) သည် အထက်ဘက်ထက် ၂၁% ပိုများနေသဖြင့် Whales များသည် အောက်ဘက်သို့ အရင်ရှင်းလင်းပြီးမှ အပေါ်သို့ ဆွဲတင်နိုင်ခြေ ရှိသည်။',
    priorityActionsEn: [
      'Anticipate a wick test of $74,200 - $72,575 to hunt long stops before an explosive rally to $77,650.',
      'Place laddered bids between $73,200 and $74,500 with hard stops at $71,900.',
      'Set take-profit orders directly in front of the $77,500 short liquidation wall to secure execution.',
    ],
    priorityActionsMy: [
      'စျေးနှုန်းသည် အောက်ဘက် $74,200 - $72,575 သို့ အရင်ဆင်းကာ Long များကို ရှင်းလင်းပြီးမှ $77,650 သို့ အပေါ်သို့ ဆွဲတင်နိုင်ကြောင်း မှတ်ယူပါ။',
      '$73,200 မှ $74,500 ကြားတွင် အဆင့်ဆင့် Limit Buy ချထားပြီး Stop Loss ကို $71,900 တွင် ထားပါ။',
      '$77,500 Short Liquidation မတိုင်မီ စျေးတန်းတွင် အမြတ်ယူ Take-Profit ကို ကြိုတင်သတ်မှတ်ထားပါ။',
    ],
    hazardsToAvoidEn: [
      'DO NOT enter full-size long positions directly at the $76,500 resistance midpoint without waiting for confirmation.',
      'Never place stop-losses directly ON major round numbers ($75,000, $73,000); place them 0.8% below the cluster.',
    ],
    hazardsToAvoidMy: [
      'အတည်ပြုချက်မရသေးဘဲ အလယ်ခေါင် $76,500 တွင် အရင်းအနှီးအပြည့် Long မဖွင့်ပါနှင့်။',
      'Stop Loss များကို $75,000, $73,000 ကဲ့သို့သော ကိန်းပြည့်များပေါ်တွင် တိုက်ရိုက်မထားပါနှင့်၊ အစုအဝေး၏ ၀.၈% အောက်တွင် ထားပါ။',
    ],
  },

  technical_analysis: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Oscillators Cool Off: Crypto RSI Averages 43.77; MACD Normalized at -0.17 with 71.86% Bearish Momentum',
    headlineMy: 'နည်းပညာအညွှန်းကိန်းများ အနားယူနေ- ပျမ်းမျှ RSI 43.77 ရှိပြီး MACD သည် -၀.၁၇ ဖြင့် အကျဖိအားကို ရှင်းလင်းနေ',
    impactEn: 'Average RSI sits at 43.77 (well below overbought), with only 1.7% of tokens in overbought territory. However, 71.86% of coins exhibit negative MACD momentum, confirming that the market is in a healthy pullback/consolidation phase rather than a euphoric top.',
    impactMy: 'ပျမ်းမျှ RSI သည် ၄၃.၇၇ သို့ ရောက်ရှိနေပြီး စျေးကွက်၏ ၁.၇% သာ Overbought ဖြစ်နေသည်။ သို့သော် ဒင်္ဂါး ၇၁.၈၆% တွင် MACD အနုတ်ပြနေသဖြင့် ဤသည်မှာ စျေးကွက်ထိပ်ဆုံးရောက်ခြင်းမဟုတ်ဘဲ အတက်အတွက် ပြန်လည်အနားယူကာ အားယူနေခြင်း ဖြစ်သည်။',
    priorityActionsEn: [
      'Look for bullish RSI divergence on 4H timeframes where price creates a lower low but RSI prints a higher low.',
      'Screen for momentum outliers like BR (+147%), BULLA (+59%), and LSK (+109%) for quick intraday trend scalps.',
      'Wait for MACD histogram ticks to curl upward on BTC and ETH before adding swing leverage.',
    ],
    priorityActionsMy: [
      '4H ဇယားတွင် စျေးနှုန်းကျဆင်းသော်လည်း RSI မြင့်တက်နေသည့် Bullish Divergence များကို ရှာဖွေပြီး ဝယ်ယူပါ။',
      'BR (+147%), BULLA (+59%), LSK (+109%) ကဲ့သို့သော အရှိန်ပြင်းဒင်္ဂါးများကို နေ့စဉ် Scalp ကုန်သွယ်မှုအတွက် အသုံးပြုပါ။',
      'BTC နှင့် ETH တို့တွင် MACD အတက်ဘက်သို့ ပြန်လည်ကွေးတက်လာချိန်မှသာ Swing အော်ဒါများကို တိုးမြှင့်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Do NOT short coins with 4H RSI > 70 if their daily MACD is expanding exponentially; strong momentum can stay overbought for weeks.',
      'Never trade MACD crossover signals in isolation without checking higher-timeframe support/resistance levels.',
    ],
    hazardsToAvoidMy: [
      'Daily MACD အားကောင်းနေသော ဒင်္ဂါးများကို RSI ၇၀ ကျော်ရုံဖြင့် မဆင်မခြင် Short မရောင်းပါနှင့်၊ အရှိန်ပြင်းပါက သီတင်းပတ်ပေါင်းများစွာ ဆက်တက်နေနိုင်သည်။',
      'Support နှင့် Resistance များကို မစစ်ဆေးဘဲ MACD Crossover တစ်ခုတည်းဖြင့် အော်ဒါမဖွင့်ပါနှင့်။',
    ],
  },

  technical_overview: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Technical Matrix: RSI & MACD Momentum Consolidation Phase Across Major Cap Assets',
    headlineMy: 'နည်းပညာသုံးသပ်ချက်- RSI နှင့် MACD အညွှန်းကိန်းများ ပုံမှန်အနားယူနေသည့် အနေအထား',
    impactEn: 'Consolidated technical matrix across top 100 cryptocurrencies shows multi-timeframe consolidation. Moving averages remain above 200 SMA on daily timeframes for high-cap majors.',
    impactMy: 'Top 100 ဒင်္ဂါးများ၏ နည်းပညာအချက်ပြမှုများသည် ပုံမှန်အနားယူနေပြီး Daily Timeframe တွင် အဓိကဒင်္ဂါးများသည် 200 SMA အထက်တွင် အခိုင်အမာ ရပ်တည်နေဆဲ ဖြစ်သည်။',
    priorityActionsEn: [
      'Monitor 4H timeframe RSI breakouts above 55 for fresh swing momentum.',
      'Track 200-day moving average retests as prime long entry zones.',
    ],
    priorityActionsMy: [
      'Swing အရှိန်အသစ်အတွက် 4H Timeframe တွင် RSI ၅၅ အထက်ဖောက်ထွက်မှုကို စောင့်ကြည့်ပါ။',
      'ရက်ပေါင်း ၂၀၀ ပျမ်းမျှမျဉ်း (200 SMA) ပြန်လည်စမ်းသပ်ချိန်ကို အကောင်းဆုံး Long အဝယ်ဇုန်အဖြစ် အသုံးချပါ။',
    ],
    hazardsToAvoidEn: [
      'Do not enter high leverage during oscillator compression.',
    ],
    hazardsToAvoidMy: [
      'အညွှန်းကိန်းများ ဘေးတိုက်ငြိမ်နေချိန်တွင် Leverage အလွန်အကျွံ မသုံးပါနှင့်။',
    ],
  },

  rsi_heatmap: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'RSI Heatmap: 76% of Crypto Market in Neutral 40-55 Zone (Healthy Accumulation)',
    headlineMy: 'RSI အပူချိန်ပြဇယား- စျေးကွက်၏ ၇၆% သည် ကြားနေဇုန် (၄၀-၅၅) တွင် ရှိနေပြီး အားစုဆောင်းနေ',
    impactEn: 'Lack of extreme overbought conditions (>75) means significant runway remains for trend continuation once momentum pivots upward.',
    impactMy: 'အလွန်အကျွံ ဝယ်လိုအားမြင့်မားခြင်း (RSI > 75) မရှိသေးသဖြင့် အတက်လှိုင်း စတင်ချိန်တွင် သိသာစွာ ဆက်လက်တက်နိုင်သော အနေအထားရှိသည်။',
    priorityActionsEn: [
      'Target oversold (<35) high-quality layer-1 tokens for mean-reversion swings.',
      'Follow RSI recovery divergence across 1H and 4H charts.',
    ],
    priorityActionsMy: [
      'RSI ၃၅ အောက်ရောက်နေသော အရည်အသွေးမြင့် L1 ဒင်္ဂါးများကို Mean-Reversion အတက်အတွက် ရွေးချယ်ဝယ်ယူပါ။',
      '1H နှင့် 4H ဇယားများတွင် RSI Divergence ကို စောင့်ကြည့် အသုံးချပါ။',
    ],
    hazardsToAvoidEn: [
      'Do not blindly buy low RSI tokens without verifying liquidity and volume.',
    ],
    hazardsToAvoidMy: [
      'Volume မရှိသော ဒင်္ဂါးများကို RSI နည်းရုံဖြင့် မဆင်မခြင် လိုက်မဝယ်ပါနှင့်။',
    ],
  },

  moving_averages: {
    bias: 'BULLISH',
    headlineEn: 'Moving Average Confluence: 68% of Top 50 Assets Trading Above Daily 50 EMA & 200 SMA',
    headlineMy: 'Moving Average စုဆုံမှု- ဒင်္ဂါး ၆၈% သည် 50 EMA နှင့် 200 SMA အထက်တွင် အခိုင်အမာ ရပ်တည်နေ',
    impactEn: 'Golden cross configurations continue on major pairs. The 50 EMA serves as a dynamic support level on all major dips.',
    impactMy: 'အဓိကဒင်္ဂါးများတွင် Golden Cross ဖြစ်ပေါ်နေဆဲဖြစ်ပြီး 50 EMA သည် စျေးကျဆင်းချိန်တိုင်းတွင် ခိုင်မာသော Support အဖြစ် အလုပ်လုပ်ပေးနေသည်။',
    priorityActionsEn: [
      'Buy dips that retest the rising 20 EMA and 50 EMA with tight invalidation.',
      'Trail profit stops along the 20 EMA on 4H timeframes.',
    ],
    priorityActionsMy: [
      '20 EMA နှင့် 50 EMA သို့ စျေးပြန်ကျဆင်းချိန်တွင် Stop Loss တိုတိုဖြင့် ဝယ်ယူပါ။',
      '4H Timeframe တွင် 20 EMA အတိုင်း Trailing Stop ဖြင့် အမြတ်ကို ထိန်းသိမ်းပါ။',
    ],
    hazardsToAvoidEn: [
      'Avoid longing when price is extended more than 15% above the 20 EMA.',
    ],
    hazardsToAvoidMy: [
      '20 EMA ထက် ၁၅% ကျော် အလွန်အကျွံ မြင့်တက်နေချိန်တွင် Long မလိုက်ပါနှင့်။',
    ],
  },

  macd_signals: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'MACD Momentum Signals: Histogram Contraction Indicates Wave Re-Acceleration Nearing',
    headlineMy: 'MACD အချက်ပြမှုများ- Histogram ကျုံ့သွားခြင်းသည် အတက်အရှိန်သစ် စတင်တော့မည့် အရိပ်အယောင်ဖြစ်',
    impactEn: 'Bearish momentum histograms are flattening out on higher timeframes, hinting at incoming bullish zero-line crossovers.',
    impactMy: 'အကျဘက် Histogram များသည် တဖြည်းဖြည်း သေးငယ်လာနေပြီး မကြာမီ အတက်ဘက် Crossover စတင်နိုင်မည့် အရိပ်အယောင် ပြသနေသည်။',
    priorityActionsEn: [
      'Prepare long entries upon bullish MACD histogram flips to positive green.',
      'Filter for coins with daily MACD above zero baseline.',
    ],
    priorityActionsMy: [
      'MACD Histogram အပေါင်းလက္ခဏာ စတင်ပြချိန်တွင် Long အော်ဒါများကို ပြင်ဆင်ပါ။',
      'Daily MACD သုညအထက်တွင် ရှိနေသော ဒင်္ဂါးများကို ဦးစားပေးပါ။',
    ],
    hazardsToAvoidEn: [
      'Never trade 5-minute MACD crosses during chop sessions without HTF alignment.',
    ],
    hazardsToAvoidMy: [
      'Timeframe ကြီးမားသည့် အတည်ပြုချက်မပါဘဲ 5-minute MACD တစ်ခုတည်းဖြင့် မကုန်သွယ်ပါနှင့်။',
    ],
  },

  bitcoin_etfs: {
    bias: 'HIGH_VOLATILITY',
    headlineEn: 'Bitcoin Spot ETFs: Institutional Capital Inflow Dynamics & AUM Custody Holdings',
    headlineMy: 'Bitcoin Spot ETFs- အဖွဲ့အစည်းကြီးများ၏ ရင်းနှီးမြှုပ်နှံမှုနှင့် ပိုင်ဆိုင်မှု ပမာဏများ',
    impactEn: 'Daily net ETF flow dictates spot liquidity velocity. Institutional ETF flows account for a major share of spot volume.',
    impactMy: 'နေ့စဉ် ETF ငွေအဝင်အထွက်သည် Spot စျေးနှုန်းအပေါ် အဓိက သက်ရောက်မှုရှိပြီး အဖွဲ့အစည်းကြီးများ၏ ကုန်သွယ်မှုသည် စျေးကွက်ကို ဦးဆောင်နေသည်။',
    priorityActionsEn: [
      'Monitor net inflows during US session open (09:30 AM EDT) for trend direction.',
      'Utilize institutional entry averages as macro support pillars.',
    ],
    priorityActionsMy: [
      'အမေရိကန် စျေးဖွင့်ချိန်တွင် အသားတင် ငွေအဝင်အထွက်ကို ကြည့်ရှု၍ Trend ကို လိုက်ဖမ်းပါ။',
      'အဖွဲ့အစည်းများ၏ ပျမ်းမျှဝယ်စျေးကို အဓိက Support အဖြစ် သတ်မှတ်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Avoid high-leverage positions into 3 consecutive days of institutional outflows.',
    ],
    hazardsToAvoidMy: [
      'အဖွဲ့အစည်းကြီးများ ရက်ဆက် ငွေထုတ်နေချိန်တွင် Leverage အလွန်အကျွံ မသုံးပါနှင့်။',
    ],
  },

  ethereum_etfs: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Ethereum Spot ETFs: Staking Narrative & Institutional Accumulation Progress',
    headlineMy: 'Ethereum Spot ETFs- ရေရှည်စုဆောင်းမှုနှင့် အဖွဲ့အစည်းကြီးများ၏ အနေအထား',
    impactEn: 'ETH ETF flows remain selective with steady base accumulation across institutional custodial balance sheets.',
    impactMy: 'ETH ETF ငွေစီးဆင်းမှုသည် ရေရှည်အတွက် ပုံမှန်စုဆောင်းသည့် အနေအထားတွင် ရှိနေသည်။',
    priorityActionsEn: [
      'Accumulate spot ETH during consolidation dips near key institutional floors.',
    ],
    priorityActionsMy: [
      'အဓိက အဖွဲ့အစည်းဝယ်စျေးတန်းများအနီးတွင် Spot ETH ကို စုဆောင်းဝယ်ယူပါ။',
    ],
    hazardsToAvoidEn: [
      'Avoid premature high-leverage breakouts without volume expansion.',
    ],
    hazardsToAvoidMy: [
      'Volume မပါဘဲ စျေးတက်သည်ကို အထင်ကြီးပြီး Leverage ဖြင့် Long မလိုက်ပါနှင့်။',
    ],
  },

  solana_etfs: {
    bias: 'BULLISH',
    headlineEn: 'Solana ETFs: SEC S-1 Filings & Institutional Spot Adoption Momentum',
    headlineMy: 'Solana ETFs- SEC စာရွက်စာတမ်း တင်သွင်းမှုများနှင့် အဖွဲ့အစည်းကြီးများ၏ စိတ်ဝင်စားမှု',
    impactEn: 'Positive net inflows and filing advancements reflect growing institutional appetite for high-performance Solana network tokens.',
    impactMy: 'SEC ခွင့်ပြုချက်ဆိုင်ရာ သတင်းများနှင့်အတူ Solana အပေါ် အဖွဲ့အစည်းကြီးများ၏ ဝယ်လိုအား မြင့်တက်နေသည်။',
    priorityActionsEn: [
      'Maintain exposure to SOL on healthy 4H pullbacks.',
    ],
    priorityActionsMy: [
      'SOL ကို 4H Timeframe စျေးအနားယူချိန်များတွင် ဝယ်ယူစုဆောင်းပါ။',
    ],
    hazardsToAvoidEn: [
      'Do not chase FOMO green spikes on unconfirmed regulatory rumors.',
    ],
    hazardsToAvoidMy: [
      'အတည်မပြုနိုင်သော ကောလာဟလများကြောင့် စျေးထိုးတက်ချိန်တွင် အတင်းလိုက်မဝယ်ပါနှင့်။',
    ],
  },

  xrp_etfs: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'XRP ETFs: Multi-Issuer SEC Applications & Cross-Border Liquidity Prospect',
    headlineMy: 'XRP ETFs- ကုမ္ပဏီများ၏ လျှောက်ထားမှုများနှင့် အလားအလာများ',
    impactEn: 'Regulatory clarity and filing updates offer long-term catalytic potential for XRP tokenomics.',
    impactMy: 'စည်းမျဉ်းစည်းကမ်း ရှင်းလင်းမှုများနှင့်အတူ XRP သည် ရေရှည် အလားအလာ ကောင်းမွန်နေသည်။',
    priorityActionsEn: [
      'Trade defined support and resistance levels with disciplined stop losses.',
    ],
    priorityActionsMy: [
      'ရှင်းလင်းသော Support နှင့် Resistance ဇုန်များအတွင်းသာ စနစ်တကျ ကုန်သွယ်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Never trade without stop-loss on regulatory news volatility.',
    ],
    hazardsToAvoidMy: [
      'သတင်းထွက်ပေါ်ချိန်များတွင် Stop Loss မပါဘဲ လုံးဝ ကုန်သွယ်မှု မပြုပါနှင့်။',
    ],
  },

  hyperliquid_etfs: {
    bias: 'BULLISH',
    headlineEn: 'Hyperliquid & On-Chain Perpetuals Growth: DEX Dominance Expansion',
    headlineMy: 'Hyperliquid နှင့် On-Chain ကုန်သွယ်မှု- DEX နေရာယူမှု အားကောင်းလာခြင်း',
    impactEn: 'On-chain derivatives exchange velocity continues to capture volume from legacy venues.',
    impactMy: 'On-chain futures ကုန်သွယ်မှုများသည် ဗဟိုချုပ်ကိုင်မှုမဲ့ စနစ်များဆီသို့ လျင်မြန်စွာ ကူးပြောင်းလာနေသည်။',
    priorityActionsEn: [
      'Capitalize on on-chain liquidity depth for institutional-grade execution.',
    ],
    priorityActionsMy: [
      'ငွေဖြစ်လွယ်မှု ကောင်းမွန်သော အဓိက On-chain ဒင်္ဂါးများကို ဦးစားပေးပါ။',
    ],
    hazardsToAvoidEn: [
      'Check gas and slippage parameters prior to execution.',
    ],
    hazardsToAvoidMy: [
      'ကုန်သွယ်မှုမပြုမီ Slippage နှင့် Gas နှုန်းထားများကို သေချာစွာ စစ်ဆေးပါ။',
    ],
  },

  crypto_etfs: {
    bias: 'HIGH_VOLATILITY',
    headlineEn: 'Crypto ETFs Flow Overview: Multi-Asset Inflows & Institutional Liquidity Waves',
    headlineMy: 'Crypto ETFs ခြုံငုံသုံးသပ်ချက်- ရင်းနှီးမြှုပ်နှံမှု ငွေစီးဆင်းမှုများနှင့် အဖွဲ့အစည်းအရင်းအနှီးများ',
    impactEn: 'Broad institutional tracking shows sector rotation across Bitcoin, Ethereum, and emerging altcoin vehicles.',
    impactMy: 'အဖွဲ့အစည်းကြီးများ၏ ရင်းနှီးမြှုပ်နှံမှုများသည် Bitcoin၊ Ethereum နှင့် အခြားဒင်္ဂါးများအကြား အလှည့်ကျ စီးဆင်းနေသည်။',
    priorityActionsEn: [
      'Track cumulative flow trends across all major institutional crypto assets.',
    ],
    priorityActionsMy: [
      'အဖွဲ့အစည်းကြီးများ၏ အသားတင် စီးဝင်မှု အလုံးစုံကို စောင့်ကြည့်၍ စျေးကွက်လမ်းကြောင်းကို လိုက်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Do not ignore net outflow trends.',
    ],
    hazardsToAvoidMy: [
      'အသားတင် ငွေထွက်နေသည့် လမ်းကြောင်းကို လျစ်လျူမရှုပါနှင့်။',
    ],
  },

  bnb_treasuries: {
    bias: 'BULLISH',
    headlineEn: 'BNB Chain Tokenomics: Auto-Burn Mechanisms & Strong Ecosystem Reserves',
    headlineMy: 'BNB စနစ်- ပုံမှန် Auto-Burn မီးရှို့ဖျက်ဆီးမှုနှင့် အရန်ပိုင်ဆိုင်မှုများ',
    impactEn: 'Systematic quarterly auto-burns and high BSC validator staking maintain a strong deflationary supply pressure.',
    impactMy: '၃ လတစ်ကြိမ် ပုံမှန် မီးရှို့ဖျက်ဆီးမှု (Auto-Burn) နှင့် BSC Staking များကြောင့် BNB ၏ စျေးကွက်ရောင်းလိုအား လျော့ကျကာ စျေးနှုန်းကို ထိန်းမတ်ပေးထားသည်။',
    priorityActionsEn: [
      'Accumulate BNB on key ecosystem support pullbacks.',
    ],
    priorityActionsMy: [
      'BNB စျေးအနားယူချိန်များတွင် Support တန်းများမှ ဝယ်ယူစုဆောင်းပါ။',
    ],
    hazardsToAvoidEn: [
      'Avoid chasing high leverage during volatile regulatory hearings.',
    ],
    hazardsToAvoidMy: [
      'သတင်းထွက်ပေါ်ချိန်တွင် Leverage အလွန်အကျွံ မသုံးပါနှင့်။',
    ],
  },

  cryptocurrencies: {
    bias: 'BULLISH',
    headlineEn: 'Cryptocurrency Market Breadth: 60.64M Tracked Tokens & Rapid Ecosystem Expansion',
    headlineMy: 'Crypto စျေးကွက် အကျယ်အဝန်း- ဒင်္ဂါး ၆၀.၆၄ သန်း စောင့်ကြည့်လေ့လာမှုနှင့် ဂေဟစနစ် ကြီးထွားမှု',
    impactEn: 'Explosive token generation across Solana and Base reflects unprecedented creator activity and on-chain liquidity velocity.',
    impactMy: 'Solana နှင့် Base တို့တွင် ဒင်္ဂါးအသစ်များ အလွန်အမင်း ထွက်ပေါ်နေခြင်းသည် On-chain လှုပ်ရှားမှုနှင့် ငွေကြေးစီးဆင်းမှု အားကောင်းနေကြောင်း ပြသနေသည်။',
    priorityActionsEn: [
      'Focus high-capital trades on top 50 liquidity leaders to avoid illiquid slippage.',
      'Filter new token launches using strict audit and volume thresholds.',
    ],
    priorityActionsMy: [
      'အရင်းအနှီးကြီးကြီး ကုန်သွယ်မှုများကို Top 50 ဒင်္ဂါးများတွင်သာ ပြုလုပ်ပါ။',
      'ဒင်္ဂါးအသစ်များကို Audit စစ်ဆေးချက်နှင့် Volume ရှိမှသာ စဉ်းစားပါ။',
    ],
    hazardsToAvoidEn: [
      'Never trade low-liquidity memecoins without accepting high rug-pull risk.',
    ],
    hazardsToAvoidMy: [
      'Liquidity နည်းပါးသော ဒင်္ဂါးများကို အရင်းအနှီး အကုန်ထည့်ပြီး လုံးဝ မဝယ်ပါနှင့်။',
    ],
  },

  social_mentions: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Social Sentiment Intelligence: Retail Hype vs Smart Money Divergence',
    headlineMy: 'လူမှုကွန်ရက် သုံးသပ်ချက်- လက်လီကုန်သွယ်သူများ၏ စိတ်ခံစားမှုနှင့် Smart Money လမ်းကြောင်း',
    impactEn: 'Social sentiment is healthy and measured without euphoric retail FOMO, leaving ample room for sustainable price expansion.',
    impactMy: 'လူမှုကွန်ရက်တွင် အလွန်အကျွံ စိတ်လှုပ်ရှားမှု မရှိသေးဘဲ ပုံမှန်အခြေအနေတွင်သာ ရှိနေသဖြင့် စျေးကွက်ဆက်လက်တက်ရန် အခွင့်အလမ်း ကောင်းမွန်နေဆဲ ဖြစ်သည်။',
    priorityActionsEn: [
      'Take partial profits when social mention velocity hits top 1% euphoria extremes.',
      'Accumulate fundamentally solid projects during social sentiment lulls.',
    ],
    priorityActionsMy: [
      'လူမှုကွန်ရက်တွင် အလွန်အမင်း နာမည်ကြီးပြီး လူတိုင်းပြောနေချိန်တွင် အမြတ်ထုတ်ပါ။',
      'လူပြောနည်းပြီး စျေးကွက်ငြိမ်နေချိန်တွင် အခြေခံကောင်းသော ဒင်္ဂါးများကို စုဆောင်းပါ။',
    ],
    hazardsToAvoidEn: [
      'Do not buy top of viral spikes fueled solely by TikTok or X hype.',
    ],
    hazardsToAvoidMy: [
      'Social Media ပေါ်တွင် ဗိုင်းရပ်စ်ဖြစ်ပြီး ရုတ်တရက်ထိုးတက်ချိန်တွင် ထိပ်ဆုံးမှ လိုက်မဝယ်ပါနှင့်။',
    ],
  },

  altcoin_season: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Altcoin Season Index: Bitcoin Dominance Balancing Before Capital Rotation',
    headlineMy: 'Altcoin Season အညွှန်းကိန်း- Bitcoin မှတစ်ဆင့် Altcoins များဆီသို့ ငွေကြေးလည်ပတ်စီးဆင်းမှု',
    impactEn: 'Current index reflects Bitcoin consolidating its macro base. Once BTC sets a fresh stable range, profits typically rotate rapidly into high-beta altcoins.',
    impactMy: 'လက်ရှိတွင် Bitcoin သည် အားစုဆောင်းနေပြီး စျေးငြိမ်သွားသည်နှင့်တစ်ပြိုင်နက် အမြတ်ငွေများသည် Altcoin ဒင်္ဂါးများဆီသို့ လျင်မြန်စွာ စီးဆင်းရောက်ရှိလာမည် ဖြစ်သည်။',
    priorityActionsEn: [
      'Build early positions in top-tier Layer 1 and DeFi protocols before the Altcoin Index crosses 75.',
      'Maintain balanced 60% BTC / 40% select Alts portfolio allocation.',
    ],
    priorityActionsMy: [
      'Altcoin Index ၇၅ မကျော်မီ အရည်အသွေးမြင့် L1 နှင့် DeFi ဒင်္ဂါးများတွင် ကြိုတင်နေရာယူပါ။',
      'Bitcoin ၆၀% နှင့် ရွေးချယ်ထားသော Altcoin ၄၀% အချိုးဖြင့် မျှတစွာ ကိုင်ဆောင်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Do not abandon Bitcoin exposure completely during the pre-rotation phase.',
    ],
    hazardsToAvoidMy: [
      'Altcoins မတက်မီကာလတွင် Bitcoin အားလုံးကို ထုတ်ရောင်းပြီး Altcoins သီးသန့် မပြောင်းပါနှင့်။',
    ],
  },

  market_cycles: {
    bias: 'BULLISH',
    headlineEn: 'Macro Halving Cycles: Post-Halving Expansion Trajectory Intact',
    headlineMy: 'မက်ခရို စက်ဝန်းများ- Halving အလွန် ကြီးထွားမှု စက်ဝန်းအတိုင်း လျှောက်လှမ်းနေ',
    impactEn: 'Historic 4-year cycle rhythm shows market situated in the mid-expansion phase, historically characterized by higher lows and steady compounding.',
    impactMy: '၄ နှစ်တစ်ကြိမ် စက်ဝန်းအရ လက်ရှိစျေးကွက်သည် အလယ်အလတ် ကြီးထွားမှုအပိုင်းတွင် ရှိနေပြီး အမြင့်သစ်များဆီသို့ တဖြည်းဖြည်း ချီတက်နေသည်။',
    priorityActionsEn: [
      'Maintain long-term spot positions with a multi-quarter horizon.',
      'Use major monthly drawdowns as prime dollar-cost averaging opportunities.',
    ],
    priorityActionsMy: [
      'လပေါင်းများစွာ ရေရှည်ရည်မှန်းချက်ဖြင့် Spot ပိုင်ဆိုင်မှုများကို ဆက်လက်ကိုင်ထားပါ။',
      'စျေးကွက် လစဉ်ပြန်ကျချိန်တိုင်းတွင် ဒေါ်လာအချိုးကျ စနစ်တကျ ထပ်မံစုဆောင်းပါ။',
    ],
    hazardsToAvoidEn: [
      'Never get shaken out by short-term 10% - 15% mid-cycle volatility.',
    ],
    hazardsToAvoidMy: [
      'စက်ဝန်းအတွင်း ၁၀% - ၁၅% သာမန် စျေးကျဆင်းရုံဖြင့် စိတ်ပျက်ပြီး အရှုံးဖြင့် မရောင်းပါနှင့်။',
    ],
  },

  btc_dominance: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'Bitcoin Dominance: Macro Anchor Testing Institutional Resistance Band',
    headlineMy: 'Bitcoin စျေးကွက်လွှမ်းမိုးမှု- အဖွဲ့အစည်းဆိုင်ရာ စျေးကွက်နေရာယူမှု',
    impactEn: 'BTC Dominance remains elevated, confirming Bitcoin continues to lead institutional liquidity intake.',
    impactMy: 'Bitcoin Dominance မြင့်မားနေဆဲဖြစ်ပြီး အဖွဲ့အစည်းကြီးများ၏ ငွေကြေးသည် Bitcoin သို့ အဓိက စီးဝင်နေဆဲဖြစ်ကြောင်း အတည်ပြုသည်။',
    priorityActionsEn: [
      'Favor BTC for low-volatility stability and capital protection.',
    ],
    priorityActionsMy: [
      'အရင်းအနှီး လုံခြုံစိတ်ချရစေရန် Bitcoin ကို အဓိက ထားကိုင်ဆောင်ပါ။',
    ],
    hazardsToAvoidEn: [
      'Avoid heavy leverage on micro-cap altcoins while BTC dominance is climbing.',
    ],
    hazardsToAvoidMy: [
      'Bitcoin Dominance တက်နေချိန်တွင် Altcoin အသေးစားများကို Leverage အများကြီးဖြင့် မကစားပါနှင့်။',
    ],
  },

  cmc_20_index: {
    bias: 'BULLISH',
    headlineEn: 'CMC 20 Index: Top 20 Market Leaders Delivering Institutional Benchmark Alpha',
    headlineMy: 'CMC 20 အညွှန်းကိန်း- ထိပ်တန်းဒင်္ဂါး ၂၀ ၏ စွမ်းဆောင်ရည် စံနှုန်း',
    impactEn: 'Equal-weighted top 20 index demonstrates solid trend alignment and strong downside support.',
    impactMy: 'ထိပ်တန်းဒင်္ဂါး ၂၀ ၏ စွမ်းဆောင်ရည်သည် အတက်ဘက် လမ်းကြောင်းတွင် ရှိနေပြီး ခိုင်မာသော Support ရရှိထားသည်။',
    priorityActionsEn: [
      'Benchmark individual crypto portfolio performance against the CMC 20 index.',
    ],
    priorityActionsMy: [
      'မိမိ အကောင့်စွမ်းဆောင်ရည်ကို CMC 20 အညွှန်းကိန်းနှင့် နှိုင်းယှဉ်လေ့လာပါ။',
    ],
    hazardsToAvoidEn: [
      'Avoid holdings that consistently underperform the CMC 20 benchmark.',
    ],
    hazardsToAvoidMy: [
      'CMC 20 ထက် စွမ်းဆောင်ရည် အမြဲညံ့ဖျင်းနေသော ဒင်္ဂါးများကို မကိုင်ဆောင်ပါနှင့်။',
    ],
  },

  cmc_100_index: {
    bias: 'RANGE_ACCUMULATION',
    headlineEn: 'CMC 100 Index: Broad Cryptocurrency Ecosystem Health & Liquidity Dispersion',
    headlineMy: 'CMC 100 အညွှန်းကိန်း- စျေးကွက်တစ်ခုလုံး၏ ကျန်းမာရေးနှင့် ငွေဖြစ်လွယ်မှု ပျံ့နှံ့ပုံ',
    impactEn: 'CMC 100 breadth reveals healthy participation across infrastructure, gaming, AI, and DeFi sectors.',
    impactMy: 'CMC 100 သည် အခြေခံအဆောက်အအုံ၊ AI နှင့် DeFi ကဏ္ဍစုံတွင် မျှတစွာ တိုးတက်နေကြောင်း ဖော်ပြနေသည်။',
    priorityActionsEn: [
      'Diversify across top-performing sectors identified in the CMC 100 matrix.',
    ],
    priorityActionsMy: [
      'CMC 100 တွင် အားအကောင်းဆုံးဖြစ်နေသော ကဏ္ဍများအကြား မျှတစွာ ရင်းနှီးမြှုပ်နှံပါ။',
    ],
    hazardsToAvoidEn: [
      'Do not over-concentrate in a single lagging market sector.',
    ],
    hazardsToAvoidMy: [
      'တက်လမ်းနှေးနေသော ကဏ္ဍတစ်ခုတည်းတွင် အရင်းအနှီးအားလုံး မမြှုပ်နှံပါနှင့်။',
    ],
  },
};

/**
 * Safe accessor for section TradeImpactGuide - guarantees non-undefined output
 */
export function getTradeImpactGuide(section: string): TradeImpactGuide {
  return (
    CMC_TRADE_IMPACT_BY_SECTION[section] ||
    CMC_TRADE_IMPACT_BY_SECTION['market_overview'] || {
      bias: 'RANGE_ACCUMULATION',
      headlineEn: 'Cryptocurrency Market Analytics & Directional Playbook',
      headlineMy: 'စျေးကွက်အညွှန်းကိန်း သုံးသပ်ချက်နှင့် ကုန်သွယ်မှု လမ်းညွှန်ချက်',
      impactEn: 'System metrics and trading conditions are actively tracked. Execute with disciplined risk control.',
      impactMy: 'စျေးကွက်အခြေအနေများကို စဉ်ဆက်မပြတ် စောင့်ကြည့်နေပါသည်။ စည်းကမ်းရှိရှိ ကုန်သွယ်ပါ။',
      priorityActionsEn: [
        'Confirm 4H support levels before entering swing setups.',
        'Keep total trade risk capped under 2% per trade.',
      ],
      priorityActionsMy: [
        '4H Support တန်းများ အတည်ပြုပြီးမှသာ Swing အော်ဒါများ ဖွင့်ပါ။',
        'အော်ဒါတစ်ခုလျှင် ၂% ထက် ပို၍ မဆုံးရှုံးစေရန် Stop Loss ထားရှိပါ။',
      ],
      hazardsToAvoidEn: [
        'Avoid over-leveraging into high volatility sessions.',
      ],
      hazardsToAvoidMy: [
        'စျေးအတက်အကျမြန်ချိန်များတွင် Leverage အလွန်အကျွံ မသုံးပါနှင့်။',
      ],
    }
  );
}
