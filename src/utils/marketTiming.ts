import {
  WorldMarketClockItem,
  SessionOverlapInfo,
  EconomicNewsEvent,
  CryptoNewsCatalyst,
  MarketTimingAssessment,
  TimingWindowStatus,
} from '../types';

// Preset city skyline wallpapers (high resolution, night & twilight optimized)
export const CITY_WALLPAPER_PRESETS: Record<string, string> = {
  new_york: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  hong_kong: 'https://images.unsplash.com/photo-1506970845246-18f21d533b20?auto=format&fit=crop&w=800&q=80',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  frankfurt: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
};

// All available global market cities
export const ALL_WORLD_CITIES: WorldMarketClockItem[] = [
  {
    id: 'new_york',
    city: 'New York',
    cityMy: 'နယူးယောက်',
    country: 'United States',
    flag: '🇺🇸',
    timeZone: 'America/New_York',
    sessionName: 'U.S. Session (NYSE/NASDAQ)',
    sessionNameMy: 'အမေရိကန် စျေးကွက်စက်ရှင်',
    sessionOpenUtc: 13.5, // 09:30 AM EDT -> 13:30 UTC
    sessionCloseUtc: 20,  // 04:00 PM EDT -> 20:00 UTC
    sessionOpenLocal: '09:30 AM',
    sessionCloseLocal: '04:00 PM',
    wallpaperPresetKey: 'new_york',
    enabled: true,
  },
  {
    id: 'london',
    city: 'London',
    cityMy: 'လန်ဒန်',
    country: 'United Kingdom',
    flag: '🇬🇧',
    timeZone: 'Europe/London',
    sessionName: 'European Session (LSE)',
    sessionNameMy: 'ဥရောပ စျေးကွက်စက်ရှင်',
    sessionOpenUtc: 8,   // 08:00 AM BST -> 08:00 UTC
    sessionCloseUtc: 16.5,// 04:30 PM BST -> 16:30 UTC
    sessionOpenLocal: '08:00 AM',
    sessionCloseLocal: '04:30 PM',
    wallpaperPresetKey: 'london',
    enabled: true,
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    cityMy: 'တိုကျို',
    country: 'Japan',
    flag: '🇯🇵',
    timeZone: 'Asia/Tokyo',
    sessionName: 'Tokyo Session (TSE)',
    sessionNameMy: 'တိုကျို စျေးကွက်စက်ရှင်',
    sessionOpenUtc: 0,   // 09:00 AM JST -> 00:00 UTC
    sessionCloseUtc: 6,   // 03:00 PM JST -> 06:00 UTC
    sessionOpenLocal: '09:00 AM',
    sessionCloseLocal: '03:00 PM',
    wallpaperPresetKey: 'tokyo',
    enabled: true,
  },
  {
    id: 'singapore',
    city: 'Singapore',
    cityMy: 'စင်ကာပူ',
    country: 'Singapore',
    flag: '🇸🇬',
    timeZone: 'Asia/Singapore',
    sessionName: 'Asian Financial Hub (SGX)',
    sessionNameMy: 'စင်ကာပူ ငွေကြေးဗဟိုစက်ရှင်',
    sessionOpenUtc: 1,   // 09:00 AM SGT -> 01:00 UTC
    sessionCloseUtc: 9,   // 05:00 PM SGT -> 09:00 UTC
    sessionOpenLocal: '09:00 AM',
    sessionCloseLocal: '05:00 PM',
    wallpaperPresetKey: 'singapore',
    enabled: true,
  },
  {
    id: 'hong_kong',
    city: 'Hong Kong',
    cityMy: 'ဟောင်ကောင်',
    country: 'Hong Kong',
    flag: '🇭🇰',
    timeZone: 'Asia/Hong_Kong',
    sessionName: 'Asian Market Session (HKEX)',
    sessionNameMy: 'ဟောင်ကောင် စျေးကွက်စက်ရှင်',
    sessionOpenUtc: 1.5, // 09:30 AM HKT -> 01:30 UTC
    sessionCloseUtc: 8,   // 04:00 PM HKT -> 08:00 UTC
    sessionOpenLocal: '09:30 AM',
    sessionCloseLocal: '04:00 PM',
    wallpaperPresetKey: 'hong_kong',
    enabled: true,
  },
  {
    id: 'sydney',
    city: 'Sydney',
    cityMy: 'ဆစ်ဒနီ',
    country: 'Australia',
    flag: '🇦🇺',
    timeZone: 'Australia/Sydney',
    sessionName: 'Asia-Pacific Session (ASX)',
    sessionNameMy: 'အာရှ-ပစိဖိတ် စျေးကွက်စက်ရှင်',
    sessionOpenUtc: 23,  // 10:00 AM AEST -> 23:00 UTC
    sessionCloseUtc: 6,   // 04:00 PM AEST -> 06:00 UTC (crosses midnight)
    sessionOpenLocal: '10:00 AM',
    sessionCloseLocal: '04:00 PM',
    wallpaperPresetKey: 'sydney',
    enabled: true,
  },
  {
    id: 'frankfurt',
    city: 'Frankfurt',
    cityMy: 'ဖရန့်ဖတ်',
    country: 'Germany',
    flag: '🇩🇪',
    timeZone: 'Europe/Berlin',
    sessionName: 'Euro Area Hub (Xetra)',
    sessionNameMy: 'ဂျာမနီ ဥရောပစက်ရှင်',
    sessionOpenUtc: 7,
    sessionCloseUtc: 15.5,
    sessionOpenLocal: '09:00 AM',
    sessionCloseLocal: '05:30 PM',
    wallpaperPresetKey: 'frankfurt',
    enabled: false,
  },
  {
    id: 'dubai',
    city: 'Dubai',
    cityMy: 'ဒူဘိုင်း',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    timeZone: 'Asia/Dubai',
    sessionName: 'Middle East Hub (DFM)',
    sessionNameMy: 'အရှေ့အလယ်ပိုင်း စက်ရှင်',
    sessionOpenUtc: 6,
    sessionCloseUtc: 11,
    sessionOpenLocal: '10:00 AM',
    sessionCloseLocal: '03:00 PM',
    wallpaperPresetKey: 'dubai',
    enabled: false,
  },
];

