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
  const A_L2 = getWithDefault(buildingParams?.A_L2, 'A_L2');   // Fonarlar maydoni
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

  const hasType = (types) => {
    const list = Array.isArray(types) ? types : [types];
    return heatSteps.some((s) => {
      const ct = s.presetConstructionType || s.savedState?.constructionType;
      return list.includes(ct);
    });
  };

  // R qiymatlari - heatSteps dan dinamik olish
  const R_d = getStepValue(['tashqi_devor', 'tashqi_devor_ventfasad'], 'Ro_calc') || 2.68;
  const R_deraza = getStepValue(['deraza_balkon_eshiklari'], 'windowRo') || 0.50; // Deraza
  const R_fonar = getStepValue(['fonarlar'], 'windowRo') || 0.70; // Fonarlar
  const R_oy = getStepValue(['chordoq_orayopma', 'ochiq_chordoq', 'tomyopma'], 'Ro_calc') || 2.85;
  const R_pol = getStepValue(['floor_heat_calculation'], 'Ro_calc') || 1.55;
  const R_qop = getStepValue(['chordoq_orayopma', 'ochiq_chordoq', 'tomyopma'], 'Ro_calc') || 2.49;
  const R_eshik = getStepValue(['eshik_darvoza'], 'Ro_calc') || 0.60; // Eshik
  const K_d = 7; // Eshik koeffitsienti

  // Maydonlar (hisoblangan)
  const F_d = (parseFloat(A_W) || 0) - (parseFloat(A_L) || 0) - (parseFloat(A_D) || 0); // Tashqi devor maydoni (AL2 ayrilmaydi)
  const F_deraza = parseFloat(A_L) || 0;
  const F_fonar = parseFloat(A_L2) || 0;
  const F_oy = 0; // 1-qavat pol orayopmasi (vaqtincha 0)
  const F_pol = (parseFloat(A_CG) || 0) + (parseFloat(A_G) || 0); // Yerdagi pol maydoni
  const F_qop = parseFloat(A_R) || 0; // Chortoq orayopmasi maydoni
  const F_ed = parseFloat(A_D) || 0; // Eshik maydoni

  const hasWall = hasType(['tashqi_devor', 'tashqi_devor_ventfasad']);
  const hasWindow = hasType(['deraza_balkon_eshiklari']);
  const hasFonar = hasType(['fonarlar']);
  const hasDoor = hasType(['eshik_darvoza']);
  const hasRoof = hasType(['chordoq_orayopma', 'ochiq_chordoq', 'tomyopma']);
  const hasFloor = hasType(['floor_heat_calculation']);

  // Issiqlik yo'qotishlari hisobi
  const Q_wall = hasWall && F_d > 0 && R_d > 0 ? (F_d / R_d) * deltaT : 0;
  const Q_window = hasWindow && F_deraza > 0 && R_deraza > 0 ? (F_deraza / R_deraza) * deltaT : 0;
  const Q_fonar = hasFonar && F_fonar > 0 && R_fonar > 0 ? (F_fonar / R_fonar) * deltaT : 0;
  const Q_1qavat = F_oy > 0 && R_oy > 0 ? (F_oy / R_oy) * deltaT : 0;
  const Q_pol = hasFloor && F_pol > 0 && R_pol > 0 ? (F_pol / R_pol) * deltaT : 0;
  const Q_qop = hasRoof && F_qop > 0 && R_qop > 0 ? (F_qop / R_qop) * deltaT : 0;
  const Q_ed = hasDoor ? (F_ed * K_d) : 0;

  // Jami issiqlik yo'qotilishi sarfi
  const Q_io = Q_pol + Q_wall + Q_qop + Q_window + Q_fonar + Q_ed;

  // 8.8 - Me'yor belgilovchi issiqlik yo'qotilishi
  const Q_sh_tal = deltaT * (
    (hasWall ? (1.1 * F_d / R_d) : 0) +
    (hasWindow ? (1.1 * F_deraza / R_deraza) : 0) +
    (hasFonar ? (1.1 * F_fonar / R_fonar) : 0) +
    (F_oy > 0 && R_oy > 0 ? (0.6 * F_oy / R_oy) : 0) +
    (hasFloor ? (F_pol / R_pol) : 0) +
    (hasRoof ? (1 * F_qop / R_qop) : 0) +
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
    (hasWall ? (F_d / R_d) : 0) +
    (hasWindow ? (F_deraza / R_deraza) : 0) +
    (hasFonar ? (F_fonar / R_fonar) : 0) +
    (hasDoor ? (F_ed / 0.7) : 0) +
    (hasRoof ? (0.8 * F_qop / R_qop) : 0) +
    (hasFloor ? (0.5 * F_pol / R_pol) : 0) +
    (F_oy > 0 && R_oy > 0 ? (0.7 * F_oy / R_oy) : 0)
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

          {(() => {
            let idx = 1;
            const blocks = [];

            if (hasWall) {
              const n = idx++;
              blocks.push(
                <View key={`8.${n}`} style={{ marginTop: 8 }}>
                  <View style={pdfStyles.row2}>
                    <Text style={pdfStyles.labelFixSemiBold}>8.{n}  Tashqi devor konstruksiyasidan issiqlik yo'qotilishi</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_wall, 1)} m²xSx°C/kkal</Text>
                  </View>
                  <Text style={pdfStyles.note2}>
                    Q<Text style={{ fontSize: 5 }}>w</Text> = F<Text style={{ fontSize: 5 }}>w</Text>·1/R<Text style={{ fontSize: 5 }}>w</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_d, 1)} x 1/{fmt(R_d)} x {t_i}-({t_e}) = {fmt(Q_wall, 1)} m²xSx°C/kkal
                  </Text>
                  <Text style={pdfStyles.note2}>
                    Bunda: F<Text style={{ fontSize: 5 }}>w</Text> - maydon - {fmt(F_d, 1)} m²;  R<Text style={{ fontSize: 5 }}>w</Text> - tashqi devor konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_d)} m²x°C
                  </Text>
                </View>
              );
            }

            if (hasWindow) {
              const n = idx++;
              blocks.push(
                <View key={`8.${n}`} style={{ marginTop: 8 }}>
                  <View style={pdfStyles.row2}>
                    <Text style={pdfStyles.labelFixSemiBold}>8.{n}  Derazalardan issiqlik yo'qotilishi</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_window, 1)} m²xSx°C/kkal</Text>
                  </View>
                  <Text style={pdfStyles.note2}>
                    Q<Text style={{ fontSize: 5 }}>L</Text> = F<Text style={{ fontSize: 5 }}>L</Text>/R<Text style={{ fontSize: 5 }}>L</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_deraza, 1)}/{fmt(R_deraza)} x {t_i}-({t_e}) = {fmt(Q_window, 1)} m²xSx°C/kkal
                  </Text>
                  <Text style={pdfStyles.note2}>
                    Bunda: F<Text style={{ fontSize: 5 }}>L</Text> - maydon - {fmt(F_deraza, 1)} m²;  R<Text style={{ fontSize: 5 }}>L</Text> - deraza konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_deraza)} m²x°C
                  </Text>
                </View>
              );
            }

            if (hasFonar) {
              const n = idx++;
              blocks.push(
                <View key={`8.${n}`} style={{ marginTop: 8 }}>
                  <View style={pdfStyles.row2}>
                    <Text style={pdfStyles.labelFixSemiBold}>8.{n}  Fonarlar orqali issiqlik yo'qotilishi</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_fonar, 1)} m²xSx°C/kkal</Text>
                  </View>
                  <Text style={pdfStyles.note2}>
                    Q<Text style={{ fontSize: 5 }}>L2</Text> = F<Text style={{ fontSize: 5 }}>L2</Text>/R<Text style={{ fontSize: 5 }}>L2</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_fonar, 1)}/{fmt(R_fonar)} x {t_i}-({t_e}) = {fmt(Q_fonar, 1)} m²xSx°C/kkal
                  </Text>
                  <Text style={pdfStyles.note2}>
                    Bunda: F<Text style={{ fontSize: 5 }}>L2</Text> - maydon - {fmt(F_fonar, 1)} m²;  R<Text style={{ fontSize: 5 }}>L2</Text> - fonar konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_fonar)} m²x°C
                  </Text>
                </View>
              );
            }

            if (hasFloor) {
              const n = idx++;
              blocks.push(
                <View key={`8.${n}`} style={{ marginTop: 8 }}>
                  <View style={pdfStyles.row2}>
                    <Text style={pdfStyles.labelFixSemiBold}>8.{n}  Yerdagi poldan issiqlik yo'qotilishi</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_pol, 1)} m²xSx°C/kkal</Text>
                  </View>
                  <Text style={pdfStyles.note2}>
                    Q<Text style={{ fontSize: 5 }}>GC</Text> = F<Text style={{ fontSize: 5 }}>GC</Text>·1/R<Text style={{ fontSize: 5 }}>GC</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_pol, 1)} x 1/{fmt(R_pol)} x {t_i}-({t_e}) = {fmt(Q_pol, 1)} m²xSx°C/kkal
                  </Text>
                  <Text style={pdfStyles.note2}>
                    Bunda: F<Text style={{ fontSize: 5 }}>GC</Text> - maydon - {fmt(F_pol, 1)} m²;  R<Text style={{ fontSize: 5 }}>GC</Text> - pol konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_pol)} m²x°C
                  </Text>
                </View>
              );
            }

            if (hasRoof) {
              const n = idx++;
              blocks.push(
                <View key={`8.${n}`} style={{ marginTop: 8 }}>
                  <View style={pdfStyles.row2}>
                    <Text style={pdfStyles.labelFixSemiBold}>8.{n}  Chortoq orayopmasidan issiqlik yo'qotilishi</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_qop, 1)} m²xSx°C/kkal</Text>
                  </View>
                  <Text style={pdfStyles.note2}>
                    Q<Text style={{ fontSize: 5 }}>R</Text> = A<Text style={{ fontSize: 5 }}>R</Text>·1/R<Text style={{ fontSize: 5 }}>qop.</Text>(t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) = {fmt(F_qop, 1)} x 1/{fmt(R_qop)} x {t_i}-({t_e}) = {fmt(Q_qop, 1)} m²xSx°C/kkal
                  </Text>
                  <Text style={pdfStyles.note2}>
                    Bunda: A<Text style={{ fontSize: 5 }}>R</Text> - maydon - {fmt(F_qop, 1)} m²;  R<Text style={{ fontSize: 5 }}>qop.</Text> - qoplama konstruksiyasining issiqlik uzatilishiga qarshiligi - {fmt(R_qop)} m²x°C
                  </Text>
                </View>
              );
            }

            if (hasDoor) {
              const n = idx++;
              blocks.push(
                <View key={`8.${n}`} style={{ marginTop: 8 }}>
                  <View style={pdfStyles.row2}>
                    <Text style={pdfStyles.labelFixSemiBold}>8.{n}  Tashqi eshiklardan issiqlik yo'qotilishi</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_ed, 1)} m²xSx°C/kkal</Text>
                  </View>
                  <Text style={pdfStyles.note2}>
                    Q<Text style={{ fontSize: 5 }}>D</Text> = A<Text style={{ fontSize: 5 }}>D</Text> x K<Text style={{ fontSize: 5 }}>d</Text> = {fmt(F_ed, 1)} x {K_d} = {fmt(Q_ed, 1)} m²xSx°C/kkal
                  </Text>
                  <Text style={pdfStyles.note2}>
                    Bunda: A<Text style={{ fontSize: 5 }}>D</Text> - maydon - {fmt(F_ed, 1)} m²;  K<Text style={{ fontSize: 5 }}>d</Text> = {K_d}
                  </Text>
                </View>
              );
            }

            const qParts = [];
            if (hasWall) qParts.push(`Qw=${fmt(Q_wall, 1)}`);
            if (hasWindow) qParts.push(`QL=${fmt(Q_window, 1)}`);
            if (hasFonar) qParts.push(`QL2=${fmt(Q_fonar, 1)}`);
            if (hasFloor) qParts.push(`QCG=${fmt(Q_pol, 1)}`);
            if (hasRoof) qParts.push(`QR=${fmt(Q_qop, 1)}`);
            if (hasDoor) qParts.push(`QD=${fmt(Q_ed, 1)}`);

            {
              const n = idx++;
              blocks.push(
                <View key={`8.${n}`} style={{ marginTop: 8 }}>
                  <View style={pdfStyles.row2}>
                    <Text style={pdfStyles.labelFixSemiBold}>8.{n}  To'suvchi konstruksiyalardan issiqlik yo'qotilishi sarfi</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_io, 1)}</Text>
                  </View>
                  <Text style={pdfStyles.note2}>
                    Q<Text style={{ fontSize: 5 }}>io</Text> = {qParts.join(" + ")} = {fmt(Q_io, 1)}
                  </Text>
                </View>
              );
            }

            {
              const n = idx++;
              blocks.push(
                <View key={`8.${n}`} style={{ marginTop: 8 }}>
                  <View style={pdfStyles.row2}>
                    <Text style={pdfStyles.labelFixSemiBold}>8.{n}  Me'yor belgilovchi issiqlik yo'qotilishi</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1080C2' }}>{fmt(Q_sh_tal, 2)}</Text>
                  </View>
                  <Text style={pdfStyles.note2}>
                    Q<Text style={{ fontSize: 5 }}>sh</Text><Text style={{ fontSize: 5 }}>tal</Text> = (t<Text style={{ fontSize: 5 }}>i</Text>-t<Text style={{ fontSize: 5 }}>t</Text>) × [ ... ] = {fmt(Q_sh_tal, 2)}
                  </Text>
                </View>
              );
            }

            return blocks;
          })()}

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
              = {beta}({fmt(F_d, 0)}/{fmt(R_d)}+{fmt(F_deraza, 0)}/0,7+{fmt(F_ed, 0)}/0,7+0,8x{fmt(F_qop, 0)}/{fmt(R_qop)}+0,5x{fmt(F_pol, 0)}/{fmt(R_pol)})/{fmt(V_h_num, 0)} = {fmt(K_tal_m, 2)} Vt/m²°C
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
