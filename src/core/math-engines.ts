import {
  AQICategory,
  CorsiRosenthalSpecs,
  FamilyMember,
  HourlyAQIForecast,
} from '@/types';
import {
  PM25_BREAKPOINTS,
  MINUTE_VENTILATION_BASELINES,
  ACTIVITY_VENTILATION_MULTIPLIERS,
  BERKELEY_EARTH_MICROGRAMS_PER_CIGARETTE,
  CORSI_ROSENTHAL_CONFIG,
  TRANSPORT_CO2_GRAMS_PER_KM,
  TRANSPORT_NOX_MG_PER_KM,
} from '@/core/constants';

/**
 * Result structure for US-EPA AQI calculations.
 */
export interface AQICalculationResult {
  aqi: number;
  category: AQICategory;
}

/**
 * Accessible color palette structure complying with WCAG 2.1 AA.
 */
export interface AQIColorPalette {
  bg: string;
  border: string;
  text: string;
  badge: string;
  label: string;
  description: string;
}

/**
 * Emission reduction differential result.
 */
export interface TransportDifferentialResult {
  avoidedCo2Kg: number;
  avoidedNoxGrams: number;
}

/**
 * Calculates US-EPA AQI from PM2.5 concentration (ug/m3) using standard piecewise linear interpolation:
 * I = ((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low
 *
 * @param pm25 PM2.5 particle concentration in ug/m3
 * @returns Object with numeric AQI (0-999) and mapped AQICategory band
 */
export function calculateAQIFromPM25(pm25: number): AQICalculationResult {
  if (pm25 <= 0) {
    return { aqi: 0, category: 'Good' };
  }

  if (pm25 > 500.4) {
    // Severe Plus / Hazardous emergency extension for winter smog
    const baseAqi = 500;
    const excess = pm25 - 500.4;
    return {
      aqi: Math.min(999, Math.round(baseAqi + excess * 0.5)),
      category: 'SeverePlus',
    };
  }

  for (const bp of PM25_BREAKPOINTS) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
      return {
        aqi: Math.round(aqi),
        category: bp.category,
      };
    }
  }

  return { aqi: 500, category: 'Hazardous' };
}

/**
 * Returns colorblind-friendly colors and accessible text descriptions for each AQI band.
 * Follows WCAG 2.1 AA contrast requirements.
 *
 * @param aqi Calculated numerical AQI
 * @returns AQIColorPalette containing CSS classes and descriptive text
 */
export function getAQIColorPalette(aqi: number): AQIColorPalette {
  if (aqi <= 50) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      border: 'border-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-500 text-white',
      label: 'Good (Air Quality is Satisfactory)',
      description: 'Air pollution poses little or no risk to any demographic.',
    };
  }
  if (aqi <= 100) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      border: 'border-amber-500',
      text: 'text-amber-800 dark:text-amber-300',
      badge: 'bg-amber-500 text-slate-900 font-semibold',
      label: 'Moderate (Acceptable)',
      description: 'Unusually sensitive individuals may experience minor respiratory irritation.',
    };
  }
  if (aqi <= 150) {
    return {
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      border: 'border-orange-500',
      text: 'text-orange-800 dark:text-orange-300',
      badge: 'bg-orange-600 text-white',
      label: 'Unhealthy for Sensitive Groups',
      description: 'Children, seniors, and individuals with asthma/COPD are at heightened risk.',
    };
  }
  if (aqi <= 200) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      border: 'border-rose-500',
      text: 'text-rose-800 dark:text-rose-300',
      badge: 'bg-rose-600 text-white',
      label: 'Unhealthy (General Population Warning)',
      description: 'Everyone may begin to experience respiratory distress and cardiac strain.',
    };
  }
  if (aqi <= 300) {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      border: 'border-purple-500',
      text: 'text-purple-800 dark:text-purple-300',
      badge: 'bg-purple-700 text-white',
      label: 'Very Unhealthy (Health Alert)',
      description: 'Serious risk for the entire community. Avoid all strenuous outdoor exertion.',
    };
  }

  return {
    bg: 'bg-red-950/20 dark:bg-red-950/40',
    border: 'border-red-800',
    text: 'text-red-900 dark:text-red-300',
    badge: 'bg-red-900 text-white font-bold',
    label: 'Hazardous / Winter Smog Emergency',
    description: 'Catastrophic inversion smog event. Mandatory sealed indoor shelter with filtration.',
  };
}

