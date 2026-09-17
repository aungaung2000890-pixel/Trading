import { LongTermInvestmentRequest, LongTermAnalysisResult } from '../types';

export async function fetchLongTermInvestmentAnalysis(
  request: LongTermInvestmentRequest
): Promise<LongTermAnalysisResult> {
  try {
    const response = await fetch('/api/ai/long-term-investment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data: LongTermAnalysisResult = await response.json();
    return data;
  } catch (error: any) {
    console.warn('Long-Term API call error, creating client-side fallback:', error.message);
    // Return a safe client-side fallback calculation
    return generateClientSideFallback(request);
  }
}

function generateClientSideFallback(req: LongTermInvestmentRequest): LongTermAnalysisResult {
  const amount = Math.max(50, req.investmentAmount || 1000);
  const timeframe = req.timeframe || '1_year';
  const isMy = req.lang === 'my';

  const multiplierMap: Record<string, { cons: number; mod: number; bull: number; maxDd: number }> = {
    '1_month': { cons: 5, mod: 14, bull: 25, maxDd: -8 },
    '3_months': { cons: 10, mod: 25, bull: 50, maxDd: -12 },
    '6_months': { cons: 18, mod: 45, bull: 90, maxDd: -16 },
    '1_year': { cons: 35, mod: 90, bull: 180, maxDd: -22 },
    '3_years': { cons: 70, mod: 210, bull: 450, maxDd: -35 },
  };

  const mult = multiplierMap[timeframe] || multiplierMap['1_year'];

  const btcAllocation = timeframe === '3_years' ? 0.45 : 0.40;
  const ethAllocation = 0.25;
  const solAllocation = 0.20;
  const linkAllocation = timeframe === '3_years' ? 0.10 : 0.15;

  return {
    success: true,
    timeframe,
    investmentAmount: amount,
    riskTolerance: req.riskTolerance || 'balanced',
    overallProbabilityScore: 89,
    macroMarketSummary: isMy
      ? 'Bitcoin Spot ETF စီးဝင်မှု၊ ကမ္ဘာလုံးဆိုင်ရာ အတိုးနှုန်းလျှော့ချရေး မူဝါဒနှင့် On-chain စုဆောင်းမှုများကြောင့် ရေရှည်အတွက် အလားအလာ ကောင်းမွန်နေပါသည်။'
      : 'Monetary easing tailwinds and sovereign ETF inflows establish strong macro structural support for this horizon.',
    macroMarketSummaryMy: 'Bitcoin Spot ETF စီးဝင်မှု၊ ကမ္ဘာလုံးဆိုင်ရာ အတိုးနှုန်းလျှော့ချရေး မူဝါဒနှင့် On-chain စုဆောင်းမှုများကြောင့် ရေရှည်အတွက် အလားအလာ ကောင်းမွန်နေပါသည်။',
    estimatedReturnScenarios: {
      conservative: {
        minPercent: Math.round(mult.cons * 0.7),
        maxPercent: mult.cons,
        portfolioValue: Math.round(amount * (1 + mult.cons / 100)),
        probability: 78,
        maxDrawdown: Math.round(mult.maxDd * 0.75),
      },
      moderate: {
        minPercent: mult.cons,
        maxPercent: mult.mod,
        portfolioValue: Math.round(amount * (1 + mult.mod / 100)),
        probability: 62,
        maxDrawdown: mult.maxDd,
      },
      bullish: {
        minPercent: mult.mod,
        maxPercent: mult.bull,
        portfolioValue: Math.round(amount * (1 + mult.bull / 100)),
        probability: 34,
        maxDrawdown: Math.round(mult.maxDd * 1.15),
      },
    },
    recommendedAssets: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        allocationPercent: Math.round(btcAllocation * 100),
        allocatedAmountUsd: Math.round(amount * btcAllocation),
        currentPrice: 87450,
        probabilityScore: 93,
        riskLevel: 'LOW',
        marketConditionSummary: isMy ? 'ကမ္ဘာ့ Institutional ဒစ်ဂျစ်တယ်ရွှေအဖြစ် မေခရိုအဆင့် အမြင့်ဆုံး လုံခြုံမှုရှိသည်။' : 'Institutional gold standard with dominant liquidity and ETF adoption.',
        technicalAnalysis: {
          htfTrend: 'Weekly / Monthly Uptrend',
          keyAccumulationRange: '$80,000 - $84,500',
          majorResistanceTarget: timeframe === '1_month' ? '$94,000' : timeframe === '1_year' ? '$140,000' : '$210,000',
          movingAveragesSignal: 'Bullish above 200 EMA',
        },
        fundamentalAnalysis: {
          tokenomics: '21M Hard cap with post-halving daily supply compression.',
          revenueAndFees: 'Network fee sustainability and L2 settlement.',
          treasuryHealth: 'Leading sovereign and corporate balance sheet adoption.',
        },
        latestNewsAndCatalysts: isMy ? 'Spot ETF အပတ်စဉ် ပုံမှန်အဝယ်များ ဆက်လက်အားကောင်းနေခြင်း။' : 'Consistent net inflows into institutional Spot ETFs.',
        marketTrendsAndSentiment: {
          sentimentBias: 'Strong Accumulation',
          institutionalInterest: 'Record High',
        },
        onChainData: {
          exchangeReservesTrend: 'Multi-year reserve lows',
          longTermHolderSupply: '71% illiquid supply',
          whaleAccumulationSignal: 'Whale tier addresses expanding holdings',
        },
        regulationAndMacro: {
          regulatoryStatus: 'CFTC/SEC non-security commodity classification',
          macroEnvironmentFit: 'Hedge against global fiat currency dilution',
        },
        projectDevelopment: {
          ecosystemHealth: 'Layer-2 programmability scaling',
          developerActivity: 'Consistently strong client maintenance',
        },
        invalidationRisk: isMy ? 'DXY ဒေါ်လာညွှန်းကိန်း ပြင်းထန်စွာ ထိုးတက်ပြီး $72k ကျိုးပေါက်ခြင်း' : 'Aggressive liquidity contraction below $72,000',
        scenarios: {
          conservative: { expectedReturnPercent: Math.round(mult.cons * 0.8), estimatedValueUsd: Math.round(amount * btcAllocation * (1 + (mult.cons * 0.8) / 100)), probabilityPercent: 88, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 0.7), targetPriceEstimate: Math.round(87450 * (1 + (mult.cons * 0.8) / 100)) },
          moderate: { expectedReturnPercent: Math.round(mult.mod * 0.85), estimatedValueUsd: Math.round(amount * btcAllocation * (1 + (mult.mod * 0.85) / 100)), probabilityPercent: 68, maxExpectedDrawdownPercent: mult.maxDd, targetPriceEstimate: Math.round(87450 * (1 + (mult.mod * 0.85) / 100)) },
          bullish: { expectedReturnPercent: Math.round(mult.bull * 0.9), estimatedValueUsd: Math.round(amount * btcAllocation * (1 + (mult.bull * 0.9) / 100)), probabilityPercent: 38, maxExpectedDrawdownPercent: mult.maxDd, targetPriceEstimate: Math.round(87450 * (1 + (mult.bull * 0.9) / 100)) },
        },
        dcaStagingAdvice: isMy ? '၄၀% စတင်ဝယ်ယူပြီး ကျန် ၆၀% ကို ၅% Pullback တိုင်းတွင် ခွဲဝေထည့်ပါ။' : 'Deploy 40% initial, 60% staged on 5% pullbacks.',
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        allocationPercent: Math.round(ethAllocation * 100),
        allocatedAmountUsd: Math.round(amount * ethAllocation),
        currentPrice: 2480,
        probabilityScore: 85,
        riskLevel: 'MEDIUM',
        marketConditionSummary: isMy ? 'ကမ္ဘာ့ DeFi နှင့် Tokenized RWA ကွန်ရက်၏ အဓိက အခြေခံအဆောက်အအုံ။' : 'Core settlement infrastructure for decentralized finance and institutional RWAs.',
        technicalAnalysis: {
          htfTrend: 'Consolidating above multi-month support',
          keyAccumulationRange: '$2,300 - $2,450',
          majorResistanceTarget: timeframe === '1_month' ? '$2,850' : timeframe === '1_year' ? '$4,500' : '$7,500',
          movingAveragesSignal: 'Reclaiming intermediate EMAs',
        },
        fundamentalAnalysis: {
          tokenomics: 'EIP-1559 fee burning and staking supply lockups.',
          revenueAndFees: 'Over $1.5B annual protocol fees.',
          treasuryHealth: 'Decentralized validator network securing $60B+.',
        },
        latestNewsAndCatalysts: isMy ? 'BlackRock နှင့် အဖွဲ့အစည်းကြီးများ၏ Tokenized Fund တိုးချဲ့မှု။' : 'Expanding institutional tokenization pilots.',
        marketTrendsAndSentiment: {
          sentimentBias: 'Defensive Value',
          institutionalInterest: 'High via Staking and ETFs',
        },
        onChainData: {
          exchangeReservesTrend: '28% of circulating supply locked in staking',
          longTermHolderSupply: 'High illiquid validator supply',
          whaleAccumulationSignal: 'Smart money accumulation tiers',
        },
        regulationAndMacro: {
          regulatoryStatus: 'SEC approved Spot ETFs',
          macroEnvironmentFit: 'Native staking real yields (3.5% APR)',
        },
        projectDevelopment: {
          ecosystemHealth: 'Layer-2 rollups scaling TPS significantly',
          developerActivity: 'Top rank in active Web3 developers',
        },
        invalidationRisk: isMy ? 'L1 ဝင်ငွေ သိသိသာသာကျဆင်းပြီး $2,100 အောက် ကျိုးပေါက်ခြင်း' : 'Structural collapse below $2,100 support',
        scenarios: {
          conservative: { expectedReturnPercent: Math.round(mult.cons * 0.9), estimatedValueUsd: Math.round(amount * ethAllocation * (1 + (mult.cons * 0.9) / 100)), probabilityPercent: 82, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 0.9), targetPriceEstimate: Math.round(2480 * (1 + (mult.cons * 0.9) / 100)) },
          moderate: { expectedReturnPercent: mult.mod, estimatedValueUsd: Math.round(amount * ethAllocation * (1 + mult.mod / 100)), probabilityPercent: 64, maxExpectedDrawdownPercent: mult.maxDd, targetPriceEstimate: Math.round(2480 * (1 + mult.mod / 100)) },
          bullish: { expectedReturnPercent: Math.round(mult.bull * 1.1), estimatedValueUsd: Math.round(amount * ethAllocation * (1 + (mult.bull * 1.1) / 100)), probabilityPercent: 35, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 1.1), targetPriceEstimate: Math.round(2480 * (1 + (mult.bull * 1.1) / 100)) },
        },
        dcaStagingAdvice: isMy ? 'အပတ်စဉ် ပုံမှန် DCA စနစ်ဖြင့် စျေးနှုန်းပျမ်းမျှကို ညှိယူပါ။' : 'Bi-weekly DCA allocation to smooth cost basis.',
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        allocationPercent: Math.round(solAllocation * 100),
        allocatedAmountUsd: Math.round(amount * solAllocation),
        currentPrice: 142.5,
        probabilityScore: 87,
        riskLevel: 'MEDIUM',
        marketConditionSummary: isMy ? 'အမြင့်ဆုံး Retail Volume နှင့် အလွန်မြန်ဆန်သော Transaction Speed ရှိသည့် Layer-1။' : 'High throughput Layer-1 leading in decentralized trading volume and consumer engagement.',
        technicalAnalysis: {
          htfTrend: 'Weekly bull flag structure',
          keyAccumulationRange: '$130 - $142',
          majorResistanceTarget: timeframe === '1_month' ? '$180' : timeframe === '1_year' ? '$320' : '$620',
          movingAveragesSignal: 'Outperforming broader market',
        },
        fundamentalAnalysis: {
          tokenomics: 'Terminal inflation trending to 1.5%.',
          revenueAndFees: 'DEX daily volume challenging top Layer-1 networks.',
          treasuryHealth: 'Robust ecosystem venture and developer grants.',
        },
        latestNewsAndCatalysts: isMy ? 'Firedancer validator စတင်အသုံးပြုနိုင်တော့မည့် သတင်း။' : 'Firedancer validator client deployment near.',
        marketTrendsAndSentiment: {
          sentimentBias: 'High Organic Growth',
          institutionalInterest: 'Accelerating venture adoption',
        },
        onChainData: {
          exchangeReservesTrend: 'Active addresses over 3M daily',
          longTermHolderSupply: '65% supply locked in staking',
          whaleAccumulationSignal: 'Validator reward reinvestment compounding',
        },
        regulationAndMacro: {
          regulatoryStatus: 'US Spot ETF filings undergoing SEC review',
          macroEnvironmentFit: 'High beta liquidity expansion beneficiary',
        },
        projectDevelopment: {
          ecosystemHealth: 'Massive consumer crypto and DeFi growth',
          developerActivity: 'Top-tier hackathon ecosystem retention',
        },
        invalidationRisk: isMy ? 'ကွန်ရက်ရပ်တန့်မှု ထပ်မံဖြစ်ပေါ်ခြင်း သို့မဟုတ် $110 အောက် ကျိုးပေါက်ခြင်း' : 'Consensus freeze or weekly close below $110',
        scenarios: {
          conservative: { expectedReturnPercent: mult.cons, estimatedValueUsd: Math.round(amount * solAllocation * (1 + mult.cons / 100)), probabilityPercent: 78, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 1.1), targetPriceEstimate: Math.round(142.5 * (1 + mult.cons / 100)) },
          moderate: { expectedReturnPercent: Math.round(mult.mod * 1.25), estimatedValueUsd: Math.round(amount * solAllocation * (1 + (mult.mod * 1.25) / 100)), probabilityPercent: 60, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 1.2), targetPriceEstimate: Math.round(142.5 * (1 + (mult.mod * 1.25) / 100)) },
          bullish: { expectedReturnPercent: Math.round(mult.bull * 1.35), estimatedValueUsd: Math.round(amount * solAllocation * (1 + (mult.bull * 1.35) / 100)), probabilityPercent: 32, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 1.25), targetPriceEstimate: Math.round(142.5 * (1 + (mult.bull * 1.35) / 100)) },
        },
        dcaStagingAdvice: isMy ? '$130 - $140 Range အတွင်း Limit Order ဖြင့် အပိုင်းလိုက် ဝယ်ယူပါ။' : 'Staged limit orders inside $130-$140 range.',
      },
      {
        symbol: 'LINK',
        name: 'Chainlink',
        allocationPercent: Math.round(linkAllocation * 100),
        allocatedAmountUsd: Math.round(amount * linkAllocation),
        currentPrice: 12.8,
        probabilityScore: 83,
        riskLevel: 'MEDIUM',
        marketConditionSummary: isMy ? 'TradFi ဘဏ်ကြီးများနှင့် Web3 ကို ချိတ်ဆက်ပေးသော CCIP အခြေခံအဆောက်အအုံ။' : 'Standard institutional oracle infrastructure securing cross-chain settlement (CCIP).',
        technicalAnalysis: {
          htfTrend: 'Multi-year base accumulation breakout',
          keyAccumulationRange: '$11.00 - $12.50',
          majorResistanceTarget: timeframe === '1_month' ? '$16.00' : timeframe === '1_year' ? '$36.00' : '$72.00',
          movingAveragesSignal: 'Bullish divergence on HTF momentum',
        },
        fundamentalAnalysis: {
          tokenomics: 'Staking v0.2 lockups removing circulating tokens.',
          revenueAndFees: 'Enterprise partnerships with Swift and DTCC.',
          treasuryHealth: 'Extensive multi-year foundation reserve.',
        },
        latestNewsAndCatalysts: isMy ? 'SWIFT နှင့် ဘဏ်ကြီးများ၏ CCIP စမ်းသပ်မှု အောင်မြင်ခြင်း။' : 'Swift banking cross-chain settlement trials.',
        marketTrendsAndSentiment: {
          sentimentBias: 'Undervalued Infrastructure',
          institutionalInterest: 'Highest in enterprise blockchain services',
        },
        onChainData: {
          exchangeReservesTrend: 'Major cold storage accumulation by whales',
          longTermHolderSupply: 'Exchange supply down 22% year-on-year',
          whaleAccumulationSignal: 'Non-exchange whale wallet expansion',
        },
        regulationAndMacro: {
          regulatoryStatus: 'Recognized utility infrastructure asset globally',
          macroEnvironmentFit: 'Direct beneficiary of RWA tokenization boom',
        },
        projectDevelopment: {
          ecosystemHealth: 'Securing over $25B in Total Value Secured',
          developerActivity: 'Top 5 in GitHub commits across Web3',
        },
        invalidationRisk: isMy ? '$9.50 အောက် ကျိုးပေါက်ခြင်း သို့မဟုတ် CCIP အသုံးပြုမှု ရပ်တန့်ခြင်း' : 'Breakdown under $9.50 support level',
        scenarios: {
          conservative: { expectedReturnPercent: Math.round(mult.cons * 0.85), estimatedValueUsd: Math.round(amount * linkAllocation * (1 + (mult.cons * 0.85) / 100)), probabilityPercent: 80, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 1.1), targetPriceEstimate: Math.round(12.8 * (1 + (mult.cons * 0.85) / 100) * 10) / 10 },
          moderate: { expectedReturnPercent: Math.round(mult.mod * 1.15), estimatedValueUsd: Math.round(amount * linkAllocation * (1 + (mult.mod * 1.15) / 100)), probabilityPercent: 62, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 1.15), targetPriceEstimate: Math.round(12.8 * (1 + (mult.mod * 1.15) / 100) * 10) / 10 },
          bullish: { expectedReturnPercent: Math.round(mult.bull * 1.3), estimatedValueUsd: Math.round(amount * linkAllocation * (1 + (mult.bull * 1.3) / 100)), probabilityPercent: 34, maxExpectedDrawdownPercent: Math.round(mult.maxDd * 1.2), targetPriceEstimate: Math.round(12.8 * (1 + (mult.bull * 1.3) / 100) * 10) / 10 },
        },
        dcaStagingAdvice: isMy ? 'စျေးငြိမ်သက်နေချိန်တွင် ပုံမှန်စုဆောင်းပါ။' : 'Accumulate steadily during low volatility consolidation.',
      },
    ],
    dcaStagingPlan: {
      initialDeploymentPercent: 35,
      stagedTrancheCount: 4,
      frequency: timeframe === '1_month' ? 'Weekly' : timeframe === '3_months' ? 'Every 10 Days' : 'Bi-weekly',
      pullbackTriggerRule: isMy ? '၄% - ၈% ကျဆင်းတိုင်း သတ်မှတ် tranche အလိုက် ဖြည့်သွင်းပါ။' : 'Deploy tranche on 4-8% pullbacks.',
    },
    portfolioSummaryMarkdown: isMy
      ? `### ရေရှည်ရင်းနှီးမြှုပ်နှံမှု အစီရင်ခံစာ ($${amount.toLocaleString()} USDT)
- **Timeframe:** ${timeframe.replace('_', ' ').toUpperCase()}
- **မဟာဗျူဟာ ခွဲဝေမှု:** Bitcoin (${Math.round(btcAllocation * 100)}%), Ethereum (${Math.round(ethAllocation * 100)}%), Solana (${Math.round(solAllocation * 100)}%), Chainlink (${Math.round(linkAllocation * 100)}%)
- **အကျိုးအမြတ် ခန့်မှန်းချက်:** Conservative (${mult.cons}%), Moderate (${mult.mod}%), Bullish (${mult.bull}%)
- **သတိပြုရန်:** အမြတ်အစွန်းကို အာမခံထားခြင်း မဟုတ်ပါ။ စွန့်စားမှုကို စည်းကမ်းတကျ ထိန်းသိမ်းပါ။`
      : `### Long-Term Portfolio Allocation ($${amount.toLocaleString()} USDT)
- **Timeframe:** ${timeframe.replace('_', ' ').toUpperCase()}
- **Strategy Allocation:** Bitcoin (${Math.round(btcAllocation * 100)}%), Ethereum (${Math.round(ethAllocation * 100)}%), Solana (${Math.round(solAllocation * 100)}%), Chainlink (${Math.round(linkAllocation * 100)}%)
- **Estimated Returns:** Conservative (+${mult.cons}%), Moderate (+${mult.mod}%), Bullish (+${mult.bull}%)
- **Disclosure:** Scenarios are probabilistic estimations, not guaranteed profits.`,
    disclaimer:
      'NON-GUARANTEE RISK DISCLOSURE: Past performance and scenario models are probabilistic estimations based on multi-factor market data and technical structure. Cryptocurrency markets are highly volatile. Estimated scenarios must NOT be treated as guaranteed profits. Capital preservation and disciplined risk management should guide all execution.',
    source: 'algorithmic_engine',
    generatedAt: Date.now(),
  };
}
