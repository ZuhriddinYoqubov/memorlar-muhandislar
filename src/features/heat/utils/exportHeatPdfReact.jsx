import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
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

// Stillar
const styles = StyleSheet.create({
  // Title sahifa
  titlePage: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  titleBorder: {
    border: '1.5pt solid #1080C2',
    borderRadius: 8,
    width: '100%',
    height: '95%',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  objectInfo: {
    fontSize: 14,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  yearInfo: {
    fontSize: 10,
    textAlign: 'center',
  },
  // Asosiy sahifa
  page: {
    padding: 15,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  pageContent: {
       padding: 15,
  },
  pageBorder: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    border: '1.5pt solid #1080C2',
    borderRadius: 8,
  },
  mathText: {
    fontFamily: 'NotoSansMath',
  },
  unicodeText: {
    fontFamily: 'NotoSansMath',
  },
  section: {
    marginBottom: 5,
  },
  pageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1080C2',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 3,
  },
  pageSubtitle: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
    marginLeft: 10,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
    paddingTop: 1,
    paddingBottom: 2,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: "space-between",
    minHeight:14

  },
  label: {
    flex: 1,
    fontSize: 9,
    textAlign: 'left',
  },
  labelFix: {

    fontSize: 9,
    textAlign: 'left',
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: '100%',
  }
  ,
  value: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1080C2',
    textAlign: 'right',
  },
  note: {
    fontSize: 7,
    color: '#888888',
    marginTop: 2,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10,
    fontFamily: 'NotoSansMath'
  },
  table: {
    marginTop: 0,
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FC',
    padding: 5,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
    padding: 5,
    fontSize: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  conclusion: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,

  },
  conclusionText: {
    fontSize: 10,
    fontWeight: 'semibold',
    marginBottom: 5,
    textAlign: 'center',
  },
  conclusionResult: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    
  },
  successText: {
    color: '#00A064',
  },
  errorText: {
    color: '#DC3232',
  },
});

