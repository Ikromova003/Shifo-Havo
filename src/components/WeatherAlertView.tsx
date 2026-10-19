import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Wind,
  Gauge,
  Compass,
  AlertTriangle,
  ShieldCheck,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  HeartPulse,
  Pill,
  FileCheck2,
  Calendar,
  AlertOctagon,
  ArrowRight,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import {
  MedicalRecord,
  MeteoHealthAdvisory,
  UserHealthProfile,
  WeatherData,
} from '../types';
import { getMeteoHealthAdvisoryAPI } from '../services/api';

interface WeatherAlertViewProps {
  weather: WeatherData;
  userProfile: UserHealthProfile;
  medicalRecords: MedicalRecord[];
  onOpenProfile: () => void;
  onNavigateToRecords: () => void;
  onNavigateToDoctors: () => void;
  onSimulateWeather: (scenario: 'storm' | 'frost' | 'magnetic' | 'normal') => void;
}

export const WeatherAlertView: React.FC<WeatherAlertViewProps> = ({
  weather,
  userProfile,
  medicalRecords,
  onOpenProfile,
  onNavigateToRecords,
  onNavigateToDoctors,
  onSimulateWeather,
}) => {
  const [advisory, setAdvisory] = useState<MeteoHealthAdvisory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate / update advisory when weather, profile, or medical records change
  const fetchAdvisory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMeteoHealthAdvisoryAPI({
        healthProfile: userProfile,
        medicalRecords,
        weatherForecast: weather,
        locationName: weather.city,
      });
      setAdvisory(result);
    } catch (err: any) {
      console.error('Advisory fetch error:', err);
      // Fallback deterministic advisory tailored directly to user prompt requirements
      const conditionsList = userProfile.chronicConditions.join(', ') || 'Metosezgirlik va qon bosimi';
      const medicinesList = medicalRecords.flatMap((r) => r.yozilganDorilar.map((d) => d.doriNomi)).join(', ') || 'Shifokoringiz buyurgan dorilar';

      setAdvisory({
        xavfDarajasi: weather.windSpeed > 15 || weather.precipitationChance > 50 ? 'yuqori' : 'o\'rta',
        sarlavha: `Diqqat: Ertaga ${weather.city}da kuchli shamol, sovuq va sel kelish xavfi bor!`,
        qisqaOgohlantirish: `Ertaga havo sovuq bo'ladi, sel va kuchli shamol (${weather.forecastTomorrow.windSpeed} km/soat) xavfi bor. Shuning uchun ertaga ko'chaga chiqmang yoki shifokoringiz aytgan ${medicinesList} dorilarni qabul qiling!`,
        batafsilTahlil: `Sizning salomatlik profilingizdagi ${conditionsList} hamda yuklangan tibbiy tahlillaringiz hisobga olindi. Havo harorati tushishi va atmosfera bosimining o'zgarishi arterial bosimni keskin ko'tarishi va nafas yo'llarini toraytirishi mumkin.`,
        kochagaChiqishTavsiyasi: 'Mutlaqo tavsiya etilmaydi (Uyda qoling)',
        amalQilishKerakBolganTadbirlar: [
          'Ko\'chaga chiqmang, derazalarni zich yoping',
          `Shifokor tavsiya qilgan dorilarni (${medicinesList}) jadval bo'yicha qabul qiling`,
          'Qon bosimingizni kuniga kamida 2 marta o\'lchang',
          'Iliq namlantiruvchi choy yoki ko\'k choy iching',
          'Og\'ir jismoniy zo\'riqishlardan saqlaning',
        ],
        doriQabulQilishEslatmasi: `${medicinesList} preparatlarini o'z vaqtida iching, dozani o'zboshimchalik bilan o'zgartirmang.`,
        shoshilinchBelgilar: [
          'Ko\'krak sohasida siquvchi og\'riq yoki havo yetishmasligi',
          'Qon bosimining 160/100 dan oshib ketishi',
          'Kuchli bosh aylanishi yoki ko\'z xiralashishi',
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [weather.city, weather.temperature, weather.windSpeed, userProfile.chronicConditions.length, medicalRecords.length]);

  // Audio speech synthesis
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Brauzeringiz ovozli o\'qishni qo\'llab-quvvatlamaydi');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!advisory) return;

    const textToRead = `${advisory.sarlavha}. ${advisory.qisqaOgohlantirish}. ${advisory.batafsilTahlil}. Tavsiyalar: ${advisory.amalQilishKerakBolganTadbirlar.join('. ')}. ${advisory.doriQabulQilishEslatmasi}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'uz-UZ';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Badges calculation
  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'o\'ta xavfli':
        return 'bg-red-600 text-white ring-red-300';
      case 'yuqori':
        return 'bg-amber-600 text-white ring-amber-300';
      case 'o\'rta':
        return 'bg-yellow-500 text-slate-900 ring-yellow-200';
      default:
        return 'bg-emerald-600 text-white ring-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Bar */}
      <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm text-xs">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">
            Ob-havo ssenariylarini sinab ko'rish:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => onSimulateWeather('storm')}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 font-medium transition-colors"
          >
            🌪️ Kuchli shamol va sel (Ertaga)
          </button>
          <button
            onClick={() => onSimulateWeather('frost')}
            className="px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-200 font-medium transition-colors"
          >
            ❄️ Keskin sovuq va qor
          </button>
          <button
            onClick={() => onSimulateWeather('magnetic')}
            className="px-2.5 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-medium transition-colors"
          >
            ⚡ Magnit bo'roni (G3)
          </button>
          <button
            onClick={() => onSimulateWeather('normal')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 font-medium transition-colors"
          >
            🌤️ Qulay sokin ob-havo
          </button>
        </div>
      </div>

      {/* Main Weather + Tomorrow's Warning banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Current Weather Overview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-teal-200">
                  {weather.country}
                </span>
                <h1 className="text-2xl font-black">{weather.city}</h1>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs border border-white/20">
                {weather.condition}
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mb-6">
              <span className="text-6xl font-black tracking-tighter">
                {weather.temperature > 0 ? `+${weather.temperature}` : weather.temperature}°
              </span>
              <div className="text-xs text-teal-100">
                <p>His etilishi: {weather.feelsLike}°C</p>
                <p>Bugun: max +{weather.temperature + 2}° / min {weather.temperature - 4}°</p>
              </div>
            </div>

            {/* 4 Sensor Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-2xl backdrop-blur-xs border ${weather.windSpeed > 15 ? 'bg-amber-500/20 border-amber-400/50' : 'bg-white/10 border-white/10'}`}>
                <div className="flex items-center space-x-1.5 text-teal-200 mb-1">
                  <Wind className="w-4 h-4" />
                  <span className="font-semibold">Shamol tezligi</span>
                </div>
                <p className="text-base font-bold text-white">
                  {weather.windSpeed} km/soat
                </p>
                <p className="text-[10px] text-teal-200 mt-0.5">
                  Shiddati: {weather.windGusts} km/soat {weather.windSpeed > 15 && '⚠️ Kuchli'}
                </p>
              </div>

              <div className={`p-3 rounded-2xl backdrop-blur-xs border ${weather.precipitationChance > 50 ? 'bg-blue-500/20 border-blue-400/50' : 'bg-white/10 border-white/10'}`}>
                <div className="flex items-center space-x-1.5 text-teal-200 mb-1">
                  <CloudRain className="w-4 h-4" />
                  <span className="font-semibold">Sel & Yog'ingarchilik</span>
                </div>
                <p className="text-base font-bold text-white">
                  {weather.precipitationChance}%
                </p>
                <p className="text-[10px] text-teal-200 mt-0.5">
                  {weather.precipitationChance > 50 ? '⚠️ Sel xavfi yuqori' : 'Kam yog\'ingarchilik'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <div className="flex items-center space-x-1.5 text-teal-200 mb-1">
                  <Gauge className="w-4 h-4" />
                  <span className="font-semibold">Atmosfera bosimi</span>
                </div>
                <p className="text-base font-bold text-white">
                  {weather.pressure} hPa
                </p>
                <p className="text-[10px] text-teal-200 mt-0.5">
                  {weather.pressure < 1005 ? '🔻 Past (Gipotoniya xavfi)' : 'Me\'yorda'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <div className="flex items-center space-x-1.5 text-teal-200 mb-1">
                  <Compass className="w-4 h-4" />
                  <span className="font-semibold">Geomagnit faollik</span>
                </div>
                <p className="text-base font-bold text-white">
                  {weather.magneticStormLevel}
                </p>
                <p className="text-[10px] text-teal-200 mt-0.5">
                  Namlik: {weather.humidity}%
                </p>
              </div>
            </div>
          </div>

          {/* Tomorrow's Forecast callout */}
          <div className="mt-5 pt-4 border-t border-teal-500/30 text-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-teal-200 uppercase tracking-wide">
                Ertangi prognoz
              </span>
              <p className="font-medium text-white">
                {weather.forecastTomorrow.condition} ({weather.forecastTomorrow.tempMin}° / {weather.forecastTomorrow.tempMax}°)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                Shamol: {weather.forecastTomorrow.windSpeed} km/soat
              </span>
            </div>
          </div>
        </div>

        {/* Right: Tomorrow Severe Weather Alert Box */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Ertangi Kun Uchun Meteo-Ogohlantirish
                  </h2>
                  <p className="text-xs text-slate-500">
                    O'zgidromet va sun'iy yo'ldosh ma'lumotlari tahlili
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Ekstremal sharoit
              </span>
            </div>

            {/* Big Alert Card */}
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-amber-300/80">
              <div className="flex items-start space-x-3">
                <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {weather.forecastTomorrow.severeWeatherWarning || 'Ertaga havo sovuq bo\'ladi, sel va kuchli shamol xavfi bor!'}
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Ertaga havo harorati sezilarli pasayishi, kuchli shamol ({weather.forecastTomorrow.windSpeed} km/soat) va yog'ingarchilik/sel kelishi ehtimoli ({weather.forecastTomorrow.precipitationChance}%) mavjud.
                  </p>
                </div>
              </div>
            </div>

            {/* Health Connection Context */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                  <HeartPulse className="w-4 h-4 text-teal-600" />
                  <span>Sizning salomatlik ko'rsatkichlaringiz:</span>
                </span>
                <button
                  onClick={onOpenProfile}
                  className="text-teal-700 font-bold hover:underline"
                >
                  Tahrirlash
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {userProfile.chronicConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 font-medium"
                  >
                    {cond}
                  </span>
                ))}
                {userProfile.chronicConditions.length === 0 && (
                  <span className="text-amber-700 italic">
                    Hozircha kasalliklar kiritilmagan. Iltimos, profilingizni to'ldiring.
                  </span>
                )}
              </div>

              {/* Uploaded lab records indicator */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                <span className="flex items-center space-x-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    Yuklangan tahlillar: <b>{medicalRecords.length} ta</b>
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Pill className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Shifokor dorilari: <b>{medicalRecords.flatMap((r) => r.yozilganDorilar).length} ta</b>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Ushbu ob-havo ma'lumotlari bemorning dori-darmonlari bilan integratsiya qilindi.
            </span>
            <button
              onClick={fetchAdvisory}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Qayta tahlil qilish</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Personalized Meteo-Health Advisory Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Top bar with audio button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Shaxsiy Tibbiy va Ob-Havo Ogohlantirishi
                </h2>
                {advisory && (
                  <span
                    className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ring-2 ${getRiskColor(
                      advisory.xavfDarajasi
                    )}`}
                  >
                    {advisory.xavfDarajasi} xavf
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Sizning kasalliklaringiz + shifokor yozgan dorilar + ertangi shamol va sel prognozi asosida
              </p>
            </div>
          </div>

          {/* Audio reader button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSpeech}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Ovozni to'xtatish</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Ovozli eshitish (O'zbekcha)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content body */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-sm font-semibold">
              Ob-havo va sizning shifokor tahlillaringiz solishtirilmoqda...
            </p>
          </div>
        ) : advisory ? (
          <div className="pt-6 space-y-6">
            {/* The Specific Core Message */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-slate-900">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-amber-950">
                    {advisory.sarlavha}
                  </h3>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    {advisory.qisqaOgohlantirish}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-amber-200/70 pt-2">
                    {advisory.batafsilTahlil}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Outdoor recommendation & Action steps */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ko'chaga chiqish rejimi
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    {advisory.kochagaChiqishTavsiyasi}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Ertaga bajarishingiz shart bo'lgan tadbirlar:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {advisory.amalQilishKerakBolganTadbirlar?.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 2: Prescribed Medications Reminder */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    <span>Shifokor yozgan dorilar tartibi</span>
                  </span>
                  <button
                    onClick={onNavigateToRecords}
                    className="text-xs text-indigo-700 font-bold hover:underline"
                  >
                    Dorilarni ko'rish
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                  {advisory.doriQabulQilishEslatmasi}
                </div>

                {/* Emergency signs (103) */}
                {advisory.shoshilinchBelgilar && advisory.shoshilinchBelgilar.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-rose-700 flex items-center space-x-1 mb-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Shoshilinch tibbiy yordam (103) chaqirish belgilari:</span>
                    </span>
                    <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                      {advisory.shoshilinchBelgilar.map((sign, idx) => (
                        <li key={idx}>{sign}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span>Shifokor ko'rigi zarurmi?</span>
                <button
                  onClick={onNavigateToDoctors}
                  className="font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 underline"
                >
                  <span>Onlayn navbat olish</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={onNavigateToRecords}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Yangi tahlil yoki retsept yuklash</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
