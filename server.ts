import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '35mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // 1. Analyze medicine by photo or name
  app.post('/api/medicine/scan', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', medicineName } = req.body;

      if (!imageBase64 && !medicineName) {
        return res.status(400).json({ error: 'Rasm yoki dori nomi kiritilishi shart' });
      }

      const promptText = `Sen tajribali farmatsevt va shifokor konsultantisiz. 
Berilgan dori vositasi ${medicineName ? `nomi: "${medicineName}"` : 'rasmi'} bo\'yicha to'liq va tushunarli tibbiy ma'lumot taqdim et.
Barcha ma'lumotlarni o'zbek tilida (lotin yozuvida) shakllantir.

Quyidagi tuzilmaga qat'iy rioya qil:
1. nomi (dori nomi va xalqaro patentlanmagan nomi - MNN)
2. tarkibi (asosiy faol modda va dozasi)
3. davolovchiKasalliklar (qanday kasalliklarga davo, ko'rsatmalar ro'yxati)
4. qabulQilishVaqti (qaysi paytda ichish ma'qul: ovqatdan oldin/keyin, kunning qaysi vaqtida, sutkalik doza tavsiyasi, suv bilan ichish)
5. nojoyaTasirlar (nojo'ya ta'sirlari va qarshi ko'rsatmalar)
6. obHavoTavsiyasi (ob-havo o'zgarishi, issiq/sovuq yoki magnit bo'ronida ushbu dorini ichuvchilarga maxsus ogohlantirish, masalan gipotenziv dorilar issiq havoda qon bosimini keskin tushirishi mumkinligi va h.k.)
7. saqlashQoidasi (saqlash harorati va muddati)
8. muhimEslatma (shifokor retseptisiz o'zboshimchalik bilan ichmaslik eslatmasi)

Javobni faqat to'g'ridan-to'g'ri JSON formatida qaytar.`;

      const contents: any[] = [];
      if (imageBase64) {
        // Strip data URI prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }
      contents.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nomi: { type: Type.STRING },
              tarkibi: { type: Type.STRING },
              davolovchiKasalliklar: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              qabulQilishVaqti: { type: Type.STRING },
              nojoyaTasirlar: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              obHavoTavsiyasi: { type: Type.STRING },
              saqlashQoidasi: { type: Type.STRING },
              muhimEslatma: { type: Type.STRING },
            },
            required: ['nomi', 'tarkibi', 'davolovchiKasalliklar', 'qabulQilishVaqti', 'obHavoTavsiyasi'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Medicine scan error:', err);
      res.status(500).json({ error: err.message || 'Dori tahlilida xatolik yuz berdi' });
    }
  });

  // 1.5. Optimize Prescription (Analyze 5 medicines, extract active ingredients, consolidate into 2 core medicines)
  app.post('/api/medicine/optimize-prescription', async (req, res) => {
    try {
      const { medicinesList = [], imageBase64, mimeType = 'image/jpeg', rawText } = req.body;

      if ((!medicinesList || medicinesList.length === 0) && !imageBase64 && !rawText) {
        return res.status(400).json({ error: 'Dorilar ro\'yxati yoki retsept talab qilinadi' });
      }

      const promptText = `Sen oliy toifali klinik farmakolog va tajribali shifokorsiz.
Foydalanuvchi shifokor yozib bergan dori va ukollar ro'yxatini taqdim etdi:
${medicinesList.length > 0 ? `Dori va ukollar: ${medicinesList.join(', ')}` : ''}
${rawText ? `Retsept matni: ${rawText}` : ''}

SENING VAZIFANG:
1. Kiritilgan HAR BIR dori va ukolning to'liq kimyoviy tarkibini (faol moddasini), farmakologik guruhini va organizmga nima uchun yozilganligini aniq ko'rsat.
2. Barcha dorilarning tarkibini sinchiklab taqqosla: bir-birini takrorlovchi (dublyor) moddalar, keraksiz ko'p dori (polipragmaziya) va o'xshash ta'sir mexanizmlarini aniqla.
3. BUTUN RETSEPT ICHIDAN eng muhim, ta'sir doirasi eng keng bo'lgan va qolgan dorilarning o'rnini to'liq bosa oladigan 2 DONA ASOSIY DORINI (yoki tarkibida barcha zarur moddalar mujassam bo'lgan 2 ta optimal universal dori/kombinatsiyani) AJRATIB BER!
Ushbu 2 ta dori butun boshli 5 ta dorining asosiy davolovchi samarasini to'laqonli ta'minlasin va bemorni ortiqcha 3 ta dori/ukol ichishdan xalos qilsin!
4. Nega aynan shu 2 ta dori tanlanganini, qaysi dorilar o'rnini qanday qilib bosishini bemorga tushunarli qilib asoslab ber.
5. Bemorni ortiqcha xarajatdan va jigar/buyrakka ortiqcha yuklamadan himoya qilish bo'yicha tavsiyalar ber.

Til: O'zbek tili (lotin yozuvida). Faqat JSON formatida qaytar.`;

      const contents: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }
      contents.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              barchaDorilar: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nomi: { type: Type.STRING },
                    shakli: { type: Type.STRING },
                    tarkibi: { type: Type.STRING },
                    roli: { type: Type.STRING },
                    tafsilot: { type: Type.STRING },
                  },
                },
              },
              oxshashlikVaDublyorlar: { type: Type.STRING },
              tanlanganAsosiyIkkitaDori: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nomi: { type: Type.STRING },
                    tarkibi: { type: Type.STRING },
                    qaysiDorilarOrniniBosadi: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    negaTanlandi: { type: Type.STRING },
                    qabulQilishTartibi: { type: Type.STRING },
                  },
                },
              },
              xulosaVaKlinikFoydasi: { type: Type.STRING },
              muhimEslatma: { type: Type.STRING },
            },
            required: [
              'barchaDorilar',
              'oxshashlikVaDublyorlar',
              'tanlanganAsosiyIkkitaDori',
              'xulosaVaKlinikFoydasi',
              'muhimEslatma',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Optimize prescription error:', err);
      res.status(500).json({ error: err.message || 'Dorilarni optimallashtirishda xatolik yuz berdi' });
    }
  });

  // 2. Analyze doctor prescription & lab tests
  app.post('/api/medical-records/analyze', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', rawText } = req.body;

      if (!imageBase64 && !rawText) {
        return res.status(400).json({ error: 'Rasm yoki matn talab qilinadi' });
      }

      const promptText = `Sen professional tibbiyot mutaxassisisiz. 
Foydalanuvchi shifokor retsepti, tahlil natijasi (qon tahlili, EKG, biokimyo, rentgen/MRT, UZI yoki shifokor ko'rik varaqasi) ni yukladi.
Ushbu hujjatni sinchiklab tahlil qil va barcha muhim nuqtalarni aniq ajratib ber.
Til: O'zbek tili (lotin alifbosida).

Chiqariladigan ma'lumotlar:
- hujjatTuri (masalan: "Umumiy qon tahlili", "Shifokor retsepti va tavsiyasi", "EKG xulosasi", "Biokimyoviy tahlil")
- tashxisYokiXulosa (aniqlangan kasallik yoki umumiy xulosa)
- asosiyKorsatkichlar (tahlildagi me'yordan og'ishgan yoki asosiy parametrlar: nomi, qiymati, normasi, holati - "Yuqori", "Past", "Me'yorda")
- yozilganDorilar (shifokor yozib bergan dorilar ro'yxati: nomi, dozasi, qabul qilish tartibi, maqsadi)
- shifokorTavsiyalari (turmush tarzi, parhez, rejim)
- obHavoXavfOmillari (ushbu tahlil natijalari va dorilarga qarab, qanday ob-havo sharoitlarida (masalan, kuchli shamol, sovuq, yomg'ir/sel, yuqori issiqlik, atmosfera bosimi tushishi/ko'tarilishi, magnit bo'roni) bemor o'ta ehtiyot bo'lishi kerakligi)

Faqat JSON formatida qaytar.`;

      const contents: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }
      if (rawText) {
        contents.push({ text: `Qo'shimcha matn/ma'lumot: ${rawText}` });
      }
      contents.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hujjatTuri: { type: Type.STRING },
              tashxisYokiXulosa: { type: Type.STRING },
              asosiyKorsatkichlar: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    parametr: { type: Type.STRING },
                    qiymat: { type: Type.STRING },
                    norma: { type: Type.STRING },
                    holat: { type: Type.STRING },
                  },
                },
              },
              yozilganDorilar: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    doriNomi: { type: Type.STRING },
                    doza: { type: Type.STRING },
                    tartib: { type: Type.STRING },
                    maqsad: { type: Type.STRING },
                  },
                },
              },
              shifokorTavsiyalari: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              obHavoXavfOmillari: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['hujjatTuri', 'tashxisYokiXulosa', 'yozilganDorilar', 'obHavoXavfOmillari'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Medical record analysis error:', err);
      res.status(500).json({ error: err.message || 'Tahlil hujjatini o\'qishda xatolik' });
    }
  });

  // 3. Personalized Meteo-Health Advisory Engine
  app.post('/api/meteo-health/advisories', async (req, res) => {
    try {
      const {
        healthProfile,
        medicalRecords = [],
        weatherForecast,
        locationName = 'Toshkent',
      } = req.body;

      const promptText = `Sen O'zbekistonning yetakchi meteo-patologiya va profilaktik tibbiyot shifokorisiz.
Foydalanuvchining shaxsiy salomatlik holati, shifokor yozib bergan dorilari, tahlil natijalari hamda kelayotgan ob-havo ma'lumotlariga asoslanib O'TA ANIQ, ShAXSIYLAShTIRILGAN va HAYOTIY OGOHLANTIRISh TIZIMINI ishlab chiq.

FOYDALANUVChI PROFILI:
- Yoshi: ${healthProfile?.age || 'Aniqlanmagan'}
- Jinsi: ${healthProfile?.gender || 'Aniqlanmagan'}
- Surunkali kasalliklar / Salomatlik muammolari: ${JSON.stringify(healthProfile?.conditions || [])}
- Shikoyatlari / Sezgirligi: ${healthProfile?.sensitivities || "Meteo-sezgirlik, qon bosimi tebranishi, nafas qisishi"}

YUKLANGAN TAHLIL NATIJALARI VA ShIFOKOR RETSEPTLARI:
${JSON.stringify(medicalRecords, null, 2)}

OB-HAVO VA METEOROLOGIK PROGNOZ (${locationName}):
${JSON.stringify(weatherForecast, null, 2)}

MUHIM KO'RSATMA:
Agar ob-havoda kuchli shamol, sovuq havo, sel/yomg'ir xavfi, chang to'foni, keskin havo bosimi tushishi yoki ko'tarilishi, yuqori namlik yoki magnit bo'roni bo'lsa:
1. Aynan shu foydalanuvchining kasalliklariga (masalan: gipertoniya, astma, artrit, yurak-qon tomir, bosh og'rig'i) va uning shifokor yozgan dorilariga (masalan: qon bosimi dorilari, ingalyator, kardiopreparatlar) bevosita bog'lab gapir!
2. Masalan: "Ertaga havo keskin sovuydi va kuchli shamol (18 m/s), sel xavfi mavjud. Sizning tahlillaringizdagi arterial bosim ko'rsatkichlari va shifokor yozgan [Dori nomi] hisobga olinganda, ko'chaga chiqmasligingiz, ertalab doringizni o'z vaqtida qabul qilishingiz va bosimingizni o'lchashingiz zarur!" kabi bevosita va samimiy, ishonchli tilda yoz.
3. xavfDarajasi: "past", "o'rta", "yuqori" yoki "o'ta xavfli"
4. ko'chagaChiqishTavsiyasi: "Tavsiya etiladi", "Ehtiyotkorlik bilan cheklangan", "Mutlaqo tavsiya etilmaydi (Uyda qoling)"
5. doriQabulQilishEslatmasi: shifokor dorilarini ob-havoga mos ravishda qanday nazorat qilish kerakligi
6. shoshilinchBelgilar: tez yordamga (103) murojaat qilish kerak bo'lgan holatlar.

Javobni quyidagi JSON formatida taqdim et. Til: O'zbek tili.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              xavfDarajasi: { type: Type.STRING },
              sarlavha: { type: Type.STRING },
              qisqaOgohlantirish: { type: Type.STRING },
              batafsilTahlil: { type: Type.STRING },
              kochagaChiqishTavsiyasi: { type: Type.STRING },
              amalQilishKerakBolganTadbirlar: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              doriQabulQilishEslatmasi: { type: Type.STRING },
              bemorUchunMaxsusEhtiyotkorlik: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              shoshilinchBelgilar: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'xavfDarajasi',
              'sarlavha',
              'qisqaOgohlantirish',
              'batafsilTahlil',
              'kochagaChiqishTavsiyasi',
              'amalQilishKerakBolganTadbirlar',
              'doriQabulQilishEslatmasi',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Meteo health advisory error:', err);
      res.status(500).json({ error: err.message || 'Ogohlantirish yaratishda xatolik' });
    }
  });

  // Serve static files in production or Vite in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShifoHavo full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
