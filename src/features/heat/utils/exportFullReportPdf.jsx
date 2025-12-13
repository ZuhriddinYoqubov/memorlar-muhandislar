import React from 'react';
import { Document, Page, Text, View, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdfStyles } from './pdfStyles';
import { CONSTRUCTION_TYPES } from '../data/constructionTypes';

// Sahifa komponentlarini import qilish
import { HeatLossPages } from './exportHeatLossPdf.jsx';
import { QStepPages } from './exportQStepPdf.jsx';
import { HeatPages } from './exportHeatPdfReact';
import { WindowPages } from './exportWindowPdf.jsx';
import { DoorPages } from './exportDoorPdf.jsx';
import { FloorPages } from './exportFloorPdfReact';
import { CalculationTablePages } from './exportCalculationTablePdf.jsx';

// Noto Sans Math fontini ro'yxatdan o'tkazish
import NotoSansMathUrl from '../../../assets/fonts/NotoSansMath-Regular.ttf';

Font.register({
  family: 'NotoSansMath',
  src: NotoSansMathUrl,
});

// Title sahifasi komponenti
const TitlePage = ({ initial }) => {
  const currentYear = new Date().getFullYear();
  
  let objectName = initial?.objectName || "Loyiha nomi";
  if (objectName.endsWith(".")) {
    objectName = objectName.slice(0, -1);
  }
  const rawType = (initial?.objectType || "").trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : "";
  const objectInfo = `${objectName}${typePart} bo'yicha`;

  const provinceName = initial?.provinceName || initial?.province || "Viloyat";

  return (
    <Page size="A4" style={pdfStyles.titlePage}>
      <View style={pdfStyles.titleBorder}>
        <Text style={pdfStyles.companyName}>ARCHIPELAG MCHJ</Text>
        <Text style={pdfStyles.objectInfo}>{objectInfo}</Text>
        <Text style={pdfStyles.mainTitle}>ISSIQLIK TEXNIK HISOBI</Text>
        <Text style={pdfStyles.yearInfo}>{provinceName} - {currentYear}-yil</Text>
      </View>
    </Page>
  );
};

// To'liq hisobot Document komponenti
const FullReportDocument = ({ 
  initial, 
  climate, 
  heatingSeason, 
  heatSteps, 
  buildingParams,
  floorDataMap,
  qStepData,
  wallLayers,
}) => {
  const isMeaningfulLayers = (ls) => {
    if (!Array.isArray(ls) || ls.length === 0) return false;
    return ls.some((l) => {
      const hasDims = (Number(l?.thickness_mm) || 0) > 0;
      const hasLambda = (Number(l?.lambda) || 0) > 0;
      const hasNamedMaterial = !!(l?.name && l.name !== "Qurilish materialini tanlang");
      return (hasDims && hasLambda) || hasNamedMaterial;
    });
  };

  // Heat steplarni turlarga ajratish
  const wallSteps = heatSteps.filter((s) => {
    const ct = s.presetConstructionType || s.savedState?.constructionType;
    const isWall = ct && ct !== "deraza_balkon_eshiklari" && ct !== "eshik_darvoza" && ct !== "floor_heat_calculation";
    if (!isWall) return false;
    if (!s?.savedState) return false;
    return isMeaningfulLayers(s.savedState?.layers);
  });
  const doorSteps = heatSteps.filter(s => {
    const ct = s.presetConstructionType || s.savedState?.constructionType;
    return ct === "eshik_darvoza";
  });
  const windowSteps = heatSteps.filter(s => {
    const ct = s.presetConstructionType || s.savedState?.constructionType;
    return ct === "deraza_balkon_eshiklari";
  });

  return (
    <Document>
      {/* 1. ISSIQLIK YO'QOTILISHI (8-bo'lim) - vaqtincha birinchi sahifa */}
      <HeatLossPages
        initial={initial}
        climate={climate}
        heatingSeason={heatingSeason}
        buildingParams={buildingParams}
        heatSteps={heatSteps}
      />

      {/* 2. Q STEP - Isitishga me'yoriy solishtirma issiqlik sarfi */}
      {qStepData && (
        <QStepPages
          initial={initial}
          climate={climate}
          heatingSeason={heatingSeason}
          qStepData={qStepData}
          layers={wallLayers}
          heatSteps={heatSteps}
        />
      )}

      {/* 3. TITLE SAHIFA */}
      <TitlePage initial={initial} />

      {/* 3. DEVOR yoki VENTFASAD */}
      {wallSteps.map((heatStep, index) => {
        if (!heatStep.savedState) return null;
        const stepConstructionType = heatStep.presetConstructionType || heatStep.savedState?.constructionType;
        const constructionType = CONSTRUCTION_TYPES.find(ct => ct.id === stepConstructionType);

        return (
          <HeatPages
            key={`wall-${index}`}
            initial={initial}
            climate={climate}
            heatingSeason={heatingSeason}
            heatStep={heatStep}
            constructionType={constructionType}
            showTitlePage={false}
          />
        );
      })}

      {/* 4. ESHIK */}
      {doorSteps.map((heatStep, index) => {
        if (!heatStep.savedState) return null;
        return (
          <DoorPages
            key={`door-${index}`}
            initial={initial}
            climate={climate}
            heatingSeason={heatingSeason}
            heatStep={heatStep}
            RoTalSG={heatStep.savedState?.Ro_MG}
          />
        );
      })}

      {/* 5. OYNA yoki FONAR */}
      {windowSteps.map((heatStep, index) => {
        if (!heatStep.savedState) return null;
        return (
          <WindowPages
            key={`window-${index}`}
            initial={initial}
            climate={climate}
            heatingSeason={heatingSeason}
            heatStep={heatStep}
          />
        );
      })}

      {/* 6. HISOBIY QIYMATLAR JADVALI (oxirida) */}
      <CalculationTablePages
        initial={initial}
        climate={climate}
        heatingSeason={heatingSeason}
        heatSteps={heatSteps}
        buildingParams={buildingParams}
      />
    </Document>
  );
};

/**
 * To'liq hisobot PDF eksport funksiyasi
 * Barcha sahifalarni bitta PDF faylga birlashtiradi
 */
export async function exportFullReportPdf({ 
  initial, 
  climate, 
  heatingSeason, 
  heatSteps = [], 
  buildingParams = {},
  floorDataMap = {},
  qStepData = null,
  wallLayers = [],
}) {
  try {
    console.log('To\'liq hisobot PDF yaratish boshlandi...');
    console.log('heatSteps:', heatSteps);
    console.log('buildingParams:', buildingParams);
    console.log('qStepData:', qStepData);

    const blob = await pdf(
      <FullReportDocument
        initial={initial}
        climate={climate}
        heatingSeason={heatingSeason}
        heatSteps={heatSteps}
        buildingParams={buildingParams}
        floorDataMap={floorDataMap}
        qStepData={qStepData}
        wallLayers={wallLayers}
      />
    ).toBlob();

    const fileName = `ISSIQLIK TEXNIK HISOBI - ${initial?.objectName || 'Loyiha'}.pdf`;
    saveAs(blob, fileName);

    console.log('To\'liq hisobot PDF muvaffaqiyatli saqlandi:', fileName);
  } catch (error) {
    console.error('To\'liq hisobot PDF yaratishda xato:', error);
    alert('PDF yaratishda xato yuz berdi!');
  }
}
