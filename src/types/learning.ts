export type LearningPath = 'beginner' | 'intermediate' | 'advanced' | 'practical';

export interface QuizQuestion {
  id: string;
  question: string;
  questionMy: string;
  options: string[];
  optionsMy: string[];
  correctIndex: number;
  explanation: string;
  explanationMy: string;
}

export type VisualDiagramType =
  | 'blockchain-flow'
  | 'candlestick-anatomy'
  | 'orderbook-ladder'
  | 'support-resistance-breakout'
  | 'trend-hh-hl'
  | 'leverage-multiplier'
  | 'multi-timeframe-ladder'
  | 'risk-waterfall'
  | 'spot-vs-futures'
  | 'hot-vs-cold-wallet'
  | 'indicator-formula'
  | 'fvg-orderblock'
  | 'trading-styles-grid'
  | 'macro-waterfall'
  | 'tokenomics-pie';

export interface Lesson {
  id: string;
  sectionId: number;
  sectionTitle: string;
  sectionTitleMy: string;
  number: string; // e.g. "1.1"
  title: string;
  titleMy: string;
  summary: string;
  summaryMy: string;
  whatIsIt: string;
  whatIsItMy: string;
  whyItMatters: string;
  whyItMattersMy: string;
  visualType: VisualDiagramType;
  visualCaption?: string;
  visualCaptionMy?: string;
  example: string;
  exampleMy: string;
  commonMistake: string;
  commonMistakeMy: string;
  practiceExercise: string;
  practiceExerciseMy: string;
  keyTakeaways: string[];
  keyTakeawaysMy: string[];
  quiz: QuizQuestion[];
}

export interface LearningSection {
  id: number;
  number: number;
  title: string;
  titleMy: string;
  icon: string;
  shortDesc: string;
  shortDescMy: string;
  path: LearningPath;
  lessonCount: number;
  estimatedMinutes: number;
}

export interface ScamScenario {
  id: string;
  title: string;
  titleMy: string;
  category: 'Fake Website' | 'Phishing' | 'Fake App' | 'Fake Token' | 'Rug Pull' | 'Pump & Dump' | 'Fake Investment' | 'Fake Withdrawal Fee' | 'Romance Scam' | 'Fake Support';
  scenarioText: string;
  scenarioTextMy: string;
  simulatedSender: string;
  simulatedMessage: string;
  simulatedUrlOrBadge?: string;
  redFlags: string[];
  redFlagsMy: string[];
  wouldYouTrust: boolean; // false for scams
  detailedExplanation: string;
  detailedExplanationMy: string;
}

export interface SavedStrategy {
  id: string;
  name: string;
  marketCondition: string;
  timeframe: string;
  setup: string;
  confirmation: string;
  entryRules: string;
  stopLossRules: string;
  takeProfitRules: string;
  positionSizeRules: string;
  riskRewardTarget: string;
  exitRules: string;
  notes?: string;
  createdAt: number;
}

export interface PaperTrade {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  amountUsd: number; // position size
  margin: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
  status: 'OPEN' | 'CLOSED';
  pnlUsd?: number;
  pnlPercent?: number;
  rMultiple?: number;
  setup: string;
  timeframe: string;
  mistakes?: string[];
  openedAt: number;
  closedAt?: number;
}

export interface SkillLevelInfo {
  level: number;
  badge: string;
  title: string;
  titleMy: string;
  description: string;
  descriptionMy: string;
  reqLessons: number;
  reqSimTrades: number;
  reqMinWinRate?: number;
}

export interface GlossaryItem {
  id: string;
  term: string;
  termMy: string;
  category: 'Fundamentals' | 'Trading' | 'Technical' | 'Security' | 'On-Chain' | 'Macro';
  definition: string;
  definitionMy: string;
  example: string;
  exampleMy: string;
  visualBrief: string;
  relatedLessonId?: string;
}
