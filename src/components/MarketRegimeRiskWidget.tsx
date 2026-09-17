import React, { useState, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Gauge,
  Landmark,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Info,
  Globe,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { LiveTickerItem } from '../types';

interface MarketRegimeRiskWidgetProps {
  lang: 'my' | 'en';
  liveTickers?: LiveTickerItem[];
  onNavigateToCalculator?: () => void;
}

export const MarketRegimeRiskWidget: React.FC<MarketRegimeRiskWidgetProps> = ({
  lang,
  liveTickers = [],
  onNavigateToCalculator,
}) => {
  const isMy = lang === 'my';
  const [activeTab, setActiveTab] = useState<'overview' | 'rates' | 'volatility' | 'rules'>('overview');

  // Dynamically derive proxy metrics from live market tickers
  const marketMetrics = useMemo(() => {
    if (!liveTickers || liveTickers.length === 0) {
      return {
        avgChange: 3.4,
        avgVolatility: 5.8,
        positiveRatio: 0.65,
        avgFunding: 0.0095,
        extremeMoversCount: 3,
      };
    }

    const totalChange = liveTickers.reduce((acc, t) => acc + Math.abs(t.change24h), 0);
    const avgChange = totalChange / liveTickers.length;

    const positiveCount = liveTickers.filter((t) => t.change24h > 0).length;
    const positiveRatio = positiveCount / liveTickers.length;

    const totalFunding = liveTickers.reduce((acc, t) => acc + (t.fundingRate || 0.01), 0);
    const avgFunding = totalFunding / liveTickers.length;

    // Intraday high-low range average
    const totalRanges = liveTickers.reduce((acc, t) => {
      if (t.low24h > 0) {
        return acc + ((t.high24h - t.low24h) / t.low24h) * 100;
      }
      return acc + Math.abs(t.change24h) * 1.4;
    }, 0);
    const avgVolatility = Number((totalRanges / liveTickers.length).toFixed(2));

    const extremeMoversCount = liveTickers.filter((t) => Math.abs(t.change24h) >= 8).length;

    return {
      avgChange: Number(avgChange.toFixed(2)),
      avgVolatility,
      positiveRatio: Number(positiveRatio.toFixed(2)),
      avgFunding: Number(avgFunding.toFixed(4)),
      extremeMoversCount,
    };
  }, [liveTickers]);

  // Derived Volatility Regime Score (0 to 100)
  const volScore = useMemo(() => {
    // 3% range -> ~40, 6% range -> ~65, 10%+ -> ~90
    return Math.min(98, Math.max(25, Math.round(marketMetrics.avgVolatility * 11)));
  }, [marketMetrics.avgVolatility]);

  const volRegime = useMemo(() => {
    if (volScore >= 75) {
      return {
        label: isMy ? 'မြင့်မားသော လှုပ်ခတ်မှု (High Volatility Expansion)' : 'High Volatility Expansion',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        badge: 'HIGH EXPANSION',
        desc: isMy
          ? 'စျေးနှုန်းများ အပြောင်းအလဲမြန်ဆန်နေသည်။ Breakout ပုံစံများနှင့် Stop Loss အကွာအဝေးကို ချဲ့ထွင်ထားရန် လိုအပ်သည်။'
          : 'Rapid price moves and widening ATR ranges. Expect sharp continuation and enforce conservative leverage.',
        leverageAdvice: '5x - 10x Max',
      };
    }
    if (volScore <= 45) {
      return {
        label: isMy ? 'ကျဉ်းမြောင်းသော လှုပ်ခတ်မှု (Low Vol Squeeze)' : 'Low Volatility Consolidation',
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        badge: 'COMPRESSION SQUEEZE',
        desc: isMy
          ? 'စျေးနှုန်းများ ဘောင်အတွင်း ငြိမ်သက်နေသည်။ မကြာမီ လားရာတစ်ခုသို့ ပြင်းထန်စွာ ထွက်ခွာမည့် Squeeze အခြေအနေဖြစ်သည်။'
          : 'Range-bound compression. Volatility squeeze typically precedes violent directional breakout.',
        leverageAdvice: '10x - 15x Strict SL',
      };
    }
    return {
      label: isMy ? 'ပုံမှန် ရွေ့လျားမှု (Dynamic Trading Range)' : 'Dynamic Normal Range',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      badge: 'NORMAL DYNAMIC',
      desc: isMy
        ? 'နည်းပညာ Support နှင့် Resistance များ စနစ်တကျ အလုပ်လုပ်သော ပုံမှန်စျေးကွက် လှိုင်းစီးဆင်းမှုဖြစ်သည်။'
        : 'Healthy trending swings with dependable structure retests and moderate liquidity turnover.',
      leverageAdvice: '10x - 20x Standard',
    };
  }, [volScore, isMy]);

  // Derived Global Risk-On / Risk-Off Score (0: Extreme Risk-Off, 100: Extreme Risk-On)
  const riskSentimentScore = useMemo(() => {
    let score = 50;
    // Positive market breadth adds up to +25
    score += (marketMetrics.positiveRatio - 0.5) * 50;
    // Funding rate adds up to +15
    if (marketMetrics.avgFunding > 0.005) score += 10;
    if (marketMetrics.avgFunding > 0.015) score += 8;
    // Volatility bonus
    if (marketMetrics.avgVolatility > 4 && marketMetrics.avgVolatility < 9) score += 5;
    return Math.min(95, Math.max(15, Math.round(score)));
  }, [marketMetrics]);

  const riskRegime = useMemo(() => {
    if (riskSentimentScore >= 65) {
      return {
        title: isMy ? 'Risk-On (ရင်းနှီးမြှုပ်နှံလိုစိတ် မြင့်မား)' : 'Risk-On Expansion Regime',
        tag: 'BULLISH RISK-ON',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
        dxyStatus: 'DXY 101.2 (Softening)',
        fedBias: isMy ? 'အတိုးနှုန်းလျှော့ချမည့် မျှော်လင့်ချက် (Dovish Pivot)' : 'Rate Cut Bias (Dovish)',
        advice: isMy
          ? 'Crypto နှင့် ရှယ်ယာများသို့ အရင်းအနှီးများ စီးဝင်နေသည်။ Trend Following setups များ အောင်မြင်မှုရာခိုင်နှုန်း ပိုမိုမြင့်မားသည်။'
          : 'Capital inflows favoring high-beta assets. Momentum and trend continuation setups carry higher mathematical edge.',
      };
    }
    if (riskSentimentScore <= 40) {
      return {
        title: isMy ? 'Risk-Off (ဘေးကင်းမှုရှာဖွေသော အခြေအနေ)' : 'Risk-Off Defensive Regime',
        tag: 'DEFENSIVE RISK-OFF',
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
        dxyStatus: 'DXY 104.8 (Strengthening)',
        fedBias: isMy ? 'တင်းကျပ်သော ငွေကြေးမူဝါဒ (Hawkish Caution)' : 'Higher for Longer (Hawkish)',
        advice: isMy
          ? 'ဒေါ်လာနှင့် US Treasury သို့ ငွေကြေးခိုလှုံနေသည်။ အန္တရာယ်ကြီးသော Altcoins များကို လျှော့ချပြီး အရင်းအနှီး ကာကွယ်သင့်သည်။'
          : 'Safe haven flight into USD and Treasuries. Tighter stop losses and selective short/hedging strategies recommended.',
      };
    }
    return {
      title: isMy ? 'Neutral / Selective (ရွေးချယ်သတိထား ကုန်သွယ်ရမည့် အခြေအနေ)' : 'Neutral / Selective Flow Regime',
      tag: 'SELECTIVE ACCUMULATION',
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
      dxyStatus: 'DXY 102.5 (Range-bound)',
      fedBias: isMy ? 'အတိုးနှုန်း ထိန်းသိမ်းထားမှု (Terminal Plateau)' : 'Policy Neutral Plateau',
      advice: isMy
        ? 'စျေးကွက်တစ်ခုလုံး အတူတကွ မတက်ဘဲ Volume နှင့် Catalyst ရှိသော သီးသန့် Coin များသာ ရွေ့လျားမည်။'
        : 'Asset divergence. Only trade high relative volume coins with clear technical catalyst and catalyst invalidations.',
    };
  }, [riskSentimentScore, isMy]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                {isMy ? 'စျေးကွက် စက်ဝန်းနှင့် ကမ္ဘာ့အန္တရာယ် ညွှန်းကိန်း' : 'Market Regime & Global Risk Engine'}
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                REAL-TIME PROXY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isMy
                ? 'စျေးကွက်လှုပ်ခတ်မှု (Volatility)၊ ဗဟိုဘဏ်အတိုးနှုန်းစက်ဝန်းနှင့် ကမ္ဘာ့ Risk-On/Risk-Off အခြေအနေ ခွဲခြမ်းစိတ်ဖြာချက်'
                : 'Current Volatility Regime, Central Bank Rate Cycle & Global Macro Risk Appetite'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start lg:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isMy ? 'အနှစ်ချုပ်' : 'Regime Overview'}
          </button>
          <button
            onClick={() => setActiveTab('volatility')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'volatility'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isMy ? 'လှုပ်ခတ်မှု (Volatility)' : 'Volatility Meter'}
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'rates'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isMy ? 'အတိုးနှုန်း စက်ဝန်း' : 'Interest Rate Cycle'}
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isMy ? 'ကုန်သွယ်ရေး စည်းမျဉ်းများ' : 'Execution Rules'}
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="pt-5 space-y-5 relative z-10">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Primary 3-Metric Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Volatility Regime Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    {isMy ? 'စျေးကွက် လှုပ်ခတ်မှု' : 'Volatility Regime'}
                  </span>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${volRegime.color}`}>
                    {volRegime.badge}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xl font-black font-mono text-white">
                      {volScore}
                      <span className="text-xs text-slate-400 font-normal"> / 100</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Avg 24h ATR: {marketMetrics.avgVolatility}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        volScore > 70
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                      }`}
                      style={{ width: `${volScore}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>{isMy ? 'အကြံပြု Leverage:' : 'Safe Leverage:'}</span>
                    <span className="font-bold text-emerald-400 font-mono">{volRegime.leverageAdvice}</span>
                  </div>
                </div>
              </div>

              {/* 2. Global Rate Cycle Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                    {isMy ? 'ဗဟိုဘဏ် အတိုးနှုန်းစက်ဝန်း' : 'Interest Rate Cycle'}
                  </span>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    LATE CYCLE / EASING
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-black font-mono text-white">
                      US Fed: 5.25 - 5.50%
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      84% Cut Probability
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {isMy
                      ? 'အတိုးနှုန်း အမြင့်ဆုံးအဆင့်ရောက်ပြီးနောက် စတင်လျှော့ချမည့် လက္ခဏာ (Dovish Pivot) ပြသနေသည်။'
                      : 'Terminal plateau transition into rate cuts. High liquidity injection historically fuels risk asset rallies.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>10Y US Yield Proxy:</span>
                  <span className="font-bold text-indigo-300 font-mono">4.18% (Softening)</span>
                </div>
              </div>

              {/* 3. Global Risk-On / Risk-Off Sentiment Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    {isMy ? 'ကမ္ဘာ့ Risk စိတ်ဆန္ဒ' : 'Global Risk Appetite'}
                  </span>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${riskRegime.color}`}>
                    {riskRegime.tag}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xl font-black font-mono text-white">
                      {riskSentimentScore}
                      <span className="text-xs text-slate-400 font-normal"> / 100</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {riskRegime.dxyStatus}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        riskSentimentScore >= 60
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : riskSentimentScore <= 40
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                      }`}
                      style={{ width: `${riskSentimentScore}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{isMy ? 'စျေးကွက် လားရာအားသာချက်:' : 'Market Direction Bias:'}</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {marketMetrics.positiveRatio * 100}% Longs
                  </span>
                </div>
              </div>
            </div>

            {/* Strategic Regime Guidance Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    {isMy ? 'လက်ရှိ Regime အတွက် ကုန်သွယ်ရေး အကြံပြုချက်:' : 'Strategic Playbook for Current Regime:'}
                  </span>
                  <span className="text-xs font-bold text-white">{riskRegime.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {riskRegime.advice} {volRegime.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onNavigateToCalculator && (
                  <button
                    onClick={onNavigateToCalculator}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <span>{isMy ? 'Risk စစ်ဆေးမည်' : 'Check Risk'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VOLATILITY TAB */}
        {activeTab === 'volatility' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>{isMy ? 'စျေးကွက် လှုပ်ခတ်မှု အတိုင်းအတာများ (Volatility Metrics)' : 'Volatility Breakdown & Statistics'}</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-900 text-slate-300">
                    <span>Average 24h Absolute Change:</span>
                    <span className="font-mono font-bold text-white">{marketMetrics.avgChange}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900 text-slate-300">
                    <span>Average 24h High/Low Spread (ATR Proxy):</span>
                    <span className="font-mono font-bold text-amber-400">{marketMetrics.avgVolatility}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900 text-slate-300">
                    <span>High Velocity Movers (±8% or greater):</span>
                    <span className="font-mono font-bold text-white">{marketMetrics.extremeMoversCount} coins</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900 text-slate-300">
                    <span>Average Futures Funding Rate (8h):</span>
                    <span className="font-mono font-bold text-emerald-400">{marketMetrics.avgFunding}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>{isMy ? 'ဆူညံသံဒဏ်ခံနိုင်သော Leverage သတ်မှတ်ချက်' : 'Noise-Immune Leverage Sizing'}</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {isMy
                    ? 'လက်ရှိ ပျမ်းမျှ ATR သည် ' + marketMetrics.avgVolatility + '% ဖြစ်သောကြောင့် Leverage 20x အထက် အသုံးပြုပါက သာမန် လှိုင်းအပြောင်းအလဲတွင်ပင် အလိုအလျောက် Stop Loss ထိသွားနိုင်ပါသည်။ အကြံပြုထားသော ' + volRegime.leverageAdvice + ' ဖြင့်သာ ကုန်သွယ်ပါ။'
                    : 'With average intraday coin noise at ' + marketMetrics.avgVolatility + '%, leverage above 20x risks premature wick stopouts before targets are reached. Maintain ' + volRegime.leverageAdvice + ' with stops placed outside key swing structural bounds.'}
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <strong>Golden Rule:</strong> Stop loss distance must dictate leverage, not the desired profit.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTEREST RATES TAB */}
        {activeTab === 'rates' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">🇺🇸 US FEDERAL RESERVE</span>
                <span className="text-base font-black font-mono text-white block">5.25% - 5.50%</span>
                <span className="text-[11px] font-bold text-emerald-400 mt-1 block">Pivot: 25-50bps Cuts Expected</span>
                <span className="text-[10px] text-slate-500 mt-1 block">CPI: 2.9% YoY (Disinflation)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">🇪🇺 EUROPEAN CENTRAL BANK</span>
                <span className="text-base font-black font-mono text-white block">3.75%</span>
                <span className="text-[11px] font-bold text-blue-400 mt-1 block">Cycle: Active Easing Cycle</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Growth Slowdown Supportive</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">🇯🇵 BANK OF JAPAN (BOJ)</span>
                <span className="text-base font-black font-mono text-white block">0.25%</span>
                <span className="text-[11px] font-bold text-amber-400 mt-1 block">Cycle: Rate Normalization</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Yen Carry Trade Risk Watch</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">🇨🇳 PEOPLE'S BANK OF CHINA</span>
                <span className="text-base font-black font-mono text-white block">3.35% LPR</span>
                <span className="text-[11px] font-bold text-emerald-400 mt-1 block">Cycle: Stimulus Injections</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Liquidity Expanding</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
              <strong className="text-white block mb-1">{isMy ? 'အဓိက သဘောတရား:' : 'Macro Transmission Mechanism:'}</strong>
              {isMy
                ? 'အတိုးနှုန်းများ ကျဆင်းလာသောအခါ ဒေါ်လာချေးငှားစရိတ် သက်သာလာပြီး ကမ္ဘာ့ရင်းနှီးမြှုပ်နှံသူများသည် Crypto၊ စတော့ရှယ်ယာနှင့် မြင့်မားသောအမြတ်ရနိုင်သော စျေးကွက်များသို့ ငွေကြေးများ စီးဝင်စေလေ့ရှိသည်။'
                : 'When major central banks transition from rate hiking to rate cuts, risk-free cash yields compress. Institutional capital redeploys out of money-market funds into high-asymmetry assets like Bitcoin, Ethereum, and crypto liquid contracts.'}
            </div>
          </div>
        )}

        {/* EXECUTION RULES TAB */}
        {activeTab === 'rules' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isMy ? 'Risk-On စျေးကွက်တွင် လုပ်ဆောင်ရမည့် စည်းမျဉ်းများ' : 'High Probability Behaviors'}</span>
                </h5>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>Trade with the dominant 4H trend; let winning trades run to 2R and 3R targets.</li>
                  <li>Focus on high-volume leaders (#1 SOL, top gainers) rather than laggards.</li>
                  <li>Scale in only after structural break and successful retest (BOS confirmation).</li>
                  <li>Take partial profits at key resistance levels; trail stop to break-even.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h5 className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isMy ? 'ရှောင်ကြဉ်ရမည့် အန္တရာယ်ရှိ အပြုအမူများ' : 'Disaster Prevention Rules'}</span>
                </h5>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>Never average down on a losing position during volatile expansion moves.</li>
                  <li>Do not initiate market orders immediately during high-impact FOMC or CPI releases.</li>
                  <li>Cap account risk to 1.5% - 2.0% per setup regardless of confidence.</li>
                  <li>Avoid counter-trend bottom fishing on coins under heavy short liquidation.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