// Major Session Overlaps
export const SESSION_OVERLAPS: SessionOverlapInfo[] = [
  {
    id: 'london_ny',
    name: 'London + New York Overlap',
    nameMy: 'လန်ဒန် + နယူးယောက် ထပ်တူကျစက်ရှင် (London & NY Overlap)',
    sessions: ['London', 'New York'],
    startUtc: 13.5, // 13:30 UTC
    endUtc: 16.5,   // 16:30 UTC
    significanceEn: 'Peak global liquidity and highest intraday volatility. Ideal for Breakout & Momentum trades.',
    significanceMy: 'ကမ္ဘာ့ငွေဖြစ်လွယ်မှု အမြင့်ဆုံးနှင့် စျေးအတက်အကျ အသွက်ဆုံးအချိန်။ Breakout နှင့် Momentum အတွက် အကောင်းဆုံး။',
    liquidityScore: 'VERY HIGH',
    volatilityScore: 'EXPANDING',
    active: false,
  },
  {
    id: 'tokyo_london',
    name: 'Tokyo + London Transition',
    nameMy: 'တိုကျို + လန်ဒန် ကူးပြောင်းချိန် (Transition Window)',
    sessions: ['Tokyo', 'London'],
    startUtc: 7.0,
    endUtc: 8.5,
    significanceEn: 'Asian range breakout traps and European liquidity grab sweeps before the true trend forms.',
    significanceMy: 'အာရှ စျေးကွက် Range ဖောက်ထွက်ပြီး ဥရောပ Liquidity ကို စတင်ရယူချိန် (Fakeout သတိပြုပါ)။',
    liquidityScore: 'HIGH',
    volatilityScore: 'MODERATE',
    active: false,
  },
  {
    id: 'asia_session',
    name: 'Asia Session (Tokyo / SG / HK / Sydney)',
    nameMy: 'အာရှ စျေးကွက်စက်ရှင် (Asia Major Window)',
    sessions: ['Tokyo', 'Singapore', 'Hong Kong', 'Sydney'],
    startUtc: 0,
    endUtc: 9,
    significanceEn: 'BTC & Altcoin range formation, accumulation, Asian equity market reaction, and regional macro news.',
    significanceMy: 'BTC နှင့် Crypto စျေးကွက် အပိုင်းအခြား (Range) တည်ဆောက်ခြင်းနှင့် အာရှစတော့စျေးကွက် တုံ့ပြန်မှုများ။',
    liquidityScore: 'MODERATE',
    volatilityScore: 'COMPRESSED',
    active: false,
  },
];

