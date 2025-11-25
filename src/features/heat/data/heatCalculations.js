import { RO_TABLES } from "./roTables";

export function getNormativePhi(objectType) {
  switch (objectType) {
    case "1":
    case "2":
      return 0.55;
    case "3":
      return 0.5;
    case "4":
      return 0.5;
    case "5":
      return 0.65;
    case "6":
      return 0.75;
    case "7":
      return 0.5;
    default:
      return 0.5;
  }
}

export function computeDewPoint(t_i, objectType, phiOverride) {
  const phi = typeof phiOverride === "number" && phiOverride > 0 && phiOverride <= 1
    ? phiOverride
    : getNormativePhi(objectType);
  const alpha = Math.log(phi) + (17.27 * t_i) / (237.7 + t_i);
  const t_p = (237.7 * alpha) / (17.27 - alpha);
  return t_p;
}

export function mapConstructionTypeToId(ct) {
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
    case "eshik_darvoza":
    case "deraza_balkon_eshiklari":
      // Eshik va derazalar uchun tashqi devor (id=1) qiymatlari ishlatiladi
      return "1";
    default:
      return null;
  }
}

export function mapConstructionTypeToGroup(id) {
  if (id === "1" || id === "9") return "outer_walls";
  if (id === "2" || id === "3") return "attic_and_top_floor_slabs";
  if (id === "4" || id === "5" || id === "6" || id === "7" || id === "8") return "transition_and_unheated_spaces";
  return null;
}

export function getNByConstructionId(id) {
  if (!id) return null;
  if (id === "1" || id === "2" || id === "3" || id === "5") return 1.0;
  if (id === "4" || id === "6") return 0.8;
  if (id === "7") return 0.7;
  if (id === "8") return 0.6;
  if (id === "9") return 0.4;
  return null;
}

export function mapObjectTypeToDeltaCategory(objType) {
  switch (objType) {
    case "3":
      return "quruq_normal_ishlab_chiqarish";
    case "4":
      return "nam_hol_ishlab_chiqarish";
    case "5":
      return "kartoshka_sabzavot_ombor";
    default:
      return "boshqa";
  }
}

export function computeDeltaTt({ objectType, constructionType, t_in, phi_in }) {
  const constructionTypeId = mapConstructionTypeToId(constructionType);
  if (!objectType || !constructionTypeId || t_in == null) {
    return {
      delta_tt: null,
      t_i: t_in ?? null,
      t_p: null,
      formula_used: null,
      category: null,
      construction_type_id: constructionTypeId,
    };
  }

  const group = mapConstructionTypeToGroup(constructionTypeId);
  const category = mapObjectTypeToDeltaCategory(objectType);

  let t_p = null;
  let delta = null;
  let formula_used = "fixed_value";

  const phiOverride = typeof phi_in === "number" && phi_in > 0 && phi_in <= 100 ? phi_in / 100 : null;

  if (category === "quruq_normal_ishlab_chiqarish") {
    t_p = computeDewPoint(t_in, objectType, phiOverride);
    const raw = t_in - t_p;
    if (group === "outer_walls") {
      delta = Math.min(raw, 7);
      formula_used = "limited_to_7";
    } else if (group === "attic_and_top_floor_slabs") {
      delta = Math.min(raw, 6);
      formula_used = "limited_to_6";
    } else {
      delta = null;
      formula_used = null;
    }
  } else if (category === "nam_hol_ishlab_chiqarish") {
    t_p = computeDewPoint(t_in, objectType, phiOverride);
    const raw = t_in - t_p;
    delta = 0.8 * raw;
    formula_used = "0.8*(t_i_minus_t_p)";
  } else if (category === "kartoshka_sabzavot_ombor") {
    t_p = computeDewPoint(t_in, objectType, phiOverride);
    delta = t_in - t_p;
    formula_used = "t_i_minus_t_p";
  } else if (category === "boshqa") {
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
    t_p = null;
    formula_used = delta != null ? "fixed_value" : null;
  }

  return {
    delta_tt: delta,
    t_i: t_in,
    t_p,
    formula_used,
    category,
    construction_type_id: constructionTypeId,
  };
}

export function mapObjectTypeToRoCategory(objectType) {
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

export function mapDHeatingToBand(D_is_dav) {
  if (D_is_dav == null) return null;
  const D = Number(D_is_dav);
  if (!Number.isFinite(D)) return null;
  if (D < 2000) return "lt_2000";
  if (D <= 3000) return "2000_3000";
  return "gt_3000";
}

export function getRoPrFromTables({ protectionLevel, objectType, floors, D_is_dav, constructionTypeId }) {
  if (!protectionLevel || !objectType || D_is_dav == null || !constructionTypeId) return null;

  const level = protectionLevel;
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

// Deraza va fonarlar uchun RoTal.D.F. ni olish
// derazaType: "deraza_balkon" -> id='10', "fonarlar" -> id='11'
export function getRoTalForDerazaFonar({ protectionLevel, objectType, D_is_dav, derazaType }) {
  if (!protectionLevel || !objectType || D_is_dav == null || !derazaType) return null;

  // Deraza turi bo'yicha konstruksiya ID ni aniqlash
  const constructionTypeId = derazaType === "fonarlar" ? "11" : "10";

  const level = protectionLevel;
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
