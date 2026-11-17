import React, { useState } from 'react';
import {
  AirQualitySnapshot,
  FamilyProfile,
  ScheduledRoutineItem,
} from '@/types';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Shield,
  Leaf,
  Users,
  Sparkles,
} from 'lucide-react';

interface RoutinePlannerProps {
  profile: FamilyProfile;
  snapshot: AirQualitySnapshot;
  routines: ScheduledRoutineItem[];
  onToggleRoutineStatus: (id: string) => void;
  language: 'en' | 'hi';
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({
  profile: _profile,
  snapshot: _snapshot,
  routines,
  onToggleRoutineStatus,
  language,
}) => {
  const [filter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredRoutines = routines.filter((r) => {
    if (filter === 'completed') return r.status === 'completed';
    if (filter === 'pending') return r.status !== 'completed';
    return true;
  });

  const completedCount = routines.filter((r) => r.status === 'completed').length;
  const progressPercent = routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'en'
                ? 'Personalized Low-Emission Daily Routine'
                : 'दैनिक कम-उत्सर्जन व स्वच्छ वायु दिनचर्या'}
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            GenAI calculates how minor timing adjustments and sustainable transit shifts circumvent peak boundary-layer inversion spikes while slashing household emissions.
          </p>
        </div>

        {/* Progress Bar & Badges */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-w-[220px]">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Daily Routine Completion</span>
            <span className="text-sky-600 dark:text-sky-400">{completedCount}/{routines.length} Done</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-4">
        {filteredRoutines.map((item) => {
          const isDone = item.status === 'completed';
          return (
            <div
              key={item.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Left: Checkbox & Details */}
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => onToggleRoutineStatus(item.id)}
                    className="mt-1 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                    aria-label={`Mark routine ${item.title} as ${isDone ? 'incomplete' : 'completed'}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-sky-500" />
                    )}
                  </button>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {item.timeRange}
                      </span>
                      <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> For: {item.targetMembers.join(', ')}
                      </span>
                      {isDone && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                          Completed Today
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                      isDone ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.title}
                    </h3>

                    {/* Comparison: Baseline vs Alternative */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                        <span className="font-extrabold uppercase text-slate-400 text-[10px]">Standard Baseline</span>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">{item.baselineHabit}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60">
                        <span className="font-extrabold uppercase text-sky-700 dark:text-sky-300 text-[10px] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Recommended Low-Smog Alternative
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{item.recommendedAlternative}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                      💡 {item.actionNote}
                    </p>
                  </div>
                </div>

                {/* Right: Quantified Impact Badges */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Personal Protection</span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                      <Shield className="w-3.5 h-3.5" /> -{item.avoidedPm25Micrograms} µg PM2.5
                    </span>
                  </div>

                  {item.avoidedCo2Kg > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Community Benefit</span>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-sky-600 dark:text-sky-400">
                        <Leaf className="w-3.5 h-3.5" /> -{item.avoidedCo2Kg} kg CO₂
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