// Curated Live Economic Calendar Events
export const ECONOMIC_EVENTS_CALENDAR: EconomicNewsEvent[] = [
  {
    id: 'cpi_us',
    title: 'US CPI (Consumer Price Index) Inflation Data',
    titleMy: 'အမေရိကန် စားသုံးသူကုန်စျေးနှုန်း အညွှန်းကိန်း (CPI)',
    currency: 'USD',
    impact: 'HIGH',
    timeStr: '12:30 UTC',
    minutesUntil: 45,
    phase: 'before',
    forecast: '2.9%',
    previous: '3.1%',
    adviceEn: 'Avoid opening new high-leverage orders 30 mins before release. Spread widening and slippage risk are extreme.',
    adviceMy: 'CPI မထွက်မီ မိနစ် ၃၀ အတွင်း အော်ဒါအသစ်မဖွင့်ပါနှင့်။ စျေးကွက်လှိုင်းခတ်မှုနှင့် Slippage အလွန်မြင့်မားပါမည်။',
  },
  {
    id: 'fomc_rates',
    title: 'FOMC Federal Reserve Interest Rate Decision',
    titleMy: 'အမေရိကန် ဗဟိုဘဏ် အတိုးနှုန်း ဆုံးဖြတ်ချက် (FOMC Rates)',
    currency: 'USD',
    impact: 'HIGH',
    timeStr: '18:00 UTC',
    minutesUntil: 180,
    phase: 'before',
    forecast: '5.25%',
    previous: '5.50%',
    adviceEn: 'Wait for Powell press conference reaction and 15M candle structure close before trading.',
    adviceMy: 'အတိုးနှုန်းကြေညာပြီးနောက် သတင်းစာရှင်းလင်းပွဲနှင့် 15M ဖယောင်းတိုင်ပိတ်သည်အထိ စောင့်ကြည့်အတည်ပြုပါ။',
  },
  {
    id: 'nfp_jobs',
    title: 'US Non-Farm Payrolls (NFP) & Unemployment',
    titleMy: 'အမေရိကန် စိုက်ပျိုးရေးမဟုတ်သော အလုပ်အကိုင်ရလဒ် (NFP)',
    currency: 'USD',
    impact: 'HIGH',
    timeStr: '12:30 UTC',
    minutesUntil: -25, // 25 mins ago
    phase: 'after',
    forecast: '175K',
    previous: '160K',
    adviceEn: 'News released. Do not chase initial spike wick. Wait for retest of broken key level and volume confirmation.',
    adviceMy: 'သတင်းထွက်ပြီးပါပြီ။ ကန်တက်သွားသော အမြီးနောက်သို့ မလိုက်ပါနှင့်။ Retest ဆင်းပြီးမှသာ အတည်ပြုဝင်ပါ။',
  },
  {
    id: 'ecb_rates',
    title: 'ECB Monetary Policy Statement & Rate Decision',
    titleMy: 'ဥရောပဗဟိုဘဏ် အတိုးနှုန်းမူဝါဒ ကြေညာချက် (ECB)',
    currency: 'EUR',
    impact: 'HIGH',
    timeStr: '12:15 UTC',
    minutesUntil: 320,
    phase: 'before',
    forecast: '3.50%',
    previous: '3.75%',
    adviceEn: 'Affects EUR/USD and overall DXY dollar index directly. Monitor correlated crypto reaction.',
    adviceMy: 'EUR/USD နှင့် ဒေါ်လာအညွှန်းကိန်းကို တိုက်ရိုက်သက်ရောက်ပြီး Crypto အပေါ် သွယ်ဝိုက်ရိုက်ခတ်ပါမည်။',
  },
];

