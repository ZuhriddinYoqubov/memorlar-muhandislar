import React from 'react';
import { Document, Page, Text, View, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdfStyles } from './pdfStyles';
import {
  getPhiNote,
  getRkNote,
} from '../data/heatCalculations';
import NotoSansMathUrl from '../../../assets/fonts/NotoSansMath-Regular.ttf';

// Font registratsiyasini xavfsiz qilish
let fontRegistered = false;
try {
  Font.register({
    family: 'NotoSansMath',
    src: NotoSansMathUrl,
  });
  fontRegistered = true;
  console.log('Font muvaffaqiyatli ro\'yxatdan o\'tkazildi');
} catch (fontError) {
  console.error('Font ro\'yxatdan o\'tkazishda xatolik:', fontError);
  fontRegistered = false;
}

const DoorPdfDocument = ({ initial, climate, heatingSeason, heatStep, RoTalSG }) => {
  console.log('DoorPdfDocument chaqirildi', {
    heatStep: !!heatStep,
    initial: !!initial,
    climate: !!climate,
    heatingSeason: !!heatingSeason
  });

  // Null check
  if (!heatStep) {
    console.log('heatStep null, xatolik qaytarilmoqda');
    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <View style={pdfStyles.pageContent}>
            <Text style={pdfStyles.pageTitle}>Xatolik</Text>
            <Text style={pdfStyles.value}>HeatStep ma'lumotlari mavjud emas</Text>
          </View>
        </Page>
      </Document>
    );
  }

  const saved = heatStep?.savedState || {};
  console.log('savedState:', saved);

  // Layers ni tekshirish
  if (!saved.layers || saved.layers.length === 0) {
    console.log('layers mavjud emas, xatolik qaytarilmoqda');
    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <View style={pdfStyles.pageContent}>
            <Text style={pdfStyles.pageTitle}>Xatolik</Text>
            <Text style={pdfStyles.value}>Materiallar qatlami mavjud emas</Text>
          </View>
        </Page>
      </Document>
    );
  }

  console.log('Barcha tekshiruvlar o\'tdi, PDF yaratilmoqda...');

  const currentYear = new Date().getFullYear();

  // Xavfsizlik choralari
  const safeInitial = initial || {};
  const safeClimate = climate || {};
  const safeHeatingSeason = heatingSeason || {};

  // RoTal.SG ni import qilingan qiymatdan olish
  const roTalSGValue = RoTalSG != null && !isNaN(RoTalSG) ? RoTalSG : null;
  const layers = (saved.layers || []).filter(layer => layer != null);
  const Rk = saved.R_k != null && !isNaN(saved.R_k) ? saved.R_k : 0;
  const alphaI = saved.alphaI != null && !isNaN(saved.alphaI) ? saved.alphaI : 8.7;
  const alphaT = saved.alphaT != null && !isNaN(saved.alphaT) ? saved.alphaT : 23;
  const RoTalED = saved.RoTalED != null && !isNaN(saved.RoTalED) ? saved.RoTalED : saved.RoTalab;

  // Debug logging
  console.log('DoorPDF - Debug values:', {
    RoTalSG,
    roTalSGValue,
    savedRk: saved.R_k,
    Rk,
    savedAlphaI: saved.alphaI,
    savedAlphaT: saved.alphaT,
    savedRoTalED: saved.RoTalED,
    RoTalED,
    layersCount: layers?.length
  });

  // Ro ni hisoblash: Ro = Rk + 1/αᵢ + 1/αₜ
  const doorRo = layers.length > 0 ? (Rk + 1 / alphaI + 1 / alphaT) : null;
  const selectedDoorLabel = layers.length > 0 ? 'Eshik va darvoza qurilmasi' : 'Materiallar tanlanmagan';

  const RoTalab = saved.RoTalab != null && !isNaN(saved.RoTalab) ? saved.RoTalab : null;

  const isSatisfied = doorRo != null && RoTalED != null && doorRo >= RoTalED;

  let objectName = safeInitial.objectName || 'Loyiha nomi';
  if (objectName.endsWith('.')) {
    objectName = objectName.slice(0, -1);
  }
  const rawType = (safeInitial.objectType || '').trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : '';
  const objectInfo = `${objectName}${typePart} bo'yicha`;

  const provinceName = safeInitial.provinceName || safeInitial.province || 'Viloyat';
  const regionName = safeInitial.regionName || safeInitial.region || 'Tuman/Shahar';

  console.log('PDF komponenti ma\'lumotlari tayyor, render qilinmoqda...');

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.pageBorder} fixed />
        <View style={pdfStyles.pageContent}>
          <Text style={pdfStyles.pageTitle}>
            {heatStep?.label || '3'}.Eshik va darvoza qurilmalari issiqlik texnik hisobi
          </Text>
          <Text style={pdfStyles.pageSubtitle}>
            Obekt nomi: {safeInitial.objectName || 'obekt nomi'}
          </Text>

          <Text style={pdfStyles.sectionTitle}>Dastlabki ma'lumotlar</Text>

          <View style={pdfStyles.row}>
            <Text style={pdfStyles.labelFix}>Hudud</Text>
            <Text style={pdfStyles.value}>{provinceName}, {regionName}</Text>
          </View>

          {/**tt qiymati */}
          <View style={pdfStyles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, paddingTop:4, flex: 1 }}>
              <Text style={pdfStyles.labelFix}>Xona ichidagi havo harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>i</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingTop:4 }}>
              {safeClimate?.t_in != null ? (
                <Text style={pdfStyles.value}>{safeClimate.t_in.toFixed(1)} °C</Text>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>

          {/**NISBIY NAMLIK */}
          <View style={pdfStyles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1 }}>
              <Text style={pdfStyles.labelFix}>Ichki havo nisbiy namligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: fontRegistered ? 'NotoSansMath' : undefined }}>φ</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>i</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              {safeClimate?.phi_in != null && !isNaN(safeClimate.phi_in) ? (
                <Text style={pdfStyles.value}>{safeClimate.phi_in.toFixed(0)} %</Text>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>

          {saved?.humidityRegimeInfo && getPhiNote && typeof getPhiNote === 'function' && getPhiNote(saved.humidityRegimeInfo, climate?.phi_in) && (
            <Text style={pdfStyles.note}>{getPhiNote(saved.humidityRegimeInfo, climate?.phi_in)}</Text>
          )}

          {/**tISDAVR qiymati */}

          <View style={pdfStyles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1 }}>
              <Text style={pdfStyles.labelFix}>Isitish davrining o'rtacha harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>is.dav</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {safeHeatingSeason?.t_is_dav != null && !isNaN(safeHeatingSeason.t_is_dav) ? (
                <Text style={pdfStyles.value}>{safeHeatingSeason.t_is_dav.toFixed(1)} °C</Text>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {safeHeatingSeason?.t_is_dav != null && (
            <Text style={pdfStyles.note}>Isitish davrining o'rtacha harorati t_is.dav = {safeHeatingSeason.t_is_dav.toFixed(1)} °C</Text>
          )}
          {/**zISDAV qiymati */}
          <View style={pdfStyles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1 }}>
              <Text style={pdfStyles.labelFix}>Isitish davrining davomiyligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold'}}>Z</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>is.dav</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {safeHeatingSeason?.Z_is_dav != null && !isNaN(safeHeatingSeason.Z_is_dav) ? (
                <Text style={pdfStyles.value}>{safeHeatingSeason.Z_is_dav.toFixed(0)} kun</Text>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {safeHeatingSeason?.Z_is_dav != null && (
            <Text style={pdfStyles.note}>Isitish davrining davomiyligi Z_is.dav = {safeHeatingSeason.Z_is_dav.toFixed(0)} kun</Text>
          )}

        {/**Tashqi havo hisobiy harorati */}
          <View style={pdfStyles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1 }}>
              <Text style={pdfStyles.labelFix}>Tashqi havo hisobiy harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold'}}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>t</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {safeClimate?.t_out != null && !isNaN(safeClimate.t_out) ? (
                <Text style={pdfStyles.value}>{safeClimate.t_out.toFixed(1)} °C</Text>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {safeClimate?.t_out != null && (
            <Text style={pdfStyles.note}>{getPhiNote(saved.humidityRegimeInfo, climate?.phi_in)}</Text>
          )}

          {/* Materiallar jadvali */}
          {saved?.layers && saved.layers.length > 0 && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>To'suvchi konstruksiya materiallarining xususiyatlari</Text>

              <View style={pdfStyles.table}>
                <View style={pdfStyles.tableHeader}>
                  <Text style={[pdfStyles.tableCell, { flex: 0.3 }]}>#</Text>
                  <Text style={[pdfStyles.tableCell, { flex: 2 }]}>Material</Text>
                  <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                    <Text style={pdfStyles.mathText}>δ</Text>, mm
                  </Text>
                  <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                    <Text style={pdfStyles.mathText}>γₒ</Text>, kg/m³
                  </Text>
                  <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                    <Text style={pdfStyles.mathText}>λ</Text>
                  </Text>
                  <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>R</Text>
                </View>

                {(saved.layers || []).filter(layer => layer != null).map((layer, idx) => (
                  <View key={idx} style={pdfStyles.tableRow}>
                    <Text style={[pdfStyles.tableCell, { flex: 0.3 }]}>{idx + 1}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'left' }]}>{layer?.name || "—"}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer?.thickness_mm || "—"}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer?.rho || "—"}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer?.lambda || "—"}</Text>
                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer?.R || "—"}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Normativ parametrlar */}
          <Text style={pdfStyles.sectionTitle}>Normativ parametrlar</Text>

          {/* RoTalSG - Sanitariya-gigena talablariga ko'ra qarshilik */}
          <View style={pdfStyles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1, marginTop: 3 }}>
              <Text style={pdfStyles.labelFix}>
                Sanitariya-gigena talablariga ko'ra issiqlik uzatilishiga qarshilik,
              </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
              <Text style={{ fontSize: 5, lineHeight: 2, color: '#1080C2', fontWeight: 'bold' }}>Tal.SG</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 3 }}>
              <Text style={pdfStyles.value}>{roTalSGValue != null ? roTalSGValue.toFixed(2) : "—"} m²·°C/Vt</Text>
            </View>
          </View>
          <Text style={pdfStyles.note}>
            Sanitariya-gigena talablariga ko'ra devorlarning issiqlik uzatilishiga qarshiligi (QMQ 2.01.04-18). {safeInitial.province}, {safeInitial.regionName || 'Tuman/Shahar'} uchun.
          </Text>

          {/* RoTalED */}
          {RoTalED != null && (
            <View style={pdfStyles.row}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1, marginTop: 3 }}>
                <Text style={pdfStyles.labelFix}>
                  Eshik va darvozalar issiqlik uzatilishiga talab etilgan qarshiligi,
                </Text>
                <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
                <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
                <Text style={{ fontSize: 5, lineHeight: 2, color: '#1080C2', fontWeight: 'bold' }}>Tal.E.D</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 3 }}>
                <Text style={pdfStyles.value}>{RoTalED.toFixed(2)} m²·°C/Vt</Text>
              </View>
            </View>
          )}
          <Text style={pdfStyles.note}>
            Eshik va darvozalar issiqlik uzatilishiga talab etilgan qarshiligi devorlarning sanitariya-gigena talablariga javob beradigan qarshiligining kamida 0,6 qismidan kam bo'lmasligi kerak (QMQ 2.01.04-18, 2.2).
          </Text>

          {/* R_k */}
          <View style={pdfStyles.row}>
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={pdfStyles.labelFix}>Ko'p qatlamli to'suvchi konstruksiyaning termik qarshiligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>k</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {Rk != null ? (
                <Text style={pdfStyles.value}>{Rk.toFixed(2)} m²·°C/Vt</Text>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {(() => {
            const noteData = getRkNote && typeof getRkNote === 'function' ? getRkNote(saved.layers, saved.R_k) : null;
            return saved?.layers && noteData ? (
              <Text style={pdfStyles.note}>
                R<Text style={{ fontSize: 5 }}>k</Text> = R<Text style={{ fontSize: 5 }}>1</Text>+R<Text style={{ fontSize: 5 }}>2</Text>+...+R<Text style={{ fontSize: 5 }}>{saved.layers.length}</Text> = {noteData.calculation || noteData}
              </Text>
            ) : null;
          })()}

          {/* Ro calc */}
          <View style={pdfStyles.row}>
            <View style={{ flexDirection: "row", alignItems: 'flex-end', maxWidth: '85%', marginRight: 2, flex: 1, justifyContent: "flex-start" }}>
              <Text style={pdfStyles.labelFix}>To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
              {doorRo != null ? (
                <Text style={pdfStyles.value}>{doorRo.toFixed(2)} m²·°C/Vt</Text>
              ) : (
                <Text style={pdfStyles.value}>—</Text>
              )}
            </View>
          </View>
          {doorRo && typeof doorRo === 'number' && !isNaN(doorRo) && (
            <Text style={pdfStyles.note}>
              R<Text style={{ fontSize: 5 }}>o</Text> = (1 / α<Text style={{ fontSize: 5, fontFamily: fontRegistered ? 'NotoSansMath' : undefined, lineHeight: 0 }}>i</Text>) + R<Text style={{ fontSize: 5 }}>k</Text> + (1 / α<Text style={{ fontSize: 5 }}>t</Text>) = {(1 / alphaI).toFixed(3)} + {Rk.toFixed(2)} + {(1 / alphaT).toFixed(3)} = {doorRo.toFixed(2)} m²·°C/Vt
            </Text>
          )}


          {/* Xulosa */}
          {doorRo != null && RoTalED != null && (
            <View style={pdfStyles.conclusion} wrap={false} break>
              <Text style={pdfStyles.conclusionText}>
                Eshik va darvoza issiqlik uzatilishiga keltirilgan qarshiligi
              </Text>
              <Text style={pdfStyles.conclusionText}>
                ( R<Text style={{ fontSize: 8 }}>o</Text> = {doorRo.toFixed(2)} m²·°C/Vt) talab etilganidan
           
                ( R<Text style={{ fontSize: 8 }}>o</Text><Text style={{ fontSize: 7, lineHeight: 2 }}>Tal.</Text> = {RoTalED.toFixed(2)} m²·°C/Vt) {isSatisfied ? 'katta.' : 'kichik.'}
              </Text>
              <Text style={[pdfStyles.conclusionResult, isSatisfied ? pdfStyles.successText : pdfStyles.errorText]}>
                {isSatisfied ? 'Issiqlik himoyasi talabiga muvofiq keladi!' : 'Issiqlik himoyasi talabiga muvofiq kelmaydi!'}
              </Text>
            </View>
          )}

        </View>
      </Page>
    </Document>
  );
};

