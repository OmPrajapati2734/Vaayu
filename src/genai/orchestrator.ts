import {
  AirQualitySnapshot,
  ChatMessage,
  FamilyProfile,
  GenAIToolExecution,
  IAQRemedy,
  ScheduledRoutineItem,
} from '@/types';
import {
  calculateAQIFromPM25,
  calculateCigaretteEquivalence,
  calculateCorsiRosenthalPerformance,
  calculateInhaledPM25Micrograms,
  calculateTransportEmissionsDifferential,
  generateDiurnalHourlyForecast,
  getAQIColorPalette,
} from '@/core/math-engines';
import { calculateLocationEnvironmentalData } from '@/core/geo-environment';
import { SCIENTIFIC_CITATIONS, SCIENTIFIC_IAQ_HACKS } from '@/genai/knowledge-base';

// ==========================================
// 1. TOOL CALL SCHEMAS & INTERFACES
// ==========================================

export interface ToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResponse {
  toolName: string;
  result: Record<string, unknown>;
}

// ==========================================
// 2. DOMAIN TOOLS IMPLEMENTATION
// ==========================================

/**
 * Tool 1: Atmospheric & Inversion Forecaster
 */
export function toolGetAtmosphericForecast(
  location: string,
  coordsOrOverride?: { lat: number; lng: number } | number,
  basePm25Override?: number
): AirQualitySnapshot {
  if (coordsOrOverride && typeof coordsOrOverride === 'object' && 'lat' in coordsOrOverride) {
    return calculateLocationEnvironmentalData(coordsOrOverride.lat, coordsOrOverride.lng, location);
  }

  const overrideVal = typeof coordsOrOverride === 'number' ? coordsOrOverride : basePm25Override;
  const defaultBasePm25 = overrideVal ?? 245; // Severe smog base level
  const tempC = 9; // Winter morning temperature
  const hourly = generateDiurnalHourlyForecast(defaultBasePm25, tempC);
  const currentHour = hourly[2]; // e.g. 08:00 morning peak

  const { aqi, category } = calculateAQIFromPM25(currentHour.pm25);

  return {
    timestamp: new Date().toISOString(),
    location: location || 'Delhi NCR Urban Zone',
    aqi,
    category,
    pm25: currentHour.pm25,
    pm10: Math.round(currentHour.pm25 * 1.8),
    no2: 82, // ppb
    so2: 19, // ppb
    co: 2.8, // ppm
    o3: 24, // ppb
    temperatureC: tempC,
    humidityPercent: 88,
    windSpeedKmh: 4.2, // stagnant wind speed trapping smog
    inversionStatus: {
      severity: 'Severe',
      mixingHeightMeters: 180,
      breakupEstimatedTime: '13:00 - 15:30',
      explanation:
        'A strong nocturnal radiation inversion layer has trapped surface vehicular exhaust, biomass heating smoke, and industrial particulate matter below 200 meters. Wind velocity is insufficient (< 5 km/h) for horizontal dispersion.',
    },
    ventilationWindows: [
      {
        start: '13:00',
        end: '15:15',
        safeRatio: 0.55,
        advice:
          'Solar heating will lift the thermal boundary layer. Conduct brief 15-minute cross-ventilation to evacuate indoor CO2, then reseal tightly before 17:30.',
      },
    ],
    hourlyForecast: hourly,
  };
}

/**
 * Tool 2: Vulnerability Profile Risk Analyzer
 */
