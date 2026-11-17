import {
  AQICategory,
  CorsiRosenthalSpecs,
  FamilyMember,
  HourlyAQIForecast,
} from '@/types';

/**
 * US-EPA Standard AQI Breakpoints for PM2.5 (24-hour average in ug/m3)
 * Reference: EPA-454/B-18-007
 */
const PM25_BREAKPOINTS = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50, category: 'Good' as AQICategory },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100, category: 'Moderate' as AQICategory },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150, category: 'UnhealthyForSensitive' as AQICategory },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200, category: 'Unhealthy' as AQICategory },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300, category: 'VeryUnhealthy' as AQICategory },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500, category: 'Hazardous' as AQICategory },
];

/**
 * Calculates US-EPA AQI from PM2.5 concentration (ug/m3)
 * using standard piecewise linear interpolation:
 * I = ((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low
 */
export function calculateAQIFromPM25(pm25: number): { aqi: number; category: AQICategory } {
  if (pm25 < 0) return { aqi: 0, category: 'Good' };
  
  if (pm25 > 500.4) {
    // Severe Plus / Hazardous emergency extension
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
 */
export function getAQIColorPalette(aqi: number): {
  bg: string;
  border: string;
  text: string;
  badge: string;
  label: string;
  description: string;
} {
  if (aqi <= 50) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      border: 'border-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-500 text-white',
      label: 'Good (Air Quality is Satisfactory)',
      description: 'Air pollution poses little or no risk to any demographic.',
    };
  } else if (aqi <= 100) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      border: 'border-amber-500',
      text: 'text-amber-800 dark:text-amber-300',
      badge: 'bg-amber-500 text-slate-900 font-semibold',
      label: 'Moderate (Acceptable)',
      description: 'Unusually sensitive individuals may experience minor respiratory irritation.',
    };
  } else if (aqi <= 150) {
    return {
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      border: 'border-orange-500',
      text: 'text-orange-800 dark:text-orange-300',
      badge: 'bg-orange-600 text-white',
      label: 'Unhealthy for Sensitive Groups',
      description: 'Children, seniors, and individuals with asthma/COPD are at heightened risk.',
    };
  } else if (aqi <= 200) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      border: 'border-rose-500',
      text: 'text-rose-800 dark:text-rose-300',
      badge: 'bg-rose-600 text-white',
      label: 'Unhealthy (General Population Warning)',
      description: 'Everyone may begin to experience respiratory distress and cardiac strain.',
    };
  } else if (aqi <= 300) {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      border: 'border-purple-500',
      text: 'text-purple-800 dark:text-purple-300',
      badge: 'bg-purple-700 text-white',
      label: 'Very Unhealthy (Health Alert)',
      description: 'Serious risk for the entire community. Avoid all strenuous outdoor exertion.',
    };
  } else {
    return {
      bg: 'bg-red-950/20 dark:bg-red-950/40',
      border: 'border-red-800',
      text: 'text-red-900 dark:text-red-300',
      badge: 'bg-red-900 text-white font-bold',
      label: 'Hazardous / Winter Smog Emergency',
      description: 'Catastrophic inversion smog event. Mandatory sealed indoor shelter with filtration.',
    };
  }
}

/**
 * Scientific Inhalation Rate Estimator
 * Measures minute ventilation (L/min) based on demographic and physical activity.
 * Based on EPA Exposure Factors Handbook (Chapter 6).
 */
export function getMinuteVentilationLiters(
  category: FamilyMember['category'],
  activityLevel: FamilyMember['activityLevel']
): number {
  // Baseline sedentary breathing rates (Liters per minute)
  const baselineByAge: Record<FamilyMember['category'], number> = {
    infant: 3.5,     // normalized to body mass
    child: 8.0,
    teen: 12.0,
    adult: 13.5,
    elderly: 10.5,
    pregnant: 16.0,  // Progesterone-mediated 30-50% hyperventilation
  };

  const activityMultiplier: Record<FamilyMember['activityLevel'], number> = {
    sedentary: 1.0,
    moderate: 2.1,   // walking, light household chores
    active: 3.8,     // jogging, fast cycling
    outdoor_pro: 4.5,// heavy continuous manual labor
  };

  return baselineByAge[category] * activityMultiplier[activityLevel];
}

/**
 * Calculates PM2.5 Inhaled Mass (micrograms)
 * Formula: Inhaled Mass (ug) = Concentration (ug/m3) * Breathing Volume (m3/hr) * Time (hr) * (1 - Mask Efficiency)
 */
export function calculateInhaledPM25Micrograms(
  pm25ConcentrationUgM3: number,
  durationHours: number,
  category: FamilyMember['category'],
  activityLevel: FamilyMember['activityLevel'],
  respiratorEfficiency: number = 0 // 0 = none, 0.95 = N95, 0.40 = surgical
): number {
  const ventilationLitersPerMinute = getMinuteVentilationLiters(category, activityLevel);
  const ventilationCubicMetersPerHour = (ventilationLitersPerMinute * 60) / 1000;
  
  const effectiveInhaledMass =
    pm25ConcentrationUgM3 *
    ventilationCubicMetersPerHour *
    durationHours *
    (1 - respiratorEfficiency);

  return Math.round(effectiveInhaledMass * 10) / 10;
}