export async function exportDoorStepPdfReact({ initial, climate, heatingSeason, heatStep, RoTalSG }) {
  try {
    // Null check va default qiymatlar
    if (!heatStep) {
      console.error('Eshik PDF yaratishda xato: heatStep null');
      alert('Eshik PDF yaratish uchun avval ma\'lumotlarni saqlang!');
      return;
    }

    // SavedState ni tekshirish
    const saved = heatStep?.savedState || {};
    if (!saved.layers || saved.layers.length === 0) {
      console.error('Eshik PDF yaratishda xato: layers mavjud emas');
      alert('Eshik PDF yaratish uchun avval materiallarni tanlang va saqlang!');
      return;
    }

    console.log('Eshik PDF yaratish boshlandi...', {
      heatStep: !!heatStep,
      saved: !!saved,
      layers: saved.layers?.length,
      initial: !!initial,
      climate: !!climate,
      heatingSeason: !!heatingSeason
    });

    // Barcha props larni tekshirish va xavfsizlik
    const safeInitial = initial || {};
    const safeClimate = climate || {};
    const safeHeatingSeason = heatingSeason || {};

    // React-PDF komponentini yaratish
    const pdfComponent = (
      <DoorPdfDocument
        initial={safeInitial}
        climate={safeClimate}
        heatingSeason={safeHeatingSeason}
        heatStep={heatStep}
        RoTalSG={RoTalSG}
      />
    );

    console.log('PDF komponenti yaratildi, blobga o\'tkazilmoqda...');

    const blob = await pdf(pdfComponent).toBlob();

    console.log('Blob yaratildi, saqlanmoqda...');

    const version = 1;
    const fileName = `ITH - ${heatStep?.label || '3.n'} (Eshik) - v${version}.pdf`;
    saveAs(blob, fileName);

    console.log('Eshik PDF muvaffaqiyatli saqlandi:', fileName);
  } catch (error) {
    console.error('Eshik PDF yaratishda xato:', error);
    console.error('Xatolik tafsilotlari:', {
      heatStep: !!heatStep,
      heatStepSavedState: !!heatStep?.savedState,
      heatStepLabel: heatStep?.label,
      initial: !!initial,
      climate: !!climate,
      heatingSeason: !!heatingSeason,
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack
    });



    alert('Eshik PDF yaratishda xato yuz berdi! Konsolni tekshiring.');
  }
}
