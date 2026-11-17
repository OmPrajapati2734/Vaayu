import { AQICategory, FamilyMember } from '@/types';

/**
 * AeroSense AI Scientific & Environmental Constants
 * References:
 * - US-EPA Standard AQI Breakpoints (EPA-454/B-18-007)
 * - EPA Exposure Factors Handbook (Chapter 6: Minute Ventilation)
 * - Dr. Richard Muller & Elizabeth Muller (Berkeley Earth Air Pollution & Cigarette Equivalence)
 * - Dr. Richard Corsi & Jim Rosenthal (UC Davis Aerosol Clearance Model)
 * - UK DEFRA & US-EPA MOVES Transportation Emission Standards
 */

export interface PM25Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
  category: AQICategory;
}

/**
 * US-EPA Standard PM2.5 (24-hr average in µg/m³) Breakpoint Table
 */
export const PM25_BREAKPOINTS: readonly PM25Breakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50, category: 'Good' },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100, category: 'Moderate' },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150, category: 'UnhealthyForSensitive' },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200, category: 'Unhealthy' },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300, category: 'VeryUnhealthy' },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500, category: 'Hazardous' },
] as const;

/**
 * Standard baseline resting minute ventilation rates in Liters/minute by demographic.
 */
export const MINUTE_VENTILATION_BASELINES: Readonly<Record<FamilyMember['category'], number>> = {
  infant: 3.5,     // Normalized to infant pulmonary mass
  child: 8.0,
  teen: 12.0,
  adult: 13.5,
  elderly: 10.5,
  pregnant: 16.0,  // Progesterone-mediated 30-50% respiratory expansion
} as const;

/**
 * Physical activity ventilation multipliers.
 */
export const ACTIVITY_VENTILATION_MULTIPLIERS: Readonly<Record<FamilyMember['activityLevel'], number>> = {
  sedentary: 1.0,
  moderate: 2.1,    // Walking, light household tasks
  active: 3.8,      // Running, fast cycling, sports
  outdoor_pro: 4.5, // Continuous high-intensity manual labor
} as const;

/**
 * Berkeley Earth PM2.5 Inhalation Cigarette Equivalence Factor
 * Inhaling 22 µg/m³ of PM2.5 over 24 hours (~15 m³ air volume = ~330 µg) corresponds to 1 cigarette.
 */
export const BERKELEY_EARTH_MICROGRAMS_PER_CIGARETTE = 330;

/**
 * Corsi-Rosenthal DIY Box Fan Filtration Constants
 */
export const CORSI_ROSENTHAL_CONFIG = {
  DEFAULT_FAN_CFM: 200,
  MERV13_SINGLE_PASS_EFFICIENCY: 0.88,
  LOWER_MERV_SINGLE_PASS_EFFICIENCY: 0.65,
  FOUR_FILTER_FLOW_FACTOR: 0.82,
  LOW_SURFACE_FLOW_FACTOR: 0.60,
  M3_TO_FT3_MULTIPLIER: 35.3147,
  DECAY_CONSTANT_90_PERCENT: 2.303, // -ln(1 - 0.90) = ln(10)
} as const;

/**
 * Transportation Greenhouse Gas and Criteria Pollutant Emission Factors
 * Units:
 * - CO2e: grams per passenger-kilometer
 * - NOx: milligrams per passenger-kilometer
 */
export const TRANSPORT_CO2_GRAMS_PER_KM: Readonly<Record<string, number>> = {
  ice_car: 192.0,
  bus: 105.0,
  metro_transit: 28.0,
  electric_vehicle: 45.0,
  cycling_walking: 0.0,
  remote_work: 0.0,
} as const;

export const TRANSPORT_NOX_MG_PER_KM: Readonly<Record<string, number>> = {
  ice_car: 450.0,
  bus: 850.0,
  metro_transit: 15.0,
  electric_vehicle: 5.0,
  cycling_walking: 0.0,
  remote_work: 0.0,
} as const;

/**
 * Diurnal Inversion Layer Parameters
 */
export const INVERSION_PARAMETERS = {
  CRITICAL_MIXING_HEIGHT_METERS: 250,
  MODERATE_MIXING_HEIGHT_METERS: 400,
  SEVERE_PM25_THRESHOLD: 150,
  MODERATE_PM25_THRESHOLD: 75,
} as const;
