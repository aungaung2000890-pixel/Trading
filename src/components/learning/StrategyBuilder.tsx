import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Save,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export interface StrategyPlan {
  id: string;
  name: string;
  nameMy: string;
  description: string;
  descriptionMy: string;
  marketCondition: string;
  timeframe: string;
  setup: string;
  confirmation: string;
  entryRule: string;
  stopLossRule: string;
  takeProfitRule: string;
  positionSizeRule: string;
  riskRewardTarget: string;
  exitRules: string;
  isCustom?: boolean;
}

const PRESET_STRATEGIES: StrategyPlan[] = [
  {
    id: 'preset-1',
    name: '4H Support Pullback & Trend Continuation',
    nameMy: '4H Support ပြန်ဆင်းလာမှုနှင့် Trend ဆက်တိုက်တက်ခြင်း',
    description: 'Disciplined swing setup entering at established institutional support during a daily uptrend.',
    descriptionMy: 'Daily Uptrend ကာလတွင် 4H Key Support သို့ စျေးပြန်ဆင်းလာချိန် စည်းကမ်းတကျ ဝင်ရောက်ခြင်း။',
    marketCondition: 'Clear Uptrend (Price above 50 & 200 EMA on 1D/4H)',
    timeframe: '4-Hour (Analysis) & 15-Minute (Trigger)',
    setup: 'Price pulls back into prior broken resistance, now acting as strong support + 50 EMA convergence.',
    confirmation: 'Bullish Engulfing candle or Hammer with higher buy volume on 15m; RSI > 45 bouncing from oversold.',
    entryRule: 'Enter immediately upon confirmation candle close or place limit order at 50% retracement of trigger candle.',
    stopLossRule: 'Strictly placed 0.5% below the recent swing low and below the support zone.',
    takeProfitRule: 'TP1 at the previous swing high (1.5R); TP2 at Fibonacci 1.272 extension (3.0R).',
    positionSizeRule: 'Calculated using 1.0% max account risk formula. Never override with gut feeling.',
    riskRewardTarget: 'Minimum 1:2.5 Risk-to-Reward ratio. Skip trade if R:R is below 1:2.',
    exitRules: 'Move Stop Loss to Breakeven after TP1 is hit. Close remaining position if 4H candle closes below 20 EMA.',
    isCustom: false,
  },
  {
    id: 'preset-2',
    name: '15M Range Breakout & Structural Retest',
    nameMy: '15M Range ဘေးတိုက်ဘောင်မှ ဖောက်ထွက်ပြီး ပြန်လည်စမ်းသပ်ခြင်း',
    description: 'Intraday breakout strategy capitalizing on volatility expansion after a multi-hour squeeze.',
    descriptionMy: 'နာရီပေါင်းများစွာ ငြိမ်သက်နေပြီးနောက် အရှိန်အဟုန်ဖြင့် ဖောက်ထွက်လာသော အခိုက်အတန့်ကို ရယူခြင်း။',
    marketCondition: 'Low volatility range consolidation forming tight Bollinger Bands or horizontal squeeze.',
    timeframe: '15-Minute (Primary Chart) & 5-Minute (Execution)',
    setup: 'A high-volume candle decisively closes outside the range ceiling resistance with at least 1.5x average volume.',
    confirmation: 'Wait for price to retest the broken level as new support. A 5m rejection wick confirms buyer defense.',
    entryRule: 'Limit order at the retest level, or market entry on the first green 5m bounce candle.',
    stopLossRule: 'Set just inside the previous range, beneath the retest wick (typically 1.0% - 1.5% distance).',
    takeProfitRule: 'Equal to 100% of the measured range height projected upwards (typically 1:2 to 1:3 R:R).',
    positionSizeRule: 'Maximum 1.0% account risk. Leverage kept conservative (maximum 5x to 10x).',
    riskRewardTarget: 'Minimum 1:2.0. If retest is sloppy, cancel limit order.',
    exitRules: 'Trail stop beneath higher lows on the 15m timeframe. Close trade if price re-enters range interior.',
    isCustom: false,
  },
  {
    id: 'preset-3',
    name: 'Liquidity Sweep & FVG Reversal',
    nameMy: 'Liquidity Sweep ရှင်းလင်းမှုနှင့် FVG ပြန်ဖြည့်စနစ်',
    description: 'Advanced Smart Money concept capturing liquidity traps when stop orders are swept at key highs/lows.',
    descriptionMy: 'အဖွဲ့အစည်းကြီးများ Retail Trader များ၏ Stop Loss များကို သိမ်းကျုံးရှင်းလင်းပြီး စျေးပြန်လှည့်ချိန်။',
    marketCondition: 'Clear key swing high or equal highs (EQH) with concentrated liquidity resting above.',
    timeframe: '1-Hour (Liquidity Pool) & 5-Minute (Shift in Market Structure)',
    setup: 'Price pierces above the key high, grabs buy stops, but violently rejects back below within minutes.',
    confirmation: '5m Change of Character (CHoCH) breaking the recent Higher Low and leaving a prominent Fair Value Gap (FVG).',
    entryRule: 'Limit short entry at the 50% equilibrium level of the 5m Bearish FVG.',
    stopLossRule: 'Strictly 2 ticks above the extreme sweep wick high.',
    takeProfitRule: 'TP1 at the internal liquidity low; TP2 at the opposing major swing low pool (often 1:3 to 1:5 R:R).',
    positionSizeRule: 'Strict 0.5% - 1.0% risk due to high precision entry requiring tight stop loss.',
    riskRewardTarget: 'Minimum 1:3.0 Risk-to-Reward ratio.',
    exitRules: 'Full invalidation if price breaks back above the sweep wick high. Take partials at opposing FVG.',
    isCustom: false,
  },
];

