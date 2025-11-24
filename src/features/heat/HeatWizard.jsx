import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { REGIONS } from "./data/regions";
import { ProtectionLevelNoteText } from "./heatSharedTexts";
import { CustomSelect, CustomRegionSelect } from "./controls/HeatSelects";
import { AirLayerControls, ConstructionIndicatorsSkeleton } from "./controls/ConstructionBlocks";
import { WizardPrimaryButton, WizardSecondaryButton } from "./controls/WizardButtons";
import { MaterialTreeModal } from "./controls/MaterialTreeModal";
import { CONSTRUCTION_TYPES } from "./data/constructionTypes";
import {
  computeDeltaTt,
  mapConstructionTypeToId,
  getNByConstructionId,
  getRoPrFromTables,
} from "./data/heatCalculations";

// Bosqichli "Heat Wizard" – issiqlik texnik hisobni bosqichma-bosqich kiritish uchun yangi interfeys.
// Mavjud "IssiqlikTexnikHisob" sahifasidagi hisoblash mantiqini soddalashtirilgan, user-friendly shaklda ko'rsatadi.

// STEPS – mantiqiy bosqichlar ro'yxati (ID, sarlavha va izohlar).
const STEPS = [
  {
    id: "initial",
    title: "Dastlabki ma'lumotlar",
    description:
      "Obekt, hudud, issiqlik himoyasi darajasi va boshqa boshlang'ich parametrlarni kiriting.",
  },
  {
    id: "heat_calc_1",
    title: "Issiqlik texnik hisob-kitobi",
    description: "",
  },
  {
    id: "normative_q",
    title: "Isitishga me'yoriy solishtirma issiqlik sarfi",
    description:
      "Obekt uchun isitishga me'yoriy solishtirma issiqlik sarfini aniqlash.",
  },
];

// StepBadge – stepper ichidagi dumaloq raqamli indikator (1, 2, 3, ...).
// isActive – hozirgi bosqich, isCompleted – mantiqan to'liq bajarilgan bosqich.
// hasError – ushbu bosqich uchun majburiy shartlar bajarilmagan (asosan issiqlik steplari uchun qizil nuqta).
function StepBadge({ label, isActive, isCompleted, hasError }) {
  const baseClasses =
    "relative flex items-center justify-center w-12 h-12 rounded-full border text-base font-semibold transition-colors";
  const activeClasses = "border-[#1080c2] text-[#1080c2] bg-white";
  const completedClasses = "border-[#1080c2] text-[#1080c2] bg-white";
  const idleClasses = "border-gray-300 text-gray-400 bg-white";

  let cls = idleClasses;
  if (isCompleted) cls = completedClasses;
  if (isActive) cls = activeClasses;

  return (
    <div className={`${baseClasses} ${cls}`}>
      {label}
      {/* Bajarilgan bosqich uchun janubi-sharqda yashil "✓" belgisi */}
      {isCompleted && !isActive && !hasError && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
          ✓
        </span>
      )}
      {/* Xato holat (asosan issiqlik steplari) uchun qizil nuqta */}
      {hasError && !isActive && (
        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
      )}
    </div>
  );
}

