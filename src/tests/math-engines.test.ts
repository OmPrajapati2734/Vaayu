import { describe, it, expect } from 'vitest';
import {
  calculateAQIFromPM25,
  calculateInhaledPM25Micrograms,
  calculateCigaretteEquivalence,
  calculateCorsiRosenthalPerformance,
  calculateTransportEmissionsDifferential,
  generateDiurnalHourlyForecast,
  getAQIColorPalette,
  getMinuteVentilationLiters,
} from '../core/math-engines';

describe('US-EPA AQI Mathematical Engine', () => {
  it('correctly maps PM2.5 breakpoints to US-EPA AQI categories', () => {
    // Good: 0 to 12.0 ug/m3 -> 0 to 50 AQI
    expect(calculateAQIFromPM25(8.0).category).toBe('Good');
    expect(calculateAQIFromPM25(8.0).aqi).toBeGreaterThan(0);
    expect(calculateAQIFromPM25(8.0).aqi).toBeLessThanOrEqual(50);

    // Moderate: 12.1 to 35.4 ug/m3 -> 51 to 100 AQI
    expect(calculateAQIFromPM25(25.0).category).toBe('Moderate');
    expect(calculateAQIFromPM25(25.0).aqi).toBeGreaterThanOrEqual(51);
    expect(calculateAQIFromPM25(25.0).aqi).toBeLessThanOrEqual(100);

    // Unhealthy for Sensitive: 35.5 to 55.4 ug/m3 -> 101 to 150 AQI
    expect(calculateAQIFromPM25(45.0).category).toBe('UnhealthyForSensitive');

    // Unhealthy: 55.5 to 150.4 ug/m3 -> 151 to 200 AQI
    expect(calculateAQIFromPM25(100.0).category).toBe('Unhealthy');

    // Very Unhealthy: 150.5 to 250.4 ug/m3 -> 201 to 300 AQI
    expect(calculateAQIFromPM25(200.0).category).toBe('VeryUnhealthy');

    // Hazardous: 250.5 to 500.4 ug/m3 -> 301 to 500 AQI
    expect(calculateAQIFromPM25(350.0).category).toBe('Hazardous');

    // Severe Plus: > 500.4 ug/m3 (Smog emergency)
    expect(calculateAQIFromPM25(600.0).category).toBe('SeverePlus');
    expect(calculateAQIFromPM25(600.0).aqi).toBeGreaterThan(500);
  });

  it('provides WCAG 2.1 AA accessible color palette for all AQI bands', () => {
    const goodPalette = getAQIColorPalette(45);
    expect(goodPalette.label).toContain('Good');
    expect(goodPalette.badge).toBeDefined();

    const severePalette = getAQIColorPalette(420);
    expect(severePalette.label).toContain('Hazardous');
    expect(severePalette.text).toBeDefined();
  });
});

describe('Respiratory Exposure & Inhalation Dosimetry Model', () => {
  it('correctly models minute ventilation according to physiological activity', () => {
    const infantSedentary = getMinuteVentilationLiters('infant', 'sedentary');
    const childSedentary = getMinuteVentilationLiters('child', 'sedentary');
    const adultSedentary = getMinuteVentilationLiters('adult', 'sedentary');
    const adultActive = getMinuteVentilationLiters('adult', 'active');
    const pregnantSedentary = getMinuteVentilationLiters('pregnant', 'sedentary');

    expect(infantSedentary).toBeLessThan(childSedentary);
    expect(childSedentary).toBeLessThan(adultSedentary);
    expect(adultActive).toBeGreaterThan(adultSedentary * 3);
    // Pregnancy hyperventilation check
    expect(pregnantSedentary).toBeGreaterThan(adultSedentary);
  });

  it('calculates inhaled PM2.5 dose and respirator mitigation', () => {
    const pm25 = 200; // ug/m3
    const hours = 2;

    const unmaskedDose = calculateInhaledPM25Micrograms(pm25, hours, 'adult', 'moderate', 0);
    const n95MaskedDose = calculateInhaledPM25Micrograms(pm25, hours, 'adult', 'moderate', 0.95);

    expect(unmaskedDose).toBeGreaterThan(0);
    expect(n95MaskedDose).toBeLessThan(unmaskedDose * 0.1); // >90% reduction
  });

  it('converts PM2.5 mass to Berkeley Earth cigarette equivalence', () => {
    const dose330ug = 330; // standard equivalent to 1 cigarette
    expect(calculateCigaretteEquivalence(dose330ug)).toBe(1.0);
    expect(calculateCigaretteEquivalence(660)).toBe(2.0);
  });
});

describe('Corsi-Rosenthal DIY Filtration Physics Engine', () => {
  it('computes realistic CADR, ACH, and clearance time for room dimensions', () => {
    const roomVolumeM3 = 75; // typical living room (approx 30m2 x 2.5m ceiling)
    const specs = calculateCorsiRosenthalPerformance(roomVolumeM3, 200, 4, 13);

    expect(specs.cadRpm25Cfm).toBeGreaterThan(100);
    expect(specs.effectiveAch).toBeGreaterThanOrEqual(3.0);
    expect(specs.clearanceTimeMinutes).toBeLessThanOrEqual(60);
    expect(specs.estimatedCostUsd).toBeLessThan(100);
  });
});

describe('Transport Emission Differential Engine', () => {
  it('accurately quantifies avoided CO2 and NOx for mass transit alternatives', () => {
    const distanceKm = 20;
    const { avoidedCo2Kg, avoidedNoxGrams } = calculateTransportEmissionsDifferential(
      distanceKm,
      'ice_car',
      'metro_transit'
    );

    expect(avoidedCo2Kg).toBeGreaterThan(2.0); // at least ~3.2 kg CO2 saved
    expect(avoidedNoxGrams).toBeGreaterThan(5.0); // at least ~8.7g NOx avoided
  });
});

describe('Diurnal Inversion Forecast Simulation', () => {
  it('correctly predicts morning inversion peak and midday thermal ventilation window', () => {
    const forecast = generateDiurnalHourlyForecast(200, 10);
    expect(forecast.length).toBe(18);

    const morningPeak = forecast.find((f) => f.hour === '08:00');
    expect(morningPeak?.inversionTrapping).toBe(true);
    expect(morningPeak?.pm25).toBeGreaterThan(200);

    const afternoonWindow = forecast.find((f) => f.hour === '13:00');
    expect(afternoonWindow?.isOptimalVentilationWindow).toBe(true);
    expect(afternoonWindow?.pm25).toBeLessThan(200);
  });
});

