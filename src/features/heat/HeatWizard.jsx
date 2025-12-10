import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { REGIONS } from "./data/regions";
import { WINDOWS } from "./data/windowsRo";
import { ProtectionLevelNoteText } from "./heatSharedTexts";
import { CustomSelect, CustomRegionSelect } from "./controls/HeatSelects";
import { AirLayerControls, ConstructionIndicatorsSkeleton, ConstructionIndicatorsPanel } from "./controls/ConstructionBlocks";
import { EshikDarvozaStep } from "./controls/EshikDarvozaStep";
import { DerazaBalkonStep } from "./controls/DerazaBalkonStep";
import { EnclosureStep } from "./controls/EnclosureStep";
import { InitialDataBlock } from "./controls/InitialDataBlock";
import { InitialStep } from "./controls/InitialStep";
import { FloorHeatCalculationStep } from "./controls/FloorHeatCalculationStep";
import { NormativeQStep } from "./controls/NormativeQStep";
import { BuildingParametersStep } from "./controls/BuildingParametersStep";
import { WizardPrimaryButton, WizardSecondaryButton } from "./controls/WizardButtons";
import {
  exportHeatPdf,
  exportInitialStepPdf,
  exportNormativeStepPdf,
  exportHeatStepPdf,
} from "./utils/exportHeatPdf";
import { exportHeatStepPdfReact } from "./utils/exportHeatPdfReact";
import { exportWindowStepPdfReact } from "./utils/exportWindowPdf.jsx";
import { exportDoorStepPdfReact } from "./utils/exportDoorPdf.jsx";
import { exportFloorPdfReact } from "./utils/exportFloorPdfReact";
import { calculateYp as calculateFloorYp, getFloorAbsorptionNorm } from "./data/floorHeatAbsorption";
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
  getHumidityRegimeInfo,
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
    id: "building_parameters",
    title: "Bino parametrlari",
    description:
      "Bino geometriyasi va konstruksiyalari maydonlari ma'lumotlarini kiriting.",
  },
  {
    id: "heat_calc_1",
    title: "Issiqlik texnik hisob-kitobi",
    description: "",
  },
  // Vaqtincha o'chirilgan
  // {
  //   id: "normative_q",
  //   title: "Isitishga me'yoriy solishtirma issiqlik sarfi",
  //   description:
  //     "Obekt uchun isitishga me'yoriy solishtirma issiqlik sarfini aniqlash.",
  // },
];

// StepBadge – stepper ichidagi dumaloq raqamli indikator (1, 2, 3, ...).
// isActive – hozirgi bosqich, isCompleted – mantiqan to'liq bajarilgan bosqich.
// hasError – ushbu bosqich uchun majburiy shartlar bajarilmagan (asosan issiqlik steplari uchun qizil nuqta).
function StepBadge({ label, isActive, isCompleted, hasError }) {
  const baseClasses =
    "relative flex items-center justify-center w-12 h-12 rounded-full border text-base font-semibold transition-colors";
  const activeClasses = "border-[#1080c2] text-[#ffffff] bg-[#1080c2]";
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
      {/* Xato holat (asosan issiqlik steplari) uchun sariq nuqta */}
      {hasError && !isActive && (
        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
      )}
    </div>
  );
}