// HeatWizard – barcha stepper, formalar va modallarni birlashtiruvchi asosiy komponent.
export default function HeatWizard() {
  const [activeIndex, setActiveIndex] = useState(0); // hozirgi displayStep indeksi
  const [heatCalcRunIndex, setHeatCalcRunIndex] = useState(0); // Issiqlik texnik hisob (2.n) tartib raqami

  // Issiqlik texnik hisoblari uchun dinamik 2.n steplar (boshlang'ichda bo'sh, birinchi modal tanlovida 2-step sifatida qo'shiladi)
  const [heatSteps, setHeatSteps] = useState([]);

  // UI da ko'rsatiladigan barcha steplar:
  // - Agar hali birorta issiqlik hisobi tanlanmagan bo'lsa: 1, 2 (placeholder), 3
  // - Agar faqat bitta issiqlik hisobi bo'lsa: 1, 2, 3
  // - Agar bir nechta bo'lsa: 1, 2.1, 2.2, ..., 3
  const displaySteps = useMemo(() => {
    if (heatSteps.length === 0) {
      return [
        { kind: "logical", id: "initial", label: "1" },
        { kind: "logical", id: "heat_placeholder", label: "2" },
        { kind: "logical", id: "normative_q", label: "3" },
      ];
    }

    if (heatSteps.length === 1) {
      // Faqat bitta issiqlik stepi bo'lsa, u umumiy 2-step sifatida ko'rinadi
      return [
        { kind: "logical", id: "initial", label: "1" },
        { ...heatSteps[0], label: "2" },
        { kind: "logical", id: "normative_q", label: "3" },
      ];
    }

    // Ikki va undan ko'p issiqlik steplari bo'lsa, 2.1, 2.2, ... sifatida nomlanadi
    return [
      { kind: "logical", id: "initial", label: "1" },
      ...heatSteps.map((step, idx) => ({
        ...step,
        label: `2.${idx + 1}`,
      })),
      { kind: "logical", id: "normative_q", label: "3" },
    ];
  }, [heatSteps]);

  // 1-bosqich: Dastlabki ma'lumotlar (obekt nomi, turi, hudud va h.k.) uchun lokal state
  const [initial, setInitial] = useState({
    objectName: "",
    province: "",
    region: "",
    objectType: "",
    protectionLevel: "",
    preparedBy: "",
  });

  // 1-bosqich uchun validatsiya xatoliklari
  const [initialErrors, setInitialErrors] = useState({
    objectName: false,
    province: false,
    region: false,
    objectType: false,
    protectionLevel: false,
    preparedBy: false,
    t_in: false,
    phi_in: false,
  });

  // Hudud labelini REGIONS dan viloyat va aholi punkt nomi bilan hosil qilish
  const hududLabel = useMemo(() => {
    if (!initial.province || !initial.region) return "—";
    const prov = (REGIONS || []).find((p) => p?.viloyat === initial.province);
    const list = prov?.hududlar || [];
    const idx = Number(initial.region);
    const district = Number.isFinite(idx) ? list[idx] : null;
    if (district && district.hudud) {
      return `${initial.province} — ${district.hudud}`;
    }
    return initial.province;
  }, [initial.province, initial.region]);

  // Ichki/tashqi iqlim parametrlarini saqlash (t_i, φ_i, t_t)
  const [climate, setClimate] = useState({
    t_in: 20,
    phi_in: 55,
    t_out: -7,
  });

  const [layers, setLayers] = useState([
    { id: 1, name: "Qurilish materiali", thickness_mm: "", rho: "", lambda: "", mu: 10 },
  ]);

  const [materialModal, setMaterialModal] = useState({ open: false, layerId: null });
  const [draggingLayerId, setDraggingLayerId] = useState(null);

  const [airLayer, setAirLayer] = useState({
    enabled: false,
    thickness_mm: "",
    layerTemp: "positive",
    foilBothSides: false,
  });

  // 3-bosqich: konstruksiya turi va qovurg'a balandligi nisbati uchun state
  const [constructionType, setConstructionType] = useState("");
  const [ribHeightRatio, setRibHeightRatio] = useState("");
  const [showRibInfo, setShowRibInfo] = useState(false); // h/a eslatma modali

  // Qatlamlar bo'yicha termik qarshilik: R_layers = Σ (d/λ)
  const R_layers = useMemo(() => {
    return layers.reduce((sum, L) => {
      const d_m = (Number(L.thickness_mm) || 0) / 1000;
      const lam = Number(L.lambda) || 0;
      if (d_m > 0 && lam > 0) return sum + d_m / lam;
      return sum;
    }, 0);
  }, [layers]);

  // Berk havo qatlami uchun termik qarshilik jadvali (ITH dagi AIR_LAYER_R_TABLE asosida)
  const AIR_LAYER_R_TABLE = {
    positive: {
      vertical_or_up: {
        "10": 0.13,
        "20": 0.14,
        "30": 0.14,
        "50": 0.14,
        "100": 0.15,
        "150": 0.15,
        "200_300": 0.15,
      },
      horizontal_up: {
        "10": 0.13,
        "20": 0.14,
        "30": 0.14,
        "50": 0.14,
        "100": 0.15,
        "150": 0.15,
        "200_300": 0.15,
      },
      horizontal_down: {
        "10": 0.14,
        "20": 0.15,
        "30": 0.16,
        "50": 0.17,
        "100": 0.18,
        "150": 0.19,
        "200_300": 0.19,
      },
    },
    negative: {
      vertical_or_up: {
        "10": 0.15,
        "20": 0.15,
        "30": 0.16,
        "50": 0.17,
        "100": 0.18,
        "150": 0.18,
        "200_300": 0.19,
      },
      horizontal_up: {
        "10": 0.15,
        "20": 0.15,
        "30": 0.16,
        "50": 0.17,
        "100": 0.18,
        "150": 0.18,
        "200_300": 0.19,
      },
      horizontal_down: {
        "10": 0.15,
        "20": 0.19,
        "30": 0.21,
        "50": 0.21,
        "100": 0.23,
        "150": 0.24,
        "200_300": 0.24,
      },
    },
  };

  const getAirLayerFlowCategory = (constructionType) => {
    const id = mapConstructionTypeToId(constructionType);
    if (!id) return null;
    if (id === "1" || id === "2") return "vertical_or_up";
    if (id === "3" || id === "4") return "horizontal_up";
    if (id === "5" || id === "6" || id === "7" || id === "8" || id === "9") return "horizontal_down";
    return null;
  };

  const Rhq = useMemo(() => {
    if (!airLayer.enabled) return 0;

    const thicknessKey = airLayer.thickness_mm || null;
    if (!thicknessKey) return 0;

    const tempKey = airLayer.layerTemp === "negative" ? "negative" : "positive";
    const flowCategory = getAirLayerFlowCategory(constructionType);
    if (!flowCategory) return 0;

    const byTemp = AIR_LAYER_R_TABLE[tempKey] || {};
    const byFlow = byTemp[flowCategory] || {};
    const base = byFlow[thicknessKey];

    let value = typeof base === "number" ? base : 0;

    if (airLayer.foilBothSides && value > 0) {
      value = value * 2;
    }

    return value;
  }, [airLayer, constructionType]);

  const Rk = useMemo(() => {
    return R_layers + (Rhq || 0);
  }, [R_layers, Rhq]);

  const [showProtectionInfo, setShowProtectionInfo] = useState(false); // issiqlik himoyasi eslatma modali

  // Foydalanuvchi issiqlik texnik hisob bosqichlaridan (heat_calc_1 yoki heat_calc_n) biriga kamida bir marta kirganmi
  const [hasHeatCalcVisited, setHasHeatCalcVisited] = useState(false);

  // Foydalanuvchi kamida bir marta dastlabki bosqichdan keyingi bosqich(lar)ga o'tganligini belgilash uchun flag
  const [hasLeftInitialOnce, setHasLeftInitialOnce] = useState(false);

  // 2-bosqichga o'tishda tanlov oynasini ko'rsatish uchun flag
  const [showNextStepChoice, setShowNextStepChoice] = useState(false);

  const moveLayer = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setLayers((prev) => {
      const sourceIndex = prev.findIndex((l) => l.id === sourceId);
      const targetIndex = prev.findIndex((l) => l.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const updateLayer = (id, key, value) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: value === "" ? "" : Number(value) } : l)));
  };

  const addLayer = () => {
    const newId = Date.now();
    setLayers((prev) => [
      ...prev,
      { id: newId, name: "Yangi qatlam", thickness_mm: "", rho: "", lambda: "", mu: 20 },
    ]);
    setMaterialModal({ open: true, layerId: newId });
  };

  const removeLayer = (id) => setLayers((prev) => prev.filter((l) => l.id !== id));

  const pickLambdaForVariant = (variant) => {
    if (!variant) return undefined;
    const t = Number(climate.t_in);
    const h = Number(climate.phi_in);
    const useA = !(t >= 25 && h >= 60);
    return useA ? (variant.lambda?.A ?? variant.lambda_0) : (variant.lambda?.B ?? variant.lambda_0);
  };

  // Iqlimiy inputlar o'zgarganda climate obyektini yangilash helperi
  const handleClimate = (e) => {
    const { name, value } = e.target;
    setClimate((s) => ({ ...s, [name]: Number(value) }));
  };

  // activeIndex ga qarab hozirgi displayStep va mantiqiy bosqich ID / ma'lumotlarini olamiz
  const currentDisplayStep = displaySteps[activeIndex] || displaySteps[0];
  const isHeatLikeStep = currentDisplayStep?.kind === "heat" || currentDisplayStep?.id === "heat_placeholder";
  const currentStepId = isHeatLikeStep ? "heat_calc_1" : currentDisplayStep?.id || "initial";
  
  // Get the base step meta
  const baseStepMeta = STEPS.find((s) => s.id === currentStepId) || STEPS[0];
  
  // If it's a heat calculation step, show the construction type in the title
  const currentStepMeta = useMemo(() => {
    const meta = { ...baseStepMeta };
    
    if (currentStepId === "heat_calc_1") {
      // For heat calculation steps, get the construction type from the current step
      const currentConstructionType = currentDisplayStep?.presetConstructionType || constructionType;
      if (currentConstructionType) {
        const type = CONSTRUCTION_TYPES.find(ct => ct.value === currentConstructionType);
        if (type) {
          meta.title = type.label;
        }
      }
    }
    
    return meta;
  }, [baseStepMeta, currentStepId, currentDisplayStep, constructionType]);

  // Step o'zgarganda sahifani yuqoriga scroll qilish
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeIndex]);

  // Agar foydalanuvchi konstruksiya bo'yicha issiqlik texnik hisob bosqichiga kirgan bo'lsa, flagni eslab qolamiz
  useEffect(() => {
    if (currentStepId === "heat_calc_1" || currentStepId === "heat_calc_n") {
      setHasHeatCalcVisited(true);
    }
  }, [currentStepId]);

  // Foydalanuvchi dastlabki bosqichdan keyingi bosqich(lar)ga o'tganligini eslab qolamiz
  useEffect(() => {
    if (activeIndex > 0 && !hasLeftInitialOnce) {
      setHasLeftInitialOnce(true);
    }
  }, [activeIndex, hasLeftInitialOnce]);

  // Issiqlik davri uchun yordamchi qiymatlar (t_is.dav, Z_is.dav, D_is.dav) ni hisoblash.
  // REGIONS jadvalidagi 8 va 12-soatlik ma'lumotlar asosida o'rtacha qiymatlar olinadi.
  const heatingSeason = useMemo(() => {
    if (!initial.province || initial.region === "" || initial.region == null) {
      return { t_is_dav: null, Z_is_dav: null, D_is_dav: null };
    }

    const prov = (REGIONS || []).find((p) => p?.viloyat === initial.province);
    const idx = Number(initial.region);
    const hudud = prov?.hududlar?.[idx];
    const t8 = hudud?.havo_sutka_ortacha_c?.t_8;
    const t12 = hudud?.havo_sutka_ortacha_c?.t_12;

    if (!t8 || !t12) {
      return { t_is_dav: null, Z_is_dav: null, D_is_dav: null };
    }

    const t_is_dav = ((Number(t8.ortacha_harorat) || 0) + (Number(t12.ortacha_harorat) || 0)) / 2;
    const Z_is_dav = ((Number(t8.davom_etish_sutka) || 0) + (Number(t12.davom_etish_sutka) || 0)) / 2;
    const D_is_dav = (Number(climate.t_in) - t_is_dav) * Z_is_dav;

    return { t_is_dav, Z_is_dav, D_is_dav };
  }, [initial.province, initial.region, climate.t_in]);

  const deltaTtResult = useMemo(
    () =>
      computeDeltaTt({
        objectType: initial.objectType,
        constructionType,
        t_in: climate.t_in,
        phi_in: climate.phi_in,
      }),
    [initial.objectType, constructionType, climate.t_in, climate.phi_in]
  );

  // To'suvchi konstruksiyalarning ichki yuzasining issiqlik berish koeffitsienti, αi (ITH dagi 5-jadval mantiqi bo'yicha)
  const alphaI = useMemo(() => {
    if (!constructionType) return null;
    if (constructionType === "tashqi_devor" || constructionType === "tashqi_devor_ventfasad") return 8.7;
    if (!ribHeightRatio) return null;
    if (ribHeightRatio === "low") return 8.7;
    if (ribHeightRatio === "high") return 7.6;
    return null;
  }, [constructionType, ribHeightRatio]);

  // To'suvchi konstruksiyalarning tashqi yuzasining issiqlik berish koeffitsienti, αt (ITH dagi 6-jadval mantiqi bo'yicha)
  const alphaT = useMemo(() => {
    const id = mapConstructionTypeToId(constructionType);
    if (!id) return null;

    if (id === "1" || id === "2" || id === "4") return 23;
    if (id === "5") return 17;
    if (id === "3" || id === "6" || id === "9") return 12;
    if (id === "7" || id === "8") return 6;
    return null;
  }, [constructionType]);

  const Ro_calc = useMemo(() => {
    if (
      Rk == null ||
      !Number.isFinite(Rk) ||
      Rk <= 0 ||
      alphaI == null ||
      alphaT == null ||
      !Number.isFinite(alphaI) ||
      !Number.isFinite(alphaT) ||
      alphaI === 0 ||
      alphaT === 0
    ) {
      return null;
    }

    return 1 / alphaI + Rk + 1 / alphaT;
  }, [Rk, alphaI, alphaT]);

  // ==== Ro^pr va RₒTal.SG / RₒTal. hisoblash (ITH dagi mantiqqa asoslangan) ====
  const RoResult = useMemo(() => {
    const constructionTypeId = mapConstructionTypeToId(constructionType);
    const RoPr = getRoPrFromTables({
      protectionLevel: initial.protectionLevel,
      objectType: initial.objectType,
      floors: initial.floors,
      D_is_dav: heatingSeason.D_is_dav,
      constructionTypeId,
    });
    const n = getNByConstructionId(constructionTypeId);

    if (RoPr == null || n == null) {
      return { Ro: null, RoPr: RoPr ?? null, n: n ?? null };
    }

    return {
      RoPr,
      n,
      Ro: RoPr * n,
    };
  }, [initial.protectionLevel, initial.objectType, initial.floors, heatingSeason.D_is_dav, constructionType]);

  const RoTalSG = useMemo(() => {
    // RoTal.SG uchun tᵢ, tₜ, Δtₜ, αᵢ ni eshik/darvoza bo'lsa ham devor bo'yicha olish
    const constructionTypeForRoTal = constructionType === "eshik_darvoza" ? "tashqi_devor" : constructionType;

    const constructionTypeId = mapConstructionTypeToId(constructionTypeForRoTal);
    const n = getNByConstructionId(constructionTypeId);

    const deltaTtForRoTal =
      constructionType === "eshik_darvoza"
        ? computeDeltaTt({
          objectType: initial.objectType,
          constructionType: "tashqi_devor",
          t_in: climate.t_in,
          phi_in: climate.phi_in,
        })?.delta_tt
        : deltaTtResult?.delta_tt;

    const alphaForRoTal = constructionType === "eshik_darvoza" ? 8.7 : alphaI;

    const ti = climate.t_in;
    const tt = climate.t_out;

    if (
      n == null ||
      deltaTtForRoTal == null ||
      !alphaForRoTal ||
      ti == null ||
      tt == null ||
      !Number.isFinite(ti) ||
      !Number.isFinite(tt) ||
      !Number.isFinite(deltaTtForRoTal) ||
      !Number.isFinite(alphaForRoTal) ||
      deltaTtForRoTal === 0 ||
      alphaForRoTal === 0
    ) {
      return null;
    }

    const numerator = n * (ti - tt);
    const denominator = deltaTtForRoTal * alphaForRoTal;
    if (!Number.isFinite(denominator) || denominator === 0) return null;

    return numerator / denominator;
  }, [constructionType, deltaTtResult, alphaI, climate.t_in, climate.t_out, initial.objectType, climate.phi_in]);

  // Eshik (balkonlarnikidan tashqari) va darvozalarning talab etilgan issiqlik uzatilishiga qarshiligi, RₒTal.e.d
  const RoTalED = useMemo(() => {
    return typeof RoTalSG === "number" && Number.isFinite(RoTalSG) ? 0.6 * RoTalSG : null;
  }, [RoTalSG]);

  const RoTalab = useMemo(() => {
    const a = typeof RoTalSG === "number" && Number.isFinite(RoTalSG) ? RoTalSG : null;
    const b = RoResult && typeof RoResult.Ro === "number" && Number.isFinite(RoResult.Ro)
      ? RoResult.Ro
      : null;

    if (a == null && b == null) return null;
    if (a == null) return b;
    if (b == null) return a;
    return Math.max(a, b);
  }, [RoTalSG, RoResult]);

  // Stepning mantiqiy "bajarilgan" holatini aniqlash (stepper uchun status).
  const isStepLogicallyCompleted = (step) => {
    if (!step) return false;

    const stepId = step.kind === "heat" || step.id === "heat_placeholder" ? "heat_calc_1" : step.id;

    if (stepId === "initial") {
      // 1-bosqichdagi barcha majburiy maydonlar to'ldirilganmi
      if (!initial.objectName || !initial.objectName.trim()) return false;
      if (!initial.objectType) return false;
      if (!initial.province) return false;
      if (initial.region === "" || initial.region == null) return false;
      if (!initial.protectionLevel) return false;
      if (!initial.preparedBy || !initial.preparedBy.trim()) return false;
      if (climate.t_in == null || climate.t_in === "") return false;
      if (climate.phi_in == null || climate.phi_in === "") return false;
      return true;
    }

    if (stepId === "heat_calc_1") {
      // Hozircha issiqlik bosqichi uchun asosiy shart – konstruksiya turi tanlangan bo'lishi
      const stepConstructionType = step.presetConstructionType || constructionType;
      return !!stepConstructionType;
    }

    if (stepId === "normative_q") {
      // Me'yoriy issiqlik sarfi bosqichi – hozircha issiqlik hisobiga kirilgan bo'lsa yetarli
      return !!hasHeatCalcVisited;
    }

    return false;
  };

  // Keyingi bosqichga o'tish handleri.
  // 1-bosqichda majburiy maydonlar to'ldirilganini tekshiradi, boshqa bosqichlarda esa navbatdagi stepga o'tadi.
  const goNext = () => {
    // 1-bosqich (Dastlabki ma'lumotlar) uchun oddiy validatsiya
    if (currentStepId === "initial") {
      const missing = [];
      const nextErrors = {
        objectName: false,
        province: false,
        region: false,
        objectType: false,
        protectionLevel: false,
        preparedBy: false,
        t_in: false,
        phi_in: false,
      };
      if (!initial.objectName || !initial.objectName.trim()) missing.push("Obekt nomi");
      if (!initial.objectType) missing.push("Obekt turi");
      if (!initial.province) missing.push("Hudud (viloyat)");
      if (initial.region === "" || initial.region == null) missing.push("Hudud (tuman/shahar)");
      if (!initial.protectionLevel) missing.push("Issiqlik himoyasi darajasi");
      if (!initial.preparedBy || !initial.preparedBy.trim()) missing.push("Ishlab chiqdi");
      if (climate.t_in == null || climate.t_in === "") missing.push("Ichki harorat ti");
      if (climate.phi_in == null || climate.phi_in === "") missing.push("Nisbiy namlik i");

      if (missing.length > 0) {
        // Xato bo'lgan fieldlar uchun flaglarni yoqamiz
        if (!initial.objectName || !initial.objectName.trim()) nextErrors.objectName = true;
        if (!initial.objectType) nextErrors.objectType = true;
        if (!initial.province) nextErrors.province = true;
        if (initial.region === "" || initial.region == null) nextErrors.region = true;
        if (!initial.protectionLevel) nextErrors.protectionLevel = true;
        if (!initial.preparedBy || !initial.preparedBy.trim()) nextErrors.preparedBy = true;
        if (climate.t_in == null || climate.t_in === "") nextErrors.t_in = true;
        if (climate.phi_in == null || climate.phi_in === "") nextErrors.phi_in = true;
        setInitialErrors(nextErrors);

        const msg = "Quyidagi maydonlarni to'ldiring:\n- " + missing.join("\n- ");
        window.alert(msg);
        return;
      }

      // Hammasi to'g'ri bo'lsa, xatolik flaglarini tozalaymiz
      setInitialErrors({
        objectName: false,
        province: false,
        region: false,
        objectType: false,
        protectionLevel: false,
        preparedBy: false,
        t_in: false,
        phi_in: false,
      });

      // Agar foydalanuvchi hali biror marta ham dastlabki bosqichdan keyingi bosqichga o'tmagan bo'lsa,
      // birinchi marta "Keyingi bosqich" bosilganda modul tanlash oynasini ko'rsatamiz.
      if (!hasLeftInitialOnce) {
        setShowNextStepChoice(true);
        return;
      }
      // Aks holda (foydalanuvchi allaqachon keyingi bosqichlarga o'tib qaytgan bo'lsa),
      // oddiy navbatdagi displayStepga o'tkazamiz.
      setActiveIndex((i) => (i < displaySteps.length - 1 ? i + 1 : i));
      return;
    }

    // Agar hozirgi bosqich issiqlik texnik hisobi bo'lsa (2-step / 2.n), keyingi modulni tanlash uchun modalni ochamiz,
    // lekin avtomatik tarzda 3-bosqichga (normativ q) o'tmaymiz.
    if (currentStepId === "heat_calc_1") {
      setShowNextStepChoice(true);
      return;
    }

    // Agar keyingi bosqich mavjud bo'lsa (masalan, 1-bosqichdan 2-bosqichga yoki 3-bosqichdan keyingi modulga), to'g'ridan-to'g'ri o'sha bosqichga o'tamiz
    setActiveIndex((i) => {
      const isLast = i >= displaySteps.length - 1;
      const nextIndex = isLast ? i : i + 1;

      if (isLast) {
        // Oxirgi bosqichda esa foydalanuvchidan keyingi modul haqida tanlov so'rash uchun modal ochamiz
        setShowNextStepChoice(true);
      }

      return nextIndex;
    });
  };

  // Oldingi bosqichga qaytish handleri
  const goPrev = () => {
    setActiveIndex((i) => (i > 0 ? i - 1 : i));
  };

  // Stepperdagi bosqich tugmalarini bosganda ishlaydigan handler
  // Eslatma: foydalanuvchi 1-bosqichni to'ldirmasdan turib keyingi steplarga o'ta olmaydi
  // va issiqlik texnik hisob (heat_calc_1 / heat_calc_n) bosqichlariga kirmasdan turib
  // me'yoriy solishtirma issiqlik sarfi (normative_q) bosqichiga bevosita o'ta olmaydi
  const handleStepClick = (idx, step) => {
    // Agar maqsad step joriy activeIndex dan keyin bo'lsa, undan oldingi steplar to'liqmi – tekshiramiz
    if (idx > activeIndex) {
      for (let i = 0; i < idx; i += 1) {
        const prev = displaySteps[i];
        const prevId = prev.kind === "heat" || prev.id === "heat_placeholder" ? "heat_calc_1" : prev.id;

        if (prevId === "initial") {
          const missing = [];
          if (!initial.objectName || !initial.objectName.trim()) missing.push("Obekt nomi");
          if (!initial.objectType) missing.push("Obekt turi");
          if (!initial.province) missing.push("Hudud (viloyat)");
          if (initial.region === "" || initial.region == null) missing.push("Hudud (tuman/shahar)");
          if (!initial.protectionLevel) missing.push("Issiqlik himoyasi darajasi");
          if (!initial.preparedBy || !initial.preparedBy.trim()) missing.push("Ishlab chiqdi");
          if (climate.t_in == null || climate.t_in === "") missing.push("Ichki harorat t_i");
          if (climate.phi_in == null || climate.phi_in === "") missing.push("Nisbiy namlik φ_i");

          if (missing.length > 0) {
            const msg = "Iltimos, avval birinchi bosqichni to'ldiring:\n- " + missing.join("\n- ");
            window.alert(msg);
            return;
          }
        }
      }
    }

    if (step.id === "normative_q" && !hasHeatCalcVisited) {
      window.alert(
        "Avval to'suvchi konstruksiyalar bo'yicha issiqlik texnik hisob-kitoblarini kamida bir marta bajaring",
      );
      return;
    }

    setActiveIndex(idx);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stepper – sahifa yuqori qismida, oddiy strip ko'rinishida barcha bosqichlarni ko'rsatadi */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {displaySteps.map((ds, idx) => {
              const isActive = idx === activeIndex;
              const isHeatCalc = ds.kind === "heat" || ds.id === "heat_placeholder";
              const stepMeta = STEPS.find((s) => s.id === (isHeatCalc ? "heat_calc_1" : ds.id)) || STEPS[0];

              const logicallyCompleted = isStepLogicallyCompleted(ds);
              const isCompleted = logicallyCompleted;
              const hasError = isHeatCalc && !logicallyCompleted;

              // Issiqlik steplarini o'chirish uchun handler (faqat haqiqiy heatSteps elementlari uchun)
              const canDeleteHeatStep = isHeatCalc && ds.kind === "heat" && heatSteps.length > 1;

              const handleDeleteHeatStep = (e) => {
                e.stopPropagation();
                if (!canDeleteHeatStep) return;
                setHeatSteps((prev) => prev.filter((h) => h.id !== ds.id));

                // Agar o'chirilayotgan step aktiv bo'lsa, yaqinidagi stepga o'tkazamiz
                if (isActive) {
                  const nextIndex = idx > 0 ? idx - 1 : 0;
                  setActiveIndex(nextIndex);
                }
              };

              return (
                <div key={ds.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStepClick(idx, ds)}
                    className={`flex items-center gap-2 text-sm md:text-base transition-colors ${
                      isActive
                        ? "text-[#1080c2]"
                        : logicallyCompleted
                          ? "text-gray-700 hover:text-[#1080c2]"
                          : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <div className="relative">
                      <StepBadge
                        label={ds.label}
                        isActive={isActive}
                        isCompleted={isCompleted}
                        hasError={hasError}
                      />
                      {canDeleteHeatStep && (
                        <button
                          type="button"
                          onClick={handleDeleteHeatStep}
                          className="absolute -top-1 -right-1 flex items-center justify-center w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm"
                          aria-label="Issiqlik bosqichini o'chirish"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-2 h-2"
                            aria-hidden="true"
                          >
                            <path
                              d="M6 6l12 12M18 6L6 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {isActive && (
                      <span className="text-left max-w-xs line-clamp-2 hidden sm:inline">
                        {stepMeta.title}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sarlavha va stepper boshqaruv tugmalari (Orqaga / Keyingi bosqich) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
            <div>
              <div className="text-lg md:text-xl font-semibold text-[#1080c2]">
                {currentStepMeta.title}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <WizardSecondaryButton onClick={goPrev} disabled={activeIndex === 0}>
                Orqaga
              </WizardSecondaryButton>
              <WizardPrimaryButton onClick={goNext} disabled={activeIndex === displaySteps.length - 1}>
                Keyingi bosqich
              </WizardPrimaryButton>
            </div>
          </div>
        </div>

        {/* Quyida har bir bosqichning asosiy kontent bloki joylashgan (kartochka ko'rinishidagi blok). */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          {currentStepId === "initial" && (
            <div className="space-y-6">
              {/* 0) Obekt nomi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Obekt nomi</label>
                <textarea
                  value={initial.objectName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInitial((s) => ({ ...s, objectName: val }));
                    if (val && val.trim()) {
                      setInitialErrors((err) => ({ ...err, objectName: false }));
                    }
                  }}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] resize-y ${
                    initialErrors.objectName ? "border-red-400" : "border-[#E5E7EB]"
                  }`}
                  placeholder="Obekt nomini kiriting"
                />
              </div>

              {/* 1) Obekt turi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Obekt turi</label>
                <CustomSelect
                  value={initial.objectType}
                  onChange={(val) => {
                    setInitial((s) => ({ ...s, objectType: val }));
                    setInitialErrors((err) => ({ ...err, objectType: false }));
                  }}
                  error={initialErrors.objectType}
                  placeholder="Tanlang"
                  options={[
                    {
                      value: "1",
                      label:
                        "Turar joy, davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar (3 qavatgacha)",
                    },
                    {
                      value: "2",
                      label:
                        "Turar joy, davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar (3 qavatdan yuqori)",
                    },
                    {
                      value: "3",
                      label:
                        "Jamoat binolari, 1-bandda ko'rsatilgandan tashqari, ma'muriy va maishiy binolar, nam va ho'l rejimli xonalarni istisno qilganda",
                    },
                    { value: "4", label: "Quruq va normal rejimli ishlab chiqarish binolari" },
                    { value: "5", label: "Nam va ho'l rejimli ishlab chiqarish xonalari va boshqa xonalar" },
                    { value: "6", label: "Kartoshka va sabzavot omborlari" },
                    {
                      value: "7",
                      label:
                        "Issiqligi keragidan ortiq bo'lgan (23 Vt/m3 dan ortiq) va ichki havosining hisobiy nisbiy namligi 50%dan oshmagan ishlab chiqarish binolari",
                    },
                  ]}
                />
              </div>

              {/* 2) Hudud (CustomRegionSelect) + Issiqlik himoyasi darajasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hudud</label>
                  <CustomRegionSelect
                    province={initial.province}
                    regionId={initial.region}
                    error={initialErrors.province || initialErrors.region}
                    onSelectProvince={(prov) => {
                      setInitial((s) => ({ ...s, province: prov, region: "" }));
                      setInitialErrors((err) => ({ ...err, province: false, region: false }));
                    }}
                    onSelectDistrict={(id, tOut) => {
                      setInitial((s) => ({ ...s, region: id }));
                      setInitialErrors((err) => ({ ...err, region: false }));
                      if (typeof tOut === "number") {
                        setClimate((c) => ({ ...c, t_out: Number(tOut) }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Issiqlik himoyasi darajasi</span>
                    <button
                      type="button"
                      className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-600 hover:bg-gray-100"
                      onClick={() => setShowProtectionInfo(true)}
                      aria-label="Issiqlik himoyasi darajasi haqida ma'lumot"
                    >
                      ?
                    </button>
                  </label>
                  <CustomSelect
                    value={initial.protectionLevel}
                    onChange={(val) => {
                      setInitial((s) => ({ ...s, protectionLevel: val }));
                      setInitialErrors((err) => ({ ...err, protectionLevel: false }));
                    }}
                    error={initialErrors.protectionLevel}
                    placeholder="Tanlang"
                    options={[
                      { value: "I", label: "I" },
                      { value: "II", label: "II" },
                      { value: "III", label: "III" },
                    ]}
                  />

                  {showProtectionInfo &&
                    createPortal(
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                        onClick={(e) => {
                          const target = e.target;
                          if (target instanceof HTMLElement && target.classList.contains("fixed")) {
                            setShowProtectionInfo(false);
                          }
                        }}
                      >
                        <div
                          className="bg-white rounded-2xl shadow-xl max-w-xl w-full mx-4 p-6 text-sm text-gray-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h2 className="text-base font-semibold text-gray-900">
                              Issiqlik himoyasi darajalari bo'yicha eslatma
                            </h2>
                            <button
                              type="button"
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => setShowProtectionInfo(false)}
                              aria-label="Yopish"
                            >
                              ×
                            </button>
                          </div>
                          <ProtectionLevelNoteText />
                        </div>
                      </div>,
                      document.body
                    )}
                </div>
              </div>
            
              {/* 3) t_i va φ_i bir qatorda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ichki havoning hisobiy harorati t
                    <sub className="align-baseline text-[0.7em]">i</sub> °C
                  </label>
                  <input
                    type="number"
                    name="t_in"
                    value={climate.t_in}
                    onChange={(e) => {
                      handleClimate(e);
                      const val = e.target.value;
                      if (val !== "" && val != null) {
                        setInitialErrors((err) => ({ ...err, t_in: false }));
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] ${
                      initialErrors.t_in ? "border-red-400" : "border-[#E5E7EB]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nisbiy namlik, φ
                    <sub className="align-baseline text-[0.7em]">i</sub> %
                  </label>
                  <input
                    type="number"
                    name="phi_in"
                    value={climate.phi_in}
                    onChange={(e) => {
                      handleClimate(e);
                      const val = e.target.value;
                      if (val !== "" && val != null) {
                        setInitialErrors((err) => ({ ...err, phi_in: false }));
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] ${
                      initialErrors.phi_in ? "border-red-400" : "border-[#E5E7EB]"
                    }`}
                  />
                </div>
              </div>

              {/* 4) Iqlimiy hosila qiymatlar: t_is.dav, Z_is.dav, t_t */}
              <div className="space-y-3 text-sm text-gray-800">
                <div className="pt-3 first:pt-2 border-t border-dashed border-gray-200 mt-3">
                  <p className="flex items-baseline gap-x-2 gap-y-1 text-[0.9rem] font-medium w-full">
                    <span className="leading-snug flex-1 text-justify">
                      O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning o'rtacha harorati,
                      t
                      <sub className="align-baseline text-[0.75em]">is.dav</sub>
                    </span>
                    <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                      {heatingSeason.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 italic mt-1">
                    QMQ 2.01.01-22 "Loyihalash uchun iqlimiy va fizikaviy-geologik maʼlumotlar" 4-jadval
                    "Tashqi havoning parametrlari", 20–22-qatorlar o'rtacha qiymati
                  </p>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200">
                  <p className="flex items-baseline gap-x-2 gap-y-1 text-[0.9rem] font-medium w-full">
                    <span className="leading-snug flex-1 text-justify">
                      O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning davomiyligi,
                      Z
                      <sub className="align-baseline text-[0.75em]">is.dav</sub>
                    </span>
                    <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                      {heatingSeason.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 italic mt-1">
                    QMQ 2.01.01-22 "Loyihalash uchun iqlimiy va fizikaviy-geologik maʼlumotlar" 4-jadval
                    "Tashqi havoning parametrlari", 19–21-qatorlar o'rtacha qiymati
                  </p>
                </div>

                <div className="pt-2 first:pt-2 border-t border-dashed border-gray-200 mt-2">
                  <p className="flex items-baseline gap-x-2 gap-y-1 text-[0.9rem] font-medium w-full">
                    <span className="leading-snug flex-1 text-justify">
                      Tashqi havoning hisobiy qishki harorati, t
                      <sub className="align-baseline text-[0.75em]">t</sub>
                    </span>
                    <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                      {climate.t_out != null ? `${climate.t_out} °C` : "—"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 italic mt-1">
                    QMQ 2.01.01-22 bo'yicha ta'minlanganligi 0,92 bo'lgan eng sovuq besh kunlikning o'rtacha
                    haroratiga teng. 4-jadval "Tashqi havoning parametrlari", 17-qator
                  </p>
                </div>
              </div>

              {/* 5) Ishlab chiqdi */}
              <div className="pt-3 border-t border-dashed border-gray-200 mt-2 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ishlab chiqdi:</label>
                  <input
                    type="text"
                    value={initial.preparedBy}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInitial((s) => ({ ...s, preparedBy: val }));
                      if (val && val.trim()) {
                        setInitialErrors((err) => ({ ...err, preparedBy: false }));
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] ${
                      initialErrors.preparedBy ? "border-red-400" : "border-[#E5E7EB]"
                    }`}
                    placeholder="F.I.Sh. yoki tashkilot nomi"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStepId === "normative_q" && (
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                Bu bosqichda [obekt_nomi] isitishga me'yoriy solishtirma issiqlik sarfi Q<sub className="align-baseline text-[0.7em]">n</sub>
                ni aniqlash uchun zarur bo'lgan parametrlar (isitish davri gradus-sutkasi, ichki harorat va h.k.)
                kiritiladi. Hozircha bu qism skelet holatida, keyingi bosqichda aniq formulalar bilan to'ldiriladi.
              </p>
            </div>
          )}

          {currentStepId === "heat_calc_1" && (
            <div className="space-y-6 text-sm text-gray-700">
              {constructionType === "eshik_darvoza" && (
                <section className="space-y-3">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">Dastlabki ma'lumotlar</h3>

                  {/* Hudud va ichki harorat – alohida qatorda */}
                  <div className="space-y-2 text-[0.9rem]">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">Hudud</span>
                      <span className="text-right text-[#1080c2] font-semibold">{hududLabel}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200" />
                    <div className="flex items-baseline justify-between gap-3 pt-1">
                      <span className="font-medium">
                        Ichki havoning hisobiy harorati t
                        <sub className="align-baseline text-[0.7em]">i</sub> °C
                      </span>
                      <span className="text-right text-[#1080c2] font-semibold">
                        {climate.t_in != null && climate.t_in !== ""
                          ? `${climate.t_in} °C`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Iqlimiy hosila qiymatlar – 1-bosqichdagi matnlar bilan */}
                  <div className="space-y-3 text-[0.9rem] text-gray-800 pt-2 border-t border-dashed border-gray-200">
                    <div className="pt-1 first:pt-0">
                      <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
                        <span className="leading-snug flex-1 text-justify">
                          O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning o'rtacha
                          harorati, t
                          <sub className="align-baseline text-[0.75em]">is.dav</sub>
                        </span>
                        <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                          {heatingSeason.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 italic mt-1">
                        QMQ 2.01.01-22 "Loyihalash uchun iqlimiy va fizikaviy-geologik maʼlumotlar" 4-jadval
                        "Tashqi havoning parametrlari", 20–22-qatorlar o'rtacha qiymati
                      </p>
                    </div>

                    <div className="pt-2 border-t border-dashed border-gray-200">
                      <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
                        <span className="leading-snug flex-1 text-justify">
                          O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning davomiyligi,
                          Z
                          <sub className="align-baseline text-[0.75em]">is.dav</sub>
                        </span>
                        <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                          {heatingSeason.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 italic mt-1">
                        QMQ 2.01.01-22 "Loyihalash uchun iqlimiy va fizikaviy-geologik maʼlumotlar" 4-jadval
                        "Tashqi havoning parametrlari", 19–21-qatorlar o'rtacha qiymati
                      </p>
                    </div>

                    <div className="pt-2 border-t border-dashed border-gray-200">
                      <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
                        <span className="leading-snug flex-1 text-justify">
                          Tashqi havoning hisobiy qishki harorati, t
                          <sub className="align-baseline text-[0.75em]">t</sub>
                        </span>
                        <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                          {climate.t_out != null ? `${climate.t_out} °C` : "—"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 italic mt-1">
                        QMQ 2.01.01-22 bo'yicha ta'minlanganligi 0,92 bo'lgan eng sovuq besh kunlikning o'rtacha
                        haroratiga teng. 4-jadval "Tashqi havoning parametrlari", 17-qator
                      </p>
                    </div>

                    {/* Devorning talab etilgan issiqlik uzatilishiga qarshiligi, RₒTal.SG */}
                    <div className="pt-2 border-t border-dashed border-gray-200">
                      <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
                        <span className="leading-snug flex-1 text-justify">
                          Sanitariya-gigiena talablariga muvofiq me'yriy (ruxsat etilgan maksimal) qarshilik, R
                          <sub className="align-baseline text-[0.75em]">o</sub>
                          <sup className="align-baseline text-[0.75em]">Tal.SG</sup>
                        </span>
                        <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                          {RoTalSG != null ? `${RoTalSG.toFixed(2)} m²·°C/Vt` : "—"}
                        </span>
                      </p>
                    </div>

                    {/* Eshik (balkonlarnikidan tashqari) va darvozalarning talab etilgan issiqlik uzatilishiga qarshiligi, RₒTal.e.d */}
                    <div className="pt-2 border-t border-dashed border-gray-200">
                      <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
                        <span className="leading-snug flex-1 text-justify">
                          Eshik (balkonlarnikidan tashqari) va darvozalarning talab etilgan issiqlik uzatilishiga
                          qarshiligi, R
                          <sub className="align-baseline text-[0.75em]">o</sub>
                          <sup className="align-baseline text-[0.75em]">Tal.e.d</sup>
                        </span>
                        <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                          {RoTalED != null ? `${RoTalED.toFixed(2)} m²·°C/Vt` : "—"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 italic mt-1">
                        Eshik va darvozalar issiqlik uzatilishiga talab etilgan qarshiligi devorlarning sanitariya-gigena talablariga javob beradigan qarshiligining kamida 0,6 qismidan kam bo'lmasligi kerak (QMQ 2.01.04-18, 2.2).
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {constructionType !== "eshik_darvoza" && (
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Konstruksiya turi</label>
                    <CustomSelect
                      value={constructionType}
                      onChange={(val) => setConstructionType(val)}
                      error={currentStepId === "heat_calc_1" && !constructionType}
                      placeholder="Tanlang"
                      options={CONSTRUCTION_TYPES}
                    />
                  </div>

                  {constructionType &&
                    constructionType !== "tashqi_devor" &&
                    constructionType !== "tashqi_devor_ventfasad" && (
                      <div className="w-full md:basis-1/3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span>Qovurg'a balandligi nisbati, h/a</span>
                          <button
                            type="button"
                            className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-600 hover:bg-gray-100"
                            onClick={() => setShowRibInfo(true)}
                            aria-label="Qovurg'a balandligi nisbati haqida eslatma"
                          >
                            ?
                          </button>
                        </label>
                        <CustomSelect
                          value={ribHeightRatio}
                          onChange={(val) => setRibHeightRatio(val)}
                          placeholder="h/a nisbatini tanlang"
                          options={[
                            { value: "low", label: "h/a ≤ 0.3" },
                            { value: "high", label: "h/a > 0.3" },
                          ]}
                        />
                      </div>
                    )}
                </div>
              )}
              {showRibInfo &&
                createPortal(
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={() => setShowRibInfo(false)}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-xl max-w-xl w-full mx-4 p-6 text-sm text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h2 className="text-base font-semibold text-gray-900">
                          Qovurg'a balandligi nisbati, h/a bo'yicha eslatma
                        </h2>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setShowRibInfo(false)}
                          aria-label="Yopish"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-700">
                        Orayopma tekis yoki turtib chiqgan qovurg'alari balandligi h-ning qo'shni qovurg'alar qirralari
                        orasidagi masofa a-ga nisbati 0.3 gacha bo'lsa h/a ≤ 0.3 tanlang.
                      </p>
                    </div>
                  </div>,
                  document.body
                )}
              {constructionType !== "eshik_darvoza" && (
                <div className="mt-6 bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-6 shadow-sm">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                    To'suvchi konstruksiya materiallarining xususiyatlari
                  </h2>

                  <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead>
                        <tr className="text-gray-600 bg-gray-50">
                          <th className="py-2 px-3 text-center">#</th>
                          <th className="py-2 px-3 text-left w-4/5">
                            <div className="flex items-center gap-3">
                              <div className="leading-tight">
                                <div>
                                  Material
                                  <span className="ml-2 italic font-normal">(Tashqaridan ichkariga)</span>
                                </div>
                              </div>
                            </div>
                          </th>
                          <th className="py-2 px-3 text-center leading-tight">
                            <div>
                              <span>
                                Qalinlik <span className="text-[#1080c2]">δ</span>
                              </span>
                              <br />
                              <span>mm</span>
                            </div>
                          </th>
                          <th className="py-2 px-2 text-center leading-tight">
                            <div>
                              Zichlik <span className="text-[#1080c2]">
                                γ
                              </span>
                              <sub className="align-baseline text-[0.7em] text-[#1080c2]">0</sub>, kg/m³
                            </div>
                          </th>
                          <th className="py-2 px-3 text-center leading-tight">
                            <div>
                              Issiqlik o'tk.lik <span className="text-[#1080c2]">
                                λ
                              </span>
                            </div>
                          </th>
                          <th className="py-2 px-2 text-center leading-tight">
                            <div>
                              Termik qarshilik <span className="text-[#1080c2]">R</span>
                            </div>
                          </th>
                          <th className="py-2 px-3 text-center leading-tight">
                            <div>Amal</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {layers.map((L, idx) => {
                          const d_m = (Number(L.thickness_mm) || 0) / 1000;
                          const lam = Number(L.lambda) || 0;
                          const R = d_m > 0 && lam > 0 ? d_m / lam : 0;
                          return (
                            <tr
                              key={L.id}
                              className="border-t border-[#E5E7EB]"
                              draggable
                              onDragStart={() => setDraggingLayerId(L.id)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (draggingLayerId && draggingLayerId !== L.id) {
                                  moveLayer(draggingLayerId, L.id);
                                }
                              }}
                              onDragEnd={() => setDraggingLayerId(null)}
                            >
                              <td className="py-2 pr-4 pl-3">{idx + 1}</td>
                              <td className="py-2 pr-4 align-top">
                                <div className="w-full max-w-none">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setMaterialModal({ open: true, layerId: L.id })}
                                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-800 hover:bg-gray-100"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="w-4 h-4 text-[#1080c2]"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M5 12h14M5 17h14" />
                                      </svg>
                                      <span>{L.name || "Material tanlang"}</span>
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 pr-4 text-center">
                                <input
                                  type="number"
                                  value={L.thickness_mm}
                                  onChange={(e) => updateLayer(L.id, "thickness_mm", e.target.value)}
                                  className="w-28 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-right"
                                />
                              </td>
                              <td className="py-2 pr-4 text-center">
                                <span className="inline-block min-w-[4.5rem] text-center">
                                  {L.rho != null && L.rho !== "" ? Number(L.rho) : ""}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-center">
                                <span className="inline-block min-w-[4.5rem] text-center">
                                  {L.lambda != null && L.lambda !== "" ? Number(L.lambda).toFixed(3) : ""}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-center">
                                <span className="inline-block min-w-[4.5rem] text-center">
                                  {R > 0 ? R.toFixed(3) : ""}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-center">
                                <button
                                  onClick={() => removeLayer(L.id)}
                                  aria-label="O'chirish"
                                  className="p-2 rounded-lg border text-red-600 border-red-300 hover:bg-red-50 inline-flex items-center justify-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    <button
                      type="button"
                      onClick={addLayer}
                      className="px-4 py-2 rounded-lg bg-[#1080c2] text-white text-sm self-start"
                    >
                      Qatlam qo'shish
                    </button>

                    <AirLayerControls airLayer={airLayer} onChange={setAirLayer} />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStepId === "heat_calc_n" && (
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                Bu bosqich bir nechta (n-ta) to'suvchi konstruksiya turlarini ketma-ket hisoblash uchun mo'ljallangan.
                Foydalanuvchi qo'shimcha konstruksiya turlarini qo'shishi va ular bo'yicha issiqlik texnik hisoblarini
                alohida-alohida bajarishi mumkin bo'ladi.
              </p>
            </div>
          )}

          {currentStepId === "summary_params" && (
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                Bu bosqichda barcha konstruksiya turlari bo'yicha hisoblangan issiqlik texnik va energetik
                parametrlarning (R, R<sub className="align-baseline text-[0.7em]">o</sub>, R
                <sub className="align-baseline text-[0.7em]">o</sub>
                <sup className="align-baseline text-[0.7em]">Tal</sup> va h.k.) umumiy jadvali shakllantiriladi.
              </p>
            </div>
          )}

          {currentStepId === "heat_losses" && (
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                Yakuniy bosqichda to'suvchi konstruksiyalardan issiqlik yo'qotilishi hisoblanadi va umumiy issiqlik
                balansida ularning ulushi tahlil qilinadi. Hozircha skeleton ko'rinishida, keyingi bosqichda batafsil
                hisoblash moduli qo'shiladi.
              </p>
            </div>
          )}
        </div>

        {/* Faqat 1-bosqichda kartochkaning eng pastida qo'shimcha, kattaroq "Keyingi bosqich" tugmasi */}
        {currentStepId === "initial" && (
          <div className="mt-8 flex justify-center">
            <WizardPrimaryButton className="px-8" onClick={goNext}>
              Keyingi bosqich
            </WizardPrimaryButton>
          </div>
        )}

        {/* 2-bosqichga o'tishda modul tanlash oynasi – global modal (overlay) */}
        {showNextStepChoice &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl p-5 space-y-4 text-sm text-gray-800" data-region-portal="true">
                <div className="font-semibold text-gray-900">Keyingi modulni tanlang</div>

                {/* Variantlar – 4 ta asosiy yo'nalish */}
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                    onClick={() => {
                      // Umumiy to'suvchi konstruksiya uchun yangi issiqlik hisobi (2.n) ni boshlash
                      const newIndex = heatSteps.length + 1;
                      const newId = `heat-${Date.now()}`;
                      const label = `2.${newIndex}`;

                      setHeatSteps((prev) => [
                        ...prev,
                        { id: newId, kind: "heat", label, presetConstructionType: null },
                      ]);
                      setHeatCalcRunIndex(newIndex);

                      setConstructionType("");
                      setRibHeightRatio("");
                      setLayers([
                        { id: Date.now(), name: "Qurilish materiali", thickness_mm: "", rho: "", lambda: "", mu: 10 },
                      ]);
                      setAirLayer({ enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });

                      const newDisplaySteps = [
                        { kind: "logical", id: "initial", label: "1" },
                        ...heatSteps,
                        { id: newId, kind: "heat", label, presetConstructionType: null },
                        { kind: "logical", id: "normative_q", label: "3" },
                      ];
                      const targetIdx = newDisplaySteps.findIndex((s) => s.id === newId);
                      if (targetIdx !== -1) setActiveIndex(targetIdx);
                      setShowNextStepChoice(false);
                    }}
                  >
                    To'suvchi konstruksiya bo'yicha issiqlik texnik hisob-kitobi
                  </button>

                  <button
                    type="button"
                    className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                    onClick={() => {
                      // Deraza/balkon eshiklari uchun yangi issiqlik hisobi (2.n)
                      const newIndex = heatSteps.length + 1;
                      const newId = `heat-${Date.now()}`;
                      const label = `2.${newIndex}`;

                      setHeatSteps((prev) => [
                        ...prev,
                        {
                          id: newId,
                          kind: "heat",
                          label,
                          presetConstructionType: "deraza_balkon_eshiklari",
                        },
                      ]);
                      setHeatCalcRunIndex(newIndex);

                      setConstructionType("deraza_balkon_eshiklari");
                      setRibHeightRatio("");
                      setLayers([
                        { id: Date.now(), name: "Qurilish materiali", thickness_mm: "", rho: "", lambda: "", mu: 10 },
                      ]);
                      setAirLayer({ enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });

                      const newDisplaySteps = [
                        { kind: "logical", id: "initial", label: "1" },
                        ...heatSteps,
                        {
                          id: newId,
                          kind: "heat",
                          label,
                          presetConstructionType: "deraza_balkon_eshiklari",
                        },
                        { kind: "logical", id: "normative_q", label: "3" },
                      ];
                      const targetIdx = newDisplaySteps.findIndex((s) => s.id === newId);
                      if (targetIdx !== -1) setActiveIndex(targetIdx);
                      setShowNextStepChoice(false);
                    }}
                  >
                    Deraza va balkon eshiklari bo'yicha issiqlik texnik hisob-kitobi
                  </button>

                  <button
                    type="button"
                    className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                    onClick={() => {
                      // Eshik/darvozalar uchun yangi issiqlik hisobi (2.n)
                      const newIndex = heatSteps.length + 1;
                      const newId = `heat-${Date.now()}`;
                      const label = `2.${newIndex}`;

                      setHeatSteps((prev) => [
                        ...prev,
                        {
                          id: newId,
                          kind: "heat",
                          label,
                          presetConstructionType: "eshik_darvoza",
                        },
                      ]);
                      setHeatCalcRunIndex(newIndex);

                      setConstructionType("eshik_darvoza");
                      setRibHeightRatio("");
                      setLayers([
                        { id: Date.now(), name: "Qurilish materiali", thickness_mm: "", rho: "", lambda: "", mu: 10 },
                      ]);
                      setAirLayer({ enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });

                      const newDisplaySteps = [
                        { kind: "logical", id: "initial", label: "1" },
                        ...heatSteps,
                        {
                          id: newId,
                          kind: "heat",
                          label,
                          presetConstructionType: "eshik_darvoza",
                        },
                        { kind: "logical", id: "normative_q", label: "3" },
                      ];
                      const targetIdx = newDisplaySteps.findIndex((s) => s.id === newId);
                      if (targetIdx !== -1) setActiveIndex(targetIdx);
                      setShowNextStepChoice(false);
                    }}
                  >
                    Eshik va darvozalar bo'yicha issiqlik texnik hisob-kitobi
                  </button>

                  <button
                    type="button"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 text-left text-xs md:text-sm"
                    onClick={() => {
                      if (!hasHeatCalcVisited) {
                        window.alert(
                          "Avval to'suvchi konstruksiyalar bo'yicha issiqlik texnik hisob-kitoblarini kamida bir marta bajaring",
                        );
                        return;
                      }
                      const targetIdx = STEPS.findIndex((s) => s.id === "normative_q");
                      if (targetIdx !== -1) {
                        setActiveIndex(targetIdx);
                      }
                      setShowNextStepChoice(false);
                    }}
                  >
                    Isitishga me'yoriy solishtirma issiqlik sarfi hisobi
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100"
                    onClick={() => setShowNextStepChoice(false)}
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
        <MaterialTreeModal
          open={materialModal.open}
          onClose={() => setMaterialModal({ open: false, layerId: null })}
          onApply={({ material, materialId, variantIdx, variant }) => {
            setLayers((prev) =>
              prev.map((l) => {
                if (l.id !== materialModal.layerId) return l;

                const matVariants = material?.variants || [];
                let idx = variantIdx;
                if (matVariants.length === 1 && (idx == null || idx === "")) idx = "0";
                const v = matVariants.length ? matVariants[Number(idx)] : null;

                let lambda = l.lambda;
                let mu = l.mu;
                let rho = l.rho;
                if (v) {
                  const pickedLambda = pickLambdaForVariant(v);
                  if (pickedLambda != null) lambda = pickedLambda;
                  if (typeof v.mu === "number") mu = v.mu;
                  if (v.density != null || v.zichlik != null) rho = v.density ?? v.zichlik;
                }

                return {
                  ...l,
                  name: material?.name || material?.material_name || l.name,
                  materialId: material?.id || materialId || l.materialId,
                  variantIdx: v ? String(idx) : null,
                  lambda: lambda !== undefined && lambda !== null && lambda !== "" ? Number(lambda) : l.lambda,
                  mu,
                  rho,
                };
              }),
            );
          }}
        />
      </div>
    </div>
  );
}
