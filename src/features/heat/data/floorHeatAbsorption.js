/**
 * Yerdagi pol yuzasining issiqlik o'zlashtirishini hisoblash
 * Foydalanuvchi taqdim etgan algoritm asosida.
 */

export const FLOOR_ABSORPTION_NORMS = {
  residential_and_social: 12.0, // Turar joy, shifoxona, bog'cha
  public_and_light_industry: 14.0, // Jamoat, yengil sanoat
  medium_heavy_industry: 17.0, // O'rtacha sanoat
};

/**
 * Bino turi bo'yicha me'yorni aniqlash (SHNQ 2.01.04-2018, 11-jadval)
 * @param {string} objectType - Bino turi ID (1..8)
 * @returns {number|null} Yp_norm
 */
export function getFloorAbsorptionNorm(objectType) {
  if (!objectType) return null;
  switch (String(objectType)) {
    case "1": // Turar joy
    case "2": // Davolash, bolalar
      return FLOOR_ABSORPTION_NORMS.residential_and_social;
    case "3": // Jamoat
      return FLOOR_ABSORPTION_NORMS.public_and_light_industry;
    case "4": // Ishlab chiqarish
    case "5":
    case "6":
    case "7":
    case "8":
      // Ishlab chiqarish uchun odatda kategoriya bo'yicha aniqlanadi.
      // Aniq ma'lumot bo'lmaganda o'rtacha qiymat olinadi.
      return FLOOR_ABSORPTION_NORMS.medium_heavy_industry;
    default:
      return null;
  }
}

/**
 * S qiymatini olish (number yoki object dan)
 * @param {number|object} s - S qiymati
 * @param {string} humidityCondition - "A" yoki "B"
 */
function getSValue(s, humidityCondition) {
  if (s == null || s === "") return 0;
  if (typeof s === "number") return s;
  if (typeof s === "object") {
    const val = s[humidityCondition] || s.A || 0;
    return parseFloat(val) || 0;
  }
  return parseFloat(s) || 0;
}

/**
 * Yp ni hisoblash algoritmi (pol yuzasining issiqlik o'zlashtirishi)
 * Qatlamlar tartibi: 1-qatlam HAR DOIM xona tomondan, odam oyoq tegadigan qatlam bo'lishi kerak.
 *
 * @param {Array} layers - Qatlamlar
 * @param {string} humidityCondition - "A" yoki "B"
 * @returns {object} Natija { Yp, case, formula, steps, D_values }
 */
