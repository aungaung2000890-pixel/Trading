import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Settings,
  Image as ImageIcon,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Globe2,
  ChevronDown,
  Upload,
  Eye,
  Sliders,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  WorldMarketClockItem,
  MarketClockSettings,
  ClockStyleVariant,
  ClockSizeVariant,
} from '../types';
import {
  ALL_WORLD_CITIES,
  CITY_WALLPAPER_PRESETS,
  evaluateCitySessionStatus,
} from '../utils/marketTiming';

interface WorldMarketClocksProps {
  clockSettings: MarketClockSettings;
  activeCityIds: string[];
  perCityWallpapers: Record<string, string>;
  language: 'en' | 'my';
  onUpdateSettings: (settings: Partial<MarketClockSettings>) => void;
  onUpdateActiveCities: (cityIds: string[]) => void;
  onUpdateCityWallpaper: (cityId: string, wallpaperUrl: string | null) => void;
  onResetAllWallpapers: () => void;
}

export const WorldMarketClocks: React.FC<WorldMarketClocksProps> = ({
  clockSettings,
  activeCityIds,
  perCityWallpapers,
  language,
  onUpdateSettings,
  onUpdateActiveCities,
  onUpdateCityWallpaper,
  onResetAllWallpapers,
}) => {
  const [now, setNow] = useState(new Date());
  const [selectedCityForWallpaper, setSelectedCityForWallpaper] = useState<WorldMarketClockItem | null>(null);
  const [showClockCustomizer, setShowClockCustomizer] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // High precision timer: updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCities = useMemo(() => {
    const idSet = new Set(activeCityIds);
    return ALL_WORLD_CITIES.filter((c) => idSet.has(c.id));
  }, [activeCityIds]);

  const inactiveCities = useMemo(() => {
    const idSet = new Set(activeCityIds);
    return ALL_WORLD_CITIES.filter((c) => !idSet.has(c.id));
  }, [activeCityIds]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCityForWallpaper) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onUpdateCityWallpaper(selectedCityForWallpaper.id, event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 md:p-6 shadow-xl backdrop-blur-md mb-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {language === 'my' ? 'ကမ္ဘာ့စျေးကွက်စက်ရှင် နာရီများ' : 'Global Market Session Clocks'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                LIVE REAL-TIME
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'my'
                ? 'နယူးယောက်၊ လန်ဒန်၊ တိုကျို၊ စင်ကာပူ၊ ဟောင်ကောင်၊ ဆစ်ဒနီ စျေးကွက်စက်ရှင်များနှင့် အချိန်တိုင်းတာမှု'
                : 'Intraday financial hub time zones, session states, and custom wallpaper dial displays'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick toggle 12h/24h */}
          <button
            id="toggle-12h-24h"
            type="button"
            onClick={() => onUpdateSettings({ is24Hour: !clockSettings.is24Hour })}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {clockSettings.is24Hour ? '24-Hour' : '12-Hour'}
          </button>

          {/* Clock Customizer Settings */}
          <button
            id="open-clock-customizer-btn"
            type="button"
            onClick={() => setShowClockCustomizer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'နာရီချိန်ညှိရန်' : 'Clock Settings'}</span>
          </button>
        </div>
      </div>

      {/* Clocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {activeCities.map((city) => {
          const wallpaper = perCityWallpapers[city.id] || CITY_WALLPAPER_PRESETS[city.id];
          const sessionStatus = evaluateCitySessionStatus(city, now);

          return (
            <AnalogClockCard
              key={city.id}
              city={city}
              now={now}
              sessionStatus={sessionStatus}
              wallpaper={wallpaper}
              settings={clockSettings}
              language={language}
              onOpenWallpaperModal={() => setSelectedCityForWallpaper(city)}
            />
          );
        })}
      </div>

      {/* Wallpaper Manager Modal */}
      {selectedCityForWallpaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200">
            <button
              id="close-wallpaper-modal-btn"
              type="button"
              onClick={() => setSelectedCityForWallpaper(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
              <span className="text-2xl">{selectedCityForWallpaper.flag}</span>
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedCityForWallpaper.city} ({language === 'my' ? selectedCityForWallpaper.cityMy : selectedCityForWallpaper.country})
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'my' ? 'နာရီနောက်ခံ Wallpaper ပြောင်းလဲခြင်း' : 'Custom Analog Dial Wallpaper'}
                </p>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                {language === 'my' ? 'Preset မြို့ရှုခင်းများမှ ရွေးချယ်ပါ' : 'Select City Skyline Preset:'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(CITY_WALLPAPER_PRESETS).map(([key, url]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onUpdateCityWallpaper(selectedCityForWallpaper.id, url);
                    }}
                    className={`relative rounded-lg overflow-hidden border transition group aspect-video ${
                      (perCityWallpapers[selectedCityForWallpaper.id] || CITY_WALLPAPER_PRESETS[selectedCityForWallpaper.id]) === url
                        ? 'border-amber-400 ring-2 ring-amber-400/40'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={url}
                      alt={key}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                      <span className="text-[10px] font-bold text-white uppercase truncate">
                        {key.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Custom Image / URL */}
            <div className="mb-5 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                {language === 'my' ? 'မိမိဖုန်း/ကွန်ပျူတာမှ ပုံထည့်သွင်းရန်' : 'Upload from Device or Web URL:'}
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customImageUrl.trim()) {
                      onUpdateCityWallpaper(selectedCityForWallpaper.id, customImageUrl.trim());
                      setCustomImageUrl('');
                    }
                  }}
                  disabled={!customImageUrl.trim()}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs"
                >
                  {language === 'my' ? 'အသုံးပြုမည်' : 'Apply'}
                </button>
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/40 text-xs text-slate-300 hover:text-white transition"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{language === 'my' ? 'ဖိုင်ရွေးချယ်တင်မည် (JPG / PNG)' : 'Select Image File from Device'}</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onUpdateCityWallpaper(selectedCityForWallpaper.id, null);
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'my' ? 'မူလအတိုင်းပြန်ထားမည်' : 'Reset to Default'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCityForWallpaper(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                {language === 'my' ? 'ပြီးပါပြီ' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clock Customizer Settings Modal */}
      {showClockCustomizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              id="close-customizer-modal-btn"
              type="button"
              onClick={() => setShowClockCustomizer(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'my' ? 'ကမ္ဘာ့နာရီ အသေးစိတ် ပြင်ဆင်ချက်များ' : 'World Clocks Display Customizer'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'my' ? 'နာရီဒီဇိုင်း၊ ဖော်ပြမှုများနှင့် မြို့များကို စိတ်ကြိုက်ပြောင်းလဲပါ' : 'Fine-tune clock style, dial markers, opacity, and active cities'}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Dial Style Selection */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {language === 'my' ? 'နာရီဒီဇိုင်းစတိုင် (Clock Style)' : 'Clock Dial Style:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['tactical', 'minimalist', 'modern', 'classic'] as ClockStyleVariant[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => onUpdateSettings({ clockStyle: style })}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition ${
                        clockSettings.clockStyle === style
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                  <span className="text-xs font-medium text-slate-300">
                    {language === 'my' ? 'စက္ကန့်လက်တံ ဖော်ပြမည်' : 'Show Second Hand'}
                  </span>
                  <input
                    type="checkbox"
                    checked={clockSettings.showSeconds}
                    onChange={(e) => onUpdateSettings({ showSeconds: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                  <span className="text-xs font-medium text-slate-300">
                    {language === 'my' ? 'ဒစ်ဂျစ်တယ် အချိန်ဖော်ပြမည်' : 'Show Digital Time'}
                  </span>
                  <input
                    type="checkbox"
                    checked={clockSettings.showDigitalTime}
                    onChange={(e) => onUpdateSettings({ showDigitalTime: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                  <span className="text-xs font-medium text-slate-300">
                    {language === 'my' ? 'UTC Offset ဖော်ပြမည်' : 'Show UTC Offset (e.g. UTC+7)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={clockSettings.showUtcOffset}
                    onChange={(e) => onUpdateSettings({ showUtcOffset: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
                  <span className="text-xs font-medium text-slate-300">
                    {language === 'my' ? 'စျေးကွက် အခြေအနေ (Open/Closed)' : 'Show Market Session Status'}
                  </span>
                  <input
                    type="checkbox"
                    checked={clockSettings.showMarketStatus}
                    onChange={(e) => onUpdateSettings({ showMarketStatus: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Wallpaper Opacity Slider */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-300">
                    {language === 'my' ? 'Wallpaper မှိန်ဖျော့မှု (Background Darkness Overlay):' : 'Background Wallpaper Dark Overlay:'}
                  </span>
                  <span className="text-xs font-mono text-amber-400">
                    {Math.round(clockSettings.backgroundOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.85"
                  step="0.05"
                  value={clockSettings.backgroundOpacity}
                  onChange={(e) => onUpdateSettings({ backgroundOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Manage Active Cities */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {language === 'my' ? 'ပြသလိုသော မြို့များ (Active Cities):' : 'Active Market Cities on Dashboard:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_WORLD_CITIES.map((city) => {
                    const isActive = activeCityIds.includes(city.id);
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            if (activeCityIds.length <= 1) return; // keep at least 1
                            onUpdateActiveCities(activeCityIds.filter((id) => id !== city.id));
                          } else {
                            onUpdateActiveCities([...activeCityIds, city.id]);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{city.flag}</span>
                        <span>{city.city}</span>
                        {isActive ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-5 mt-5 border-t border-slate-800">
              <button
                type="button"
                onClick={onResetAllWallpapers}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'my' ? 'Wallpapers အားလုံး မူလပြန်ထားမည်' : 'Reset All Wallpapers'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClockCustomizer(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                {language === 'my' ? 'သိမ်းဆည်းမည်' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AnalogClockCardProps {
  city: WorldMarketClockItem;
  now: Date;
  sessionStatus: {
    status: 'OPEN' | 'CLOSED' | 'PRE_MARKET';
    statusTextEn: string;
    statusTextMy: string;
    color: string;
  };
  wallpaper: string;
  settings: MarketClockSettings;
  language: 'en' | 'my';
  onOpenWallpaperModal: () => void;
}

const AnalogClockCard: React.FC<AnalogClockCardProps> = ({
  city,
  now,
  sessionStatus,
  wallpaper,
  settings,
  language,
  onOpenWallpaperModal,
}) => {
  // Convert current time to target timeZone
  const cityTime = useMemo(() => {
    try {
      const str = now.toLocaleString('en-US', { timeZone: city.timeZone });
      return new Date(str);
    } catch {
      return now;
    }
  }, [now, city.timeZone]);

  const hours = cityTime.getHours();
  const minutes = cityTime.getMinutes();
  const seconds = cityTime.getSeconds();

  // Analog Hand Angles
  const secondAngle = seconds * 6; // 360 / 60
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  // Formatted Digital Time
  const digitalTimeStr = useMemo(() => {
    return cityTime.toLocaleTimeString(language === 'my' ? 'my-MM' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: settings.showSeconds ? '2-digit' : undefined,
      hour12: !settings.is24Hour,
      timeZone: city.timeZone,
    });
  }, [cityTime, language, settings.is24Hour, settings.showSeconds, city.timeZone]);

  // UTC Offset display string
  const utcOffsetStr = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: city.timeZone,
        timeZoneName: 'shortOffset',
      }).formatToParts(now);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : 'UTC';
    } catch {
      return 'UTC';
    }
  }, [now, city.timeZone]);

  return (
    <div className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 flex flex-col items-center p-3.5 transition-all hover:border-slate-700 shadow-md">
      {/* City Background Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />
      {/* Darkness overlay for high readability */}
      <div
        className="absolute inset-0 bg-slate-950"
        style={{ opacity: settings.backgroundOpacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

      {/* Top Bar: Flag, City, Wallpaper button */}
      <div className="relative z-10 w-full flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base">{city.flag}</span>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white tracking-wide truncate">
              {language === 'my' ? city.cityMy : city.city}
            </h4>
            <span className="text-[10px] text-slate-300/80 block truncate">
              {city.country}
            </span>
          </div>
        </div>

        {/* Change Wallpaper Button */}
        <button
          id={`change-wallpaper-${city.id}`}
          type="button"
          onClick={onOpenWallpaperModal}
          title="Change clock wallpaper"
          className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-900/80 backdrop-blur-sm transition"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Circular Analog Clock Dial */}
      <div className="relative z-10 my-2">
        <div className="relative w-28 h-28 rounded-full border-2 border-slate-700/80 bg-slate-950/70 shadow-inner flex items-center justify-center backdrop-blur-xs">
          {/* Dial Markers */}
          {settings.clockStyle === 'tactical' && (
            <>
              {/* 12, 3, 6, 9 numbers */}
              <span className="absolute top-1 text-[9px] font-mono font-bold text-amber-400">12</span>
              <span className="absolute right-1.5 text-[9px] font-mono font-bold text-slate-400">3</span>
              <span className="absolute bottom-1 text-[9px] font-mono font-bold text-amber-400">6</span>
              <span className="absolute left-1.5 text-[9px] font-mono font-bold text-slate-400">9</span>
              {/* Center Crosshairs */}
              <div className="absolute inset-x-4 top-1/2 h-[0.5px] bg-slate-700/40" />
              <div className="absolute inset-y-4 left-1/2 w-[0.5px] bg-slate-700/40" />
            </>
          )}

          {settings.clockStyle === 'classic' && (
            <>
              <span className="absolute top-1 text-[8px] font-serif font-bold text-slate-300">XII</span>
              <span className="absolute right-1.5 text-[8px] font-serif font-bold text-slate-300">III</span>
              <span className="absolute bottom-1 text-[8px] font-serif font-bold text-slate-300">VI</span>
              <span className="absolute left-1.5 text-[8px] font-serif font-bold text-slate-300">IX</span>
            </>
          )}

          {/* Hour ticks around circumference */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 flex justify-center pointer-events-none"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div className={`w-[1px] ${i % 3 === 0 ? 'h-2 bg-amber-400' : 'h-1 bg-slate-500/60'}`} />
            </div>
          ))}

          {/* Clock Hands with exact pivot centers */}
          {/* Hour hand */}
          <div
            className="absolute w-1.5 h-7 bg-amber-300 rounded-full shadow origin-bottom transition-transform duration-75"
            style={{
              transform: `translateY(-50%) rotate(${hourAngle}deg)`,
              bottom: '50%',
            }}
          />

          {/* Minute hand */}
          <div
            className="absolute w-1 h-10 bg-white rounded-full shadow origin-bottom transition-transform duration-75"
            style={{
              transform: `translateY(-50%) rotate(${minuteAngle}deg)`,
              bottom: '50%',
            }}
          />

          {/* Second hand */}
          {settings.showSeconds && (
            <div
              className="absolute w-0.5 h-11 bg-rose-500 rounded-full shadow origin-bottom transition-transform duration-75"
              style={{
                transform: `translateY(-50%) rotate(${secondAngle}deg)`,
                bottom: '50%',
              }}
            />
          )}

          {/* Center Pin */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-900 shadow-md z-20" />
        </div>
      </div>

      {/* Digital Time & Offset */}
      {settings.showDigitalTime && (
        <div className="relative z-10 text-center my-1">
          <span className="text-sm font-bold font-mono text-white tracking-wider">
            {digitalTimeStr}
          </span>
          {settings.showUtcOffset && (
            <span className="block text-[10px] font-mono text-slate-400">
              {utcOffsetStr}
            </span>
          )}
        </div>
      )}

      {/* Session Status Badge */}
      {settings.showMarketStatus && (
        <div className="relative z-10 w-full mt-1.5">
          <div
            className={`w-full py-1 px-2 rounded-md border text-center text-[10px] font-bold tracking-wider uppercase transition ${sessionStatus.color}`}
          >
            {language === 'my' ? sessionStatus.statusTextMy : sessionStatus.statusTextEn}
          </div>
          <div className="text-[9px] text-center text-slate-400/80 mt-1">
            {city.sessionOpenLocal} - {city.sessionCloseLocal}
          </div>
        </div>
      )}
    </div>
  );
};
