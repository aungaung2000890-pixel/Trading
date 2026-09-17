import { AppTheme, AccentColor, AppSettings, MarketClockSettings, CustomLogoSettings, CustomBackgroundSettings } from '../types';

export const DEFAULT_CLOCK_SETTINGS: MarketClockSettings = {
  showSeconds: true,
  is24Hour: false,
  showDigitalTime: true,
  showUtcOffset: true,
  showMarketStatus: true,
  clockSize: 'standard',
  clockStyle: 'tactical',
  backgroundOpacity: 0.35,
  textBrightness: 'high',
  numberVisibility: 'cardinals',
  sessionIndicator: true,
};

export const DEFAULT_LOGO_SETTINGS: CustomLogoSettings = {
  customLogoUrl: null,
  presetId: 'binance_lightning',
  logoText: 'Trade by KA',
  logoHeight: 36,
  shape: 'rounded',
  showText: true,
};

export const DEFAULT_BACKGROUND_SETTINGS: CustomBackgroundSettings = {
  enabled: true,
  imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=2000&q=80', // Sleek dark cyber trading grid
  presetId: 'cyber_grid',
  position: 'center',
  positionCustomX: 50,
  positionCustomY: 50,
  scale: 'cover',
  scalePercent: 100,
  brightness: 75,
  opacity: 28, // optimized for dark terminal readability
  blur: 2,
  repeat: 'no-repeat',
};

export const TERMINAL_WALLPAPER_PRESETS = [
  {
    id: 'cyber_grid',
    name: 'Cyberpunk Grid',
    nameMy: 'ဆိုက်ဘာ ဂရစ်ကွက်',
    url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=300&q=60',
  },
  {
    id: 'deep_space',
    name: 'Deep Space Nebula',
    nameMy: 'စကြဝဠာ နက်ဗျူလာ',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=60',
  },
  {
    id: 'tokyo_night',
    name: 'Tokyo Neon City',
    nameMy: 'တိုကျို နီယွန်ည',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=60',
  },
  {
    id: 'ny_financial',
    name: 'Wall Street Twilight',
    nameMy: 'ဝေါလ်စထရိ ညနေဆည်းဆာ',
    url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=300&q=60',
  },
  {
    id: 'dark_carbon',
    name: 'Dark Carbon Texture',
    nameMy: 'ကာဗွန် အမည်းသား',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=60',
  },
  {
    id: 'financial_wave',
    name: 'Trading Waves & Flow',
    nameMy: 'ဂရပ်ဖစ် လှိုင်းစီးဆင်းမှု',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=60',
  },
];

export const LOGO_PRESETS = [
  {
    id: 'binance_lightning',
    name: 'Lightning Spark',
    iconName: 'Zap',
    bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
  },
  {
    id: 'gold_bull',
    name: 'Bull Market Flame',
    iconName: 'Flame',
    bgClass: 'bg-rose-500/10 border-rose-500/30 text-rose-500',
  },
  {
    id: 'cyber_shield',
    name: 'Capital Shield',
    iconName: 'ShieldCheck',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
  },
  {
    id: 'terminal_radar',
    name: 'Trading Radar',
    iconName: 'Compass',
    bgClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  },
  {
    id: 'quantum_spark',
    name: 'Quantum AI',
    iconName: 'Sparkles',
    bgClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  general: {
    language: 'my',
    defaultTradingMode: 'quick',
    timeFormat: '12h',
    defaultTimeframe: '15M',
  },
  market: {
    preferredMarket: 'both',
    defaultExchange: 'binance',
    defaultCryptoPair: 'BTCUSDT',
    defaultForexPair: 'EURUSD',
  },
  clock: {
    settings: DEFAULT_CLOCK_SETTINGS,
    activeCityIds: ['new_york', 'london', 'tokyo', 'singapore', 'hong_kong', 'sydney'],
    perCityWallpapers: {},
  },
  appearance: {
    theme: 'dark_trading',
    accentColor: 'amber',
    cardTransparency: 'subtle',
    logo: DEFAULT_LOGO_SETTINGS,
    background: DEFAULT_BACKGROUND_SETTINGS,
  },
  trading: {
    defaultLeverage: 20,
    maxRiskPercent: 2,
    defaultMargin: 150,
    tradingStyle: 'short_term',
  },
  alerts: {
    londonOpen: true,
    nyOpen: true,
    asiaOpen: true,
    londonNyOverlap: true,
    majorEconomicEvent: true,
    highVolatility: true,
    highQualitySetup: true,
    liquidationRisk: true,
  },
};

const SETTINGS_STORAGE_KEY = 'mmka_terminal_settings_v4';

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_APP_SETTINGS,
        ...parsed,
        general: { ...DEFAULT_APP_SETTINGS.general, ...(parsed.general || {}) },
        market: { ...DEFAULT_APP_SETTINGS.market, ...(parsed.market || {}) },
        clock: {
          ...DEFAULT_APP_SETTINGS.clock,
          ...(parsed.clock || {}),
          settings: { ...DEFAULT_CLOCK_SETTINGS, ...(parsed.clock?.settings || {}) },
          perCityWallpapers: { ...(parsed.clock?.perCityWallpapers || {}) },
        },
        appearance: {
          ...DEFAULT_APP_SETTINGS.appearance,
          ...(parsed.appearance || {}),
          logo: {
            ...DEFAULT_LOGO_SETTINGS,
            ...(parsed.appearance?.logo || {}),
            logoText:
              !parsed.appearance?.logo?.logoText ||
              parsed.appearance?.logo?.logoText === 'Binance USDⓈ-M Futures Terminal' ||
              parsed.appearance?.logo?.logoText.includes('Binance USDⓈ-M')
                ? 'Trade by KA'
                : parsed.appearance.logo.logoText,
          },
          background: {
            ...DEFAULT_BACKGROUND_SETTINGS,
            ...(parsed.appearance?.background || {}),
          },
        },
        trading: { ...DEFAULT_APP_SETTINGS.trading, ...(parsed.trading || {}) },
        alerts: { ...DEFAULT_APP_SETTINGS.alerts, ...(parsed.alerts || {}) },
      };
    }
  } catch (e) {
    console.warn('Failed to parse stored settings:', e);
  }
  return DEFAULT_APP_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export function applyThemeToDom(theme: AppTheme, accent: AccentColor): void {
  const root = document.documentElement;

  // Clear existing theme classes
  root.classList.remove('dark', 'theme-midnight', 'theme-graphite', 'theme-light', 'theme-cyber');

  if (theme === 'light_trading') {
    root.classList.add('theme-light');
  } else {
    root.classList.add('dark');
    if (theme === 'midnight') root.classList.add('theme-midnight');
    else if (theme === 'graphite') root.classList.add('theme-graphite');
    else if (theme === 'cyber_neon') root.classList.add('theme-cyber');
  }

  // Set accent color attribute for styling
  root.setAttribute('data-accent', accent);
}
