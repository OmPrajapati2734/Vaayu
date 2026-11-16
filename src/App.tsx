import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { AQIGauge } from '@/components/AQIGauge';
import { LocationMapSelector } from '@/components/LocationMapSelector';
import { IAQHackStudio } from '@/components/IAQHackStudio';
import { RoutinePlanner } from '@/components/RoutinePlanner';
import { ImpactTracker } from '@/components/ImpactTracker';
import { ChatAssistant } from '@/components/ChatAssistant';
import { FamilyProfileModal } from '@/components/FamilyProfileModal';

import {
  toolGetAtmosphericForecast,
  toolGenerateLowEmissionRoutine,
  toolQuantifyDirectImpact,
} from '@/genai/orchestrator';
import { AirQualitySnapshot, FamilyProfile } from '@/types';

// Initial Demo Family Profile (South Delhi Smog Corridor)
const initialFamilyProfile: FamilyProfile = {
  id: 'fam-demo-01',
  familyName: 'Sharma Family',
  locationName: 'Delhi-NCR Metropolitan Basin',
  latitude: 28.6139,
  longitude: 77.2090,
  housingType: 'apartment_lowrise',
  roomVolumeCubicMeters: 80,
  hasHepaPurifier: false,
  purifierCount: 0,
  hasKitchenExhaust: true,
  cookingFuel: 'piped_gas',
  heatingType: 'electric_heat_pump',
  members: [
    {
      id: 'm1',
      name: 'Aarav Sharma',
      age: 7,
      category: 'child',
      healthConditions: ['asthma'],
      activityLevel: 'active',
      commuteMode: 'bus',
      commuteDurationMinutes: 30,
    },
    {
      id: 'm2',
      name: 'Sunita Sharma',
      age: 68,
      category: 'elderly',
      healthConditions: ['cardiovascular'],
      activityLevel: 'sedentary',
      commuteMode: 'remote_work',
      commuteDurationMinutes: 0,
    },
    {
      id: 'm3',
      name: 'Rohan Sharma',
      age: 38,
      category: 'adult',
      healthConditions: ['none'],
      activityLevel: 'moderate',
      commuteMode: 'ice_car',
      commuteDurationMinutes: 45,
    },
    {
      id: 'm4',
      name: 'Pooja Sharma',
      age: 35,
      category: 'pregnant',
      healthConditions: ['allergies'],
      activityLevel: 'sedentary',
      commuteMode: 'remote_work',
      commuteDurationMinutes: 0,
    },
  ],
};

export const App: React.FC = () => {
  const [profile, setProfile] = useState<FamilyProfile>(initialFamilyProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [highContrast, setHighContrast] = useState(false);

  // Dynamic atmospheric snapshot based on selected coordinates
  const [snapshot, setSnapshot] = useState<AirQualitySnapshot>(() => {
    return toolGetAtmosphericForecast(
      initialFamilyProfile.locationName,
      { lat: initialFamilyProfile.latitude, lng: initialFamilyProfile.longitude }
    );
  });

  // Daily low-emission routines
  const [routines, setRoutines] = useState(() => {
    return toolGenerateLowEmissionRoutine(initialFamilyProfile, snapshot);
  });

  // Callback when user selects any location on the interactive map
  const handleLocationSelected = (newSnapshot: AirQualitySnapshot) => {
    setSnapshot(newSnapshot);
    const updatedProfile: FamilyProfile = {
      ...profile,
      locationName: newSnapshot.location,
      latitude: newSnapshot.coordinates?.lat ?? profile.latitude,
      longitude: newSnapshot.coordinates?.lng ?? profile.longitude,
    };
    setProfile(updatedProfile);
    setRoutines(toolGenerateLowEmissionRoutine(updatedProfile, newSnapshot));
  };

  const handleToggleRoutineStatus = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'completed' ? 'pending' : 'completed' }
          : r
      )
    );
  };

  // Recomputed impact metrics
  const impact = useMemo(() => {
    return toolQuantifyDirectImpact(routines, profile.members.length);
  }, [routines, profile.members.length]);

  return (
    <div className={`min-h-screen ${highContrast ? 'high-contrast' : ''}`}>
      {/* Top Navigation */}
      <Navbar
        currentProfile={profile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <AQIGauge
              snapshot={snapshot}
              profile={profile}
              language={language}
              onOpenMap={() => setActiveTab('map')}
            />
            <RoutinePlanner
              profile={profile}
              snapshot={snapshot}
              routines={routines}
              onToggleRoutineStatus={handleToggleRoutineStatus}
              language={language}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <LocationMapSelector
            currentProfile={profile}
            currentSnapshot={snapshot}
            onLocationSelected={handleLocationSelected}
            language={language}
          />
        )}

        {activeTab === 'iaq-hacks' && (
          <IAQHackStudio profile={profile} language={language} />
        )}

        {activeTab === 'routines' && (
          <RoutinePlanner
            profile={profile}
            snapshot={snapshot}
            routines={routines}
            onToggleRoutineStatus={handleToggleRoutineStatus}
            language={language}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactTracker impact={impact} profile={profile} language={language} />
        )}

        {activeTab === 'assistant' && (
          <ChatAssistant profile={profile} snapshot={snapshot} language={language} />
        )}

      </main>

      {/* Family Profile Customizer Dialog */}
      <FamilyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => {
          setProfile(updated);
          setRoutines(toolGenerateLowEmissionRoutine(updated, snapshot));
        }}
        language={language}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          AeroSense AI • GenAI Urban Air Quality & Winter Smog Defense Platform
        </p>
        <p className="mt-1">
          Interactive map location selection powered by geospatial aerosol micro-climate modeling. Meets WCAG 2.1 AA accessibility standards.
        </p>
      </footer>
    </div>
  );
};


