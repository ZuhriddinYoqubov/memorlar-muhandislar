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

// Faqat sahifalar komponenti (Document siz) - birlashtirilgan PDF uchun
export const QStepPages = ({ initial, climate, heatingSeason, qStepData, layers, heatSteps = [] }) => {
  const currentYear = new Date().getFullYear();

  // Obekt nomini tayyorlash
  let objectName = initial?.objectName || "Loyiha nomi";
  if (objectName.endsWith(".")) {
    objectName = objectName.slice(0, -1);
  }
  const rawType = (initial?.objectType || "").trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : "";
  const objectInfo = `${objectName}${typePart} bo'yicha`;

  // Province va Region nomlarini olish
  const provinceName = initial?.provinceName || initial?.province || "Viloyat";
  const regionName = initial?.regionName || initial?.region || "Tuman/Shahar";

  // Harorat parametrlari
  const t_i = climate?.t_in || 0;
  const t_e = climate?.t_out || 0;
  const t_is_dav = heatingSeason?.t_is_dav || 0;
  const Z_is_dav = heatingSeason?.Z_is_dav || 0;
  const D_d = t_i && t_is_dav && Z_is_dav ? (t_i - t_is_dav) * Z_is_dav : 0;

  // Q step ma'lumotlari (vaqtincha default qiymatlar bilan)
  const P_m = getWithDefault(qStepData?.P_m, 'P_m');
  const H_m = getWithDefault(qStepData?.H_m, 'H_m');
  const floors = getWithDefault(qStepData?.floors, 'floors');
  const A_f = getWithDefault(qStepData?.A_f, 'A_f');
  const A_mc1 = getWithDefault(qStepData?.A_mc1, 'A_mc1');
  const V_h = getWithDefault(qStepData?.V_h, 'V_h');
  const Xodim = getWithDefault(qStepData?.Xodim, 'Xodim');
  const roofType = getWithDefault(qStepData?.roofType, 'roofType');
  const A_W = getWithDefault(qStepData?.A_W, 'A_W');
  const A_L = getWithDefault(qStepData?.A_L, 'A_L');
  const A_L2 = getWithDefault(qStepData?.A_L2, 'A_L2'); // Fonarlar maydoni
  const A_D = getWithDefault(qStepData?.A_D, 'A_D');
  const A_CG = getWithDefault(qStepData?.A_CG, 'A_CG');
  const A_G = getWithDefault(qStepData?.A_G, 'A_G');
  const A_R = getWithDefault(qStepData?.A_R, 'A_R');

  // Hisoblangan qiymatlar
  const A_W_net = (Number(A_W) || 0) - (Number(A_L) || 0) - (Number(A_D) || 0);
  const sumA_G = (Number(A_CG) || 0) + (Number(A_G) || 0);

  // Tashqi devor - eng qalin qatlam
  const thickestLayer = layers && layers.length > 0
    ? layers.reduce((max, layer) => {
        const thickness = Number(layer.thickness_mm) || 0;
        const maxThickness = Number(max?.thickness_mm) || 0;
        return thickness > maxThickness ? layer : max;
      }, layers[0])
    : null;

  // Izolyatsiya - eng yaxshi izolyatsiya (eng kichik lambda)
  const bestInsulationLayer = layers && layers.length > 0
    ? layers.reduce((best, layer) => {
        const lambda = Number(layer.lambda) || Infinity;
        const bestLambda = Number(best?.lambda) || Infinity;
        return lambda < bestLambda ? layer : best;
      }, layers[0])
    : null;

  // Tomyopma turi nomi - heatSteps dan dinamik olish
  const roofTypeLabels = {
    tomyopma: "Tomyopma",
    ochiq_chordoq: "Ochiq chordoq ustidagi orayopma",
    chordoq_orayopma: "Chordoq orayopmasi",
  };
  
  // heatSteps dan tomyopma turini aniqlash
  const getRoofTypeFromHeatSteps = () => {
    if (!heatSteps || heatSteps.length === 0) return null;
    const roofTypes = ['tomyopma', 'ochiq_chordoq', 'chordoq_orayopma'];
    for (const rt of roofTypes) {
      const step = heatSteps.find(s => 
        (s.presetConstructionType || s.savedState?.constructionType) === rt
      );
      if (step) return rt;
    }
    return null;
  };
  
  const detectedRoofType = getRoofTypeFromHeatSteps() || roofType;
  const roofTypeLabel = roofTypeLabels[detectedRoofType] || detectedRoofType || "—";

  // heatSteps dan qaysi konstruksiyalar ishlangan bo'lsa aniqlash
  const hasConstructionType = (types) => {
    if (!heatSteps || heatSteps.length === 0) return false;
    const typeArray = Array.isArray(types) ? types : [types];
    return heatSteps.some(s => {
      const ct = s.presetConstructionType || s.savedState?.constructionType;
      return typeArray.includes(ct);
    });
  };

  // Qaysi konstruksiyalar ishlangan
  const hasWall = hasConstructionType(['tashqi_devor', 'tashqi_devor_ventfasad']);
  const hasWindow = hasConstructionType(['deraza_balkon_eshiklari']);
  const hasFonar = hasConstructionType(['fonarlar']);
  const hasDoor = hasConstructionType(['eshik_darvoza']);
  const hasFloor = hasConstructionType(['floor_heat_calculation']);
  const hasRoof = hasConstructionType(['tomyopma', 'ochiq_chordoq', 'chordoq_orayopma']);
  const hasBasement = hasConstructionType([
    'yertola_tashqi_havo_boglangan',
    'isitilmaydigan_yertola_yoruglik_oraliqli',
    'isitilmaydigan_yertola_yuqori_yorugliksiz',
    'isitilmaydigan_texnik_tagxona_pastda'
  ]);

  // Qiymatni formatlash
  const formatValue = (val, unit = "", decimals = 2) => {
    if (val == null || val === "" || isNaN(val)) return "—";
    const num = parseFloat(val);
    return decimals != null ? `${num.toFixed(decimals)} ${unit}`.trim() : `${num} ${unit}`.trim();
  };

  return (
    <>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.pageBorder} fixed />
        <View style={pdfStyles.pageContent}>
          {/* Sarlavha */}
          <Text style={pdfStyles.pageTitle}>
            Isitishga me'yoriy solishtirma issiqlik sarfi hisobi
          </Text>
          <Text style={pdfStyles.pageSubtitle}>
            Obekt nomi: {initial?.objectName || "obekt nomi"}
          </Text>

          {/* Dastlabki ma'lumotlar */}
          <Text style={pdfStyles.sectionTitle}>Dastlabki ma'lumotlar</Text>

          {/* Hudud */}
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.labelFix}>Hudud</Text>
            <Text style={pdfStyles.value}>{provinceName}, {regionName}</Text>
          </View>

          {/* Bino perimetri */}
          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Bino perimetri, </Text>
              <Text style={pdfStyles.mainVariableText}>P</Text>
            </View>
            <Text style={pdfStyles.value}>{formatValue(P_m, "m")}</Text>
          </View>

          {/* Balandligi */}
          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Balandligi, </Text>
              <Text style={pdfStyles.mainVariableText}>H</Text>
            </View>
            <Text style={pdfStyles.value}>{formatValue(H_m, "m")}</Text>
          </View>

          {/* Qavatlilik */}
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.labelFix}>Qavatlilik</Text>
            <Text style={pdfStyles.value}>{formatValue(floors, " qavat", 0)}</Text>
          </View>

          {/* Bino umumiy maydoni */}
          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Bino umumiy maydoni, </Text>
              <Text style={pdfStyles.mainVariableText}>A</Text>
              <Text style={pdfStyles.subscriptText}>f</Text>
            </View>
            <Text style={pdfStyles.value}>{formatValue(A_f, "m²")}</Text>
          </View>

          {/* Amc.1 - birinchi qavat maydoni */}
          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Birinchi qavat maydoni, </Text>
              <Text style={pdfStyles.mainVariableText}>A</Text>
              <Text style={pdfStyles.subscriptText}>mc.1</Text>
            </View>
            <Text style={pdfStyles.value}>{formatValue(A_mc1, "m²")}</Text>
          </View>

          {/* Binoning hisobiy quvvati */}
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.labelFix}>Binoning hisobiy quvvati</Text>
            <Text style={pdfStyles.value}>{formatValue(Xodim, "kishi", 0)}</Text>
          </View>

          {/* Tomyopma turi */}
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.labelFix}>Tomyopma turi</Text>
            <Text style={pdfStyles.value}>{roofTypeLabel}</Text>
          </View>

          {/* Harorat parametrlari */}
          <Text style={[pdfStyles.sectionTitle, { marginTop: 12 }]}>Harorat parametrlari</Text>

          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Ichki havo hisobiy harorati, </Text>
              <Text style={pdfStyles.mainVariableText}>t</Text>
              <Text style={pdfStyles.subscriptText}>i</Text>
            </View>
            <Text style={pdfStyles.value}>{t_i ? `${t_i} °C` : "—"}</Text>
          </View>

          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Tashqi havo hisobiy harorati, </Text>
              <Text style={pdfStyles.mainVariableText}>t</Text>
              <Text style={pdfStyles.subscriptText}>e</Text>
            </View>
            <Text style={pdfStyles.value}>{t_e ? `${t_e} °C` : "—"}</Text>
          </View>

          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Gradussutka, </Text>
              <Text style={pdfStyles.mainVariableText}>D</Text>
              <Text style={pdfStyles.subscriptText}>d</Text>
            </View>
            <Text style={pdfStyles.value}>{D_d ? `${D_d.toFixed(0)} °C·sutka` : "—"}</Text>
          </View>

          {/* Material parametrlari */}
          <Text style={[pdfStyles.sectionTitle, { marginTop: 12 }]}>Material parametrlari</Text>

          {/* Tashqi devor */}
          <View style={pdfStyles.row}>
            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Tashqi devor</Text>
          </View>
          
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.labelFix}>Material nomi</Text>
            <Text style={pdfStyles.value}>{thickestLayer?.name || "—"}</Text>
          </View>

          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Zichlik, </Text>
              <Text style={pdfStyles.mathText}>γ</Text>
            </View>
            <Text style={pdfStyles.value}>{thickestLayer?.rho ? `${thickestLayer.rho} kg/m³` : "—"}</Text>
          </View>

          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Qalinlik, </Text>
              <Text style={pdfStyles.mathText}>δ</Text>
            </View>
            <Text style={pdfStyles.value}>{thickestLayer?.thickness_mm ? `${thickestLayer.thickness_mm} mm` : "—"}</Text>
          </View>

          {/* Izolyatsiya */}
          <View style={[pdfStyles.row, { marginTop: 6 }]}>
            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Izolyatsiya</Text>
          </View>
          
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.labelFix}>Material nomi</Text>
            <Text style={pdfStyles.value}>{bestInsulationLayer?.name || "—"}</Text>
          </View>

          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Zichlik, </Text>
              <Text style={pdfStyles.mathText}>γ</Text>
            </View>
            <Text style={pdfStyles.value}>{bestInsulationLayer?.rho ? `${bestInsulationLayer.rho} kg/m³` : "—"}</Text>
          </View>

          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Qalinlik, </Text>
              <Text style={pdfStyles.mathText}>δ</Text>
            </View>
            <Text style={pdfStyles.value}>{bestInsulationLayer?.thickness_mm ? `${bestInsulationLayer.thickness_mm} mm` : "—"}</Text>
          </View>

          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Issiqlik o'tkazuvchanlik, </Text>
              <Text style={pdfStyles.mathText}>λ</Text>
            </View>
            <Text style={pdfStyles.value}>{bestInsulationLayer?.lambda ? `${bestInsulationLayer.lambda} Vt/(m·°C)` : "—"}</Text>
          </View>

          {/* Bino to'suvchi konstruksiyalari - faqat ITH ishlangan konstruksiyalar ko'rinadi */}
          <Text style={[pdfStyles.sectionTitle, { marginTop: 12 }]}>
            Bino to'suvchi konstruksiyalari orqali me'yoriy issiqlik yo'qotishlarini aniqlash hisobi
          </Text>

          {/* Fasad maydoni - faqat devor ITH ishlangan bo'lsa */}
          {hasWall && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Fasad maydoni, </Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>Fas</Text>
              </View>
              <Text style={pdfStyles.value}>{formatValue(A_W, "m²")}</Text>
            </View>
          )}

          {/* Tashqi devorlarning maydoni (net) - faqat devor ITH ishlangan bo'lsa */}
          {hasWall && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Tashqi devorlarning maydoni (deraza va tashqi eshiklar maydonini hisobga olmaganda), </Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>W</Text>
              </View>
              <Text style={pdfStyles.value}>{A_W_net > 0 ? `${A_W_net.toFixed(2)} m²` : "—"}</Text>
            </View>
          )}

          {/* Derazalar va vitrinalar maydoni - faqat deraza ITH ishlangan bo'lsa */}
          {hasWindow && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Derazalar va vitrinalar maydoni, </Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>L</Text>
              </View>
              <Text style={pdfStyles.value}>{formatValue(A_L, "m²")}</Text>
            </View>
          )}

          {/* Fonarlar maydoni - faqat fonar ITH ishlangan bo'lsa */}
          {hasFonar && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Fonarlar maydoni, </Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>L2</Text>
              </View>
              <Text style={pdfStyles.value}>{formatValue(A_L2, "m²")}</Text>
            </View>
          )}

          {/* Eshiklar maydoni - faqat eshik ITH ishlangan bo'lsa */}
          {hasDoor && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Eshiklar maydoni, </Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>D</Text>
              </View>
              <Text style={pdfStyles.value}>{formatValue(A_D, "m²")}</Text>
            </View>
          )}

          {/* Yerdagi pol hamda yer sathidan pastdagi devorlar maydoni - faqat pol ITH ishlangan bo'lsa */}
          {hasFloor && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Yerdagi pol hamda yer sathidan pastdagi devorlar maydoni, </Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>CG</Text>
              </View>
              <Text style={pdfStyles.value}>{formatValue(A_CG, "m²")}</Text>
            </View>
          )}

          {/* Isitilmaydigan yerto'la ustidagi pol maydoni - faqat yerto'la ITH ishlangan bo'lsa */}
          {hasBasement && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Isitilmaydigan yerto'la ustidagi pol maydoni, </Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>G</Text>
              </View>
              <Text style={pdfStyles.value}>{formatValue(A_G, "m²")}</Text>
            </View>
          )}

          {/* Jami pol maydoni - faqat pol yoki yerto'la ITH ishlangan bo'lsa */}
          {(hasFloor || hasBasement) && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Jami pol maydoni, </Text>
                <Text style={pdfStyles.mathText}>Σ</Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>G</Text>
              </View>
              <Text style={pdfStyles.value}>{sumA_G > 0 ? `${sumA_G.toFixed(2)} m²` : "—"}</Text>
            </View>
          )}

          {/* Tomyopmalar maydoni - faqat tom ITH ishlangan bo'lsa */}
          {hasRoof && (
            <View style={pdfStyles.row}>
              <View style={pdfStyles.labelWithSubscript}>
                <Text style={pdfStyles.labelFix}>Tomyopmalar (yoki chordoq orayopmalari)ning jami maydoni, </Text>
                <Text style={pdfStyles.mainVariableText}>A</Text>
                <Text style={pdfStyles.subscriptText}>R</Text>
              </View>
              <Text style={pdfStyles.value}>{formatValue(A_R, "m²")}</Text>
            </View>
          )}

          {/* Binoning isitiladigan hajmi - har doim ko'rinadi */}
          <View style={pdfStyles.row}>
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Binoning isitiladigan hajmi, </Text>
              <Text style={pdfStyles.mainVariableText}>V</Text>
              <Text style={pdfStyles.subscriptText}>h</Text>
            </View>
            <Text style={pdfStyles.value}>{formatValue(V_h, "m³")}</Text>
          </View>

        </View>

        {/* Footer */}
        <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0 }} fixed>
          <Text style={{ fontSize: 8, color: '#888888', textAlign: 'center' }}>
            © {currentYear} | Loyiha qiymati kalkulyatori
          </Text>
        </View>
      </Page>
    </>
  );
};

// PDF Document komponenti (alohida eksport uchun)
const QStepPdfDocument = ({ initial, climate, heatingSeason, qStepData, layers, heatSteps }) => (
  <Document>
    <QStepPages
      initial={initial}
      climate={climate}
      heatingSeason={heatingSeason}
      qStepData={qStepData}
      layers={layers}
      heatSteps={heatSteps}
    />
  </Document>
);

// PDF eksport funksiyasi
export async function exportQStepPdfReact({ initial, climate, heatingSeason, qStepData, layers, heatSteps }) {
  try {
    const blob = await pdf(
      <QStepPdfDocument
        initial={initial}
        climate={climate}
        heatingSeason={heatingSeason}
        qStepData={qStepData}
        layers={layers}
        heatSteps={heatSteps}
      />
    ).toBlob();

    const version = 1;
    saveAs(blob, `ITH - Q Step - v${version}.pdf`);
  } catch (error) {
    console.error('Q Step PDF yaratishda xato:', error);
    alert('PDF yaratishda xato yuz berdi!');
  }
}
