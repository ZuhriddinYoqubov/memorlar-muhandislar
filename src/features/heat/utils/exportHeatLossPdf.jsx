import React from 'react';
import { Document, Page, Text, View, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdfStyles } from './pdfStyles';
import { TEMP_DEFAULTS, getWithDefault } from '../data/tempDefaults';

// Noto Sans Math fontini ro'yxatdan o'tkazish
import NotoSansMathUrl from '../../../assets/fonts/NotoSansMath-Regular.ttf';

Font.register({
  family: 'NotoSansMath',
  src: NotoSansMathUrl,
});

/**
 * Subscript bilan matn komponenti
 */
const TextWithSub = ({ main, sub, style = {} }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
    <Text style={[{ fontSize: 9 }, style]}>{main}</Text>
    {sub && <Text style={[{ fontSize: 6, marginBottom: 1 }, style]}>{sub}</Text>}
  </View>
);

/**
 * Superscript bilan matn komponenti
 */
const TextWithSup = ({ main, sup, style = {} }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
    <Text style={[{ fontSize: 9 }, style]}>{main}</Text>
    {sup && <Text style={[{ fontSize: 6, marginTop: -2 }, style]}>{sup}</Text>}
  </View>
);

/**
 * Formula qatori komponenti
 */
const FormulaRow = ({ left, middle, right, unit }) => (
  <View style={[pdfStyles.row, { marginTop: 4, marginLeft: 20 }]}>
    <Text style={{ fontSize: 9, width: 120 }}>{left}</Text>
    <Text style={{ fontSize: 9, flex: 1 }}>{middle}</Text>
    <Text style={{ fontSize: 9, width: 80, textAlign: 'right' }}>{right}</Text>
    {unit && <Text style={{ fontSize: 9, width: 80 }}> {unit}</Text>}
  </View>
);

/**
 * "Bunda:" bloki komponenti
 */
const BundaBlock = ({ items }) => (
  <View style={{ marginTop: 6, marginLeft: 20 }}>
    <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Bunda:</Text>
    {items.map((item, idx) => (
      <View key={idx} style={[pdfStyles.row, { marginTop: 2, marginLeft: 20 }]}>
        <Text style={{ fontSize: 9 }}>{item.label}</Text>
        <Text style={{ fontSize: 9, marginLeft: 10 }}>{item.value}</Text>
      </View>
    ))}
  </View>
);

/**
 * 8-bo'lim: Tashqi to'suvchi konstruksiyalardan issiqlik yo'qotilishi
 * Faqat sahifalar komponenti (Document siz) - birlashtirilgan PDF uchun
 */
