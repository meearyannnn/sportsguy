export interface OpenMeteoWeather {
  airTemperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  precipitationProbability: number; // %
  weatherCode?: number;
  latitude: number;
  longitude: number;
  isLiveOpenF1?: boolean;
}

export const CIRCUIT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  marina_bay: { lat: 1.2915, lng: 103.8638 },
  baku: { lat: 40.3725, lng: 49.8533 },
  monza: { lat: 45.6156, lng: 9.2811 },
  spa: { lat: 50.4372, lng: 5.9714 },
  zandvoort: { lat: 52.3888, lng: 4.5409 },
  silverstone: { lat: 52.0786, lng: -1.0169 },
  hungaroring: { lat: 47.5789, lng: 19.2486 },
  red_bull_ring: { lat: 47.2197, lng: 14.7647 },
  villeneuve: { lat: 45.5006, lng: -73.5228 },
  monaco: { lat: 43.7347, lng: 7.4206 },
  miami: { lat: 25.958, lng: -80.2389 },
  shanghai: { lat: 31.3389, lng: 121.22 },
  suzuka: { lat: 34.8431, lng: 136.541 },
  albert_park: { lat: -37.8497, lng: 144.968 },
  jeddah: { lat: 21.6319, lng: 39.1044 },
  bahrain: { lat: 26.0325, lng: 50.5106 },
  losail: { lat: 25.49, lng: 51.4542 },
  yas_marina: { lat: 24.4672, lng: 54.6031 },
  americas: { lat: 30.1328, lng: -97.6411 },
  rodriguez: { lat: 19.4042, lng: -99.0907 },
  interlagos: { lat: -23.7036, lng: -46.6997 },
  vegas: { lat: 36.1147, lng: -115.1728 },
};

const openMeteoCache = new Map<string, { timestamp: number; data: OpenMeteoWeather }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL for ambient weather

export async function getOpenMeteoWeather(
  latitude: number | string,
  longitude: number | string
): Promise<OpenMeteoWeather | null> {
  const lat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude));
  const lng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude));

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const cacheKey = `meteo_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  const now = Date.now();

  const cached = openMeteoCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(`apex_weather_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (now - parsed.timestamp < CACHE_TTL_MS * 2) {
          openMeteoCache.set(cacheKey, parsed);
          return parsed.data;
        }
      }
    } catch {}
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability&forecast_days=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Open-Meteo notice (${res.status}): ${url}`);
      return cached?.data || null;
    }

    const json = await res.json();
    const current = json.current;
    const hourlyProb = json.hourly?.precipitation_probability?.[0] ?? (current?.precipitation > 0 ? 100 : 0);

    const weatherData: OpenMeteoWeather = {
      airTemperature: current?.temperature_2m ?? 0,
      humidity: current?.relative_humidity_2m ?? 0,
      windSpeed: current?.wind_speed_10m ?? 0,
      windDirection: current?.wind_direction_10m ?? 0,
      precipitationProbability: hourlyProb,
      latitude: lat,
      longitude: lng,
      isLiveOpenF1: false,
    };

    openMeteoCache.set(cacheKey, { timestamp: now, data: weatherData });
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(
          `apex_weather_${cacheKey}`,
          JSON.stringify({ timestamp: now, data: weatherData })
        );
      } catch {}
    }

    return weatherData;
  } catch (err) {
    console.warn('Failed to fetch Open-Meteo weather:', err);
    return cached?.data || null;
  }
}

export async function getWeatherForCircuit(
  circuitId?: string,
  rawLat?: string | number,
  rawLng?: string | number
): Promise<OpenMeteoWeather | null> {
  let lat: number | undefined;
  let lng: number | undefined;

  if (rawLat !== undefined && rawLng !== undefined) {
    lat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat));
    lng = typeof rawLng === 'number' ? rawLng : parseFloat(String(rawLng));
  }

  if ((lat === undefined || isNaN(lat) || lng === undefined || isNaN(lng)) && circuitId) {
    const coords = CIRCUIT_COORDINATES[circuitId];
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    // Default fallback: Baku Street Circuit (Azerbaijan GP)
    lat = 40.3725;
    lng = 49.8533;
  }

  return getOpenMeteoWeather(lat, lng);
}
