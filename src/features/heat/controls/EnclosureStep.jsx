import React, { useState } from "react";
import { InitialDataBlock } from "./InitialDataBlock";
import { CustomSelect } from "./HeatSelects";
import { MaterialLayersTable } from "./MaterialLayersTable";
import { AirLayerControls, ConstructionIndicatorsPanel, ConstructionResultSummary } from "./ConstructionBlocks";
import { EshikDarvozaStep } from "./EshikDarvozaStep";
import { DerazaBalkonStep } from "./DerazaBalkonStep";
import { RibHeightInfoModal } from "./InfoModals";

// To'suvchi konstruksiya (heat_calc_1) bosqichi uchun alohida komponent
export function EnclosureStep({
  constructionType,
  setConstructionType,
  filteredConstructionTypes,
  ribHeightRatio,
  setRibHeightRatio,
  showRibInfo,
  setShowRibInfo,
  derazaType,
  setDerazaType,
  hududLabel,
  climate,
  heatingSeason,
  RoTalSG,
  RoTalED,
  RoTalDF,
  Rk,
  Ro_calc,
  RoResult,
  alphaI,
  alphaT,
  layers,
  updateLayer,
  removeLayer,
  setMaterialModal,
  draggingLayerId,
  setDraggingLayerId,
  moveLayer,
  addLayer,
  airLayer,
  setAirLayer,
  initial,
  RoTalab,
  deltaTtResult,
  showConstructionError,
  showRibHeightError,
  // Deraza variantlari uchun proplar
  selectedWindowGroup,
  setSelectedWindowGroup,
  selectedWindowVariant,
  setSelectedWindowVariant,
  selectedWindowGroup2,
  setSelectedWindowGroup2,
  selectedWindowVariant2,
  setSelectedWindowVariant2,
  currentDisplayStep,
}) {
  const [showInitial, setShowInitial] = useState(false);
  const [showNormative, setShowNormative] = useState(false);

  // Hozirgi konstruksiya turini aniqlash (preset yoki tanlangan)
  const currentConstructionType = currentDisplayStep?.presetConstructionType || constructionType;

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
            {/* 1-qism: Konstruksiya turi va h/a */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6">
              <div className="w-full py-0">
                <label className="block text-base font-semibold text-gray-900 mb-2">Konstruksiya turi</label>
                <CustomSelect
                  value={constructionType}
                  onChange={(val) => setConstructionType(val)}
                  error={showConstructionError}
                  placeholder="Tanlang"
                  options={filteredConstructionTypes}
                />
              </div>

              {currentConstructionType &&
                currentConstructionType !== "tashqi_devor" &&
                currentConstructionType !== "tashqi_devor_ventfasad" && (
                  <div className="w-full md:basis-1/3">
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span>Qovurg'a balandligi nisbati, h/a</span>
                      <button
                        type="button"
                        className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-600 hover:bg-gray-100"
                        onClick={() => setShowRibInfo(true)}
                        aria-label="Qovurg'a balandligi nisbati haqida eslatma"
                      >
                        ?
                      </button>
                    </label>
                    <CustomSelect
                      value={ribHeightRatio}
                      onChange={(val) => setRibHeightRatio(val)}
                      placeholder="h/a nisbatini tanlang"
                      options={[
                        { value: "low", label: "h/a ≤ 0.3" },
                        { value: "high", label: "h/a > 0.3" },
                      ]}
                      error={showRibHeightError}
                    />
                  </div>
                )}
            </div>

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
