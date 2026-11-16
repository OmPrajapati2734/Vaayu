import { z } from 'zod';

// ==========================================
// 1. FAMILY & LIFESTYLE PROFILE SCHEMAS
// ==========================================

export const HealthConditionSchema = z.enum([
  'none',
  'asthma',
  'copd',
  'cardiovascular',
  'allergies',
  'bronchitis',
  'other_respiratory'
]);
export type HealthCondition = z.infer<typeof HealthConditionSchema>;

export const VulnerabilityCategorySchema = z.enum([
  'infant',       // < 2 yrs (Highest alveolar sensitivity)
  'child',        // 2-12 yrs (High lung surface-to-body-weight ratio)
  'teen',         // 13-17 yrs
  'adult',        // 18-64 yrs
  'elderly',      // 65+ yrs (Reduced cardiac reserve)
  'pregnant'      // Fetomaternal risk from transplacental PM2.5
]);
export type VulnerabilityCategory = z.infer<typeof VulnerabilityCategorySchema>;

export const ActivityLevelSchema = z.enum([
  'sedentary',    // 6-8 L/min air intake
  'moderate',     // 15-25 L/min air intake
  'active',       // 30-45 L/min air intake
  'outdoor_pro'   // 45-65 L/min air intake (athletes, delivery, construction)
]);
export type ActivityLevel = z.infer<typeof ActivityLevelSchema>;

export const FamilyMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0).max(125),
  category: VulnerabilityCategorySchema,
  healthConditions: z.array(HealthConditionSchema),
  activityLevel: ActivityLevelSchema,
  commuteMode: z.enum(['metro_transit', 'electric_vehicle', 'cycling_walking', 'ice_car', 'bus', 'remote_work']),
  commuteDurationMinutes: z.number().min(0).max(360),
});
export type FamilyMember = z.infer<typeof FamilyMemberSchema>;

export const HousingTypeSchema = z.enum([
  'apartment_highrise',   // Above inversion ground shear (cleaner or soot layer dependent)
  'apartment_lowrise',    // Ground-level inversion trapping
  'independent_house',    // Higher natural infiltration
  'suburban_villa'
]);
export type HousingType = z.infer<typeof HousingTypeSchema>;

export const FamilyProfileSchema = z.object({
  id: z.string(),
  familyName: z.string(),
  locationName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  housingType: HousingTypeSchema,
  roomVolumeCubicMeters: z.number().min(10).max(1000), // e.g. 75 m3
  hasHepaPurifier: z.boolean(),
  purifierCount: z.number().min(0).max(20),
  hasKitchenExhaust: z.boolean(),
  cookingFuel: z.enum(['induction_electric', 'piped_gas', 'lpg_cylinder', 'biomass_wood']),
  heatingType: z.enum(['electric_heat_pump', 'reverse_ac', 'gas_heater', 'wood_burning_fireplace', 'central_heating']),
  members: z.array(FamilyMemberSchema),
});
export type FamilyProfile = z.infer<typeof FamilyProfileSchema>;

// ==========================================
// 2. ATMOSPHERIC & AIR QUALITY SCHEMAS
// ==========================================

export const AQICategorySchema = z.enum([
  'Good',                 // 0-50
  'Moderate',             // 51-100
  'UnhealthyForSensitive',// 101-150
  'Unhealthy',            // 151-200
  'VeryUnhealthy',        // 201-300
  'Hazardous',            // 301-500
  'SeverePlus'            // >500 (Winter Smog Emergency)
]);
export type AQICategory = z.infer<typeof AQICategorySchema>;

export const InversionSeveritySchema = z.enum([
  'None',
  'Moderate',
  'Severe'
]);
export type InversionSeverity = z.infer<typeof InversionSeveritySchema>;

export interface HourlyAQIForecast {
  hour: string; // e.g., "08:00"
  aqi: number;
  pm25: number;
  inversionTrapping: boolean;
  isOptimalVentilationWindow: boolean;
  recommendedAction: string;
}

export interface AirQualitySnapshot {
  timestamp: string;
  location: string;
  aqi: number;
  category: AQICategory;
  pm25: number;      // ug/m3
  pm10: number;      // ug/m3
  no2: number;       // ppb
  so2: number;       // ppb
  co: number;        // ppm
  o3: number;        // ppb
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  inversionStatus: {
    severity: InversionSeverity;
    mixingHeightMeters: number;
    breakupEstimatedTime: string;
    explanation: string;
  };
  ventilationWindows: {
    start: string;
    end: string;
    safeRatio: number; // Outdoor/indoor safety ratio
    advice: string;
  }[];
  hourlyForecast: HourlyAQIForecast[];
  coordinates?: { lat: number; lng: number };
  primaryEmissionSource?: string;
}

// ==========================================
// 3. INDOOR AIR QUALITY (IAQ) HACKS SCHEMAS
// ==========================================

export interface CorsiRosenthalSpecs {
  fanCfm: number;                 // e.g. 200 CFM
  filterCount: number;             // 4 or 5 filters
  filterMervRating: number;        // MERV 13 (90% PM2.5 capture)
  estimatedCostUsd: number;        // ~$60-$80 vs $400 commercial
  cadRpm25Cfm: number;             // Clean Air Delivery Rate in CFM
  effectiveAch: number;            // Air Changes per Hour in target room
  clearanceTimeMinutes: number;    // Time to 90% particle reduction
}

export interface IAQRemedy {
  id: string;
  title: string;
  category: 'diy_filter' | 'ventilation' | 'source_control' | 'botanical' | 'cleaning';
  costLevel: '$' | '$$' | '$$$';
  efficiencyGainPercent: number; // e.g. 85% PM2.5 reduction
  difficulty: 'Easy (5 mins)' | 'Medium (30 mins)' | 'Advanced';
  urgency: 'Immediate' | 'Scheduled' | 'Long-term';
  materialsNeeded: string[];
  scientificMechanism: string;
  stepByStepGuide: string[];
  impactOnLungs: string;
}

// ==========================================
// 4. LOW-EMISSION ROUTINES & SCHEDULES
// ==========================================

export interface ScheduledRoutineItem {
  id: string;
  timeRange: string;
  title: string;
  baselineHabit: string;
  recommendedAlternative: string;
  exposureMitigationPercent: number;
  avoidedPm25Micrograms: number;
  avoidedCo2Kg: number;
  targetMembers: string[];
  status: 'pending' | 'accepted' | 'completed' | 'skipped';
  actionNote: string;
}

// ==========================================
// 5. IMPACT & METRICS SUMMARY
// ==========================================

export interface ImpactSummary {
  dailyPm25AvoidedMicrograms: number;
  equivalentCigarettesNotSmoked: number;
  dailyCo2EmissionsSavedKg: number;
  dailyNoxSavedGrams: number;
  indoorAchAchieved: number;
  communityNeighborhoodSavingsKgCo2: number;
  cleanAirRankBadge: 'Clean Air Novice' | 'Urban Smog Guardian' | 'Community Eco Champion' | 'Atmospheric Vanguard';
}

// ==========================================
// 6. GENAI ASSISTANT TYPES
// ==========================================

export interface GenAIToolExecution {
  toolName: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  executionTimestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: GenAIToolExecution[];
  citations?: {
    source: string;
    doiOrUrl?: string;
    keyTakeaway: string;
  }[];
}
