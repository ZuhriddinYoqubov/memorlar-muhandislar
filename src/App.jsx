import React, { useState, useMemo, useEffect } from "react";

// Yangi: logotip rasmi import qilinadi
import logo from './assets/logo.png';
// Yangi: 2-tab uchun issiqlik texnik hisob komponenti (ITH.jsx)
import IssiqlikTexnikHisob from "./features/heat/ITH";
// Yangi: 3-tab uchun issiqlik texnik hisob va energetik pasport uchun bosqichli ustoz-komponent (HeatWizard.jsx)
import HeatWizard from "./features/heat/HeatWizard";

/**
 * Loyiha qiymati kalkulyatori (App.jsx)
 * - Murakkablik I-IV select
 * - BXM (bazaviy hisoblash miqdori) editable, default 412000
 * - 9 ta murakkab sharoit (checkbox) — 1-ILOVA dagi koeffitsiyentlar
 * - Uskuna qiymati foizi inputi → Kp ni interpolyatsiya bilan hisoblaydi (2-ILOVA)
 * - Kc hisoblash qoidasi: har bir tanlangan band uchun koeffitsiyentlar berilgan (masalan 1.5),
 *   lekin umumiy muvofiqlash Kc quyidagicha olinadi: Kc = 1 + sum(k_i - 1)
 *   (ya'ni har bir k_i ning kasr qismlarining yig'indisi + 1)
 * - Yakuniy Sw = SB × L × Kc × Kp
 *
 * Kod ichida Oʻzbekcha kommentlar koʻp, har bir qadam tushuntirilgan.
 */

/* --- Test qiymatlar va konfiguratsiya --- */

/* 
 * Loyiha ishlari qiymatining hisoblash mezoni (L%) ni aniqlash funksiyasi
 * Murakkablik darajasi (I, II, III, IV) va loyiha qiymati (BXM da) asosida foizni hisoblaydi
 * 
 * @param {string} complexityLevel - Murakkablik darajasi: "I", "II", "III", yoki "IV"
 * @param {number} costBXM - Loyiha qiymati bazaviy hisoblash miqdorida (BXM)
 * @returns {number} - Hisoblangan foiz (masalan: 5.0, 4.5, 3.8, ...)
 */