/**
 * Scientific Inhalation Rate Estimator
 * Measures minute ventilation (L/min) based on demographic and physical activity.
 * Based on EPA Exposure Factors Handbook (Chapter 6).
 *
 * @param category Demographic group
 * @param activityLevel Physical exertion level
 * @returns Minute ventilation in Liters per minute
 */
export function getMinuteVentilationLiters(
  category: FamilyMember['category'],
  activityLevel: FamilyMember['activityLevel']
): number {
  const baseline = MINUTE_VENTILATION_BASELINES[category] ?? 13.5;
  const multiplier = ACTIVITY_VENTILATION_MULTIPLIERS[activityLevel] ?? 1.0;
  return baseline * multiplier;
}

/**
 * Calculates PM2.5 Inhaled Mass (micrograms)
 * Formula: Inhaled Mass (ug) = Concentration (ug/m3) * Breathing Volume (m3/hr) * Time (hr) * (1 - Mask Efficiency)
 *
 * @param pm25ConcentrationUgM3 Ambient PM2.5 in ug/m3
 * @param durationHours Exposure duration in hours
 * @param category Vulnerability demographic
 * @param activityLevel Physical exertion level
 * @param respiratorEfficiency Filtration efficiency (0.0 to 1.0)
 * @returns Inhaled particulate mass in micrograms
 */
export function calculateInhaledPM25Micrograms(
  pm25ConcentrationUgM3: number,
  durationHours: number,
  category: FamilyMember['category'],
  activityLevel: FamilyMember['activityLevel'],
  respiratorEfficiency: number = 0
): number {
  if (durationHours <= 0 || pm25ConcentrationUgM3 <= 0) {
    return 0;
  }

  const ventilationLitersPerMinute = getMinuteVentilationLiters(category, activityLevel);
  const ventilationCubicMetersPerHour = (ventilationLitersPerMinute * 60) / 1000;
  
  const effectiveInhaledMass =
    pm25ConcentrationUgM3 *
    ventilationCubicMetersPerHour *
    durationHours *
    Math.max(0, 1 - respiratorEfficiency);

  return Math.round(effectiveInhaledMass * 10) / 10;
}

/**
 * Cigarette Equivalence Model
 * Dr. Richard Muller & Elizabeth Muller (Berkeley Earth formula):
 * Inhaling 22 ug/m3 of PM2.5 over 24 hours (~15 m3 average adult air volume) corresponds to 1 cigarette (~330 ug).
 *
 * @param pm25MicrogramsInhaled Inhaled PM2.5 mass in micrograms
 * @returns Equivalent passive cigarettes consumed
 */
export function calculateCigaretteEquivalence(pm25MicrogramsInhaled: number): number {
  if (pm25MicrogramsInhaled <= 0) {
    return 0;
  }
  const equivalent = pm25MicrogramsInhaled / BERKELEY_EARTH_MICROGRAMS_PER_CIGARETTE;
  return Math.round(equivalent * 10) / 10;
}

/**
 * Corsi-Rosenthal Box Air Physics Engine
 * Calculates Clean Air Delivery Rate (CADR) and Air Changes per Hour (ACH).
 *
 * @param roomVolumeM3 Room volume in cubic meters
 * @param fanCfm Rated fan airflow in CFM
 * @param filterCount Number of MERV filters assembled
 * @param mervRating Filter MERV rating (typically 13)
 * @returns CorsiRosenthalSpecs performance metrics
 */
export function calculateCorsiRosenthalPerformance(
  roomVolumeM3: number,
  fanCfm: number = CORSI_ROSENTHAL_CONFIG.DEFAULT_FAN_CFM,
  filterCount: number = 4,
  mervRating: number = 13
): CorsiRosenthalSpecs {
  const singlePassEfficiency =
    mervRating >= 13
      ? CORSI_ROSENTHAL_CONFIG.MERV13_SINGLE_PASS_EFFICIENCY
      : CORSI_ROSENTHAL_CONFIG.LOWER_MERV_SINGLE_PASS_EFFICIENCY;

  const airflowRetentionFactor =
    filterCount >= 4
      ? CORSI_ROSENTHAL_CONFIG.FOUR_FILTER_FLOW_FACTOR
      : CORSI_ROSENTHAL_CONFIG.LOW_SURFACE_FLOW_FACTOR;

  const effectiveAirflowCfm = fanCfm * airflowRetentionFactor;
  const cadRpm25Cfm = Math.round(effectiveAirflowCfm * singlePassEfficiency);
  const roomVolumeFt3 = roomVolumeM3 * CORSI_ROSENTHAL_CONFIG.M3_TO_FT3_MULTIPLIER;
  
  const effectiveAch =
    roomVolumeFt3 > 0
      ? Math.round(((cadRpm25Cfm * 60) / roomVolumeFt3) * 10) / 10
      : 0;

  const clearanceTimeMinutes =
    effectiveAch > 0
      ? Math.round((CORSI_ROSENTHAL_CONFIG.DECAY_CONSTANT_90_PERCENT / effectiveAch) * 60)
      : 120;

  return {
    fanCfm,
    filterCount,
    filterMervRating: mervRating,
    estimatedCostUsd: filterCount === 4 ? 65 : 75,
    cadRpm25Cfm,
    effectiveAch,
    clearanceTimeMinutes,
  };
}

