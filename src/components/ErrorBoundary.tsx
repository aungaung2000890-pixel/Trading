import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  lang?: 'my' | 'en';
  onReset?: () => void;
  onGoHome?: () => void;
  componentName?: string;
  viewName?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const isMy = this.props.lang !== 'en';
      const title =
        this.props.fallbackTitle ||
        (isMy
          ? 'ဤအပိုင်းကို ပြသရာတွင် ယာယီအမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်'
          : 'A temporary rendering issue occurred in this section');

      const message =
        this.props.fallbackMessage ||
        (isMy
          ? 'စနစ်အချက်အလက်များကို ရယူစဉ် ချို့ယွင်းချက်ဖြစ်သွားခြင်းဖြစ်ပါသည်။ အောက်ပါခလုတ်ကို နှိပ်၍ ပြန်လည်စတင်နိုင်ပါသည် သို့မဟုတ် ပင်မစာမျက်နှာသို့ ပြန်သွားနိုင်ပါသည်။'
          : 'An unexpected runtime error was caught safely without crashing the whole application. You can reload this view or return to the main dashboard.');

      return (
        <div
          id="error-boundary-fallback"
          className="w-full my-4 p-6 rounded-2xl bg-[#131722] border border-rose-500/30 shadow-2xl text-white font-sans animate-in fade-in duration-200"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  SAFE RECOVERY MODE
                </span>
                {this.props.componentName && (
                  <span className="text-xs text-slate-400 font-mono">
                    [{this.props.componentName}]
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">{title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-5 mt-5 border-t border-slate-800">
            <button
              id="error-reset-btn"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-lg shadow-blue-600/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isMy ? 'ပြန်လည်စတင်မည်' : 'Reload & Recover View'}</span>
            </button>

            {this.props.onGoHome && (
              <button
                id="error-home-btn"
                onClick={this.props.onGoHome}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer active:scale-95 border border-slate-700"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{isMy ? 'ပင်မစာမျက်နှာသို့' : 'Return to Home'}</span>
              </button>
            )}

            {this.state.error && (
              <details className="w-full mt-2 text-left">
                <summary className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer font-mono select-none">
                  {isMy ? 'နည်းပညာဆိုင်ရာ အသေးစိတ် ကြည့်ရှုရန်' : 'View Technical Diagnostics'}
                </summary>
                <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto">
                  <div className="font-bold">{this.state.error.name}: {this.state.error.message}</div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
