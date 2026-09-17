import React, { useState } from 'react';
import { SCAM_SCENARIOS_DATABASE as SCAM_SCENARIOS } from '../../data/learningData';
import { ScamScenario } from '../../types/learning';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface ScamSimulatorProps {
  lang: 'my' | 'en';
  onComplete?: () => void;
}

export const ScamSimulator: React.FC<ScamSimulatorProps> = ({
  lang,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<'scam' | 'legit' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const scenario: ScamScenario = SCAM_SCENARIOS[currentIndex];
  const isActualScam = !scenario.wouldYouTrust;
  const isCorrect =
    (userChoice === 'scam' && isActualScam) ||
    (userChoice === 'legit' && !isActualScam);

  const handleVote = (choice: 'scam' | 'legit') => {
    if (answered) return;
    setUserChoice(choice);
    setAnswered(true);
    if (
      (choice === 'scam' && isActualScam) ||
      (choice === 'legit' && !isActualScam)
    ) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < SCAM_SCENARIOS.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserChoice(null);
      setAnswered(false);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserChoice(null);
    setAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const perfectScore = score === SCAM_SCENARIOS.length;
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center shadow-xl">
        <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-400 mb-3">
          <Award className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">
          {lang === 'my'
            ? 'လိမ်လည်မှုစစ်ဆေးရေး လေ့ကျင့်ခန်း ပြီးဆုံးပါပြီ!'
            : 'Scam Detection Simulation Completed!'}
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          {lang === 'my'
            ? `သင်မှန်ကန်စွာ တွေ့ရှိမှု: ${score} / ${SCAM_SCENARIOS.length}`
            : `Your Safety Accuracy: ${score} / ${SCAM_SCENARIOS.length}`}
        </p>

        <div className="my-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 max-w-sm mx-auto text-xs">
          {perfectScore ? (
            <div className="text-emerald-400 flex items-center justify-center gap-2 font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>
                {lang === 'my'
                  ? 'လုံခြုံရေးကျွမ်းကျင်သူ အဆင့်သို့ ရောက်ရှိပါသည်!'
                  : 'Certified Security Defender: 100% Protected!'}
              </span>
            </div>
          ) : (
            <div className="text-amber-300">
              {lang === 'my'
                ? 'လိမ်လည်မှုပုံစံများကို ပိုမိုသတိပြုမိစေရန် ထပ်မံလေ့ကျင့်ကြည့်ပါ။'
                : 'Good attempt! Review the red flags and try again to master threat recognition.'}
            </div>
          )}
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
        >
          <RotateCcw className="w-4 h-4" />
          {lang === 'my' ? 'ပြန်လည်လေ့ကျင့်မည်' : 'Restart Simulation'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-rose-400 font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>
            {lang === 'my'
              ? 'လိမ်လည်မှုစစ်ဆေးရေး ဓာတ်ခွဲခန်း (Scam Simulator)'
              : 'Interactive Scam & Phishing Radar'}
          </span>
        </div>
        <span className="font-mono text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
          {currentIndex + 1} / {SCAM_SCENARIOS.length}
        </span>
      </div>

      <div className="my-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
          {lang === 'my' ? 'တွေ့ကြုံရသည့် အခြေအနေ' : 'Scenario Description'}
        </span>
        <h4 className="text-sm font-semibold text-white bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
          {lang === 'my' ? scenario.scenarioTextMy : scenario.scenarioText}
        </h4>
      </div>

      {/* Choice Buttons: SCAM vs LEGIT */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          disabled={answered}
          onClick={() => handleVote('scam')}
          className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
            userChoice === 'scam'
              ? 'border-rose-500 bg-rose-500/20 text-rose-200'
              : 'border-slate-800 bg-slate-950/60 hover:border-rose-500/50 text-slate-200'
          } ${answered ? 'opacity-80 cursor-default' : 'hover:scale-[1.01]'}`}
        >
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          <span className="text-xs font-bold">
            {lang === 'my' ? '⚠️ လိမ်လည်မှုဖြစ်သည် (SCAM)' : '⚠️ It is a SCAM'}
          </span>
        </button>

        <button
          disabled={answered}
          onClick={() => handleVote('legit')}
          className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
            userChoice === 'legit'
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
              : 'border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 text-slate-200'
          } ${answered ? 'opacity-80 cursor-default' : 'hover:scale-[1.01]'}`}
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">
            {lang === 'my' ? '✅ တရားဝင်အစစ်အမှန် (LEGIT)' : '✅ It is LEGITIMATE'}
          </span>
        </button>
      </div>

      {/* Answer feedback */}
      {answered && (
        <div
          className={`p-3.5 rounded-xl border mb-4 text-xs ${
            isCorrect
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1.5">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === 'my' ? 'မှန်ကန်သော ဆုံးဖြတ်ချက် ဖြစ်ပါသည်!' : 'Correct Judgment!'}
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>
                  {lang === 'my'
                    ? 'သတိထားပါ! အမှားတစ်ခု ဖြစ်ပေါ်သွားသည်'
                    : 'Dangerous Call! Review the red flags below:'}
                </span>
              </>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {lang === 'my' ? scenario.detailedExplanationMy : scenario.detailedExplanation}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-amber-300 font-mono">
            <span className="font-bold">RED FLAG:</span>
            <span>{scenario.redFlags && scenario.redFlags.length > 0 ? (lang === 'my' && scenario.redFlagsMy ? scenario.redFlagsMy[0] : scenario.redFlags[0]) : 'High risk indicators detected.'}</span>
          </div>
        </div>
      )}

      {answered && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
          >
            <span>
              {currentIndex + 1 < SCAM_SCENARIOS.length
                ? lang === 'my'
                  ? 'နောက်ထပ် လေ့ကျင့်ခန်း'
                  : 'Next Scenario'
                : lang === 'my'
                ? 'အပြီးသတ် အကဲဖြတ်မည်'
                : 'See Final Results'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
