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

/**
 * QMQ 2.01.04-18, 1-jadval asosida namlik rejimini aniqlash
 * Ichki havo harorati (t_in) va namligi (phi_in) bo'yicha rejimni qaytaradi
 * 
 * 1-jadval: Binolar xonalarining namlik rejimi
 * 
 * @param {number} t_in - Ichki havo harorati (°C)
 * @param {number} phi_in - Ichki havo namligi (%)
 * @returns {string} - Namlik rejimi: "quruq", "normal", "nam", "xo'l"
 */
export function getHumidityRegime(t_in, phi_in) {
  if (t_in == null || phi_in == null) return "normal"; // default

  // 12°C gacha harorat
  if (t_in < 12) {
    if (phi_in <= 60) return "quruq";
    if (phi_in <= 75) return "normal";
    return "nam";
  }
  
  // 12°C dan 24°C gacha harorat
  if (t_in >= 12 && t_in <= 24) {
    if (phi_in <= 50) return "quruq";
    if (phi_in <= 60) return "normal";
    if (phi_in <= 75) return "nam";
    return "xo'l";
  }
  
  // 24°C dan ortiq harorat
  if (t_in > 24) {
    if (phi_in <= 40) return "quruq";
    if (phi_in <= 50) return "normal";
    if (phi_in <= 60) return "nam";
    return "xo'l";
  }

  return "normal";
}

/**
 * Harorat va namlik bo'yicha namlik rejimi ma'lumotlarini olish (PDF izoh uchun)
 * @param {number} t_in - Ichki havo harorati (°C)
 * @param {number} phi_in - Ichki havo namligi (%)
 * @returns {object} - Rejim nomi, harorat diapazoni va namlik chegaralari
 */
