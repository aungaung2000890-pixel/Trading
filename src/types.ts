export interface CoinOpportunity {
  rank: number;
  symbol: string;
  name: string;
  pair: string;
  currentPrice: number;
  priceFormatted: string;
  change24h: number;
  volume24h: number; // in USD
  volume24hUsd?: number;
  high24h?: number;
  low24h?: number;
  volumeFormatted: string;
  openInterest?: string;
  oiChange?: string;
  fundingRate: number; // percentage
  fundingFormatted: string;
  bias: 'LONG' | 'SHORT' | 'WAIT';
  feasibility10Percent: 'HIGH' | 'MEDIUM' | 'LOW';
  whyRanked: string;
  whyRankedMy: string; // Burmese translation
  newsCatalyst: string;
  newsCatalystMy: string;
  technical: {
    timeframe4h: {
      trend: string;
      structure: string;
      support: string;
      resistance: string;
    };
    timeframe1h: {
      trend: string;
      bosChoch: string;
      momentum: string;
      setup: string;
    };
    timeframe15m: {
      immediateSetup: string;
      entryTrigger: string;
      keyLevel: string;
    };
  };
  feasibilityReason: string;
}

export interface MacroIndicator {
  name: string;
  value: string;
  status: 'bullish' | 'bearish' | 'neutral' | 'warning';
  detail: string;
  detailMy: string;
}

export interface LiveTickerItem {
  contract: string;
  symbol: string;
  lastPrice: number;
  priceFormatted?: string;
  change24h: number;
  volume24hUsd: number;
  high24h: number;
  low24h: number;
  fundingRate: number;
  feasibility: 'HIGH' | 'MEDIUM' | 'LOW';
  bias: 'LONG' | 'SHORT' | 'WAIT';
}

export interface DemoTradePreset {
  symbol: string;
  side: 'LONG' | 'SHORT';
  margin: number;
  leverage: number;
  entryPrice?: number;
  slPrice?: number;
  tpPrice?: number;
  orderType?: 'LIMIT' | 'MARKET';
  source?: string;
  timestamp?: number;
}

export interface UserRiskSettings {
  accountBalance: number;
  margin: number;
  leverage: number;
  targetTpPercent: number;
  targetSlPercent: number;
  maxPortfolioRiskPercent: number;
  minRequiredRR: number;
  preferredHoldingHours: number;
}

export interface TechnicalRiskAudit {
  recommendedLeverage: number;
  recommendedMargin: number;
  recommendedTpPercent: number;
  recommendedSlPercent: number;
  atr24hPercent: number;
  liquidationBufferPercent: number;
  riskRewardRatio: number;
  feasibilityProbability: number;
  feasibilityVerdict: 'HIGH' | 'MEDIUM' | 'LOW';
  technicalReason: string;
  technicalReasonMy: string;
  dangerWarnings: string[];
  dangerWarningsMy: string[];
}

export type AppNavView =
  | 'home'
  | 'cryptocraft_calendar'
  | 'cmc'
  | 'dual_engine'
  | 'spot_advisor'
  | 'long_term'
  | 'wallet_advisor'
  | 'market_timing'
  | 'world_clocks'
  | 'high_leverage'
  | 'ai'
  | 'signals_copy'
  | 'strategy'
  | 'calculator'
  | 'scanner'
  | 'tradecard'
  | 'demo'
  | 'learning'
  | 'forex'
  | 'binance_live';

export type CryptoCraftImpact = 'high' | 'medium' | 'low' | 'non_economic';
export type CryptoCraftAsset = 'ALL' | 'USD' | 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP' | 'ALTS';

export interface CryptoCraftPlaybook {
  bullishCondition: string;
  bullishConditionMy: string;
  bearishCondition: string;
  bearishConditionMy: string;
  recommendedStrategy: string;
  recommendedStrategyMy: string;
}

export interface CryptoCraftVolatility {
  expectedBtcMovePercent: string;
  volatilityRating: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  affectedPairs: string[];
}

export interface CryptoCraftCalendarEvent {
  id: string;
  title: string;
  titleMy: string;
  currency: string; // e.g. 'USD', 'BTC', 'ETH', 'SOL'
  currencyName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. '08:30' EDT / '19:00' MMT
  timestamp: number; // ms
  impact: CryptoCraftImpact;
  category: 'macro' | 'monetary_policy' | 'inflation' | 'employment' | 'token_unlock' | 'network_upgrade' | 'regulatory' | 'etf_flow';
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
  actualStatus?: 'better' | 'worse' | 'neutral'; // better = green, worse = red (crypto perspective)
  whyTradersCare: string;
  whyTradersCareMy: string;
  cryptoPlaybook: CryptoCraftPlaybook;
  historicalVolatility: CryptoCraftVolatility;
  source: string;
  frequency: string;
  nextScheduledRelease?: string;
  detailUrl?: string;
}

