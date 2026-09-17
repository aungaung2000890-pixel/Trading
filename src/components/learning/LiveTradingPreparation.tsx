import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  titleEn: string;
  titleMy: string;
  descEn: string;
  descMy: string;
  adviceEn: string;
  adviceMy: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'check-1',
    titleEn: '1. Understands Spot Market Mechanics',
    titleMy: '၁။ Spot စျေးကွက် သဘောတရားကို အပြည့်အဝ နားလည်ခြင်း',
    descEn: 'Buying the real underlying crypto asset with 100% cash. No borrowed leverage, no debt, and zero liquidation risk.',
    descMy: 'ဒစ်ဂျစ်တယ်ငွေကြေး အစစ်အမှန်ကို မိမိငွေအပြည့်ဖြင့် ဝယ်ယူခြင်းဖြစ်ပြီး Liquidation ပြုတ်ထွက်ဆုံးရှုံးမည့် အန္တရာယ်လုံးဝမရှိပါ။',
    adviceEn: 'If price drops 50%, you still hold your exact coin count until recovery.',
    adviceMy: 'စျေး ၅၀% ကျသွားသော်လည်း ဒင်္ဂါးပမာဏ မလျော့ဘဲ ပြန်တက်လာသည်အထိ ကိုင်ထားနိုင်သည်။',
  },
  {
    id: 'check-2',
    titleEn: '2. Understands Futures Contract Mechanics',
    titleMy: '၂။ Futures ကန်ထရိုက် ကုန်သွယ်မှု သဘောတရားကို နားလည်ခြင်း',
    descEn: 'Trading derivative contracts representing future price speculation. Involves margin collateral, 8-hour funding rates, and mandatory liquidation.',
    descMy: 'ဒင်္ဂါးအစစ်ကို ဝယ်ခြင်းမဟုတ်ဘဲ အနာဂတ်စျေးနှုန်း အတက်/အကျ ကန်ထရိုက်ကို အာမခံငွေ၊ Funding Rate တို့ဖြင့် ကုန်သွယ်ခြင်း။',
    adviceEn: 'Futures is a zero-sum probability arena, not passive long-term holding.',
    adviceMy: 'Futures သည် ရေရှည်စုဆောင်းရန် မဟုတ်ဘဲ နည်းစနစ်ကျကျ စျေးအပြောင်းအလဲကို ရယူရန်ဖြစ်သည်။',
  },
  {
    id: 'check-3',
    titleEn: '3. Truly Understands Leverage Danger',
    titleMy: '၃။ Leverage ၏ အန္တရာယ်ကြီးမားမှုကို အမှန်တကယ် သဘောပေါက်ခြင်း',
    descEn: 'Leverage magnifies losses at the exact same exponential rate as profits. 10x leverage means a 10% adverse move equals 100% total margin loss.',
    descMy: 'Leverage သည် အမြတ်ကိုသာမက အရှုံးကိုပါ ဆတူမြှောက်ပေးသည်။ 10x တွင် စျေး ၁၀% ကျရုံဖြင့် အာမခံငွေ ၁၀၀% အကုန်ပြုတ်ထွက်သည်။',
    adviceEn: 'Never use leverage exceeding 5x-10x as a beginner.',
    adviceMy: 'စတင်လေ့လာသူများအနေဖြင့် 5x-10x ထက် ပိုမိုမသုံးသင့်ပါ။',
  },
  {
    id: 'check-4',
    titleEn: '4. Fully Understands Liquidation & Margin Calls',
    titleMy: '၄။ Liquidation နှင့် Margin ပြုတ်ထွက်ခြင်းကို နားလည်ခြင်း',
    descEn: 'When unrealized losses wipe out your initial maintenance margin, the exchange forcibly closes your position at market and seizes collateral.',
    descMy: 'အရှုံးသည် အာမခံငွေနှင့် ညီမျှသွားချိန်တွင် Exchange က အတင်းအကျပ် အော်ဒါဖျက်သိမ်းကာ ငွေအားလုံး သိမ်းဆည်းလိုက်ခြင်း။',
    adviceEn: 'Always set a Stop Loss so the market never touches your liquidation price.',
    adviceMy: 'Liquidation စျေးသို့ မရောက်မီ အရှုံးသက်သာစေရန် Stop Loss ကို မဖြစ်မနေ သုံးပါ။',
  },
  {
    id: 'check-5',
    titleEn: '5. Can Calculate Position Size Mathematically',
    titleMy: '၅။ Position Size ကို သင်္ချာနည်းအရ တိကျစွာ တွက်ချက်နိုင်ခြင်း',
    descEn: 'Able to determine exact dollar position size by dividing dollar risk by stop-loss distance %, rather than trading arbitrary lump sums.',
    descMy: 'စိတ်ခံစားချက်ဖြင့် ရမ်းဝယ်ခြင်းမဟုတ်ဘဲ အဆုံးခံမည့် ဒေါ်လာကို Stop Loss အကွာအဝေးဖြင့် စနစ်တကျ စား၍ တွက်ချက်နိုင်ခြင်း။',
    adviceEn: 'Use the Learning Risk Calculator before every single entry.',
    adviceMy: 'အော်ဒါမဖွင့်မီ Risk Calculator တွင် အမြဲစစ်ဆေးတွက်ချက်ပါ။',
  },
  {
    id: 'check-6',
    titleEn: '6. Strictly Caps Risk at 1% to 2% Per Trade',
    titleMy: '၆။ ကုန်သွယ်မှုတစ်ခုလျှင် အကောင့်၏ ၁% မှ ၂% ထက် ပိုမစွန့်စားခြင်း',
    descEn: 'Never risking more than 1-2% of total account equity on any individual trade setup.',
    descMy: 'ကုန်သွယ်မှုတစ်ခု ဆုံးရှုံးပါက မိမိအကောင့်၏ ၁% သို့မဟုတ် ၂% သာ အဆုံးခံရန် သံန္နိဋ္ဌာန်ချထားခြင်း။',
    adviceEn: 'Even an unlucky 10-trade losing streak only costs ~10-18% of account, preserving your survival.',
    adviceMy: '၁၀ ကြိမ်ဆက်တိုက် ရှုံးခဲ့လျှင်ပင် အကောင့်၏ ၁၅% ခန့်သာ လျော့ကျသဖြင့် အရင်းအနှီးမပြုန်းတီးပါ။',
  },
  {
    id: 'check-7',
    titleEn: '7. Understands Stop Loss Invalidation Discipline',
    titleMy: '၇။ Stop Loss အရှုံးဖြတ် စည်းကမ်းကို လုံးဝ မရွှေ့မပြောင်းဘဲ လိုက်နာခြင်း',
    descEn: 'Accepts that once a setup invalidates, the loss must be taken immediately. Moving or canceling a stop loss leads to catastrophic ruin.',
    descMy: 'ခန့်မှန်းချက်လွဲပါက ချက်ချင်းလက်ခံကာ အရှုံးဖြတ်ရမည်။ Stop Loss ကို အနောက်သို့ ရွှေ့ခြင်းသည် အကောင့်ပြုတ်ထွက်ခြင်း၏ အဓိကလက်သည်ဖြစ်သည်။',
    adviceEn: 'A stop loss is an insurance policy, not an insult.',
    adviceMy: 'Stop Loss သည် အကောင့်ကြီး တစ်ခုလုံး မပြုတ်ထွက်စေရန် ကာကွယ်ပေးသော အာမခံဖြစ်သည်။',
  },
  {
    id: 'check-8',
    titleEn: '8. Has Completed Minimum 20 Simulated Paper Trades',
    titleMy: '၈။ စမ်းသပ်ကုန်သွယ်စနစ်တွင် အနည်းဆုံး အကြိမ် ၂၀ လေ့ကျင့်ပြီးခြင်း',
    descEn: 'Logged and executed at least 20 trades in paper simulation, recording wins, losses, and psychological mistakes.',
    descMy: 'ငွေအစစ်မထည့်မီ စမ်းသပ်စနစ်တွင် အကြိမ် ၂၀ အော်ဒါဖွင့်/ပိတ် လေ့ကျင့်ပြီး အမှားများကို မှတ်တမ်းတင်ထားပြီးဖြစ်ခြင်း။',
    adviceEn: 'Practice until placing and managing orders feels completely effortless.',
    adviceMy: 'အော်ဒါဖွင့်ခြင်းနှင့် ထိန်းကျောင်းခြင်းကို ကျွမ်းကျင်သည်အထိ လေ့ကျင့်ပါ။',
  },
  {
    id: 'check-9',
    titleEn: '9. Has a Written 10-Step Strategy Playbook',
    titleMy: '၉။ ၁၀ ချက်ပါ စာဖြင့်ရေးသားထားသော မဟာဗျူဟာ ရှိပြီးဖြစ်ခြင်း',
    descEn: 'Every trade taken must fit a pre-defined written checklist (condition, setup, confirmation, trigger, SL, TP, sizing).',
    descMy: 'စျေးကွက်မဝင်မီ စည်းမျဉ်း ၁၀ ချက်နှင့် ကိုက်ညီမှသာ အော်ဒါဖွင့်လှစ်မည့် ရှင်းလင်းသော လမ်းညွှန်ရှိခြင်း။',
    adviceEn: 'If a market setup lacks your written criteria, do not trade it.',
    adviceMy: 'မိမိစည်းကမ်းနှင့် မကိုက်ညီပါက မည်မျှစျေးလှုပ်ရှားနေစေကာမူ လက်ရှောင်ပါ။',
  },
  {
    id: 'check-10',
    titleEn: '10. Fully Accepts that Losses are Inevitable',
    titleMy: '၁၀။ အရှုံးသည် ကုန်သွယ်မှု၏ သဘာဝဖြစ်ကြောင်း စိတ်ရင်းဖြင့် လက်ခံခြင်း',
    descEn: 'No strategy wins 100% of the time. Trading is an odds and expectancy game where losses are simply routine operational expenses.',
    descMy: 'မည်သည့်စနစ်မျှ ၁၀၀% မနိုင်နိုင်ပါ။ အရှုံးသည် စီးပွားရေးလုပ်ငန်းတစ်ခု၏ သာမန်ကုန်ကျစရိတ်သဖွယ် ဖြစ်ကြောင်း သဘောပေါက်ခြင်း။',
    adviceEn: 'Never revenge-trade after a loss. Shut down the computer if frustrated.',
    adviceMy: 'ရှုံးသွားချိန်တွင် ဒေါသထွက်ကာ ချက်ချင်း ပြန်လိုက်လံရယူလိုစိတ် (Revenge trade) ကို ရှောင်ကြဉ်ပါ။',
  },
  {
    id: 'check-11',
    titleEn: '11. Has a Personal Capital & Risk Shutdown Plan',
    titleMy: '၁၁။ နေ့စဉ်အဆုံးခံငွေ ကန့်သတ်ချက်နှင့် ရပ်နားမည့် စည်းကမ်းရှိခြင်း',
    descEn: 'Set a maximum daily loss limit (e.g. -3% in a day = done for 24 hours). Also only trade with discretionary funds you can afford to lose.',
    descMy: 'တစ်နေ့လျှင် အများဆုံး ၃% ထက်ပိုမရှုံးစေရဟူသော ကန့်သတ်ချက်နှင့် ဆုံးရှုံးသွားပါက လူနေမှုဘဝကို မထိခိုက်နိုင်သော ပိုလျှံငွေဖြင့်သာ သုံးခြင်း။',
    adviceEn: 'Never borrow money or trade with living expenses/rent.',
    adviceMy: 'ချေးငှားထားသောငွေ သို့မဟုတ် အိမ်လခ/စားစရိတ်များဖြင့် မည်သည့်အခါမျှ မကုန်သွယ်ပါနှင့်။',
  },
];

