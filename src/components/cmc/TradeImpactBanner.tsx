import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import { TradeImpactGuide } from '../../data/cmcData';

interface TradeImpactBannerProps {
  guide?: TradeImpactGuide;
  lang: 'my' | 'en';
  onTradeInDemo?: (symbol?: string) => void;
  onOpenCalculator?: (symbol?: string) => void;
  contextTitle?: string;
}

const DEFAULT_TRADE_IMPACT_GUIDE: TradeImpactGuide = {
  bias: 'RANGE_ACCUMULATION',
  headlineEn: 'Market Metrics Analysis & Trade Directional Alignment',
  headlineMy: 'စျေးကွက်အညွှန်းကိန်း သုံးသပ်ချက်နှင့် ကုန်သွယ်မှု လမ်းညွှန်ချက်',
  impactEn: 'Macro dynamics, liquidity clusters, and institutional indicators are actively monitored. Maintain strict risk parameters.',
  impactMy: 'မက်ခရိုအခြေအနေ၊ ငွေဖြစ်လွယ်မှု အစုအဝေးများနှင့် အဖွဲ့အစည်းအညွှန်းကိန်းများကို စောင့်ကြည့်နေပါသည်။ အရင်းအနှီးစွန့်စားမှုကို စနစ်တကျ ထိန်းသိမ်းပါ။',
  priorityActionsEn: [
    'Wait for clear confirmation candles on 1H or 4H before executing positions.',
    'Keep leverage disciplined under 10x with a maximum 2% capital drawdown rule.',
    'Align stop losses tightly outside active order block clusters.',
  ],
  priorityActionsMy: [
    '1H သို့မဟုတ် 4H ဖယောင်းတိုင် ပိတ်ပြီး အတည်ပြုချက်ရရှိမှသာ အော်ဒါဖွင့်ပါ။',
    'Leverage ကို 10x အောက်တွင်သာ ကန့်သတ်ထားပြီး အကောင့်ဆုံးရှုံးနိုင်ခြေ ၂% ထက် မကျော်လွန်စေရန် ထိန်းသိမ်းပါ။',
    'Stop Loss များကို Order Block အပြင်ဘက်တွင် စနစ်တကျ သတ်မှတ်ထားပါ။',
  ],
  hazardsToAvoidEn: [
    'Never chase sudden breakout wicks without verifying volume confirmation.',
    'Avoid over-leveraging into high-volatility session boundaries.',
  ],
  hazardsToAvoidMy: [
    'Volume အတည်ပြုချက်မပါဘဲ ရုတ်တရက်ထိုးတက်သော အမြီးတန်းများကို မဆင်မခြင် လိုက်မဝယ်ပါနှင့်။',
    'စျေးလှုပ်ခတ်မှုများသော စက်ရှင်စတင်ချိန်များတွင် Leverage အလွန်အကျွံ အသုံးမပြုပါနှင့်။',
  ],
};

