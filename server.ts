import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  testBinanceConnection,
  executeBinanceTrade,
  BinanceTradeRequest,
} from './src/server/binanceService.ts';
import { processAITradingAssistant } from './src/server/aiAssistantService.ts';
import { processLongTermInvestment } from './src/server/longTermInvestmentService.ts';
import {
  getLiveFearAndGreed,
  getLiveBreakingNews,
  getLiveTickers,
  getLiveMarketBatch,
} from './src/server/marketDataService.ts';
import { getLiveCalendar } from './src/server/calendarService.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // 1. Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // AI Trading Assistant Endpoint (Supports both paths for robustness)
  app.post(['/api/ai/trading-assistant', '/api/ai-assistant'], async (req, res) => {
    try {
      const response = await processAITradingAssistant(req.body);
      return res.json(response);
    } catch (err: any) {
      console.error('AI assistant route error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal AI assistant processing error',
      });
    }
  });

  // Dedicated AI Long-Term Investment Analysis Endpoint
  app.post(['/api/ai/long-term-investment', '/api/long-term-investment'], async (req, res) => {
    try {
      const result = await processLongTermInvestment(req.body);
      return res.json(result);
    } catch (err: any) {
      console.error('AI Long-Term investment route error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to process long-term investment research',
      });
    }
  });

  // 2. Binance connection test and status endpoint (Item 15)
  // Secure server-side check. Never reveals BINANCE_SECRET_KEY to client.
  app.get('/api/binance/status', async (req, res) => {
    try {
      const apiKey = req.query.apiKey as string | undefined;
      const apiSecret = req.query.apiSecret as string | undefined;
      const status = await testBinanceConnection(apiKey, apiSecret);
      res.json(status);
    } catch (err: any) {
      res.status(500).json({
        connected: false,
        configured: Boolean((process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET_KEY) || (req.query.apiKey && req.query.apiSecret)),
        testnet: process.env.BINANCE_USE_TESTNET === 'true',
        error: err.message || 'Failed to check Binance status',
      });
    }
  });

  // 3. Binance Trade Execution endpoint (Items 3, 4, 5, 6, 7, 8, 16, 17)
  app.post('/api/binance/execute', async (req, res) => {
    try {
      const tradeData: BinanceTradeRequest = req.body;

      if (!tradeData) {
        return res.status(400).json({
          success: false,
          error: 'Missing trade request payload.',
        });
      }

      // Check credentials before calling service to avoid runtime error logging
      const hasEnvKeys = Boolean(process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET_KEY);
      const hasClientKeys = Boolean(req.body.apiKey && req.body.apiSecret);
      
      if (!hasEnvKeys && !hasClientKeys) {
        return res.status(400).json({
          success: false,
          error: 'Binance API credentials missing. Please set BINANCE_API_KEY and BINANCE_SECRET_KEY in your environment variables, or provide them in the request.',
        });
      }

      const result = await executeBinanceTrade(tradeData);
      return res.json(result);
    } catch (err: any) {
      console.warn('Binance trade execution notice:', err.message || err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Trade execution failed on Binance USDⓈ-M Futures.',
      });
    }
  });

  // 4. Real-time Live Market Tickers Endpoint
  app.get('/api/market/tickers', async (req, res) => {
    try {
      const force = req.query.force === 'true';
      const tickers = await getLiveTickers(force);
      res.json({ success: true, count: tickers.length, data: tickers, timestamp: Date.now() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4b. Synchronized Batched Market Data Endpoint (Tickers + Fear & Greed)
  // Reduces client network calls to 1 single request and guarantees exact timestamp synchronization
  app.get('/api/market/batch', async (req, res) => {
    try {
      const force = req.query.force === 'true';
      const batch = await getLiveMarketBatch(force);
      res.json({ success: true, ...batch });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Real-time Fear and Greed Index Endpoint (Alternative.me / CoinMarketCap)
  app.get('/api/market/fear-and-greed', async (req, res) => {
    try {
      const force = req.query.force === 'true';
      const fng = await getLiveFearAndGreed(force);
      res.json({ success: true, data: fng, timestamp: Date.now() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Real-time Breaking Crypto News Endpoint (Cointelegraph / Decrypt / CoinDesk)
  app.get('/api/market/news', async (req, res) => {
    try {
      const force = req.query.force === 'true';
      const news = await getLiveBreakingNews(force);
      res.json({ success: true, count: news.length, data: news, timestamp: Date.now() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. CryptoCraft Economic & Crypto Calendar Endpoint (https://www.cryptocraft.com/calendar)
  app.get('/api/market/calendar', async (req, res) => {
    try {
      const force = req.query.force === 'true';
      const calendarData = await getLiveCalendar(force);
      res.json(calendarData);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware in dev mode, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
