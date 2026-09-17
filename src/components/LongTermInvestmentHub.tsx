import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  PieChart,
  DollarSign,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Activity,
  FileText,
  Copy,
  RefreshCw,
  Info,
  Sliders,
  Maximize2,
  Lock,
} from 'lucide-react';
import {
  LongTermTimeframe,
  LongTermRiskTolerance,
  LongTermAnalysisResult,
  LongTermAssetRecommendation,
} from '../types';
import { fetchLongTermInvestmentAnalysis } from '../utils/longTermApi';

interface LongTermInvestmentHubProps {
  lang: 'my' | 'en';
  onNavigateToDemo?: (symbol: string, side: 'LONG' | 'SHORT') => void;
  onOpenAI?: (query: string) => void;
  accentColor?: string;
}

const TIMEFRAMES: Array<{
  id: LongTermTimeframe;
  labelEn: string;
  labelMy: string;
  badge: string;
  descEn: string;
  descMy: string;
}> = [
  {
    id: '1_month',
    labelEn: '1 Month',
    labelMy: '၁ လ',
    badge: 'Tactical Swing',
    descEn: 'Momentum breakouts & monthly mean reversion',
    descMy: 'လစဉ် လှိုင်းစီးမှုနှင့် အမြန် အကျိုးအမြတ် လျင်မြန်စွာရှာဖွေခြင်း',
  },
  {
    id: '3_months',
    labelEn: '3 Months',
    labelMy: '၃ လ',
    badge: 'Quarterly Cycle',
    descEn: 'Macro catalyst positioning & seasonal trends',
    descMy: 'သုံးလပတ် မေခရိုအပြောင်းအလဲနှင့် အဓိက Catalyst စီးဝင်မှု',
  },
  {
    id: '6_months',
    labelEn: '6 Months',
    labelMy: '၆ လ',
    badge: 'Semi-Annual',
    descEn: 'Ecosystem adoption & monetary policy shift',
    descMy: 'ကွန်ရက်တိုးချဲ့မှုနှင့် အတိုးနှုန်းမူဝါဒ အပြောင်းအလဲ',
  },
  {
    id: '1_year',
    labelEn: '1 Year',
    labelMy: '၁ နှစ်',
    badge: 'Annual Wealth',
    descEn: 'Halving cycle expansion & high-beta compounding',
    descMy: 'Halving အလွန် ရေရှည် စည်းစိမ်တိုးပွားရေး မဟာဗျူဟာ',
  },
  {
    id: '3_years',
    labelEn: '3 Years',
    labelMy: '၃ နှစ်',
    badge: 'Multi-Year Core',
    descEn: 'Full 4-year cycle maturity & sovereign adoption',
    descMy: '၄ နှစ် စက်ဝန်းအပြည့် ကမ္ဘာ့အဆင့် ဒစ်ဂျစ်တယ်ရွှေ စုဆောင်းမှု',
  },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000, 50000];

