import React, { useState, useEffect, useMemo } from 'react';
import {
  LEARNING_SECTIONS,
  LESSONS_DATABASE,
} from '../data/learningData';
import { ADVANCED_LESSONS_DATABASE } from '../data/learningAdvancedData';
import { Lesson, LearningSection } from '../types/learning';
import { LessonViewer } from './learning/LessonViewer';
import { ScamSimulator } from './learning/ScamSimulator';
import { GlossarySearchModal } from './learning/GlossarySearchModal';
import { LearningRiskCalculator } from './learning/LearningRiskCalculator';
import { StrategyBuilder } from './learning/StrategyBuilder';
import { PaperTradingSimulator } from './learning/PaperTradingSimulator';
import { LiveTradingPreparation } from './learning/LiveTradingPreparation';
import { PerformanceAnalytics } from './learning/PerformanceAnalytics';
import { TraderSkillLevels } from './learning/TraderSkillLevels';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  RotateCcw,
  Languages,
  Award,
  Zap,
  Calculator,
  Compass,
  BarChart2,
  Calendar,
  CheckSquare,
  Flame,
  Layers,
  Clock,
} from 'lucide-react';

interface LearningCenterProps {
  onBackToApp?: () => void;
}

type LearningView =
  | 'curriculum'
  | 'lesson'
  | 'scam-simulator'
  | 'risk-calculator'
  | 'strategy-builder'
  | 'paper-trading'
  | 'live-readiness'
  | 'performance-analytics'
  | 'skill-levels';

const POPULAR_SEARCH_TERMS = [
  'Bitcoin',
  'Blockchain',
  'RSI',
  'Leverage',
  'Margin',
  'Liquidity',
  'Market Structure',
  'FVG',
  'Order Block',
  'Funding Rate',
  'Tokenomics',
  'TVL',
];

