import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface LearningRiskCalculatorProps {
  lang: 'my' | 'en';
  onOpenTradeSimulator?: () => void;
}

export const LearningRiskCalculator: React.FC<LearningRiskCalculatorProps> = ({
  lang,
  onOpenTradeSimulator,
}) => {
  // Inputs
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState<number>(65000);
  const [stopLossPrice, setStopLossPrice] = useState<number>(63500);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(69500);
  const [leverage, setLeverage] = useState<number>(10);

  // Quick preset coins
  const handleSelectCoinPreset = (symbol: string) => {
    if (symbol === 'BTC') {
      setEntryPrice(65000);
      setStopLossPrice(side === 'LONG' ? 63700 : 66300);
      setTakeProfitPrice(side === 'LONG' ? 68900 : 61100);
    } else if (symbol === 'ETH') {
      setEntryPrice(3400);
      setStopLossPrice(side === 'LONG' ? 3310 : 3490);
      setTakeProfitPrice(side === 'LONG' ? 3670 : 3130);
    } else if (symbol === 'SOL') {
      setEntryPrice(145);
      setStopLossPrice(side === 'LONG' ? 140 : 150);
      setTakeProfitPrice(side === 'LONG' ? 160 : 130);
    }
  };

  // Calculations
  const maxRiskUsd = useMemo(() => {
    return accountBalance * (riskPercent / 100);
  }, [accountBalance, riskPercent]);

  const slDistancePercent = useMemo(() => {
    if (entryPrice <= 0) return 0;
    return (Math.abs(entryPrice - stopLossPrice) / entryPrice) * 100;
  }, [entryPrice, stopLossPrice]);

  const tpDistancePercent = useMemo(() => {
    if (entryPrice <= 0) return 0;
    return (Math.abs(takeProfitPrice - entryPrice) / entryPrice) * 100;
  }, [entryPrice, takeProfitPrice]);

  const positionSizeUsd = useMemo(() => {
    if (slDistancePercent <= 0) return 0;
    return maxRiskUsd / (slDistancePercent / 100);
  }, [maxRiskUsd, slDistancePercent]);

  const positionSizeCoins = useMemo(() => {
    if (entryPrice <= 0) return 0;
    return positionSizeUsd / entryPrice;
  }, [positionSizeUsd, entryPrice]);

  const requiredMargin = useMemo(() => {
    if (leverage <= 0) return 0;
    return positionSizeUsd / leverage;
  }, [positionSizeUsd, leverage]);

  const riskRewardRatio = useMemo(() => {
    if (slDistancePercent <= 0) return 0;
    return tpDistancePercent / slDistancePercent;
  }, [tpDistancePercent, slDistancePercent]);

  const potentialLossUsd = maxRiskUsd;
  const potentialProfitUsd = useMemo(() => {
    return (positionSizeUsd * tpDistancePercent) / 100;
  }, [positionSizeUsd, tpDistancePercent]);

  // Estimated Liquidation Price
  const estimatedLiquidationPrice = useMemo(() => {
    if (entryPrice <= 0 || leverage <= 0) return 0;
    const maintenanceFactor = 0.005; // 0.5% buffer
    const moveFactor = (1 / leverage) - maintenanceFactor;
    if (side === 'LONG') {
      return Math.max(0, entryPrice * (1 - moveFactor));
    } else {
      return entryPrice * (1 + moveFactor);
    }
  }, [entryPrice, leverage, side]);

  const liquidationDistancePercent = useMemo(() => {
    if (entryPrice <= 0) return 0;
    return (Math.abs(entryPrice - estimatedLiquidationPrice) / entryPrice) * 100;
  }, [entryPrice, estimatedLiquidationPrice]);

  // Safety checks
  const isLiquidationCloserThanSL = useMemo(() => {
    if (side === 'LONG') {
      return estimatedLiquidationPrice >= stopLossPrice;
    } else {
      return estimatedLiquidationPrice <= stopLossPrice;
    }
  }, [side, estimatedLiquidationPrice, stopLossPrice]);

  const isRiskHealthy = riskPercent <= 2.0;
  const isRRHealthy = riskRewardRatio >= 1.8;

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/20 border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {lang === 'my'
                ? 'ပညာပေး အန္တရာယ်နှင့် Position Size တွက်ချက်စနစ်'
                : 'Educational Risk & Position Sizing Calculator'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'my'
                ? 'အကောင့်အရင်းအနှီးကို အရင်ကာကွယ်ပါ။ မည်သည့်အခါမျှ စိတ်ခံစားချက်ဖြင့် အရွယ်အစားမသတ်မှတ်ပါနှင့်။'
                : 'Capital preservation first: Calculate exact position size based on dollar risk, not emotions.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculator Inputs (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'my' ? 'တွက်ချက်ရန် အချက်အလက်များ' : 'Trade Parameters'}
            </span>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-500 hidden sm:inline">Preset:</span>
              {['BTC', 'ETH', 'SOL'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleSelectCoinPreset(sym)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Account Balance */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
              <span>{lang === 'my' ? 'အကောင့်လက်ကျန် (Account Balance)' : 'Account Balance:'}</span>
              <span className="text-amber-400 font-mono font-bold">${accountBalance.toLocaleString()}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Risk Percentage */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>{lang === 'my' ? 'အဆုံးခံနိုင်သော ရာခိုင်နှုန်း (Risk %)' : 'Risk per Trade (%):'}</span>
              <span className={`font-mono font-bold ${isRiskHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                {riskPercent}% (${maxRiskUsd.toFixed(2)})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setRiskPercent(pct)}
                  className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                    riskPercent === pct
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            {riskPercent > 2.0 && (
              <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{lang === 'my' ? 'သတိပေးချက်: အကောင့်တစ်ခုလျှင် ၂% ထက်ပိုမိုစွန့်စားခြင်းသည် အန္တရာယ်များသည်။' : 'Warning: Risking >2% per trade dramatically increases drawdown risk.'}</span>
              </p>
            )}
          </div>

          {/* Trade Direction (LONG / SHORT) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {lang === 'my' ? 'ကုန်သွယ်မှု ဦးတည်ချက် (Trade Direction)' : 'Direction:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSide('LONG');
                  if (stopLossPrice >= entryPrice) setStopLossPrice(entryPrice * 0.98);
                  if (takeProfitPrice <= entryPrice) setTakeProfitPrice(entryPrice * 1.06);
                }}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  side === 'LONG'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>LONG (ဝယ်ယူခြင်း)</span>
              </button>
              <button
                onClick={() => {
                  setSide('SHORT');
                  if (stopLossPrice <= entryPrice) setStopLossPrice(entryPrice * 1.02);
                  if (takeProfitPrice >= entryPrice) setTakeProfitPrice(entryPrice * 0.94);
                }}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  side === 'SHORT'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>SHORT (ရောင်းချခြင်း)</span>
              </button>
            </div>
          </div>

          {/* Entry, Stop Loss, Take Profit */}
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                {lang === 'my' ? 'ဝင်ရောက်မည့် စျေးနှုန်း (Entry Price):' : 'Entry Price ($):'}
              </label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Math.max(0.0001, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-rose-400 block mb-1">
                  {lang === 'my' ? 'အရှုံးဖြတ် စျေးနှုန်း (Stop Loss):' : 'Stop Loss ($):'}
                </label>
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Math.max(0.0001, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-1.5 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Gap: {slDistancePercent.toFixed(2)}%
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-emerald-400 block mb-1">
                  {lang === 'my' ? 'အမြတ်ယူ စျေးနှုန်း (Take Profit):' : 'Take Profit ($):'}
                </label>
                <input
                  type="number"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(Math.max(0.0001, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Target: {tpDistancePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Leverage */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>{lang === 'my' ? 'Leverage (အဆမြှင့်ခြင်း):' : 'Leverage:'}</span>
              <span className="text-indigo-400 font-mono font-bold">{leverage}x</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[2, 5, 10, 20, 50].map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                    leverage === lev
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Outputs & Educational Audit (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Output Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Maximum Risk $ */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                {lang === 'my' ? 'အများဆုံး အဆုံးခံငွေ' : 'Max Risk $'}
              </span>
              <div className="text-lg font-mono font-black text-rose-400">
                -${maxRiskUsd.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500">
                {riskPercent}% of ${accountBalance.toLocaleString()}
              </span>
            </div>

            {/* Position Size (Notional) */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                {lang === 'my' ? 'Position စုစုပေါင်း အရွယ်အစား' : 'Position Size (Notional)'}
              </span>
              <div className="text-lg font-mono font-black text-white">
                ${positionSizeUsd.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                ≈ {positionSizeCoins.toFixed(4)} Units
              </span>
            </div>

            {/* Required Margin */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                {lang === 'my' ? 'လိုအပ်သော အာမခံငွေ' : 'Required Margin'}
              </span>
              <div className="text-lg font-mono font-black text-amber-400">
                ${requiredMargin.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500">
                At {leverage}x leverage
              </span>
            </div>

            {/* Potential Profit */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                {lang === 'my' ? 'TP ထိပါက အမြတ်ငွေ' : 'Potential Profit at TP'}
              </span>
              <div className="text-lg font-mono font-black text-emerald-400">
                +${potentialProfitUsd.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-500/80">
                +{((potentialProfitUsd / accountBalance) * 100).toFixed(2)}% of account
              </span>
            </div>

            {/* Risk / Reward */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                {lang === 'my' ? 'အမြတ်/အရှုံး အချိုး' : 'Risk / Reward Ratio'}
              </span>
              <div className={`text-lg font-mono font-black ${isRRHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                1 : {riskRewardRatio.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500">
                {isRRHealthy ? '✅ Good Target (>1:2)' : '⚠️ Low R:R (<1:2)'}
              </span>
            </div>

            {/* Liquidation Price */}
            <div className={`p-4 rounded-2xl border ${isLiquidationCloserThanSL ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-900 border-slate-800'}`}>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                {lang === 'my' ? 'ခန့်မှန်း Liquidation စျေး' : 'Est. Liquidation Price'}
              </span>
              <div className={`text-lg font-mono font-black ${isLiquidationCloserThanSL ? 'text-rose-400' : 'text-slate-300'}`}>
                ${estimatedLiquidationPrice.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500">
                Distance: {liquidationDistancePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Educational Safety Audit Panel */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'my' ? 'နည်းပညာဆိုင်ရာ အန္တရာယ်စစ်ဆေးချက်' : 'Educational Risk Audit'}</span>
            </h3>

            {/* Check 1: Liquidation vs Stop Loss */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              {isLiquidationCloserThanSL ? (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className={`font-bold block ${isLiquidationCloserThanSL ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {isLiquidationCloserThanSL
                    ? lang === 'my'
                      ? 'အန္တရာယ်ကြီးမားသည်: Liquidation သည် Stop Loss ထက် စော၍ထိမည်!'
                      : 'Critical Risk: Liquidation will trigger BEFORE your Stop Loss!'
                    : lang === 'my'
                    ? 'ဘေးကင်းသည်: Stop Loss သည် Liquidation ထက် စော၍ အလုပ်လုပ်မည်'
                    : 'Healthy Buffer: Stop Loss triggers safely before liquidation level.'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'my'
                    ? `သင်၏ Stop Loss သည် ${slDistancePercent.toFixed(1)}% အကွာတွင်ရှိပြီး Liquidation သည် ${liquidationDistancePercent.toFixed(1)}% အကွာတွင် ရှိသည်။`
                    : `Your SL is ${slDistancePercent.toFixed(1)}% away while liquidation buffer is ${liquidationDistancePercent.toFixed(1)}%.`}
                </p>
              </div>
            </div>

            {/* Check 2: Risk % Audit */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              {isRiskHealthy ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className={`font-bold block ${isRiskHealthy ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isRiskHealthy
                    ? lang === 'my'
                      ? `အကောင့်၏ ${riskPercent}% သာ အဆုံးခံထားသဖြင့် စည်းကမ်းရှိသည်`
                      : `Disciplined Risk: ${riskPercent}% risk preserves capital across losing streaks.`
                    : lang === 'my'
                    ? `အကောင့်၏ ${riskPercent}% စွန့်စားထားသည် (အကြံပြုချက်: ၁% မှ ၂% အတွင်းသာ သုံးပါ)`
                    : `High Risk (${riskPercent}%): Professional traders cap per-trade risk at 1-2%.`}
                </span>
              </div>
            </div>

            {/* Key Rule Note */}
            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
              <span className="font-bold block mb-1">
                💡 {lang === 'my' ? 'မှတ်သားရန် အဓိကသင်ခန်းစာ:' : 'Key Educational Concept:'}
              </span>
              <p className="text-[11px] text-slate-300">
                {lang === 'my'
                  ? 'Leverage ကို အမြတ်များများရရန် မသုံးပါနှင့်။ Leverage မြင့်လေ လိုအပ်သော အာမခံငွေ (Margin) နည်းလေဖြစ်သော်လည်း၊ အမှန်တကယ် Position Size ကို Stop Loss အကွာအဝေးနှင့် အဆုံးခံငွေ ဒေါ်လာပေါ်မူတည်၍သာ တိကျစွာ တွက်ချက်ရမည်။'
                  : 'Never use leverage to force a giant position. Leverage merely reduces required collateral margin; your true position size MUST be determined strictly by your Stop Loss distance and max dollar risk.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
