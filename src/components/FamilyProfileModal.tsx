import React, { useState, useEffect } from 'react';
import {
  FamilyMember,
  FamilyProfile,
  HealthCondition,
  VulnerabilityCategory,
} from '@/types';
import {
  X,
  Plus,
  Trash2,
  Users,
  Home,
  Heart,
} from 'lucide-react';

interface FamilyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FamilyProfile;
  onSaveProfile: (profile: FamilyProfile) => void;
  language: 'en' | 'hi';
}

export const FamilyProfileModal: React.FC<FamilyProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  language,
}) => {
  const [formData, setFormData] = useState<FamilyProfile>({ ...profile });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState<number>(30);
  const [newMemberCategory, setNewMemberCategory] = useState<VulnerabilityCategory>('adult');
  const [newMemberCondition, setNewMemberCondition] = useState<HealthCondition>('none');

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...profile });
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newMember: FamilyMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      age: Number(newMemberAge),
      category: newMemberCategory,
      healthConditions: [newMemberCondition],
      activityLevel: 'moderate',
      commuteMode: 'metro_transit',
      commuteDurationMinutes: 30,
    };
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
  };

  const handleSave = () => {
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-600 rounded-xl" aria-hidden="true">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 id="family-modal-title" className="text-xl font-black text-slate-900 dark:text-white">
                {language === 'en' ? 'Family & Vulnerability Profile' : 'परिवार व संवेदनशीलता प्रोफ़ाइल'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'en'
                  ? 'AeroSense customizes inhalation thresholds and ventilation protocols to your household'
                  : 'एरोसेंस आपके परिवार के लिए सुरक्षित वेंटिलेशन और इनहेलेशन सीमाएं अनुकूलित करता है'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={language === 'en' ? 'Close profile modal' : 'प्रोफ़ाइल विंडो बंद करें'}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Housing & Environmental Specs */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            {language === 'en' ? 'Residence Specifications' : 'आवास विनिर्देश'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-family-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'en' ? 'Family / Household Name' : 'परिवार का नाम'}
              </label>
              <input
                id="input-family-name"
                type="text"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
            <div>
              <label htmlFor="input-room-volume" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'en' ? 'Room Volume (m³)' : 'कमरे का आयतन (घन मीटर)'}
              </label>
              <input
                id="input-room-volume"
                type="number"
                min={10}
                max={500}
                value={formData.roomVolumeCubicMeters}
                onChange={(e) => setFormData({ ...formData, roomVolumeCubicMeters: Number(e.target.value) })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="select-cooking-fuel" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'en' ? 'Cooking Source' : 'रसोई ईंधन'}
              </label>
              <select
                id="select-cooking-fuel"
                value={formData.cookingFuel}
                onChange={(e) => setFormData({ ...formData, cookingFuel: e.target.value as FamilyProfile['cookingFuel'] })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="piped_gas">Piped Natural Gas (PNG)</option>
                <option value="lpg_cylinder">LPG Cylinder</option>
                <option value="induction_electric">Induction / Electric (Zero Flame)</option>
                <option value="biomass_wood">Biomass / Solid Fuel</option>
              </select>
            </div>
            <div>
              <label htmlFor="select-hepa-purifier" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'en' ? 'Indoor Air Filtration Available' : 'घर में वायु शोधक यंत्र'}
              </label>
              <select
                id="select-hepa-purifier"
                value={formData.hasHepaPurifier ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, hasHepaPurifier: e.target.value === 'yes' })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="no">{language === 'en' ? 'No Commercial Purifier (Using DIY Hacks)' : 'कोई व्यावसायिक प्यूरीफायर नहीं (DIY हैक्स)'}</option>
                <option value="yes">{language === 'en' ? 'Yes (HEPA Unit Installed)' : 'हाँ (HEPA प्यूरीफायर लगा है)'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Family Members List */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            {language === 'en' ? 'Household Members & Vulnerabilities' : 'पारिवारिक सदस्य और स्वास्थ्य संवेदनशीलता'}
          </h3>
          
          <div className="space-y-2">
            {formData.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white mr-2">{m.name}</span>
                  <span className="text-slate-500 capitalize">({m.category}, age {m.age})</span>
                  {m.healthConditions.length > 0 && m.healthConditions[0] !== 'none' && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold text-[10px]">
                      {m.healthConditions.join(', ')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  aria-label={`${language === 'en' ? 'Remove member' : 'सदस्य हटाएं'} ${m.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick Add Form */}
          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/60 space-y-3">
            <span className="text-xs font-bold text-sky-800 dark:text-sky-300">
              {language === 'en' ? 'Add Family Member' : 'नया सदस्य जोड़ें'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <label htmlFor="member-name-input" className="sr-only">Member Name</label>
                <input
                  id="member-name-input"
                  type="text"
                  placeholder={language === 'en' ? 'Name' : 'नाम'}
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label htmlFor="member-age-input" className="sr-only">Member Age</label>
                <input
                  id="member-age-input"
                  type="number"
                  placeholder={language === 'en' ? 'Age' : 'उम्र'}
                  value={newMemberAge}
                  onChange={(e) => setNewMemberAge(Number(e.target.value))}
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label htmlFor="member-category-select" className="sr-only">Vulnerability Category</label>
                <select
                  id="member-category-select"
                  value={newMemberCategory}
                  onChange={(e) => setNewMemberCategory(e.target.value as VulnerabilityCategory)}
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <option value="infant">Infant (&lt;2y)</option>
                  <option value="child">Child (2-12y)</option>
                  <option value="teen">Teen (13-17y)</option>
                  <option value="adult">Adult (18-64y)</option>
                  <option value="elderly">Elderly (65+y)</option>
                  <option value="pregnant">Pregnant</option>
                </select>
              </div>
              <div>
                <label htmlFor="member-condition-select" className="sr-only">Health Condition</label>
                <select
                  id="member-condition-select"
                  value={newMemberCondition}
                  onChange={(e) => setNewMemberCondition(e.target.value as HealthCondition)}
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <option value="none">No respiratory issues</option>
                  <option value="asthma">Asthma</option>
                  <option value="copd">COPD</option>
                  <option value="cardiovascular">Cardiovascular</option>
                  <option value="allergies">Severe Allergies</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleAddMember}
              disabled={!newMemberName.trim()}
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              {language === 'en' ? 'Add Member to Profile' : 'प्रोफ़ाइल में सदस्य जोड़ें'}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {language === 'en' ? 'Cancel' : 'रद्द करें'}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20"
          >
            {language === 'en' ? 'Save Profile & Update Directives' : 'प्रोफ़ाइल सुरक्षित करें'}
          </button>
        </div>

      </div>
    </div>
  );
};