export interface CryptoCraftCalendarResponse {
  success: boolean;
  count: number;
  data: CryptoCraftCalendarEvent[];
  nextHighImpactEvent?: CryptoCraftCalendarEvent | null;
  timestamp: number;
}

export type CmcHubTab = 'markets' | 'indicators' | 'etf' | 'derivatives' | 'technical';

export type LongTermTimeframe = '1_month' | '3_months' | '6_months' | '1_year' | '3_years';
export type LongTermRiskTolerance = 'conservative' | 'balanced' | 'aggressive';

export interface LongTermScenarioTier {
  expectedReturnPercent: number; // e.g. 15 for +15%
  estimatedValueUsd: number; // e.g. 1150
  probabilityPercent: number; // e.g. 70
  maxExpectedDrawdownPercent: number; // e.g. -8
  targetPriceEstimate: number;
}

export interface LongTermAssetRecommendation {
  symbol: string;
  name: string;
  allocationPercent: number; // e.g. 40
  allocatedAmountUsd: number; // calculated from user investment amount
  currentPrice: number;
  probabilityScore: number; // e.g. 88 (0-100)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SPECULATIVE';
  // Required 10 analysis points:
  marketConditionSummary: string;
  technicalAnalysis: {
    htfTrend: string;
    keyAccumulationRange: string;
    majorResistanceTarget: string;
    movingAveragesSignal: string;
  };
  fundamentalAnalysis: {
    tokenomics: string;
    revenueAndFees: string;
    treasuryHealth: string;
  };
  latestNewsAndCatalysts: string;
  marketTrendsAndSentiment: {
    sentimentBias: string;
    institutionalInterest: string;
  };
  onChainData: {
    exchangeReservesTrend: string;
    longTermHolderSupply: string;
    whaleAccumulationSignal: string;
  };
  regulationAndMacro: {
    regulatoryStatus: string;
    macroEnvironmentFit: string;
  };
  projectDevelopment: {
    ecosystemHealth: string;
    developerActivity: string;
  };
  invalidationRisk: string;
  scenarios: {
    conservative: LongTermScenarioTier;
    moderate: LongTermScenarioTier;
    bullish: LongTermScenarioTier;
  };
  dcaStagingAdvice: string;
}

export interface LongTermInvestmentRequest {
  timeframe: LongTermTimeframe;
  investmentAmount: number;
  riskTolerance?: LongTermRiskTolerance;
  lang?: 'my' | 'en';
}

export interface LongTermAnalysisResult {
  success: boolean;
  timeframe: LongTermTimeframe;
  investmentAmount: number;
  riskTolerance: LongTermRiskTolerance;
  overallProbabilityScore: number;
  macroMarketSummary: string;
  macroMarketSummaryMy?: string;
  estimatedReturnScenarios: {
    conservative: { minPercent: number; maxPercent: number; portfolioValue: number; probability: number; maxDrawdown: number };
    moderate: { minPercent: number; maxPercent: number; portfolioValue: number; probability: number; maxDrawdown: number };
    bullish: { minPercent: number; maxPercent: number; portfolioValue: number; probability: number; maxDrawdown: number };
  };
  recommendedAssets: LongTermAssetRecommendation[];
  dcaStagingPlan: {
    initialDeploymentPercent: number;
    stagedTrancheCount: number;
    frequency: string;
    pullbackTriggerRule: string;
  };
  portfolioSummaryMarkdown: string;
  disclaimer: string;
  source: 'gemini_ai' | 'algorithmic_engine';
  generatedAt: number;
}

export type DeviceLayoutOption = 'phone' | 'tablet' | 'desktop';
export type DeviceLayoutSelection = 'auto' | 'phone' | 'tablet' | 'desktop';
export type TradingHubTab = 'overview' | 'pulse' | 'signals' | 'risk' | 'execution' | 'ai_learn';

export type AIAssistantMode = 'quick' | 'deep' | 'ask_ai' | 'high_leverage';

export interface WorldMarketClockItem {
  id: string;
  city: string;
  cityMy: string;
  country: string;
  flag: string;
  timeZone: string;
  sessionName: string;
  sessionNameMy: string;
  sessionOpenUtc: number; // hour in UTC (0-23)
  sessionCloseUtc: number; // hour in UTC (0-23)
  sessionOpenLocal: string; // e.g. "09:30 AM"
  sessionCloseLocal: string; // e.g. "04:00 PM"
  wallpaperPresetKey?: string;
  customWallpaperUrl?: string;
  enabled?: boolean;
}

