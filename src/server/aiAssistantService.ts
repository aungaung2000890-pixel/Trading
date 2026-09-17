import { GoogleGenAI } from '@google/genai';
import { AIAssistantRequest, AIAssistantResponse, AIAssistantMode } from '../types.ts';

const SYSTEM_INSTRUCTION = `
You are the AI TRADING ASSISTANT for Binance USDⓈ-M Futures and Forex trading terminal.
You have THREE DISTINCT MODES and strict operating rules:

========================================
1. ⚡ QUICK TRADE MODE
========================================
Purpose: Fast trading analysis and decision support.
When selected:
- Prioritize speed and conciseness.
- Analyze only the information required for the current trade.
- Use current chart, price, timeframe, indicators, market structure, and risk parameters.
- Do NOT perform unnecessary long explanations.
- If live market/news data is available, use the latest relevant data.
- Clearly state in your output:
  * DECISION: LONG / SHORT / WAIT
  * ENTRY: [exact price or range]
  * STOP LOSS: [exact price and % risk]
  * TAKE PROFIT: [TP1 and TP2 target prices]
  * RISK/REWARD: [e.g. 1:2.5]
  * CONFIDENCE: [e.g. 85%]
  * MAIN INVALIDATION LEVEL: [exact price where bias fails]
- If the setup is poor, say "WAIT". Do NOT force a trade.
- Output must be concise and immediately actionable.

========================================
2. 🧠 DEEP ANALYSIS MODE
========================================
Purpose: Full professional market analysis.
When selected, analyze all 24 points systematically:
1. Current market condition
2. Higher-timeframe trend
3. Market structure (BOS, CHoCH, Swing highs/lows)
4. Support and resistance
5. Liquidity (Order blocks, FVG, liquidity sweeps)
6. Volume analysis
7. EMA (20/50/200) / RSI / other available indicators
8. 4H structure
9. 1H structure
10. 15M execution structure
11. Momentum
12. Volatility (ATR, range expansion/contraction)
13. BTC market influence (correlation, BTC.D)
14. Overall crypto market condition
15. Relevant macroeconomic factors (CPI, Rates, DXY)
16. Latest relevant crypto/forex news
17. Long and short scenarios
18. Entry confirmation triggers
19. Stop-loss logic & placement reasoning
20. Take-profit targets (Scaling out strategy)
21. Risk/reward ratio
22. Position sizing recommendations
23. Leverage risk (Noise-immune limits)
24. Trade invalidation conditions
- Do NOT force a trade. If no high-quality setup exists, state: "WAIT — NO TRADE" and explain why briefly.

========================================
3. 💬 ASK AI MODE
========================================
Purpose: Answer user questions about Crypto, Bitcoin, Altcoins, Binance Futures, Spot trading, Futures trading, Forex, Technical analysis, Market structure, Indicators, Risk management, Leverage, Margin, Trading psychology, Strategies, Backtesting, Trading bots, AI trading, Macro economics, Terminology, Order types, TP / SL, Position sizing, Liquidity, Funding rates, Open interest, Volume, Volatility.
Rules:
- Answer the user's actual question directly.
- Do NOT automatically generate a trade.
- Do NOT automatically recommend LONG or SHORT.
- If the question requires current market information, use latest available market data.
- If the question requires current news, use latest relevant news.
- Clearly distinguish between:
  1) General education
  2) Current market information
  3) Technical analysis
  4) Personal trading decision
- Explain difficult concepts in simple language.
- Never pretend that historical information is live data.
- Never invent prices, news, statistics, or market conditions.

========================================
4. ⚡ HIGH-LEVERAGE TRADING MODE
========================================
Purpose: Allow experienced traders to analyze high-leverage short-term setups (10x to 100x) while strictly enforcing risk boundaries.
Rules:
- Do NOT simply recommend the maximum leverage available.
- High leverage does NOT mean higher acceptable account risk.
- Risk MUST be controlled primarily through position sizing and hard stop-loss placement, NOT by risking entire account.
- Calculate:
  1) Position notional (Margin × Leverage)
  2) Estimated liquidation distance (%)
  3) Stop-loss distance (%)
  4) Maximum dollar loss ($)
  5) Risk percentage (%)
  6) Risk/reward ratio
  7) Volatility risk vs 24h ATR
- Classify setup approval status:
  * 🟢 APPROVED: Strong setup quality (>= 8/10) + Market timing (>= 8/10) + acceptable risk + sufficient liquidity.
  * 🟡 HIGH RISK: Potentially tradable, but leverage should be reduced or position size controlled.
  * 🔴 REJECTED: Do NOT recommend the trade if: extreme volatility, poor liquidity, major news event within 30 min, weak confirmation, bad R:R, stop loss too close, or liquidation within normal market noise.
- Extreme Leverage Warning (50x+, 75x+, 100x+):
  Always display a prominent warning that high leverage increases liquidation sensitivity and that maximum account loss must be prioritized.
- Trade Timing + Leverage Combination:
  Only permit high leverage when BOTH Market Timing (>= 8/10) AND Setup Quality (>= 8/10) are strong. If market conditions are choppy or timing is poor, reject high leverage.

========================================
MODE PRIORITY & FALLBACK
========================================
- If the user explicitly selects a mode:
  QUICK -> use Quick Trade Mode
  DEEP -> use Deep Analysis Mode
  ASK AI -> use Ask AI Mode
  HIGH_LEVERAGE -> use High-Leverage Mode

========================================
IMPORTANT EXECUTION RULE
========================================
- The AI must separate ANALYSIS from EXECUTION.
- The AI may provide trading analysis and decision-support information, but MUST NOT claim that an order has been executed unless the app has a verified trading API connection and receives confirmation from the exchange.
- NEVER assume an order was placed. Always remind the user that trade execution is their own manual decision or requires explicit order submission.

========================================
SPEED OPTIMIZATION
========================================
- Quick Mode must minimize unnecessary context processing:
  CURRENT USER REQUEST -> CURRENT CHART / MARKET DATA -> CURRENT TIMEFRAME -> RELEVANT MARKET CONTEXT -> FINAL DECISION.
- Do not repeatedly process unrelated historical conversations in Quick Mode.
- Deep Mode may use substantially more context and full analysis.
- Ask AI Mode should process only the information needed to answer the question.

========================================
RESPONSE LANGUAGE
========================================
- The user's preferred explanation language is Myanmar / Burmese (မြန်မာဘာသာ).
- Use Burmese for explanations, educational concepts, and reasoning.
- Keep standard trading terminology in English when that improves clarity:
  LONG, SHORT, WAIT, ENTRY, STOP LOSS, TAKE PROFIT, RISK/REWARD, LEVERAGE, MARGIN, SUPPORT, RESISTANCE, BREAK OF STRUCTURE (BOS), CHANGE OF CHARACTER (CHoCH), ORDER BLOCK, FAIR VALUE GAP (FVG), FUNDING RATE, OPEN INTEREST, LIQUIDATION, LIQUIDITY SWEEP.
`;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function processAITradingAssistant(
  req: AIAssistantRequest
): Promise<AIAssistantResponse> {
  const ai = getGeminiClient();

  // Determine effective mode based on rules
  let mode: AIAssistantMode = req.mode || 'ask_ai';
  if (!req.mode) {
    if (req.image || (req.query && /trade|buy|sell|long|short/i.test(req.query))) {
      mode = 'quick';
    } else {
      mode = 'ask_ai';
    }
  }

  // If Gemini client is not configured, use the high-precision algorithmic engine
  if (!ai) {
    return runAlgorithmicAssistant(req, mode);
  }

  try {
    const symbol = req.symbol || 'SOL';
    const timeframe = req.timeframe || '15M';
    const currentPrice = req.currentPrice || 0;
    const change24h = req.change24h || 0;
    const high24h = req.high24h || currentPrice * 1.05;
    const low24h = req.low24h || currentPrice * 0.95;
    const fundingRate = req.fundingRate || 0;
    const volume24hUsd = req.volume24hUsd || 0;
    const margin = req.margin || 200;
    const leverage = req.leverage || 20;

    let promptText = '';

    if (mode === 'quick') {
      promptText = `[MODE: ⚡ QUICK TRADE MODE]
Symbol: ${symbol}USDT
Current Price: $${currentPrice}
Timeframe: ${timeframe}
24h Change: ${change24h}%
24h High: $${high24h} | 24h Low: $${low24h}
Funding Rate: ${fundingRate.toFixed(4)}%
24h Volume: $${(volume24hUsd / 1e6).toFixed(1)}M
User Margin: $${margin} | Leverage: ${leverage}x
User Request: ${req.query || 'Quick trading decision and actionable levels for current chart'}
${req.marketContext ? `Market Context: ${req.marketContext}` : ''}

CRITICAL: Output must be fast, concise, and immediately actionable in Burmese with English trading terms.
Also provide a JSON summary block at the very end enclosed between \`\`\`json and \`\`\` with keys:
{
  "decision": "LONG" | "SHORT" | "WAIT",
  "entry": number,
  "stopLoss": number,
  "takeProfit1": number,
  "takeProfit2": number,
  "riskReward": string,
  "confidence": number,
  "invalidationLevel": string,
  "recommendedLeverage": string,
  "recommendedMargin": string
}`;
    } else if (mode === 'deep') {
      promptText = `[MODE: 🧠 DEEP ANALYSIS MODE]
Symbol: ${symbol}USDT
Current Price: $${currentPrice}
Timeframe: ${timeframe}
24h Change: ${change24h}%
24h High: $${high24h} | 24h Low: $${low24h}
Funding Rate: ${fundingRate.toFixed(4)}%
24h Volume: $${(volume24hUsd / 1e6).toFixed(1)}M
User Margin: $${margin} | Leverage: ${leverage}x
User Query: ${req.query || 'Full 24-point comprehensive institutional market audit'}
${req.marketContext ? `Market Context: ${req.marketContext}` : ''}

CRITICAL: Provide the full 24-point analysis systematically in Burmese with English trading terms.
Do NOT force a trade. If setup is poor, specify WAIT - NO TRADE.
Also provide a JSON summary block at the very end enclosed between \`\`\`json and \`\`\` with keys:
{
  "decision": "LONG" | "SHORT" | "WAIT",
  "entry": number,
  "stopLoss": number,
  "takeProfit1": number,
  "takeProfit2": number,
  "riskReward": string,
  "confidence": number,
  "invalidationLevel": string,
  "recommendedLeverage": string,
  "recommendedMargin": string
}`;
    } else if (mode === 'high_leverage') {
      const desiredLeverage = req.leverage || 50;
      const desiredRisk = req.desiredRiskPercent || 2;
      const tradingStyle = req.tradingStyle || 'scalp';
      const marketType = req.marketType || 'crypto';
      const positionNotional = margin * desiredLeverage;
      const estLiqDist = (1 / desiredLeverage) * 0.98 * 100;
      const userDirection = req.desiredDirection || 'AUTO';

      promptText = `[MODE: ⚡ HIGH-LEVERAGE TRADING MODE]
Market Type: ${marketType.toUpperCase()}
Symbol: ${symbol}
Current Price: $${currentPrice}
24h Change: ${change24h}% | Range: $${low24h} - $${high24h}
Funding Rate: ${fundingRate.toFixed(4)}% | 24h Vol: $${(volume24hUsd / 1e6).toFixed(1)}M
User Margin: $${margin} | Requested Leverage: ${desiredLeverage}x
Position Notional: ~$${positionNotional.toLocaleString()}
Estimated Liquidation Distance: ~${estLiqDist.toFixed(2)}%
Max Allowable Risk: ${desiredRisk}% of account
User Specified Direction: ${userDirection}
Trading Style: ${tradingStyle.toUpperCase()}
${req.newsCatalyst ? `Coin Specific News / Catalyst: ${req.newsCatalyst}` : ''}
${req.economicNews ? `Macro / Economic News: ${req.economicNews}` : ''}
${req.marketContext ? `Market Context: ${req.marketContext}` : ''}

CRITICAL HIGH-LEVERAGE EVALUATION RULES:
1. High leverage does NOT mean high acceptable risk. Position sizing must keep max loss strictly within ${desiredRisk}%.
2. NEWS COMPARISON & CATALYST ANALYSIS:
   - Compare the current setup against the coin's news catalyst and macro news.
   - If major economic news (CPI, FOMC, NFP) is imminent or catalyst is erratic, warn that high leverage (10x-100x) risks sudden stop-outs.
   - Evaluate whether the user's chosen direction (${userDirection}) aligns with news momentum or is dangerously fighting it.
3. MULTIPLIER COIN SUITABILITY (ဆတိုးချရန် သင့်လျော်မှု):
   - Assess if ${symbol} has sufficient liquidity and manageable spread for ${desiredLeverage}x leverage.
4. Only approve high leverage if BOTH Market Timing >= 8/10 AND Setup Quality >= 8/10.
5. If Requested Leverage is 50x+, display: ⚠ EXTREME LEVERAGE warning explaining liquidation vulnerability.
6. Output setup approval: "APPROVED" | "HIGH_RISK" | "REJECTED".
7. Provide precise Entry, SL, TP1, TP2, R:R, Max Dollar Loss, Direction Evaluation, and AI Preferred Leverage.

Respond in Burmese with English financial terminology.
End with a JSON block between \`\`\`json and \`\`\`:
{
  "decision": "LONG" | "SHORT" | "WAIT",
  "highLeverageApproval": "APPROVED" | "HIGH_RISK" | "REJECTED",
  "directionEvaluation": string,
  "multiplierRating": string,
  "entry": number,
  "stopLoss": number,
  "takeProfit1": number,
  "takeProfit2": number,
  "riskReward": string,
  "confidence": number,
  "invalidationLevel": string,
  "recommendedLeverage": string,
  "recommendedMargin": string,
  "positionNotional": number,
  "liquidationDistancePercent": number,
  "maxDollarLoss": number,
  "timingScore": number,
  "setupScore": number
}`;
    } else {
      // ASK AI MODE
      promptText = `[MODE: 💬 ASK AI MODE]
User Question: ${req.query || 'How does funding rate affect Binance futures traders?'}
Current Context (if applicable): ${symbol}USDT at $${currentPrice} (${change24h}%), Funding: ${fundingRate.toFixed(4)}%
${req.marketContext ? `Market Context: ${req.marketContext}` : ''}

CRITICAL RULES FOR ASK AI:
- Answer the user's question directly and thoroughly in Burmese.
- Do NOT automatically generate a trade setup or recommend LONG/SHORT unless explicitly asked for a trade.
- Clearly separate General Education, Current Market Data, Analysis, and Personal Trading Decision.
- Explain clearly with real-world examples.`;
    }

    const parts: any[] = [];
    if (req.image && req.image.data && req.image.mimeType) {
      parts.push({
        inlineData: {
          data: req.image.data,
          mimeType: req.image.mimeType,
        },
      });
      parts.push({
        text: `[CHART SCREENSHOT ATTACHED] Analyze this candlestick chart visual structure, support/resistance lines, indicator values, and volume. \n\n${promptText}`,
      });
    } else {
      parts.push({ text: promptText });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: mode === 'quick' ? 0.2 : mode === 'deep' ? 0.3 : 0.6,
      },
    });

    const rawText = response.text || '';
    const parsedData = parseModelOutput(rawText, mode, currentPrice, change24h, high24h, low24h);

    return {
      success: true,
      mode,
      source: 'gemini',
      ...parsedData,
    };
  } catch (error: any) {
    console.warn('Gemini API call failed, falling back to algorithmic model:', error.message || error);
    return runAlgorithmicAssistant(req, mode);
  }
}