const STORAGE_KEY = 'crypto_learning_live_readiness_v1';

export const LiveTradingPreparation: React.FC<{ lang: 'my' | 'en' }> = ({ lang }) => {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCheckedIds(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, []);

  const toggleItem = (id: string) => {
    const updated = checkedIds.includes(id)
      ? checkedIds.filter((item) => item !== id)
      : [...checkedIds, id];
    setCheckedIds(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetChecklist = () => {
    setCheckedIds([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const score = checkedIds.length;
  const total = CHECKLIST_ITEMS.length;
  const percent = Math.round((score / total) * 100);

  const getVerdict = () => {
    if (score === 11) {
      return {
        titleEn: 'Ready for Micro-Capital Live Practice ✅',
        titleMy: 'အသေးစားငွေကြေးဖြင့် စတင်လက်တွေ့စမ်းသပ်ရန် အသင့်ဖြစ်ပြီ ✅',
        descEn: 'You understand the core risks. Deposit only a small nominal test amount ($50-$100) to test psychology.',
        descMy: 'အန္တရာယ်များကို ကောင်းစွာနားလည်ထားပြီးဖြစ်သည်။ စိတ်ခံစားချက်ကို စမ်းသပ်ရန် ဒေါ်လာ ၅၀-၁၀၀ ခန့် အနည်းဆုံးငွေဖြင့်သာ စတင်ပါ။',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      };
    }
    if (score >= 8) {
      return {
        titleEn: 'Almost Ready — Review Unchecked Rules ⚠️',
        titleMy: 'အသင့်ဖြစ်လုနီးပါး — မဖြည့်ဆည်းရသေးသော စည်းကမ်းများကို ပြန်စစ်ပါ ⚠️',
        descEn: 'You have good conceptual foundation, but the missing checks represent high vulnerabilities.',
        descMy: 'အခြေခံကောင်းသော်လည်း ကျန်ရှိနေသော အချက်များသည် အကောင့်ကို အန္တရာယ်ဖြစ်စေနိုင်သော ဟာကွက်များ ဖြစ်သည်။',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      };
    }
    return {
      titleEn: 'NOT Ready for Live Trading — Keep Practicing 🛑',
      titleMy: 'တိုက်ရိုက်ကုန်သွယ်ရန် အဆင်မသင့်သေးပါ — ဆက်လက်လေ့ကျင့်ပါ 🛑',
      descEn: 'Risk of catastrophic account loss is very high. Please continue practicing in the Paper Simulator.',
      descMy: 'အကောင့်ပြုတ်ထွက်ဆုံးရှုံးနိုင်ခြေ အလွန်မြင့်မားသည်။ ကျေးဇူးပြု၍ စမ်းသပ်စနစ်တွင် ဆက်လက်လေ့ကျင့်ပါ။',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    };
  };

  const verdict = getVerdict();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/20 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              {lang === 'my' ? 'တိုက်ရိုက်စျေးကွက် မဝင်မီ မဖြစ်မနေ စစ်ဆေးရမည့် ၁၁ ချက်' : 'Live Trading Readiness Checklist (11 Points)'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            {lang === 'my'
              ? 'အမှန်တကယ်ငွေမသုံးမီ ဤအချက် ၁၁ ချက်ကို ရိုးသားစွာ စစ်ဆေးပါ။ မပြည့်စုံဘဲ စျေးကွက်ထဲဝင်ရောက်ပါက အရင်းအနှီးဆုံးရှုံးနိုင်ခြေ အလွန်မြင့်မားသည်။'
              : 'Be brutally honest with yourself. Never deposit real money until you have mastered these 11 fundamentals.'}
          </p>
        </div>

        <button
          onClick={resetChecklist}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'my' ? 'ပြန်လည်စစ်ဆေးမည်' : 'Reset Checklist'}</span>
        </button>
      </div>

      {/* Readiness Score Card */}
      <div className={`p-5 rounded-3xl border ${verdict.color} space-y-3 shadow-lg`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider block mb-0.5">
              {lang === 'my' ? 'သင်၏ အဆင်သင့်ဖြစ်မှု အကဲဖြတ်ချက်' : 'Readiness Assessment'}
            </span>
            <h3 className="text-base font-bold">
              {lang === 'my' ? verdict.titleMy : verdict.titleEn}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-black">
              {score} / {total}
            </span>
            <span className="text-xs font-mono block text-slate-400">({percent}%)</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              score === 11 ? 'bg-emerald-500' : score >= 8 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="text-xs leading-relaxed text-slate-300">
          {lang === 'my' ? verdict.descMy : verdict.descEn}
        </p>
      </div>

      {/* The 11 Checklist Items */}
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = checkedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                isChecked
                  ? 'bg-slate-900 border-emerald-500/40 text-slate-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                className={`mt-0.5 shrink-0 w-5 h-5 rounded-lg flex items-center justify-center transition ${
                  isChecked
                    ? 'bg-emerald-500 text-slate-950'
                    : 'border border-slate-700 hover:border-slate-500 text-transparent'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>

              <div className="space-y-1 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                    {lang === 'my' ? item.titleMy : item.titleEn}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isChecked
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isChecked ? 'READY ✅' : 'NOT YET ❌'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {lang === 'my' ? item.descMy : item.descEn}
                </p>

                <div className="mt-1 pt-1 border-t border-slate-800/60 text-[10px] text-amber-400/90 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>{lang === 'my' ? item.adviceMy : item.adviceEn}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
