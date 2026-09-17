import React from 'react';
import { X, BookOpen, Search } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'my' | 'en';
}

export const GLOSSARY_TERMS = [
  {
    term: 'Market Structure',
    burmese: 'စျေးကွက်ဖွဲ့စည်းပုံ',
    definition: 'စျေးနှုန်း၏ အမြင့်ဆုံး (Higher Highs) နှင့် အနိမ့်ဆုံး (Higher Lows / Lower Lows) ရွေ့လျားမှု လမ်းကြောင်းကို ဖော်ပြခြင်း။',
  },
  {
    term: 'Momentum',
    burmese: 'စျေးအင်အား',
    definition: 'စျေးနှုန်း အတက် သို့မဟုတ် အကျသို့ ဦးတည်ရွေ့လျားနေသော အလျင်နှင့် အားမာန်။ RSI / MACD ဖြင့် အကဲဖြတ်သည်။',
  },
  {
    term: 'Liquidity',
    burmese: 'ဝယ်/ရောင်းလွယ်မှု',
    definition: 'စျေးနှုန်း အဆမတန် ကွာဟမှု (Slippage) မရှိဘဲ ကြီးမားသော Position များကို လွယ်ကူစွာ အရောင်းအဝယ်ပြုလုပ်နိုင်စွမ်း။',
  },
  {
    term: 'Volatility',
    burmese: 'စျေးနှုန်းအတက်အကျမြန်မှု',
    definition: 'တိုတောင်းသော အချိန်အတွင်း စျေးနှုန်း အတက်အကျ ဖြစ်ပေါ်မှု ပမာဏနှင့် ပြင်းအား။',
  },
  {
    term: 'Open Interest (OI)',
    burmese: 'ဖွင့်ထားသော Futures Position ပမာဏ',
    definition: 'Binance Futures စျေးကွက်တွင် စာချုပ်မပိတ်သေးဘဲ လက်ရှိ ဖွင့်ထားဆဲဖြစ်သော စုစုပေါင်း Long နှင့် Short Position တန်ဖိုး။',
  },
  {
    term: 'Funding Rate',
    burmese: 'Long/Short ဘက်က ပေးဆောင်ရတဲ့နှုန်း',
    definition: 'Futures စျေးနှုန်းနှင့် Spot စျေးနှုန်း တူညီစေရန် Long သို့မဟုတ် Short သမားများ အချင်းချင်း ပေးချေရသော အခကြေးငွေ။ အနုတ်ပြလျှင် Shorts သမားများက Long သမားများကို ပေးရသည်။',
  },
  {
    term: 'Breakout',
    burmese: 'Resistance ကို ဖောက်တက်ခြင်း',
    definition: 'အတားအဆီး Resistance အဆင့် သို့မဟုတ် အကျ Trendline ကို ကျော်လွန်၍ စျေးနှုန်း အားကောင်းစွာ ဖောက်ထွက်သွားခြင်း။',
  },
  {
    term: 'Retest',
    burmese: 'ဖောက်ပြီးနောက် ပြန်စမ်းခြင်း',
    definition: 'Breakout ဖြစ်ပြီးနောက် ဖောက်ထွက်ခဲ့သော အဆင့်သို့ စျေးနှုန်း ပြန်လည်ဆင်းကာ Support အဖြစ် ခိုင်မာမှု ရှိ/မရှိ ပြန်လည်စမ်းသပ်ခြင်း။',
  },
  {
    term: 'BOS / CHoCH / MSS',
    burmese: 'စျေးကွက်ပုံစံပြောင်းလဲမှု အချက်ပြ',
    definition: 'BOS (Break of Structure — လမ်းကြောင်းအတိုင်း ဆက်ဖောက်ခြင်း) နှင့် CHoCH (Change of Character — အတက်မှအကျ သို့မဟုတ် အကျမှအတက်သို့ လမ်းကြောင်းပြောင်းခြင်း)။',
  },
  {
    term: 'Liquidity Sweep / SFP',
    burmese: 'အရည်အသွေးသုတ်သင်ခြင်း (Stop Hunt)',
    definition: 'Support အောက်ရှိ Stop Loss များကို စားရန် ခေတ္တဆင်းပြီးနောက် ချက်ချင်း စျေးပြန်တက်သိမ်းပိုက်ခြင်း (Swing Failure Pattern)။',
  },
  {
    term: 'Risk/Reward (R:R)',
    burmese: 'စွန့်စားရမှုနှင့် အမြတ်ရနိုင်မှုအချိုး',
    definition: 'အရှုံးခံမည့် ပမာဏ (Risk) နှင့် ပြန်လည်ရရှိနိုင်မည့် အမြတ် (Reward) အချိုး။ အနည်းဆုံး 1:2 သို့မဟုတ် 1:3 အထက် ရှိသင့်သည်။',
  },
  {
    term: 'Stop Loss (SL)',
    burmese: 'အရှုံးကန့်သတ်စျေး',
    definition: 'ခန့်မှန်းချက် မှားယွင်းပါက မလိုလားအပ်သော အရှုံးကြီးမားမှု မဖြစ်စေရန် ကြိုတင်သတ်မှတ်ထားသော အလိုအလျောက် ပိတ်မည့်စျေး။',
  },
  {
    term: 'Take Profit (TP)',
    burmese: 'အမြတ်ယူစျေး',
    definition: 'ရည်မှန်းထားသော ပစ်မှတ်စျေးသို့ ရောက်ရှိပါက အမြတ်ကို အလိုအလျောက် ရယူရန် သတ်မှတ်ထားသောစျေး (TP1, TP2, TP3)။',
  },
  {
    term: 'Trailing Stop',
    burmese: 'စျေးနောက်လိုက် အမြတ်ကာကွယ် SL',
    definition: 'စျေးနှုန်း အမြတ်ဘက်သို့ ဆက်တက်သွားသည်နှင့်အမျှ ရရှိပြီးသား အမြတ်ကို ကာကွယ်ရန် Stop Loss ကို စျေးနောက်သို့ အဆင့်ဆင့် ရွှေ့ပေးခြင်း။',
  },
  {
    term: 'Liquidation Price',
    burmese: 'အတင်းအကျပ် Position အသိမ်းခံရမည့်စျေး',
    definition: 'Margin ပြည့်မီမှု မရှိတော့သဖြင့် Exchange က Position တစ်ခုလုံးကို အရှုံးဖြင့် အတင်းအကျပ် ပိတ်သိမ်းမည့် အန္တရာယ်ရှိသော စျေးနှုန်း။',
  },
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'my'
                  ? 'နည်းပညာဝေါဟာရ အဘိဓာန် (Technical Terms Dictionary)'
                  : 'Crypto Futures Technical Glossary (EN + Myanmar)'}
              </h3>
              <p className="text-xs text-slate-500">
                Rule 14 အရ English နှင့် မြန်မာဝေါဟာရ ရှင်းလင်းချက်များ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {GLOSSARY_TERMS.map((item, idx) => (
            <div key={idx} className="pt-3 first:pt-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                  {item.term}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ({item.burmese})
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {item.definition}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer"
          >
            {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