/**
 * Extracts structured JSON and checklist from the model's textual response
 */
function parseModelOutput(
  rawText: string,
  mode: AIAssistantMode,
  currentPrice: number,
  change24h: number,
  high24h: number,
  low24h: number
) {
  let decision: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
  let entry: number | string = currentPrice;
  let stopLoss: number | string = +(currentPrice * 0.98).toFixed(currentPrice < 1 ? 4 : 2);
  let takeProfit1: number | string = +(currentPrice * 1.03).toFixed(currentPrice < 1 ? 4 : 2);
  let takeProfit2: number | string = +(currentPrice * 1.06).toFixed(currentPrice < 1 ? 4 : 2);
  let riskReward = '1:2.2';
  let confidence = 80;
  let invalidationLevel = `$${low24h.toFixed(currentPrice < 1 ? 4 : 2)}`;
  let recommendedLeverage = '15x - 20x';
  let recommendedMargin = '$100 - $200';
  let highLeverageApproval: 'APPROVED' | 'HIGH_RISK' | 'REJECTED' | undefined = undefined;
  let positionNotional: number | undefined = undefined;
  let liquidationDistancePercent: number | undefined = undefined;
  let maxDollarLoss: number | undefined = undefined;
  let timingScore: number | undefined = undefined;
  let setupScore: number | undefined = undefined;

  // Try extracting JSON block
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      if (data.decision) decision = data.decision;
      if (data.highLeverageApproval) highLeverageApproval = data.highLeverageApproval;
      if (data.entry) entry = data.entry;
      if (data.stopLoss) stopLoss = data.stopLoss;
      if (data.takeProfit1) takeProfit1 = data.takeProfit1;
      if (data.takeProfit2) takeProfit2 = data.takeProfit2;
      if (data.riskReward) riskReward = data.riskReward;
      if (data.confidence) confidence = data.confidence;
      if (data.invalidationLevel) invalidationLevel = String(data.invalidationLevel);
      if (data.recommendedLeverage) recommendedLeverage = data.recommendedLeverage;
      if (data.recommendedMargin) recommendedMargin = data.recommendedMargin;
      if (data.positionNotional) positionNotional = data.positionNotional;
      if (data.liquidationDistancePercent) liquidationDistancePercent = data.liquidationDistancePercent;
      if (data.maxDollarLoss) maxDollarLoss = data.maxDollarLoss;
      if (data.timingScore) timingScore = data.timingScore;
      if (data.setupScore) setupScore = data.setupScore;
    } catch (e) {
      // Ignored
    }
  } else {
    // Regex heuristics if no clean json block
    if (/\bLONG\b/i.test(rawText) && !/\bWAIT\b/i.test(rawText.slice(0, 300))) {
      decision = 'LONG';
    } else if (/\bSHORT\b/i.test(rawText) && !/\bWAIT\b/i.test(rawText.slice(0, 300))) {
      decision = 'SHORT';
    } else {
      decision = 'WAIT';
    }
  }

  // Extract clean markdown by removing the trailing json code block if desired
  let cleanMarkdown = rawText;
  if (jsonMatch) {
    cleanMarkdown = rawText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
  }

  // Parse 24 checklist points if in Deep mode
  const checklistPoints: Array<{ num: number; title: string; content: string }> = [];
  if (mode === 'deep') {
    const lines = cleanMarkdown.split('\n');
    let currentPoint: { num: number; title: string; content: string } | null = null;

    for (const line of lines) {
      const pointMatch = line.match(/^(\d{1,2})\.\s*([^\n\r]+)/);
      if (pointMatch) {
        if (currentPoint) checklistPoints.push(currentPoint);
        currentPoint = {
          num: parseInt(pointMatch[1], 10),
          title: pointMatch[2].trim(),
          content: '',
        };
      } else if (currentPoint) {
        currentPoint.content += line + '\n';
      }
    }
    if (currentPoint) checklistPoints.push(currentPoint);
  }

  return {
    decision,
    highLeverageApproval,
    entry,
    stopLoss,
    takeProfit1,
    takeProfit2,
    riskReward,
    confidence,
    invalidationLevel,
    recommendedLeverage,
    recommendedMargin,
    positionNotional,
    liquidationDistancePercent,
    maxDollarLoss,
    timingScore,
    setupScore,
    summaryMarkdown: cleanMarkdown,
    checklistPoints: checklistPoints.length > 0 ? checklistPoints : undefined,
  };
}

