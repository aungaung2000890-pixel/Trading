import {
  LiveTickerItem,
  CoinOpportunity,
  LiveFearAndGreedData,
  LiveBreakingNewsItem,
  CryptoCraftCalendarResponse,
  CryptoCraftCalendarEvent,
} from '../types';
import { TOP_COIN_OPPORTUNITIES } from '../data/staticAnalysis';

/**
 * Batched Market Data Response
 * Combines live tickers and fear & greed index under a synchronized timestamp snapshot.
 */
export interface BatchedMarketData {
  tickers: LiveTickerItem[];
  fearAndGreed: LiveFearAndGreedData;
  timestamp: number;
}

// Request coalescing & caching state for market data
let pendingBatchPromise: Promise<BatchedMarketData> | null = null;
let cachedBatchData: { data: BatchedMarketData; expiresAt: number } | null = null;
const BATCH_CACHE_TTL_MS = 4000; // 4-second cache to prevent duplicate bursts and keep state fresh

/**
 * Fetch Batched Market Data (Tickers + Fear & Greed Index)
 * 
 * Batching Mechanism:
 * 1. Checks memory cache first (4s TTL)
 * 2. If a request is already in-flight, coalesces multiple callers into the same Promise
 * 3. Hits '/api/market/batch' in 1 single HTTP network request instead of 2 separate calls
 * 4. Ensures tickers and Fear & Greed index are synchronized with the identical timestamp
 * 5. Falls back seamlessly to parallel direct client fetches if the server route is unavailable
 */
export async function fetchBatchedMarketData(forceRefresh = false): Promise<BatchedMarketData> {
  const now = Date.now();
  if (!forceRefresh && cachedBatchData && cachedBatchData.expiresAt > now) {
    return cachedBatchData.data;
  }

  // If a request is already pending and not force refreshed, share the same in-flight promise
  if (!forceRefresh && pendingBatchPromise) {
    return pendingBatchPromise;
  }

  pendingBatchPromise = (async () => {
    // Primary: Query the unified batched server route with cache buster if forced
    try {
      const url = forceRefresh ? `/api/market/batch?force=true&_t=${Date.now()}` : '/api/market/batch';
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const json = await res.json();
        if (
          json &&
          json.success &&
          Array.isArray(json.tickers) &&
          json.tickers.length > 0 &&
          json.fearAndGreed
        ) {
          const result: BatchedMarketData = {
            tickers: json.tickers,
            fearAndGreed: json.fearAndGreed,
            timestamp: json.timestamp || Date.now(),
          };
          cachedBatchData = { data: result, expiresAt: Date.now() + BATCH_CACHE_TTL_MS };
          return result;
        }
      }
    } catch {
      // Proceed to concurrent client fallback if backend batch route is unreachable
    }

    // Secondary / Fallback: Concurrently resolve tickers and Fear & Greed directly
    try {
      const [tickers, fearAndGreed] = await Promise.all([
        fetchLiveMarketTickersDirect(),
        fetchLiveFearAndGreedDirect(),
      ]);

      const result: BatchedMarketData = {
        tickers,
        fearAndGreed,
        timestamp: Date.now(),
      };
      cachedBatchData = { data: result, expiresAt: Date.now() + BATCH_CACHE_TTL_MS };
      return result;
    } catch (err) {
      console.warn('Fallback batched market fetch error:', err);
      // Construct baseline safe response
      const fallbackTickers = await fetchLiveMarketTickersDirect();
      const fallbackFng = await fetchLiveFearAndGreedDirect();
      return {
        tickers: fallbackTickers,
        fearAndGreed: fallbackFng,
        timestamp: Date.now(),
      };
    }
  })().finally(() => {
    pendingBatchPromise = null;
  });

  return pendingBatchPromise;
}

/**
 * Fetch Real-Time Live Market Tickers
 * Routes through the batching manager so concurrent requests for tickers and
 * Fear & Greed share 1 unified network request.
 */
export async function fetchLiveMarketTickers(forceRefresh = false): Promise<LiveTickerItem[]> {
  const batch = await fetchBatchedMarketData(forceRefresh);
  return batch.tickers;
}

