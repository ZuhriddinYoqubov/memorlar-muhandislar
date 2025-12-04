import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { WINDOWS } from '../data/windowsRo';
import {
  getPhiNote,
  getTIsDavNote,
  getZIsDavNote,
  getTOutNote,
  getDIsDavNote,
} from '../data/heatCalculations';
import NotoSansMathUrl from '../../../assets/fonts/NotoSansMath-Regular.ttf';

Font.register({
  family: 'NotoSansMath',
  src: NotoSansMathUrl,
});

const styles = StyleSheet.create({
  titlePage: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  titleBorder: {
    border: '1.5pt solid #1080C2',
    borderRadius: 8,
    width: '100%',
    height: '100%',
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
  page: {
    padding: 15,
    fontSize: 10,
    fontFamily: 'Helvetica',
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
  pageContent: {
    padding: 15,
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
    marginBottom: 6,
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
    justifyContent: 'space-between',
  },
  labelFix: {
    fontSize: 9,
    lineHeight: 1.2,
    flexWrap: 'wrap',
  },
  value: {
    fontSize: 9,
    color: '#1080C2',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 7,
    color: '#777777',
    fontStyle: 'italic',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  card: {
    marginTop: 8,
    marginBottom: 6,
    marginLeft: 10,
    marginRight: 10,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  cardText: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  successText: {
    color: '#00A064',
  },
  errorText: {
    color: '#DC3232',
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
});

const getWindowVariantRo = (groupId, variantName) => {
  if (!groupId || !variantName) return null;
  const group = WINDOWS.find((w) => w.id === Number(groupId));
  if (!group || !Array.isArray(group.tur)) return null;
  const variant = group.tur.find((v) => v.name === variantName);
  return variant ? variant.Ro : null;
};

const getWindowVariantLabel = (groupId, variantName) => {
  if (!groupId || !variantName) return '';
  const group = WINDOWS.find((w) => w.id === Number(groupId));
  const variant = group?.tur?.find((v) => v.name === variantName);
  if (!group || !variant) return '';
  if (group.tur.length === 1) return variant.name;
  return `${group.group} — ${variant.name}`;
};

const WindowPdfDocument = ({ initial, climate, heatingSeason, heatStep }) => {
  const saved = heatStep?.savedState || {};
  const currentYear = new Date().getFullYear();

  let objectName = initial.objectName || 'Loyiha nomi';
  if (objectName.endsWith('.')) {
    objectName = objectName.slice(0, -1);
  }
  const rawType = (initial.objectType || '').trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : '';
  const objectInfo = `${objectName}${typePart} bo'yicha`;

  const provinceName = initial.provinceName || initial.province || 'Viloyat';
  const regionName = initial.regionName || initial.region || 'Tuman/Shahar';

  const derazaType = saved.derazaType;
  const RoTalDF = saved.RoTalDF;

  const windowRo = getWindowVariantRo(saved.selectedWindowGroup, saved.selectedWindowVariant);
  const windowRo2 = getWindowVariantRo(saved.selectedWindowGroup2, saved.selectedWindowVariant2);

  const selectedWindowLabel = getWindowVariantLabel(saved.selectedWindowGroup, saved.selectedWindowVariant);
  const selectedWindowLabel2 = getWindowVariantLabel(saved.selectedWindowGroup2, saved.selectedWindowVariant2);

  let acceptedVariant = null;
  if (RoTalDF != null) {
    const variant1Passes = windowRo != null && windowRo >= RoTalDF;
    const variant2Passes = windowRo2 != null && windowRo2 >= RoTalDF;

    if (variant1Passes && variant2Passes) {
      acceptedVariant = windowRo <= windowRo2 ? { number: 1, Ro: windowRo } : { number: 2, Ro: windowRo2 };
    } else if (variant1Passes) {
      acceptedVariant = { number: 1, Ro: windowRo };
    } else if (variant2Passes) {
      acceptedVariant = { number: 2, Ro: windowRo2 };
    } else if (windowRo != null) {
      acceptedVariant = { number: 1, Ro: windowRo };
    } else if (windowRo2 != null) {
      acceptedVariant = { number: 2, Ro: windowRo2 };
    }
  }

  return (
    <Document>

      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder} fixed />
        <View style={styles.pageContent}>

          <Text style={styles.pageTitle}>
            {heatStep?.label || '2'}.
            {derazaType === 'fonarlar'
              ? "Fonarlar issiqlik texnik hisobi"
              : "Deraza va balkon eshiklari issiqlik texnik hisobi"}
          </Text>

          <Text style={styles.pageSubtitle}>
            Obekt nomi: {initial.objectName || 'obekt nomi'}
          </Text>

          <Text style={styles.sectionTitle}>Dastlabki ma'lumotlar</Text>

          <View style={styles.row}>
            <Text style={styles.labelFix}>Hudud</Text>
            <Text style={styles.value}>{provinceName}, {regionName}</Text>
          </View>

          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1 }}>
              <Text style={styles.labelFix}>Xona ichidagi havo harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: 'NotoSansMath' }}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>i</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {climate?.t_in != null ? (
                <Text style={styles.value}>{climate.t_in.toFixed(1)} °C</Text>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {climate?.phi_in != null && getPhiNote(saved.humidityRegimeInfo, climate.phi_in) && (
            <Text style={styles.note}>{getPhiNote(saved.humidityRegimeInfo, climate.phi_in)}</Text>
          )}

          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1 }}>
              <Text style={styles.labelFix}>Isitish davrining o'rtacha harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: 'NotoSansMath' }}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>is.dav</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {heatingSeason?.t_is_dav != null ? (
                <Text style={styles.value}>{heatingSeason.t_is_dav.toFixed(1)} °C</Text>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {heatingSeason && getTIsDavNote(heatingSeason) && (
            <Text style={styles.note}>{getTIsDavNote(heatingSeason)}</Text>
          )}

          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1 }}>
              <Text style={styles.labelFix}>Isitish davrining davomiyligi, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: 'NotoSansMath' }}>Z</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>is.dav</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {heatingSeason?.Z_is_dav != null ? (
                <Text style={styles.value}>{heatingSeason.Z_is_dav.toFixed(0)} kun</Text>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {heatingSeason && getZIsDavNote(heatingSeason) && (
            <Text style={styles.note}>{getZIsDavNote(heatingSeason)}</Text>
          )}

          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1 }}>
              <Text style={styles.labelFix}>Tashqi havo hisobiy harorati, </Text>
              <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold', fontFamily: 'NotoSansMath' }}>t</Text>
              <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>t</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {climate?.t_out != null ? (
                <Text style={styles.value}>{climate.t_out.toFixed(1)} °C</Text>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </View>
          </View>
          {climate && getTOutNote(climate) && (
            <Text style={styles.note}>{getTOutNote(climate)}</Text>
          )}
          {/**DERAZA Ro XISOBI */}

          {derazaType && RoTalDF != null && (
            <View style={styles.row}>
              {/*CHAP BLOK*/}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', maxWidth: '75%', marginRight: 2, flex: 1, marginTop: 3 }}>
                <Text style={styles.labelFix}>
                  {derazaType === 'fonarlar'
                    ? "Fonarlarning talab etilgan issiqlik uzatilishiga qarshiligi, "
                    : "Deraza va balkon eshiklarining talab etilgan issiqlik uzatilishiga qarshiligi, "}
                </Text>
                <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
                <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
                <Text style={{ fontSize: 5, lineHeight: 2, color: '#1080C2', fontWeight: 'bold' }}>Tal.D.F.</Text>
              </View>
              {/*O'NG BLOK*/}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 3 }}>
                <Text style={styles.value}>{RoTalDF.toFixed(2)} m²·°C/Vt</Text>
              </View>
            </View>

          )}
          <Text style={styles.note}>
            QMQ 2.01.04-18 bo'yicha, issiqlik himoyasi darajasi va D_is.dav ga bog'liq holda jadvaldan olinadi.
          </Text>

          {/**TITLE */}
          <Text style={styles.sectionTitle}>
            Yuqoridagilarni hisobga olgan holda, issiqlik himoyasining I darajasini ta'minlashning ikkita varianti mavjud:
          </Text>


          <Text style={styles.sectionTitle}>1-variant</Text>
          <View style={styles.row}>
            <Text style={styles.labelFix}>{selectedWindowLabel || 'Variant tanlanmagan'}</Text>
            <Text style={styles.value}>
              {windowRo != null ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={styles.value}>R</Text>
                  <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
                  <Text style={styles.value}> = {windowRo.toFixed(2)} m²·°C/Vt</Text>
                </View>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>2-variant</Text>
          <View style={styles.row}>
            <Text style={styles.labelFix}>{selectedWindowLabel2 || 'Variant tanlanmagan'}</Text>
            <Text style={styles.value}>
              {windowRo2 != null ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={styles.value}>R</Text>
                  <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
                  <Text style={styles.value}> = {windowRo2.toFixed(2)} m²·°C/Vt</Text>
                </View>
              ) : (
                <Text style={styles.value}>—</Text>
              )}
            </Text>
          </View>

          {acceptedVariant && RoTalDF != null && (
            <View
              style={[
                styles.card,
                {
                  borderColor: acceptedVariant.Ro >= RoTalDF ? '#22c55e' : '#f97373',
                  backgroundColor: acceptedVariant.Ro >= RoTalDF ? '#f0fdf4' : '#fef2f2',
                },
              ]}
            >
              {/* Xulosa */}
              <Text style={styles.conclusionText}>
                {acceptedVariant.Ro >= RoTalDF
                  ? (
                    <View style={styles.conclusion} wrap={false} break>
                      <Text style={styles.conclusionText}>Shart {acceptedVariant.number}-variant uchun bajarilmoqda: </Text>
                      <Text style={{ fontSize: 9, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>R</Text>
                      <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
                      <Text style={{ fontSize: 9, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}> = {acceptedVariant.Ro.toFixed(2)} m²·°C/Vt </Text>
                      <Text style={styles.conclusionText, { fontFamily: 'NotoSansMath' }}> ≥ </Text>
                      <Text style={{ fontSize: 9, lineHeight: 1, color: '#1080C2', fontWeight: 'bold', paddingLeft: 2 }}> R</Text>
                      <Text style={{ fontSize: 6, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}>o</Text>
                      <Text style={{ fontSize: 5, lineHeight: 2, color: '#1080C2', fontWeight: 'bold' }}>Tal.D.F.</Text>
                      <Text style={{ fontSize: 9, lineHeight: 1, color: '#1080C2', fontWeight: 'bold' }}> = {RoTalDF.toFixed(2)} m²·°C/Vt </Text>
                    </View>
                  )
                  : `${derazaType === 'fonarlar' ? 'Fonarlar' : 'Deraza va balkon eshiklari'} bo'yicha issiqlik himoyasi darajasi sharti bajarilmadi.`}
              </Text>
              <Text style={[styles.conclusionResult, acceptedVariant.Ro >= RoTalDF ? styles.successText : styles.errorText]}>
                {acceptedVariant.Ro >= RoTalDF
                  ? 'Tanlangan variant issiqlik himoyasi talabiga javob beradi!'
                  : 'Tanlangan variant issiqlik himoyasi talabiga javob bermaydi!'}
              </Text>
            </View>
          )}

        </View>
      </Page>
    </Document>
  );
};

export async function exportWindowStepPdfReact({ initial, climate, heatingSeason, heatStep }) {
  try {
    const blob = await pdf(
      <WindowPdfDocument
        initial={initial}
        climate={climate}
        heatingSeason={heatingSeason}
        heatStep={heatStep}
      />
    ).toBlob();

    const version = 1;
    saveAs(blob, `ITH - ${heatStep?.label || '2.n'} (Deraza) - v${version}.pdf`);
  } catch (error) {
    console.error('Deraza PDF yaratishda xato:', error);
    alert('Deraza PDF yaratishda xato yuz berdi!');
  }
}
