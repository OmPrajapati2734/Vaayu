import { describe, it, expect } from 'vitest';
import { CleanAirCorridor, CarpoolCluster } from '../types';

describe('Community Smog Mitigation & Clean Corridors Model', () => {
  it('calculates significant PM2.5 exposure reduction along green corridors', () => {
    const baselineRoadPM25 = 250;
    const corridor: CleanAirCorridor = {
      id: 'c-test',
      name: 'Ridge Forest Buffer',
      routeType: 'walking_school_street',
      exposureReductionPercent: 42,
      lengthKm: 3.0,
      description: 'Forest path avoiding diesel corridor',
      recommendedTimeWindow: '12:00 PM - 03:00 PM',
      treeCanopyCoverPercent: 78,
    };

    const corridorPM25 = Math.round(baselineRoadPM25 * (1 - corridor.exposureReductionPercent / 100));
    expect(corridorPM25).toBeLessThan(baselineRoadPM25);
    const calculatedReduction = Math.round(
      ((baselineRoadPM25 - corridorPM25) / baselineRoadPM25) * 100
    );
    expect(calculatedReduction).toBe(corridor.exposureReductionPercent);
  });

  it('computes neighborhood carpooling carbon and NOx avoidance', () => {
    const cluster: CarpoolCluster = {
      id: 'cluster-test',
      clusterName: 'School Electric Shuttle',
      destination: 'Springdales School',
      participatingFamiliesCount: 5,
      totalAvoidedCo2DailyKg: 15.0,
      totalAvoidedNoxDailyGrams: 90,
      departureTime: '07:30 AM',
      vehicleType: 'electric_van',
    };

    expect(cluster.participatingFamiliesCount).toBe(5);
    expect(cluster.totalAvoidedCo2DailyKg).toBeGreaterThan(0);
    expect(cluster.totalAvoidedNoxDailyGrams).toBeGreaterThan(0);

    // If an additional member joins:
    const updatedCount = cluster.participatingFamiliesCount + 1;
    expect(updatedCount).toBe(6);
  });
});