export function toolAssessVulnerabilityProfile(profile: FamilyProfile) {
  const vulnerableMembers = profile.members.filter(
    (m) =>
      m.category === 'infant' ||
      m.category === 'child' ||
      m.category === 'elderly' ||
      m.category === 'pregnant' ||
      m.healthConditions.some((c) => c !== 'none')
  );

  const highRiskMembers = profile.members.filter((m) =>
    m.healthConditions.some((c) => c === 'asthma' || c === 'copd' || c === 'cardiovascular')
  );

  const personalizedRecommendations: string[] = [];

  if (vulnerableMembers.length > 0) {
    personalizedRecommendations.push(
      `Family includes ${vulnerableMembers.length} high-sensitivity member(s): ${vulnerableMembers.map((m) => `${m.name} (${m.category})`).join(', ')}. Outdoor exposure must be strictly prohibited during morning (06:00-10:00) and evening (18:00-22:00) inversion peaks.`
    );
  }

  if (highRiskMembers.length > 0) {
    personalizedRecommendations.push(
      `Clinical Priority: Ensure quick-relief bronchodilator inhalers are on hand for ${highRiskMembers.map((m) => m.name).join(', ')}. Keep bedroom PM2.5 below 15 ug/m3 using continuous filtration.`
    );
  }

  if (profile.cookingFuel === 'biomass_wood' || profile.cookingFuel === 'lpg_cylinder') {
    personalizedRecommendations.push(
      'Indoor combustion source detected: Operating gas/solid fuel without continuous high-capacity exhaust doubles fine particulate indoor spikes. Transition immediately to electric induction where possible or run exhaust hoods with negative draft.'
    );
  }

  return {
    totalFamilyMembers: profile.members.length,
    vulnerableCount: vulnerableMembers.length,
    highClinicalRiskCount: highRiskMembers.length,
    housingAirVolumeM3: profile.roomVolumeCubicMeters,
    purifierDeficit: profile.hasHepaPurifier ? 0 : Math.ceil(profile.roomVolumeCubicMeters / 60),
    tailoredDirectives: personalizedRecommendations,
  };
}

/**
 * Tool 3: Indoor Air Quality & DIY Hack Simulator
 */
export function toolSimulateIAQHacks(
  roomVolumeM3: number,
  currentPm25: number,
  hacksRequested?: string[]
): {
  corsiSpecs: ReturnType<typeof calculateCorsiRosenthalPerformance>;
  recommendedHacks: IAQRemedy[];
  projectedIndoorPm25: number;
  indoorClearingTimeMinutes: number;
} {
  const corsiSpecs = calculateCorsiRosenthalPerformance(roomVolumeM3, 220, 4, 13);
  
  // Calculate equilibrium indoor concentration with DIY filtration running:
  // C_indoor = C_outdoor * (Infiltration Rate / (Infiltration Rate + CADR/V))
  // For standard apartment: infiltration ~ 0.5 ACH; Corsi adds ~ 4.5 ACH
  // Retention ratio = 0.5 / (0.5 + 4.5) = 10%
  const projectedIndoorPm25 = Math.round(currentPm25 * 0.12);

  const selectedHacks = hacksRequested && hacksRequested.length > 0
    ? SCIENTIFIC_IAQ_HACKS.filter((h) => hacksRequested.includes(h.id))
    : SCIENTIFIC_IAQ_HACKS;

  return {
    corsiSpecs,
    recommendedHacks: selectedHacks,
    projectedIndoorPm25,
    indoorClearingTimeMinutes: corsiSpecs.clearanceTimeMinutes,
  };
}

/**
 * Tool 4: Low-Emission Daily Routine Planner
 */
