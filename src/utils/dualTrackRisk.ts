/**
 * Dual-Track Risk Management & Calculation Engine
 * Synchronizes User Custom Rules (ငါ့စည်းမျဉ်း) vs. Independent Technical AI Recommendations (မင်းရွေးချယ်မှု)
 * based strictly on Futures Wallet Balance, Asset ATR Volatility, and Portfolio Preservation Rules.
 */

export interface DualTrackRiskParams {
  walletBalance: number;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  userMargin: number;
  userLeverage: number;
  userTpPercent?: number;
  userSlPercent?: number;
  atr24hPercent?: number;
  change24h?: number;
  styleMultiplier?: number; // e.g., scalping vs swing adjustments
  coin?: string;
  atrPercent?: number;
  tpPercent?: number;
  slPercent?: number;
}

export interface UserTrackCalculations {
  notional: number;
  marginPctOfBalance: number;
  liqBufferPct: number;
  tpPercent: number;
  slPercent: number;
  tpPrice: number;
  slPrice: number;
  liqPrice: number;
  dollarProfit: number;
  dollarLoss: number;
  accountGainPct: number;
  accountLossPct: number;
  riskReward: number;
  consecutiveLossesTo50Pct: number;
  isSafe: boolean;
  warningText?: string;
  warningTextMy?: string;
  allRulesPass: boolean;
  lossPctOfBalance: number;
  gainPctOfBalance: number;
}

export interface TechnicalTrackCalculations {
  atrSpread: number;
  recommendedMargin: number;
  recommendedLeverage: number;
  recommendedTpPercent: number;
  recommendedSlPercent: number;
  recommendedTpPrice: number;
  recommendedSlPrice: number;
  recommendedLiqPrice: number;
  recommendedLiqBufferPct: number;
  recommendedNotional: number;
  recommendedDollarProfit: number;
  recommendedDollarLoss: number;
  recommendedAccountGainPct: number;
  recommendedAccountLossPct: number;
  riskReward: number;
  leverageLogic: string;
  leverageLogicMy: string;
}

export interface DualTrackResult {
  walletBalance: number;
  direction: 'LONG' | 'SHORT';
  isLong: boolean;
  entryPrice: number;
  user: UserTrackCalculations;
  technical: TechnicalTrackCalculations;
  // Aliases for component convenience
  userPlan: {
    allRulesPass: boolean;
    marginPctOfBalance: number;
    lossPctOfBalance: number;
    gainPctOfBalance: number;
    consecutiveLossesTo50Pct: number;
    notional: number;
    dollarLoss: number;
    dollarProfit: number;
    riskReward: number;
  };
  technicalAnalysis: {
    recommendedMargin: number;
    recommendedLeverage: number;
    recommendedNotional: number;
    recommendedDollarLoss: number;
    recommendedDollarProfit: number;
    leverageReasoning: string;
    leverageReasoningMy: string;
    riskReward: number;
  };
}