function getComplexityPercent(complexityLevel, costBXM) {
  // BXM qiymatini raqamga o'tkazish va tozalash
  const cost = Number(costBXM) || 0;
  
  // Murakkablik darajasiga qarab tegishli jadvalni tanlash
  let thresholds = [];
  
  if (complexityLevel === "I") {
    // I kategoriya ishlar uchun jadval
    thresholds = [
      { maxCost: 500, percent: 5.0 },
      { maxCost: 1000, percent: 4.5 },
      { maxCost: 2500, percent: 4.0 },
      { maxCost: 3500, percent: 3.5 },
      { maxCost: 5000, percent: 3.0 },
      { maxCost: 10000, percent: 2.7 },
      { maxCost: 25000, percent: 2.5 }, // 25 000 baravarigacha va undan yuqori
    ];
  } else if (complexityLevel === "II") {
    // II kategoriya ishlar uchun jadval
    thresholds = [
      { maxCost: 1000, percent: 5.0 },
      { maxCost: 2500, percent: 4.7 },
      { maxCost: 3500, percent: 4.4 },
      { maxCost: 5000, percent: 4.1 },
      { maxCost: 10000, percent: 3.8 },
      { maxCost: 25000, percent: 3.5 },
      { maxCost: 50000, percent: 3.2 },
      { maxCost: 75000, percent: 2.9 },
      { maxCost: 100000, percent: 2.5 }, // 100 000 baravarigacha va ortiq
    ];
  } else if (complexityLevel === "III" || complexityLevel === "IV") {
    // III va IV kategoriya ishlar uchun bir xil jadval
    thresholds = [
      { maxCost: 2500, percent: 5.0 },
      { maxCost: 3500, percent: 4.7 },
      { maxCost: 5000, percent: 4.4 },
      { maxCost: 10000, percent: 4.1 },
      { maxCost: 25000, percent: 3.8 },
      { maxCost: 50000, percent: 3.5 },
      { maxCost: 75000, percent: 3.3 },
      { maxCost: 100000, percent: 3.1 },
      { maxCost: 200000, percent: 3.0 },
      { maxCost: 300000, percent: 2.8 },
      { maxCost: 400000, percent: 2.6 },
      { maxCost: 500000, percent: 2.5 }, // 500 000 baravarigacha va ortiq
    ];
  } else {
    // Noto'g'ri murakkablik darajasi berilsa, default qiymat qaytarish
    console.warn(`Noto'g'ri murakkablik darajasi: ${complexityLevel}`);
    return 0;
  }
  
  // Agar thresholds bo'sh bo'lsa, xato qaytarish
  if (!thresholds || thresholds.length === 0) {
    console.error("Thresholds jadvali topilmadi");
    return 0;
  }
  
  // Agar qiymat 0 yoki manfiy bo'lsa, birinchi chegaraning foizini qaytarish
  if (cost <= 0) {
    return thresholds[0].percent;
  }
  
  // Agar qiymat eng yuqori chegaradan yuqori yoki teng bo'lsa, oxirgi chegaraning foizini qaytarish
  const lastThreshold = thresholds[thresholds.length - 1];
  if (!lastThreshold) {
    return thresholds[0].percent;
  }
  
  if (cost >= lastThreshold.maxCost) {
    return lastThreshold.percent;
  }
  
  // Jadval tushuntirishi:
  // "500 baravarigacha - 5.0%" - cost 0 dan 500 gacha (500 o'z ichiga olgan) bo'lsa, 5.0%
  // "1 000 baravarigacha - 4.5%" - cost 500 dan 1000 gacha (1000 o'z ichiga olgan) bo'lsa, 4.5%
  // Interpolatsiya: chegaralar orasida chiziqli interpolatsiya qilamiz
  // Masalan: cost = 750 bo'lsa, 500 (5.0%) va 1000 (4.5%) orasida interpolatsiya qilamiz
  
  // Agar qiymat birinchi chegara yoki undan past bo'lsa
  if (cost <= thresholds[0].maxCost) {
    return thresholds[0].percent;
  }
  
  // Qolgan chegaralar orasida interpolatsiya qilish
  for (let i = 0; i < thresholds.length - 1; i++) {
    const current = thresholds[i];
    const next = thresholds[i + 1];
    
    if (!current || !next) {
      continue;
    }
    
    // Agar qiymat joriy chegara va keyingi chegara orasida bo'lsa
    if (cost > current.maxCost && cost <= next.maxCost) {
      // Chiziqli interpolatsiya:
      // cost = current.maxCost bo'lganda, percent = current.percent
      // cost = next.maxCost bo'lganda, percent = next.percent
      // O'rtasida chiziqli o'zgaradi
      
      const costRange = next.maxCost - current.maxCost;
      if (costRange === 0) {
        return current.percent;
      }
      
      const percentRange = next.percent - current.percent;
      const costPosition = cost - current.maxCost;
      
      // Interpolatsiya formulasi: y = y1 + ((x - x1) / (x2 - x1)) * (y2 - y1)
      const interpolatedPercent = current.percent + (costPosition / costRange) * percentRange;
      
      return interpolatedPercent;
    }
  }
  
  // Agar hech qanday shart bajarilmasa (bu holat kamdan-kam), oxirgi foizni qaytarish
  return lastThreshold.percent;
}

/* 1-ILOVA: murakkab sharoitlar va ularning individual koeffitsiyent qiymatlari
   Bu yerda siz bergan real 1-ILOVA qiymatlari asosida test qiymatlar qo'yildi. */
const COMPLEXITY_FACTORS = [
  {
    id: "innovative",
    label: "Obyekt xususiyatlarining o'ta noyobligi (innovatsion texnologiyalar asosida)",
    coeff: 1.5,
  },
  {
    id: "repeated_use",
    label:
      "Ko'p marotaba qo'llaniladigan obyektlarni loyihalash, loyihalash uchun asos materiallarni tayyorlash, eksperimental loyihalarni ishlab chiqish",
    coeff: 1.4,
  },
  {
    id: "seismic9",
    label: "Maydonchaning hisob bo'yicha zilzilaga chidamliligi (9 ball)",
    coeff: 1.2,
  },
  {
    id: "historic_area",
    label: "Tarixiy binolar hududida quriladigan obyektlar",
    coeff: 1.3,
  },
  {
    id: "historic_restore",
    label: "Tarixiy obyektlarni qayta tiklash",
    coeff: 1.4,
  },
  {
    id: "industrial_restore",
    label:
      "Faoliyat yurituvchi korxona sharoitlarida qayta tiklash (ishlab chiqarish faoliyati bilan bog'liq obyektlar uchun)",
    coeff: 1.3,
  },
  {
    id: "strengthening",
    label:
      "Mavjud bo'lgan bino va inshootlarning qurilish konstruksiyalarini kuchaytirish loyihalari",
    coeff: 1.2,
  },
  {
    id: "bim",
    label:
      "Loyihalarni BIM (Building Information Management) texnologiyalari asosida bajarish",
    coeff: 2.0,
  },
  {
    id: "fast_track",
    label: '"Fast track" usulida loyihalashtirish',
    coeff: 1.2,
  },
];

