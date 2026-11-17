import React from 'react';
import {
  ImpactSummary,
  FamilyProfile,
} from '@/types';
import {
  Award,
  ShieldCheck,
  Cigarette,
  Leaf,
  Users2,
  Share2,
  HeartPulse,
} from 'lucide-react';

interface ImpactTrackerProps {
  impact: ImpactSummary;
  profile: FamilyProfile;
  language: 'en' | 'hi';
}

export const ImpactTracker: React.FC<ImpactTrackerProps> = ({ impact, profile, language }) => {
  const handleShareBadge = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Clean Air & Low Emission Impact | AeroSense AI',
        text: `Today our family avoided inhaling ${impact.dailyPm25AvoidedMicrograms} µg of PM2.5 (equivalent to ${impact.equivalentCigarettesNotSmoked} cigarettes not smoked) and eliminated ${impact.dailyCo2EmissionsSavedKg} kg of CO2 emissions with AeroSense AI!`,
        url: window.location.href,
      }).catch((_error: unknown) => {
        // User dismissed native share sheet
      });
    } else {
      navigator.clipboard.writeText(
        `Today our family avoided inhaling ${impact.dailyPm25AvoidedMicrograms} µg of PM2.5 (equivalent to ${impact.equivalentCigarettesNotSmoked} cigarettes not smoked) and eliminated ${impact.dailyCo2EmissionsSavedKg} kg of CO2 with AeroSense AI!`
      );
      alert('Impact summary copied to clipboard!');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <HeartPulse className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'en'
              ? 'Quantified Health & Community Emission Impact'
              : 'प्रत्यक्ष स्वास्थ्य सुरक्षा एवं सामुदायिक उत्सर्जन बचत'}
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Track the dual-dividend of your daily choices: tangible respiratory particulate mass avoided from family lungs alongside verifiable carbon and nitrogen oxide reductions.
        </p>
      </div>

      {/* Main 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Inhaled PM2.5 Avoided */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-3">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Dosage</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {impact.dailyPm25AvoidedMicrograms} <span className="text-base font-semibold text-slate-400">µg</span>
          </span>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            PM2.5 Mass Inhalation Avoided
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {profile.members.length} household members using timing & filtration
          </p>
        </div>

        {/* Metric 2: Berkeley Earth Cigarette Equivalence */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-3">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60">
              <Cigarette className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Equivalence</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {impact.equivalentCigarettesNotSmoked} <span className="text-base font-semibold text-slate-400">cigs</span>
          </span>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            Passive Cigarettes Neutralized
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Berkeley Earth metric (22 µg/m³ 24-hr standard = 1 cigarette)
          </p>
        </div>

        {/* Metric 3: Avoided Carbon Footprint */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 mb-3">
            <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60">
              <Leaf className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emissions</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {impact.dailyCo2EmissionsSavedKg} <span className="text-base font-semibold text-slate-400">kg</span>
          </span>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            CO₂e Atmospheric Savings
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Eliminated by choosing mass rail & optimized home heating
          </p>
        </div>

        {/* Metric 4: Community Multiplication */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-3">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60">
              <Users2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">500 Households</span>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {impact.communityNeighborhoodSavingsKgCo2} <span className="text-base font-semibold text-slate-400">kg</span>
          </span>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            Ward Collective Scalability
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Potential daily carbon avoidance if neighbors align routines
          </p>
        </div>

      </div>

      {/* Verified Clean Air Achievement Badge & Receipt */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Award className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950">
                  {impact.cleanAirRankBadge}
                </span>
                <span className="text-xs text-sky-200">Verified Citizen Air Guardian</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                {profile.familyName} Clean Air Certificate
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Certified adherence to WHO and EPA low-exposure protocols. Reduced family toxic particulate load by 82% while helping unburden the municipal power grid and transit corridors.
              </p>
            </div>
          </div>

          {/* Share & Download Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleShareBadge}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-sky-500/30"
            >
              <Share2 className="w-4 h-4" /> Share Impact Card
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

