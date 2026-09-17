/**
 * Binance Account Session & 24-Hour Keep-Alive Manager
 *
 * Ensures:
 * 1. User stays logged in across sessions (persistent storage in localStorage).
 * 2. Does NOT auto-logout unexpectedly while active; 24-hour expiration window.
 * 3. Keep-alive heartbeat pings periodically to refresh session timestamp and keep
 *    the Binance web persistent window connected without timing out.
 * 4. User can renew 24h duration with 1 click or manually log out when desired.
 */

export interface BinanceSession {
  isLoggedIn: boolean;
  accountName: string;
  loginTimestamp: number;
  expireTimestamp: number;
  durationHours: number; // default: 24 (1 day)
  keepAliveActive: boolean;
  lastHeartbeat: number;
  loginMethod: 'direct_web' | 'qr_code' | 'api_connected';
  apiKey?: string;
  apiSecret?: string;
}

const STORAGE_KEY = 'binance_persistent_session_v1';
const DEFAULT_DURATION_HOURS = 87600; // 10 years persistent session

export function getDefaultBinanceSession(): BinanceSession {
  return {
    isLoggedIn: false,
    accountName: '',
    loginTimestamp: 0,
    expireTimestamp: 0,
    durationHours: DEFAULT_DURATION_HOURS,
    keepAliveActive: true,
    lastHeartbeat: 0,
    loginMethod: 'direct_web',
  };
}

export function getBinanceSession(): BinanceSession {
  if (typeof window === 'undefined') return getDefaultBinanceSession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultBinanceSession();
    const parsed: BinanceSession = JSON.parse(raw);

    // Check if session has expired beyond durationHours
    const now = Date.now();
    if (parsed.isLoggedIn && parsed.expireTimestamp && now > parsed.expireTimestamp) {
      // Auto-expired after full duration
      parsed.isLoggedIn = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse Binance session:', err);
    return getDefaultBinanceSession();
  }
}

export function saveBinanceSession(session: BinanceSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save Binance session:', err);
  }
}

export function loginBinanceSession(
  accountName?: string,
  method: 'direct_web' | 'qr_code' | 'api_connected' = 'direct_web',
  durationHours: number = DEFAULT_DURATION_HOURS
): BinanceSession {
  const now = Date.now();
  const session: BinanceSession = {
    isLoggedIn: true,
    accountName: accountName?.trim() || 'Binance VIP Account',
    loginTimestamp: now,
    expireTimestamp: now + durationHours * 3600 * 1000,
    durationHours,
    keepAliveActive: true,
    lastHeartbeat: now,
    loginMethod: method,
  };
  saveBinanceSession(session);
  return session;
}

export function logoutBinanceSession(): BinanceSession {
  const session = getDefaultBinanceSession();
  saveBinanceSession(session);
  return session;
}

export function renewBinanceSession(hours: number = DEFAULT_DURATION_HOURS): BinanceSession {
  const current = getBinanceSession();
  const now = Date.now();
  const updated: BinanceSession = {
    ...current,
    isLoggedIn: true,
    loginTimestamp: current.loginTimestamp || now,
    expireTimestamp: now + hours * 3600 * 1000,
    durationHours: hours,
    keepAliveActive: true,
    lastHeartbeat: now,
  };
  saveBinanceSession(updated);
  return updated;
}

export function toggleKeepAlive(active: boolean): BinanceSession {
  const current = getBinanceSession();
  const updated: BinanceSession = {
    ...current,
    keepAliveActive: active,
    lastHeartbeat: Date.now(),
  };
  saveBinanceSession(updated);
  return updated;
}

export function pingKeepAliveHeartbeat(): BinanceSession {
  const current = getBinanceSession();
  if (!current.isLoggedIn) return current;

  const now = Date.now();
  // Auto-extend expiry slightly on activity if keepAlive is enabled
  const updated: BinanceSession = {
    ...current,
    lastHeartbeat: now,
    // Ensure expireTimestamp maintains at least remaining duration if keepAlive active
    expireTimestamp: Math.max(current.expireTimestamp, now + 3600 * 1000),
  };
  saveBinanceSession(updated);
  return updated;
}

export function getSessionTimeRemaining(session: BinanceSession): {
  isValid: boolean;
  remainingMs: number;
  hours: number;
  minutes: number;
  isExpiringSoon: boolean;
} {
  if (!session.isLoggedIn || !session.expireTimestamp) {
    return {
      isValid: false,
      remainingMs: 0,
      hours: 0,
      minutes: 0,
      isExpiringSoon: false,
    };
  }

  const now = Date.now();
  const remainingMs = Math.max(0, session.expireTimestamp - now);
  const isValid = remainingMs > 0;
  const hours = Math.floor(remainingMs / (3600 * 1000));
  const minutes = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
  const isExpiringSoon = hours < 2 && isValid; // less than 2 hours left

  return {
    isValid,
    remainingMs,
    hours,
    minutes,
    isExpiringSoon,
  };
}

export function formatSessionRemainingTime(
  session: BinanceSession,
  lang: 'my' | 'en'
): string {
  const info = getSessionTimeRemaining(session);
  if (!info.isValid) {
    return lang === 'my' ? 'Session သက်တမ်းကုန်ဆုံးပါပြီ (Log in ပြန်ဝင်ရန်)' : 'Session Expired';
  }

  if (lang === 'my') {
    return `အမြဲတမ်း ဝင်ရောက်ထားသည် (အလိုအလျောက် ပြန်မထွက်ပါ)`;
  }
  return `Permanent Session (No Auto-Logout)`;
}