export interface MarketClockSettings {
  showSeconds: boolean;
  is24Hour: boolean;
  showDigitalTime: boolean;
  showUtcOffset: boolean;
  showMarketStatus: boolean;
  clockSize: 'compact' | 'standard' | 'large';
  clockStyle: 'tactical' | 'minimal' | 'cyber' | 'gold' | 'classic';
  backgroundOpacity: number; // 0.1 to 0.9
  textBrightness: 'normal' | 'high' | 'ultra';
  numberVisibility: 'all' | 'cardinals' | 'none';
  sessionIndicator: boolean;
}

export type TimingWindowStatus = 'PRIME' | 'CAUTION' | 'AVOID' | 'WAIT';

export interface EconomicNewsEvent {
  id: string;
  title: string;
  titleMy: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  timeStr: string; // e.g. "12:30 UTC"
  minutesUntil: number; // positive = before, 0 = during, negative = after
  phase: 'before' | 'during' | 'after';
  forecast?: string;
  previous?: string;
  adviceEn: string;
  adviceMy: string;
}

export interface CryptoNewsCatalyst {
  id: string;
  title: string;
  titleMy: string;
  category: 'ETF' | 'REGULATORY' | 'EXCHANGE' | 'UNLOCK' | 'PROTOCOL' | 'MACRO';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  adviceEn: string;
  adviceMy: string;
  timeAgo: string;
}

export interface SessionOverlapInfo {
  id: string;
  name: string;
  nameMy: string;
  sessions: string[];
  startUtc: number;
  endUtc: number;
  significanceEn: string;
  significanceMy: string;
  liquidityScore: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  volatilityScore: 'EXPANDING' | 'MODERATE' | 'COMPRESSED';
  active: boolean;
}

export interface MarketTimingAssessment {
  windowStatus: TimingWindowStatus;
  timingScore: number; // 0 to 10
  currentSessionSummary: string;
  currentSessionSummaryMy: string;
  activeSessions: string[];
  activeOverlaps: SessionOverlapInfo[];
  btcVolatility: 'HIGH' | 'MEDIUM' | 'LOW';
  forexVolatility: 'HIGH' | 'MEDIUM' | 'LOW';
  volumeLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  openInterestBias: 'RISING_BULLISH' | 'RISING_BEARISH' | 'UNWINDING' | 'NEUTRAL';
  fundingPressure: 'CROWDED_LONG' | 'CROWDED_SHORT' | 'BALANCED';
  newsRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  upcomingEconomicEvents: EconomicNewsEvent[];
  cryptoCatalysts: CryptoNewsCatalyst[];
  guidanceEn: string;
  guidanceMy: string;
  actionFormulaEn: string;
  actionFormulaMy: string;
}

export type ClockStyleVariant = 'tactical' | 'minimal' | 'cyber' | 'gold' | 'classic';
export type ClockSizeVariant = 'compact' | 'standard' | 'large';
export type CardTransparency = 'solid' | 'subtle' | 'glass';
export type MarketType = 'crypto' | 'forex';

export type AppTheme = 'dark_trading' | 'midnight' | 'graphite' | 'light_trading' | 'cyber_neon';
export type AccentColor = 'amber' | 'emerald' | 'cyan' | 'blue' | 'purple' | 'rose';

export interface CustomLogoSettings {
  customLogoUrl: string | null;
  presetId?: string;
  logoText: string;
  logoHeight: number; // in pixels (e.g. 24 to 56, default 36)
  shape: 'rounded' | 'circle' | 'square' | 'pill';
  showText: boolean;
}

export interface CustomBackgroundSettings {
  enabled: boolean;
  imageUrl: string | null;
  presetId?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'custom';
  positionCustomX: number; // 0 to 100%
  positionCustomY: number; // 0 to 100%
  scale: 'cover' | 'contain' | 'custom';
  scalePercent: number; // 50 to 250%
  brightness: number; // 10 to 150%
  opacity: number; // 5 to 100%
  blur: number; // 0 to 30px
  repeat: 'no-repeat' | 'repeat';
}

export interface AppSettings {
  general: {
    language: 'my' | 'en';
    defaultTradingMode: AIAssistantMode;
    timeFormat: '12h' | '24h';
    defaultTimeframe: string;
  };
  market: {
    preferredMarket: 'crypto' | 'forex' | 'both';
    defaultExchange: 'binance' | 'bybit' | 'okx' | 'deriv';
    defaultCryptoPair: string;
    defaultForexPair: string;
  };
  clock: {
    settings: MarketClockSettings;
    activeCityIds: string[];
    perCityWallpapers: Record<string, string>; // cityId -> dataUrl or presetKey
  };
  appearance: {
    theme: AppTheme;
    accentColor: AccentColor;
    cardTransparency: CardTransparency;
    logo: CustomLogoSettings;
    background: CustomBackgroundSettings;
  };
  trading: {
    defaultLeverage: number;
    maxRiskPercent: number;
    defaultMargin: number;
    tradingStyle: 'scalp' | 'short_term' | 'intraday';
  };
  alerts: {
    londonOpen: boolean;
    nyOpen: boolean;
    asiaOpen: boolean;
    londonNyOverlap: boolean;
    majorEconomicEvent: boolean;
    highVolatility: boolean;
    highQualitySetup: boolean;
    liquidationRisk: boolean;
  };
}

