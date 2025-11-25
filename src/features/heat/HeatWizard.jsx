import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { REGIONS } from "./data/regions";
import { ProtectionLevelNoteText } from "./heatSharedTexts";
import { CustomSelect, CustomRegionSelect } from "./controls/HeatSelects";
import { AirLayerControls, ConstructionIndicatorsSkeleton, ConstructionIndicatorsPanel } from "./controls/ConstructionBlocks";
import { EshikDarvozaStep } from "./controls/EshikDarvozaStep";
import { DerazaBalkonStep } from "./controls/DerazaBalkonStep";
import { InitialDataBlock } from "./controls/InitialDataBlock";
import { NormativeQStep } from "./controls/NormativeQStep";
import { WizardPrimaryButton, WizardSecondaryButton } from "./controls/WizardButtons";
import { MaterialTreeModal } from "./controls/MaterialTreeModal";
import { MaterialLayersTable } from "./controls/MaterialLayersTable";
import { ProtectionLevelInfoModal, RibHeightInfoModal } from "./controls/InfoModals";
import { CONSTRUCTION_TYPES } from "./data/constructionTypes";
import {
  computeDeltaTt,
  mapConstructionTypeToId,
  getNByConstructionId,
  getRoPrFromTables,
  getRoTalForDerazaFonar,
} from "./data/heatCalculations";

