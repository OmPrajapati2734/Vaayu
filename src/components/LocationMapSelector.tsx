import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  AirQualitySnapshot,
  FamilyProfile,
} from '@/types';
import {
  GLOBAL_SMOG_HOTSPOTS,
  LocationHotspot,
  calculateLocationEnvironmentalData,
  fetchLiveLocationEnvironmentalData,
} from '@/core/geo-environment';
import {
  getAQIColorPalette,
} from '@/core/math-engines';
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  Layers,
  Thermometer,
  Wind,
  Droplets,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';

interface LocationMapSelectorProps {
  currentProfile: FamilyProfile;
  currentSnapshot: AirQualitySnapshot;
  onLocationSelected: (snapshot: AirQualitySnapshot) => void;
  language: 'en' | 'hi';
}

export const LocationMapSelector: React.FC<LocationMapSelectorProps> = ({
  currentProfile,
  currentSnapshot: _currentSnapshot,
  onLocationSelected,
  language,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: currentProfile.latitude || 28.6139,
    lng: currentProfile.longitude || 77.2090,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>('delhi-ncr');
  const [isLocating, setIsLocating] = useState(false);
  const [locationApplied, setLocationApplied] = useState(false);
  const [isFetchingLive, setIsFetchingLive] = useState(false);

  // Initial calculation + live asynchronous fetch for zero hardcoded reliance
  const [locationEnvData, setLocationEnvData] = useState<AirQualitySnapshot>(() => {
    return calculateLocationEnvironmentalData(selectedCoords.lat, selectedCoords.lng);
  });

  useEffect(() => {
    let isMounted = true;
    setLocationEnvData(calculateLocationEnvironmentalData(selectedCoords.lat, selectedCoords.lng));
    setIsFetchingLive(true);

    fetchLiveLocationEnvironmentalData(selectedCoords.lat, selectedCoords.lng)
      .then((liveData) => {
        if (isMounted) {
          setLocationEnvData(liveData);
          setIsFetchingLive(false);
        }
      })
      .catch((_error: unknown) => {
        if (isMounted) setIsFetchingLive(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCoords.lat, selectedCoords.lng]);

  const palette = getAQIColorPalette(locationEnvData.aqi);

  // Helper to construct custom accessible Leaflet DivIcon
  const createAQIMarkerIcon = (aqi: number, colorHex: string) => {
    return L.divIcon({
      className: 'custom-aqi-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
          <div class="absolute w-12 h-12 rounded-full opacity-40 animate-ping" style="background-color: ${colorHex}"></div>
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-2xl text-white font-black text-xs" style="background-color: ${colorHex}">
            ${aqi}
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rotate-45 border-r border-b border-white" style="background-color: ${colorHex}"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -24],
    });
  };

  // Color mapper for AQI pins
  const getMarkerColor = (aqi: number): string => {
    if (aqi <= 50) return '#10B981';
    if (aqi <= 100) return '#F59E0B';
    if (aqi <= 150) return '#F97316';
    if (aqi <= 200) return '#EF4444';
    if (aqi <= 300) return '#8B5CF6';
    return '#7F1D1D';
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedCoords.lat, selectedCoords.lng],
        zoom: 9,
        zoomControl: true,
        attributionControl: true,
      });

      // Standard OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Create interactive draggable marker
      const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
        draggable: true,
        icon: createAQIMarkerIcon(locationEnvData.aqi, getMarkerColor(locationEnvData.aqi)),
      }).addTo(map);

      // Map Click Event: Move pin and update coordinates
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedCoords({ lat, lng });
        setSelectedHotspotId(null);
        setLocationApplied(false);
        marker.setLatLng([lat, lng]);
      });

      // Marker Drag Event
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setSelectedCoords({ lat: pos.lat, lng: pos.lng });
        setSelectedHotspotId(null);
        setLocationApplied(false);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync marker and map center when selectedCoords change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([selectedCoords.lat, selectedCoords.lng]);
      markerRef.current.setIcon(
        createAQIMarkerIcon(locationEnvData.aqi, getMarkerColor(locationEnvData.aqi))
      );
      mapInstanceRef.current.panTo([selectedCoords.lat, selectedCoords.lng], { animate: true });
    }
  }, [selectedCoords.lat, selectedCoords.lng, locationEnvData.aqi]);

  // Handle Preset Hotspot Selection
  const handleSelectHotspot = (hotspot: LocationHotspot) => {
    setSelectedHotspotId(hotspot.id);
    setSelectedCoords({ lat: hotspot.lat, lng: hotspot.lng });
    setLocationApplied(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([hotspot.lat, hotspot.lng], 10, { animate: true });
    }
  };

  // Handle HTML5 Geolocation
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setSelectedCoords({ lat: latitude, lng: longitude });
        setSelectedHotspotId(null);
        setLocationApplied(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 12, { animate: true });
        }
      },
      (err) => {
        setIsLocating(false);
        alert(`Location access denied or unavailable: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search by city name or `lat, lng`
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if user entered `lat, lng`
    const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setSelectedCoords({ lat, lng });
        setSelectedHotspotId(null);
        setLocationApplied(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 10, { animate: true });
        }
        return;
      }
    }

    // Match with known hotspots
    const queryLower = searchQuery.toLowerCase();
    const matched = GLOBAL_SMOG_HOTSPOTS.find(
      (h) =>
        h.name.toLowerCase().includes(queryLower) ||
        h.country.toLowerCase().includes(queryLower) ||
        h.id.toLowerCase().includes(queryLower)
    );

    if (matched) {
      handleSelectHotspot(matched);
    } else {
      alert(
        `Location "${searchQuery}" not found in local index. Tip: You can click anywhere directly on the map or enter coordinates (e.g. 28.61, 77.20).`
      );
    }
  };

  // Apply location to main application state
  const handleApplyLocation = () => {
    onLocationSelected(locationEnvData);
    setLocationApplied(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'en'
                ? 'Interactive Global Air Quality & Smog Map'
                : 'इंटरएक्टिव वायु गुणवत्ता एवं स्मॉग मानचित्र'}
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Click anywhere on the map or select a severe winter smog hotspot to dynamically model atmospheric temperature inversions, particulate density, and local emission sources.
          </p>
        </div>

        {/* Live GPS & Apply buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateUser}
            disabled={isLocating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <Navigation className={`w-4 h-4 text-sky-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>
      </div>

      {/* Preset Global Smog & Inversion Hotspots */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Featured Severe Winter Inversion & Pollution Corridors
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {GLOBAL_SMOG_HOTSPOTS.map((hotspot) => {
            const isSelected = selectedHotspotId === hotspot.id;
            const hotspotData = calculateLocationEnvironmentalData(hotspot.lat, hotspot.lng);
            const hPalette = getAQIColorPalette(hotspotData.aqi);

            return (
              <button
                key={hotspot.id}
                onClick={() => handleSelectHotspot(hotspot)}
                className={`px-3 py-2 rounded-2xl border text-xs whitespace-nowrap font-medium transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-sky-500 shadow-md ring-2 ring-sky-500/50 dark:bg-sky-950'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="font-bold">{hotspot.name.split(' ')[0]}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${hPalette.badge}`}>
                  AQI {hotspotData.aqi}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map & Environmental Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Map Box */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-4">
          
          {/* Search bar over map */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city, e.g. 'Salt Lake City', 'Delhi', or enter coordinates (e.g. 28.61, 77.20)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Leaflet Map Canvas */}
          <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div ref={mapContainerRef} className="w-full h-full" />
            
            {/* Map Instruction Floating Tag */}
            <div className="absolute bottom-3 left-3 z-[400] pointer-events-none bg-slate-900/80 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-xl shadow-lg border border-white/10 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Click anywhere on the map to drop a pin</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Pinned Coordinates: <strong>{selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lng.toFixed(4)}°E</strong>
            </span>
            <span>Click or drag pin to recalculate micro-climate</span>
          </div>
        </div>

        {/* Selected Location Environmental Telemetry Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            
            {/* Title & Coordinates */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-sky-600 dark:text-sky-400">
                  Selected Geographic Zone
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {locationEnvData.location}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lat: {selectedCoords.lat.toFixed(4)} • Lng: {selectedCoords.lng.toFixed(4)}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                isFetchingLive
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isFetchingLive ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
                {isFetchingLive ? 'Live Sensor Sync...' : 'Live Sensor Feed'}
              </span>
            </div>

            {/* Central AQI Score Card */}
            <div className={`p-5 rounded-2xl border ${palette.border} ${palette.bg} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Calculated AQI
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${palette.badge}`}>
                  {palette.label.split('(')[0].trim()}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                  {locationEnvData.aqi}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  PM2.5: <strong>{locationEnvData.pm25} µg/m³</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                {palette.description}
              </p>
            </div>

            {/* Inversion Dynamics */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-500" /> Winter Inversion Status
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  locationEnvData.inversionStatus.severity === 'Severe'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                    : locationEnvData.inversionStatus.severity === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                }`}>
                  {locationEnvData.inversionStatus.severity} Risk
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {locationEnvData.inversionStatus.explanation}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <span>Mixing Height: <strong>{locationEnvData.inversionStatus.mixingHeightMeters}m</strong></span>
                <span>• Breakup: <strong>{locationEnvData.inversionStatus.breakupEstimatedTime}</strong></span>
              </div>
            </div>

            {/* Atmospheric Telemetry Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Thermometer className="w-3.5 h-3.5 text-rose-500 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">Temp</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{locationEnvData.temperatureC}°C</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Droplets className="w-3.5 h-3.5 text-sky-500 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">Humidity</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{locationEnvData.humidityPercent}%</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Wind className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">Wind</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{locationEnvData.windSpeedKmh} km/h</p>
              </div>
            </div>

            {/* Primary Emission Source */}
            {locationEnvData.primaryEmissionSource && (
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">
                  Primary Emission Drivers:
                </span>
                <p className="text-[11px] text-indigo-950 dark:text-indigo-200">
                  {locationEnvData.primaryEmissionSource}
                </p>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyLocation}
            className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              locationApplied
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20'
            }`}
          >
            {locationApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Location Applied!</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Set as Active Household Location</span>
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};