export interface AIAssistantRequest {
  mode: AIAssistantMode;
  query?: string;
  symbol?: string;
  timeframe?: string;
  currentPrice?: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  fundingRate?: number;
  volume24hUsd?: number;
  margin?: number;
  leverage?: number;
  walletBalance?: number;
  desiredRiskPercent?: number;
  desiredDirection?: 'LONG' | 'SHORT' | 'AUTO';
  newsCatalyst?: string;
  economicNews?: string;
  tradingStyle?: 'scalp' | 'short_term' | 'intraday' | 'breakout' | 'momentum';
  marketType?: 'crypto' | 'forex';
  image?: {
    data: string; // base64 without prefix
    mimeType: string;
  };
  marketContext?: string;
}

export interface AIAssistantResponse {
  success: boolean;
  mode: AIAssistantMode;
  decision?: 'LONG' | 'SHORT' | 'WAIT';
  highLeverageApproval?: 'APPROVED' | 'HIGH_RISK' | 'REJECTED';
  directionEvaluation?: string;
  newsAnalysisMarkdown?: string;
  multiplierRating?: string;
  entry?: number | string;
  stopLoss?: number | string;
  takeProfit1?: number | string;
  takeProfit2?: number | string;
  riskReward?: string;
  confidence?: number;
  invalidationLevel?: string;
  recommendedLeverage?: string;
  recommendedMargin?: string;
  positionNotional?: number;
  liquidationDistancePercent?: number;
  maxDollarLoss?: number;
  timingScore?: number;
  timingQualityScore?: number;
  setupScore?: number;
  summaryMarkdown: string;
  checklistPoints?: Array<{
    num: number;
    title: string;
    content: string;
  }>;
  source?: 'gemini' | 'algorithmic_fallback';
  error?: string;
}

export interface AppPriceAlert {
  id: string;
  symbol: string;
  contract?: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW';
  targetPrice: number;
  initialPrice: number;
  note?: string;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
  triggeredPrice?: number;
  isActive: boolean;
  soundEnabled?: boolean;
}

export interface AlertToastItem {
  id: string;
  alertId: string;
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW';
  targetPrice: number;
  currentPrice: number;
  timestamp: number;
  message: string;
  note?: string;
}

export interface LiveFearAndGreedData {
  value: number; // 0 to 100
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  classificationMy: string;
  previousClose: number;
  previousWeek: number;
  previousMonth: number;
  yearlyHigh?: {
    score: number;
    classification: string;
    date?: string;
  };
  yearlyLow?: {
    score: number;
    classification: string;
    date?: string;
  };
  timestamp: number;
  timeUntilUpdate?: number;
  historical7Days: Array<{
    value: number;
    classification: string;
    date: string;
  }>;
  source: string;
}

export interface LiveBreakingNewsItem {
  id: string;
  title: string;
  titleMy: string;
  summary: string;
  summaryMy: string;
  link: string;
  source: string;
  pubDate: string;
  timestamp: number;
  timeAgo: string;
  mmtTime: string;
  usTime: string;
  category: 'macro' | 'catalysts' | 'liquidations' | 'etf' | 'forex-macro' | 'regulations' | 'institutional';
  impact: 'BULLISH' | 'BEARISH' | 'HIGH_VOLATILITY';
  affectedCoins: string[];
}

export interface CmcCoinItem {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  category: 'All' | 'Layer 1' | 'Layer 2' | 'DeFi' | 'Meme' | 'AI & Big Data' | 'Solana Ecosystem' | 'Gaming' | 'RWA';
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24hUsd: number;
  volume24hQuantity: number;
  circulatingSupply: number;
  maxSupply: number | null;
  supplySymbol: string;
  sparkline7d: number[];
  color?: string;
  badge?: string;
}

export interface CmcGlobalMetrics {
  totalCryptos: number;
  totalExchanges: number;
  totalMarketCapUsd: number;
  marketCapChange24h: number;
  volume24hUsd: number;
  volumeChange24h: number;
  btcDominance: number;
  ethDominance: number;
  gasEthGwei: number;
  fearAndGreedScore: number;
  fearAndGreedClassification: string;
}

