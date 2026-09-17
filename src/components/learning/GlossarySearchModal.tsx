import React, { useState, useEffect, useMemo } from 'react';
import { CRYPTO_GLOSSARY } from '../../data/learningGlossary';
import { GlossaryItem } from '../../types/learning';
import { Search, X, BookOpen, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

interface GlossarySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson?: (lessonId: string) => void;
  lang: 'my' | 'en';
  initialQuery?: string;
}

export const GlossarySearchModal: React.FC<GlossarySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLesson,
  lang,
  initialQuery,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GlossaryItem | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
      const match = CRYPTO_GLOSSARY.find(
        (g) => g.term.toLowerCase() === initialQuery.toLowerCase()
      );
      if (match) {
        setActiveItem(match);
      }
    }
  }, [initialQuery]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(CRYPTO_GLOSSARY.map((g) => g.category)));
    return ['All', ...cats];
  }, []);

  const filteredItems = useMemo(() => {
    return CRYPTO_GLOSSARY.filter((item) => {
      const matchCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const termMatch =
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.termMy && item.termMy.includes(searchTerm)) ||
        (item.definitionMy && item.definitionMy.includes(searchTerm));
      return matchCat && termMatch;
    });
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {lang === 'my' ? 'Crypto ဝေါဟာရ အဘိဓာန်' : 'Crypto Terms Glossary'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'my'
                  ? 'အရေးကြီးသော နည်းပညာနှင့် ကုန်သွယ်မှုဆိုင်ရာ စကားလုံးများကို ရှာဖွေပါ'
                  : 'Search essential crypto, indicator, and market concepts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input and Categories */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                lang === 'my'
                  ? 'ဥပမာ: Bitcoin, RSI, Leverage, FVG, Order Block, Liquidity...'
                  : 'Search terms: Bitcoin, RSI, Leverage, FVG, Order Block...'
              }
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition text-[11px] ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {lang === 'my'
                ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော စကားလုံး မတွေ့ရှိပါ'
                : 'No terms found matching your query.'}
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = activeItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`pt-3 first:pt-0 rounded-xl transition ${
                    isSelected ? 'bg-slate-800/40 p-3' : 'hover:bg-slate-800/20 p-2'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-amber-400">
                          {lang === 'my' && item.termMy ? item.termMy : item.term}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                        {lang === 'my' && item.definitionMy
                          ? item.definitionMy
                          : item.definition}
                      </p>
                    </div>

                    {item.relatedLessonId && onSelectLesson && (
                      <button
                        onClick={() => {
                          onSelectLesson(item.relatedLessonId!);
                          onClose();
                        }}
                        className="shrink-0 p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[10px] font-semibold flex items-center gap-1 border border-indigo-500/30 transition"
                        title="Study related lesson"
                      >
                        <span>{lang === 'my' ? 'သင်ခန်းစာသို့' : 'Lesson'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {item.visualBrief && (
                    <div className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                      💡 {item.visualBrief}
                    </div>
                  )}

                  {item.example && (
                    <p className="mt-1.5 text-[11px] text-amber-300/80 italic">
                      {lang === 'my' && item.exampleMy ? item.exampleMy : item.example}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-500">
          {lang === 'my'
            ? 'ဝေါဟာရ စုစုပေါင်း: ၁၂ ခုကျော် • ပိုမိုသိရှိလိုပါက သက်ဆိုင်ရာ သင်ခန်းစာများကို လေ့လာပါ'
            : 'Crypto Learning Knowledge Base • Click "Lesson" to study full 7-step guide'}
        </div>
      </div>
    </div>
  );
};
