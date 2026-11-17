import React, { useState } from 'react';
import {
  AirQualitySnapshot,
  FamilyProfile,
} from '@/types';
import {
  getAQIColorPalette,
} from '@/core/math-engines';
import {
  AlertTriangle,
  Clock,
  Layers,
  Wind,
  Thermometer,
  Droplets,
  Sun,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

interface AQIGaugeProps {
  snapshot: AirQualitySnapshot;
  profile: FamilyProfile;
  language: 'en' | 'hi';
  onOpenMap?: () => void;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({ snapshot, profile: _profile, language, onOpenMap }) => {
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  // Active display metric (either live or selected from hourly scrubber)
  const activeForecast = selectedHour
    ? snapshot.hourlyForecast.find((h) => h.hour === selectedHour)
    : null;
  const currentDisplayAQI = activeForecast ? activeForecast.aqi : snapshot.aqi;
  const currentDisplayPM25 = activeForecast ? activeForecast.pm25 : snapshot.pm25;
  const activePalette = getAQIColorPalette(currentDisplayAQI);

  return (
    <div className="space-y-6">
      
      {/* Real-time Severe Smog & Temperature Inversion Alert Banner */}
      {snapshot.inversionStatus.severity === 'Severe' && (
        <div
          role="alert"
          aria-live="assertive"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-700 text-white p-5 shadow-lg border border-red-500/50"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shrink-0">
              <Layers className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 backdrop-blur-sm">
                  {language === 'en' ? 'Atmospheric Emergency' : 'वायुमंडलीय आपातकाल'}
                </span>
                <span className="text-xs text-rose-100 font-medium">
                  Mixing Height: {snapshot.inversionStatus.mixingHeightMeters}m
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {language === 'en'
                  ? 'Severe Winter Temperature Inversion Trapping Active'
                  : 'सर्दियों की गंभीर तापमान विलोम (Inversion) परत सक्रिय'}
              </h2>
              <p className="text-sm text-rose-50 leading-relaxed max-w-3xl">
                {snapshot.inversionStatus.explanation}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" /> Breakup Window: {snapshot.inversionStatus.breakupEstimatedTime}
                </span>
                <span className="inline-flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Keep HEPA/Corsi filters running continuously
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main AQI Gauge & Atmospheric Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Circular / Card Gauge */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center justify-between">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <span className="truncate max-w-[150px] sm:max-w-[200px]" title={snapshot.location}>{snapshot.location}</span>
              {onOpenMap && (
                <button
                  onClick={onOpenMap}
                  className="px-2 py-0.5 rounded-md bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Change Location on Map"
                >
                  <MapPin className="w-3 h-3" /> Map
                </button>
              )}
            </div>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Sensor Feed
            </span>
          </div>

          {/* Central Radial Display */}
          <div className="my-6 relative flex flex-col items-center justify-center">
            <div
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 ${activePalette.border} ${activePalette.bg} flex flex-col items-center justify-center shadow-inner transition-all duration-300`}
            >
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                US-EPA AQI
              </span>
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white my-1">
                {currentDisplayAQI}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${activePalette.badge}`}>
                {activePalette.label.split('(')[0].trim()}
              </span>
            </div>

            {/* PM2.5 Microgram badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Wind className="w-3.5 h-3.5 text-sky-500" />
              <span>PM2.5: <strong>{currentDisplayPM25} µg/m³</strong></span>
              <span className="text-slate-400">({Math.round((currentDisplayPM25 / 15) * 10) / 10}x WHO limit)</span>
            </div>
          </div>

          {/* Health Summary Box */}
          <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'en' ? 'Health Impact Advisory' : 'स्वास्थ्य प्रभाव सलाह'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {activePalette.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Diurnal Breakdown & Micro-Ventilation Schedule */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                {language === 'en' ? '24-Hour Diurnal Smog & Inversion Cycle' : '24-घंटे का स्मॉग चक्र व इनवर्जन पूर्वानुमान'}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Click hour to preview</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Ground-level pollution spikes when cold morning and night air traps emissions. Solar warmth briefly breaks the barrier around midday.
            </p>

            {/* Interactive Hourly Timeline Scrubber */}
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {snapshot.hourlyForecast.map((item) => {
                const isSelected = selectedHour === item.hour;
                return (
                  <button
                    key={item.hour}
                    onClick={() => setSelectedHour(isSelected ? null : item.hour)}
                    className={`p-2 rounded-xl text-center transition-all border ${
                      isSelected
                        ? 'ring-2 ring-sky-500 border-sky-500 scale-105'
                        : item.isOptimalVentilationWindow
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
                    }`}
                    aria-label={`Forecast for ${item.hour}: AQI ${item.aqi}`}
                  >
                    <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {item.hour}
                    </span>
                    <span className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 my-0.5">
                      {item.aqi}
                    </span>
                    <div className="flex justify-center items-center gap-0.5">
                      {item.inversionTrapping && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Inversion Trapping Peak"></span>
                      )}
                      {item.isOptimalVentilationWindow && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Solar Clean Air Window"></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Golden Window: Thermal Boundary Layer Ventilation Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    {language === 'en' ? 'Optimal IAQ Micro-Ventilation Window' : 'हवा बदलने का सर्वोत्तम समय'}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-black rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                    {snapshot.ventilationWindows[0].start} - {snapshot.ventilationWindows[0].end}
                  </span>
                </div>
                <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  {snapshot.ventilationWindows[0].advice}
                </p>
              </div>
            </div>
          </div>

          {/* Weather & Secondary Pollutant Sensors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Temperature</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" /> {snapshot.temperatureC}°C
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Rel. Humidity</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <Droplets className="w-3.5 h-3.5 text-sky-500" /> {snapshot.humidityPercent}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Wind Velocity</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <Wind className="w-3.5 h-3.5 text-amber-500" /> {snapshot.windSpeedKmh} km/h
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">NO2 Toxic Gas</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" /> {snapshot.no2} ppb
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