export const LongTermInvestmentHub: React.FC<LongTermInvestmentHubProps> = ({
  lang,
  onNavigateToDemo,
  onOpenAI,
}) => {
  const isMy = lang === 'my';

  const [timeframe, setTimeframe] = useState<LongTermTimeframe>('1_year');
  const [amount, setAmount] = useState<number>(5000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('5000');
  const [riskTolerance, setRiskTolerance] = useState<LongTermRiskTolerance>('balanced');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<LongTermAnalysisResult | null>(null);
  const [expandedAssets, setExpandedAssets] = useState<Record<string, boolean>>({ BTC: true });
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [selectedScenarioTier, setSelectedScenarioTier] = useState<'conservative' | 'moderate' | 'bullish'>('moderate');

  const researchSteps = [
    isMy ? '၁/၈ စျေးကွက် မေခရိုအခြေအနေနှင့် BTC Dominance စစ်ဆေးနေသည်...' : '1/8 Evaluating macro market environment & BTC dominance...',
    isMy ? '၂/၈ Multi-Timeframe Technical Chart နှင့် Accumulation Range တွက်ချက်နေသည်...' : '2/8 Calculating HTF technical structure & key accumulation zones...',
    isMy ? '၃/၈ Tokenomics၊ Protocol Revenue နှင့် Treasury စစ်ဆေးနေသည်...' : '3/8 Analyzing tokenomics, real yield fees & protocol revenue...',
    isMy ? '၄/၈ Spot ETF Inflows နှင့် နောက်ဆုံး Institutional သတင်းများ စုဆောင်းနေသည်...' : '4/8 Scanning institutional spot ETF net inflows & major catalysts...',
    isMy ? '၅/၈ On-Chain Exchange Reserves နှင့် Whale Accumulation စစ်ဆေးနေသည်...' : '5/8 Auditing on-chain exchange reserves & whale wallet movements...',
    isMy ? '၆/၈ ကမ္ဘာ့ဗဟိုဘဏ် အတိုးနှုန်းနှင့် SEC/MiCA စည်းမျဉ်းများကို လေ့လာနေသည်...' : '6/8 Evaluating central bank rate trajectory & SEC/MiCA regulations...',
    isMy ? '၇/၈ ဖြစ်တန်စွမ်း အမြင့်ဆုံး (Highest Probability) Return Scenarios တွက်ချက်နေသည်...' : '7/8 Generating multi-scenario probability returns & max drawdowns...',
    isMy ? '၈/၈ ဒေါ်လာ ခွဲဝေမှု (Allocation) နှင့် Staged DCA အစီအစဉ် ရေးဆွဲနေသည်...' : '8/8 Finalizing capital allocation ($) & disciplined DCA staging plan...',
  ];

  // Perform initial analysis on load
  useEffect(() => {
    handleRunAnalysis();
  }, []);

  const handleAmountChange = (val: number) => {
    const clean = Math.max(10, Math.min(10000000, val));
    setAmount(clean);
    setCustomAmountInput(clean.toString());
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Animate step progress
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < researchSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      const result = await fetchLongTermInvestmentAnalysis({
        timeframe,
        investmentAmount: amount,
        riskTolerance,
        lang,
      });

      clearInterval(stepInterval);
      setAnalysisResult(result);
    } catch (err) {
      clearInterval(stepInterval);
      console.warn('Long-term analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleAssetExpand = (symbol: string) => {
    setExpandedAssets((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  const handleCopySummary = () => {
    if (!analysisResult) return;
    const summary = `${isMy ? '📊 ရေရှည်ရင်းနှီးမြှုပ်နှံမှု အစီရင်ခံစာ' : '📊 Long-Term Investment Analysis'}\n${
      analysisResult.portfolioSummaryMarkdown
    }\n\n${analysisResult.disclaimer}`;
    navigator.clipboard?.writeText(summary);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner & Intro - Modern Bybit/Terminal Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase bg-amber-500 text-slate-950">
                PRO WEALTH STRATEGY
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NON-LEVERAGE CAPITAL GROWTH</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isMy ? 'ရေရှည်ရင်းနှီးမြှုပ်နှံမှု အကြံပေး ဗဟို (Long-Term Investment Hub)' : 'Institutional Long-Term Investment Advisor'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isMy
                ? 'သင်၏ ရင်းနှီးမြှုပ်နှံမည့် ငွေပမာဏကို ရိုက်ထည့်ရုံဖြင့် AI က Technical၊ Fundamental၊ On-Chain၊ Macro နှင့် သတင်းဒေတာများကို အလိုအလျောက် သုတေသနပြုကာ ရွေးချယ်ထားသော Timeframe အတွက် အမြင့်ဆုံး အလားအလာရှိသော ပိုင်ဆိုင်မှု ခွဲဝေမှုနှင့် မျှော်မှန်း Scenario များကို တွက်ချက်ပေးပါသည်။'
                : 'Enter your investment amount. AI synthesizes technical structures, on-chain metrics, macro catalysts, and fundamentals to allocate probability-weighted portfolios across 1M, 3M, 6M, 1Y, and 3Y horizons.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isMy ? 'AI သုတေသန ပြန်လည်လုပ်ဆောင်မည်' : 'Re-Analyze Market'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Controls Panel: Timeframe Selector & Investment Amount Input */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-lg space-y-6">
        {/* Row 1: Timeframe Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{isMy ? '၁။ ရင်းနှီးမြှုပ်နှံမည့် အချိန်ကာလ ရွေးချယ်ပါ (Select Horizon Timeframe)' : '1. Select Investment Timeframe'}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TIMEFRAMES.map((tf) => {
              const isActive = timeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  id={`tf-btn-${tf.id}`}
                  onClick={() => setTimeframe(tf.id)}
                  className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer group ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${isActive ? 'text-amber-400' : 'text-white'}`}>
                      {isMy ? tf.labelMy : tf.labelEn}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tf.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-tight">
                    {isMy ? tf.descMy : tf.descEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Investment Amount Input & Quick Chips */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          {/* Amount input */}
          <div className="lg:col-span-7 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{isMy ? '၂။ ရင်းနှီးမြှုပ်နှံမည့် ငွေပမာဏ (Investment Amount)' : '2. Investment Amount (USDT / USD)'}</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400">
                {isMy ? 'အနည်းဆုံး: $50' : 'Min: $50 USDT'}
              </span>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-lg">
                $
              </div>
              <input
                id="investment-amount-input"
                type="number"
                min="50"
                step="50"
                value={customAmountInput}
                onChange={(e) => {
                  setCustomAmountInput(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed) && parsed > 0) setAmount(parsed);
                }}
                placeholder="5000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-20 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                USDT
              </div>
            </div>

            {/* Quick preset amount chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Quick:</span>
              {PRESET_AMOUNTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleAmountChange(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    amount === p
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  ${p >= 1000 ? `${p / 1000}k` : p}
                </button>
              ))}
            </div>
          </div>

          {/* Risk preference selector */}
          <div className="lg:col-span-3 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>{isMy ? 'စွန့်စားမှု ပုံစံ (Risk Profile)' : 'Risk Profile'}</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['conservative', 'balanced', 'aggressive'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskTolerance(r)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                    riskTolerance === r
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isMy
                    ? r === 'conservative'
                      ? 'လုံခြုံ'
                      : r === 'balanced'
                      ? 'မျှတ'
                      : 'တိုးတက်'
                    : r}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="lg:col-span-2">
            <button
              id="execute-ai-research-btn"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition shadow-lg hover:shadow-amber-500/20 active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isMy ? 'AI သုတေသနပြုနေသည်...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isMy ? 'AI အစီအစဉ်ဆွဲမည်' : 'Analyze Portfolio'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Real-time Loading & Progress State */}
      {isAnalyzing && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isMy ? 'AI Institutional Investment Research Engine လည်ပတ်နေသည်...' : 'AI Investment Research Engine in Progress...'}
                </h4>
                <p className="text-xs text-amber-400 font-mono mt-0.5">
                  {researchSteps[analysisStep]}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {Math.round(((analysisStep + 1) / researchSteps.length) * 100)}%
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${((analysisStep + 1) / researchSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 4. Analysis Results Dashboard */}
      {analysisResult && !isAnalyzing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Investment Capital */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>{isMy ? 'ရင်းနှီးမြှုပ်နှံမှု ဘက်ဂျက်' : 'Total Capital'}</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-2">
                ${analysisResult.investmentAmount.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-normal">USDT</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{timeframe.replace('_', ' ').toUpperCase()} Horizon</span>
              </div>
            </div>

            {/* Card 2: Highest Probability Win Score */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>{isMy ? 'ဖြစ်တန်စွမ်း ရမှတ်' : 'Probability Score'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
                {analysisResult.overallProbabilityScore}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isMy ? 'High-Conviction Institutional Grade' : 'High-Conviction Thesis'}
              </div>
            </div>

            {/* Card 3: Moderate Estimated Return */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>{isMy ? 'မျှော်မှန်း အကျိုးအမြတ် (Moderate)' : 'Estimated Return (Mod)'}</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-2">
                +{analysisResult.estimatedReturnScenarios.moderate.maxPercent}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>{isMy ? 'မျှော်မှန်းတန်ဖိုး:' : 'Est. Value:'}</span>
                <strong className="text-white font-mono">
                  ${analysisResult.estimatedReturnScenarios.moderate.portfolioValue.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Card 4: Capital Preservation / Max Drawdown Buffer */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>{isMy ? 'အမြင့်ဆုံး အနုတ်ကျဆင်းနိုင်မှု' : 'Max Expected Drawdown'}</span>
                <ShieldCheck className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono mt-2">
                {analysisResult.estimatedReturnScenarios.moderate.maxDrawdown}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isMy ? 'DCA Staging ဖြင့် အနုတ်ကျဆင်းမှုကို ထိန်းချုပ်ထားသည်' : 'Buffered by multi-tier DCA staging'}
              </div>
            </div>
          </div>

          {/* Mandatory Non-Guarantee Disclaimer Banner */}
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 font-bold block mb-0.5">
                {isMy ? '⚠️ အမြတ်အစွန်း မာကင် အာမခံချက်မရှိခြင်းနှင့် စွန့်စားမှု သတိပေးချက်' : '⚠️ NON-GUARANTEED RESULTS & RISK DISCLOSURE'}
              </strong>
              {isMy
                ? 'ဤတွင်ဖော်ပြထားသော ခန့်မှန်းချက်များနှင့် ဖြစ်တန်စွမ်းများသည် Technical၊ Fundamental နှင့် On-Chain စျေးကွက်သမိုင်းအချက်အလက်များကို အခြေခံထားသော Probabilistic Scenarios (ဖြစ်နိုင်ခြေ ခန့်မှန်းတွက်ချက်မှုများ) သာဖြစ်ပြီး မည်သည့် အကျိုးအမြတ်ကိုမျှ အာမခံထားခြင်း မရှိပါ။ Cryptocurrency စျေးကွက်သည် အလွန်အတက်အကျမြန်ဆန်သဖြင့် မိမိဆုံးရှုံးနိုင်သည့် ပမာဏထက် ပို၍ မရင်းနှီးပါနှင့်။'
                : analysisResult.disclaimer}
            </div>
          </div>

          {/* Macro Thesis & Scenario Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Macro Synthesis (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    {isMy ? 'မေခရိုနှင့် စျေးကွက် သုတေသန အနှစ်ချုပ်' : 'Macro & Market Conditions Thesis'}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {analysisResult.source === 'gemini_ai' ? 'Gemini 3.8 Flash' : 'Algorithmic Research'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isMy ? analysisResult.macroMarketSummaryMy || analysisResult.macroMarketSummary : analysisResult.macroMarketSummary}
              </p>

              {/* Staged DCA Deployment Box */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isMy ? 'အဆင့်လိုက် ငွေခွဲဝေမှု မဟာဗျူဟာ (Staged DCA Plan)' : 'Recommended Staged DCA Deployment Plan'}</span>
                  </span>
                  <span className="text-emerald-400 font-mono">
                    {analysisResult.dcaStagingPlan.initialDeploymentPercent}% Initial
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Tranches:</span>
                    <strong className="text-white">{analysisResult.dcaStagingPlan.stagedTrancheCount} Tiers</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Cadence:</span>
                    <strong className="text-white">{analysisResult.dcaStagingPlan.frequency}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Pullback Rule:</span>
                    <strong className="text-amber-400">Dip Buys</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  {analysisResult.dcaStagingPlan.pullbackTriggerRule}
                </p>
              </div>

              {/* Action row: copy and ask AI */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700/60"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedToast ? (isMy ? 'ကူးယူပြီးပါပြီ!' : 'Copied!') : isMy ? 'အနှစ်ချုပ် ကူးယူမည်' : 'Copy Summary'}</span>
                </button>

                {onOpenAI && (
                  <button
                    onClick={() =>
                      onOpenAI(
                        `Explain the long-term investment strategy for $${analysisResult.investmentAmount} over ${analysisResult.timeframe}. How should I manage risk and rebalancing?`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isMy ? 'AI လက်ထောက်နှင့် ဆွေးနွေးမည်' : 'Ask AI Assistant'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Potential Return Scenarios Comparison (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    {isMy ? 'မျှော်မှန်း ဖြစ်တန်စွမ်း ဇယား (Scenarios)' : 'Return Scenarios'}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">
                  {isMy ? 'အာမခံချက်မဟုတ်သော ခန့်မှန်းချက်' : 'Non-guaranteed'}
                </span>
              </div>

              {/* 3 Scenario Cards */}
              <div className="space-y-3">
                {/* 1. Conservative */}
                <div
                  onClick={() => setSelectedScenarioTier('conservative')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedScenarioTier === 'conservative'
                      ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      1. Conservative (အရင်းအနှီး ထိန်းသိမ်းမှု)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {analysisResult.estimatedReturnScenarios.conservative.probability}% Prob
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2 font-mono">
                    <span className="text-lg font-black text-white">
                      +
                      {analysisResult.estimatedReturnScenarios.conservative.minPercent}% -{' '}
                      {analysisResult.estimatedReturnScenarios.conservative.maxPercent}%
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      ≈ ${analysisResult.estimatedReturnScenarios.conservative.portfolioValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{isMy ? 'အနုတ်ခံနိုင်စွမ်း:' : 'Max Drawdown:'}</span>
                    <span className="text-rose-400 font-mono font-bold">
                      {analysisResult.estimatedReturnScenarios.conservative.maxDrawdown}%
                    </span>
                  </div>
                </div>

                {/* 2. Moderate (Recommended Base Case) */}
                <div
                  onClick={() => setSelectedScenarioTier('moderate')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedScenarioTier === 'moderate'
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase">
                      2. Moderate (မျှတသော တိုးတက်မှု - Base Case)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      {analysisResult.estimatedReturnScenarios.moderate.probability}% Prob
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2 font-mono">
                    <span className="text-lg font-black text-white">
                      +
                      {analysisResult.estimatedReturnScenarios.moderate.minPercent}% -{' '}
                      {analysisResult.estimatedReturnScenarios.moderate.maxPercent}%
                    </span>
                    <span className="text-sm font-bold text-amber-400">
                      ≈ ${analysisResult.estimatedReturnScenarios.moderate.portfolioValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{isMy ? 'အနုတ်ခံနိုင်စွမ်း:' : 'Max Drawdown:'}</span>
                    <span className="text-rose-400 font-mono font-bold">
                      {analysisResult.estimatedReturnScenarios.moderate.maxDrawdown}%
                    </span>
                  </div>
                </div>

                {/* 3. Bullish Expansion */}
                <div
                  onClick={() => setSelectedScenarioTier('bullish')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedScenarioTier === 'bullish'
                      ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase">
                      3. Bullish (စျေးကွက်ကြီးထွားမှု အမြင့်ဆုံး)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {analysisResult.estimatedReturnScenarios.bullish.probability}% Prob
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2 font-mono">
                    <span className="text-lg font-black text-white">
                      +
                      {analysisResult.estimatedReturnScenarios.bullish.minPercent}% -{' '}
                      {analysisResult.estimatedReturnScenarios.bullish.maxPercent}%
                    </span>
                    <span className="text-sm font-bold text-indigo-400">
                      ≈ ${analysisResult.estimatedReturnScenarios.bullish.portfolioValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{isMy ? 'အနုတ်ခံနိုင်စွမ်း:' : 'Max Drawdown:'}</span>
                    <span className="text-rose-400 font-mono font-bold">
                      {analysisResult.estimatedReturnScenarios.bullish.maxDrawdown}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Recommended Portfolio Allocation Bar Visualizer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span>{isMy ? 'အကြံပြုထားသော ပိုင်ဆိုင်မှု အချိုးအစားများ (Portfolio Allocation)' : 'Recommended Asset Allocation'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isMy
                    ? `သင်၏ ရင်းနှီးမြှုပ်နှံငွေ $${analysisResult.investmentAmount.toLocaleString()} ကို အောက်ပါအတိုင်း ညီညွတ်စွာ ခွဲဝေထားပါသည်`
                    : `Calculated from your $${analysisResult.investmentAmount.toLocaleString()} USDT investment amount`}
                </p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                100% Total Allocation
              </div>
            </div>

            {/* Proportional visual bar */}
            <div className="w-full h-4 bg-slate-950 rounded-xl overflow-hidden flex border border-slate-800">
              {analysisResult.recommendedAssets.map((asset, idx) => {
                const colors = ['bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-purple-500'];
                const bg = colors[idx % colors.length];
                return (
                  <div
                    key={asset.symbol}
                    className={`${bg} h-full transition-all duration-300`}
                    style={{ width: `${asset.allocationPercent}%` }}
                    title={`${asset.symbol}: ${asset.allocationPercent}% ($${asset.allocatedAmountUsd})`}
                  />
                );
              })}
            </div>

            {/* Quick breakdown tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {analysisResult.recommendedAssets.map((asset, idx) => {
                const colors = ['border-amber-500/40 text-amber-400', 'border-indigo-500/40 text-indigo-400', 'border-emerald-500/40 text-emerald-400', 'border-cyan-500/40 text-cyan-400'];
                const colorCls = colors[idx % colors.length];
                return (
                  <div
                    key={asset.symbol}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${colorCls.split(' ')[1]}`}>{asset.symbol}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                        {asset.allocationPercent}%
                      </span>
                    </div>
                    <div className="text-base font-black text-white font-mono mt-1">
                      ${asset.allocatedAmountUsd.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {asset.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. In-Depth Asset Cards (10 Core Research Factors for Each Asset) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>{isMy ? 'အမြင့်ဆုံး အလားအလာရှိသော အကြွေစေ့များ၏ အသေးစိတ် သုတေသန' : 'Highest Probability Assets Deep-Dive'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isMy
                    ? 'Technical၊ Fundamental၊ On-Chain၊ News၊ Macro နှင့် စွန့်စားမှုဆိုင်ရာ ၁၀ ချက် စနစ်တကျ ခွဲခြမ်းစိတ်ဖြာချက်'
                    : 'Systematic 10-point analysis covering technicals, on-chain, macro, fundamentals, and scenario targets'}
                </p>
              </div>
            </div>

            {/* Asset Cards Accordion / Full-view */}
            {analysisResult.recommendedAssets.map((asset) => {
              const isExpanded = expandedAssets[asset.symbol] ?? false;
              return (
                <div
                  key={asset.symbol}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition"
                >
                  {/* Top Bar / Header of Asset */}
                  <div
                    onClick={() => toggleAssetExpand(asset.symbol)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition border-b border-slate-800/60"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 font-mono text-base shrink-0">
                        {asset.symbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-white">{asset.name}</h4>
                          <span className="text-xs font-mono text-slate-400">({asset.symbol}/USDT)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {asset.probabilityScore}% Prob
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              asset.riskLevel === 'LOW'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                            }`}
                          >
                            {asset.riskLevel} RISK
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 max-w-2xl line-clamp-1">
                          {asset.marketConditionSummary}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Allocated $ & % */}
                    <div className="flex items-center gap-5 justify-between sm:justify-end">
                      <div className="text-right font-mono">
                        <div className="text-sm sm:text-base font-black text-white">
                          ${asset.allocatedAmountUsd.toLocaleString()}{' '}
                          <span className="text-xs text-amber-400 font-bold">({asset.allocationPercent}%)</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {isMy ? 'လက်ရှိစျေး:' : 'Price:'} ${asset.currentPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded 10-Point Analysis Grid */}
                  {isExpanded && (
                    <div className="p-5 space-y-5 bg-slate-950/40 animate-in fade-in">
                      {/* Grid of 10 Analysis Points */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        {/* 1. Market Condition */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isMy ? '၁။ လက်ရှိစျေးကွက်အခြေအနေ' : '1. Market Condition'}</span>
                          </span>
                          <p className="text-slate-200 leading-relaxed">{asset.marketConditionSummary}</p>
                        </div>

                        {/* 2. Technical Analysis */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isMy ? '၂။ Technical Analysis' : '2. Technical Analysis'}</span>
                          </span>
                          <div className="space-y-1 text-[11px] text-slate-300">
                            <div>
                              <span className="text-slate-400">HTF Trend:</span>{' '}
                              <strong className="text-white">{asset.technicalAnalysis.htfTrend}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400">Accumulation:</span>{' '}
                              <span className="text-emerald-400 font-mono font-bold">
                                {asset.technicalAnalysis.keyAccumulationRange}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">Target Resistance:</span>{' '}
                              <span className="text-amber-400 font-mono font-bold">
                                {asset.technicalAnalysis.majorResistanceTarget}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Fundamental Analysis */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{isMy ? '၃။ Fundamental Analysis' : '3. Fundamental Analysis'}</span>
                          </span>
                          <div className="space-y-1 text-[11px] text-slate-300">
                            <p><strong className="text-white">Tokenomics:</strong> {asset.fundamentalAnalysis.tokenomics}</p>
                            <p><strong className="text-white">Revenue:</strong> {asset.fundamentalAnalysis.revenueAndFees}</p>
                          </div>
                        </div>

                        {/* 4. Latest News & Catalysts */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{isMy ? '၄။ နောက်ဆုံး သတင်းနှင့် Catalysts' : '4. Latest News & Catalysts'}</span>
                          </span>
                          <p className="text-slate-200 leading-relaxed">{asset.latestNewsAndCatalysts}</p>
                        </div>

                        {/* 5. On-Chain Data */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isMy ? '၅။ On-Chain & Market Data' : '5. On-Chain Metrics'}</span>
                          </span>
                          <div className="space-y-1 text-[11px] text-slate-300">
                            <p><strong className="text-white">Reserves:</strong> {asset.onChainData.exchangeReservesTrend}</p>
                            <p><strong className="text-white">Whales:</strong> {asset.onChainData.whaleAccumulationSignal}</p>
                          </div>
                        </div>

                        {/* 6. Regulation & Macro Factors */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>{isMy ? '၆။ စည်းမျဉ်းနှင့် မေခရို အခြေအနေ' : '6. Regulation & Macro'}</span>
                          </span>
                          <div className="space-y-1 text-[11px] text-slate-300">
                            <p><strong className="text-white">Status:</strong> {asset.regulationAndMacro.regulatoryStatus}</p>
                            <p><strong className="text-white">Macro Fit:</strong> {asset.regulationAndMacro.macroEnvironmentFit}</p>
                          </div>
                        </div>

                        {/* 7. Project Development & Ecosystem */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isMy ? '၇။ Project Development' : '7. Ecosystem & Development'}</span>
                          </span>
                          <p className="text-slate-200 leading-relaxed">{asset.projectDevelopment.ecosystemHealth}</p>
                        </div>

                        {/* 8. Risk Level & Invalidation */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>{isMy ? '၈။ စွန့်စားမှုနှင့် Invalidation Logic' : '8. Risk & Invalidation'}</span>
                          </span>
                          <p className="text-rose-300/90 leading-relaxed">{asset.invalidationRisk}</p>
                        </div>

                        {/* 9. DCA Staging Strategy */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isMy ? '၉။ DCA Staging အကြံပြုချက်' : '9. DCA Staging Strategy'}</span>
                          </span>
                          <p className="text-slate-200 leading-relaxed">{asset.dcaStagingAdvice}</p>
                        </div>
                      </div>

                      {/* 10. Scenario Potential Targets Row */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <PieChart className="w-4 h-4 text-emerald-400" />
                            <span>{isMy ? '၁၀။ မျှော်မှန်း ဖြစ်တန်စွမ်း အကျိုးအမြတ် (Target Return Scenarios)' : '10. Potential Return Scenarios'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Non-guaranteed statistical model
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Conservative */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
                            <div className="text-[10px] text-slate-400 uppercase">Conservative Target:</div>
                            <div className="text-base font-black text-emerald-400 mt-1">
                              +
                              {asset.scenarios.conservative.expectedReturnPercent}% ($
                              {asset.scenarios.conservative.targetPriceEstimate.toLocaleString()})
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Est: ${asset.scenarios.conservative.estimatedValueUsd} | {asset.scenarios.conservative.probabilityPercent}% Prob
                            </div>
                          </div>

                          {/* Moderate */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
                            <div className="text-[10px] text-slate-400 uppercase">Moderate Target (Base):</div>
                            <div className="text-base font-black text-amber-400 mt-1">
                              +
                              {asset.scenarios.moderate.expectedReturnPercent}% ($
                              {asset.scenarios.moderate.targetPriceEstimate.toLocaleString()})
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Est: ${asset.scenarios.moderate.estimatedValueUsd} | {asset.scenarios.moderate.probabilityPercent}% Prob
                            </div>
                          </div>

                          {/* Bullish */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
                            <div className="text-[10px] text-slate-400 uppercase">Bullish Expansion:</div>
                            <div className="text-base font-black text-indigo-400 mt-1">
                              +
                              {asset.scenarios.bullish.expectedReturnPercent}% ($
                              {asset.scenarios.bullish.targetPriceEstimate.toLocaleString()})
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Est: ${asset.scenarios.bullish.estimatedValueUsd} | {asset.scenarios.bullish.probabilityPercent}% Prob
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick simulation button */}
                      {onNavigateToDemo && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => onNavigateToDemo(asset.symbol, 'LONG')}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{isMy ? `${asset.symbol} Demo Trade တွင် စမ်းသပ်မည်` : `Simulate ${asset.symbol} in Demo`}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