export const HeatLossPages = ({
  initial = {},
  climate = {},
  heatingSeason = {},
  buildingParams = {},
  heatSteps = [],
}) => {
  // Harorat parametrlari
  const t_i = climate?.t_in || 20;
  const t_e = climate?.t_out || -16;
  const deltaT = t_i - t_e;

  // Bino parametrlari (vaqtincha default bilan)
  const A_W = getWithDefault(buildingParams?.A_W, 'A_W');      // Fasad maydoni
  const A_L = getWithDefault(buildingParams?.A_L, 'A_L');      // Derazalar maydoni
  const A_D = getWithDefault(buildingParams?.A_D, 'A_D');      // Eshiklar maydoni
  const A_CG = getWithDefault(buildingParams?.A_CG, 'A_CG');   // Yerdagi pol maydoni
  const A_G = getWithDefault(buildingParams?.A_G, 'A_G');      // Yerto'la ustidagi pol
  const A_R = getWithDefault(buildingParams?.A_R, 'A_R');      // Tomyopmalar maydoni
  const V_h = getWithDefault(buildingParams?.V_h, 'V_h');      // Isitiladigan hajm
  const A_f = getWithDefault(buildingParams?.A_f, 'A_f');      // Bino umumiy maydoni
  const A_mc1 = getWithDefault(buildingParams?.A_mc1, 'A_mc1'); // Birinchi qavat maydoni

  // HeatSteps dan R qiymatlarini olish
  const getStepValue = (constructionTypes, field) => {
    if (!heatSteps || heatSteps.length === 0) return null;
    const types = Array.isArray(constructionTypes) ? constructionTypes : [constructionTypes];
    for (const ct of types) {
      const step = heatSteps.find(s =>
        (s.presetConstructionType || s.savedState?.constructionType) === ct
      );
      if (step?.savedState?.[field]) {
        return parseFloat(step.savedState[field]);
      }
    }
    return null;
  };

  // R qiymatlari - heatSteps dan dinamik olish
  const R_d = getStepValue(['tashqi_devor', 'tashqi_devor_ventfasad'], 'Ro_calc') || 2.68;
  const R_deraza = getStepValue(['deraza_balkon_eshiklari'], 'windowRo') || 0.50; // Deraza
  const R_fonar = getStepValue(['fonarlar'], 'windowRo') || 0.70; // Fonarlar
  const R_yo = R_deraza; // Yorug'lik oraliqlari (deraza)
  const R_oy = getStepValue(['chordoq_orayopma', 'ochiq_chordoq', 'tomyopma'], 'Ro_calc') || 2.85;
  const R_pol = getStepValue(['floor_heat_calculation'], 'Ro_calc') || 1.55;
  const R_qop = getStepValue(['chordoq_orayopma', 'ochiq_chordoq', 'tomyopma'], 'Ro_calc') || 2.49;
  const R_eshik = getStepValue(['eshik_darvoza'], 'Ro_calc') || 0.60; // Eshik
  const K_d = 7; // Eshik koeffitsienti

  // Maydonlar (hisoblangan)
  const F_d = parseFloat(A_W) - parseFloat(A_L) - parseFloat(A_D); // Tashqi devor maydoni
  const F_yo = parseFloat(A_L) || 86.9;  // Yorug'lik oraliqlar maydoni
  const F_oy = 0; // 1-qavat pol orayopmasi (vaqtincha 0)
  const F_pol = parseFloat(A_CG) + parseFloat(A_G); // Yerdagi pol maydoni
  const F_qop = parseFloat(A_R) || 210.2; // Chortoq orayopmasi maydoni
  const F_ed = parseFloat(A_D) || 15; // Eshik maydoni

  // Issiqlik yo'qotishlari hisobi
  const Q_oy = F_d > 0 && R_d > 0 ? (F_d / R_d) * deltaT : 0;
  const Q_yo = F_yo > 0 && R_yo > 0 ? (F_yo / R_yo) * deltaT : 0;
  const Q_1qavat = F_oy > 0 && R_oy > 0 ? (F_oy / R_oy) * deltaT : 0;
  const Q_pol = F_pol > 0 && R_pol > 0 ? (F_pol / R_pol) * deltaT : 0;
  const Q_qop = F_qop > 0 && R_qop > 0 ? (F_qop / R_qop) * deltaT : 0;
  const Q_ed = F_ed * K_d;

  // Jami issiqlik yo'qotilishi sarfi
  const Q_io = Q_pol + Q_oy + Q_qop + Q_yo + Q_ed;

  // 8.8 - Me'yor belgilovchi issiqlik yo'qotilishi
  const Q_sh_tal = deltaT * (
    1.1 * F_d / R_d +
    1.1 * F_yo / R_yo +
    0.6 * F_oy / R_oy +
    F_pol / R_pol +
    1 * F_qop / R_qop +
    Q_ed
  );

  // 8.9 - Hisobiy issiqlikning ajralib chiqishi
  const q_mc1 = 10; // 10 Vt/m² (turar joy binolari uchun)
  const A_mc1_num = parseFloat(A_mc1) || 200;
  const Q_mc = q_mc1 * A_mc1_num;

  // 8.10 - Binoning ihchamlilik ko'rsatkichi
  const A_e_sum = parseFloat(A_R) + parseFloat(A_W); // Tashqi konstruksiyalar umumiy maydoni
  const V_h_num = parseFloat(V_h) || 1800;
  const k_e_des = A_e_sum / V_h_num;

  // 8.11 - Binoning keltirilgan issiqlik uzatilishi koeffitsienti
  const beta = 1.13; // Turar joy binolari uchun
  const K_tal_m = beta * (
    F_d / R_d +
    F_yo / R_yo +
    F_ed / 0.7 +
    0.8 * F_qop / R_qop +
    0.5 * F_pol / R_pol +
    0.7 * F_oy / R_oy
  ) / V_h_num;

  // 8.12 - Isitish uchun qiyosiy issiqlik iste'moli
  const A_f_num = parseFloat(A_f) || 600;
  const Q_sh = 1.1 * (Q_io + Q_mc - Q_mc) / A_f_num;

  // Me'yoriy solishtirma issiqlik sarfi
  const Q_nor = 97; // Vt/m² (QMQ 2.01.18-2000)

  // 8.13 - Hisobiy solishtirma issiqlikning me'yordan chetlanishi
  const delta_Q_sh = ((Q_sh - Q_nor) / Q_nor) * 100;

  // Energetik samaradorlik sinfi
  const getEnergyClass = (delta) => {
    if (delta <= -51) return { class: 'A', label: 'ENG YUQORI', isGood: true };
    if (delta <= -10) return { class: 'B', label: 'YUQORI', isGood: true };
    if (delta <= 5) return { class: 'C', label: 'NORMAL', isGood: true };
    if (delta <= 15) return { class: 'D', label: 'PAST', isGood: false };
    return { class: 'E', label: 'ENG PAST', isGood: false };
  };
  const energyClass = getEnergyClass(delta_Q_sh);

  // Formatlovchi funksiya
  const fmt = (val, decimals = 2) => {
    if (val == null || isNaN(val)) return "—";
    return Number(val).toFixed(decimals);
  };

  return (
    <>
      {/* 1-sahifa */}
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.pageBorder} fixed />
        <View style={pdfStyles.pageContent}>
          <Text style={pdfStyles.pageTitle}>
            8. Tashqi to'suvchi konstruksiyalardan issiqlik yo'qotilishi.
          </Text>

          {/* 8.1 Tashqi devor konstruksiyasidan issiqlik yo'qotilishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.1  Tashqi devor konstruksiyasidan issiqlik yo'qotilishi</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_oy, 1)} m²xSx°C/kkal</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>w</Text> = F<Text style={{ fontSize: 5 }}>w</Text>·1/R<Text style={{ fontSize: 5 }}>w</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_d, 1)} x 1/{fmt(R_d)} x {t_i}-({t_e}) = {fmt(Q_oy, 1)} m²xSx°C/kkal   
            </Text>
            <Text style={pdfStyles.note2}>
              Bunda: F<Text style={{ fontSize: 5 }}>w</Text> - maydon - {fmt(F_d, 1)} m²;  R<Text style={{ fontSize: 5 }}>w</Text> - tashqi devor konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_d)} m²x°C
            </Text>
          </View>

          {/* 8.2 Yorug'lik oraliqlaridan issiqlik yo'qotilishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.2  Yorug'lik oraliqlaridan issiqlik yo'qotilishi</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_yo, 1)} m²xSx°C/kkal</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>L</Text> = F<Text style={{ fontSize: 5 }}>L</Text>/R<Text style={{ fontSize: 5 }}>L</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_yo, 1)}/{fmt(R_yo)} x {t_i}-({t_e}) = {fmt(Q_yo, 1)} m²xSx°C/kkal
            </Text>
            <Text style={pdfStyles.note2}>
              Bunda: F<Text style={{ fontSize: 5 }}>L</Text> - maydon - {fmt(F_yo, 1)} m²;  R<Text style={{ fontSize: 5 }}>L</Text> - yorug'lik oraliqlari qoplama konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_yo)} m²x°C
            </Text>
          </View>

          {/* 8.3 Pol orayopmasidan issiqlik yo'qotilishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.3  Pol orayopmasidan issiqlik yo'qotilishi</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_1qavat, 1)} m²xSx°C/kkal</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>G</Text> = F<Text style={{ fontSize: 5 }}>G</Text>·1/R<Text style={{ fontSize: 5 }}>G</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_oy, 1)} x 1/{fmt(R_oy)} x {t_i}-({t_e}) = {fmt(Q_1qavat, 1)} m²xSx°C/kkal
            </Text>
            <Text style={pdfStyles.note2}>
              Bunda: F<Text style={{ fontSize: 5 }}>G</Text> - maydon - {fmt(F_oy, 1)} m²;  R<Text style={{ fontSize: 5 }}>G</Text> - orayopma konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_oy)} m²x°C
            </Text>
          </View>

          {/* 8.4 Yerdagi poldan issiqlik yo'qotilishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.4  Yerdagi poldan issiqlik yo'qotilishi</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_pol, 1)} m²xSx°C/kkal</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>CG</Text> = F<Text style={{ fontSize: 5 }}>CG</Text>·1/R<Text style={{ fontSize: 5 }}>CG</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_pol, 1)} x 1/{fmt(R_pol)} x {t_i}-({t_e}) = {fmt(Q_pol, 1)} m²xSx°C/kkal
            </Text>
            <Text style={pdfStyles.note2}>
              Bunda: F<Text style={{ fontSize: 5 }}>CG</Text> - maydon - {fmt(F_pol, 1)} m²;  R<Text style={{ fontSize: 5 }}>CG</Text> - pol konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_pol)} m²x°C
            </Text>
          </View>

          {/* 8.5 Chortoq orayopmasidan issiqlik yo'qotilishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.5  Chortoq orayopmasidan issiqlik yo'qotilishi</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_qop, 1)} m²xSx°C/kkal</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>R</Text> = A<Text style={{ fontSize: 5 }}>R</Text>·1/R<Text style={{ fontSize: 5 }}>qop.</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_qop, 1)} x 1/{fmt(R_qop)} x {t_i}-({t_e}) = {fmt(Q_qop, 1)} m²xSx°C/kkal
            </Text>
            <Text style={pdfStyles.note2}>
              Bunda: A<Text style={{ fontSize: 5 }}>R</Text> - maydon - {fmt(F_qop, 1)} m²;  R<Text style={{ fontSize: 5 }}>qop.</Text> - qoplama konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_qop)} m²x°C
            </Text>
          </View>

          {/* 8.6 Tashqi eshiklardan issiqlik yo'qotilishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.6  Tashqi eshiklardan issiqlik yo'qotilishi</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_ed, 1)} m²xSx°C/kkal</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>D</Text> = A<Text style={{ fontSize: 5 }}>D</Text> x K<Text style={{ fontSize: 5 }}>d</Text> = {fmt(F_ed, 1)} x {K_d} = {fmt(Q_ed, 1)} m²xSx°C/kkal
            </Text>
            <Text style={pdfStyles.note2}>
              Bunda: A<Text style={{ fontSize: 5 }}>D</Text> - maydon - {fmt(F_ed, 1)} m²;  K<Text style={{ fontSize: 5 }}>d</Text> = {K_d}
            </Text>
          </View>

          {/* 8.7 To'suvchi konstruksiyalardan issiqlik yo'qotilishi sarfi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.7  To'suvchi konstruksiyalardan issiqlik yo'qotilishi sarfi</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_io, 1)}</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>io</Text> = Q<Text style={{ fontSize: 5 }}>W</Text>+Q<Text style={{ fontSize: 5 }}>L</Text>+Q<Text style={{ fontSize: 5 }}>G</Text>+Q<Text style={{ fontSize: 5 }}>CG</Text>+Q<Text style={{ fontSize: 5 }}>D</Text>+Q<Text style={{ fontSize: 5 }}>R</Text> = {fmt(Q_pol, 1)} + {fmt(Q_oy, 1)} + {fmt(Q_qop, 1)} + {fmt(Q_yo, 1)} + {fmt(Q_ed, 1)} = {fmt(Q_io, 1)} m²s°C/kkal
            </Text>
          </View>

          {/* 8.8 Bino to'suvchi konstruksiyalari orqali me'yor belgilovchi issiqlik yo'qotilishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.8  Me'yor belgilovchi issiqlik yo'qotilishi</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_sh_tal, 2)}</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>sh</Text><Text style={{ fontSize: 5 }}>tal</Text> =(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) x [1,1 F<Text style={{ fontSize: 5 }}>dev.</Text>/R<Text style={{ fontSize: 5 }}>dev.</Text> + 1,1 F<Text style={{ fontSize: 5 }}>y.o.</Text>/R<Text style={{ fontSize: 5 }}>y.o.</Text> + F<Text style={{ fontSize: 5 }}>pol</Text>/R<Text style={{ fontSize: 5 }}>pol</Text> + n F<Text style={{ fontSize: 5 }}>qop.</Text>/R<Text style={{ fontSize: 5 }}>qop.</Text> + Q<Text style={{ fontSize: 5 }}>e.d.</Text>]

              = ({t_i}-({t_e})) x {'{'}1,1x{fmt(F_d, 0)}/{fmt(R_d)} + 1,1x{fmt(F_yo, 0)}/{fmt(R_yo)} + {fmt(F_pol, 0)}/{fmt(R_pol)} + 1x{fmt(F_qop, 0)}/{fmt(R_qop)} + {fmt(Q_ed, 0)}{'}'} = {fmt(Q_sh_tal, 2)}
            </Text>
          </View>

          {/* 8.9 Hisobiy issiqlikning ajralib chiqishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.9  Hisobiy issiqlikning ajralib chiqishi, Q<Text style={{ fontSize: 6 }}>mc</Text></Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_mc, 1)}</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>mc</Text> = q<Text style={{ fontSize: 5 }}>mc1</Text> x A<Text style={{ fontSize: 5 }}>mc1</Text> = {q_mc1} x {fmt(A_mc1_num, 1)} = {fmt(Q_mc, 1)}
            </Text>
            <Text style={pdfStyles.note2}>
              Bunda: q<Text style={{ fontSize: 5 }}>mc1</Text> = 10Vt/m² (1m² poldan ajraladigan issiqlik);  A<Text style={{ fontSize: 5 }}>mc1</Text> = {fmt(A_mc1_num, 1)} m²
            </Text>
          </View>

          {/* 8.10 Binoning ihchamlilik ko'rsatkichi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.10  Binoning ihchamlilik ko'rsatkichi, k<Text style={{ fontSize: 6 }}>e</Text><Text style={{ fontSize: 6 }}>des</Text></Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(k_e_des, 3)}</Text>
            </View>
            <Text style={pdfStyles.note2}>
              k<Text style={{ fontSize: 5 }}>e</Text><Text style={{ fontSize: 5 }}>des</Text> = A<Text style={{ fontSize: 5 }}>e</Text><Text style={{ fontSize: 5 }}>sum</Text>/V<Text style={{ fontSize: 5 }}>h</Text> = {fmt(A_e_sum, 1)} / {fmt(V_h_num, 1)} = {fmt(k_e_des, 3)}
            </Text>
            <Text style={pdfStyles.note2}>
              Bunda: A<Text style={{ fontSize: 5 }}>e</Text><Text style={{ fontSize: 5 }}>sum</Text> = {fmt(A_R, 1)}+{fmt(A_W, 1)} = {fmt(A_e_sum, 1)} m²;  V<Text style={{ fontSize: 5 }}>h</Text> = {fmt(V_h_num, 1)} m³
            </Text>
          </View>

          {/* 8.11 Binoning keltirilgan issiqlik uzatilishi koeffitsienti */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.11  Keltirilgan issiqlik uzatilishi koeffitsienti</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(K_tal_m, 2)}</Text>
            </View>
            <Text style={pdfStyles.note2}>
              K<Text style={{ fontSize: 5 }}>tal</Text><Text style={{ fontSize: 5 }}>m</Text>= β(F<Text style={{ fontSize: 5 }}>dev.</Text>/R<Text style={{ fontSize: 5 }}>dev.</Text>+F<Text style={{ fontSize: 5 }}>y.o.</Text>/R<Text style={{ fontSize: 5 }}>y.o.</Text>+F<Text style={{ fontSize: 5 }}>e.d.</Text>/R<Text style={{ fontSize: 5 }}>e.d.</Text>+0,8xF<Text style={{ fontSize: 5 }}>qop.</Text>/R<Text style={{ fontSize: 5 }}>qop.</Text>+0,5xF<Text style={{ fontSize: 5 }}>pol</Text>/R<Text style={{ fontSize: 5 }}>pol</Text>)/V<Text style={{ fontSize: 5 }}>h</Text>
              = {beta}({fmt(F_d, 0)}/{fmt(R_d)}+{fmt(F_yo, 0)}/0,7+{fmt(F_ed, 0)}/0,7+0,8x{fmt(F_qop, 0)}/{fmt(R_qop)}+0,5x{fmt(F_pol, 0)}/{fmt(R_pol)})/{fmt(V_h_num, 0)} = {fmt(K_tal_m, 2)} Vt/m²°C
            </Text>
            <Text style={[pdfStyles.note2, { color: '#1080c2' }]}>
              Turar joy binolari uchun β=1,13, jamoat binolari uchun β=1,1
            </Text>
          </View>
          {/* 8.12 Isitish uchun qiyosiy issiqlik iste'moli */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.12  Isitish uchun qiyosiy issiqlik iste'moli</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_sh, 2)}</Text>
            </View>
            <Text style={pdfStyles.note2}>
              Q<Text style={{ fontSize: 5 }}>sh</Text> = 1,1(Q<Text style={{ fontSize: 5 }}>io</Text>+Q<Text style={{ fontSize: 5 }}>inf</Text>-Q<Text style={{ fontSize: 5 }}>mc</Text>)/A<Text style={{ fontSize: 5 }}>F</Text> = 1,1 x ({fmt(Q_io, 1)} - {fmt(Q_mc, 1)}) / {fmt(A_f_num, 1)} = {fmt(Q_sh, 2)} Vt/m²
            </Text>
            <Text style={pdfStyles.note2}>
              Me'yoriy solishtirma issiqlik sarfi: {Q_nor} Vt/m² (QMQ 2.01.18-2000*)
            </Text>
          </View>

          {/* 8.13 Hisobiy solishtirma issiqlikning me'yordan chetlanishi */}
          <View style={{ marginTop: 8 }}>
            <View style={pdfStyles.row2}>
              <Text style={pdfStyles.labelFixSemiBold}>8.13  Me'yordan chetlanish</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(delta_Q_sh, 0)}%</Text>
            </View>
            <Text style={pdfStyles.note2}>
              ΔQ<Text style={{ fontSize: 5 }}>sh</Text> = (Q<Text style={{ fontSize: 5 }}>sh</Text>-Q<Text style={{ fontSize: 5 }}>nor.</Text>)/Q<Text style={{ fontSize: 5 }}>nor</Text>x100 = ({fmt(Q_sh, 2)}-{Q_nor})/{Q_nor} x 100 = {fmt(delta_Q_sh, 0)}%
            </Text>
          </View>

          {/* Xulosa */}
          <View style={pdfStyles.conclusion} wrap={false}>
            <Text style={pdfStyles.conclusionText}>
              Xulosa: hisob-kitob shuni ko'rsatdiki, mazkur bino energetik samaradorlikning
            </Text>
            <Text style={[pdfStyles.conclusionResult, energyClass.isGood ? pdfStyles.successText : pdfStyles.errorText]}>
              '{energyClass.label}' - {energyClass.class} sinfiga muvofiq keladi.
            </Text>
          </View>

        </View>

      </Page>
    </>
  );
};

/**
 * Alohida PDF eksport qilish funksiyasi
 */
export const exportHeatLossPdf = async ({
  initial,
  climate,
  heatingSeason,
  buildingParams,
  heatSteps,
}) => {
  const HeatLossDocument = () => (
    <Document>
      <HeatLossPages
        initial={initial}
        climate={climate}
        heatingSeason={heatingSeason}
        buildingParams={buildingParams}
        heatSteps={heatSteps}
      />
    </Document>
  );

  const blob = await pdf(<HeatLossDocument />).toBlob();
  const objectName = initial?.objectName || "Loyiha";
  saveAs(blob, `${objectName}_issiqlik_yoqotilishi.pdf`);
};
