import React from 'react';
import {
  Heart,
  User,
  Activity,
  Wind,
  ShieldCheck,
  Edit3,
  FileText,
  Calendar,
  AlertTriangle,
  Pill,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { UserHealthProfile, MedicalRecord } from '../types';

interface HealthProfileViewProps {
  userProfile: UserHealthProfile;
  medicalRecords: MedicalRecord[];
  onOpenEditModal: () => void;
  onNavigateToWeather: () => void;
  onNavigateToRecords: () => void;
}

export const HealthProfileView: React.FC<HealthProfileViewProps> = ({
  userProfile,
  medicalRecords,
  onOpenEditModal,
  onNavigateToWeather,
  onNavigateToRecords,
}) => {
  const allMedications = medicalRecords.flatMap((r) => r.yozilganDorilar);

  return (
    <div className="space-y-8">
      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-teal-500/20">
              {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-slate-900">
                  {userProfile.fullName || 'Foydalanuvchi'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Faol pasport
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {userProfile.age} yosh • {userProfile.gender} • Odatdagi qon bosimi: {userProfile.typicalBloodPressure}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEditModal}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Kasalliklar va profilni tahrirlash</span>
          </button>
        </div>

        {/* 3 Metric Summary stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 font-medium">Surunkali holatlar</span>
              <p className="text-base font-bold text-slate-900">
                {userProfile.chronicConditions.length} ta tashxis
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 font-medium">Yuklangan tahlillar</span>
              <p className="text-base font-bold text-slate-900">
                {medicalRecords.length} ta hujjat
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 font-medium">Shifokor dorilari</span>
              <p className="text-base font-bold text-slate-900">
                {allMedications.length} ta dori ro'yxatda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnoses & Weather Sensitivities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conditions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Kiritilgan kasalliklar va tashxislar</span>
            </span>
            <button
              onClick={onOpenEditModal}
              className="text-xs text-teal-700 font-bold hover:underline"
            >
              + Qo'shish
            </button>
          </div>

          {userProfile.chronicConditions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Hech qanday kasallik kiritilmagan.
            </p>
          ) : (
            <div className="space-y-2">
              {userProfile.chronicConditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>{cond}</span>
                  </span>
                  <span className="text-[10px] text-teal-800 font-bold px-2 py-0.5 rounded-full bg-teal-100">
                    Faol
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weather sensitivities */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Wind className="w-4 h-4 text-cyan-500" />
              <span>Sezgir bo'lgan ob-havo omillari</span>
            </span>
            <button
              onClick={onOpenEditModal}
              className="text-xs text-teal-700 font-bold hover:underline"
            >
              O'zgartirish
            </button>
          </div>

          {userProfile.sensitivities.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Ob-havo omillari tanlanmagan.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {userProfile.sensitivities.map((sens, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-100 text-xs font-medium text-cyan-950 flex items-center space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                  <span>{sens}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prescribed Medicines in profile */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Pill className="w-4 h-4 text-indigo-600" />
              <span>Ilovaga bog'langan shifokor dorilari ({allMedications.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ushbu dorilar ob-havo ogohlantirishlarida avtomatik hisobga olinadi
            </p>
          </div>
          <button
            onClick={onNavigateToRecords}
            className="text-xs font-bold text-teal-700 hover:underline flex items-center space-x-1"
          >
            <span>Tahlil va retseptlar bo'limi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {allMedications.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 space-y-2">
            <p>Hozircha retsept orqali dori yuklanmagan.</p>
            <button
              onClick={onNavigateToRecords}
              className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
            >
              Retsept yuklash
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {allMedications.map((med, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-indigo-950">
                  <span>{med.doriNomi}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 rounded text-indigo-800">
                    {med.doza}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{med.tartib}</p>
                <p className="text-[10px] text-slate-400 italic">{med.maqsad}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Callout button to return to Weather Alerts */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 to-cyan-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <h4 className="text-sm font-bold">
            Ob-havo sharoitlari sizning ushbu kasalliklaringizga qanday ta'sir qiladi?
          </h4>
          <p className="text-xs text-teal-100">
            Meteo-tibbiy tahlil markaziga o'tib, ertangi shamol va sovuq uchun shaxsiy tavsiyalarni oling.
          </p>
        </div>
        <button
          onClick={onNavigateToWeather}
          className="px-5 py-2.5 rounded-xl bg-white text-teal-900 text-xs font-bold hover:bg-teal-50 transition-colors shrink-0 shadow-sm"
        >
          Ogohlantirishni ko'rish
        </button>
      </div>
    </div>
  );
};
