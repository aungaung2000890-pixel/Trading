import React, { useState } from 'react';
import { Lesson } from '../../types/learning';
import { VisualDiagram } from './VisualDiagram';
import { QuizRunner } from './QuizRunner';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Brain,
  Pencil,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface LessonViewerProps {
  lesson: Lesson;
  isCompleted: boolean;
  onToggleComplete: (lessonId: string) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  onBackToMenu: () => void;
  lang: 'my' | 'en';
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  isCompleted,
  onToggleComplete,
  onNextLesson,
  onPrevLesson,
  onBackToMenu,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'study' | 'quiz'>('study');
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleQuizFinish = (score: number) => {
    setQuizScore(score);
    if (!isCompleted) {
      onToggleComplete(lesson.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Top Breadcrumb and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'my' ? 'သင်ရိုးမာတိကာသို့ ပြန်သွားမည်' : 'Curriculum Menu'}</span>
        </button>

        <div className="flex items-center gap-2">
          {onPrevLesson && (
            <button
              onClick={onPrevLesson}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              ← {lang === 'my' ? 'ရှေ့သင်ခန်းစာ' : 'Previous'}
            </button>
          )}

          <button
            onClick={() => onToggleComplete(lesson.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}
            />
            <span>
              {isCompleted
                ? lang === 'my'
                  ? 'လေ့လာပြီးပါပြီ ✅'
                  : 'Completed ✅'
                : lang === 'my'
                ? 'ပြီးဆုံးကြောင်း မှတ်သားမည်'
                : 'Mark Complete'}
            </span>
          </button>

          {onNextLesson && (
            <button
              onClick={onNextLesson}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition"
            >
              <span>{lang === 'my' ? 'နောက်သင်ခန်းစာ' : 'Next Lesson'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lesson Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
          <span className="bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 font-bold">
            SECTION {lesson.sectionId} • {lesson.number}
          </span>
          <span className="text-slate-400">
            {lang === 'my' && lesson.sectionTitleMy
              ? lesson.sectionTitleMy
              : lesson.sectionTitle}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
          {lang === 'my' && lesson.titleMy ? lesson.titleMy : lesson.title}
        </h1>

        <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
          {lang === 'my' && lesson.summaryMy ? lesson.summaryMy : lesson.summary}
        </p>

        {/* Study vs Quiz Sub-tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('study')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'study'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'သင်ခန်းစာ အပြည့်အစုံ' : 'Full Lesson Content'}</span>
          </button>

          {lesson.quiz && lesson.quiz.length > 0 && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {lang === 'my' ? 'အမြန်ဉာဏ်စမ်းမေးခွန်း' : 'Quick Quiz'}{' '}
                {quizScore !== null ? `(${quizScore}%)` : `(${lesson.quiz.length})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* QUIZ VIEW */}
      {activeTab === 'quiz' && lesson.quiz && (
        <div className="space-y-4">
          <QuizRunner
            questions={lesson.quiz}
            onComplete={handleQuizFinish}
            lang={lang}
          />
        </div>
      )}

      {/* STUDY VIEW (7-STEP CURRICULUM FORMAT) */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          {/* 1. SIMPLE EXPLANATION (WHAT & WHY) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <BookOpen className="w-4 h-4" />
              <span>1. {lang === 'my' ? 'ရိုးရှင်းသော ရှင်းလင်းချက်' : 'Simple Explanation'}</span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-200">
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1 text-[11px] uppercase tracking-wider text-amber-300/80">
                  {lang === 'my' ? '၎င်းသည် အဘယ်နည်း?' : 'What Is It?'}
                </span>
                <p>{lang === 'my' && lesson.whatIsItMy ? lesson.whatIsItMy : lesson.whatIsIt}</p>
              </div>

              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1 text-[11px] uppercase tracking-wider text-emerald-300/80">
                  {lang === 'my' ? 'အဘယ်ကြောင့် အရေးကြီးသနည်း?' : 'Why It Matters'}
                </span>
                <p>
                  {lang === 'my' && lesson.whyItMattersMy
                    ? lesson.whyItMattersMy
                    : lesson.whyItMatters}
                </p>
              </div>
            </div>
          </div>

          {/* 2. VISUAL ILLUSTRATION / DIAGRAM */}
          {lesson.visualType && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>
                  2. {lang === 'my' ? 'ရုပ်ပုံဖြင့် သရုပ်ဖော်ပြသချက်' : 'Visual Illustration / Diagram'}
                </span>
              </div>
              <VisualDiagram
                type={lesson.visualType}
                caption={lesson.visualCaption}
                captionMy={lesson.visualCaptionMy}
                lang={lang}
              />
            </div>
          )}

          {/* 3. REAL WORLD EXAMPLE */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>3. {lang === 'my' ? 'လက်တွေ့ကမ္ဘာ ဥပမာ' : 'Real-World Example'}</span>
            </div>
            <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs text-slate-200 leading-relaxed">
              <p>{lang === 'my' && lesson.exampleMy ? lesson.exampleMy : lesson.example}</p>
            </div>
          </div>

          {/* 4. KEY POINTS / BRAIN TAKEAWAYS */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Brain className="w-4 h-4" />
              <span>4. {lang === 'my' ? 'အဓိက သတိပြုရမည့် အချက်များ' : 'Key Takeaways'}</span>
            </div>
            <ul className="space-y-2">
              {(lang === 'my' && lesson.keyTakeawaysMy
                ? lesson.keyTakeawaysMy
                : lesson.keyTakeaways
              ).map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-300 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80"
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {lesson.commonMistake && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <span className="font-bold block text-rose-400">
                    {lang === 'my' ? 'အဖြစ်များသော အမှား:' : 'Common Beginner Mistake:'}
                  </span>
                  <p className="mt-0.5 text-[11px] text-slate-300">
                    {lang === 'my' && lesson.commonMistakeMy
                      ? lesson.commonMistakeMy
                      : lesson.commonMistake}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5. SMALL PRACTICE EXERCISE */}
          {lesson.practiceExercise && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Pencil className="w-4 h-4" />
                <span>5. {lang === 'my' ? 'လက်တွေ့ လေ့ကျင့်ခန်း' : 'Practice Exercise'}</span>
              </div>
              <div className="p-3.5 bg-indigo-950/20 rounded-xl border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
                <p>
                  {lang === 'my' && lesson.practiceExerciseMy
                    ? lesson.practiceExerciseMy
                    : lesson.practiceExercise}
                </p>
              </div>
            </div>
          )}

          {/* 6. QUICK QUIZ CALLOUT */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>6. {lang === 'my' ? 'ဉာဏ်စမ်းမေးခွန်း စစ်ဆေးခြင်း' : 'Quick Quiz'}</span>
                </div>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  {lang === 'my' ? 'မေးခွန်းဖြေဆိုရန် နှိပ်ပါ →' : 'Take Quiz Now →'}
                </button>
              </div>
              <QuizRunner
                questions={lesson.quiz}
                onComplete={handleQuizFinish}
                lang={lang}
              />
            </div>
          )}

          {/* 7. COMPLETION STATUS & NEXT LESSON BANNER */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">
                  {isCompleted
                    ? lang === 'my'
                      ? 'သင်ခန်းစာ ပြီးမြောက်ပါသည်'
                      : 'Lesson Completed'
                    : lang === 'my'
                    ? 'လေ့လာဆဲ အဆင့်'
                    : 'In Progress'}
                </div>
                <div className="text-slate-400 text-[11px]">
                  {lang === 'my'
                    ? 'အထက်ပါအချက်များကို နားလည်ပါက ပြီးဆုံးကြောင်း မှတ်သားနိုင်ပါသည်'
                    : 'Once you understand the key points, proceed to the next module'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onToggleComplete(lesson.id)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isCompleted
                    ? 'bg-slate-800 text-slate-300 hover:text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isCompleted
                  ? lang === 'my'
                    ? 'ပြန်လည်မှတ်သားမည်'
                    : 'Mark Incomplete'
                  : lang === 'my'
                  ? 'လေ့လာပြီးကြောင်း မှတ်သားမည်'
                  : 'Mark as Completed'}
              </button>

              {onNextLesson && (
                <button
                  onClick={onNextLesson}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow"
                >
                  <span>{lang === 'my' ? 'နောက်သင်ခန်းစာ' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
