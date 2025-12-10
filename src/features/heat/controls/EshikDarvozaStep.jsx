// Eshik va darvozalar uchun issiqlik texnik hisob bosqichi
import React, { useMemo, useState } from "react";
import { MaterialLayersTable } from "./MaterialLayersTable";
import { AirLayerControls } from "./ConstructionBlocks";
import { InitialDataBlock } from "./InitialDataBlock";

export function EshikDarvozaStep({
  hududLabel,
  climate,
  heatingSeason,
  RoTalSG,
  RoTalED,
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
}) {
  // Ro ni avtomatik hisoblash: Ro = Rk + 1/αᵢ + 1/αₜ
  const Ro = useMemo(() => {
    if (Rk == null || !alphaI || !alphaT) return null;
    if (!Number.isFinite(Rk) || !Number.isFinite(alphaI) || !Number.isFinite(alphaT)) return null;
    if (alphaI === 0 || alphaT === 0) return null;

    return Rk + 1 / alphaI + 1 / alphaT;
  }, [Rk, alphaI, alphaT]);

  const [showInitial, setShowInitial] = useState(false);

  return (
    <div className="space-y-6">
      <InitialDataBlock
        hududLabel={hududLabel}
        climate={climate}
        heatingSeason={heatingSeason}
        collapsible
        isOpen={showInitial}
        onToggle={() => setShowInitial((v) => !v)}
      />

      <div className="border-t border-dashed border-gray-200 my-4" />
      {/* Material bloki - qatlamlar jadvali va havo qatlami */}
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

          <AirLayerControls airLayer={airLayer} onChange={setAirLayer} />
        </div>
      </div>
      {/* Devorning talab etilgan issiqlik uzatilishiga qarshiligi, RₒTal.SG */}
      <div className="pt-2 ">
        <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
          <span className="leading-snug flex-1 text-justify">
            Sanitariya-gigiena talablariga muvofiq me'yriy (ruxsat etilgan maksimal) qarshilik, R
            <sub className="align-baseline text-[0.75em]">o</sub>
            <sup className="align-baseline text-[0.75em]">Tal.SG</sup>
          </span>
          <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
            {RoTalSG != null ? `${RoTalSG.toFixed(2)} m²·°C/Vt` : "—"}
          </span>
        </p>
      </div>

      {/* Eshik (balkonlarnikidan tashqari) va darvozalarning talab etilgan issiqlik uzatilishiga qarshiligi, RₒTal.e.d */}
      <div className="pt-2 border-t border-dashed border-gray-200">
        <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
          <span className="leading-snug flex-1 text-justify">
            Eshik (balkonlarnikidan tashqari) va darvozalarning talab etilgan issiqlik uzatilishiga
            qarshiligi, R
            <sub className="align-baseline text-[0.75em]">o</sub>
            <sup className="align-baseline text-[0.75em]">Tal.E.D</sup>
          </span>
          <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
            {RoTalED != null ? `${RoTalED.toFixed(2)} m²·°C/Vt` : "—"}
          </span>
        </p>
        <p className="text-xs text-gray-500 italic mt-1">
          Eshik va darvozalar issiqlik uzatilishiga talab etilgan qarshiligi devorlarning sanitariya-gigena talablariga javob beradigan qarshiligining kamida 0,6 qismidan kam bo'lmasligi kerak (SHNQ 2.01.04-2018, 2.2).
        </p>
      </div>

      {/* Konstruksiyaning shartli issiqlik uzatish qarshiligi, Rk */}
      <div className="pt-2 border-t border-dashed border-gray-200">
        <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
          <span className="leading-snug flex-1 text-justify">
            Konstruksiyaning shartli issiqlik uzatish qarshiligi, R
            <sub className="align-baseline text-[0.75em]">k</sub>
          </span>
          <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
            {Rk != null ? `${Rk.toFixed(3)} m²·°C/Vt` : "—"}
          </span>
        </p>
        <p className="text-xs text-gray-500 italic mt-1">
          Konstruksiya qatlamlarining qalinligi va issiqlik o'tkazuvchanlik koeffitsiyentlari asosida hisoblanadi.
        </p>
      </div>

      {/* Konstruksiyaning issiqlik uzatish qarshiligi, Ro */}
      <div className="pt-2 border-t border-dashed border-gray-200">
        <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
          <span className="leading-snug flex-1 text-justify">
            Konstruksiyaning issiqlik uzatish qarshiligi, R
            <sub className="align-baseline text-[0.75em]">o</sub>
          </span>
          <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
            {Ro != null ? `${Ro.toFixed(3)} m²·°C/Vt` : "—"}
          </span>
        </p>
      </div>

      {/* Shart bajarilganligi tekshiruvi */}
      {Ro != null && RoTalED != null && (
        <div className="mt-4 pt-4 border-t-2 border-gray-300">
          {(() => {
            const RoVal = Ro;
            const RoTalVal = RoTalED;
            const RoStr = RoVal.toFixed(2);
            const RoTalStr = RoTalVal.toFixed(2);

            const RoRounded = Number(RoStr);
            const RoTalRounded = Number(RoTalStr);
            const isCompliant = RoRounded >= RoTalRounded;

            const relationText = RoRounded > RoTalRounded
              ? "talab etilganidan"
              : RoRounded === RoTalRounded
                ? "talab etilganiga"
                : "talab etilganidan";

            const relationWord = RoRounded > RoTalRounded
              ? "katta"
              : RoRounded === RoTalRounded
                ? "teng"
                : "kichik";

            return (
              <div className={`p-4 rounded-lg border ${isCompliant ? 'bg-green-50 border-green-300 ' : 'bg-red-50 border-red-200  '}`}>
                <p className="text-sm leading-relaxed text-center mb-3">
                  Eshik va darvozalarning issiqlik uzatilishiga keltirilgan qarshiligi (
                  R
                  <sub className="align-baseline text-[0.7em]">o</sub>
                  {" = "}
                  <span className="font-semibold">{RoStr}</span> m²·°C/Vt) talab etilganidan (R
                  <sub className="align-baseline text-[0.7em]">o</sub>
                  <sup className="align-baseline text-[0.7em]">Tal.e.d</sup>
                  {" = "}
                  <span className="font-semibold">{RoTalStr}</span> m²·°C/Vt) {relationWord}.
                  
                </p>
                <p className={` text-center text-xl font-bold ${isCompliant ? 'text-green-700' : 'text-red-700'}`}>Issiqlik himoyasi talabiga muvofiq {isCompliant ? "keladi" : "kelmaydi"}!</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
