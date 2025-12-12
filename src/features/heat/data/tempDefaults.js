/**
 * Vaqtincha default qiymatlar
 * Bu qiymatlar faqat test/development uchun ishlatiladi
 * Keyinchalik olib tashlanadi
 */

export const TEMP_DEFAULTS = {
  // Q Step - Bino parametrlari
  P_m: "100",           // Bino perimetri, m
  H_m: "8",             // Balandlik, m
  floors: "3",          // Qavatlilik
  A_f: "600",           // Bino umumiy maydoni, m²
  A_mc1: "200",         // Birinchi qavat maydoni, m²
  V_h: "1800",          // Binoning isitiladigan hajmi, m³
  Xodim: "20",          // Binoning hisobiy quvvati, kishi
  roofType: "tomyopma", // Tomyopma turi

  // Konstruksiyalar maydoni
  A_W: "600",           // Fasad maydoni (A_Fas), m²
  A_L: "40",            // Derazalar va vitrinalar maydoni, m²
  A_L2: "15",           // Fonarlar maydoni, m²
  A_D: "25",            // Eshiklar maydoni, m²
  A_CG: "100",          // Yerdagi pol maydoni, m²
  A_G: "100",           // Isitilmaydigan yerto'la ustidagi pol maydoni, m²
  A_R: "300",           // Tomyopmalar maydoni, m²
};

/**
 * Qiymatni olish - agar mavjud bo'lsa haqiqiy qiymat, aks holda default
 * @param {any} value - Haqiqiy qiymat
 * @param {string} key - TEMP_DEFAULTS dagi kalit
 * @returns {any} - Qiymat yoki default
 */
export const getWithDefault = (value, key) => {
  if (value !== undefined && value !== null && value !== "") {
    return value;
  }
  return TEMP_DEFAULTS[key];
};
