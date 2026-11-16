import React, { useState } from 'react';
import {
  calculateCorsiRosenthalPerformance,
} from '@/core/math-engines';
import {
  SCIENTIFIC_IAQ_HACKS,
  SCIENTIFIC_CITATIONS,
} from '@/genai/knowledge-base';
import {
  FamilyProfile,
  IAQRemedy,
} from '@/types';
import {
  Wrench,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Droplets,
  Flame,
  Leaf,
  Wind,
  DollarSign,
  Gauge,
  Timer,
  BookOpen,
} from 'lucide-react';

interface IAQHackStudioProps {
  profile: FamilyProfile;
  language: 'en' | 'hi';
}

export const IAQHackStudio: React.FC<IAQHackStudioProps> = ({ profile, language }) => {
  // Corsi-Rosenthal Box Interactive Parameter Sliders
  const [roomVolume, setRoomVolume] = useState<number>(profile.roomVolumeCubicMeters || 75);
  const [fanCfm, setFanCfm] = useState<number>(220);
  const [filterCount, setFilterCount] = useState<number>(4);
  const [mervRating, setMervRating] = useState<number>(13);
  const [selectedHack, setSelectedHack] = useState<IAQRemedy>(SCIENTIFIC_IAQ_HACKS[0]);

  const performance = calculateCorsiRosenthalPerformance(roomVolume, fanCfm, filterCount, mervRating);

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Wrench className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'en'
              ? 'Scientific Indoor Air Quality (IAQ) Studio'
              : 'वैज्ञानिक इंडोर वायु गुणवत्ता (IAQ) प्रयोगशाला'}
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          During winter inversions, indoor PM2.5 can exceed outdoor levels due to trapped cooking, heating, and resuspension. Deploy verified engineering hacks grounded in EPA and UC Davis aerosol mechanics.
        </p>
      </div>

      {/* Interactive DIY Corsi-Rosenthal Box CADR Simulator */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> High-CADR DIY Engineering
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Corsi-Rosenthal Box Air Physics Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate Clean Air Delivery Rate (CADR) & Air Changes Per Hour (ACH) for your room volume
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
              ~$65-$75 vs $400 HEPA
            </span>
          </div>
        </div>

        {/* Sliders & Visual CADR Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Room Volume (m³):</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{roomVolume} m³ (~{Math.round(roomVolume / 2.5)} m² floor)</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={roomVolume}
                onChange={(e) => setRoomVolume(Number(e.target.value))}
                className="w-full accent-sky-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>20" Box Fan Airflow (CFM):</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{fanCfm} CFM</span>
              </div>
              <input
                type="range"
                min="150"
                max="350"
                step="10"
                value={fanCfm}
                onChange={(e) => setFanCfm(Number(e.target.value))}
                className="w-full accent-sky-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Filter Configuration:
                </label>
                <select
                  value={filterCount}
                  onChange={(e) => setFilterCount(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                >
                  <option value={4}>4-Filter Standard Cube</option>
                  <option value={5}>5-Filter High Surface Shroud</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Filter Rating:
                </label>
                <select
                  value={mervRating}
                  onChange={(e) => setMervRating(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                >
                  <option value={13}>MERV 13 (88% PM2.5 Capture - Recommended)</option>
                  <option value={11}>MERV 11 (65% PM2.5 Capture)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance Dashboard Column */}
          <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              Calculated Air Physics Metrics
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <Gauge className="w-4 h-4 mx-auto text-sky-600 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">CADR</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">{performance.cadRpm25Cfm} <span className="text-xs font-normal">CFM</span></p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <Wind className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">Air Changes</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">{performance.effectiveAch} <span className="text-xs font-normal">ACH</span></p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <Timer className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">90% Clear</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">{performance.clearanceTimeMinutes} <span className="text-xs font-normal">min</span></p>
              </div>
            </div>

            {/* WHO/CDC Benchmark Badge */}
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              performance.effectiveAch >= 4.0
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300'
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>
                {performance.effectiveAch >= 4.0
                  ? `Exceeds WHO/CDC indoor benchmark (ACH >= 4.0). Clears soot in ${performance.clearanceTimeMinutes} mins!`
                  : `Moderate filtration (${performance.effectiveAch} ACH). Consider adding a second unit for room > ${roomVolume} m³.`}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Library of Verified IAQ Hacks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation list */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Proven Interventions
          </span>
          {SCIENTIFIC_IAQ_HACKS.map((hack) => (
            <button
              key={hack.id}
              onClick={() => setSelectedHack(hack)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                selectedHack.id === hack.id
                  ? 'bg-white dark:bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {hack.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  +{hack.efficiencyGainPercent}% Clean
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {hack.scientificMechanism}
              </p>
            </button>
          ))}
        </div>

        {/* Selected Hack Deep Dive */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Category: {selectedHack.category.toUpperCase()}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {selectedHack.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                Cost: {selectedHack.costLevel}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-semibold">
                Difficulty: {selectedHack.difficulty}
              </span>
            </div>
          </div>

          {/* Scientific Mechanism */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5" /> Scientific Mechanism & Aerosol Physics
            </h4>
            <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
              {selectedHack.scientificMechanism}
            </p>
          </div>

          {/* Step-by-Step Execution Guide */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Step-by-Step Implementation Guide
            </h4>
            <div className="space-y-2.5">
              {selectedHack.stepByStepGuide.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Lung Deposition Impact */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold uppercase text-emerald-900 dark:text-emerald-200">
                Direct Lung Deposition Impact
              </span>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                {selectedHack.impactOnLungs}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

