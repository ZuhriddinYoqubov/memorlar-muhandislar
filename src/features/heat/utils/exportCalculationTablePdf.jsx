import React from 'react';
import { Document, Page, Text, View, pdf, Font, StyleSheet } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdfStyles } from './pdfStyles';
import { TEMP_DEFAULTS } from '../data/tempDefaults';

// Noto Sans Math fontini ro'yxatdan o'tkazish
import NotoSansMathUrl from '../../../assets/fonts/NotoSansMath-Regular.ttf';

// Font registratsiyasini xavfsiz qilish
let fontRegistered = false;
try {
  Font.register({
    family: 'NotoSansMath',
    src: NotoSansMathUrl,
  });
  fontRegistered = true;
} catch (fontError) {
  console.error('Font ro\'yxatdan o\'tkazishda xatolik:', fontError);
  fontRegistered = false;
}

// Jadval uchun stillar
const tableStyles = StyleSheet.create({
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#696969',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#696969',
    minHeight: 22,
  },
  tableRowLast: {
    flexDirection: 'row',
    minHeight: 22,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#88cff8ff',
    borderBottomWidth: 1,
    borderBottomColor: '#696969',
    minHeight: 28,
  },
  // Header cells
  headerCell: {
    padding: 5,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#696969',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCellLast: {
    padding: 5,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Body cells
  cell: {
    padding: 5,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#696969',
    justifyContent: 'center',
  },
  cellLast: {
    padding: 5,
    fontSize: 9,
    justifyContent: 'center',
  },
  cellCenter: {
    textAlign: 'center',
    alignItems: 'center',
  },
  // 7-band uchun birlashtirilgan katak
  mergedCell: {
    padding: 5,
    fontSize: 9,
    justifyContent: 'center',
  },
  // Column widths
  colNum: { width: '6%' },
  colName: { width: '48%' },
  colSymbol: { width: '14%' },
  colValue: { width: '16%' },
  colUnit: { width: '16%' },
  // 7-band uchun birlashtirilgan ustun (nomi + belgisi + qiymat + birlik)
  colMerged: { width: '94%' },
  // Subscript styles
  mainText: {
    fontSize: 9,
  },
  subscript: {
    fontSize: 6,
    lineHeight: 1,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
});

// Parametr belgisi komponenti (subscript bilan)
const SymbolWithSubscript = ({ main, sub, subSub }) => (
  <View style={tableStyles.symbolContainer}>
    <Text style={tableStyles.mainText}>{main}</Text>
    {sub && <Text style={tableStyles.subscript}>{sub}</Text>}
    {subSub && <Text style={[tableStyles.subscript, { fontSize: 5 }]}>{subSub}</Text>}
  </View>
);

// Faqat sahifalar komponenti (Document siz) - birlashtirilgan PDF uchun
export const CalculationTablePages = ({ initial, climate, heatingSeason, heatSteps = [], buildingParams = {} }) => {
  console.log('CalculationTableDocument - buildingParams:', buildingParams);
  console.log('CalculationTableDocument - buildingParams.V_h:', buildingParams?.V_h);
  console.log('CalculationTableDocument - heatSteps:', heatSteps);
  
  // Har bir step uchun constructionType va savedState ni log qilish
  heatSteps.forEach((step, index) => {
    const ct = step.presetConstructionType || step.savedState?.constructionType;
    console.log(`Step ${index}: constructionType=${ct}, savedState=`, step.savedState);
  });
  
  // HeatSteps dan konstruksiya turini olish (presetConstructionType yoki savedState.constructionType)
  const getConstructionType = (step) => {
    return step.presetConstructionType || step.savedState?.constructionType;
  };

  // HeatSteps dan R qiymatlarini olish
  const getRoFromHeatSteps = (constructionTypeValue) => {
    if (!heatSteps || heatSteps.length === 0) return null;
    const step = heatSteps.find(s => getConstructionType(s) === constructionTypeValue);
    if (!step?.savedState) return null;
    
    const saved = step.savedState;
    
    // Deraza uchun - tanlangan variant Ro qiymatini olish
    if (constructionTypeValue === "deraza_balkon_eshiklari") {
      // WINDOWS ma'lumotlar bazasidan Ro qiymatlarini olish
      const getWindowVariantRo = (group, variant) => {
        if (!group || !variant) return null;
        // WINDOWS import qilinmagan, shuning uchun savedState dan olishga harakat qilamiz
        // Yoki RoTalDF ni qaytaramiz (bu talab etilgan qiymat)
        return null;
      };
      
      // Agar windowRo saqlanmagan bo'lsa, RoTalDF ni qaytaramiz
      // Aslida bu yerda qabul qilingan variant Ro qiymati kerak
      // Hozircha RoTalDF ni qaytaramiz (talab etilgan qiymat)
      return saved.RoTalDF || saved.Ro_calc || saved.R_k || null;
    }
    
    // Eshik uchun
    if (constructionTypeValue === "eshik_darvoza") {
      return saved.Ro_calc || saved.R_k || null;
    }
    
    // Pol uchun Yp
    if (constructionTypeValue === "floor_heat_calculation") {
      return saved.Yp || null;
    }
    
    // Boshqa konstruksiyalar uchun
    return saved.Ro_calc || saved.R_k || null;
  };

  // Konstruksiya mavjudligini tekshirish
  const hasConstruction = (constructionTypeValue) => {
    if (!heatSteps || heatSteps.length === 0) return false;
    return heatSteps.some(s => getConstructionType(s) === constructionTypeValue);
  };

  // Tashqi devorlar R_k (ventfasad ham inobatga olinadi)
  const R_k_devor = getRoFromHeatSteps("tashqi_devor") || getRoFromHeatSteps("tashqi_devor_ventfasad");
  const hasDevor = hasConstruction("tashqi_devor") || hasConstruction("tashqi_devor_ventfasad");
  
  // Deraza va balkon eshiklari R_d.b
  const R_d_b = getRoFromHeatSteps("deraza_balkon_eshiklari");
  const hasDeraza = hasConstruction("deraza_balkon_eshiklari");
  
  // Zenit fonarlar
  const R_z_f = getRoFromHeatSteps("zenit_fonar");
  const hasFonar = hasConstruction("zenit_fonar");
  
  // Kirish eshiklari va darvozalar R_e.d
  const R_e_d = getRoFromHeatSteps("eshik_darvoza");
  const hasEshik = hasConstruction("eshik_darvoza");
  
  // Chortoq orayopmalari R_ch.o
  const R_ch_o = getRoFromHeatSteps("chordoq_orayopma") || getRoFromHeatSteps("tom_ochiq_chordoq");
  const hasChortoq = hasConstruction("chordoq_orayopma") || hasConstruction("tom_ochiq_chordoq");
  
  // Yerdagi pollar Yp
  const Y_p = getRoFromHeatSteps("floor_heat_calculation");
  const hasPol = hasConstruction("floor_heat_calculation");

  // Binoning isitiladigan hajmi
  const V_h = buildingParams?.V_h ? parseFloat(buildingParams.V_h) : parseFloat(TEMP_DEFAULTS.V_h);

  // Isitish davridagi gradus-sutkasi D_d
  const D_d = heatingSeason?.D_d_dav;

  // Formatlovchi funksiya
  const formatValue = (val, decimals = 2) => {
    if (val == null || val === "" || isNaN(val)) return "";
    const num = parseFloat(val);
    return decimals != null ? num.toFixed(decimals) : String(num);
  };

  // 7-bandning dinamik quyi bandlari (7.1, 7.2, ... tarzida)
  const subRows7 = [];
  let subIndex = 1;
  
  if (hasDevor) {
    subRows7.push({ num: `7.${subIndex++}`, name: "Tashqi devorlar", symbol: { main: "R", sub: "k" }, value: formatValue(R_k_devor), unit: "(m²×°C)/Vt" });
  }
  if (hasDeraza) {
    subRows7.push({ num: `7.${subIndex++}`, name: "Deraza va balkon eshiklari", symbol: { main: "R", sub: "d.b" }, value: formatValue(R_d_b), unit: "(m²×°C)/Vt" });
  }
  if (hasFonar) {
    subRows7.push({ num: `7.${subIndex++}`, name: "Zenit fonarlar", symbol: { main: "R", sub: "z.f" }, value: formatValue(R_z_f), unit: "(m²×°C)/Vt" });
  }
  if (hasEshik) {
    subRows7.push({ num: `7.${subIndex++}`, name: "Kirish eshiklari va darvozalar", symbol: { main: "R", sub: "e.d" }, value: formatValue(R_e_d), unit: "(m²×°C)/Vt" });
  }
  if (hasChortoq) {
    subRows7.push({ num: `7.${subIndex++}`, name: "Chortoq orayopmalari", symbol: { main: "R", sub: "ch.o" }, value: formatValue(R_ch_o), unit: "(m²×°C)/Vt" });
  }
  if (hasPol) {
    // Yerdagi pol uchun: Yp, [qiymat], Vt/(m²·°C)
    subRows7.push({ num: `7.${subIndex++}`, name: "Yerdagi pollar", symbol: { main: "Y", sub: "p" }, value: formatValue(Y_p), unit: "Vt/(m²·°C)" });
  }

  // Jadval qatorlari (7-band alohida render qilinadi)
  const rowsBefore7 = [
    { num: "1", name: "Binoning issiqlik himoyasi darajasi", symbol: null, value: initial?.protectionLevel || "", unit: "" },
    { num: "2", name: "Ichki havoning hisobiy harorati", symbol: { main: "t", sub: "i" }, value: formatValue(climate?.t_in, 0), unit: "°C" },
    { num: "3", name: "Tashqi havoning hisobiy harorati", symbol: { main: "t", sub: "t" }, value: formatValue(climate?.t_out, 0), unit: "°C" },
    { num: "4", name: "Isitish davri davomiyligi", symbol: { main: "Z", sub: "is.dav" }, value: formatValue(heatingSeason?.Z_is_dav, 1), unit: "sut." },
    { num: "5", name: "Isitish davridagi o'rtacha tashqi havo harorati", symbol: { main: "t", sub: "is.dav" }, value: formatValue(heatingSeason?.t_is_dav, 2), unit: "°C" },
    { num: "6", name: "Isitish davridagi gradus-sutkasi", symbol: { main: "D", sub: "d" }, value: formatValue(D_d, 3), unit: "°C·sut" },
  ];

  const rowsAfter7 = [
    // 8-band: G_i - subscript bilan
    { num: "8", name: "Bosimi farqi 10 Pa etalon qiymatida binoda infiltratsiya qilingan havoning oqim sarfi", symbol: { main: "G", sub: "i" }, value: "", unit: "kg/soat" },
    { num: "9", name: "Binoning isitiladigan hajmi", symbol: { main: "V", sub: "h" }, value: formatValue(V_h, 1), unit: "m³" },
    // 10-band: soatning -1 darajasi
    { num: "10", name: "Infiltratsiya orqali havo almashinuvi tezligi", symbol: { main: "n", sub: "i" }, value: "", unit: "soat", unitSuperscript: "-1" },
  ];

  // Oddiy qator renderlovchi
  const renderRow = (row, index, isLast = false) => (
    <View 
      key={index} 
      style={isLast ? tableStyles.tableRowLast : tableStyles.tableRow}
    >
      <View style={[tableStyles.cell, tableStyles.colNum, tableStyles.cellCenter]}>
        <Text>{row.num}</Text>
      </View>
      <View style={[tableStyles.cell, tableStyles.colName]}>
        <Text>{row.name}</Text>
      </View>
      <View style={[tableStyles.cell, tableStyles.colSymbol, tableStyles.cellCenter]}>
        {row.symbol ? (
          <SymbolWithSubscript main={row.symbol.main} sub={row.symbol.sub} />
        ) : (
          <Text></Text>
        )}
      </View>
      <View style={[tableStyles.cell, tableStyles.colValue, tableStyles.cellCenter]}>
        <Text>{row.value}</Text>
      </View>
      <View style={[tableStyles.cellLast, tableStyles.colUnit, tableStyles.cellCenter]}>
        {row.unitSuperscript ? (
          <View style={tableStyles.symbolContainer}>
            <Text style={tableStyles.mainText}>{row.unit}</Text>
            <Text style={{ fontSize: 5, lineHeight: 2, fontWeight: 'bold' }}>{row.unitSuperscript}</Text>
          </View>
        ) : (
          <Text>{row.unit}</Text>
        )}
      </View>
    </View>
  );

  return (
    <Page size="A4" style={pdfStyles.page}>
      {/* Ramka */}
      <View style={pdfStyles.pageBorder} fixed />
      <View style={pdfStyles.pageContent}>
        {/* Title - boshqa pagelardek */}
        <Text style={pdfStyles.pageTitle}>
          7. Issiqlik texnik va energetik parametrlarining hisobiy qiymatlari jadvali
        </Text>
          
          <View style={tableStyles.table}>
            {/* Header */}
            <View style={tableStyles.tableHeader}>
              <View style={[tableStyles.headerCell, tableStyles.colNum]}>
                <Text>#</Text>
              </View>
              <View style={[tableStyles.headerCell, tableStyles.colName]}>
                <Text>Hisoblangan parametrning nomi</Text>
              </View>
              <View style={[tableStyles.headerCell, tableStyles.colSymbol]}>
                <Text>Parametr{'\n'}belgisi</Text>
              </View>
              <View style={[tableStyles.headerCell, tableStyles.colValue]}>
                <Text>Hisobiy{'\n'}qiymat</Text>
              </View>
              <View style={[tableStyles.headerCellLast, tableStyles.colUnit]}>
                <Text>O'lchov{'\n'}birligi</Text>
              </View>
            </View>

            {/* 1-6 qatorlar */}
            {rowsBefore7.map((row, index) => renderRow(row, `before-${index}`))}

            {/* 7-band - birlashtirilgan katak */}
            <View style={tableStyles.tableRow}>
              <View style={[tableStyles.cell, tableStyles.colNum, tableStyles.cellCenter]}>
                <Text>7</Text>
              </View>
              <View style={[tableStyles.mergedCell, tableStyles.colMerged]}>
                <Text>Asosiy xonalar tashqi konstruksiyalarining issiqlik uzatilishiga keltirilgan qarshiligi</Text>
              </View>
            </View>

            {/* 7-bandning dinamik quyi bandlari */}
            {subRows7.map((row, index) => renderRow(row, `sub7-${index}`))}

          {/* 8-10 qatorlar */}
          {rowsAfter7.map((row, index) => renderRow(row, `after-${index}`, index === rowsAfter7.length - 1))}
        </View>
      </View>
    </Page>
  );
};

// PDF Document komponenti (alohida eksport uchun)
const CalculationTableDocument = ({ initial, climate, heatingSeason, heatSteps = [], buildingParams = {} }) => (
  <Document>
    <CalculationTablePages
      initial={initial}
      climate={climate}
      heatingSeason={heatingSeason}
      heatSteps={heatSteps}
      buildingParams={buildingParams}
    />
  </Document>
);

/**
 * 7-jadval: Hisobiy qiymatlar jadvali
 * Issiqlik texnik va energetik parametrlarning hisobiy qiymatlari
 */
export async function exportCalculationTablePdf({ initial, climate, heatingSeason, heatSteps = [], buildingParams = {} }) {
  try {
    const blob = await pdf(
      <CalculationTableDocument
        initial={initial}
        climate={climate}
        heatingSeason={heatingSeason}
        heatSteps={heatSteps}
        buildingParams={buildingParams}
      />
    ).toBlob();

    saveAs(blob, "Hisobiy qiymatlar jadvali.pdf");
  } catch (error) {
    console.error('Hisobiy qiymatlar jadvali PDF yaratishda xato:', error);
    alert('PDF yaratishda xato yuz berdi!');
  }
}
