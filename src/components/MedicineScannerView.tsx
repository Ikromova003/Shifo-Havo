import React, { useState } from 'react';
import {
  ScanLine,
  Camera,
  Upload,
  Search,
  Sparkles,
  Pill,
  Clock,
  ShieldAlert,
  CloudSun,
  Package,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  BookmarkPlus,
  RefreshCw,
} from 'lucide-react';
import { MedicineInfo } from '../types';
import { scanMedicineAPI } from '../services/api';

interface MedicineScannerViewProps {
  onAddMedicineToProfile?: (medName: string) => void;
}

const POPULAR_MEDICINES = [
  'Enalapril',
  'Paratsetamol',
  'Tsitramon',
  'Kardioaspirin',
  'No-shpa (Drotaverin)',
  'Amoksitsillin',
  'Suprastin',
  'Mezim forte',
  'Salbutamol',
];

export const MedicineScannerView: React.FC<MedicineScannerViewProps> = ({
  onAddMedicineToProfile,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [medicineQuery, setMedicineQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<MedicineInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform Scan API
  const handleScan = async (searchName?: string) => {
    const nameToUse = searchName || medicineQuery.trim();
    if (!previewUrl && !nameToUse) {
      setError('Iltimos, dori rasmini yuklang yoki nomini kiriting');
      return;
    }

    setIsScanning(true);
    setError(null);
    setAddedSuccess(false);

    try {
      const data = await scanMedicineAPI({
        imageBase64: previewUrl || undefined,
        medicineName: nameToUse || undefined,
      });

      setScanResult({
        ...data,
        scanDate: new Date().toLocaleDateString('uz-UZ'),
        imageThumbnail: previewUrl || undefined,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Dori tahlilida xatolik yuz berdi');
    } finally {
      setIsScanning(false);
    }
  };

  const handleQuickSelect = (medName: string) => {
    setMedicineQuery(medName);
    handleScan(medName);
  };

  const handleAddToProfile = () => {
    if (scanResult && onAddMedicineToProfile) {
      onAddMedicineToProfile(scanResult.nomi);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                AI Dori Skaneri va Farmatsevtika Qo'llanmasi
              </h1>
              <p className="text-xs text-slate-500">
                Dorini suratga oling yoki nomini yozing — AI tarkibi, qachon ichish kerakligi va qanday kasalliklarga davolashini to'liq ko'rsatadi!
              </p>
            </div>
          </div>
        </div>

        {/* Input Methods Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Camera / File Upload Box */}
          <div className="md:col-span-7 border-2 border-dashed border-teal-200 rounded-3xl p-6 bg-teal-50/20 text-center flex flex-col justify-center items-center">
            <input
              type="file"
              id="medicine-camera-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-3 w-full max-w-xs">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                  <img
                    src={previewUrl}
                    alt="Dori qadog'i"
                    className="w-full max-h-56 object-cover bg-slate-100"
                  />
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-semibold"
                  >
                    Boshqa rasm
                  </button>
                </div>
                <button
                  onClick={() => handleScan()}
                  disabled={isScanning}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Tahlil qilinmoqda...' : 'Rasmni AI bilan tahlil qilish'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Dori qutisi yoki tabletkasini suratga oling
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Dori nomining yozuvi yoki qadog'i aniq ko'rinsin
                </p>
                <label
                  htmlFor="medicine-camera-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Dori suratini yuklash</span>
                </label>
              </div>
            )}
          </div>

          {/* Right: Search by Name + Popular presets */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yoki dori nomini qidiring:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Masalan: Enalapril, Kardioaspirin..."
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  className="w-full pl-9 pr-24 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white"
                />
                <button
                  onClick={() => handleScan()}
                  disabled={isScanning || !medicineQuery.trim()}
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 disabled:opacity-40"
                >
                  Qidirish
                </button>
              </div>
            </div>

            {/* Quick Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                O'zbekistonda ko'p qo'llaniladigan dorilar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_MEDICINES.map((med) => (
                  <button
                    key={med}
                    onClick={() => handleQuickSelect(med)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 border border-slate-200 text-slate-700 transition-colors"
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isScanning && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            Dori tarkibi va farmakologik xususiyatlari tekshirilmoqda...
          </h3>
          <p className="text-xs text-slate-500">
            Qabul qilish vaqti, ovqatlanish tartibi va ob-havoga bog'liq ta'sirlari aniqlanmoqda
          </p>
        </div>
      )}

      {/* Scanned Result Card */}
      {scanResult && !isScanning && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header of Medicine */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Dori pasporti
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {scanResult.nomi}
                </h2>
                <p className="text-xs text-slate-500">
                  Faol moddasi: <span className="font-semibold text-slate-700">{scanResult.tarkibi}</span>
                </p>
              </div>
            </div>

            {/* Add to user profile button */}
            {onAddMedicineToProfile && (
              <button
                onClick={handleAddToProfile}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-xs ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mening dorilarimga qo'shildi!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Ob-havo ogohlantirishlariga qo'shish</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* 3 Core Blocks requested by User:
              1. Tarkibida nimalar bor
              2. Qaysi paytda ichish ma'qul
              3. Qanday kasalliklarga davo
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Qaysi paytda ichish ma'qul */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900">
                <Clock className="w-5 h-5 text-amber-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide">
                  Qaysi paytda ichish ma'qul?
                </h3>
              </div>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {scanResult.qabulQilishVaqti}
              </p>
              <p className="text-[11px] text-amber-800/80 pt-1">
                Ovqatdan oldin/keyin, sutka vaqti va suv bilan qabul qilish tavsiyasi.
              </p>
            </div>

            {/* 2. Qanday kasalliklarga davo */}
            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
              <div className="flex items-center space-x-2 text-teal-900">
                <HeartHandshake className="w-5 h-5 text-teal-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide">
                  Qanday kasalliklarga davo?
                </h3>
              </div>
              <ul className="text-xs text-slate-800 space-y-1">
                {scanResult.davolovchiKasalliklar?.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Dori tarkibi */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-900">
                <Package className="w-5 h-5 text-indigo-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide">
                  Dori tarkibi
                </h3>
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {scanResult.tarkibi}
              </p>
              {scanResult.saqlashQoidasi && (
                <p className="text-[11px] text-indigo-900 pt-1">
                  Saqlash: {scanResult.saqlashQoidasi}
                </p>
              )}
            </div>
          </div>

          {/* Weather and Meteo-sensitivity Special Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50 to-sky-50 border border-sky-200 space-y-2">
            <div className="flex items-center space-x-2 text-sky-900">
              <CloudSun className="w-5 h-5 text-sky-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wide">
                Ob-havo o'zgarganda ushbu dorini ichuvchilarga maslahat:
              </h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {scanResult.obHavoTavsiyasi}
            </p>
          </div>

          {/* Contraindications & Side Effects */}
          {scanResult.nojoyaTasirlar && scanResult.nojoyaTasirlar.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Nojo'ya ta'sirlari va ehtiyot choralari:</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {scanResult.nojoyaTasirlar.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Important medical disclaimer */}
          <p className="text-[11px] text-slate-400 italic text-center">
            {scanResult.muhimEslatma || 'Eslatma: Har qanday dori vositasini faqat shifokor tavsiyasiga ko\'ra qabul qiling.'}
          </p>
        </div>
      )}
    </div>
  );
};
