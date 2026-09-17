import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Target,
  ArrowRight,
  Info,
  Globe,
  Sparkles,
  CheckCircle2,
  X,
  BookmarkCheck,
} from 'lucide-react';
import {
  BinanceSignalData,
  formatBinanceFuturesSymbol,
  getBinanceFuturesUrl,
  getBinanceSpotUrl,
  getBinanceHomeUrl,
  getBinanceAppDeepLink,
  openBinanceFutures,
  openBinanceSpot,
  copyValueToClipboard,
  formatBinanceSignalClipboardText,
} from '../utils/binanceLink';

interface BinanceDirectTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: BinanceSignalData;
  lang: 'my' | 'en';
  onSaveToActiveTrades?: (signal: BinanceSignalData) => void;
  onOpenInAppTerminal?: (symbol: string, side: 'LONG' | 'SHORT', preset?: any) => void;
}

export const BinanceDirectTradeModal: React.FC<BinanceDirectTradeModalProps> = ({
  isOpen,
  onClose,
  signal,
  lang,
  onSaveToActiveTrades,
  onOpenInAppTerminal,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedFullSignal, setCopiedFullSignal] = useState<boolean>(false);
  const [isSavedToActive, setIsSavedToActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const cleanSymbol = formatBinanceFuturesSymbol(signal.symbol);
  const futuresUrl = getBinanceFuturesUrl(cleanSymbol);
  const spotUrl = getBinanceSpotUrl(cleanSymbol);
  const isLong = signal.direction.toUpperCase().includes('LONG') || signal.direction.toUpperCase().includes('BUY');

  const handleCopyValue = async (val: number | string, fieldKey: string) => {
    const success = await copyValueToClipboard(val);
    if (success) {
      setCopiedField(fieldKey);
      setTimeout(() => {
        setCopiedField((prev) => (prev === fieldKey ? null : prev));
      }, 2000);
    }
  };

  const handleCopyFullSignal = async () => {
    const text = formatBinanceSignalClipboardText(signal);
    const success = await copyValueToClipboard(text);
    if (success) {
      setCopiedFullSignal(true);
      setTimeout(() => setCopiedFullSignal(false), 2500);
    }
  };

  const handleLaunchBinanceFutures = () => {
    openBinanceFutures(cleanSymbol);
  };

  const handleLaunchBinanceSpot = () => {
    openBinanceSpot(cleanSymbol);
  };

  const handleSaveActive = () => {
    setIsSavedToActive(true);
    if (onSaveToActiveTrades) {
      onSaveToActiveTrades(signal);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Binance branding */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Binance Icon Hex Badge */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300">
              <span className="font-black text-slate-950 text-base">B</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  Trade in Binance
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Direct Web Link
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  No API Key Needed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{futuresUrl}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Direct Launch Alert Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black text-amber-300">
                {lang === 'my'
                  ? '⚡ Binance ဝဘ်ဆိုဒ်သို့ တိုက်ရိုက်ချိတ်ဆက်ပြီးဖြစ်ပါသည် (API Key မလိုပါ)'
                  : '⚡ Connected directly to Binance via official link (No API Key required)'}
              </span>
              <p className="text-[11px] text-amber-100/80 leading-relaxed">
                {lang === 'my'
                  ? 'အောက်ပါ TP (Take Profit) နှင့် SL (Stop Loss) တန်ဖိုးများကို 1-Click ဖြင့် ကူးယူပြီး Binance ရှိ TP/SL အကွက်တွင် Paste ချရုံဖြင့် အော်ဒါ နေရာချပြီးဖြစ်ပါမည်။'
                  : 'Below are your pre-calculated Take Profit (TP) and Stop Loss (SL) values. Copy with 1-click and paste directly into Binance TP/SL fields.'}
              </p>
            </div>
          </div>

          {/* Persistent Single-Session Notice */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-emerald-500/30 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300">
              <span className="font-bold text-emerald-400 block mb-0.5">
                {lang === 'my' ? '🔒 Single-Login Persistent Mode (Log in မပျက်စေသော စနစ်):' : '🔒 Persistent Single-Tab Session:'}
              </span>
              {lang === 'my'
                ? 'Tab အသစ်များ အကြိမ်ကြိမ် မပွင့်စေဘဲ Tab တစ်ခုတည်းဖြင့် Log in တစ်ခါဝင်ရုံဖြင့် အမြဲသုံးနိုင်ရန် စီစဉ်ပေးထားပါသည်။ အက်ပ်မှ မထွက်ဘဲ ကုန်သွယ်လိုပါက အောက်ပါ "အက်ပ်အတွင်း တိုက်ရိုက်ကုန်သွယ်မည်" ကို နှိပ်နိုင်ပါသည်။'
                : 'All links now target a single persistent tab so you only log in once. Or trade right inside the app below without leaving!'}
            </div>
          </div>

          {/* Primary Quick Launch Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {onOpenInAppTerminal && (
              <button
                onClick={() => {
                  onOpenInAppTerminal(cleanSymbol.replace('USDT', ''), isLong ? 'LONG' : 'SHORT', {
                    symbol: cleanSymbol.replace('USDT', ''),
                    side: isLong ? 'LONG' : 'SHORT',
                    margin: signal.margin || 100,
                    leverage: signal.leverage || 20,
                    entryPrice: signal.entryPrice,
                    tpPrice: signal.tpPrice,
                    slPrice: signal.slPrice,
                  });
                  onClose();
                }}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/25 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>
                  {lang === 'my'
                    ? `📱 အက်ပ်အတွင်း တိုက်ရိုက်ကုန်သွယ်မည်`
                    : `📱 Trade in In-App Terminal`}
                </span>
              </button>
            )}

            <button
              onClick={handleLaunchBinanceFutures}
              className={`px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/25 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                !onOpenInAppTerminal ? 'sm:col-span-2' : ''
              }`}
            >
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              <span>
                {lang === 'my'
                  ? `🚀 Binance Tab သို့ သွားမည် (${cleanSymbol})`
                  : `🚀 Open Binance Tab (${cleanSymbol})`}
              </span>
            </button>
          </div>

          {/* Signal TP & SL Placement Ready Cards (User Core Intent) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'my'
                    ? 'Binance တွင် နေရာချရန် အသင့်ဖြစ်သော Signals (TP/SL)'
                    : 'Signals Ready for Placement on Binance (TP/SL)'}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Pair: <strong className="text-white">{cleanSymbol}</strong> |{' '}
                <span className={isLong ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isLong ? 'LONG (BUY) 🟢' : 'SHORT (SELL) 🔴'}
                </span>
              </span>
            </div>

            {/* Grid of Key Values with 1-Click Fast Copy Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Take Profit (TP) */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/40 relative group overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                      Take Profit (TP)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Target
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 my-1">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ${signal.tpPrice}
                  </span>
                  {signal.tp3Price && signal.tp3Price !== signal.tpPrice && (
                    <span className="text-xs text-slate-400 font-mono">
                      TP3: ${signal.tp3Price}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-emerald-200/70 mb-3">
                  {lang === 'my'
                    ? 'Binance ရှိ "Take Profit" အကွက်တွင် ထည့်သွင်းပါ'
                    : 'Paste into Binance "Take Profit" price input'}
                </p>

                <button
                  onClick={() => handleCopyValue(signal.tpPrice, 'tp')}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    copiedField === 'tp'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {copiedField === 'tp' ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{lang === 'my' ? `TP ($${signal.tpPrice}) ကူးယူပြီး!` : `Copied TP ($${signal.tpPrice})!`}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'my' ? `TP ကူးယူရန် ($${signal.tpPrice})` : `Copy TP ($${signal.tpPrice})`}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Stop Loss (SL) */}
              <div className="p-4 rounded-2xl bg-rose-950/30 border-2 border-rose-500/40 relative group overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-rose-400 uppercase tracking-wide">
                      Stop Loss (SL)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    Risk Limit
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 my-1">
                  <span className="text-2xl font-black font-mono text-rose-400">
                    ${signal.slPrice}
                  </span>
                </div>

                <p className="text-[11px] text-rose-200/70 mb-3">
                  {lang === 'my'
                    ? 'Binance ရှိ "Stop Loss" အကွက်တွင် ထည့်သွင်းပါ'
                    : 'Paste into Binance "Stop Loss" price input'}
                </p>

                <button
                  onClick={() => handleCopyValue(signal.slPrice, 'sl')}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    copiedField === 'sl'
                      ? 'bg-rose-500 text-slate-950 font-black'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {copiedField === 'sl' ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{lang === 'my' ? `SL ($${signal.slPrice}) ကူးယူပြီး!` : `Copied SL ($${signal.slPrice})!`}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'my' ? `SL ကူးယူရန် ($${signal.slPrice})` : `Copy SL ($${signal.slPrice})`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Entry Price & Leverage / Margin Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Entry Price</span>
                <span className="text-sm font-black text-white">${signal.entryPrice}</span>
                <button
                  onClick={() => handleCopyValue(signal.entryPrice, 'entry')}
                  className="text-[10px] text-amber-400 hover:text-amber-300 mt-1 block cursor-pointer"
                >
                  {copiedField === 'entry' ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Leverage</span>
                <span className="text-sm font-black text-amber-400">{signal.leverage || 20}x</span>
                <span className="text-[10px] text-slate-500 block mt-1">Cross/Isolated</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Margin (USDT)</span>
                <span className="text-sm font-black text-emerald-400">${signal.margin || 100}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Position Margin</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Position Size</span>
                <span className="text-sm font-black text-indigo-400">
                  ${((signal.margin || 100) * (signal.leverage || 20)).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Notional</span>
              </div>
            </div>
          </div>

          {/* 4-Step Visual Placement Guide on Binance */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase">
              <Info className="w-4 h-4" />
              <span>
                {lang === 'my'
                  ? 'Binance တွင် အော်ဒါ နေရာချနည်း (အဆင့် ၄ ဆင့်):'
                  : 'How to Place Order on Binance (4 Easy Steps):'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="text-[11px] leading-relaxed">
                  {lang === 'my' ? (
                    <>
                      <strong>[🚀 Binance Futures ဖွင့်မည်]</strong> ခလုတ်ကို နှိပ်ပါ (
                      <code className="text-amber-400">{futuresUrl}</code> သို့ တိုက်ရိုက်ရောက်ပါမည်)။
                    </>
                  ) : (
                    <>
                      Click <strong>[🚀 Open Binance Futures]</strong> to navigate directly to{' '}
                      <code className="text-amber-400">{futuresUrl}</code>.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="text-[11px] leading-relaxed">
                  {lang === 'my' ? (
                    <>
                      Binance တွင် အော်ဒါပုံစံ (Market သို့မဟုတ် Limit) ရွေးပြီး{' '}
                      <strong>[✓] TP/SL (Take Profit / Stop Loss)</strong> အကွက်ကို အမှန်ခြစ် ဖွင့်ပါ။
                    </>
                  ) : (
                    <>
                      Select your order type (Market or Limit) and check the <strong>[✓] TP/SL</strong> box in the Binance order panel.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <p className="text-[11px] leading-relaxed">
                  {lang === 'my' ? (
                    <>
                      အထက်ပါ <strong>[TP ကူးယူရန်]</strong> နှိပ်ပြီး Binance ၏ TP အကွက်တွင် Paste ချပါ၊ ထို့နောက်{' '}
                      <strong>[SL ကူးယူရန်]</strong> နှိပ်ပြီး SL အကွက်တွင် Paste ချပါ။
                    </>
                  ) : (
                    <>
                      Click <strong>[Copy TP]</strong> and paste into the Take Profit field, then click{' '}
                      <strong>[Copy SL]</strong> and paste into the Stop Loss field.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <p className="text-[11px] leading-relaxed">
                  {lang === 'my' ? (
                    <>
                      {isLong ? (
                        <span className="text-emerald-400 font-bold">Buy/Long</span>
                      ) : (
                        <span className="text-rose-400 font-bold">Sell/Short</span>
                      )}{' '}
                      ခလုတ်ကို နှိပ်လိုက်သည်နှင့် Binance တွင် TP/SL နေရာချပြီးသား အော်ဒါ အောင်မြင်စွာ ပွင့်သွားပါမည်!
                    </>
                  ) : (
                    <>
                      Hit{' '}
                      {isLong ? (
                        <span className="text-emerald-400 font-bold">Buy/Long</span>
                      ) : (
                        <span className="text-rose-400 font-bold">Sell/Short</span>
                      )}{' '}
                      to execute your order with automatic TP/SL brackets live on Binance.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullSignal}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              {copiedFullSignal ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'my' ? 'Signal အပြည့် ကူးယူပြီး' : 'Copied Full Signal'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'my' ? 'Signal အပြည့် ကူးမည်' : 'Copy Full Signal'}</span>
                </>
              )}
            </button>

            {onSaveToActiveTrades && (
              <button
                onClick={handleSaveActive}
                disabled={isSavedToActive}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  isSavedToActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>
                  {isSavedToActive
                    ? lang === 'my'
                      ? '✓ Binance တွင် မှတ်တမ်းတင်ပြီး'
                      : '✓ Recorded as Placed'
                    : lang === 'my'
                    ? 'Binance တွင် ထည့်သွင်းပြီးအဖြစ် မှတ်မည်'
                    : 'Record as Placed on Binance'}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchBinanceFutures}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{lang === 'my' ? 'Binance သို့ သွားမည်' : 'Go to Binance'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
