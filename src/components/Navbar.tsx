import React, { useState } from 'react';
import {
  Wind,
  Moon,
  Sun,
  Eye,
  Languages,
  Sparkles,
  Users,
} from 'lucide-react';
import { FamilyProfile } from '@/types';

interface NavbarProps {
  currentProfile: FamilyProfile;
  onOpenProfileModal: () => void;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  onOpenProfileModal,
  language,
  onToggleLanguage,
  highContrast,
  onToggleHighContrast,
  activeTab,
  onSelectTab,
}) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { id: 'dashboard', label: language === 'en' ? 'Live Smog Monitor' : 'लाइव स्मॉग मॉनिटर' },
    { id: 'map', label: language === 'en' ? 'Select Location on Map' : 'मानचित्र से स्थान चुनें' },
    { id: 'iaq-hacks', label: language === 'en' ? 'Indoor Air Hacks & DIY' : 'इंडोर एयर हैक्स' },
    { id: 'routines', label: language === 'en' ? 'Low-Emission Planner' : 'दैनिक रूटीन' },
    { id: 'impact', label: language === 'en' ? 'Direct Impact & Badges' : 'स्वास्थ्य प्रभाव' },
    { id: 'assistant', label: language === 'en' ? 'GenAI Assistant' : 'एआई सहायक' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  AeroSense <span className="text-sky-600 dark:text-sky-400">AI</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                  <Sparkles className="w-3 h-3 mr-1" /> GenAI Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {language === 'en'
                  ? 'Severe Winter Smog & Community Air Quality Defense'
                  : 'सर्दियों के प्रदूषण व स्मॉग से परिवार की सुरक्षा'}
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-semibold border-b-2 border-sky-600 dark:border-sky-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions & Accessibility Tools */}
          <div className="flex items-center gap-2">
            {/* Family Profile Button */}
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
              title="Manage Household & Vulnerability Profile"
              aria-label="Manage Family Profile"
            >
              <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline font-semibold">{currentProfile.familyName}</span>
              <span className="inline-flex items-center justify-center bg-sky-600 text-white text-[10px] w-4 h-4 rounded-full">
                {currentProfile.members.length}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
              aria-label="Toggle Language"
            >
              <Languages className="w-4 h-4" />
            </button>

            {/* High Contrast Accessibility Toggle */}
            <button
              onClick={onToggleHighContrast}
              className={`p-2 rounded-lg border transition-colors ${
                highContrast
                  ? 'bg-amber-100 border-amber-500 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle High Contrast Mode (WCAG 2.1 AA)"
              aria-label="High Contrast Mode"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark / Light Theme"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 gap-1 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};