const STORAGE_KEY = 'crypto_learning_custom_strategies_v1';

export const StrategyBuilder: React.FC<{ lang: 'my' | 'en' }> = ({ lang }) => {
  const [strategies, setStrategies] = useState<StrategyPlan[]>(PRESET_STRATEGIES);
  const [selectedId, setSelectedId] = useState<string>(PRESET_STRATEGIES[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<StrategyPlan>(PRESET_STRATEGIES[0]);

  // Load saved custom strategies from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: StrategyPlan[] = JSON.parse(saved);
        setStrategies([...PRESET_STRATEGIES, ...parsed]);
      }
    } catch {
      // fallback
    }
  }, []);

  const activeStrategy = strategies.find((s) => s.id === selectedId) || strategies[0];

  useEffect(() => {
    setFormData(activeStrategy);
    setIsEditing(false);
  }, [selectedId, strategies]);

  const handleSaveStrategy = () => {
    let updated: StrategyPlan[];
    if (formData.isCustom) {
      updated = strategies.map((s) => (s.id === formData.id ? formData : s));
    } else {
      // Cloning preset as a new custom strategy
      const newStrategy: StrategyPlan = {
        ...formData,
        id: 'strat-' + Date.now(),
        name: formData.name + ' (My Custom Plan)',
        nameMy: formData.nameMy + ' (မိမိကိုယ်ပိုင် စည်းမျဉ်း)',
        isCustom: true,
      };
      updated = [...strategies, newStrategy];
      setSelectedId(newStrategy.id);
    }
    setStrategies(updated);
    setIsEditing(false);

    // Save only customs to storage
    const customs = updated.filter((s) => s.isCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
  };

  const handleCreateNew = () => {
    const blank: StrategyPlan = {
      id: 'strat-' + Date.now(),
      name: 'New Custom 10-Step Strategy',
      nameMy: 'ကိုယ်ပိုင် စည်းကမ်းချက် ၁၀ ချက် စနစ်သစ်',
      description: 'My disciplined personal trading plan rules.',
      descriptionMy: 'မိမိကိုယ်ပိုင် ကုန်သွယ်မှုစည်းမျဉ်း လမ်းညွှန်ချက်။',
      marketCondition: 'e.g. Uptrend above 50 EMA on 4H',
      timeframe: '4H Analysis / 15m Entry',
      setup: 'e.g. Pullback to key support zone',
      confirmation: 'e.g. Bullish engulfing candle close with volume',
      entryRule: 'e.g. Limit order at retest of support level',
      stopLossRule: 'e.g. 0.5% below recent swing low structure',
      takeProfitRule: 'e.g. TP1 at next resistance (1.5R), TP2 at 1:3 R:R',
      positionSizeRule: 'e.g. Maximum 1% account risk calculated via formula',
      riskRewardTarget: 'e.g. Minimum 1:2.5',
      exitRules: 'e.g. Move SL to breakeven after 1R; close if invalidation candle closes below support',
      isCustom: true,
    };
    const updated = [...strategies, blank];
    setStrategies(updated);
    setSelectedId(blank.id);
    setFormData(blank);
    setIsEditing(true);

    const customs = updated.filter((s) => s.isCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
  };

  const handleDeleteStrategy = (id: string) => {
    const updated = strategies.filter((s) => s.id !== id);
    setStrategies(updated);
    setSelectedId(PRESET_STRATEGIES[0].id);
    const customs = updated.filter((s) => s.isCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
  };

  const handleCopySummary = () => {
    const text = `📋 TRADING STRATEGY: ${activeStrategy.name}
1. Market Condition: ${activeStrategy.marketCondition}
2. Timeframe: ${activeStrategy.timeframe}
3. Setup: ${activeStrategy.setup}
4. Confirmation: ${activeStrategy.confirmation}
5. Entry: ${activeStrategy.entryRule}
6. Stop Loss: ${activeStrategy.stopLossRule}
7. Take Profit: ${activeStrategy.takeProfitRule}
8. Position Size: ${activeStrategy.positionSizeRule}
9. Risk/Reward: ${activeStrategy.riskRewardTarget}
10. Exit Rules: ${activeStrategy.exitRules}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepsList = [
    { num: 1, key: 'marketCondition', labelEn: '1. Market Condition', labelMy: '၁။ စျေးကွက်အခြေအနေ', icon: '🌍' },
    { num: 2, key: 'timeframe', labelEn: '2. Timeframe Selection', labelMy: '၂။ ရွေးချယ်မည့် အချိန်ဘောင်', icon: '⏱️' },
    { num: 3, key: 'setup', labelEn: '3. Technical Setup Pattern', labelMy: '၃။ နည်းပညာ Setup ပုံစံ', icon: '📐' },
    { num: 4, key: 'confirmation', labelEn: '4. Confirmation Signal', labelMy: '၄။ အတည်ပြု အချက်ပြချက်', icon: '✅' },
    { num: 5, key: 'entryRule', labelEn: '5. Entry Trigger Rule', labelMy: '၅။ ဝင်ရောက်မည့် စည်းမျဉ်း', icon: '🎯' },
    { num: 6, key: 'stopLossRule', labelEn: '6. Stop Loss Invalidation', labelMy: '၆။ အရှုံးဖြတ် စည်းကမ်းချက်', icon: '🛑' },
    { num: 7, key: 'takeProfitRule', labelEn: '7. Take Profit Target', labelMy: '၇။ အမြတ်ယူမည့် ပစ်မှတ်', icon: '💰' },
    { num: 8, key: 'positionSizeRule', labelEn: '8. Position Sizing Formula', labelMy: '၈။ Position အရွယ်အစား သတ်မှတ်ချက်', icon: '⚖️' },
    { num: 9, key: 'riskRewardTarget', labelEn: '9. Risk-to-Reward Target', labelMy: '၉။ အမြတ်/အရှုံး အချိုး (R:R)', icon: '📊' },
    { num: 10, key: 'exitRules', labelEn: '10. Trade Management & Exits', labelMy: '၁၀။ အော်ဒါထိန်းကျောင်းမှုနှင့် ထွက်ခွာခြင်း', icon: '🚪' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/20 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              {lang === 'my' ? '၁၀ ချက်ပါ ကုန်သွယ်မှု မဟာဗျူဟာ ရေးဆွဲစနစ်' : 'Interactive 10-Step Strategy Builder'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            {lang === 'my'
              ? 'ကျပန်း ကုန်သွယ်ခြင်းကို ရပ်တန့်ပါ။ စျေးကွက်မဝင်မီ ဤ ၁၀ ချက်ကို တိကျစွာ ရေးသားချမှတ်ထားခြင်းဖြင့် စိတ်ခံစားချက်ကြောင့် အရင်းပြုန်းတီးခြင်းမှ ကာကွယ်ပါ။'
              : 'Eliminate emotional trading. Define and lock in all 10 essential rules before risking a single dollar.'}
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'my' ? 'မဟာဗျူဟာအသစ် ရေးဆွဲမည်' : 'Create New Strategy'}</span>
        </button>
      </div>

      {/* Main Grid: Strategy Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Strategy List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block px-1">
            {lang === 'my' ? 'ရရှိနိုင်သော စနစ်များနှင့် မူကြမ်းများ' : 'Saved Strategy Playbooks'}
          </span>

          <div className="space-y-2">
            {strategies.map((strat) => {
              const isSelected = strat.id === selectedId;
              return (
                <div
                  key={strat.id}
                  onClick={() => setSelectedId(strat.id)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition relative group ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-900/80 hover:bg-slate-800/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-slate-800">
                      {strat.isCustom ? (lang === 'my' ? 'ကိုယ်ပိုင်' : 'Custom Plan') : 'Verified Preset'}
                    </span>
                    {strat.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStrategy(strat.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Delete strategy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1 line-clamp-1">
                    {lang === 'my' && strat.nameMy ? strat.nameMy : strat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {lang === 'my' && strat.descriptionMy ? strat.descriptionMy : strat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 10-Step Template Detail / Editor (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          {/* Header of Active Strategy */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  {formData.isCustom ? 'CUSTOM PLAYBOOK' : 'VERIFIED SYSTEM'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {lang === 'my' && formData.nameMy ? formData.nameMy : formData.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'my' && formData.descriptionMy ? formData.descriptionMy : formData.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'my' ? 'ကူးယူပြီး' : 'Copied!') : (lang === 'my' ? 'ကူးယူမည်' : 'Copy Plan')}</span>
              </button>

              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveStrategy();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEditing ? (lang === 'my' ? 'သိမ်းဆည်းမည်' : 'Save Changes') : (lang === 'my' ? 'ပြင်ဆင်မည်' : 'Edit Rules')}</span>
              </button>
            </div>
          </div>

          {/* Strategy Name & Description if Editing */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Strategy Title:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Brief Description:
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* The 10 Steps List */}
          <div className="space-y-3">
            {stepsList.map((step) => {
              const currentValue = (formData as any)[step.key] || '';
              return (
                <div
                  key={step.key}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-400 flex items-center gap-2">
                      <span>{step.icon}</span>
                      <span>{lang === 'my' ? step.labelMy : step.labelEn}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Step {step.num}/10</span>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={currentValue}
                      onChange={(e) => setFormData({ ...formData, [step.key]: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-xs text-slate-200 leading-relaxed pl-6">
                      {currentValue}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
