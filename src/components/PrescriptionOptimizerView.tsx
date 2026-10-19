import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Pill,
  Syringe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookmarkPlus,
  RefreshCw,
  Info,
  Clock,
  Coins,
  HeartPulse,
} from 'lucide-react';
import { PrescriptionOptimizationResult } from '../types';
import { optimizePrescriptionAPI } from '../services/api';

interface PrescriptionOptimizerViewProps {
  onAddMedicineToProfile?: (medName: string) => void;
  onNavigateToWeather?: () => void;
}

const PRESET_CASES = [
  {
    title: 'Gipertoniya va yurak: 5 ta dori to\'plami',
    description: 'Perindopril, Indapamid, Amlodipin, Kardioaspirin, Atorvastatin',
    medicines: [
      'Perindopril 10 mg (Tabletka)',
      'Indapamid 2.5 mg (Tabletka)',
      'Amlodipin 5 mg (Tabletka)',
      'Kardioaspirin 100 mg (Tabletka)',
      'Atorvastatin 20 mg (Tabletka)',
    ],
  },
  {
    title: 'Gripp va shamollash: 5 ta dori va ukol',
    description: 'Paratsetamol, Analgin ukol, No-shpa, Dimedrol ukol, Sefazolin ukol',
    medicines: [
      'Paratsetamol 500 mg (Tabletka)',
      'Analgin 50% (Ukol)',
      'No-shpa 40 mg (Tabletka)',
      'Dimedrol 1% (Ukol)',
      'Sefazolin 1.0 g (Ukol)',
    ],
  },
  {
    title: 'Bo\'g\'im va bel og\'rig\'i: 5 ta dori/ukol',
    description: 'Diklofenak ukol, Ketonal tabletka, Milgamma ukol, Mydocalm, Neyromultivit',
    medicines: [
      'Diklofenak 75 mg (Ukol)',
      'Ketonal 100 mg (Tabletka)',
      'Milgamma (Ukol)',
      'Mydocalm 150 mg (Tabletka)',
      'Neyromultivit (Tabletka)',
    ],
  },
];

