import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { REGIONS } from "./data/regions";
import { MATERIALS } from "./data/materials";
import { CONSTRUCTION_TYPES } from "./data/constructionTypes";
import { ProtectionLevelNoteText } from "./heatSharedTexts";
import { CustomSelect, CustomRegionSelect } from "./controls/HeatSelects";
import { ConstructionIndicatorsPanel } from "./controls/ConstructionBlocks";
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

  // Variant A: Custom rounded dropdown select – endi umumiy CustomSelect komponenti orqali boshqariladi


  function MaterialTreeModal({ open, onClose, onApply }) {
    const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
    const [selectedClassIdx, setSelectedClassIdx] = useState(0);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [selectedVariantIdx, setSelectedVariantIdx] = useState(null);

    const groups = MATERIALS || [];
    const activeGroup =
      selectedGroupIdx != null && selectedGroupIdx >= 0 && selectedGroupIdx < groups.length
        ? groups[selectedGroupIdx] || {}
        : {};
    const classes = activeGroup.classes || [];
    const activeClass =
      selectedClassIdx != null && selectedClassIdx >= 0 && selectedClassIdx < classes.length
        ? classes[selectedClassIdx] || {}
        : {};
    const materials = activeClass.materials || [];

    const activeMaterial = useMemo(() => {
      if (!selectedMaterialId) return null;
      return materials.find((m) => (m.id || m.name || m.material_name) === selectedMaterialId) || null;
    }, [materials, selectedMaterialId]);

    const variants = activeMaterial?.variants || [];
    const activeVariant = selectedVariantIdx != null ? variants[Number(selectedVariantIdx)] : null;

    if (!open) return null;

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 h-[560px] max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Material tanlash</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              aria-label="Yopish"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <ul className="py-3 text-sm text-gray-800">
              {groups.map((g, gi) => (
                <li key={g.group_id || gi} className="mb-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedGroupIdx === gi) {
                        setSelectedGroupIdx(null);
                        setSelectedClassIdx(null);
                        setSelectedMaterialId(null);
                        setSelectedVariantIdx(null);
                      } else {
                        setSelectedGroupIdx(gi);
                        setSelectedClassIdx(0);
                        setSelectedMaterialId(null);
                        setSelectedVariantIdx(null);
                      }
                    }}
                    className={`w-full text-left px-4 py-1.5 rounded-md ${
                      gi === selectedGroupIdx ? "bg-[#1080c2]/10 text-[#1080c2] font-semibold" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    {g.group_name || "Guruh"}
                  </button>

                  {gi === selectedGroupIdx && (classes || []).length > 0 && (
                    <ul className="mt-1 ml-4 border-l border-gray-200 pl-3">
                      {(classes || []).map((cls, ci) => (
                        <li key={cls.class_id || ci} className="mb-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedClassIdx === ci) {
                                setSelectedClassIdx(null);
                                setSelectedMaterialId(null);
                                setSelectedVariantIdx(null);
                              } else {
                                setSelectedClassIdx(ci);
                                setSelectedMaterialId(null);
                                setSelectedVariantIdx(null);
                              }
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-md ${
                              ci === selectedClassIdx ? "bg-[#1080c2]/5 text-[#1080c2]" : "hover:bg-gray-50 text-gray-800"
                            }`}
                          >
                            {cls.class_name || "Sinf"}
                          </button>

                          {ci === selectedClassIdx && (materials || []).length > 0 && (
                            <ul className="mt-1 ml-4 border-l border-dashed border-gray-200 pl-3">
                              {(activeClass.materials || []).map((m, mi) => {
                                const matId = m.id || m.name || m.material_name || String(mi);
                                const matVariants = m.variants || [];

                                if (!matVariants.length) {
                                  const isSelected = selectedMaterialId === matId && selectedVariantIdx == null;
                                  return (
                                    <li key={matId} className="mb-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedMaterialId(matId);
                                          setSelectedVariantIdx(null);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 rounded-md text-xs ${
                                          isSelected ? "bg-[#1080c2]/10 text-[#1080c2]" : "hover:bg-gray-50 text-gray-800"
                                        }`}
                                      >
                                        {m.name || m.material_name || "Material"}
                                      </button>
                                    </li>
                                  );
                                }

                                return matVariants.map((v, vi) => {
                                  const isSelected = selectedMaterialId === matId && String(selectedVariantIdx) === String(vi);
                                  const labelBase = m.name || m.material_name || "Material";
                                  const dens = v.density || v.zichlik;
                                  const label = dens ? `${labelBase} (${dens} kg/m³)` : labelBase;
                                  return (
                                    <li key={`${matId}-${vi}`} className="mb-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedMaterialId(matId);
                                          setSelectedVariantIdx(String(vi));
                                        }}
                                        onDoubleClick={() => {
                                          const variantIndex = String(vi);
                                          const payload = {
                                            material: m,
                                            materialId: matId,
                                            variantIdx: variantIndex,
                                            variant: v,
                                          };
                                          onApply && onApply(payload);
                                          onClose && onClose();
                                        }}
                                        className={`w-full text-left px-3 py-1.5 rounded-md text-xs ${
                                          isSelected ? "bg-[#1080c2]/10 text-[#1080c2]" : "hover:bg-gray-50 text-gray-800"
                                        }`}
                                      >
                                        {label}
                                      </button>
                                    </li>
                                  );
                                });
                              })}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={!activeMaterial || (variants.length > 1 && selectedVariantIdx == null)}
              onClick={() => {
                if (!activeMaterial) return;
                let variantIndex = selectedVariantIdx;
                if (variants.length === 1 && variantIndex == null) variantIndex = 0;
                const v = variants.length ? variants[Number(variantIndex)] : null;
                onApply && onApply({
                  material: activeMaterial,
                  materialId: activeMaterial.id || activeMaterial.name || activeMaterial.material_name,
                  variantIdx: variants.length ? String(variantIndex) : null,
                  variant: v,
                });
                onClose && onClose();
              }}
              className="px-4 py-2 rounded-lg text-sm text-white bg-[#1080c2] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Tanlash
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

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
                {showProtectionInfo &&
                  createPortal(
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                      onClick={(e) => {
                        if (e.target.classList.contains('fixed')) {
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

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="py-2 pr-4 text-center">#</th>
                <th className="py-2 pr-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-[32rem] leading-tight">
                      <div>
                        Material
                        <span className="ml-2 italic font-normal">(Tashqaridan ichkariga)</span>
                      </div>
                    </div>
                  </div>
                </th>
                <th className="py-2 pr-4 text-center leading-tight">
                  <div>
                    Qalinlik <span className="text-[#1080c2]">δ</span>, mm
                  </div>
                  <div></div>
                </th>
                <th className="py-2 pr-4 text-center leading-tight">
                  <div>
                    Zichlik <span className="text-[#1080c2]">γ</span>
                    <sub className="align-baseline text-[0.7em] text-[#1080c2]">0</sub>, kg/m³
                  </div>
                  <div></div>
                </th>
                <th className="py-2 pr-4 text-center leading-tight">
                  <div>
                    Issiqlik o'tkazuvchanlik <span className="text-[#1080c2]">λ</span>
                  </div>
                  <div></div>
                </th>
                <th className="py-2 pr-4 text-center leading-tight">
                  <div className="whitespace-nowrap">Termik</div>
                  <div className="whitespace-nowrap">
                    qarshilik <span className="text-[#1080c2]">R</span>
                  </div>
                </th>
                <th className="py-2 pr-4 text-center leading-tight">
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
                    <td className="py-2 pr-4">{idx + 1}</td>
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
                      <button onClick={() => removeLayer(L.id)} aria-label="O'chirish" className="p-2 rounded-lg border text-red-600 border-red-300 hover:bg-red-50 inline-flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2" />
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
            onClick={addLayer}
            className="px-4 py-2 rounded-lg bg-[#1080c2] text-white text-sm self-start"
          >
            Qatlam qo'shish
          </button>

          <div className="mt-2 border-t border-dashed border-gray-200 pt-4 space-y-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#1080c2] focus:ring-[#1080c2]"
                checked={airLayer.enabled}
                onChange={(e) =>
                  setAirLayer((s) => ({
                    ...s,
                    enabled: e.target.checked,
                  }))
                }
              />
              <span>Berk havo qatlamini qo'shish</span>
            </label>

            {airLayer.enabled && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] gap-y-2 md:gap-y-0 md:gap-x-8 items-start">
                  <div className="w-[200px]">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Havo qatlamining qalinligi, mm
                    </label>
                    <CustomSelect
                      value={airLayer.thickness_mm}
                      onChange={(val) =>
                        setAirLayer((s) => ({
                          ...s,
                          thickness_mm: val,
                        }))
                      }
                      placeholder="Tanlang"
                      options={[
                        { value: "10", label: "10" },
                        { value: "20", label: "20" },
                        { value: "30", label: "30" },
                        { value: "50", label: "50" },
                        { value: "100", label: "100" },
                        { value: "150", label: "150" },
                        { value: "200_300", label: "200-300" },
                      ]}
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-gray-700 mb-1">Qatlam harorati</span>
                    <div className="flex items-center gap-4 text-xs text-gray-800 mb-2">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="air-layer-temp"
                          value="positive"
                          className="border-gray-300 text-[#1080c2] focus:ring-[#1080c2]"
                          checked={airLayer.layerTemp === "positive"}
                          onChange={() =>
                            setAirLayer((s) => ({
                              ...s,
                              layerTemp: "positive",
                            }))
                          }
                        />
                        <span>Musbat</span>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="air-layer-temp"
                          value="negative"
                          className="border-gray-300 text-[#1080c2] focus:ring-[#1080c2]"
                          checked={airLayer.layerTemp === "negative"}
                          onChange={() =>
                            setAirLayer((s) => ({
                              ...s,
                              layerTemp: "negative",
                            }))
                          }
                        />
                        <span>Manfiy</span>
                      </label>
                    </div>

                    <label className="inline-flex items-center gap-2 text-xs text-gray-800">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#1080c2] focus:ring-[#1080c2]"
                        checked={airLayer.foilBothSides}
                        onChange={(e) =>
                          setAirLayer((s) => ({
                            ...s,
                            foilBothSides: e.target.checked,
                          }))
                        }
                      />
                      <span>
                        Havo qatlamining bir yoki ikkala yuzasi alyumin zar qog'oz (folga) bilan
                        yelimlangan
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                        "mt-1 text-2xl font-semibold text-center " +
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
