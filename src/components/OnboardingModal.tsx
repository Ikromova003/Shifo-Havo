import React, { useState } from 'react';
import {
  Heart,
  Wind,
  CloudRain,
  Activity,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { UserHealthProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserHealthProfile;
  onSaveProfile: (profile: UserHealthProfile) => void;
}

const COMMON_CONDITIONS = [
  { id: 'hypertension', label: 'Arterial gipertoniya (Yuqori qon bosimi)', category: 'yurak' },
  { id: 'hypotension', label: 'Gipotoniya (Past qon bosimi)', category: 'yurak' },
  { id: 'asthma', label: 'Bronxial astma va nafas qisishi', category: 'o\'pka' },
  { id: 'heart_ischemia', label: 'Yurak ishemik kasalligi / Aritmiya', category: 'yurak' },
  { id: 'arthritis', label: 'Bo\'g\'im kasalliklari / Revmatizm / Artroz', category: 'bo\'g\'im' },
  { id: 'migraine', label: 'Migren va qon tomir spazmlari', category: 'bosh' },
  { id: 'allergy', label: 'Mavsumiy chang va havo allergiyasi', category: 'allergiya' },
  { id: 'diabetes', label: 'Qandli diabet', category: 'endokrin' },
  { id: 'bronchitis', label: 'Surunkali bronxit', category: 'o\'pka' },
  { id: 'kidney', label: 'Buyrak xastaligi', category: 'buyrak' },
];

const WEATHER_SENSITIVITIES = [
  'Kuchli shamol va chang to\'zoni',
  'Keskin sovuq va qor yog\'ishi',
  'Sel, jala va yuqori namlik',
  'Atmosfera bosimi keskin tushishi yoki ko\'tarilishi',
  'Geomagnit bo\'ronlari (Magnit to\'lqinlari)',
  'Jazirama issiq va dim havo',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [age, setAge] = useState<number>(userProfile.age || 42);
  const [gender, setGender] = useState<'Erkak' | 'Ayol' | 'Boshqa'>(userProfile.gender || 'Erkak');
  const [typicalBloodPressure, setTypicalBloodPressure] = useState(
    userProfile.typicalBloodPressure || '130/85'
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    userProfile.chronicConditions.length > 0
      ? userProfile.chronicConditions
      : ['Arterial gipertoniya (Yuqori qon bosimi)', 'Bronxial astma va nafas qisishi']
  );
  const [selectedSensitivities, setSelectedSensitivities] = useState<string[]>(
    userProfile.sensitivities.length > 0
      ? userProfile.sensitivities
      : ['Kuchli shamol va chang to\'zoni', 'Sel, jala va yuqori namlik', 'Atmosfera bosimi keskin tushishi yoki ko\'tarilishi']
  );
  const [customCondition, setCustomCondition] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState(userProfile.additionalNotes || '');

  if (!isOpen) return null;

  const toggleCondition = (label: string) => {
    setSelectedConditions((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const toggleSensitivity = (item: string) => {
    setSelectedSensitivities((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions([...selectedConditions, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const handleSave = () => {
    const updated: UserHealthProfile = {
      fullName: fullName.trim() || 'Foydalanuvchi',
      age: Number(age) || 35,
      gender,
      typicalBloodPressure,
      chronicConditions: selectedConditions,
      sensitivities: selectedSensitivities,
      additionalNotes,
      isConfigured: true,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <ShieldAlert className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Salomatlik Pasportingizni To'ldiring</h2>
              <p className="text-xs text-teal-100">
                Ob-havo, shamol va sel kelishida aniq ogohlantirish olish uchun salomatlik holatingizni kiriting
              </p>
            </div>
          </div>
          <div className="bg-teal-900/40 rounded-xl p-3 border border-teal-500/30 text-xs text-teal-100 flex items-start space-x-2 mt-3">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span>
              Ilova har kuni ob-havo xavfini siz kiritgan kasalliklar, tahlil natijalari va ichayotgan dorilaringizga qarab shaxsiy tahlil qiladi.
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* General info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ism-familiyangiz
              </label>
              <input
                type="text"
                placeholder="Masalan: Sardor Aliyev"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Yoshingiz
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Oddiy qon bosimingiz
              </label>
              <input
                type="text"
                placeholder="120/80 yoki 140/90"
                value={typicalBloodPressure}
                onChange={(e) => setTypicalBloodPressure(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Chronic Conditions Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Salomatlik muammolari & Surunkali kasalliklar</span>
              </label>
              <span className="text-[11px] text-teal-700 font-medium">
                {selectedConditions.length} ta tanlandi
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              O'zingizda mavjud kasalliklarni belgilang. Qanchalik to'liq kiritilsa, meteo-ogohlantirish shunchalik aniq bo'ladi:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_CONDITIONS.map((cond) => {
                const isChecked = selectedConditions.includes(cond.label);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.label)}
                    className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all text-xs font-medium ${
                      isChecked
                        ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? 'bg-teal-600 text-white' : 'border border-slate-400 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="leading-snug">{cond.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom condition adder */}
            <form onSubmit={handleAddCustom} className="mt-3 flex space-x-2">
              <input
                type="text"
                placeholder="Boshqa kasallik yoki tashxis qo'shish..."
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded-xl hover:bg-slate-900 transition-colors"
              >
                Qo'shish
              </button>
            </form>
          </div>

          {/* Weather Sensitivities */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-2">
              <Wind className="w-4 h-4 text-cyan-500" />
              <span>Qaysi ob-havo sharoitlariga sezgirsiz?</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WEATHER_SENSITIVITIES.map((sens) => {
                const isChecked = selectedSensitivities.includes(sens);
                return (
                  <button
                    key={sens}
                    type="button"
                    onClick={() => toggleSensitivity(sens)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isChecked
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        isChecked ? 'bg-cyan-600' : 'border border-slate-300'
                      }`}
                    />
                    <span>{sens}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qo'shimcha shikoyatlar yoki shifokor doimiy ko'rsatmalari
            </label>
            <textarea
              rows={2}
              placeholder="Masalan: Shamolda bosh aylanadi, dori qabul qilgandan keyin bosim 120 gacha tushadi..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {selectedConditions.length > 0
              ? 'Tizim siz uchun shaxsiy ogohlantirishga tayyor'
              : 'Iltimos, kamida bitta holatni belgilang'}
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Yopish
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold hover:shadow-md hover:shadow-teal-500/20 transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Saqlash va Ogohlantirishni ko'rish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
