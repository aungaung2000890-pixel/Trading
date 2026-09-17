import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Calendar,
  Save,
  CheckCircle2,
  PieChart,
  Target,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { PaperTrade } from './PaperTradingSimulator';

const STORAGE_KEY_TRADES = 'crypto_learning_paper_trades_v1';
const STORAGE_KEY_JOURNAL = 'crypto_learning_monthly_journal_v1';

interface MonthlyReviewJournal {
  whatWorked: string;
  whatFailed: string;
  bestSetups: string;
  biggestMistakeSource: string;
  ruleAdherenceRating: number; // 1 to 5
  nextMonthFocus: string;
  lastUpdated: number;
}

export const PerformanceAnalytics: React.FC<{ lang: 'my' | 'en' }> = ({ lang }) => {
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [journal, setJournal] = useState<MonthlyReviewJournal>({
    whatWorked: 'Waiting for 15m candle closes instead of jumping into unconfirmed breakouts.',
    whatFailed: 'Taking revenge trades after 9 PM when exhausted; widening stop-loss on ETH.',
    bestSetups: '4H Support Pullbacks and Range High/Low Sweeps.',
    biggestMistakeSource: 'FOMO entries during fast green candles and oversized leverage.',
    ruleAdherenceRating: 4,
    nextMonthFocus: 'Strict 1% max account risk, mandatory 1:2.5 minimum R:R on every trade.',
    lastUpdated: Date.now(),
  });
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load trades and journal
  useEffect(() => {
    try {
      const savedTrades = localStorage.getItem(STORAGE_KEY_TRADES);
      if (savedTrades) {
        setTrades(JSON.parse(savedTrades));
      }
      const savedJournal = localStorage.getItem(STORAGE_KEY_JOURNAL);
      if (savedJournal) {
        setJournal(JSON.parse(savedJournal));
      }
    } catch {
      // fallback
    }
  }, []);

  const closedTrades = useMemo(() => trades.filter((t) => t.status === 'CLOSED'), [trades]);

  // Compute key metrics
  const totalTrades = closedTrades.length;
  const wins = closedTrades.filter((t) => (t.realizedPnlUsd || 0) > 0);
  const losses = closedTrades.filter((t) => (t.realizedPnlUsd || 0) < 0);

  const winCount = wins.length;
  const lossCount = losses.length;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const lossRate = totalTrades > 0 ? (lossCount / totalTrades) * 100 : 0;

  const totalWinDollar = wins.reduce((acc, t) => acc + (t.realizedPnlUsd || 0), 0);
  const totalLossDollar = Math.abs(losses.reduce((acc, t) => acc + (t.realizedPnlUsd || 0), 0));

  const avgWin = winCount > 0 ? totalWinDollar / winCount : 0;
  const avgLoss = lossCount > 0 ? totalLossDollar / lossCount : 0;

  const profitFactor = totalLossDollar > 0 ? totalWinDollar / totalLossDollar : totalWinDollar > 0 ? 99 : 0;
  const expectancy = totalTrades > 0 ? (totalWinDollar - totalLossDollar) / totalTrades : 0;

  // Max Drawdown estimation
  const maxDrawdownUsd = useMemo(() => {
    let peak = 0;
    let balance = 0;
    let maxDd = 0;
    closedTrades.forEach((t) => {
      balance += t.realizedPnlUsd || 0;
      if (balance > peak) peak = balance;
      const dd = peak - balance;
      if (dd > maxDd) maxDd = dd;
    });
    return maxDd;
  }, [closedTrades]);

  // Best / Worst Setup
  const setupPerformance = useMemo(() => {
    const stats: Record<string, { count: number; wins: number; pnl: number }> = {};
    closedTrades.forEach((t) => {
      const tag = t.setupTag || 'General';
      if (!stats[tag]) stats[tag] = { count: 0, wins: 0, pnl: 0 };
      stats[tag].count++;
      if ((t.realizedPnlUsd || 0) > 0) stats[tag].wins++;
      stats[tag].pnl += t.realizedPnlUsd || 0;
    });
    return Object.entries(stats).sort((a, b) => b[1].pnl - a[1].pnl);
  }, [closedTrades]);

  const bestSetup = setupPerformance.length > 0 ? setupPerformance[0][0] : 'None logged yet';
  const worstSetup = setupPerformance.length > 1 ? setupPerformance[setupPerformance.length - 1][0] : 'None logged yet';

  // Save journal
  const handleSaveJournal = () => {
    const updated = { ...journal, lastUpdated: Date.now() };
    setJournal(updated);
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/20 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <BarChart2 className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              {lang === 'my' ? 'ကုန်သွယ်မှု စွမ်းဆောင်ရည် စစ်တမ်း & လစဉ်သုံးသပ်ချက်' : 'Performance Analytics & Monthly Review'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            {lang === 'my'
              ? 'ကိန်းဂဏန်းများသည် မုသားမပြောပါ။ Win Rate၊ Profit Factor၊ ပျမ်းမျှအမြတ်/အရှုံးနှင့် မိမိ၏ အမှားများကို စနစ်တကျ ပြန်လည်စစ်ဆေးပါ။'
              : 'Data never lies. Track your Win Rate, Profit Factor, Expectancy, and review your monthly trading journal.'}
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700">
          Sample Base: <strong className="text-white">{totalTrades} Closed Trades</strong>
        </div>
      </div>

      {/* Primary Mathematical KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Win Rate */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            {lang === 'my' ? 'အနိုင်ရနှုန်း (Win Rate)' : 'Win Rate'}
          </span>
          <div className="text-xl font-mono font-black text-emerald-400">
            {winRate.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500">
            {winCount} Wins / {lossCount} Losses
          </span>
        </div>

        {/* Profit Factor */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            {lang === 'my' ? 'အမြတ်အချိုး (Profit Factor)' : 'Profit Factor'}
          </span>
          <div className={`text-xl font-mono font-black ${profitFactor >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {profitFactor.toFixed(2)}x
          </div>
          <span className="text-[10px] text-slate-500">
            {profitFactor >= 1.5 ? 'Strong Edge (Gross W / L)' : 'Needs Improvement'}
          </span>
        </div>

        {/* Expectancy */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            {lang === 'my' ? 'ပျမ်းမျှ ရလဒ် (Expectancy)' : 'Expectancy / Trade'}
          </span>
          <div className={`text-xl font-mono font-black ${expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {expectancy >= 0 ? '+' : ''}${expectancy.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">
            Average net per setup
          </span>
        </div>

        {/* Max Drawdown */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            {lang === 'my' ? 'အများဆုံးကျဆင်းမှု (Max Drawdown)' : 'Max Drawdown'}
          </span>
          <div className="text-xl font-mono font-black text-rose-400">
            -${maxDrawdownUsd.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">
            Peak to trough loss
          </span>
        </div>
      </div>

      {/* Secondary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Setup Breakdown */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span>{lang === 'my' ? 'မဟာဗျူဟာအလိုက် စွမ်းဆောင်ရည်' : 'Setup Edge Breakdown'}</span>
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">Best Performing Setup:</span>
              <span className="font-bold text-emerald-400">{bestSetup}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">Worst Performing Setup:</span>
              <span className="font-bold text-rose-400">{worstSetup}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">Average Win vs Average Loss:</span>
              <span className="font-mono text-slate-200">
                <span className="text-emerald-400">+${avgWin.toFixed(0)}</span> /{' '}
                <span className="text-rose-400">-${avgLoss.toFixed(0)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Golden Rule Reminder */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'my' ? 'သင်္ချာနည်းကျ အမှန်တရား' : 'Mathematical Reality'}</span>
          </h3>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <p>
              {lang === 'my'
                ? 'Trader တစ်ဦးသည် ၄၀% သာ အနိုင်ရရှိသော်လည်း Risk/Reward အချိုးကို ၁:၂.၅ သတ်မှတ်ထားပါက ရေရှည်တွင် အမြတ်ထွက်နိုင်သည်။ ဆန့်ကျင်ဘက်အားဖြင့် Win Rate ၈၀% ရှိသော်လည်း Stop Loss မသုံးပါက တစ်ကြိမ်တည်းဖြင့် အကောင့်ပြုတ်ထွက်နိုင်သည်။'
                : 'A trader with only a 40% win rate can be highly profitable if their average winner is 2.5x their average loser. Conversely, an 80% win rate trader who ignores stop losses can be wiped out on a single catastrophic trade.'}
            </p>
          </div>

          <div className="text-[11px] text-amber-400/90 font-mono">
            Formula: Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)
          </div>
        </div>
      </div>

      {/* Monthly Self-Review Questionnaire & Journal */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'my' ? 'လစဉ် ကိုယ်တိုင်သုံးသပ်ချက် ဂျာနယ်' : 'Monthly Self-Review Journal & Audit'}
            </h3>
          </div>

          <button
            onClick={handleSaveJournal}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
          >
            {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? (lang === 'my' ? 'သိမ်းဆည်းပြီး ✅' : 'Saved!') : (lang === 'my' ? 'ဂျာနယ်သိမ်းမည်' : 'Save Review')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question 1: What worked */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-400 block">
              {lang === 'my' ? '၁။ ဤလတွင် မည်သည့်အရာများ ကောင်းမွန်စွာ အလုပ်လုပ်ခဲ့သနည်း?' : '1. What worked well this month?'}
            </label>
            <textarea
              rows={2}
              value={journal.whatWorked}
              onChange={(e) => setJournal({ ...journal, whatWorked: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Question 2: What failed */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-rose-400 block">
              {lang === 'my' ? '၂။ မည်သည့်အရာများ မအောင်မြင်ခဲ့သနည်း (အရှုံးများ ဖြစ်ပေါ်စေခဲ့သနည်း)?' : '2. What didn’t work or caused losses?'}
            </label>
            <textarea
              rows={2}
              value={journal.whatFailed}
              onChange={(e) => setJournal({ ...journal, whatFailed: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Question 3: Biggest Mistake Source */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-amber-400 block">
              {lang === 'my' ? '၃။ အဓိကအမှားများသည် မည်သည့်အရာကြောင့် ဖြစ်ခဲ့သနည်း (FOMO, Stop Loss ရွှေ့ခြင်း စသည်)?' : '3. Primary source of errors (FOMO, moving SL, oversize)?'}
            </label>
            <textarea
              rows={2}
              value={journal.biggestMistakeSource}
              onChange={(e) => setJournal({ ...journal, biggestMistakeSource: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Question 4: Next Month Focus */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-indigo-400 block">
              {lang === 'my' ? '၄။ နောက်လတွင် အဓိကအာရုံစိုက် ပြုပြင်မည့် စည်းကမ်းချက်:' : '4. Focus rule for next month:'}
            </label>
            <textarea
              rows={2}
              value={journal.nextMonthFocus}
              onChange={(e) => setJournal({ ...journal, nextMonthFocus: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
