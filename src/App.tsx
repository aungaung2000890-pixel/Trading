import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MacroBanner } from './components/MacroBanner';
import { TopPicks } from './components/TopPicks';
import { BestCoinAdvisor } from './components/BestCoinAdvisor';
import { PositionCalculator } from './components/PositionCalculator';
import { LiveScannerTable } from './components/LiveScannerTable';
import { CoinDetailModal } from './components/CoinDetailModal';
import { MasterTradeCard } from './components/MasterTradeCard';
import { MultiStyleTradeCards } from './components/MultiStyleTradeCards';
import { RecentLiquidationsFeed } from './components/RecentLiquidationsFeed';
import { CustomTradeSimulator } from './components/CustomTradeSimulator';
import { BinanceStyleFuturesDemo } from './components/BinanceStyleFuturesDemo';
import { GlossaryModal } from './components/GlossaryModal';
import { MarketNewsModal } from './components/MarketNewsModal';
import { InstantTradeCardModal } from './components/InstantTradeCardModal';
import { PinLockScreen } from './components/PinLockScreen';
import { NavigationDrawer } from './components/NavigationDrawer';
import { HomeQuickNav } from './components/HomeQuickNav';
import { LearningCenter } from './components/LearningCenter';
import { AITradingAssistant } from './components/AITradingAssistant';
import { EasySignalsCopyHub } from './components/EasySignalsCopyHub';
import { MarketRegimeRiskWidget } from './components/MarketRegimeRiskWidget';
import { WalletRiskStrategyAdvisor } from './components/WalletRiskStrategyAdvisor';
import { WorldMarketClocks } from './components/WorldMarketClocks';
import { MarketTimingEngine } from './components/MarketTimingEngine';
import { HighLeverageTradingMode } from './components/HighLeverageTradingMode';
import { SettingsModal } from './components/SettingsModal';
import { loadStoredSettings, saveStoredSettings, applyThemeToDom, DEFAULT_APP_SETTINGS } from './utils/theme';
import { TOP_COIN_OPPORTUNITIES } from './data/staticAnalysis';
import {
  fetchLiveMarketTickers,
  fetchLiveFearAndGreed,
  fetchLiveCryptoNews,
  fetchBatchedMarketData,
  syncCoinsWithLiveTickers,
} from './services/marketApi';
import {
  CoinOpportunity,
  LiveTickerItem,
  DemoTradePreset,
  AppNavView,
  AIAssistantMode,
  AppSettings,
  MarketClockSettings,
  DeviceLayoutOption,
  DeviceLayoutSelection,
  AppPriceAlert,
  AlertToastItem,
  LiveFearAndGreedData,
  LiveBreakingNewsItem,
} from './types';
import { DualTime, getDualTime } from './utils/time';
import { CheckCircle2, ShieldCheck, ArrowLeft, Menu, Clock, Timer, Flame, Home, Bell } from 'lucide-react';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { TradingWorkspaceHub } from './components/layout/TradingWorkspaceHub';
import { LongTermInvestmentHub } from './components/LongTermInvestmentHub';
import { SpotTradingAdvisor } from './components/SpotTradingAdvisor';
import { DualEngineDecisionTerminal } from './components/DualEngineDecisionTerminal';
import { CoinMarketCapHub } from './components/CoinMarketCapHub';
import { CryptoCraftCalendar } from './components/CryptoCraftCalendar';
import { PhoneDeviceFrame } from './components/layout/PhoneDeviceFrame';
import { PriceAlertModal } from './components/PriceAlertModal';
import { PriceAlertToast } from './components/PriceAlertToast';
import { playAlertChime } from './utils/alertSound';
import { BinanceInAppTerminal } from './components/BinanceInAppTerminal';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<'my' | 'en'>(() => {
    try {
      const stored = loadStoredSettings();
      return stored.general.language || 'my';
    } catch {
      return 'my';
    }
  });

  const handleSetLang = (newLang: 'my' | 'en') => {
    setLang(newLang);
    const updated: AppSettings = {
      ...settings,
      general: {
        ...settings.general,
        language: newLang,
      },
    };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    setLang(newSettings.general.language);
    applyThemeToDom(newSettings.appearance.theme, newSettings.appearance.accentColor);
    setTheme(newSettings.appearance.theme === 'light_trading' ? 'light' : 'dark');
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_APP_SETTINGS);
    saveStoredSettings(DEFAULT_APP_SETTINGS);
    setLang(DEFAULT_APP_SETTINGS.general.language);
    applyThemeToDom(DEFAULT_APP_SETTINGS.appearance.theme, DEFAULT_APP_SETTINGS.appearance.accentColor);
    setTheme('dark');
  };

  // Clock handlers
  const handleUpdateClockSettings = (partial: Partial<MarketClockSettings>) => {
    const updated: AppSettings = {
      ...settings,
      clock: {
        ...settings.clock,
        settings: {
          ...settings.clock.settings,
          ...partial,
        },
      },
    };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleUpdateActiveCities = (cityIds: string[]) => {
    const updated: AppSettings = {
      ...settings,
      clock: {
        ...settings.clock,
        activeCityIds: cityIds,
      },
    };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleUpdateCityWallpaper = (cityId: string, wallpaperUrl: string | null) => {
    const newWallpapers = { ...settings.clock.perCityWallpapers };
    if (wallpaperUrl) {
      newWallpapers[cityId] = wallpaperUrl;
    } else {
      delete newWallpapers[cityId];
    }
    const updated: AppSettings = {
      ...settings,
      clock: {
        ...settings.clock,
        perCityWallpapers: newWallpapers,
      },
    };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleResetAllWallpapers = () => {
    const updated: AppSettings = {
      ...settings,
      clock: {
        ...settings.clock,
        perCityWallpapers: {},
      },
    };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Theme preference with localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('crypto_futures_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('crypto_futures_theme', theme);
    } catch (e) {
      console.error(e);
    }
    applyThemeToDom(settings.appearance.theme, settings.appearance.accentColor);
  }, [theme, settings.appearance.theme, settings.appearance.accentColor]);

  // 3 Device Layout Options: Phone, Tablet, Desktop (with Auto detection)
  const [layoutSelection, setLayoutSelection] = useState<DeviceLayoutSelection>(() => {
    try {
      const saved = localStorage.getItem('futures_layout_selection');
      if (saved === 'phone' || saved === 'tablet' || saved === 'desktop' || saved === 'auto') {
        return saved as DeviceLayoutSelection;
      }
    } catch {}
    return 'auto';
  });

  const [detectedLayout, setDetectedLayout] = useState<DeviceLayoutOption>(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w < 768) return 'phone';
      if (w < 1024) return 'tablet';
      return 'desktop';
    }
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) setDetectedLayout('phone');
      else if (w < 1024) setDetectedLayout('tablet');
      else setDetectedLayout('desktop');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeLayout: DeviceLayoutOption = layoutSelection === 'auto' ? detectedLayout : layoutSelection;

  const handleSelectLayout = (sel: DeviceLayoutSelection) => {
    setLayoutSelection(sel);
    try {
      localStorage.setItem('futures_layout_selection', sel);
    } catch (e) {
      console.error(e);
    }
  };

  // Security PIN Lock State (Stored in sessionStorage)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('futures_terminal_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  // Modular Workspace Navigation (Home, Strategy, Calculator, Scanner, TradeCard, Demo, AI)
  const [activeView, setActiveView] = useState<AppNavView>('home');
  const [viewHistory, setViewHistory] = useState<AppNavView[]>(['home']);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [aiInitialMode, setAiInitialMode] = useState<AIAssistantMode>('quick');
  const [aiInitialSymbol, setAiInitialSymbol] = useState<string | undefined>(undefined);

  const navigateToView = useCallback((view: AppNavView) => {
    if (view === 'world_clocks') {
      // User directive: "ကမ္ဘာစျေးကွက်နာရီများကိုပင်မထဲမှာပဲထားပေးသူ့ကိုသန့်သန့်အကန့်ခွဲမထားနဲ့တော့"
      setActiveView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setViewHistory((prev) => {
      if (prev[prev.length - 1] === view) return prev;
      return [...prev, view];
    });
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenAIAssistant = useCallback((mode: AIAssistantMode = 'quick', coinSymbol?: string) => {
    setAiInitialMode(mode);
    if (coinSymbol) {
      setAiInitialSymbol(coinSymbol);
    }
    navigateToView('ai');
  }, [navigateToView]);

  const [coins, setCoins] = useState<CoinOpportunity[]>(TOP_COIN_OPPORTUNITIES);

  const [selectedCoin, setSelectedCoin] = useState<CoinOpportunity>(TOP_COIN_OPPORTUNITIES[1]); // Default to #2 SOL
  const [modalCoin, setModalCoin] = useState<CoinOpportunity | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState<boolean>(false);
  const [instantCardTicker, setInstantCardTicker] = useState<LiveTickerItem | null>(null);

  // Demo Trading Initial Context & Active Preset Setup
  const [demoInitialSymbol, setDemoInitialSymbol] = useState<string>('SOL');
  const [demoInitialSide, setDemoInitialSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [demoPreset, setDemoPreset] = useState<DemoTradePreset | null>(null);

  // Binance In-App Live Terminal Context & Active Setup
  const [binanceTerminalSymbol, setBinanceTerminalSymbol] = useState<string>('SOL');
  const [binanceTerminalSide, setBinanceTerminalSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [binanceTerminalPreset, setBinanceTerminalPreset] = useState<DemoTradePreset | null>(null);

  const handleOpenInAppTerminal = useCallback(
    (symbol: string, side: 'LONG' | 'SHORT', preset?: DemoTradePreset) => {
      setBinanceTerminalSymbol(symbol);
      setBinanceTerminalSide(side);
      if (preset) {
        setBinanceTerminalPreset(preset);
      }
      navigateToView('binance_live');
    },
    [navigateToView]
  );

  const [liveTickers, setLiveTickers] = useState<LiveTickerItem[]>([]);
  const [fearAndGreed, setFearAndGreed] = useState<LiveFearAndGreedData | null>(null);
  const [liveNews, setLiveNews] = useState<LiveBreakingNewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalRefreshTrigger, setGlobalRefreshTrigger] = useState<number>(0);

  const handleRefreshNews = useCallback(async () => {
    setIsLoadingNews(true);
    try {
      const freshNews = await fetchLiveCryptoNews();
      if (freshNews && freshNews.length > 0) {
        setLiveNews(freshNews);
      }
    } catch (e) {
      console.error('Failed to fetch live crypto news:', e);
    } finally {
      setIsLoadingNews(false);
    }
  }, []);

  // Real-time Price Alerts State & Live Notifications
  const [alerts, setAlerts] = useState<AppPriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('crypto_futures_alerts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load saved price alerts:', e);
    }
    return [
      {
        id: 'alert-btc-resistance',
        symbol: 'BTC',
        contract: 'BTC_USDT',
        type: 'PRICE_ABOVE',
        targetPrice: 95000,
        initialPrice: 91500,
        createdAt: Date.now() - 3600000,
        isActive: true,
        triggered: false,
        soundEnabled: true,
        note: 'Key Resistance Breakout',
      },
      {
        id: 'alert-sol-target',
        symbol: 'SOL',
        contract: 'SOL_USDT',
        type: 'PRICE_ABOVE',
        targetPrice: 195,
        initialPrice: 184,
        createdAt: Date.now() - 1800000,
        isActive: true,
        triggered: false,
        soundEnabled: true,
        note: 'Breakout above $195',
      },
    ];
  });

  const [alertToasts, setAlertToasts] = useState<AlertToastItem[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [alertModalInitialSymbol, setAlertModalInitialSymbol] = useState<string | undefined>(undefined);

  // Persist alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('crypto_futures_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts to localStorage:', e);
    }
  }, [alerts]);

  const activeAlertsCount = alerts.filter((a) => a.isActive && !a.triggered).length;

  // Real-time alert threshold evaluator against live tickers
  useEffect(() => {
    if (!liveTickers || liveTickers.length === 0 || !alerts || alerts.length === 0) return;
    let hasTriggered = false;
    const newToasts: AlertToastItem[] = [];

    const updatedAlerts = alerts.map((alert) => {
      if (alert.triggered || !alert.isActive) return alert;

      const live = liveTickers.find(
        (t) => t.symbol.toUpperCase() === alert.symbol.toUpperCase()
      );
      if (!live || live.lastPrice <= 0) return alert;

      let isHit = false;
      if (alert.type === 'PRICE_ABOVE' && live.lastPrice >= alert.targetPrice) {
        isHit = true;
      } else if (alert.type === 'PRICE_BELOW' && live.lastPrice <= alert.targetPrice) {
        isHit = true;
      }

      if (isHit) {
        hasTriggered = true;
        const toastItem: AlertToastItem = {
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          alertId: alert.id,
          symbol: alert.symbol,
          type: alert.type,
          targetPrice: alert.targetPrice,
          currentPrice: live.lastPrice,
          timestamp: Date.now(),
          message: `${alert.symbol} target of $${alert.targetPrice >= 1 ? alert.targetPrice.toLocaleString() : alert.targetPrice.toFixed(4)} reached!`,
          note: alert.note,
        };
        newToasts.push(toastItem);

        if (alert.soundEnabled !== false) {
          playAlertChime();
        }

        return {
          ...alert,
          triggered: true,
          triggeredAt: Date.now(),
          triggeredPrice: live.lastPrice,
          isActive: false,
        };
      }

      return alert;
    });

    if (hasTriggered) {
      setAlerts(updatedAlerts);
      if (newToasts.length > 0) {
        setAlertToasts((prev) => [...newToasts, ...prev]);
      }
    }
  }, [liveTickers, alerts]);

  // Background price watcher when there are active alerts
  useEffect(() => {
    const hasActive = alerts.some((a) => a.isActive && !a.triggered);
    if (!hasActive) return;

    // Lightweight 10s background poll to evaluate live prices for active alerts
    const interval = setInterval(async () => {
      try {
        const freshTickers = await fetchLiveMarketTickers();
        if (freshTickers && freshTickers.length > 0) {
          setLiveTickers(freshTickers);
        }
      } catch {
        // Silent catch for background watcher
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [alerts]);

  const handleOpenPriceAlert = useCallback((symbol?: string) => {
    if (symbol) {
      setAlertModalInitialSymbol(symbol);
    }
    setIsAlertModalOpen(true);
  }, []);

  const handleAddAlert = (alertData: {
    symbol: string;
    contract?: string;
    type: 'PRICE_ABOVE' | 'PRICE_BELOW';
    targetPrice: number;
    initialPrice: number;
    note?: string;
    soundEnabled?: boolean;
  }) => {
    const newAlert: AppPriceAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
      isActive: true,
      triggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleRearmAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, triggered: false, triggeredAt: undefined, triggeredPrice: undefined, isActive: true }
          : a
      )
    );
  };

  const handleToggleAlertActive = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleClearAlertHistory = () => {
    setAlerts((prev) => prev.filter((a) => !a.triggered));
  };

  const handleDismissToast = (id: string) => {
    setAlertToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllToasts = () => {
    setAlertToasts([]);
  };

  const handleTestAlertToast = (symbol: string = 'SOL') => {
    const ticker = liveTickers.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase()) || {
      lastPrice: 188.5,
    };
    const testPrice = ticker.lastPrice * 1.025;
    const testToast: AlertToastItem = {
      id: `toast-test-${Date.now()}`,
      alertId: 'test-simulated',
      symbol: symbol.toUpperCase(),
      type: 'PRICE_ABOVE',
      targetPrice: ticker.lastPrice * 1.02,
      currentPrice: testPrice,
      timestamp: Date.now(),
      message: `${symbol.toUpperCase()} target reached: $${testPrice >= 1 ? testPrice.toFixed(2) : testPrice.toFixed(4)}!`,
      note: 'Demo Simulated Test Trigger',
    };
    setAlertToasts((prev) => [testToast, ...prev]);
    playAlertChime();
  };

  // Synchronized Margin & Leverage State (Default to $200 and 20x as set in user's workflow)
  const [margin, setMargin] = useState<number>(200);
  const [leverage, setLeverage] = useState<number>(20);

  // Futures Wallet Balance State (Synchronized across all trade views, modals, and calculators)
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('futures_wallet_balance');
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return 2000;
  });

  const handleWalletBalanceChange = (newBal: number) => {
    const val = Math.max(10, newBal);
    setWalletBalance(val);
    try {
      localStorage.setItem('futures_wallet_balance', String(val));
    } catch (e) {
      console.error(e);
    }
  };

  // Dual Timezone Tracking
  const [lastScannedTime, setLastScannedTime] = useState<DualTime>(getDualTime());
  const [scanToast, setScanToast] = useState<string | null>(null);

  // User controlled Scan Mode (Manual vs Auto) - Defaults to 'manual' per user instruction: "စစ်ဆေးမည်ကို auto မလုပ်ပဲ ငါကိုယ်တိုင်စီမံချင်တယ်"
  const [scanMode, setScanMode] = useState<'manual' | 'auto'>(() => {
    try {
      const saved = localStorage.getItem('futures_terminal_scan_mode');
      if (saved === 'auto' || saved === 'manual') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'manual'; // Default is Manual: user controls scanning themselves
  });

  const [autoIntervalSec, setAutoIntervalSec] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('futures_terminal_scan_interval');
      if (saved) return Number(saved) || 60;
    } catch (e) {
      console.error(e);
    }
    return 60;
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    try {
      sessionStorage.setItem('futures_terminal_unlocked', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('futures_terminal_unlocked');
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setGlobalRefreshTrigger((prev) => prev + 1);
    try {
      // Synchronized batched request: 'fetchLiveMarketTickers' and 'fetchLiveFearAndGreed' are requested together
      // in 1 single unified API call (/api/market/batch), reducing network overhead and keeping snapshots in sync.
      const [batchResult, newsResult] = await Promise.allSettled([
        fetchBatchedMarketData(true),
        fetchLiveCryptoNews(true),
      ]);

      if (batchResult.status === 'fulfilled') {
        const { tickers, fearAndGreed: fng } = batchResult.value;

        if (tickers && tickers.length > 0) {
          setLiveTickers(tickers);
          // Sync our top coins with real-time prices & 24h changes
          setCoins((prevCoins) => syncCoinsWithLiveTickers(prevCoins, tickers));
          // Also keep selectedCoin current price up-to-date
          setSelectedCoin((curr) => {
            const matched = tickers.find((t) => t.symbol.toUpperCase() === curr.symbol.toUpperCase());
            if (matched && matched.lastPrice > 0) {
              return {
                ...curr,
                currentPrice: matched.lastPrice,
                change24h: matched.change24h,
                fundingRate: matched.fundingRate || curr.fundingRate,
              };
            }
            return curr;
          });
        }

        if (fng) {
          setFearAndGreed(fng);
        }
      }

      if (newsResult.status === 'fulfilled' && newsResult.value.length > 0) {
        setLiveNews(newsResult.value);
      }

      const freshTime = getDualTime();
      setLastScannedTime(freshTime);

      // Trigger user confirmation notice so they know data was genuinely re-fetched
      setScanToast(
        lang === 'my'
          ? `✅ စျေးကွက်ပေါက်စျေးများ၊ Fear & Greed နှင့် သတင်းများ အချိန်နှင့်တပြေးညီ အောင်မြင်စွာ စစ်ဆေးပြီးပါပြီ (${freshTime.mmtTime} MMT / ${freshTime.usTime} EDT)`
          : `✅ Live tickers, Fear & Greed and Breaking News updated at ${freshTime.mmtTime} MMT (${freshTime.usTime} EDT)`
      );
      setTimeout(() => setScanToast(null), 4000);
    } catch (e) {
      console.error('Failed to load market data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  // Initial load on mount
  useEffect(() => {
    loadData();
  }, []); // Run once on startup

  // Auto-scan interval (ONLY runs if user explicitly sets scanMode === 'auto')
  useEffect(() => {
    if (scanMode !== 'auto') {
      return; // MANUAL MODE: Do not run any auto intervals! User clicks "စစ်ဆေးမည်" manually.
    }
    const intervalMs = (autoIntervalSec || 60) * 1000;
    const interval = setInterval(() => {
      loadData();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [scanMode, autoIntervalSec, loadData]);

  const handleToggleScanMode = (newMode: 'manual' | 'auto') => {
    setScanMode(newMode);
    try {
      localStorage.setItem('futures_terminal_scan_mode', newMode);
    } catch (e) {
      console.error(e);
    }
    if (newMode === 'manual') {
      setScanToast(
        lang === 'my'
          ? '✋ စစ်ဆေးမှုစနစ်ကို ကိုယ်တိုင်စီမံ (Manual) သို့ ပြောင်းလိုက်ပါပြီ (Auto စစ်ဆေးမှု ပိတ်ထားပါသည်)'
          : '✋ Switched to Manual scan mode (Auto-refresh disabled)'
      );
    } else {
      setScanToast(
        lang === 'my'
          ? `⚡ စစ်ဆေးမှုစနစ်ကို အလိုအလျောက် (Auto ${autoIntervalSec}s) သို့ ပြောင်းလိုက်ပါပြီ`
          : `⚡ Switched to Auto scan mode (${autoIntervalSec}s)`
      );
    }
    setTimeout(() => setScanToast(null), 3500);
  };

  const handleSelectCoin = (coin: CoinOpportunity) => {
    setSelectedCoin(coin);
    setModalCoin(coin);
  };

  const handleSelectTicker = (ticker: LiveTickerItem) => {
    const match = coins.find((c) => c.symbol === ticker.symbol);
    if (match) {
      setSelectedCoin(match);
      setModalCoin(match);
    } else {
      const dynamicCoin: CoinOpportunity = {
        rank: 99,
        symbol: ticker.symbol,
        name: ticker.symbol,
        pair: ticker.contract.replace('_', ''),
        currentPrice: ticker.lastPrice,
        priceFormatted: ticker.lastPrice >= 1 ? `$${ticker.lastPrice.toFixed(2)}` : `$${ticker.lastPrice.toFixed(4)}`,
        change24h: ticker.change24h,
        volume24h: ticker.volume24hUsd,
        volumeFormatted: ticker.volume24hUsd >= 1e6 ? `$${(ticker.volume24hUsd / 1e6).toFixed(1)}M` : `$${(ticker.volume24hUsd / 1e3).toFixed(0)}K`,
        fundingRate: ticker.fundingRate,
        fundingFormatted: `${ticker.fundingRate.toFixed(4)}% / 8h`,
        bias: ticker.bias,
        feasibility10Percent: ticker.feasibility,
        whyRanked: `Live market contract scanned with 24h volume of $${(ticker.volume24hUsd / 1e6).toFixed(1)}M and 24h price change of ${ticker.change24h.toFixed(2)}%.`,
        whyRankedMy: `၂၄ နာရီ Volume $${(ticker.volume24hUsd / 1e6).toFixed(1)}M နှင့် ၂၄ နာရီ စျေးနှုန်းပြောင်းလဲမှု ${ticker.change24h.toFixed(2)}% ရှိသော Live Futures Pair ဖြစ်သည်။`,
        newsCatalyst: 'Live market order flow and momentum scanner observation.',
        newsCatalystMy: 'Live စျေးကွက်အရောင်းအဝယ် စီးဆင်းမှုအရ စောင့်ကြည့်ထားခြင်းဖြစ်သည်။',
        technical: {
          timeframe4h: {
            trend: ticker.change24h >= 0 ? 'Short-term Bullish' : 'Short-term Bearish',
            structure: `24h High: $${ticker.high24h.toFixed(4)} | 24h Low: $${ticker.low24h.toFixed(4)}`,
            support: `$${ticker.low24h.toFixed(4)}`,
            resistance: `$${ticker.high24h.toFixed(4)}`,
          },
          timeframe1h: {
            trend: ticker.change24h >= 0 ? 'Upward Momentum' : 'Downward Pressure',
            bosChoch: 'Testing local high/low swing bounds.',
            momentum: 'Calculated from 24h intraday volatility.',
            setup: 'Watch for liquidity breaks around 24h boundaries.',
          },
          timeframe15m: {
            immediateSetup: `Trading at $${ticker.lastPrice.toFixed(4)}`,
            entryTrigger: 'Observe 15M candle rejection or confirmation around 24h high/low.',
            keyLevel: `$${ticker.lastPrice.toFixed(4)}`,
          },
        },
        feasibilityReason: `Feasibility is ${ticker.feasibility} based on 24h range volatility (${(((ticker.high24h - ticker.low24h) / ticker.low24h) * 100).toFixed(1)}%).`,
      };
      setSelectedCoin(dynamicCoin);
      setModalCoin(dynamicCoin);
    }
  };

  const handleGoToTradeWithPreset = (preset: DemoTradePreset) => {
    const timestamp = Date.now();
    const fullPreset: DemoTradePreset = {
      ...preset,
      timestamp,
    };
    setDemoPreset(fullPreset);
    setDemoInitialSymbol(preset.symbol);
    setDemoInitialSide(preset.side);
    if (preset.margin) setMargin(preset.margin);
    if (preset.leverage) setLeverage(preset.leverage);
    setInstantCardTicker(null);
    navigateToView('demo');
  };

  const handleTradeInDemo = (symbol: string, side: 'LONG' | 'SHORT', customMargin?: number, customLeverage?: number) => {
    const cleanSymbol = symbol.replace('USDT', '');
    const timestamp = Date.now();
    const finalMargin = customMargin !== undefined ? customMargin : margin;
    const finalLeverage = customLeverage !== undefined ? customLeverage : leverage;
    setDemoPreset({
      symbol: cleanSymbol,
      side,
      margin: finalMargin,
      leverage: finalLeverage,
      orderType: 'MARKET',
      source: `${symbol} Live Card`,
      timestamp,
    });
    setDemoInitialSymbol(cleanSymbol);
    setDemoInitialSide(side);
    if (customMargin !== undefined) setMargin(customMargin);
    if (customLeverage !== undefined) setLeverage(customLeverage);
    setInstantCardTicker(null);
    navigateToView('demo');
  };

  const handleBacktestCoinSetup = (coin: CoinOpportunity) => {
    setSelectedCoin(coin);
    setModalCoin(null);
    navigateToView('tradecard');
  };

  // Status of any active modal / overlay
  const hasActiveModals = Boolean(
    isAlertModalOpen ||
    instantCardTicker ||
    modalCoin ||
    isGlossaryOpen ||
    isNewsModalOpen ||
    isDrawerOpen ||
    isSettingsOpen
  );

  // One-step back logic (Single Tap):
  // 1. If any modal/drawer is open, close the topmost modal/drawer
  // 2. If inside a sub-view (Scanner, Demo, Calculator, etc.), return to previous view in history
  // 3. If on home with no history, scroll to top
  const handleStepBack = useCallback(() => {
    if (isAlertModalOpen) {
      setIsAlertModalOpen(false);
      return;
    }
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }
    if (instantCardTicker) {
      setInstantCardTicker(null);
      return;
    }
    if (modalCoin) {
      setModalCoin(null);
      return;
    }
    if (isGlossaryOpen) {
      setIsGlossaryOpen(false);
      return;
    }
    if (isNewsModalOpen) {
      setIsNewsModalOpen(false);
      return;
    }
    if (isDrawerOpen) {
      setIsDrawerOpen(false);
      return;
    }

    if (viewHistory.length > 1) {
      const updated = [...viewHistory];
      updated.pop(); // remove active view
      const prev = updated[updated.length - 1] || 'home';
      setViewHistory(updated);
      setActiveView(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (activeView !== 'home') {
      setActiveView('home');
      setViewHistory(['home']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAlertModalOpen, isSettingsOpen, instantCardTicker, modalCoin, isGlossaryOpen, isNewsModalOpen, isDrawerOpen, viewHistory, activeView]);

  // Full exit to home logic (Double Tap):
  // Immediately closes all open modals, clears overlays, and navigates straight to Home
  const handleFullExitToHome = useCallback(() => {
    setIsAlertModalOpen(false);
    setIsSettingsOpen(false);
    setInstantCardTicker(null);
    setModalCoin(null);
    setIsGlossaryOpen(false);
    setIsNewsModalOpen(false);
    setIsDrawerOpen(false);
    setActiveView('home');
    setViewHistory(['home']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getCurrentDepthName = () => {
    if (isSettingsOpen) return lang === 'my' ? 'စနစ်ချိန်ညှိမှု' : 'Settings';
    if (instantCardTicker) return `${instantCardTicker.symbol} Trade Card`;
    if (modalCoin) return `${modalCoin.symbol} Detail`;
    if (isGlossaryOpen) return lang === 'my' ? 'ဝေါဟာရ မာတိကာ' : 'Glossary';
    if (isNewsModalOpen) return lang === 'my' ? 'စျေးကွက် သတင်း' : 'Market News';
    if (isDrawerOpen) return lang === 'my' ? 'ပင်မ မီနူး' : 'Menu Drawer';

    switch (activeView) {
      case 'home':
        return lang === 'my' ? 'ပင်မစာမျက်နှာ' : 'Home';
      case 'spot_advisor':
        return lang === 'my' ? 'စပေါ့ အရောင်းအဝယ် အကြံပြုချက်' : 'Spot Trading Advisor';
      case 'long_term':
        return lang === 'my' ? 'ရေရှည် ရင်းနှီးမြှုပ်နှံမှု' : 'Long-Term Investment';
      case 'ai':
        return lang === 'my' ? 'AI ကုန်သွယ်မှု လက်ထောက်' : 'AI Assistant';
      case 'market_timing':
        return lang === 'my' ? 'စျေးကွက် အချိန်ကိုက်စနစ်' : 'Market Timing';
      case 'world_clocks':
        return lang === 'my' ? 'ကမ္ဘာ့စျေးကွက် နာရီများ' : 'World Clocks';
      case 'high_leverage':
        return lang === 'my' ? 'High-Leverage စွန့်စားမှု ထိန်းချုပ်မုဒ်' : 'High-Leverage';
      case 'scanner':
        return lang === 'my' ? 'Futures Scanner' : 'Scanner';
      case 'demo':
        return lang === 'my' ? 'Demo Futures Trade' : 'Demo Trade';
      case 'strategy':
        return lang === 'my' ? 'Strategy Hub' : 'Strategy Hub';
      case 'calculator':
        return lang === 'my' ? 'Risk Calculator' : 'Calculator';
      case 'tradecard':
        return lang === 'my' ? 'Master Trade Card' : 'Trade Card';
      case 'learning':
        return lang === 'my' ? 'Crypto သင်ခန်းစာ' : 'Crypto Masterclass';
      case 'forex':
        return lang === 'my' ? 'Forex & Backtest Lab' : 'Forex Lab';
      default:
        return '';
    }
  };

  // If locked, present the PIN Lock Screen
  if (!isUnlocked) {
    return <PinLockScreen onUnlock={handleUnlock} lang={lang} />;
  }

  const isPhoneMode = activeLayout === 'phone';

  const content = (
    <div className={`min-h-screen relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${isPhoneMode ? 'w-full max-w-full overflow-x-hidden' : ''}`}>
      {/* Dynamic Customizable Terminal Background / Wallpaper Layer */}
      {settings.appearance.background?.enabled && settings.appearance.background.imageUrl && (
        <div
          id="terminal-custom-wallpaper"
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
          style={{
            backgroundImage: `url(${settings.appearance.background.imageUrl})`,
            backgroundPosition:
              settings.appearance.background.position === 'custom'
                ? `${settings.appearance.background.positionCustomX ?? 50}% ${settings.appearance.background.positionCustomY ?? 50}%`
                : settings.appearance.background.position,
            backgroundSize:
              settings.appearance.background.scale === 'custom'
                ? `${settings.appearance.background.scalePercent ?? 100}%`
                : settings.appearance.background.scale,
            backgroundRepeat: settings.appearance.background.repeat || 'no-repeat',
            opacity: (settings.appearance.background.opacity ?? 25) / 100,
            filter: `brightness(${settings.appearance.background.brightness ?? 85}%) blur(${settings.appearance.background.blur ?? 0}px)`,
          }}
        />
      )}

      {/* Toast Notification for Rescan Verification */}
      {scanToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{scanToast}</span>
        </div>
      )}

      {/* Main App Header with Dual Timezone Clocks, Hamburger Menu, News, Lock & Nav Tabs */}
      <Header
        lang={lang}
        setLang={setLang}
        onRefresh={loadData}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenNews={() => setIsNewsModalOpen(true)}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onLockApp={handleLock}
        isLoading={isLoading}
        lastScannedTime={lastScannedTime}
        activeView={activeView}
        onSelectView={navigateToView}
        liveTickers={liveTickers}
        coins={coins}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        scanMode={scanMode}
        onToggleScanMode={handleToggleScanMode}
        autoIntervalSec={autoIntervalSec}
        onSetAutoIntervalSec={setAutoIntervalSec}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentLayoutSelection={layoutSelection}
        activeLayout={activeLayout}
        onSelectLayout={handleSelectLayout}
        logoSettings={settings.appearance.logo}
        onOpenBranding={() => setIsSettingsOpen(true)}
        onBackToHome={handleFullExitToHome}
        activeAlertsCount={activeAlertsCount}
        onOpenPriceAlerts={() => handleOpenPriceAlert()}
        fearAndGreed={fearAndGreed}
      />

      {/* Slide-out Navigation Drawer Menu (triggered by ☰ Hamburger Icon) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeView={activeView}
        onSelectView={(v) => {
          navigateToView(v);
          setIsDrawerOpen(false);
        }}
        onOpenNews={() => setIsNewsModalOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onLockApp={handleLock}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPriceAlerts={() => handleOpenPriceAlert()}
        activeAlertsCount={activeAlertsCount}
        lang={lang}
        setLang={setLang}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        currentLayoutSelection={layoutSelection}
        activeLayout={activeLayout}
        onSelectLayout={handleSelectLayout}
      />

      {/* Responsive App Shell for Phone, Tablet, and Desktop */}
      <div className={`relative z-10 min-h-[calc(100vh-57px)] ${activeLayout === 'desktop' ? 'flex' : ''} ${activeLayout === 'phone' ? 'pb-32' : activeLayout === 'tablet' ? 'pb-12' : ''}`}>
        {/* Desktop Pro Navigation Sidebar */}
        {activeLayout === 'desktop' && (
          <DesktopSidebar
            activeView={activeView}
            onSelectView={navigateToView}
            onOpenNews={() => setIsNewsModalOpen(true)}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPriceAlerts={() => handleOpenPriceAlert()}
            activeAlertsCount={activeAlertsCount}
            onLockApp={handleLock}
            walletBalance={walletBalance}
            lang={lang}
            logoSettings={settings.appearance.logo}
          />
        )}

        {/* Adaptive Main Content Area */}
        <div className="flex-1 min-w-0">
          <main
            className={`mx-auto transition-all ${
              activeLayout === 'phone'
                ? 'w-full max-w-full px-2.5 py-3 space-y-4 overflow-x-hidden'
                : activeLayout === 'tablet'
                ? 'w-full max-w-5xl px-4 py-6 space-y-6'
                : 'w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6'
            }`}
          >
            {/* 1. ပင်မစာမျက်နှာ (HOME / MAIN OVERVIEW) */}
      {activeView === 'home' && (
        <TradingWorkspaceHub
          layout={activeLayout}
          lang={lang}
          coins={coins}
          selectedCoin={selectedCoin}
          onSelectCoin={handleSelectCoin}
          onTradeInDemo={handleTradeInDemo}
          onOpenAI={handleOpenAIAssistant}
          onOpenPriceAlert={handleOpenPriceAlert}
          onGenerateTradeCard={(coin) => {
            const matchedTicker = liveTickers.find((t) => t.symbol === coin.symbol) || {
              symbol: coin.symbol,
              contract: coin.pair,
              lastPrice: coin.currentPrice,
              change24h: coin.change24h,
              high24h: coin.currentPrice * 1.05,
              low24h: coin.currentPrice * 0.95,
              volume24hUsd: coin.volume24hUsd || 150000000,
              fundingRate: coin.fundingRate,
              feasibility: coin.feasibility10Percent,
              bias: coin.bias,
            };
            setInstantCardTicker(matchedTicker);
          }}
          onSelectTicker={handleSelectTicker}
          onGenerateInstantCard={(ticker) => setInstantCardTicker(ticker)}
          liveTickers={liveTickers}
          walletBalance={walletBalance}
          onWalletBalanceChange={handleWalletBalanceChange}
          lastScannedTime={lastScannedTime}
          settings={settings}
          onUpdateClockSettings={handleUpdateClockSettings}
          onUpdateActiveCities={handleUpdateActiveCities}
          onUpdateCityWallpaper={handleUpdateCityWallpaper}
          onResetAllWallpapers={handleResetAllWallpapers}
          onNavigateView={navigateToView}
          onOpenNews={() => setIsNewsModalOpen(true)}
          isLoading={isLoading}
          scanMode={scanMode}
          onToggleScanMode={handleToggleScanMode}
          onRefresh={loadData}
          fearAndGreed={fearAndGreed}
        />
      )}

      {/* CRYPTOCRAFT ECONOMIC & CRYPTO CALENDAR (1:1 with https://www.cryptocraft.com/calendar) */}
      {activeView === 'cryptocraft_calendar' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>📅 CryptoCraft Economic Calendar (Live Real-Time)</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'my'
                  ? 'CryptoCraft စတိုင် မက်ခရို စီးပွားရေးနှင့် Crypto တိုကင် သော့ဖွင့်မှု အပြည့်အစုံ (မြန်မာစံတော်ချိန် နှင့် Wall Street EDT)'
                  : 'Institutional macroeconomic indicators, Fed policy announcements, and crypto token unlock catalysts'}
              </p>
            </div>

            <button
              onClick={handleStepBack}
              className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
            </button>
          </div>

          <CryptoCraftCalendar
            lang={lang}
            refreshTrigger={globalRefreshTrigger}
            onNavigateView={navigateToView}
            onSelectCoin={(sym) => {
              const found = coins.find((c) => c.symbol.toUpperCase() === sym.toUpperCase());
              if (found) setSelectedCoin(found);
              navigateToView('dual_engine');
            }}
            onOpenTradeModal={(sym) => {
              const found = coins.find((c) => c.symbol.toUpperCase() === sym.toUpperCase());
              if (found) setSelectedCoin(found);
              handleGoToTradeWithPreset({
                symbol: sym,
                side: 'LONG',
                margin: Math.max(50, Math.round(walletBalance * 0.1)),
                leverage: 10,
              });
            }}
            onAskAI={(prompt) => {
              setAiInitialMode('ask_ai');
              navigateToView('ai');
            }}
          />
        </div>
      )}

      {/* COINMARKETCAP INTELLIGENCE HUB (GLOBAL VS TOP 5 FEAR & GREED, ETF, CHAINS) */}
      {activeView === 'cmc' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>📊 CoinMarketCap Market Intelligence Hub</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'my'
                  ? 'ကမ္ဘာ့စျေးကွက် vs သတ်မှတ်ထားသော Coin ၅ ခု Fear & Greed ယှဉ်ပြိုင်မှု၊ Spot ETF စီးဆင်းမှု၊ Chain TVL နှင့် အဖွဲ့အစည်းပိုင်ဆိုင်မှုများ'
                  : 'Institutional macro metrics: Global vs Portfolio Fear & Greed comparison, ETF net flows, chain rankings & derivatives'}
              </p>
            </div>

            <button
              onClick={handleStepBack}
              className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
            </button>
          </div>

          <ErrorBoundary
            viewName="CoinMarketCap Hub"
            onReset={() => {
              // Reset safely
            }}
          >
            <CoinMarketCapHub
              lang={lang}
              fearAndGreed={fearAndGreed}
              tickers={liveTickers}
              coins={coins}
              onSelectCoin={(c) => {
                setSelectedCoin(c);
                navigateToView('dual_engine');
              }}
              onTradeInDemo={(symbol, side) => {
                handleGoToTradeWithPreset({
                  symbol,
                  side,
                  margin: Math.max(50, Math.round(walletBalance * 0.1)),
                  leverage: 10,
                });
              }}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* DEDICATED STRATEGY & AI DECISION TERMINAL (3-WAY ANALYSIS) */}
      {activeView === 'dual_engine' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚡ Strategy & AI Decision Terminal</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'my'
                  ? 'နည်းပညာနှင့် ခရစ်ပတို အသိပညာ၊ သတ်မှတ်စည်းမျဉ်းများနှင့် ပေါင်းစပ်ဆုံးဖြတ်ချက် သုံးခု ခွဲခြမ်းစိတ်ဖြာမှု'
                  : '3-Way Analysis: Technical Crypto Intelligence, Established Rules & Balanced Consensus'}
              </p>
            </div>

            <button
              onClick={handleStepBack}
              className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
            </button>
          </div>

          <DualEngineDecisionTerminal
            coins={coins}
            selectedCoin={selectedCoin}
            onSelectCoin={setSelectedCoin}
            walletBalance={walletBalance}
            onWalletBalanceChange={handleWalletBalanceChange}
            onTradeInDemo={(symbol, side, customMargin, customLeverage) => {
              handleGoToTradeWithPreset({
                symbol,
                side,
                margin: customMargin || Math.max(50, Math.round(walletBalance * 0.1)),
                leverage: customLeverage || 10,
              });
            }}
            lang={lang}
            liveTickers={liveTickers}
            onOpenAI={(mode, sym) => {
              setAiInitialMode(mode || 'ask_ai');
              setAiInitialSymbol(sym);
              navigateToView('ai');
            }}
          />
        </div>
      )}

      {/* DEDICATED SPOT TRADING ADVISOR (ACCUMULATION & DCA) */}
      {activeView === 'spot_advisor' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>💎 Spot Trading & Accumulation Advisor</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'my'
                  ? 'စပေါ့ အဝယ်စုဆောင်းဇုန်၊ 3-Tier DCA လှေကားနှင့် အမြတ်ထုတ်ယူမှု ပစ်မှတ်များ'
                  : 'Wyckoff accumulation zones, 3-tier DCA ladder, and macro profit targets'}
              </p>
            </div>

            <button
              onClick={handleStepBack}
              className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
            </button>
          </div>

          <SpotTradingAdvisor
            liveTickers={liveTickers}
            lang={lang}
            onNavigateToDemo={(sym, side) => {
              handleGoToTradeWithPreset({
                symbol: sym,
                side: 'LONG',
                margin: Math.max(100, Math.round(walletBalance * 0.1)),
                leverage: 1, // Spot 1x
              });
            }}
            onOpenAI={(q) => {
              setAiInitialMode('ask_ai');
              navigateToView('ai');
            }}
          />
        </div>
      )}

      {/* DEDICATED LONG-TERM INVESTMENT HUB (1M, 3M, 6M, 1Y, 3Y) */}
      {activeView === 'long_term' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <LongTermInvestmentHub
            lang={lang}
            onNavigateToDemo={(symbol, side) => {
              handleGoToTradeWithPreset({
                symbol,
                side,
                margin: Math.max(100, Math.round(walletBalance * 0.1)),
                leverage: 1, // Long-term spot allocation mode
              });
            }}
            onOpenAI={(query) => {
              setAiInitialMode('ask_ai');
              navigateToView('ai');
            }}
            accentColor={settings.appearance.accentColor}
          />
        </div>
      )}

        {/* FUTURES WALLET RISK & STRATEGY ADVISOR (DEDICATED VIEW) */}
        {activeView === 'wallet_advisor' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🧭 Futures Wallet Risk & Strategy Advisor</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'Wallet အလိုက် (၁) နည်းပညာ vs (၂) ငါ့စည်းမျဉ်း ၂ ပိုင်းခွဲစိစစ်ချက်၊ Trade နည်းလမ်း၊ အရေအတွက်နှင့် မဖြစ်မနေသိသင့်သည်များ'
                    : 'Dual-Track Risk Evaluation (Tech vs My Rules), Sizing, Strategy Selection, and Checklist'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <WalletRiskStrategyAdvisor
              walletBalance={walletBalance}
              onWalletBalanceChange={handleWalletBalanceChange}
              lang={lang}
              liveTickers={liveTickers}
              onNavigateView={navigateToView}
              onRefreshTickers={loadData}
            />
          </div>
        )}

        {/* AI TRADING ASSISTANT (3 MODES: Quick Trade, Deep Analysis, Ask AI) */}
        {activeView === 'ai' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚡ 🧠 💬 AI Trading Assistant (Mode ၃ မျိုး စနစ်)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? '⚡ အမြန်ဆုံးဖြတ်ချက် (Quick) • 🧠 ၂၄ ချက်ပြည့် အဆင့်မြင့်စစ်ဆေးမှု (Deep) • 💬 အမေးအဖြေ (Ask AI)'
                    : '1. Quick Trade Mode • 2. Deep Analysis Mode • 3. Ask AI Mode'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <AITradingAssistant
              coins={coins}
              liveTickers={liveTickers}
              selectedCoin={selectedCoin}
              onSelectCoin={handleSelectCoin}
              onGoToTradePreset={handleGoToTradeWithPreset}
              lang={lang}
              margin={margin}
              leverage={leverage}
              walletBalance={walletBalance}
              onWalletBalanceChange={handleWalletBalanceChange}
              onBack={handleStepBack}
              initialMode={aiInitialMode}
              initialSymbol={aiInitialSymbol}
            />
          </div>
        )}

        {/* 1.5. EASY SIGNALS COPY MODE (အမြန် စစ်ဂနယ် ကော်ပီမုဒ် - ZERO-DELAY BINANCE COPY) */}
        {activeView === 'signals_copy' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <EasySignalsCopyHub
              coins={coins}
              liveTickers={liveTickers}
              lang={lang}
              margin={margin}
              leverage={leverage}
              walletBalance={walletBalance}
              onWalletBalanceChange={handleWalletBalanceChange}
              onGoToTradePreset={handleGoToTradeWithPreset}
              onBack={handleStepBack}
              onNavigateView={navigateToView}
              onOpenInAppTerminal={handleOpenInAppTerminal}
            />
          </div>
        )}

        {/* 2. STRATEGY HUB (ကုန်သွယ်မှု စတိုင်လ် ၅ မျိုး) */}
        {activeView === 'strategy' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚡ Multi-Style Trading Strategy Hub (ကုန်သွယ်မှု စတိုင်လ်များ)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'Scalping, Day, Swing, Position, Long-Term (မိမိသတ်မှတ်ချက် vs နည်းပညာအကြံပြုချက် နှင့် Trade Card)'
                    : 'Five trading archetypes with independent technical ATR models & formatted trade cards'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <MultiStyleTradeCards
              coins={coins}
              selectedCoin={selectedCoin}
              onGoToTrade={handleGoToTradeWithPreset}
              lang={lang}
              walletBalance={walletBalance}
              onWalletBalanceChange={handleWalletBalanceChange}
              onNavigateToSignalsCopy={() => navigateToView('signals_copy')}
            />
          </div>
        )}

        {/* 3. RISK & 10% CALCULATOR (အန္တရာယ်စီမံခန့်ခွဲမှု & တွက်ချက်စနစ်) */}
        {activeView === 'calculator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📐 Position & Risk Management Calculator (အန္တရာယ် & 10% စနစ်)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'အကောင့်လက်ကျန်အပေါ်မူတည်၍ အရင်းအနှီးထိန်းသိမ်းမှု၊ Leverage Buffer နှင့် 10% ဖြစ်နိုင်ခြေတွက်ချက်မှု'
                    : 'Capital preservation, noise-immune leverage, drawdown at SL, and feasibility audit'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <PositionCalculator
              coins={coins}
              selectedCoin={selectedCoin}
              onSelectCoin={setSelectedCoin}
              onGoToTrade={handleGoToTradeWithPreset}
              lang={lang}
              walletBalance={walletBalance}
              onWalletBalanceChange={handleWalletBalanceChange}
            />
          </div>
        )}

        {/* 4. LIVE SCANNER TABLE (စျေးကွက်တိုက်ရိုက်စစ်ဆေးဇယား) */}
        {activeView === 'scanner' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📊 Live Market Scanner Table (Binance USDⓈ-M Futures)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'Futures Coins စာရင်း၊ 24h Change, Volume, Funding Rate စစ်ဆေးမှုနှင့် Instant Trade Card ထုတ်ယူခြင်း'
                    : 'Full live contract feed with volume sorting, funding rate trackers, and quick card triggers'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <LiveScannerTable
              tickers={liveTickers}
              onSelectTicker={handleSelectTicker}
              onGenerateTradeCard={(ticker) => setInstantCardTicker(ticker)}
              onTradeInDemo={handleTradeInDemo}
              onOpenPriceAlert={handleOpenPriceAlert}
              lang={lang}
              onRefresh={loadData}
              isLoading={isLoading}
              scanMode={scanMode}
              onToggleScanMode={handleToggleScanMode}
              walletBalance={walletBalance}
              onWalletBalanceChange={handleWalletBalanceChange}
            />
          </div>
        )}

        {/* 5. MASTER TRADE CARD & SIMULATOR (ပုံတင်စနစ်) */}
        {activeView === 'tradecard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎯 Master Trade Card & Chart Analyzer (ပုံတင်စနစ်)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'Section 13 Master Setup နှင့် မိမိ TradingView Chart ပုံတင်၍ စစ်ဆေးမှု'
                    : 'Section 13 high-risk setup and custom multi-image chart screenshot analysis'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <MasterTradeCard
              margin={margin}
              setMargin={setMargin}
              leverage={leverage}
              setLeverage={setLeverage}
              onGoToTrade={handleGoToTradeWithPreset}
              lang={lang}
              walletBalance={walletBalance}
              onWalletBalanceChange={handleWalletBalanceChange}
              onOpenInAppTerminal={handleOpenInAppTerminal}
            />

            <CustomTradeSimulator
              coins={coins}
              margin={margin}
              setMargin={setMargin}
              leverage={leverage}
              setLeverage={setLeverage}
              onGoToTrade={handleGoToTradeWithPreset}
              lang={lang}
            />
          </div>
        )}

        {/* 6. BINANCE USDⓈ-M FUTURES DEMO TRADING TERMINAL */}
        {activeView === 'demo' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚡ Futures Demo Trading (USDⓈ-M Terminal)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'Binance USDⓈ-M Futures ပုံစံတူ ဒေမိုကုန်သွယ်မှုစနစ် (Virtual 10,000 USDT Balance ဖြင့် Position ဖွင့်/ပိတ် လေ့ကျင့်နိုင်သည်)'
                    : 'USDⓈ-M Futures demo simulator with interactive order book, live chart ticks, and persisted $10,000 virtual balance'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <BinanceStyleFuturesDemo
              coins={coins}
              allTickers={liveTickers}
              initialSymbol={demoInitialSymbol}
              initialSide={demoInitialSide}
              presetTrade={demoPreset}
              lang={lang}
            />
          </div>
        )}

        {/* BINANCE IN-APP LIVE TRADING TERMINAL (NO POPUP / IN-APP EMBEDDED WORKSPACE) */}
        {activeView === 'binance_live' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    ⚡
                  </span>
                  <span>{lang === 'my' ? 'Binance In-App တိုက်ရိုက်ကုန်သွယ်ရေး စနစ်' : 'Binance In-App Live Trading Terminal'}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'အက်ပ်ထဲတွင်ပင် တိုက်ရိုက် TradingView Chart ကြည့်ရှုပြီး Position ဖွင့်နိုင်သည် (Single Persistent Tab ဖြင့် Binance သို့ တိုက်ရိုက်ချိတ်ဆက် Sync ပြုလုပ်နိုင်သည်)'
                    : 'Embedded live chart, simulated position tracker, and 1-click sync to your single persistent Binance session'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <BinanceInAppTerminal
              initialSymbol={binanceTerminalSymbol}
              initialSide={binanceTerminalSide}
              presetTrade={binanceTerminalPreset}
              coins={coins}
              allTickers={liveTickers}
              lang={lang}
              onBack={handleStepBack}
            />
          </div>
        )}

        {/* 7. STANDALONE CRYPTO LEARNING CENTER (MASTERCLASS & SIMULATORS) */}
        {activeView === 'learning' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <LearningCenter onBackToApp={handleStepBack} />
          </div>
        )}

        {/* 8. MARKET TIMING & NEWS ENGINE (DEDICATED FULL VIEW) */}
        {activeView === 'market_timing' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-emerald-500" />
                  <span>{lang === 'my' ? 'စျေးကွက် အချိန်ကိုက် & သတင်းစနစ်' : 'Market Timing & News Awareness Engine'}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'PRIME / CAUTION / AVOID / WAIT အဆင့်သတ်မှတ်ချက်၊ စက်ရှင်ထပ်တူကျမှုနှင့် သတင်းသတိပေးချက်များ'
                    : 'Session overlaps, economic news catalysts, timing scores, and trade condition safety filters'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <MarketTimingEngine
              language={lang}
              onNavigateToNews={() => setIsNewsModalOpen(true)}
            />
          </div>
        )}

        {/* 9. GLOBAL WORLD MARKET CLOCKS (DEDICATED FULL VIEW) */}
        {activeView === 'world_clocks' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>{lang === 'my' ? 'ကမ္ဘာ့စျေးကွက် နာရီများ (ပင်မစာမျက်နှာနှင့် ပေါင်းစပ်ထားသည်)' : 'Global World Market Clocks (Integrated on Home)'}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'ရန်ကုန်၊ နယူးယောက်၊ လန်ဒန်၊ တိုကျို၊ စင်ကာပူ၊ ဒူဘိုင်း တိုက်ရိုက်နာရီများကို ပင်မစာမျက်နှာ (Home) တွင်လည်း တိုက်ရိုက်ကြည့်ရှုနိုင်ပါသည်'
                    : 'Circular analog-style clocks, country times, session status, also visible directly on the Home dashboard'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateToView('home')}
                  className="text-xs font-bold text-slate-900 dark:text-white bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{lang === 'my' ? 'ပင်မသို့' : 'Home'}</span>
                </button>
                <button
                  onClick={handleStepBack}
                  className="text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
                </button>
              </div>
            </div>

            <WorldMarketClocks
              clockSettings={settings.clock.settings}
              activeCityIds={settings.clock.activeCityIds}
              perCityWallpapers={settings.clock.perCityWallpapers}
              language={lang}
              onUpdateSettings={handleUpdateClockSettings}
              onUpdateActiveCities={handleUpdateActiveCities}
              onUpdateCityWallpaper={handleUpdateCityWallpaper}
              onResetAllWallpapers={handleResetAllWallpapers}
            />
          </div>
        )}

        {/* 10. HIGH-LEVERAGE TRADING MODE (10x-100x) */}
        {activeView === 'high_leverage' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <span>{lang === 'my' ? 'High-Leverage စွန့်စားမှု ထိန်းချုပ်မုဒ် (10x - 100x)' : 'High-Leverage Trading Mode (10x - 100x)'}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'my'
                    ? 'အကောင့်ဆုံးရှုံးနိုင်ခြေ ၂% ထက် မကျော်စေရန် စည်းကမ်းချက်များနှင့် AI Risk Audit စနစ်'
                    : 'Enforce strict capital preservation, 2% risk limits, liquidation buffers, and AI validation'}
                </p>
              </div>

              <button
                onClick={handleStepBack}
                className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'နောက်သို့' : 'Back'}</span>
              </button>
            </div>

            <HighLeverageTradingMode
              currentPrice={selectedCoin ? selectedCoin.currentPrice : (coins.find((c) => c.symbol === 'BTC')?.currentPrice || 77000)}
              symbol={selectedCoin ? selectedCoin.symbol : 'BTC'}
              language={lang}
              coins={coins}
              liveTickers={liveTickers}
              walletBalance={walletBalance}
              onWalletBalanceChange={handleWalletBalanceChange}
              onBack={handleStepBack}
              onExecuteTrade={(trade) => {
                const preset: DemoTradePreset = {
                  symbol: trade.symbol,
                  side: trade.side,
                  entryPrice: trade.entry,
                  tpPrice: trade.takeProfit,
                  slPrice: trade.stopLoss,
                  leverage: trade.leverage,
                  margin: trade.margin,
                };
                setDemoInitialSymbol(trade.symbol);
                setDemoInitialSide(trade.side);
                setDemoPreset(preset);
                navigateToView('demo');
              }}
            />
          </div>
        )}
          </main>
        </div>
      </div>

      {/* Phone Layout: Mobile-First Bottom Navigation Bar */}
      {activeLayout === 'phone' && (
        <MobileBottomNav
          activeView={activeView}
          onSelectView={navigateToView}
          onOpenMenu={() => setIsDrawerOpen(true)}
          lang={lang}
          contained={isPhoneMode}
        />
      )}

      {/* Central System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetSettings={handleResetSettings}
        lang={lang}
        onLanguageChange={handleSetLang}
      />

      {/* Curated High-Impact Crypto News Modal */}
      <MarketNewsModal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        lang={lang}
        onSelectCoin={(symbol) => {
          setDemoInitialSymbol(symbol);
          navigateToView('demo');
        }}
        liveNews={liveNews}
        onRefreshNews={handleRefreshNews}
        isLoadingNews={isLoadingNews}
      />

      {/* Instant Section 13 Master Trade Card Modal for Ready (LONG/SHORT) Coins */}
      {instantCardTicker && (
        <InstantTradeCardModal
          ticker={instantCardTicker}
          margin={margin}
          leverage={leverage}
          onClose={() => setInstantCardTicker(null)}
          onTradeInDemo={handleTradeInDemo}
          onGoToTradePreset={handleGoToTradeWithPreset}
          lang={lang}
          walletBalance={walletBalance}
          onWalletBalanceChange={handleWalletBalanceChange}
          onOpenInAppTerminal={handleOpenInAppTerminal}
        />
      )}

      {/* Technical Terms Glossary Modal (Rule 14) */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        lang={lang}
      />

      {/* Technical Detail Modal */}
      {modalCoin && (
        <CoinDetailModal
          coin={modalCoin}
          onClose={() => setModalCoin(null)}
          lang={lang}
          walletBalance={walletBalance}
          onWalletBalanceChange={handleWalletBalanceChange}
          onBacktestSetup={handleBacktestCoinSetup}
          onTradeInDemo={handleTradeInDemo}
          onOpenAI={handleOpenAIAssistant}
          onOpenPriceAlert={handleOpenPriceAlert}
          onGenerateTradeCard={(coin) => {
            const matchedTicker = liveTickers.find((t) => t.symbol === coin.symbol) || {
              symbol: coin.symbol,
              contract: coin.pair,
              lastPrice: coin.currentPrice,
              change24h: coin.change24h,
              high24h: coin.currentPrice * 1.05,
              low24h: coin.currentPrice * 0.95,
              volume24hUsd: coin.volume24hUsd || 150000000,
              fundingRate: coin.fundingRate,
              feasibility: coin.feasibility10Percent,
              bias: coin.bias,
            };
            setInstantCardTicker(matchedTicker);
          }}
        />
      )}

      {/* Global Real-Time Price Alert Notification Toast Overlay */}
      <PriceAlertToast
        toasts={alertToasts}
        onDismiss={handleDismissToast}
        onClearAll={handleClearAllToasts}
        onViewAlerts={() => {
          setIsAlertModalOpen(true);
        }}
        lang={lang}
      />

      {/* Real-time Price Alerts Hub Modal */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alerts={alerts}
        liveTickers={liveTickers}
        onAddAlert={handleAddAlert}
        onDeleteAlert={handleDeleteAlert}
        onRearmAlert={handleRearmAlert}
        onToggleActive={handleToggleAlertActive}
        onClearHistory={handleClearAlertHistory}
        onTestAlertToast={handleTestAlertToast}
        initialSymbol={alertModalInitialSymbol}
        lang={lang}
      />
    </div>
  );

  return isPhoneMode ? (
    <PhoneDeviceFrame
      activeLayout={activeLayout}
      layoutSelection={layoutSelection}
      onSelectLayout={handleSelectLayout}
      lang={lang}
    >
      {content}
    </PhoneDeviceFrame>
  ) : (
    content
  );
}