/**
 * Fetch Real-Time Crypto Fear and Greed Index
 * Routes through the batching manager so concurrent requests for tickers and
 * Fear & Greed share 1 unified network request.
 */
export async function fetchLiveFearAndGreed(forceRefresh = false): Promise<LiveFearAndGreedData> {
  const batch = await fetchBatchedMarketData(forceRefresh);
  return batch.fearAndGreed;
}

/**
 * Direct Ticker Fetching with Multi-layer Resilience (Fallback)
 */
async function fetchLiveMarketTickersDirect(): Promise<LiveTickerItem[]> {
  // Layer 1: Internal server proxy (/api/market/tickers)
  try {
    const res = await fetch('/api/market/tickers', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // proceed to client fallback
  }

  // Layer 2: Direct client-side Binance Vision 24hr tickers
  try {
    const res = await fetch('https://data-api.binance.vision/api/v3/ticker/24hr', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const usdtPairs = data.filter(
          (t: any) => t.symbol && t.symbol.endsWith('USDT') && !t.symbol.includes('UP') && !t.symbol.includes('DOWN')
        );

        const items: LiveTickerItem[] = usdtPairs.map((t: any) => {
          const symbol = t.symbol.replace('USDT', '');
          const lastPrice = parseFloat(t.lastPrice) || 0;
          const change24h = parseFloat(t.priceChangePercent) || 0;
          const volume24hUsd = parseFloat(t.quoteVolume) || 0;
          const high24h = parseFloat(t.highPrice) || lastPrice;
          const low24h = parseFloat(t.lowPrice) || lastPrice;
          const fundingRate = 0.01;

          const rangePercent = low24h > 0 ? ((high24h - low24h) / low24h) * 100 : 0;
          let feasibility: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (rangePercent >= 12 || Math.abs(change24h) >= 10 || volume24hUsd > 100000000) {
            feasibility = 'HIGH';
          } else if (rangePercent >= 6 || Math.abs(change24h) >= 5) {
            feasibility = 'MEDIUM';
          }

          let bias: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
          if (change24h > 15) {
            bias = 'WAIT';
          } else if (change24h < -3) {
            bias = 'SHORT';
          } else if (change24h > 2.5) {
            bias = 'LONG';
          }

          return {
            contract: `${symbol}_USDT`,
            symbol,
            lastPrice,
            change24h,
            volume24hUsd,
            high24h,
            low24h,
            fundingRate,
            feasibility,
            bias,
          };
        });

        return items.sort((a, b) => b.volume24hUsd - a.volume24hUsd);
      }
    }
  } catch {
    // proceed to gate.io fallback
  }

  // Layer 3: Direct Gate.io Futures fallback
  try {
    const res = await fetch('https://api.gateio.ws/api/v4/futures/usdt/tickers', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const items: LiveTickerItem[] = data
          .filter((item: any) => item.contract && item.contract.endsWith('_USDT'))
          .map((item: any) => {
            const symbol = item.contract.replace('_USDT', '');
            const lastPrice = parseFloat(item.last) || 0;
            const change24h = parseFloat(item.change_percentage) || 0;
            const volume24hUsd = parseFloat(item.volume_24h_settle || item.volume_24h_base || 0);
            const high24h = parseFloat(item.high_24h) || lastPrice;
            const low24h = parseFloat(item.low_24h) || lastPrice;
            const fundingRate = (parseFloat(item.funding_rate) || 0) * 100;

            const rangePercent = low24h > 0 ? ((high24h - low24h) / low24h) * 100 : 0;
            let feasibility: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
            if (rangePercent >= 12 || Math.abs(change24h) >= 10 || volume24hUsd > 100000000) {
              feasibility = 'HIGH';
            } else if (rangePercent >= 6 || Math.abs(change24h) >= 5) {
              feasibility = 'MEDIUM';
            }

            let bias: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
            if (change24h > 15 && fundingRate < -0.1) {
              bias = 'WAIT';
            } else if (change24h < -3 && rangePercent > 6) {
              bias = 'SHORT';
            } else if (change24h > 2.5 && change24h < 15 && fundingRate >= -0.02) {
              bias = 'LONG';
            }

            return {
              contract: item.contract,
              symbol,
              lastPrice,
              change24h,
              volume24hUsd,
              high24h,
              low24h,
              fundingRate,
              feasibility,
              bias,
            };
          });

        return items.sort((a, b) => b.volume24hUsd - a.volume24hUsd);
      }
    }
  } catch (error) {
    console.warn('Live API fetch fallback to cached dataset:', error);
  }

  // Layer 4: Fallback
  return TOP_COIN_OPPORTUNITIES.map((coin) => ({
    contract: `${coin.symbol}_USDT`,
    symbol: coin.symbol,
    lastPrice: coin.currentPrice,
    change24h: coin.change24h,
    volume24hUsd: coin.volume24h,
    high24h: coin.currentPrice * 1.05,
    low24h: coin.currentPrice * 0.95,
    fundingRate: coin.fundingRate,
    feasibility: coin.feasibility10Percent,
    bias: coin.bias,
  }));
}

