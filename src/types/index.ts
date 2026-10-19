export interface UserHealthProfile {
  fullName: string;
  age: number;
  gender: 'Erkak' | 'Ayol' | 'Boshqa';
  phone?: string;
  chronicConditions: string[]; // e.g. "Arterial gipertoniya (Yuqori bosim)", "Bronxial astma", "Yurak ishemiyasi", "Revmatoid artrit"
  sensitivities: string[]; // e.g. "Kuchli shamol va chang", "Havo harorati keskin tushishi", "Magnit bo'ronlari", "Atmosfera bosimi tebranishi"
  typicalBloodPressure: string; // e.g. "135/85"
  additionalNotes: string;
  isConfigured: boolean;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  weatherCode: number;
  windSpeed: number; // km/h or m/s
  windGusts: number;
  humidity: number; // %
  pressure: number; // hPa
  precipitationChance: number; // %
  uvIndex: number;
  magneticStormLevel: 'Tinch' | 'Zaif (G1)' | 'O\'rtacha (G2)' | 'Kuchli bo\'ron (G3+)';
  forecastTomorrow: {
    tempMax: number;
    tempMin: number;
    condition: string;
    windSpeed: number;
    precipitationChance: number;
    severeWeatherWarning?: string; // e.g. "Kuchli shamol va sel xavfi"
  };
}

export interface LabIndicator {
  parametr: string;
  qiymat: string;
  norma: string;
  holat: 'Yuqori' | 'Past' | 'Me\'yorda' | string;
}

export interface PrescribedMedication {
  doriNomi: string;
  doza: string;
  tartib: string;
  maqsad: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  hujjatTuri: string;
  tashxisYokiXulosa: string;
  shifokorFIO?: string;
  klinika?: string;
  asosiyKorsatkichlar: LabIndicator[];
  yozilganDorilar: PrescribedMedication[];
  shifokorTavsiyalari: string[];
  obHavoXavfOmillari: string[];
  filePreview?: string;
}

export interface MeteoHealthAdvisory {
  xavfDarajasi: 'past' | 'o\'rta' | 'yuqori' | 'o\'ta xavfli';
  sarlavha: string;
  qisqaOgohlantirish: string;
  batafsilTahlil: string;
  kochagaChiqishTavsiyasi: string;
  amalQilishKerakBolganTadbirlar: string[];
  doriQabulQilishEslatmasi: string;
  bemorUchunMaxsusEhtiyotkorlik?: string[];
  shoshilinchBelgilar?: string[];
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  category: 'Oliy toifali shifokor' | 'Tibbiyot fanlari nomzodi' | 'Professor' | 'Birinchi toifali';
  experienceYears: number;
  rating: number;
  reviewCount: number;
  clinic: string;
  address: string;
  city: string;
  consultationFee: number; // so'm
  avatar: string;
  phone: string;
  workDays: string;
  workHours: string;
  availableSlots: string[];
  bio: string;
}

export interface Appointment {
  id: string;
  ticketNumber: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  clinic: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientPhone: string;
  complaint: string;
  status: 'Tasdiqlangan' | 'Kutilmoqda' | 'Tugallangan' | 'Bekor qilingan';
  createdAt: string;
}

export interface MedicineInfo {
  nomi: string;
  tarkibi: string;
  davolovchiKasalliklar: string[];
  qabulQilishVaqti: string;
  nojoyaTasirlar: string[];
  obHavoTavsiyasi: string;
  saqlashQoidasi?: string;
  muhimEslatma?: string;
  scanDate?: string;
  imageThumbnail?: string;
}

export interface SingleMedicineDetail {
  nomi: string;
  shakli: string;
  tarkibi: string;
  roli: string;
  tafsilot?: string;
}

export interface ConsolidatedMedicine {
  nomi: string;
  tarkibi: string;
  qaysiDorilarOrniniBosadi: string[];
  negaTanlandi: string;
  qabulQilishTartibi: string;
}

export interface PrescriptionOptimizationResult {
  barchaDorilar: SingleMedicineDetail[];
  oxshashlikVaDublyorlar: string;
  tanlanganAsosiyIkkitaDori: ConsolidatedMedicine[];
  xulosaVaKlinikFoydasi: string;
  muhimEslatma: string;
}

