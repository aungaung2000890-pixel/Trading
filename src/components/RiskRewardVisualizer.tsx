import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Percent,
  CheckCircle,
  AlertTriangle,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { TradingStyleType, TRADING_STYLES } from './MultiStyleTradeCards';

interface RiskRewardVisualizerProps {
  currentPrice: number;
  symbol: string;
  activeStyle: TradingStyleType;
  onStyleChange: (style: TradingStyleType) => void;
  direction: 'LONG' | 'SHORT';
  onDirectionChange: (dir: 'LONG' | 'SHORT') => void;
  margin: number;
  leverage: number;
  onApplyCustomLevels?: (entry: number, tp: number, sl: number) => void;
  lang: 'my' | 'en';
}

export const RiskRewardVisualizer: React.FC<RiskRewardVisualizerProps> = ({
  currentPrice,
  symbol,
  activeStyle,
  onStyleChange,
  direction,
  onDirectionChange,
  margin,
  leverage,
  onApplyCustomLevels,
  lang,
}) => {
  // Config for current style
  const currentConfig = useMemo(
    () => TRADING_STYLES.find((s) => s.id === activeStyle) || TRADING_STYLES[0],
    [activeStyle]
  );

  const isLong = direction === 'LONG';

  // State for user input prices
  const [entryInput, setEntryInput] = useState<string>(
    currentPrice >= 1 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)
  );

  // Compute default target & stop based on style preset
  const defaultTp = useMemo(() => {
    const base = parseFloat(entryInput) || currentPrice;
    return isLong
      ? base * (1 + currentConfig.tpPercent / 100)
      : base * (1 - currentConfig.tpPercent / 100);
  }, [entryInput, currentPrice, isLong, currentConfig]);

  const defaultSl = useMemo(() => {
    const base = parseFloat(entryInput) || currentPrice;
    return isLong
      ? base * (1 - currentConfig.slPercent / 100)
      : base * (1 + currentConfig.slPercent / 100);
  }, [entryInput, currentPrice, isLong, currentConfig]);

  const [tpInput, setTpInput] = useState<string>(
    defaultTp >= 1 ? defaultTp.toFixed(2) : defaultTp.toFixed(4)
  );
  const [slInput, setSlInput] = useState<string>(
    defaultSl >= 1 ? defaultSl.toFixed(2) : defaultSl.toFixed(4)
  );

  // When activeStyle or direction changes, update inputs with presets
  const handleLoadPreset = (styleToLoad?: TradingStyleType) => {
    const targetStyle = styleToLoad || activeStyle;
    const cfg = TRADING_STYLES.find((s) => s.id === targetStyle) || currentConfig;
    const base = currentPrice;
    const newEntry = base >= 1 ? base.toFixed(2) : base.toFixed(4);
    const newTp = isLong
      ? base * (1 + cfg.tpPercent / 100)
      : base * (1 - cfg.tpPercent / 100);
    const newSl = isLong
      ? base * (1 - cfg.slPercent / 100)
      : base * (1 + cfg.slPercent / 100);

    setEntryInput(newEntry);
    setTpInput(newTp >= 1 ? newTp.toFixed(2) : newTp.toFixed(4));
    setSlInput(newSl >= 1 ? newSl.toFixed(2) : newSl.toFixed(4));
    if (styleToLoad && styleToLoad !== activeStyle) {
      onStyleChange(styleToLoad);
    }
  };

  // Numerical parsing
  const entryVal = parseFloat(entryInput) || currentPrice;
  const tpVal = parseFloat(tpInput) || defaultTp;
  const slVal = parseFloat(slInput) || defaultSl;

  // Calculate distances
  const isSetupValid = useMemo(() => {
    if (entryVal <= 0 || tpVal <= 0 || slVal <= 0) return false;
    if (isLong) {
      return tpVal > entryVal && slVal < entryVal;
    } else {
      return tpVal < entryVal && slVal > entryVal;
    }
  }, [entryVal, tpVal, slVal, isLong]);

  // Risk and Reward calculations
  const {
    rewardDistance,
    rewardPct,
    riskDistance,
    riskPct,
    riskRewardRatio,
    qualityRating,
    breakevenWinrate,
    dollarProfit,
    dollarLoss,
  } = useMemo(() => {
    if (!isSetupValid) {
      return {
        rewardDistance: 0,
        rewardPct: 0,
        riskDistance: 0,
        riskPct: 0,
        riskRewardRatio: 0,
        qualityRating: 'INVALID',
        breakevenWinrate: 0,
        dollarProfit: 0,
        dollarLoss: 0,
      };
    }

    const rDist = isLong ? tpVal - entryVal : entryVal - tpVal;
    const rPct = (rDist / entryVal) * 100;

    const sDist = isLong ? entryVal - slVal : slVal - entryVal;
    const sPct = (sDist / entryVal) * 100;

    const rr = sPct > 0 ? rPct / sPct : 0;

    // Breakeven winrate needed: 1 / (1 + RR) * 100
    const beWinrate = rr > 0 ? (1 / (1 + rr)) * 100 : 50;

    // Dollar impact
    const notional = margin * leverage;
    const dProf = notional * (rPct / 100);
    const dLoss = notional * (sPct / 100);

    let rating: 'POOR' | 'MODERATE' | 'GOOD' | 'EXCELLENT' = 'MODERATE';
    if (rr < 1.2) rating = 'POOR';
    else if (rr < 1.8) rating = 'MODERATE';
    else if (rr < 3.0) rating = 'GOOD';
    else rating = 'EXCELLENT';

    return {
      rewardDistance: rDist,
      rewardPct: rPct,
      riskDistance: sDist,
      riskPct: sPct,
      riskRewardRatio: rr,
      qualityRating: rating,
      breakevenWinrate: beWinrate,
      dollarProfit: dProf,
      dollarLoss: dLoss,
    };
  }, [isSetupValid, isLong, entryVal, tpVal, slVal, margin, leverage]);

  // Visual Bar proportions: clamp max visualization to 1:5 ratio for clean UI
  const { rewardBarPct, riskBarPct } = useMemo(() => {
    if (!isSetupValid || riskRewardRatio <= 0) {
      return { rewardBarPct: 50, riskBarPct: 50 };
    }
    const total = 1 + riskRewardRatio;
    const riskShare = Math.max(15, Math.min(85, (1 / total) * 100));
    const rewardShare = 100 - riskShare;
    return { rewardBarPct: rewardShare, riskBarPct: riskShare };
  }, [isSetupValid, riskRewardRatio]);

  const handleApply = () => {
    if (isSetupValid && onApplyCustomLevels) {
      onApplyCustomLevels(entryVal, tpVal, slVal);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5 text-slate-200">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                {lang === 'my'
                  ? 'Risk/Reward Ratio တိုက်ရိုက်တွက်ချက် visualizer'
                  : 'Risk/Reward Ratio Visualizer'}
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {symbol}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'my'
                ? 'Entry, Stop-Loss နှင့် Take-Profit စျေးနှုန်းများ ထည့်သွင်းပြီး Scalping vs Swing မဟာဗျူဟာနှင့် နှိုင်းယှဉ်ပါ'
                : 'Input Entry, TP, and SL prices to test asymmetrical risk-to-reward for Scalping vs. Swing'}
            </p>
          </div>
        </div>

        {/* Scalping vs Swing Quick Strategy Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            id="rr-switch-scalping"
            onClick={() => handleLoadPreset('scalping')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeStyle === 'scalping'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Switch to Scalping (Tighter 1:2 R:R, Rapid Execution)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Scalping</span>
          </button>
          <button
            id="rr-switch-swing"
            onClick={() => handleLoadPreset('swing')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeStyle === 'swing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Switch to Swing Trading (Wide 1:2.7+ R:R, Multi-day Trend)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Swing</span>
          </button>
        </div>
      </div>

      {/* Strategy Comparison Context Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div
          className={`p-3 rounded-xl border transition ${
            activeStyle === 'scalping'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <div className="font-bold flex items-center justify-between text-white mb-1">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Scalping Benchmark (1M – 5M)</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
              1 : 1.5 ~ 2.0
            </span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {lang === 'my'
              ? 'တိုတောင်းသော SL (0.5%) နှင့် လျင်မြန်သော TP (1.0%)။ အောင်မြင်မှုရာခိုင်နှုန်း မြင့်မားရန်နှင့် အလျင်အမြန် စျေးကွက်မှ ထွက်ခွာနိုင်ရန် ဦးတည်သည်။'
              : 'Tight Stop Loss (0.3-0.8%) & rapid TP (1-2%). Requires high discipline and execution speed with minimal slippage.'}
          </p>
        </div>

        <div
          className={`p-3 rounded-xl border transition ${
            activeStyle === 'swing'
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <div className="font-bold flex items-center justify-between text-white mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Swing Benchmark (4H – 1D)</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400">
              1 : 2.5 ~ 4.0+
            </span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {lang === 'my'
              ? 'ရက်သတ္တပတ်အတွင်း လှိုင်းကြီးများကို စီးနင်းသည်။ ကျယ်ပြန့်သော SL (3%) နှင့် မြင့်မားသော TP (8% - 14%) ဖြင့် 1:3 အချိုးအထက် အမြတ်ရှာသည်။'
              : 'Wider Stop Loss (2.5-4%) to absorb normal market volatility, seeking 8-15%+ expansion targets for high asymmetry.'}
          </p>
        </div>
      </div>

      {/* Main Interactive Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Entry Price Input */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <span>Entry Price</span>
              <span className="text-[10px] text-slate-500">($)</span>
            </label>
            <button
              onClick={() => {
                setEntryInput(currentPrice >= 1 ? currentPrice.toFixed(2) : currentPrice.toFixed(4));
              }}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
              title="Reset to live market price"
            >
              Live Price
            </button>
          </div>
          <input
            id="rr-entry-input"
            type="number"
            step="any"
            value={entryInput}
            onChange={(e) => setEntryInput(e.target.value)}
            className="w-full font-mono text-sm px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 88500"
          />
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>Market: ${currentPrice >= 1 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}</span>
            <span className="font-bold text-slate-300">{direction}</span>
          </div>
        </div>

        {/* Take-Profit Price Input */}
        <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-emerald-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>Take-Profit Target</span>
              <span className="text-[10px] text-slate-500">($)</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              +{rewardPct.toFixed(2)}%
            </span>
          </div>
          <input
            id="rr-tp-input"
            type="number"
            step="any"
            value={tpInput}
            onChange={(e) => setTpInput(e.target.value)}
            className="w-full font-mono text-sm px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Target price..."
          />
          {/* Quick Presets for TP */}
          <div className="flex gap-1">
            {[1, 2, 3, 5, 8, 12].map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  const val = isLong ? entryVal * (1 + pct / 100) : entryVal * (1 - pct / 100);
                  setTpInput(val >= 1 ? val.toFixed(2) : val.toFixed(4));
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-400 transition cursor-pointer"
              >
                +{pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Stop-Loss Price Input */}
        <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-rose-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Stop-Loss Price</span>
              <span className="text-[10px] text-slate-500">($)</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-rose-400">
              -{riskPct.toFixed(2)}%
            </span>
          </div>
          <input
            id="rr-sl-input"
            type="number"
            step="any"
            value={slInput}
            onChange={(e) => setSlInput(e.target.value)}
            className="w-full font-mono text-sm px-3 py-1.5 rounded-lg bg-slate-900 border border-rose-500/40 text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Stop loss..."
          />
          {/* Quick Presets for SL */}
          <div className="flex gap-1">
            {[0.5, 1, 1.5, 2, 3, 5].map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  const val = isLong ? entryVal * (1 - pct / 100) : entryVal * (1 + pct / 100);
                  setSlInput(val >= 1 ? val.toFixed(2) : val.toFixed(4));
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition cursor-pointer"
              >
                -{pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invalid Warning */}
      {!isSetupValid && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {isLong
              ? 'Invalid Long Levels: Take-Profit must be higher than Entry, and Stop-Loss must be lower than Entry.'
              : 'Invalid Short Levels: Take-Profit must be lower than Entry, and Stop-Loss must be higher than Entry.'}
          </span>
        </div>
      )}

      {/* Risk-Reward Visualizer Diagram Bar */}
      {isSetupValid && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Calculated R:R Ratio:
              </span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-white">1 : {riskRewardRatio.toFixed(2)}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                    qualityRating === 'EXCELLENT'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : qualityRating === 'GOOD'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                      : qualityRating === 'MODERATE'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {qualityRating === 'EXCELLENT'
                    ? '★ High Asymmetry (3.0+)'
                    : qualityRating === 'GOOD'
                    ? 'Favorable (1.8 - 3.0)'
                    : qualityRating === 'MODERATE'
                    ? 'Acceptable (1.2 - 1.8)'
                    : 'Unfavorable (< 1.2)'}
                </span>
              </div>
            </div>

            {/* Breakeven Win Rate */}
            <div className="text-xs text-right">
              <span className="text-slate-400">Required Win Rate to Profit: </span>
              <span className="font-mono font-bold text-amber-400">
                {breakevenWinrate.toFixed(1)}%
              </span>
              <div className="text-[10px] text-slate-500">
                {breakevenWinrate < 40
                  ? 'High edge: even with a 40% win rate, you generate profit'
                  : 'Requires high win rate discipline'}
              </div>
            </div>
          </div>

          {/* Graphical Proportional R:R Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Risk: 1 Unit (-${riskDistance.toFixed(2)} / -{riskPct.toFixed(2)}%)</span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span>Reward: {riskRewardRatio.toFixed(2)} Units (+${rewardDistance.toFixed(2)} / +{rewardPct.toFixed(2)}%)</span>
                <Target className="w-3 h-3" />
              </span>
            </div>

            {/* Split Stacked Bar */}
            <div className="w-full h-8 rounded-xl bg-slate-900 border border-slate-700 flex overflow-hidden relative shadow-inner">
              {/* Risk Zone (Red) */}
              <div
                style={{ width: `${riskBarPct}%` }}
                className="bg-gradient-to-r from-rose-700 to-rose-500 flex items-center justify-start px-2.5 transition-all duration-300"
              >
                <span className="text-[11px] font-mono font-bold text-white truncate drop-shadow">
                  Stop Loss (-${dollarLoss.toFixed(1)})
                </span>
              </div>

              {/* Center Divider / Entry Marker */}
              <div className="w-1 bg-white z-10 relative flex items-center justify-center">
                <div className="absolute -top-1 w-2.5 h-2.5 bg-white rotate-45" />
              </div>

              {/* Reward Zone (Green) */}
              <div
                style={{ width: `${rewardBarPct}%` }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-end px-2.5 transition-all duration-300"
              >
                <span className="text-[11px] font-mono font-bold text-slate-950 truncate drop-shadow">
                  Take Profit (+${dollarProfit.toFixed(1)})
                </span>
              </div>
            </div>

            {/* Key Price Indicators below bar */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-0.5">
              <span className="text-rose-400">SL: ${slVal >= 1 ? slVal.toFixed(2) : slVal.toFixed(4)}</span>
              <span className="text-slate-200 font-bold">Entry: ${entryVal >= 1 ? entryVal.toFixed(2) : entryVal.toFixed(4)}</span>
              <span className="text-emerald-400">TP: ${tpVal >= 1 ? tpVal.toFixed(2) : tpVal.toFixed(4)}</span>
            </div>
          </div>

          {/* Dollar Outcomes with Margin & Leverage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Position Notional:</span>
              <span className="text-slate-200 font-bold">${(margin * leverage).toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Max Risk at SL:</span>
              <span className="text-rose-400 font-bold">-${dollarLoss.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Est. Profit at TP:</span>
              <span className="text-emerald-400 font-bold">+${dollarProfit.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Net Expectancy:</span>
              <span className="text-indigo-300 font-bold">
                +{((dollarProfit - dollarLoss) / 2).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Sync Button */}
          {onApplyCustomLevels && (
            <div className="pt-2 flex justify-end">
              <button
                id="apply-rr-levels-btn"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'my' ? 'ဤ Target & SL အား Setup သို့ အတည်ပြုမည်' : 'Apply Levels to Trade Card'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