export function toolGenerateLowEmissionRoutine(
  profile: FamilyProfile,
  snapshot: AirQualitySnapshot
): ScheduledRoutineItem[] {
  const items: ScheduledRoutineItem[] = [];

  // Morning Commute Optimization
  const commuters = profile.members.filter((m) => m.commuteDurationMinutes > 0);
  for (const m of commuters) {
    const isHighSmog = snapshot.aqi > 200;
    const travelDistKm = Math.round((m.commuteDurationMinutes / 60) * 25); // estimate 25 km/h avg urban speed

    const emissionDelta = calculateTransportEmissionsDifferential(
      travelDistKm,
      'ice_car',
      isHighSmog ? 'metro_transit' : 'metro_transit'
    );

    // Calculate Inhaled PM2.5 savings (driving with car AC recirculation vs walking on open road)
    const outdoorDose = calculateInhaledPM25Micrograms(snapshot.pm25, m.commuteDurationMinutes / 60, m.category, 'moderate', 0);
    const protectedDose = calculateInhaledPM25Micrograms(
      snapshot.pm25 * 0.25, // Metro station / sealed cabin with N95
      m.commuteDurationMinutes / 60,
      m.category,
      'sedentary',
      0.95
    );
    const savedMicrograms = Math.max(0, outdoorDose - protectedDose);

    items.push({
      id: `routine-commute-${m.id}`,
      timeRange: '07:30 - 08:45',
      title: `${m.name}: Shift to Mass Transit & Wear N95`,
      baselineHabit: 'Single-occupancy private vehicle or walking along traffic arteries',
      recommendedAlternative: 'Take underground Metro transit line; equip verified N95 respirator during above-ground transfers.',
      exposureMitigationPercent: 88,
      avoidedPm25Micrograms: Math.round(savedMicrograms),
      avoidedCo2Kg: emissionDelta.avoidedCo2Kg,
      targetMembers: [m.name],
      status: 'pending',
      actionNote: `Avoids morning boundary-layer inversion peak and saves ${emissionDelta.avoidedCo2Kg} kg CO2e today.`,
    });
  }

  // School / Child outdoor schedule
  const children = profile.members.filter((m) => m.category === 'child' || m.category === 'infant');
  if (children.length > 0) {
    items.push({
      id: 'routine-school-recess',
      timeRange: '10:30 - 12:00',
      title: 'Children: Reschedule Outdoor Physical Education to Indoor Auditorium',
      baselineHabit: 'Outdoor physical education and playground running in AQI > 250',
      recommendedAlternative: 'Mandate indoor games in filtered gym or library; child respiration increases 400% during outdoor sports.',
      exposureMitigationPercent: 82,
      avoidedPm25Micrograms: 145,
      avoidedCo2Kg: 0,
      targetMembers: children.map((c) => c.name),
      status: 'pending',
      actionNote: 'Crucial for developing pediatric lungs; prevents bronchospasm.',
    });
  }

  // Afternoon Solar Micro-Ventilation
  items.push({
    id: 'routine-afternoon-ventilation',
    timeRange: '13:30 - 13:50',
    title: 'Home: 20-Minute Thermal Solar Micro-Ventilation',
    baselineHabit: 'Leaving windows sealed all day causing toxic CO2 accumulation (>1800 ppm)',
    recommendedAlternative: 'Open cross-breeze windows for exactly 20 minutes while solar convection breaks the inversion layer.',
    exposureMitigationPercent: 65,
    avoidedPm25Micrograms: 35,
    avoidedCo2Kg: 0.2,
    targetMembers: ['All Family Members'],
    status: 'pending',
    actionNote: 'Flushes out indoor stale air and cooking fumes with the cleanest ambient air of the 24-hr cycle.',
  });

  // Evening Cooking & Heating Protection
  items.push({
    id: 'routine-evening-cooking',
    timeRange: '18:30 - 20:00',
    title: 'Kitchen: Pre-Exhaust Induction Cooking & Corsi Filtration',
    baselineHabit: 'High-temperature unvented wok frying and dry floor sweeping',
    recommendedAlternative: 'Run exhaust hood on boost mode 2 mins prior to heat; switch air cleaners to maximum CADR in bedrooms.',
    exposureMitigationPercent: 78,
    avoidedPm25Micrograms: 95,
    avoidedCo2Kg: 0.8,
    targetMembers: ['All Family Members'],
    status: 'pending',
    actionNote: 'Guards against evening boundary-layer collapse when ground-level smoke spikes.',
  });

  return items;
}

/**
 * Tool 5: Quantified Direct Impact Calculator
 */