// Curated Crypto News Catalysts
export const CRYPTO_CATALYSTS: CryptoNewsCatalyst[] = [
  {
    id: 'btc_etf_flows',
    title: 'Spot Bitcoin ETF Net Inflows Exceed +$340M in Past 24 Hours',
    titleMy: 'Spot Bitcoin ETF သို့ ၂၄ နာရီအတွင်း ဒေါ်လာ ၃၄၀ သန်းကျော် ထပ်မံစီးဝင်',
    category: 'ETF',
    impact: 'HIGH',
    sentiment: 'BULLISH',
    adviceEn: 'Institutional spot accumulation confirms underlying support floor. Look for pullback dips to long.',
    adviceMy: 'အဖွဲ့အစည်းကြီးများ Spot စုဆောင်းမှုကြောင့် Support ခိုင်မာနေပါသည်။ Dip ဆင်းချိန် အဝယ်ဖက် စောင့်ကြည့်ပါ။',
    timeAgo: '1 hour ago',
  },
  {
    id: 'sec_regulatory',
    title: 'CFTC & SEC Joint Clarification on Digital Asset Derivatives Custody',
    titleMy: 'Crypto စည်းမျဉ်းဆိုင်ရာ ပူးတွဲလမ်းညွှန်ချက် အတည်ပြု',
    category: 'REGULATORY',
    impact: 'MEDIUM',
    sentiment: 'NEUTRAL',
    adviceEn: 'Regulatory clarity reduces long-term tail risk, though short-term market reaction remains selective.',
    adviceMy: 'ရေရှည်အတွက် တည်ငြိမ်မှုပေးနိုင်သော်လည်း ရေတိုတွင် သီးသန့်ဒင်္ဂါးများသာ လှုပ်ခတ်နိုင်ပါသည်။',
    timeAgo: '3 hours ago',
  },
  {
    id: 'token_unlock_sol',
    title: 'Major Layer 1 Ecosystem Token Unlock Scheduled in 48 Hours',
    titleMy: 'လာမည့် ၄၈ နာရီအတွင်း Layer-1 Token အမြောက်အမြား Unlock ဖြစ်မည်',
    category: 'UNLOCK',
    impact: 'HIGH',
    sentiment: 'BEARISH',
    adviceEn: 'Short-term spot supply pressure expected. Tighten stop losses on altcoin swing positions.',
    adviceMy: 'Supply ရောင်းအား ဖိအားရှိနိုင်သဖြင့် Altcoin အော်ဒါများတွင် Stop Loss ကို တိကျစွာ ချထားပါ။',
    timeAgo: '5 hours ago',
  },
];

/**
 * Checks if a specific market city session is currently OPEN, PRE-MARKET, or CLOSED
 */
