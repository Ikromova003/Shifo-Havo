import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Activity,
  Trash2,
  Sparkles,
  Plus,
  Eye,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { MedicalRecord, PrescribedMedication, LabIndicator } from '../types';
import { analyzeMedicalRecordAPI } from '../services/api';

interface MedicalRecordsViewProps {
  medicalRecords: MedicalRecord[];
  onSaveRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNavigateToWeather: () => void;
}

export const MedicalRecordsView: React.FC<MedicalRecordsViewProps> = ({
  medicalRecords,
  onSaveRecord,
  onDeleteRecord,
  onNavigateToWeather,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  // Handle file select
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

  // Trigger AI Analysis
  const handleAnalyze = async () => {
    if (!previewUrl && !rawText.trim()) {
      setError('Iltimos, tahlil yoki retsept rasmini yuklang yoki matnini kiriting');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeMedicalRecordAPI({
        imageBase64: previewUrl || undefined,
        rawText: rawText.trim() || undefined,
      });

      const newRecord: MedicalRecord = {
        id: `rec-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        hujjatTuri: result.hujjatTuri || 'Shifokor xulosasi va retsepti',
        tashxisYokiXulosa: result.tashxisYokiXulosa || 'Arterial gipertoniya 2-bosqich, meteosezgirlik',
        shifokorFIO: 'Dr. Ko\'rik shifokori',
        klinika: 'Davlat yoki xususiy klinika',
        asosiyKorsatkichlar: result.asosiyKorsatkichlar || [],
        yozilganDorilar: result.yozilganDorilar || [],
        shifokorTavsiyalari: result.shifokorTavsiyalari || [],
        obHavoXavfOmillari: result.obHavoXavfOmillari || [],
        filePreview: previewUrl || undefined,
      };

      onSaveRecord(newRecord);
      setSelectedFile(null);
      setPreviewUrl(null);
      setRawText('');
      alert('Tahlil va retsept muvaffaqiyatli saqlandi! Ob-havo ogohlantirishlari endi ushbu dorilar va ko\'rsatkichlarga qarab beriladi.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Tahlilni o\'qishda xatolik yuz berdi');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load sample preset to test instantly
  const loadPreset = (type: 'hypertension' | 'asthma') => {
    if (type === 'hypertension') {
      const presetRecord: MedicalRecord = {
        id: `rec-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        hujjatTuri: 'Kardiolog ko\'rigi va Qon biokimyosi',
        tashxisYokiXulosa: 'Arterial gipertoniya 2-bosqich, xavf 3 (yuqori). Qon bosimi beqarorligi.',
        shifokorFIO: 'Dr. Alisher Qodirov',
        klinika: 'Respublika Kardiologiya Markazi',
        asosiyKorsatkichlar: [
          { parametr: 'Arterial qon bosimi', qiymat: '155/95 mm sim.ust', norma: '120/80', holat: 'Yuqori' },
          { parametr: 'Xolesterin umumiy', qiymat: '5.8 mmol/l', norma: '< 5.0', holat: 'Yuqori' },
          { parametr: 'Gemoglobin', qiymat: '118 g/l', norma: '120-160', holat: 'Biroz past' },
          { parametr: 'Puls (yurak urishi)', qiymat: '88 zarba/daq', norma: '60-80', holat: 'Me\'yordan biroz baland' },
        ],
        yozilganDorilar: [
          { doriNomi: 'Enalapril', doza: '10 mg', tartib: 'Ertalab nonushtadan keyin 1 tabletka', maqsad: 'Qon bosimini tushirish va barqarorlashtirish' },
          { doriNomi: 'Kardioaspirin', doza: '100 mg', tartib: 'Kechki ovqatdan so\'ng 1 tabletka', maqsad: 'Qonni suyultirish, tromblardan himoya' },
          { doriNomi: 'Magnelis B6', doza: '2 tab', tartib: 'Kuniga 2 mahal', maqsad: 'Yurak va asab faoliyatini qo\'llab-quvvatlash' },
        ],
        shifokorTavsiyalari: [
          'Tuz iste\'molini keskin kamaytirish',
          'Har kuni ertalab va kechqurun qon bosimini o\'lchab kundalikka yozish',
          'Sovuq va kuchli shamolda ko\'chaga chiqishni cheklash',
        ],
        obHavoXavfOmillari: [
          'Atmosfera bosimi pasayishi gipertonik krizis chaqiradi',
          'Sovuq shamol tomirlar spazmiga olib keladi',
          'Magnit bo\'ronida bosh og\'rig\'i va puls tezlashishi xavfi bor',
        ],
      };
      onSaveRecord(presetRecord);
    } else {
      const presetRecord: MedicalRecord = {
        id: `rec-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        hujjatTuri: 'Pulmonolog xulosasi va Spirametriya',
        tashxisYokiXulosa: 'Bronxial astma, o\'rtacha og\'irlikdagi kechishi. Sovuq va nam havoga allergik javob.',
        shifokorFIO: 'Dr. Shahnoza Karimova',
        klinika: 'Shifo-Nur Tibbiyot Markazi',
        asosiyKorsatkichlar: [
          { parametr: 'O\'pka sig\'imi (FEV1)', qiymat: '68%', norma: '> 80%', holat: 'Past' },
          { parametr: 'SpO2 (Kislorod)', qiymat: '95%', norma: '96-99%', holat: 'Me\'yorda' },
          { parametr: 'Eozinofillar', qiymat: '7%', norma: '1-5%', holat: 'Yuqori (Allergiya)' },
        ],
        yozilganDorilar: [
          { doriNomi: 'Salbutamol (Ingalyator)', doza: '100 mkg', tartib: 'Nafas qisganda 1-2 nafas purkash', maqsad: 'Bronxlar spazmini tezda ochish' },
          { doriNomi: 'Beklometazon', doza: '250 mkg', tartib: 'Ertalab va kechqurun 1 martadan', maqsad: 'Nafas yo\'llaridagi yallig\'lanishni olish' },
          { doriNomi: 'Montelukast', doza: '10 mg', tartib: 'Kechqurun uxlashdan oldin 1 tabletka', maqsad: 'Allergik spazmni to\'xtatish' },
        ],
        shifokorTavsiyalari: [
          'Sovuq havoda og\'iz-burunni sharf bilan yopish',
          'Kuchli shamol va chang paytida ko\'chaga chiqmaslik',
          'Ingalyatorni doimo cho\'ntakda saqlash',
        ],
        obHavoXavfOmillari: [
          'Kuchli shamol va chang bronxospazm chaqiradi',
          'Sel va nam havoda nafas yetishmasligi kuchayadi',
        ],
      };
      onSaveRecord(presetRecord);
    }
    alert('Namunaviy tahlil yuklandi! Endi Ob-havo bo\'limiga o\'tsangiz, ushbu dorilar va ko\'rsatkichlarga mos ogohlantirish ko\'rinadi.');
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Shifokor Tahlillari va Retseptlari
              </h1>
              <p className="text-xs text-slate-500">
                Tahlil natijalarini yoki shifokor yozgan dorilarni yuklang — ilova ob-havo ogohlantirishini aynan shu dorilarga qarab beradi!
              </p>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium hidden md:inline">Namunalar:</span>
            <button
              onClick={() => loadPreset('hypertension')}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors"
            >
              + Gipertoniya retsepti
            </button>
            <button
              onClick={() => loadPreset('asthma')}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-semibold transition-colors"
            >
              + Astma retsepti
            </button>
          </div>
        </div>

        {/* Upload Box */}
        <div className="mt-6 border-2 border-dashed border-teal-300 rounded-3xl p-6 sm:p-8 bg-teal-50/30 text-center relative">
          <input
            type="file"
            id="medical-file-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="max-w-md mx-auto space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <img
                  src={previewUrl}
                  alt="Tahlil yoki retsept rasmi"
                  className="w-full max-h-64 object-contain bg-slate-900"
                />
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-teal-800 font-medium">
                Rasm tanlandi: {selectedFile?.name || 'Hujjat'}
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Retsept yoki tahlil varaqasini suratga oling yoki yuklang
              </h3>
              <p className="text-xs text-slate-500">
                Qon tahlili, EKG xulosasi, shifokor retsepti (PNG, JPG, rasm)
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <label
                  htmlFor="medical-file-upload"
                  className="cursor-pointer px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Rasm yuklash / Suratga olish</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  {showManualForm ? 'Yopish' : 'Matn kiritish'}
                </button>
              </div>
            </div>
          )}

          {/* Manual text area */}
          {showManualForm && (
            <div className="mt-4 max-w-lg mx-auto text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shifokor xulosasi yoki dorilar ro'yxatini matn sifatida yozing:
              </label>
              <textarea
                rows={3}
                placeholder="Masalan: Tashxis - Gipertoniya. Shifokor Enalapril 10mg ertalab, Kardioaspirin 100mg kechqurun ichishni buyurdi. Bosim 150/90..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 bg-white"
              />
            </div>
          )}

          {error && (
            <div className="mt-3 text-xs text-rose-600 font-semibold flex items-center justify-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Action button */}
          {(previewUrl || rawText.trim()) && (
            <div className="mt-5">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold shadow-md hover:shadow-teal-500/20 transition-all flex items-center space-x-2 mx-auto disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>
                  {isAnalyzing
                    ? 'AI Tahlil qilmoqda (retsept va dorilar ajratilmoqda)...'
                    : 'Sun\'iy intellekt bilan tahlil qilish va Saqlash'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stored Records List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Mening Tibbiy Hujjatlarim ({medicalRecords.length})
            </h2>
            <p className="text-xs text-slate-500">
              Bu tahlillar ob-havo xavfi bilan avtomatik bog'langan
            </p>
          </div>
          {medicalRecords.length > 0 && (
            <button
              onClick={onNavigateToWeather}
              className="text-xs text-teal-700 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Ob-havo ogohlantirishini ko'rish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {medicalRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Info className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Hozircha tahlil yoki shifokor retsepti yuklanmagan
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Yuqoridagi tugmalardan foydalanib o'zingizning tahlilingizni yuklang yoki "Namunaviy retsept" tugmasini bosing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicalRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-teal-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {record.hujjatTuri}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {record.tashxisYokiXulosa}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Sana: {record.date} {record.klinika && `• ${record.klinika}`}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lab indicators */}
                  {record.asosiyKorsatkichlar && record.asosiyKorsatkichlar.length > 0 && (
                    <div className="space-y-1.5 pt-3">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                        <Activity className="w-3.5 h-3.5 text-teal-600" />
                        <span>Asosiy tahlil ko'rsatkichlari:</span>
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {record.asosiyKorsatkichlar.map((ind, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                          >
                            <span className="text-slate-500">{ind.parametr}</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-bold text-slate-900">{ind.qiymat}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  ind.holat.toLowerCase().includes('yuqori')
                                    ? 'bg-rose-100 text-rose-800'
                                    : ind.holat.toLowerCase().includes('past')
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {ind.holat}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescribed medicines */}
                  {record.yozilganDorilar && record.yozilganDorilar.length > 0 && (
                    <div className="space-y-1.5 pt-3">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                        <Pill className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Shifokor yozib bergan dorilar:</span>
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {record.yozilganDorilar.map((med, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-slate-800"
                          >
                            <div className="flex items-center justify-between font-bold text-indigo-950">
                              <span>{med.doriNomi}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-indigo-200/60 rounded-md">
                                {med.doza}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Tartib: {med.tartib}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weather risk factors */}
                  {record.obHavoXavfOmillari && record.obHavoXavfOmillari.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      <span className="font-bold block mb-0.5">Ob-havo sezgirligi:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                        {record.obHavoXavfOmillari.map((omil, i) => (
                          <li key={i}>{omil}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1 text-teal-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ob-havo tahliliga integratsiya qilingan</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