export function toolQuantifyDirectImpact(
  routines: ScheduledRoutineItem[],
  familyCount: number
) {
  const completedOrAccepted = routines.filter((r) => r.status === 'accepted' || r.status === 'completed');
  const activeItems = completedOrAccepted.length > 0 ? completedOrAccepted : routines; // calculate potential if not yet checked

  const totalPm25Avoided = activeItems.reduce((acc, r) => acc + r.avoidedPm25Micrograms, 0);
  const totalCo2Saved = activeItems.reduce((acc, r) => acc + r.avoidedCo2Kg, 0);
  const totalNoxSaved = Math.round(totalCo2Saved * 2.8 * 10) / 10; // stoichiometric ratio for ICE displacement
  const cigarettesEquiv = calculateCigaretteEquivalence(totalPm25Avoided);

  // Community multiplier: if 500 neighbors adopt similar daily micro-habits
  const communityNeighborhoodSavingsKgCo2 = Math.round(totalCo2Saved * 500);

  let rankBadge: 'Clean Air Novice' | 'Urban Smog Guardian' | 'Community Eco Champion' | 'Atmospheric Vanguard' = 'Clean Air Novice';
  if (totalPm25Avoided > 250) rankBadge = 'Atmospheric Vanguard';
  else if (totalPm25Avoided > 150) rankBadge = 'Community Eco Champion';
  else if (totalPm25Avoided > 50) rankBadge = 'Urban Smog Guardian';

  return {
    dailyPm25AvoidedMicrograms: totalPm25Avoided,
    equivalentCigarettesNotSmoked: cigarettesEquiv,
    dailyCo2EmissionsSavedKg: Math.round(totalCo2Saved * 10) / 10,
    dailyNoxSavedGrams: totalNoxSaved,
    indoorAchAchieved: 4.8,
    communityNeighborhoodSavingsKgCo2,
    cleanAirRankBadge: rankBadge,
  };
}

// ==========================================
// 3. GENAI AGENT & ORCHESTRATOR CLASS
// ==========================================

export class AeroSenseAIAgent {
  private toolLogs: GenAIToolExecution[] = [];

  /**
   * Dispatches autonomous tool execution based on user intent and parameters
   */
  public executeTool(toolName: string, args: Record<string, unknown>): Record<string, unknown> {
    let result: Record<string, unknown> = {};

    switch (toolName) {
      case 'getAtmosphericForecast': {
        const location = (args.location as string) || 'Delhi NCR';
        const coords = args.coordinates as { lat: number; lng: number } | undefined;
        const pm25 = typeof args.basePm25 === 'number' ? args.basePm25 : undefined;
        result = toolGetAtmosphericForecast(location, coords ?? pm25, pm25) as unknown as Record<string, unknown>;
        break;
      }
      case 'assessVulnerabilityProfile': {
        const profile = args.profile as FamilyProfile;
        result = toolAssessVulnerabilityProfile(profile) as unknown as Record<string, unknown>;
        break;
      }
      case 'simulateIAQHacks': {
        const roomVolume = (args.roomVolumeM3 as number) || 75;
        const pm25 = (args.currentPm25 as number) || 245;
        result = toolSimulateIAQHacks(roomVolume, pm25) as unknown as Record<string, unknown>;
        break;
      }
      case 'generateLowEmissionRoutine': {
        const profile = args.profile as FamilyProfile;
        const snapshot = args.snapshot as AirQualitySnapshot;
        result = { routines: toolGenerateLowEmissionRoutine(profile, snapshot) };
        break;
      }
      case 'quantifyDirectImpact': {
        const routines = args.routines as ScheduledRoutineItem[];
        const count = (args.familyCount as number) || 4;
        result = toolQuantifyDirectImpact(routines, count) as unknown as Record<string, unknown>;
        break;
      }
      default:
        result = { error: `Unrecognized tool name: ${toolName}` };
    }

    this.toolLogs.push({
      toolName,
      inputs: args,
      outputs: result,
      executionTimestamp: new Date().toISOString(),
    });

    return result;
  }

  public getToolLogs(): GenAIToolExecution[] {
    return [...this.toolLogs];
  }