export function computeDualTrackRisk(params: DualTrackRiskParams): DualTrackResult {
  const {
    walletBalance: rawBalance,
    direction,
    entryPrice: rawEntry,
    userMargin: rawMargin,
    userLeverage: rawLeverage,
    userTpPercent: explicitUserTp,
    userSlPercent: explicitUserSl,
    atr24hPercent: explicitAtr24,
    change24h = 0,
    styleMultiplier = 1,
    atrPercent,
    tpPercent,
    slPercent,
  } = params;

  const userTpPercent = explicitUserTp ?? tpPercent ?? 10.0;
  const userSlPercent = explicitUserSl ?? slPercent ?? 2.0;
  const atr24hPercent = explicitAtr24 ?? atrPercent;

  const walletBalance = Math.max(10, rawBalance || 2000);
  const entryPrice = Math.max(0.000001, rawEntry || 100);
  const userMargin = Math.max(10, Math.min(walletBalance, rawMargin || 150));
  const userLeverage = Math.max(1, Math.min(125, rawLeverage || 25));
  const isLong = direction === 'LONG';

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. PART 1: USER'S CUSTOM RULES (ငါ့စည်းမျဉ်း)
  // ─────────────────────────────────────────────────────────────────────────────
  const userNotional = userMargin * userLeverage;
  const userMarginPctOfBalance = (userMargin / walletBalance) * 100;
  const userLiqBufferPct = userLeverage > 1 ? 100 / userLeverage : 100;

  const userTpPrice = isLong
    ? entryPrice * (1 + userTpPercent / 100)
    : entryPrice * (1 - userTpPercent / 100);

  const userSlPrice = isLong
    ? entryPrice * (1 - userSlPercent / 100)
    : entryPrice * (1 + userSlPercent / 100);

  const userLiqPrice = isLong
    ? entryPrice * (1 - userLiqBufferPct / 100)
    : entryPrice * (1 + userLiqBufferPct / 100);

  const userDollarProfit = userNotional * (userTpPercent / 100);
  const userDollarLoss = userNotional * (userSlPercent / 100);
  const userAccountGainPct = (userDollarProfit / walletBalance) * 100;
  const userAccountLossPct = (userDollarLoss / walletBalance) * 100;
  const userRR = userSlPercent > 0 ? userTpPercent / userSlPercent : 0;
  const userConsecutiveLosses =
    userAccountLossPct > 0 ? Math.floor(50 / userAccountLossPct) : 999;

  const userIsSafe =
    userMarginPctOfBalance <= 25 &&
    userAccountLossPct <= 3.0 &&
    userLeverage <= 30 &&
    userRR >= 1.5;

  let userWarningEn: string | undefined;
  let userWarningMy: string | undefined;

  if (userAccountLossPct > 4.0) {
    userWarningEn = `Risk at SL (${userAccountLossPct.toFixed(1)}%) is aggressive. Recommended limit is <= 1.5%.`;
    userWarningMy = `SL ဖြစ်ပေါ်ချိန် ဆုံးရှုံးမှု (${userAccountLossPct.toFixed(1)}%) သည် မြင့်မားနေပါသည်။ အကြံပြုထားသော ပမာဏမှာ <= 1.5% ဖြစ်သည်။`;
  } else if (userLeverage > 25) {
    userWarningEn = `Leverage ${userLeverage}x leaves a tight buffer (±${userLiqBufferPct.toFixed(1)}%). Normal market wicks can trigger liquidation.`;
    userWarningMy = `Leverage ${userLeverage}x ကြောင့် Liq Buffer (${userLiqBufferPct.toFixed(1)}%) ကျဉ်းမြောင်းနေသဖြင့် ပုံမှန် wicks ကြောင့် အန္တရာယ်ရှိနိုင်သည်။`;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PART 2: TECHNICAL AI RECOMMENDATION (မင်းရွေးချယ်မှု / စနစ်အကြံပြုချက်)
  // ─────────────────────────────────────────────────────────────────────────────
  // Determine baseline 24H ATR volatility spread
  const calculatedAtr =
    atr24hPercent !== undefined && atr24hPercent > 0
      ? atr24hPercent
      : Math.min(16, Math.max(3.2, Math.abs(change24h) * 1.5 + 3.8));

  const atrSpread = Number(calculatedAtr.toFixed(1));

  // Noise-immune recommended leverage:
  // Must ensure Liquidation Buffer >= 1.5x of 24H ATR
  const rawSafeLev = Math.floor(100 / (atrSpread * 1.5 * (1 / styleMultiplier)));
  const recLeverage = Math.min(20, Math.max(2, rawSafeLev || 8));
  const recLiqBufferPct = 100 / recLeverage;

  // Technical Stop Loss placed beyond daily noise (typically 0.45x ATR or structural support)
  const recSlPercent = Number((atrSpread * 0.45).toFixed(1)); // e.g. 2.5% to 3.4%
  const recTpPercent = Number((recSlPercent * 2.5).toFixed(1)); // Minimum 1:2.5 edge or 8.5% - 10.0%

  // Capital Preservation Margin:
  // Strict institutional 1.5% portfolio risk rule:
  // Risk Dollar = WalletBalance * 0.015
  // Risk Dollar = recMargin * recLeverage * (recSlPercent / 100)
  // => recMargin = (WalletBalance * 0.015) / (recLeverage * (recSlPercent / 100))
  const targetRiskDollar = walletBalance * 0.015;
  const calculatedRecMargin = Math.round(
    targetRiskDollar / (recLeverage * (recSlPercent / 100))
  );

  // Keep within reasonable bounds: at least $20, max 20% of account
  const recMargin = Math.max(
    20,
    Math.min(Math.round(walletBalance * 0.2), calculatedRecMargin)
  );

  const recNotional = recMargin * recLeverage;
  const recTpPrice = isLong
    ? entryPrice * (1 + recTpPercent / 100)
    : entryPrice * (1 - recTpPercent / 100);

  const recSlPrice = isLong
    ? entryPrice * (1 - recSlPercent / 100)
    : entryPrice * (1 + recSlPercent / 100);

  const recLiqPrice = isLong
    ? entryPrice * (1 - recLiqBufferPct / 100)
    : entryPrice * (1 + recLiqBufferPct / 100);

  const recDollarProfit = recNotional * (recTpPercent / 100);
  const recDollarLoss = recNotional * (recSlPercent / 100);
  const recAccountGainPct = (recDollarProfit / walletBalance) * 100;
  const recAccountLossPct = (recDollarLoss / walletBalance) * 100;
  const recRR = recSlPercent > 0 ? recTpPercent / recSlPercent : 2.5;

  const leverageLogicEn =
    userLeverage > recLeverage
      ? `Your chosen ${userLeverage}x leverage leaves a ${userLiqBufferPct.toFixed(
          1
        )}% buffer inside the 24H volatility spread (±${atrSpread}%). Reducing to recommended ${recLeverage}x widens the liquidation buffer to ±${recLiqBufferPct.toFixed(
          1
        )}% safely outside normal market noise.`
      : `Your chosen ${userLeverage}x leverage is conservative and respects the 24H volatility spread (±${atrSpread}%). Buffer is ±${userLiqBufferPct.toFixed(
          1
        )}%.`;

  const leverageLogicMy =
    userLeverage > recLeverage
      ? `သင်ရွေးချယ်ထားသော ${userLeverage}x Leverage သည် နေ့စဉ်ပုံမှန်လှုပ်ရှားမှု (${atrSpread}%) အတွင်း ကျရောက်နေသဖြင့် အကြံပြုထားသော ${recLeverage}x သို့ လျှော့ချခြင်းက Liquidation Buffer ကို ${recLiqBufferPct.toFixed(
          1
        )}% အထိ ကျယ်ပြန့်စေပါသည်။`
      : `သင်ရွေးချယ်ထားသော ${userLeverage}x Leverage သည် နေ့စဉ်ပုံမှန်လှုပ်ရှားမှု (${atrSpread}%) ပြင်ပတွင်ရှိပြီး အန္တရာယ်ကင်းသော Liq Buffer (±${userLiqBufferPct.toFixed(
          1
        )}%) ကို ထိန်းသိမ်းထားပါသည်။`;

  return {
    walletBalance,
    direction,
    isLong,
    entryPrice,
    user: {
      notional: userNotional,
      marginPctOfBalance: userMarginPctOfBalance,
      liqBufferPct: userLiqBufferPct,
      tpPercent: userTpPercent,
      slPercent: userSlPercent,
      tpPrice: userTpPrice,
      slPrice: userSlPrice,
      liqPrice: userLiqPrice,
      dollarProfit: userDollarProfit,
      dollarLoss: userDollarLoss,
      accountGainPct: userAccountGainPct,
      accountLossPct: userAccountLossPct,
      riskReward: userRR,
      consecutiveLossesTo50Pct: userConsecutiveLosses,
      isSafe: userIsSafe,
      warningText: userWarningEn,
      warningTextMy: userWarningMy,
      allRulesPass: userIsSafe,
      lossPctOfBalance: userAccountLossPct,
      gainPctOfBalance: userAccountGainPct,
    },
    technical: {
      atrSpread,
      recommendedMargin: recMargin,
      recommendedLeverage: recLeverage,
      recommendedTpPercent: recTpPercent,
      recommendedSlPercent: recSlPercent,
      recommendedTpPrice: recTpPrice,
      recommendedSlPrice: recSlPrice,
      recommendedLiqPrice: recLiqPrice,
      recommendedLiqBufferPct: recLiqBufferPct,
      recommendedNotional: recNotional,
      recommendedDollarProfit: recDollarProfit,
      recommendedDollarLoss: recDollarLoss,
      recommendedAccountGainPct: recAccountGainPct,
      recommendedAccountLossPct: recAccountLossPct,
      riskReward: recRR,
      leverageLogic: leverageLogicEn,
      leverageLogicMy,
    },
    userPlan: {
      allRulesPass: userIsSafe,
      marginPctOfBalance: userMarginPctOfBalance,
      lossPctOfBalance: userAccountLossPct,
      gainPctOfBalance: userAccountGainPct,
      consecutiveLossesTo50Pct: userConsecutiveLosses,
      notional: userNotional,
      dollarLoss: userDollarLoss,
      dollarProfit: userDollarProfit,
      riskReward: userRR,
    },
    technicalAnalysis: {
      recommendedMargin: recMargin,
      recommendedLeverage: recLeverage,
      recommendedNotional: recNotional,
      recommendedDollarLoss: recDollarLoss,
      recommendedDollarProfit: recDollarProfit,
      leverageReasoning: leverageLogicEn,
      leverageReasoningMy: leverageLogicMy,
      riskReward: recRR,
    },
  };
}
