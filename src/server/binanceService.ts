import crypto from 'crypto';

export interface BinanceTradeRequest {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice?: number;
  slPrice: number;
  tpPrice: number;
  margin: number;
  leverage: number;
  orderType?: 'MARKET' | 'LIMIT';
  apiKey?: string;
  apiSecret?: string;
}

export interface BinanceStatusResult {
  connected: boolean;
  configured: boolean;
  testnet: boolean;
  latencyMs: number;
  serverTime: number;
  message?: string;
  account?: {
    totalWalletBalance: number;
    availableBalance: number;
    totalUnrealizedProfit: number;
    canTrade: boolean;
  };
}

export interface BinanceTradeExecutionResult {
  success: boolean;
  orderId: number | string;
  clientOrderId?: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryAction: 'BUY' | 'SELL';
  executedQty: number;
  avgPrice: number;
  leverage: number;
  margin: number;
  positionNotional: number;
  tp: {
    orderId: number | string;
    price: number;
    status: string;
    side: 'BUY' | 'SELL';
  };
  sl: {
    orderId: number | string;
    price: number;
    status: string;
    side: 'BUY' | 'SELL';
  };
  statusSteps: {
    connected: boolean;
    orderSent: boolean;
    orderFilled: boolean;
    tpPlaced: boolean;
    slPlaced: boolean;
  };
  timestamp: number;
}

function getBaseUrl(): string {
  return process.env.BINANCE_USE_TESTNET === 'true'
    ? 'https://testnet.binancefuture.com'
    : 'https://fapi.binance.com';
}

function getApiKey(): string | undefined {
  return process.env.BINANCE_API_KEY?.trim();
}

function getSecretKey(): string | undefined {
  return process.env.BINANCE_SECRET_KEY?.trim();
}

/**
 * Compute HMAC-SHA256 signature for Binance API query string
 */
function signQuery(params: Record<string, string | number | boolean>, secret: string): string {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  const signature = crypto.createHmac('sha256', secret).update(query).digest('hex');
  return `${query}&signature=${signature}`;
}

/**
 * Get Binance server time and calculate clock offset to prevent -1021 timestamp errors
 */
async function getServerTimeOffset(): Promise<number> {
  const baseUrl = getBaseUrl();
  const start = Date.now();
  const res = await fetch(`${baseUrl}/fapi/v1/time`);
  if (!res.ok) {
    return 0;
  }
  const data = (await res.json()) as { serverTime: number };
  const latency = (Date.now() - start) / 2;
  return data.serverTime - Date.now() + Math.round(latency);
}

/**
 * Check Binance connection & account status
 */
export async function testBinanceConnection(clientApiKey?: string, clientSecretKey?: string): Promise<BinanceStatusResult> {
  const baseUrl = getBaseUrl();
  const isTestnet = process.env.BINANCE_USE_TESTNET === 'true';
  const apiKey = clientApiKey || getApiKey();
  const secretKey = clientSecretKey || getSecretKey();

  const startPing = Date.now();
  let serverTime = Date.now();
  let pingLatency = 0;

  try {
    const timeRes = await fetch(`${baseUrl}/fapi/v1/time`);
    pingLatency = Date.now() - startPing;
    if (timeRes.ok) {
      const timeData = (await timeRes.json()) as { serverTime: number };
      serverTime = timeData.serverTime;
    }
  } catch (err: any) {
    return {
      connected: false,
      configured: Boolean(apiKey && secretKey),
      testnet: isTestnet,
      latencyMs: pingLatency,
      serverTime,
      message: `Failed to connect to Binance Futures API (${baseUrl}): ${err.message || 'Network error'}`,
    };
  }

  if (!apiKey || !secretKey) {
    return {
      connected: true,
      configured: false,
      testnet: isTestnet,
      latencyMs: pingLatency,
      serverTime,
      message:
        'Connected to Binance Futures public endpoint. API credentials (BINANCE_API_KEY, BINANCE_SECRET_KEY) are not yet configured in environment variables.',
    };
  }

  // Verify credentials by calling /fapi/v2/account
  try {
    const offset = await getServerTimeOffset();
    const timestamp = Date.now() + offset;
    const query = signQuery({ timestamp, recvWindow: 60000 }, secretKey);
    const accRes = await fetch(`${baseUrl}/fapi/v2/account?${query}`, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });

    if (!accRes.ok) {
      const errorData = await accRes.json().catch(() => ({}));
      return {
        connected: true,
        configured: true,
        testnet: isTestnet,
        latencyMs: pingLatency,
        serverTime,
        message: `Binance credentials rejected: ${errorData.msg || accRes.statusText} (Code: ${errorData.code || accRes.status})`,
      };
    }

    const accData = (await accRes.json()) as any;
    const totalWalletBalance = parseFloat(accData.totalWalletBalance || '0');
    const availableBalance = parseFloat(accData.availableBalance || '0');
    const totalUnrealizedProfit = parseFloat(accData.totalUnrealizedProfit || '0');
    const canTrade = accData.canTrade ?? true;

    return {
      connected: true,
      configured: true,
      testnet: isTestnet,
      latencyMs: pingLatency,
      serverTime,
      message: `Successfully authenticated with Binance USDⓈ-M Futures account (${isTestnet ? 'Testnet' : 'Live'})`,
      account: {
        totalWalletBalance,
        availableBalance,
        totalUnrealizedProfit,
        canTrade,
      },
    };
  } catch (err: any) {
    return {
      connected: true,
      configured: true,
      testnet: isTestnet,
      latencyMs: pingLatency,
      serverTime,
      message: `Error verifying account with Binance: ${err.message}`,
    };
  }
}

