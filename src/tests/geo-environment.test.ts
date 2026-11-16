import { describe, it, expect } from 'vitest';
import {
  GLOBAL_SMOG_HOTSPOTS,
  calculateLocationEnvironmentalData,
  getDistanceKm,
} from '../core/geo-environment';

describe('Geospatial Distance & Hotspot Mathematics', () => {
  it('correctly calculates Haversine distance between geographical coordinates', () => {
    // Delhi to Lahore distance is approx 420-430 km
    const dist = getDistanceKm(28.6139, 77.2090, 31.5204, 74.3587);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(450);

    // Distance between identical coordinates is 0
    expect(getDistanceKm(40.76, -111.89, 40.76, -111.89)).toBe(0);
  });

  it('contains verified global severe winter smog and inversion corridors', () => {
    expect(GLOBAL_SMOG_HOTSPOTS.length).toBeGreaterThanOrEqual(8);

    const delhi = GLOBAL_SMOG_HOTSPOTS.find((h) => h.id === 'delhi-ncr');
    expect(delhi).toBeDefined();
    expect(delhi?.inversionSeverity).toBe('Severe');
    expect(delhi?.basePm25).toBeGreaterThan(200);

    const slc = GLOBAL_SMOG_HOTSPOTS.find((h) => h.id === 'salt-lake-city');
    expect(slc).toBeDefined();
    expect(slc?.topography).toBe('valley_basin');
    expect(slc?.inversionDescription).toContain('Cold-Air Pool');
  });
});

describe('Geographic Environmental Data Engine', () => {
  it('generates accurate environmental telemetry for Delhi NCR hotspot coordinates', () => {
    const data = calculateLocationEnvironmentalData(28.6139, 77.2090);

    expect(data.aqi).toBeGreaterThan(250);
    expect(data.pm25).toBeGreaterThan(200);
    expect(data.inversionStatus.severity).toBe('Severe');
    expect(data.inversionStatus.mixingHeightMeters).toBeLessThan(250);
    expect(data.coordinates?.lat).toBeCloseTo(28.6139, 2);
    expect(data.coordinates?.lng).toBeCloseTo(77.2090, 2);
    expect(data.ventilationWindows.length).toBeGreaterThan(0);
  });

  it('generates mountain bowl cold-pool inversion data for Salt Lake City', () => {
    const data = calculateLocationEnvironmentalData(40.7608, -111.8910);

    expect(data.location).toContain('Salt Lake City');
    expect(data.inversionStatus.severity).toBe('Severe');
    expect(data.temperatureC).toBeLessThanOrEqual(0); // Sub-zero winter temperature
    expect(data.pm25).toBeGreaterThan(50);
  });

  it('generates marine inversion cap data for Los Angeles', () => {
    const data = calculateLocationEnvironmentalData(34.0522, -118.2437);

    expect(data.location).toContain('Los Angeles');
    expect(data.primaryEmissionSource).toBeDefined();
    expect(data.o3).toBeGreaterThan(15);
  });

  it('interpolates deterministic micro-climate for arbitrary global coordinates', () => {
    // Southern hemisphere mid-latitude test: -34.6037, -58.3816 (Buenos Aires)
    const data = calculateLocationEnvironmentalData(-34.6037, -58.3816);

    expect(data.aqi).toBeGreaterThan(0);
    expect(data.pm25).toBeGreaterThan(0);
    expect(data.inversionStatus.mixingHeightMeters).toBeGreaterThan(100);
    expect(data.hourlyForecast.length).toBe(18);
    expect(data.coordinates?.lat).toBe(-34.6037);
  });
});

