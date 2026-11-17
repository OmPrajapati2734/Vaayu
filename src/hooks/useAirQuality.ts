import { useState, useEffect, useCallback } from 'react';
import { AirQualitySnapshot } from '@/types';
import { fetchLiveLocationEnvironmentalData, calculateLocationEnvironmentalData } from '@/core/geo-environment';

interface UseAirQualityReturn {
  snapshot: AirQualitySnapshot;
  isLoading: boolean;
  error: string | null;
  updateLocation: (lat: number, lng: number, locationName?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Enterprise Custom Hook: useAirQuality
 * Encapsulates telemetry fetching, state transitions, and caching logic.
 */
export function useAirQuality(
  initialLat: number,
  initialLng: number,
  initialLocationName: string
): UseAirQualityReturn {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [locationName, setLocationName] = useState<string>(initialLocationName);
  const [snapshot, setSnapshot] = useState<AirQualitySnapshot>(() =>
    calculateLocationEnvironmentalData(initialLat, initialLng, initialLocationName)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(
    async (lat: number, lng: number, name?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchLiveLocationEnvironmentalData(lat, lng, name);
        setSnapshot(data);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve atmospheric telemetry';
        setError(errorMsg);
        // Fallback to validated mathematical physics engine
        setSnapshot(calculateLocationEnvironmentalData(lat, lng, name));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;
    fetchLiveLocationEnvironmentalData(coords.lat, coords.lng, locationName).then((data) => {
      if (isMounted) {
        setSnapshot(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [coords.lat, coords.lng, locationName]);

  const updateLocation = useCallback(
    async (lat: number, lng: number, name?: string) => {
      setCoords({ lat, lng });
      if (name) setLocationName(name);
      await fetchTelemetry(lat, lng, name);
    },
    [fetchTelemetry]
  );

  const refresh = useCallback(async () => {
    await fetchTelemetry(coords.lat, coords.lng, locationName);
  }, [fetchTelemetry, coords.lat, coords.lng, locationName]);

  return {
    snapshot,
    isLoading,
    error,
    updateLocation,
    refresh,
  };
}