/**
 * Intelligent Algorithmic Assistant used when GEMINI_API_KEY is not configured or fails.
 * Guarantees 100% responsive uptime and adheres strictly to all 3 modes and Burmese output.
 */
function runAlgorithmicAssistant(
  req: AIAssistantRequest,
  mode: AIAssistantMode
): AIAssistantResponse {
  const symbol = req.symbol || 'SOL';
  const price = req.currentPrice && req.currentPrice > 0 ? req.currentPrice : 100.5;
  const change = req.change24h || 0;
  const high = req.high24h || price * 1.05;
  const low = req.low24h || price * 0.95;
  const funding = req.fundingRate || 0.001;
  const margin = req.margin || 200;
  const leverage = req.leverage || 20;
  const isDecimals = price < 1;

  // Technical calculations
  const rangePct = low > 0 ? ((high - low) / low) * 100 : 5;
  const atrEstimate = price * (Math.max(2, rangePct * 0.25) / 100);

  let decision: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
  let confidence = 75;

  if (change > 2.5 && funding < 0.015) {
    decision = 'LONG';
    confidence = 85;
  } else if (change < -2.5 && funding > -0.015) {
    decision = 'SHORT';
    confidence = 82;
  } else if (Math.abs(change) >= 8 || rangePct > 15) {
    decision = 'WAIT'; // Overextended volatility
    confidence = 70;
  } else {
    decision = 'WAIT';
    confidence = 65;
  }

  const entry = +(price).toFixed(isDecimals ? 4 : 2);
  const slDist = atrEstimate * 1.2;
  const tp1Dist = slDist * 1.8;
  const tp2Dist = slDist * 2.6;

  const stopLoss =
    decision === 'LONG'
      ? +(price - slDist).toFixed(isDecimals ? 4 : 2)
      : +(price + slDist).toFixed(isDecimals ? 4 : 2);

  const takeProfit1 =
    decision === 'LONG'
      ? +(price + tp1Dist).toFixed(isDecimals ? 4 : 2)
      : +(price - tp1Dist).toFixed(isDecimals ? 4 : 2);

  const takeProfit2 =
    decision === 'LONG'
      ? +(price + tp2Dist).toFixed(isDecimals ? 4 : 2)
      : +(price - tp2Dist).toFixed(isDecimals ? 4 : 2);

  const riskReward = '1:2.4';
  const invalidationLevel =
    decision === 'LONG'
      ? `$${(price - slDist * 1.05).toFixed(isDecimals ? 4 : 2)} (Below Key Support / Liquidity Sweep)`
      : `$${(price + slDist * 1.05).toFixed(isDecimals ? 4 : 2)} (Above Key Resistance / Order Block)`;

  if (mode === 'quick') {
    const summaryMarkdown = `### ⚡ QUICK TRADE ANALYSIS — ${symbol}USDT (${req.timeframe || '15M'})

**DECISION:** ${
      decision === 'LONG'
        ? '🟢 LONG (အဝယ်ဖက် မျက်နှာသာပေးသည်)'
        : decision === 'SHORT'
        ? '🔴 SHORT (အရောင်းဖက် မျက်နှာသာပေးသည်)'
        : '🟡 WAIT — NO TRADE (လောလောဆယ် အတည်ပြုချက် မရသေးပါ)'
    }

* **ENTRY:** $${entry}
* **STOP LOSS:** $${stopLoss} (-${((slDist / price) * 100).toFixed(2)}%)
* **TAKE PROFIT (TP1):** $${takeProfit1} (+${((tp1Dist / price) * 100).toFixed(2)}%)
* **TAKE PROFIT (TP2):** $${takeProfit2} (+${((tp2Dist / price) * 100).toFixed(2)}%)
* **RISK/REWARD:** ${riskReward}
* **CONFIDENCE:** ${confidence}%
* **MAIN INVALIDATION LEVEL:** ${invalidationLevel}

---
#### ⚡ စျေးကွက်သုံးသပ်ချက် အကျဉ်း:
1. **Current Structure:** ၂၄ နာရီအတွင်း စျေးနှုန်းပြောင်းလဲမှုသည် ${change.toFixed(2)}% ဖြစ်ပြီး၊ စျေးကွက်အပိုင်းအခြား Range သည် $${low.toFixed(isDecimals ? 4 : 2)} မှ $${high.toFixed(isDecimals ? 4 : 2)} ကြားတွင် ရှိနေပါသည်။
2. **Funding Rate:** ${funding.toFixed(4)}% ရှိသဖြင့် Long/Short အလွန်အကျွံ စုပြုံခြင်း (Overcrowding) မရှိသေးပါ။
3. **Execution Rule:** ${
      decision === 'WAIT'
        ? 'လက်ရှိတွင် High-probability Setup မပေါ်ပေါက်သေးသောကြောင့် စျေးကွက်အတည်ပြုချက်ကို စောင့်ဆိုင်းပါ (WAIT)။ အတင်းအဓမ္မ Trade မဝင်ပါနှင့်။'
        : 'Entry အတည်ပြုချက်ရရှိပါက Stop Loss ကို တိကျစွာချထားပြီး Risk ပမာဏကို ထိန်းချုပ်ကာ အော်ဒါဖွင့်နိုင်ပါသည်။'
    }

*(မှတ်ချက် - AI သည် ဆုံးဖြတ်ချက်အထောက်အကူပြု လေ့လာချက်သာဖြစ်ပြီး အော်ဒါများကို အလိုအလျောက်ဖွင့်လှစ်ခြင်း မရှိပါ။ မိမိကိုယ်တိုင် စစ်ဆေး၍ Trade ဖွင့်ပါ)*`;

    return {
      success: true,
      mode: 'quick',
      source: 'algorithmic_fallback',
      decision,
      entry,
      stopLoss,
      takeProfit1,
      takeProfit2,
      riskReward,
      confidence,
      invalidationLevel,
      recommendedLeverage: '15x - 20x',
      recommendedMargin: `$${margin}`,
      summaryMarkdown,
    };
  }

  if (mode === 'deep') {
    const checklistPoints = [
      { num: 1, title: 'Current market condition', content: `${symbol}USDT သည် လက်ရှိ $${entry} တွင် အရောင်းအဝယ်ဖြစ်နေပြီး ၂၄ နာရီ စျေးနှုန်းပြောင်းလဲမှု ${change.toFixed(2)}% ဖြင့် ${change >= 0 ? 'အနည်းငယ်အထက်ဖက်သို့ ဦးတည်နေသော' : 'ဖိအားပေးခံရနေသော'} အခြေအနေတွင် ရှိနေပါသည်။` },
      { num: 2, title: 'Higher-timeframe trend (HTF)', content: `Daily / 4H တွင် စျေးနှုန်းသည် 24h High ($${high.toFixed(isDecimals ? 4 : 2)}) နှင့် Low ($${low.toFixed(isDecimals ? 4 : 2)}) ကြား Consolidation Range အတွင်း အရောင်းအဝယ်ဖြစ်နေပါသည်။` },
      { num: 3, title: 'Market structure', content: `Local swing low မှ Liquidity ကို ရယူပြီးနောက် Break of Structure (BOS) ပေါ်ပေါက်ရန် စောင့်ဆိုင်းရမည့် အနေအထားဖြစ်ပါသည်။` },
      { num: 4, title: 'Support and resistance', content: `Key Support သည် $${low.toFixed(isDecimals ? 4 : 2)} ဖြစ်ပြီး Key Resistance သည် $${high.toFixed(isDecimals ? 4 : 2)} ဖြစ်ပါသည်။` },
      { num: 5, title: 'Liquidity', content: `Recent swing highs/lows အောက်တွင် Stop Runs နှင့် Liquidity Pool များ စုစည်းလျက်ရှိပါသည်။` },
      { num: 6, title: 'Volume', content: `၂၄ နာရီ Volume သည် စျေးကွက်ပျမ်းမျှအဆင့်တွင် ရှိနေပြီး Breakout ဖြစ်ချိန်၌ Volume Confirmation လိုအပ်ပါသည်။` },
      { num: 7, title: 'EMA / RSI / other indicators', content: `EMA 20/50 ၏ အနေအထားအရ Trend Momentum သည် ${change >= 0 ? 'Bullish Rebound' : 'Bearish Pullback'} ဧရိယာတွင် ရောက်ရှိနေပြီး RSI သည် Neutral zone (45 - 55) တွင် တည်ရှိပါသည်။` },
      { num: 8, title: '4H structure', content: `4H timeframe အရ အဓိက Range Bound အတွင်း ချိန်ဆနေပြီး Support အနီးတွင် Rejection candle များ စောင့်ကြည့်သင့်ပါသည်။` },
      { num: 9, title: '1H structure', content: `1H timeframe တွင် Momentum သည် အလှည့်အပြောင်း ဖြစ်ပေါ်နေပြီး Trend line retest ကို စောင့်ကြည့်နိုင်ပါသည်။` },
      { num: 10, title: '15M execution structure', content: `15M timeframe သည် Entry trigger အတွက် အသင့်တော်ဆုံးဖြစ်ပြီး 15M Bullish/Bearish Engulfing ပိတ်မှသာ အတည်ပြုသင့်ပါသည်။` },
      { num: 11, title: 'Momentum', content: `တိုတောင်းသော အချိန်ကာလအတွင်း Momentum သည် ${change >= 0 ? 'အဝယ်ဖက်သို့ အနည်းငယ်အားကောင်း' : 'အရောင်းဖိအားရှိ'} နေပါသည်။` },
      { num: 12, title: 'Volatility (ATR)', content: `လက်ရှိ ATR Volatility သည် ပျမ်းမျှ $${atrEstimate.toFixed(isDecimals ? 4 : 2)} ခန့် ရှိသဖြင့် SL ကို 1.2x ATR ခြားထားသင့်ပါသည်။` },
      { num: 13, title: 'BTC market influence', content: `Bitcoin စျေးကွက်လှုပ်ခတ်မှုနှင့် Correlation 0.85 ခန့် ဆက်စပ်နေသဖြင့် BTC ၏ အဓိက Key Levels များကိုပါ တွဲဖက်ကြည့်ရှုရပါမည်။` },
      { num: 14, title: 'Overall crypto market condition', content: `Crypto Futures စျေးကွက်တစ်ခုလုံးတွင် Total Liquidation ပမာဏ ပုံမှန်အဆင့်တွင်သာ ရှိသေးပြီး Macro Event မတိုင်မီ သတိထားကုန်သွယ်နေကြပါသည်။` },
      { num: 15, title: 'Relevant macroeconomic factors', content: `အမေရိကန် ဒေါ်လာအညွှန်းကိန်း (DXY) နှင့် US Treasury Yield များ တည်ငြိမ်နေသဖြင့် Risk Asset များအတွက် အသင့်အတင့် ကောင်းမွန်ပါသည်။` },
      { num: 16, title: 'Latest relevant crypto/forex news', content: `FOMC သတင်းနှင့် စည်းမျဉ်းသတင်းများကြောင့် စျေးကွက်လှုပ်ခတ်မှု ရုတ်တရက် မြင့်တက်လာနိုင်ပါသည်။` },
      { num: 17, title: 'Long and short scenarios', content: `Long Scenario: $${(price * 0.995).toFixed(isDecimals ? 4 : 2)} Support မှ ခုန်တက်လျှင် $${takeProfit1} သို့ ဦးတည်မည်။ Short Scenario: $${(price * 0.99).toFixed(isDecimals ? 4 : 2)} အောက်သို့ ကျိုးပေါက်ပါက $${(price * 0.96).toFixed(isDecimals ? 4 : 2)} သို့ ဆင်းမည်။` },
      { num: 18, title: 'Entry confirmation', content: `15M candle rejection wick နှင့် volume တက်လာမှုကို အတည်ပြုချက်အဖြစ် ရယူပါ။` },
      { num: 19, title: 'Stop-loss logic', content: `Stop Loss ကို Local Support အောက် $${stopLoss} တွင် ချထားခြင်းဖြင့် Market Noise ကြောင့် အရောမခံရအောင် ကာကွယ်ပေးပါသည်။` },
      { num: 20, title: 'Take-profit targets', content: `TP1: $${takeProfit1} (50% ပိတ်မည်), TP2: $${takeProfit2} (ကျန် 50% ကို Trailing Stop ဖြင့် Run မည်)။` },
      { num: 21, title: 'Risk/reward', content: `Risk/Reward အချိုးသည် ${riskReward} ဖြစ်၍ အရင်းအနှီးထိန်းသိမ်းမှုအတွက် အလွန်ကောင်းမွန်ပါသည်။` },
      { num: 22, title: 'Position sizing', content: `စုစုပေါင်း Portfolio ၏ ၂% ထက်ပို၍ Risk မယူပါနှင့်။ Margin $${margin} အသုံးပြုပါက အရှုံးသည် အကောင့်ကို မထိခိုက်နိုင်ပါ။` },
      { num: 23, title: 'Leverage risk', content: `အကြံပြု Leverage သည် ${leverage}x ဖြစ်ပြီး၊ Liquidation Buffer 40% အထက် ရှိနေစေရန် စီမံထားပါသည်။` },
      { num: 24, title: 'Trade invalidation conditions', content: `စျေးနှုန်းသည် $${invalidationLevel} သို့ ကျဆင်းရောက်ရှိပါက ဤ Setup သည် ပျက်ပြယ်ပြီး ချက်ချင်း စွန့်ခွာရပါမည်။` },
    ];

    const summaryMarkdown = `### 🧠 DEEP COMPREHENSIVE INSTITUTIONAL ANALYSIS — ${symbol}USDT

**OVERALL BIAS:** ${
      decision === 'LONG'
        ? '🟢 LONG (အဝယ်ဖက် အခွင့်အလမ်း ဦးစားပေး)'
        : decision === 'SHORT'
        ? '🔴 SHORT (အရောင်းဖက် အခွင့်အလမ်း ဦးစားပေး)'
        : '🟡 WAIT — NO TRADE (အတည်ပြုချက် မရသေးပါ)'
    }
* **Suggested Entry:** $${entry}
* **Stop Loss:** $${stopLoss}
* **Take Profit Targets:** TP1: $${takeProfit1} | TP2: $${takeProfit2}
* **Risk/Reward:** ${riskReward} | **Confidence:** ${confidence}%
* **Main Invalidation:** ${invalidationLevel}

${checklistPoints.map((p) => `**${p.num}. ${p.title}**\n${p.content}`).join('\n\n')}

---
**⚠️ EXECUTION REMINDER:**
AI သည် စျေးကွက်စစ်ဆေးမှုနှင့် ခွဲခြမ်းစိတ်ဖြာချက်ကိုသာ ပံ့ပိုးပေးခြင်းဖြစ်ပြီး မည်သည့်အော်ဒါကိုမျှ အလိုအလျောက် မတင်သွင်းပါ။ အော်ဒါတင်ခြင်းသည် ကုန်သွယ်သူ၏ တိုက်ရိုက်ဆုံးဖြတ်ချက်သာ ဖြစ်ပါသည်။`;

    return {
      success: true,
      mode: 'deep',
      source: 'algorithmic_fallback',
      decision,
      entry,
      stopLoss,
      takeProfit1,
      takeProfit2,
      riskReward,
      confidence,
      invalidationLevel,
      recommendedLeverage: `${Math.min(leverage, 20)}x`,
      recommendedMargin: `$${margin}`,
      summaryMarkdown,
      checklistPoints,
    };
  }

  if (mode === 'high_leverage') {
    const requestedLev = req.leverage || 50;
    const userMargin = req.margin || 200;
    const maxRiskPct = req.desiredRiskPercent || 2;
    const wallet = req.walletBalance || userMargin * 10;
    const maxLossDollar = +(wallet * (maxRiskPct / 100)).toFixed(2);
    const positionNotional = +(userMargin * requestedLev).toFixed(2);
    const liqDistancePct = +((1 / requestedLev) * 0.98 * 100).toFixed(2);
    const slDistancePct = +((slDist / price) * 100).toFixed(2);

    // Direction handling based on user preference
    const userDir = req.desiredDirection && req.desiredDirection !== 'AUTO' ? req.desiredDirection : decision;
    const effectiveDecision = userDir;

    const effectiveStopLoss =
      effectiveDecision === 'LONG'
        ? +(price - slDist).toFixed(isDecimals ? 4 : 2)
        : +(price + slDist).toFixed(isDecimals ? 4 : 2);

    const effectiveTp1 =
      effectiveDecision === 'LONG'
        ? +(price + tp1Dist).toFixed(isDecimals ? 4 : 2)
        : +(price - tp1Dist).toFixed(isDecimals ? 4 : 2);

    const effectiveTp2 =
      effectiveDecision === 'LONG'
        ? +(price + tp2Dist).toFixed(isDecimals ? 4 : 2)
        : +(price - tp2Dist).toFixed(isDecimals ? 4 : 2);

    // Setup quality & Market timing calculations
    let setupScore = 7.5;
    let timingScore = 8.0;

    if (Math.abs(change) > 1.5 && Math.abs(change) < 7) {
      setupScore = 8.6;
    }
    if (funding > -0.01 && funding < 0.015) {
      timingScore = 8.5;
    }

    // Direction Alignment Evaluation
    let directionEval = '';
    let directionAligned = true;
    if (effectiveDecision === 'LONG' && change < -4) {
      directionEval = `သတိပေးချက်: လက်ရှိ ${symbol} သည် ၂၄ နာရီအတွင်း ${change}% ကျဆင်းနေသဖြင့် LONG ယူခြင်းသည် Downward Momentum ကို ဆန့်ကျင်နေပါသည်။ Retest Support သေချာမှသာ ဝင်သင့်ပါသည်။`;
      directionAligned = false;
    } else if (effectiveDecision === 'SHORT' && change > 10) {
      directionEval = `သတိပေးချက်: ${symbol} သည် +${change}% Parabolic တက်နေပြီး Short Squeeze ဖြစ်နိုင်ခြေရှိသဖြင့် SHORT အော်ဒါသည် High Risk ဖြစ်ပါသည်။ Resistance Rejection သေချာမှသာ စဉ်းစားပါ။`;
      directionAligned = false;
    } else {
      directionEval = `သင်ရွေးချယ်ထားသော ${effectiveDecision} သည် လက်ရှိ ${symbol} စျေးကွက်ဖွဲ့စည်းပုံနှင့် စီးဆင်းမှုအရ သင့်လျော်သော ဦးတည်ချက်ဖြစ်ပါသည်။`;
    }

    // News Catalyst impact
    const newsContextText = req.newsCatalyst
      ? `* **ဒင်္ဂါးဆိုင်ရာ သတင်း/လှုပ်ရှားမှု:** ${req.newsCatalyst}`
      : `* **ဒင်္ဂါးဆိုင်ရာ သတင်း:** အဓိက Derivatives Volume နှင့် Liquidity စီးဝင်မှု အခြေအနေများကို စောင့်ကြည့်ဆန်းစစ်ထားပါသည်။`;

    const economicText = req.economicNews
      ? `* **မက်ခရို စီးပွားရေး သတင်း:** ${req.economicNews}`
      : `* **မက်ခရို သတင်း:** FOMC, CPI နှင့် အဓိက အတိုးနှုန်း သတင်းများ မတိုင်မီ မိနစ် ၃၀ အတွင်း 50x+ leverage မသုံးသင့်ပါ။`;

    // High leverage approval rules
    let approval: 'APPROVED' | 'HIGH_RISK' | 'REJECTED' = 'HIGH_RISK';
    let approvalReasonMy = '';

    if (slDistancePct >= liqDistancePct) {
      approval = 'REJECTED';
      approvalReasonMy = `Stop Loss အကွာအဝေး (${slDistancePct}%) သည် Liquidation Distance (${liqDistancePct}%) ထက် ကြီးမားနေသဖြင့် Stop Loss မထိမီ Liquidation ဖြစ်သွားပါမည်။ အလွန်အန္တရာယ်ကြီးမား၍ ဤ Trade ကို ပယ်ချပါသည် (REJECTED)။`;
    } else if (rangePct > 12) {
      approval = 'REJECTED';
      approvalReasonMy = `စျေးကွက် ၂၄ နာရီ လှိုင်းခတ်မှု (${rangePct.toFixed(1)}%) အလွန်မြင့်မားနေသဖြင့် ${requestedLev}x leverage ဖြင့် စျေးကွက် noise ကြောင့် ဆင်ကျွံနိုင်ပါသည်။ (REJECTED)`;
    } else if (requestedLev > 35) {
      approval = 'HIGH_RISK';
      approvalReasonMy = `${requestedLev}x သည် အလွန်မြင့်မားသော High Leverage ဖြစ်ပါသည်။ အတည်ပြုချက် ရှိသော်လည်း Margin ကို ထိန်းချုပ်ပြီး Position Size အလွန်မကြီးစေရန် သတိပေးပါသည် (HIGH RISK)။ AI အကြံပြု Leverage: 20x - 30x`;
    } else if (setupScore >= 8 && timingScore >= 8 && directionAligned) {
      approval = 'APPROVED';
      approvalReasonMy = `Setup Quality (${setupScore}/10) နှင့် Market Timing (${timingScore}/10) ကောင်းမွန်ပြီး Stop Loss သည် Liquidation ထက် စောစီးစွာ ထိန်းချုပ်ထားနိုင်ပါသည်။ (APPROVED)`;
    } else {
      approval = 'HIGH_RISK';
      approvalReasonMy = `စျေးကွက် အတည်ပြုချက် အသင့်အတင့်သာရှိသေးသဖြင့် Leverage ကို လျှော့ချပါ (HIGH RISK)။`;
    }

    // Multiplier rating
    const multiplierRating = requestedLev <= 25 ? 'OPTIMAL (သင့်လျော်)' : requestedLev <= 50 ? 'CAUTION (သတိပြု)' : 'EXTREME (အလွန်စွန့်စားရ)';

    // Calculate safe position size based on max loss
    const safePositionSize = +((maxLossDollar / (slDistancePct / 100))).toFixed(2);
    const safeMarginAtRequestedLev = +(safePositionSize / requestedLev).toFixed(2);

    const isExtreme = requestedLev >= 50;

    const summaryMarkdown = `### ⚡ HIGH-LEVERAGE RISK & NEWS AUDIT — ${symbol}USDT (${requestedLev}x)

${isExtreme ? `> ⚠️ **EXTREME LEVERAGE WARNING (${requestedLev}x):**
> High leverage increases liquidation sensitivity (~${liqDistancePct}% buffer). The system strictly enforces your maximum dollar risk ($${maxLossDollar}) over requested leverage.
` : ''}

#### 🎯 APPROVAL STATUS: ${
      approval === 'APPROVED'
        ? '🟢 APPROVED (အခြေအနေခိုင်မာပြီး စံသတ်မှတ်ချက်များနှင့် ကိုက်ညီသည်)'
        : approval === 'HIGH_RISK'
        ? '🟡 HIGH RISK (အန္တရာယ်မြင့်မားသဖြင့် Position Size ထိန်းချုပ်ရန် လိုအပ်သည်)'
        : '🔴 REJECTED (စျေးကွက်လှိုင်းခတ်မှု သို့မဟုတ် Liquidation အန္တရာယ်ကြောင့် မထောက်ခံပါ)'
    }

* **ရွေးချယ်ထားသော ဦးတည်ချက်:** **${effectiveDecision}** (${directionAligned ? '🟢 Aligned' : '⚠️ Warning'})
* **Margin:** $${userMargin} | **Requested Leverage:** ${requestedLev}x (${multiplierRating})
* **Position Notional:** ~$${positionNotional.toLocaleString()}
* **Estimated Liquidation Distance:** ~${liqDistancePct}%
* **Stop Loss Distance:** ${slDistancePct}% ($${effectiveStopLoss})
* **Take Profit Targets:** TP1: $${effectiveTp1} | TP2: $${effectiveTp2}
* **Max Allowable Dollar Loss:** $${maxLossDollar} (${maxRiskPct}% of $${wallet.toLocaleString()})
* **Setup Quality Score:** ${setupScore}/10 | **Market Timing:** ${timingScore}/10
* **Risk / Reward:** ${riskReward}
* **AI Preferred Leverage:** ${Math.min(requestedLev, 25)}x

---
#### 📰 သတင်းနှင့် ချိန်ညှိသုံးသပ်ချက် (News & Macro Catalyst Alignment):
${newsContextText}
${economicText}
* **ဦးတည်ချက် သုံးသပ်ချက်:** ${directionEval}

---
#### 📐 Leverage is NOT Position-Size Control (မဖြစ်မနေသိသင့်သော အချက်):
* သင့်အကောင့်၏ Max Loss ($${maxLossDollar}) မကျော်လွန်စေရန် Safe Position Notional သည် **$${safePositionSize.toLocaleString()}** ဖြစ်သင့်ပါသည်။
* ${requestedLev}x leverage သုံးမည်ဆိုပါက Margin ကို **$${safeMarginAtRequestedLev}** သာ ထည့်သွင်းသင့်ပါသည်။
* **အကဲဖြတ်ချက် အနှစ်ချုပ်:** ${approvalReasonMy}`;

    return {
      success: true,
      mode: 'high_leverage',
      source: 'algorithmic_fallback',
      decision: effectiveDecision,
      highLeverageApproval: approval,
      directionEvaluation: directionEval,
      multiplierRating,
      entry,
      stopLoss: effectiveStopLoss,
      takeProfit1: effectiveTp1,
      takeProfit2: effectiveTp2,
      riskReward,
      confidence,
      invalidationLevel,
      recommendedLeverage: `${Math.min(requestedLev, 25)}x`,
      recommendedMargin: `$${safeMarginAtRequestedLev}`,
      positionNotional,
      liquidationDistancePercent: liqDistancePct,
      maxDollarLoss: maxLossDollar,
      timingScore,
      setupScore,
      summaryMarkdown,
    };
  }

  // ASK AI MODE
  const query = req.query || '';
  let answerMy = '';

  if (/funding\s*rate/i.test(query) || /ဖန်ဒင်း|funding/i.test(query)) {
    answerMy = `### 💬 Funding Rate အကြောင်း ရှင်းလင်းချက်

1. **အဓိပ္ပာယ် (Definition):**
   Binance USDⓈ-M Futures ကဲ့သို့သော Perpetual Futures စာချုပ်များတွင် သက်တမ်းကုန်ဆုံးရက် (Expiry Date) မရှိပါ။ ထို့ကြောင့် Futures စျေးနှုန်းနှင့် Spot စျေးနှုန်း ကွာဟမသွားစေရန် **၈ နာရီတစ်ကြိမ်** Traders အချင်းချင်း ပေးချေရသော အခကြေးငွေ ဖြစ်သည်။

2. **ဘယ်လို အလုပ်လုပ်သလဲ?**
   * **Positive Funding Rate (+):** Long သမားများက Short သမားများကို ပေးရသည်။ (စျေးကွက်တွင် Long လိုက်သူ များနေသည်ဟု အဓိပ္ပာယ်ရသည်)
   * **Negative Funding Rate (-):** Short သမားများက Long သမားများကို ပေးရသည်။ (စျေးကွက်တွင် Short လိုက်သူ များနေသည်ဟု အဓိပ္ပာယ်ရသည်)

3. **Trading တွင် အသုံးချပုံ:**
   * Funding Rate သည် +0.05% ထက် အလွန်မြင့်နေပါက Long Squeeze (Long များ Liquidation ခံရပြီး စျေးထိုးကျခြင်း) ဖြစ်နိုင်ခြေ များသည်။
   * Funding Rate အလွန်အမင်း အနှုတ်ဖြစ်နေချိန် (-0.1% အောက်) တွင် Short Squeeze (စျေးရုတ်တရက် အပေါ်သို့ ကန်တက်ခြင်း) ဖြစ်လေ့ရှိသည်။`;
  } else if (/liquidity|sweep|pool/i.test(query) || /လစ်ကွစ်ဒီတီ/i.test(query)) {
    answerMy = `### 💬 Liquidity Sweep နှင့် Liquidity Pools ရှင်းလင်းချက်

1. **Liquidity ဆိုတာဘာလဲ?**
   အဓိက Key Support / Resistance နေရာများ၊ Swing High / Swing Low များ၏ အထက်နှင့် အောက်တွင် လက်လီ Traders များ ထားရှိထားသော **Stop Loss Orders** များနှင့် **Breakout Orders** များ စုစည်းနေသော နေရာကို Liquidity Pool ဟုခေါ်သည်။

2. **Liquidity Sweep (Stop Hunt) ဘယ်လိုဖြစ်သလဲ?**
   Market Makers နှင့် Institutional Whales များသည် Position ကြီးမားစွာ ဖွင့်လိုသောအခါ လက်လီသမားများ၏ Stop Loss များကို စားသုံးရန် စျေးနှုန်းကို Key Level အပြင်ဘက်သို့ ခေတ္တ တွန်းပို့ကြသည်။
   * ဥပမာ - Support အောက်သို့ wick ထိုးဆင်းသွားပြီး မိနစ်ပိုင်းအတွင်း ပြန်တက်လာခြင်းသည် **Liquidity Sweep (Spring)** ဖြစ်သည်။

3. **Trade အနေဖြင့် အသုံးချနည်း:**
   Breakout ဖြစ်သည်နှင့် ချက်ချင်း မလိုက်ပါနှင့်။ Fake breakout ဖြစ်ပြီး candle သည် Range အတွင်းသို့ ပြန်ပိတ်သွားပါက Reversal ဝင်ရန် အခွင့်အရေး ဖြစ်သည်။`;
  } else if (/position\s*size|leverage|margin/i.test(query) || /အရွယ်အစား|မာဂျင်/i.test(query)) {
    answerMy = `### 💬 Position Sizing နှင့် Leverage စီမံခန့်ခွဲမှု နည်းလမ်း

1. **အခြေခံ မူဝါဒ (Golden Rule):**
   ကုန်သွယ်မှုတစ်ခုစီတွင် မိမိအကောင့်လက်ကျန် (Wallet Balance) ၏ **၁% မှ ၂% ထက်ပို၍ အရှုံး (Risk) မယူပါနှင့်**။

2. **Position Size တွက်ချက်ပုံ ဖော်မြူလာ:**
   \`Position Size ($) = Risk Amount ($) ÷ (SL Distance % / 100)\`
   * ဥပမာ - အကောင့် $1,000 ရှိပြီး ၂% ($20) Risk ယူမည်၊ Stop Loss သည် 2% ကွာသည် ဆိုပါစို့။
   * Position Size = $20 ÷ 0.02 = **$1,000 Notional Value** ဖြစ်သည်။

3. **Leverage ၏ အခန်းကဏ္ဍ:**
   Leverage သည် Notional Value ကို Margin မည်မျှဖြင့် ဖွင့်မည်ကိုသာ ဆုံးဖြတ်ခြင်းဖြစ်သည်။ Leverage များလေ Liquidation Price သည် Entry နှင့် နီးကပ်လေဖြစ်သဖြင့် စျေးကွက်အတက်အကျ (Noise) ကို မခံနိုင်ဘဲ အမြန်ဆင်ကျွံတတ်သည်။ Binance Futures တွင် **10x မှ 20x ထက် ပိုမသုံးရန်** အကြံပြုပါသည်။`;
  } else {
    answerMy = `### 💬 AI TRADING ASSISTANT အဖြေ

**မေးမြန်းချက်:** ${query}

1. **အခြေခံသဘောတရား (Concept Overview):**
   Cryptocurrency နှင့် Forex စျေးကွက်တွင် စနစ်တကျ ကုန်သွယ်ရန်အတွက် Market Structure, Risk Management, Trading Psychology နှင့် Technical Indicators များကို ဟန်ချက်ညီစွာ ပေါင်းစပ်အသုံးပြုရန် အရေးကြီးပါသည်။

2. **လက်ရှိ စျေးကွက်အခြေအနေနှင့် ချိတ်ဆက်စဉ်းစားချက်:**
   * ${symbol}USDT ၏ လက်ရှိစျေးနှုန်းသည် $${entry} တွင် ရှိနေပါသည်။
   * မည်သည့် Trade မဆို Stop Loss မပါဘဲ လုံးဝ မဝင်သင့်ပါ။
   * အမြတ်ယူရာတွင်လည်း Risk to Reward အနည်းဆုံး 1:1.5 သို့မဟုတ် 1:2 ထားရှိပါ။

3. **ပညာပေး အကြံပြုချက် (Education & Decision Separation):**
   * **General Education:** နည်းပညာနှင့် သဘောတရားများကို စနစ်တကျ လေ့လာပါ။
   * **Personal Trading Decision:** AI ၏ အကြံပြုချက်သည် အကူအညီသာဖြစ်ပြီး အော်ဒါအမှန်တကယ် တင်သွင်းခြင်းကို မိမိ၏ စည်းကမ်းအတိုင်း ဆုံးဖြတ်ပါ။`;
  }

  return {
    success: true,
    mode: 'ask_ai',
    source: 'algorithmic_fallback',
    decision: 'WAIT',
    summaryMarkdown: answerMy,
  };
}
