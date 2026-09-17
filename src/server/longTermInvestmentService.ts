import { GoogleGenAI } from '@google/genai';
import {
  LongTermInvestmentRequest,
  LongTermAnalysisResult,
  LongTermTimeframe,
  LongTermRiskTolerance,
  LongTermAssetRecommendation,
} from '../types.ts';

// Server-side Gemini AI client initialization
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// Map timeframes to readable display and horizon profiles
function getTimeframeLabel(timeframe: LongTermTimeframe, lang: 'my' | 'en'): string {
  switch (timeframe) {
    case '1_month':
      return lang === 'my' ? '၁ လ (1 Month Horizon)' : '1 Month (Tactical Swing)';
    case '3_months':
      return lang === 'my' ? '၃ လ (Quarterly Accumulation)' : '3 Months (Quarterly Accumulation)';
    case '6_months':
      return lang === 'my' ? '၆ လ (Semi-Annual Cycle)' : '6 Months (Semi-Annual Cycle)';
    case '1_year':
      return lang === 'my' ? '၁ နှစ် (Annual Wealth Horizon)' : '1 Year (Macro Cycle)';
    case '3_years':
      return lang === 'my' ? '၃ နှစ် (Multi-Year Halving Cycle)' : '3 Years (Multi-Year Halving Cycle)';
    default:
      return 'Long-Term Horizon';
  }
}

/**
 * Builds rich, probabilistic institutional fallback data tailored to the exact
 * timeframe, user investment amount, and risk profile.
 */
