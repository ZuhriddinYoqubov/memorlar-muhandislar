import React, { useState } from "react";
import { InitialDataBlock } from "./InitialDataBlock";
import { CustomSelect } from "./HeatSelects";
import { MaterialLayersTable } from "./MaterialLayersTable";
import { AirLayerControls, ConstructionIndicatorsPanel, ConstructionResultSummary } from "./ConstructionBlocks";
import { EshikDarvozaStep } from "./EshikDarvozaStep";
import { DerazaBalkonStep } from "./DerazaBalkonStep";
import { RibHeightInfoModal } from "./InfoModals";
import { getHumidityRegime } from "../data/heatCalculations";

// Yerdagi pol (floor_heat_calculation) bosqichi uchun komponent (EnclosureStep dan nusxa olingan)
export function FloorHeatCalculationStep({
  layers,
  setLayers,
  onExportPDF,
  stepNumber,
  totalSteps,
  constructionType = "",
  setConstructionType = () => {},
  filteredConstructionTypes = [],
  ribHeightRatio = "",
  setRibHeightRatio = () => {},
  showRibInfo = false,
  setShowRibInfo = () => {},
  derazaType = "",
  setDerazaType = () => {},
  hududLabel = "",
  climate = {},
  heatingSeason = {},
  RoTalSG = null,
  RoTalED = null,
  RoTalDF = null,
  Rk = null,
  Ro_calc = null,
  RoResult = null,
  alphaI = null,
  alphaT = null,
  updateLayer = () => {},
  removeLayer = () => {},
  setMaterialModal = () => {},
  draggingLayerId = null,
  setDraggingLayerId = () => {},
  moveLayer = () => {},
  addLayer = () => {},
  airLayer = {},
  setAirLayer = () => {},
  initial = {},
  RoTalab = null,
  deltaTtResult = null,
  showConstructionError = false,
  showRibHeightError = false,
  // Deraza variantlari uchun proplar
  selectedWindowGroup = "",
  setSelectedWindowGroup = () => {},
  selectedWindowVariant = "",
  setSelectedWindowVariant = () => {},
  selectedWindowGroup2 = "",
  setSelectedWindowGroup2 = () => {},
  selectedWindowVariant2 = "",
  setSelectedWindowVariant2 = () => {},
  showLayersError = false,
  showDerazaTypeError = false,
}) {
  const [showInitial, setShowInitial] = useState(false);
  const [showNormative, setShowNormative] = useState(false);

  // Hozirgi konstruksiya turini aniqlash
  const currentConstructionType = constructionType;

  // Namlik rejimi bo'yicha shartni aniqlash (A yoki B)
  // Quruq va Normal -> A
  // Nam va Ho'l -> B
  const regime = climate && climate.t_in != null && climate.phi_in != null 
    ? getHumidityRegime(climate.t_in, climate.phi_in) 
    : "normal";
  const humidityCondition = (regime === "quruq" || regime === "normal") ? "A" : "B";

  return (
    <div className="space-y-6 text-sm text-gray-700">
      {currentConstructionType === "eshik_darvoza" && (
        <EshikDarvozaStep
          hududLabel={hududLabel}
          climate={climate}
          heatingSeason={heatingSeason}
          RoTalSG={RoTalSG}
          RoTalED={RoTalED}
          Rk={Rk}
          Ro_calc={Ro_calc}
          RoResult={RoResult}
          alphaI={alphaI}
          alphaT={alphaT}
          layers={layers}
          updateLayer={updateLayer}
          removeLayer={removeLayer}
          setMaterialModal={setMaterialModal}
          draggingLayerId={draggingLayerId}
          setDraggingLayerId={setDraggingLayerId}
          moveLayer={moveLayer}
          addLayer={addLayer}
          airLayer={airLayer}
          setAirLayer={setAirLayer}
        />
      )}

      {currentConstructionType === "deraza_balkon_eshiklari" && (
        <DerazaBalkonStep
          hududLabel={hududLabel}
          climate={climate}
          heatingSeason={heatingSeason}
          RoTalSG={RoTalSG}
          RoTalED={RoTalED}
          RoTalDF={RoTalDF}
          Rk={Rk}
          Ro_calc={Ro_calc}
          RoResult={RoResult}
          alphaI={alphaI}
          alphaT={alphaT}
          derazaType={derazaType}
          setDerazaType={setDerazaType}
          protectionLevel={initial.protectionLevel}
          layers={layers}
          updateLayer={updateLayer}
          removeLayer={removeLayer}
          setMaterialModal={setMaterialModal}
          draggingLayerId={draggingLayerId}
          setDraggingLayerId={setDraggingLayerId}
          moveLayer={moveLayer}
          addLayer={addLayer}
          airLayer={airLayer}
          setAirLayer={setAirLayer}
          selectedWindowGroup={selectedWindowGroup}
          setSelectedWindowGroup={setSelectedWindowGroup}
          selectedWindowVariant={selectedWindowVariant}
          setSelectedWindowVariant={setSelectedWindowVariant}
          selectedWindowGroup2={selectedWindowGroup2}
          setSelectedWindowGroup2={setSelectedWindowGroup2}
          selectedWindowVariant2={selectedWindowVariant2}
          setSelectedWindowVariant2={setSelectedWindowVariant2}
        />
      )}

      {currentConstructionType !== "eshik_darvoza" && currentConstructionType !== "deraza_balkon_eshiklari" && (
        <>
          <InitialDataBlock
            hududLabel={hududLabel}
            climate={climate}
            heatingSeason={heatingSeason}
            collapsible
            isOpen={showInitial}
            onToggle={() => setShowInitial((v) => !v)}
          />

          <div className="border-t border-dashed border-gray-200 my-4" />

          <div >
            {/* Konstruksiya turi tanlovi olib tashlandi */}
            
            {/* 2-qism: Materiallar jadvali va havo qatlami */}
            <div>
              <MaterialLayersTable
                layers={layers}
                updateLayer={updateLayer}
                removeLayer={removeLayer}
                setMaterialModal={setMaterialModal}
                draggingLayerId={draggingLayerId}
                setDraggingLayerId={setDraggingLayerId}
                moveLayer={moveLayer}
                showSColumn={true}
                humidityCondition={humidityCondition}
              />

              <div className="mt-4 flex flex-col gap-4">
                <button
                  type="button"
                  onClick={addLayer}
                  className="px-4 py-2 rounded-lg bg-[#1080c2] text-white text-sm self-start"
                >
                  Qatlam qo'shish
                </button>

                <AirLayerControls airLayer={airLayer} onChange={setAirLayer} showTopBorder={false} />
              </div>
            </div>
          </div>
        </>
      )}

      <RibHeightInfoModal open={showRibInfo} onClose={() => setShowRibInfo(false)} />

      {/* Material blokidan keyin ko'rsatkichlar paneli (faqat deraza/balkon eshiklari bo'lmaganda) */}
      {currentConstructionType &&
        currentConstructionType !== "eshik_darvoza" &&
        currentConstructionType !== "deraza_balkon_eshiklari" && (
          <>
            <div className="border-t border-dashed border-gray-200 mt-6 mb-4" />

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">Normativ parametrlar</h3>
                <button
                  type="button"
                  onClick={() => setShowNormative((v) => !v)}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 text-xs"
                  aria-label={showNormative ? "Normativ parametrlarni yopish" : "Normativ parametrlarni ochish"}
                >
                  <span className={`transform transition-transform ${showNormative ? "rotate-0" : "-rotate-90"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
              </div>

              {showNormative && (
                <ConstructionIndicatorsPanel
                  deltaTtResult={deltaTtResult}
                  alphaI={alphaI}
                  alphaT={alphaT}
                  heatingSeason={heatingSeason}
                  RoTalSG={RoTalSG}
                  RoTalab={RoTalab}
                  RoResult={RoResult}
                  Rk={Rk}
                  Ro_calc={Ro_calc}
                  initial={initial}
                  constructionType={currentConstructionType}
                  climate={climate}
                  layers={layers}
                  ribHeightRatio={ribHeightRatio}
                />
              )}
            </section>

            <div className="border-t border-dashed border-gray-200 mt-4 mb-2" />

            <ConstructionResultSummary Ro_calc={Ro_calc} RoTalab={RoTalab} />
          </>
        )}
    </div>
  );
}