export const LearningCenter: React.FC<LearningCenterProps> = ({
  onBackToApp,
}) => {
  // Combine all lessons
  const allLessons: Lesson[] = useMemo(() => {
    return [...LESSONS_DATABASE, ...ADVANCED_LESSONS_DATABASE];
  }, []);

  // Language state (English / Myanmar)
  const [lang, setLang] = useState<'my' | 'en'>('en');

  // Reading speed state (WPM)
  const [readingSpeedWpm, setReadingSpeedWpm] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('crypto_user_reading_speed_wpm');
      return saved ? Number(saved) : 220;
    } catch {
      return 220;
    }
  });

  const handleSetReadingSpeed = (wpm: number) => {
    setReadingSpeedWpm(wpm);
    try {
      localStorage.setItem('crypto_user_reading_speed_wpm', String(wpm));
    } catch (e) {
      console.warn(e);
    }
  };

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [activeSectionFilter, setActiveSectionFilter] = useState<number | null>(null);

  // Active view
  const [activeView, setActiveView] = useState<LearningView>('curriculum');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Glossary modal
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [initialGlossaryTerm, setInitialGlossaryTerm] = useState<string | undefined>(undefined);

  // Completed lessons stored in localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('crypto_learning_completed_lessons');
      return saved ? JSON.parse(saved) : ['lesson-1-1'];
    } catch {
      return ['lesson-1-1'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'crypto_learning_completed_lessons',
        JSON.stringify(completedLessonIds)
      );
    } catch (e) {
      console.warn('Failed to save progress to localStorage', e);
    }
  }, [completedLessonIds]);

  const toggleLessonCompletion = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      if (prev.includes(lessonId)) {
        return prev.filter((id) => id !== lessonId);
      } else {
        return [...prev, lessonId];
      }
    });
  };

  // Next lesson calculation
  const nextLessonToStudy = useMemo(() => {
    return (
      allLessons.find((l) => !completedLessonIds.includes(l.id)) ||
      allLessons[0]
    );
  }, [allLessons, completedLessonIds]);

  // Overall progress calculation
  const totalLessonsCount = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercentage = Math.min(
    100,
    Math.round((completedCount / (totalLessonsCount || 1)) * 100)
  );

  // Dynamic estimate per lesson based on user's reading speed (WPM)
  const getCryptoLessonEstimatedMinutes = (lesson: Lesson) => {
    const wordCount =
      (lesson.whatIsIt || '').split(/\s+/).length +
      (lesson.whyItMatters || '').split(/\s+/).length +
      (lesson.summary || '').split(/\s+/).length +
      250;
    return Math.max(2, Math.round((wordCount / (readingSpeedWpm || 220)) * 1.15));
  };

  // Total remaining minutes to complete unfinished lessons
  const totalRemainingMinutes = useMemo(() => {
    const incompleteLessons = allLessons.filter((l) => !completedLessonIds.includes(l.id));
    return incompleteLessons.reduce((acc, l) => acc + getCryptoLessonEstimatedMinutes(l), 0);
  }, [allLessons, completedLessonIds, readingSpeedWpm]);

  // Determine current user level based on completed lessons
  const currentSkillRank = useMemo(() => {
    if (completedCount >= 28) return { level: 8, badge: '🏆', name: 'Level 8: Consistent Trader' };
    if (completedCount >= 26) return { level: 7, badge: '⚫', name: 'Level 7: Advanced Trader' };
    if (completedCount >= 23) return { level: 6, badge: '🟣', name: 'Level 6: Strategy Builder' };
    if (completedCount >= 20) return { level: 5, badge: '🔴', name: 'Level 5: Risk-Controlled Trader' };
    if (completedCount >= 17) return { level: 4, badge: '🟠', name: 'Level 4: Technical Trader' };
    if (completedCount >= 13) return { level: 3, badge: '🟡', name: 'Level 3: Chart Reader' };
    if (completedCount >= 9) return { level: 2, badge: '🔵', name: 'Level 2: Market Basics' };
    return { level: 1, badge: '🟢', name: 'Level 1: Crypto Beginner' };
  }, [completedCount]);

  // Determine Current Learning Path
  const currentLearningPath = useMemo(() => {
    if (completedCount < 9) return lang === 'my' ? 'အခြေခံ လမ်းကြောင်း (Beginner)' : 'Beginner Fundamentals';
    if (completedCount < 20) return lang === 'my' ? 'အလယ်အလတ် နည်းပညာ (Intermediate)' : 'Intermediate Technical';
    if (completedCount < 26) return lang === 'my' ? 'အဆင့်မြင့် ခွဲခြမ်းစိတ်ဖြာမှု (Advanced)' : 'Advanced Market Mastery';
    return lang === 'my' ? 'လက်တွေ့ ကုန်သွယ်ရေး (Practical Execution)' : 'Practical Execution & Strategy';
  }, [completedCount, lang]);

  // Filtered sections
  const filteredSections = useMemo(() => {
    return LEARNING_SECTIONS.filter((sec) => {
      // Level filter
      if (selectedLevel !== 'All' && sec.path !== selectedLevel) {
        return false;
      }
      // Section filter
      if (activeSectionFilter !== null && sec.id !== activeSectionFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch =
          sec.title.toLowerCase().includes(q) ||
          (sec.titleMy && sec.titleMy.includes(q));
        const descMatch =
          (sec.shortDesc && sec.shortDesc.toLowerCase().includes(q)) ||
          (sec.shortDescMy && sec.shortDescMy.includes(q));
        const lessonMatch = allLessons.some(
          (l) =>
            l.sectionId === sec.id &&
            (l.title.toLowerCase().includes(q) ||
              (l.titleMy && l.titleMy.includes(q)) ||
              l.summary.toLowerCase().includes(q))
        );
        return titleMatch || descMatch || lessonMatch;
      }
      return true;
    });
  }, [selectedLevel, activeSectionFilter, searchQuery, allLessons]);

  // Handle open specific lesson
  const handleOpenLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active lesson object
  const currentLesson = useMemo(() => {
    return allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  }, [allLessons, activeLessonId]);

  // Next / Prev lesson handlers
  const currentLessonIndex = allLessons.findIndex(
    (l) => l.id === currentLesson?.id
  );
  const handleNextLesson = () => {
    if (currentLessonIndex >= 0 && currentLessonIndex + 1 < allLessons.length) {
      setActiveLessonId(allLessons[currentLessonIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setActiveLessonId(allLessons[currentLessonIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenGlossaryForTerm = (term: string) => {
    setInitialGlossaryTerm(term);
    setIsGlossaryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Banner / Navigation for Learning Center */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('curriculum')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 hover:scale-105 transition"
            >
              <GraduationCap className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span
                  onClick={() => setActiveView('curriculum')}
                  className="text-base font-bold text-white tracking-tight cursor-pointer hover:text-amber-400 transition"
                >
                  {lang === 'my' ? 'Crypto သင်ယူမှု ဗဟိုဌာန' : 'Crypto Learning Center'}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  FREE 14-MODULE CURRICULUM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Learn ➔ Understand ➔ See ➔ Practice ➔ Test ➔ Trade Safely
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Glossary Search CTA */}
            <button
              onClick={() => {
                setInitialGlossaryTerm(undefined);
                setIsGlossaryOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition"
              title="Search Glossary"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">
                {lang === 'my' ? 'ဝေါဟာရ အဘိဓာန်' : 'Glossary'}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'my' ? 'en' : 'my')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 transition"
              title="Switch language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'English' : 'မြန်မာ'}</span>
            </button>

            {/* Back to 10% movement Opportunity Strategy Analyzer */}
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition font-bold shadow"
              >
                <span>{lang === 'my' ? 'Strategy သို့' : '10% Scanner'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Nav Strip for all 8 Sub-modules */}
        <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto py-2 px-4 scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            {[
              { id: 'curriculum', labelEn: 'Curriculum (14 Cards)', labelMy: 'မာတိကာ (၁၄ ခန်း)', icon: BookOpen },
              { id: 'scam-simulator', labelEn: 'Scam Lab', labelMy: 'လိမ်လည်မှုစစ်ဆေးရေး', icon: ShieldAlert },
              { id: 'risk-calculator', labelEn: 'Risk Calculator', labelMy: 'အန္တရာယ်တွက်ချက်စနစ်', icon: Calculator },
              { id: 'strategy-builder', labelEn: 'Strategy Builder', labelMy: 'မဟာဗျူဟာရေးဆွဲစနစ်', icon: Layers },
              { id: 'paper-trading', labelEn: 'Paper Trading ($100k)', labelMy: 'စမ်းသပ်ကုန်သွယ်စနစ်', icon: Zap },
              { id: 'live-readiness', labelEn: 'Live Readiness (11-pt)', labelMy: 'တိုက်ရိုက်အသင့်ဖြစ်မှု', icon: CheckSquare },
              { id: 'performance-analytics', labelEn: 'Performance & Review', labelMy: 'စွမ်းဆောင်ရည်သုံးသပ်ချက်', icon: BarChart2 },
              { id: 'skill-levels', labelEn: 'Skill Levels (1-8)', labelMy: 'Trader အဆင့် (၁-၈)', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as LearningView)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{lang === 'my' ? tab.labelMy : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* =========================================================================
            VIEW 1: LESSON VIEWER
           ========================================================================= */}
        {activeView === 'lesson' && currentLesson && (
          <LessonViewer
            lesson={currentLesson}
            isCompleted={completedLessonIds.includes(currentLesson.id)}
            onToggleComplete={toggleLessonCompletion}
            onNextLesson={
              currentLessonIndex + 1 < allLessons.length
                ? handleNextLesson
                : undefined
            }
            onPrevLesson={currentLessonIndex > 0 ? handlePrevLesson : undefined}
            onBackToMenu={() => setActiveView('curriculum')}
            lang={lang}
          />
        )}

        {/* =========================================================================
            VIEW 2: SCAM SIMULATOR
           ========================================================================= */}
        {activeView === 'scam-simulator' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <button
              onClick={() => setActiveView('curriculum')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition"
            >
              ← {lang === 'my' ? 'မာတိကာသို့ ပြန်သွားမည်' : 'Back to Learning Menu'}
            </button>
            <ScamSimulator
              lang={lang}
              onComplete={() => {
                if (!completedLessonIds.includes('lesson-2-1')) {
                  toggleLessonCompletion('lesson-2-1');
                }
              }}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 3: EDUCATIONAL RISK CALCULATOR
           ========================================================================= */}
        {activeView === 'risk-calculator' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <button
              onClick={() => setActiveView('curriculum')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition"
            >
              ← {lang === 'my' ? 'မာတိကာသို့ ပြန်သွားမည်' : 'Back to Learning Menu'}
            </button>
            <LearningRiskCalculator lang={lang} />
          </div>
        )}

        {/* =========================================================================
            VIEW 4: STRATEGY BUILDER
           ========================================================================= */}
        {activeView === 'strategy-builder' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <button
              onClick={() => setActiveView('curriculum')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition"
            >
              ← {lang === 'my' ? 'မာတိကာသို့ ပြန်သွားမည်' : 'Back to Learning Menu'}
            </button>
            <StrategyBuilder lang={lang} />
          </div>
        )}

        {/* =========================================================================
            VIEW 5: PAPER TRADING SIMULATOR ($100k)
           ========================================================================= */}
        {activeView === 'paper-trading' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <button
              onClick={() => setActiveView('curriculum')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition"
            >
              ← {lang === 'my' ? 'မာတိကာသို့ ပြန်သွားမည်' : 'Back to Learning Menu'}
            </button>
            <PaperTradingSimulator lang={lang} />
          </div>
        )}

        {/* =========================================================================
            VIEW 6: LIVE TRADING READINESS (11-POINT CHECKLIST)
           ========================================================================= */}
        {activeView === 'live-readiness' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <button
              onClick={() => setActiveView('curriculum')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition"
            >
              ← {lang === 'my' ? 'မာတိကာသို့ ပြန်သွားမည်' : 'Back to Learning Menu'}
            </button>
            <LiveTradingPreparation lang={lang} />
          </div>
        )}

        {/* =========================================================================
            VIEW 7: PERFORMANCE ANALYTICS & REVIEW
           ========================================================================= */}
        {activeView === 'performance-analytics' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <button
              onClick={() => setActiveView('curriculum')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition"
            >
              ← {lang === 'my' ? 'မာတိကာသို့ ပြန်သွားမည်' : 'Back to Learning Menu'}
            </button>
            <PerformanceAnalytics lang={lang} />
          </div>
        )}

        {/* =========================================================================
            VIEW 8: TRADER SKILL LEVELS
           ========================================================================= */}
        {activeView === 'skill-levels' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <button
              onClick={() => setActiveView('curriculum')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition"
            >
              ← {lang === 'my' ? 'မာတိကာသို့ ပြန်သွားမည်' : 'Back to Learning Menu'}
            </button>
            <TraderSkillLevels
              completedLessonCount={completedCount}
              totalLessonCount={totalLessonsCount}
              lang={lang}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 9: MAIN CURRICULUM MENU (TOP STATS + 14 VISUAL CARDS)
           ========================================================================= */}
        {activeView === 'curriculum' && (
          <>
            {/* Top Dashboard Progress Strip Demanded by User Prompt */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Overall Progress Card */}
              <div
                className={`p-5 rounded-3xl bg-slate-900 border shadow-xl flex flex-col justify-between transition-all duration-500 ${
                  progressPercentage === 100
                    ? 'border-emerald-500/80 animate-completion-glow'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1 font-bold">
                      {lang === 'my' ? 'တိုးတက်မှု အလုံးစုံ' : 'Overall Progress'}
                    </span>
                    {progressPercentage === 100 && (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 animate-completion-pop">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done</span>
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-mono font-black text-white">
                    {progressPercentage}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {lang === 'my' ? 'ပြီးစီးသော သင်ခန်းစာ:' : 'Lessons Completed:'}{' '}
                    <strong className="text-white font-mono">
                      {completedCount} / {totalLessonsCount}
                    </strong>
                  </div>

                  {/* Est. Time Remaining Based on Reading Speed */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {totalRemainingMinutes > 0 ? (
                          <>
                            <strong className="text-emerald-400 font-mono">
                              ~{totalRemainingMinutes}m
                            </strong>{' '}
                            <span className="text-slate-400">left</span>
                          </>
                        ) : (
                          <span className="text-emerald-400 font-bold">Completed!</span>
                        )}
                      </span>
                    </div>

                    <div className="inline-flex rounded-md bg-slate-950 p-0.5 border border-slate-800 text-[9px] font-mono">
                      {[160, 220, 300].map((w) => (
                        <button
                          key={w}
                          onClick={() => handleSetReadingSpeed(w)}
                          title={`${w} words per minute`}
                          className={`px-1.5 py-0.5 rounded transition ${
                            readingSpeedWpm === w
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 pt-2 border-t border-slate-800">
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercentage === 100
                          ? 'shimmer-progress'
                          : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.max(5, progressPercentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Current Level Card */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1 font-bold">
                    {lang === 'my' ? 'လက်ရှိ Trader အဆင့်' : 'Current Level'}
                  </span>
                  <div className="text-base font-bold text-white flex items-center gap-2 mt-1">
                    <span className="text-xl">{currentSkillRank.badge}</span>
                    <span className="line-clamp-1">{currentSkillRank.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {completedCount} completed milestones
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveView('skill-levels')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>{lang === 'my' ? 'အဆင့် ၈ ဆင့် ကြည့်မည်' : 'View Ladder'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Current Learning Path */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-1 font-bold">
                    {lang === 'my' ? 'လက်ရှိ သင်ယူမှုလမ်းကြောင်း' : 'Current Learning Path'}
                  </span>
                  <div className="text-sm font-bold text-white mt-1">
                    {currentLearningPath}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Structured progression through theory, charts, risk, and simulated execution.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>14 Modules Total</span>
                  <span className="text-emerald-400 font-mono font-bold">Zero Shortcuts</span>
                </div>
              </div>

              {/* Next Lesson & Immediate Continue CTA */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1 font-bold">
                    {lang === 'my' ? '📌 နောက်ထပ် သင်ခန်းစာ' : '📌 Next Lesson'}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-2">
                    {lang === 'my' && nextLessonToStudy.titleMy
                      ? nextLessonToStudy.titleMy
                      : nextLessonToStudy.title}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Sec {nextLessonToStudy.sectionId} • {nextLessonToStudy.number}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenLesson(nextLessonToStudy.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                  >
                    <span>{lang === 'my' ? 'ဆက်လက်လေ့လာမည် →' : 'Continue Learning →'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Topic Search Bar & Popular Terms Pills */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {lang === 'my'
                        ? 'Crypto ခေါင်းစဉ်များ ရှာဖွေပါ (Search Crypto Topics)'
                        : 'Search Crypto Topics & Instant Concepts'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'my'
                      ? 'ဝေါဟာရများ၊ ညွှန်းကိန်းများနှင့် နည်းစနစ်များကို စစ်ဆေးပါ (Definition + Visual + Example + Related Lessons)'
                      : 'Instant definition, visual diagram, example, and linked masterclass lessons'}
                  </p>
                </div>

                <div className="relative min-w-[280px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'my'
                        ? 'Search crypto topics (RSI, Leverage, FVG...)'
                        : 'Search crypto topics (RSI, Leverage, FVG...)'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Popular Search Terms Quick Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {lang === 'my' ? 'အမေးများသော ဝေါဟာရများ:' : 'Popular terms:'}
                </span>
                {POPULAR_SEARCH_TERMS.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleOpenGlossaryForTerm(term)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition whitespace-nowrap"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* 14 Large Visual Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {lang === 'my'
                      ? 'သင်ခန်းစာ ကဏ္ဍကြီး ၁၄ ခု (14 Visual Learning Sections)'
                      : 'The 14 Master Learning Sections'}
                  </h2>
                </div>

                {/* Level Tabs filter */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {['All', 'beginner', 'intermediate', 'advanced', 'practical'].map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedLevel(path === 'All' ? 'All' : path)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                        (selectedLevel === 'All' && path === 'All') || selectedLevel === path
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {path}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSections.map((section) => {
                  const sectionLessons = allLessons.filter(
                    (l) => l.sectionId === section.id
                  );
                  const sectionCompletedCount = sectionLessons.filter((l) =>
                    completedLessonIds.includes(l.id)
                  ).length;
                  const secPct = sectionLessons.length > 0
                    ? Math.round((sectionCompletedCount / sectionLessons.length) * 100)
                    : 0;
                  const secRemainingMins = sectionLessons
                    .filter((l) => !completedLessonIds.includes(l.id))
                    .reduce((acc, l) => acc + getCryptoLessonEstimatedMinutes(l), 0);

                  return (
                    <div
                      key={section.id}
                      className={`p-5 rounded-3xl bg-slate-900 border transition-all flex flex-col justify-between shadow-lg group relative overflow-hidden ${
                        secPct === 100
                          ? 'border-emerald-500/70 shadow-emerald-500/10 animate-completion-glow'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header: Icon + Number + Path + Progress % */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`text-2xl p-2 rounded-2xl bg-slate-950 border border-slate-800 transition-transform ${
                                secPct === 100 ? 'animate-completion-pop' : ''
                              }`}
                            >
                              {section.icon}
                            </span>
                            <div>
                              <span className="text-[10px] font-mono font-bold text-amber-400 block">
                                SECTION {section.id}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 uppercase">
                                {section.path || 'CORE'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            {secPct === 100 ? (
                              <span className="flex items-center justify-end gap-1 text-xs font-mono font-bold text-emerald-400 animate-completion-pop">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>100% Mastered</span>
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-bold text-white block">
                                Progress: {secPct}%
                              </span>
                            )}
                            <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
                              <span>
                                {sectionCompletedCount}/{sectionLessons.length || section.lessonCount} done
                              </span>
                              {secPct < 100 && secRemainingMins > 0 && (
                                <span className="text-amber-400 font-mono">
                                  (~{secRemainingMins}m left)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className={`text-base font-bold transition ${
                            secPct === 100 ? 'text-emerald-300' : 'text-white group-hover:text-amber-300'
                          }`}
                        >
                          {lang === 'my' && section.titleMy ? section.titleMy : section.title}
                        </h3>

                        {/* Short Description */}
                        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {lang === 'my' && section.shortDescMy
                            ? section.shortDescMy
                            : section.shortDesc}
                        </p>

                        {/* Progress Bar for Card */}
                        <div className="mt-3 w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                          <div
                            className={`h-full transition-all duration-500 ${
                              secPct === 100 ? 'shimmer-progress' : 'bg-amber-500'
                            }`}
                            style={{ width: `${secPct}%` }}
                          />
                        </div>

                        {/* Lessons Preview List */}
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1">
                          {sectionLessons.slice(0, 3).map((l) => {
                            const done = completedLessonIds.includes(l.id);
                            return (
                              <button
                                key={l.id}
                                onClick={() => handleOpenLesson(l.id)}
                                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800/60 transition flex items-center justify-between text-xs text-slate-300 hover:text-white"
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 transition-transform ${
                                      done
                                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-completion-pop'
                                        : 'bg-slate-600'
                                    }`}
                                  />
                                  <span
                                    className={`truncate text-[11px] ${
                                      done ? 'text-emerald-300 font-semibold' : ''
                                    }`}
                                  >
                                    {l.number}. {lang === 'my' && l.titleMy ? l.titleMy : l.title}
                                  </span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Section Launchers */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        {/* Dedicated Interactive Button based on section */}
                        {section.id === 2 && (
                          <button
                            onClick={() => setActiveView('scam-simulator')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Spot the Scam Lab</span>
                          </button>
                        )}
                        {section.id === 7 && (
                          <button
                            onClick={() => setActiveView('risk-calculator')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Risk Calculator</span>
                          </button>
                        )}
                        {section.id === 8 && (
                          <button
                            onClick={() => handleOpenGlossaryForTerm('Tokenomics')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Tokenomics Radar</span>
                          </button>
                        )}
                        {section.id === 10 && (
                          <button
                            onClick={() => setActiveView('strategy-builder')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>10-Step Builder</span>
                          </button>
                        )}
                        {section.id === 11 && (
                          <button
                            onClick={() => setActiveView('paper-trading')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>$100k Simulator</span>
                          </button>
                        )}
                        {section.id === 12 && (
                          <button
                            onClick={() => setActiveView('live-readiness')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>11-pt Checklist</span>
                          </button>
                        )}
                        {section.id === 13 && (
                          <button
                            onClick={() => setActiveView('performance-analytics')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                            <span>Analytics Hub</span>
                          </button>
                        )}
                        {section.id === 14 && (
                          <button
                            onClick={() => setActiveView('skill-levels')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Skill Ladder</span>
                          </button>
                        )}

                        {/* Open first lesson */}
                        {sectionLessons.length > 0 && (
                          <button
                            onClick={() => handleOpenLesson(sectionLessons[0].id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 ml-auto"
                          >
                            <span>{lang === 'my' ? 'လေ့လာမည်' : 'View Lessons'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Glossary Search Modal */}
      <GlossarySearchModal
        isOpen={isGlossaryOpen}
        onClose={() => {
          setIsGlossaryOpen(false);
          setInitialGlossaryTerm(undefined);
        }}
        initialQuery={initialGlossaryTerm}
        onSelectLesson={(lessonId) => handleOpenLesson(lessonId)}
        lang={lang}
      />
    </div>
  );
};
