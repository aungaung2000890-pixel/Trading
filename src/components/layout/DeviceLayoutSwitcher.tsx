import React from 'react';
import { Smartphone, Tablet, Monitor, Sparkles } from 'lucide-react';
import { DeviceLayoutOption, DeviceLayoutSelection } from '../../types';

interface DeviceLayoutSwitcherProps {
  currentSelection: DeviceLayoutSelection;
  activeLayout: DeviceLayoutOption;
  onSelectLayout: (selection: DeviceLayoutSelection) => void;
  lang: 'my' | 'en';
  compact?: boolean;
}

export const DeviceLayoutSwitcher: React.FC<DeviceLayoutSwitcherProps> = ({
  currentSelection,
  activeLayout,
  onSelectLayout,
  lang,
  compact = false,
}) => {
  const options: { id: DeviceLayoutSelection; labelEn: string; labelMy: string; icon: React.ElementType; tag: string }[] = [
    {
      id: 'phone',
      labelEn: 'Phone',
      labelMy: 'ဖုန်း',
      icon: Smartphone,
      tag: '📱 Mobile-First',
    },
    {
      id: 'tablet',
      labelEn: 'Tablet',
      labelMy: 'တက်ဘလက်',
      icon: Tablet,
      tag: '📲 Dual-Pane',
    },
    {
      id: 'desktop',
      labelEn: 'Desktop',
      labelMy: 'ကွန်ပျူတာ',
      icon: Monitor,
      tag: '🖥 Pro Station',
    },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = currentSelection === opt.id || (currentSelection === 'auto' && activeLayout === opt.id);
        const isExplicit = currentSelection === opt.id;

        return (
          <button
            key={opt.id}
            id={`device-layout-${opt.id}-btn`}
            onClick={() => onSelectLayout(opt.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isExplicit
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : isSelected
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
            }`}
            title={`${lang === 'my' ? opt.labelMy : opt.labelEn} (${opt.tag})`}
          >
            <Icon className="w-3.5 h-3.5" />
            {!compact && <span>{lang === 'my' ? opt.labelMy : opt.labelEn}</span>}
          </button>
        );
      })}

      {/* Auto Detection Mode Button */}
      <button
        id="device-layout-auto-btn"
        onClick={() => onSelectLayout('auto')}
        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
          currentSelection === 'auto'
            ? 'bg-indigo-600 text-white shadow-xs font-black'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        title={
          lang === 'my'
            ? `အလိုအလျောက် စခရင်အရွယ်အစားအလိုက် သတ်မှတ်မည် (လက်ရှိ: ${activeLayout})`
            : `Auto-adapt to browser window size (Active: ${activeLayout})`
        }
      >
        <Sparkles className="w-3 h-3" />
        <span className="hidden xl:inline">{lang === 'my' ? 'Auto' : 'Auto'}</span>
      </button>
    </div>
  );
};
