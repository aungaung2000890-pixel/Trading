import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Layers,
  Calculator,
  Compass,
} from 'lucide-react';
import { CoinOpportunity } from '../types';

interface BestCoinAdvisorProps {
  onSelectSol: () => void;
  lang: 'my' | 'en';
}

export const BestCoinAdvisor: React.FC<BestCoinAdvisorProps> = ({ onSelectSol, lang }) => {
  const isMy = lang === 'my';
  const [activeScenario, setActiveScenario] = useState<'long' | 'short'>('long');
  const [selectedLeverage, setSelectedLeverage] = useState<number>(10);
  const [userMargin, setUserMargin] = useState<number>(100);

  // Math for Scenario
  const entryPrice = 100.49;
  const longTp1 = 105.00;
  const longTp2 = 110.50;
  const longSl = 98.80;

  const shortTp1 = 94.50;
  const shortTp2 = 90.00;
  const shortSl = 101.80;

  const currentSl = activeScenario === 'long' ? longSl : shortSl;
  const currentTp = activeScenario === 'long' ? longTp2 : shortTp2;

  // Percentage moves
  const movePct = Math.abs(((currentTp - entryPrice) / entryPrice) * 100);
  const slPct = Math.abs(((currentSl - entryPrice) / entryPrice) * 100);
  const rrRatio = (movePct / slPct).toFixed(1);

  // Leverage & Liquidation math
  const notional = userMargin * selectedLeverage;
  const estProfit = (notional * (movePct / 100)).toFixed(1);
  const estRisk = (notional * (slPct / 100)).toFixed(1);
  const liqDistancePct = (100 / selectedLeverage) * 0.95; // maintenance margin approx
  const estLiqPrice =
    activeScenario === 'long'
      ? (entryPrice * (1 - liqDistancePct / 100)).toFixed(2)
      : (entryPrice * (1 + liqDistancePct / 100)).toFixed(2);

  // Radial Feasibility Arc Math (Score = 88%)
  const feasibilityScore = activeScenario === 'long' ? 88 : 54;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const arcOffset = circumference - (feasibilityScore / 100) * circumference;

  return (
    <section className="bg-slate-900/95 dark:bg-slate-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl w-full max-w-full overflow-hidden backdrop-blur-md relative group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {isMy ? '#1 အဆင့်သတ်မှတ် COIN SETUP' : '#1 RANKED TRADE OPPORTUNITY'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                SOLUSDT ($100.49)
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
              {isMy
                ? 'SOLUSDT: $100.00 အဓိက Support Zone အား စမ်းသပ်နေမှု (High Feasibility)'
                : 'SOLUSDT: Testing $100.00 Major Psychological Support Zone'}
            </h3>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="focus-sol-btn"
          onClick={onSelectSol}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
        >
          <span>{isMy ? 'SOL Chart အပြည့်အစုံ ကြည့်မည်' : 'Inspect Full Setup'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Scenario & Terminal Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4">
        {/* Left Column: Interactive Scenario Switcher & Playbook (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Dual Scenario Selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveScenario('long')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeScenario === 'long'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isMy ? 'ဗျူဟာ (က) : BUY / LONG (88% အားသာချက်)' : 'Plan A: BUY / LONG (88% Bias)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScenario('short')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeScenario === 'short'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{isMy ? 'ဗျူဟာ (ခ) : SELL / SHORT (Breakdown)' : 'Plan B: SELL / SHORT (Breakdown)'}</span>
            </button>
          </div>

          {/* Scenario Targets & Triggers */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{isMy ? 'ဝင်ရောက်မည့် အဆင့် (Entry Zone):' : 'Entry Trigger Zone:'}</span>
              <span className="text-amber-400 font-bold">$100.20 – $101.00</span>
            </div>

            {/* Visual Price Ladder Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <span>SL: ${currentSl.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500">(-{slPct.toFixed(1)}%)</span>
                </span>
                <span className="text-amber-300 font-bold">ENTRY: ${entryPrice.toFixed(2)}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span>TP: ${currentTp.toFixed(2)}</span>
                  <span className="text-[10px] text-emerald-500">(+{movePct.toFixed(1)}%)</span>
                </span>
              </div>

              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                <div
                  className="bg-rose-500/80 h-full flex items-center justify-center text-[8px] text-white"
                  style={{ width: `${Math.min(30, (slPct / (slPct + movePct)) * 100)}%` }}
                  title="Risk Portion"
                />
                <div
                  className="bg-emerald-500 h-full flex items-center justify-center text-[8px] text-slate-950 font-bold"
                  style={{ width: `${Math.max(70, (movePct / (slPct + movePct)) * 100)}%` }}
                  title="Reward Portion"
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>Risk/Reward: <strong className="text-white">1 : {rrRatio}</strong></span>
                <span>TP1 (+4.5%): <strong className="text-emerald-400">${activeScenario === 'long' ? '105.00' : '94.50'}</strong></span>
                <span>TP2 (+10% Move): <strong className="text-emerald-400">${currentTp.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Concrete Trade Trigger Note */}
            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 leading-relaxed">
              <div className="text-amber-400 font-bold font-mono text-[11px] mb-0.5 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{isMy ? 'ဝင်ရောက်ရမည့် အတည်ပြုချက် (Exact Trigger):' : 'Execution Trigger Rule:'}</span>
              </div>
              {activeScenario === 'long'
                ? (isMy
                  ? '၁၅ မိနစ် (15M) တွင် $99.80 အောက်သို့ ဆင်းပြီး $100.50 အထက် အမြန်ပြန်တက်ပိတ်ပါက (Bullish SFP) သို့မဟုတ် 1H Candle သည် $102.50 အထက် သေချာပေါက်ပိတ်ပါက ဝင်ပါ။'
                  : 'Enter on 15M Bullish SFP ($99.80 liquidity sweep snapping back above $100.50) OR strong 1H close above $102.50.')
                : (isMy
                  ? '1H Candle သည် $99.00 အောက်သို့ သေချာစွာ Breakout ဆင်းပိတ်ပြီး Retest တွင် $100 အောက် ငြင်းပယ်ခံရပါကမှ Short ဝင်ပါ။'
                  : 'Only enter SHORT if 1H closes firmly below $99.00 and fails the retest at $100.00.')}
            </div>
          </div>
        </div>

        {/* Right Column: Radial Feasibility & Interactive Leverage PnL Calculator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
          {/* Radial Feasibility Gauge */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                {isMy ? '၁၀% အမြတ် ဖြစ်နိုင်ခြေ အဆင့်' : '10% MOVE FEASIBILITY'}
              </span>
              <div className="text-base font-black font-mono text-emerald-400 mt-0.5">
                {feasibilityScore}% FEASIBILITY
              </div>
              <span className="text-[10px] text-slate-400 block">
                {isMy ? 'Volume $907M & သန့်ရှင်းသော Support' : '$907M Volume & Clean Liquidity'}
              </span>
            </div>

            {/* Mini Circular Feasibility Meter */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={radius} fill="none" stroke="#1e293b" strokeWidth="4.5" />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke={activeScenario === 'long' ? '#10b981' : '#f59e0b'}
                  strokeWidth="4.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={arcOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-black text-white">
                {feasibilityScore}%
              </div>
            </div>
          </div>

          {/* Interactive Leverage & Liquidation Simulator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">{isMy ? 'Leverage ချိန်ညှိမှု:' : 'Leverage Safety:'}</span>
              <div className="flex items-center gap-1">
                {[5, 10, 20, 30].map((lev) => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setSelectedLeverage(lev)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                      selectedLeverage === lev
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">NOTIONAL</span>
                <span className="text-[11px] font-bold text-white">${notional}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">EST PROFIT</span>
                <span className="text-[11px] font-bold text-emerald-400">+${estProfit}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">LIQ PRICE</span>
                <span className={`text-[11px] font-bold ${selectedLeverage > 15 ? 'text-amber-400' : 'text-slate-300'}`}>
                  ${estLiqPrice}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-tight">
              {selectedLeverage > 15 ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ {isMy ? `သတိ: ${selectedLeverage}x တွင် Liquidation ကွာဟချက် ${liqDistancePct.toFixed(1)}% သာရှိသည်။ 10x ကို ဦးစားပေးပါ။` : `Warning: ${selectedLeverage}x offers only ${liqDistancePct.toFixed(1)}% adverse room before liquidation.`}
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">
                  ✓ {isMy ? `${selectedLeverage}x တွင် Liquidation ကွာဟချက် ${liqDistancePct.toFixed(1)}% ရှိသဖြင့် ဘေးကင်းသည်။` : `Optimal: ${selectedLeverage}x gives a healthy ${liqDistancePct.toFixed(1)}% safety buffer.`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
