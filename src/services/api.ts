import {
  MedicineInfo,
  MedicalRecord,
  MeteoHealthAdvisory,
  UserHealthProfile,
  WeatherData,
  PrescriptionOptimizationResult,
} from '../types';

export const CITIES_UZB: Record<string, { lat: number; lon: number; name: string }> = {
  Toshkent: { lat: 41.2995, lon: 69.2401, name: 'Toshkent' },
  Samarqand: { lat: 39.6270, lon: 66.9749, name: 'Samarqand' },
  Buxoro: { lat: 39.7747, lon: 64.4286, name: 'Buxoro' },
  Andijon: { lat: 40.7821, lon: 72.3442, name: 'Andijon' },
  Fargona: { lat: 40.3842, lon: 71.7843, name: "Farg'ona" },
  Namangan: { lat: 40.9983, lon: 71.6726, name: 'Namangan' },
  Qarshi: { lat: 38.8606, lon: 65.7891, name: 'Qarshi' },
  Termiz: { lat: 37.2242, lon: 67.2783, name: 'Termiz' },
  Navoiy: { lat: 40.0844, lon: 65.3792, name: 'Navoiy' },
  Jizzax: { lat: 40.1158, lon: 67.8422, name: 'Jizzax' },
  Guliston: { lat: 40.4897, lon: 68.7842, name: 'Guliston' },
  Nukus: { lat: 42.4602, lon: 59.6166, name: 'Nukus' },
  Xiva: { lat: 41.3783, lon: 60.3639, name: 'Xiva' },
};

export async function fetchLiveWeather(cityName = 'Toshkent'): Promise<WeatherData> {
  const cityInfo = CITIES_UZB[cityName] || CITIES_UZB['Toshkent'];
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${cityInfo.lat}&longitude=${cityInfo.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FTashkent&forecast_days=3`
    );
    if (!res.ok) throw new Error('Ob-havo serveriga ulanishda xato');
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;

    const weatherCodeToString = (code: number) => {
      if (code === 0) return 'Ochiq, quyoshli';
      if (code === 1 || code === 2) return 'Qisman bulutli';
      if (code === 3) return 'Bulutli';
      if (code >= 45 && code <= 48) return 'Tumanli';
      if (code >= 51 && code <= 55) return 'Mayda yomg\'ir';
      if (code >= 61 && code <= 65) return 'Kuchli yomg\'ir (sel xavfi)';
      if (code >= 71 && code <= 77) return 'Qor yog\'ishi';
      if (code >= 80 && code <= 82) return 'Jala va kuchli yomg\'ir';
      if (code >= 95) return 'Momaqaldiroq va shiddatli shamol';
      return 'O\'zgaruvchan havo';
    };

    const windKmH = current.wind_speed_10m || 12;
    const tomorrowWind = daily.wind_speed_10m_max?.[1] || 16;
    const tomorrowPrecip = daily.precipitation_probability_max?.[1] || 20;

    let warning = '';
    if (tomorrowWind >= 16 && tomorrowPrecip >= 40) {
      warning = 'Ertaga kuchli shamol, keskin sovuq va sel kelish xavfi bor!';
    } else if (tomorrowWind >= 15) {
      warning = 'Ertaga kuchli shamol va chang to\'zoni xavfi kutilmoqda.';
    } else if (tomorrowPrecip >= 50) {
      warning = 'Ertaga kuchli yog\'ingarchilik va sel xavfi mavjud.';
    }

    return {
      city: cityInfo.name,
      country: "O'zbekiston",
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: weatherCodeToString(current.weather_code),
      weatherCode: current.weather_code,
      windSpeed: Math.round(windKmH),
      windGusts: Math.round(current.wind_gusts_10m || windKmH * 1.3),
      humidity: Math.round(current.relative_humidity_2m),
      pressure: Math.round(current.surface_pressure),
      precipitationChance: Math.round(daily.precipitation_probability_max?.[0] || 10),
      uvIndex: 4,
      magneticStormLevel: 'Zaif (G1)',
      forecastTomorrow: {
        tempMax: Math.round(daily.temperature_2m_max?.[1] ?? current.temperature_2m + 2),
        tempMin: Math.round(daily.temperature_2m_min?.[1] ?? current.temperature_2m - 5),
        condition: weatherCodeToString(daily.weather_code?.[1] || 61),
        windSpeed: Math.round(tomorrowWind),
        precipitationChance: Math.round(tomorrowPrecip),
        severeWeatherWarning: warning || 'Ertaga havo harorati tushishi va kuchli shamol kutilmoqda.',
      },
    };
  } catch (err) {
    console.warn('Fallback weather used:', err);
    return {
      city: cityInfo.name,
      country: "O'zbekiston",
      temperature: 14,
      feelsLike: 11,
      condition: 'Kuchli shamol va bulutli',
      weatherCode: 61,
      windSpeed: 18,
      windGusts: 24,
      humidity: 78,
      pressure: 998,
      precipitationChance: 65,
      uvIndex: 3,
      magneticStormLevel: "O'rtacha (G2)",
      forecastTomorrow: {
        tempMax: 12,
        tempMin: 5,
        condition: "Kuchli yomg'ir, sel va sovuq shamol",
        windSpeed: 21,
        precipitationChance: 85,
        severeWeatherWarning: "Ertaga havo keskin soviydi, kuchli shamol va sel kelish xavfi bor!",
      },
    };
  }
}

export async function scanMedicineAPI(payload: {
  imageBase64?: string;
  medicineName?: string;
}): Promise<MedicineInfo> {
  const res = await fetch('/api/medicine/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Dori tahlilida xatolik yuz berdi');
  }

  return res.json();
}

export async function analyzeMedicalRecordAPI(payload: {
  imageBase64?: string;
  rawText?: string;
}): Promise<Omit<MedicalRecord, 'id' | 'date'>> {
  const res = await fetch('/api/medical-records/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Tahlil natijalarini o\'qishda xatolik yuz berdi');
  }

  return res.json();
}

export async function getMeteoHealthAdvisoryAPI(payload: {
  healthProfile: UserHealthProfile;
  medicalRecords: MedicalRecord[];
  weatherForecast: WeatherData;
  locationName: string;
}): Promise<MeteoHealthAdvisory> {
  const res = await fetch('/api/meteo-health/advisories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ogohlantirish yaratishda xatolik yuz berdi');
  }

  return res.json();
}

export async function optimizePrescriptionAPI(payload: {
  medicinesList?: string[];
  imageBase64?: string;
  rawText?: string;
}): Promise<PrescriptionOptimizationResult> {
  const res = await fetch('/api/medicine/optimize-prescription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Dorilarni tahlil qilish va optimallashtirishda xatolik');
  }

  return res.json();
}
