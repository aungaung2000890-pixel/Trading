import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShieldAlert, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface DualTrackWalletBannerProps {
  walletBalance: number;
  onWalletBalanceChange: (bal: number) => void;
  direction: 'LONG' | 'SHORT';
  onDirectionChange: (dir: 'LONG' | 'SHORT') => void;
  margin: number;
  dollarLoss: number;
  dollarProfit: number;
  accountGainPct: number;
  accountLossPct: number;
  riskReward: number | string;
  consecutiveLosses: number;
  lang: 'my' | 'en';
  recommendedDirection?: 'LONG' | 'SHORT';
  technicalScore?: number;
  rulesPassed?: number;
  rulesTotal?: number;
  onApplyRecommendation?: () => void;
}

export const DualTrackWalletBanner: React.FC<DualTrackWalletBannerProps> = ({
  walletBalance,
  onWalletBalanceChange,
  direction,
  onDirectionChange,
  margin,
  dollarLoss,
  dollarProfit,
  accountGainPct,
  accountLossPct,
  riskReward,
  consecutiveLosses,
  lang,
  recommendedDirection,
  technicalScore,
  rulesPassed,
  rulesTotal,
  onApplyRecommendation,
}) => {
  const isLong = direction === 'LONG';
  const marginPctOfBalance = walletBalance > 0 ? (margin / walletBalance) * 100 : 0;

  const quickPresets = [500, 1000, 2500, 5000, 10000];

  const safeDollarLoss = typeof dollarLoss === 'number' && !isNaN(dollarLoss) ? Math.abs(dollarLoss) : Math.abs(parseFloat(String(dollarLoss)) || 0);
  const safeDollarProfit = typeof dollarProfit === 'number' && !isNaN(dollarProfit) ? dollarProfit : (parseFloat(String(dollarProfit)) || 0);
  const safeAccountGainPct = typeof accountGainPct === 'number' && !isNaN(accountGainPct) ? accountGainPct : (parseFloat(String(accountGainPct)) || 0);
  const safeAccountLossPct = typeof accountLossPct === 'number' && !isNaN(accountLossPct) ? accountLossPct : (parseFloat(String(accountLossPct)) || 0);

  const formattedRR = React.useMemo(() => {
    if (typeof riskReward === 'number') {
      return isNaN(riskReward) || !isFinite(riskReward) ? '0.00' : riskReward.toFixed(2);
    }
    if (typeof riskReward === 'string') {
      const parsed = parseFloat(riskReward);
      return isNaN(parsed) || !isFinite(parsed) ? (riskReward || '0.00') : parsed.toFixed(2);
    }
    return '0.00';
  }, [riskReward]);

  return (
    <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4 relative overflow-hidden">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Balance Input and Quick Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-sm">$</span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              {lang === 'my'
                ? 'သင့်၏ စုစုပေါင်း FUTURES WALLET BALANCE'
                : 'YOUR TOTAL FUTURES WALLET BALANCE'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 shadow-inner">
              <span className="text-sm font-bold text-amber-400 mr-1.5">$</span>
              <input
                id="dual-track-wallet-input"
                type="number"
                min={20}
                max={1000000}
                step={50}
                value={walletBalance}
                onChange={(e) => onWalletBalanceChange(Math.max(10, Number(e.target.value)))}
                className="w-28 bg-transparent text-sm font-black font-mono text-white focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {quickPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onWalletBalanceChange(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    walletBalance === preset
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  ${preset >= 1000 ? `${preset.toLocaleString()}` : preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Direction Selector with Dual-Engine Intelligence */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-center">
          {recommendedDirection && (
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-amber-500/30 text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400">
                {lang === 'my' ? 'နည်းပညာ+စည်းမျဉ်း:' : 'Dual Edge:'}
              </span>
              <span className={`font-black ${recommendedDirection === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {recommendedDirection === 'LONG' ? '↗ LONG (ဝယ်)' : '↘ SHORT (ရောင်း)'}
              </span>
              {technicalScore && (
                <span className="text-[10px] text-slate-500 font-mono">
                  ({technicalScore}%)
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {lang === 'my' ? 'ဦးတည်ရာ:' : 'Direction:'}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                id="wallet-banner-dir-long-btn"
                onClick={() => onDirectionChange('LONG')}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  isLong
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↗ LONG</span>
                {recommendedDirection === 'LONG' && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-black tracking-wider ${
                    isLong ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    AI
                  </span>
                )}
              </button>
              <button
                type="button"
                id="wallet-banner-dir-short-btn"
                onClick={() => onDirectionChange('SHORT')}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  !isLong
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>↘ SHORT</span>
                {recommendedDirection === 'SHORT' && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-black tracking-wider ${
                    !isLong ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    AI
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Real-time Metrics Row (Matching Image 1 Exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 font-mono">
        {/* Metric 1: Margin Allocation */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 font-sans">
              {lang === 'my' ? 'Margin Allocation:' : 'Margin Allocation:'}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-black text-white">${margin}</span>
              <span
                className={`text-xs font-bold ${
                  marginPctOfBalance <= 15
                    ? 'text-emerald-400'
                    : marginPctOfBalance <= 25
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {marginPctOfBalance.toFixed(1)}% of Balance
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, marginPctOfBalance)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                marginPctOfBalance <= 15
                  ? 'bg-emerald-500'
                  : marginPctOfBalance <= 25
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </div>
        </div>

        {/* Metric 2: Actual Risk at SL */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 font-sans">
              {lang === 'my' ? 'Actual Risk at SL:' : 'Actual Risk at SL:'}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-black text-rose-400">
                -${safeDollarLoss.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-rose-400">
                -{safeAccountLossPct.toFixed(2)}% Equity
              </span>
            </div>
          </div>
          <div className="text-[10px] text-amber-400 mt-2 font-sans flex items-center gap-1 font-semibold">
            {safeAccountLossPct <= 2.0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {lang === 'my' ? 'Safe Capital Cushion' : 'Safe Cushion'}
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                {lang === 'my' ? 'Moderate Drawdown' : 'Moderate Drawdown'}
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Target Growth at TP */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 font-sans">
              {lang === 'my' ? 'Target Growth at TP:' : 'Target Growth at TP:'}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-black text-emerald-400">
                +${safeDollarProfit.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                +{safeAccountGainPct.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-sans">
            R:R Expectancy: 1 : {formattedRR}
          </div>
        </div>

        {/* Metric 4: Consecutive Loss Buffer */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 font-sans">
              {lang === 'my' ? 'Consecutive Loss Buffer:' : 'Consecutive Loss Buffer:'}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-black text-white">
                {consecutiveLosses > 100 ? '100+' : consecutiveLosses} losses
              </span>
              <span className="text-xs text-slate-400 font-sans">to -50% DD</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-sans">
            {consecutiveLosses >= 25
              ? lang === 'my'
                ? 'ကျယ်ပြန့်သော ကာကွယ်မှု'
                : 'Strong cushion'
              : consecutiveLosses >= 12
              ? lang === 'my'
                ? 'အလယ်အလတ် ကာကွယ်မှု'
                : 'Moderate cushion'
              : lang === 'my'
              ? 'အန္တရာယ်မြင့်မား'
              : 'Thin cushion'}
          </div>
        </div>
      </div>
    </div>
  );
};