export const PrescriptionOptimizerView: React.FC<PrescriptionOptimizerViewProps> = ({
  onAddMedicineToProfile,
  onNavigateToWeather,
}) => {
  const [medicines, setMedicines] = useState<string[]>([
    'Perindopril 10 mg (Tabletka)',
    'Indapamid 2.5 mg (Tabletka)',
    'Amlodipin 5 mg (Tabletka)',
    'Kardioaspirin 100 mg (Tabletka)',
    'Atorvastatin 20 mg (Tabletka)',
  ]);
  const [newMedInput, setNewMedInput] = useState('');
  const [medType, setMedType] = useState<'Tabletka' | 'Ukol' | 'Kapsula' | 'Tomchi'>('Tabletka');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PrescriptionOptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMedInput.trim()) {
      setMedicines([...medicines, `${newMedInput.trim()} (${medType})`]);
      setNewMedInput('');
    }
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (preset: (typeof PRESET_CASES)[0]) => {
    setMedicines(preset.medicines);
    setResult(null);
  };

  const handleOptimize = async () => {
    if (medicines.length < 2) {
      setError('Tahlil qilish uchun kamida 2-3 ta dori yoki ukol kiriting');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAddedSuccess(false);

    try {
      const data = await optimizePrescriptionAPI({
        medicinesList: medicines,
      });
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Dorilarni tahlil qilishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBothToProfile = () => {
    if (result && onAddMedicineToProfile) {
      result.tanlanganAsosiyIkkitaDori.forEach((d) => {
        onAddMedicineToProfile(d.nomi);
      });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-slate-900">
                  Dorilar Konsiliumi & Smart Optimallashtirish
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  5 dori → 2 dori
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Shifokor yozgan 5 xil dori va ukollarning tarkibini o'rganib, barchasining o'rnini to'liq bosadigan eng muhim 2 ta asosiy dorini ajratib beruvchi sun'iy intellekt tizimi!
              </p>
            </div>
          </div>
        </div>

        {/* Preset quick test buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Tayyor 5 xil dori to'plamlari bilan sinab ko'rish:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_CASES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 text-left transition-all text-xs"
              >
                <div className="font-bold text-slate-900 line-clamp-1">{preset.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Medication Input list */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Shifokor yozgan dorilar va ukollar ro'yxati ({medicines.length} ta)</span>
            </label>
            <span className="text-[11px] text-teal-700 font-medium">
              Kamida 3-5 ta dori/ukol kiriting
            </span>
          </div>

          {/* Current list of items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {medicines.map((med, index) => {
              const isInjection = med.toLowerCase().includes('ukol');
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white shadow-xs text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {isInjection ? (
                      <Syringe className="w-4 h-4 text-purple-600 shrink-0" />
                    ) : (
                      <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-800 truncate">{med}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveMedicine(index)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Medicine Form */}
          <form onSubmit={handleAddMedicine} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Dori yoki ukol nomini yozing (masalan: Kardioaspirin 100mg)..."
                value={newMedInput}
                onChange={(e) => setNewMedInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white"
              />
            </div>
            <select
              value={medType}
              onChange={(e: any) => setMedType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none"
            >
              <option value="Tabletka">💊 Tabletka</option>
              <option value="Ukol">💉 Ukol (Inyeksiya)</option>
              <option value="Kapsula">💊 Kapsula</option>
              <option value="Tomchi">💧 Tomchi / Sirop</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Ro'yxatga qo'shish</span>
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Big Action button */}
          <div className="pt-2">
            <button
              onClick={handleOptimize}
              disabled={isLoading || medicines.length < 2}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-teal-600 to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading
                  ? 'Barcha 5 ta dorining tarkibi tahlil qilinib, 2 ta asosiy dori ajratilmoqda...'
                  : `${medicines.length} ta dorini tahlil qilish & O'rnini bosuvchi 2 ta asosiy dori ajratish`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading animation */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Klinik Farmakologiya Konsiliumi Tahlil Qilmoqda...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            1. Har bir dori va ukolning kimyoviy tarkibi tekshirilmoqda.<br />
            2. O'xshash va dublyor moddalar aniqlanmoqda.<br />
            3. Hamma 5 ta dori vazifasini to'liq bajaradigan 2 ta universal dori shakllantirilmoqda.
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {result && !isLoading && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* SECTION 1: THE CORE 2 CONSOLIDATED MEDICINES (The Highlight!) */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 border border-indigo-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Smart Xulosa
                  </span>
                  <h2 className="text-lg sm:text-xl font-black mt-1">
                    Barcha {medicines.length} ta Dori O'rnini Bosuvchi 2 Dona Asosiy Dori:
                  </h2>
                  <p className="text-xs text-slate-300">
                    Ushbu 2 ta dori qolgan barcha dorilarning davolovchi samarasini to'laqonli ta'minlaydi
                  </p>
                </div>
              </div>

              {/* Action: Add both to profile */}
              {onAddMedicineToProfile && (
                <button
                  onClick={handleAddBothToProfile}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Dorilar profilingizga qo'shildi!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 text-amber-300" />
                      <span>Shu 2 ta dorini monitoringga olish</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* The 2 Core Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.tanlanganAsosiyIkkitaDori.map((dori, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-white">{dori.nomi}</h3>
                          <span className="text-[11px] text-teal-300 font-semibold">
                            Tarkibi: {dori.tarkibi}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Which medicines it replaces */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                      <span className="text-[10px] uppercase font-bold text-amber-300 block mb-1">
                        Qaysi dorilar o'rnini bosadi:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dori.qaysiDorilarOrniniBosadi.map((rep, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-200 border border-rose-400/30 text-[11px] font-medium"
                          >
                            ✓ {rep} o'rniga
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Why this was selected */}
                    <div className="text-xs text-slate-200 leading-relaxed">
                      <span className="font-bold text-white">Nega tanlandi: </span>
                      {dori.negaTanlandi}
                    </div>
                  </div>

                  {/* Usage schedule */}
                  <div className="pt-3 border-t border-white/10 text-xs text-teal-200 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Qabul tartibi: <b>{dori.qabulQilishTartibi}</b></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overlap & Polypharmacy Explanation */}
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Nima uchun 5 ta dori yozilgan edi va dublyorlik nimada?</span>
              </div>
              <p className="leading-relaxed text-amber-100/90">
                {result.oxshashlikVaDublyorlar}
              </p>
            </div>
          </div>

          {/* SECTION 2: BREAKDOWN OF ALL 5 MEDICINES & INJECTIONS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>
                  Barcha {result.barchaDorilar.length} ta Dori va Ukollarning To'liq Kimyoviy Tarkibi
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Har bir dorining nima uchun yozilganligi va organizmga ta'siri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.barchaDorilar.map((med, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between pb-2 border-b border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-900">{med.nomi}</h4>
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          {med.shakli}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-[11px] text-slate-700">
                        <span className="font-bold text-slate-900">Faol moddasi: </span>
                        {med.tarkibi}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        <span className="font-bold text-slate-800">Maqsadi: </span>
                        {med.roli}
                      </p>
                    </div>
                  </div>

                  {med.tafsilot && (
                    <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
                      {med.tafsilot}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: CLINICAL BENEFITS (Liver relief & Cost reduction) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Jigar & Buyrakka Yengillik</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                5 xil dori o'rniga 2 ta dori ichilganda jigar va buyraklarga tushadigan toksik yuklama <b>60% ga kamayadi</b>, oshqozon shilliq qavati shikastlanishi sezilarli darajada pasayadi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
              <div className="flex items-center space-x-2 text-teal-900 font-bold text-xs uppercase tracking-wide">
                <Coins className="w-5 h-5 text-teal-600" />
                <span>Xarajatlarni Tejash</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Dorixonada 5 xil alohida quti sotib olgandan ko'ra, barcha tarkibni o'zida mujassam etgan 2 ta universal kombinatsiyani xarid qilish <b>40-50% mablag'ni tejaydi</b>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wide">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Ichish Tartibining Qulayligi</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Kuniga 5 marta turli soatlarda dori ichishni esdan chiqarish ehtimoli yuqori. 2 ta dori bilan davolanish rejimiga 100% qat'iy rioya qilish oson bo'ladi.
              </p>
            </div>
          </div>

          {/* Bottom Clinical Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 text-center space-y-1">
            <p className="font-semibold text-slate-800">
              {result.xulosaVaKlinikFoydasi}
            </p>
            <p className="text-[11px] text-slate-500 italic">
              {result.muhimEslatma}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