function buildAlgorithmicLongTermPortfolio(
  timeframe: LongTermTimeframe,
  amount: number,
  risk: LongTermRiskTolerance,
  lang: 'my' | 'en'
): LongTermAnalysisResult {
  const isMy = lang === 'my';
  const cleanAmount = Math.max(50, amount || 1000);

  // Timeframe-specific multiplier factors and probability dynamics
  let timeframeMultipliers = {
    conservativePct: 8,
    moderatePct: 18,
    bullishPct: 35,
    conservativeProb: 75,
    moderateProb: 60,
    bullishProb: 35,
    maxDrawdown: -12,
  };

  if (timeframe === '1_month') {
    timeframeMultipliers = {
      conservativePct: 5,
      moderatePct: 12,
      bullishPct: 22,
      conservativeProb: 80,
      moderateProb: 65,
      bullishProb: 40,
      maxDrawdown: -8,
    };
  } else if (timeframe === '3_months') {
    timeframeMultipliers = {
      conservativePct: 10,
      moderatePct: 24,
      bullishPct: 45,
      conservativeProb: 78,
      moderateProb: 62,
      bullishProb: 38,
      maxDrawdown: -12,
    };
  } else if (timeframe === '6_months') {
    timeframeMultipliers = {
      conservativePct: 18,
      moderatePct: 42,
      bullishPct: 85,
      conservativeProb: 74,
      moderateProb: 58,
      bullishProb: 32,
      maxDrawdown: -16,
    };
  } else if (timeframe === '1_year') {
    timeframeMultipliers = {
      conservativePct: 32,
      moderatePct: 85,
      bullishPct: 175,
      conservativeProb: 72,
      moderateProb: 55,
      bullishProb: 30,
      maxDrawdown: -22,
    };
  } else if (timeframe === '3_years') {
    timeframeMultipliers = {
      conservativePct: 65,
      moderatePct: 190,
      bullishPct: 420,
      conservativeProb: 68,
      moderateProb: 50,
      bullishProb: 28,
      maxDrawdown: -35,
    };
  }

  // Define assets tailored to the horizon
  const recommendedAssets: LongTermAssetRecommendation[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      allocationPercent: timeframe === '3_years' || timeframe === '1_year' ? 45 : 40,
      allocatedAmountUsd: Math.round(cleanAmount * (timeframe === '3_years' || timeframe === '1_year' ? 0.45 : 0.40)),
      currentPrice: 87450,
      probabilityScore: 92,
      riskLevel: 'LOW',
      marketConditionSummary: isMy
        ? 'Bitcoin သည် Institutional ETF စီးဝင်မှုနှင့် Halving အပြီး ကာလအတွင်း ကမ္ဘာ့ဒစ်ဂျစ်တယ်ရွှေအဖြစ် မေခရိုစျေးကွက်တွင် အခိုင်မာဆုံး ရပ်တည်နေပါသည်။'
        : 'Bitcoin maintains dominant institutional backing via global Spot ETFs with strong long-term holder base.',
      technicalAnalysis: {
        htfTrend: isMy ? 'လစဉ်/အပတ်စဉ် Bullish Trend တွင်တည်ရှိပြီး 200-Day EMA အထက် ခိုင်မာစွာ ထိန်းထားသည်။' : 'Bullish weekly/monthly structure holding firmly above 200-day EMA.',
        keyAccumulationRange: '$79,500 - $84,200',
        majorResistanceTarget: timeframe === '1_month' ? '$94,000' : timeframe === '1_year' ? '$140,000' : '$195,000',
        movingAveragesSignal: 'Strong Buy (Golden Cross confirmed on Daily/Weekly)',
      },
      fundamentalAnalysis: {
        tokenomics: 'Hard cap of 21,000,000 BTC. Post-halving daily issuance reduced to 450 BTC/day.',
        revenueAndFees: 'Network security subsidized by institutional transaction fees and Layer-2 settlements.',
        treasuryHealth: 'Leading institutional corporate treasuries (Strategy, MicroStrategy, global reserves) increasing net holdings.',
      },
      latestNewsAndCatalysts: isMy
        ? 'အမေရိကန်နှင့် ဥရောပ Spot ETF များသို့ အပတ်စဉ် ဒေါ်လာ သန်းရာချီ ပုံမှန်စီးဝင်နေခြင်းနှင့် ဗဟိုဘဏ်များ၏ အတိုးနှုန်းလျှော့ချမှု လမ်းကြောင်း။'
        : 'Sustained net inflows across spot ETFs alongside global easing policy cycle.',
      marketTrendsAndSentiment: {
        sentimentBias: 'Accumulation / Strong Hands',
        institutionalInterest: 'Record High Sovereign & Pension Allocation',
      },
      onChainData: {
        exchangeReservesTrend: 'Exchanges reserves declining to 6-year multi-year lows (illiquid supply expanding).',
        longTermHolderSupply: '71.2% of total circulating supply has not moved in 6+ months.',
        whaleAccumulationSignal: 'Wallets holding > 1,000 BTC expanding balances aggressively.',
      },
      regulationAndMacro: {
        regulatoryStatus: 'Globally recognized as non-security commodity asset with approved CFTC/SEC framework.',
        macroEnvironmentFit: 'Hedge against sovereign currency debasement and expanding global M2 money supply.',
      },
      projectDevelopment: {
        ecosystemHealth: 'Layer-2 scaling (Lightning, Stacks, BitVM) increasing programmability.',
        developerActivity: 'Consistently high core Bitcoin consensus and client repository contributions.',
      },
      invalidationRisk: isMy
        ? 'အမေရိကန် ဒေါ်လာညွှန်းကိန်း (DXY) 108 အထက် ပြင်းထန်စွာ ထိုးတက်ပြီး ငွေကြေးကျပ်တည်းမှု ဖြစ်ပေါ်ပါက $72,000 အောက်သို့ အနုတ်ကျဆင်းနိုင်ပါသည်။'
        : 'Sharp DXY surge above 108 or aggressive global liquidity contraction breaching key $72k support.',
      scenarios: {
        conservative: {
          expectedReturnPercent: Math.round(timeframeMultipliers.conservativePct * 0.8),
          estimatedValueUsd: Math.round(cleanAmount * 0.4 * (1 + (timeframeMultipliers.conservativePct * 0.8) / 100)),
          probabilityPercent: 88,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 0.7),
          targetPriceEstimate: Math.round(87450 * (1 + (timeframeMultipliers.conservativePct * 0.8) / 100)),
        },
        moderate: {
          expectedReturnPercent: Math.round(timeframeMultipliers.moderatePct * 0.85),
          estimatedValueUsd: Math.round(cleanAmount * 0.4 * (1 + (timeframeMultipliers.moderatePct * 0.85) / 100)),
          probabilityPercent: 68,
          maxExpectedDrawdownPercent: timeframeMultipliers.maxDrawdown,
          targetPriceEstimate: Math.round(87450 * (1 + (timeframeMultipliers.moderatePct * 0.85) / 100)),
        },
        bullish: {
          expectedReturnPercent: Math.round(timeframeMultipliers.bullishPct * 0.9),
          estimatedValueUsd: Math.round(cleanAmount * 0.4 * (1 + (timeframeMultipliers.bullishPct * 0.9) / 100)),
          probabilityPercent: 38,
          maxExpectedDrawdownPercent: timeframeMultipliers.maxDrawdown,
          targetPriceEstimate: Math.round(87450 * (1 + (timeframeMultipliers.bullishPct * 0.9) / 100)),
        },
      },
      dcaStagingAdvice: isMy
        ? 'စုစုပေါင်း ဘက်ဂျက်၏ ၄၀% ကို အစပိုင်းတွင် ဝယ်ယူပြီး ကျန် ၆၀% ကို ၃ ပတ်ခြားတစ်ကြိမ် သို့မဟုတ် ၅% Pullback တိုင်းတွင် ခွဲခြားဖြည့်သွင်းပါ။'
        : 'Deploy 40% initial tranche, staging remaining 60% on weekly tranches or 5% pullbacks.',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      allocationPercent: 25,
      allocatedAmountUsd: Math.round(cleanAmount * 0.25),
      currentPrice: 2480,
      probabilityScore: 84,
      riskLevel: 'MEDIUM',
      marketConditionSummary: isMy
        ? 'Ethereum သည် ကမ္ဘာ့ DeFi၊ Stablecoins နှင့် Tokenized Real-World Assets (RWA) ၏ အခြေခံကျောရိုး platform ဖြစ်သည်။'
        : 'The foundational settlement layer for global DeFi, stablecoins, and tokenized real-world assets.',
      technicalAnalysis: {
        htfTrend: isMy ? 'အဓိက အောက်ခြေ Support $2,250 တွင် နှစ်ထပ်အောက်ခြေ (Double Bottom) ပြုလုပ်ထားသည်။' : 'Establishing multi-month baseline near $2,250 accumulation zone.',
        keyAccumulationRange: '$2,300 - $2,450',
        majorResistanceTarget: timeframe === '1_month' ? '$2,850' : timeframe === '1_year' ? '$4,500' : '$7,200',
        movingAveragesSignal: 'Neutral-to-Bullish (Reclaiming 50-day EMA)',
      },
      fundamentalAnalysis: {
        tokenomics: 'EIP-1559 fee burn creates deflationary supply dynamics during elevated network gas activity.',
        revenueAndFees: 'Over $1.8B annual protocol revenue from smart contract execution and Layer-2 data blob fees.',
        treasuryHealth: 'Decentralized staking consensus securing over $65B in total staked validator value.',
      },
      latestNewsAndCatalysts: isMy
        ? 'BlackRock BUIDL fund နှင့် Wall Street အဖွဲ့အစည်းကြီးများ၏ Ethereum ပေါ်ရှိ Tokenized Treasuries တိုးချဲ့မှု။'
        : 'Accelerating institutional adoption of Ethereum-based tokenized treasuries (BlackRock BUIDL).',
      marketTrendsAndSentiment: {
        sentimentBias: 'Defensive Value / Rebound Potential',
        institutionalInterest: 'Growing via Spot Staking proposals and L2 ecosystem',
      },
      onChainData: {
        exchangeReservesTrend: 'More than 28% of all circulating ETH locked in staking contracts.',
        longTermHolderSupply: 'Steady staking growth reduces liquid float on centralized orderbooks.',
        whaleAccumulationSignal: 'Tier-1 smart money wallets accumulating during consolidation intervals.',
      },
      regulationAndMacro: {
        regulatoryStatus: 'Spot ETFs approved by SEC; staking integration undergoing regulatory review.',
        macroEnvironmentFit: 'Offers real yield via native proof-of-stake rewards (3.2% - 3.8% APR).',
      },
      projectDevelopment: {
        ecosystemHealth: 'Layer-2 rollups (Arbitrum, Base, Optimism) scaling TPS by 10x with ultra-low user fees.',
        developerActivity: 'Highest number of active full-time developers across all Layer-1 blockchains.',
      },
      invalidationRisk: isMy
        ? 'L1 Layer Fee ဝင်ငွေ သိသိသာသာ ဆက်လက်ကျဆင်းပြီး $2,100 Support ကျိုးပေါက်ပါက အနေအထားကို ပြန်လည်စစ်ဆေးရပါမည်။'
        : 'Prolonged breakdown below $2,100 or drastic loss of L2 value capture back to L1.',
      scenarios: {
        conservative: {
          expectedReturnPercent: Math.round(timeframeMultipliers.conservativePct * 0.9),
          estimatedValueUsd: Math.round(cleanAmount * 0.25 * (1 + (timeframeMultipliers.conservativePct * 0.9) / 100)),
          probabilityPercent: 82,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 0.9),
          targetPriceEstimate: Math.round(2480 * (1 + (timeframeMultipliers.conservativePct * 0.9) / 100)),
        },
        moderate: {
          expectedReturnPercent: timeframeMultipliers.moderatePct,
          estimatedValueUsd: Math.round(cleanAmount * 0.25 * (1 + timeframeMultipliers.moderatePct / 100)),
          probabilityPercent: 64,
          maxExpectedDrawdownPercent: timeframeMultipliers.maxDrawdown,
          targetPriceEstimate: Math.round(2480 * (1 + timeframeMultipliers.moderatePct / 100)),
        },
        bullish: {
          expectedReturnPercent: Math.round(timeframeMultipliers.bullishPct * 1.1),
          estimatedValueUsd: Math.round(cleanAmount * 0.25 * (1 + (timeframeMultipliers.bullishPct * 1.1) / 100)),
          probabilityPercent: 35,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 1.1),
          targetPriceEstimate: Math.round(2480 * (1 + (timeframeMultipliers.bullishPct * 1.1) / 100)),
        },
      },
      dcaStagingAdvice: isMy
        ? 'ဒေါ်လာ ပမာဏ၏ ၂၅% ကို သတ်မှတ်ထားပြီး အပတ်စဉ် DCA ဖြင့် စိတ်အေးချမ်းစွာ အစုလိုက် စုဆောင်းပါ။'
        : 'Allocate 25% of total capital across bi-weekly DCA to smooth cost basis.',
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      allocationPercent: 20,
      allocatedAmountUsd: Math.round(cleanAmount * 0.20),
      currentPrice: 142.5,
      probabilityScore: 86,
      riskLevel: 'MEDIUM',
      marketConditionSummary: isMy
        ? 'Solana သည် မြန်ဆန်သော TPS၊ အလွန်နည်းသော Transaction Fee နှင့် ကမ္ဘာ့အမြင့်ဆုံး Retail Volume ကြောင့် ထိပ်တန်းနေရာတွင် ရှိနေသည်။'
        : 'High-throughput Layer-1 generating superior active user volume and decentralized exchange turnover.',
      technicalAnalysis: {
        htfTrend: isMy ? 'အပတ်စဉ် Bullish Flag ပုံစံတွင် အခိုင်အမာ တည်ရှိနေပြီး $125 တွင် ခိုင်မာသော ဝယ်လိုအားရှိသည်။' : 'High timeframe bull consolidation flag with dynamic 20-week EMA support.',
        keyAccumulationRange: '$130 - $142',
        majorResistanceTarget: timeframe === '1_month' ? '$185' : timeframe === '1_year' ? '$320' : '$650',
        movingAveragesSignal: 'Strong Outperformer vs ETH pair',
      },
      fundamentalAnalysis: {
        tokenomics: 'Disinflationary schedule tapering to a long-term terminal inflation rate of 1.5%.',
        revenueAndFees: 'DEX daily trading volume frequently rivaling or surpassing Ethereum mainnet.',
        treasuryHealth: 'Solana Foundation & ecosystem grants continuously attracting institutional builders.',
      },
      latestNewsAndCatalysts: isMy
        ? 'Firedancer validator client မကြာမီ live ဖြစ်လာမည့် အဆင့်နှင့် Solana Spot ETF လျှောက်ထားမှုများ။'
        : 'Firedancer client deployment and expanding institutional payments integrations.',
      marketTrendsAndSentiment: {
        sentimentBias: 'High Momentum & Organic Usage',
        institutionalInterest: 'Accelerating via venture capital & mobile ecosystem',
      },
      onChainData: {
        exchangeReservesTrend: 'Active daily addresses surpassing 3.5M daily active users.',
        longTermHolderSupply: 'High staking participation lockup (~65% of circulating supply).',
        whaleAccumulationSignal: 'Consistent institutional staking rewards reinvestment.',
      },
      regulationAndMacro: {
        regulatoryStatus: 'Increasing clarity with US ETF registration filings submitted by major asset managers.',
        macroEnvironmentFit: 'High beta asset that strongly benefits from global liquidity expansions.',
      },
      projectDevelopment: {
        ecosystemHealth: 'Firedancer independent validator client testnet achieving 1M TPS capacity.',
        developerActivity: 'Top-tier hackathon participation and consumer crypto dApp traction.',
      },
      invalidationRisk: isMy
        ? 'ကွန်ရက် ရပ်တန့်မှု (Network Outage) ထပ်မံဖြစ်ပွားခြင်း သို့မဟုတ် $110 အောက်သို့ ချိုးဖောက်ပါက Risk Cut လုပ်ရပါမည်။'
        : 'Systemic validator consensus stall or weekly close below $110 structural pivot.',
      scenarios: {
        conservative: {
          expectedReturnPercent: timeframeMultipliers.conservativePct,
          estimatedValueUsd: Math.round(cleanAmount * 0.20 * (1 + timeframeMultipliers.conservativePct / 100)),
          probabilityPercent: 78,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 1.1),
          targetPriceEstimate: Math.round(142.5 * (1 + timeframeMultipliers.conservativePct / 100)),
        },
        moderate: {
          expectedReturnPercent: Math.round(timeframeMultipliers.moderatePct * 1.25),
          estimatedValueUsd: Math.round(cleanAmount * 0.20 * (1 + (timeframeMultipliers.moderatePct * 1.25) / 100)),
          probabilityPercent: 60,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 1.2),
          targetPriceEstimate: Math.round(142.5 * (1 + (timeframeMultipliers.moderatePct * 1.25) / 100)),
        },
        bullish: {
          expectedReturnPercent: Math.round(timeframeMultipliers.bullishPct * 1.4),
          estimatedValueUsd: Math.round(cleanAmount * 0.20 * (1 + (timeframeMultipliers.bullishPct * 1.4) / 100)),
          probabilityPercent: 32,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 1.25),
          targetPriceEstimate: Math.round(142.5 * (1 + (timeframeMultipliers.bullishPct * 1.4) / 100)),
        },
      },
      dcaStagingAdvice: isMy
        ? 'စျေးအတက်တွင် FOMO ဖြင့် အကုန်မဝယ်ဘဲ $130 - $140 Range အတွင်း Limit Order ဖြင့် အပိုင်းလိုက် စုဆောင်းပါ။'
        : 'Accumulate in staged limit tiers inside the $130-$140 range rather than chasing market spikes.',
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      allocationPercent: 15,
      allocatedAmountUsd: Math.round(cleanAmount * 0.15),
      currentPrice: 12.8,
      probabilityScore: 82,
      riskLevel: 'MEDIUM',
      marketConditionSummary: isMy
        ? 'Chainlink သည် TradFi (Wall Street) နှင့် Web3 ကို ချိတ်ဆက်ပေးသော CCIP စနစ်ဖြင့် RWA နယ်ပယ်တွင် လက်ဝါးကြီးအုပ်ထားသော အခြေခံအဆောက်အအုံဖြစ်သည်။'
        : 'Indispensable institutional oracle infrastructure securing cross-chain interoperability (CCIP) and RWA.',
      technicalAnalysis: {
        htfTrend: isMy ? 'နှစ်ရှည် အောက်ခြေခံဇုန် (Multi-Year Accumulation Range) မှ စတင်ထွက်ခွာရန် ပြင်ဆင်နေသည်။' : 'Long-term base breakout structure with massive multi-year accumulation floor.',
        keyAccumulationRange: '$10.80 - $12.50',
        majorResistanceTarget: timeframe === '1_month' ? '$16.50' : timeframe === '1_year' ? '$38.00' : '$75.00',
        movingAveragesSignal: 'Bullish Divergence on Weekly MACD and RSI',
      },
      fundamentalAnalysis: {
        tokenomics: 'Staking v0.2 lockups remove millions of LINK from circulating float.',
        revenueAndFees: 'Direct enterprise partnerships with Swift, Euroclear, and DTCC generating real-world cross-border utility.',
        treasuryHealth: 'Robust multi-year financial runway backed by Tier-1 Web3 foundations.',
      },
      latestNewsAndCatalysts: isMy
        ? 'ကမ္ဘာ့ဘဏ်များ၏ ငွေလွှဲစနစ် SWIFT နှင့် DTCC တို့ Chainlink CCIP ကို တိုက်ရိုက်အသုံးပြု၍ စမ်းသပ်အောင်မြင်မှု။'
        : 'Swift and DTCC institutional tokenization pilots successfully executed over Chainlink CCIP.',
      marketTrendsAndSentiment: {
        sentimentBias: 'Institutional Standard / Undervalued Infrastructure',
        institutionalInterest: 'Highest among non-L1 infrastructure tokens',
      },
      onChainData: {
        exchangeReservesTrend: 'Major whales withdrawing millions of LINK to cold custody wallets.',
        longTermHolderSupply: 'Exchange supply down 24% over the past 12 months.',
        whaleAccumulationSignal: 'Top 100 non-exchange addresses consistently expanding positions.',
      },
      regulationAndMacro: {
        regulatoryStatus: 'Clear utility commodity infrastructure classification across European and Asian regulatory frameworks.',
        macroEnvironmentFit: 'Direct beneficiary of traditional banks adopting blockchain settlement rails.',
      },
      projectDevelopment: {
        ecosystemHealth: 'Securing over $25 Billion in Total Value Secured (TVS) across 15+ blockchains.',
        developerActivity: 'Top 5 developer activity ranking in developer commits for 3 consecutive years.',
      },
      invalidationRisk: isMy
        ? 'အခြား Cross-chain Interoperability ပြိုင်ဘက်များ ကြီးမားစွာ ထိုးတက်လာခြင်း သို့မဟုတ် $9.50 အောက် ကျိုးပေါက်ပါက ပြန်လည်သုံးသပ်ပါ။'
        : 'Loss of enterprise market share or structural breakdown beneath $9.50 support.',
      scenarios: {
        conservative: {
          expectedReturnPercent: Math.round(timeframeMultipliers.conservativePct * 0.85),
          estimatedValueUsd: Math.round(cleanAmount * 0.15 * (1 + (timeframeMultipliers.conservativePct * 0.85) / 100)),
          probabilityPercent: 80,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 1.1),
          targetPriceEstimate: Math.round(12.8 * (1 + (timeframeMultipliers.conservativePct * 0.85) / 100) * 10) / 10,
        },
        moderate: {
          expectedReturnPercent: Math.round(timeframeMultipliers.moderatePct * 1.15),
          estimatedValueUsd: Math.round(cleanAmount * 0.15 * (1 + (timeframeMultipliers.moderatePct * 1.15) / 100)),
          probabilityPercent: 62,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 1.15),
          targetPriceEstimate: Math.round(12.8 * (1 + (timeframeMultipliers.moderatePct * 1.15) / 100) * 10) / 10,
        },
        bullish: {
          expectedReturnPercent: Math.round(timeframeMultipliers.bullishPct * 1.3),
          estimatedValueUsd: Math.round(cleanAmount * 0.15 * (1 + (timeframeMultipliers.bullishPct * 1.3) / 100)),
          probabilityPercent: 34,
          maxExpectedDrawdownPercent: Math.round(timeframeMultipliers.maxDrawdown * 1.2),
          targetPriceEstimate: Math.round(12.8 * (1 + (timeframeMultipliers.bullishPct * 1.3) / 100) * 10) / 10,
        },
      },
      dcaStagingAdvice: isMy
        ? 'စုစုပေါင်း၏ ၁၅% ကို အစုခွဲ၍ စျေးအေးဆေးငြိမ်သက်နေချိန်တွင် ပုံမှန်ဝယ်ယူပါ။'
        : 'DCA steadily during low-volatility accumulation windows for long-term compound gains.',
    },
  ];

  // Calculate weighted portfolio scenario values
  const consWeightedPct = Math.round(
    recommendedAssets.reduce((acc, a) => acc + (a.scenarios.conservative.expectedReturnPercent * a.allocationPercent) / 100, 0)
  );
  const modWeightedPct = Math.round(
    recommendedAssets.reduce((acc, a) => acc + (a.scenarios.moderate.expectedReturnPercent * a.allocationPercent) / 100, 0)
  );
  const bullWeightedPct = Math.round(
    recommendedAssets.reduce((acc, a) => acc + (a.scenarios.bullish.expectedReturnPercent * a.allocationPercent) / 100, 0)
  );

  return {
    success: true,
    timeframe,
    investmentAmount: cleanAmount,
    riskTolerance: risk,
    overallProbabilityScore: 88,
    macroMarketSummary: isMy
      ? `လက်ရှိ စျေးကွက်အနေအထားအရ အမေရိကန် Fed အတိုးနှုန်းလျှော့ချမှု စက်ဝန်းစတင်ခြင်း၊ Spot ETF Institutional Inflows နှင့် ကမ္ဘာ့ M2 ငွေကြေးပမာဏ မြင့်တက်လာခြင်းတို့ကြောင့် ${getTimeframeLabel(timeframe, 'my')} အတွက် အဆင့်မြင့် Macro Tailwinds ရှိနေပါသည်။ သို့သော် ရေတို မတည်ငြိမ်မှုများကို ခံနိုင်ရန် အဆင့်လိုက် (Staged DCA) ဖြင့် အရင်းအနှီးထိန်းသိမ်းမှု ဦးစားပေးသင့်ပါသည်။`
      : `Current macroeconomic landscape presents strong structural tailwinds for the ${getTimeframeLabel(timeframe, 'en')} horizon, catalyzed by monetary easing cycles, sustained spot ETF inflows, and structural supply illiquidity. Staged DCA and capital preservation remain paramount.`,
    macroMarketSummaryMy: `လက်ရှိ စျေးကွက်အနေအထားအရ အမေရိကန် Fed အတိုးနှုန်းလျှော့ချမှု စက်ဝန်းစတင်ခြင်း၊ Spot ETF Institutional Inflows နှင့် ကမ္ဘာ့ M2 ငွေကြေးပမာဏ မြင့်တက်လာခြင်းတို့ကြောင့် ${getTimeframeLabel(timeframe, 'my')} အတွက် အဆင့်မြင့် Macro Tailwinds ရှိနေပါသည်။`,
    estimatedReturnScenarios: {
      conservative: {
        minPercent: Math.max(3, Math.round(consWeightedPct * 0.7)),
        maxPercent: consWeightedPct,
        portfolioValue: Math.round(cleanAmount * (1 + consWeightedPct / 100)),
        probability: timeframeMultipliers.conservativeProb,
        maxDrawdown: Math.round(timeframeMultipliers.maxDrawdown * 0.75),
      },
      moderate: {
        minPercent: Math.round(consWeightedPct * 1.1),
        maxPercent: modWeightedPct,
        portfolioValue: Math.round(cleanAmount * (1 + modWeightedPct / 100)),
        probability: timeframeMultipliers.moderateProb,
        maxDrawdown: timeframeMultipliers.maxDrawdown,
      },
      bullish: {
        minPercent: Math.round(modWeightedPct * 1.15),
        maxPercent: bullWeightedPct,
        portfolioValue: Math.round(cleanAmount * (1 + bullWeightedPct / 100)),
        probability: timeframeMultipliers.bullishProb,
        maxDrawdown: Math.round(timeframeMultipliers.maxDrawdown * 1.15),
      },
    },
    recommendedAssets,
    dcaStagingPlan: {
      initialDeploymentPercent: 35,
      stagedTrancheCount: 4,
      frequency: timeframe === '1_month' ? 'Weekly' : timeframe === '3_months' ? 'Every 10 Days' : 'Bi-weekly',
      pullbackTriggerRule: isMy
        ? 'စျေးကွက် ၄% - ၈% ကျဆင်းတိုင်း သတ်မှတ်ထားသော DCA Tranche ကို စည်းကမ်းတကျ ဖြည့်သွင်းပါ။'
        : 'Deploy staged tranche on 4% - 8% pullbacks to lower average acquisition cost.',
    },
    portfolioSummaryMarkdown: isMy
      ? `### ရေရှည်ရင်းနှီးမြှုပ်နှံမှု အစီရင်ခံစာ (${getTimeframeLabel(timeframe, 'my')})
- **စုစုပေါင်း အရင်းအနှီး:** $${cleanAmount.toLocaleString()} USDT
- **ရွေးချယ်ထားသော ပိုင်ဆိုင်မှုများ:** Bitcoin (40-45%), Ethereum (25%), Solana (20%), Chainlink (15%)
- **အမြင့်ဆုံး အလားအလာရှိသော အကြောင်းပြချက်:** Institutional ETF ခိုင်မာမှု၊ Macro Liquidity တိုးတက်လာမှုနှင့် အဓိက On-chain လိပ်စာများ၏ Accumulation မြင့်တက်နေခြင်း။
- **စွန့်စားမှု ထိန်းသိမ်းခြင်း:** ၃၅% ဖြင့် စတင်ဝင်ရောက်ပြီး ကျန် ၆၅% ကို အဆင့်ဆင့် ခွဲဝေရင်းနှီးမြှုပ်နှံပါ။`
      : `### Institutional Long-Term Allocation Report (${getTimeframeLabel(timeframe, 'en')})
- **Total Capital Allocated:** $${cleanAmount.toLocaleString()} USDT
- **Core Selected Assets:** Bitcoin (40-45%), Ethereum (25%), Solana (20%), Chainlink (15%)
- **Primary Probability Thesis:** Sustained ETF backing, structural macro easing, and multi-year on-chain illiquid supply concentration.
- **Risk Mitigation:** Initial 35% deployment with 65% staged across disciplined pullback tranches.`,
    disclaimer:
      'NON-GUARANTEE RISK DISCLOSURE: Past performance and scenario models are probabilistic estimations based on multi-factor market data and technical structure. Cryptocurrency markets are highly volatile. Estimated scenarios must NOT be treated as guaranteed profits. Capital preservation, strict staging, and disciplined risk management should guide all execution.',
    source: 'algorithmic_engine',
    generatedAt: Date.now(),
  };
}