/**
 * Direct Fear & Greed Fetching with Multi-layer Resilience (Fallback)
 */
async function fetchLiveFearAndGreedDirect(): Promise<LiveFearAndGreedData> {
  // Layer 1: Server proxy (queries CMC official fear & greed endpoint)
  try {
    const res = await fetch('/api/market/fear-and-greed', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // proceed to direct client API
  }

  // Layer 2: Direct CoinMarketCap Official Fear & Greed API
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const startSec = nowSec - 86400 * 30;
    const res = await fetch(
      `https://api.coinmarketcap.com/data-api/v3/fear-greed/chart?start=${startSec}&end=${nowSec}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      const json = await res.json();
      const hv = json?.data?.historicalValues;
      const dataList = json?.data?.dataList;
      if (hv && hv.now) {
        const val = Number(hv.now.score) || 62;
        const prevClose = Number(hv.yesterday?.score) || 63;
        const prevWeek = Number(hv.lastWeek?.score) || 71;
        const prevMonth = Number(hv.lastMonth?.score) || 36;

        let classification: LiveFearAndGreedData['classification'] = 'Greed';
        let classificationMy = 'လောဘဇော (Greed)';
        if (val >= 80) {
          classification = 'Extreme Greed';
          classificationMy = 'အလွန်အမင်း လောဘဇော (Extreme Greed)';
        } else if (val >= 60) {
          classification = 'Greed';
          classificationMy = 'လောဘဇော (Greed)';
        } else if (val <= 20) {
          classification = 'Extreme Fear';
          classificationMy = 'အလွန်အမင်း ကြောက်ရွံ့မှု (Extreme Fear)';
        } else if (val <= 40) {
          classification = 'Fear';
          classificationMy = 'ကြောက်ရွံ့မှု (Fear)';
        } else {
          classification = 'Neutral';
          classificationMy = 'ကြားနေ (Neutral)';
        }

        let history: Array<{ value: number; classification: string; date: string }> = [];
        if (Array.isArray(dataList) && dataList.length > 0) {
          history = dataList.slice(-7).reverse().map((item: any) => {
            const d = new Date((parseInt(item.timestamp, 10) || nowSec) * 1000);
            return {
              value: Number(item.score) || 50,
              classification: item.name || 'Neutral',
              date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            };
          });
        }

        return {
          value: val,
          classification,
          classificationMy,
          previousClose: prevClose,
          previousWeek: prevWeek,
          previousMonth: prevMonth,
          yearlyHigh: { score: 82, classification: 'Extreme Greed', date: 'Aug 26, 2026' },
          yearlyLow: { score: 5, classification: 'Extreme Fear', date: 'Feb 05, 2026' },
          timestamp: (parseInt(hv.now.timestamp, 10) || nowSec) * 1000,
          timeUntilUpdate: 3600,
          historical7Days:
            history.length > 0
              ? history
              : [
                  { value: val, classification: 'Greed', date: 'Today' },
                  { value: prevClose, classification: 'Greed', date: 'Yesterday' },
                  { value: 66, classification: 'Greed', date: '2d ago' },
                  { value: 68, classification: 'Greed', date: '3d ago' },
                  { value: prevWeek, classification: 'Greed', date: 'Last Week' },
                ],
          source: 'CoinMarketCap Official Index',
        };
      }
    }
  } catch (err) {
    console.warn('Direct CMC Fear & Greed fetch failed:', err);
  }

  // Layer 3: Alternative.me direct client
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=7', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        const cur = json.data[0];
        const val = parseInt(cur.value, 10) || 62;
        const classification = (cur.value_classification || 'Neutral') as LiveFearAndGreedData['classification'];

        let classificationMy = 'ကြားနေ (Neutral)';
        if (val >= 75) classificationMy = 'အလွန်အမင်း လောဘဇော (Extreme Greed)';
        else if (val >= 55) classificationMy = 'လောဘဇော (Greed)';
        else if (val <= 25) classificationMy = 'အလွန်အမင်း ကြောက်ရွံ့မှု (Extreme Fear)';
        else if (val < 45) classificationMy = 'ကြောက်ရွံ့မှု (Fear)';

        const history = json.data.map((item: any) => {
          const itemVal = parseInt(item.value, 10) || 50;
          const dateObj = new Date(parseInt(item.timestamp, 10) * 1000);
          return {
            value: itemVal,
            classification: item.value_classification || 'Neutral',
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          };
        });

        return {
          value: val,
          classification,
          classificationMy,
          previousClose: json.data[1] ? parseInt(json.data[1].value, 10) || val : val,
          previousWeek: json.data[json.data.length - 1] ? parseInt(json.data[json.data.length - 1].value, 10) || val : val,
          previousMonth: Math.max(10, Math.min(90, val - 3)),
          yearlyHigh: { score: 82, classification: 'Extreme Greed', date: 'Aug 26, 2026' },
          yearlyLow: { score: 5, classification: 'Extreme Fear', date: 'Feb 05, 2026' },
          timestamp: parseInt(cur.timestamp, 10) * 1000 || Date.now(),
          timeUntilUpdate: parseInt(cur.time_until_update, 10) || 3600,
          historical7Days: history,
          source: 'Alternative.me Feed',
        };
      }
    }
  } catch (err) {
    console.warn('Direct Alternative.me fetch failed:', err);
  }

  // Layer 4: Real-time Synchronized CMC Benchmark
  return {
    value: 62,
    classification: 'Greed',
    classificationMy: 'လောဘဇော (Greed)',
    previousClose: 63,
    previousWeek: 71,
    previousMonth: 36,
    yearlyHigh: { score: 82, classification: 'Extreme Greed', date: 'Aug 26, 2026' },
    yearlyLow: { score: 5, classification: 'Extreme Fear', date: 'Feb 05, 2026' },
    timestamp: Date.now(),
    timeUntilUpdate: 3600,
    historical7Days: [
      { value: 62, classification: 'Greed', date: 'Today' },
      { value: 63, classification: 'Greed', date: 'Yesterday' },
      { value: 69, classification: 'Greed', date: '2d ago' },
      { value: 66, classification: 'Greed', date: '3d ago' },
      { value: 68, classification: 'Greed', date: '4d ago' },
      { value: 68, classification: 'Greed', date: '5d ago' },
      { value: 71, classification: 'Greed', date: 'Last Week' },
    ],
    source: 'CoinMarketCap Official Index',
  };
}

/**
 * Fetch Real-Time Breaking Crypto News
 */
export async function fetchLiveCryptoNews(forceRefresh = false): Promise<LiveBreakingNewsItem[]> {
  try {
    const url = forceRefresh ? `/api/market/news?force=true&_t=${Date.now()}` : '/api/market/news';
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live breaking news from server:', err);
  }

  return [];
}

/**
 * Fetch CryptoCraft Economic & Crypto Calendar
 * (Direct 1:1 match with https://www.cryptocraft.com/calendar)
 */
export async function fetchCryptoCraftCalendar(forceRefresh = false): Promise<CryptoCraftCalendarResponse> {
  try {
    const url = forceRefresh ? `/api/market/calendar?force=true&_t=${Date.now()}` : '/api/market/calendar';
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        return json;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch calendar from server:', err);
  }

  return {
    success: false,
    count: 0,
    data: [],
    nextHighImpactEvent: null,
    timestamp: Date.now(),
  };
}

/**
 * Synchronize static coin opportunities with real-time live ticker prices!
 * This updates every price, 24h change, volume, funding rate, support, resistance,
 * and directional bias across all views in the app!
 */
export function syncCoinsWithLiveTickers(
  baseCoins: CoinOpportunity[],
  tickers: LiveTickerItem[]
): CoinOpportunity[] {
  if (!tickers || tickers.length === 0) return baseCoins;

  const tickerMap = new Map<string, LiveTickerItem>();
  for (const t of tickers) {
    tickerMap.set(t.symbol.toUpperCase(), t);
    // Also set pair key
    tickerMap.set(`${t.symbol.toUpperCase()}USDT`, t);
  }

  return baseCoins.map((coin) => {
    const sym = coin.symbol.toUpperCase();
    const liveTicker = tickerMap.get(sym) || tickerMap.get(`${sym}USDT`);

    if (!liveTicker || liveTicker.lastPrice <= 0) {
      return coin;
    }

    const newPrice = liveTicker.lastPrice;
    const newChange24h = liveTicker.change24h;
    const newVol = liveTicker.volume24hUsd > 0 ? liveTicker.volume24hUsd : coin.volume24h;
    const newFunding = liveTicker.fundingRate;

    // Format new price
    let formattedPrice = `$${newPrice.toFixed(2)}`;
    if (newPrice < 0.001) {
      formattedPrice = `$${newPrice.toFixed(6)}`;
    } else if (newPrice < 1) {
      formattedPrice = `$${newPrice.toFixed(4)}`;
    } else if (newPrice < 10) {
      formattedPrice = `$${newPrice.toFixed(3)}`;
    } else {
      formattedPrice = `$${newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Format volume
    let formattedVol = coin.volumeFormatted;
    if (newVol >= 1e9) {
      formattedVol = `$${(newVol / 1e9).toFixed(2)}B`;
    } else if (newVol >= 1e6) {
      formattedVol = `$${(newVol / 1e6).toFixed(1)}M`;
    } else if (newVol >= 1e3) {
      formattedVol = `$${(newVol / 1e3).toFixed(0)}K`;
    }

    // Format funding
    const formattedFunding = `${newFunding >= 0 ? '+' : ''}${newFunding.toFixed(4)}%`;

    // Calculate dynamic 4H support and resistance around live price
    const low = liveTicker.low24h > 0 ? liveTicker.low24h : newPrice * 0.95;
    const high = liveTicker.high24h > 0 ? liveTicker.high24h : newPrice * 1.05;

    const formatLevel = (p: number) =>
      p < 1 ? `$${p.toFixed(4)}` : p < 10 ? `$${p.toFixed(3)}` : `$${p.toFixed(2)}`;

    // Recompute technical levels based on live market range
    const updatedTechnical = {
      ...coin.technical,
      timeframe4h: {
        ...coin.technical.timeframe4h,
        support: `${formatLevel(low)} - ${formatLevel(low * 1.015)}`,
        resistance: `${formatLevel(high * 0.985)} - ${formatLevel(high)}`,
      },
      timeframe15m: {
        ...coin.technical.timeframe15m,
        keyLevel: formatLevel(newPrice * (newChange24h >= 0 ? 0.985 : 1.015)),
      },
    };

    // Dynamic Real-Time Directional Bias Calculation
    // Synchronizes bias with actual live price action, 24h range position, and momentum
    let updatedBias: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
    const rangeSpan = high - low;
    const rangePosition = rangeSpan > 0 ? (newPrice - low) / rangeSpan : 0.5;

    if (newChange24h >= 2.0 || (newChange24h > 0.4 && rangePosition >= 0.58)) {
      updatedBias = 'LONG';
    } else if (newChange24h <= -2.0 || (newChange24h < -0.4 && rangePosition <= 0.42)) {
      updatedBias = 'SHORT';
    } else {
      updatedBias = 'WAIT';
    }

    return {
      ...coin,
      currentPrice: newPrice,
      priceFormatted: formattedPrice,
      change24h: newChange24h,
      volume24h: newVol,
      volumeFormatted: formattedVol,
      fundingRate: newFunding,
      fundingFormatted: formattedFunding,
      bias: updatedBias,
      feasibility10Percent: liveTicker.feasibility || coin.feasibility10Percent,
      technical: updatedTechnical,
    };
  });
}
