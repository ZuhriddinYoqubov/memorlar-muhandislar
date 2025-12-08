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
        steps.push(`D${idx+1} = R${idx+1} × S${idx+1} = ${R.toFixed(3)} × ${s_val.toFixed(2)} = ${D.toFixed(3)}`);
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
                showDColumn={true}
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

              {/* Senariy bloki */}
              {scenarioData && (
                <div className="mt-6 text-sm">
                  {scenarioData.isScenario1 ? (
                    <div className="space-y-3">
                      <p className="text-gray-800 text-justify leading-relaxed">
                        <span className="font-semibold">SHNQ 2.01.04-18 ga asosan:</span> Birinchi qatlamning issiqlik inersiyasi{" "}
                        <span className="font-medium">D₁ = R₁ · S₁ = {scenarioData.D1.toFixed(3)} ≥ 0.5</span>{" "}
                        bo'lganligi sababli, pol yuzasining issiqlik o'zlashtirish ko'rsatkichi quyidagi formula yordamida aniqlanadi:
                      </p>
                      <p className="font-semibold text-[#1080c2] text-lg pl-4">
                        Y<sub className="align-baseline text-[0.7em]">p</sub> = 2 · S₁ = 2 · {scenarioData.S1.toFixed(2)} = {(2 * scenarioData.S1).toFixed(2)} W/(m²·°C)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-800 text-justify leading-relaxed">
                        <span className="font-semibold">SHNQ 2.01.04-18 ga asosan:</span> Birinchi qatlamning issiqlik inersiyasi{" "}
                        <span className="font-medium text-red-600">D₁ = R₁ · S₁ = {scenarioData.D1.toFixed(3)} &lt; 0.5</span>{" "}
                        bo'lganligi sababli, pol yuzasining issiqlik o'zlashtirish ko'rsatkichi quyidagi formulalar yordamida aniqlanadi:
                      </p>
                      
                      <div className="pl-4 space-y-3">
                         {/* Formulalar yonma-yon */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <p className="font-semibold text-gray-800 mb-1">(22)</p>
                             <p className="font-mono text-sm font-bold text-[#1080c2]">
                               Y<sub className="text-[0.7em]">n</sub> = (2 · R<sub className="text-[0.7em]">n</sub> · S<sub className="text-[0.7em]">n</sub>² + S<sub className="text-[0.7em]">n+1</sub>) / (0.5 + R<sub className="text-[0.7em]">n</sub> · S<sub className="text-[0.7em]">n+1</sub>)
                             </p>
                           </div>

                           <div>
                             <p className="font-semibold text-gray-800 mb-1">(22a)</p>
                             <p className="font-mono text-sm font-bold text-[#1080c2]">
                               Y<sub className="text-[0.7em]">i</sub> = (4 · R<sub className="text-[0.7em]">i</sub> · S<sub className="text-[0.7em]">i</sub>² + Y<sub className="text-[0.7em]">i+1</sub>) / (1 + R<sub className="text-[0.7em]">i</sub> · Y<sub className="text-[0.7em]">i+1</sub>)
                             </p>
                           </div>
                         </div>

                         {/* Hisob-kitob natijalari */}
                         {YpResult && YpResult.case === 2 && YpResult.steps && (
                            <div className="mt-4 space-y-2">
                                <p className="font-medium text-gray-700">Hisob-kitob:</p>
                                <div className="space-y-1 text-xs md:text-sm text-gray-600">
                                    {YpResult.steps.map((step, idx) => (
                                        <p key={idx} className="font-mono break-all">{step}</p>
                                    ))}
                                </div>
                                <p className="font-bold text-[#1080c2] text-lg pt-2">
                                    Y<sub className="align-baseline text-[0.7em]">p</sub> = {YpResult.Yp?.toFixed(2)} W/(m²·°C)
                                </p>
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
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Pol yuzasining issiqlik o'zlashtirishi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Hisoblangan ko'rsatkich (Yp)</p>
              <p className="text-2xl font-bold text-[#1080c2]">{YpResult.Yp.toFixed(2)} W/(m²·°C)</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Me'yoriy talab (Yp_norm)</p>
              <p className="text-2xl font-bold text-gray-700">
                {YpNorm != null ? `≤ ${YpNorm.toFixed(1)}` : "Aniqlanmagan"}
              </p>
            </div>
          </div>

          {YpNorm != null && (
            <div className={`mt-4 p-3 rounded-lg border ${YpResult.Yp <= YpNorm ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="flex items-center gap-2 font-medium">
                {YpResult.Yp <= YpNorm ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Talab bajarildi
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Talab bajarilmadi
                  </>
                )}
              </div>
              <p className="text-sm mt-1">
                Farq: {(YpNorm - YpResult.Yp).toFixed(2)} ({YpResult.Yp <= YpNorm ? "Zaxira" : "Yetishmovchilik"})
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
