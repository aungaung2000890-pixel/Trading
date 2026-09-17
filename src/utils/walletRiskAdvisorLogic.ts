/**
 * Wallet Risk & Strategy Advisor Logic
 * Dual-Track Evaluation:
 * Track 1: Institutional Crypto & Quantitative Tech (မင်းနည်းပညာ Crypto အသိပညာ)
 * Track 2: Custom Discipline & Trader Rules (ငါ့နည်းလမ်းနှင့် စည်းမျဉ်း)
 *
 * Provides tailored advice on:
 * - Which trading method in the app to use (Scalping, Day, Swing, Position, Easy Signals Copy)
 * - Recommended trade count (concurrent open positions & daily limits)
 * - Position sizing (Margin per trade & max portfolio margin cap)
 * - Crucial rules, precautions, and checklists (ဘာတွေသိဖို့လိုသလဲ၊ လိုအပ်တာတွေဘာလဲ)
 */

export interface WalletAdvisorTechTrack {
  modelNameEn: string;
  modelNameMy: string;
  safeLeverage: number;
  recommendedMarginPerTrade: number;
  recommendedMarginPct: number;
  maxConcurrentTrades: number;
  maxDailyTrades: number;
  maxDollarLossAtSL: number;
  maxLossPctOfWallet: number;
  targetTpDollar: number;
  targetTpPctOfWallet: number;
  expectedRR: number;
  minLiquidationBufferPct: number;
  freeMarginReservePct: number;
  freeMarginReserveDollar: number;
  consecutiveLossTolerance50Pct: number;
  riskEvaluationEn: string;
  riskEvaluationMy: string;
}

export interface WalletAdvisorUserTrack {
  ruleNameEn: string;
  ruleNameMy: string;
  userMarginPerTrade: number;
  userMarginPct: number;
  userLeverage: number;
  userConcurrentTrades: number;
  userDailyTrades: number;
  userLossAtSL: number;
  userLossPctOfWallet: number;
  userProfitAtTP: number;
  userProfitPctOfWallet: number;
  userRR: number;
  userConsecutiveLossTolerance50Pct: number;
  verdictEn: 'SAFE' | 'MODERATE' | 'AGGRESSIVE';
  verdictMy: 'အန္တရာယ်ကင်း' | 'မျှတမှုရှိ' | 'အန္တရာယ်မြင့်';
  discrepancyWarningsEn: string[];
  discrepancyWarningsMy: string[];
}

export interface AppTradingStrategyRecommendation {
  id: 'scalping' | 'day_trade' | 'swing' | 'position' | 'signals_copy';
  nameEn: string;
  nameMy: string;
  appNavTarget: 'strategy' | 'signals_copy' | 'calculator' | 'tradecard';
  styleCategory: string;
  matchScorePct: number; // e.g. 96
  isPrimaryRecommendation: boolean;
  timeframe: string;
  holdingDuration: string;
  suggestedLeverage: number;
  suggestedMarginRange: string;
  suggestedTradeCount: string;
  whyFitsWalletEn: string;
  whyFitsWalletMy: string;
  keyRuleEn: string;
  keyRuleMy: string;
}

export interface EssentialKnowledgeChecklistItem {
  id: string;
  titleEn: string;
  titleMy: string;
  category: 'MARGIN' | 'BUFFER' | 'DISCIPLINE' | 'EXECUTION' | 'FEES';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  descriptionEn: string;
  descriptionMy: string;
  actionRequiredEn: string;
  actionRequiredMy: string;
}

export interface WalletAdvisorResult {
  walletBalance: number;
  evaluatedAtTime: string;
  avgAtrPct: number;
  techTrack: WalletAdvisorTechTrack;
  userTrack: WalletAdvisorUserTrack;
  recommendedStrategies: AppTradingStrategyRecommendation[];
  primaryStrategy: AppTradingStrategyRecommendation;
  tradeAllocationSummary: {
    recommendedMarginPerTrade: number;
    maxConcurrentPositions: number;
    maxDailyTrades: number;
    maxTotalAllocatedMargin: number;
    freeReserveMargin: number;
    maxLossPerTradeDollar: number;
    summaryTextEn: string;
    summaryTextMy: string;
  };
  essentialChecklist: EssentialKnowledgeChecklistItem[];
}