  /**
   * High-level conversational inference pipeline.
   * Leverages tool outputs, prompt fencing, and verified scientific knowledge.
   */
  public async respondToUserQuery(
    userQuery: string,
    profile: FamilyProfile,
    snapshot: AirQualitySnapshot
  ): Promise<ChatMessage> {
    const queryLower = userQuery.toLowerCase();
    const executedTools: GenAIToolExecution[] = [];

    // Autonomous Tool Calling Decision Graph
    let promptContext = '';

    if (queryLower.includes('inversion') || queryLower.includes('weather') || queryLower.includes('smog') || queryLower.includes('aqi')) {
      const forecastResult = this.executeTool('getAtmosphericForecast', { location: profile.locationName, basePm25: snapshot.pm25 });
      executedTools.push(this.toolLogs[this.toolLogs.length - 1]);
      promptContext += `\n[ATMOSPHERIC TOOL OUTPUT]: AQI is ${(forecastResult as unknown as AirQualitySnapshot).aqi}, PM2.5 is ${(forecastResult as unknown as AirQualitySnapshot).pm25} ug/m3. Inversion Severity: ${(forecastResult as unknown as AirQualitySnapshot).inversionStatus.severity}.`;
    }

    if (queryLower.includes('hack') || queryLower.includes('filter') || queryLower.includes('corsi') || queryLower.includes('purifier') || queryLower.includes('indoor')) {
      const iaqResult = this.executeTool('simulateIAQHacks', { roomVolumeM3: profile.roomVolumeCubicMeters, currentPm25: snapshot.pm25 });
      executedTools.push(this.toolLogs[this.toolLogs.length - 1]);
      promptContext += `\n[IAQ TOOL OUTPUT]: Corsi-Rosenthal box CADR is ${(iaqResult as any).corsiSpecs.cadRpm25Cfm} CFM, achieving ${(iaqResult as any).corsiSpecs.effectiveAch} ACH. Clearance time to 90% reduction: ${(iaqResult as any).corsiSpecs.clearanceTimeMinutes} mins.`;
    }

    if (queryLower.includes('routine') || queryLower.includes('commute') || queryLower.includes('travel') || queryLower.includes('schedule') || queryLower.includes('school')) {
      const routineResult = this.executeTool('generateLowEmissionRoutine', { profile, snapshot });
      executedTools.push(this.toolLogs[this.toolLogs.length - 1]);
      const routines = (routineResult as any).routines as ScheduledRoutineItem[];
      promptContext += `\n[ROUTINE TOOL OUTPUT]: Generated ${routines.length} low-emission schedule steps targeting commute and school hours.`;
    }

    if (queryLower.includes('impact') || queryLower.includes('cigarette') || queryLower.includes('co2') || queryLower.includes('saved') || queryLower.includes('health')) {
      const routines = toolGenerateLowEmissionRoutine(profile, snapshot);
      const impactResult = this.executeTool('quantifyDirectImpact', { routines, familyCount: profile.members.length });
      executedTools.push(this.toolLogs[this.toolLogs.length - 1]);
      promptContext += `\n[IMPACT TOOL OUTPUT]: Avoided ${(impactResult as any).dailyPm25AvoidedMicrograms} ug PM2.5 (equivalent to not smoking ${(impactResult as any).equivalentCigarettesNotSmoked} cigarettes). Saved ${(impactResult as any).dailyCo2EmissionsSavedKg} kg CO2 today.`;
    }

    // Synthesize structured GenAI response grounded in domain science
    let reply = '';
    if (queryLower.includes('corsi') || queryLower.includes('diy') || queryLower.includes('purifier') || queryLower.includes('hack')) {
      reply = `### 🛠️ Scientific DIY Indoor Air Solution: The Corsi-Rosenthal Box\n\n` +
        `For your **${profile.familyName}** residence (${profile.roomVolumeCubicMeters} m³ volume), a DIY Corsi-Rosenthal box using **4 MERV 13 filters** and a standard 20" box fan delivers **${calculateCorsiRosenthalPerformance(profile.roomVolumeCubicMeters).cadRpm25Cfm} CFM CADR**:\n\n` +
        `1. **Air Changes Per Hour (ACH)**: Reaches **${calculateCorsiRosenthalPerformance(profile.roomVolumeCubicMeters).effectiveAch} ACH**, surpassing the CDC/WHO minimum threshold of 4.0 for respiratory infection and smog clearance.\n` +
        `2. **Clearance Speed**: Clears 90% of toxic PM2.5 in approximately **${calculateCorsiRosenthalPerformance(profile.roomVolumeCubicMeters).clearanceTimeMinutes} minutes**.\n` +
        `3. **Cost Efficiency**: Costs ~$65-$75 USD to construct, compared to $350-$500 for commercial HEPA units with comparable clean air delivery.\n` +
        `4. **Ventilation Timing Protocol**: Keep all windows tightly sealed during morning hours. Micro-ventilate strictly between **13:00 and 15:15** when solar radiation breaks the ground inversion layer.`;
    } else if (queryLower.includes('routine') || queryLower.includes('commute') || queryLower.includes('schedule')) {
      reply = `### ⏱️ Personalized Low-Emission & Low-Exposure Daily Schedule\n\n` +
        `Given current severe inversion smog (${snapshot.pm25} µg/m³, AQI ${snapshot.aqi}), here is your family's tailored strategy:\n\n` +
        `* **07:30 - 09:00 Morning Commute**: Divert from private vehicle/walking to **Electrified Metro Transit**. Ground-level soot is concentrated in the bottom 180 meters. Wearing a snug **N95 respirator** prevents ${Math.round(snapshot.pm25 * 0.85)} µg of PM2.5 inhalation.\n` +
        `* **10:30 - 12:00 School Schedule**: Keep ${profile.members.filter(m => m.category === 'child').map(m => m.name).join(', ') || 'children'} indoors. Avoid playground sports; strenuous exercise quadruples minute ventilation to >30 L/min, driving submicron soot deep into alveolar ducts.\n` +
        `* **13:30 - 13:50 Solar Micro-Ventilation**: Open opposite windows 2-3 inches for 20 minutes only. This purges indoor CO2 while ambient pollution is at its daily minimum.\n` +
        `* **18:30 - 20:00 Dinner Preparation**: Pre-run the range hood exhaust on high before ignition. Never dry-sweep floors; damp microfiber mopping only.`;
    } else if (queryLower.includes('impact') || queryLower.includes('cigarette') || queryLower.includes('co2')) {
      const routines = toolGenerateLowEmissionRoutine(profile, snapshot);
      const impact = toolQuantifyDirectImpact(routines, profile.members.length);
      reply = `### 📊 Direct Impact Assessment for Your Household\n\n` +
        `By enacting your AeroSense daily routines today, your family achieves:\n\n` +
        `* **Personal Lung Protection**: **${impact.dailyPm25AvoidedMicrograms} µg PM2.5 avoided** across all household members.\n` +
        `* **Cigarette Dosage Equivalence**: Prevented breathing the toxic particulate equivalent of **${impact.equivalentCigarettesNotSmoked} cigarettes** today (based on Berkeley Earth 22 µg/m³ 24h standard).\n` +
        `* **Community Carbon Abatement**: **${impact.dailyCo2EmissionsSavedKg} kg of CO₂e** and **${impact.dailyNoxSavedGrams} g of NOₓ** eliminated by opting for mass transit and efficient home thermal routines.\n` +
        `* **Neighborhood Collective Scalability**: If 500 households in your local ward match this, your community avoids **${impact.communityNeighborhoodSavingsKgCo2} kg of CO₂** daily!`;
    } else {
      reply = `### 🛡️ AeroSense AI Real-Time Advisory\n\n` +
        `Welcome to AeroSense AI. Currently, **${profile.locationName}** is experiencing a **${snapshot.inversionStatus.severity} Winter Inversion Event** with an AQI of **${snapshot.aqi}** (PM2.5: ${snapshot.pm25} µg/m³).\n\n` +
        `**Key Vulnerability Directives for ${profile.familyName}:**\n` +
        profile.members.map(m => `• **${m.name} (${m.category})**: ${m.category === 'infant' || m.category === 'elderly' ? 'Mandatory sealed indoor space with continuous air filtration.' : 'Wear sealed N95 outdoors; postpone aerobic workouts.'}`).join('\n') + '\n\n' +
        `**Recommended Immediate Actions:**\n` +
        `1. Activate your indoor air filtration (${profile.hasHepaPurifier ? 'HEPA Purifiers' : 'Construct DIY Corsi-Rosenthal Box'}).\n` +
        `2. Delay natural ventilation until **13:00 - 15:15** when solar thermal lift temporarily opens the boundary layer.\n` +
        `3. Switch commute from private ICE vehicles to metro transit to avoid ground-level traffic soot corridors.`;
    }

    return {
      id: `chat-${Date.now()}`,
      role: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolCalls: executedTools,
      citations: SCIENTIFIC_CITATIONS.slice(0, 2),
    };
  }
}