// PDF Document komponenti
const HeatPdfDocument = ({ initial, climate, heatingSeason, heatStep, constructionType }) => {
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
    <Document>
      {/* 1-SAHIFA: TITLE */}
      <Page size="A4" style={styles.titlePage}>
        <View style={styles.titleBorder}>
          <Text style={styles.companyName}>ARCHIPELAG MCHJ</Text>
          <Text style={styles.objectInfo}>{objectInfo}</Text>
          <Text style={styles.mainTitle}>ISSIQLIK TEXNIK XISOBI</Text>
          <Text style={styles.yearInfo}>{provinceName} - {currentYear}-yil</Text>
        </View>
      </Page>

      {/* 2-SAHIFA: HISOB */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder} fixed />
        <View style={styles.pageContent}>
          {/* Sarlavha */}
          <Text style={styles.pageTitle}>
            {heatStep?.label || "2"}.{constructionType?.label || "Tashqi devor"} issiqlik texnik hisobi
          </Text>
          <Text style={styles.pageSubtitle}>
            Obekt nomi: {initial.objectName || "obekt nomi"}
          </Text>

          {/* Dastlabki ma'lumotlar */}
          <Text style={styles.sectionTitle}>Dastlabki ma'lumotlar</Text>

          {/* Hudud */}
          <View style={styles.row}>
            <Text style={{ fontSize: 9, width: 40 }}>Hudud</Text>
            <Text style={{ flex: 1 }}></Text>
            <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>
              {provinceName}, {regionName}
            </Text>
          </View>

          {/* Ichki havoning hisobiy harorati */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'baseline', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>Ichki havoning hisobiy harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', }}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>i</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={styles.value}>
                {climate?.t_in != null ? `${climate.t_in} °C` : "—"}
              </Text>
            </View>
          </View>

          {/* Ichki havoning nisbiy namligi */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'baseline', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>Ichki havoning nisbiy namligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: 'NotoSansMath', lineHeight: 0 }}>φ</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>i</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={styles.value}>
                {climate?.phi_in != null ? `${climate.phi_in} %` : "—"}
              </Text>
            </View>
          </View>
          {saved?.humidityRegimeInfo && getPhiNote(saved.humidityRegimeInfo, climate?.phi_in) && (
            <Text style={styles.note}>{getPhiNote(saved.humidityRegimeInfo, climate?.phi_in)}</Text>
          )}

          {/* t_is_dav */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'baseline', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning o'rtacha harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>is.dav</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={styles.value}>
                {heatingSeason?.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—"}
              </Text>
            </View>
          </View>
          {getTIsDavNote() && (
            <Text style={styles.note}>{getTIsDavNote()}</Text>
          )}

          {/* Z_is_dav */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'baseline', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning davomiyligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>Z</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>is.dav</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={styles.value}>
                {heatingSeason?.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—"}
              </Text>
            </View>
          </View>
          {getZIsDavNote() && (
            <Text style={styles.note}>{getZIsDavNote()}</Text>
          )}

          {/* Tashqi havoning hisobiy qishki harorati */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'baseline', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>Tashqi havoning hisobiy qishki harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', }}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>t</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              <Text style={styles.value}>
                {climate?.t_out != null ? `${climate.t_out} °C` : "—"}
              </Text>
            </View>
          </View>
          {getTOutNote() && (
            <Text style={styles.note}>{getTOutNote()}</Text>
          )}

          {/* Materiallar jadvali */}
          {saved?.layers && saved.layers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>To'suvchi konstruksiya materiallarining xususiyatlari</Text>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 0.3 }]}>#</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>Material</Text>
                  <Text style={[styles.tableCell, { flex: 0.7 }]}>
                    <Text style={styles.mathText}>δ</Text>, mm
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.7 }]}>
                    <Text style={styles.mathText}>γₒ</Text>, kg/m³
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.7 }]}>
                    <Text style={styles.mathText}>λ</Text>
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.7 }]}>R</Text>
                </View>

                {saved.layers.map((layer, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.3 }]}>{idx + 1}</Text>
                    <Text style={[styles.tableCell, { flex: 2, textAlign: 'left' }]}>{layer.name || "—"}</Text>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{layer.thickness_mm || "—"}</Text>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{layer.rho || "—"}</Text>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{layer.lambda || "—"}</Text>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{layer.R || "—"}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Normativ parametrlar */}
          <Text style={styles.sectionTitle}>Normativ parametrlar</Text>

          {/* Delta t_t */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>

              <Text style={styles.labelFix}>Ichki havo harorati va to'suvchi konstruksiyaning ichki yuzasi harorati o'rtasidagi me'yoriy harorat farqi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: 'NotoSansMath', lineHeight: 1.25, }}>Δt</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold', }}>t</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.delta_t_n != null ? (
                <>
                  <Text style={styles.value}>{saved.delta_t_n.toFixed(1)} °C</Text>
                </>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {saved?.delta_t_n_row && getDeltaTtNote(saved.delta_t_n_row) && (
            <Text style={styles.note}>{getDeltaTtNote(saved.delta_t_n_row)}</Text>
          )}

          {/* Alpha i */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'baseline', maxWidth: '80%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>To'suvchi konstruksiyalarning ichki yuzasining issiqlik berish koeffitsienti, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: 'NotoSansMath', lineHeight: 1.25, }}>α</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold', }}>i</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.alpha_i != null ? (
                <>
                  <Text style={styles.value}>{saved.alpha_i.toFixed(1)} Vt/(m²·°C)</Text>
                </>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {saved?.alpha_i_row && getAlphaINote(saved.alpha_i_row) && (
            <Text style={styles.note}>{getAlphaINote(saved.alpha_i_row)}</Text>
          )}

          {/* Alpha t */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>To'suvchi konstruksiyalarning tashqi yuzasining issiqlik berish koeffitsienti, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: 'NotoSansMath', lineHeight: 1.25, }}>α</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold', }}>t</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.alpha_t != null ? (
                <>
                  <Text style={styles.value}>{saved.alpha_t.toFixed(0)} Vt/(m²·°C)</Text>
                </>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {saved?.alpha_t_row && getAlphaTNote(saved.alpha_t_row) && (
            <Text style={styles.note}>{getAlphaTNote(saved.alpha_t_row)}</Text>
          )}

          {/* D_is_dav */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>Isitish davrining gradus-sutkasi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>D</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>is.dav</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.D_d_dav != null ? (
                <>
                  <Text style={styles.value}>{saved.D_d_dav.toFixed(0)} °C·sutka</Text>
                </>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getDIsDavNote({ t_in: saved.t_in, t_is_dav: saved.t_is_dav, Z_is_dav: saved.Z_is_dav, D_d_dav: saved.D_d_dav });
            return saved?.D_d_dav && noteData ? (
              <Text style={styles.note}>
                D<Text style={{ fontSize: 5 }}>is.dav</Text> = (t<Text style={{ fontSize: 5 }}>i</Text> - t<Text style={{ fontSize: 5 }}>is.dav</Text>) × Z<Text style={{ fontSize: 5 }}>is.dav</Text> = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}



          {/*Ro Tal.SG*/}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>Sanitariya-gigiena talablariga muvofiq me'yoriy (ruxsat etilgan maksimal) qarshilik, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
              <Text style={{ fontSize: 5, lineHeight: 2, color: '#1080C2', fontWeight: 'bold' }}>Tal.SG</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.Ro_MG != null ? (
                <>
                  <Text style={styles.value}>{saved.Ro_MG.toFixed(2)} m²·°C/Vt</Text>
                </>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getRoTalSGNote({ t_in: saved.t_in, t_out: saved.t_out, delta_t_n: saved.delta_t_n, alpha_i: saved.alpha_i, Ro_MG: saved.Ro_MG });
            return saved?.Ro_MG && noteData ? (
              <Text style={styles.note}>
                R<Text style={{ fontSize: 5 }}>o</Text><Text style={{ fontSize: 5, lineHeight: 2 }}>Tal.SG</Text> = n(t<Text style={{ fontSize: 5 }}>i</Text> - t<Text style={{ fontSize: 5 }}>t</Text>) / (Δt<Text style={{ fontSize: 5 }}>t</Text> × α<Text style={{ fontSize: 5 }}>i</Text>) = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}

          {/* Ro Talab */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>

              <Text style={styles.labelFix}>To'suvchi konstruksiyaning talab etilgan issiqlik uzatilishiga keltirilgan qarshiligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
              <Text style={{ fontSize: 5, lineHeight: 2, color: '#1080C2', fontWeight: 'bold' }}>Tal.</Text>

            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.RoTalab != null ? (
                <>

                  <Text style={styles.value}>{saved.RoTalab.toFixed(2)} m²·°C/Vt</Text>
                </>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {saved?.RoResult_row && getRoTalNote(saved.RoResult_row, saved.protectionLevel) && (
            <Text style={styles.note}>{getRoTalNote(saved.RoResult_row, saved.protectionLevel)}</Text>
          )}




          {/* R_k */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>Ko'p qatlamli to'suvchi konstruksiyaning termik qarshiligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>k</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.R_k != null ? (
                <>
                  <Text style={styles.value}>{saved.R_k.toFixed(2)} m²·°C/Vt</Text>
                </>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getRkNote(saved.layers, saved.R_k);
            return saved?.layers && noteData ? (
              <Text style={styles.note}>
                R<Text style={{ fontSize: 5 }}>k</Text> = R<Text style={{ fontSize: 5 }}>1</Text>+R<Text style={{ fontSize: 5 }}>2</Text>+...+R<Text style={{ fontSize: 5 }}>{saved.layers.length}</Text> = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}

          {/* Ro calc */}
          <View style={styles.row}>
            {/*CHAP BLOK*/}
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.labelFix}>To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
            </View>
            {/*O'NG BLOK*/}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {saved?.Ro_calc != null ? (
                <>
                  <Text style={styles.value}>{saved.Ro_calc.toFixed(2)} m²·°C/Vt</Text>
                </>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getRoNote({ alpha_i: saved.alpha_i, alpha_t: saved.alpha_t, R_k: saved.R_k, Ro_calc: saved.Ro_calc });
            return saved?.Ro_calc && noteData ? (
              <Text style={styles.note}>
                R<Text style={{ fontSize: 5 }}>o</Text> = (1 / α<Text style={{ fontSize: 5, fontFamily: 'NotoSansMath', lineHeight: 0 }}>i</Text>) + R<Text style={{ fontSize: 5 }}>k</Text> + (1 / α<Text style={{ fontSize: 5 }}>t</Text>) = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}

          {/* Xulosa */}
          {RoCalc != null && RoTalabVal != null && (
            <View style={styles.conclusion} wrap={false} break>
              <Text style={styles.conclusionText}>
                To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi ( R<Text style={{ fontSize: 8 }}>o</Text> = {RoCalc.toFixed(2)} m²·°C/Vt) talab etilganidan ( R<Text style={{ fontSize: 8 }}>o</Text><Text style={{ fontSize: 7, lineHeight: 2 }}>Tal.</Text> = {RoTalabVal.toFixed(2)} m²·°C/Vt) {isSatisfied ? 'katta.' : 'kichik.'}
              </Text>
              <Text style={[styles.conclusionResult, isSatisfied ? styles.successText : styles.errorText]}>
                {isSatisfied ? 'Issiqlik himoyasi talabiga muvofiq keladi!' : 'Issiqlik himoyasi talabiga muvofiq kelmaydi!'}
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={{ position: 'absolute', bottom: -10, left: 20, right: 20 }}>
            <Text style={{ fontSize: 8, color: '#888888', textAlign: 'center' }}>
              © {currentYear} | Loyiha qiymati kalkulyatori
            </Text>
          </View>
        </View>
      </Page>
    </Document >
  );
};

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
