import React, { useState } from 'react';
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
  ShieldAlert,
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
  if (!isOpen) return null;

  const [formData, setFormData] = useState<FamilyProfile>({ ...profile });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState<number>(30);
  const [newMemberCategory, setNewMemberCategory] = useState<VulnerabilityCategory>('adult');
  const [newMemberCondition, setNewMemberCondition] = useState<HealthCondition>('none');

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
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-black text-slate-900 dark:text-white">
                Family & Vulnerability Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AeroSense customizes inhalation thresholds and ventilation protocols to your household
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Housing & Environmental Specs */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" /> Residence Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Family / Household Name
              </label>
              <input
                type="text"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room Volume (m³)
              </label>
              <input
                type="number"
                value={formData.roomVolumeCubicMeters}
                onChange={(e) => setFormData({ ...formData, roomVolumeCubicMeters: Number(e.target.value) })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cooking Source
              </label>
              <select
                value={formData.cookingFuel}
                onChange={(e) => setFormData({ ...formData, cookingFuel: e.target.value as any })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="piped_gas">Piped Natural Gas (PNG)</option>
                <option value="lpg_cylinder">LPG Cylinder</option>
                <option value="induction_electric">Induction / Electric (Zero Flame)</option>
                <option value="biomass_wood">Biomass / Solid Fuel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Indoor Air Filtration Available
              </label>
              <select
                value={formData.hasHepaPurifier ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, hasHepaPurifier: e.target.value === 'yes' })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="no">No Commercial Purifier (Using DIY Hacks)</option>
                <option value="yes">Yes (HEPA Unit Installed)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Family Members List */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" /> Household Members & Vulnerabilities
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
                  aria-label={`Remove member ${m.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick Add Form */}
          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/60 space-y-3">
            <span className="text-xs font-bold text-sky-800 dark:text-sky-300">Add Family Member</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="number"
                placeholder="Age"
                value={newMemberAge}
                onChange={(e) => setNewMemberAge(Number(e.target.value))}
                className="p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <select
                value={newMemberCategory}
                onChange={(e) => setNewMemberCategory(e.target.value as any)}
                className="p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="infant">Infant (&lt;2y)</option>
                <option value="child">Child (2-12y)</option>
                <option value="teen">Teen (13-17y)</option>
                <option value="adult">Adult (18-64y)</option>
                <option value="elderly">Elderly (65+y)</option>
                <option value="pregnant">Pregnant</option>
              </select>
              <select
                value={newMemberCondition}
                onChange={(e) => setNewMemberCondition(e.target.value as any)}
                className="p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="none">No respiratory issues</option>
                <option value="asthma">Asthma</option>
                <option value="copd">COPD</option>
                <option value="cardiovascular">Cardiovascular</option>
                <option value="allergies">Severe Allergies</option>
              </select>
            </div>
            <button
              onClick={handleAddMember}
              disabled={!newMemberName.trim()}
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member to Profile
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20"
          >
            Save Profile & Update Directives
          </button>
        </div>

      </div>
    </div>
  );
};