export function evaluateCitySessionStatus(
  city: WorldMarketClockItem,
  date: Date = new Date()
): {
  status: 'OPEN' | 'CLOSED' | 'PRE_MARKET';
  statusTextEn: string;
  statusTextMy: string;
  color: string;
} {
  // Convert UTC time to decimal hours (e.g. 13:30 -> 13.5)
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const dayOfWeekUtc = date.getUTCDay(); // 0 is Sun, 6 is Sat

  // Weekend check for traditional markets (Forex/Equities)
  if (dayOfWeekUtc === 0 || dayOfWeekUtc === 6) {
    return {
      status: 'CLOSED',
      statusTextEn: 'WEEKEND CLOSED',
      statusTextMy: 'စနေ/တနင်္ဂနွေ ပိတ်သည်',
      color: 'text-slate-400 bg-slate-800/80 border-slate-700',
    };
  }

  const { sessionOpenUtc, sessionCloseUtc } = city;
  let isOpen = false;

  if (sessionOpenUtc < sessionCloseUtc) {
    // Standard intraday session (e.g. 8 to 16.5)
    isOpen = utcHours >= sessionOpenUtc && utcHours < sessionCloseUtc;
  } else {
    // Cross-midnight session (e.g. 23 to 6)
    isOpen = utcHours >= sessionOpenUtc || utcHours < sessionCloseUtc;
  }

  // Pre-market check: 1 hour before sessionOpenUtc
  let isPreMarket = false;
  const preOpenUtc = (sessionOpenUtc - 1 + 24) % 24;
  if (preOpenUtc < sessionOpenUtc) {
    isPreMarket = utcHours >= preOpenUtc && utcHours < sessionOpenUtc;
  } else {
    isPreMarket = utcHours >= preOpenUtc || utcHours < sessionOpenUtc;
  }

  if (isOpen) {
    return {
      status: 'OPEN',
      statusTextEn: '● MARKET OPEN',
      statusTextMy: '● စျေးကွက်ဖွင့်နေသည်',
      color: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40',
    };
  } else if (isPreMarket) {
    return {
      status: 'PRE_MARKET',
      statusTextEn: '◌ PRE-MARKET',
      statusTextMy: '◌ စျေးကွက်ကြိုတင်ဖွင့်ချိန်',
      color: 'text-amber-400 bg-amber-950/70 border-amber-500/40',
    };
  } else {
    return {
      status: 'CLOSED',
      statusTextEn: '○ MARKET CLOSED',
      statusTextMy: '○ စျေးကွက်ပိတ်သည်',
      color: 'text-slate-400 bg-slate-900/70 border-slate-800',
    };
  }
}

/**
 * Evaluates full Market Timing State with Session Overlaps, Quality Score, and Window Status
 */
