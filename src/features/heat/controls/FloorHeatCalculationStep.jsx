import React, { useState } from "react";
import { InitialDataBlock } from "./InitialDataBlock";
import { CustomSelect } from "./HeatSelects";
import { MaterialLayersTable } from "./MaterialLayersTable";
import { AirLayerControls, ConstructionIndicatorsPanel, ConstructionResultSummary } from "./ConstructionBlocks";
import { EshikDarvozaStep } from "./EshikDarvozaStep";
import { DerazaBalkonStep } from "./DerazaBalkonStep";
import { RibHeightInfoModal } from "./InfoModals";
import { getHumidityRegime } from "../data/heatCalculations";
import { calculateYp, getFloorAbsorptionNorm } from "../data/floorHeatAbsorption";

// Yerdagi pol (floor_heat_calculation) bosqichi uchun komponent (EnclosureStep dan nusxa olingan)
export function FloorHeatCalculationStep({
  layers,
  setLayers,
  onExportPDF,
  stepNumber,
  totalSteps,
  constructionType = "",
  setConstructionType = () => { },
  filteredConstructionTypes = [],
  ribHeightRatio = "",
  setRibHeightRatio = () => { },
  showRibInfo = false,
  setShowRibInfo = () => { },
  derazaType = "",
  setDerazaType = () => { },
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
  updateLayer = () => { },
  removeLayer = () => { },
  setMaterialModal = () => { },
  draggingLayerId = null,
  setDraggingLayerId = () => { },
  moveLayer = () => { },
  addLayer = () => { },
  airLayer = {},
  setAirLayer = () => { },
  initial = {},
  RoTalab = null,
  deltaTtResult = null,
  showConstructionError = false,
  showRibHeightError = false,
  // Deraza variantlari uchun proplar
  selectedWindowGroup = "",
  setSelectedWindowGroup = () => { },
  selectedWindowVariant = "",
  setSelectedWindowVariant = () => { },
  selectedWindowGroup2 = "",
  setSelectedWindowGroup2 = () => { },
  selectedWindowVariant2 = "",
  setSelectedWindowVariant2 = () => { },
  showLayersError = false,
  showDerazaTypeError = false,
}) {
  const [showInitial, setShowInitial] = useState(false);
  const [showNormative, setShowNormative] = useState(false);
  const [showDBlock, setShowDBlock] = useState(false);

  // Hozirgi konstruksiya turini aniqlash
  const currentConstructionType = constructionType;

  // Namlik rejimi bo'yicha shartni aniqlash (A yoki B)
  // Quruq va Normal -> A
  // Nam va Ho'l -> B
  const regime = climate && climate.t_in != null && climate.phi_in != null
    ? getHumidityRegime(climate.t_in, climate.phi_in)
    : "normal";
  const humidityCondition = (regime === "quruq" || regime === "normal") ? "A" : "B";

  const YpResult = React.useMemo(() => {
    return calculateYp(layers, humidityCondition);
  }, [layers, humidityCondition]);

  const YpNorm = React.useMemo(() => {
    return getFloorAbsorptionNorm(initial?.objectType);
  }, [initial?.objectType]);

  // D parametrini hisoblash (Normativ parametrlar bo'limi uchun)
  const D_data = React.useMemo(() => {
    let sum_D = 0;
    const steps = [];
    layers.forEach((l, idx) => {
      const d_m = (parseFloat(l.thickness_mm) || 0) / 1000;
      const lambda = parseFloat(l.lambda) || 0;
      const R = (d_m > 0 && lambda > 0) ? d_m / lambda : 0;

      let s_val = 0;
      if (l.s != null && l.s !== "") {
        if (typeof l.s === 'object') {
          s_val = parseFloat(l.s[humidityCondition] || l.s.A || 0);
        } else {
          s_val = parseFloat(l.s);
        }
      }

      const D = R * s_val;
      sum_D += D;
      steps.push({
        index: idx + 1,
        materialName: l.name || 'Nomsiz material',
        R: R.toFixed(3),
        S: s_val.toFixed(2),
        D: D.toFixed(3)
      });
    });
    return { sum_D, steps };
  }, [layers, humidityCondition]);

  // Senariylar uchun hisob-kitoblar (User talabi bo'yicha)
  const scenarioData = React.useMemo(() => {
    if (!layers || layers.length === 0) return null;

    const L1 = layers[0];
    const d1_m = (parseFloat(L1.thickness_mm) || 0) / 1000;
    const lam1 = parseFloat(L1.lambda) || 0;
    const R1 = (d1_m > 0 && lam1 > 0) ? d1_m / lam1 : 0;

    let s1_val = 0;
    if (L1.s != null) {
      if (typeof L1.s === 'object') {
        s1_val = parseFloat(L1.s[humidityCondition] || L1.s.A || 0);
      } else {
        s1_val = parseFloat(L1.s);
      }
    }
    const D1 = R1 * s1_val;
    const isScenario1 = D1 >= 0.5;

    let sumD_rest = 0;
    for (let i = 1; i < layers.length; i++) {
      const L = layers[i];
      const d_m = (parseFloat(L.thickness_mm) || 0) / 1000;
      const lam = parseFloat(L.lambda) || 0;
      const R = (d_m > 0 && lam > 0) ? d_m / lam : 0;
      let s_val = 0;
      if (L.s != null) {
        if (typeof L.s === 'object') {
          s_val = parseFloat(L.s[humidityCondition] || L.s.A || 0);
        } else {
          s_val = parseFloat(L.s);
        }
      }
      sumD_rest += R * s_val;
    }

    return { D1, sumD_rest, isScenario1, S1: s1_val };
  }, [layers, humidityCondition]);

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

            {/* 2-qism: Materiallar jadvali */}
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
                showDColumn={false}
                humidityCondition={humidityCondition}
                thicknessInputWidth="w-20"
              />

              <div className="mt-4 flex flex-col gap-4">
                <button
                  type="button"
                  onClick={addLayer}
                  className="px-4 py-2 rounded-lg bg-[#1080c2] text-white text-sm self-start"
                >
                  Qatlam qo'shish
                </button>
              </div>

              <div className="border-t border-dashed border-gray-200 my-4" />

              {/* D bloki - Issiqlik inersiyasi */}
              {layers && layers.length > 0 && (
                <section className="mt-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      To'suvchi konstruksiyalarning issiqlik inertsiyasi, 
                       <span className="font-medium text-[#1080c2]"> D</span>
                    </h3>
                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() => setShowDBlock(!showDBlock)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 text-xs"
                        aria-label={showDBlock ? "D blokini yopish" : "D blokini ochish"}
                      >
                        <span className={`transform transition-transform ${showDBlock ? "rotate-0" : "-rotate-90"}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>

                  {showDBlock && (
                    <div className="space-y-2 text-[0.9rem]">
                      {D_data.steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <div className="border-t border-dashed border-gray-200" />}
                          <div className="pt-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="font-medium">
                                D<sub className="align-baseline text-[0.7em]">{step.index}</sub> {step.materialName}
                              </span>
                              <span className="text-right text-[#1080c2] font-semibold">
                                {step.D}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 italic mt-1">
                              D<sub className="align-baseline text-[0.7em]">{step.index}</sub> = R<sub className="align-baseline text-[0.7em]">{step.index}</sub> × S<sub className="align-baseline text-[0.7em]">{step.index}</sub> = {step.R} × {step.S} = {step.D}
                            </p>
                          </div>
                        </React.Fragment>
                      ))}
                      <div className="border-t border-dashed border-gray-200" />
                      <div className="flex items-baseline justify-between gap-3 pt-2">
                        <span className="font-semibold text-gray-900 ">Jami issiqlik inersiyasi (ΣD)</span>
                        <span className="text-right text-[#1080c2] font-bold text-lg">
                          {D_data.sum_D.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  )}
                </section>
              )}

              <div className="border-t border-dashed border-gray-200 my-4" />

              {/* Senariy bloki */}
              {scenarioData && (
                <div className="mt-6 text-sm">
                  {scenarioData.isScenario1 ? (
                    <div className="space-y-3">
                      <p className="text-gray-800 leading-relaxed text-center">
                        <span className="font-semibold">SHNQ 2.01.04-18 4.2-bandiga asosan:</span> Birinchi qatlamning issiqlik inersiyasi{" "}
                        <span className="font-medium text-[#1080c2]">D₁ = R₁ · S₁ = {scenarioData.D1.toFixed(3)} ≥ 0.5</span>{" "}
                        bo'lganligi sababli, pol yuzasining issiqlik o'zlashtirish ko'rsatkichi quyidagi formula yordamida aniqlanadi:{" "}
                        <span className="font-semibold text-[#1080c2]">
                          Y<sub className="text-[0.7em]">p</sub> = 2 · S₁
                        </span>
                        {YpResult && YpResult.case === 1 && YpResult.steps && YpResult.steps.map((step, idx) => (
                          step.type === 'formula' && (
                            <span key={idx}>
                              {' = '}
                              <span dangerouslySetInnerHTML={{ __html: step.formula.replace(/Y<sub>p<\/sub> = /, '').replace(/ =$/, '') }} />
                              {' = '}
                              <span className="text-[#1080c2] font-semibold">{step.result}</span>
                            </span>
                          )
                        ))}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-800 leading-relaxed text-center">
                        <span className="font-semibold">SHNQ 2.01.04-18 4.2-bandiga asosan:</span> Birinchi qatlamning issiqlik inersiyasi{" "}
                        <span className="font-medium text-[#1080c2]">D₁ = R₁ · S₁ = {scenarioData.D1.toFixed(3)} &lt; 0.5</span>{" "}
                        bo'lganligi sababli, pol yuzasining issiqlik o'zlashtirish ko'rsatkichi quyidagi formulalar yordamida aniqlanadi:
                      </p>

                      <div className="space-y-3">
                        {/* Formulalar yonma-yon */}
                        <div className="flex flex-col md:flex-row md:justify-center md:gap-10 text-center text-sm space-y-2 md:space-y-0">
                          <p>
                            <span className="font-semibold text-gray-500">(22)</span>
                            {' '}
                            <span className="font-bold text-[#1080c2]">
                              Y<sub className="text-[0.7em]">n</sub> = (2 · R<sub className="text-[0.7em]">n</sub> · S<sub className="text-[0.7em]">n</sub>² + S<sub className="text-[0.7em]">n+1</sub>) / (0.5 + R<sub className="text-[0.7em]">n</sub> · S<sub className="text-[0.7em]">n+1</sub>)
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold text-gray-500">(22a)</span>
                            {' '}
                            <span className="font-bold text-[#1080c2]">
                              Y<sub className="text-[0.7em]">i</sub> = (4 · R<sub className="text-[0.7em]">i</sub> · S<sub className="text-[0.7em]">i</sub>² + Y<sub className="text-[0.7em]">i+1</sub>) / (1 + R<sub className="text-[0.7em]">i</sub> · Y<sub className="text-[0.7em]">i+1</sub>)
                            </span>
                          </p>
                        </div>

                        {/* Hisob-kitob natijalari */}
                        {YpResult && YpResult.case === 2 && YpResult.steps && (
                          <div className="mt-10 space-y-3 text-[0.9rem]">
                            {YpResult.steps.map((step, idx) => (
                              <React.Fragment key={idx}>
                                {idx > 0 && <div className=" border-dashed border-gray-200" />}
                                <div className={step.type === 'text' ? 'pt-2' : 'pt-1'}>
                                  {step.type === 'text' ? (
                                    <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: step.content }} />
                                  ) : (
                                    <p className="text-gray-800">
                                      <span dangerouslySetInnerHTML={{ __html: step.formula }} />
                                      {' '}
                                      <span className="text-[#1080c2] font-semibold">{step.result}</span>
                                    </p>
                                  )}
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <RibHeightInfoModal open={showRibInfo} onClose={() => setShowRibInfo(false)} />

      {/* Yp natijalari */}
      {YpResult && YpResult.Yp != null && (
        <div>
          {YpNorm != null && (
            <div className={`mt-4 p-4 rounded-lg border text-center ${YpResult.Yp <= YpNorm ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-200'}`}>
              <p className="text-sm leading-relaxed mb-3">
                <span className="font-semibold">SHNQ 2.01.04-2018</span> Qurilish issiqlik texnikasining 11-jadvaliga muvofiq pol yuzasining issiqlik o'zlashtirish ko'rsatkichi, Y<sub className="align-baseline text-[0.7em]">p</sub> - <span className="font-semibold">{YpResult.Yp.toFixed(2)} Vt / (m² · °C)</span> me'yoriy qiymatdan <span className="font-semibold">{YpNorm.toFixed(1)} Vt / (m² · °C)</span> {YpResult.Yp <= YpNorm ? 'kichik.' : 'katta.'}
              </p>
              <p className={`text-xl font-bold ${YpResult.Yp <= YpNorm ? 'text-green-700' : 'text-red-700'}`}>
                {YpResult.Yp <= YpNorm ? "Issiqlik o'zlashtirish me'yoriy talabga muvofiq keladi!" : "Issiqlik o'zlashtirish me'yoriy talabga muvofiq kelmaydi!"}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
