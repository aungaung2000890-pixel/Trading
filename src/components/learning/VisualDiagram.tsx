import React from 'react';
import { VisualDiagramType } from '../../types/learning';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Layers,
  Zap,
  Lock,
  Wifi,
  WifiOff,
  Cpu,
  BarChart2,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface VisualDiagramProps {
  type: VisualDiagramType;
  caption?: string;
  captionMy?: string;
  lang: 'my' | 'en';
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({
  type,
  caption,
  captionMy,
  lang,
}) => {
  return (
    <div className="my-4 p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-inner">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] font-mono text-amber-400">
        <span className="flex items-center gap-1.5 uppercase tracking-wider font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {lang === 'my' ? 'နည်းပညာဆိုင်ရာ ပုံကြမ်းဇယား' : 'Visual Concept Diagram'}
        </span>
        <span className="text-slate-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded">
          {type}
        </span>
      </div>

      <div className="py-2 flex items-center justify-center">
        {/* 1. CANDLESTICK ANATOMY */}
        {type === 'candlestick-anatomy' && (
          <div className="w-full max-w-md grid grid-cols-2 gap-6 text-center text-xs">
            {/* Bullish Candle */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30 flex flex-col items-center">
              <span className="text-emerald-400 font-bold mb-2">🟢 Bullish (အစိမ်း)</span>
              <div className="text-[10px] text-slate-400 font-mono">High: $65,500</div>
              <div className="w-0.5 h-4 bg-emerald-400" />
              <div className="w-14 py-3 bg-emerald-500/30 border-2 border-emerald-400 rounded flex flex-col items-center justify-between my-0.5">
                <span className="text-[9px] font-mono font-bold text-emerald-300">Close: $65,200</span>
                <span className="text-[9px] text-slate-300 font-bold my-1">BODY</span>
                <span className="text-[9px] font-mono font-bold text-emerald-300">Open: $64,200</span>
              </div>
              <div className="w-0.5 h-5 bg-emerald-400" />
              <div className="text-[10px] text-slate-400 font-mono">Low: $64,000</div>
              <p className="mt-2 text-[10px] text-emerald-300 font-sans">
                {lang === 'my' ? 'Close သည် Open ထက် မြင့်သည်' : 'Close is ABOVE Open'}
              </p>
            </div>

            {/* Bearish Candle */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/30 flex flex-col items-center">
              <span className="text-rose-400 font-bold mb-2">🔴 Bearish (အနီ)</span>
              <div className="text-[10px] text-slate-400 font-mono">High: $65,800</div>
              <div className="w-0.5 h-4 bg-rose-400" />
              <div className="w-14 py-3 bg-rose-500/30 border-2 border-rose-400 rounded flex flex-col items-center justify-between my-0.5">
                <span className="text-[9px] font-mono font-bold text-rose-300">Open: $65,400</span>
                <span className="text-[9px] text-slate-300 font-bold my-1">BODY</span>
                <span className="text-[9px] font-mono font-bold text-rose-300">Close: $64,500</span>
              </div>
              <div className="w-0.5 h-5 bg-rose-400" />
              <div className="text-[10px] text-slate-400 font-mono">Low: $64,100</div>
              <p className="mt-2 text-[10px] text-rose-300 font-sans">
                {lang === 'my' ? 'Close သည် Open ထက် နိမ့်သည်' : 'Close is BELOW Open'}
              </p>
            </div>
          </div>
        )}

        {/* 2. BLOCKCHAIN FLOW */}
        {type === 'blockchain-flow' && (
          <div className="w-full overflow-x-auto py-2">
            <div className="flex items-center justify-center gap-2 min-w-[500px]">
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-center text-xs">
                <div className="text-amber-400 font-bold">1. Transaction</div>
                <div className="text-[10px] text-slate-400">{lang === 'my' ? 'ငွေလွှဲစတင်' : 'User Broadcasts'}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-center text-xs">
                <div className="text-indigo-400 font-bold">2. Verification</div>
                <div className="text-[10px] text-slate-400">{lang === 'my' ? 'ကွန်ရက်အတည်ပြု' : 'Nodes Validate'}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-center text-xs">
                <div className="text-blue-400 font-bold">3. Block</div>
                <div className="text-[10px] text-slate-400">{lang === 'my' ? 'Block ထဲထည့်သွင်း' : 'Bundled into Block'}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-center text-xs">
                <div className="text-purple-400 font-bold">4. Blockchain</div>
                <div className="text-[10px] text-slate-400">{lang === 'my' ? 'ကွင်းဆက်ချိတ်ဆက်' : 'Immutable Hash'}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/50 text-center text-xs">
                <div className="text-emerald-400 font-bold">5. Confirmed ✅</div>
                <div className="text-[10px] text-emerald-300">{lang === 'my' ? 'အပြီးသတ်အတည်ပြုပြီး' : 'Final Settlement'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ORDER BOOK LADDER */}
        {type === 'orderbook-ladder' && (
          <div className="w-full max-w-sm bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="text-[11px] text-slate-400 flex justify-between pb-1 border-b border-slate-800">
              <span>{lang === 'my' ? 'အော်ဒါအမျိုးအစား' : 'Order Level'}</span>
              <span>Price</span>
              <span>Size (BTC)</span>
            </div>
            {/* Asks (Red) */}
            <div className="py-1 space-y-1 text-rose-400">
              <div className="flex justify-between items-center bg-rose-500/10 px-1.5 py-0.5 rounded">
                <span>🔴 SELL ASK 3</span>
                <span className="font-bold">$105.00</span>
                <span className="text-slate-400">4.52</span>
              </div>
              <div className="flex justify-between items-center bg-rose-500/15 px-1.5 py-0.5 rounded">
                <span>🔴 SELL ASK 2</span>
                <span className="font-bold">$104.00</span>
                <span className="text-slate-400">8.10</span>
              </div>
              <div className="flex justify-between items-center bg-rose-500/25 px-1.5 py-0.5 rounded">
                <span>🔴 BEST ASK 1</span>
                <span className="font-bold text-rose-300">$103.00</span>
                <span className="text-slate-400">12.50</span>
              </div>
            </div>

            {/* Spread Divider */}
            <div className="my-2 py-1.5 px-2 bg-amber-500/10 border border-amber-500/30 rounded text-center text-amber-400 text-[10px]">
              <span className="font-bold">SPREAD GAP: $1.00 ($103.00 - $102.00)</span>
            </div>

            {/* Bids (Green) */}
            <div className="py-1 space-y-1 text-emerald-400">
              <div className="flex justify-between items-center bg-emerald-500/25 px-1.5 py-0.5 rounded">
                <span>🟢 BEST BID 1</span>
                <span className="font-bold text-emerald-300">$102.00</span>
                <span className="text-slate-400">15.20</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-500/15 px-1.5 py-0.5 rounded">
                <span>🟢 BUY BID 2</span>
                <span className="font-bold">$101.00</span>
                <span className="text-slate-400">9.40</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <span>🟢 BUY BID 3</span>
                <span className="font-bold">$100.00</span>
                <span className="text-slate-400">22.80</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. SUPPORT / RESISTANCE & BREAKOUT */}
        {type === 'support-resistance-breakout' && (
          <div className="w-full max-w-lg p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="relative h-44 flex flex-col justify-between py-2 border-l border-b border-slate-800 pl-2">
              {/* Resistance line */}
              <div className="w-full flex items-center gap-2 border-b-2 border-dashed border-rose-500/60 pb-1">
                <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                  RESISTANCE CEILING ($65,000)
                </span>
                <span className="text-[9px] text-slate-400">
                  {lang === 'my' ? 'ရောင်းအားများသော မျက်နှာကြက်' : 'Sellers reject price'}
                </span>
              </div>

              {/* Price trajectory simulated with badges */}
              <div className="flex items-center justify-between px-2 text-[10px]">
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">1. Consolidation</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                  2. Breakout 🚀
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                  3. Retest 🔄
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  4. Continuation 📈
                </span>
              </div>

              {/* Support line */}
              <div className="w-full flex items-center gap-2 border-t-2 border-dashed border-emerald-500/60 pt-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  SUPPORT FLOOR ($60,000)
                </span>
                <span className="text-[9px] text-slate-400">
                  {lang === 'my' ? 'ဝယ်အားများသော ကြမ်းပြင်' : 'Buyers step in'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-center text-[10px] text-slate-400">
              {lang === 'my'
                ? 'Breakout ➔ Confirmation ➔ Retest (ဟောင်းနွမ်း Resistance မှ Support အဖြစ်ပြောင်းလဲခြင်း) ➔ Continuation'
                : 'Breakout ➔ Confirmation ➔ Retest (Prior Resistance flips to new Support) ➔ Continuation'}
            </div>
          </div>
        )}

        {/* 5. TREND HH / HL */}
        {type === 'trend-hh-hl' && (
          <div className="w-full max-w-md grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex flex-col justify-between h-40">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>UPTREND (စျေးတက်)</span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-right text-emerald-300 font-bold">HH ($68k) ↗</div>
                <div className="text-center text-emerald-400">HL ($63k) ↘</div>
                <div className="text-right text-emerald-300 font-bold">HH ($65k) ↗</div>
                <div className="text-left text-emerald-400">HL ($59k) ↘</div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-emerald-500/20 pt-1">
                Higher Highs + Higher Lows
              </div>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl flex flex-col justify-between h-40">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <TrendingDown className="w-4 h-4" />
                <span>DOWNTREND (စျေးကျ)</span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-left text-rose-300 font-bold">↘ LH ($62k)</div>
                <div className="text-center text-rose-400">↗ LL ($55k)</div>
                <div className="text-left text-rose-300 font-bold">↘ LH ($58k)</div>
                <div className="text-right text-rose-400">↗ LL ($50k)</div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-rose-500/20 pt-1">
                Lower Highs + Lower Lows
              </div>
            </div>
          </div>
        )}

        {/* 6. LEVERAGE MULTIPLIER */}
        {type === 'leverage-multiplier' && (
          <div className="w-full max-w-md p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3 font-mono">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span>Collateral Margin:</span>
              <span className="text-amber-400 font-bold">$1,000 USDT</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span>Leverage Setting:</span>
              <span className="text-indigo-400 font-bold">10x Leverage</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span>Total Position Exposure:</span>
              <span className="text-emerald-400 font-bold text-sm">$10,000 USD Value</span>
            </div>
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] font-sans">
              <div className="flex items-center gap-1.5 font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Liquidation Warning at 10x:</span>
              </div>
              <p className="mt-1">
                {lang === 'my'
                  ? 'စျေးနှုန်းသည် -၁၀% သာ ဆန့်ကျင်ဘက်ကျသွားပါက $1,000 (၁၀၀%) အားလုံး ချက်ချင်း ပြုတ်ထွက်ဆုံးရှုံးမည်။'
                  : 'A mere -10% adverse price move causes 100% total liquidation of your $1,000 margin!'}
              </p>
            </div>
          </div>
        )}

        {/* 7. MULTI-TIMEFRAME LADDER */}
        {type === 'multi-timeframe-ladder' && (
          <div className="w-full max-w-md space-y-2 text-xs">
            <div className="p-2.5 bg-slate-950 border-l-4 border-emerald-500 rounded-r-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-400">1D (Daily Chart)</span>
                <p className="text-[10px] text-slate-400">{lang === 'my' ? 'ရေရှည် ပင်မ Trend ဦးတည်ချက်' : 'Macro Trend Direction'}</p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">BULLISH</span>
            </div>
            <div className="p-2.5 bg-slate-950 border-l-4 border-indigo-500 rounded-r-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-indigo-400">4H (4-Hour Chart)</span>
                <p className="text-[10px] text-slate-400">{lang === 'my' ? 'စျေးကွက်တည်ဆောက်ပုံနှင့် အဓိကဇုန်များ' : 'Key Structure & Support/Resistance'}</p>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">SUPPORT ZONE</span>
            </div>
            <div className="p-2.5 bg-slate-950 border-l-4 border-amber-500 rounded-r-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-400">1H (1-Hour Chart)</span>
                <p className="text-[10px] text-slate-400">{lang === 'my' ? 'ကုန်သွယ်မှု အခွင့်အလမ်း ပေါ်ပေါက်မှု' : 'Trade Setup Formation'}</p>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">PULLBACK</span>
            </div>
            <div className="p-2.5 bg-slate-950 border-l-4 border-purple-500 rounded-r-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-400">15M / 5M (Intraday Chart)</span>
                <p className="text-[10px] text-slate-400">{lang === 'my' ? 'အတည်ပြုချက်ယူ၍ တိကျစွာ ဝင်ရောက်ခြင်း' : 'Entry Confirmation Trigger'}</p>
              </div>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">BOS / CHoCH</span>
            </div>
          </div>
        )}

        {/* 8. RISK WATERFALL */}
        {type === 'risk-waterfall' && (
          <div className="w-full max-w-md bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">1. Total Account Balance:</span>
              <span className="font-mono text-white font-bold">$10,000</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-amber-400">
              <span>2. Risk % Rule (Strict 1%):</span>
              <span className="font-mono font-bold">1.0%</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-rose-400">
              <span>3. Maximum Dollar Risk at SL:</span>
              <span className="font-mono font-bold text-sm">$100 Max Loss</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>4. Stop-Loss Distance (% to invalidation):</span>
              <span className="font-mono text-white font-bold">5.0% SL</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800 text-emerald-400">
              <span>5. Calculated Position Size:</span>
              <span className="font-mono font-bold text-sm">$2,000 Size ($100 ÷ 5%)</span>
            </div>
            <div className="flex items-center justify-between py-1 text-indigo-400">
              <span>6. Margin Required (at 5x Leverage):</span>
              <span className="font-mono font-bold">$400 Collateral</span>
            </div>
          </div>
        )}

        {/* 9. SPOT VS FUTURES */}
        {type === 'spot-vs-futures' && (
          <div className="w-full max-w-md grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 block border-b border-emerald-500/30 pb-1">
                SPOT TRADING
              </span>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div>• Buy actual crypto coins</div>
                <div>• Store in your hardware wallet</div>
                <div>• Zero liquidation risk</div>
                <div>• Only profits when price goes UP</div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2">
              <span className="font-bold text-indigo-400 block border-b border-indigo-500/30 pb-1">
                FUTURES TRADING
              </span>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div>• Derivative contract (No coin ownership)</div>
                <div>• Profit on LONG (Up) and SHORT (Down)</div>
                <div>• Leverage multiplier (e.g. 5x - 20x)</div>
                <div className="text-rose-400 font-bold">• Liquidation risk if price drops</div>
              </div>
            </div>
          </div>
        )}

        {/* 10. HOT VS COLD WALLET */}
        {type === 'hot-vs-cold-wallet' && (
          <div className="w-full max-w-md grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Wifi className="w-4 h-4" />
                <span>HOT WALLET</span>
              </div>
              <p className="text-[10px] text-slate-400">Connected to Internet (Metamask, Phantom, Exchange)</p>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <div>✅ Convenient for daily DeFi</div>
                <div>⚠️ Vulnerable to online malware & phishing</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <WifiOff className="w-4 h-4" />
                <span>COLD WALLET</span>
              </div>
              <p className="text-[10px] text-slate-400">Offline Hardware Device (Ledger, Trezor, Paper)</p>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <div>✅ 100% immune to online hacking</div>
                <div>🔒 Ideal for long-term wealth savings</div>
              </div>
            </div>
          </div>
        )}

        {/* 11. FVG & ORDER BLOCK */}
        {type === 'fvg-orderblock' && (
          <div className="w-full max-w-md p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-[11px] mb-2 border-b border-slate-800 pb-1">
              <span className="text-amber-400 font-bold">Fair Value Gap (FVG)</span>
              <span className="text-slate-400">3-Candle Institutional Void</span>
            </div>
            <div className="flex items-center justify-around py-4">
              <div className="text-center">
                <div className="w-8 h-12 bg-slate-700 mx-auto rounded-xs" />
                <div className="w-0.5 h-6 bg-slate-500 mx-auto" />
                <span className="text-[9px] text-slate-400 block mt-1">Candle 1</span>
              </div>

              {/* Middle Expansion Candle with FVG Highlight */}
              <div className="text-center relative px-3">
                <div className="w-10 h-28 bg-emerald-500 mx-auto rounded-xs border-2 border-emerald-300 shadow-md" />
                <div className="absolute inset-x-0 top-12 bottom-6 bg-amber-500/20 border-y border-dashed border-amber-400 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-amber-300 bg-slate-950/80 px-1 rounded">FVG GAP</span>
                </div>
                <span className="text-[9px] text-emerald-400 block mt-1 font-bold">Impulse Candle 2</span>
              </div>

              <div className="text-center">
                <div className="w-0.5 h-6 bg-slate-500 mx-auto" />
                <div className="w-8 h-12 bg-slate-700 mx-auto rounded-xs" />
                <span className="text-[9px] text-slate-400 block mt-1">Candle 3</span>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-1">
              {lang === 'my'
                ? 'Candle 1 ၏ အပေါ်မီးစာနှင့် Candle 3 ၏ အောက်မီးစာ မထိစပ်ဘဲ ကျန်ခဲ့သော ကွက်လပ်ကို စျေးနှုန်းက ပြန်ဆင်းဖြည့်လေ့ရှိသည်'
                : 'The void between Candle 1 Wick High and Candle 3 Wick Low acts like a price magnet'}
            </p>
          </div>
        )}

        {/* 12. MACRO WATERFALL */}
        {type === 'macro-waterfall' && (
          <div className="w-full max-w-sm space-y-1.5 text-xs text-center font-mono">
            <div className="p-2 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
              1. Central Banks (Interest Rates & Money Supply)
            </div>
            <div className="text-slate-500 text-xs">⬇️ Global Liquidity Flow</div>
            <div className="p-2 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300">
              2. US Dollar Index (DXY) & Risk Sentiment
            </div>
            <div className="text-slate-500 text-xs">⬇️ Capital Allocation</div>
            <div className="p-2 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-bold">
              3. Bitcoin (BTC Reserve Asset)
            </div>
            <div className="text-slate-500 text-xs">⬇️ Dominance & Rotation</div>
            <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              4. Altcoins (ETH, SOL, Small Caps)
            </div>
          </div>
        )}

        {/* 13. TRADING STYLES GRID */}
        {type === 'trading-styles-grid' && (
          <div className="w-full max-w-md grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-2 bg-slate-950 rounded-lg border border-amber-500/30">
              <span className="font-bold text-amber-400 block">⚡ Scalping</span>
              <span className="text-slate-400 block mt-1">1m - 5m</span>
              <span className="text-slate-500 block">Minutes to Hours</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-indigo-500/30">
              <span className="font-bold text-indigo-400 block">🔵 Swing Trading</span>
              <span className="text-slate-400 block mt-1">4H - 1D</span>
              <span className="text-slate-500 block">Days to Weeks</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-purple-500/30">
              <span className="font-bold text-purple-400 block">🟣 Long-Term</span>
              <span className="text-slate-400 block mt-1">1D - 1M</span>
              <span className="text-slate-500 block">Months to Years</span>
            </div>
          </div>
        )}

        {/* 14. DEFAULT / INDICATOR */}
        {(type === 'indicator-formula' || type === 'tokenomics-pie') && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-center text-slate-300 font-mono">
            <span className="text-amber-400 font-bold">
              Indicator + Market Structure + Price Action + Volume = High-Probability Context
            </span>
            <p className="mt-1 text-[11px] text-slate-400 font-sans">
              {lang === 'my'
                ? 'ညွှန်းကိန်းတစ်ခုတည်းကို မျက်စိမှိတ်မယုံဘဲ ဇယားတည်ဆောက်ပုံနှင့် Volume ကို ပေါင်းစပ်သုံးသပ်ပါ'
                : 'Never trade an indicator in isolation. Confluence creates your genuine statistical edge.'}
            </p>
          </div>
        )}
      </div>

      {(caption || captionMy) && (
        <p className="mt-2 text-xs text-slate-400 italic text-center font-sans border-t border-slate-800 pt-2">
          {lang === 'my' ? captionMy || caption : caption}
        </p>
      )}
    </div>
  );
};