// HeatWizard – barcha stepper, formalar va modallarni birlashtiruvchi asosiy komponent.
export default function HeatWizard() {
  // Vaqtinchalik default ma'lumotlarni localStorage dan yuklash
  const loadTempDefaults = () => {
    try {
      const saved = localStorage.getItem('heatWizard_tempDefaults');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load temp defaults:', e);
      return null;
    }
  };

  const saveTempDefaults = (data) => {
    try {
      localStorage.setItem('heatWizard_tempDefaults', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save temp defaults:', e);
    }
  };

  const tempDefaults = loadTempDefaults();

  const [activeIndex, setActiveIndex] = useState(() => {
    // localStorage dan activeIndex ni yuklash
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("heatWizardActiveIndex") : null;
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  }); // hozirgi displayStep indeksi
  const [heatCalcRunIndex, setHeatCalcRunIndex] = useState(0); // Issiqlik texnik hisob (2.n) tartib raqami
  const [maxVisitedIndex, setMaxVisitedIndex] = useState(0); // foydalanuvchi yetib borgan eng katta step indeksi

  // 1-bosqich: Dastlabki ma'lumotlar (obekt nomi, turi, hudud va h.k.) uchun lokal state
  const [initial, setInitial] = useState({
    objectName: tempDefaults?.initial?.objectName || "Mavjud turar-joy binosini, yuridik hujjatga ega qismini \"Tibbiyot muassasasi\" sifatida noturar joy toifasiga ixtisosini o'zgartirish va rekonstruksiya qilish.",
    province: tempDefaults?.initial?.province || "Toshkent viloyati",
    region: tempDefaults?.initial?.region || "4",
    objectType: tempDefaults?.initial?.objectType || "1",
    protectionLevel: tempDefaults?.initial?.protectionLevel || "II",
    preparedBy: tempDefaults?.initial?.preparedBy || "Yoqubov Zuhriddin",
  });

  // Loyiha ma'lumotlari uchun state
  const [projectData, setProjectData] = useState({
    developer: tempDefaults?.projectData?.developer || "Yoqubov Zuhriddin",
    organization: tempDefaults?.projectData?.organization || "Foster and partners",
    contactPhone: tempDefaults?.projectData?.contactPhone || "+99899 999 99 99",
    designerAddress: tempDefaults?.projectData?.designerAddress || "New York city",
    objectAddress: tempDefaults?.projectData?.objectAddress || "Chikago",
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
    t_in: tempDefaults?.climate?.t_in || 20,
    phi_in: tempDefaults?.climate?.phi_in || 55,
    t_out: tempDefaults?.climate?.t_out || -16,
  });

  const [layers, setLayers] = useState(tempDefaults?.layers || [
    { id: 1, name: "Qurilish materialini tanlang", thickness_mm: "", rho: "", lambda: "", mu: 10 },
  ]);

  const [materialModal, setMaterialModal] = useState({ open: false, layerId: null });
  const [draggingLayerId, setDraggingLayerId] = useState(null);

  const [airLayer, setAirLayer] = useState(tempDefaults?.airLayer || {
    enabled: false,
    thickness_mm: "",
    layerTemp: "positive",
    foilBothSides: false,
  });

  // 3-bosqich: konstruksiya turi va qovurg'a balandligi nisbati uchun state
  const [constructionType, setConstructionType] = useState(tempDefaults?.constructionType || "");
  const [ribHeightRatio, setRibHeightRatio] = useState(tempDefaults?.ribHeightRatio || "");
  const [showRibInfo, setShowRibInfo] = useState(false); // h/a eslatma modali
  const [derazaType, setDerazaType] = useState(tempDefaults?.derazaType || ""); // Deraza va balkon eshiklari turi
  
  // Deraza steplari uchun tanlangan variantlar
  const [selectedWindowGroup, setSelectedWindowGroup] = useState(tempDefaults?.selectedWindowGroup || "");
  const [selectedWindowVariant, setSelectedWindowVariant] = useState(tempDefaults?.selectedWindowVariant || "");
  const [selectedWindowGroup2, setSelectedWindowGroup2] = useState(tempDefaults?.selectedWindowGroup2 || "");
  const [selectedWindowVariant2, setSelectedWindowVariant2] = useState(tempDefaults?.selectedWindowVariant2 || "");

  // Bino parametrlari uchun state
  const [buildingParams, setBuildingParams] = useState({
    objectType: tempDefaults?.buildingParams?.objectType || "",
    P_m: tempDefaults?.buildingParams?.P_m || "",
    H_m: tempDefaults?.buildingParams?.H_m || "",
    floors: tempDefaults?.buildingParams?.floors || "",
    A_f: tempDefaults?.buildingParams?.A_f || "",
    A_mc1: tempDefaults?.buildingParams?.A_mc1 || "",
    V_h: tempDefaults?.buildingParams?.V_h || "",
    weeklyHours: tempDefaults?.buildingParams?.weeklyHours || "",
    Xodim: tempDefaults?.buildingParams?.Xodim || "",
    roofType: tempDefaults?.buildingParams?.roofType || "",
    A_W: tempDefaults?.buildingParams?.A_W || "",
    A_L: tempDefaults?.buildingParams?.A_L || "",
    A_D: tempDefaults?.buildingParams?.A_D || "",
    A_CG: tempDefaults?.buildingParams?.A_CG || "",
    A_G: tempDefaults?.buildingParams?.A_G || "",
    A_R: tempDefaults?.buildingParams?.A_R || "",
  });

  // Iqlimiy ma'lumotlarni viloyat va tuman asosida hisoblash
  const heatingSeason = useMemo(() => {
    if (!initial.province || !initial.region) return { t_is_dav: null, Z_is_dav: null, D_is_dav: null };

    const province = REGIONS.find((p) => p?.viloyat === initial.province);
    if (!province) return { t_is_dav: null, Z_is_dav: null, D_is_dav: null };

    const list = province.hududlar || [];
    const idx = Number(initial.region);
    const district = Number.isFinite(idx) ? list[idx] : null;
    if (!district) return { t_is_dav: null, Z_is_dav: null, D_is_dav: null };

    // t_is_dav - 20-22 qatorlar o'rtacha qiymati
    const t8_avg = district.havo_sutka_ortacha_c?.t_8?.ortacha_harorat;
    const t12_avg = district.havo_sutka_ortacha_c?.t_12?.ortacha_harorat;
    const t_is_dav = t8_avg && t12_avg ? (t8_avg + t12_avg) / 2 : null;

    // Z_is_dav va D_is_dav - 19-21 qatorlar o'rtacha qiymati (davomiylik)
    const t8_days = district.havo_sutka_ortacha_c?.t_8?.davom_etish_sutka;
    const t12_days = district.havo_sutka_ortacha_c?.t_12?.davom_etish_sutka;
    const Z_is_dav = t8_days && t12_days ? (t8_days + t12_days) / 2 : null;
    const D_is_dav = Z_is_dav; // D_is_dav va Z_is_dav bir xil

    return { t_is_dav, Z_is_dav, D_is_dav };
  }, [initial.province, initial.region]);

  // Issiqlik texnik hisoblari uchun dinamik steplar (boshlang'ichda bo'sh, keyin 3,4,5... tartibida qo'shiladi)
  const [heatSteps, setHeatSteps] = useState(tempDefaults?.heatSteps || []);

  // UI da ko'rsatiladigan barcha steplar:
  // - Agar hali birorta issiqlik hisobi tanlanmagan bo'lsa: 1, 2, 3 (placeholder)
  // - Agar issiqlik hisoblari bo'lsa: 1, 2, 3, 4, 5...n
  const displaySteps = useMemo(() => {
    const baseSteps = [
      { kind: "logical", id: "initial", label: "1" },
      { kind: "logical", id: "building_parameters", label: "2" },
    ];
    
    if (heatSteps.length === 0) {
      // Agar issiqlik hisoblari bo'lmasa, placeholder step qo'shamiz
      return [
        ...baseSteps,
        { kind: "logical", id: "heat_placeholder", label: "3" },
      ];
    }
    
    // Issiqlik texnik hisobi steplari (3, 4, 5... n)
    const heatCalcSteps = heatSteps.map((step, idx) => ({
      ...step,
      label: String(idx + 3), // 3 dan boshlab raqamlash
    }));
    
    // Vaqtincha o'chirilgan: normative_q step
    // const lastStepNumber = 3 + heatSteps.length;
    // const normativeStep = { kind: "logical", id: "normative_q", label: String(lastStepNumber) };
    
    return [...baseSteps, ...heatCalcSteps];
  }, [heatSteps]);
  
  // Validation error flags
  const [showConstructionError, setShowConstructionError] = useState(false); // Konstruksiya turi tanlanmaganligini ko'rsatish
  const [showRibHeightError, setShowRibHeightError] = useState(false); // h/a nisbati tanlanmaganligini ko'rsatish
  const [showLayersError, setShowLayersError] = useState(false); // Qatlamlar xatosi
  const [showDerazaTypeError, setShowDerazaTypeError] = useState(false); // Deraza turi tanlanmaganligini ko'rsatish

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

  // Vaqtinchalik defaultlarni tozalash funksiyasi
  const clearTempDefaults = () => {
    try {
      localStorage.removeItem('heatWizard_tempDefaults');
      alert('Vaqtinchalik defaultlar tozalandi. Sahifani yangilang.');
    } catch (e) {
      console.error('Failed to clear temp defaults:', e);
    }
  };

  // Ma'lumotlarni localStorage ga saqlash
  useEffect(() => {
    const dataToSave = {
      initial,
      projectData,
      climate,
      buildingParams,
      // Issiqlik texnik hisobi steplari ma'lumotlari
      heatSteps: heatSteps.map(step => ({
        ...step,
        // Faqat kerakli ma'lumotlarni saqlaymiz
        savedState: step.savedState ? {
          constructionType: step.savedState.constructionType,
          ribHeightRatio: step.savedState.ribHeightRatio,
          derazaType: step.savedState.derazaType,
          layers: step.savedState.layers,
          airLayer: step.savedState.airLayer,
          selectedWindowGroup: step.savedState.selectedWindowGroup,
          selectedWindowVariant: step.savedState.selectedWindowVariant,
          selectedWindowGroup2: step.savedState.selectedWindowGroup2,
          selectedWindowVariant2: step.savedState.selectedWindowVariant2,
        } : undefined,
        presetConstructionType: step.presetConstructionType,
      })),
      // Umumiy konstruksiya ma'lumotlari
      constructionType,
      ribHeightRatio,
      derazaType,
      layers,
      airLayer,
      selectedWindowGroup,
      selectedWindowVariant,
      selectedWindowGroup2,
      selectedWindowVariant2,
    };
    saveTempDefaults(dataToSave);
  }, [initial, projectData, climate, buildingParams, heatSteps, constructionType, ribHeightRatio, derazaType, layers, airLayer, selectedWindowGroup, selectedWindowVariant, selectedWindowGroup2, selectedWindowVariant2]);

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
                // layers ga R qiymatini hisoblab qo'shish
                layers: layers.map(l => {
                  const d_m = (Number(l.thickness_mm) || 0) / 1000;
                  const lam = Number(l.lambda) || 0;
                  const R = d_m > 0 && lam > 0 ? (d_m / lam).toFixed(2) : null;
                  return { ...l, R };
                }),
                airLayer,
                Ro_calc,
                RoTalab,
                // Deraza steplari uchun tanlangan variantlar
                selectedWindowGroup,
                selectedWindowVariant,
                selectedWindowGroup2,
                selectedWindowVariant2,
                RoTalDF,
                RoTalED,
                // Normativ parametrlar (PDF izohlar uchun)
                delta_t_n: deltaTtResult?.delta_tt,
                delta_t_n_row: deltaTtResult?.row,
                alpha_i: alphaI,
                alpha_i_row: constructionType === "tashqi_devor" || constructionType === "tashqi_devor_ventfasad" || constructionType === "eshik_darvoza" ? 1 : (ribHeightRatio === "low" ? 1 : (ribHeightRatio === "high" ? 2 : null)),
                alpha_t: alphaT,
                alpha_t_row: (() => {
                  const id = mapConstructionTypeToId(constructionType);
                  if (id === "1" || id === "2" || id === "4") return 1;
                  if (id === "5") return 2;
                  if (id === "3" || id === "6" || id === "9") return 3;
                  if (id === "7" || id === "8") return 4;
                  return null;
                })(),
                D_d_dav: heatingSeason.D_is_dav,
                t_is_dav: heatingSeason.t_is_dav,
                Z_is_dav: heatingSeason.Z_is_dav,
                Ro_MG: RoTalSG,
                R_k: Rk,
                protectionLevel: initial.protectionLevel,
                RoResult_row: RoResult?.row,
                t_in: climate.t_in,
                t_out: climate.t_out,
                phi_in: climate.phi_in,
                // Namlik rejimi ma'lumotlari (PDF izohlar uchun) - harorat va namlik asosida
                humidityRegimeInfo: getHumidityRegimeInfo(climate.t_in, climate.phi_in),
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
        : [{ id: Date.now(), name: "Qurilish materialini tanlang", thickness_mm: "", rho: "", lambda: "", mu: 10 }]
      );
      setAirLayer(saved.airLayer || { enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });
      // Deraza variantlarini tiklash
      setSelectedWindowGroup(saved.selectedWindowGroup || "");
      setSelectedWindowVariant(saved.selectedWindowVariant || "");
      setSelectedWindowGroup2(saved.selectedWindowGroup2 || "");
      setSelectedWindowVariant2(saved.selectedWindowVariant2 || "");
      return;
    }

    // Agar savedState yo'q bo'lsa, default/preset holatni o'rnatish
    setConstructionType(stepMeta.presetConstructionType || "");
    setRibHeightRatio("");
    setDerazaType("");
    setLayers([{ id: Date.now(), name: "Qurilish materialini tanlang", thickness_mm: "", rho: "", lambda: "", mu: 10 }]);
    setAirLayer({ enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });
    setSelectedWindowGroup("");
    setSelectedWindowVariant("");
    setSelectedWindowGroup2("");
    setSelectedWindowVariant2("");
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

  // Konstruksiya turidan qisqa nom olish funksiyasi (stepper uchun)
  const getShortConstructionName = (constructionTypeValue) => {
    if (!constructionTypeValue) return "Issiqlik texnik hisob-kitobi";
    
    const shortNames = {
      "tashqi_devor": "Devor",
      "tashqi_devor_ventfasad": "Ventfasad",
      "tom_ochiq_chordoq": "Tomyopma",
      "chordoq_orayopma": "Orayopma",
      "otish_joyi_orayopma": "Orayopma",
      "yertola_tashqi_havo_boglangan": "Orayopma",
      "isitilmaydigan_yertola_yoruglik_oraliqli": "Orayopma",
      "isitilmaydigan_yertola_yuqori_yorugliksiz": "Orayopma",
      "isitilmaydigan_texnik_tagxona_pastda": "Orayopma",
      "eshik_darvoza": "Eshik",
      "deraza_balkon_eshiklari": "Deraza",
      "floor_heat_calculation": "Yerdagi pol",
    };
    
    return shortNames[constructionTypeValue] || "Issiqlik texnik hisob-kitobi";
  };

  // Get the base step meta
  const baseStepMeta = STEPS.find((s) => s.id === currentStepId) || STEPS[0];

  // If it's a heat calculation step, show the step number in the title
  const currentStepMeta = useMemo(() => {
    const meta = { ...baseStepMeta };

    if (currentStepId === "heat_calc_1") {
      // Get the construction type for title
      const currentConstructionType = currentDisplayStep?.presetConstructionType || constructionType;
      if (currentConstructionType) {
        const type = CONSTRUCTION_TYPES.find((ct) => ct.value === currentConstructionType);
        if (type) {
          meta.title = `${type.label} issiqlik texnik hisob-kitobi`;
        } else {
          meta.title = "Issiqlik texnik hisob-kitobi";
        }
      } else {
        meta.title = "Issiqlik texnik hisob-kitobi";
      }
    }

    return meta;
  }, [baseStepMeta, currentStepId, currentDisplayStep, constructionType]);

  // Filter construction types based on presetConstructionType
  // If presetConstructionType is null (to'suvchi konstruksiya selected), exclude eshik_darvoza and deraza_balkon_eshiklari
  const filteredConstructionTypes = useMemo(() => {
    if (currentStepId === "heat_calc_1") {
      const preset = currentDisplayStep?.presetConstructionType;
      
      // Agar to'suvchi konstruksiya tanlangan bo'lsa (preset === null yoki preset yo'q)
      if (preset === null || preset === undefined) {
        return CONSTRUCTION_TYPES.filter(
          (type) => type.value !== "eshik_darvoza" && type.value !== "deraza_balkon_eshiklari"
        );
      }
      
      // Agar deraza tanlangan bo'lsa, faqat deraza ko'rsatiladi
      if (preset === "deraza_balkon_eshiklari") {
        return CONSTRUCTION_TYPES.filter((type) => type.value === "deraza_balkon_eshiklari");
      }
      
      // Agar eshik tanlangan bo'lsa, faqat eshik ko'rsatiladi
      if (preset === "eshik_darvoza") {
        return CONSTRUCTION_TYPES.filter((type) => type.value === "eshik_darvoza");
      }
    }
    return CONSTRUCTION_TYPES;
  }, [currentStepId, currentDisplayStep]);

  // Step descriptionlari uchun issiqlik steplarining oxirgi indeksini aniqlash
  const heatStepIndices = Array.isArray(displaySteps)
    ? displaySteps.reduce((acc, step, idx) => {
        if (step?.kind === "heat" || step?.id === "heat_placeholder") acc.push(idx);
        return acc;
      }, [])
    : [];

  const lastHeatStepIndex = heatStepIndices.length > 0 ? heatStepIndices[heatStepIndices.length - 1] : -1;

  // Step o'zgarganda hozirgi stepning ma'lumotlarini yuklash
  useEffect(() => {
    if (currentDisplayStep?.kind === "heat") {
      loadHeatStepState(currentDisplayStep);
    }
  }, [currentDisplayStep?.id]);

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

  // Foydalanuvchi yetib borgan maksimum step indeksini eslab qolamiz (har bir step uchun "o'tib ketilgan" holatni bilish uchun)
  useEffect(() => {
    setMaxVisitedIndex((prev) => (activeIndex > prev ? activeIndex : prev));
  }, [activeIndex]);

  // Konstruksiya turi o'zgarganda validation xatosini tozalaymiz
  useEffect(() => {
    if (constructionType) {
      setShowConstructionError(false);
    }
  }, [constructionType]);

  // h/a nisbati o'zgarganda validation xatosini tozalaymiz
  useEffect(() => {
    if (ribHeightRatio) {
      setShowRibHeightError(false);
    }
  }, [ribHeightRatio]);

  // Qatlamlar o'zgarganda validation xatosini tozalaymiz
  useEffect(() => {
    if (layers.length > 0) {
      setShowLayersError(false);
    }
  }, [layers]);

  // Deraza turi o'zgarganda validation xatosini tozalaymiz
  useEffect(() => {
    if (derazaType) {
      setShowDerazaTypeError(false);
    }
  }, [derazaType]);

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
    const RoPrResult = getRoPrFromTables({
      protectionLevel: initial.protectionLevel,
      objectType: initial.objectType,
      floors: initial.floors,
      D_is_dav: heatingSeason.D_is_dav,
      constructionTypeId,
    });
    const n = getNByConstructionId(constructionTypeId);

    if (RoPrResult == null || n == null) {
      return { Ro: null, RoPr: null, n: n ?? null, row: null };
    }

    const RoPr = RoPrResult.value;
    const row = RoPrResult.row;

    return {
      RoPr,
      n,
      Ro: RoPr * n,
      row,
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
      // Issiqlik bosqichi uchun fizik shart: Ro_calc >= RoTalab
      // Agar bu joriy aktiv step bo'lsa, hozirgi Ro_calc va RoTalab qiymatlarini tekshiramiz
      // Agar bu o'tib ketilgan step bo'lsa, savedState dan tekshiramiz
      if (step.kind === "heat" && step.savedState) {
        const saved = step.savedState;
        const savedConstructionType = saved.constructionType;
        
        // Deraza/balkon eshiklari uchun maxsus shart tekshiruvi
        if (savedConstructionType === "deraza_balkon_eshiklari") {
          if (!saved.derazaType) return false;
          
          // WINDOWS ma'lumotlar bazasidan Ro qiymatlarini olish
          const RoTalDF = saved.RoTalDF;
          
          if (RoTalDF != null) {
            let windowRo = null;
            let windowRo2 = null;
            
            // 1-variant Ro qiymatini hisoblash
            if (saved.selectedWindowGroup && saved.selectedWindowVariant) {
              const group = WINDOWS.find((w) => w.id === Number(saved.selectedWindowGroup));
              if (group && Array.isArray(group.tur)) {
                const variant = group.tur.find((v) => v.name === saved.selectedWindowVariant);
                if (variant) windowRo = variant.Ro;
              }
            }
            
            // 2-variant Ro qiymatini hisoblash
            if (saved.selectedWindowGroup2 && saved.selectedWindowVariant2) {
              const group = WINDOWS.find((w) => w.id === Number(saved.selectedWindowGroup2));
              if (group && Array.isArray(group.tur)) {
                const variant = group.tur.find((v) => v.name === saved.selectedWindowVariant2);
                if (variant) windowRo2 = variant.Ro;
              }
            }
            
            // Kamida bitta variant shartni bajarishi kerak
            const variant1Passes = windowRo != null && windowRo >= RoTalDF;
            const variant2Passes = windowRo2 != null && windowRo2 >= RoTalDF;
            return variant1Passes || variant2Passes;
          }
          return false;
        }
        
        // Eshik va darvozalar uchun maxsus shart tekshiruvi
        if (savedConstructionType === "eshik_darvoza") {
          const RoTalED = saved.RoTalED;
          if (saved.Ro_calc != null && RoTalED != null) {
            return saved.Ro_calc >= RoTalED;
          }
          return false;
        }
        
        // Boshqa konstruksiya turlari uchun umumiy shart
        if (saved.Ro_calc != null && saved.RoTalab != null) {
          return saved.Ro_calc >= saved.RoTalab;
        }
        // Agar Ro_calc/RoTalab hali hisoblangan bo'lmasa, konstruksiya turi mavjudligini tekshiramiz
        return !!savedConstructionType;
      }
      // Agar savedState yo'q bo'lsa (hozirgi aktiv step), hozirgi qiymatlarni tekshiramiz
      const currentConstructionType = step.presetConstructionType || constructionType;
      
      // Deraza/balkon eshiklari uchun derazaType majburiy
      if (currentConstructionType === "deraza_balkon_eshiklari") {
        if (!derazaType) return false;
      }
      
      if (Ro_calc != null && RoTalab != null) {
        return Ro_calc >= RoTalab;
      }
      // Agar hali hisoblangan bo'lmasa, konstruksiya turi mavjudligini tekshiramiz
      return !!currentConstructionType;
    }

    if (stepId === "building_parameters") {
      // Bino parametrlari bosqichi – hozircha har doim bajarilgan hisoblanadi
      return true;
    }

    // Vaqtincha o'chirilgan: normative_q tekshiruvi
    // if (stepId === "normative_q") {
    //   // Me'yoriy issiqlik sarfi bosqichi – hozircha issiqlik hisobiga kirilgan bo'lsa yetarli
    //   return !!hasHeatCalcVisited;
    // }

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

        const msg = "QUYIDAGI MAYDONLARNI TO'LDIRING:\n\n" + missing.map(m => `• ${m}`).join("\n");
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

    // Agar hozirgi bosqich issiqlik texnik hisobi bo'lsa (2-step / 2.n), validatsiya qilamiz
    const isHeatCalcStep = currentStepId === "heat_calc_1" || currentDisplayStep?.kind === "heat";
    if (isHeatCalcStep) {
      console.log("🔍 Heat calc step validatsiyasi boshlandi");
      console.log("currentStepId:", currentStepId);
      console.log("currentDisplayStep:", currentDisplayStep);
      
      // Avval hozirgi stepning ma'lumotlarini saqlaymiz
      if (currentDisplayStep?.kind === "heat") {
        saveHeatStepState(currentDisplayStep.id);
      }
      
      const missing = [];
      let hasConstructionTypeError = false;
      let hasRibHeightError = false;
      let hasLayersError = false;
      let hasDerazaTypeError = false;
      
      // Hozirgi stepning konstruksiya turini aniqlaymiz (preset yoki tanlangan)
      const currentConstructionType = currentDisplayStep?.presetConstructionType || constructionType;
      
      // Konstruksiya turi tekshiruvi
      if (!currentConstructionType) {
        missing.push("Konstruksiya turi");
        hasConstructionTypeError = true;
      }
      
      // Agar deraza/balkon eshiklari bo'lsa, derazaType majburiy
      if (currentConstructionType === "deraza_balkon_eshiklari" && !derazaType) {
        missing.push("Deraza/Fonar turi");
        hasDerazaTypeError = true;
      }
      
      // Deraza steplari uchun ikkala variant tanlanganligini tekshirish
      if (currentConstructionType === "deraza_balkon_eshiklari") {
        const hasVariant1 = selectedWindowGroup && selectedWindowVariant;
        const hasVariant2 = selectedWindowGroup2 && selectedWindowVariant2;
        
        if (!hasVariant1) {
          missing.push("1-variant (deraza/fonar turi)");
        }
        if (!hasVariant2) {
          missing.push("2-variant (deraza/fonar turi)");
        }
      }
      
      // h/a nisbati - tashqi devor va ventfasaddan tashqari barcha konstruksiyalar uchun majburiy (lekin eshik/deraza va polda shart emas)
      if (currentConstructionType && 
          currentConstructionType !== "tashqi_devor" && 
          currentConstructionType !== "tashqi_devor_ventfasad" &&
          currentConstructionType !== "eshik_darvoza" &&
          currentConstructionType !== "deraza_balkon_eshiklari" &&
          currentConstructionType !== "floor_heat_calculation" &&
          !ribHeightRatio) {
        missing.push("Qovurg'a balandligi nisbati (h/a)");
        hasRibHeightError = true;
      }
      
      // Agar oddiy konstruksiya bo'lsa (eshik/deraza emas), kamida 1ta qatlam kerak
      if (currentConstructionType && 
          currentConstructionType !== "eshik_darvoza" && 
          currentConstructionType !== "deraza_balkon_eshiklari" && 
          layers.length === 0) {
        missing.push("Kamida bitta material qatlami");
        hasLayersError = true;
      }
      
      // Agar eshik/darvoza bo'lsa, kamida 1ta qatlam kerak
      if (currentConstructionType === "eshik_darvoza" && layers.length === 0) {
        missing.push("Kamida bitta material qatlami");
        hasLayersError = true;
      }
      
      // Har bir qatlamning to'liq to'ldirilganligini tekshirish
      if (currentConstructionType && 
          (currentConstructionType !== "deraza_balkon_eshiklari") && 
          layers.length > 0) {
        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          // Material nomi tekshiruvi
          if (!layer.name || layer.name === "Qurilish materialini tanlang" || layer.name === "Yangi qatlam") {
            missing.push(`${i + 1}-qatlam: Material tanlanmagan`);
            hasLayersError = true;
          }
          // Qalinlik tekshiruvi
          if (!layer.thickness_mm || layer.thickness_mm === "" || Number(layer.thickness_mm) <= 0) {
            missing.push(`${i + 1}-qatlam: Qalinlik kiritilmagan`);
            hasLayersError = true;
          }
          // Lambda tekshiruvi
          if (!layer.lambda || layer.lambda === "" || Number(layer.lambda) <= 0) {
            missing.push(`${i + 1}-qatlam: Issiqlik o'tkazuvchanlik koeffitsienti (λ) kiritilmagan`);
            hasLayersError = true;
          }
        }
      }
      
      // Agar xatolar bo'lsa, popup ko'rsatamiz va error flaglarini yoqamiz
      if (missing.length > 0) {
        setShowConstructionError(hasConstructionTypeError);
        setShowRibHeightError(hasRibHeightError);
        setShowLayersError(hasLayersError);
        setShowDerazaTypeError(hasDerazaTypeError);
        const msg = "QUYIDAGI MAYDONLARNI TO'LDIRING:\n\n" + missing.map(m => `• ${m}`).join("\n");
        window.alert(msg);
        return;
      }
      
      // Agar barcha maydonlar to'ldirilgan bo'lsa, shart bajarilganligini tekshiramiz
      
      // Deraza steplari uchun maxsus shart tekshiruvi
      if (currentConstructionType === "deraza_balkon_eshiklari") {
        if (RoTalDF != null) {
          // 1-variant Ro qiymatini hisoblash
          let windowRo = null;
          const hasVariant1 = selectedWindowGroup && selectedWindowVariant;
          if (hasVariant1) {
            const group = WINDOWS.find((w) => w.id === Number(selectedWindowGroup));
            if (group && Array.isArray(group.tur)) {
              const variant = group.tur.find((v) => v.name === selectedWindowVariant);
              if (variant) windowRo = variant.Ro;
            }
          }
          
          // 2-variant Ro qiymatini hisoblash
          let windowRo2 = null;
          const hasVariant2 = selectedWindowGroup2 && selectedWindowVariant2;
          if (hasVariant2) {
            const group = WINDOWS.find((w) => w.id === Number(selectedWindowGroup2));
            if (group && Array.isArray(group.tur)) {
              const variant = group.tur.find((v) => v.name === selectedWindowVariant2);
              if (variant) windowRo2 = variant.Ro;
            }
          }
          
          // Ikkala variant kiritilganligini tekshirish
          if (!hasVariant1 || !hasVariant2) {
            window.alert("IKKALA VARIANTNI KIRITING!\n\nDeraza/fonar uchun 1-variant va 2-variant kiritilishi shart.\n\nIltimos, ikkala variantni ham tanlang.");
            return;
          }
          
          // Ikkala variant kiritilgan bo'lsa, kamida bittasi shartni bajarishi kerak
          const variant1Passes = windowRo != null && windowRo >= RoTalDF;
          const variant2Passes = windowRo2 != null && windowRo2 >= RoTalDF;
          
          if (!variant1Passes && !variant2Passes) {
            window.alert("SHART BAJARILMADI!\n\nRₒ (tanlangan variant) < Rₒᵀᵃˡᴰᶠ (talab etilgan)\n\nTanlangan deraza/fonar variantlarining hech biri talab etilgan issiqlik qarshiligini ta'minlamaydi.");
            return;
          }
        }
      }
      // Eshik steplari uchun maxsus shart tekshiruvi - faqat RoTalED bilan
      else if (currentConstructionType === "eshik_darvoza") {
        if (Ro_calc != null && RoTalED != null && Ro_calc < RoTalED) {
          window.alert("SHART BAJARILMADI!\n\nRₒ (hisoblangan) < Rₒᵀᵃˡᴱᴰ (talab etilgan)\n\nHisoblangan qarshilik talab etilgan qarshilikdan kichik.");
          return;
        }
        // Eshik steplari uchun RoTalab bilan tekshirmaymiz, faqat RoTalED bilan
      }
      // Boshqa konstruksiya turlari uchun umumiy shart
      else {
        if (Ro_calc != null && RoTalab != null && Ro_calc < RoTalab) {
          window.alert("SHART BAJARILMADI!\n\nRₒ (hisoblangan) < Rₒᵀᵃˡ (talab etilgan)\n\nHisoblangan qarshilik talab etilgan qarshilikdan kichik.");
          return;
        }
      }
      
      // Hammasi to'g'ri bo'lsa, barcha xatolik flaglarini o'chiramiz va keyingi modul tanlash oynasini ochamiz
      console.log("✅ Validatsiya muvaffaqiyatli o'tdi, modal ochilmoqda");
      console.log("showNextStepChoice (oldin):", showNextStepChoice);
      setShowConstructionError(false);
      setShowRibHeightError(false);
      setShowLayersError(false);
      setShowDerazaTypeError(false);
      setShowNextStepChoice(true);
      console.log("setShowNextStepChoice(true) chaqirildi");
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

    // Vaqtincha o'chirilgan: normative_q tekshiruvi
    // if (step.id === "normative_q") {
    //   if (!hasHeatCalcVisited) {
    //     window.alert(
    //       "Avval to'suvchi konstruksiyalar bo'yicha issiqlik texnik hisob-kitoblarini kamida bir marta bajaring",
    //     );
    //     return;
    //   }
    //   
    //   // Heat calc steplarning validatsiyasini tekshirish
    //   const heatStepsToCheck = displaySteps.filter(ds => ds.kind === "heat");
    //   for (const heatStep of heatStepsToCheck) {
    //     if (!isStepLogicallyCompleted(heatStep)) {
    //       window.alert(
    //         "Barcha issiqlik texnik hisob-kitob bosqichlarini to'liq va to'g'ri bajarib bo'ling.\n\nShart bajarilmagan yoki ma'lumotlar to'liq kiritilmagan bosqichlar mavjud (sariq indeksli).",
    //       );
    //       return;
    //     }
    //   }
    // }

    syncHeatStepState(activeIndex, idx);
    setActiveIndex(idx);
  };

  // Hozirgi bosqich uchun alohida PDF eksport
  const handleExportCurrentStepPdf = () => {
    // 1-bosqich
    if (currentStepId === "initial") {
      exportInitialStepPdf({ initial, climate, heatingSeason });
      return;
    }

    // 2-bosqich (bino parametrlari)
    if (currentStepId === "building_parameters") {
      exportNormativeStepPdf({ initial });
      return;
    }

    // 4-bosqich (normativ)
    // Vaqtincha o'chirilgan
    // if (currentStepId === "normative_q") {
    //   exportNormativeStepPdf({ initial });
    //   return;
    // }

    // 3-bosqich (issiqlik texnik hisoblar)
    const isHeatCalcStep = currentStepId === "heat_calc_1" || currentDisplayStep?.kind === "heat";
    if (isHeatCalcStep) {
      // Avval hozirgi state ni saqlash
      if (currentDisplayStep?.kind === "heat") {
        saveHeatStepState(currentDisplayStep.id);
      }

      // Hozirgi heat step meta - heatSteps massividan id bo'yicha qidirish
      let heatStepMeta = null;
      if (currentDisplayStep?.kind === "heat") {
        // heatSteps massividan to'liq savedState bilan olish
        heatStepMeta = heatSteps.find(hs => hs.id === currentDisplayStep.id) || currentDisplayStep;
      } else if (heatSteps.length === 1) {
        // Bitta issiqlik bosqichi bo'lsa, shu yagona stepni olamiz
        heatStepMeta = heatSteps[0];
      }

      if (!heatStepMeta) {
        window.alert(
          "Avval to'suvchi konstruksiya bo'yicha kamida bitta issiqlik texnik hisobi bosqichini tanlang yoki saqlang.",
        );
        return;
      }

      // Agar savedState yo'q bo'lsa yoki layers bo'sh bo'lsa, hozirgi layers va normativ maydonlar bilan to'ldirish
      if (!heatStepMeta.savedState || !heatStepMeta.savedState.layers || heatStepMeta.savedState.layers.length === 0) {
        heatStepMeta = {
          ...heatStepMeta,
          savedState: {
            ...heatStepMeta.savedState,
            constructionType,
            ribHeightRatio,
            layers: layers.map(l => {
              const d_m = (Number(l.thickness_mm) || 0) / 1000;
              const lam = Number(l.lambda) || 0;
              const R = d_m > 0 && lam > 0 ? (d_m / lam).toFixed(2) : null;
              return { ...l, R };
            }),
            Ro_calc,
            RoTalab,
            R_k: Rk,
            Ro_MG: RoTalSG,
            t_in: climate?.t_in,
            t_out: climate?.t_out,
            t_is_dav: heatingSeason?.t_is_dav,
            Z_is_dav: heatingSeason?.Z_is_dav,
            D_d_dav: heatingSeason?.D_d_dav,

            // Normativ parametrlar va ularning jadval satr raqamlari (PDF kommentlar uchun)
            delta_t_n: deltaTtResult?.delta_tt,
            delta_t_n_row: deltaTtResult?.row,
            alpha_i: alphaI,
            alpha_i_row:
              constructionType === "tashqi_devor" ||
              constructionType === "tashqi_devor_ventfasad" ||
              constructionType === "eshik_darvoza"
                ? 1
                : (ribHeightRatio === "low" ? 1 : (ribHeightRatio === "high" ? 2 : null)),
            alpha_t: alphaT,
            alpha_t_row: (() => {
              const id = mapConstructionTypeToId(constructionType);
              if (id === "1" || id === "2" || id === "4") return 1;
              if (id === "5") return 2;
              if (id === "3" || id === "6" || id === "9") return 3;
              if (id === "7" || id === "8") return 4;
              return null;
            })(),

            protectionLevel: initial.protectionLevel,
            RoResult_row: RoResult?.row,
          }
        };
      }

      // Province va region nomlarini topish
      const provinceData = REGIONS.find(p => p.viloyat === initial.province);
      const provinceName = provinceData?.viloyat || initial.province || "Viloyat";
      const regionIndex = parseInt(initial.region, 10);
      const regionData = provinceData?.hududlar?.[regionIndex];
      const regionName = regionData?.hudud || (initial.region !== null && initial.region !== undefined && initial.region !== "" ? String(initial.region) : "Tuman/Shahar");

      // React-pdf bilan eksport (asosiy)
      const currentConstructionType = heatStepMeta?.savedState?.constructionType || constructionType;

      // Deraza/balkon eshiklari uchun alohida PDF layout
      if (currentConstructionType === "deraza_balkon_eshiklari") {
        exportWindowStepPdfReact({
          initial: {
            ...initial,
            provinceName,
            regionName,
          },
          climate,
          heatingSeason,
          heatStep: heatStepMeta,
        });
      } else if (currentConstructionType === "eshik_darvoza") {
        console.log('Eshik PDF export chaqirildi', {
          heatStepMeta: !!heatStepMeta,
          savedState: !!heatStepMeta?.savedState,
          layers: heatStepMeta?.savedState?.layers?.length,
          initial: !!initial,
          climate: !!climate,
          heatingSeason: !!heatingSeason
        });
        
        if (!heatStepMeta) {
          window.alert("Eshik PDF yaratish uchun avval ma'lumotlarni saqlang!");
          return;
        }
        
        if (!heatStepMeta.savedState || !heatStepMeta.savedState.layers || heatStepMeta.savedState.layers.length === 0) {
          window.alert("Eshik PDF yaratish uchun avval materiallarni tanlang va saqlang!");
          return;
        }
        
        exportDoorStepPdfReact({
          initial: {
            ...initial,
            provinceName,
            regionName,
          },
          climate,
          heatingSeason,
          heatStep: heatStepMeta,
          RoTalSG,
        });
      } else if (currentConstructionType === "floor_heat_calculation") {
        // Yerdagi pol uchun PDF eksport
        // floorData ni hozirgi layers dan hisoblash (UI dagi algoritmga mos)
        const regime = climate && climate.t_in != null && climate.phi_in != null
          ? getHumidityRegimeInfo(climate.t_in, climate.phi_in)?.regime || "normal"
          : "normal";
        const humidityCondition = (regime === "quruq" || regime === "normal") ? "A" : "B";

        // calculateYp funksiyasi ichida R, S, D ham hisoblanadi va steps to'liq shakllanadi
        const YpResult = calculateFloorYp(layers, humidityCondition);
        const YpNorm = getFloorAbsorptionNorm(initial?.objectType);

        // D_data ni calculateYp ichidagi D_values asosida qayta qurish
        let sum_D = 0;
        const D_steps = [];
        if (YpResult && Array.isArray(YpResult.D_values) && YpResult.D_values.length === layers.length) {
          YpResult.D_values.forEach((D_val, idx) => {
            const layer = layers[idx];
            const d_m = (Number(layer.thickness_mm) || 0) / 1000;
            const lam = Number(layer.lambda) || 0;
            const R_val = d_m > 0 && lam > 0 ? d_m / lam : 0;
            const s_raw = layer.s;
            const S_val = typeof s_raw === "object"
              ? Number(s_raw[humidityCondition] ?? s_raw.A ?? 0)
              : Number(s_raw ?? 0);

            sum_D += Number(D_val) || 0;

            D_steps.push({
              index: idx + 1,
              materialName: layer.name || `Qatlam ${idx + 1}`,
              R: R_val.toFixed(3),
              S: S_val.toFixed(2),
              D: (Number(D_val) || 0).toFixed(3),
            });
          });
        }

        exportFloorPdfReact({
          initial: {
            ...initial,
            provinceName,
            regionName,
          },
          climate,
          heatingSeason,
          floorData: {
            layers,
            humidityCondition,
            D_data: {
              steps: D_steps,
              sum_D
            },
            YpResult,
            YpNorm
          },
          saved: heatStepMeta?.savedState
        });
      } else {
        exportHeatStepPdfReact({
          initial: {
            ...initial,
            provinceName,
            regionName,
          },
          climate,
          heatingSeason,
          heatStep: heatStepMeta,
          CONSTRUCTION_TYPES,
        });
      }
      
      // pdfmake versiyasi (zaxira)
      // exportHeatStepPdf({
      //   initial,
      //   climate,
      //   heatingSeason,
      //   heatStep: heatStepMeta,
      //   CONSTRUCTION_TYPES,
      // });
      return;
    }

    window.alert("Bu bosqich uchun alohida PDF eksport hali qo'llab-quvvatlanmagan.");
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
              const isPastStep = idx < maxVisitedIndex;

              let isCompleted = false;
              let hasError = false;

              // Oddiy (no-heat) steplar uchun: faqat o'tilgan va mantiqan bajarilgan bo'lsa yashil check
              if (!isHeatCalc) {
                if (isPastStep && logicallyCompleted) {
                  isCompleted = true;
                }
              } else {
                // Issiqlik (2.n) steplari uchun: faqat stepdan o'tib ketilgandan keyin status ko'rsatamiz
                if (isPastStep) {
                  if (logicallyCompleted) {
                    // Shart bajarilgan bo'lsa – yashil check
                    isCompleted = true;
                  } else if (hasLeftInitialOnce) {
                    // Shart bajarilmagan bo'lsa va foydalanuvchi allaqachon dastlabki bosqichdan chiqqan bo'lsa – sariq nuqta
                    hasError = true;
                  }
                }
              }

              // Issiqlik steplarini o'chirish uchun handler
              // Devor/Ventfasad uchun maxsus logika: ikkala tur ham mavjud bo'lsa o'chirish mumkin
              const canDeleteHeatStep = (() => {
                if (!isHeatCalc || ds.kind !== "heat") return false;
                
                const stepConstructionType = ds.presetConstructionType || (ds.savedState?.constructionType);
                
                // Devor yoki Ventfasad bo'lsa
                if (stepConstructionType === "tashqi_devor" || stepConstructionType === "tashqi_devor_ventfasad") {
                  // Devor va Ventfasad steplarini sanash
                  const wallSteps = heatSteps.filter(step => {
                    const ct = step.presetConstructionType || step.savedState?.constructionType;
                    return ct === "tashqi_devor" || ct === "tashqi_devor_ventfasad";
                  });
                  // Agar ikkala tur ham mavjud bo'lsa (2 yoki undan ko'p), o'chirish mumkin
                  return wallSteps.length > 1;
                }
                
                // Boshqa konstruksiya turlari uchun: faqat 1 tadan ko'p bo'lsa o'chirish mumkin
                return heatSteps.length > 1;
              })();

              const handleDeleteHeatStep = (e) => {
                e.stopPropagation();
                if (!canDeleteHeatStep) return;
                
                // O'chirilayotgan stepdan oldingi steplar sonini hisoblaymiz
                const stepsBefore = displaySteps.slice(0, idx).length;
                
                setHeatSteps((prev) => prev.filter((h) => h.id !== ds.id));

                // Agar o'chirilayotgan step aktiv bo'lsa, to'g'ri indeksga o'tkazamiz
                if (isActive) {
                  // O'chirilgandan keyin yangi displaySteps
                  const newDisplaySteps = displaySteps.filter((h) => h.id !== ds.id);
                  // Oldingi steplar soni yangi massivda ham o'sha bo'ladi
                  const newActiveIndex = Math.min(stepsBefore, newDisplaySteps.length - 1);
                  setActiveIndex(newActiveIndex);
                }
              };

              return (
                <div key={ds.id} className="flex items-center gap-1">
                  <div className="relative">
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
                            className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-gray-300 hover:bg-gray-400 text-gray-700 shadow-sm z-10"
                            style={{ borderRadius: '70%' }}
                            aria-label="Issiqlik bosqichini o'chirish"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="w-2.5 h-2.5"
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

                      {(() => {
                        const isInitialStep = !isHeatCalc && ds.id === "initial";
                        const isBuildingStep = !isHeatCalc && ds.id === "building_parameters";
                        const isNormativeStep = !isHeatCalc && ds.id === "normative_q";
                        
                        // Har bir issiqlik stepida konstruksiya nomini ko'rsatish
                        if (isHeatCalc) {
                          const stepConstructionType = ds.presetConstructionType || (ds.kind === "heat" && ds.savedState?.constructionType);
                          const shortName = getShortConstructionName(stepConstructionType);
                          return (
                            <span className="text-left max-w-xs line-clamp-2 hidden sm:inline">
                              {shortName}
                            </span>
                          );
                        }
                        
                        // Oddiy steplar uchun
                        if (isInitialStep || isBuildingStep || isNormativeStep) {
                          return (
                            <span className="text-left max-w-xs line-clamp-2 hidden sm:inline">
                              {stepMeta.title}
                            </span>
                          );
                        }
                        
                        return null;
                      })()}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sarlavha va stepper boshqaruv tugmalari (Orqaga / Keyingi bosqich / Hozirgi bosqich PDF) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="text-lg md:text-xl font-semibold text-[#1080c2]">
                {currentStepMeta.title}
              </div>
              {/* Vaqtinchalik defaultlarni tozalash tugmasi */}
              <button
                onClick={clearTempDefaults}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors underline"
                title="Vaqtinchalik defaultlarni tozalash"
              >
                Defaultlarni tozalash
              </button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleExportCurrentStepPdf}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Hozirgi bosqich PDF
              </button>
              <WizardSecondaryButton onClick={goPrev} disabled={activeIndex === 0}>
                Orqaga
              </WizardSecondaryButton>
              <WizardPrimaryButton onClick={goNext}>
                Keyingi bosqich
              </WizardPrimaryButton>
            </div>
          </div>
        </div>

        {/* Quyida har bir bosqichning asosiy kontent bloki joylashgan (kartochka ko'rinishidagi blok). */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          {currentStepId === "initial" && (
            <InitialStep
              initial={initial}
              setInitial={setInitial}
              climate={climate}
              setClimate={setClimate}
              initialErrors={initialErrors}
              setInitialErrors={setInitialErrors}
              heatingSeason={heatingSeason}
              showProtectionInfo={showProtectionInfo}
              setShowProtectionInfo={setShowProtectionInfo}
              handleClimate={handleClimate}
              projectData={projectData}
              setProjectData={setProjectData}
            />
          )}

          {currentStepId === "building_parameters" && (
            <BuildingParametersStep 
              objectName={initial.objectName}
              climate={climate}
              heatingSeason={heatingSeason}
              layers={layers}
              onExportPDF={handleExportCurrentStepPdf}
              buildingParams={buildingParams}
              setBuildingParams={setBuildingParams}
              clearTempDefaults={clearTempDefaults}
            />
          )}

          {/* Vaqtincha o'chirilgan
          {currentStepId === "normative_q" && (
            <NormativeQStep 
              objectName={initial.objectName}
              climate={climate}
              heatingSeason={heatingSeason}
              layers={layers}
              setAirLayer={setAirLayer}
              initial={initial}
              RoTalab={RoTalab}
              deltaTtResult={deltaTtResult}
              showConstructionError={showConstructionError}
              showRibHeightError={showRibHeightError}
              selectedWindowGroup={selectedWindowGroup}
              setSelectedWindowGroup={setSelectedWindowGroup}
              selectedWindowVariant={selectedWindowVariant}
              setSelectedWindowVariant={setSelectedWindowVariant}
              selectedWindowGroup2={selectedWindowGroup2}
              setSelectedWindowGroup2={setSelectedWindowGroup2}
              selectedWindowVariant2={selectedWindowVariant2}
              setSelectedWindowVariant2={setSelectedWindowVariant2}
              currentDisplayStep={currentDisplayStep}
            />
          )}
        */}

          {currentStepId === "heat_calc_1" && (
            <>
              {currentDisplayStep?.presetConstructionType === "eshik_darvoza" ? (
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
                  onExportPDF={handleExportCurrentStepPdf}
                  stepNumber={currentDisplayStep?.label}
                  totalSteps={displaySteps.length}
                />
              ) : currentDisplayStep?.presetConstructionType === "deraza_balkon_eshiklari" ? (
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
                  selectedWindowGroup={selectedWindowGroup}
                  setSelectedWindowGroup={setSelectedWindowGroup}
                  selectedWindowVariant={selectedWindowVariant}
                  setSelectedWindowVariant={setSelectedWindowVariant}
                  selectedWindowGroup2={selectedWindowGroup2}
                  setSelectedWindowGroup2={setSelectedWindowGroup2}
                  selectedWindowVariant2={selectedWindowVariant2}
                  setSelectedWindowVariant2={setSelectedWindowVariant2}
                  onExportPDF={handleExportCurrentStepPdf}
                  stepNumber={currentDisplayStep?.label}
                  totalSteps={displaySteps.length}
                />
              ) : currentDisplayStep?.presetConstructionType === "floor_heat_calculation" ? (
                <FloorHeatCalculationStep
                  layers={layers}
                  setLayers={setLayers}
                  updateLayer={updateLayer}
                  removeLayer={removeLayer}
                  setMaterialModal={setMaterialModal}
                  draggingLayerId={draggingLayerId}
                  setDraggingLayerId={setDraggingLayerId}
                  moveLayer={moveLayer}
                  addLayer={addLayer}
                  airLayer={airLayer}
                  setAirLayer={setAirLayer}
                  hududLabel={hududLabel}
                  climate={climate}
                  heatingSeason={heatingSeason}
                  RoTalSG={RoTalSG}
                  RoTalab={RoTalab}
                  RoResult={RoResult}
                  Rk={Rk}
                  Ro_calc={Ro_calc}
                  alphaI={alphaI}
                  alphaT={alphaT}
                  deltaTtResult={deltaTtResult}
                  initial={initial}
                  showConstructionError={showConstructionError}
                  showRibHeightError={showRibHeightError}
                  showLayersError={showLayersError}
                  onExportPDF={handleExportCurrentStepPdf}
                  stepNumber={currentDisplayStep?.label}
                  totalSteps={displaySteps.length}
                  constructionType={constructionType}
                  setConstructionType={setConstructionType}
                  ribHeightRatio={ribHeightRatio}
                  setRibHeightRatio={setRibHeightRatio}
                />
              ) : (
                <EnclosureStep
                  constructionType={constructionType}
                  setConstructionType={setConstructionType}
                  filteredConstructionTypes={filteredConstructionTypes}
                  ribHeightRatio={ribHeightRatio}
                  setRibHeightRatio={setRibHeightRatio}
                  showRibInfo={showRibInfo}
                  setShowRibInfo={setShowRibInfo}
                  derazaType={derazaType}
                  setDerazaType={setDerazaType}
                  hududLabel={`${initial.province || ''} - ${initial.region || ''}`}
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
                  initial={initial}
                  RoTalab={RoTalab}
                  deltaTtResult={deltaTtResult}
                  showConstructionError={showConstructionError}
                  showRibHeightError={showRibHeightError}
                  selectedWindowGroup={selectedWindowGroup}
                  setSelectedWindowGroup={setSelectedWindowGroup}
                  selectedWindowVariant={selectedWindowVariant}
                  setSelectedWindowVariant={setSelectedWindowVariant}
                  selectedWindowGroup2={selectedWindowGroup2}
                  setSelectedWindowGroup2={setSelectedWindowGroup2}
                  selectedWindowVariant2={selectedWindowVariant2}
                  setSelectedWindowVariant2={setSelectedWindowVariant2}
                  showLayersError={showLayersError}
                  showDerazaTypeError={showDerazaTypeError}
                  onExportPDF={handleExportCurrentStepPdf}
                  stepNumber={currentDisplayStep?.label}
                  totalSteps={displaySteps.length}
                />
              )}
            </>
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

        {/* 3-bosqichda (issiqlik texnik hisobi) "Keyingi bosqich" tugmasi */}
        {currentStepId === "heat_calc_1" && (
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

                {/* Variantlar – asosiy yo'nalishlar */}
                <div className="space-y-3">
                  {/* Devor - faqat Devor yo'q bo'lsa ko'rinadi */}
                  {!heatSteps.some(step => {
                    const ct = step.presetConstructionType || step.savedState?.constructionType;
                    return ct === "tashqi_devor";
                  }) && (
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                      onClick={() => {
                        // Joriy stepni saqlash
                        if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                          saveHeatStepState(currentDisplayStep.id);
                        }

                        // Devor uchun yangi issiqlik hisobi
                        const newId = `heat-${Date.now()}`;
                        const newStepIndex = 2 + heatSteps.length;

                        setHeatSteps((prev) => [
                          ...prev,
                          { id: newId, kind: "heat", presetConstructionType: "tashqi_devor" },
                        ]);

                        // Yangi step uchun bo'sh holat
                        setConstructionType("tashqi_devor");
                        setRibHeightRatio("");
                        setLayers([
                          { id: Date.now(), name: "Qurilish materialini tanlang", thickness_mm: "", rho: "", lambda: "", mu: 10 },
                        ]);
                        setAirLayer({ enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });

                        setActiveIndex(newStepIndex);
                        setShowNextStepChoice(false);
                      }}
                    >
                      Tashqi devor bo'yicha issiqlik texnik hisob-kitobi
                    </button>
                  )}

                  {/* Ventfasad - faqat Ventfasad yo'q bo'lsa ko'rinadi */}
                  {!heatSteps.some(step => {
                    const ct = step.presetConstructionType || step.savedState?.constructionType;
                    return ct === "tashqi_devor_ventfasad";
                  }) && (
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                      onClick={() => {
                        // Joriy stepni saqlash
                        if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                          saveHeatStepState(currentDisplayStep.id);
                        }

                        // Ventfasad uchun yangi issiqlik hisobi
                        const newId = `heat-${Date.now()}`;
                        const newStepIndex = 2 + heatSteps.length;

                        setHeatSteps((prev) => [
                          ...prev,
                          { id: newId, kind: "heat", presetConstructionType: "tashqi_devor_ventfasad" },
                        ]);

                        // Yangi step uchun bo'sh holat
                        setConstructionType("tashqi_devor_ventfasad");
                        setRibHeightRatio("");
                        setLayers([
                          { id: Date.now(), name: "Qurilish materialini tanlang", thickness_mm: "", rho: "", lambda: "", mu: 10 },
                        ]);
                        setAirLayer({ enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });

                        setActiveIndex(newStepIndex);
                        setShowNextStepChoice(false);
                      }}
                    >
                      Ventfasad bo'yicha issiqlik texnik hisob-kitobi
                    </button>
                  )}

                  {/* To'suvchi konstruksiya (boshqa turlar) - har doim ko'rinadi */}
                  {!heatSteps.some(step => step.presetConstructionType === null) && (
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                      onClick={() => {
                        // Joriy stepni saqlash
                        if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                          saveHeatStepState(currentDisplayStep.id);
                        }

                        // Umumiy to'suvchi konstruksiya uchun yangi issiqlik hisobi
                        const newId = `heat-${Date.now()}`;
                        const newStepIndex = 2 + heatSteps.length;

                        setHeatSteps((prev) => [
                          ...prev,
                          { id: newId, kind: "heat", presetConstructionType: null },
                        ]);

                        // Yangi step uchun bo'sh holat
                        setConstructionType("");
                        setRibHeightRatio("");
                        setLayers([
                          { id: Date.now(), name: "Qurilish materialini tanlang", thickness_mm: "", rho: "", lambda: "", mu: 10 },
                        ]);
                        setAirLayer({ enabled: false, thickness_mm: "", layerTemp: "positive", foilBothSides: false });

                        setActiveIndex(newStepIndex);
                        setShowNextStepChoice(false);
                      }}
                    >
                      Boshqa to'suvchi konstruksiya bo'yicha issiqlik texnik hisob-kitobi
                    </button>
                  )}

                  {/* Oyna, eshik va pol tugmalari - faqat to'suvchi konstruksiya hisobi bajarilganda ko'rinadi */}
                  {(() => {
                    const hasEnclosureCalculation = heatSteps.some(step => 
                      step.presetConstructionType !== "eshik_darvoza" && 
                      step.presetConstructionType !== "deraza_balkon_eshiklari" &&
                      step.presetConstructionType !== "floor_heat_calculation"
                    );
                    console.log("🔍 Modal: heatSteps =", heatSteps);
                    console.log("🔍 Modal: hasEnclosureCalculation =", hasEnclosureCalculation);
                    return hasEnclosureCalculation;
                  })() && (
                    <>
                      {!heatSteps.some(step => step.presetConstructionType === "deraza_balkon_eshiklari") && (
                        <button
                          type="button"
                          className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                          onClick={() => {
                            // Joriy stepni saqlash
                            if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                              saveHeatStepState(currentDisplayStep.id);
                            }

                            // Deraza/balkon eshiklari uchun yangi issiqlik hisobi
                            const newId = `heat-${Date.now()}`;
                            const newStepIndex = 2 + heatSteps.length; // 0:initial, 1:building, 2+: heat steps

                            setHeatSteps((prev) => [
                              ...prev,
                              {
                                id: newId,
                                kind: "heat",
                                presetConstructionType: "deraza_balkon_eshiklari",
                              },
                            ]);
                            
                            setActiveIndex(newStepIndex);
                            setShowNextStepChoice(false);
                          }}
                        >
                          Deraza va balkon eshiklari bo'yicha issiqlik texnik hisob-kitobi
                        </button>
                      )}

                      {!heatSteps.some(step => step.presetConstructionType === "eshik_darvoza") && (
                        <button
                          type="button"
                          className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                          onClick={() => {
                            // Joriy stepni saqlash
                            if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                              saveHeatStepState(currentDisplayStep.id);
                            }

                            // Eshik/darvozalar uchun yangi issiqlik hisobi
                            const newId = `heat-${Date.now()}`;
                            const newStepIndex = 2 + heatSteps.length; // 0:initial, 1:building, 2+: heat steps

                            setHeatSteps((prev) => [
                              ...prev,
                              {
                                id: newId,
                                kind: "heat",
                                presetConstructionType: "eshik_darvoza",
                              },
                            ]);
                            
                            setActiveIndex(newStepIndex);
                            setShowNextStepChoice(false);
                          }}
                        >
                          Eshik va darvozalar bo'yicha issiqlik texnik hisob-kitobi
                        </button>
                      )}

                      {!heatSteps.some(step => step.presetConstructionType === "floor_heat_calculation") && (
                        <button
                          type="button"
                          className="w-full px-4 py-2 rounded-xl border border-[#1080c2]/70 text-[#1080c2] font-semibold hover:bg-[#1080c2]/5 text-left text-xs md:text-sm"
                          onClick={() => {
                            // Joriy stepni saqlash
                            if (currentDisplayStep && currentDisplayStep.kind === "heat") {
                              saveHeatStepState(currentDisplayStep.id);
                            }

                            // Yerdagi pol uchun yangi issiqlik hisobi
                            const newId = `heat-${Date.now()}`;
                            const newStepIndex = 2 + heatSteps.length; // 0:initial, 1:building, 2+: heat steps

                            setHeatSteps((prev) => [
                              ...prev,
                              {
                                id: newId,
                                kind: "heat",
                                presetConstructionType: "floor_heat_calculation",
                              },
                            ]);
                            
                            setActiveIndex(newStepIndex);
                            setShowNextStepChoice(false);
                          }}
                        >
                          Yerdagi pol bo'yicha issiqlik texnik hisob-kitobi
                        </button>
                      )}
                    </>
                  )}

                  {/* Vaqtincha o'chirilgan: Isitishga me'yoriy solishtirma issiqlik sarfi hisobi */}
                  {/* 
                  {(() => {
                    const hasEnclosureCalculation = heatSteps.some(step => 
                      step.presetConstructionType !== "eshik_darvoza" && 
                      step.presetConstructionType !== "deraza_balkon_eshiklari" &&
                      step.presetConstructionType !== "floor_heat_calculation"
                    );
                    return hasEnclosureCalculation;
                  })() && (
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
                  )}
                  */}
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
                let s = l.s;
                if (v) {
                  const pickedLambda = pickLambdaForVariant(v);
                  if (pickedLambda != null) lambda = pickedLambda;
                  if (typeof v.mu === "number") mu = v.mu;
                  if (v.density != null || v.zichlik != null) rho = v.density ?? v.zichlik;
                  if (v.s != null) s = v.s;
                }

                return {
                  ...l,
                  name: material?.name || material?.material_name || l.name,
                  materialId: material?.id || materialId || l.materialId,
                  variantIdx: v ? String(idx) : null,
                  lambda: lambda !== undefined && lambda !== null && lambda !== "" ? Number(lambda) : l.lambda,
                  mu,
                  rho,
                  s,
                };
              }),
            );
          }}
        />
      </div>
    </div>
  );
}