export function calculateYp(layers, humidityCondition = "A") {
  if (!layers || layers.length === 0) {
    return { Yp: null, error: "Qatlamlar yo'q" };
  }

  // 1. Qatlam ma'lumotlarini tayyorlash (1-qatlam - xona tomoni)
  const preparedLayers = layers.map((l, idx) => {
    const d_m = (parseFloat(l.thickness_mm) || 0) / 1000;
    const lambda = parseFloat(l.lambda) || 0;
    const R = d_m > 0 && lambda > 0 ? d_m / lambda : 0;
    const S = getSValue(l.s, humidityCondition);
    const D = R * S;
    return {
      id: idx + 1,
      R,
      S,
      D,
      name: l.name,
    };
  });

  const nTotal = preparedLayers.length;
  const D_values = preparedLayers.map((l) => l.D);

  // Birinchi qatlamda S bo'lmasa hisoblab bo'lmaydi
  if (preparedLayers[0].S <= 0) {
    return { Yp: null, error: "Birinchi qatlamda S qiymati yo'q" };
  }

  const steps = [];

  // 2. 1-qatlam uchun D1 tekshiruvi (1-holat)
  const D1 = preparedLayers[0].D;
  const S1 = preparedLayers[0].S;

  steps.push(
    `D qiymatlari (qatlamlar bo'yicha): ${D_values
      .map((d, i) => `D${i + 1}=${d.toFixed(3)}`)
      .join(", ")}`
  );
  steps.push(`1-qatlam inersiyasi D1 = ${D1.toFixed(3)}`);

  if (D1 >= 0.5) {
    const Yp = 2 * S1;
    steps.push(`D1 >= 0.5, 1-holat qo'llanildi: Yp = 2 * S1`);
    steps.push(`Yp = 2 * ${S1.toFixed(2)} = ${Yp.toFixed(2)}`);
    return {
      Yp,
      case: 1,
      formula: "Yp = 2 * S1",
      steps,
      D_values,
    };
  }

  // 3. 2-holat: D1 < 0.5 bo'lsa chegara qatlamni topamiz
  if (nTotal < 2) {
    return { Yp: null, error: "2-holat uchun kamida 2 ta qatlam kerak" };
  }

  let cumD = 0;
  let mIndex1Based = null; // D1+...+Dm >= 0.5 bo'lgan eng kichik m
  const cumD_trace = [];

  for (let i = 0; i < nTotal; i++) {
    cumD += preparedLayers[i].D;
    cumD_trace.push(`ΣD1..D${i + 1} = ${cumD.toFixed(3)}`);
    if (cumD >= 0.5 && mIndex1Based === null) {
      mIndex1Based = i + 1;
    }
  }

  steps.push(...cumD_trace);

  // Agar hech qayerda 0.5 ga yetmasa, m = oxirgi qatlam deb olamiz
  if (mIndex1Based === null) {
    mIndex1Based = nTotal;
    steps.push(
      `ΣD1..D${nTotal} < 0.5, chegara m qatlam sifatida oxirgi qatlam qabul qilindi (m = ${mIndex1Based})`
    );
  } else {
    steps.push(
      `Chegara m qatlam: m = ${mIndex1Based} (ΣD1..Dm birinchi bo'lib 0.5 dan katta yoki teng bo'ldi)`
    );
  }

  const nIndex1Based = mIndex1Based - 1; // birinchi n qatlam inertsiya jami < 0.5

  if (nIndex1Based < 1) {
    return {
      Yp: null,
      error:
        "Inersiya chegarasini aniqlashda xatolik: n < 1 chiqdi (qatlam tartibi noto'g'ri bo'lishi mumkin)",
    };
  }

  steps.push(
    `n = ${nIndex1Based} (birinchi n qatlam uchun ΣD < 0.5 bo'lishi kerak)`
  );

  // 3.1. n-qatlam uchun Yn hisoblash:
  // Yn = (2 * Rn * Sn² + S(n+1)) / (0.5 + Rn * S(n+1))

  const layer_n = preparedLayers[nIndex1Based - 1]; // n-qatlam (1-based -> 0-based)
  const layer_np1 = preparedLayers[mIndex1Based - 1]; // (n+1)-qatlam = m-qatlam

  const Rn = layer_n.R;
  const Sn = layer_n.S;
  const Snp1 = layer_np1.S;

  const numerator_n = 2 * Rn * Math.pow(Sn, 2) + Snp1;
  const denominator_n = 0.5 + Rn * Snp1;

  if (denominator_n === 0) {
    return { Yp: null, error: "n-qatlam uchun maxraj 0 ga teng" };
  }

  let Y_curr = numerator_n / denominator_n; // bu Yn

  steps.push(
    `n-qatlam (Y${nIndex1Based}) uchun formula: Y${nIndex1Based} = (2 * R${nIndex1Based} * S${nIndex1Based}² + S${nIndex1Based +
      1}) / (0.5 + R${nIndex1Based} * S${nIndex1Based + 1})`
  );
  steps.push(
    `Y${nIndex1Based} = (2 * ${Rn.toFixed(3)} * ${Sn.toFixed(
      2
    )}² + ${Snp1.toFixed(2)}) / (0.5 + ${Rn.toFixed(3)} * ${Snp1.toFixed(
      2
    )}) = ${Y_curr.toFixed(2)}`
  );

  // 3.2. i = n-1 dan 1 gacha orqaga: Yi = (4*Ri*Si² + Yi+1) / (1 + Ri*Yi+1)
  for (let i1 = nIndex1Based - 1; i1 >= 1; i1--) {
    const layer_i = preparedLayers[i1 - 1]; // i-qatlam
    const Ri = layer_i.R;
    const Si = layer_i.S;
    const Y_next = Y_curr; // Y(i+1)

    const num_i = 4 * Ri * Math.pow(Si, 2) + Y_next;
    const den_i = 1 + Ri * Y_next;

    if (den_i === 0) {
      return { Yp: null, error: `Y${i1} uchun maxraj 0 ga teng` };
    }

    Y_curr = num_i / den_i; // endi bu Yi

    steps.push(`2-formula bo'yicha Y${i1} hisoblash:`);
    steps.push(
      `Y${i1} = (4 * R${i1} * S${i1}² + Y${i1 + 1}) / (1 + R${i1} * Y${i1 +
        1})`
    );
    steps.push(
      `Y${i1} = (4 * ${Ri.toFixed(3)} * ${Si.toFixed(
        2
      )}² + ${Y_next.toFixed(2)}) / (1 + ${Ri.toFixed(3)} * ${Y_next.toFixed(
        2
      )}) = ${Y_curr.toFixed(2)}`
    );
  }

  // 3.3. Yakuniy Yp = Y1
  const Yp = Y_curr;
  steps.push(`Yakuniy Yp = Y1 = ${Yp.toFixed(2)}`);

  return {
    Yp,
    case: 2,
    formula: "Iterativ hisob (2-holat, n va m bo'yicha)",
    steps,
    D_values,
  };
}
