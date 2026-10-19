import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OnboardingModal } from './components/OnboardingModal';
import { WeatherAlertView } from './components/WeatherAlertView';
import { MedicalRecordsView } from './components/MedicalRecordsView';
import { MedicineScannerView } from './components/MedicineScannerView';
import { PrescriptionOptimizerView } from './components/PrescriptionOptimizerView';
import { DoctorBookingView } from './components/DoctorBookingView';
import { HealthProfileView } from './components/HealthProfileView';
import {
  UserHealthProfile,
  WeatherData,
  MedicalRecord,
  Appointment,
} from './types';
import { fetchLiveWeather } from './services/api';
import { PhoneCall, ShieldAlert, HeartPulse } from 'lucide-react';

const DEFAULT_PROFILE: UserHealthProfile = {
  fullName: 'Farhod Nazarov',
  age: 46,
  gender: 'Erkak',
  phone: '+998 90 987-65-43',
  chronicConditions: [
    'Arterial gipertoniya (Yuqori qon bosimi)',
    'Bronxial astma va nafas qisishi',
    'Bo\'g\'im kasalliklari / Revmatizm / Artroz',
  ],
  sensitivities: [
    'Kuchli shamol va chang to\'zoni',
    'Sel, jala va yuqori namlik',
    'Atmosfera bosimi keskin tushishi yoki ko\'tarilishi',
    'Geomagnit bo\'ronlari (Magnit to\'lqinlari)',
  ],
  typicalBloodPressure: '145/90',
  additionalNotes: 'Havo sovuganda va shamol ko\'tarilganda bosim 160 gacha ko\'tariladi, nafas qisishi kuchayadi.',
  isConfigured: true,
};

