/**
 * Binance Direct Link & Signal Positioning Utility
 * Connects directly to Binance web (https://www.binance.com/en) and mobile app
 * without requiring any API keys or credentials.
 */

export interface BinanceSignalData {
  symbol: string;
  direction: 'LONG' | 'SHORT' | 'BUY' | 'SELL';
  entryPrice: number;
  tpPrice: number;
  tp1Price?: number;
  tp2Price?: number;
  tp3Price?: number;
  slPrice: number;
  margin?: number;
  leverage?: number;
  orderType?: 'MARKET' | 'LIMIT';
  timeframe?: string;
}

/**
 * Standardize coin symbol for Binance USDⓈ-M Futures (e.g. "SOL" -> "SOLUSDT")
 */
export function formatBinanceFuturesSymbol(rawSymbol: string): string {
  if (!rawSymbol) return 'BTCUSDT';
  let clean = rawSymbol.trim().toUpperCase().replace(/[\/\-_ ]/g, '');
  if (!clean.endsWith('USDT') && !clean.endsWith('BUSD') && !clean.endsWith('USDC')) {
    clean = `${clean}USDT`;
  }
  return clean;
}

/**
 * Standardize base and quote for Binance Spot (e.g. "SOL" -> "SOL_USDT")
 */
export function formatBinanceSpotSymbol(rawSymbol: string): { base: string; quote: string; pair: string } {
  const clean = formatBinanceFuturesSymbol(rawSymbol);
  const quote = clean.endsWith('USDT') ? 'USDT' : clean.endsWith('USDC') ? 'USDC' : 'USDT';
  const base = clean.replace(quote, '');
  return {
    base,
    quote,
    pair: `${base}_${quote}`,
  };
}

/**
 * Generate direct Binance USDⓈ-M Futures web trading link
 * e.g. https://www.binance.com/en/futures/SOLUSDT
 */
export function getBinanceFuturesUrl(symbol: string): string {
  const cleanSymbol = formatBinanceFuturesSymbol(symbol);
  return `https://www.binance.com/en/futures/${cleanSymbol}`;
}

/**
 * Generate direct Binance Spot trading link
 * e.g. https://www.binance.com/en/trade/SOL_USDT?type=spot
 */
export function getBinanceSpotUrl(symbol: string): string {
  const { pair } = formatBinanceSpotSymbol(symbol);
  return `https://www.binance.com/en/trade/${pair}?type=spot`;
}

/**
 * Generate direct Binance Home / Portal link
 */
export function getBinanceHomeUrl(): string {
  return 'https://www.binance.com/en';
}

/**
 * Generate direct Binance Login link
 */
export function getBinanceLoginUrl(): string {
  return 'https://accounts.binance.com/en/login';
}

/**
 * Generate direct Binance QR Login link
 */
export function getBinanceQrLoginUrl(): string {
  return 'https://accounts.binance.com/en/qrlogin';
}

/**
 * Generate Binance Mobile App Deeplink
 */
export function getBinanceAppDeepLink(symbol: string): string {
  const cleanSymbol = formatBinanceFuturesSymbol(symbol);
  return `bnc://app.binance.com/futures/trade?symbol=${cleanSymbol}`;
}

export const BINANCE_PORTAL_WINDOW_NAME = 'BinanceTradingPersistentPortal';

let activeBinanceWindow: Window | null = null;

/**
 * Open Binance in a persistent single tab/window.
 * Reusing the same named window ensures:
 * 1. The user only logs in ONCE and stays logged in across all trades.
 * 2. Subsequent trade clicks update the active pair in that exact tab instead of opening infinite new tabs.
 */
export function openBinanceWebUrl(url: string): Window | null {
  if (typeof window === 'undefined') return null;
  try {
    if (activeBinanceWindow && !activeBinanceWindow.closed) {
      activeBinanceWindow.location.href = url;
      try {
        activeBinanceWindow.focus();
      } catch {}
      return activeBinanceWindow;
    }
    const win = window.open(url, BINANCE_PORTAL_WINDOW_NAME);
    if (win) {
      activeBinanceWindow = win;
      try {
        win.focus();
      } catch {}
    }
    return win;
  } catch (err) {
    console.warn('Fallback opening named window:', err);
    return window.open(url, BINANCE_PORTAL_WINDOW_NAME);
  }
}

/**
 * Bring active Binance persistent window to the front
 */
export function focusBinancePortal(): void {
  if (activeBinanceWindow && !activeBinanceWindow.closed) {
    try {
      activeBinanceWindow.focus();
    } catch {}
  } else {
    openBinanceWebUrl(getBinanceHomeUrl());
  }
}

/**
 * Open Binance Futures directly for a given symbol
 */
export function openBinanceFutures(symbol: string): Window | null {
  const url = getBinanceFuturesUrl(symbol);
  return openBinanceWebUrl(url);
}

/**
 * Open official Binance login in persistent window (keeps login session intact)
 */
export function openBinanceLogin(isQr: boolean = false): Window | null {
  const url = isQr ? getBinanceQrLoginUrl() : getBinanceLoginUrl();
  return openBinanceWebUrl(url);
}

/**
 * Open Binance Spot directly for a given symbol
 */
export function openBinanceSpot(symbol: string): Window | null {
  const url = getBinanceSpotUrl(symbol);
  return openBinanceWebUrl(url);
}

/**
 * Copy single numerical value directly to clipboard (e.g. for fast paste into Binance input field)
 */
export async function copyValueToClipboard(value: number | string): Promise<boolean> {
  try {
    const text = typeof value === 'number' ? value.toString() : value.trim();
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Format full signal message for clipboard with TP/SL ready
 */
export function formatBinanceSignalClipboardText(signal: BinanceSignalData): string {
  const cleanSymbol = formatBinanceFuturesSymbol(signal.symbol);
  const dir = signal.direction.toUpperCase().includes('BUY') || signal.direction.toUpperCase().includes('LONG') ? 'LONG (BUY) 🟢' : 'SHORT (SELL) 🔴';
  const url = getBinanceFuturesUrl(cleanSymbol);

  const tpSection = signal.tp3Price
    ? `🎯 TP1: $${signal.tp1Price ?? signal.tpPrice}\n🎯 TP2: $${signal.tp2Price ?? signal.tpPrice}\n🎯 TP3 (Final): $${signal.tp3Price}`
    : `🎯 Take Profit (TP): $${signal.tpPrice}`;

  return `⚡ BINANCE USDⓈ-M FUTURES SIGNAL
Pair: ${cleanSymbol}
Direction: ${dir}
Entry Price: $${signal.entryPrice}

${tpSection}
🛑 Stop Loss (SL): $${signal.slPrice}

⚙️ Leverage: ${signal.leverage || 20}x
💵 Margin: $${signal.margin || 100}
🌐 Trade Link: ${url}
(API Key မလိုဘဲ Binance Link မှ တိုက်ရိုက်ဖွင့်လှစ်နိုင်ပါသည်)`;
}
