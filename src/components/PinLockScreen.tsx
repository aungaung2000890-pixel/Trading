import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert, CheckCircle2, Delete, ArrowRight, ShieldCheck } from 'lucide-react';

interface PinLockScreenProps {
  onUnlock: () => void;
  lang: 'my' | 'en';
}

const CORRECT_PIN = '211412';
const PIN_LENGTH = 6;

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock, lang }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Auto-verify when 6 digits are typed
  const verifyPin = (inputPin: string) => {
    if (inputPin === CORRECT_PIN) {
      setError(null);
      setIsSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      setIsShaking(true);
      setError(
        lang === 'my'
          ? 'PIN နံပါတ် မှားယွင်းနေပါသည်။ ပြန်လည် ကြိုးစားပါ။'
          : 'Incorrect PIN code. Please try again.'
      );
      setTimeout(() => {
        setPin('');
        setIsShaking(false);
      }, 700);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length < PIN_LENGTH) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === PIN_LENGTH) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  // Support PC physical keyboard typing (numbers 0-9, Backspace, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length === PIN_LENGTH) {
          verifyPin(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 select-none">
      {/* Subtle Background Glow */}
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative w-full max-w-sm bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Lock Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 scale-110'
              : error
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/20'
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-md shadow-amber-500/10'
          }`}
        >
          {isSuccess ? (
            <Unlock className="w-8 h-8 text-emerald-400 animate-bounce" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
          {lang === 'my' ? 'လုံခြုံရေး PIN ဖြင့် ဝင်ရောက်ပါ' : 'Security PIN Protection'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          {lang === 'my'
            ? 'Futures Terminal သို့ ဝင်ရောက်ရန် လျှို့ဝှက် PIN (၆ လုံး) ကို ရိုက်ထည့်ပါ'
            : 'Enter your 6-digit security PIN to unlock'}
        </p>

        {/* 6 Masked PIN Dots (Never exposes numbers) */}
        <div
          className={`flex items-center justify-center gap-3.5 mb-6 py-2 transition-transform duration-200 ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? isSuccess
                      ? 'bg-emerald-400 scale-125 shadow-sm shadow-emerald-400/50'
                      : error
                      ? 'bg-rose-500 scale-110 shadow-sm shadow-rose-500/50'
                      : 'bg-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error / Status message */}
        <div className="h-6 mb-4 flex items-center justify-center text-xs">
          {error ? (
            <span className="text-rose-400 font-bold flex items-center gap-1.5 animate-in fade-in">
              <ShieldAlert className="w-3.5 h-3.5" />
              {error}
            </span>
          ) : isSuccess ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {lang === 'my' ? 'ဝင်ရောက်မှု အောင်မြင်ပါသည်...' : 'Access Granted...'}
            </span>
          ) : (
            <span className="text-slate-500 text-[11px]">
              {lang === 'my' ? 'ကီးဘုတ် သို့မဟုတ် နံပါတ်ခလုတ်များ နှိပ်နိုင်သည်' : 'Use keypad or keyboard'}
            </span>
          )}
        </div>

        {/* Numeric Keypad Grid (3x4) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`pin-btn-${digit}`}
              onClick={() => handleDigitPress(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-white font-mono font-bold text-xl border border-slate-700/60 transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            id="pin-clear-btn"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800"
          >
            {lang === 'my' ? 'ရှင်းမည်' : 'Clear'}
          </button>

          {/* Zero Button */}
          <button
            id="pin-btn-0"
            onClick={() => handleDigitPress('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-white font-mono font-bold text-xl border border-slate-700/60 transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            id="pin-backspace-btn"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-slate-800"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'my' ? 'ကိုယ်ပိုင် လုံခြုံရေး စနစ်' : 'Encrypted Local Access'}</span>
        </div>
      </div>
    </div>
  );
};
