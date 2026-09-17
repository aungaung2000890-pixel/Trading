import React, { useEffect } from 'react';
import {
  BellRing,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RotateCcw,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { AlertToastItem } from '../types';

interface PriceAlertToastProps {
  toasts: AlertToastItem[];
  onDismiss: (toastId: string) => void;
  onClearAll?: () => void;
  onViewAlerts?: () => void;
  onViewCoin?: (symbol: string) => void;
  onRearm?: (alertId: string) => void;
  lang: 'my' | 'en';
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
  toasts,
  onDismiss,
  onViewCoin,
  onRearm,
  lang,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="price-alert-toast-container"
      className="fixed top-4 sm:top-6 right-3 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-[94vw] sm:max-w-md w-full pointer-events-none"
      role="region"
      aria-live="assertive"
      aria-label="Price Alert Notifications"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onViewCoin={onViewCoin}
          onRearm={onRearm}
          lang={lang}
        />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: AlertToastItem;
  onDismiss: (id: string) => void;
  onViewCoin?: (symbol: string) => void;
  onRearm?: (alertId: string) => void;
  lang: 'my' | 'en';
}

const ToastCard: React.FC<ToastCardProps> = ({
  toast,
  onDismiss,
  onViewCoin,
  onRearm,
  lang,
}) => {
  const isAbove = toast.type === 'PRICE_ABOVE';

  // Auto dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 10000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const formattedCurrentPrice =
    toast.currentPrice >= 1
      ? toast.currentPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : toast.currentPrice.toFixed(6);

  const formattedTargetPrice =
    toast.targetPrice >= 1
      ? toast.targetPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : toast.targetPrice.toFixed(6);

  return (
    <div
      id={`alert-toast-${toast.id}`}
      className={`pointer-events-auto rounded-2xl p-4 shadow-2xl backdrop-blur-md border transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
        isAbove
          ? 'bg-slate-900/95 dark:bg-slate-950/95 border-emerald-500/80 shadow-emerald-500/20 text-white'
          : 'bg-slate-900/95 dark:bg-slate-950/95 border-amber-500/80 shadow-amber-500/20 text-white'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isAbove
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
            }`}
          >
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                {toast.symbol}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1">
                {lang === 'my'
                  ? '🎯 စျေးနှုန်းပစ်မှတ် ရောက်ရှိပါပြီ!'
                  : '🎯 Price Alert Target Reached!'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {isAbove
                ? lang === 'my'
                  ? 'သတ်မှတ်ထားသော အထက်စျေးနှုန်းသို့ ရောက်ရှိသွားပါပြီ'
                  : 'Target threshold breached to the upside'
                : lang === 'my'
                ? 'သတ်မှတ်ထားသော အောက်စျေးနှုန်းသို့ ကျဆင်းရောက်ရှိပါပြီ'
                : 'Target threshold breached to the downside'}
            </p>
          </div>
        </div>

        {/* Dismiss Close Button */}
        <button
          id={`dismiss-alert-toast-${toast.id}`}
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
          title={lang === 'my' ? 'ပိတ်မည်' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Target & Live Price Details Box */}
      <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 mb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            {lang === 'my' ? 'လက်ရှိစျေး (Live Price)' : 'Current Live Price'}
          </span>
          <div className="text-base font-black text-white flex items-center gap-1">
            {isAbove ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-amber-400" />
            )}
            <span>${formattedCurrentPrice}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            {lang === 'my' ? 'သတ်မှတ်ပစ်မှတ် (Threshold)' : 'Target Threshold'}
          </span>
          <span
            className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded ${
              isAbove
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isAbove ? '≥ ' : '≤ '}${formattedTargetPrice}
          </span>
        </div>
      </div>

      {/* User Note (if provided) */}
      {toast.note && (
        <div className="mb-2.5 px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-800/50 text-[11px] text-indigo-200 flex items-center gap-1.5">
          <span className="font-semibold">📌 {lang === 'my' ? 'မှတ်ချက်:' : 'Note:'}</span>
          <span className="truncate">{toast.note}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5">
          {onViewCoin && (
            <button
              id={`toast-view-coin-${toast.symbol.toLowerCase()}`}
              onClick={() => {
                onViewCoin(toast.symbol);
                onDismiss(toast.id);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 transition shadow-xs cursor-pointer active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'Coin စစ်ဆေးမည်' : 'View Coin'}</span>
            </button>
          )}

          {onRearm && (
            <button
              id={`toast-rearm-${toast.id}`}
              onClick={() => {
                onRearm(toast.alertId);
                onDismiss(toast.id);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
              title={lang === 'my' ? 'သတိပေးချက် ပြန်ဖွင့်မည်' : 'Re-arm this alert'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'ပြန်ဖွင့်မည်' : 'Re-arm'}</span>
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white text-xs font-medium px-2 py-1 cursor-pointer"
        >
          {lang === 'my' ? 'ပိတ်မည်' : 'Dismiss'}
        </button>
      </div>

      {/* Auto-dismiss animated progress bar */}
      <div className="w-full bg-slate-800/50 h-1 rounded-full mt-2.5 overflow-hidden">
        <div
          className={`h-full animate-[shimmer_10s_linear] ${
            isAbove ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};
