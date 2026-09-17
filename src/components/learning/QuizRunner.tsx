import React, { useState } from 'react';
import { QuizQuestion } from '../../types/learning';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizRunnerProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  lang: 'my' | 'en';
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  onComplete,
  lang,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!questions || questions.length === 0) {
    return null;
  }

  const q = questions[currentIndex];
  const isCorrect = selectedOption === q.correctIndex;

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === q.correctIndex) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setQuizFinished(true);
      const finalScore = Math.round(
        ((correctAnswers + (isCorrect ? 1 : 0)) / questions.length) * 100
      );
      onComplete(finalScore);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setCorrectAnswers(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    return (
      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
        <h4 className="text-base font-bold text-white">
          {lang === 'my' ? 'မေးခွန်းလွှာ ဖြေဆိုပြီးပါပြီ!' : 'Quiz Completed!'}
        </h4>
        <p className="text-xs text-slate-300 mt-1">
          {lang === 'my'
            ? `သင့်ရမှတ်: ${correctAnswers} / ${questions.length} (${finalScore}%)`
            : `Your score: ${correctAnswers} / ${questions.length} (${finalScore}%)`}
        </p>
        <button
          onClick={handleRestart}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {lang === 'my' ? 'ထပ်မံဖြေဆိုမည်' : 'Retake Quiz'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span className="flex items-center gap-1.5 font-bold text-amber-400">
          <HelpCircle className="w-4 h-4" />
          {lang === 'my' ? 'အမြန်ဉာဏ်စမ်းမေးခွန်း' : 'Quick Quiz'}
        </span>
        <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px]">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-slate-100 mb-3">
        {lang === 'my' && q.questionMy ? q.questionMy : q.question}
      </h4>

      <div className="space-y-2 mb-4">
        {(lang === 'my' && q.optionsMy ? q.optionsMy : q.options).map(
          (opt, idx) => {
            let btnStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700';

            if (selectedOption === idx) {
              btnStyle = 'border-amber-500/80 bg-amber-500/10 text-amber-200';
            }

            if (submitted) {
              if (idx === q.correctIndex) {
                btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-medium';
              } else if (selectedOption === idx) {
                btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-300 line-through';
              } else {
                btnStyle = 'border-slate-800/40 bg-slate-950/30 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                disabled={submitted}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {submitted && idx === q.correctIndex && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                )}
                {submitted && selectedOption === idx && idx !== q.correctIndex && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                )}
              </button>
            );
          }
        )}
      </div>

      {submitted && (
        <div
          className={`p-3 rounded-xl mb-3 text-xs ${
            isCorrect
              ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="font-bold mb-1">
            {isCorrect
              ? lang === 'my'
                ? '✅ မှန်ကန်ပါသည်!'
                : '✅ Correct!'
              : lang === 'my'
              ? '❌ မှားယွင်းပါသည်'
              : '❌ Incorrect'}
          </div>
          <p className="text-[11px] text-slate-300">
            {lang === 'my' && q.explanationMy ? q.explanationMy : q.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition shadow"
          >
            {lang === 'my' ? 'အဖြေစစ်ဆေးမည်' : 'Check Answer'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow"
          >
            <span>
              {currentIndex + 1 < questions.length
                ? lang === 'my'
                  ? 'နောက်တစ်ပုဒ်သို့'
                  : 'Next Question'
                : lang === 'my'
                ? 'ပြီးဆုံးမည်'
                : 'Complete Quiz'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
