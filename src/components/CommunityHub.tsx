import React, { useState } from 'react';
import {
  Users,
  Route,
  Car,
  Flame,
  Award,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Send,
  Navigation,
} from 'lucide-react';
import {
  AirQualitySnapshot,
  FamilyProfile,
  CleanAirCorridor,
  CarpoolCluster,
  SmokeIncidentReport,
} from '@/types';
import { sanitizeInput } from '@/core/security';

interface CommunityHubProps {
  profile: FamilyProfile;
  snapshot: AirQualitySnapshot;
  language: 'en' | 'hi';
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ profile, snapshot, language }) => {
  // Clean Air Corridors aligned with types
  const corridors: CleanAirCorridor[] = [
    {
      id: 'corridor-1',
      name: language === 'en' ? 'Green Belt Ridge Trail' : 'हरित पट्टी रिज मार्ग',
      routeType: 'walking_school_street',
      exposureReductionPercent: 42,
      lengthKm: 2.4,
      description: 'Forest-buffered walking trail bypassing arterial commercial avenues',
      recommendedTimeWindow: '12:00 PM - 03:00 PM (Midday Solar Mixing)',
      treeCanopyCoverPercent: 78,
    },
    {
      id: 'corridor-2',
      name: language === 'en' ? 'Canal Eco-Bypass Walkway' : 'नहर इको-बाईपास पैदल पथ',
      routeType: 'green_cycling_path',
      exposureReductionPercent: 35,
      lengthKm: 1.8,
      description: 'Dedicated waterfront bicycle and pedestrian corridor',
      recommendedTimeWindow: '11:30 AM - 04:00 PM',
      treeCanopyCoverPercent: 62,
    },
    {
      id: 'corridor-3',
      name: language === 'en' ? 'Institutions Inner Avenue' : 'संस्थान आंतरिक मार्ग',
      routeType: 'ev_transit_lane',
      exposureReductionPercent: 28,
      lengthKm: 3.1,
      description: 'Electrified low-speed university transit ring shielded by neem canopies',
      recommendedTimeWindow: 'All daylight hours',
      treeCanopyCoverPercent: 54,
    },
  ];

  // Neighborhood carpooling & school cluster data
  const [clusters, setClusters] = useState<CarpoolCluster[]>([
    {
      id: 'cluster-1',
      clusterName: language === 'en' ? 'DAV School / Springdales Morning Electric Shuttle' : 'डीएवी स्कूल सुबह की इलेक्ट्रिक शटल',
      destination: 'Springdales & DPS Mathura Road',
      participatingFamiliesCount: 6,
      totalAvoidedCo2DailyKg: 14.5,
      totalAvoidedNoxDailyGrams: 85,
      departureTime: '07:20 AM',
      vehicleType: 'electric_van',
    },
    {
      id: 'cluster-2',
      clusterName: language === 'en' ? 'CyberHub / Connaught Place Metro Pool' : 'कनॉट प्लेस मेट्रो कारपूल',
      destination: 'Shivaji Stadium & CP Metro Gate 4',
      participatingFamiliesCount: 4,
      totalAvoidedCo2DailyKg: 22.0,
      totalAvoidedNoxDailyGrams: 140,
      departureTime: '08:15 AM',
      vehicleType: 'hybrid_carpool',
    },
    {
      id: 'cluster-3',
      clusterName: language === 'en' ? 'Sector 9 Evening Sports & Music Vanpool' : 'शाम का स्पोर्ट्स वैनपूल',
      destination: 'Sports Complex Sector 9',
      participatingFamiliesCount: 5,
      totalAvoidedCo2DailyKg: 9.2,
      totalAvoidedNoxDailyGrams: 55,
      departureTime: '04:30 PM',
      vehicleType: 'cng_shuttle',
    },
  ]);

  const [joinedClusterIds, setJoinedClusterIds] = useState<Record<string, boolean>>({
    'cluster-2': true,
  });

  // Smoke & Biomass Burning Incident Reports
  const [incidents, setIncidents] = useState<SmokeIncidentReport[]>([
    {
      id: 'inc-01',
      sourceType: 'leaf_burning',
      location: 'Backside alley near Community Park gate 2',
      timestamp: '15 mins ago',
      estimatedPm25Spike: 180,
      aiVerificationConfidence: 0.94,
      status: 'verified_by_ward',
      recommendedActions: ['Ward fire response alert', 'Close southern residential windows'],
    },
    {
      id: 'inc-02',
      sourceType: 'waste_burning',
      location: 'Service lane adjacent to Eastern Ring Road bypass',
      timestamp: '42 mins ago',
      estimatedPm25Spike: 260,
      aiVerificationConfidence: 0.88,
      status: 'reported',
      recommendedActions: ['DPCC pollution audit', 'Water sprinkler deployment'],
    },
  ]);

  const [newLocationDesc, setNewLocationDesc] = useState('');
  const [newSourceType, setNewSourceType] = useState<SmokeIncidentReport['sourceType']>('waste_burning');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleToggleJoinCluster = (id: string) => {
    setJoinedClusterIds((prev) => {
      const willBeJoined = !prev[id];
      setClusters((clusterList) =>
        clusterList.map((c) =>
          c.id === id
            ? {
                ...c,
                participatingFamiliesCount: willBeJoined
                  ? c.participatingFamiliesCount + 1
                  : c.participatingFamiliesCount - 1,
              }
            : c
        )
      );
      return { ...prev, [id]: willBeJoined };
    });
  };

  const handleReportSmokeIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedDesc = sanitizeInput(newLocationDesc.trim(), 200);
    if (!sanitizedDesc) return;

    const newReport: SmokeIncidentReport = {
      id: `inc-${Date.now()}`,
      sourceType: newSourceType,
      location: sanitizedDesc,
      timestamp: 'Just now',
      estimatedPm25Spike: 150,
      aiVerificationConfidence: 0.96,
      status: 'verified_by_ward',
      recommendedActions: ['Rapid ward inspection dispatched', 'Notify surrounding apartments'],
    };

    setIncidents([newReport, ...incidents]);
    setNewLocationDesc('');
    setReportSubmitted(true);
    setTimeout(() => setReportSubmitted(false), 4000);
  };

  const totalCO2Saved = clusters
    .filter((c) => joinedClusterIds[c.id])
    .reduce((sum, c) => sum + c.totalAvoidedCo2DailyKg, 0);

  const totalNOxSaved = clusters
    .filter((c) => joinedClusterIds[c.id])
    .reduce((sum, c) => sum + c.totalAvoidedNoxDailyGrams, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Community Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-sky-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            {language === 'en' ? 'Collective Air Defense Network' : 'सामुदायिक वायु रक्षा नेटवर्क'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'en'
              ? 'Community Smog Mitigation & Clean Corridors'
              : 'सामुदायिक स्मॉग निवारण और स्वच्छ मार्ग'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {language === 'en'
              ? `Empowering neighborhoods across ${profile.locationName} to coordinate low-exposure transit corridors, carpool clusters to eliminate tailpipe smog, and crowd-report biomass fires with AI verification.`
              : `${profile.locationName} के नागरिकों के लिए सामूहिक स्वच्छ वायु गलियारे, कारपूलिंग और खुले में कचरा/धुआं जलाने की लाइव रिपोर्टिंग प्रणाली।`}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-sky-400">42%</div>
            <div className="text-[11px] text-slate-300 font-medium">Max Route Exposure Cut</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{totalCO2Saved.toFixed(1)} kg</div>
            <div className="text-[11px] text-slate-300 font-medium">Daily CO2 Avoided (You)</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-amber-400">{totalNOxSaved} g</div>
            <div className="text-[11px] text-slate-300 font-medium">NOx Smog Gas Prevented</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-rose-400">{incidents.length}</div>
            <div className="text-[11px] text-slate-300 font-medium">Active Smoke Audits</div>
          </div>
        </div>
      </div>

      {/* Grid of Clean Corridors & Carpooling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clean Air Corridors */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Route className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {language === 'en' ? 'Clean Air Commute Corridors' : 'स्वच्छ वायु यात्रा मार्ग'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'en'
                    ? 'Tree-buffered low-emission corridors avoiding heavy diesel traffic'
                    : 'भारी ट्रैफिक और धुएं से दूर प्राकृतिक वृक्षारोपण मार्ग'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              AI Optimized
            </span>
          </div>

          <div className="space-y-4">
            {corridors.map((c) => {
              const corridorPM25 = Math.round(snapshot.pm25 * (1 - c.exposureReductionPercent / 100));
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                        {c.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {c.description} • {c.lengthKm} km ({c.recommendedTimeWindow})
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                      -{c.exposureReductionPercent}% PM2.5
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                      <span className="text-[10px] text-slate-400 block font-semibold">Corridor PM2.5</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{corridorPM25} µg/m³</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                      <span className="text-[10px] text-slate-400 block font-semibold">Arterial Road</span>
                      <span className="font-bold text-rose-500">{snapshot.pm25} µg/m³</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                      <span className="text-[10px] text-slate-400 block font-semibold">Canopy Shield</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">{c.treeCanopyCoverPercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Neighborhood Carpool & Shuttle Clusters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {language === 'en' ? 'Community Carpool Clusters' : 'सामुदायिक कारपूल और स्कूल शटल'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'en'
                    ? 'Coordinate school & office trips to halve local road emissions'
                    : 'सड़क पर वाहनों का धुआं घटाने के लिए संयुक्त यात्रा समूह'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Active Wards
            </span>
          </div>

          <div className="space-y-4">
            {clusters.map((cluster) => {
              const isJoined = Boolean(joinedClusterIds[cluster.id]);
              return (
                <div
                  key={cluster.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {cluster.clusterName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Destination: {cluster.destination} • Leaves {cluster.departureTime}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleJoinCluster(cluster.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                        isJoined
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Joined
                        </>
                      ) : (
                        'Join Pool'
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-semibold">
                      Families: {cluster.participatingFamiliesCount} ({cluster.vehicleType.replace('_', ' ')})
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      -{cluster.totalAvoidedCo2DailyKg} kg CO2 • -{cluster.totalAvoidedNoxDailyGrams}g NOx
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smoke & Biomass Incident Report Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {language === 'en' ? 'Live Community Smoke & Fire Watch' : 'खुले में आग व धुआं निगरानी'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'en'
                  ? 'Report open garbage, leaf, or stubble burning with AI confidence scoring for municipal intervention'
                  : 'कचरा या बायोमास जलाने की तुरंत सूचना दें और स्थानीय प्रशासन की त्वरित कार्रवाई में मदद करें'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> AI Verification Active
          </span>
        </div>

        {reportSubmitted && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Report logged successfully! Local ward rapid-response team notified with 96% AI confidence.
          </div>
        )}

        <form onSubmit={handleReportSmokeIncident} className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="smoke-source-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Incident Category
              </label>
              <select
                id="smoke-source-select"
                value={newSourceType}
                onChange={(e) => setNewSourceType(e.target.value as SmokeIncidentReport['sourceType'])}
                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="waste_burning">Garbage Smoldering (Toxic Dioxins)</option>
                <option value="leaf_burning">Dry Leaf / Biomass Pile Burning</option>
                <option value="unregulated_diesel_generator">Unregulated Diesel Generator Black Smoke</option>
                <option value="biomass_cooking">Solid Biomass Outdoor Cooking</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="smoke-location-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location & Landmarks
              </label>
              <div className="flex gap-2">
                <input
                  id="smoke-location-input"
                  type="text"
                  placeholder="e.g., Near Ring Road flyover pillar 42, Sector 8"
                  value={newLocationDesc}
                  onChange={(e) => setNewLocationDesc(e.target.value)}
                  className="flex-1 p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newLocationDesc.trim()}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-rose-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Existing verified incidents */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Community Reports</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white capitalize">
                      {inc.sourceType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">({inc.timestamp})</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] pl-5.5">
                    {inc.location} • +{inc.estimatedPm25Spike} µg/m³ spike
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    inc.status === 'verified_by_ward'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {inc.status === 'verified_by_ward' ? 'Verified by Ward' : 'Reported'}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    AI Score: {Math.round(inc.aiVerificationConfidence * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ward Collective Action Scoreboard */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Ward Clean Air Action Honor Roll</h3>
              <p className="text-xs text-slate-400">Community impact rankings across municipal sectors</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Top 5% in NCR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px]">Rank #1 • South Delhi Ward 42</span>
            <div className="font-bold text-sm mt-1 text-emerald-400">4,210 kg PM2.5 Prevented</div>
            <div className="text-[10px] text-slate-400 mt-0.5">380 active DIY Corsi filters deployed</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px]">Rank #2 • Dwarka Sector 12 Cluster</span>
            <div className="font-bold text-sm mt-1 text-emerald-400">3,890 kg PM2.5 Prevented</div>
            <div className="text-[10px] text-slate-400 mt-0.5">92 EV carpool routes active</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[11px]">Rank #3 • Noida Sector 62 Eco-Hub</span>
            <div className="font-bold text-sm mt-1 text-emerald-400">3,120 kg PM2.5 Prevented</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Zero open-waste burns for 18 days</div>
          </div>
        </div>
      </div>
    </div>
  );
};
