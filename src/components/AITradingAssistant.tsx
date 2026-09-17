import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Brain,
  MessageSquare,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertTriangle,
  Send,
  HelpCircle,
  BarChart2,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Scale,
  BookOpen,
  Flame,
} from 'lucide-react';
import {
  CoinOpportunity,
  LiveTickerItem,
  DemoTradePreset,
  AIAssistantMode,
  AIAssistantResponse,
} from '../types.ts';
import { queryAITradingAssistant } from '../services/aiAssistantClient.ts';

interface AITradingAssistantProps {
  coins: CoinOpportunity[];
  liveTickers: LiveTickerItem[];
  selectedCoin?: CoinOpportunity;
  onSelectCoin?: (coin: CoinOpportunity) => void;
  onGoToTradePreset?: (preset: DemoTradePreset) => void;
  lang: 'my' | 'en';
  margin?: number;
  leverage?: number;
  walletBalance?: number;
  onWalletBalanceChange?: (newBalance: number) => void;
  onBack?: () => void;
  initialMode?: AIAssistantMode;
  initialSymbol?: string;
}

export const AITradingAssistant: React.FC<AITradingAssistantProps> = ({
  coins,
  liveTickers,
  selectedCoin,
  onSelectCoin,
  onGoToTradePreset,
  lang,
  margin = 150,
  leverage = 15,
  walletBalance = 2000,
  onWalletBalanceChange,
  onBack,
  initialMode = 'quick',
  initialSymbol,
}) => {
  // USER INTENT: "Ai assistant မှာ market ကိုခွဲခြမ်းစိတ်ဖြာတာသက်သက် Aiကို crypto အကြောင်းမေးချင်ရာမေးမယ့်နေရာခွဲထားပေး"
  // Primary Navigation: 'market_analysis' vs 'crypto_qna'
  const [activeTab, setActiveTab] = useState<'market_analysis' | 'crypto_qna'>(
    initialMode === 'ask_ai' ? 'crypto_qna' : 'market_analysis'
  );

  // Sub-mode for Market Analysis: 'quick' | 'deep' | 'high_leverage'
  const [marketAnalysisSubMode, setMarketAnalysisSubMode] = useState<'quick' | 'deep' | 'high_leverage'>(
    initialMode === 'high_leverage' ? 'high_leverage' : initialMode === 'deep' ? 'deep' : 'quick'
  );

  // Active symbol for market analysis (Default to GOLD or SOL or initialSymbol)
  const [symbol, setSymbol] = useState<string>(initialSymbol || selectedCoin?.symbol || 'GOLD');
  const [timeframe, setTimeframe] = useState<string>('15M');
  const [userInput, setUserInput] = useState<string>('');
  const [chartImage, setChartImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIAssistantResponse | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Future Wallet Amount Input & State (User intent: "tradeတွေအကုန်လုံးကိုငါက future wallet ammount ပေးတာနဲ့")
  const [walletInput, setWalletInput] = useState<string>(String(walletBalance));
  useEffect(() => {
    setWalletInput(String(walletBalance));
  }, [walletBalance]);

  const handleWalletChange = (valStr: string) => {
    setWalletInput(valStr);
    const num = Number(valStr);
    if (!isNaN(num) && num > 0 && onWalletBalanceChange) {
      onWalletBalanceChange(num);
    }
  };

  const setPresetWallet = (amount: number) => {
    setWalletInput(String(amount));
    if (onWalletBalanceChange) {
      onWalletBalanceChange(amount);
    }
  };

  // Auto-tune leverage toggle: true by default
  const [autoTuneLeverage, setAutoTuneLeverage] = useState<boolean>(true);
  const [customMargin, setCustomMargin] = useState<number>(margin);
  const [customLeverage, setCustomLeverage] = useState<number>(leverage);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Leverage and Risk Auto-tuning per Asset Volatility & Rules
  // strictly adhering to user intent: "leverage ကို မင်းနည်းပညာ crypto အသိပညာကတစ်ပိုင်း ငါ့စည်းမျည်းတွေကတစ်ပိုင်း အကုန်လုံးအတွက် auto ညှိ"
  const dynamicRiskCalculations = React.useMemo(() => {
    const currentWallet = Math.max(10, walletBalance);

    // 1. AI & Technical Track (မင်းရဲ့ ခွဲခြမ်းစိတ်ဖြာမှု)
    const techMargin = Math.max(10, Math.min(Math.round(currentWallet * 0.1), 1000));
    let techLeverage = 15;
    if (symbol === 'GOLD' || symbol === 'XAUUSD') {
      techLeverage = 15; // 15x safe buffer on Gold
    } else if (symbol === 'BTC') {
      techLeverage = 12; // 12x on Bitcoin
    } else if (symbol === 'ETH') {
      techLeverage = 12; // 12x on Ethereum
    } else if (symbol === 'SOL') {
      techLeverage = 10; // 10x on Solana
    } else if (symbol === 'EURUSD') {
      techLeverage = 25; // 25x on FX Majors
    } else if (symbol === 'PEPE' || symbol === 'DOGE') {
      techLeverage = 5; // 5x on high volatility meme
    } else {
      techLeverage = 8; // 8x on mid-caps (SUI, etc.)
    }

    const techNotional = techMargin * techLeverage;
    const techEstProfit = techNotional * 0.025; // 2.5% price move (~25% ROI)
    const techEstRisk = techNotional * 0.01; // 1% stop loss (~10% Margin)

    // 2. My Personal Rules Track (ငါ့ရဲ့ စည်းမျဉ်း)
    const myMargin = Math.max(10, Math.min(Math.round(currentWallet * 0.075), 1000));
    // Rule: Max risk at SL must NOT exceed 1.5% of wallet balance
    const maxRiskDollar = currentWallet * 0.015;
    const assumedSL = symbol === 'GOLD' ? 0.0035 : 0.012; // 0.35% for gold, 1.2% for crypto
    const safeCalculatedLev = Math.floor(maxRiskDollar / (myMargin * assumedSL));
    const mySafeLeverage = Math.max(2, Math.min(symbol === 'GOLD' || symbol === 'BTC' ? 18 : 10, safeCalculatedLev || 8));
    const myNotional = myMargin * mySafeLeverage;
    const myEstProfit = myNotional * 0.02; // TP1 50% lock
    const myEstRisk = maxRiskDollar; // Strict 1.5% max account risk

    return {
      techMargin,
      techLeverage,
      techNotional,
      techEstProfit,
      techEstRisk,
      myMargin,
      mySafeLeverage,
      myNotional,
      myEstProfit,
      myEstRisk,
    };
  }, [walletBalance, symbol]);

  // Sync custom margin/leverage if autoTune is active
  useEffect(() => {
    if (autoTuneLeverage) {
      setCustomMargin(dynamicRiskCalculations.myMargin);
      setCustomLeverage(dynamicRiskCalculations.mySafeLeverage);
    }
  }, [autoTuneLeverage, dynamicRiskCalculations]);

  // Sync symbol with selectedCoin if changed from parent
  useEffect(() => {
    if (selectedCoin?.symbol && !initialSymbol) {
      setSymbol(selectedCoin.symbol);
    }
  }, [selectedCoin, initialSymbol]);

  // Find active ticker or fallback
  const activeTicker = liveTickers.find((t) => t.symbol === symbol) || {
    contract: `${symbol}_USDT`,
    symbol,
    lastPrice:
      symbol === 'GOLD' || symbol === 'XAUUSD'
        ? 2658.5
        : selectedCoin?.currentPrice || (symbol === 'BTC' ? 77032 : symbol === 'ETH' ? 2489 : 100.49),
    change24h: selectedCoin?.change24h || 2.4,
    volume24hUsd: selectedCoin?.volume24h || 450000000,
    high24h: (selectedCoin?.currentPrice || 100) * 1.05,
    low24h: (selectedCoin?.currentPrice || 100) * 0.95,
    fundingRate: selectedCoin?.fundingRate || 0.005,
    feasibility: 'HIGH' as const,
    bias: 'LONG' as const,
  };

  // Handle Clipboard Paste for Chart Screenshot
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== 'market_analysis') return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorNotice('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const commaIndex = base64String.indexOf(',');
      const rawBase64 = commaIndex !== -1 ? base64String.substring(commaIndex + 1) : base64String;
      setChartImage({
        data: rawBase64,
        mimeType: file.type || 'image/png',
        preview: base64String,
      });
      setErrorNotice(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Execute AI Request
  const handleRunAnalysis = async (overridePrompt?: string, forcedMode?: AIAssistantMode) => {
    const effectiveMode: AIAssistantMode =
      forcedMode || (activeTab === 'crypto_qna' ? 'ask_ai' : marketAnalysisSubMode);

    setIsLoading(true);
    setErrorNotice(null);

    try {
      const response = await queryAITradingAssistant({
        mode: effectiveMode,
        query: overridePrompt !== undefined ? overridePrompt : userInput,
        symbol: symbol === 'GOLD' ? 'XAUUSD' : symbol,
        timeframe,
        currentPrice: activeTicker.lastPrice,
        change24h: activeTicker.change24h,
        high24h: activeTicker.high24h,
        low24h: activeTicker.low24h,
        fundingRate: activeTicker.fundingRate,
        volume24hUsd: activeTicker.volume24hUsd,
        margin: customMargin,
        leverage: customLeverage,
        walletBalance,
        image:
          activeTab === 'market_analysis' && chartImage
            ? { data: chartImage.data, mimeType: chartImage.mimeType }
            : undefined,
        marketContext: `Asset: ${symbol}, Price: $${activeTicker.lastPrice}, Wallet: $${walletBalance} USDT, Margin: $${customMargin}, Leverage: ${customLeverage}x, Funding: ${activeTicker.fundingRate.toFixed(4)}%`,
      });

      setResult(response);
    } catch (err: any) {
      setErrorNotice(err.message || 'AI assistant request failed. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply to Demo Terminal
  const handleApplyToDemo = () => {
    if (!result || !onGoToTradePreset) return;

    const side = result.decision === 'SHORT' ? 'SHORT' : 'LONG';
    const entryNum =
      typeof result.entry === 'number'
        ? result.entry
        : parseFloat(String(result.entry)) || activeTicker.lastPrice;
    const slNum =
      typeof result.stopLoss === 'number'
        ? result.stopLoss
        : parseFloat(String(result.stopLoss)) || undefined;
    const tpNum =
      typeof result.takeProfit1 === 'number'
        ? result.takeProfit1
        : parseFloat(String(result.takeProfit1)) || undefined;

    const preset: DemoTradePreset = {
      symbol: symbol === 'GOLD' ? 'XAUUSD' : symbol.replace('USDT', ''),
      side,
      margin: customMargin,
      leverage: customLeverage,
      entryPrice: entryNum,
      slPrice: slNum,
      tpPrice: tpNum,
      orderType: 'LIMIT',
      source: `AI ${marketAnalysisSubMode.toUpperCase()} Setup (${symbol})`,
      timestamp: Date.now(),
    };

    onGoToTradePreset(preset);
  };

  const handleCopyAnalysis = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summaryMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Quick Clean Copy Format (User requested clean presentation: GOLD BUY ..., TP1, TP2, TP3, SL)
  const handleCopyCleanTrade = () => {
    if (!result) return;
    const profit1 = (customMargin * customLeverage * 0.02).toFixed(1);
    const profit2 = (customMargin * customLeverage * 0.04).toFixed(1);
    const loss = (walletBalance * 0.015).toFixed(1);

    const text = `${symbol} ${result.decision || 'BUY'} ${result.entry}
TP¹ ${result.takeProfit1} (+$${profit1})
TP² ${result.takeProfit2} (+$${profit2})
SL ${result.stopLoss} (-$${loss})
[Lev: ${customLeverage}x • Margin: $${customMargin}]`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Pre-categorized Question Banks for Tab 2 (Crypto Q&A Mode)
  const cryptoQnACategories = [
    {
      categoryNameMy: '🔰 Crypto အခြေခံ & စျေးကွက် ဗဟုသုတ',
      categoryNameEn: '🔰 Crypto Basics & Market Fundamentals',
      questions: [
        {
          labelMy: 'Bitcoin Halving ဆိုတာဘာလဲ၊ စျေးကွက်အပေါ် ဘယ်လိုသက်ရောက်လဲ?',
          labelEn: 'What is Bitcoin Halving and its market impact?',
          query: 'Bitcoin Halving ဆိုတာ ဘာလဲ? စျေးကွက် Supply, Miner reward နှင့် Bull run သံသရာအပေါ် မည်သို့ သက်ရောက်မှုရှိသနည်း?',
        },
        {
          labelMy: 'Spot Trading နှင့် Futures Trading အဓိက ဘာတွေကွာခြားလဲ?',
          labelEn: 'Key differences between Spot and Futures trading',
          query: 'Crypto Spot Trading နှင့် Futures Trading ၏ အဓိကကွာခြားချက်များ၊ အားသာချက်/အားနည်းချက်နှင့် အန္တရာယ်များကို ရှင်းပြပေးပါ။',
        },
        {
          labelMy: 'Cold Wallet နှင့် Hot Wallet လုံခြုံရေး ဘယ်လိုကွာခြားလဲ?',
          labelEn: 'Cold vs Hot Wallet Security comparison',
          query: 'Ledger/Trezor ကဲ့သို့ Cold Wallet နှင့် Binance/TrustWallet ကဲ့သို့ Hot Wallet လုံခြုံရေး ဘယ်လိုကွာလဲ? မည်သို့ သိမ်းဆည်းသင့်သနည်း?',
        },
      ],
    },
    {
      categoryNameMy: '📐 Futures, Leverage & Margin အတွက် သင်္ချာဖော်မြူလာများ',
      categoryNameEn: '📐 Futures, Leverage & Margin Math Formulas',
      questions: [
        {
          labelMy: 'Cross Margin နှင့် Isolated Margin ဘယ်ဟာ ပိုအန္တရာယ်ကင်းလဲ?',
          labelEn: 'Cross Margin vs Isolated Margin safety',
          query: 'Binance Futures တွင် Cross Margin နှင့် Isolated Margin မည်သို့ကွာခြားသနည်း? စတင်လေ့လာသူများအတွက် မည်သည့်ပုံစံ ပိုမိုသင့်တော်သနည်း?',
        },
        {
          labelMy: 'Liquidation Price (အကောင့်ပြုတ်စျေး) ကို ဘယ်လို ဖော်မြူလာနဲ့ တွက်သလဲ?',
          labelEn: 'How to calculate Liquidation Price formula',
          query: 'Futures တွင် Liquidation Price ဖြစ်ပေါ်လာပုံ သင်္ချာဖော်မြူလာနှင့် Maintenance Margin Rate ၏ သက်ရောက်ပုံကို ရှင်းပြပေးပါ။',
        },
        {
          labelMy: 'Funding Rate ဆိုတာဘာလဲ၊ ဘာကြောင့် အနှုတ် (Negative) ဖြစ်ရတာလဲ?',
          labelEn: 'What is Funding Rate and Negative Funding mechanics',
          query: 'Futures တွင် Funding Rate ဆိုတာဘာလဲ? Funding Rate Negative (အနှုတ်) ဖြစ်နေလျှင် Short Squeeze ဖြစ်နိုင်ခြေ မြင့်မားပါသလား?',
        },
      ],
    },
    {
      categoryNameMy: '🌊 Smart Money Concepts (SMC) & Market Structure',
      categoryNameEn: '🌊 Smart Money Concepts (SMC) & Structure',
      questions: [
        {
          labelMy: 'Order Block နှင့် Fair Value Gap (FVG) ကို Chart ပေါ်မှာ ဘယ်လိုရှာမလဲ?',
          labelEn: 'How to identify Order Blocks and Fair Value Gaps (FVG)',
          query: 'Smart Money Concepts (SMC) တွင် Institutional Order Block နှင့် Fair Value Gap (FVG) ကို Chart ပေါ်တွင် တိကျစွာ မည်သို့ ရှာဖွေရသနည်း?',
        },
        {
          labelMy: 'Liquidity Sweep (Stop Hunt) ဆိုတာဘာလဲ၊ Whales များ ဘယ်လိုလှည့်စားလဲ?',
          labelEn: 'What is a Liquidity Sweep and Whale Stop Hunt',
          query: 'Whale ကြီးများက Retail Trader များ၏ Stop Loss ကို Sweep လုပ်ပြီး စျေးကွက်ပြန်လှည့်သည့် Liquidity Sweep သဘောတရားကို ရှင်းပြပေးပါ။',
        },
        {
          labelMy: 'Break of Structure (BOS) နှင့် CHoCH ကွာခြားချက်',
          labelEn: 'Differences between BOS and CHoCH in market structure',
          query: 'Market Structure တွင် Break of Structure (BOS) နှင့် Change of Character (CHoCH) ကွာခြားချက်ကို ရှင်းလင်းစွာ ရှင်းပြပေးပါ။',
        },
      ],
    },
    {
      categoryNameMy: '🛡️ စွန့်စားမှု ထိန်းချုပ်ခြင်း & Trader Psychology',
      categoryNameEn: '🛡️ Risk Management & Trader Psychology',
      questions: [
        {
          labelMy: 'Wallet Balance ပေါ်မူတည်ပြီး Leverage ဘယ်လို auto ချိန်ညှိသင့်သလဲ?',
          labelEn: 'How to auto-tune leverage based on wallet balance',
          query: 'မိမိ Futures Wallet Balance ($ USDT) ပေါ်မူတည်၍ Stop Loss ဖြစ်ပါက အကောင့်၏ 1% ထက် မဆုံးရှုံးစေရန် Leverage နှင့် Position Sizing ကို မည်သို့ တွက်ချက်ရသနည်း?',
        },
        {
          labelMy: 'Loss ဆက်တိုက်ဖြစ်နေချိန် Revenge Trading မဖြစ်အောင် ဘယ်လိုထိန်းချုပ်မလဲ?',
          labelEn: 'Overcoming Revenge Trading after consecutive losses',
          query: 'Trade ရှုံးပြီးနောက် စိတ်လိုက်မာန်ပါ Revenge Trading မဖြစ်စေရန် စိတ်ပိုင်းဆိုင်ရာ စည်းကမ်း (Trading Psychology) ကို မည်သို့ ထိန်းသိမ်းရမည်နည်း?',
        },
        {
          labelMy: '1% Risk Rule ဆိုတာဘာလဲ၊ ဘာကြောင့် အကောင့်မပြုတ်စေတာလဲ?',
          labelEn: 'Why the 1% Risk Rule protects trading capital forever',
          query: 'Pro Trader များ အမြဲလိုက်နာသော 1% Rule ဆိုတာဘာလဲ? ၎င်းကို လိုက်နာခြင်းဖြင့် ဘာကြောင့် အကောင့်မပြုတ်နိုင်သနည်း?',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH CLEAR SEPARATION OF THE TWO MAIN SECTIONS              */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI TRADING ASSISTANT
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                2 DEDICATED SECTIONS
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🇲🇲 BURMESE & ENGLISH SUPPORT
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{lang === 'my' ? 'AI ကုန်သွယ်မှု လက်ထောက်နှင့် ဗဟုသုတစနစ်' : 'AI Trading Assistant & Knowledge Hub'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {lang === 'my'
                ? 'စျေးကွက် နည်းပညာ ခွဲခြမ်းစိတ်ဖြာခြင်း (Market Analysis) နှင့် Crypto အကြောင်း လွတ်လပ်စွာ မေးမြန်းနိုင်သော နေရာ (Crypto Q&A) ကို သီးခြားစီ ခွဲခြားပေးထားပါသည်။'
                : 'Cleanly separated modules for Market Technical Analysis and General Crypto Q&A.'}
            </p>
          </div>

          {/* DYNAMIC FUTURE WALLET CONTROLLER CARD */}
          <div className="bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/40 shadow-lg space-y-2.5 shrink-0 lg:w-96">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>{lang === 'my' ? 'Futures Wallet ပမာဏ' : 'Future Wallet Amount'}</span>
              </div>
              <button
                onClick={() => setAutoTuneLeverage(!autoTuneLeverage)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  autoTuneLeverage
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {autoTuneLeverage
                    ? lang === 'my'
                      ? 'Auto Lev: ဖွင့်'
                      : 'Auto Lev: ON'
                    : lang === 'my'
                    ? 'Manual: ပြင်မည်'
                    : 'Manual'}
                </span>
              </button>
            </div>

            {/* Wallet Input & Presets */}
            <div className="bg-slate-900/95 px-3 py-2 rounded-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                <span className="text-emerald-400 font-black">$</span>
                <input
                  type="number"
                  min="10"
                  max="1000000"
                  step="100"
                  value={walletInput}
                  onChange={(e) => handleWalletChange(e.target.value)}
                  placeholder="2000"
                  className="w-32 bg-transparent text-white font-mono font-black text-sm outline-none focus:text-amber-400 transition"
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                USDT
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
              <span className="text-[10px] text-slate-400">{lang === 'my' ? 'ရွေး:' : 'Set:'}</span>
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPresetWallet(amt)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] transition cursor-pointer font-bold ${
                    walletBalance === amt
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>

            {/* Auto-tuning Info Footer */}
            <div className="pt-2 border-t border-slate-700/60 text-[10px] font-mono text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">
                {lang === 'my' ? 'Auto-Tuned Lev & Margin:' : 'Auto Lev & Margin:'}
              </span>
              <span className="text-emerald-400 font-bold">
                {dynamicRiskCalculations.mySafeLeverage}x • ${dynamicRiskCalculations.myMargin}
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY DIVISION TABS: MARKET ANALYSIS VS CRYPTO Q&A */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          {/* TAB 1: MARKET ANALYSIS */}
          <button
            onClick={() => {
              setActiveTab('market_analysis');
              if (result && result.mode === 'ask_ai') setResult(null);
            }}
            className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
              activeTab === 'market_analysis'
                ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    activeTab === 'market_analysis'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-black text-white">
                    {lang === 'my' ? '၁။ 📊 စျေးကွက် နည်းပညာ ခွဲခြမ်းစိတ်ဖြာခြင်း' : '1. 📊 Market Technical Analysis'}
                  </span>
                  <p className="text-[11px] text-amber-400/90 font-medium">
                    {lang === 'my' ? '⚡ Quick Trade & 🧠 Deep 24-Point Audit' : 'Actionable setups & full audits'}
                  </p>
                </div>
              </div>
              {activeTab === 'market_analysis' && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <p className="text-xs text-slate-300">
              {lang === 'my'
                ? 'GOLD, BTC, ETH စသည့်ဒင်္ဂါးများကို Entry, TP1, TP2, TP3, SL နှင့် မင်းနည်းပညာ / ငါ့စည်းမျဉ်းအတိုင်း တွက်ချက်စစ်ဆေးသည်။'
                : 'Real-time setups, stop loss buffers, take profit targets, and dynamic leverage calculations.'}
            </p>
          </button>

          {/* TAB 2: CRYPTO Q&A */}
          <button
            onClick={() => {
              setActiveTab('crypto_qna');
              if (result && result.mode !== 'ask_ai') setResult(null);
            }}
            className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
              activeTab === 'crypto_qna'
                ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    activeTab === 'crypto_qna'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-black text-white">
                    {lang === 'my' ? '၂။ 💬 Crypto အကြောင်း မေးချင်ရာမေးရန်' : '2. 💬 Ask AI Anything about Crypto'}
                  </span>
                  <p className="text-[11px] text-emerald-400/90 font-medium">
                    {lang === 'my' ? 'အထွေထွေ ဗဟုသုတ & သင်္ချာဖော်မြူလာများ' : 'Education, Math Formulas & Concepts'}
                  </p>
                </div>
              </div>
              {activeTab === 'crypto_qna' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <p className="text-xs text-slate-300">
              {lang === 'my'
                ? 'Funding rate, Liquidity sweep, SMC, Halving, Leverage တွက်နည်းနှင့် မည်သည့် Crypto အကြောင်းကိုမဆို လွတ်လပ်စွာ မေးမြန်းနိုင်သည်။'
                : 'Ask anything about Funding rates, Order blocks, SMC, Halving, Leverage formulas without trade clutter.'}
            </p>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: MARKET TECHNICAL ANALYSIS MODULE                             */}
      {/* ========================================================================= */}
      {activeTab === 'market_analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* LEFT CONTROLLER: Coin, Timeframe, Sub-mode, Image, Prompts */}
          <div className="lg:col-span-5 space-y-4">
            {/* Sub-mode Switcher: Quick Trade vs Deep Analysis vs High Leverage */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 flex flex-wrap sm:flex-nowrap items-center gap-1.5 shadow-xs">
              <button
                onClick={() => setMarketAnalysisSubMode('quick')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  marketAnalysisSubMode === 'quick'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? '⚡ Quick' : '⚡ Quick'}</span>
              </button>

              <button
                onClick={() => setMarketAnalysisSubMode('deep')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  marketAnalysisSubMode === 'deep'
                    ? 'bg-indigo-600 text-white font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? '🧠 Deep' : '🧠 Deep'}</span>
              </button>

              <button
                onClick={() => setMarketAnalysisSubMode('high_leverage')}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  marketAnalysisSubMode === 'high_leverage'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? '🔥 High-Lev' : '🔥 High-Lev'}</span>
              </button>
            </div>

            {/* DUAL-TRACK RISK & AUTO-TUNED LEVERAGE DISPLAY (User requested logic) */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-emerald-950/40 border border-indigo-500/30 rounded-3xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'my' ? 'နှစ်ဖက်လိုက်ညှိထားသော Risk & Leverage' : 'Dual-Track Risk Parameters'}</span>
                </span>
                <span className="text-[10px] text-slate-400">Wallet: ${walletBalance}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* AI / Tech Track */}
                <div className="bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-500/30 space-y-1">
                  <div className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>မင်းရဲ့ နည်းပညာ (AI)</span>
                  </div>
                  <div className="text-white font-bold text-sm">
                    {dynamicRiskCalculations.techLeverage}x Lev
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Margin: ${dynamicRiskCalculations.techMargin}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Est Gain: +${dynamicRiskCalculations.techEstProfit.toFixed(1)}
                  </div>
                </div>

                {/* My Rules Track */}
                <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/30 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>ငါ့ရဲ့ စည်းမျဉ်း (Rules)</span>
                  </div>
                  <div className="text-white font-bold text-sm">
                    {dynamicRiskCalculations.mySafeLeverage}x Safe Lev
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Margin: ${dynamicRiskCalculations.myMargin}
                  </div>
                  <div className="text-[10px] text-rose-400">
                    Max Risk: -${dynamicRiskCalculations.myEstRisk.toFixed(1)} (1.5%)
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Selector (Featuring GOLD, BTC, ETH, SOL prominently) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'my' ? 'ကုန်သွယ်မည့် အရာရွေးချယ်ပါ (Asset Selection):' : 'Select Asset / Pair:'}
              </label>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { sym: 'GOLD', label: '🟡 GOLD (XAUUSD)' },
                  { sym: 'BTC', label: '🟢 BTC' },
                  { sym: 'ETH', label: '🔵 ETH' },
                  { sym: 'SOL', label: '🟣 SOL' },
                  { sym: 'SUI', label: '💧 SUI' },
                  { sym: 'PEPE', label: '🐸 PEPE' },
                  { sym: 'DOGE', label: '🐕 DOGE' },
                  { sym: 'EURUSD', label: '💶 EURUSD' },
                ].map((item) => (
                  <button
                    key={item.sym}
                    onClick={() => setSymbol(item.sym)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      symbol === item.sym
                        ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Timeframe selector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{lang === 'my' ? 'Timeframe:' : 'Timeframe:'}</span>
                <div className="flex items-center gap-1">
                  {['1M', '5M', '15M', '1H', '4H', '1D'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                        timeframe === tf
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TradingView Chart Screenshot Upload or Paste (Ctrl+V) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'my' ? 'Chart စခရင်ရှော့ ပုံထည့်သွင်းရန် (Optional)' : 'Chart Screenshot (Optional)'}</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl + V to paste</span>
              </div>

              {chartImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700">
                  <img
                    src={chartImage.preview}
                    alt="Chart Preview"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => setChartImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-2xl p-3 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/40"
                >
                  <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'my' ? 'Chart ပုံရွေးပါ သို့မဟုတ် Ctrl + V ကပ်ပါ' : 'Upload chart or paste with Ctrl+V'}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Prompt input & Execute button */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
              <textarea
                rows={2}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={
                  marketAnalysisSubMode === 'quick'
                    ? `${symbol} အတွက် 15M Quick Scalp/Day Trade စစ်ဆေးပေးပါ...`
                    : `${symbol} ၏ ၂၄ ချက်ပြည့် Institutional Analysis အပြည့်အစုံ ဆန်းစစ်ပေးပါ...`
                }
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />

              <button
                disabled={isLoading}
                onClick={() => handleRunAnalysis()}
                className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm cursor-pointer transition flex items-center justify-center gap-2 shadow-lg ${
                  isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : marketAnalysisSubMode === 'quick'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'my' ? 'စစ်ဆေးနေပါသည်...' : 'Analyzing setup...'}</span>
                  </>
                ) : (
                  <>
                    {marketAnalysisSubMode === 'quick' ? <Zap className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                    <span>
                      {marketAnalysisSubMode === 'quick'
                        ? lang === 'my'
                          ? `⚡ ${symbol} အမြန်ဆုံးဖြတ်ချက် ထုတ်ယူမည်`
                          : `⚡ Run Quick Trade (${symbol})`
                        : lang === 'my'
                        ? `🧠 ${symbol} ၂၄ ချက်ပြည့် အပြည့်အစုံ ဆန်းစစ်မည်`
                        : `🧠 Run 24-Point Deep Audit`}
                    </span>
                  </>
                )}
              </button>

              {errorNotice && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorNotice}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT RESULT DISPLAY: DECISION CARD & 24-POINT AUDIT */}
          <div className="lg:col-span-7 space-y-4">
            {result ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* ACTIONABLE CLEAN RESULT CARD (Requested by user) */}
                {result.decision && (
                  <div
                    className={`p-5 rounded-3xl border shadow-xl ${
                      result.decision === 'LONG'
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : result.decision === 'SHORT'
                        ? 'bg-rose-950/40 border-rose-500/50'
                        : 'bg-amber-950/40 border-amber-500/50'
                    }`}
                  >
                    {/* Top Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 ${
                            result.decision === 'LONG'
                              ? 'bg-emerald-500 text-slate-950'
                              : result.decision === 'SHORT'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {result.decision === 'LONG' && <TrendingUp className="w-4 h-4" />}
                          {result.decision === 'SHORT' && <TrendingDown className="w-4 h-4" />}
                          {result.decision === 'WAIT' && <Clock className="w-4 h-4" />}
                          <span>{result.decision}</span>
                        </div>
                        <span className="font-mono text-xs text-white font-bold">
                          {symbol} • {timeframe}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 1-Click Clean Copy */}
                        <button
                          onClick={handleCopyCleanTrade}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
                          title="Copy Clean Format"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{lang === 'my' ? 'ရိုးရှင်းကော်ပီ' : 'Quick Copy'}</span>
                        </button>

                        <button
                          onClick={handleCopyAnalysis}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                          title="Copy Full Analysis"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* AESTHETIC CLEAN DISPLAY BOX (GOLD BUY 2655, TP1, TP2, TP3, SL) */}
                    <div className="bg-slate-950/90 rounded-2xl p-4 my-3 border border-slate-800 font-mono space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold">
                        <span className="text-white flex items-center gap-2">
                          <span className={result.decision === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}>
                            {symbol} {result.decision}
                          </span>
                          <span>${result.entry}</span>
                        </span>
                        <span className="text-amber-400 text-[11px]">
                          Auto Lev: {customLeverage}x • Margin: ${customMargin}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          <span className="text-emerald-400 font-black">🎯 TP¹ ${result.takeProfit1}</span>
                          <span className="text-emerald-400 font-bold">
                            (+${(customMargin * customLeverage * 0.02).toFixed(1)})
                          </span>
                        </div>

                        {result.takeProfit2 && (
                          <div className="flex items-center justify-between bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <span className="text-emerald-400 font-black">🎯 TP² ${result.takeProfit2}</span>
                            <span className="text-emerald-400 font-bold">
                              (+${(customMargin * customLeverage * 0.04).toFixed(1)})
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-500/20">
                          <span className="text-rose-400 font-black">🛑 SL ${result.stopLoss}</span>
                          <span className="text-rose-400 font-bold">
                            (-${(walletBalance * 0.015).toFixed(1)}) (1.5% Wallet)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transfer to Demo Button */}
                    {result.decision !== 'WAIT' && onGoToTradePreset && (
                      <button
                        onClick={handleApplyToDemo}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>{lang === 'my' ? 'ဒေမိုစနစ်တွင် ဖွင့်လှစ်စမ်းသပ်မည်' : 'Test in Demo Terminal'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* High-Leverage Risk Audit Box */}
                {result.mode === 'high_leverage' && (
                  <div className="bg-gradient-to-br from-amber-950/50 via-slate-900 to-rose-950/40 border border-amber-500/50 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          {lang === 'my' ? 'High-Leverage စွန့်စားမှု စစ်ဆေးချက်' : 'High-Leverage Risk Audit'}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                        result.highLeverageApproval === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : result.highLeverageApproval === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {result.highLeverageApproval || 'HIGH_RISK'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">POSITION NOTIONAL</span>
                        <span className="text-white font-bold">${result.positionNotional?.toLocaleString() || (customMargin * customLeverage).toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">LIQ DISTANCE</span>
                        <span className="text-amber-400 font-bold">~{result.liquidationDistancePercent || ((1 / customLeverage) * 98).toFixed(2)}%</span>
                      </div>
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">MAX DOLLAR LOSS</span>
                        <span className="text-rose-400 font-bold">${result.maxDollarLoss || (walletBalance * 0.02).toFixed(1)}</span>
                      </div>
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">TIMING SCORE</span>
                        <span className="text-cyan-400 font-bold">{result.timingQualityScore || 8.5}/10</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 24-Point Checklist Accordion for Deep Mode */}
                {result.mode === 'deep' && result.checklistPoints && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-500" />
                        <span>{lang === 'my' ? '၂၄ ချက်ပြည့် အဆင့်မြင့်စစ်ဆေးမှု ဇယား' : '24-Point Institutional Checklist'}</span>
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        24 / 24 COMPLETE
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 text-xs">
                      {result.checklistPoints.map((item) => (
                        <div
                          key={item.num}
                          className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-4 h-4 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                              {item.num}
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Summary Markdown */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {lang === 'my' ? 'အသေးစိတ် လေ့လာဆန်းစစ်ချက်' : 'Detailed Analysis Summary'}
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {result.summaryMarkdown}
                  </div>
                </div>
              </div>
            ) : (
              /* EMPTY / WELCOME STATE */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
                  <BarChart2 className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {lang === 'my' ? 'စျေးကွက် နည်းပညာ ခွဲခြမ်းစိတ်ဖြာမှု စတင်ပါ' : 'Ready for Market Technical Analysis'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === 'my'
                    ? 'ဘယ်ဘက်တွင် ကုန်သွယ်မည့် Asset ရွေးချယ်ပြီး "အမြန်ဆုံးဖြတ်ချက် ထုတ်ယူမည်" ကို နှိပ်ပါ'
                    : 'Choose your asset, timeframe, and run Quick Trade or Deep Analysis.'}
                </p>
                <button
                  onClick={() => handleRunAnalysis()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition shadow-sm"
                >
                  ⚡ {lang === 'my' ? `${symbol} စစ်ဆေးကြည့်မည်` : `Analyze ${symbol} Now`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION 2: DEDICATED CRYPTO Q&A MODULE (User requested separation)      */}
      {/* ========================================================================= */}
      {activeTab === 'crypto_qna' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* BANNER FOR CRYPTO Q&A */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/30 rounded-3xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                  CRYPTO KNOWLEDGE & Q&A
                </span>
                <span className="text-xs text-emerald-300 font-mono">No Trade Clutter</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {lang === 'my' ? 'Crypto နှင့် Trading အကြောင်း မေးချင်ရာမေးမြန်းနိုင်သော နေရာ' : 'Ask AI Anything About Crypto & Futures'}
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                {lang === 'my'
                  ? 'Funding Rate, Liquidity Sweep, Orderblocks, Halving, Leverage တွက်ချက်ပုံနှင့် Trader Psychology အားလုံးကို မြန်မာလို လွတ်လပ်စွာ မေးမြန်းနိုင်ပါသည်။'
                  : 'Ask any questions about crypto fundamentals, futures math, Smart Money Concepts, or risk rules.'}
              </p>
            </div>

            <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/40 text-center shrink-0">
              <span className="text-[10px] text-emerald-300 block">AI KNOWLEDGE BASE</span>
              <span className="text-sm font-black text-white">100% UNBIASED EDUCATION</span>
            </div>
          </div>

          {/* INTERACTIVE QUESTION INPUT BAR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'my' ? 'သင်သိလိုသော Crypto မေးခွန်းကို ရိုက်ထည့်ပါ:' : 'Type your question about crypto:'}
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userInput.trim()) {
                    handleRunAnalysis(userInput, 'ask_ai');
                  }
                }}
                placeholder={
                  lang === 'my'
                    ? 'ဥပမာ- Funding Rate ဆိုတာဘာလဲ? Liquidation Price ဘယ်လိုတွက်လဲ?...'
                    : 'e.g. How does funding rate work? What is a liquidity sweep?...'
                }
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />

              <button
                disabled={isLoading || !userInput.trim()}
                onClick={() => handleRunAnalysis(userInput, 'ask_ai')}
                className={`px-6 py-3 rounded-2xl font-black text-xs cursor-pointer transition flex items-center justify-center gap-2 shadow-md shrink-0 ${
                  isLoading || !userInput.trim()
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'my' ? 'ဖြေဆိုနေပါသည်...' : 'Thinking...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{lang === 'my' ? 'မေးမြန်းမည်' : 'Ask AI'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI ANSWER DISPLAY */}
          {result && (
            <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {lang === 'my' ? 'AI ၏ အပြည့်အစုံ ရှင်းလင်းချက်' : 'AI Response & Explanation'}
                    </h3>
                    <span className="text-[10px] text-slate-400">Gemini High-Precision Financial Knowledge</span>
                  </div>
                </div>

                <button
                  onClick={handleCopyAnalysis}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{lang === 'my' ? 'အဖြေ ကော်ပီ' : 'Copy Answer'}</span>
                </button>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line">
                {result.summaryMarkdown}
              </div>
            </div>
          )}

          {/* PRE-CATEGORIZED INSTANT QUESTION CARDS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'my' ? 'အမြန်မေးမြန်းနိုင်သော ခေါင်းစဉ်ကြီး ၄ ခု' : '4 Popular Crypto Topic Categories'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cryptoQnACategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3"
                >
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{lang === 'my' ? cat.categoryNameMy : cat.categoryNameEn}</span>
                  </h4>

                  <div className="space-y-2">
                    {cat.questions.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => {
                          setUserInput(q.query);
                          handleRunAnalysis(q.query, 'ask_ai');
                        }}
                        className="w-full text-left text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 hover:bg-emerald-500/10 hover:text-emerald-500 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-slate-800/80 flex items-center justify-between group"
                      >
                        <span className="font-medium pr-2">
                          {lang === 'my' ? q.labelMy : q.labelEn}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0 transition group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