/* 2-ILOVA: uskuna qiymati foiziga (x) mos Kp nuqtalari (test tabel)
   Qoida:
   - 0-24.99% (25%dan kam) -> 1.0 (o'zgarishsiz)
   - 25% -> 0.8
   - 25-90% (25%dan 90%gacha) -> interpolatsiya: 25% -> 0.8, 50% -> 0.65, 70% -> 0.5, 90% -> 0.4
   - 90-100% (90%dan yuqori, 90%ni o'z ichiga olgan) -> 0.4 (o'zgarishsiz)
*/
const KP_POINTS = [
  { x: 0, y: 1.0 },
  { x: 25, y: 0.8 },
  { x: 50, y: 0.65 },
  { x: 70, y: 0.5 },
  { x: 90, y: 0.4 },
];

/* Yordamchi: raqamlarni formatlash funksiyasi */
const fmt = (v) => {
  try {
    const num = Number(v);
    if (isNaN(num) || !isFinite(num)) {
      return "0";
    }
    return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 }).format(num);
  } catch (error) {
    console.error("fmt funksiyasida xato:", error, v);
    return "0";
  }
};

/* So'm formatlash */
const fmtSoom = (v) =>
  new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(v);

// O'zgartirish: Ikki xonali kasr bilan doimiy format (masalan L foizi uchun) 
const fmtFixed2 = (v) =>
  new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

