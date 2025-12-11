import React from 'react';
import { Document, Page, Text, View, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdfStyles } from './pdfStyles';
import {
  getPhiNote,
  getTIsDavNote,
  getZIsDavNote,
  getTOutNote,
  getDeltaTtNote,
  getAlphaINote,
  getAlphaTNote,
  getDIsDavNote,
  getRoTalSGNote,
  getRoTalNote,
  getRkNote,
  getRoNote,
} from "../data/heatCalculations";

// Noto Sans Math fontini ro'yxatdan o'tkazish
import NotoSansMathUrl from '../../../assets/fonts/NotoSansMath-Regular.ttf';

Font.register({
  family: 'NotoSansMath',
  src: NotoSansMathUrl,
});

// Faqat sahifalar komponenti (Document siz) - birlashtirilgan PDF uchun
export const HeatPages = ({ initial, climate, heatingSeason, heatStep, constructionType, showTitlePage = true }) => {
  const saved = heatStep?.savedState;
  const currentYear = new Date().getFullYear();

  // Obekt nomini tayyorlash
  let objectName = initial.objectName || "Loyiha nomi";
  if (objectName.endsWith(".")) {
    objectName = objectName.slice(0, -1);
  }
  const rawType = (initial.objectType || "").trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : "";
  const objectInfo = `${objectName}${typePart} bo'yicha`;

  // Province va Region nomlarini olish (HeatWizard dan yuborilgan)
  const provinceName = initial.provinceName || initial.province || "Viloyat";
  const regionName = initial.regionName || initial.region || "Tuman/Shahar";

  // Xulosa
  const RoCalc = saved?.Ro_calc;
  const RoTalabVal = saved?.RoTalab;
  const RoTalSGVal = saved?.Ro_MG;
  const isSatisfied = RoCalc != null && RoTalabVal != null && RoTalSGVal != null
    ? (RoCalc >= RoTalSGVal && RoCalc >= RoTalabVal)
    : (RoCalc != null && RoTalabVal != null && RoCalc >= RoTalabVal);

  return (
    <>
      {/* 1-SAHIFA: TITLE (faqat showTitlePage=true bo'lganda) */}
      {showTitlePage && (
        <Page size="A4" style={pdfStyles.titlePage}>
          <View style={pdfStyles.titleBorder}>
            <Text style={pdfStyles.companyName}>ARCHIPELAG MCHJ</Text>
            <Text style={pdfStyles.objectInfo}>{objectInfo}</Text>
            <Text style={pdfStyles.mainTitle}>ISSIQLIK TEXNIK XISOBI</Text>
            <Text style={pdfStyles.yearInfo}>{provinceName} - {currentYear}-yil</Text>
          </View>
        </Page>
      )}

      {/* 2-SAHIFA: HISOB */}
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.pageBorder} fixed />
        <View style={pdfStyles.pageContent}>
          {/* Sarlavha */}
          <Text style={pdfStyles.pageTitle}>
            {heatStep?.label || "2"}.{constructionType?.label || "Tashqi devor"} issiqlik texnik hisobi
          </Text>
          <Text style={pdfStyles.pageSubtitle}>
            Obekt nomi: {initial.objectName || "obekt nomi"}
          </Text>

          {/* Dastlabki ma'lumotlar */}
          <Text style={pdfStyles.sectionTitle}>Dastlabki ma'lumotlar</Text>

          {/* Hudud */}
          <View style={pdfStyles.row}>
            <Text style={{ fontSize: 9, width: 40 }}>Hudud</Text>
            <Text style={{ flex: 1 }}></Text>
            <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>
              {provinceName}, {regionName}
            </Text>
          </View>

          {/* Ichki havoning hisobiy harorati */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Ichki havoning hisobiy harorati, </Text>
              <Text style={pdfStyles.mainVariableText}>t</Text>
              <Text style={pdfStyles.subscriptText}>i</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={pdfStyles.value}>
                {climate?.t_in != null ? `${climate.t_in} °C` : "—"}
              </Text>
            </View>
          </View>

          {/* Ichki havoning nisbiy namligi */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Ichki havoning nisbiy namligi, </Text>
              <Text style={pdfStyles.mathText}>φ</Text>
              <Text style={pdfStyles.subscriptText}>i</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={pdfStyles.value}>
                {climate?.phi_in != null ? `${climate.phi_in} %` : "—"}
              </Text>
            </View>
          </View>
          {saved?.humidityRegimeInfo && getPhiNote(saved.humidityRegimeInfo, climate?.phi_in) && (
            <Text style={pdfStyles.note}>{getPhiNote(saved.humidityRegimeInfo, climate?.phi_in)}</Text>
          )}

          {/* t_is_dav */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning o'rtacha harorati, </Text>
              <Text style={pdfStyles.mainVariableText}>t</Text>
              <Text style={pdfStyles.subscriptText}>is.dav</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={pdfStyles.value}>
                {heatingSeason?.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—"}
              </Text>
            </View>
          </View>
          {getTIsDavNote() && (
            <Text style={pdfStyles.note}>{getTIsDavNote()}</Text>
          )}

          {/* Z_is_dav */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning davomiyligi, </Text>
              <Text style={pdfStyles.mainVariableText}>Z</Text>
              <Text style={pdfStyles.subscriptText}>is.dav</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={pdfStyles.value}>
                {heatingSeason?.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—"}
              </Text>
            </View>
          </View>
          {getZIsDavNote() && (
            <Text style={pdfStyles.note}>{getZIsDavNote()}</Text>
          )}

          {/* Tashqi havoning hisobiy qishki harorati */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Tashqi havoning hisobiy qishki harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', }}>t</Text>
              <Text style={pdfStyles.subscriptText}>t</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={pdfStyles.value}>
                {climate?.t_out != null ? `${climate.t_out} °C` : "—"}
              </Text>
            </View>
          </View>
          {getTOutNote() && (
            <Text style={pdfStyles.note}>{getTOutNote()}</Text>
          )}

          {/* Materiallar jadvali */}
          {saved?.layers && saved.layers.length > 0 && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>To'suvchi konstruksiya materiallarining xususiyatlari</Text>

              <View style={pdfStyles.table}>
                <View style={pdfStyles.tableHeader}>
                  <Text style={[pdfStyles.tableCell, { flex: 0.3 }]}>#</Text>
                  <Text style={[pdfStyles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Material</Text>
                  <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                    <Text style={[pdfStyles.mathText, {color: 'black'}]}>δ</Text>, mm
                  </Text>
                  <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                    <Text style={[pdfStyles.mathText, {color: 'black'}]}>γ</Text>, kg/m³
                  </Text>
                  <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                    <Text style={[pdfStyles.mathText, {color: 'black'}]}>λ</Text>
                  </Text>
                  <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>R</Text>
                </View>

                {saved.layers.map((layer, idx) => (
                  <View key={idx} style={pdfStyles.tableRow}>
                    <Text style={[pdfStyles.tableCell, { flex: 0.3 }]}>{idx + 1}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'left' }]}>{layer.name || "—"}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer.thickness_mm || "—"}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer.rho || "—"}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer.lambda || "—"}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer.R || "—"}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Normativ parametrlar */}
          <Text style={pdfStyles.sectionTitle}>Normativ parametrlar</Text>

          {/* Delta t_t */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Ichki havo harorati va to'suvchi konstruksiyaning ichki yuzasi harorati o'rtasidagi me'yoriy harorat farqi, </Text>
              <Text style={pdfStyles.mathText}>Δt</Text>
              <Text style={pdfStyles.subscriptText}>t</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.delta_t_n != null ? (
                <>
                  <Text style={pdfStyles.value}>{saved.delta_t_n.toFixed(1)} °C</Text>
                </>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {saved?.delta_t_n_row && getDeltaTtNote(saved.delta_t_n_row) && (
            <Text style={pdfStyles.note}>{getDeltaTtNote(saved.delta_t_n_row)}</Text>
          )}

          {/* Alpha i */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>To'suvchi konstruksiyalarning ichki yuzasining issiqlik berish koeffitsienti, </Text>
              <Text style={pdfStyles.mathText}>α</Text>
              <Text style={pdfStyles.subscriptText}>i</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.alpha_i != null ? (
                <>
                  <Text style={pdfStyles.value}>{saved.alpha_i.toFixed(1)} Vt/(m²·°C)</Text>
                </>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {saved?.alpha_i_row && getAlphaINote(saved.alpha_i_row) && (
            <Text style={pdfStyles.note}>{getAlphaINote(saved.alpha_i_row)}</Text>
          )}

          {/* Alpha t */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>To'suvchi konstruksiyalarning tashqi yuzasining issiqlik berish koeffitsienti, </Text>
              <Text style={pdfStyles.mathText}>α</Text>
              <Text style={pdfStyles.subscriptText}>t</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.alpha_t != null ? (
                <>
                  <Text style={pdfStyles.value}>{saved.alpha_t.toFixed(0)} Vt/(m²·°C)</Text>
                </>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {saved?.alpha_t_row && getAlphaTNote(saved.alpha_t_row) && (
            <Text style={pdfStyles.note}>{getAlphaTNote(saved.alpha_t_row)}</Text>
          )}

          {/* D_is_dav */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Isitish davrining gradus-sutkasi, </Text>
              <Text style={pdfStyles.mainVariableText}>D</Text>
              <Text style={pdfStyles.subscriptText}>is.dav</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.D_d_dav != null ? (
                <>
                  <Text style={pdfStyles.value}>{saved.D_d_dav.toFixed(0)} °C·sutka</Text>
                </>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getDIsDavNote({ t_in: saved.t_in, t_is_dav: saved.t_is_dav, Z_is_dav: saved.Z_is_dav, D_d_dav: saved.D_d_dav });
            return saved?.D_d_dav && noteData ? (
              <Text style={pdfStyles.note}>
                D<Text style={{ fontSize: 5 }}>is.dav</Text> = (t<Text style={{ fontSize: 5 }}>i</Text> - t<Text style={{ fontSize: 5 }}>is.dav</Text>) × Z<Text style={{ fontSize: 5 }}>is.dav</Text> = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}



          {/*Ro Tal.SG*/}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Sanitariya-gigiena talablariga muvofiq me'yoriy (ruxsat etilgan maksimal) qarshilik, </Text>
              <Text style={pdfStyles.mainVariableText}>R</Text>
              <Text style={pdfStyles.subscriptText}>o</Text>
              <Text style={{ fontSize: 5, lineHeight: 2, color: '#1080C2', fontWeight: 'bold' }}>Tal.SG</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.Ro_MG != null ? (
                <>
                  <Text style={pdfStyles.value}>{saved.Ro_MG.toFixed(2)} m²·°C/Vt</Text>
                </>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getRoTalSGNote({ t_in: saved.t_in, t_out: saved.t_out, delta_t_n: saved.delta_t_n, alpha_i: saved.alpha_i, Ro_MG: saved.Ro_MG });
            return saved?.Ro_MG && noteData ? (
              <Text style={pdfStyles.note}>
                R<Text style={{ fontSize: 5 }}>o</Text><Text style={{ fontSize: 5, lineHeight: 2 }}>Tal.SG</Text> = n(t<Text style={{ fontSize: 5 }}>i</Text> - t<Text style={{ fontSize: 5 }}>t</Text>) / (Δt<Text style={{ fontSize: 5 }}>t</Text> × α<Text style={{ fontSize: 5 }}>i</Text>) = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}

          {/* Ro Talab */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>To'suvchi konstruksiyaning talab etilgan issiqlik uzatilishiga keltirilgan qarshiligi, </Text>
              <Text style={pdfStyles.mainVariableText}>R</Text>
              <Text style={pdfStyles.subscriptText}>o</Text>
              <Text style={{ fontSize: 5, lineHeight: 2, color: '#1080C2', fontWeight: 'bold' }}>Tal.</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.RoTalab != null ? (
                <>

                  <Text style={pdfStyles.value}>{saved.RoTalab.toFixed(2)} m²·°C/Vt</Text>
                </>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {saved?.RoResult_row && getRoTalNote(saved.RoResult_row, saved.protectionLevel) && (
            <Text style={pdfStyles.note}>{getRoTalNote(saved.RoResult_row, saved.protectionLevel)}</Text>
          )}




          {/* R_k */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>Ko'p qatlamli to'suvchi konstruksiyaning termik qarshiligi, </Text>
              <Text style={pdfStyles.mainVariableText}>R</Text>
              <Text style={pdfStyles.subscriptText}>k</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.R_k != null ? (
                <>
                  <Text style={pdfStyles.value}>{saved.R_k.toFixed(2)} m²·°C/Vt</Text>
                </>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getRkNote(saved.layers, saved.R_k);
            return saved?.layers && noteData ? (
              <Text style={pdfStyles.note}>
                R<Text style={{ fontSize: 5 }}>k</Text> = R<Text style={{ fontSize: 5 }}>1</Text>+R<Text style={{ fontSize: 5 }}>2</Text>+...+R<Text style={{ fontSize: 5 }}>{saved.layers.length}</Text> = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}

          {/* Ro calc */}
          <View style={pdfStyles.row}>
            {/*CHAP BLOK*/}
            <View style={pdfStyles.labelWithSubscript}>
              <Text style={pdfStyles.labelFix}>To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi, </Text>
              <Text style={pdfStyles.mainVariableText}>R</Text>
              <Text style={pdfStyles.subscriptText}>o</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.Ro_calc != null ? (
                <>
                  <Text style={pdfStyles.value}>{saved.Ro_calc.toFixed(2)} m²·°C/Vt</Text>
                </>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getRoNote({ alpha_i: saved.alpha_i, alpha_t: saved.alpha_t, R_k: saved.R_k, Ro_calc: saved.Ro_calc });
            return saved?.Ro_calc && noteData ? (
              <Text style={pdfStyles.note}>
                R<Text style={{ fontSize: 5 }}>o</Text> = (1 / α<Text style={{ fontSize: 5, fontFamily: 'NotoSansMath', lineHeight: 0 }}>i</Text>) + R<Text style={{ fontSize: 5 }}>k</Text> + (1 / α<Text style={{ fontSize: 5 }}>t</Text>) = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}

          {/* Xulosa */}
          {RoCalc != null && RoTalabVal != null && (
            <View style={pdfStyles.conclusion} wrap={false} break>
              <Text style={pdfStyles.conclusionText}>
                To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi ( R<Text style={{ fontSize: 8 }}>o</Text> = {RoCalc.toFixed(2)} m²·°C/Vt) talab etilganidan ( R<Text style={{ fontSize: 8 }}>o</Text><Text style={{ fontSize: 7, lineHeight: 2 }}>Tal.</Text> = {RoTalabVal.toFixed(2)} m²·°C/Vt) {isSatisfied ? 'katta.' : 'kichik.'}
              </Text>
              <Text style={[pdfStyles.conclusionResult, isSatisfied ? pdfStyles.successText : pdfStyles.errorText]}>
                {isSatisfied ? 'Issiqlik himoyasi talabiga muvofiq keladi!' : 'Issiqlik himoyasi talabiga muvofiq kelmaydi!'}
              </Text>
            </View>
          )}

        </View>

        {/* Footer - ramkadan tashqarida */}
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
const HeatPdfDocument = ({ initial, climate, heatingSeason, heatStep, constructionType }) => (
  <Document>
    <HeatPages
      initial={initial}
      climate={climate}
      heatingSeason={heatingSeason}
      heatStep={heatStep}
      constructionType={constructionType}
      showTitlePage={true}
    />
  </Document>
);

// PDF eksport funksiyasi
export async function exportHeatStepPdfReact({ initial, climate, heatingSeason, heatStep, CONSTRUCTION_TYPES }) {
  const constructionType = heatStep?.savedState
    ? CONSTRUCTION_TYPES.find((ct) => ct.id === heatStep.savedState.constructionType)
    : null;

  try {
    const blob = await pdf(
      <HeatPdfDocument
        initial={initial}
        climate={climate}
        heatingSeason={heatingSeason}
        heatStep={heatStep}
        constructionType={constructionType}
      />
    ).toBlob();

    // Versiya raqami - har safar o'zgartirish qilganda oshiring
    const version = 6;
    saveAs(blob, `ITH - ${heatStep?.label || "2.n"} - v${version}.pdf`);
  } catch (error) {
    console.error('PDF yaratishda xato:', error);
    alert('PDF yaratishda xato yuz berdi!');
  }
}