export interface WalletAdvisorInput {
  walletBalance: number;
  userMargin?: number;
  userLeverage?: number;
  userMaxPositions?: number;
  avgAtrPct?: number; // e.g., 4.5% 24h volatility
  riskAppetite?: 'conservative' | 'balanced' | 'aggressive';
}

export function computeWalletRiskAdvisor(input: WalletAdvisorInput): WalletAdvisorResult {
  const walletBalance = Math.max(10, input.walletBalance || 2000);
  const avgAtr = Math.max(2.5, Math.min(18, input.avgAtrPct || 4.8));
  const appetite = input.riskAppetite || 'balanced';

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. TRACK 1: TECH & CRYPTO EXPERTISE (မင်းနည်းပညာ Crypto အသိပညာ)
  // Mathematical Capital Preservation & Volatility Buffers
  // ─────────────────────────────────────────────────────────────────────────────
  let techRiskPct = 0.015; // Standard 1.5% max risk at SL
  if (appetite === 'conservative') techRiskPct = 0.01; // 1.0%
  if (appetite === 'aggressive') techRiskPct = 0.02; // 2.0%

  // Noise-immune leverage calculation (ensure Liquidation Buffer > 1.8x of 24h ATR)
  // E.g., if ATR is 5%, minimum buffer needed is ~9%, meaning max leverage ~10x-11x
  const safeLevRaw = Math.floor(100 / (avgAtr * 1.8));
  let techSafeLeverage = Math.min(20, Math.max(3, safeLevRaw));

  // If wallet is very small (< $150), 10x-15x is technically needed to meet minimum notional on Binance ($5-$10 minimum order)
  if (walletBalance < 150) {
    techSafeLeverage = Math.min(15, Math.max(10, techSafeLeverage));
  } else if (walletBalance > 5000) {
    // Large wallets should use lower leverage for capital preservation
    techSafeLeverage = Math.min(8, techSafeLeverage);
  }

  // Recommended SL distance based on ATR
  const techSlPercent = Number(Math.max(1.8, avgAtr * 0.45).toFixed(1)); // e.g. 2.2%
  const techExpectedRR = 2.5; // Minimum 1:2.5 edge
  const techTpPercent = Number((techSlPercent * techExpectedRR).toFixed(1)); // e.g. 5.5%

  // Max dollar loss at SL
  const techMaxDollarLoss = Number((walletBalance * techRiskPct).toFixed(2));

  // Compute recommended margin so that Loss = Margin * Leverage * (SL% / 100) = techMaxDollarLoss
  const rawTechMargin = techMaxDollarLoss / (techSafeLeverage * (techSlPercent / 100));
  
  // Bound margin logically: at least $10, max 20% of wallet per single position
  const techRecommendedMargin = Math.round(
    Math.max(10, Math.min(walletBalance * 0.2, rawTechMargin))
  );
  const techRecommendedMarginPct = Number(((techRecommendedMargin / walletBalance) * 100).toFixed(1));

  // Target profit at TP
  const techTargetTpDollar = Number(
    (techRecommendedMargin * techSafeLeverage * (techTpPercent / 100)).toFixed(2)
  );
  const techTargetTpPctOfWallet = Number(((techTargetTpDollar / walletBalance) * 100).toFixed(2));

  // Concurrent trades determination based on wallet capacity
  let techMaxConcurrent = 1;
  let techMaxDaily = 3;
  if (walletBalance < 250) {
    techMaxConcurrent = 1; // Strict 1 trade to avoid account fragmentation
    techMaxDaily = 2;
  } else if (walletBalance < 1000) {
    techMaxConcurrent = 2;
    techMaxDaily = 3;
  } else if (walletBalance < 5000) {
    techMaxConcurrent = 3;
    techMaxDaily = 4;
  } else {
    techMaxConcurrent = 4;
    techMaxDaily = 5;
  }

  const techMaxTotalAllocatedMargin = techRecommendedMargin * techMaxConcurrent;
  const techFreeReserveMargin = Math.max(0, walletBalance - techMaxTotalAllocatedMargin);
  const techFreeReservePct = Number(((techFreeReserveMargin / walletBalance) * 100).toFixed(1));
  const techMinLiqBuffer = Number((100 / techSafeLeverage).toFixed(1));
  const techConsecutiveLossTolerance = Math.floor(50 / (techRiskPct * 100)); // e.g. 33 trades

  const techEvaluationEn = `Under quantitative risk management, your $${walletBalance.toLocaleString()} wallet requires strict 1.5% SL drawdown ($${techMaxDollarLoss.toFixed(0)}) with noise-immune ${techSafeLeverage}x leverage. Open maximum ${techMaxConcurrent} trade${techMaxConcurrent > 1 ? 's' : ''} at a time to preserve an ${techFreeReservePct}% free capital safety net.`;
  const techEvaluationMy = `Quantitative နည်းပညာအရ သင့် $${walletBalance.toLocaleString()} Wallet သည် Stop Loss ဖြစ်ချိန် အများဆုံး အရှုံးငွေ $${techMaxDollarLoss.toFixed(0)} (၁.၅%) သာ ခံယူသင့်ပြီး နေ့စဉ် လှိုင်းဒဏ်ခံနိုင်သော ${techSafeLeverage}x Leverage ကို အသုံးပြုသင့်ပါသည်။ Free Margin အရန်ငွေ ${techFreeReservePct}% ကျန်ရှိစေရန် တပြိုင်နက် Trade အများဆုံး ${techMaxConcurrent} ခုသာ ဖွင့်ခွင့်ရှိပါသည်။`;

  const techTrack: WalletAdvisorTechTrack = {
    modelNameEn: 'Institutional Quantitative & Volatility Tech Model',
    modelNameMy: 'နည်းပညာ & Crypto အသိပညာ အခြေပြု စံနှုန်းစနစ်',
    safeLeverage: techSafeLeverage,
    recommendedMarginPerTrade: techRecommendedMargin,
    recommendedMarginPct: techRecommendedMarginPct,
    maxConcurrentTrades: techMaxConcurrent,
    maxDailyTrades: techMaxDaily,
    maxDollarLossAtSL: techMaxDollarLoss,
    maxLossPctOfWallet: Number((techRiskPct * 100).toFixed(1)),
    targetTpDollar: techTargetTpDollar,
    targetTpPctOfWallet: techTargetTpPctOfWallet,
    expectedRR: techExpectedRR,
    minLiquidationBufferPct: techMinLiqBuffer,
    freeMarginReservePct: techFreeReservePct,
    freeMarginReserveDollar: techFreeReserveMargin,
    consecutiveLossTolerance50Pct: techConsecutiveLossTolerance,
    riskEvaluationEn: techEvaluationEn,
    riskEvaluationMy: techEvaluationMy,
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. TRACK 2: USER'S CUSTOM DISCIPLINE (ငါ့နည်းလမ်းနှင့် စည်းမျဉ်း)
  // ─────────────────────────────────────────────────────────────────────────────
  const userMargin = Math.max(10, input.userMargin || Math.round(walletBalance * 0.1));
  const userLeverage = Math.max(1, Math.min(100, input.userLeverage || 20));
  const userConcurrent = Math.max(1, input.userMaxPositions || (walletBalance > 1000 ? 2 : 1));
  const userMarginPct = Number(((userMargin / walletBalance) * 100).toFixed(1));

  const userSlPct = 2.0; // Standard 2% price move at SL
  const userTpPct = 5.0; // Standard 5% price move at TP
  const userLossAtSL = Number((userMargin * userLeverage * (userSlPct / 100)).toFixed(2));
  const userLossPctOfWallet = Number(((userLossAtSL / walletBalance) * 100).toFixed(2));
  const userProfitAtTP = Number((userMargin * userLeverage * (userTpPct / 100)).toFixed(2));
  const userProfitPctOfWallet = Number(((userProfitAtTP / walletBalance) * 100).toFixed(2));
  const userRR = Number((userTpPct / userSlPct).toFixed(2));
  const userConsecutiveLossTolerance = userLossPctOfWallet > 0 ? Math.floor(50 / userLossPctOfWallet) : 999;

  const warningsEn: string[] = [];
  const warningsMy: string[] = [];

  if (userLossPctOfWallet > 3.5) {
    warningsEn.push(`SL Loss (${userLossPctOfWallet}%) exceeds recommended 1.5-2.0% safe threshold. A streak of bad trades will erode capital quickly.`);
    warningsMy.push(`SL ဖြစ်ချိန် အရှုံး (${userLossPctOfWallet}%) သည် အကြံပြုထားသော ၁.၅-၂.၀% ထက် မြင့်မားနေသဖြင့် အဆက်မပြတ်ရှုံးပါက အရင်းအနှီး လျင်မြန်စွာ ပြုန်းတီးနိုင်သည်။`);
  }
  if (userLeverage > techSafeLeverage + 5) {
    const userLiqBuf = (100 / userLeverage).toFixed(1);
    warningsEn.push(`User Leverage (${userLeverage}x) provides only ±${userLiqBuf}% liquidation buffer, falling inside normal 24h crypto volatility wicks.`);
    warningsMy.push(`သင့် Leverage (${userLeverage}x) သည် Liquidation Buffer (±${userLiqBuf}%) သာရှိပြီး ပုံမှန် 24 နာရီ စျေးကွက်လှိုင်းခတ်မှုအတွင်း ကျရောက်နေပါသည်။`);
  }
  if (userMarginPct > 25) {
    warningsEn.push(`Single trade margin (${userMarginPct}% of wallet) leaves insufficient cash buffer for drawdown.`);
    warningsMy.push(`Trade တစ်ခုတည်းတွင် Wallet ၏ ${userMarginPct}% အသုံးပြုခြင်းသည် အရေးပေါ်ခံနိုင်ရည် Margin ကို နည်းပါးစေပါသည်။`);
  }

  let userVerdictEn: 'SAFE' | 'MODERATE' | 'AGGRESSIVE' = 'SAFE';
  let userVerdictMy: 'အန္တရာယ်ကင်း' | 'မျှတမှုရှိ' | 'အန္တရာယ်မြင့်' = 'အန္တရာယ်ကင်း';
  if (userLossPctOfWallet > 4.0 || userLeverage > 30 || userMarginPct > 30) {
    userVerdictEn = 'AGGRESSIVE';
    userVerdictMy = 'အန္တရာယ်မြင့်';
  } else if (userLossPctOfWallet > 2.2 || userLeverage > 20 || userMarginPct > 15) {
    userVerdictEn = 'MODERATE';
    userVerdictMy = 'မျှတမှုရှိ';
  }

  const userTrack: WalletAdvisorUserTrack = {
    ruleNameEn: 'Your Custom Method & Trader Settings',
    ruleNameMy: 'သင်ကိုယ်တိုင် သတ်မှတ်ထားသော စည်းမျဉ်းနှင့် နည်းလမ်း',
    userMarginPerTrade: userMargin,
    userMarginPct,
    userLeverage,
    userConcurrentTrades: userConcurrent,
    userDailyTrades: userConcurrent * 2,
    userLossAtSL,
    userLossPctOfWallet,
    userProfitAtTP,
    userProfitPctOfWallet,
    userRR,
    userConsecutiveLossTolerance50Pct: userConsecutiveLossTolerance,
    verdictEn: userVerdictEn,
    verdictMy: userVerdictMy,
    discrepancyWarningsEn: warningsEn,
    discrepancyWarningsMy: warningsMy,
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. APP STRATEGY RECOMMENDATIONS (ငါ့အခု App ထဲမှရှိတဲ့ Trade နည်းလမ်းများ အကြံပြုချက်)
  // Evaluate the 5 core styles in the app based on wallet balance & market ATR
  // ─────────────────────────────────────────────────────────────────────────────
  const strategies: AppTradingStrategyRecommendation[] = [
    {
      id: 'scalping',
      nameEn: '⚡ Scalping Mode (Fast Sniper)',
      nameMy: '⚡ အမြန်စနိုက်ပါ (Scalping Mode)',
      appNavTarget: 'strategy',
      styleCategory: 'High Frequency',
      matchScorePct: walletBalance < 500 ? 95 : walletBalance < 2000 ? 88 : 72,
      isPrimaryRecommendation: walletBalance < 500,
      timeframe: '1m - 5m',
      holdingDuration: '5 to 30 mins',
      suggestedLeverage: Math.min(18, Math.max(10, techSafeLeverage + 3)),
      suggestedMarginRange: `$${Math.max(10, Math.round(walletBalance * 0.08))} - $${Math.max(20, Math.round(walletBalance * 0.15))}`,
      suggestedTradeCount: '1 trade strictly at a time (Max 3/day)',
      whyFitsWalletEn: `For small to mid balances ($${walletBalance.toLocaleString()}), scalping avoids overnight funding fees and captures 1.5%-3% rapid moves with strict tight stops.`,
      whyFitsWalletMy: `လက်ကျန် $${walletBalance.toLocaleString()} အတွက် ညသိပ်စောင့်စရာမလိုဘဲ ၅ မိနစ်မှ မိနစ် ၃၀ အတွင်း အမြန်အမြတ်ထုတ်နိုင်ပြီး Funding Rate အဖြတ်မခံရပါ။`,
      keyRuleEn: 'Must exit immediately if 1m candle closes beyond Stop Loss. Never hold a scalp into a loss.',
      keyRuleMy: '၁ မိနစ် ဖယောင်းတိုင် Stop Loss ကျော်လွန်သွားပါက ချက်ချင်းထွက်ရမည်။ အရှုံးကို ဆက်မကိုင်ထားရပါ။',
    },
    {
      id: 'day_trade',
      nameEn: '🎯 Day Trading Mode (Intraday Momentum)',
      nameMy: '🎯 နေ့စဉ်ပုံမှန် ကုန်သွယ်မှု (Day Trading Mode)',
      appNavTarget: 'strategy',
      styleCategory: 'Intraday Momentum',
      matchScorePct: walletBalance >= 500 && walletBalance <= 3000 ? 96 : 84,
      isPrimaryRecommendation: walletBalance >= 500 && walletBalance <= 3000,
      timeframe: '15m - 1h',
      holdingDuration: '2 to 8 hours',
      suggestedLeverage: techSafeLeverage,
      suggestedMarginRange: `$${Math.max(20, Math.round(walletBalance * 0.06))} - $${Math.max(40, Math.round(walletBalance * 0.12))}`,
      suggestedTradeCount: `${techMaxConcurrent} simultaneous positions (Max 4/day)`,
      whyFitsWalletEn: `Ideal sweet-spot for your $${walletBalance.toLocaleString()} wallet. Gives enough room for 15M/1H market structure while closing before daily funding turnover.`,
      whyFitsWalletMy: `သင့် $${walletBalance.toLocaleString()} လက်ကျန်အတွက် အသင့်တော်ဆုံးနည်းလမ်းဖြစ်ပြီး ၁၅ မိနစ်/၁ နာရီ Trend အတိုင်း မျှတသော Leverage ဖြင့် စိတ်အေးချမ်းစွာ ကုန်သွယ်နိုင်သည်။`,
      keyRuleEn: 'Enter only after a 15M liquidity sweep or key structural bounce. Risk-to-reward must be >= 1:2.',
      keyRuleMy: '၁၅ မိနစ် Liquidity sweep သို့မဟုတ် Key Support/Resistance မှ ပြန်ကန်ထွက်မှသာ ဝင်ပါ (R:R အနည်းဆုံး 1:2)။',
    },
    {
      id: 'signals_copy',
      nameEn: '📋 Easy Signals Copy Mode (Zero-Delay Binance)',
      nameMy: '📋 အမြန် စစ်ဂနယ် ကော်ပီမုဒ် (Easy Signals Copy)',
      appNavTarget: 'signals_copy',
      styleCategory: 'Signal Driven',
      matchScorePct: 92,
      isPrimaryRecommendation: false,
      timeframe: '15m - 4h',
      holdingDuration: 'Intraday to 1 Day',
      suggestedLeverage: techSafeLeverage,
      suggestedMarginRange: `$${techRecommendedMargin} per signal`,
      suggestedTradeCount: `Follow top ${techMaxConcurrent} ranked coin signals only`,
      whyFitsWalletEn: `Clean signal cards with pre-calculated safe entry, TP targets, and SL directly copyable to Binance futures with zero confusion.`,
      whyFitsWalletMy: `တွက်ချက်ပြီးသား Entry, TP, SL များကို Binance ထဲသို့ အချိန်မဆိုင်းဘဲ တိုက်ရိုက်ကော်ပီကူးယူနိုင်သော အဆင်ပြေဆုံး နည်းလမ်းဖြစ်ပါသည်။`,
      keyRuleEn: 'Always use Isolated Margin and copy the exact calculated Stop Loss price.',
      keyRuleMy: 'အမြဲ Isolated Margin သုံးပြီး တွက်ချက်ပေးထားသော Stop Loss စျေးနှုန်းအတိုင်း အတိအကျ ကူးယူပါ။',
    },
    {
      id: 'swing',
      nameEn: '🌊 Swing Trading Mode (Multi-Day Structure)',
      nameMy: '🌊 ရက်ပိုင်း လှိုင်းစီးမှု (Swing Trading Mode)',
      appNavTarget: 'strategy',
      styleCategory: 'Trend & Structure',
      matchScorePct: walletBalance > 2000 ? 94 : 70,
      isPrimaryRecommendation: walletBalance > 3000,
      timeframe: '4h - 1D',
      holdingDuration: '1 to 5 days',
      suggestedLeverage: Math.max(3, Math.min(8, techSafeLeverage - 2)),
      suggestedMarginRange: `$${Math.max(50, Math.round(walletBalance * 0.05))} - $${Math.max(100, Math.round(walletBalance * 0.10))}`,
      suggestedTradeCount: '1 to 2 high-conviction positions',
      whyFitsWalletEn: `Leverage is low (3x-8x) with massive liquidation distance (±15% to ±30%), riding 4H market trends with minimal stress.`,
      whyFitsWalletMy: `Leverage နိမ့် (၃ဆ မှ ၈ဆ) ဖြင့် Liquidation အန္တရာယ် အလွန်ဝေးကွာပြီး ၄ နာရီ Trend အတိုင်း ရက်ပိုင်းကိုင်ဆောင်၍ အမြတ်ကြီးရယူနိုင်သည်။`,
      keyRuleEn: 'Never risk more than 1.5% at SL. Account for 8-hour funding fee rates before entering long multi-day holds.',
      keyRuleMy: 'ရက်ရှည်ကိုင်ဆောင်မည်ဖြစ်သဖြင့် ၈ နာရီတစ်ကြိမ် Funding Rate ဖြတ်တောက်မှုကို ကြိုတင်စစ်ဆေးပါ။',
    },
    {
      id: 'position',
      nameEn: '🏛️ Position / Trend Trading (Macro Cycle)',
      nameMy: '🏛️ ကာလရှည် ပင်မလမ်းကြောင်း (Position Trading)',
      appNavTarget: 'strategy',
      styleCategory: 'Macro Cycle',
      matchScorePct: walletBalance >= 5000 ? 90 : 55,
      isPrimaryRecommendation: false,
      timeframe: '1D - 1W',
      holdingDuration: '1 to 4 weeks',
      suggestedLeverage: Math.min(4, Math.max(2, Math.floor(techSafeLeverage / 2))),
      suggestedMarginRange: `$${Math.round(walletBalance * 0.05)} - $${Math.round(walletBalance * 0.08)}`,
      suggestedTradeCount: '1 macro position',
      whyFitsWalletEn: 'Requires substantial capital reserve to withstand weekly swings. Zero threat of intraday liquidation.',
      whyFitsWalletMy: 'အပတ်စဉ် အတက်အကျများကို ခံနိုင်ရည်ရှိရန် အရင်းအနှီးများမှသာ သင့်တော်ပြီး နေ့စဉ် လှိုင်းဒဏ် လုံးဝမစိုးရိမ်ရပါ။',
      keyRuleEn: 'Rebalance only on weekly candle close confirmations.',
      keyRuleMy: 'အပတ်စဉ် Weekly Candle ပိတ်ချိန်မှသာ အနေအထားကို ပြန်လည်ညှိနှိုင်းပါ။',
    },
  ];

  // Sort strategies so primary recommendation is first
  strategies.sort((a, b) => b.matchScorePct - a.matchScorePct);
  // Guarantee top match is marked primary
  strategies.forEach((s, idx) => {
    s.isPrimaryRecommendation = idx === 0;
  });
  const primaryStrategy = strategies[0];

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. TRADE ALLOCATION SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  const allocationSummary = {
    recommendedMarginPerTrade: techRecommendedMargin,
    maxConcurrentPositions: techMaxConcurrent,
    maxDailyTrades: techMaxDaily,
    maxTotalAllocatedMargin: techMaxTotalAllocatedMargin,
    freeReserveMargin: techFreeReserveMargin,
    maxLossPerTradeDollar: techMaxDollarLoss,
    summaryTextEn: `Based on your $${walletBalance.toLocaleString()} wallet: Allocate max $${techRecommendedMargin} (${techRecommendedMarginPct}%) per trade with max ${techMaxConcurrent} concurrent positions. Keep $${techFreeReserveMargin.toLocaleString()} (${techFreeReservePct}%) untouched as free margin buffer.`,
    summaryTextMy: `သင့် $${walletBalance.toLocaleString()} Wallet အတွက် အကြံပြုချက် - Trade တစ်ခုလျှင် Margin ဒေါ်လာ $${techRecommendedMargin} (${techRecommendedMarginPct}%) ဖြင့် တပြိုင်နက် အများဆုံး ${techMaxConcurrent} ခုသာ ဖွင့်ပါ။ အကောင့်ထဲတွင် $${techFreeReserveMargin.toLocaleString()} (${techFreeReservePct}%) ကို မထိမတို့ရမည့် Free Margin အဖြစ် အမြဲချန်ထားပါ။`,
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. ESSENTIAL KNOWLEDGE & CHECKLIST (ဘာတွေသိဖို့လိုလဲ၊ လိုအပ်တာတွေဘာလဲ)
  // ─────────────────────────────────────────────────────────────────────────────
  const essentialChecklist: EssentialKnowledgeChecklistItem[] = [
    {
      id: 'isolated_margin',
      titleEn: '1. Isolated Margin Only (Never Cross)',
      titleMy: '၁။ Isolated Margin သာ သုံးပါ (Cross လုံးဝမသုံးရ)',
      category: 'MARGIN',
      priority: 'CRITICAL',
      descriptionEn: 'Cross margin puts your entire wallet balance at risk for a single bad trade. Isolated margin confines loss strictly to that trade\'s margin.',
      descriptionMy: 'Cross Margin သည် အကြွေပြားတစ်ခု အမှားကြောင့် သင့် Wallet တစ်ခုလုံးရှိ ပိုက်ဆံအားလုံး ကုန်သွားစေနိုင်သည်။ Isolated သည် ထို Trade အတွက် ထည့်ထားသော Margin သာ ဆုံးရှုံးစေသည်။',
      actionRequiredEn: 'Ensure Binance margin mode is toggled to "ISOLATED" before submitting any order.',
      actionRequiredMy: 'အော်ဒါမတင်မီ Binance တွင် Margin Mode ကို "ISOLATED" ဟု အမြဲပြောင်းထားကြောင်း စစ်ဆေးပါ။',
    },
    {
      id: 'hard_stop_loss',
      titleEn: '2. Pre-set System Stop Loss (No Mental SL)',
      titleMy: '၂။ အမြဲ စနစ် Stop Loss ကြိုတင်ထည့်ပါ (စိတ်ထဲမှ မှတ်မထားရ)',
      category: 'EXECUTION',
      priority: 'CRITICAL',
      descriptionEn: 'Crypto flash crashes and exchange latency can wipe out accounts in seconds. A mental stop loss fails when emotions take over.',
      descriptionMy: 'Crypto စျေးကွက်သည် စက္ကန့်ပိုင်းအတွင်း ပြင်းထန်စွာ ထိုးကျနိုင်သဖြင့် စိတ်ထဲမှ မှတ်ထားသော Stop Loss မရပါ။ စနစ်ထဲတွင် Stop-Market အော်ဒါ ကြိုတင်တင်ထားရမည်။',
      actionRequiredEn: `Set hard Stop Loss immediately upon entry. Maximum dollar loss must not exceed $${techMaxDollarLoss.toFixed(0)}.`,
      actionRequiredMy: `အော်ဒါဝင်သည်နှင့် Stop Loss ကို ချက်ချင်းထည့်ပါ။ အများဆုံး အရှုံးငွေ $${techMaxDollarLoss.toFixed(0)} ထက် မကျော်လွန်စေရပါ။`,
    },
    {
      id: 'liquidation_buffer',
      titleEn: '3. Liquidation Buffer vs 24H Volatility Noise',
      titleMy: '၃။ စျေးကွက်လှိုင်းခတ်မှုနှင့် Liquidation ကွာဝေးမှု (Buffer)',
      category: 'BUFFER',
      priority: 'HIGH',
      descriptionEn: `Your liquidation price must be safely outside normal 24h volatility (±${avgAtr}% ATR). With ${techSafeLeverage}x leverage, your buffer is ±${techMinLiqBuffer}%, which protects against wick grabs.`,
      descriptionMy: `Liquidation စျေးနှုန်းသည် ပုံမှန် နေ့စဉ် လှိုင်းခတ်မှု (±${avgAtr}%) ထက် ကျော်လွန်ဝေးကွာနေရမည်။ ${techSafeLeverage}x Leverage ဖြင့် Liquidation Buffer သည် ±${techMinLiqBuffer}% ရှိသဖြင့် ဖယောင်းတိုင်အမြီးဆွဲခံရခြင်းမှ ကာကွယ်ပေးသည်။`,
      actionRequiredEn: `Never exceed ${techSafeLeverage}x leverage on volatile altcoins.`,
      actionRequiredMy: `အတက်အကျမြန်သော အကြွေပြားများတွင် Leverage ကို ${techSafeLeverage}x ထက် မပိုစေပါနှင့်။`,
    },
    {
      id: 'risk_reward_ratio',
      titleEn: '4. Minimum 1:2 Risk-to-Reward Ratio',
      titleMy: '၄။ အမြတ်/အရှုံး အချိုး အနည်းဆုံး ၁:၂ ထားရှိခြင်း (R:R)',
      category: 'DISCIPLINE',
      priority: 'HIGH',
      descriptionEn: 'With a 1:2 R:R, you can be wrong 50% of the time and still remain consistently profitable over 50 trades.',
      descriptionMy: 'အမြတ်/အရှုံး အချိုး ၁:၂ ဖြင့် ကုန်သွယ်ပါက အကြိမ် ၁၀၀ တွင် အကြိမ် ၅၀ ရှုံးသည့်တိုင် သင့် Wallet သည် သိသာစွာ အမြတ်ထွက်နေမည်ဖြစ်သည်။',
      actionRequiredEn: 'Verify that Take Profit distance is at least 2x the Stop Loss distance before executing.',
      actionRequiredMy: 'Take Profit စျေးနှုန်းသည် Stop Loss စျေးနှုန်းထက် အနည်းဆုံး ၂ ဆ ပိုမိုကြီးမားမှုရှိမှသာ အော်ဒါဖွင့်ပါ။',
    },
    {
      id: 'funding_fee_awareness',
      titleEn: '5. Funding Rate & Overnight Drag',
      titleMy: '၅။ ၈ နာရီတစ်ကြိမ် ဖြတ်တောက်ကြေး (Funding Rate) စစ်ဆေးခြင်း',
      category: 'FEES',
      priority: 'MEDIUM',
      descriptionEn: 'Holding perpetual futures across the 8-hour funding cycle costs money if funding is heavily skewed in your direction.',
      descriptionMy: 'Perpetual Futures တွင် ၈ နာရီတစ်ကြိမ် Funding Fee ပေးချေရသဖြင့် အထူးသဖြင့် စျေးကွက်အရမ်းတက်နေချိန် Long ကိုင်ဆောင်ထားပါက အခကြေးငွေ နုတ်ယူခံရနိုင်သည်။',
      actionRequiredEn: 'Check live funding rate in the scanner table. Avoid long-term holds on coins with > 0.05% funding rate.',
      actionRequiredMy: 'Scanner Table တွင် Funding Rate ကို စစ်ဆေးပြီး 0.05% ထက်များနေသော အကြွေပြားများကို ရက်ရှည် မကိုင်ပါနှင့်။',
    },
    {
      id: 'consecutive_loss_breaker',
      titleEn: '6. Two-Loss Circuit Breaker (No Revenge Trading)',
      titleMy: '၆။ ၂ ကြိမ်ဆက်ရှုံးပါက အနားယူခြင်း (Circuit Breaker)',
      category: 'DISCIPLINE',
      priority: 'CRITICAL',
      descriptionEn: '90% of wiped accounts occur due to revenge trading immediately after a loss. Stop trading for the day after 2 consecutive losses.',
      descriptionMy: 'Futures တွင် အကောင့်ပြောင်သွားသူ ၉၀% သည် ရှုံးပြီးပြီးချင်း ပြန်လုရန် အငမ်းမရ ဝင်ခြင်းကြောင့် ဖြစ်သည်။ တစ်ရက်အတွင်း ၂ ကြိမ်ဆက်ရှုံးပါက စျေးကွက်မှ ချက်ချင်း အနားယူပါ။',
      actionRequiredEn: `Your daily circuit breaker limit is ${techMaxDaily} trades max. Stop immediately if 2 trades hit SL.`,
      actionRequiredMy: `တစ်နေ့တာ အများဆုံး ကုန်သွယ်ခွင့်မှာ ${techMaxDaily} ကြိမ်သာဖြစ်ပြီး ၂ ကြိမ်ဆက် Stop Loss ထိပါက ထိုနေ့အတွက် ကွန်ပျူတာပိတ်ပါ။`,
    },
  ];

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return {
    walletBalance,
    evaluatedAtTime: timeStr,
    avgAtrPct: avgAtr,
    techTrack,
    userTrack,
    recommendedStrategies: strategies,
    primaryStrategy,
    tradeAllocationSummary: allocationSummary,
    essentialChecklist,
  };
}
