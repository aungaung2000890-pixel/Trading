import React from 'react';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface TraderSkillLevelsProps {
  completedLessonCount: number;
  totalLessonCount: number;
  lang: 'my' | 'en';
  onNavigateToSection?: (sectionId: number) => void;
}

interface SkillLevel {
  level: number;
  badge: string;
  nameEn: string;
  nameMy: string;
  taglineEn: string;
  taglineMy: string;
  minLessons: number;
  color: string;
  bgLight: string;
  criteriaEn: string[];
  criteriaMy: string[];
}

const SKILL_LEVELS: SkillLevel[] = [
  {
    level: 1,
    badge: '🟢',
    nameEn: 'Level 1: Crypto Beginner',
    nameMy: 'အဆင့် ၁: Crypto အခြေခံ စတင်လေ့လာသူ',
    taglineEn: 'Master fundamentals, blockchain concepts, and avoid rookie scams.',
    taglineMy: 'Blockchain သဘောတရားနှင့် အခြေခံများကို နားလည်ပြီး လိမ်လည်မှုများမှ ကာကွယ်နိုင်ခြင်း။',
    minLessons: 5,
    color: 'text-emerald-400 border-emerald-500/40',
    bgLight: 'bg-emerald-950/20',
    criteriaEn: [
      'Complete Section 1 (Fundamentals) lessons',
      'Pass the Spot the Scam quiz with >= 80% score',
      'Understand seed phrase security & private keys',
    ],
    criteriaMy: [
      'အခန်း (၁) Crypto အခြေခံ သင်ခန်းစာများကို လေ့လာပြီးခြင်း',
      'လိမ်လည်မှု စစ်ဆေးရေး ဉာဏ်စမ်းတွင် ၈၀% အထက် ရရှိခြင်း',
      'Seed phrase လျှို့ဝှက်ချက် လုံခြုံရေးကို ကောင်းစွာ သဘောပေါက်ခြင်း',
    ],
  },
  {
    level: 2,
    badge: '🔵',
    nameEn: 'Level 2: Market Basics',
    nameMy: 'အဆင့် ၂: စျေးကွက်အခြေခံ နားလည်သူ',
    taglineEn: 'Understand order books, market vs limit orders, spread, and liquidity.',
    taglineMy: 'Order book၊ Limit အော်ဒါ၊ Spread နှင့် စျေးကွက်အရည်အသွေးကို နားလည်ခြင်း။',
    minLessons: 9,
    color: 'text-blue-400 border-blue-500/40',
    bgLight: 'bg-blue-950/20',
    criteriaEn: [
      'Complete Section 3 (How Markets Work)',
      'Explain bid-ask spread and slippage',
      'Understand spot vs perpetual futures mechanics',
    ],
    criteriaMy: [
      'အခန်း (၃) စျေးကွက်လည်ပတ်ပုံ သင်ခန်းစာများကို ပြီးဆုံးခြင်း',
      'Bid-Ask Spread နှင့် Slippage ကို ရှင်းပြနိုင်ခြင်း',
      'Spot နှင့် Futures ကွာခြားချက်ကို သိရှိခြင်း',
    ],
  },
  {
    level: 3,
    badge: '🟡',
    nameEn: 'Level 3: Chart Reader',
    nameMy: 'အဆင့် ၃: Chart ဖတ်ရှုနိုင်သူ',
    taglineEn: 'Read candlesticks, trends (HH/HL), support & resistance zones.',
    taglineMy: 'Candlestick ဖယောင်းတိုင်များ၊ Trend အတက်/အကျနှင့် S/R ဇုန်များကို ဖတ်ရှုနိုင်ခြင်း။',
    minLessons: 13,
    color: 'text-amber-400 border-amber-500/40',
    bgLight: 'bg-amber-950/20',
    criteriaEn: [
      'Complete Section 4 (Technical Analysis)',
      'Identify breakout and retest sequences on charts',
      'Distinguish between trending and consolidating markets',
    ],
    criteriaMy: [
      'အခန်း (၄) နည်းပညာပိုင်းဆိုင်ရာ စိစစ်မှု သင်ခန်းစာများ ပြီးဆုံးခြင်း',
      'Breakout နှင့် Retest စနစ်ကို Chart ပေါ်တွင် ဖော်ထုတ်နိုင်ခြင်း',
      'Trend စျေးကွက်နှင့် ဘေးတိုက်ငြိမ်သက်စျေးကွက်ကို ခွဲခြားနိုင်ခြင်း',
    ],
  },
  {
    level: 4,
    badge: '🟠',
    nameEn: 'Level 4: Technical Trader',
    nameMy: 'အဆင့် ၄: နည်းပညာ ကုန်သွယ်သူ',
    taglineEn: 'Utilize indicators (EMA, RSI Divergence, Volume) and multi-timeframe alignment.',
    taglineMy: 'EMA၊ RSI Divergence၊ Volume နှင့် Multi-timeframe ချိတ်ဆက်မှုကို အသုံးပြုနိုင်ခြင်း။',
    minLessons: 17,
    color: 'text-orange-400 border-orange-500/40',
    bgLight: 'bg-orange-950/20',
    criteriaEn: [
      'Complete Section 5 (Indicators) and Section 6 (Advanced TA)',
      'Spot regular Bullish & Bearish RSI Divergence',
      'Align Daily, 4-Hour, and 15-Minute chart timeframes',
    ],
    criteriaMy: [
      'အခန်း (၅) နှင့် (၆) အဆင့်မြင့် နည်းပညာသင်ခန်းစာများ ပြီးဆုံးခြင်း',
      'RSI Divergence ကွဲလွဲချက်ကို စနစ်တကျ ရှာဖွေနိုင်ခြင်း',
      'Daily, 4H, 15m Timeframe သုံးခုကို သဟဇာတဖြစ်အောင် ပေါင်းစပ်နိုင်ခြင်း',
    ],
  },
  {
    level: 5,
    badge: '🔴',
    nameEn: 'Level 5: Risk-Controlled Trader',
    nameMy: 'အဆင့် ၅: အန္တရာယ် ထိန်းချုပ်နိုင်သူ',
    taglineEn: 'Absolute mastery over capital preservation and the 1-2% risk rule.',
    taglineMy: 'အရင်းအနှီး မပြုန်းတီးရေးနှင့် ၁% မှ ၂% အန္တရာယ်ကန့်သတ်မှုကို တင်းကျပ်စွာ လိုက်နာနိုင်ခြင်း။',
    minLessons: 20,
    color: 'text-rose-400 border-rose-500/40',
    bgLight: 'bg-rose-950/20',
    criteriaEn: [
      'Complete Section 7 & 8 (Trading Styles & Risk Management)',
      'Use the Risk Calculator to determine exact position size',
      'Never allow liquidation price closer than stop-loss distance',
    ],
    criteriaMy: [
      'အခန်း (၇) နှင့် (၈) စတိုင်လ်နှင့် အန္တရာယ်ထိန်းချုပ်မှု ပြီးဆုံးခြင်း',
      'Risk Calculator ဖြင့် Position Size ကို သင်္ချာနည်းအရ တွက်ချက်ခြင်း',
      'Stop Loss ထက် Liquidation စောထိစေသော Leverage သုံးစွဲမှုကို လုံးဝရှောင်ကြဉ်ခြင်း',
    ],
  },
  {
    level: 6,
    badge: '🟣',
    nameEn: 'Level 6: Strategy Builder',
    nameMy: 'အဆင့် ၆: မဟာဗျူဟာ ရေးဆွဲနိုင်သူ',
    taglineEn: 'Has a personalized, written 10-step trading strategy playbook.',
    taglineMy: 'မိမိကိုယ်ပိုင် စည်းမျဉ်း ၁၀ ချက်ပါ ကုန်သွယ်မှု မဟာဗျူဟာကို ရေးဆွဲအတည်ပြုပြီးဖြစ်ခြင်း။',
    minLessons: 23,
    color: 'text-purple-400 border-purple-500/40',
    bgLight: 'bg-purple-950/20',
    criteriaEn: [
      'Complete Section 10 (Strategy Building)',
      'Build and save a custom 10-step trading strategy',
      'Enforce minimum 1:2.0 Risk-to-Reward ratio requirements',
    ],
    criteriaMy: [
      'အခန်း (၁၀) Strategy Building သင်ခန်းစာများကို ပြီးဆုံးခြင်း',
      'ကိုယ်ပိုင် စည်းကမ်းချက် ၁၀ ချက်ကို ရေးဆွဲသိမ်းဆည်းထားခြင်း',
      'အနည်းဆုံး ၁:၂.၀ R:R မပြည့်မီပါက စျေးကွက်မဝင်သော စည်းကမ်းရှိခြင်း',
    ],
  },
  {
    level: 7,
    badge: '⚫',
    nameEn: 'Level 7: Advanced Trader',
    nameMy: 'အဆင့် ၇: အဆင့်မြင့် ကုန်သွယ်သူ',
    taglineEn: 'Synthesize on-chain tokenomics, macro economic cycles, and paper execution.',
    taglineMy: 'On-chain ဒေတာ၊ ကမ္ဘာ့စီးပွားရေး Macro Cycle များနှင့် စမ်းသပ်စနစ်တွင် ကျွမ်းကျင်စွာ ဆောင်ရွက်နိုင်ခြင်း။',
    minLessons: 26,
    color: 'text-slate-300 border-slate-600',
    bgLight: 'bg-slate-900',
    criteriaEn: [
      'Complete Section 9 (Fundamental & On-Chain) and Section 10 (Macro)',
      'Complete at least 15 simulated trades in Paper Trading',
      'Pass the 11-point Live Trading Readiness checklist',
    ],
    criteriaMy: [
      'အခန်း (၉) နှင့် (၁၀) On-chain နှင့် Macro သင်ခန်းစာများ ပြီးဆုံးခြင်း',
      'စမ်းသပ်စနစ်တွင် အနည်းဆုံး ၁၅ ကြိမ် ကုန်သွယ်လေ့ကျင့်ပြီးခြင်း',
      'Live Trading ၁၁ ချက် စစ်ဆေးရေးတွင် အောင်မြင်ခြင်း',
    ],
  },
  {
    level: 8,
    badge: '🏆',
    nameEn: 'Level 8: Consistent Trader',
    nameMy: 'အဆင့် ၈: စည်းကမ်းပြည့်ဝသော ရေရှည်ကုန်သွယ်သူ',
    taglineEn: 'Positive expectancy, rigorous risk control, and flawless execution discipline.',
    taglineMy: 'အမြတ်အရှုံး ရလဒ်ကောင်းမွန်ပြီး စည်းကမ်းချက်များကို တသွေမတိမ်း လိုက်နာနိုင်သူ။',
    minLessons: 28,
    color: 'text-amber-400 border-amber-500/50 shadow-amber-500/10',
    bgLight: 'bg-amber-950/30',
    criteriaEn: [
      'Complete all curriculum lessons across all 14 sections',
      'Achieve positive mathematical expectancy in Paper Trading simulator',
      'Maintain continuous monthly self-review and journaling discipline',
    ],
    criteriaMy: [
      'အခန်း ၁၄ ခန်းလုံးရှိ သင်ခန်းစာအားလုံးကို လေ့လာပြီးမြောက်ခြင်း',
      'စမ်းသပ်စနစ်တွင် အပေါင်းလက္ခဏာဆောင်သော Expectancy ရရှိခြင်း',
      'လစဉ် ကိုယ်တိုင်သုံးသပ်ချက် ဂျာနယ်ကို စဉ်ဆက်မပြတ် မှတ်တမ်းတင်ခြင်း',
    ],
  },
];

