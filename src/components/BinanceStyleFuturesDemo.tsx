import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  Sliders,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
  Maximize2,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Search,
  Check,
  Zap,
  Wallet,
  Plus,
  Minus,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Sparkles,
  Target,
  Info,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { CoinOpportunity, LiveTickerItem, DemoTradePreset, DeviceLayoutOption } from '../types';
import { calculateTradeFeesAndTargets } from '../utils/technicalAnalysis';

export interface DemoPosition {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  size: number; // in coin
  notional: number; // in USDT
  margin: number; // in USDT
  leverage: number;
  liquidationPrice: number;
  tp?: number;
  sl?: number;
  pnl: number;
  roePercent: number;
  openTime: string;
}

export interface DemoTradeHistory {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  closePrice: number;
  margin: number;
  leverage: number;
  pnl: number;
  roePercent: number;
  closeTime: string;
  closeReason?: string;
}

export interface ExitSuggestion {
  posId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  type: 'TAKE_PROFIT' | 'STOP_LOSS' | 'LIQUIDATION_WARNING';
  urgency: 'HIGH' | 'CRITICAL' | 'NORMAL';
  titleMy: string;
  titleEn: string;
  badgeLabelMy: string;
  badgeLabelEn: string;
  targetHitSummaryMy: string;
  targetHitSummaryEn: string;
  logicReasonMy: string;
  logicReasonEn: string;
  technicalPointsMy: string[];
  technicalPointsEn: string[];
  currentPrice: number;
  entryPrice: number;
  targetPrice: number;
  currentPnl: number;
  currentRoe: number;
  margin: number;
  leverage: number;
  estimatedFeeUsd: number;
  netRealizedProfitUsd: number;
}

/**
 * Automated evaluation function to suggest closing an order
 * when it hits specific profit or loss targets, providing clear trading logic.
 */
export function evaluatePositionExitRecommendation(
  pos: DemoPosition,
  lang: 'my' | 'en'
): ExitSuggestion | null {
  const isLong = pos.side === 'LONG';
  const entry = pos.entryPrice;
  const current = pos.currentPrice;
  const pnl = pos.pnl;
  const roe = pos.roePercent;
  const notional = pos.notional;
  const margin = pos.margin;

  // Approximate trading fee (0.05% Taker entry + 0.05% Taker exit = 0.1% roundtrip)
  const roundtripFee = +(notional * 0.001).toFixed(2);
  const netRealized = +(pnl - (notional * 0.0005)).toFixed(2);

  // 1. Critical Liquidation Check (< 4% distance or ROE <= -75%)
  const distanceToLiqPct = isLong
    ? (current - pos.liquidationPrice) / current
    : (pos.liquidationPrice - current) / current;

  if (distanceToLiqPct <= 0.04 || roe <= -75) {
    return {
      posId: pos.id,
      symbol: pos.symbol,
      side: pos.side,
      type: 'LIQUIDATION_WARNING',
      urgency: 'CRITICAL',
      titleMy: `🚨 အရေးပေါ်သတိပေးချက်: Liquidation နှင့် နီးကပ်နေပါသည်!`,
      titleEn: `🚨 CRITICAL ALERT: Approaching Liquidation Price!`,
      badgeLabelMy: `🚨 Liquidation သတိပေးချက်`,
      badgeLabelEn: `🚨 Liquidation Risk Alert`,
      targetHitSummaryMy: `လက်ရှိစျေးနှုန်းသည် Liquidation Price ($${pos.liquidationPrice.toFixed(2)}) နှင့် ${(distanceToLiqPct * 100).toFixed(1)}% သာ ကွာဝေးတော့ပါသည် (ROE: ${roe.toFixed(1)}%)`,
      targetHitSummaryEn: `Price is within ${(distanceToLiqPct * 100).toFixed(1)}% of Liquidation Price ($${pos.liquidationPrice.toFixed(2)}) (ROE: ${roe.toFixed(1)}%)`,
      logicReasonMy: `အကြံပြုချက် အကြောင်းပြချက်:\n၁။ စျေးကွက်ဆက်လက်ဆန့်ကျင်ပါက Exchange မှ အတင်းအဓမ္မ Forced Liquidation ပြုလုပ်ပြီး Margin $${margin.toFixed(2)} (၁၀၀%) အားလုံး ဆုံးရှုံးသွားပါမည်။\n၂။ ယခုချက်ချင်း Market Close ဖြင့် အရှုံးဖြတ်လိုက်ပါက လက်ကျန် Margin အချို့ကို ပြန်လည်ကယ်တင်နိုင်မည် ဖြစ်သည်။\n၃။ Risk Management စည်းမျဉ်းအရ အကောင့်တစ်ခုလုံး အပြတ်မသတ်စေရန် အရေးပေါ် ပိတ်သိမ်းရန် အကြံပြုပါသည်။`,
      logicReasonEn: `Exit Logic:\n1. Imminent Forced Liquidation: Price is critically near liquidation. Waiting risks 100% loss of initial margin ($${margin.toFixed(2)}).\n2. Equity Salvage: Closing now preserves remaining cash balance.\n3. Capital Preservation: Eliminates catastrophic exchange penalty cascades.`,
      technicalPointsMy: [
        `ကျန်ရှိသော Margin ငွေပမာဏကို အဆုံးရှုံးမခံဘဲ ကယ်ဆယ်နိုင်ရန်`,
        `Exchange ၏ Liquidation Penalty Fee ပေးဆောင်ရခြင်းမှ ကင်းလွတ်ရန်`,
        `Capital Preservation: ကျန်ရှိသော အရင်းအနှီးဖြင့် နောက်ထပ် အခွင့်အရေးအသစ် ရှာဖွေနိုင်ရန်`
      ],
      technicalPointsEn: [
        `Salvage remaining margin equity before total forced wipeout`,
        `Avoid Binance exchange liquidation clearance penalties`,
        `Capital Preservation: Protect leftover capital for higher probability setups`
      ],
      currentPrice: current,
      entryPrice: entry,
      targetPrice: pos.liquidationPrice,
      currentPnl: pnl,
      currentRoe: roe,
      margin,
      leverage: pos.leverage,
      estimatedFeeUsd: roundtripFee,
      netRealizedProfitUsd: netRealized,
    };
  }

  // 2. Take Profit (TP) Check (Explicit TP hit OR ROE >= +20%)
  const isExplicitTpHit = pos.tp !== undefined && pos.tp > 0 && (isLong ? current >= pos.tp : current <= pos.tp);
  const isRoeProfitTargetHit = roe >= 20.0;

  if (isExplicitTpHit || isRoeProfitTargetHit) {
    const targetPrice = pos.tp || current;
    const hitLabelMy = isExplicitTpHit
      ? `သတ်မှတ်ထားသော TP ပစ်မှတ် ($${targetPrice}) သို့ စျေးနှုန်း ရောက်ရှိပြီးဖြစ်သည်`
      : `အဓိက အမြတ်ပစ်မှတ် ရည်မှန်းချက် (+${roe.toFixed(1)}% ROE) သို့ ရောက်ရှိပြီးဖြစ်သည်`;
    const hitLabelEn = isExplicitTpHit
      ? `Target Take Profit price ($${targetPrice}) reached`
      : `Major Profit Milestone (+${roe.toFixed(1)}% ROE) achieved`;

    return {
      posId: pos.id,
      symbol: pos.symbol,
      side: pos.side,
      type: 'TAKE_PROFIT',
      urgency: 'HIGH',
      titleMy: `🎯 အမြတ်သိမ်းရန် အကြံပြုချက် (Take Profit Recommendation)`,
      titleEn: `🎯 Take Profit Recommended: Target Reached`,
      badgeLabelMy: `🎯 အမြတ်သိမ်းရန် အကြံပြုချက် (TP Hit)`,
      badgeLabelEn: `🎯 Suggested Exit: Take Profit Hit`,
      targetHitSummaryMy: `${hitLabelMy} (လက်ရှိ PnL: +$${pnl.toFixed(2)} | +${roe.toFixed(1)}% ROE)`,
      targetHitSummaryEn: `${hitLabelEn} (Current PnL: +$${pnl.toFixed(2)} | +${roe.toFixed(1)}% ROE)`,
      logicReasonMy: `အကြံပြုချက် အကြောင်းပြချက်:\n၁။ အသားတင်အမြတ် သေချာစေခြင်း (Locking Realized Gains): ရရှိထားသော အမြတ် +$${pnl.toFixed(2)} သည် Binance Futures စရိတ်များ ($${roundtripFee}) အားလုံးကို အပြည့်အဝ နှုတ်ယူပြီးသည့်တိုင် အသားတင်အမြတ် +$${netRealized.toFixed(2)} အဖြစ် ကျန်ရှိပါသည်။\n၂။ Resistance / Exhaustion စျေးပြန်လှည့်နိုင်သည့် အန္တရာယ်: TP ပစ်မှတ်ဇုန်သို့ ရောက်ရှိချိန်တွင် Institutional Traders များ၏ အမြတ်ထုတ်ရောင်းချမှုများ စတင်နိုင်သဖြင့် စျေးနှုန်းသည် မကြာမီ Resistance မှ ပြန်လှည့်ကျဆင်းနိုင်ပါသည်။\n၃။ စည်းကမ်းရှိသော ကုန်သွယ်မှု (Discipline): အနိုင်ရနေသော Trade တစ်ခုအား မျှော်လင့်ချက်လောဘကြောင့် အရှုံးအဖြစ်သို့ ပြန်မပြောင်းလဲစေရန် အခုပင် အမြတ်သိမ်းပိတ်သိမ်းရန် အကြံပြုအပ်ပါသည်။`,
      logicReasonEn: `Exit Recommendation Logic:\n1. Lock in Realized Profits: Gross gain of +$${pnl.toFixed(2)} completely absorbs estimated exchange fees ($${roundtripFee}), yielding a clean +$${netRealized.toFixed(2)} net gain.\n2. Resistance & Exhaustion: Hitting this target tier enters an institutional take-profit zone where sharp counter-trend pullbacks routinely materialize.\n3. Trading Discipline: Prevents 'round-tripping' a winning trade back into break-even or a loss. Closing now solidifies your compounding gains.`,
      technicalPointsMy: [
        `Binance Futures Trading Fee ($${roundtripFee}) ကို အပြည့်အဝ ဖုံးလွှမ်းပြီး အသားတင်အမြတ်ရရှိပြီဖြစ်ခြင်း`,
        `Technical Resistance / Supply Block သို့ ရောက်ရှိပြီး Momentum အရှိန်နှေးကွေးနိုင်ခြင်း`,
        `ရရှိထားသော အမြတ်ကို မဆုံးရှုံးစေရန် အမြတ်သိမ်းပိတ်ခြင်း (သို့ ၅၀% ပိတ်ပြီး SL ကို Entry သို့ ရွှေ့ခြင်း)`
      ],
      technicalPointsEn: [
        `Net gains fully clear all roundtrip trading commissions ($${roundtripFee})`,
        `Price is entering supply/resistance saturation where momentum exhausts`,
        `Guarantees account growth by locking in banked profits into your cash balance`
      ],
      currentPrice: current,
      entryPrice: entry,
      targetPrice,
      currentPnl: pnl,
      currentRoe: roe,
      margin,
      leverage: pos.leverage,
      estimatedFeeUsd: roundtripFee,
      netRealizedProfitUsd: netRealized,
    };
  }

  // 3. Stop Loss (SL) Check (Explicit SL hit OR ROE <= -18%)
  const isExplicitSlHit = pos.sl !== undefined && pos.sl > 0 && (isLong ? current <= pos.sl : current >= pos.sl);
  const isRoeLossLimitHit = roe <= -18.0;

  if (isExplicitSlHit || isRoeLossLimitHit) {
    const targetPrice = pos.sl || current;
    const hitLabelMy = isExplicitSlHit
      ? `သတ်မှတ်ထားသော SL အရှုံးကာကွယ်ရေးစျေး ($${targetPrice}) သို့ ရောက်ရှိသွားပါပြီ`
      : `သတ်မှတ်ထားသော Risk Limit အရှုံးသတ်မှတ်ချက် (${roe.toFixed(1)}% ROE) သို့ ရောက်ရှိသွားပါပြီ`;
    const hitLabelEn = isExplicitSlHit
      ? `Stop Loss protection level ($${targetPrice}) triggered`
      : `Risk Limit Threshold reached (${roe.toFixed(1)}% ROE)`;

    return {
      posId: pos.id,
      symbol: pos.symbol,
      side: pos.side,
      type: 'STOP_LOSS',
      urgency: 'HIGH',
      titleMy: `🛑 အရှုံးဖြတ်ရန် အကြံပြုချက် (Stop Loss Recommendation)`,
      titleEn: `🛑 Stop Loss Recommended: Risk Bound Triggered`,
      badgeLabelMy: `🛑 အရှုံးဖြတ်ရန် အကြံပြုချက် (SL Hit)`,
      badgeLabelEn: `🛑 Suggested Exit: Stop Loss Hit`,
      targetHitSummaryMy: `${hitLabelMy} (လက်ရှိ PnL: -$${Math.abs(pnl).toFixed(2)} | ${roe.toFixed(1)}% ROE)`,
      targetHitSummaryEn: `${hitLabelEn} (Current PnL: -$${Math.abs(pnl).toFixed(2)} | ${roe.toFixed(1)}% ROE)`,
      logicReasonMy: `အကြံပြုချက် အကြောင်းပြချက်:\n၁။ Market Setup ပျက်ပြယ်ခြင်း (Technical Invalidation): စျေးနှုန်းသည် ကာကွယ်ထားသော Support/Resistance အဆင့်ကို ချိုးဖောက်သွားပြီဖြစ်၍ ဤ Trade ၏ မူလခန့်မှန်းချက် ပျက်ပြယ်သွားပါပြီ။\n၂။ အရင်းအနှီး ကာကွယ်စောင့်ရှောက်ခြင်း (Capital Preservation): ဆုံးရှုံးမှု ပိုမိုနက်ရှိုင်းလာပါက ပြန်လည်ကုစားရန် ခက်ခဲလာမည်ဖြစ်ပြီး Liquidation အန္တရာယ် ပေါ်ပေါက်လာပါမည်။\n၃။ စည်းကမ်းရှိသော အရှုံးဖြတ်ခြင်း (Cut Loss): ပရော်ဖက်ရှင်နယ် ကုန်သွယ်သူများ၏ အဓိကစည်းမျဉ်းအရ အရှုံးကို စောစီးစွာ ဖြတ်တောက်ပြီး လက်ကျန်အရင်းအနှီးကို ကာကွယ်ရန် ယခုပင် ပိတ်သိမ်းရန် ခိုင်လုံစွာ အကြံပြုအပ်ပါသည်။`,
      logicReasonEn: `Exit Recommendation Logic:\n1. Trade Invalidation: Market structure has breached the planned invalidation boundary, voiding the setup premise.\n2. Capital Preservation: Prolonging losses damages trading psychological discipline and severely erodes portfolio margin.\n3. Risk Rule: Professional risk mitigation mandates cutting losing positions decisively to keep capital intact for high-probability setups.`,
      technicalPointsMy: [
        `Market Structure နှင့် Invalidation Level ပျက်ပြယ်သွားခြင်း`,
        `မလိုလားအပ်သော ပိုမိုကြီးမားသော Drawdown နှင့် Liquidation မှ ကြိုတင်ကာကွယ်ခြင်း`,
        `ကျန်ရှိသော Margin ကို ကာကွယ်ပြီး နောက်ထပ်အနိုင်ရနိုင်သော ကုန်သွယ်မှုများအတွက် ပြင်ဆင်နိုင်ခြင်း`
      ],
      technicalPointsEn: [
        `Technical structure and invalidation boundary breached`,
        `Prevents runaway drawdown from snowballing toward liquidation`,
        `Capital Preservation: Leaves your wallet intact to capitalize on future edge`
      ],
      currentPrice: current,
      entryPrice: entry,
      targetPrice,
      currentPnl: pnl,
      currentRoe: roe,
      margin,
      leverage: pos.leverage,
      estimatedFeeUsd: roundtripFee,
      netRealizedProfitUsd: netRealized,
    };
  }

  return null;
}

