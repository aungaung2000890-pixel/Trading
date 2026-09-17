import React, { useState, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Copy,
  Info,
  DollarSign,
  ChevronRight,
  CheckSquare,
  Square,
  Lock,
  Compass,
} from 'lucide-react';
import { AppNavView, LiveTickerItem } from '../types';
import {
  computeWalletRiskAdvisor,
  WalletAdvisorInput,
  AppTradingStrategyRecommendation,
} from '../utils/walletRiskAdvisorLogic';
import { getDualTime, DualTime } from '../utils/time';

interface WalletRiskStrategyAdvisorProps {
  walletBalance: number;
  onWalletBalanceChange: (newBalance: number) => void;
  lang: 'my' | 'en';
  liveTickers?: LiveTickerItem[];
  onNavigateView: (view: AppNavView) => void;
  onRefreshTickers?: () => Promise<void> | void;
}

export const WalletRiskStrategyAdvisor: React.FC<WalletRiskStrategyAdvisorProps> = ({
  walletBalance,
  onWalletBalanceChange,
  lang,
  liveTickers = [],
  onNavigateView,
  onRefreshTickers,
}) => {
  const [riskAppetite, setRiskAppetite] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [customMargin, setCustomMargin] = useState<number>(() => Math.max(20, Math.round(walletBalance * 0.1)));
  const [customLeverage, setCustomLeverage] = useState<number>(20);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<DualTime>(getDualTime());
  
  // Track checklist completion state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Quick Balance Preset buttons
  const quickPresets = [100, 300, 500, 1000, 2000, 5000, 10000];

  // Calculate average 24h volatility (ATR-equivalent) from live tickers if available
  const avgAtr = useMemo(() => {
    if (!liveTickers || liveTickers.length === 0) return 4.8;
    const validChanges = liveTickers.map((t) => {
      if (t.high24h > 0 && t.low24h > 0) {
        return ((t.high24h - t.low24h) / t.low24h) * 100;
      }
      return Math.abs(t.change24h) * 1.6 + 3.2;
    });
    const avg = validChanges.reduce((a, b) => a + b, 0) / validChanges.length;
    return Number(Math.max(2.8, Math.min(16, avg)).toFixed(1));
  }, [liveTickers]);

  // Keep custom margin in sync if wallet balance changes significantly
  React.useEffect(() => {
    if (customMargin > walletBalance) {
      setCustomMargin(Math.max(10, Math.round(walletBalance * 0.1)));
    }
  }, [walletBalance, customMargin]);

  // Compute the Dual-Track Risk and Strategy Advice
  const advisorResult = useMemo(() => {
    const input: WalletAdvisorInput = {
      walletBalance,
      userMargin: customMargin,
      userLeverage: customLeverage,
      avgAtrPct: avgAtr,
      riskAppetite,
    };
    return computeWalletRiskAdvisor(input);
  }, [walletBalance, customMargin, customLeverage, avgAtr, riskAppetite]);

  // Re-check / Refresh Handler (ပြန်လည်စစ်ဆေးမည်)
  const handleRefreshAudit = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshTickers) {
        await onRefreshTickers();
      }
      const freshTime = getDualTime();
      setLastCheckTime(freshTime);

      setRefreshToast(
        lang === 'my'
          ? `✅ လက်ရှိ Wallet $${walletBalance.toLocaleString()} နှင့် စျေးကွက်လှိုင်းခတ်မှု (ATR ${avgAtr}%) အပေါ် အခြေခံ၍ Risk အကြံပြုချက်များကို ပြန်လည်စစ်ဆေးပြီးပါပြီ (${freshTime.mmtTime} MMT)`
          : `✅ Risk & Strategy recommendations re-evaluated at ${freshTime.mmtTime} MMT (${freshTime.usTime} EDT)`
      );
      setTimeout(() => setRefreshToast(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshTickers, walletBalance, avgAtr, lang]);

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const { techTrack, userTrack, recommendedStrategies, primaryStrategy, tradeAllocationSummary, essentialChecklist } = advisorResult;

  const totalChecks = essentialChecklist.length;
  const completedChecks = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div
      id="wallet-risk-strategy-advisor-root"
      className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 space-y-7 relative overflow-hidden transition-all"
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Refresh Toast Feedback */}
      {refreshToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-5 py-2.5 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3 border border-amber-300">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{refreshToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          HEADER & WALLET INPUT SECTION (ပြန်လည်စစ်ဆေးမည် Refresh ပါဝင်သည်)
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800/90 pb-6 relative z-10">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{lang === 'my' ? 'DUAL-TRACK WALLET ADVISOR' : 'DUAL-TRACK WALLET ADVISOR'}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {lang === 'my'
                ? `စစ်ဆေးချိန်: ${lastCheckTime.mmtTime} MMT`
                : `Verified: ${lastCheckTime.mmtTime} MMT (${lastCheckTime.usTime} EDT)`}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-amber-400 shrink-0" />
            <span>
              {lang === 'my'
                ? 'Futures Wallet အလိုက် Risk & Strategy အကြံပေးစနစ်'
                : 'Futures Wallet Risk & Strategy Advisor'}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            {lang === 'my'
              ? 'သင့် Wallet လက်ကျန်ငွေအပေါ် မူတည်၍ (၁) နည်းပညာ & Crypto အသိပညာ နှင့် (၂) ငါ့နည်းလမ်း စည်းမျဉ်း ၂ ပိုင်းခွဲစိစစ်ပြီး မည်သည့် App Trade နည်းသုံးရမည်၊ မည်မျှ Trade အရေအတွက် ဝင်ရမည်နှင့် မဖြစ်မနေ သိရှိရမည့်အချက်များကို အကြံပေးပါသည်။'
              : 'Evaluates your wallet balance across Dual Tracks: 1) Institutional Crypto/Quant Tech vs 2) Your Custom Discipline, recommending the optimal app trading style, position counts, and critical checklist.'}
          </p>
        </div>

        {/* Action Button: ပြန်လည်စစ်ဆေးမည် (Re-check & Refresh) */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="btn-recheck-wallet-advisor"
            type="button"
            onClick={handleRefreshAudit}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 text-xs sm:text-sm font-black tracking-wide shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            title="လက်ရှိစျေးကွက်နှင့် လက်ကျန်ငွေအပေါ်မူတည်၍ ပြန်လည်စစ်ဆေးပါ"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{lang === 'my' ? '🔄 ပြန်လည်စစ်ဆေးမည်' : '🔄 Re-evaluate & Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          WALLET AMOUNT SELECTOR & RISK APPETITE CONTROLS
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Wallet Amount Input */}
          <div className="space-y-2">
            <label htmlFor="wallet-advisor-balance-input" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'my' ? 'သင့်၏ လက်ရှိ FUTURES WALLET ပမာဏ (USD):' : 'YOUR FUTURES WALLET BALANCE (USD):'}</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-amber-500/50 shadow-inner focus-within:border-amber-400">
                <span className="text-base font-black text-amber-400 mr-1.5">$</span>
                <input
                  id="wallet-advisor-balance-input"
                  type="number"
                  min={10}
                  max={1000000}
                  step={50}
                  value={walletBalance}
                  onChange={(e) => onWalletBalanceChange(Math.max(10, Number(e.target.value)))}
                  className="w-32 bg-transparent text-base font-black font-mono text-white focus:outline-hidden"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                {quickPresets.map((preset) => (
                  <button
                    key={preset}
                    id={`btn-preset-balance-${preset}`}
                    type="button"
                    onClick={() => onWalletBalanceChange(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      walletBalance === preset
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80'
                    }`}
                  >
                    ${preset >= 1000 ? `${(preset / 1000).toFixed(preset % 1000 === 0 ? 0 : 1)}k` : preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Profile Appetite */}
          <div className="space-y-2 self-start md:self-center">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'my' ? 'အရင်းအနှီး စီမံမှု အဆင့်:' : 'Capital Risk Profile:'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                id="btn-appetite-conservative"
                type="button"
                onClick={() => setRiskAppetite('conservative')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${
                  riskAppetite === 'conservative'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'my' ? '🛡️ အရင်းထိန်း (1.0% SL)' : '🛡️ Conservative (1.0%)'}
              </button>
              <button
                id="btn-appetite-balanced"
                type="button"
                onClick={() => setRiskAppetite('balanced')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${
                  riskAppetite === 'balanced'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'my' ? '⚖️ မျှတမှု (1.5% SL)' : '⚖️ Balanced (1.5%)'}
              </button>
              <button
                id="btn-appetite-aggressive"
                type="button"
                onClick={() => setRiskAppetite('aggressive')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${
                  riskAppetite === 'aggressive'
                    ? 'bg-rose-500 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'my' ? '⚡ တိုက်စစ် (2.0% SL)' : '⚡ Aggressive (2.0%)'}
              </button>
            </div>
          </div>
        </div>

        {/* Instant Allocation KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{lang === 'my' ? 'အကြံပြု Margin / Trade' : 'Rec Margin / Trade'}</span>
            <span className="text-sm font-black text-amber-400">${techTrack.recommendedMarginPerTrade}</span>
            <span className="text-[10px] text-slate-500 ml-1">({techTrack.recommendedMarginPct}%)</span>
          </div>

          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{lang === 'my' ? 'တပြိုင်နက် Trade အရေအတွက်' : 'Max Concurrent Trades'}</span>
            <span className="text-sm font-black text-emerald-400">{techTrack.maxConcurrentTrades} Trades</span>
            <span className="text-[10px] text-slate-500 ml-1">(Max {techTrack.maxDailyTrades}/day)</span>
          </div>

          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{lang === 'my' ? 'Stop Loss အများဆုံး အရှုံး' : 'Max SL Drawdown'}</span>
            <span className="text-sm font-black text-rose-400">-${techTrack.maxDollarLossAtSL}</span>
            <span className="text-[10px] text-slate-500 ml-1">({techTrack.maxLossPctOfWallet}%)</span>
          </div>

          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{lang === 'my' ? 'အကောင့် မထိရမည့် အရန်ငွေ' : 'Free Reserve Buffer'}</span>
            <span className="text-sm font-black text-indigo-300">${techTrack.freeMarginReserveDollar}</span>
            <span className="text-[10px] text-slate-500 ml-1">({techTrack.freeMarginReservePct}%)</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          THE DUAL TRACK COMPARATIVE DISPLAY (နှစ်ပိုင်းခွဲခြားထားသော စနစ်)
          PART 1: TECH / CRYPTO EXPERTISE vs. PART 2: USER'S CUSTOM METHOD
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>⚖️ {lang === 'my' ? 'Risk ခွဲခြမ်းစိစစ်ချက် (၂ ပိုင်းခွဲခြားမှု)' : 'Dual-Track Risk Audit'}</span>
          </h3>
          <span className="text-xs text-slate-500">
            {lang === 'my' ? 'နည်းပညာစံနှုန်း vs သင့်ကိုယ်ပိုင်စည်းကမ်း' : 'Tech Model vs Custom Discipline'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* TRACK 1: TECH & CRYPTO EXPERTISE (မင်းနည်းပညာ Crypto အသိပညာ) */}
          <div className="bg-slate-950/90 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-400">
                    {lang === 'my' ? 'အပိုင်း (၁) - မင်းနည်းပညာ & Crypto အသိပညာ' : 'Track 1: Tech & Crypto Knowledge (AI Model)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'my' ? 'Quantitative Capital Preservation & ATR Buffer' : 'Mathematical Capital Preservation Model'}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {lang === 'my' ? 'အကြံပြုစံနှုန်း' : 'OPTIMAL'}
              </span>
            </div>

            {/* Metrics List */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'my' ? 'နေ့စဉ်လှိုင်းခံနိုင်သော Leverage:' : 'Noise-Immune Safe Leverage:'}</span>
                <span className="text-sm font-black text-emerald-400">{techTrack.safeLeverage}x (Buffer ±{techTrack.minLiquidationBufferPct}%)</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'my' ? 'Trade တစ်ခုလျှင် Margin ပမာဏ:' : 'Rec Margin Per Trade:'}</span>
                <span className="text-sm font-black text-white">${techTrack.recommendedMarginPerTrade} ({techTrack.recommendedMarginPct}%)</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'my' ? 'တပြိုင်နက် ကုန်သွယ်ခွင့် အများဆုံး:' : 'Max Concurrent Open Trades:'}</span>
                <span className="text-sm font-black text-amber-400">{techTrack.maxConcurrentTrades} Positions Max</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'my' ? 'တစ်နေ့တာ အများဆုံး ကုန်သွယ်ခွင့်:' : 'Max Daily Trades:'}</span>
                <span className="text-sm font-black text-slate-200">{techTrack.maxDailyTrades} Trades/Day</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'my' ? 'Stop Loss ထိလျှင် အများဆုံး ဆုံးရှုံးမှု:' : 'Max Dollar Loss at Stop Loss:'}</span>
                <span className="text-sm font-black text-rose-400">-${techTrack.maxDollarLossAtSL} ({techTrack.maxLossPctOfWallet}%)</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'my' ? 'အကောင့် 50% လျော့ကျရန် ရှုံးနိုင်သည့်အကြိမ်:' : 'Consecutive Losses to 50% Drawdown:'}</span>
                <span className="text-sm font-black text-emerald-300">{techTrack.consecutiveLossTolerance50Pct} ကြိမ်ဆက်တိုက်</span>
              </div>
            </div>

            {/* Assessment Note */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
              💡 {lang === 'my' ? techTrack.riskEvaluationMy : techTrack.riskEvaluationEn}
            </div>
          </div>

          {/* TRACK 2: USER'S CUSTOM METHOD & RULES (ငါ့နည်းလမ်းနှင့် စည်းမျဉ်း) */}
          <div className="bg-slate-950/90 border-2 border-slate-700/80 rounded-2xl p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-400">
                    {lang === 'my' ? 'အပိုင်း (၂) - ငါ့နည်းလမ်း & စည်းမျဉ်းများ' : 'Track 2: My Custom Method & Trader Settings'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'my' ? 'သင်စိတ်ကြိုက် သတ်မှတ်ထားသော ပမာဏနှင့် စည်းကမ်း' : 'Your Customized Margin & Discipline Settings'}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                  userTrack.verdictEn === 'SAFE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : userTrack.verdictEn === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {lang === 'my' ? userTrack.verdictMy : userTrack.verdictEn}
              </span>
            </div>

            {/* Sliders / User Adjustment Inputs */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">{lang === 'my' ? 'Trade တစ်ခု Margin ပမာဏ:' : 'My Trade Margin:'}</span>
                  <span className="font-bold text-white">${customMargin} ({userTrack.userMarginPct}%)</span>
                </div>
                <input
                  id="range-user-custom-margin"
                  type="range"
                  min={10}
                  max={Math.min(walletBalance, Math.max(100, Math.round(walletBalance * 0.4)))}
                  step={10}
                  value={customMargin}
                  onChange={(e) => setCustomMargin(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">{lang === 'my' ? 'မိမိသုံးလိုသော Leverage:' : 'My Desired Leverage:'}</span>
                  <span className="font-bold text-amber-400">{customLeverage}x</span>
                </div>
                <input
                  id="range-user-custom-leverage"
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={customLeverage}
                  onChange={(e) => setCustomLeverage(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="pt-1.5 space-y-2 border-t border-slate-800">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">{lang === 'my' ? 'SL ထိချိန် သင့်အရှုံးငွေ:' : 'My Loss at Stop Loss:'}</span>
                  <span className={`text-sm font-black ${userTrack.userLossPctOfWallet > 3 ? 'text-rose-400' : 'text-slate-200'}`}>
                    -${userTrack.userLossAtSL} ({userTrack.userLossPctOfWallet}%)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">{lang === 'my' ? 'TP ထိချိန် သင့်အမြတ်ငွေ:' : 'My Profit at Take Profit:'}</span>
                  <span className="text-sm font-black text-emerald-400">+${userTrack.userProfitAtTP} ({userTrack.userProfitPctOfWallet}%)</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">{lang === 'my' ? 'အကောင့် 50% လျော့ကျရန် ရှုံးနိုင်သည့်အကြိမ်:' : 'Consecutive Losses to 50% Drawdown:'}</span>
                  <span className="text-sm font-black text-slate-200">{userTrack.userConsecutiveLossTolerance50Pct} ကြိမ်ဆက်တိုက်</span>
                </div>
              </div>
            </div>

            {/* Discrepancy Warnings */}
            {userTrack.discrepancyWarningsMy.length > 0 ? (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{lang === 'my' ? 'သတိပြုရန် အချက်များ:' : 'Risk Warnings:'}</span>
                </div>
                {(lang === 'my' ? userTrack.discrepancyWarningsMy : userTrack.discrepancyWarningsEn).map((w, i) => (
                  <p key={i} className="pl-4 text-[11px] list-disc">• {w}</p>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                ✅ {lang === 'my' ? 'သင့်ကိုယ်ပိုင် သတ်မှတ်ချက်များသည် အန္တရာယ်ကင်းသော စံနှုန်းဘောင်အတွင်း ရှိနေပါသည်။' : 'Your custom plan conforms with safe risk management boundaries.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          APP TRADING STRATEGY RECOMMENDATIONS (ငါ့အခု App ထဲမှရှိတဲ့ Trade နည်း မည်သည့်နည်းကိုသုံးမလဲ)
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>{lang === 'my' ? 'ဤ App ထဲမှ သင့်တော်သော Trade နည်းလမ်းများ အကြံပြုချက်' : 'Recommended App Trading Strategies for Your Wallet'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'my'
                ? `လက်ကျန် $${walletBalance.toLocaleString()} အတွက် အသင့်တော်ဆုံး စတိုင်လ်ကို ရွေးချယ်ပေးထားပြီး တိုက်ရိုက်သွားရောက် အသုံးပြုနိုင်ပါသည်`
                : `Tailored styles in this terminal matching your $${walletBalance.toLocaleString()} capacity.`}
            </p>
          </div>

          <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
            {lang === 'my' ? `အဓိက အကြံပြုချက်: ${primaryStrategy.nameMy}` : `Top Pick: ${primaryStrategy.nameEn}`}
          </span>
        </div>

        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedStrategies.map((strat) => {
            const isPrimary = strat.isPrimaryRecommendation;
            return (
              <div
                key={strat.id}
                id={`advisor-strategy-card-${strat.id}`}
                className={`p-5 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                  isPrimary
                    ? 'bg-slate-950 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header with match score badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isPrimary
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isPrimary
                        ? lang === 'my'
                          ? '⭐ အကောင်းဆုံး ကိုက်ညီမှု'
                          : '⭐ TOP MATCH'
                        : `${strat.matchScorePct}% Match`}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      {strat.timeframe} ({strat.holdingDuration})
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white">
                    {lang === 'my' ? strat.nameMy : strat.nameEn}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'my' ? strat.whyFitsWalletMy : strat.whyFitsWalletEn}
                  </p>
                </div>

                {/* Sizing & Specs Box */}
                <div className="my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'my' ? 'အကြံပြု Leverage:' : 'Suggested Leverage:'}</span>
                    <span className="font-black text-amber-400">{strat.suggestedLeverage}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'my' ? 'သင့်တော်သော Margin:' : 'Suggested Margin:'}</span>
                    <span className="font-bold text-white">{strat.suggestedMarginRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'my' ? 'Trade အရေအတွက်:' : 'Trade Count:'}</span>
                    <span className="font-bold text-emerald-400">{strat.suggestedTradeCount}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="text-amber-300 font-bold">Rule: </span>
                    {lang === 'my' ? strat.keyRuleMy : strat.keyRuleEn}
                  </div>
                </div>

                {/* Action button to jump right into that app view */}
                <button
                  id={`btn-open-strategy-${strat.id}`}
                  type="button"
                  onClick={() => onNavigateView(strat.appNavTarget)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 ${
                    isPrimary
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <span>
                    {lang === 'my'
                      ? strat.id === 'signals_copy'
                        ? 'Easy Signals ကော်ပီဖွင့်မည်'
                        : 'ဤ Trade နည်းလမ်းသို့ သွားမည်'
                      : `Open ${strat.nameEn.split('(')[0]}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ESSENTIAL REQUIREMENTS & KNOWLEDGE CHECKLIST (ဘာတွေသိဖို့လိုလဲ၊ လိုအပ်တာတွေဘာလဲ)
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-2 border-t border-slate-800/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <span>{lang === 'my' ? 'မဖြစ်မနေ သိရှိရမည့်အချက်များနှင့် စည်းမျဉ်းများ (Must-Know Checklist)' : 'Essential Futures Knowledge & Pre-Trade Checklist'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'my'
                ? 'မအော်ဒါမဝင်မီ ဤအချက် ၆ ချက်ကို သေချာစွာ စစ်ဆေးပြီး လိုက်နာပါ'
                : 'Mandatory risk rules to audit before entering any live trade.'}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-center">
            <span>{lang === 'my' ? 'စစ်ဆေးပြီးစီးမှု:' : 'Readiness:'}</span>
            <span className={`font-black ${completedChecks === totalChecks ? 'text-emerald-400' : 'text-amber-400'}`}>
              {completedChecks}/{totalChecks} Completed
            </span>
          </div>
        </div>

        {/* 6 Essential Checklist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {essentialChecklist.map((item) => {
            const isChecked = Boolean(checkedItems[item.id]);
            return (
              <div
                key={item.id}
                id={`checklist-item-${item.id}`}
                onClick={() => toggleChecklist(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between select-none ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </span>
                      <h5 className={`text-xs font-black leading-snug ${isChecked ? 'text-emerald-300' : 'text-white'}`}>
                        {lang === 'my' ? item.titleMy : item.titleEn}
                      </h5>
                    </div>

                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase font-mono shrink-0 ${
                        item.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                    {lang === 'my' ? item.descriptionMy : item.descriptionEn}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 pl-6 flex items-center justify-between text-[10px]">
                  <span className="text-amber-400 font-bold">
                    {lang === 'my' ? 'လုပ်ဆောင်ရန်:' : 'Action:'}
                  </span>
                  <span className="text-slate-400 text-right truncate ml-2 font-mono">
                    {lang === 'my' ? item.actionRequiredMy : item.actionRequiredEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Footer Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-bold text-slate-400">
        <div className="flex items-center gap-2">
          <span>{lang === 'my' ? 'အခြား အဓိက ကဏ္ဍများသို့ တိုက်ရိုက်သွားရန်:' : 'Direct shortcuts:'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-footer-signals-copy"
            type="button"
            onClick={() => onNavigateView('signals_copy')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 cursor-pointer flex items-center gap-1.5 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '⚡ Easy Signals ကော်ပီ' : '⚡ Easy Signals'}</span>
          </button>

          <button
            id="btn-footer-strategy-hub"
            type="button"
            onClick={() => onNavigateView('strategy')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 cursor-pointer flex items-center gap-1.5 transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '📊 Strategy Hub (၅ မျိုး)' : '📊 Strategy Hub'}</span>
          </button>

          <button
            id="btn-footer-calculator"
            type="button"
            onClick={() => onNavigateView('calculator')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 cursor-pointer flex items-center gap-1.5 transition"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '📐 Position Calculator' : '📐 Calculator'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