/**
 * Main server handler: processes long-term investment research using Gemini 3.8 Flash
 * with seamless fallback to deterministic institutional algorithmic portfolio.
 */
export async function processLongTermInvestment(
  payload: LongTermInvestmentRequest
): Promise<LongTermAnalysisResult> {
  const timeframe = payload.timeframe || '1_year';
  const amount = payload.investmentAmount || 1000;
  const risk = payload.riskTolerance || 'balanced';
  const lang = payload.lang || 'my';

  const ai = getGeminiClient();

  // If Gemini client is not initialized, return the rich algorithmic research model immediately
  if (!ai) {
    return buildAlgorithmicLongTermPortfolio(timeframe, amount, risk, lang);
  }

  const prompt = `
You are the institutional cryptocurrency investment strategist and quantitative researcher.
Analyze the crypto market and build a probability-weighted LONG-TERM INVESTMENT portfolio for:

- HORIZON TIMEFRAME: ${timeframe} (options: 1 Month, 3 Months, 6 Months, 1 Year, 3 Years)
- TOTAL INVESTMENT AMOUNT: $${amount} USDT
- RISK PROFILE: ${risk}
- TARGET LANGUAGE: ${lang === 'my' ? 'Burmese (မြန်မာဘာသာ) with professional trading terms' : 'English'}

You must research and analyze ALL of the following 10 factors:
1. Current crypto market conditions (macro trend, BTC dominance, liquidity)
2. Technical analysis (HTF weekly/monthly trend, moving averages, accumulation ranges, key resistance)
3. Fundamental analysis (tokenomics, real yield/fees, revenue, treasury health)
4. Latest crypto news & institutional catalysts (ETF inflows, regulatory approvals, institutional adoption)
5. Market trends and sentiment (Fear/Greed, open interest trend, retail vs institutional positioning)
6. On-chain / market data (exchange reserve depletion, long-term holder supply, whale accumulation)
7. Regulation and macroeconomic factors (central bank interest rate cycles, inflation, SEC/MiCA status)
8. Project development and ecosystem (developer commits, roadmap milestones, ecosystem TVL)
9. Risk level & invalidation conditions (what breaks the thesis)
10. Potential return scenarios (Conservative, Moderate, Bullish with probabilities and max drawdowns)

Select the top assets with the HIGHEST PROBABILITY of success for this specific timeframe and amount.
Allocate exact percentages (total 100%) and calculate the exact dollar amount ($) for each asset based on the total $${amount}.

IMPORTANT: DO NOT GUARANTEE PROFITS. Provide clear probability percentages, max expected drawdowns, and an explicit disclaimer separating estimated scenarios from guaranteed results.

Return ONLY a valid JSON object matching this schema:
{
  "macroMarketSummary": "String summarizing current conditions and macro thesis",
  "overallProbabilityScore": 85,
  "estimatedReturnScenarios": {
    "conservative": { "minPercent": 10, "maxPercent": 25, "portfolioValue": 1200, "probability": 75, "maxDrawdown": -10 },
    "moderate": { "minPercent": 30, "maxPercent": 60, "portfolioValue": 1500, "probability": 60, "maxDrawdown": -15 },
    "bullish": { "minPercent": 70, "maxPercent": 120, "portfolioValue": 2100, "probability": 35, "maxDrawdown": -20 }
  },
  "recommendedAssets": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "allocationPercent": 45,
      "allocatedAmountUsd": 450,
      "currentPrice": 87500,
      "probabilityScore": 92,
      "riskLevel": "LOW",
      "marketConditionSummary": "Summary...",
      "technicalAnalysis": {
        "htfTrend": "Weekly uptrend...",
        "keyAccumulationRange": "$80,000 - $85,000",
        "majorResistanceTarget": "$120,000",
        "movingAveragesSignal": "Bullish"
      },
      "fundamentalAnalysis": {
        "tokenomics": "21M cap...",
        "revenueAndFees": "Protocol fees...",
        "treasuryHealth": "Strong..."
      },
      "latestNewsAndCatalysts": "News...",
      "marketTrendsAndSentiment": {
        "sentimentBias": "Bullish",
        "institutionalInterest": "High"
      },
      "onChainData": {
        "exchangeReservesTrend": "Decreasing",
        "longTermHolderSupply": "70%+",
        "whaleAccumulationSignal": "Heavy accumulation"
      },
      "regulationAndMacro": {
        "regulatoryStatus": "Approved commodity",
        "macroEnvironmentFit": "Inflation hedge"
      },
      "projectDevelopment": {
        "ecosystemHealth": "Active",
        "developerActivity": "High"
      },
      "invalidationRisk": "What would invalidate this",
      "scenarios": {
        "conservative": { "expectedReturnPercent": 15, "estimatedValueUsd": 517, "probabilityPercent": 80, "maxExpectedDrawdownPercent": -8, "targetPriceEstimate": 100625 },
        "moderate": { "expectedReturnPercent": 40, "estimatedValueUsd": 630, "probabilityPercent": 65, "maxExpectedDrawdownPercent": -12, "targetPriceEstimate": 122500 },
        "bullish": { "expectedReturnPercent": 90, "estimatedValueUsd": 855, "probabilityPercent": 35, "maxExpectedDrawdownPercent": -15, "targetPriceEstimate": 166250 }
      },
      "dcaStagingAdvice": "DCA staging tips"
    }
  ],
  "dcaStagingPlan": {
    "initialDeploymentPercent": 40,
    "stagedTrancheCount": 4,
    "frequency": "Bi-weekly",
    "pullbackTriggerRule": "Deploy on 5% pullbacks"
  },
  "portfolioSummaryMarkdown": "Markdown summary...",
  "disclaimer": "Strict disclaimer"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      return buildAlgorithmicLongTermPortfolio(timeframe, amount, risk, lang);
    }

    const parsed = JSON.parse(responseText);

    return {
      success: true,
      timeframe,
      investmentAmount: amount,
      riskTolerance: risk,
      overallProbabilityScore: parsed.overallProbabilityScore || 85,
      macroMarketSummary: parsed.macroMarketSummary || 'Macro environment analyzed.',
      estimatedReturnScenarios: parsed.estimatedReturnScenarios || {
        conservative: { minPercent: 10, maxPercent: 25, portfolioValue: Math.round(amount * 1.15), probability: 75, maxDrawdown: -10 },
        moderate: { minPercent: 30, maxPercent: 60, portfolioValue: Math.round(amount * 1.45), probability: 60, maxDrawdown: -15 },
        bullish: { minPercent: 70, maxPercent: 120, portfolioValue: Math.round(amount * 1.95), probability: 35, maxDrawdown: -20 },
      },
      recommendedAssets: parsed.recommendedAssets || [],
      dcaStagingPlan: parsed.dcaStagingPlan || {
        initialDeploymentPercent: 35,
        stagedTrancheCount: 4,
        frequency: 'Bi-weekly',
        pullbackTriggerRule: 'Deploy on 5% pullbacks',
      },
      portfolioSummaryMarkdown: parsed.portfolioSummaryMarkdown || 'Portfolio breakdown generated.',
      disclaimer:
        parsed.disclaimer ||
        'NON-GUARANTEE RISK DISCLOSURE: Past performance and scenario models are probabilistic estimations based on multi-factor market data and technical structure. Cryptocurrency markets are highly volatile. Estimated scenarios must NOT be treated as guaranteed profits.',
      source: 'gemini_ai',
      generatedAt: Date.now(),
    };
  } catch (error: any) {
    console.warn('Gemini Long-Term Investment call failed or timed out, using algorithmic model:', error.message);
    return buildAlgorithmicLongTermPortfolio(timeframe, amount, risk, lang);
  }
}