interface BinanceStyleFuturesDemoProps {
  coins: CoinOpportunity[];
  allTickers?: LiveTickerItem[];
  initialSymbol?: string;
  initialSide?: 'LONG' | 'SHORT';
  presetTrade?: DemoTradePreset | null;
  lang: 'my' | 'en';
  layout?: DeviceLayoutOption;
}

const STORAGE_KEYS = {
  BALANCE: 'binance_demo_balance_v2',
  POSITIONS: 'binance_demo_positions_v2',
  HISTORY: 'binance_demo_history_v2',
};

export const BinanceStyleFuturesDemo: React.FC<BinanceStyleFuturesDemoProps> = ({
  coins,
  allTickers = [],
  initialSymbol,
  initialSide,
  presetTrade,
  lang,
  layout = 'desktop',
}) => {
  // Combine coins + allTickers into a full master catalog of all available contracts
  const allAvailableSymbols = useMemo(() => {
    const map = new Map<string, { symbol: string; price: number; change24h: number; vol: string; funding: number }>();

    // Add static rich coins first
    coins.forEach((c) => {
      map.set(c.symbol, {
        symbol: c.symbol,
        price: c.currentPrice,
        change24h: c.change24h,
        vol: c.volumeFormatted,
        funding: c.fundingRate,
      });
    });

    // Add all live tickers from scanner
    allTickers.forEach((t) => {
      if (!map.has(t.symbol)) {
        map.set(t.symbol, {
          symbol: t.symbol,
          price: t.lastPrice,
          change24h: t.change24h,
          vol: t.volume24hUsd >= 1e6 ? `$${(t.volume24hUsd / 1e6).toFixed(1)}M` : `$${(t.volume24hUsd / 1e3).toFixed(0)}K`,
          funding: t.fundingRate,
        });
      }
    });

    return Array.from(map.values());
  }, [coins, allTickers]);

  // Selected Contract
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol || 'SOL');
  const [isCoinSelectorOpen, setIsCoinSelectorOpen] = useState(false);
  const [coinSearchTerm, setCoinSearchTerm] = useState('');

  const activeContract = useMemo(() => {
    const found = allAvailableSymbols.find((c) => c.symbol === selectedSymbol);
    if (found) return found;
    return allAvailableSymbols[0] || {
      symbol: 'SOL',
      price: 100.32,
      change24h: -1.58,
      vol: '$321.1M',
      funding: -0.0052,
    };
  }, [allAvailableSymbols, selectedSymbol]);

  // Live Simulated Price Ticks
  const [livePrice, setLivePrice] = useState<number>(activeContract.price || 100);
  const [priceChangeDir, setPriceChangeDir] = useState<'up' | 'down' | 'neutral'>('neutral');

  // Timeframe
  const [activeTimeframe, setActiveTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('15m');

  // Trade Setup Controls
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('MARKET');
  const [marginMode, setMarginMode] = useState<'CROSS' | 'ISOLATED'>('ISOLATED');
  const [leverage, setLeverage] = useState<number>(20);
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false);
  const [tempLeverage, setTempLeverage] = useState<number>(20);

  const [orderPrice, setOrderPrice] = useState<number>(livePrice);
  const [orderMargin, setOrderMargin] = useState<number>(200);
  const [tpEnabled, setTpEnabled] = useState<boolean>(true);
  const [tpPrice, setTpPrice] = useState<number>(+(livePrice * 1.10).toFixed(2));
  const [slEnabled, setSlEnabled] = useState<boolean>(true);
  const [slPrice, setSlPrice] = useState<number>(+(livePrice * 0.98).toFixed(2));

  // PERSISTED WALLET, POSITIONS & HISTORY (Survives Refresh & "ပြန်လည်စစ်ဆေးမည်")
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BALANCE);
      return saved ? Number(saved) : 10000.0;
    } catch {
      return 10000.0;
    }
  });

  const [positions, setPositions] = useState<DemoPosition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSITIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<DemoTradeHistory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dedicated Adjust Balance Modal State (User can manually adjust Demo Balance)
  const [isAdjustBalanceModalOpen, setIsAdjustBalanceModalOpen] = useState(false);
  const [customBalanceInput, setCustomBalanceInput] = useState<string>(walletBalance.toString());
  const [resetPositionsOnBalanceChange, setResetPositionsOnBalanceChange] = useState<boolean>(false);

  // Dedicated Restart Account Modal State
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [restartTargetBalance, setRestartTargetBalance] = useState<number>(10000.0);

  // Automated Exit Suggestions & Notification Highlights State
  const [activeRationaleSuggestion, setActiveRationaleSuggestion] = useState<ExitSuggestion | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('binance_demo_exit_sound');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const notifiedSuggestionsRef = useRef<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [phoneWidgetTab, setPhoneWidgetTab] = useState<'chart' | 'orderbook' | 'trade' | 'positions'>('chart');
  const [notification, setNotification] = useState<string | null>(null);

  // Synthesize pleasant trading notification tone via Web Audio API
  const playExitAlertSound = (type: 'TAKE_PROFIT' | 'STOP_LOSS' | 'LIQUIDATION_WARNING') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      if (type === 'TAKE_PROFIT') {
        // High ascending double chime (G5 -> C6)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(784, now);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // Warning chime (350Hz -> 220Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Ignore audio failure
    }
  };

  // Sync to LocalStorage on any change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BALANCE, walletBalance.toString());
    } catch (e) {
      console.error(e);
    }
  }, [walletBalance]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
    } catch (e) {
      console.error(e);
    }
  }, [positions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('binance_demo_exit_sound', soundEnabled.toString());
    } catch (e) {
      console.error(e);
    }
  }, [soundEnabled]);

  // Evaluate exit recommendations for all active open positions
  const allExitSuggestions = useMemo(() => {
    const list: ExitSuggestion[] = [];
    for (const pos of positions) {
      const sug = evaluatePositionExitRecommendation(pos, lang);
      if (sug) {
        list.push(sug);
      }
    }
    return list;
  }, [positions, lang]);

  // Suggestions visible in active notification banners
  const activeExitSuggestions = useMemo(() => {
    return allExitSuggestions.filter((s) => !dismissedSuggestionIds.includes(`${s.posId}_${s.type}`));
  }, [allExitSuggestions, dismissedSuggestionIds]);

  // Automated notification watcher: fires sound and toast when new target threshold is breached
  useEffect(() => {
    for (const sug of allExitSuggestions) {
      const key = `${sug.posId}_${sug.type}`;
      if (!notifiedSuggestionsRef.current.has(key)) {
        notifiedSuggestionsRef.current.add(key);
        playExitAlertSound(sug.type);
        showToast(
          lang === 'my'
            ? `${sug.badgeLabelMy}: ${sug.symbol} (${sug.currentPnl >= 0 ? '+' : ''}$${sug.currentPnl.toFixed(2)} | ${sug.currentRoe >= 0 ? '+' : ''}${sug.currentRoe.toFixed(1)}%) - အော်ဒါပိတ်သိမ်းရန် အကြံပြုထားပါသည်`
            : `${sug.badgeLabelEn}: ${sug.symbol} (${sug.currentPnl >= 0 ? '+' : ''}$${sug.currentPnl.toFixed(2)} | ${sug.currentRoe >= 0 ? '+' : ''}${sug.currentRoe.toFixed(1)}%) - Exit recommended`
        );
      }
    }
  }, [allExitSuggestions, lang]);

  // Track preset applications
  const lastPresetTimestampRef = useRef<number>(0);

  // Apply incoming Preset Trade Setup (from BEST TRADE or Custom Trade Simulator)
  useEffect(() => {
    if (presetTrade && presetTrade.timestamp && presetTrade.timestamp !== lastPresetTimestampRef.current) {
      lastPresetTimestampRef.current = presetTrade.timestamp;

      if (presetTrade.symbol) {
        setSelectedSymbol(presetTrade.symbol);
      }
      if (presetTrade.leverage) {
        setLeverage(presetTrade.leverage);
        setTempLeverage(presetTrade.leverage);
      }
      if (presetTrade.margin) {
        setOrderMargin(presetTrade.margin);
      }
      if (presetTrade.entryPrice) {
        setOrderPrice(presetTrade.entryPrice);
        setLivePrice(presetTrade.entryPrice);
      }
      if (presetTrade.slPrice !== undefined) {
        setSlEnabled(true);
        setSlPrice(presetTrade.slPrice);
      }
      if (presetTrade.tpPrice !== undefined) {
        setTpEnabled(true);
        setTpPrice(presetTrade.tpPrice);
      }
      if (presetTrade.orderType) {
        setOrderType(presetTrade.orderType);
      }

      showToast(
        lang === 'my'
          ? `⚡ ${presetTrade.source || presetTrade.symbol} Setup အား Demo တွင် အသင့်ဖြည့်သွင်းပြီးပါပြီ (Margin $${presetTrade.margin}, ${presetTrade.leverage}×, Entry $${presetTrade.entryPrice || 'Market'})`
          : `⚡ Loaded ${presetTrade.source || presetTrade.symbol} setup (Margin $${presetTrade.margin}, ${presetTrade.leverage}×, Entry $${presetTrade.entryPrice || 'Market'})`
      );
    }
  }, [presetTrade, lang]);

  // Sync contract price when active contract changes
  useEffect(() => {
    if (activeContract.price) {
      // If a preset exists for this exact symbol, preserve its values
      if (presetTrade && presetTrade.symbol === activeContract.symbol) {
        if (presetTrade.entryPrice) {
          setOrderPrice(presetTrade.entryPrice);
          setLivePrice(presetTrade.entryPrice);
        }
        if (presetTrade.tpPrice !== undefined) {
          setTpPrice(presetTrade.tpPrice);
        }
        if (presetTrade.slPrice !== undefined) {
          setSlPrice(presetTrade.slPrice);
        }
        return;
      }

      setLivePrice(activeContract.price);
      setOrderPrice(activeContract.price);
      const isLong = initialSide !== 'SHORT';
      setTpPrice(+(activeContract.price * (isLong ? 1.10 : 0.90)).toFixed(activeContract.price < 1 ? 4 : 2));
      setSlPrice(+(activeContract.price * (isLong ? 0.98 : 1.02)).toFixed(activeContract.price < 1 ? 4 : 2));
    }
  }, [activeContract, initialSide, presetTrade]);

  // Handle external initialSymbol updates
  useEffect(() => {
    if (initialSymbol && initialSymbol !== selectedSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Live Price Tick Simulation (Every 1.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const deltaPercent = (Math.random() - 0.49) * 0.003;
      setLivePrice((prev) => {
        const next = Math.max(0.0001, prev * (1 + deltaPercent));
        setPriceChangeDir(next > prev ? 'up' : 'down');
        return +next.toFixed(next < 1 ? 4 : 2);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Update open positions' live PnL whenever livePrice ticks
  useEffect(() => {
    setPositions((prevPositions) =>
      prevPositions.map((pos) => {
        if (pos.symbol !== `${activeContract.symbol}USDT`) return pos;
        const isLong = pos.side === 'LONG';
        const priceDiff = isLong ? livePrice - pos.entryPrice : pos.entryPrice - livePrice;
        const pnl = priceDiff * pos.size;
        const roePercent = (pnl / pos.margin) * 100;

        return {
          ...pos,
          currentPrice: livePrice,
          pnl: +pnl.toFixed(2),
          roePercent: +roePercent.toFixed(2),
        };
      })
    );
  }, [livePrice, activeContract.symbol]);

  // Order size calculations
  const positionSizeUsdt = orderMargin * leverage;
  const positionCoinQty = orderPrice > 0 ? +(positionSizeUsdt / orderPrice).toFixed(3) : 0;

  const feeAndTarget = useMemo(() => {
    return calculateTradeFeesAndTargets(
      orderPrice || livePrice,
      positionSizeUsdt,
      orderMargin,
      presetTrade?.side || 'LONG', // Just approximation for text
      (activeContract?.change24h ? Math.max(2, Math.abs(activeContract.change24h) * 0.5) : 3)
    );
  }, [orderPrice, livePrice, positionSizeUsdt, orderMargin, presetTrade?.side, activeContract]);

  // Open Position Handler
  const handleOpenPosition = (side: 'LONG' | 'SHORT') => {
    if (orderMargin > walletBalance) {
      alert(lang === 'my' ? 'Demo Balance မလုံလောက်ပါ!' : 'Insufficient Demo Balance!');
      return;
    }

    const isLong = side === 'LONG';
    const executionPrice = orderType === 'MARKET' ? livePrice : orderPrice;
    const sizeInCoins = +(positionSizeUsdt / executionPrice).toFixed(3);
    const liquidation = isLong
      ? executionPrice * (1 - (1 / leverage) * 0.9)
      : executionPrice * (1 + (1 / leverage) * 0.9);

    const newPos: DemoPosition = {
      id: `pos-${Date.now()}`,
      symbol: `${activeContract.symbol}USDT`,
      side,
      entryPrice: executionPrice,
      currentPrice: executionPrice,
      size: sizeInCoins,
      notional: positionSizeUsdt,
      margin: orderMargin,
      leverage,
      liquidationPrice: +liquidation.toFixed(executionPrice < 1 ? 4 : 2),
      tp: tpEnabled ? tpPrice : undefined,
      sl: slEnabled ? slPrice : undefined,
      pnl: 0,
      roePercent: 0,
      openTime: new Date().toLocaleTimeString(),
    };

    setWalletBalance((prev) => +(prev - orderMargin).toFixed(2));
    setPositions((prev) => [newPos, ...prev]);
    showToast(
      lang === 'my'
        ? `✅ ${side} Position (${activeContract.symbol} ${sizeInCoins} coins | ${leverage}×) အောင်မြင်စွာ ဖွင့်လိုက်ပါပြီ!`
        : `✅ Opened ${side} ${sizeInCoins} ${activeContract.symbol} at $${executionPrice}`
    );
  };

  // Close Position Handler (supports recording exit reasons like TP/SL suggestion)
  const handleClosePosition = (posId: string, customCloseReason?: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;

    const returnedFunds = pos.margin + pos.pnl;
    const newBalance = +(walletBalance + Math.max(0, returnedFunds)).toFixed(2);
    setWalletBalance(newBalance);

    setPositions((prev) => prev.filter((p) => p.id !== posId));

    const newHistoryItem: DemoTradeHistory = {
      id: `hist-${Date.now()}`,
      symbol: pos.symbol,
      side: pos.side,
      entryPrice: pos.entryPrice,
      closePrice: pos.currentPrice,
      margin: pos.margin,
      leverage: pos.leverage,
      pnl: pos.pnl,
      roePercent: pos.roePercent,
      closeTime: new Date().toLocaleTimeString(),
      closeReason: customCloseReason,
    };

    setHistory((prev) => [newHistoryItem, ...prev]);

    if (activeRationaleSuggestion?.posId === posId) {
      setActiveRationaleSuggestion(null);
    }

    showToast(
      lang === 'my'
        ? `Position ပိတ်သိမ်းပြီးပါပြီ: PnL ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl} (${pos.roePercent}%) ${customCloseReason ? `[${customCloseReason}]` : ''}`
        : `Position closed: PnL ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl} ${customCloseReason ? `[${customCloseReason}]` : ''}`
    );
  };

  // Quick Simulation Helper to test TP / SL triggers on an active position
  const handleSimulatePriceMove = (posId: string, percentDelta: number) => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.id !== posId) return pos;
        const newPrice = Math.max(0.0001, +(pos.currentPrice * (1 + percentDelta / 100)).toFixed(pos.currentPrice < 1 ? 4 : 2));
        const isLong = pos.side === 'LONG';
        const priceDiff = isLong ? newPrice - pos.entryPrice : pos.entryPrice - newPrice;
        const pnl = priceDiff * pos.size;
        const roePercent = (pnl / pos.margin) * 100;
        return {
          ...pos,
          currentPrice: newPrice,
          pnl: +pnl.toFixed(2),
          roePercent: +roePercent.toFixed(2),
        };
      })
    );
    showToast(
      lang === 'my'
        ? `စျေးနှုန်းအား ${percentDelta > 0 ? '+' : ''}${percentDelta}% ပြောင်းလဲ၍ Exit Target Hit အား စမ်းသပ်စစ်ဆေးပါသည်`
        : `Simulated ${percentDelta > 0 ? '+' : ''}${percentDelta}% price move for target check`
    );
  };

  // Dedicated Account Restart Handler (Reset Demo Account)
  const handleConfirmRestart = (targetBalance = restartTargetBalance) => {
    const startBal = targetBalance > 0 ? targetBalance : 10000.0;
    setWalletBalance(startBal);
    setPositions([]);
    setHistory([]);
    try {
      localStorage.setItem(STORAGE_KEYS.BALANCE, startBal.toString());
      localStorage.setItem(STORAGE_KEYS.POSITIONS, '[]');
      localStorage.setItem(STORAGE_KEYS.HISTORY, '[]');
    } catch (e) {
      console.error(e);
    }
    setIsRestartModalOpen(false);
    showToast(
      lang === 'my'
        ? `Demo Account အား $${startBal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT ဖြင့် ပြန်လည်စတင် (Restart) ပြီးပါပြီ!`
        : `Demo Account successfully reset to $${startBal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT!`
    );
  };

  // Open Balance Adjuster
  const handleOpenAdjustBalance = () => {
    setCustomBalanceInput(walletBalance.toString());
    setResetPositionsOnBalanceChange(false);
    setIsAdjustBalanceModalOpen(true);
  };

  // Save Custom Adjusted Balance
  const handleSaveCustomBalance = (targetAmount?: number) => {
    const val = targetAmount !== undefined ? targetAmount : parseFloat(customBalanceInput);
    if (isNaN(val) || val <= 0) {
      showToast(lang === 'my' ? 'ကျေးဇူးပြု၍ မှန်ကန်သော ပမာဏကို ရိုက်ထည့်ပါ' : 'Please enter a valid amount greater than 0');
      return;
    }
    const rounded = Math.round(val * 100) / 100;
    setWalletBalance(rounded);
    try {
      localStorage.setItem(STORAGE_KEYS.BALANCE, rounded.toString());
    } catch (e) {
      console.error(e);
    }
    if (resetPositionsOnBalanceChange) {
      setPositions([]);
      try {
        localStorage.setItem(STORAGE_KEYS.POSITIONS, '[]');
      } catch (e) {
        console.error(e);
      }
    }
    setIsAdjustBalanceModalOpen(false);
    showToast(
      lang === 'my'
        ? `Demo Account Balance ကို $${rounded.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT သို့ ပြောင်းလဲသတ်မှတ်ပြီးပါပြီ!`
        : `Demo Account Balance set to $${rounded.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT!`
    );
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered coins in coin selector modal
  const filteredCoinList = useMemo(() => {
    if (!coinSearchTerm.trim()) return allAvailableSymbols;
    const q = coinSearchTerm.toLowerCase();
    return allAvailableSymbols.filter((c) => c.symbol.toLowerCase().includes(q));
  }, [allAvailableSymbols, coinSearchTerm]);

  // Order Book Data
  const orderBookData = useMemo(() => {
    const p = livePrice;
    const spread = p * 0.0002;
    const asks = [
      { price: +(p + spread * 5).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 40 + 20).toFixed(1) },
      { price: +(p + spread * 4).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 60 + 30).toFixed(1) },
      { price: +(p + spread * 3).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 90 + 50).toFixed(1) },
      { price: +(p + spread * 2).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 120 + 80).toFixed(1) },
      { price: +(p + spread * 1).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 180 + 100).toFixed(1) },
    ];
    const bids = [
      { price: +(p - spread * 1).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 190 + 110).toFixed(1) },
      { price: +(p - spread * 2).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 140 + 70).toFixed(1) },
      { price: +(p - spread * 3).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 85 + 40).toFixed(1) },
      { price: +(p - spread * 4).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 55 + 25).toFixed(1) },
      { price: +(p - spread * 5).toFixed(p < 1 ? 4 : 2), size: (Math.random() * 35 + 15).toFixed(1) },
    ];
    return { asks, bids };
  }, [livePrice]);

  return (
    <div className="bg-[#181A20] text-[#EAECEF] rounded-3xl border border-[#2B313A] shadow-2xl overflow-hidden font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Binance Futures Header Bar */}
      <div className="border-b border-[#2B313A] bg-[#1E2329] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Symbol & Price Overview */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Searchable Contract Selector */}
          <button
            onClick={() => setIsCoinSelectorOpen(true)}
            className="bg-[#2B313A] hover:bg-[#363D47] text-white font-extrabold text-sm px-3.5 py-1.5 rounded-xl border border-[#474D57] cursor-pointer flex items-center gap-2"
          >
            <span>{activeContract.symbol}USDT Perpetual</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#F0B90B]" />
          </button>

          {/* Last Price */}
          <div className="flex flex-col">
            <span
              className={`text-base font-mono font-black ${
                priceChangeDir === 'up' ? 'text-[#0ECB81]' : priceChangeDir === 'down' ? 'text-[#F6465D]' : 'text-white'
              }`}
            >
              ${livePrice >= 1 ? livePrice.toFixed(2) : livePrice.toFixed(4)}
            </span>
            <span className="text-[10px] text-[#848E9C]">Mark Price</span>
          </div>

          {/* 24h Change */}
          <div className="flex flex-col">
            <span
              className={`font-mono font-bold ${
                activeContract.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
              }`}
            >
              {activeContract.change24h >= 0 ? '+' : ''}
              {activeContract.change24h.toFixed(2)}%
            </span>
            <span className="text-[10px] text-[#848E9C]">24h Change</span>
          </div>

          {/* 24h Volume */}
          <div className="hidden md:flex flex-col">
            <span className="font-mono text-white">{activeContract.vol}</span>
            <span className="text-[10px] text-[#848E9C]">24h Vol (USDT)</span>
          </div>

          {/* Funding Rate */}
          <div className="hidden lg:flex flex-col">
            <span className="font-mono text-[#F0B90B] font-bold">
              {activeContract.funding.toFixed(4)}% <span className="text-[#848E9C]">/ 04:12:35</span>
            </span>
            <span className="text-[10px] text-[#848E9C]">Funding / Countdown</span>
          </div>
        </div>

        {/* Demo Wallet Balance & Dedicated Restart Account Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Demo Balance Card with interactive Adjust button */}
          <div className="bg-[#2B313A] px-3 py-1.5 rounded-xl border border-[#474D57] flex items-center gap-2.5 shadow-xs">
            <div className="p-1 rounded-lg bg-[#F0B90B]/15 text-[#F0B90B]">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none mb-0.5">
                <span className="text-[10px] text-[#848E9C]">Demo Balance</span>
                <span className="text-[9px] px-1 rounded bg-[#181A20] text-[#F0B90B] font-mono">Virtual</span>
              </div>
              <span className="font-mono font-bold text-white text-xs">
                ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </span>
            </div>

            {/* Adjust Balance Button (ပမာဏငါကိုတိုင်ချိန်ညှိနိုင်ရန်) */}
            <button
              id="demo-adjust-balance-btn"
              type="button"
              onClick={handleOpenAdjustBalance}
              className="ml-1 px-2 py-1 rounded-lg bg-[#363D47] hover:bg-[#474D57] text-[#F0B90B] hover:text-amber-300 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-[#474D57] active:scale-95 shadow-xs"
              title={lang === 'my' ? 'Demo Balance ပမာဏ စိတ်ကြိုက်ချိန်ညှိရန်' : 'Adjust Demo Balance Amount'}
            >
              <Sliders className="w-3 h-3 text-[#F0B90B]" />
              <span className="text-[11px] font-semibold">{lang === 'my' ? 'ပမာဏချိန်ညှိရန်' : 'Adjust Balance'}</span>
            </button>
          </div>

          {/* DEDICATED RESTART BUTTON (Exact Burmese wording requested by user: Demo Account အား ပြန်လည်စတင်ရန်) */}
          <button
            id="demo-account-restart-btn"
            type="button"
            onClick={() => {
              setRestartTargetBalance(10000.0);
              setIsRestartModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/40 transition text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
            title={lang === 'my' ? 'Demo Account အား ပြန်လည်စတင်ရန်' : 'Reset Demo Account'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'my' ? 'Demo Account အား ပြန်လည်စတင်ရန်' : 'Reset Demo Account'}</span>
          </button>
        </div>
      </div>

      {/* Active Preset Trade Notification Banner */}
      {presetTrade && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border-b border-emerald-500/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white">
                  {presetTrade.source ? `${presetTrade.source}` : 'Active Preset Trade'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                  presetTrade.side === 'LONG' ? 'bg-[#0ECB81] text-slate-950' : 'bg-[#F6465D] text-white'
                }`}>
                  {presetTrade.side}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {lang === 'my' ? '✓ အချက်အလက်များ အလိုအလျောက် ဖြည့်သွင်းပြီး' : '✓ Setup autofilled in terminal'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                <span>Contract: <strong className="text-white">{presetTrade.symbol}USDT</strong></span>
                <span>•</span>
                <span>Margin: <strong className="text-amber-400">${presetTrade.margin}</strong></span>
                <span>•</span>
                <span>Leverage: <strong className="text-indigo-400">{presetTrade.leverage}×</strong></span>
                {presetTrade.entryPrice && (
                  <>
                    <span>•</span>
                    <span>Entry: <strong className="text-white">${presetTrade.entryPrice}</strong></span>
                  </>
                )}
                {presetTrade.slPrice && (
                  <>
                    <span>•</span>
                    <span>SL: <strong className="text-rose-400">${presetTrade.slPrice}</strong></span>
                  </>
                )}
                {presetTrade.tpPrice && (
                  <>
                    <span>•</span>
                    <span>TP: <strong className="text-emerald-400">${presetTrade.tpPrice}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenPosition(presetTrade.side)}
            className={`px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer shadow-lg flex items-center gap-1.5 active:scale-95 ${
              presetTrade.side === 'LONG'
                ? 'bg-[#0ECB81] hover:bg-[#0bb573] text-slate-950 shadow-[#0ECB81]/30'
                : 'bg-[#F6465D] hover:bg-[#e03a4f] text-white shadow-[#F6465D]/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>
              {lang === 'my'
                ? `ချက်ချင်း ${presetTrade.side} Position ဖွင့်မည်`
                : `Execute ${presetTrade.side} Now`}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Device Tab Switcher for Bybit/Binance-style Widget Separation */}
      {layout === 'phone' && (
        <div className="flex items-center justify-between border-b border-[#2B313A] bg-[#181A20] p-1.5 text-xs select-none">
          <div className="grid grid-cols-4 gap-1 w-full">
            <button
              onClick={() => setPhoneWidgetTab('chart')}
              className={`py-2 px-1 rounded-lg text-[11px] font-bold transition text-center cursor-pointer flex items-center justify-center gap-1 ${
                phoneWidgetTab === 'chart'
                  ? 'bg-[#F0B90B] text-slate-950 shadow-sm font-black'
                  : 'text-[#848E9C] hover:text-white bg-[#1E2329]'
              }`}
            >
              <span>📈 {lang === 'my' ? 'ချတ်' : 'Chart'}</span>
            </button>
            <button
              onClick={() => setPhoneWidgetTab('orderbook')}
              className={`py-2 px-1 rounded-lg text-[11px] font-bold transition text-center cursor-pointer flex items-center justify-center gap-1 ${
                phoneWidgetTab === 'orderbook'
                  ? 'bg-[#F0B90B] text-slate-950 shadow-sm font-black'
                  : 'text-[#848E9C] hover:text-white bg-[#1E2329]'
              }`}
            >
              <span>📖 {lang === 'my' ? 'အရောင်း' : 'Book'}</span>
            </button>
            <button
              onClick={() => setPhoneWidgetTab('trade')}
              className={`py-2 px-1 rounded-lg text-[11px] font-bold transition text-center cursor-pointer flex items-center justify-center gap-1 ${
                phoneWidgetTab === 'trade'
                  ? 'bg-[#F0B90B] text-slate-950 shadow-sm font-black'
                  : 'text-[#848E9C] hover:text-white bg-[#1E2329]'
              }`}
            >
              <span>⚡ {lang === 'my' ? 'အော်ဒါ' : 'Trade'}</span>
            </button>
            <button
              onClick={() => setPhoneWidgetTab('positions')}
              className={`py-2 px-1 rounded-lg text-[11px] font-bold transition text-center cursor-pointer flex items-center justify-center gap-1 relative ${
                phoneWidgetTab === 'positions'
                  ? 'bg-[#F0B90B] text-slate-950 shadow-sm font-black'
                  : 'text-[#848E9C] hover:text-white bg-[#1E2329]'
              }`}
            >
              <span>📋 {lang === 'my' ? 'စာရင်း' : 'Pos'} ({positions.length})</span>
              {allExitSuggestions.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Terminal: Chart + Order Book + Order Form */}
      <div className={layout === 'phone' ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-12 min-h-[460px]'}>
        {/* Left: Chart Area (7 cols) */}
        <div className={`p-4 flex flex-col justify-between ${
          layout === 'phone'
            ? phoneWidgetTab === 'chart' ? 'block' : 'hidden'
            : 'lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#2B313A]'
        }`}>
          <div>
            {/* Chart Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2B313A] mb-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#848E9C] mr-2">Time:</span>
                {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                      activeTimeframe === tf
                        ? 'text-[#F0B90B] bg-[#2B313A]'
                        : 'text-[#848E9C] hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#848E9C]">
                <span>EMA(7): <span className="text-[#F0B90B] font-mono">${(livePrice * 0.998).toFixed(livePrice < 1 ? 4 : 2)}</span></span>
                <span>EMA(25): <span className="text-[#0ECB81] font-mono">${(livePrice * 0.992).toFixed(livePrice < 1 ? 4 : 2)}</span></span>
              </div>
            </div>

            {/* Candlestick Canvas SVG */}
            <div className="relative h-64 w-full bg-[#181A20] rounded-xl border border-[#2B313A]/50 p-2 overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-[#474D57] w-full" />
                <div className="border-b border-[#474D57] w-full" />
                <div className="border-b border-[#474D57] w-full" />
                <div className="border-b border-[#474D57] w-full" />
              </div>

              <div className="relative z-10 w-full h-full flex items-end justify-between px-2 pt-6">
                {[
                  { o: 0.985, c: 0.992, h: 0.996, l: 0.982 },
                  { o: 0.992, c: 0.988, h: 0.994, l: 0.984 },
                  { o: 0.988, c: 0.995, h: 0.998, l: 0.986 },
                  { o: 0.995, c: 1.002, h: 1.006, l: 0.993 },
                  { o: 1.002, c: 0.998, h: 1.004, l: 0.995 },
                  { o: 0.998, c: 0.994, h: 1.001, l: 0.991 },
                  { o: 0.994, c: 1.005, h: 1.009, l: 0.993 },
                  { o: 1.005, c: 1.001, h: 1.007, l: 0.999 },
                  { o: 1.001, c: 1.008, h: 1.012, l: 0.999 },
                  { o: 1.008, c: 1.015, h: 1.018, l: 1.005 },
                ].map((candle, idx) => {
                  const isUp = candle.c >= candle.o;
                  const bodyHeight = Math.max(8, Math.abs(candle.c - candle.o) * 1200);
                  const wickHeight = Math.max(16, Math.abs(candle.h - candle.l) * 1400);

                  return (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-0.5 ${isUp ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`}
                        style={{ height: `${wickHeight}px` }}
                      />
                      <div
                        className={`w-3 sm:w-5 rounded-xs ${isUp ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`}
                        style={{ height: `${bodyHeight}px`, marginTop: `-${wickHeight / 2}px` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-20">
                <div className="w-full border-b border-dashed border-[#F0B90B]" />
                <span className="bg-[#F0B90B] text-slate-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded-l">
                  ${livePrice >= 1 ? livePrice.toFixed(2) : livePrice.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#848E9C] pt-3 border-t border-[#2B313A] mt-3">
            <span>RSI(14): <strong className="text-white font-mono">54.2 (Neutral)</strong></span>
            <span>24h High: <strong className="text-white font-mono">${(livePrice * 1.05).toFixed(livePrice < 1 ? 4 : 2)}</strong></span>
            <span>24h Low: <strong className="text-white font-mono">${(livePrice * 0.94).toFixed(livePrice < 1 ? 4 : 2)}</strong></span>
          </div>
        </div>

        {/* Center: Order Book Depth (2 cols) */}
        <div className={`p-3 text-[11px] font-mono flex flex-col justify-between ${
          layout === 'phone'
            ? phoneWidgetTab === 'orderbook' ? 'block' : 'hidden'
            : 'lg:col-span-2 border-b lg:border-b-0 lg:border-r border-[#2B313A]'
        }`}>
          <div>
            <div className="text-[10px] text-[#848E9C] uppercase tracking-wider mb-2 flex justify-between">
              <span>Price (USDT)</span>
              <span>Size</span>
            </div>

            <div className="space-y-1">
              {orderBookData.asks.map((ask, idx) => (
                <div
                  key={idx}
                  onClick={() => setOrderPrice(ask.price)}
                  className="flex justify-between items-center text-[#F6465D] hover:bg-[#2B313A] px-1 rounded cursor-pointer transition relative"
                >
                  <span className="relative z-10">{ask.price}</span>
                  <span className="text-[#848E9C] relative z-10">{ask.size}</span>
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#F6465D]/10 rounded"
                    style={{ width: `${Math.min(100, Number(ask.size) * 0.5)}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="my-2 py-1 border-y border-[#2B313A] text-center font-bold text-xs">
              <span className={priceChangeDir === 'up' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                ${livePrice >= 1 ? livePrice.toFixed(2) : livePrice.toFixed(4)}
              </span>
            </div>

            <div className="space-y-1">
              {orderBookData.bids.map((bid, idx) => (
                <div
                  key={idx}
                  onClick={() => setOrderPrice(bid.price)}
                  className="flex justify-between items-center text-[#0ECB81] hover:bg-[#2B313A] px-1 rounded cursor-pointer transition relative"
                >
                  <span className="relative z-10">{bid.price}</span>
                  <span className="text-[#848E9C] relative z-10">{bid.size}</span>
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#0ECB81]/10 rounded"
                    style={{ width: `${Math.min(100, Number(bid.size) * 0.5)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-[#848E9C] text-center pt-2">
            Click price to fill
          </div>
        </div>

        {/* Right: Execution Panel (3 cols) */}
        <div className={`p-4 flex flex-col justify-between space-y-4 ${
          layout === 'phone'
            ? phoneWidgetTab === 'trade' ? 'block' : 'hidden'
            : 'lg:col-span-3'
        }`}>
          <div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setMarginMode(marginMode === 'CROSS' ? 'ISOLATED' : 'CROSS')}
                className="py-1.5 px-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border border-[#474D57]"
              >
                <span>{marginMode}</span>
              </button>

              <button
                onClick={() => setIsLeverageModalOpen(true)}
                className="py-1.5 px-2 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[#F0B90B] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border border-[#474D57]"
              >
                <span>{leverage}×</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-[#1E2329] p-1 rounded-lg border border-[#2B313A] mb-3">
              <button
                onClick={() => setOrderType('MARKET')}
                className={`py-1 text-xs font-bold rounded cursor-pointer transition ${
                  orderType === 'MARKET' ? 'bg-[#2B313A] text-white shadow-sm' : 'text-[#848E9C]'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('LIMIT')}
                className={`py-1 text-xs font-bold rounded cursor-pointer transition ${
                  orderType === 'LIMIT' ? 'bg-[#2B313A] text-white shadow-sm' : 'text-[#848E9C]'
                }`}
              >
                Limit
              </button>
            </div>

            {orderType === 'LIMIT' && (
              <div className="mb-2.5">
                <label className="text-[10px] text-[#848E9C] block mb-1">Price (USDT)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(Number(e.target.value))}
                    className="w-full bg-[#2B313A] text-white text-xs font-mono font-bold py-1.5 px-3 rounded-lg border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#848E9C]">USDT</span>
                </div>
              </div>
            )}

            <div className="mb-2.5">
              <div className="flex justify-between items-center text-[10px] text-[#848E9C] mb-1">
                <span>Margin Cost ($)</span>
                <div className="flex items-center gap-1.5">
                  <span>Max: ${walletBalance.toFixed(0)}</span>
                  <button
                    type="button"
                    onClick={handleOpenAdjustBalance}
                    className="text-[#F0B90B] hover:text-amber-300 font-semibold hover:underline cursor-pointer"
                    title={lang === 'my' ? 'Demo Balance ချိန်ညှိရန်' : 'Adjust Balance'}
                  >
                    ({lang === 'my' ? 'ချိန်ညှိရန်' : 'Adjust'})
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={orderMargin}
                  onChange={(e) => setOrderMargin(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-[#2B313A] text-white text-xs font-mono font-bold py-1.5 px-3 rounded-lg border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#F0B90B]">USDT</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 mb-3">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setOrderMargin(Math.floor((walletBalance * pct) / 100))}
                  className="py-1 rounded bg-[#2B313A] hover:bg-[#363D47] text-[10px] font-mono font-bold text-[#848E9C] hover:text-white transition cursor-pointer"
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="bg-[#1E2329] p-2.5 rounded-xl border border-[#2B313A] space-y-1 text-[11px] mb-3">
              <div className="flex justify-between text-[#848E9C]">
                <span>Notional Size:</span>
                <span className="font-mono text-white font-bold">${positionSizeUsdt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#848E9C]">
                <span>Quantity:</span>
                <span className="font-mono text-white">
                  {positionCoinQty} {activeContract.symbol}
                </span>
              </div>
            </div>

            {/* TP / SL Inputs */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 text-[#848E9C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tpEnabled}
                    onChange={(e) => setTpEnabled(e.target.checked)}
                    className="rounded bg-[#2B313A] text-[#0ECB81] focus:ring-0"
                  />
                  <span>Take Profit</span>
                </label>
                {tpEnabled && (
                  <input
                    type="number"
                    step="any"
                    value={tpPrice}
                    onChange={(e) => setTpPrice(Number(e.target.value))}
                    className="w-24 bg-[#2B313A] text-white text-[10px] font-mono px-2 py-0.5 rounded border border-[#474D57]"
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 text-[#848E9C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slEnabled}
                    onChange={(e) => setSlEnabled(e.target.checked)}
                    className="rounded bg-[#2B313A] text-[#F6465D] focus:ring-0"
                  />
                  <span>Stop Loss</span>
                </label>
                {slEnabled && (
                  <input
                    type="number"
                    step="any"
                    value={slPrice}
                    onChange={(e) => setSlPrice(Number(e.target.value))}
                    className="w-24 bg-[#2B313A] text-white text-[10px] font-mono px-2 py-0.5 rounded border border-[#474D57]"
                  />
                )}
              </div>
            </div>

            {/* Trade Fees & Exit Strategy UI Block */}
            <div className="bg-[#1E2329] rounded-xl p-2.5 border border-[#2B313A] space-y-1 mb-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#848E9C]">{lang === 'my' ? 'Est. Fees:' : 'Est. Fees:'}</span>
                <span className="text-[#F0B90B] font-bold font-mono">
                  ${feeAndTarget.totalFeeUsd.toFixed(2)} <span className="text-[#848E9C] font-normal">({feeAndTarget.feePercentageOfMargin.toFixed(1)}% margin)</span>
                </span>
              </div>
              <div className="text-[10px] text-[#848E9C] leading-tight">
                <span className="text-[#0ECB81] font-bold">Plan:</span> {lang === 'my' ? feeAndTarget.optimalExitRecommendationMy : feeAndTarget.optimalExitRecommendation}
              </div>
            </div>

            {/* Execution Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="demo-open-long-btn"
                onClick={() => handleOpenPosition('LONG')}
                className={`py-2.5 rounded-xl bg-[#0ECB81] hover:bg-[#0bb573] text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-[#0ECB81]/20 ${
                  presetTrade?.side === 'LONG' ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1E2329]' : ''
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Open Long {presetTrade?.side === 'LONG' ? '★' : ''}</span>
              </button>

              <button
                id="demo-open-short-btn"
                onClick={() => handleOpenPosition('SHORT')}
                className={`py-2.5 rounded-xl bg-[#F6465D] hover:bg-[#e03a4f] text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-[#F6465D]/20 ${
                  presetTrade?.side === 'SHORT' ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1E2329]' : ''
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Open Short {presetTrade?.side === 'SHORT' ? '★' : ''}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Positions & History Tabs (100% PERSISTED) */}
      <div className={`border-t border-[#2B313A] bg-[#1E2329] p-4 ${
        layout === 'phone'
          ? phoneWidgetTab === 'positions' ? 'block' : 'hidden'
          : 'block'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B313A] pb-3 mb-3 text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('positions')}
              className={`font-bold flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'positions' ? 'text-[#F0B90B] border-b-2 border-[#F0B90B] pb-1' : 'text-[#848E9C]'
              }`}
            >
              <span>Positions</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#2B313A] text-[10px] text-white font-mono">
                {positions.length}
              </span>
              {allExitSuggestions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                  <BellRing className="w-3 h-3 text-amber-400" />
                  <span>{allExitSuggestions.length} {lang === 'my' ? 'Exit အကြံပြုချက်' : 'Exit Alert'}</span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`font-bold flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history' ? 'text-[#F0B90B] border-b-2 border-[#F0B90B] pb-1' : 'text-[#848E9C]'
              }`}
            >
              <span>Trade History</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#2B313A] text-[10px] text-white font-mono">
                {history.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Alert Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                soundEnabled
                  ? 'bg-[#2B313A] text-[#F0B90B] border-[#474D57]'
                  : 'bg-[#181A20] text-[#848E9C] border-[#2B313A]'
              }`}
              title={soundEnabled ? 'Mute Exit Alert Sounds' : 'Enable Exit Alert Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">{soundEnabled ? 'Alert Audio On' : 'Muted'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRestartTargetBalance(10000.0);
                setIsRestartModalOpen(true);
              }}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title={lang === 'my' ? 'Demo Account အား ပြန်လည်စတင်ရန်' : 'Reset Demo Account'}
            >
              <RotateCcw className="w-3 h-3 text-rose-400" />
              <span>{lang === 'my' ? 'Demo Account အား ပြန်လည်စတင်ရန်' : 'Reset Demo Account'}</span>
            </button>
          </div>
        </div>

        {/* Automated Exit Notification Banner (When profit/loss targets are hit) */}
        {activeExitSuggestions.length > 0 && activeTab === 'positions' && (
          <div className="mb-4 space-y-2">
            {activeExitSuggestions.map((sug) => {
              const isTp = sug.type === 'TAKE_PROFIT';
              const isLiq = sug.type === 'LIQUIDATION_WARNING';
              const bannerBg = isTp
                ? 'bg-gradient-to-r from-emerald-950/70 via-[#1E2329] to-emerald-950/40 border-emerald-500/50 shadow-emerald-950/30'
                : isLiq
                ? 'bg-gradient-to-r from-amber-950/80 via-[#1E2329] to-amber-950/40 border-amber-500/60 shadow-amber-950/40'
                : 'bg-gradient-to-r from-rose-950/70 via-[#1E2329] to-rose-950/40 border-rose-500/50 shadow-rose-950/30';

              return (
                <div
                  key={sug.posId}
                  className={`rounded-xl border p-3 sm:p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all duration-300 ${bannerBg}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isTp
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isLiq
                          ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isTp ? (
                        <Target className="w-5 h-5" />
                      ) : isLiq ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white font-bold text-sm flex items-center gap-1.5 font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              sug.side === 'LONG' ? 'bg-[#0ECB81]/20 text-[#0ECB81]' : 'bg-[#F6465D]/20 text-[#F6465D]'
                            }`}
                          >
                            {sug.side} {sug.leverage}×
                          </span>
                          <span>{sug.symbol}</span>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${
                            isTp
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isLiq
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {lang === 'my' ? sug.badgeLabelMy : sug.badgeLabelEn}
                        </span>

                        <span
                          className={`text-xs font-mono font-bold ${
                            sug.currentPnl >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {sug.currentPnl >= 0 ? '+' : ''}${sug.currentPnl.toFixed(2)} ({sug.currentRoe >= 0 ? '+' : ''}
                          {sug.currentRoe.toFixed(1)}% ROE)
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        <span className="font-semibold text-white">
                          {lang === 'my' ? sug.targetHitSummaryMy : sug.targetHitSummaryEn}
                        </span>
                        <span className="text-[#848E9C] block mt-0.5 text-[11px]">
                          {lang === 'my'
                            ? isTp
                              ? '💡 အကြံပြုချက်: ရရှိထားသော Net Profit ကို အရင်းအနှီးထဲသို့ အပြီးသတ် သိမ်းဆည်းရန် အကြံပြုပါသည် (အကြောင်းပြချက်အပြည့်အစုံ ကြည့်ရှုနိုင်ပါသည်)'
                              : '💡 အကြံပြုချက်: အရှုံးပိုမိုမနက်ရှိုင်းမီ စည်းကမ်းတကျ အရှုံးဖြတ်တောက်ရန် (Cut Loss) အကြံပြုပါသည်'
                            : isTp
                            ? '💡 Suggested Action: Lock in realized profits now to avoid pullback exhaustion risks.'
                            : '💡 Suggested Action: Cut loss according to trading risk discipline to preserve capital.'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => setActiveRationaleSuggestion(sug)}
                      className="px-3 py-1.5 rounded-xl bg-[#2B313A] hover:bg-[#363D47] text-[#F0B90B] hover:text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-[#474D57]"
                      title={lang === 'my' ? 'Exit အကြံပြုချက် အကြောင်းပြချက် ကြည့်ရန်' : 'View Exit Recommendation Logic'}
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{lang === 'my' ? 'အဘယ်ကြောင့် ပိတ်သင့်သလဲ?' : 'Why Exit?'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleClosePosition(
                          sug.posId,
                          isTp
                            ? 'Take Profit Target Reached'
                            : isLiq
                            ? 'Critical Liquidation Protection'
                            : 'Stop Loss Bound Triggered'
                        )
                      }
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 ${
                        isTp
                          ? 'bg-[#0ECB81] hover:bg-[#0bb272] text-slate-950 shadow-emerald-500/20'
                          : isLiq
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-[#F6465D] hover:bg-[#e03a4f] text-white shadow-rose-500/20'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'my'
                          ? isTp
                            ? 'အမြတ်သိမ်းပိတ်မည်'
                            : 'အရှုံးဖြတ်ပိတ်မည်'
                          : isTp
                          ? 'Close at TP'
                          : 'Close at SL'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDismissedSuggestionIds((prev) => [...prev, `${sug.posId}_${sug.type}`])
                      }
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                      title={lang === 'my' ? 'သတိပေးချက် ယာယီဖျောက်မည်' : 'Dismiss Alert'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'positions' ? (
          positions.length === 0 ? (
            <div className="py-8 text-center text-[#848E9C] text-xs">
              {lang === 'my'
                ? 'လက်ရှိအချိန်တွင် ဖွင့်ထားသော Position မရှိပါ။ အပေါ်ဘက်ရှိ Open Long / Open Short ဖြင့် Demo Trade စမ်းသပ်နိုင်ပါသည်။ (ဖွင့်ထားသော Trade များကို Browser ပိတ်သွားသော်လည်း အမြဲမှတ်ထားပါသည်)'
                : 'No open positions. Use Open Long or Open Short above to simulate (Positions are permanently saved).'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[#848E9C] border-b border-[#2B313A] text-[10px] uppercase">
                    <th className="py-2 px-2">Symbol & Status</th>
                    <th className="py-2 px-2 text-right">Size</th>
                    <th className="py-2 px-2 text-right">Entry Price</th>
                    <th className="py-2 px-2 text-right">Mark Price</th>
                    <th className="py-2 px-2 text-right">Liq. Price</th>
                    <th className="py-2 px-2 text-right">Margin</th>
                    <th className="py-2 px-2 text-right">PNL (ROE %)</th>
                    <th className="py-2 px-2 text-center">Action & Exit Advice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B313A]">
                  {positions.map((pos) => {
                    const isProfit = pos.pnl >= 0;
                    const exitSug = allExitSuggestions.find((s) => s.posId === pos.id);

                    const rowHighlightClass = exitSug
                      ? exitSug.type === 'TAKE_PROFIT'
                        ? 'bg-emerald-950/20 hover:bg-emerald-950/30 border-l-4 border-l-[#0ECB81] ring-1 ring-[#0ECB81]/30 transition-all duration-300'
                        : exitSug.type === 'LIQUIDATION_WARNING'
                        ? 'bg-amber-950/30 hover:bg-amber-950/40 border-l-4 border-l-[#F0B90B] ring-1 ring-[#F0B90B]/40 animate-pulse transition-all duration-300'
                        : 'bg-rose-950/20 hover:bg-rose-950/30 border-l-4 border-l-[#F6465D] ring-1 ring-[#F6465D]/30 transition-all duration-300'
                      : 'hover:bg-[#2B313A]/40 transition-colors';

                    return (
                      <tr key={pos.id} className={rowHighlightClass}>
                        <td className="py-2.5 px-2 font-sans font-bold">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1 py-0.5 rounded text-[10px] font-black ${
                                pos.side === 'LONG' ? 'bg-[#0ECB81]/20 text-[#0ECB81]' : 'bg-[#F6465D]/20 text-[#F6465D]'
                              }`}
                            >
                              {pos.side} {pos.leverage}×
                            </span>
                            <span className="text-white font-mono">{pos.symbol}</span>
                          </div>

                          {/* Automated Exit Suggestion Indicator Badge */}
                          {exitSug && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                                  exitSug.type === 'TAKE_PROFIT'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : exitSug.type === 'LIQUIDATION_WARNING'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {exitSug.type === 'TAKE_PROFIT' ? (
                                  <Target className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-rose-400" />
                                )}
                                <span>{lang === 'my' ? exitSug.badgeLabelMy : exitSug.badgeLabelEn}</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => setActiveRationaleSuggestion(exitSug)}
                                className="text-[10px] text-[#F0B90B] hover:text-amber-300 underline underline-offset-2 flex items-center gap-0.5 cursor-pointer font-sans font-bold"
                              >
                                <Info className="w-2.5 h-2.5" />
                                <span>{lang === 'my' ? 'အကြောင်းပြချက်' : 'Why?'}</span>
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right text-white font-semibold">
                          {pos.size}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#848E9C]">
                          ${pos.entryPrice >= 1 ? pos.entryPrice.toFixed(2) : pos.entryPrice.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-white">
                          ${pos.currentPrice >= 1 ? pos.currentPrice.toFixed(2) : pos.currentPrice.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#F0B90B]">
                          ${pos.liquidationPrice >= 1 ? pos.liquidationPrice.toFixed(2) : pos.liquidationPrice.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-white">
                          ${pos.margin.toFixed(2)}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-right font-bold ${
                            isProfit ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}
                          {pos.roePercent.toFixed(2)}%)
                        </td>
                        <td className="py-2.5 px-2 text-center font-sans">
                          <div className="flex flex-col items-center gap-1">
                            {exitSug ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleClosePosition(
                                      pos.id,
                                      exitSug.type === 'TAKE_PROFIT'
                                        ? 'Take Profit Target Reached'
                                        : exitSug.type === 'LIQUIDATION_WARNING'
                                        ? 'Liquidation Protection Exit'
                                        : 'Stop Loss Threshold Triggered'
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shadow-md flex items-center gap-1 active:scale-95 ${
                                    exitSug.type === 'TAKE_PROFIT'
                                      ? 'bg-[#0ECB81] hover:bg-[#0bb272] text-slate-950 shadow-emerald-500/20'
                                      : 'bg-[#F6465D] hover:bg-[#e03a4f] text-white shadow-rose-500/20'
                                  }`}
                                  title={
                                    exitSug.type === 'TAKE_PROFIT'
                                      ? 'Close now to lock in profit'
                                      : 'Close now to cut loss'
                                  }
                                >
                                  {exitSug.type === 'TAKE_PROFIT' ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                  <span>
                                    {lang === 'my'
                                      ? exitSug.type === 'TAKE_PROFIT'
                                        ? 'အမြတ်သိမ်းပိတ်မည်'
                                        : 'အရှုံးဖြတ်ပိတ်မည်'
                                      : exitSug.type === 'TAKE_PROFIT'
                                      ? 'Close at TP'
                                      : 'Close at SL'}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveRationaleSuggestion(exitSug)}
                                  className="text-[10px] text-[#F0B90B] hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  <span>{lang === 'my' ? 'အဘယ်ကြောင့် ပိတ်သင့်သလဲ?' : 'Why Close?'}</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleClosePosition(pos.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold transition cursor-pointer"
                              >
                                Market Close
                              </button>
                            )}

                            {/* Simulation buttons for testing exit triggers effortlessly */}
                            <div className="flex items-center gap-1 mt-0.5 opacity-60 hover:opacity-100 transition text-[9px] font-mono">
                              <span className="text-[#848E9C]">Sim:</span>
                              <button
                                type="button"
                                onClick={() => handleSimulatePriceMove(pos.id, pos.side === 'LONG' ? 5 : -5)}
                                className="px-1 py-0.2 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 font-bold"
                                title="Simulate +5% move toward TP"
                              >
                                +5%
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSimulatePriceMove(pos.id, pos.side === 'LONG' ? -4 : 4)}
                                className="px-1 py-0.2 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 font-bold"
                                title="Simulate -4% move toward SL"
                              >
                                -4%
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="py-6 text-center text-[#848E9C] text-xs">No trade history yet.</div>
            ) : (
              history.map((h) => (
                <div key={h.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2.5 px-3 bg-[#181A20] rounded-lg border border-[#2B313A] text-xs font-mono gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-bold ${h.side === 'LONG' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {h.side} {h.symbol}
                    </span>
                    <span className="text-slate-400">
                      (Entry: ${h.entryPrice >= 1 ? h.entryPrice.toFixed(2) : h.entryPrice.toFixed(4)} → Close: ${h.closePrice >= 1 ? h.closePrice.toFixed(2) : h.closePrice.toFixed(4)})
                    </span>
                    {h.closeReason && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-[#F0B90B] border border-[#F0B90B]/30 font-sans font-semibold">
                        {h.closeReason}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={h.pnl >= 0 ? 'text-[#0ECB81] font-bold' : 'text-[#F6465D] font-bold'}>
                      {h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)} ({h.pnl >= 0 ? '+' : ''}{h.roePercent.toFixed(2)}%)
                    </span>
                    <span className="text-[#848E9C] text-[10px]">{h.closeTime}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Contract Search & Select Modal (Contains all 980+ coins!) */}
      {isCoinSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-2xl p-5 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>Select Contract Pair</span>
                <span className="text-xs text-[#848E9C] font-mono">({allAvailableSymbols.length} pairs)</span>
              </h3>
              <button onClick={() => setIsCoinSelectorOpen(false)} className="text-[#848E9C] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#848E9C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contract (e.g., SOL, ETH, LSK, ZEC, FLOCK)..."
                value={coinSearchTerm}
                onChange={(e) => setCoinSearchTerm(e.target.value)}
                className="w-full bg-[#2B313A] text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto space-y-1 flex-1 pr-1">
              {filteredCoinList.map((c) => (
                <div
                  key={c.symbol}
                  onClick={() => {
                    setSelectedSymbol(c.symbol);
                    setIsCoinSelectorOpen(false);
                  }}
                  className={`flex justify-between items-center p-2.5 rounded-xl hover:bg-[#2B313A] cursor-pointer transition text-xs font-mono ${
                    c.symbol === selectedSymbol ? 'bg-[#2B313A] border border-[#F0B90B]/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-white">{c.symbol}</span>
                    <span className="text-[10px] text-[#848E9C]">USDT</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white">${c.price >= 1 ? c.price.toFixed(2) : c.price.toFixed(4)}</span>
                    <span className={`font-bold ${c.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {c.change24h >= 0 ? '+' : ''}{c.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Demo Balance Adjust Modal (ပမာဏကို မိမိကိုယ်တိုင် စိတ်ကြိုက်ချိန်ညှိနိုင်ခြင်း) */}
      {isAdjustBalanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] border border-amber-500/40 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150 text-white space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2B313A] pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-[#F0B90B] border border-amber-500/30">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {lang === 'my' ? 'Demo Account Balance ပမာဏ ချိန်ညှိရန်' : 'Adjust Demo Account Balance'}
                  </h3>
                  <span className="text-xs text-[#848E9C]">
                    {lang === 'my'
                      ? 'လေ့ကျင့်လိုသော Virtual USDT ပမာဏကို စိတ်ကြိုက်ပြောင်းလဲနိုင်ပါသည်'
                      : 'Set custom virtual USDT balance to match your live trading capital'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustBalanceModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2B313A] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Display */}
            <div className="bg-[#181A20] p-3.5 rounded-2xl border border-[#2B313A] flex items-center justify-between">
              <span className="text-xs text-[#848E9C]">
                {lang === 'my' ? 'လက်ရှိ Demo Balance:' : 'Current Demo Balance:'}
              </span>
              <span className="font-mono text-base font-black text-[#F0B90B]">
                ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </span>
            </div>

            {/* Quick Preset Balance Buttons */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                {lang === 'my' ? '⚡ အသင့်ရွေးချယ်စရာ ပမာဏများ (Quick Presets):' : '⚡ Quick Presets:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: '$500', value: 500, desc: 'Small' },
                  { label: '$1,000', value: 1000, desc: 'Beginner' },
                  { label: '$2,000', value: 2000, desc: 'Standard' },
                  { label: '$5,000', value: 5000, desc: 'Growth' },
                  { label: '$10,000', value: 10000, desc: 'Default ⭐' },
                  { label: '$25,000', value: 25000, desc: 'Pro' },
                  { label: '$50,000', value: 50000, desc: 'VIP' },
                  { label: '$100,000', value: 100000, desc: 'Whale' },
                ].map((item) => {
                  const isSelected = parseFloat(customBalanceInput) === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCustomBalanceInput(item.value.toString())}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                        isSelected
                          ? 'bg-amber-500/20 border-[#F0B90B] text-white shadow-xs'
                          : 'bg-[#2B313A] hover:bg-[#363D47] border-[#474D57] text-slate-300'
                      }`}
                    >
                      <span className="font-mono font-bold text-xs text-white">{item.label}</span>
                      <span className="text-[10px] text-[#848E9C]">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                {lang === 'my' ? '✏️ မိမိစိတ်ကြိုက် ပမာဏ ရိုက်ထည့်ရန် (Custom Balance):' : '✏️ Enter Custom Amount:'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={customBalanceInput}
                  onChange={(e) => setCustomBalanceInput(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-[#181A20] text-white text-base font-mono font-bold py-3 pl-4 pr-16 rounded-xl border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#F0B90B]">
                  USDT
                </span>
              </div>

              {/* Quick Delta Adjust Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[
                  { label: '+$500', delta: 500 },
                  { label: '+$1,000', delta: 1000 },
                  { label: '+$5,000', delta: 5000 },
                  { label: '+$10,000', delta: 10000 },
                  { label: '-$1,000', delta: -1000 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(customBalanceInput) || 0;
                      const next = Math.max(10, cur + btn.delta);
                      setCustomBalanceInput(next.toString());
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#2B313A] hover:bg-[#363D47] text-[11px] font-mono text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset active positions checkbox */}
            <div className="bg-[#181A20]/80 p-3 rounded-xl border border-[#2B313A] flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={resetPositionsOnBalanceChange}
                  onChange={(e) => setResetPositionsOnBalanceChange(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-[#2B313A] border-[#474D57] focus:ring-amber-500 focus:ring-offset-0"
                />
                <span>
                  {lang === 'my'
                    ? 'လက်ရှိဖွင့်ထားသော Position များကိုပါ ပိတ်သိမ်း/ရှင်းလင်းမည်'
                    : 'Clear active open positions with this balance adjustment'}
                </span>
              </label>
              {positions.length > 0 && (
                <span className="text-[10px] text-amber-400 font-mono">
                  ({positions.length} active)
                </span>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustBalanceModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2B313A] hover:bg-[#363D47] text-white text-xs font-bold transition cursor-pointer"
              >
                {lang === 'my' ? 'မလုပ်တော့ပါ (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveCustomBalance()}
                className="flex-1 py-2.5 rounded-xl bg-[#F0B90B] hover:bg-[#dfaa07] text-slate-950 text-xs font-black transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {lang === 'my' ? 'သတ်မှတ်မည် (Save Balance)' : 'Save Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Demo Account Restart Modal (Demo Account အား ပြန်လည်စတင်ရန်) */}
      {isRestartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] border border-rose-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  {lang === 'my' ? 'Demo Account အား ပြန်လည်စတင်ရန်' : 'Reset Demo Account'}
                </h3>
                <span className="text-xs text-rose-400 font-semibold">
                  {lang === 'my' ? 'လက်ရှိဒေတာများကို ရှင်းလင်းပြီး အစမှပြန်စမည်' : 'Clear active positions and reset account'}
                </span>
              </div>
            </div>

            {/* Select Restart Starting Balance */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                {lang === 'my' ? 'ပြန်လည်စတင်မည့် Balance ပမာဏ ရွေးချယ်ပါ:' : 'Select Starting Reset Balance:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '$1,000', value: 1000 },
                  { label: '$5,000', value: 5000 },
                  { label: '$10,000 (Default)', value: 10000 },
                  { label: '$25,000', value: 25000 },
                  { label: '$50,000', value: 50000 },
                  { label: '$100,000', value: 100000 },
                ].map((item) => {
                  const isSelected = restartTargetBalance === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRestartTargetBalance(item.value)}
                      className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/20 border-rose-400 text-white'
                          : 'bg-[#2B313A] hover:bg-[#363D47] border-[#474D57] text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Warning and explanation box */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{lang === 'my' ? 'ရှင်းလင်းမည့် အချက်များ:' : 'Reset Details:'}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                <li>
                  {lang === 'my'
                    ? `Wallet Balance ကို $${restartTargetBalance.toLocaleString()} USDT သို့ သတ်မှတ်မည်`
                    : `Reset wallet balance to $${restartTargetBalance.toLocaleString()} USDT`}
                </li>
                <li>
                  {lang === 'my'
                    ? `ဖွင့်ထားသော Position များ (${positions.length} ခု) အားလုံးကို အပြီးပိတ်သိမ်းမည်`
                    : `Close and remove all ${positions.length} active open positions`}
                </li>
                <li>
                  {lang === 'my'
                    ? `ကုန်သွယ်မှုမှတ်တမ်း (Trade History) အားလုံးကို ရှင်းလင်းမည်`
                    : `Clear all trade history records`}
                </li>
              </ul>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsRestartModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2B313A] hover:bg-[#363D47] text-white text-xs font-bold transition cursor-pointer"
              >
                {lang === 'my' ? 'မလုပ်တော့ပါ (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmRestart(restartTargetBalance)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition cursor-pointer shadow-lg shadow-rose-500/30"
              >
                {lang === 'my' ? 'သေချာသည် အစမှပြန်စမည်' : 'Confirm Restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leverage Modal */}
      {isLeverageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-sm">Adjust Leverage</h3>
              <button onClick={() => setIsLeverageModalOpen(false)} className="text-[#848E9C] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center my-4">
              <span className="text-3xl font-black font-mono text-[#F0B90B]">{tempLeverage}×</span>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={tempLeverage}
              onChange={(e) => setTempLeverage(Number(e.target.value))}
              className="w-full accent-[#F0B90B] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-[#848E9C] mt-1 font-mono">
              <span>1×</span>
              <span>25×</span>
              <span>50×</span>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setIsLeverageModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#2B313A] text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setLeverage(tempLeverage);
                  setIsLeverageModalOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[#F0B90B] text-slate-950 text-xs font-black cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automated Exit Recommendation & Rationale Modal */}
      {activeRationaleSuggestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E2329] border border-[#2B313A] rounded-2xl max-w-xl w-full shadow-2xl p-5 sm:p-6 text-xs font-sans text-white animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#2B313A] pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    activeRationaleSuggestion.type === 'TAKE_PROFIT'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : activeRationaleSuggestion.type === 'LIQUIDATION_WARNING'
                      ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {activeRationaleSuggestion.type === 'TAKE_PROFIT' ? (
                    <Target className="w-5 h-5" />
                  ) : activeRationaleSuggestion.type === 'LIQUIDATION_WARNING' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {lang === 'my'
                        ? activeRationaleSuggestion.titleMy
                        : activeRationaleSuggestion.titleEn}
                    </span>
                  </h3>
                  <span className="text-[11px] text-[#848E9C]">
                    {lang === 'my'
                      ? 'ပစ်မှတ်စျေးသို့ ရောက်ရှိသဖြင့် စည်းကမ်းတကျ အော်ဒါပိတ်သိမ်းရန် ခိုင်လုံသောအကြောင်းပြချက်'
                      : 'Strategic exit analysis and disciplined risk management rationales'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveRationaleSuggestion(null)}
                className="p-1.5 rounded-lg hover:bg-[#2B313A] text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Position Milestone Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#181A20] p-3 rounded-xl border border-[#2B313A] font-mono">
              <div>
                <span className="text-[10px] text-[#848E9C] block">Contract & Side</span>
                <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <span
                    className={`px-1 py-0.2 rounded text-[10px] ${
                      activeRationaleSuggestion.side === 'LONG'
                        ? 'bg-[#0ECB81]/20 text-[#0ECB81]'
                        : 'bg-[#F6465D]/20 text-[#F6465D]'
                    }`}
                  >
                    {activeRationaleSuggestion.side}
                  </span>
                  <span>{activeRationaleSuggestion.symbol}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#848E9C] block">Entry vs Mark Price</span>
                <span className="font-bold text-white mt-0.5 block">
                  ${activeRationaleSuggestion.entryPrice >= 1 ? activeRationaleSuggestion.entryPrice.toFixed(2) : activeRationaleSuggestion.entryPrice.toFixed(4)}
                  <span className="text-[#848E9C] font-normal mx-1">→</span>
                  <span className="text-[#F0B90B]">${activeRationaleSuggestion.currentPrice >= 1 ? activeRationaleSuggestion.currentPrice.toFixed(2) : activeRationaleSuggestion.currentPrice.toFixed(4)}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#848E9C] block">Triggered Target</span>
                <span className="font-bold text-white mt-0.5 block text-[#0ECB81]">
                  ${activeRationaleSuggestion.targetPrice >= 1 ? activeRationaleSuggestion.targetPrice.toFixed(2) : activeRationaleSuggestion.targetPrice.toFixed(4)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#848E9C] block">Current PnL (ROE)</span>
                <span
                  className={`font-bold mt-0.5 block ${
                    activeRationaleSuggestion.currentPnl >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                  }`}
                >
                  {activeRationaleSuggestion.currentPnl >= 0 ? '+' : ''}${activeRationaleSuggestion.currentPnl.toFixed(2)} ({activeRationaleSuggestion.currentRoe >= 0 ? '+' : ''}{activeRationaleSuggestion.currentRoe.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Financial Realization & Fee Protection */}
            <div className="bg-[#2B313A]/50 border border-[#474D57]/40 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#F0B90B]" />
                  <span>{lang === 'my' ? 'ကုန်သွယ်ခွန်နှင့် အသားတင်အမြတ် စိစစ်ချက်' : 'Net Realization & Fee Coverage'}</span>
                </span>
                <span className="text-[10px] text-[#848E9C] font-mono">Binance Futures Standard (0.05% Taker)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px] pt-1 border-t border-[#474D57]/30">
                <div className="bg-[#181A20] p-2 rounded-lg">
                  <span className="text-[#848E9C] block text-[10px]">Gross PnL</span>
                  <span
                    className={`font-bold ${
                      activeRationaleSuggestion.currentPnl >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {activeRationaleSuggestion.currentPnl >= 0 ? '+' : ''}${activeRationaleSuggestion.currentPnl.toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#181A20] p-2 rounded-lg">
                  <span className="text-[#848E9C] block text-[10px]">Est. Roundtrip Fee</span>
                  <span className="font-bold text-amber-300">
                    -${activeRationaleSuggestion.estimatedFeeUsd.toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#181A20] p-2 rounded-lg">
                  <span className="text-[#848E9C] block text-[10px]">Net Realized Return</span>
                  <span
                    className={`font-bold ${
                      activeRationaleSuggestion.netRealizedProfitUsd >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {activeRationaleSuggestion.netRealizedProfitUsd >= 0 ? '+' : ''}${activeRationaleSuggestion.netRealizedProfitUsd.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Rationale Explanation (The "Why") */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F0B90B]" />
                <span>
                  {lang === 'my'
                    ? 'အဘယ်ကြောင့် ဤအော်ဒါကို ပိတ်ရန် အကြံပြုသနည်း (Detailed Exit Rationale)'
                    : 'Why Is This Exit Recommended? (Strategic Logic)'}
                </span>
              </h4>

              <div className="bg-[#181A20] p-3.5 rounded-xl border border-[#2B313A] text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans">
                {lang === 'my'
                  ? activeRationaleSuggestion.logicReasonMy
                  : activeRationaleSuggestion.logicReasonEn}
              </div>
            </div>

            {/* Key Technical Factors Checklist */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#848E9C] block">
                {lang === 'my' ? 'နည်းပညာပိုင်းဆိုင်ရာ အချက်အလက်များ:' : 'Technical Criteria Evaluated:'}
              </span>
              <div className="space-y-1">
                {(lang === 'my'
                  ? activeRationaleSuggestion.technicalPointsMy
                  : activeRationaleSuggestion.technicalPointsEn
                ).map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0ECB81] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 border-t border-[#2B313A]">
              <button
                type="button"
                onClick={() => setActiveRationaleSuggestion(null)}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#2B313A] hover:bg-[#363D47] text-white text-xs font-bold cursor-pointer transition"
              >
                {lang === 'my' ? 'ခေတ္တစောင့်ကြည့်မည် (Keep Holding)' : 'Keep Holding'}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleClosePosition(
                    activeRationaleSuggestion.posId,
                    activeRationaleSuggestion.type === 'TAKE_PROFIT'
                      ? 'Take Profit Target Reached'
                      : activeRationaleSuggestion.type === 'LIQUIDATION_WARNING'
                      ? 'Liquidation Protection Exit'
                      : 'Stop Loss Threshold Triggered'
                  )
                }
                className={`w-full sm:flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-95 ${
                  activeRationaleSuggestion.type === 'TAKE_PROFIT'
                    ? 'bg-[#0ECB81] hover:bg-[#0bb272] text-slate-950 shadow-emerald-500/20'
                    : activeRationaleSuggestion.type === 'LIQUIDATION_WARNING'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-[#F6465D] hover:bg-[#e03a4f] text-white shadow-rose-500/20'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {lang === 'my'
                    ? activeRationaleSuggestion.type === 'TAKE_PROFIT'
                      ? 'အကြံပြုချက်အတိုင်း အမြတ်သိမ်းပိတ်မည်'
                      : 'အကြံပြုချက်အတိုင်း အရှုံးဖြတ်ပိတ်မည်'
                    : activeRationaleSuggestion.type === 'TAKE_PROFIT'
                    ? 'Execute Take Profit Exit'
                    : 'Execute Stop Loss Exit'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Sticky Quick Action Bar */}
      {layout === 'phone' && phoneWidgetTab !== 'trade' && (
        <div className="sticky bottom-0 left-0 right-0 z-20 bg-[#1E2329]/95 backdrop-blur-md p-2 border-t border-[#2B313A] flex items-center justify-between gap-2 shadow-2xl">
          <button
            onClick={() => {
              setPhoneWidgetTab('trade');
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#0ECB81] hover:bg-[#0bb573] text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-[#0ECB81]/20 active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Open Long ({leverage}×)</span>
          </button>
          <button
            onClick={() => {
              setPhoneWidgetTab('trade');
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#F6465D] hover:bg-[#e03a4f] text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-[#F6465D]/20 active:scale-95"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Open Short ({leverage}×)</span>
          </button>
        </div>
      )}
    </div>
  );
};
