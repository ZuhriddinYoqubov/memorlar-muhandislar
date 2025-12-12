import React, { useState, useMemo } from "react";
import { InitialDataBlock } from "./InitialDataBlock";
import { CustomSelect } from "./HeatSelects";
import { MaterialLayersTable } from "./MaterialLayersTable";
import { AirLayerControls, ConstructionIndicatorsPanel, ConstructionResultSummary } from "./ConstructionBlocks";
import { EshikDarvozaStep } from "./EshikDarvozaStep";
import { DerazaBalkonStep } from "./DerazaBalkonStep";
import { RibHeightInfoModal } from "./InfoModals";

// To'suvchi konstruksiya (heat_calc_1) bosqichi uchun alohida komponent
export function EnclosureStep({
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

  // Xatolik ro'yxatini hisoblash
  const validationErrors = useMemo(() => {
    const errors = [];
    
    // Faqat to'suvchi konstruksiyalar uchun (deraza, fonar, eshik emas)
    if (currentConstructionType && 
        currentConstructionType !== "eshik_darvoza" && 
        currentConstructionType !== "deraza_balkon_eshiklari" && 
        currentConstructionType !== "fonarlar") {
      
      // Qatlamlar tekshiruvi
      if (layers && layers.length > 0) {
        layers.forEach((layer, idx) => {
          if (!layer.name || layer.name === "Qurilish materialini tanlang") {
            errors.push(`${idx + 1}-qatlam: Material tanlang`);
          }
          if (!layer.thickness_mm || layer.thickness_mm === "" || Number(layer.thickness_mm) <= 0) {
            errors.push(`${idx + 1}-qatlam: Qalinlikni kiriting`);
          }
        });
      }
      
      // Qovurg'ali plita uchun h/a nisbati
      if (currentConstructionType === "qovurg'ali_plita" && !ribHeightRatio) {
        errors.push("Qovurg'a balandligi nisbatini tanlang");
      }
    }
    
    return errors;
  }, [currentConstructionType, layers, ribHeightRatio]);

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

      {(currentConstructionType === "deraza_balkon_eshiklari" || currentConstructionType === "fonarlar") && (
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

      {currentConstructionType !== "eshik_darvoza" && currentConstructionType !== "deraza_balkon_eshiklari" && currentConstructionType !== "fonarlar" && (
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

          <div>
            {/* Materiallar jadvali */}
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

                {/* Qovurg'a balandligi nisbati - faqat devor va ventfasad bo'lmaganda */}
                {currentConstructionType &&
                  currentConstructionType !== "tashqi_devor" &&
                  currentConstructionType !== "tashqi_devor_ventfasad" && (
                    <div className="py-2">
                      <span className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-2">
                        Qovurg'a balandligi nisbati, h/a
                        <button
                          type="button"
                          className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-600 hover:bg-gray-100"
                          onClick={() => setShowRibInfo(true)}
                          aria-label="Qovurg'a balandligi nisbati haqida eslatma"
                        >
                          ?
                        </button>
                      </span>
                      <div className="flex items-center gap-4 text-xs text-gray-800">
                        <label className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name="rib-height-ratio"
                            value="low"
                            className={`border-gray-300 text-[#1080c2] focus:ring-[#1080c2] ${showRibHeightError ? 'border-red-500' : ''}`}
                            checked={ribHeightRatio === "low"}
                            onChange={() => setRibHeightRatio("low")}
                          />
                          <span>h/a ≤ 0.3</span>
                        </label>
                        <label className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name="rib-height-ratio"
                            value="high"
                            className={`border-gray-300 text-[#1080c2] focus:ring-[#1080c2] ${showRibHeightError ? 'border-red-500' : ''}`}
                            checked={ribHeightRatio === "high"}
                            onChange={() => setRibHeightRatio("high")}
                          />
                          <span>h/a &gt; 0.3</span>
                        </label>
                      </div>
                    </div>
                  )}

                <AirLayerControls airLayer={airLayer} onChange={setAirLayer} showTopBorder={false} />
              </div>
            </div>
          </div>
        </>
      )}

      <RibHeightInfoModal open={showRibInfo} onClose={() => setShowRibInfo(false)} />

      {/* Material blokidan keyin ko'rsatkichlar paneli (faqat deraza/balkon eshiklari va fonarlar bo'lmaganda) */}
      {currentConstructionType &&
        currentConstructionType !== "eshik_darvoza" &&
        currentConstructionType !== "deraza_balkon_eshiklari" &&
        currentConstructionType !== "fonarlar" && (
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

            {/* Xatolik ro'yxati - hulosa blokidan avval */}
            {validationErrors.length > 0 && (
              <div className="mb-4">
                <p className="text-red-600 text-sm mb-1">Ushbu ma'lumotlarni kiriting:</p>
                <ul className="text-red-500 text-sm space-y-0.5">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hulosa bloki - faqat xatolik yopilganda ko'rinadi */}
            {validationErrors.length === 0 && (
              <ConstructionResultSummary Ro_calc={Ro_calc} RoTalab={RoTalab} />
            )}
          </>
        )}
    </div>
  );
}