/**
 * Transport Emission Differential Engine
 * Computes avoided CO2 (kg) and NOx (grams) per trip
 *
 * @param distanceKm Trip distance in kilometers
 * @param baselineMode High-emission baseline mode
 * @param chosenMode Sustainable alternative mode
 * @returns Net avoided CO2 (kg) and NOx (grams)
 */
export function calculateTransportEmissionsDifferential(
  distanceKm: number,
  baselineMode: 'ice_car' | 'bus',
  chosenMode: 'metro_transit' | 'electric_vehicle' | 'cycling_walking' | 'remote_work'
): TransportDifferentialResult {
  const baselineCo2 = TRANSPORT_CO2_GRAMS_PER_KM[baselineMode] ?? 192.0;
  const chosenCo2 = TRANSPORT_CO2_GRAMS_PER_KM[chosenMode] ?? 0.0;
  const netSavedCo2Kg = Math.max(0, ((baselineCo2 - chosenCo2) * distanceKm) / 1000);

  const baselineNox = TRANSPORT_NOX_MG_PER_KM[baselineMode] ?? 450.0;
  const chosenNox = TRANSPORT_NOX_MG_PER_KM[chosenMode] ?? 0.0;
  const netSavedNoxGrams = Math.max(0, ((baselineNox - chosenNox) * distanceKm) / 1000);

  return {
    avoidedCo2Kg: Math.round(netSavedCo2Kg * 100) / 100,
    avoidedNoxGrams: Math.round(netSavedNoxGrams * 10) / 10,
  };
}

/**
 * Diurnal Boundary Layer & Thermal Inversion Predictor
 * Models diurnal solar mixing dynamics and boundary layer entrapment.
 *
 * @param basePm25 Ambient base PM2.5 in ug/m3
 * @param _temperatureC Temperature in Celsius
 * @returns 18-hour diurnal forecast with inversion and ventilation indicators
 */
export function generateDiurnalHourlyForecast(
  basePm25: number,
  _temperatureC: number
): HourlyAQIForecast[] {
  const hours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  return hours.map((hour) => {
    const hourNum = parseInt(hour.split(':')[0], 10);
    let multiplier = 1.0;
    let inversionTrapping = false;
    let isOptimalVentilationWindow = false;
    let action = 'Normal indoor filtration';

    // Morning inversion peak (cold ground radiation, zero solar lift)
    if (hourNum >= 6 && hourNum <= 9) {
      multiplier = 1.45 + (10 - hourNum) * 0.08;
      inversionTrapping = true;
      action = 'Strictly seal windows; avoid morning outdoor jogging';
    } 
    // Solar break & thermal mixing window (12:30 to 15:30)
    else if (hourNum >= 12 && hourNum <= 15) {
      multiplier = 0.58; // Dispersal by thermal updrafts
      isOptimalVentilationWindow = true;
      action = 'Optimal 20-min micro-ventilation window if indoor CO2 is elevated';
    } 
    // Evening boundary layer collapse (heating biomass + traffic exhaust trapped)
    else if (hourNum >= 18 && hourNum <= 23) {
      multiplier = 1.35 + (hourNum - 18) * 0.05;
      inversionTrapping = true;
      action = 'Run Corsi-Rosenthal / HEPA filters on High CADR';
    } else {
      multiplier = 0.85;
      action = 'Moderate activity acceptable indoors';
    }

    const calculatedPm25 = Math.round(basePm25 * multiplier);
    const { aqi } = calculateAQIFromPM25(calculatedPm25);

    return {
      hour,
      aqi,
      pm25: calculatedPm25,
      inversionTrapping,
      isOptimalVentilationWindow,
      recommendedAction: action,
    };
  });
}