/**
 * Helper to fetch symbol exchange info and filters
 */
async function getSymbolFilters(symbol: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/fapi/v1/exchangeInfo`);
  if (!res.ok) {
    throw new Error(`Failed to fetch Binance exchangeInfo: ${res.statusText}`);
  }
  const data = (await res.json()) as any;
  const symbolInfo = data.symbols?.find((s: any) => s.symbol === symbol);
  if (!symbolInfo) {
    throw new Error(`Symbol ${symbol} is not found on Binance USDⓈ-M Futures.`);
  }
  if (symbolInfo.status !== 'TRADING') {
    throw new Error(`Symbol ${symbol} is currently not trading (Status: ${symbolInfo.status}).`);
  }

  const lotFilter = symbolInfo.filters?.find((f: any) => f.filterType === 'LOT_SIZE') || {};
  const priceFilter = symbolInfo.filters?.find((f: any) => f.filterType === 'PRICE_FILTER') || {};
  const notionalFilter =
    symbolInfo.filters?.find((f: any) => f.filterType === 'MIN_NOTIONAL') ||
    symbolInfo.filters?.find((f: any) => f.filterType === 'NOTIONAL') ||
    {};

  return {
    symbolInfo,
    minQty: parseFloat(lotFilter.minQty || '0.001'),
    maxQty: parseFloat(lotFilter.maxQty || '100000'),
    stepSize: lotFilter.stepSize || '0.001',
    tickSize: priceFilter.tickSize || '0.01',
    minNotional: parseFloat(notionalFilter.notional || notionalFilter.minNotional || '5.0'),
  };
}

function formatWithStep(val: number, stepSize: string): string {
  const precision = stepSize.indexOf('.') >= 0 ? stepSize.split('.')[1].replace(/0+$/, '').length : 0;
  const step = parseFloat(stepSize);
  const quantized = Math.floor(val / step) * step;
  return quantized.toFixed(precision);
}

function formatWithTick(val: number, tickSize: string): string {
  const precision = tickSize.indexOf('.') >= 0 ? tickSize.split('.')[1].replace(/0+$/, '').length : 0;
  const tick = parseFloat(tickSize);
  const quantized = Math.round(val / tick) * tick;
  return quantized.toFixed(precision);
}

/**
 * Execute Trade on Binance USDⓈ-M Futures:
 * 1. Validate parameters (symbol, side, margin, leverage, TP/SL direction)
 * 2. Set Leverage on Binance
 * 3. Calculate order quantity respecting LOT_SIZE & min notional
 * 4. Execute MARKET entry order
 * 5. Place Take Profit order
 * 6. Place Stop Loss order
 * 7. Return detailed execution summary
 */
export async function executeBinanceTrade(params: BinanceTradeRequest): Promise<BinanceTradeExecutionResult> {
  const apiKey = params.apiKey || getApiKey();
  const secretKey = params.apiSecret || getSecretKey();

  if (!apiKey || !secretKey) {
    throw new Error(
      'Binance API credentials missing. Please set BINANCE_API_KEY and BINANCE_SECRET_KEY in your environment variables.'
    );
  }

  const { side, margin, leverage, slPrice, tpPrice } = params;
  let symbol = params.symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!symbol.endsWith('USDT') && !symbol.endsWith('BUSD')) {
    symbol = `${symbol}USDT`;
  }

  // 1. Strict pre-execution validation
  if (!symbol) {
    throw new Error('Invalid symbol specified for Binance execution.');
  }

  if (!['LONG', 'SHORT'].includes(side)) {
    throw new Error(`Invalid trade side: ${side}. Must be LONG or SHORT.`);
  }

  if (typeof margin !== 'number' || margin <= 0 || isNaN(margin)) {
    throw new Error(`Invalid margin allocation: $${margin}. Margin must be greater than $0.`);
  }

  if (typeof leverage !== 'number' || leverage < 1 || leverage > 125 || isNaN(leverage)) {
    throw new Error(`Invalid leverage: ${leverage}x. Leverage must be between 1x and 125x.`);
  }

  if (typeof slPrice !== 'number' || slPrice <= 0 || isNaN(slPrice)) {
    throw new Error(`Invalid Stop Loss price: $${slPrice}. Must be positive.`);
  }

  if (typeof tpPrice !== 'number' || tpPrice <= 0 || isNaN(tpPrice)) {
    throw new Error(`Invalid Take Profit price: $${tpPrice}. Must be positive.`);
  }

  const baseUrl = getBaseUrl();

  // Fetch current live price to validate TP/SL direction and calculate quantity
  const priceRes = await fetch(`${baseUrl}/fapi/v1/ticker/price?symbol=${symbol}`);
  if (!priceRes.ok) {
    const err = await priceRes.json().catch(() => ({}));
    throw new Error(`Failed to fetch current price for ${symbol}: ${err.msg || priceRes.statusText}`);
  }
  const priceData = (await priceRes.json()) as { price: string };
  const currentMarketPrice = parseFloat(priceData.price);
  if (!currentMarketPrice || currentMarketPrice <= 0) {
    throw new Error(`Failed to obtain a valid market price for ${symbol}.`);
  }

  const referenceEntry = params.entryPrice && params.entryPrice > 0 ? params.entryPrice : currentMarketPrice;

  // Validate TP/SL relative to LONG/SHORT
  if (side === 'LONG') {
    if (tpPrice <= referenceEntry) {
      throw new Error(
        `Validation Failed: For a LONG position, Take Profit ($${tpPrice}) must be HIGHER than entry price ($${referenceEntry.toFixed(2)}).`
      );
    }
    if (slPrice >= referenceEntry) {
      throw new Error(
        `Validation Failed: For a LONG position, Stop Loss ($${slPrice}) must be LOWER than entry price ($${referenceEntry.toFixed(2)}).`
      );
    }
  } else {
    // SHORT
    if (tpPrice >= referenceEntry) {
      throw new Error(
        `Validation Failed: For a SHORT position, Take Profit ($${tpPrice}) must be LOWER than entry price ($${referenceEntry.toFixed(2)}).`
      );
    }
    if (slPrice <= referenceEntry) {
      throw new Error(
        `Validation Failed: For a SHORT position, Stop Loss ($${slPrice}) must be HIGHER than entry price ($${referenceEntry.toFixed(2)}).`
      );
    }
  }

  // 2. Fetch symbol filters (LOT_SIZE, tickSize, minNotional)
  const filters = await getSymbolFilters(symbol);

  // Position notional = margin * leverage
  const positionNotional = margin * leverage;
  if (positionNotional < filters.minNotional) {
    throw new Error(
      `Validation Failed: Total position size ($${positionNotional.toFixed(2)}) is less than Binance min notional ($${filters.minNotional} USDT). Increase margin or leverage.`
    );
  }

  // Compute raw quantity
  const rawQuantity = positionNotional / currentMarketPrice;
  const formattedQuantity = formatWithStep(rawQuantity, filters.stepSize);
  const finalQty = parseFloat(formattedQuantity);

  if (finalQty < filters.minQty) {
    throw new Error(
      `Validation Failed: Calculated quantity (${finalQty}) is less than Binance min quantity (${filters.minQty}) for ${symbol}.`
    );
  }
  if (finalQty * currentMarketPrice < filters.minNotional) {
    throw new Error(
      `Validation Failed: Effective order value ($${(finalQty * currentMarketPrice).toFixed(2)}) is below Binance min notional ($${filters.minNotional}).`
    );
  }

  const formattedTpPrice = formatWithTick(tpPrice, filters.tickSize);
  const formattedSlPrice = formatWithTick(slPrice, filters.tickSize);

  let timeOffset = await getServerTimeOffset();

  // Helper for signed POST requests to Binance Futures
  const postSigned = async (endpoint: string, postParams: Record<string, any>) => {
    const timestamp = Date.now() + timeOffset;
    const bodyParams = {
      ...postParams,
      timestamp,
      recvWindow: 60000,
    };
    const signedQuery = signQuery(bodyParams, secretKey);

    const res = await fetch(`${baseUrl}${endpoint}?${signedQuery}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.msg || res.statusText || 'Binance API Error';
      throw new Error(`Binance Error (${data.code || res.status}): ${errorMsg}`);
    }
    return data;
  };

  // 3. Step: Set selected leverage before placing order
  try {
    await postSigned('/fapi/v1/leverage', {
      symbol,
      leverage: Math.round(leverage),
    });
  } catch (err: any) {
    // If leverage is already set or warning, check error
    if (!err.message?.includes('leverage not modified')) {
      throw new Error(`Failed to set leverage to ${leverage}x on ${symbol}: ${err.message}`);
    }
  }

  // 4. Step: Place MARKET Entry Order
  // LONG -> BUY; SHORT -> SELL
  const entrySide = side === 'LONG' ? 'BUY' : 'SELL';
  const closeSide = side === 'LONG' ? 'SELL' : 'BUY';

  const entryOrderData = await postSigned('/fapi/v1/order', {
    symbol,
    side: entrySide,
    type: 'MARKET',
    quantity: formattedQuantity,
  });

  const entryOrderId = entryOrderData.orderId;
  const executedQty = parseFloat(entryOrderData.executedQty || formattedQuantity);
  const cumQuote = parseFloat(entryOrderData.cumQuote || '0');
  const avgPrice =
    parseFloat(entryOrderData.avgPrice || '0') > 0
      ? parseFloat(entryOrderData.avgPrice)
      : executedQty > 0 && cumQuote > 0
      ? cumQuote / executedQty
      : currentMarketPrice;

  // 5. Step: Place Take Profit Order
  let tpOrderData: any = null;
  let tpPlaced = false;
  try {
    // Standard USDⓈ-M Futures closePosition TAKE_PROFIT_MARKET order
    tpOrderData = await postSigned('/fapi/v1/order', {
      symbol,
      side: closeSide,
      type: 'TAKE_PROFIT_MARKET',
      stopPrice: formattedTpPrice,
      closePosition: 'true',
      workingType: 'MARK_PRICE',
    });
    tpPlaced = true;
  } catch (tpErr: any) {
    // Fallback: try reduceOnly with explicit quantity if closePosition is rejected (e.g. hedge mode)
    try {
      tpOrderData = await postSigned('/fapi/v1/order', {
        symbol,
        side: closeSide,
        type: 'TAKE_PROFIT_MARKET',
        stopPrice: formattedTpPrice,
        quantity: formattedQuantity,
        reduceOnly: 'true',
        workingType: 'MARK_PRICE',
      });
      tpPlaced = true;
    } catch (fallbackErr: any) {
      console.error('Failed to place Take Profit order:', fallbackErr);
      tpOrderData = {
        orderId: 'FAILED',
        status: `Error: ${fallbackErr.message || tpErr.message}`,
      };
    }
  }

  // 6. Step: Place Stop Loss Order
  let slOrderData: any = null;
  let slPlaced = false;
  try {
    // Standard USDⓈ-M Futures closePosition STOP_MARKET order
    slOrderData = await postSigned('/fapi/v1/order', {
      symbol,
      side: closeSide,
      type: 'STOP_MARKET',
      stopPrice: formattedSlPrice,
      closePosition: 'true',
      workingType: 'MARK_PRICE',
    });
    slPlaced = true;
  } catch (slErr: any) {
    // Fallback: try reduceOnly with explicit quantity
    try {
      slOrderData = await postSigned('/fapi/v1/order', {
        symbol,
        side: closeSide,
        type: 'STOP_MARKET',
        stopPrice: formattedSlPrice,
        quantity: formattedQuantity,
        reduceOnly: 'true',
        workingType: 'MARK_PRICE',
      });
      slPlaced = true;
    } catch (fallbackErr: any) {
      console.error('Failed to place Stop Loss order:', fallbackErr);
      slOrderData = {
        orderId: 'FAILED',
        status: `Error: ${fallbackErr.message || slErr.message}`,
      };
    }
  }

  return {
    success: true,
    orderId: entryOrderId,
    clientOrderId: entryOrderData.clientOrderId,
    symbol,
    side,
    entryAction: entrySide,
    executedQty,
    avgPrice,
    leverage: Math.round(leverage),
    margin,
    positionNotional: executedQty * avgPrice,
    tp: {
      orderId: tpOrderData?.orderId || 'N/A',
      price: parseFloat(formattedTpPrice),
      status: tpPlaced ? tpOrderData?.status || 'NEW' : tpOrderData?.status || 'FAILED',
      side: closeSide,
    },
    sl: {
      orderId: slOrderData?.orderId || 'N/A',
      price: parseFloat(formattedSlPrice),
      status: slPlaced ? slOrderData?.status || 'NEW' : slOrderData?.status || 'FAILED',
      side: closeSide,
    },
    statusSteps: {
      connected: true,
      orderSent: true,
      orderFilled: true,
      tpPlaced,
      slPlaced,
    },
    timestamp: Date.now(),
  };
}
