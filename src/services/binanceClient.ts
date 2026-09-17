export interface BinanceAccountInfo {
  totalWalletBalance: number;
  availableBalance: number;
  totalUnrealizedProfit: number;
  canTrade: boolean;
}

export interface BinanceStatusResponse {
  connected: boolean;
  configured: boolean;
  testnet: boolean;
  latencyMs: number;
  serverTime: number;
  message?: string;
  error?: string;
  account?: BinanceAccountInfo;
}

export interface BinanceTradePayload {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  margin: number;
  leverage: number;
  orderType?: 'MARKET' | 'LIMIT';
  apiKey?: string;
  apiSecret?: string;
}

export interface BinanceExecutionResponse {
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
  error?: string;
}

/**
 * Check Binance Futures connectivity and credential configuration via server-side proxy
 */
export async function checkBinanceStatus(apiKey?: string, apiSecret?: string): Promise<BinanceStatusResponse> {
  try {
    let url = '/api/binance/status';
    if (apiKey && apiSecret) {
      url += `?apiKey=${encodeURIComponent(apiKey)}&apiSecret=${encodeURIComponent(apiSecret)}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      connected: false,
      configured: false,
      testnet: false,
      latencyMs: 0,
      serverTime: Date.now(),
      error: err.message || 'Unable to reach backend server',
    };
  }
}

/**
 * Submit live Binance USDⓈ-M Futures trade execution via server-side proxy
 */
export async function submitBinanceTrade(
  payload: BinanceTradePayload
): Promise<BinanceExecutionResponse> {
  const res = await fetch('/api/binance/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Binance trade failed with HTTP ${res.status}`);
  }

  return data;
}