export function evaluateMarketTiming(date: Date = new Date()): MarketTimingAssessment {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const dayOfWeek = date.getUTCDay();

  // Evaluate active session overlaps
  const activeOverlaps = SESSION_OVERLAPS.map((overlap) => {
    let active = false;
    if (overlap.startUtc < overlap.endUtc) {
      active = utcHours >= overlap.startUtc && utcHours < overlap.endUtc;
    } else {
      active = utcHours >= overlap.startUtc || utcHours < overlap.endUtc;
    }
    return { ...overlap, active };
  });

  const activeOverlap = activeOverlaps.find((o) => o.active);

  // Active individual sessions
  const activeSessionNames: string[] = [];
  ALL_WORLD_CITIES.forEach((city) => {
    const status = evaluateCitySessionStatus(city, date);
    if (status.status === 'OPEN') {
      activeSessionNames.push(city.city);
    }
  });

  // Calculate Timing Score (0 to 10)
  let timingScore = 6.5;
  let windowStatus: TimingWindowStatus = 'CAUTION';
  let volumeLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let btcVolatility: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let forexVolatility: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let newsRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM';

  // Check if major economic event is within 30 minutes
  const imminentNews = ECONOMIC_EVENTS_CALENDAR.find(
    (e) => Math.abs(e.minutesUntil) <= 30 && e.impact === 'HIGH'
  );

  if (imminentNews) {
    timingScore = 4.2;
    windowStatus = 'AVOID';
    newsRiskLevel = 'EXTREME';
  } else if (activeOverlap?.id === 'london_ny') {
    // London + NY Overlap is the gold standard of liquidity and clean trend continuation
    timingScore = 9.1;
    windowStatus = 'PRIME';
    volumeLevel = 'HIGH';
    btcVolatility = 'HIGH';
    forexVolatility = 'HIGH';
    newsRiskLevel = 'LOW';
  } else if (activeSessionNames.includes('New York') || activeSessionNames.includes('London')) {
    timingScore = 8.4;
    windowStatus = 'PRIME';
    volumeLevel = 'HIGH';
    btcVolatility = 'HIGH';
    forexVolatility = 'HIGH';
    newsRiskLevel = 'LOW';
  } else if (activeSessionNames.includes('Tokyo') || activeSessionNames.includes('Singapore')) {
    timingScore = 7.2;
    windowStatus = 'CAUTION';
    volumeLevel = 'MEDIUM';
    btcVolatility = 'MEDIUM';
    forexVolatility = 'LOW';
    newsRiskLevel = 'LOW';
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend: Crypto only, lower volume, potential chop/liquidity wicks
    timingScore = 5.8;
    windowStatus = 'CAUTION';
    volumeLevel = 'LOW';
    btcVolatility = 'LOW';
    forexVolatility = 'LOW';
    newsRiskLevel = 'LOW';
  }

  const currentSessionSummary = activeOverlap
    ? `${activeOverlap.name} Active (${activeSessionNames.join(', ')})`
    : activeSessionNames.length > 0
    ? `${activeSessionNames.join(' & ')} Session Active`
    : 'Transition / Inter-session Phase';

  const currentSessionSummaryMy = activeOverlap
    ? `${activeOverlap.nameMy} (${activeSessionNames.join('၊ ')})`
    : activeSessionNames.length > 0
    ? `${activeSessionNames.join(' နှင့် ')} စျေးကွက်စက်ရှင် ဖွင့်လှစ်နေသည်`
    : 'စက်ရှင်များအကြား ကူးပြောင်းချိန် (Transition Phase)';

  const guidanceEn =
    windowStatus === 'PRIME'
      ? 'High liquidity & expanding market participation. Favorable for momentum, trend continuation, and structured breakout setups.'
      : windowStatus === 'CAUTION'
      ? 'Moderate participation with potential range-bound chop. Require strict 15M candle structure confirmation before executing.'
      : windowStatus === 'AVOID'
      ? 'High event risk or abnormal volatility detected. High probability of false breakouts and slippage wicks. Stay on sidelines.'
      : 'No verified structural confluence detected. Preserving capital is the highest priority trade.';

  const guidanceMy =
    windowStatus === 'PRIME'
      ? 'ငွေဖြစ်လွယ်မှု အလွန်မြင့်မားပြီး စျေးကွက်လှုပ်ရှားမှု ကောင်းမွန်နေသည်။ Trend အတိုင်း လိုက်ပါစီးမျောခြင်းနှင့် Breakout အတွက် သင့်တော်ပါသည်။'
      : windowStatus === 'CAUTION'
      ? 'စျေးကွက်သည် အပိုင်းအခြား (Range) အတွင်း ချီတုံချတုံဖြစ်နေနိုင်သည်။ 15M ဖယောင်းတိုင် အတည်ပြုချက် သေချာမှသာ ဝင်ရောက်ပါ။'
      : windowStatus === 'AVOID'
      ? 'အရေးကြီးသတင်းထွက်ပေါ်ချိန် သို့မဟုတ် ပုံမှန်မဟုတ်သော အန္တရာယ်ရှိနေသည်။ အတင်းအကျပ် မဝင်ပါနှင့်၊ စျေးကွက်ငြိမ်သည်အထိ ဘေးမှစောင့်ကြည့်ပါ။'
      : 'အတည်ပြုချက် မပြည့်စုံသေးပါ။ အရင်းအနှီးမဆုံးရှုံးစေရန် မဝင်ဘဲ စောင့်ဆိုင်းခြင်းသည် အကောင်းဆုံး ဆုံးဖြတ်ချက် ဖြစ်ပါသည်။';

  const actionFormulaEn = 'NEWS + MARKET REACTION + VOLUME + MARKET STRUCTURE + CONFIRMATION';
  const actionFormulaMy = 'သတင်းအချက်အလက် + စျေးကွက်တုံ့ပြန်မှု + Volume + ဖွဲ့စည်းပုံ (Structure) + အတည်ပြုချက်';

  return {
    windowStatus,
    timingScore,
    currentSessionSummary,
    currentSessionSummaryMy,
    activeSessions: activeSessionNames,
    activeOverlaps,
    btcVolatility,
    forexVolatility,
    volumeLevel,
    openInterestBias: 'RISING_BULLISH',
    fundingPressure: 'BALANCED',
    newsRiskLevel,
    upcomingEconomicEvents: ECONOMIC_EVENTS_CALENDAR,
    cryptoCatalysts: CRYPTO_CATALYSTS,
    guidanceEn,
    guidanceMy,
    actionFormulaEn,
    actionFormulaMy,
  };
}