export function getHumidityRegimeInfo(t_in, phi_in) {
  const regime = getHumidityRegime(t_in, phi_in);
  
  // Harorat diapazonini aniqlash
  let tempRangeLabel;
  let humidityBounds;
  
  if (t_in < 12) {
    tempRangeLabel = "12°C gacha";
    humidityBounds = {
      quruq: "60% gacha",
      normal: "60% dan 75% gacha",
      nam: "75% dan ortiq"
    };
  } else if (t_in >= 12 && t_in <= 24) {
    tempRangeLabel = "12°C dan 24°C gacha";
    humidityBounds = {
      quruq: "50% gacha",
      normal: "50% dan 60% gacha",
      nam: "60% dan 75% gacha",
      "xo'l": "75% dan ortiq"
    };
  } else {
    tempRangeLabel = "24°C dan ortiq";
    humidityBounds = {
      quruq: "40% gacha",
      normal: "40% dan 50% gacha",
      nam: "50% dan 60% gacha",
      "xo'l": "60% dan ortiq"
    };
  }

  return {
    regime,
    tempRangeLabel,
    humidityBounds: humidityBounds[regime] || humidityBounds.normal,
    t_in,
    phi_in
  };
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
      row: null,
    };
  }

  const group = mapConstructionTypeToGroup(constructionTypeId);
  const category = mapObjectTypeToDeltaCategory(objectType);

  let t_p = null;
  let delta = null;
  let formula_used = "fixed_value";
  let row = null;

  const phiOverride = typeof phi_in === "number" && phi_in > 0 && phi_in <= 100 ? phi_in / 100 : null;

  if (category === "quruq_normal_ishlab_chiqarish") {
    t_p = computeDewPoint(t_in, objectType, phiOverride);
    const raw = t_in - t_p;
    if (group === "outer_walls") {
      delta = Math.min(raw, 7);
      formula_used = "limited_to_7";
      row = 1;
    } else if (group === "attic_and_top_floor_slabs") {
      delta = Math.min(raw, 6);
      formula_used = "limited_to_6";
      row = 2;
    } else {
      delta = null;
      formula_used = null;
    }
  } else if (category === "nam_hol_ishlab_chiqarish") {
    t_p = computeDewPoint(t_in, objectType, phiOverride);
    const raw = t_in - t_p;
    delta = 0.8 * raw;
    formula_used = "0.8*(t_i_minus_t_p)";
    row = 3;
  } else if (category === "kartoshka_sabzavot_ombor") {
    t_p = computeDewPoint(t_in, objectType, phiOverride);
    delta = t_in - t_p;
    formula_used = "t_i_minus_t_p";
    row = 4;
  } else if (category === "boshqa") {
    if (group === "outer_walls") {
      delta = 4.0;
      row = 5;
    } else if (group === "attic_and_top_floor_slabs") {
      delta = 3.5;
      row = 6;
    } else if (group === "transition_and_unheated_spaces") {
      delta = 2.0;
      row = 7;
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
    row,
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

  // Jadval band raqamini aniqlash (2b jadval uchun)
  let row = null;
  if (category === "res_low") row = 1;
  else if (category === "res_high") row = 2;
  else if (category === "public") row = 3;
  else if (category === "industrial") row = 4;

  if (typeof value === "number" && value > 0) {
    return { value, row };
  }
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

// PDF IZOHLAR UCHUN FUNKSIYALAR
// =====================================================

/**
 * φᵢ (ichki havo namligi) uchun izoh
 * QMQ 2.01.04-18, 1-jadval asosida
 * @param {object} humidityRegimeInfo - getHumidityRegimeInfo(t_in, phi_in) dan olingan ma'lumot
 * @param {number} phi_in - ichki namlik qiymati
 */
export function getPhiNote(humidityRegimeInfo, phi_in) {
  const info = humidityRegimeInfo;
  if (info && info.regime && info.tempRangeLabel) {
    return `QMQ 2.01.04-18, 1-jadval bo'yicha xona ichidagi havo harorati ${info.tempRangeLabel} va namligi ${phi_in != null ? phi_in + '%' : info.humidityBounds} bo'lganda namlik rejimi "${info.regime}" hisoblanadi.`;
  }
  return `QMQ 2.01.04-18 "Qurilish issiqlik texnikasi", 1-jadval bo'yicha namlik rejimi aniqlanadi.`;
}

/**
 * t_is.dav (isitish davri o'rtacha harorati) uchun izoh
 * QMQ 2.01.01-22, 4-jadval: 20-qator (t_8.ortacha_harorat), 22-qator (t_12.ortacha_harorat)
 */
export function getTIsDavNote() {
  return `O'RQ 2.01.01-22 "Loyihalash uchun iqlimiy va fizikaviy-geologik ma'lumotlar" 4-jadval "Tashqi havoning parametrlari", 20-22-qatorlar o'rtacha qiymati`;
}

/**
 * Z_is.dav (isitish davri davomiyligi) uchun izoh
 * QMQ 2.01.01-22, 4-jadval: 19-qator (t_8.davom_etish_sutka), 21-qator (t_12.davom_etish_sutka)
 */
export function getZIsDavNote() {
  return `O'RQ 2.01.01-22 "Loyihalash uchun iqlimiy va fizikaviy-geologik ma'lumotlar" 4-jadval "Tashqi havoning parametrlari", 19-21-qatorlar o'rtacha qiymati`;
}

/**
 * t_t (tashqi havoning hisobiy qishki harorati) uchun izoh
 * QMQ 2.01.01-22, 4-jadval: 17-qator
 */
export function getTOutNote() {
  return `O'RQ 2.01.01-22 boyicha ta'minlanganlik 0,92 bo'lgan eng sovuq besh kunlikning o'rtacha haroratiga teng. 4-jadval "Tashqi havoning parametrlari", 17-qator`;
}

/**
 * Δt_t (me'yoriy harorat farqi) uchun izoh
 * @param {number} row - jadval band raqami (1-7)
 */
export function getDeltaTtNote(row) {
  if (row != null) {
    return `QMQ 2.01.04-18 "Qurilish issiqlik texnikasi", 4-jadval`;
  }
  return null;
}

/**
 * α_i (ichki yuzaning issiqlik berish koeffitsienti) uchun izoh
 * @param {number} row - jadval band raqami
 */
export function getAlphaINote(row) {
  if (row != null) {
    return `QMQ 2.01.04-18 "Qurilish issiqlik texnikasi", 5-jadval`;
  }
  return null;
}

/**
 * α_t (tashqi yuzaning issiqlik berish koeffitsienti) uchun izoh
 * @param {number} row - jadval band raqami
 */
export function getAlphaTNote(row) {
  if (row != null) {
    return `QMQ 2.01.04-18 "Qurilish issiqlik texnikasi", 6-jadval`;
  }
  return null;
}

/**
 * D_is.dav (isitish davrining gradus-sutkasi) uchun formula izohi
 * @param {object} params - {t_in, t_is_dav, Z_is_dav, D_d_dav}
 */
export function getDIsDavNote(params) {
  const { t_in, t_is_dav, Z_is_dav, D_d_dav } = params;
  if (t_in != null && t_is_dav != null && Z_is_dav != null) {
    return {
      formula: `D_is.dav = (t_i - t_is.dav) × Z_is.dav`,
      calculation: `(${t_in} - (${t_is_dav.toFixed(1)})) × ${Z_is_dav.toFixed(0)} = ${D_d_dav?.toFixed(0) || "—"}`
    };
  }
  return null;
}

/**
 * R_o^Tal.SG (sanitariya-gigiena talablariga muvofiq qarshilik) uchun formula izohi
 * @param {object} params - {t_in, t_out, delta_t_n, alpha_i, Ro_MG}
 */
export function getRoTalSGNote(params) {
  const { t_in, t_out, delta_t_n, alpha_i, Ro_MG } = params;
  if (t_in != null && t_out != null && delta_t_n != null && alpha_i != null) {
    return {
      formula: `R_o^Tal.SG = n(t_i - t_t) / (Δt_t × α_i)`,
      calculation: `1×(${t_in} - (${t_out})) / (${delta_t_n.toFixed(1)} × ${alpha_i.toFixed(1)}) = ${Ro_MG?.toFixed(2) || "—"}`
    };
  }
  return null;
}

/**
 * R_o^Tal. (talab etilgan issiqlik qarshiligi) uchun izoh
 * @param {number} row - jadval band raqami
 * @param {string} protectionLevel - issiqlik himoyasi darajasi
 */
export function getRoTalNote(row, protectionLevel) {
  if (row != null) {
    return `QMQ 2.01.04-18 "Qurilish issiqlik texnikasi", 2b jadval, ${row}-band, issiqlik himoyasining ${protectionLevel || "II"} darajasi`;
  }
  return null;
}

/**
 * R_k (ko'p qatlamli konstruksiyaning termik qarshiligi) uchun formula izohi
 * @param {array} layers - qatlamlar ro'yxati
 * @param {number} R_k - umumiy termik qarshilik
 */
export function getRkNote(layers, R_k) {
  if (layers && layers.length > 0) {
    const rValues = layers.map(l => l.R || 0);
    return {
      formula: `R_k = R_1 + R_2 + ... + R_${layers.length}`,
      calculation: `${rValues.join(" + ")} = ${R_k?.toFixed(2) || "—"}`
    };
  }
  return null;
}

/**
 * R_o (issiqlik uzatilishga keltirilgan qarshilik) uchun formula izohi
 * @param {object} params - {alpha_i, alpha_t, R_k, Ro_calc}
 */
export function getRoNote(params) {
  const { alpha_i, alpha_t, R_k, Ro_calc } = params;
  if (alpha_i != null && alpha_t != null && R_k != null) {
    return {
      formula: `R_o = 1/α_i + R_k + 1/α_t`,
      calculation: `1/${alpha_i.toFixed(1)} + ${R_k.toFixed(2)} + 1/${alpha_t.toFixed(0)} = ${Ro_calc?.toFixed(2) || "—"}`
    };
  }
  return null;
}