// Bosqichli "Heat Wizard" – issiqlik texnik hisobni bosqichma-bosqich kiritish uchun yangi interfeys.

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
  const [activeIndex, setActiveIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.localStorage.getItem("heatWizardActiveIndex");
    const parsed = saved != null ? Number(saved) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }); // hozirgi displayStep indeksi
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
  const [derazaType, setDerazaType] = useState(""); // Deraza va balkon eshiklari turi

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

  // Active step indeksini localStorage ga saqlab boramiz, sahifa yangilanganda o'sha step tiklanishi uchun
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("heatWizardActiveIndex", String(activeIndex));
      }
    } catch (e) {
      // agar localStorage mavjud bo'lmasa yoki xato bo'lsa, shunchaki e'tiborsiz qoldiramiz
    }
  }, [activeIndex]);

  // Foydalanuvchi kamida bir marta dastlabki bosqichdan keyingi bosqich(lar)ga o'tganligini belgilash uchun flag
  const [hasLeftInitialOnce, setHasLeftInitialOnce] = useState(false);

  // 2-bosqichga o'tishda tanlov oynasini ko'rsatish uchun flag
  const [showNextStepChoice, setShowNextStepChoice] = useState(false);

  // Har bir issiqlik bosqichi (2.1, 2.2, ...) uchun alohida saved state saqlash
  const saveHeatStepState = (stepId) => {
    if (!stepId) return;
    setHeatSteps((prev) =>
      prev.map((step) =>
        step.id === stepId && step.kind === "heat"
          ? {
              ...step,
              savedState: {
                constructionType,
                ribHeightRatio,
                derazaType,
                layers,
                airLayer,
              },
            }
          : step,
      ),
    );
  };

  const loadHeatStepState = (stepMeta) => {
    if (!stepMeta || stepMeta.kind !== "heat") return;

    const saved = stepMeta.savedState;
    if (saved) {
      // Saqlangan holatni tiklash
      setConstructionType(saved.constructionType || "");
      setRibHeightRatio(saved.ribHeightRatio || "");
      setDerazaType(saved.derazaType || "");
      setLayers(Array.isArray(saved.layers) && saved.layers.length > 0 
        ? saved.layers 
        : [{ id: Date.now(), name: "Qurilish materiali", thickness_mm: "", rho: "", lambda: "", mu: 10 }]
      );
      setAirLayer(saved.airLayer || { enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });
      return;
    }

    // Agar savedState yo'q bo'lsa, default/preset holatni o'rnatish
    setConstructionType(stepMeta.presetConstructionType || "");
    setRibHeightRatio("");
    setDerazaType("");
    setLayers([{ id: Date.now(), name: "Qurilish materiali", thickness_mm: "", rho: "", lambda: "", mu: 10 }]);
    setAirLayer({ enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });
  };

  const syncHeatStepState = (currentIndex, nextIndex) => {
    if (
      currentIndex == null ||
      nextIndex == null ||
      currentIndex === nextIndex ||
      !Array.isArray(displaySteps) ||
      displaySteps.length === 0
    ) {
      return;
    }

    const currentStep = displaySteps[currentIndex];
    const nextStep = displaySteps[nextIndex];

    if (currentStep && (currentStep.kind === "heat" || currentStep.id === "heat_placeholder")) {
      if (currentStep.kind === "heat") {
        saveHeatStepState(currentStep.id);
      }
    }

    if (nextStep && nextStep.kind === "heat") {
      loadHeatStepState(nextStep);
    }
  };

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
        const type = CONSTRUCTION_TYPES.find((ct) => ct.value === currentConstructionType);
        if (type) {
          meta.title = type.label;
        }
      }
    }

    return meta;
  }, [baseStepMeta, currentStepId, currentDisplayStep, constructionType]);

  // Filter construction types based on presetConstructionType
  // If presetConstructionType is null (to'suvchi konstruksiya selected), exclude eshik_darvoza and deraza_balkon_eshiklari
  const filteredConstructionTypes = useMemo(() => {
    if (currentStepId === "heat_calc_1" && currentDisplayStep?.presetConstructionType === null) {
      return CONSTRUCTION_TYPES.filter(
        (type) => type.value !== "eshik_darvoza" && type.value !== "deraza_balkon_eshiklari"
      );
    }
    return CONSTRUCTION_TYPES;
  }, [currentStepId, currentDisplayStep]);

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
    if (constructionType === "tashqi_devor" || constructionType === "tashqi_devor_ventfasad" || constructionType === "eshik_darvoza") return 8.7;
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

  // Eshik (balkonlarnikidan tashqari) va darvozalarning talab etilgan issiqlik uzatili  // Eshik va darvozalar uchun RoTal.e.d = 0.6 * RoTal.SG
  const RoTalED = useMemo(() => {
    if (RoTalSG == null) return null;
    return 0.6 * RoTalSG;
  }, [RoTalSG]);

  // Deraza va fonarlar uchun RoTal.D.F. (jadvaldan)
  const RoTalDF = useMemo(() => {
    if (!derazaType || !initial.protectionLevel || !initial.objectType || !heatingSeason.D_is_dav) return null;
    return getRoTalForDerazaFonar({
      protectionLevel: initial.protectionLevel,
      objectType: initial.objectType,
      D_is_dav: heatingSeason.D_is_dav,
      derazaType,
    });
  }, [derazaType, initial.protectionLevel, initial.objectType, heatingSeason.D_is_dav]);

  // RoTalab = max(RoTal.SG, RoResult.Ro)
  const RoTalab = useMemo(() => {
    const a = RoTalSG;
    const b = RoResult?.Ro;
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
      setActiveIndex((i) => {
        const isLast = i >= displaySteps.length - 1;
        const nextIndex = isLast ? i : i + 1;
        syncHeatStepState(i, nextIndex);
        return nextIndex;
      });
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

      syncHeatStepState(i, nextIndex);

      if (isLast) {
        // Oxirgi bosqichda esa foydalanuvchidan keyingi modul haqida tanlov so'rash uchun modal ochamiz
        setShowNextStepChoice(true);
      }

      return nextIndex;
    });
  };

  // Oldingi bosqichga qaytish handleri
  const goPrev = () => {
    setActiveIndex((i) => {
      const nextIndex = i > 0 ? i - 1 : i;
      syncHeatStepState(i, nextIndex);
      return nextIndex;
    });
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

    syncHeatStepState(activeIndex, idx);
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

                  <ProtectionLevelInfoModal 
                    open={showProtectionInfo} 
                    onClose={() => setShowProtectionInfo(false)} 
                  />
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
            <NormativeQStep 
              objectName={initial.objectName}
              climate={climate}
              heatingSeason={heatingSeason}
              layers={layers}
            />
          )}

          {currentStepId === "heat_calc_1" && (
            <div className="space-y-6 text-sm text-gray-700">
              {constructionType === "eshik_darvoza" && (
                <EshikDarvozaStep
                  hududLabel={hududLabel}
                  climate={climate}
                  heatingSeason={heatingSeason}
                  RoTalSG={RoTalSG}
                  RoTalED={RoTalED}
                  Rk={Rk}
                  Ro_calc={Ro_calc}
                  RoResult={RoResult}
                  alphaI={alphaI}
                  alphaT={alphaT}
                  layers={layers}
                  updateLayer={updateLayer}
                  removeLayer={removeLayer}
                  setMaterialModal={setMaterialModal}
                  draggingLayerId={draggingLayerId}
                  setDraggingLayerId={setDraggingLayerId}
                  moveLayer={moveLayer}
                  addLayer={addLayer}
                  airLayer={airLayer}
                  setAirLayer={setAirLayer}
                />
              )}

              {constructionType === "deraza_balkon_eshiklari" && (
                <DerazaBalkonStep
                  hududLabel={hududLabel}
                  climate={climate}
                  heatingSeason={heatingSeason}
                  RoTalSG={RoTalSG}
                  RoTalED={RoTalED}
                  RoTalDF={RoTalDF}
                  Rk={Rk}
                  Ro_calc={Ro_calc}
                  RoResult={RoResult}
                  alphaI={alphaI}
                  alphaT={alphaT}
                  derazaType={derazaType}
                  setDerazaType={setDerazaType}
                  protectionLevel={initial.protectionLevel}
                  layers={layers}
                  updateLayer={updateLayer}
                  removeLayer={removeLayer}
                  setMaterialModal={setMaterialModal}
                  draggingLayerId={draggingLayerId}
                  setDraggingLayerId={setDraggingLayerId}
                  moveLayer={moveLayer}
                  addLayer={addLayer}
                  airLayer={airLayer}
                  setAirLayer={setAirLayer}
                />
              )}

              {constructionType !== "eshik_darvoza" && constructionType !== "deraza_balkon_eshiklari" && (
                <>
                  <InitialDataBlock 
                    hududLabel={hududLabel}
                    climate={climate}
                    heatingSeason={heatingSeason}
                  />

                  <div className="mt-6 bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-6 shadow-sm space-y-6">
                    {/* 1-qism: Konstruksiya turi va h/a */}
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Konstruksiya turi</label>
                      <CustomSelect
                        value={constructionType}
                        onChange={(val) => setConstructionType(val)}
                        error={currentStepId === "heat_calc_1" && !constructionType}
                        placeholder="Tanlang"
                        options={filteredConstructionTypes}
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

                  {/* 2-qism: Materiallar jadvali va havo qatlami */}
                  <div>
                    <MaterialLayersTable
                      layers={layers}
                      updateLayer={updateLayer}
                      removeLayer={removeLayer}
                      setMaterialModal={setMaterialModal}
                      draggingLayerId={draggingLayerId}
                      setDraggingLayerId={setDraggingLayerId}
                      moveLayer={moveLayer}
                    />

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
                </div>
                </>
              )}
              <RibHeightInfoModal 
                open={showRibInfo} 
                onClose={() => setShowRibInfo(false)} 
              />

              {/* Material blokidan keyin ko'rsatkichlar paneli (faqat deraza/balkon eshiklari bo'lmaganda) */}
              {constructionType &&
                constructionType !== "eshik_darvoza" &&
                constructionType !== "deraza_balkon_eshiklari" && (
                  <div className="mt-6">
                    <ConstructionIndicatorsPanel
                      deltaTtResult={deltaTtResult}
                      alphaI={alphaI}
                      alphaT={alphaT}
                      heatingSeason={heatingSeason}
                      RoTalSG={RoTalSG}
                      RoTalab={RoTalab}
                      RoResult={RoResult}
                      Rk={Rk}
                      Ro_calc={Ro_calc}
                      initial={initial}
                      constructionType={constructionType}
                    />
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
                      // Joriy stepni saqlash
                      if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                        saveHeatStepState(currentDisplayStep.id);
                      }

                      // Umumiy to'suvchi konstruksiya uchun yangi issiqlik hisobi (2.n) ni boshlash
                      const newIndex = heatSteps.length + 1;
                      const newId = `heat-${Date.now()}`;
                      const label = `2.${newIndex}`;

                      setHeatSteps((prev) => [
                        ...prev,
                        { id: newId, kind: "heat", label, presetConstructionType: null },
                      ]);
                      setHeatCalcRunIndex(newIndex);

                      // Yangi step uchun bo'sh holat
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
                      // Joriy stepni saqlash
                      if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                        saveHeatStepState(currentDisplayStep.id);
                      }

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
                      // Joriy stepni saqlash
                      if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                        saveHeatStepState(currentDisplayStep.id);
                      }

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