const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-init-1',
    date: '2026-10-02',
    hujjatTuri: 'Kardiolog ko\'rigi va EKG xulosasi',
    tashxisYokiXulosa: 'Arterial gipertoniya 2-daraja. Chap qorincha gipertrofiyasi, meteosezgirlik.',
    shifokorFIO: 'Dr. Alisher Qodirov',
    klinika: 'Respublika Kardiologiya Markazi',
    asosiyKorsatkichlar: [
      { parametr: 'Arterial bosim', qiymat: '150/95 mm sim.ust', norma: '120/80', holat: 'Yuqori' },
      { parametr: 'Puls', qiymat: '86 zarba/daq', norma: '60-80', holat: 'Biroz yuqori' },
      { parametr: 'EKG ritmi', qiymat: 'Sinusli taxikardiya', norma: 'Sinus ritmi', holat: 'Og\'ish' },
    ],
    yozilganDorilar: [
      { doriNomi: 'Enalapril', doza: '10 mg', tartib: 'Ertalab nonushtadan so\'ng 1 mahal', maqsad: 'Arterial bosimni tushirish' },
      { doriNomi: 'Kardioaspirin', doza: '100 mg', tartib: 'Kechki ovqatdan keyin 1 mahal', maqsad: 'Qon quyilishini oldini olish' },
    ],
    shifokorTavsiyalari: [
      'Atmosfera bosimi o\'zgarganda bosimni kuniga 2-3 marta o\'lchash',
      'Kuchli shamol va sovuqda ko\'chada ko\'p yurmaslik',
      'Tuzli ovqatlarni cheklash',
    ],
    obHavoXavfOmillari: [
      'Kuchli shamol va atmosfera bosimi tushishi qon bosimi krizisiga olib kelishi mumkin',
      'Keskin sovuqda tomirlar spazmi xavfi bor',
    ],
  },
  {
    id: 'rec-init-2',
    date: '2026-09-28',
    hujjatTuri: 'Pulmonolog retsepti va Spirametriya',
    tashxisYokiXulosa: 'Bronxial astma, aralash shakli. Sovuq va nam havo chaqirgan bronxospazm.',
    shifokorFIO: 'Dr. Shahnoza Karimova',
    klinika: 'Shifo-Nur Tibbiyot Markazi',
    asosiyKorsatkichlar: [
      { parametr: 'FEV1 (Nafas hajmi)', qiymat: '72%', norma: '> 80%', holat: 'Past' },
      { parametr: 'Kislorod (SpO2)', qiymat: '96%', norma: '95-99%', holat: 'Me\'yorda' },
    ],
    yozilganDorilar: [
      { doriNomi: 'Salbutamol (Ingalyator)', doza: '100 mkg', tartib: 'Nafas qisganda 1-2 purkash', maqsad: 'Bronxlarni zudlik bilan kengaytirish' },
    ],
    shifokorTavsiyalari: [
      'Ingalyatorni doim yoningizda olib yuring',
      'Shamolli havoda ko\'chaga chiqmang',
    ],
    obHavoXavfOmillari: [
      'Sel va kuchli shamolda nam havo va chang bronxial astmani keskin qo\'zg\'atadi',
    ],
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-init-1',
    ticketNumber: 'SH-249',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alisher Qodirov Rustamovich',
    doctorSpecialty: 'Kardiolog (Yurak-qon tomir)',
    clinic: 'Respublika Ixtisoslashtirilgan Kardiologiya Markazi',
    date: '2026-10-10',
    timeSlot: '10:30',
    patientName: 'Farhod Nazarov',
    patientPhone: '+998 90 987-65-43',
    complaint: 'Kuchli shamol vaqtida qon bosimi ko\'tarilishi bo\'yicha dori dozasini qayta ko\'rib chiqish',
    status: 'Tasdiqlangan',
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'weather' | 'records' | 'scanner' | 'optimizer' | 'doctors' | 'profile'
  >('weather');

  const [selectedCity, setSelectedCity] = useState('Toshkent');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserHealthProfile>(() => {
    try {
      const saved = localStorage.getItem('shifohavo_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PROFILE;
  });

  // Medical Records (Prescriptions and Lab results)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('shifohavo_medical_records');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RECORDS;
  });

  // Online Appointments (Queue tickets)
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('shifohavo_appointments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_APPOINTMENTS;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('shifohavo_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('shifohavo_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('shifohavo_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Load weather on city change
  useEffect(() => {
    let isMounted = true;
    fetchLiveWeather(selectedCity).then((data) => {
      if (isMounted) setWeatherData(data);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Weather simulator handler
  const handleSimulateWeather = (scenario: 'storm' | 'frost' | 'magnetic' | 'normal') => {
    if (!weatherData) return;

    if (scenario === 'storm') {
      setWeatherData({
        ...weatherData,
        temperature: 9,
        feelsLike: 4,
        condition: 'Kuchli shamol va sovuq yomg\'ir (Sel xavfi)',
        windSpeed: 22,
        windGusts: 31,
        precipitationChance: 90,
        pressure: 994,
        magneticStormLevel: 'O\'rtacha (G2)',
        forecastTomorrow: {
          tempMax: 10,
          tempMin: 3,
          condition: 'Keskin sovuq, kuchli shamol va xavfli sel',
          windSpeed: 24,
          precipitationChance: 95,
          severeWeatherWarning: 'Ertaga havo sovuq bo\'ladi, sel va kuchli shamol (24 km/soat) xavfi bor!',
        },
      });
    } else if (scenario === 'frost') {
      setWeatherData({
        ...weatherData,
        temperature: -3,
        feelsLike: -9,
        condition: 'Qor va keskin ayoz',
        windSpeed: 16,
        windGusts: 22,
        precipitationChance: 70,
        pressure: 1028,
        magneticStormLevel: 'Tinch',
        forecastTomorrow: {
          tempMax: -1,
          tempMin: -8,
          condition: 'Qattiq sovuq, muzlama va sovuq shamol',
          windSpeed: 18,
          precipitationChance: 75,
          severeWeatherWarning: 'Ertaga qattiq ayoz va muzlama! Gipertoniklar va kardiologik bemorlar ko\'chaga chiqmasligi tavsiya etiladi.',
        },
      });
    } else if (scenario === 'magnetic') {
      setWeatherData({
        ...weatherData,
        temperature: 32,
        feelsLike: 35,
        condition: 'Issiq va kuchli magnit bo\'roni',
        windSpeed: 8,
        windGusts: 12,
        precipitationChance: 5,
        pressure: 1008,
        magneticStormLevel: 'Kuchli bo\'ron (G3+)',
        forecastTomorrow: {
          tempMax: 34,
          tempMin: 22,
          condition: 'Jazirama va 5 balli geomagnit bo\'ron',
          windSpeed: 10,
          precipitationChance: 0,
          severeWeatherWarning: 'Ertaga kuchli magnit bo\'roni (G3+) va jazirama issiq kutilmoqda. Qon bosimi va migren xurujiga tayyor bo\'ling.',
        },
      });
    } else {
      setWeatherData({
        ...weatherData,
        temperature: 22,
        feelsLike: 22,
        condition: 'Ochiq, quyoshli va qulay',
        windSpeed: 6,
        windGusts: 9,
        precipitationChance: 10,
        pressure: 1014,
        magneticStormLevel: 'Tinch',
        forecastTomorrow: {
          tempMax: 24,
          tempMin: 14,
          condition: 'Iliq va musaffo havo',
          windSpeed: 7,
          precipitationChance: 5,
          severeWeatherWarning: 'Ertaga ob-havo sokin va me\'yorda, yurak-qon tomir tizimiga salbiy ta\'sir kutilmaydi.',
        },
      });
    }
  };

  const handleSaveProfile = (updated: UserHealthProfile) => {
    setUserProfile(updated);
  };

  const handleSaveMedicalRecord = (record: MedicalRecord) => {
    setMedicalRecords((prev) => [record, ...prev]);
  };

  const handleDeleteMedicalRecord = (id: string) => {
    setMedicalRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBookAppointment = (apt: Appointment) => {
    setAppointments((prev) => [apt, ...prev]);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddMedicineToProfile = (medName: string) => {
    // Also create a quick prescription entry for this medicine so weather alert captures it
    const quickRecord: MedicalRecord = {
      id: `rec-med-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      hujjatTuri: 'Dori skaneridan qo\'shilgan preparat',
      tashxisYokiXulosa: `${medName} preparatini qabul qilish rejasi`,
      shifokorFIO: 'Bemorning dori qutisi',
      asosiyKorsatkichlar: [],
      yozilganDorilar: [
        {
          doriNomi: medName,
          doza: 'Standart doza',
          tartib: 'Ko\'rsatma bo\'yicha',
          maqsad: 'Meteosezgirlik va profilaktika',
        },
      ],
      shifokorTavsiyalari: ['Ob-havo keskinlashganda o\'z vaqtida qabul qiling'],
      obHavoXavfOmillari: ['Ob-havo o\'zgarishida qabul qilish zarur'],
    };
    handleSaveMedicalRecord(quickRecord);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        weatherData={weatherData}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        hasSevereAlert={Boolean(
          weatherData && (weatherData.windSpeed > 15 || weatherData.precipitationChance > 50)
        )}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'weather' && weatherData && (
          <WeatherAlertView
            weather={weatherData}
            userProfile={userProfile}
            medicalRecords={medicalRecords}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onNavigateToRecords={() => setActiveTab('records')}
            onNavigateToDoctors={() => setActiveTab('doctors')}
            onSimulateWeather={handleSimulateWeather}
          />
        )}

        {activeTab === 'records' && (
          <MedicalRecordsView
            medicalRecords={medicalRecords}
            onSaveRecord={handleSaveMedicalRecord}
            onDeleteRecord={handleDeleteMedicalRecord}
            onNavigateToWeather={() => setActiveTab('weather')}
          />
        )}

        {activeTab === 'scanner' && (
          <MedicineScannerView
            onAddMedicineToProfile={handleAddMedicineToProfile}
          />
        )}

        {activeTab === 'optimizer' && (
          <PrescriptionOptimizerView
            onAddMedicineToProfile={handleAddMedicineToProfile}
            onNavigateToWeather={() => setActiveTab('weather')}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorBookingView
            userProfile={userProfile}
            appointments={appointments}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
          />
        )}

        {activeTab === 'profile' && (
          <HealthProfileView
            userProfile={userProfile}
            medicalRecords={medicalRecords}
            onOpenEditModal={() => setIsProfileModalOpen(true)}
            onNavigateToWeather={() => setActiveTab('weather')}
            onNavigateToRecords={() => setActiveTab('records')}
          />
        )}
      </main>

      {/* Emergency Quick Bar for 103 */}
      <aside className="sticky bottom-4 max-w-lg mx-auto px-4 w-full z-30 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/60 flex items-center justify-between text-xs pointer-events-auto">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-slate-200">Shoshilinch tibbiy yordam:</span>
          </div>
          <a
            href="tel:103"
            className="flex items-center space-x-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition-colors shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>103 ga qo'ng'iroq</span>
          </a>
        </div>
      </aside>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-700 font-bold">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>ShifoHavo — Meteo-Salomatlik va Tibbiy Maslahatchi Tizimi</span>
          </div>
          <p className="text-slate-400">
            O'zbekiston hududlari bo'yicha ob-havo, tahlillar va dorilar monitoringi
          </p>
        </div>
      </footer>

      {/* Onboarding / Health Profile Modal */}
      <OnboardingModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
