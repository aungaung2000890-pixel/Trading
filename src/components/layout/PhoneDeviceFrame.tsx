import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Wifi, BatteryMedium, Signal, Maximize2, Minimize2 } from 'lucide-react';
import { DeviceLayoutSelection, DeviceLayoutOption } from '../../types';

interface PhoneDeviceFrameProps {
  children: React.ReactNode;
  activeLayout: DeviceLayoutOption;
  layoutSelection: DeviceLayoutSelection;
  onSelectLayout: (selection: DeviceLayoutSelection) => void;
  lang: 'my' | 'en';
}

export const PhoneDeviceFrame: React.FC<PhoneDeviceFrameProps> = ({
  children,
  activeLayout,
  layoutSelection,
  onSelectLayout,
  lang,
}) => {
  // Check if viewport is physically a mobile screen
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // User preference to toggle the visible phone chassis frame on larger screens
  const [showFrameBezel, setShowFrameBezel] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Current system time for phone status bar
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const formattedHours = hours % 12 || 12;
      setCurrentTimeStr(`${formattedHours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // If on actual mobile phone screen, or if bezel is toggled off, render edge-to-edge
  if (isMobileViewport || !showFrameBezel) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
        {/* Floating Quick Bezel Toggle for easy preview on desktop when bezel is off */}
        {!isMobileViewport && (
          <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-xs flex items-center justify-between border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'ဖုန်းမုဒ် (Edge-to-Edge)' : 'Phone Mode (Full Edge-to-Edge)'}</span>
            </span>
            <button
              onClick={() => setShowFrameBezel(true)}
              className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-black text-[11px] cursor-pointer hover:bg-amber-400 transition flex items-center gap-1"
            >
              <Smartphone className="w-3 h-3" />
              <span>{lang === 'my' ? 'ဖုန်းဘောင် ပြသမည်' : 'Show Phone Frame'}</span>
            </button>
          </div>
        )}
        <div className="w-full flex-1 flex flex-col overflow-x-hidden">
          {children}
        </div>
      </div>
    );
  }

  // Desktop / Tablet mode with authentic Smartphone Device Frame ("ဖုန်းဘောင်")
  return (
    <div className="min-h-screen bg-slate-950 py-6 px-3 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Top Controls Toolbar for the Phone Mockup */}
      <div className="mb-4 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 max-w-md w-full shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">
              {lang === 'my' ? 'ဖုန်းဘောင်စနစ် (Phone Frame)' : 'Phone Device Mockup'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              390 × 844px · Mobile UI
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowFrameBezel(false)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
            title={lang === 'my' ? 'ဖုန်းဘောင် ဖြုတ်၍ Full Screen ကြည့်မည်' : 'Toggle Full Screen without frame'}
          >
            <Maximize2 className="w-3 h-3 text-slate-400" />
            <span>{lang === 'my' ? 'ဘောင်ဖြုတ်' : 'Edge-to-Edge'}</span>
          </button>

          <button
            onClick={() => onSelectLayout('desktop')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-amber-500/30"
            title={lang === 'my' ? 'Desktop မုဒ်သို့ ပြောင်းမည်' : 'Switch to Desktop Layout'}
          >
            <Monitor className="w-3 h-3" />
            <span>{lang === 'my' ? 'Desktop' : 'Desktop'}</span>
          </button>
        </div>
      </div>

      {/* Realistic Smartphone Chassis Frame ("ဖုန်းဘောင်") */}
      <div className="relative w-full max-w-[400px] h-[860px] max-h-[calc(100vh-100px)] rounded-[50px] border-[12px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)] flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden ring-1 ring-slate-800">
        {/* Smartphone Hardware Elements: Top Speaker Slit & Dynamic Island */}
        <div className="relative z-50 bg-white dark:bg-slate-950 pt-2 pb-1 px-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 select-none">
          {/* Status Bar Clock */}
          <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 pl-1">
            {currentTimeStr}
          </span>

          {/* Dynamic Island / Camera Notch Pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950 border border-blue-900" />
          </div>

          {/* Status Bar Hardware Icons */}
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 pr-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        </div>

        {/* Smartphone Screen Viewport - Perfectly Scrollable, ZERO Horizontal Overflow */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden w-full relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {children}
        </div>

        {/* Phone Bottom Home Indicator Bar */}
        <div className="bg-white dark:bg-slate-950 py-1.5 flex items-center justify-center border-t border-slate-200/40 dark:border-slate-800/40 select-none">
          <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