export const TradeImpactBanner: React.FC<TradeImpactBannerProps> = ({
  guide,
  lang,
  onTradeInDemo,
  onOpenCalculator,
  contextTitle,
}) => {
  const isMy = lang === 'my';
  const safeGuide = guide || DEFAULT_TRADE_IMPACT_GUIDE;

  const getBiasBadge = () => {
    switch (safeGuide.bias) {
      case 'BULLISH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            {isMy ? 'အတက်ဘက် သုံးသပ်ချက် (BULLISH)' : 'BULLISH BIAS'}
          </span>
        );
      case 'BEARISH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <TrendingDown className="w-3.5 h-3.5" />
            {isMy ? 'အကျဘက် သတိထား (BEARISH)' : 'BEARISH BIAS'}
          </span>
        );
      case 'SHORT_SQUEEZE_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            {isMy ? 'SHORT SQUEEZE သတိပေးချက်' : 'SHORT SQUEEZE ALERT'}
          </span>
        );
      case 'LONG_CASCADE_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            {isMy ? 'LONG FLUSH သတိပေးချက်' : 'LONG CASCADE RISK'}
          </span>
        );
      case 'HIGH_VOLATILITY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Zap className="w-3.5 h-3.5" />
            {isMy ? 'လှုပ်ခတ်မှု ပြင်းထန် (HIGH VOLATILITY)' : 'HIGH VOLATILITY EXPANSION'}
          </span>
        );
      case 'RANGE_ACCUMULATION':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Compass className="w-3.5 h-3.5" />
            {isMy ? 'ဘေးတိုက် အားစုဆောင်း (RANGE / ACCUMULATION)' : 'RANGE ACCUMULATION'}
          </span>
        );
    }
  };

  const priorityActions =
    (isMy ? safeGuide.priorityActionsMy : safeGuide.priorityActionsEn) ||
    safeGuide.priorityActionsEn ||
    DEFAULT_TRADE_IMPACT_GUIDE.priorityActionsEn;
  const hazards =
    (isMy ? safeGuide.hazardsToAvoidMy : safeGuide.hazardsToAvoidEn) ||
    safeGuide.hazardsToAvoidEn ||
    DEFAULT_TRADE_IMPACT_GUIDE.hazardsToAvoidEn;

  return (
    <div className="w-full my-4 rounded-2xl bg-gradient-to-b from-[#181d2a] to-[#121620] border border-blue-500/30 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-blue-950/40 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
                {isMy ? 'ကျွမ်းကျင် ကုန်သွယ်မှု သုံးသပ်ချက်နှင့် လမ်းညွှန်ချက်' : 'Expert Trade Impact & Execution Playbook'}
              </span>
              {contextTitle && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {contextTitle}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {isMy
                ? 'CoinMarketCap ဒေတာ၊ စျေးကွက်လှုပ်ရှားမှုနှင့် သတင်းများ ချိတ်ဆက်သုံးသပ်ချက်'
                : 'Synthesizing CMC metrics, macro news flow, and derivative positioning'}
            </p>
          </div>
        </div>
        <div className="shrink-0">{getBiasBadge()}</div>
      </div>

      {/* Main Content Body */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Headline & Impact Description */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-black text-slate-100 leading-snug break-words">
            {(isMy ? safeGuide.headlineMy : safeGuide.headlineEn) || safeGuide.headlineEn || 'Market Analysis'}
          </h4>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
            <strong className="text-blue-400 font-semibold block mb-1">
              {isMy ? '📌 အရောင်းအဝယ်များအပေါ် သက်ရောက်မှု (Trade Impact):' : '📌 Impact on Your Trades:'}
            </strong>
            {(isMy ? safeGuide.impactMy : safeGuide.impactEn) || safeGuide.impactEn || ''}
          </div>
        </div>

        {/* 2-Column Responsive Layout: Priority Actions vs Hazards to Avoid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Column 1: Priority Actions to Take (ဦးစားပေး လုပ်ဆောင်ရန်) */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{isMy ? 'ဦးစားပေး ဆောင်ရွက်ချက်များ (Priority Actions)' : 'Priority Actions to Execute'}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {priorityActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 break-words leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Critical Hazards to Avoid (ရှောင်ကြဉ်ရန် အချက်များ) */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/25 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{isMy ? 'မဖြစ်မနေ ရှောင်ကြဉ်ရမည့် အချက်များ (Hazards to Avoid)' : 'Critical Pitfalls & Hazards to Avoid'}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {hazards.map((hazard, idx) => (
                <li key={idx} className="flex items-start gap-2 break-words leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    ✕
                  </span>
                  <span>{hazard}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Trade Setup Card (If Available) */}
        {safeGuide.recommendedSetup && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isMy ? 'အကြံပြု နည်းဗျူဟာအော်ဒါ:' : 'Recommended Trade Play:'}
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {safeGuide.recommendedSetup.symbol}
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {safeGuide.recommendedSetup.action}
                </span>
              </div>
              <p className="text-xs text-slate-300 break-words font-mono">
                <span className="text-slate-400 font-sans">{isMy ? 'အဝင်အချက်:' : 'Trigger:'}</span>{' '}
                {safeGuide.recommendedSetup.trigger} ·{' '}
                <span className="text-slate-400 font-sans">{isMy ? 'Stop Loss:' : 'Invalidation:'}</span>{' '}
                <span className="text-rose-400">{safeGuide.recommendedSetup.invalidation}</span> ·{' '}
                <span className="text-slate-400 font-sans">{isMy ? 'ပစ်မှတ်:' : 'Target:'}</span>{' '}
                <span className="text-emerald-400">{safeGuide.recommendedSetup.target}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {onTradeInDemo && (
                <button
                  onClick={() => onTradeInDemo(safeGuide.recommendedSetup?.symbol)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{isMy ? 'Demo တွင် စမ်းသပ် ကုန်သွယ်ရန်' : 'Test in Demo'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onOpenCalculator && (
                <button
                  onClick={() => onOpenCalculator(safeGuide.recommendedSetup?.symbol)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <span>{isMy ? 'တွက်ချက်စက်' : 'Calculator'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