/**
 * Cigarette Equivalence Model
 * Dr. Richard Muller & Elizabeth Muller (Berkeley Earth formula):
 * Breathing 22 ug/m3 of PM2.5 over 24 hours is approximately equivalent to smoking 1 cigarette.
 * 22 ug/m3 * (approx 15 m3 average adult air volume) = ~330 ug of inhaled PM2.5.
 */
export function calculateCigaretteEquivalence(pm25MicrogramsInhaled: number): number {
  const microgramsPerCigarette = 330; // standard Berkeley Earth adult dosage reference
  const equivalent = pm25MicrogramsInhaled / microgramsPerCigarette;
  return Math.round(equivalent * 10) / 10;
}

/**
 * Corsi-Rosenthal Box Air Physics Engine
 * Calculates Clean Air Delivery Rate (CADR) and Air Changes per Hour (ACH).
 * Reference: Dr. Richard Corsi & Jim Rosenthal (2020), UC Davis aerosol clearance study.
 */
export function calculateCorsiRosenthalPerformance(
  roomVolumeM3: number,
  fanCfm: number = 200, // typical 20" standard box fan
  filterCount: number = 4, // 4-filter cube or 5-filter shroud
  mervRating: number = 13 // MERV 13 is optimum
): CorsiRosenthalSpecs {
  // MERV 13 single-pass fractional removal efficiency for PM2.5 is ~0.85 to 0.90
  const singlePassEfficiency = mervRating >= 13 ? 0.88 : 0.65;
  
  // Static pressure drop penalty reduction: more filter surface area lowers face velocity
  // and increases airflow compared to a single taped filter.
  // Flow coefficient factor for 4-5 filters is ~0.75-0.82 of nominal fan CFM
  const airflowRetentionFactor = filterCount >= 4 ? 0.82 : 0.60;
  const effectiveAirflowCfm = fanCfm * airflowRetentionFactor;
  
  const cadRpm25Cfm = Math.round(effectiveAirflowCfm * singlePassEfficiency);
  
  // Convert Room Volume from m3 to ft3 (1 m3 = 35.3147 ft3)
  const roomVolumeFt3 = roomVolumeM3 * 35.3147;
  
  // ACH = (CADR in CFM * 60 minutes) / Room Volume in ft3
  const effectiveAch = Math.round(((cadRpm25Cfm * 60) / roomVolumeFt3) * 10) / 10;
  
  // Time to 90% particle reduction (exponential decay model: ln(10) / ACH * 60 min)
  // t_90% = 2.303 / ACH * 60
  const clearanceTimeMinutes = effectiveAch > 0 ? Math.round((2.303 / effectiveAch) * 60) : 120;

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
 * Computes avoided CO2 (kg) and NOx (grams) per kilometer
 * References: UK DEFRA Greenhouse Gas Conversion Factors & US-EPA MOVES model.
 */
export function calculateTransportEmissionsDifferential(
  distanceKm: number,
  baselineMode: 'ice_car' | 'bus',
  chosenMode: 'metro_transit' | 'electric_vehicle' | 'cycling_walking' | 'remote_work'
): { avoidedCo2Kg: number; avoidedNoxGrams: number } {
  // Emission Factors (g CO2e per passenger-km)
  const co2FactorsGramsPerKm: Record<string, number> = {
    ice_car: 192.0,      // Average petrol/diesel passenger vehicle
    bus: 105.0,          // Urban diesel bus (shared occupancy)
    metro_transit: 28.0, // High-capacity electrified mass rail
    electric_vehicle: 45.0, // Grid average charging footprint
    cycling_walking: 0.0,
    remote_work: 0.0,
  };

  // NOx Emission Factors (mg per passenger-km)
  const noxFactorsMgPerKm: Record<string, number> = {
    ice_car: 450.0,
    bus: 850.0,
    metro_transit: 15.0,
    electric_vehicle: 5.0,
    cycling_walking: 0.0,
    remote_work: 0.0,
  };

  const baselineCo2 = co2FactorsGramsPerKm[baselineMode] ?? 192;
  const chosenCo2 = co2FactorsGramsPerKm[chosenMode] ?? 0;
  const netSavedCo2Kg = Math.max(0, ((baselineCo2 - chosenCo2) * distanceKm) / 1000);

  const baselineNox = noxFactorsMgPerKm[baselineMode] ?? 450;
  const chosenNox = noxFactorsMgPerKm[chosenMode] ?? 0;
  const netSavedNoxGrams = Math.max(0, ((baselineNox - chosenNox) * distanceKm) / 1000);

  return {
    avoidedCo2Kg: Math.round(netSavedCo2Kg * 100) / 100,
    avoidedNoxGrams: Math.round(netSavedNoxGrams * 10) / 10,
  };
}

/**
 * Diurnal Boundary Layer & Thermal Inversion Predictor
 * Identifies high-risk trapping hours (early morning 06:00-09:30 & night 20:00-24:00)
 * vs solar thermal mixing window (12:30-15:30).
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

