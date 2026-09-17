import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Globe2,
  Clock,
  Palette,
  TrendingUp,
  Bell,
  Check,
  RotateCcw,
  Shield,
  Layout,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  Layers,
  Move,
  Maximize2,
} from 'lucide-react';
import {
  AppSettings,
  AppTheme,
  AccentColor,
  CardTransparency,
  MarketClockSettings,
} from '../types';
import { ALL_WORLD_CITIES } from '../utils/marketTiming';
import {
  TERMINAL_WALLPAPER_PRESETS,
  LOGO_PRESETS,
  DEFAULT_LOGO_SETTINGS,
  DEFAULT_BACKGROUND_SETTINGS,
} from '../utils/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetSettings: () => void;
  lang?: 'my' | 'en';
  onLanguageChange?: (lang: 'my' | 'en') => void;
  initialTab?: 'general' | 'branding' | 'appearance' | 'clock' | 'trading' | 'market' | 'alerts';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetSettings,
  lang,
  onLanguageChange,
  initialTab = 'general',
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'appearance' | 'clock' | 'trading' | 'market' | 'alerts'>(initialTab);
  const [saveToast, setSaveToast] = useState(false);
  const [bgUrlInput, setBgUrlInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, settings, initialTab]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  const isMy = localSettings.general.language === 'my';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {isMy ? 'အက်ပ် စနစ်ချိန်ညှိမှု ဗဟို (Settings Center)' : 'Settings & Preferences Center'}
              </h3>
              <p className="text-xs text-slate-400">
                {isMy ? 'ဘာသာစကား၊ အပြင်အဆင်၊ စျေးကွက်နာရီများနှင့် စွန့်စားမှုဆိုင်ရာ ပြင်ဆင်ချက်များ' : 'Custom appearance, session clocks, risk engine, and alerts'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'general', labelEn: 'General', labelMy: 'အထွေထွေ', icon: Globe2 },
            { id: 'branding', labelEn: 'Logo & Wallpaper', labelMy: 'လိုဂို & နောက်ခံပုံ', icon: ImageIcon },
            { id: 'appearance', labelEn: 'Theme', labelMy: 'အပြင်အဆင်', icon: Palette },
            { id: 'clock', labelEn: 'Market Clocks', labelMy: 'ကမ္ဘာ့နာရီ', icon: Clock },
            { id: 'trading', labelEn: 'Trading Risk', labelMy: 'စွန့်စားမှု', icon: Shield },
            { id: 'market', labelEn: 'Markets', labelMy: 'စျေးကွက်', icon: TrendingUp },
            { id: 'alerts', labelEn: 'Alerts', labelMy: 'အချက်ပေးသံ', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isMy ? tab.labelMy : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'အသုံးပြုမည့် ဘာသာစကား (Language):' : 'Interface Language:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        general: { ...localSettings.general, language: 'my' },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      localSettings.general.language === 'my'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm block text-white">မြန်မာဘာသာ</span>
                      <span className="text-[11px] text-slate-400">Myanmar Language</span>
                    </div>
                    {localSettings.general.language === 'my' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        general: { ...localSettings.general, language: 'en' },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      localSettings.general.language === 'en'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm block text-white">English</span>
                      <span className="text-[11px] text-slate-400">Default Global</span>
                    </div>
                    {localSettings.general.language === 'en' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'မူလဖွင့်လှစ်မည့် Trading Mode:' : 'Default Trading Mode on Launch:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'quick', label: 'Quick Mode' },
                    { id: 'deep', label: 'Deep Analysis' },
                    { id: 'ask_ai', label: 'Ask AI Mode' },
                    { id: 'high_leverage', label: '⚡ High Leverage' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          general: { ...localSettings.general, defaultTradingMode: m.id as any },
                        })
                      }
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        localSettings.general.defaultTradingMode === m.id
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    {isMy ? 'အချိန်ဖော်ပြမှု ပုံစံ:' : 'Time Format:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          general: { ...localSettings.general, timeFormat: '12h' },
                        })
                      }
                      className={`py-2 rounded-lg text-xs font-semibold border ${
                        localSettings.general.timeFormat === '12h'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      12-Hour (AM/PM)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          general: { ...localSettings.general, timeFormat: '24h' },
                        })
                      }
                      className={`py-2 rounded-lg text-xs font-semibold border ${
                        localSettings.general.timeFormat === '24h'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      24-Hour (Military)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    {isMy ? 'မူလ ဖယောင်းတိုင် Timeframe:' : 'Default Chart Timeframe:'}
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {['5M', '15M', '1H', '4H'].map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() =>
                          setLocalSettings({
                            ...localSettings,
                            general: { ...localSettings.general, defaultTimeframe: tf },
                          })
                        }
                        className={`py-2 rounded-lg text-xs font-mono font-bold border ${
                          localSettings.general.defaultTimeframe === tf
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BRANDING & WALLPAPER (LOGO UPLOAD & CUSTOM BACKGROUND CONTROLS) */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* SECTION 1: CUSTOM LOGO UPLOAD & STYLING */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {isMy ? '၁။ စိတ်ကြိုက် Logo တင်ခြင်း & စတိုင်လ်' : '1. Custom Logo Upload & Style'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isMy ? 'မိမိတံဆိပ် Logo ဖိုင်ကို Upload တင်ပါ သို့မဟုတ် Preset များမှ ရွေးချယ်ပါ' : 'Upload your own logo image or choose from curated brand presets'}
                      </p>
                    </div>
                  </div>

                  {localSettings.appearance.logo.customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSettings({
                          ...localSettings,
                          appearance: {
                            ...localSettings.appearance,
                            logo: {
                              ...localSettings.appearance.logo,
                              customLogoUrl: null,
                            },
                          },
                        });
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isMy ? 'Logo ဖျက်မည်' : 'Remove Logo'}</span>
                    </button>
                  )}
                </div>

                {/* Live Logo Preview Box */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 font-medium">
                    {isMy ? 'Header & Sidebar ပေါ်တွင် မြင်ရမည့်ပုံစံ:' : 'Live Terminal Header Preview:'}
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                    {localSettings.appearance.logo.customLogoUrl ? (
                      <img
                        src={localSettings.appearance.logo.customLogoUrl}
                        alt="Logo Preview"
                        style={{ height: `${localSettings.appearance.logo.logoHeight}px` }}
                        className={`object-contain max-w-[130px] ${
                          localSettings.appearance.logo.shape === 'circle'
                            ? 'rounded-full'
                            : localSettings.appearance.logo.shape === 'pill'
                            ? 'rounded-2xl'
                            : localSettings.appearance.logo.shape === 'rounded'
                            ? 'rounded-lg'
                            : 'rounded-none'
                        }`}
                      />
                    ) : (
                      <div
                        className={`flex items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-500 ${
                          localSettings.appearance.logo.shape === 'circle'
                            ? 'rounded-full'
                            : localSettings.appearance.logo.shape === 'pill'
                            ? 'rounded-2xl'
                            : localSettings.appearance.logo.shape === 'rounded'
                            ? 'rounded-xl'
                            : 'rounded-none'
                        }`}
                        style={{
                          width: `${localSettings.appearance.logo.logoHeight}px`,
                          height: `${localSettings.appearance.logo.logoHeight}px`,
                        }}
                      >
                        <Zap className="w-5 h-5 text-amber-400" />
                      </div>
                    )}
                    {localSettings.appearance.logo.showText && (
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">
                          {localSettings.appearance.logo.logoText || 'Trade by KA'}
                        </span>
                        <span className="text-[10px] text-amber-400/90 font-mono font-medium">
                          PRO TERMINAL
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Upload & Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {isMy ? 'မိမိ Logo ဖိုင် တင်မည် (PNG / SVG / JPG):' : 'Upload Logo File (PNG / SVG / JPG):'}
                    </label>
                    <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-900/80 hover:bg-slate-900 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-center group">
                      <Upload className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-200">
                        {isMy ? 'ဖိုင်ရွေးချယ်ရန် နှိပ်ပါ' : 'Click to select image file'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isMy ? 'သို့မဟုတ် drag & drop ဆွဲထည့်ပါ (max 3MB)' : 'or drag & drop here (max 3MB)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const res = ev.target?.result as string;
                              if (res) {
                                setLocalSettings({
                                  ...localSettings,
                                  appearance: {
                                    ...localSettings.appearance,
                                    logo: {
                                      ...localSettings.appearance.logo,
                                      customLogoUrl: res,
                                    },
                                  },
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {isMy ? 'Preset တံဆိပ် အိုင်ကွန်များ:' : 'Or Curated Icon Presets:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {LOGO_PRESETS.map((preset) => {
                        const isSelected =
                          localSettings.appearance.logo.presetId === preset.id &&
                          !localSettings.appearance.logo.customLogoUrl;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setLocalSettings({
                                ...localSettings,
                                appearance: {
                                  ...localSettings.appearance,
                                  logo: {
                                    ...localSettings.appearance.logo,
                                    customLogoUrl: null,
                                    presetId: preset.id,
                                  },
                                },
                              })
                            }
                            className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/15 text-white font-bold'
                                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs truncate">{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Brand Title Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    {isMy ? 'Terminal အမည် / Brand Title စာသား:' : 'Terminal / Brand Title Text:'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={localSettings.appearance.logo.logoText}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          appearance: {
                            ...localSettings.appearance,
                            logo: {
                              ...localSettings.appearance.logo,
                              logoText: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Trade by KA"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.appearance.logo.showText}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            appearance: {
                              ...localSettings.appearance,
                              logo: {
                                ...localSettings.appearance.logo,
                                showText: e.target.checked,
                              },
                            },
                          })
                        }
                        className="w-3.5 h-3.5 accent-amber-500"
                      />
                      <span>{isMy ? 'စာသားပြမည်' : 'Show Text'}</span>
                    </label>
                  </div>
                </div>

                {/* Height & Shape */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>{isMy ? 'Logo အမြင့် (Height):' : 'Logo Height:'}</span>
                      <span className="font-mono font-bold text-amber-400">
                        {localSettings.appearance.logo.logoHeight}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="56"
                      step="2"
                      value={localSettings.appearance.logo.logoHeight}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          appearance: {
                            ...localSettings.appearance,
                            logo: {
                              ...localSettings.appearance.logo,
                              logoHeight: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      {isMy ? 'Logo ပုံသဏ္ဌာန် (Shape):' : 'Logo Container Shape:'}
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'rounded', name: 'Rounded' },
                        { id: 'circle', name: 'Circle' },
                        { id: 'pill', name: 'Pill' },
                        { id: 'square', name: 'Square' },
                      ].map((sh) => (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() =>
                            setLocalSettings({
                              ...localSettings,
                              appearance: {
                                ...localSettings.appearance,
                                logo: {
                                  ...localSettings.appearance.logo,
                                  shape: sh.id as any,
                                },
                              },
                            })
                          }
                          className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            localSettings.appearance.logo.shape === sh.id
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {sh.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOM BACKGROUND / WALLPAPER CONTROLS */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {isMy ? '၂။ စိတ်ကြိုက် နောက်ခံ Wallpaper ချိန်ညှိမှု' : '2. Custom Wallpaper & Background Controls'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isMy ? 'ပုံတင်ခြင်း၊ နေရာချထားမှု (Position)၊ ချဲ့ခြင်း (Scale)၊ လင်းအား (Brightness)၊ မှိန်အား (Opacity) နှင့် ဝေဝါးမှု (Blur)' : 'Upload or choose image, control position, scale, brightness, opacity, & blur'}
                      </p>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={localSettings.appearance.background.enabled}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          appearance: {
                            ...localSettings.appearance,
                            background: {
                              ...localSettings.appearance.background,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {localSettings.appearance.background.enabled
                        ? (isMy ? 'ဖွင့်ထားသည်' : 'Enabled')
                        : (isMy ? 'ပိတ်ထားသည်' : 'Disabled')}
                    </span>
                  </label>
                </div>

                {/* Interactive Live Wallpaper Preview Stage */}
                <div className="relative h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between p-3.5">
                  {/* Background Layer with User Parameters */}
                  {localSettings.appearance.background.enabled && localSettings.appearance.background.imageUrl && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-200"
                      style={{
                        backgroundImage: `url(${localSettings.appearance.background.imageUrl})`,
                        backgroundPosition:
                          localSettings.appearance.background.position === 'custom'
                            ? `${localSettings.appearance.background.positionCustomX}% ${localSettings.appearance.background.positionCustomY}%`
                            : localSettings.appearance.background.position,
                        backgroundSize:
                          localSettings.appearance.background.scale === 'custom'
                            ? `${localSettings.appearance.background.scalePercent}%`
                            : localSettings.appearance.background.scale,
                        backgroundRepeat: localSettings.appearance.background.repeat,
                        opacity: localSettings.appearance.background.opacity / 100,
                        filter: `brightness(${localSettings.appearance.background.brightness}%) blur(${localSettings.appearance.background.blur}px)`,
                      }}
                    />
                  )}

                  {/* Foreground overlay sample showing text readability */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                      LIVE PREVIEW HUD
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300">
                      Opacity: {localSettings.appearance.background.opacity}% | Blur: {localSettings.appearance.background.blur}px
                    </span>
                  </div>

                  <div className="relative z-10 max-w-sm p-3 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>BTC/USDT Perp</span>
                      <span className="text-emerald-400 font-mono">+4.82%</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Live Terminal Readability Check</span>
                      <span className="text-amber-400 font-mono">$68,450.00</span>
                    </div>
                  </div>
                </div>

                {/* Upload Wallpaper or URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {isMy ? 'မိမိ စိတ်ကြိုက် နောက်ခံပုံ တင်မည်:' : 'Upload Custom Wallpaper File:'}
                    </label>
                    <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-slate-900/80 hover:bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition text-center group">
                      <Upload className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-200">
                        {isMy ? 'နောက်ခံပုံ ရွေးရန် နှိပ်ပါ' : 'Select Wallpaper File'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isMy ? 'PNG, JPG, WebP (max 5MB)' : 'PNG, JPG, WebP (max 5MB)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const res = ev.target?.result as string;
                              if (res) {
                                setLocalSettings({
                                  ...localSettings,
                                  appearance: {
                                    ...localSettings.appearance,
                                    background: {
                                      ...localSettings.appearance.background,
                                      enabled: true,
                                      imageUrl: res,
                                    },
                                  },
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {isMy ? 'သို့မဟုတ် Image Web Link ထည့်ပါ:' : 'Or Paste Image URL Link:'}
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          value={bgUrlInput}
                          onChange={(e) => setBgUrlInput(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (bgUrlInput.trim()) {
                              setLocalSettings({
                                ...localSettings,
                                appearance: {
                                  ...localSettings.appearance,
                                  background: {
                                    ...localSettings.appearance.background,
                                    enabled: true,
                                    imageUrl: bgUrlInput.trim(),
                                  },
                                },
                              });
                            }
                          }}
                          className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          {isMy ? 'သုံးမည်' : 'Apply'}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {isMy ? 'Unsplash သို့မဟုတ် တိုက်ရိုက် image URL ထည့်သွင်းနိုင်သည်' : 'Paste any direct https image URL'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preset Wallpapers Grid */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    {isMy ? 'Curated Terminal Wallpaper Presets များ:' : 'Curated Terminal Wallpaper Presets:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {TERMINAL_WALLPAPER_PRESETS.map((preset) => {
                      const isSel =
                        localSettings.appearance.background.imageUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            setLocalSettings({
                              ...localSettings,
                              appearance: {
                                ...localSettings.appearance,
                                background: {
                                  ...localSettings.appearance.background,
                                  enabled: true,
                                  imageUrl: preset.url,
                                  presetId: preset.id,
                                },
                              },
                            })
                          }
                          className={`group relative rounded-xl overflow-hidden border h-20 text-left transition cursor-pointer ${
                            isSel
                              ? 'border-amber-400 ring-2 ring-amber-400/40'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <img
                            src={preset.thumbnail}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1.5 flex flex-col justify-end">
                            <span className="text-[10px] font-bold text-white leading-tight truncate">
                              {isMy ? preset.nameMy : preset.name}
                            </span>
                          </div>
                          {isSel && (
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-slate-950">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CONTROLS: POSITION, SCALE, BRIGHTNESS, OPACITY, BLUR */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isMy ? 'အသေးစိတ် ချိန်ညှိမှု ကွန်ထရိုးများ' : 'Position, Scale, Brightness, Opacity & Blur Controls'}</span>
                  </h5>

                  {/* 1. POSITION CONTROLS */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                      <span className="font-semibold">{isMy ? 'နေရာချထားမှု (Position):' : 'Background Position:'}</span>
                      <span className="font-mono text-amber-400 text-[11px]">
                        {localSettings.appearance.background.position.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {[
                        { id: 'center', name: 'Center' },
                        { id: 'top', name: 'Top' },
                        { id: 'bottom', name: 'Bottom' },
                        { id: 'left', name: 'Left' },
                        { id: 'right', name: 'Right' },
                        { id: 'custom', name: 'Custom X/Y' },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() =>
                            setLocalSettings({
                              ...localSettings,
                              appearance: {
                                ...localSettings.appearance,
                                background: {
                                  ...localSettings.appearance.background,
                                  position: pos.id as any,
                                },
                              },
                            })
                          }
                          className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            localSettings.appearance.background.position === pos.id
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {pos.name}
                        </button>
                      ))}
                    </div>

                    {localSettings.appearance.background.position === 'custom' && (
                      <div className="grid grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-800">
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>Horizontal X Position:</span>
                            <span className="text-amber-400 font-mono">
                              {localSettings.appearance.background.positionCustomX}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={localSettings.appearance.background.positionCustomX}
                            onChange={(e) =>
                              setLocalSettings({
                                ...localSettings,
                                appearance: {
                                  ...localSettings.appearance,
                                  background: {
                                    ...localSettings.appearance.background,
                                    positionCustomX: Number(e.target.value),
                                  },
                                },
                              })
                            }
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>Vertical Y Position:</span>
                            <span className="text-amber-400 font-mono">
                              {localSettings.appearance.background.positionCustomY}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={localSettings.appearance.background.positionCustomY}
                            onChange={(e) =>
                              setLocalSettings({
                                ...localSettings,
                                appearance: {
                                  ...localSettings.appearance,
                                  background: {
                                    ...localSettings.appearance.background,
                                    positionCustomY: Number(e.target.value),
                                  },
                                },
                              })
                            }
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. SCALE CONTROLS */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                      <span className="font-semibold">{isMy ? 'ချဲ့ထွင်မှု စကေး (Scale):' : 'Background Scale:'}</span>
                      <span className="font-mono text-amber-400 text-[11px]">
                        {localSettings.appearance.background.scale === 'custom'
                          ? `${localSettings.appearance.background.scalePercent}%`
                          : localSettings.appearance.background.scale.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cover', name: 'Cover (Fill Screen)' },
                        { id: 'contain', name: 'Contain (Fit Ratio)' },
                        { id: 'custom', name: 'Custom Zoom %' },
                      ].map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() =>
                            setLocalSettings({
                              ...localSettings,
                              appearance: {
                                ...localSettings.appearance,
                                background: {
                                  ...localSettings.appearance.background,
                                  scale: sc.id as any,
                                },
                              },
                            })
                          }
                          className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            localSettings.appearance.background.scale === sc.id
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {sc.name}
                        </button>
                      ))}
                    </div>

                    {localSettings.appearance.background.scale === 'custom' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Zoom Scale Percentage:</span>
                          <span className="text-amber-400 font-mono">
                            {localSettings.appearance.background.scalePercent}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="250"
                          step="5"
                          value={localSettings.appearance.background.scalePercent}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              appearance: {
                                ...localSettings.appearance,
                                background: {
                                  ...localSettings.appearance.background,
                                  scalePercent: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* 3. BRIGHTNESS, OPACITY, BLUR SLIDERS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {/* Brightness */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span>{isMy ? 'လင်းအား (Brightness):' : 'Brightness:'}</span>
                        <span className="font-mono font-bold text-amber-400">
                          {localSettings.appearance.background.brightness}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="150"
                        step="5"
                        value={localSettings.appearance.background.brightness}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            appearance: {
                              ...localSettings.appearance,
                              background: {
                                ...localSettings.appearance.background,
                                brightness: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span>10% Dim</span>
                        <span>150% Bright</span>
                      </div>
                    </div>

                    {/* Opacity */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span>{isMy ? 'မှိန်အား (Opacity):' : 'Opacity:'}</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {localSettings.appearance.background.opacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="1"
                        value={localSettings.appearance.background.opacity}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            appearance: {
                              ...localSettings.appearance,
                              background: {
                                ...localSettings.appearance.background,
                                opacity: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span>5% Ghost</span>
                        <span>100% Solid</span>
                      </div>
                    </div>

                    {/* Blur */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span>{isMy ? 'ဝေဝါးမှု (Blur):' : 'Blur:'}</span>
                        <span className="font-mono font-bold text-purple-400">
                          {localSettings.appearance.background.blur}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        step="1"
                        value={localSettings.appearance.background.blur}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            appearance: {
                              ...localSettings.appearance,
                              background: {
                                ...localSettings.appearance.background,
                                blur: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full accent-purple-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span>0px Sharp</span>
                        <span>25px Soft</span>
                      </div>
                    </div>
                  </div>

                  {/* Reset Background Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <span>
                      {isMy ? '💡 အကြံပြုချက်: Opacity ကို 20%-35% ထားရှိခြင်းသည် ဖယောင်းတိုင်ဂရပ်များနှင့် စာသားများကို အကြည်လင်ဆုံး ဖတ်ရှုနိုင်စေပါသည်' : '💡 Tip: 20%-35% opacity provides the clearest readability for charts & data'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          appearance: {
                            ...localSettings.appearance,
                            background: DEFAULT_BACKGROUND_SETTINGS,
                          },
                        })
                      }
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer shrink-0 ml-2"
                    >
                      {isMy ? 'နောက်ခံပုံ မူလပြန်ထားမည်' : 'Reset Background'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'အပြင်အဆင် Theme ရွေးချယ်မှု:' : 'Terminal Color Theme:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'dark_trading', name: 'Dark Trading (Default)', icon: Moon },
                    { id: 'midnight', name: 'Midnight Blue', icon: Moon },
                    { id: 'graphite', name: 'Graphite Dark', icon: Moon },
                    { id: 'light_trading', name: 'Light Trading', icon: Sun },
                    { id: 'cyber_neon', name: 'Cyber Neon', icon: Sparkles },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          setLocalSettings({
                            ...localSettings,
                            appearance: {
                              ...localSettings.appearance,
                              theme: theme.id as AppTheme,
                            },
                          })
                        }
                        className={`p-3 rounded-xl border flex items-center gap-2 text-left text-xs font-semibold transition ${
                          localSettings.appearance.theme === theme.id
                            ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{theme.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'Accent Highlight အရောင်:' : 'Accent Highlight Color:'}
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'amber', name: 'Amber Gold', hex: '#f59e0b' },
                    { id: 'emerald', name: 'Emerald Green', hex: '#10b981' },
                    { id: 'cyan', name: 'Cyan Blue', hex: '#06b6d4' },
                    { id: 'blue', name: 'Electric Blue', hex: '#3b82f6' },
                    { id: 'purple', name: 'Neon Purple', hex: '#a855f7' },
                    { id: 'rose', name: 'Rose Red', hex: '#f43f5e' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          appearance: {
                            ...localSettings.appearance,
                            accentColor: acc.id as AccentColor,
                          },
                        })
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                        localSettings.appearance.accentColor === acc.id
                          ? 'border-white bg-slate-800 text-white font-bold ring-2 ring-amber-400/30'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: acc.hex }} />
                      <span>{acc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'ကတ်များ နောက်ခံ ဖောက်ထွင်းမြင်နိုင်မှု (Card Transparency):' : 'Card Transparency:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'subtle', name: 'Subtle Glass' },
                    { id: 'medium', name: 'Medium Frost' },
                    { id: 'opaque', name: 'Solid Opaque' },
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          appearance: {
                            ...localSettings.appearance,
                            cardTransparency: ct.id as CardTransparency,
                          },
                        })
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                        localSettings.appearance.cardTransparency === ct.id
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {ct.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLOCK SETTINGS */}
          {activeTab === 'clock' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'ဒိုင်ခွက်ပေါ်တွင် ပြသလိုသော မြို့များ:' : 'Active Cities on Dashboard:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_WORLD_CITIES.map((city) => {
                    const isActive = localSettings.clock.activeCityIds.includes(city.id);
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          const list = localSettings.clock.activeCityIds;
                          if (isActive) {
                            if (list.length <= 1) return;
                            setLocalSettings({
                              ...localSettings,
                              clock: {
                                ...localSettings.clock,
                                activeCityIds: list.filter((id) => id !== city.id),
                              },
                            });
                          } else {
                            setLocalSettings({
                              ...localSettings,
                              clock: {
                                ...localSettings.clock,
                                activeCityIds: [...list, city.id],
                              },
                            });
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{city.flag}</span>
                          <span>{city.city}</span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles for dial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  {
                    key: 'showSeconds',
                    title: isMy ? 'စက္ကန့်လက်တံ ဖော်ပြမည်' : 'Show Second Hand',
                  },
                  {
                    key: 'showDigitalTime',
                    title: isMy ? 'ဒစ်ဂျစ်တယ် အချိန်ဖော်ပြမည်' : 'Show Digital Time',
                  },
                  {
                    key: 'showUtcOffset',
                    title: isMy ? 'UTC Offset ဖော်ပြမည်' : 'Show UTC Offset',
                  },
                  {
                    key: 'showMarketStatus',
                    title: isMy ? 'စျေးကွက် အခြေအနေ (Open/Closed)' : 'Show Market Session Status',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer"
                  >
                    <span className="text-xs font-medium text-slate-300">{item.title}</span>
                    <input
                      type="checkbox"
                      checked={(localSettings.clock.settings as any)[item.key]}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          clock: {
                            ...localSettings.clock,
                            settings: {
                              ...localSettings.clock.settings,
                              [item.key]: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TRADING RISK */}
          {activeTab === 'trading' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'အော်ဒါတစ်ခုလျှင် အများဆုံး ဆုံးရှုံးနိုင်ခြေ (Max Risk %):' : 'Max Risk per Trade (% of Balance):'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 2, 3].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          trading: { ...localSettings.trading, maxRiskPercent: r },
                        })
                      }
                      className={`py-2 rounded-xl text-xs font-mono font-bold border ${
                        localSettings.trading.maxRiskPercent === r
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'မူလ Leverage သတ်မှတ်ချက်:' : 'Default Leverage Multiplier:'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[10, 20, 25, 50, 75].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          trading: { ...localSettings.trading, defaultLeverage: lev },
                        })
                      }
                      className={`py-2 rounded-xl text-xs font-mono font-bold border ${
                        localSettings.trading.defaultLeverage === lev
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'ကုန်သွယ်မှု စတိုင် (Trading Style):' : 'Trading Style Focus:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'scalp', name: isMy ? 'Scalp (၁-၁၅ မိနစ်)' : 'Scalp (1M-15M)' },
                    { id: 'short_term', name: isMy ? 'Intraday (နေ့စဉ်)' : 'Intraday (15M-1H)' },
                    { id: 'swing', name: isMy ? 'Swing (ရက်ပိုင်း)' : 'Swing (4H-1D)' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          trading: {
                            ...localSettings.trading,
                            tradingStyle: style.id as any,
                          },
                        })
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center ${
                        localSettings.trading.tradingStyle === style.id
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MARKETS */}
          {activeTab === 'market' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'ဦးစားပေး ကုန်သွယ်မည့် စျေးကွက်:' : 'Preferred Asset Class:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'crypto', name: 'Crypto Futures' },
                    { id: 'forex', name: 'Forex Pairs' },
                    { id: 'both', name: 'Both (Crypto + Forex)' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          market: { ...localSettings.market, preferredMarket: pm.id as any },
                        })
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center ${
                        localSettings.market.preferredMarket === pm.id
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {pm.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {isMy ? 'မူလ Exchange စနစ်:' : 'Default Exchange Interface:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['binance', 'bybit', 'okx', 'deriv'] as const).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          market: { ...localSettings.market, defaultExchange: ex },
                        })
                      }
                      className={`py-2 rounded-xl uppercase text-xs font-bold border ${
                        localSettings.market.defaultExchange === ex
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SMART SESSION ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 block mb-2">
                {isMy
                  ? 'အရေးကြီးသော စျေးကွက်ဖွင့်လှစ်ချိန်များနှင့် သတင်းများအတွက် အသိပေးချက်များ ရယူပါ'
                  : 'Toggle smart notifications for major session openings, high-volatility news, and liquidation alerts'}
              </span>

              {[
                { key: 'londonOpen', title: 'London Session Open (08:00 UTC)' },
                { key: 'nyOpen', title: 'New York Session Open (13:30 UTC)' },
                { key: 'londonNyOverlap', title: 'London + NY Overlap (Peak Intraday Liquidity)' },
                { key: 'majorEconomicEvent', title: 'Major Economic Red-Folder News (CPI / FOMC / NFP)' },
                { key: 'highVolatility', title: 'Abnormal High Volatility Spike Detection' },
                { key: 'liquidationRisk', title: 'Liquidation Distance Alert (< 1.5% Buffer)' },
              ].map((al) => (
                <label
                  key={al.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                >
                  <span className="text-xs font-medium text-slate-200">{al.title}</span>
                  <input
                    type="checkbox"
                    checked={(localSettings.alerts as any)[al.key]}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        alerts: {
                          ...localSettings.alerts,
                          [al.key]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onResetSettings}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isMy ? 'အားလုံး မူလအတိုင်း ပြန်ထားမည်' : 'Reset All to Defaults'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              {isMy ? 'ပိတ်မည်' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>{saveToast ? (isMy ? 'သိမ်းဆည်းပြီး!' : 'Saved!') : (isMy ? 'သိမ်းဆည်းမည်' : 'Save Changes')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