/* BXM inputini ko'rsatishda 000 000 000 ko'rinishida bo'lishi uchun formatlash */
function formatWithSpaces(value) {
  if (value === null || value === undefined) return "";
  const digitsOnly = String(value).replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* SB inputini ko'rsatishda formatlash:
   - Kiritish vaqtida: faqat 3 xonali guruhlash, kasr bo'lsa 2 xonagacha kesish
   - Blur paytida (quyida handleSBBlur): majburan ,00 ko'rinishiga keltiriladi */
function formatSBValue(value) {
  if (!value || value === "") return "";
  
  // Faqat raqamlar va nuqta qoldirish
  const cleaned = String(value).replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  
  // Nuqta bilan ajratish (butun va kasr qismlari)
  const parts = cleaned.split(".");
  let integerPart = parts[0] || "0";
  let decimalPart = parts[1] || "";
  
  // Agar butun qism bo'sh bo'lsa va kasr qismi bor bo'lsa, 0 qo'yish
  if (integerPart === "" && decimalPart) {
    integerPart = "0";
  }
  
  // Butun qismni 3 xonali guruhlarga ajratish
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  // Kiritish vaqtida: faqat mavjud kasr bo'lsa, 2 xonagacha kesib ko'rsatamiz
  const trimmedDecimal = decimalPart.slice(0, 2);
  if (trimmedDecimal.length > 0) {
    return `${formattedInteger},${trimmedDecimal}`;
  }
  return formattedInteger;
}

/* Formatlangan SB qiymatini tozalash (raqamga o'tkazish) */
function parseSBValue(formattedValue) {
  if (!formattedValue || formattedValue === "") return "";
  // Bo'shliqlar va vergullarni nuqtaga o'zgartirish
  return formattedValue.replace(/\s/g, "").replace(/,/g, ".");
}

/* SB inputini blur paytida yakuniy ko'rinishga keltirish (… ,00) */
function finalizeSBForDisplay(value) {
  if (!value || value === "") return "";
  const cleaned = String(value).replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const parts = cleaned.split(".");
  const integerPart = (parts[0] || "0").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const decimalPart = (parts[1] || "").slice(0, 2).padEnd(2, "0");
  return `${integerPart},${decimalPart}`;
}

/* Interpolatsiya funksiyasi: berilgan x bo'yicha KP nuqtalardan lineer interpolatsiya */
function interpKp(xPercent) {
  // limitlash 0..100
  const x = Math.max(0, Math.min(100, Number(xPercent || 0)));

  // 25%dan kam foizlarga (0-24.99%) 1.0 koeffitsient qo'llash
  if (x < 25) {
    return 1.0;
  }

  // 90%dan yuqori yoki teng foizlarga 0.4 koeffitsient qo'llash
  if (x >= 90) {
    return 0.4;
  }

  // 25% dan 90% gacha interpolatsiya qilish
  // 25% -> 0.8, 90% -> 0.4
  // Orasidagi nuqtalar: 50% -> 0.65, 70% -> 0.5
  const interpolationPoints = [
    { x: 25, y: 0.8 },
    { x: 50, y: 0.65 },
    { x: 70, y: 0.5 },
    { x: 90, y: 0.4 },
  ];

  // agar x aniq nuqta bo'lsa (masalan 25, 50, 70, 90)
  for (const p of interpolationPoints) {
    if (p.x === x) return p.y;
  }

  // topish - qaysi segment orasida
  let left = interpolationPoints[0];
  let right = interpolationPoints[interpolationPoints.length - 1];
  
  for (let i = 0; i < interpolationPoints.length - 1; i++) {
    const a = interpolationPoints[i];
    const b = interpolationPoints[i + 1];
    if (x > a.x && x < b.x) {
      left = a;
      right = b;
      break;
    }
  }

  // chiziqli interpolatsiya
  const t = (x - left.x) / (right.x - left.x);
  const y = left.y + t * (right.y - left.y);
  return y;
}

export default function App() {
  /* --- Form state --- */
  const [form, setForm] = useState({
    obyekt: "",
    complexity: "", // I, II, III, IV
    // O'zgartirish: Sb maydoni default bo'sh bo'lsin, foydalanuvchi qo'lda kiritadi
    SB: "",
    BXM: 412000, // Bazaviy hisoblash miqdori (editable)
    // O'zgartirish: uskuna foizi default 20% ga o'rnatildi
    equipmentPercent: 20, // Uskuna qiymati foizi (%)
  });

  /* 9 ta checkbox holati */
  const [checks, setChecks] = useState(
    COMPLEXITY_FACTORS.reduce((acc, c) => {
      acc[c.id] = false; // demo uchun hammasi default true bo'ldi — siz xohlasangiz false qiling
      return acc;
    }, {})
  );

  // Tab holati: birinchi (kalkulyator) yoki ikkinchisida 'Tez kunda' belgisi
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'calculator';
    try {
      const saved = window.localStorage.getItem('appActiveTab');
      return saved || 'calculator';
    } catch {
      return 'calculator';
    }
  });
  // 'Tez kunda' popupi ko'rinishi uchun holat
  const [showSoon, setShowSoon] = useState(false);
  // Global foydalanish hisoblagichi (hozircha o'chirilgan)
  // const [usageCount, setUsageCount] = useState(0);
  // const [counted, setCounted] = useState(false);

  // Counter vaqtincha o'chirilgan
  // useEffect(() => {
  //   try {
  //     const localTotal = Number(window.localStorage.getItem('calc_usage_total') || '0') || 0;
  //     setUsageCount(localTotal);
  //   } catch {}
  // }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('appActiveTab', activeTab);
      }
    } catch {
      // ignore
    }
  }, [activeTab]);

  /* Input o'zgarishini qabul qilish */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Agar BXM bo'lsa, faqat raqamlar
    if (name === "BXM") {
      // Bo'shliqlar va vergullarni olib tashlash, faqat raqamlar
      const cleanedValue = value.replace(/[^\d]/g, "");
      setForm((s) => ({ ...s, [name]: cleanedValue }));
    } 
    // Agar SB bo'lsa, formatlangan qiymatni tozalash
    else if (name === "SB") {
      const cleanedValue = parseSBValue(value);
      setForm((s) => ({ ...s, [name]: cleanedValue }));
    } 
    else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };
  
  // SB blur paytida ,00 bilan yakuniy formatlash
  const handleSBBlur = (e) => {
    const finalized = finalizeSBForDisplay(form.SB);
    if (finalized !== "") {
      // finalized ko'rinishini state ga ham yozamiz (shu ko'rinishda ko'rinsin)
      setForm((s) => ({ ...s, SB: parseSBValue(finalized) }));
      // Input ko'rinishi formatSBValue orqali qayta chiziladi va ,00 bilan ko'rinadi
    }
  };

  /* Checkbox o'zgarishi */
  const handleCheck = (id) => {
    setChecks((s) => ({ ...s, [id]: !s[id] }));
  };

  /* --- Hisoblash uchun derived qiymatlar (memoized) --- */
  
  /* SB ni BXM da hisoblash - L_percent dan oldin hisoblash kerak */
  const SB_in_BXM = useMemo(() => {
    try {
      // SB ni tozalash - faqat raqamlarni qoldirish
      const SBStr = String(form.SB || "").replace(/[^\d.]/g, "");
      const SB = parseFloat(SBStr) || 0;
      const BXMStr = String(form.BXM || "").replace(/[^\d.]/g, "");
      const BXM = parseFloat(BXMStr) || 412000;
      
      if (SB > 0 && BXM > 0) {
        const result = SB / BXM;
        // NaN yoki Infinity tekshiruvi
        if (isNaN(result) || !isFinite(result)) {
          return 0;
        }
        return result;
      }
      return 0;
    } catch (error) {
      console.error("SB_in_BXM hisoblashda xato:", error);
      return 0;
    }
  }, [form.SB, form.BXM]);

  /* L foizni hisoblash - murakkablik darajasi va loyiha qiymati (BXM da) asosida */
  const L_percent = useMemo(() => {
    try {
      // Murakkablik darajasi va loyiha qiymati (BXM da) asosida foizni hisoblash
      // SB_in_BXM - loyiha qiymati bazaviy hisoblash miqdorida
      if (SB_in_BXM > 0 && form.complexity) {
        const result = getComplexityPercent(form.complexity, SB_in_BXM);
        // NaN yoki Infinity tekshiruvi
        if (isNaN(result) || !isFinite(result) || result < 0) {
          console.warn("L_percent noto'g'ri qiymat:", result);
          return 0;
        }
        return result;
      }
      return 0;
    } catch (error) {
      console.error("L_percent hisoblashda xato:", error);
      return 0;
    }
  }, [form.complexity, SB_in_BXM]);

  const Kc = useMemo(() => {
    // Kc = 1 + sum(k_i - 1) for each checked condition
    // ya'ni sum kasr qismlari + 1
    let sumFractions = 0;
    COMPLEXITY_FACTORS.forEach((f) => {
      if (checks[f.id]) {
        // f.coeff masalan 1.5 -> fraction = 0.5
        const frac = f.coeff - 1;
        sumFractions += frac;
      }
    });
    return 1 + sumFractions;
  }, [checks]);

  const Kp = useMemo(() => {
    return interpKp(form.equipmentPercent);
  }, [form.equipmentPercent]);

  /* Yakuniy hisob (Sw) - avtomatik hisoblanadi */
  const Sw = useMemo(() => {
    const SB = parseFloat(form.SB) || 0;
    if (SB <= 0) return 0;

    // L foizni soniy (masalan 1.4% -> 0.014)
    const L = L_percent / 100;

    // Yakuniy hisob
    return SB * L * Kc * Kp;
  }, [form.SB, L_percent, Kc, Kp]);

  // QQS (VAT) hisoblari
  const Vat = useMemo(() => Sw * 0.12, [Sw]);
  const SwWithVAT = useMemo(() => Sw + Vat, [Sw, Vat]);

  /* Formulani matn ko'rinishida tayyorlash */
  const formulaStr = useMemo(() => {
    const SB = parseFloat(form.SB) || 0;
    if (SB <= 0) {
      return `${fmtSoom(0)} × ${fmt(L_percent)}% × ${fmt(Kc)} × ${fmt(Kp)} = —`;
    }
    return `${fmtSoom(SB)} × ${fmt(L_percent)}% × ${fmt(Kc)} × ${fmt(Kp)} = ${fmtSoom(Sw)}`;
  }, [form.SB, L_percent, Kc, Kp, Sw]);

  // function incrementOnce() {}

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 px-4">
      {/* --- Header: logotip va tab navigatsiya (yuqori qism) --- */}
      <header className="bg-gray-50 shadow-md -mx-4 sm:-mx-6 md:mx-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          {/* Logotip va matn chapda, aloqa havolasi o'ngda */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <div className="font-bold text-2xl text-[#025C5A]">
                Me'morlar va Muhandislar
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Aloqa uchun</span>
                <a
                  href="https://t.me/ZuhriddinYoqubov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#025C5A] text-[#025C5A] hover:bg-[#025C5A] hover:text-white transition"
                  aria-label="Telegram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M9.032 15.634 8.84 19.36c.405 0 .581-.174.792-.382l1.9-1.822 3.94 2.887c.722.398 1.237.189 1.435-.668l2.6-12.184.001-.001c.231-1.08-.39-1.5-1.1-1.237L3.79 9.33c-1.06.412-1.043 1.004-.18 1.272l3.9 1.216 9.06-5.72c.426-.258.815-.115.496.143"/>
                  </svg>
                  <span className="text-sm font-medium">Telegram</span>
                </a>
              </div>
            </div>
          </div>
          {/* Tab navigatsiya: faol tab birinchi, ikkinchisida 'Tez kunda' belgisi, uchinchi tabda Energetik pasport */}
          <div className="mt-4 flex items-center">
            <div className="flex items-center space-x-8">
              {/* 1-tab: Loyiha qiymati kalkulyatori (asosiy kalkulyator sahifasi) */}
              <div
                onClick={() => setActiveTab('calculator')}
                className={`cursor-pointer pb-2 hover:text-[#025C5A] ${activeTab==='calculator' ? 'border-b-2 border-[#025C5A] text-[#025C5A] font-semibold' : 'text-gray-700'}`}
              >
                Loyiha qiymati kalkulyatori
              </div>
              {/* 2-tab: Issiqlik texnik hisob-kitobi (ITH.jsx komponenti) */}
              <div
                onClick={() => setActiveTab('ith')}
                className={`cursor-pointer pb-2 hover:text-[#025C5A] ${activeTab==='ith' ? 'border-b-2 border-[#025C5A] text-[#025C5A] font-semibold' : 'text-gray-700'}`}
              >
                Issiqlik texnik hisob-kitobi
              </div>
              {/* 3-tab: Energetik pasport va issiqlik texnik hisoblar uchun HeatWizard interfeysi */}
              <div
                onClick={() => {
                  setActiveTab('heat');
                  try {
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem('heatWizardActiveIndex', '0');
                    }
                  } catch {
                    // ignore
                  }
                }}
                className={`cursor-pointer pb-2 hover:text-[#025C5A] ${activeTab==='heat' ? 'border-b-2 border-[#025C5A] text-[#025C5A] font-semibold' : 'text-gray-700'}`}
              >
                Energetik pasport
              </div>
            </div>
            {/* <span className="ml-auto text-xs md:text-sm text-gray-500">Foydalanilgan: {usageCount} marta</span> */}
          </div>
        </div>
      </header>

      {/* 1-tab (activeTab === 'calculator') holatida loyiha qiymati kalkulyatori kontentini ko'rsatamiz */}
      {activeTab === 'calculator' && (
      <div className="max-w-6xl mx-auto space-y-6 mt-6">
        
        {/* ============================================
            BIRINCHI BO'LIM: Umumiy ma'lumotlar
            ============================================ */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          {/* Sarlavha - katta, qalin, brand rangida */}
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
            Umumiy ma'lumotlar
          </h1>

          {/* Obekt nomi - ko'p qatorli maydon */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Obekt nomi
            </label>
            <textarea
              name="obyekt"
              value={form.obyekt}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#025C5A] focus:border-transparent transition-all whitespace-pre-wrap break-words resize-y"
              placeholder="Obekt nomini kiriting"
            />
          </div>

          {/* Ikki ustunli grid - murakkablik va BXM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Chap ustun: Murakkablik darajasi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Obektning murakkablik darajasi
              </label>
              <div className="relative">
                <select
                  name="complexity"
                  value={form.complexity}
                  onChange={handleChange}
                  className={`w-full pl-4 pr-10 py-3 rounded-xl border border-[#E5E7EB] bg-gray-50 ${form.complexity ? 'text-gray-900' : 'text-gray-400'} focus:outline-none focus:ring-2 focus:ring-[#025C5A] focus:border-transparent transition-all cursor-pointer hover:border-[#025C5A] appearance-none`}
                >
                  <option value="" disabled>
                    Murakkablik darajasini tanlang
                  </option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* O'ng ustun: Bazaviy hisoblash miqdori */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bazaviy xisoblash miqdori
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="BXM"
                  value={formatWithSpaces(form.BXM)}
                  onChange={handleChange}
                  className="w-full pl-4 pr-16 py-3 rounded-xl border border-[#E5E7EB] bg-gray-50 text-gray-900 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-[#025C5A] focus:border-transparent transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none italic">
                  so'm
                </span>
              </div>
            </div>
          </div>

          {/* Ikki ustunli grid - qurilish qiymatlari */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chap ustun: Qurilish qiymati (so'm) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Obyekt qurilishining joriy narxlardagi qiymati (smeta yoki analog narxi) <span className="text-red-500 font-bold">Sb</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="SB"
                  value={formatSBValue(form.SB)}
                  onChange={handleChange}
                  onBlur={handleSBBlur}
                  className="w-full pl-4 pr-16 py-3 rounded-xl border border-[#E5E7EB] bg-gray-50 text-gray-900 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-[#025C5A] focus:border-transparent transition-all"
                  placeholder="Qiymatni kiriting"
                  inputMode="decimal"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none italic">
                  so'm
                </span>
              </div>
            </div>

            {/* O'ng ustun: Qurilish qiymati (BXM da) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Obyekt qurilishining joriy narxlardagi qiymati (bazaviy hisoblash miqdorida)
              </label>
              <div className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-gray-50 text-gray-900 text-right font-semibold">
                {fmt(SB_in_BXM)} BXM
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            IKKINCHI BO'LIM: Loyiha ishlari qiymati hisoblash mezoni
            ============================================ */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Chap tomon: Sarlavha va tavsif */}
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                Loyiha ishlari qiymatining hisoblash mezoni, murakkablik darajasiga ko'ra qurilish qiymatiga nisbatan foizi, <span className="text-red-500 font-bold">L</span>
              </h2>
              <p className="text-sm text-gray-500 italic">
                interpolyatsiya orqali aniqlandi
              </p>
            </div>
            {/* O'ng tomon: Katta, qalin foiz ko'rsatkichi */}
            <div className="text-3xl md:text-4xl font-bold text-[#025C5A] text-right">
              {/* O'zgartirish: L doimiy ravishda 2 kasr bilan (0,00) formatda ko'rsatiladi */}
              {fmtFixed2(L_percent)}%
            </div>
          </div>
        </div>

        {/* ============================================
            UCHINCHI BO'LIM: Murakkab sharoitlar (checkboxlar)
            ============================================ */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
            Loyiha-tadqiqot hujjatlarini ishlab chiqishdagi murakkab sharoitlar:
          </h2>

          {/* Checkboxlar ro'yxati - vertikal tartibda, har biri alohida qator */}
          <div className="space-y-4">
            {COMPLEXITY_FACTORS.map((f) => (
              <div
                key={f.id}
                className="flex items-start gap-4 py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                {/* Checkbox - o'ng tomonda */}
                <div className="flex-shrink-0 mt-1">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checks[f.id]}
                      onChange={() => handleCheck(f.id)}
                      className="h-5 w-5 rounded border-[#E5E7EB] text-[#025C5A] focus:ring-2 focus:ring-[#025C5A] focus:ring-offset-2 cursor-pointer transition-all hover:border-[#025C5A]"
                    />
                  </label>
                </div>
                {/* Label matni - chap tomonda */}
                <div className="flex-1">
                  <label
                    className="text-sm md:text-base text-gray-700 cursor-pointer select-none"
                    onClick={() => handleCheck(f.id)}
                  >
                    {f.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================
            TO'RTINCHI BO'LIM: Umumiy muvofiqlash koeffitsiyenti (Kc)
            ============================================ */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Chap tomon: Uzun sarlavha */}
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                Loyiha-tadqiqot hujjatlarini ishlab chiqishdagi murakkab sharoitlar uchun qo'llaniladigan umumiy muvofiqlash koeffitsiyenti <span className="text-red-500 font-bold">Kc</span>
              </h2>
              {/* Tavsif matni */}
              <p className="text-sm text-gray-600 leading-relaxed italic">
                Loyiha-tadqiqot qiymatini aniqlashda ikkita yoki undan ortiq murakkablashtiruvchi omil mavjud bo'lsa, koeffitsiyent ularning har biriga alohida qo'llaniladi. Bunda umumiy muvofiqlash koeffitsiyenti quyidagi formula bo'yicha aniqlanadi: <strong>Kc.=1 + ΣΝ</strong>
              </p>
            </div>
            {/* O'ng tomon: Katta, qalin koeffitsiyent qiymati */}
            <div className="text-3xl md:text-4xl font-bold text-[#025C5A] text-right whitespace-nowrap">
              {fmt(Kc)}
            </div>
          </div>
        </div>

        {/* ============================================
            BESHINCHI BO'LIM: Uskuna qiymati solishtirma tarkibi
            ============================================ */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Chap tomon: Sarlavha */}
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                Qurilishning umumiy qiymatida uskuna qiymatining solishtirma tarkibi
              </h2>
            </div>
            {/* O'ng tomon: Input maydoni - foiz kiritish uchun */}
            <div className="flex items-center gap-4">
              {/* O'zgartirish: qiymat va brauzerning up/down tugmalari orasida aniq 12px bo'shliq uchun pr-10 (40px) o'rniga pr-[52px] (40+12px) berildi */}
              <input
                type="number"
                name="equipmentPercent"
                value={form.equipmentPercent}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-28 pl-4 pr-[52px] py-3 rounded-xl border border-[#E5E7EB] bg-gray-50 text-gray-900 text-right font-bold text-xl focus:outline-none focus:ring-2 focus:ring-[#025C5A] focus:border-transparent transition-all"
              />
              <span className="text-lg font-semibold text-gray-700">%</span>
            </div>
          </div>
        </div>

        {/* ============================================
            OLTIINCHI BO'LIM: Pasaytiruvchi koeffitsiyent (Kp)
            ============================================ */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Chap tomon: Sarlavha va tavsif */}
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                Qurilishning umumiy qiymatida uskuna qiymatining solishtirma tarkibiga bog'liq holda qurilishning hisob bahosini aniqlash uchun pasaytiruvchi koeffitsiyent <span className="text-red-500 font-bold">Kp</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1 italic">
                interpolyatsiya orqali aniqlandi
              </p>
            </div>
            {/* O'ng tomon: Katta, qalin koeffitsiyent qiymati */}
            <div className="text-3xl md:text-4xl font-bold text-[#025C5A] text-right whitespace-nowrap">
              {fmt(Kp)}
            </div>
          </div>
        </div>

        {/* ============================================
            YETTINCHI BO'LIM: Yakuniy hisob (Sw)
            ============================================ */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            Loyiha ishlab chiqilishining to'liq qiymati:
          </h2>

          {/* Formula ko'rinishi */}
          <div className="bg-gray-50 rounded-xl border border-[#E5E7EB] p-4 md:p-6 mb-4">
            <div className="text-sm md:text-base text-gray-700 mb-3">
              Sw = Sb × L × Kc × Kp = {formulaStr}
            </div>
            {/* Yakuniy natija - katta, qalin, accent rangida */}
            {Sw > 0 && (
              <>
                <div className="text-sm md:text-base text-gray-700 mb-2">
                  QQS summasi = Sw × 0,12 = {fmtSoom(Vat)} so'm
                </div>
                <div className="text-sm md:text-base text-gray-700 mb-2">
                  QQS bilan = Sw + QQS = {fmtSoom(SwWithVAT)} so'm
                </div>
                <div className="text-2xl md:text-3xl font-bold text-[#E59B23] mt-2">
                  {fmtSoom(SwWithVAT)} so'm
                </div>
              </>
            )}
          </div>

          {/* Qo'shimcha ma'lumot */}
          {/* O'zgartirish: quyidagi uzun izoh bo'limlari har bir nuqta (;) bo'yicha alohida paragrafga ajratildi */}
          <div className="text-xs text-gray-500 italic space-y-1">
            <p> Ishchi loyihani ishlab chiqish qiymatini hisoblashda quyidagi ishlar hisobga olinmagan: </p>
            <p> konstruksiyalar va ishlarni bajarishning oʻta murakkab usullari qoʻllaniladigan obyektlarni loyihalash vaqtida maxsus yordamchi inshootlar, moslamalar, qurilma va uskunalarning ishchi chizmalarini ishlab chiqish (bu ishlar loyihalashtirish topshirigʻida aks ettirilgan boʻlishi zarur); </p>
            <p> zavodda ishlab chiqariladigan metall konstruksiyalar va texnologik quvur oʻtkazgichlarning mufassal chizmalarini, andozasiz va nostandart jihozlarni konstruktorlik hujjatlarini ishlab chiqish (shu jihozlarni konstruksiyalashga boʻlgan loyihalash topshiriqlari bundan mustasno); </p>
            <p> buyurtmachi topshirigʻiga binoan qoʻshimcha ishlarni bajarish; </p>
            <p> texnik koʻrik va oʻlchov ishlarini bajarish. </p>
          </div>
        </div>

      </div>
      )}

      {/* 2-tab (activeTab === 'ith') holatida issiqlik texnik hisob komponenti (ITH.jsx) ni ko'rsatamiz */}
      {activeTab === 'ith' && (
        <div className="mt-6">
          {/* ITH.jsx o'zi ichida to'liq layout va hisoblash mantiqiga ega */}
          <IssiqlikTexnikHisob />
        </div>
      )}

      {/* 3-tab (activeTab === 'heat') holatida issiqlik texnik hisob va energetik pasport uchun HeatWizard ni ko'rsatamiz */}
      {activeTab === 'heat' && (
        <div className="max-w-6xl mx-auto mt-6">
          {/* HeatWizard o'zi ichida bosqichli interfeysga ega, shu sababli bu yerda alohida layout kerak emas */}
          <HeatWizard />
        </div>
      )}
    </div>
  );
}
