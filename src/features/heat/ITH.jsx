import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { REGIONS } from "./data/regions";
import { MATERIALS } from "./data/materials";
import { CONSTRUCTION_TYPES } from "./data/constructionTypes";
import { ProtectionLevelNoteText } from "./heatSharedTexts";
import { CustomSelect, CustomRegionSelect } from "./controls/HeatSelects";
import { ConstructionIndicatorsPanel, AirLayerControls } from "./controls/ConstructionBlocks";
import { MaterialLayersTable } from "./controls/MaterialLayersTable";
import { MaterialTreeModal } from "./controls/MaterialTreeModal";
import { ProtectionLevelInfoModal, RibHeightInfoModal } from "./controls/InfoModals";
import { RO_TABLES } from "./data/roTables";

export default function IssiqlikTexnikHisob() {
  const [showInitial, setShowInitial] = useState(true);
  const [initial, setInitial] = useState({
    province: "",
    region: "",
    objectType: "",
    protectionLevel: "",
    floors: "",
  });
  const [constructionType, setConstructionType] = useState("");
  const [ribHeightRatio, setRibHeightRatio] = useState(""); // h/a tanlovi (qovurg'a balandligi)
  const [climate, setClimate] = useState({
    t_in: 20, // °C
    phi_in: 55, // %
    t_out: -7, // °C (eng sovuq oy yoki hudud bo'yicha)
    phi_out: 82, // %
  });

  const [layers, setLayers] = useState([
    // Namuna qatlamlari (ichkaridan tashqariga)
    { id: 1, name: "Qurilish materiali", thickness_mm: "", rho: "", lambda: "", mu: 10 },
  ]);

  const [airLayer, setAirLayer] = useState({
    enabled: false,
    thickness_mm: "",
    layerTemp: "positive", // "positive" (musbat) yoki "negative" (manfiy)
    foilBothSides: false,
  });

  const [showProtectionInfo, setShowProtectionInfo] = useState(false);

  const [showRibInfo, setShowRibInfo] = useState(false);

  useEffect(() => {
    if (!showProtectionInfo) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowProtectionInfo(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showProtectionInfo]);

  useEffect(() => {
    if (!showRibInfo) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowRibInfo(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showRibInfo]);

  const [materialModal, setMaterialModal] = useState({ open: false, layerId: null });
  const [draggingLayerId, setDraggingLayerId] = useState(null);

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

  const handleClimate = (e) => {
    const { name, value } = e.target;
    setClimate((s) => ({ ...s, [name]: Number(value) }));
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

  // Sirt qarshiliklari (SP/SNiP analoglari uchun default qiymatlar)
  const Rsi = 0.13; // ichki sirt
  const Rse = 0.04; // tashqi sirt

  // Qatlam bo'yicha R_i = d(m)/lambda (material qatlamlari)
  const R_layers = useMemo(() => {
    return layers.reduce((sum, L) => {
      const d_m = (Number(L.thickness_mm) || 0) / 1000;
      const lam = Number(L.lambda) || 0;
      if (d_m > 0 && lam > 0) return sum + d_m / lam;
      return sum;
    }, 0);
  }, [layers]);

  // Berk havo qatlami uchun termik qarshilik R_h.q jadvali (2-ilova bo'yicha TO'LDIRILISHI KERAK)
  // Tuzilma:
  // AIR_LAYER_R_TABLE[qatlam_harorati][oqim_kategoriyasi][qalinlik_mm]
  //  - qatlam_harorati: 'positive' | 'negative'
  //  - oqim_kategoriyasi: 'vertical_or_up' | 'horizontal_up' | 'horizontal_down'
  //  - qalinlik_mm: '10' | '20' | '30' | '50' | '100' | '150' | '200_300'
  const AIR_LAYER_R_TABLE = {
    positive: {
      vertical_or_up: {
        '10': 0.13,
        '20': 0.14,
        '30': 0.14,
        '50': 0.14,
        '100': 0.15,
        '150': 0.15,
        '200_300': 0.15,
      },
      horizontal_up: {
        '10': 0.13,
        '20': 0.14,
        '30': 0.14,
        '50': 0.14,
        '100': 0.15,
        '150': 0.15,
        '200_300': 0.15,
      },
      horizontal_down: {
        '10': 0.14,
        '20': 0.15,
        '30': 0.16,
        '50': 0.17,
        '100': 0.18,
        '150': 0.19,
        '200_300': 0.19,
      },
    },
    negative: {
      vertical_or_up: {
        '10': 0.15,
        '20': 0.15,
        '30': 0.16,
        '50': 0.17,
        '100': 0.18,
        '150': 0.18,
        '200_300': 0.19,
      },
      horizontal_up: {
        '10': 0.15,
        '20': 0.15,
        '30': 0.16,
        '50': 0.17,
        '100': 0.18,
        '150': 0.18,
        '200_300': 0.19,
      },
      horizontal_down: {
         '10': 0.15,
        '20': 0.19,
        '30': 0.21,
        '50': 0.21,
        '100': 0.23,
        '150': 0.24,
        '200_300': 0.24,
      },
    },
  };

  function getAirLayerFlowCategory(constructionType) {
    const id = mapConstructionTypeToId(constructionType);
    if (!id) return null;
    if (id === '1' || id === '2') return 'vertical_or_up';
    if (id === '3' || id === '4') return 'horizontal_up';
    if (id === '5' || id === '6' || id === '7' || id === '8' || id === '9') return 'horizontal_down';
    return null;
  }

  const Rhq = useMemo(() => {
    if (!airLayer.enabled) return 0;

    const thicknessKey = airLayer.thickness_mm || null;
    if (!thicknessKey) return 0;

    const tempKey = airLayer.layerTemp === 'negative' ? 'negative' : 'positive';
    const flowCategory = getAirLayerFlowCategory(constructionType);
    if (!flowCategory) return 0;

    const byTemp = AIR_LAYER_R_TABLE[tempKey] || {};
    const byFlow = byTemp[flowCategory] || {};
    const base = byFlow[thicknessKey];

    let value = typeof base === 'number' ? base : 0;

    // Agar havo qatlamining bir yoki ikkala yuzasi alyumin zar qog'oz bilan yelimlangan bo'lsa,
    // 2-ilova eslatmasiga binoan R qiymatini 2 martaga oshirish kerak.
    if (airLayer.foilBothSides && value > 0) {
      value = value * 2;
    }

    return value;
  }, [airLayer, constructionType]);

  const Rk = useMemo(() => {
    return R_layers + (Rhq || 0);
  }, [R_layers, Rhq]);

  // To'suvchi konstruksiyalarning ichki yuzasining issiqlik berish koeffitsienti, α_i (5-jadval bo'yicha)
  const alphaI = useMemo(() => {
    if (!constructionType) return null;
    // 1. Tashqi devor va 2. Ventilyatsiyalangan tashqi devor (ventfasad)
    if (constructionType === "tashqi_devor" || constructionType === "tashqi_devor_ventfasad") return 8.7;

    // Boshqa konstruksiyalar (2–8-bandlar) uchun h/a nisbatiga bog'liq
    if (!ribHeightRatio) return null;
    if (ribHeightRatio === "low") return 8.7; // h/a ≤ 0.3
    if (ribHeightRatio === "high") return 7.6; // h/a > 0.3
    return null;
  }, [constructionType, ribHeightRatio]);

  // To'suvchi konstruksiyalarning tashqi yuzasining issiqlik berish koeffitsienti, α_t (QMQ 2.01.04-18, 6-jadval)
  const alphaT = useMemo(() => {
    const id = mapConstructionTypeToId(constructionType);
    if (!id) return null;

    // 1,2,4-konstruksiya turlari uchun 23; 5-tur uchun 17; 3,6,9-turlar uchun 12; 7,8-turlar uchun 6
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

  // Konstruksiya turi o'zgarganda qovurg'a balandligi tanlovini tozalash
  useEffect(() => {
    setRibHeightRatio("");
  }, [constructionType]);

  // ==== Δt_t (normativ harorat farqi) hisoblash – QMQ 2.01.04-2018, 4-jadval bo'yicha ====
  function getNormativePhi(objectType) {
    // Nisbiy namliklar (φ) – decimal ko'rinishda
    switch (objectType) {
      case "1": // Turar joy va sh.k. (3 qavatgacha)
      case "2": // Turar joy va sh.k. (3 qavatdan yuqori)
        return 0.55;
      case "3": // Boshqa jamoat binolari
        return 0.5;
      case "4": // Quruq va normal rejimli ishlab chiqarish
        return 0.5;
      case "5": // Nam va ho'l rejimli ishlab chiqarish
        return 0.65;
      case "6": // Kartoshka va sabzavot omborlari
        return 0.75;
      case "7": // Issiqligi keragidan ortiq ishlab chiqarish
        return 0.5;
      default:
        return 0.5;
    }
  }

  function computeDewPoint(t_i, objectType, phiOverride) {
    const phi = typeof phiOverride === "number" && phiOverride > 0 && phiOverride <= 1
      ? phiOverride
      : getNormativePhi(objectType);
    const alpha = Math.log(phi) + (17.27 * t_i) / (237.7 + t_i);
    const t_p = (237.7 * alpha) / (17.27 - alpha);
    return t_p;
  }

  function mapConstructionTypeToId(ct) {
    switch (ct) {
      case "tashqi_devor":
        return "1";
      case "tashqi_devor_ventfasad":
        return "2";
      case "tom_ochiq_chordoq":
        return "3";
      case "chordoq_orayopma":
        return "4";
      case "otish_joyi_orayopma":
        return "5";
      case "yertola_tashqi_havo_boglangan":
        return "6";
      case "isitilmaydigan_yertola_yoruglik_oraliqli":
        return "7";
      case "isitilmaydigan_yertola_yuqori_yorugliksiz":
        return "8";
      case "isitilmaydigan_texnik_tagxona_pastda":
        return "9";
      default:
        return null;
    }
  }

  function mapConstructionTypeToGroup(id) {
    if (id === "1" || id === "9") return "outer_walls";
    if (id === "2" || id === "3") return "attic_and_top_floor_slabs";
    if (id === "4" || id === "5" || id === "6" || id === "7" || id === "8") return "transition_and_unheated_spaces";
    return null;
  }

  // 3-jadval bo'yicha n koeffitsienti (konstruksiya turiga qarab)
  function getNByConstructionId(id) {
    if (!id) return null;
    if (id === "1" || id === "2" || id === "3" || id === "5") return 1.0;
    if (id === "4" || id === "6") return 0.8;
    if (id === "7") return 0.7;
    if (id === "8") return 0.6;
    if (id === "9") return 0.4;
    return null;
  }

  function mapObjectTypeToCategory(objType) {
    switch (objType) {
      case "3":
        return "quruq_normal_ishlab_chiqarish";
      case "4":
        return "nam_hol_ishlab_chiqarish";
      case "5":
        return "kartoshka_sabzavot_ombor";
      default:
        return "boshqa"; // turar joy, jamoat binolari va boshqalar
    }
  }

  function computeDeltaTt(objectType, constructionType, t_i) {
    const constructionTypeId = mapConstructionTypeToId(constructionType);
    if (!objectType || !constructionTypeId || t_i == null) {
      return {
        delta_tt: null,
        t_i: t_i ?? null,
        t_p: null,
        formula_used: null,
        category: null,
        construction_type_id: constructionTypeId,
      };
    }

    const group = mapConstructionTypeToGroup(constructionTypeId);
    const category = mapObjectTypeToCategory(objectType);

    let t_p = null;
    let delta = null;
    let formula_used = "fixed_value";

    // QMQ 2.01.04-2018, 4-jadvalga muvofiq
    const phiOverride = typeof climate?.phi_in === "number" && climate.phi_in > 0 && climate.phi_in <= 100
      ? climate.phi_in / 100
      : null;

    if (category === "quruq_normal_ishlab_chiqarish") {
      t_p = computeDewPoint(t_i, objectType, phiOverride);
      const raw = t_i - t_p;
      if (group === "outer_walls") {
        delta = Math.min(raw, 7);
        formula_used = "limited_to_7";
      } else if (group === "attic_and_top_floor_slabs") {
        delta = Math.min(raw, 6);
        formula_used = "limited_to_6";
      } else {
        // Boshqa konstruksiyalar uchun shu toifada aniq jadval ma'lum emas – natijani null qilamiz
        delta = null;
        formula_used = null;
      }
    } else if (category === "nam_hol_ishlab_chiqarish") {
      t_p = computeDewPoint(t_i, objectType, phiOverride);
      const raw = t_i - t_p;
      delta = 0.8 * raw;
      formula_used = "0.8*(t_i_minus_t_p)";
    } else if (category === "kartoshka_sabzavot_ombor") {
      t_p = computeDewPoint(t_i, objectType, phiOverride);
      delta = t_i - t_p;
      formula_used = "t_i_minus_t_p";
    } else if (category === "boshqa") {
      // Turar joy va jamoat binolari uchun – 4-jadvaldagi qat'iy qiymatlar (misol asosida)
      if (group === "outer_walls") {
        delta = 4.0;
      } else if (group === "attic_and_top_floor_slabs") {
        delta = 3.5;
      } else if (group === "transition_and_unheated_spaces") {
        delta = 2.0;
      } else {
        delta = null;
        formula_used = null;
      }
      // Bu hollarda t_p ishlatilmaydi
      t_p = null;
      formula_used = delta != null ? "fixed_value" : null;
    }

    return {
      delta_tt: delta,
      t_i,
      t_p,
      formula_used,
      category,
      construction_type_id: constructionTypeId,
    };
  }

  const deltaTtResult = useMemo(
    () => computeDeltaTt(initial.objectType, constructionType, climate.t_in),
    [initial.objectType, constructionType, climate.t_in, climate.phi_in]
  );

  // Build province and region lists
  const provinces = useMemo(() => (REGIONS || []).map((p) => p?.viloyat || ""), [REGIONS]);
  const regionsOfSelected = useMemo(() => {
    const prov = (REGIONS || []).find((p) => p?.viloyat === initial.province);
    return (prov?.hududlar || []).map((h, idx) => {
      const t092 = h?.eng_sov_davr_harorat?.["yillik_taminot_b"]?.["0,92"];
      const t5 = h?.eng_sov_davr_harorat?.["yillik_taminot_5_kunlik"];
      return {
        id: String(idx),
        label: h?.hudud || "",
        t_out: typeof t092 === 'number' ? t092 : (typeof t5 === 'number' ? t5 : undefined),
      };
    });
  }, [REGIONS, initial.province]);

  // Helper: districts of a province with computed t_out
  const getDistricts = (provinceName) => {
    const prov = (REGIONS || []).find((p) => p?.viloyat === provinceName);
    return (prov?.hududlar || []).map((h, idx) => {
      const t092 = h?.eng_sov_davr_harorat?.["yillik_taminot_b"]?.["0,92"];
      const t5 = h?.eng_sov_davr_harorat?.["yillik_taminot_5_kunlik"];
      return {
        id: String(idx),
        label: h?.hudud || "",
        t_out: typeof t092 === 'number' ? t092 : (typeof t5 === 'number' ? t5 : undefined),
      };
    });
  };

  // Isitish davrining gradus-sutkasi uchun yordamchi qiymatlar (t_is_dav va Z_is_dav)
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
  }, [REGIONS, initial.province, initial.region, climate.t_in]);

  // ==== Ro^pr (2a/2b/2v jadval) bo'yicha Ro hisoblash uchun yordamchilar ====
  function mapObjectTypeToRoCategory(objectType) {
    // 1: Turar joy, davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar (3 qavatgacha) → res_low
    // 2: Turar joy, davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar (3 qavatdan yuqori) → res_high
    // 3: Jamoat binolari → public
    // 4–7: Ishlab chiqarish va ombor turlari → industrial
    switch (objectType) {
      case "1":
        return "res_low";
      case "2":
        return "res_high";
      case "3":
        return "public";
      case "4":
      case "5":
      case "6":
      case "7":
        return "industrial";
      default:
        return null;
    }
  }

  function mapDHeatingToBand(D_is_dav) {
    if (D_is_dav == null) return null;
    const D = Number(D_is_dav);
    if (!Number.isFinite(D)) return null;
    if (D < 2000) return "lt_2000";
    if (D <= 3000) return "2000_3000";
    return "gt_3000";
  }

  function getRoPrFromTables(protectionLevel, objectType, floors, D_is_dav, constructionTypeId) {
    // floors parametrini kelajakda kerak bo'lsa deb saqlab qolamiz, lekin hozirgi RO_TABLES tuzilmasida ishlatilmaydi
    if (!protectionLevel || !objectType || D_is_dav == null || !constructionTypeId) return null;

    const level = protectionLevel; // 'I', 'II', 'III'
    const category = mapObjectTypeToRoCategory(objectType);
    const Dband = mapDHeatingToBand(D_is_dav);

    if (!level || !category || !Dband) return null;

    const byLevel = RO_TABLES?.[level];
    const byCategory = byLevel?.[category];
    const byD = byCategory?.[Dband];
    const value = byD?.[constructionTypeId];

    if (typeof value === "number" && value > 0) return value;
    return null;
  }

  const RoResult = useMemo(() => {
    const constructionTypeId = mapConstructionTypeToId(constructionType);
    const RoPr = getRoPrFromTables(initial.protectionLevel, initial.objectType, initial.floors, heatingSeason.D_is_dav, constructionTypeId);
    const n = getNByConstructionId(constructionTypeId);

    if (RoPr == null || n == null) {
      return { Ro: null, RoPr: RoPr ?? null, n: n ?? null };
    }

    return {
      RoPr,
      n,
      Ro: RoPr * n,
    };
  }, [initial.protectionLevel, initial.objectType, initial.floors, heatingSeason.D_is_dav, constructionType, REGIONS]);

  // Sanitariya-gigiena talablariga muvofiq me'yoriy (ruxsat etilgan maksimal) qarshilik, RoTal.SG
  const RoTalSG = useMemo(() => {
    const constructionTypeId = mapConstructionTypeToId(constructionType);
    const n = getNByConstructionId(constructionTypeId);
    const deltaTt = deltaTtResult?.delta_tt;
    const alpha = alphaI;
    const ti = climate.t_in;
    const tt = climate.t_out; // tashqi havoning hisobiy qishki harorati (0,92 ta'minot bo'yicha)

    if (
      n == null ||
      deltaTt == null ||
      !alpha ||
      ti == null ||
      tt == null ||
      !Number.isFinite(ti) ||
      !Number.isFinite(tt) ||
      !Number.isFinite(deltaTt) ||
      !Number.isFinite(alpha) ||
      deltaTt === 0 ||
      alpha === 0
    ) {
      return null;
    }

    const numerator = n * (ti - tt);
    const denominator = deltaTt * alpha;
    if (!Number.isFinite(denominator) || denominator === 0) return null;

    return numerator / denominator;
  }, [constructionType, deltaTtResult, alphaI, climate.t_in, climate.t_out]);

  const RoTalab = useMemo(() => {
    const a = typeof RoTalSG === "number" && Number.isFinite(RoTalSG) ? RoTalSG : null;
    const b =
      RoResult && typeof RoResult.Ro === "number" && Number.isFinite(RoResult.Ro)
        ? RoResult.Ro
        : null;

    if (a == null && b == null) return null;
    if (a == null) return b;
    if (b == null) return a;
    return Math.max(a, b);
  }, [RoTalSG, RoResult]);

  // Materials flatten for dropdown
  const materialOptions = useMemo(() => {
    const opts = [];
    (MATERIALS || []).forEach((group) => {
      (group.classes || []).forEach((cls) => {
        (cls.materials || []).forEach((m) => {
          opts.push({ value: m.id, label: m.name, material: m });
        });
      });
    });
    return opts;
  }, []);

  const getMaterialById = (id) => materialOptions.find((o) => o.value === id)?.material;
  const getVariantOptions = (mat) => {
    const variants = mat?.variants || [];
    return variants.map((v, idx) => ({ value: String(idx), label: `${v.density} kg/m³`, variant: v }));
  };

  // Rule: lambda A/B by indoor climate
  const useLambdaA = useMemo(() => {
    const t = Number(climate.t_in);
    const h = Number(climate.phi_in);
    if (t <= 12 && h <= 75) return true;
    if (t > 12 && t <= 24 && h <= 60) return true;
    if (t > 24 && h <= 50) return true;
    return false;
  }, [climate.t_in, climate.phi_in]);

  // Re-apply lambda when climate rule toggles A/B
  useEffect(() => {
    setLayers((prev) => prev.map((l) => {
      if (!l.materialId || l.variantIdx == null || l.variantIdx === "" || Number(l.variantIdx) < 0) return l;
      const mat = getMaterialById(l.materialId);
      const v = (mat?.variants || [])[Number(l.variantIdx)];
      if (!v) return l;
      const lambda = useLambdaA ? (v.lambda?.A ?? v.lambda_0 ?? l.lambda) : (v.lambda?.B ?? v.lambda_0 ?? l.lambda);
      return { ...l, lambda: Number(lambda) };
    }));
  }, [useLambdaA]);

  // MaterialTreeModal endi alohida komponent sifatida import qilinadi, takrorlash oldini olish uchun

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-6">
      <style>{`
        .heat-select:invalid { color: #9ca3af; }
        .heat-select option { color: #111827; }
      `}</style>
      {/* Dastlabki ma'lumotlar (collapsible) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dastlabki ma'lumotlar</h1>
          <button
            type="button"
            onClick={() => setShowInitial((v) => !v)}
            aria-label="Blokni yashirish/ko'rsatish"
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`w-6 h-6 transform transition-transform ${showInitial ? '' : 'rotate-180'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showInitial && (
          <div className="mt-6 space-y-6">
            {/* 1) Obekt turi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Obekt turi</label>
              <CustomSelect
                value={initial.objectType}
                onChange={(val) => setInitial((s) => ({ ...s, objectType: val }))}
                placeholder="Tanlang"
                options={[
                  { value: "1", label: "Turar joy, davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar (3 qavatgacha)" },
                  { value: "2", label: "Turar joy, davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar (3 qavatdan yuqori)" },
                  { value: "3", label: "Jamoat binolari, 1-bandda ko'rsatilgandan tashqari, ma'muriy va maishiy binolar, nam va ho'l rejimli xonalarni istisno qilganda" },
                  { value: "4", label: "Quruq va normal rejimli ishlab chiqarish binolari" },
                  { value: "5", label: "Nam va ho'l rejimli ishlab chiqarish xonalari va boshqa xonalar" },
                  { value: "6", label: "Kartoshka va sabzavot omborlari" },
                  { value: "7", label: "Issiqligi keragidan ortiq bo'lgan (23 Vt/m3 dan ortiq) va ichki havosining hisobiy nisbiy namligi 50%dan oshmagan ishlab chiqarish binolari" },
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
                  onSelectProvince={(prov) => setInitial((s) => ({ ...s, province: prov, region: "" }))}
                  onSelectDistrict={(id, tOut) => {
                    setInitial((s) => ({ ...s, region: id }));
                    if (typeof tOut === 'number') {
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
                  onChange={(val) => setInitial((s) => ({ ...s, protectionLevel: val }))}
                  placeholder="Tanlang"
                  options={[{ value: "I", label: "I" }, { value: "II", label: "II" }, { value: "III", label: "III" }]}
                />
                <ProtectionLevelInfoModal 
                  open={showProtectionInfo} 
                  onClose={() => setShowProtectionInfo(false)} 
                />
              </div>
            </div>

            <RibHeightInfoModal 
              open={showRibInfo} 
              onClose={() => setShowRibInfo(false)} 
            />

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
                  onChange={handleClimate}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
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
                  onChange={handleClimate}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">To'suvchi konstruksiya materiallarining xususiyatlari</h1>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div
            className={
              !constructionType ||
              constructionType === "tashqi_devor" ||
              constructionType === "tashqi_devor_ventfasad"
                ? "w-full"
                : "w-full md:basis-2/3"
            }
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">Konstruksiya turi</label>
            <CustomSelect
              value={constructionType}
              onChange={(val) => setConstructionType(val)}
              placeholder="Tanlang"
              options={CONSTRUCTION_TYPES}
            />
          </div>

          {constructionType && constructionType !== "tashqi_devor" && constructionType !== "tashqi_devor_ventfasad" && (
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

        {/* Qatlamlar jadvali - umumiy MaterialLayersTable komponenti orqali, dizayni HeatWizard dagi bilan bir xil */}
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
            onClick={addLayer}
            className="px-4 py-2 rounded-lg bg-[#1080c2] text-white text-sm self-start"
          >
            Qatlam qo'shish
          </button>

          {/* Havo qatlami boshqaruvlari – dizayni HeatWizard dagi bilan bir xil qilish uchun umumiy AirLayerControls komponenti ishlatiladi */}
          <AirLayerControls airLayer={airLayer} onChange={setAirLayer} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
        <div className="text-sm text-gray-800 divide-y divide-gray-200">
          <div className="flex items-center justify-between py-3 min-h-[56px]">
            <p className="text-justify">
              <span className="font-semibold">
                Ichki havo harorati va to'suvchi konstruksiyaning ichki yuzasi harorati o'rtasidagi me'yoriy harorat farqi, Δtₜ
              </span>
            </p>
            {deltaTtResult.delta_tt != null ? (
              <span className="font-semibold text-[#1080c2]">
                Δtₜ = {deltaTtResult.delta_tt.toFixed(2)} °C
              </span>
            ) : (
              <span className="text-xs text-red-600 text-right">
                {(!initial.objectType && !constructionType) && "Δtₜ ni hisoblash uchun obekt turi va konstruksiya turini tanlang."}
                {(!initial.objectType && constructionType) && "Δtₜ ni hisoblash uchun obekt turini tanlang."}
                {(initial.objectType && !constructionType) && "Δtₜ ni hisoblash uchun konstruksiya turini tanlang."}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 min-h-[56px]">
            <p className="text-justify">
              <span className="font-semibold">
                To'suvchi konstruksiyalarning ichki yuzasining issiqlik berish koeffitsienti α
                <sub className="align-baseline text-[0.7em]">i</sub>
              </span>
            </p>
            {alphaI != null ? (
              <span className="font-semibold text-[#1080c2]">
                α
                <sub className="align-baseline text-[0.7em]">i</sub> = {alphaI.toFixed(1)} Vt/(m²·°C)
              </span>
            ) : (
              <span className="text-xs text-red-600 text-right">
                {constructionType
                  ? "Qovurg'a balandligi nisbati h/a ni tanlang."
                  : "Konstruksiya turini tanlang."}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3">
            <p className="text-justify">
              <span className="font-semibold">
                To'suvchi konstruksiyalarning tashqi yuzasining issiqlik berish koeffitsienti α
                <sub className="align-baseline text-[0.7em]">t</sub>
              </span>
            </p>
            {alphaT != null ? (
              <span className="font-semibold text-[#1080c2]">
                α
                <sub className="align-baseline text-[0.7em]">t</sub> = {alphaT.toFixed(0)} Vt/(m²·°C)
              </span>
            ) : (
              <span className="text-xs text-red-600 text-right">
                Konstruksiya turini tanlang.
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 min-h-[56px]">
            <p className="text-justify">
              <span className="font-semibold">
                Isitish davrining gradus-sutkasi, D
                <sub className="align-baseline text-[0.7em]">is.dav</sub>
              </span>
            </p>
            {heatingSeason.D_is_dav != null ? (
              <span className="font-semibold text-[#1080c2]">
                D
                <sub className="align-baseline text-[0.7em]">is.dav</sub> = {heatingSeason.D_is_dav.toFixed(0)} °C·sutka
              </span>
            ) : (
              <span className="text-xs text-red-600 text-right">
                Isitish davrining gradus-sutkasini aniqlash uchun hududni tanlang.
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 min-h-[56px]">
            <p className="text-justify">
              <span className="font-semibold">
                Sanitariya-gigiena talablariga muvofiq me'yriy (ruxsat etilgan maksimal) qarshilik, R
                <sub className="align-baseline text-[0.7em]">o</sub>
                <sup className="align-baseline text-[0.7em]">Tal.SG</sup>
              </span>
            </p>
            {RoTalSG != null ? (
              <span className="font-semibold text-[#1080c2]">
                R
                <sub className="align-baseline text-[0.7em]">o</sub>
                <sup className="align-baseline text-[0.7em]">Tal.SG</sup> = {RoTalSG.toFixed(2)} m²·°C/Vt
              </span>
            ) : (
              <span className="text-xs text-red-600 text-right">
                R
                <sub className="align-baseline text-[0.7em]">o</sub>
                <sup className="align-baseline text-[0.7em]">Tal.SG</sup> ni hisoblash uchun n, t
                <sub className="align-baseline text-[0.7em]">i</sub>, t
                <sub className="align-baseline text-[0.7em]">t</sub>, Δt
                <sub className="align-baseline text-[0.7em]">t</sub> va α
                <sub className="align-baseline text-[0.7em]">i</sub> qiymatlari aniqlangan bo'lishi kerak.
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 min-h-[56px]">
            <p className="text-justify">
              <span className="font-semibold">
                To'suvchi konstruksiyaning talab etilgan issiqlik uzatilishiga keltirilgan qarshiligi, R
                <sub className="align-baseline text-[0.7em]">o</sub>
                <sup className="align-baseline text-[0.7em]">Tal.</sup>
                {initial.protectionLevel && (
                  <span>{" "}(issiqlik himoyasining {initial.protectionLevel} darajasi)</span>
                )}
              </span>
            </p>
            {RoResult.Ro != null ? (
              <span className="font-semibold text-[#1080c2]">
                R
                <sub className="align-baseline text-[0.7em]">o</sub>
                <sup className="align-baseline text-[0.7em]">Tal.</sup>
                {" "}= {RoResult.Ro.toFixed(2)} m²·°C/Vt
              </span>
            ) : (
              <span className="text-xs text-red-600 text-right">
                {(() => {
                  const missing = [];
                  if (!initial.protectionLevel) missing.push("issiqlik himoyasi darajasini");
                  if (!initial.objectType) missing.push("bino turini");
                  if (heatingSeason.D_is_dav == null) missing.push("isitish davrining gradus-sutkasini");
                  if (!constructionType) missing.push("konstruksiya turini");
                  if (!missing.length) return "Rₒ ni hisoblash uchun kerakli parametrlarni tanlang.";
                  if (missing.length === 1) return `Rₒ ni hisoblash uchun ${missing[0]} tanlang.`;
                  const last = missing.pop();
                  return `Rₒ ni hisoblash uchun ${missing.join(", ")} va ${last} tanlang.`;
                })()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 min-h-[56px]">
            <p className="text-justify">
              <span className="font-semibold">
                Ko'p qatlamli to'suvchi konstruksiyaning termik qarshiligi, R
                <sub className="align-baseline text-[0.7em]">k</sub>
              </span>
            </p>
            {Rk > 0 ? (
              <span className="font-semibold text-[#1080c2]">
                R
                <sub className="align-baseline text-[0.7em]">k</sub> = {Rk.toFixed(2)} m²·°C/Vt
              </span>
            ) : (
              <span className="text-xs text-red-600 text-right">
                To'suvchi konstruksiya qatlamini kiriting.
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 min-h-[56px]">
            <p className="text-justify">
              <span className="font-semibold">
                To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi, R
                <sub className="align-baseline text-[0.7em]">o</sub>
              </span>
            </p>
            {Ro_calc != null ? (
              <span className="font-semibold text-[#1080c2]">
                R
                <sub className="align-baseline text-[0.7em]">o</sub> = {Ro_calc.toFixed(2)} m²·°C/Vt
              </span>
            ) : (
              <span className="text-xs text-red-600 text-right">
                R
                <sub className="align-baseline text-[0.7em]">o</sub> ni hisoblash uchun α
                <sub className="align-baseline text-[0.7em]">i</sub>, R
                <sub className="align-baseline text-[0.7em]">k</sub> va α
                <sub className="align-baseline text-[0.7em]">t</sub> qiymatlari aniqlangan bo'lishi kerak.
              </span>
            )}
          </div>
          {Ro_calc != null && RoTalab != null && (
            <div className="mt-4 pt-4">
              {(() => {
                const RoVal = Ro_calc;
                const RoTalVal = RoTalab;
                const RoStr = RoVal.toFixed(2);
                const RoTalStr = RoTalVal.toFixed(2);

                // Taqqoslashni 0,00 formatidagi (ikki xonali) qiymatlar bo'yicha bajarish
                const RoRounded = Number(RoStr);
                const RoTalRounded = Number(RoTalStr);
                const isCompliant = RoRounded >= RoTalRounded;

                const relationText = RoRounded > RoTalRounded
                  ? "talab etilganidan"
                  : RoRounded === RoTalRounded
                    ? "talab etilganiga"
                    : "talab etilganidan";

                const relationWord = RoRounded > RoTalRounded
                  ? "katta"
                  : RoRounded === RoTalRounded
                    ? "teng"
                    : "kichik";

                return (
                  <>
                    <p className="text-lg font-semibold text-gray-900 text-center">
                      To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi (
                      R
                      <sub className="align-baseline text-[0.7em]">o</sub>
                      {" = "}
                      <span className="text-[#1080c2]">{RoStr}</span> m²·°C/Vt) {relationText} (
                      R
                      <sub className="align-baseline text-[0.7em]">o</sub>
                      <sup className="align-baseline text-[0.7em]">Tal.</sup>
                      {" = "}
                      <span className="text-[#1080c2]">{RoTalStr}</span> m²·°C/Vt) {relationWord}.
                    </p>
                    <p
                      className={
                        "mt-1 text-2xl font-bold text-center " +
                        (isCompliant ? "text-emerald-600" : "text-red-600")
                      }
                    >
                      Shartlarga muvofiq {isCompliant ? "keladi" : "kelmaydi"}!
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <MaterialTreeModal
        open={materialModal.open}
        onClose={() => setMaterialModal({ open: false, layerId: null })}
        onApply={({ material, materialId, variantIdx, variant }) => {
          setLayers((prev) => prev.map((l) => {
            if (l.id !== materialModal.layerId) return l;

            const matVariants = material?.variants || [];
            let idx = variantIdx;
            if (matVariants.length === 1 && (idx == null || idx === "")) idx = "0";
            const v = matVariants.length ? matVariants[Number(idx)] : null;

            let lambda = l.lambda;
            let mu = l.mu;
            let rho = l.rho;
            if (v) {
              lambda = useLambdaA ? (v.lambda?.A ?? v.lambda_0 ?? lambda) : (v.lambda?.B ?? v.lambda_0 ?? lambda);
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
          }));
        }}
      />
    </div>
  );
}