export const TraderSkillLevels: React.FC<TraderSkillLevelsProps> = ({
  completedLessonCount,
  totalLessonCount,
  lang,
}) => {
  // Determine current active level
  const currentLevel = (() => {
    for (let i = SKILL_LEVELS.length - 1; i >= 0; i--) {
      if (completedLessonCount >= SKILL_LEVELS[i].minLessons) {
        return SKILL_LEVELS[i];
      }
    }
    return SKILL_LEVELS[0];
  })();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/20 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              {lang === 'my' ? 'Trader ကျွမ်းကျင်မှု အဆင့်သတ်မှတ်ချက်များ (Level 1 မှ 8)' : 'Trader Skill Levels Progression (Level 1 to 8)'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            {lang === 'my'
              ? 'သင်ခန်းစာပြီးမြောက်မှုနှင့် စည်းကမ်းလိုက်နာမှုအပေါ် အခြေခံ၍ အဆင့် ၈ ဆင့် ခွဲခြားထားသည်။ ဖြတ်လမ်းမရှိဘဲ စနစ်တကျ တက်လှမ်းပါ။'
              : 'Trading is a craft with measurable milestones. Progress through all 8 levels through lessons, simulations, and disciplined risk management.'}
          </p>
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            {lang === 'my' ? 'လက်ရှိ သင်၏အဆင့်' : 'Your Current Level'}
          </span>
          <span className="text-sm font-bold text-amber-400 flex items-center justify-end gap-1.5 mt-0.5">
            <span>{currentLevel.badge}</span>
            <span>{lang === 'my' ? currentLevel.nameMy : currentLevel.nameEn}</span>
          </span>
        </div>
      </div>

      {/* The 8 Levels Ladder */}
      <div className="space-y-3">
        {SKILL_LEVELS.map((lvl) => {
          const isUnlocked = completedLessonCount >= lvl.minLessons;
          const isCurrent = currentLevel.level === lvl.level;

          return (
            <div
              key={lvl.level}
              className={`p-4 rounded-2xl border transition ${lvl.bgLight} ${
                isCurrent
                  ? 'border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                  : isUnlocked
                  ? 'border-slate-800'
                  : 'border-slate-800/60 opacity-70'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{lvl.badge}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">
                        {lang === 'my' ? lvl.nameMy : lvl.nameEn}
                      </h3>
                      {isCurrent && (
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                          CURRENT LEVEL
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'my' ? lvl.taglineMy : lvl.taglineEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isUnlocked ? 'UNLOCKED ✅' : `Requires ${lvl.minLessons} Lessons`}
                  </span>
                </div>
              </div>

              {/* Criteria list */}
              <div className="pt-2 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
                {(lang === 'my' ? lvl.criteriaMy : lvl.criteriaEn).map((crit, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isUnlocked ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <span>{crit}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
