// To'suvchi konstruksiya materiallari va ko'rsatkichlari uchun umumiy skelet komponentlar
// Eslatma: hozircha bu komponentlar faqat UI skeleti bo'lib xizmat qiladi. Keyingi bosqichlarda
// IssiqlikTexnikHisob ichidagi to'liq interaktiv jadval va hisoblash mantiqlari shu yerga
// parametrlar orqali ko'chirilishi rejalashtirilgan.

import React from "react";
import { CustomSelect } from "./HeatSelects";

// To'suvchi konstruksiya materiallarining xususiyatlari – jadval skeleti
export function ConstructionMaterialsCardSkeleton() {
  return (
    <div className="mt-6 bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-6 shadow-sm">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
        To'suvchi konstruksiya materiallarining xususiyatlari
      </h2>
     
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="text-gray-600 bg-gray-50">
              <th className="py-2 px-3 text-center">#</th>
              <th className="py-2 px-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="leading-tight">
                    <div>
                      Material
                      <span className="ml-2 italic font-normal">(Tashqaridan ichkariga)</span>
                    </div>
                  </div>
                </div>
              </th>
              <th className="py-2 px-3 text-center leading-tight">
                <div>
                  Qalinlik <span className="text-[#1080c2]">δ</span>, mm
                </div>
              </th>
              <th className="py-2 px-3 text-center leading-tight">
                <div>
                  Zichlik <span className="text-[#1080c2]">γ</span>
                  <sub className="align-baseline text-[0.7em] text-[#1080c2]">0</sub>, kg/m³
                </div>
              </th>
              <th className="py-2 px-3 text-center leading-tight">
                <div>
                  Issiqlik o'tkazuvchanlik <span className="text-[#1080c2]">λ</span>
                </div>
              </th>
              <th className="py-2 px-3 text-center leading-tight">
                <div className="whitespace-nowrap">Termik qarshilik R</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[#E5E7EB]">
              <td className="py-3 px-3 text-center text-gray-400">1</td>
              <td className="py-3 px-3 text-gray-400 italic">Material qatlamlari bu yerda ko'rsatiladi</td>
              <td className="py-3 px-3 text-center text-gray-300">—</td>
              <td className="py-3 px-3 text-center text-gray-300">—</td>
              <td className="py-3 px-3 text-center text-gray-300">—</td>
              <td className="py-3 px-3 text-center text-gray-300">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-[#1080c2] text-white text-xs md:text-sm self-start opacity-60 cursor-default"
          disabled
        >
          Qatlam qo'shish
        </button>

        <label className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-500 cursor-not-allowed">
          <input type="checkbox" disabled className="rounded border-gray-300 text-[#1080c2] focus:ring-[#1080c2]" />
          <span>Berk havo qatlamini qo'shish</span>
        </label>
      </div>
    </div>
  );
}

// Berk havo qatlami (air layer) uchun qayta ishlatiladigan boshqaruv bloki
export function AirLayerControls({ airLayer, onChange }) {
  const handleToggleEnabled = (checked) => {
    onChange((s) => ({
      ...s,
      enabled: checked,
    }));
  };

  const handleSelectChange = (key, value) => {
    onChange((s) => ({
      ...s,
      [key]: value,
    }));
  };

  const handleCheckboxField = (key, checked) => {
    onChange((s) => ({
      ...s,
      [key]: checked,
    }));
  };

  return (
    <div className="mt-2 border-t border-dashed border-gray-200 pt-4 space-y-3">
      <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-[#1080c2] focus:ring-[#1080c2]"
          checked={!!airLayer?.enabled}
          onChange={(e) => handleToggleEnabled(e.target.checked)}
        />
        <span>Berk havo qatlamini qo'shish</span>
      </label>

      {airLayer?.enabled && (
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] gap-y-2 md:gap-y-0 md:gap-x-8 items-start">
            <div className="w-[200px]">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Havo qatlamining qalinligi, mm
              </label>
              <CustomSelect
                value={airLayer.thickness_mm}
                onChange={(val) => handleSelectChange("thickness_mm", val)}
                placeholder="Tanlang"
                options={[
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "30", label: "30" },
                  { value: "50", label: "50" },
                  { value: "100", label: "100" },
                  { value: "150", label: "150" },
                  { value: "200_300", label: "200–300" },
                ]}
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">Qatlam harorati</span>
              <div className="flex items-center gap-4 text-xs text-gray-800 mb-2">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="air-layer-temp"
                    value="positive"
                    className="border-gray-300 text-[#1080c2] focus:ring-[#1080c2]"
                    checked={airLayer.layerTemp === "positive"}
                    onChange={() => handleSelectChange("layerTemp", "positive")}
                  />
                  <span>Musbat</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="air-layer-temp"
                    value="negative"
                    className="border-gray-300 text-[#1080c2] focus:ring-[#1080c2]"
                    checked={airLayer.layerTemp === "negative"}
                    onChange={() => handleSelectChange("layerTemp", "negative")}
                  />
                  <span>Manfiy</span>
                </label>
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#1080c2] focus:ring-[#1080c2]"
                  checked={!!airLayer.foilBothSides}
                  onChange={(e) => handleCheckboxField("foilBothSides", e.target.checked)}
                />
                <span>Havo qatlamining bir yoki ikkala yuzasi alyumin zar qog'oz bilan qoplangan</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Umumiy: To'suvchi konstruksiya issiqlik texnik ko'rsatkichlari paneli (ITH va HeatWizard uchun)
export function ConstructionIndicatorsPanel({
  deltaTtResult,
  alphaI,
  alphaT,
  heatingSeason,
  RoTalSG,
  RoTalab,
  RoResult,
  Rk,
  Ro_calc,
  initial,
  constructionType,
}) {
  return (
    <div className="text-sm text-gray-800 divide-y divide-gray-200">
      <div className="flex items-center justify-between py-3 min-h-[56px]">
        <p className="text-justify">
          <span className="font-semibold">
            Ichki havo harorati va to'suvchi konstruksiyaning ichki yuzasi harorati o'rtasidagi me'yoriy harorat farqi, Δt
            <sub className="align-baseline text-[0.7em]">t</sub>
          </span>
        </p>
        {deltaTtResult && deltaTtResult.delta_tt != null ? (
          <span className="font-semibold text-[#1080c2]">
            Δt
            <sub className="align-baseline text-[0.7em]">t</sub> = {deltaTtResult.delta_tt.toFixed(2)} °C
          </span>
        ) : (
          <span className="text-xs text-red-600 text-right">
            {(!initial?.objectType && !constructionType) && "Δtₜ ni hisoblash uchun obekt turi va konstruksiya turini tanlang."}
            {(!initial?.objectType && constructionType) && "Δtₜ ni hisoblash uchun obekt turini tanlang."}
            {(initial?.objectType && !constructionType) && "Δtₜ ni hisoblash uchun konstruksiya turini tanlang."}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-3 min-h-[56px]">
        <p className="text-justify">
          <span className="font-semibold">
            To'suvchi konstruksiyalarning ichki yuzasining issiqlik berish koeffitsienti α
            <sub className="align-baseline text-[0.7em]">i</sub>
          </span>
        </p>
        {alphaI != null ? (
          <span className="font-semibold text-[#1080c2]">
            α
            <sub className="align-baseline text-[0.7em]">i</sub> = {alphaI.toFixed(1)} Vt/(m²·°C)
          </span>
        ) : (
          <span className="text-xs text-red-600 text-right">
            {constructionType
              ? "Qovurg'a balandligi nisbati h/a ni tanlang."
              : "Konstruksiya turini tanlang."}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-3">
        <p className="text-justify">
          <span className="font-semibold">
            To'suvchi konstruksiyalarning tashqi yuzasining issiqlik berish koeffitsienti α
            <sub className="align-baseline text-[0.7em]">t</sub>
          </span>
        </p>
        {alphaT != null ? (
          <span className="font-semibold text-[#1080c2]">
            α
            <sub className="align-baseline text-[0.7em]">t</sub> = {alphaT.toFixed(0)} Vt/(m²·°C)
          </span>
        ) : (
          <span className="text-xs text-red-600 text-right">
            Konstruksiya turini tanlang.
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-3 min-h-[56px]">
        <p className="text-justify">
          <span className="font-semibold">
            Isitish davrining gradus-sutkasi, D
            <sub className="align-baseline text-[0.7em]">is.dav</sub>
          </span>
        </p>
        {heatingSeason?.D_is_dav != null ? (
          <span className="font-semibold text-[#1080c2]">
            D
            <sub className="align-baseline text-[0.7em]">is.dav</sub> = {heatingSeason.D_is_dav.toFixed(0)} °C·sutka
          </span>
        ) : (
          <span className="text-xs text-red-600 text-right">
            Isitish davrining gradus-sutkasini aniqlash uchun hududni tanlang.
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-3 min-h-[56px]">
        <p className="text-justify">
          <span className="font-semibold">
            Sanitariya-gigiena talablariga muvofiq me'yriy (ruxsat etilgan maksimal) qarshilik, R
            <sub className="align-baseline text-[0.7em]">o</sub>
            <sup className="align-baseline text-[0.7em]">Tal.SG</sup>
          </span>
        </p>
        {RoTalSG != null ? (
          <span className="font-semibold text-[#1080c2]">
            R
            <sub className="align-baseline text-[0.7em]">o</sub>
            <sup className="align-baseline text-[0.7em]">Tal.SG</sup> = {RoTalSG.toFixed(2)} m²·°C/Vt
          </span>
        ) : (
          <span className="text-xs text-red-600 text-right">
            R
            <sub className="align-baseline text-[0.7em]">o</sub>
            <sup className="align-baseline text-[0.7em]">Tal.SG</sup> ni hisoblash uchun n, t
            <sub className="align-baseline text-[0.7em]">i</sub>, t
            <sub className="align-baseline text-[0.7em]">t</sub>, Δt
            <sub className="align-baseline text-[0.7em]">t</sub> va α
            <sub className="align-baseline text-[0.7em]">i</sub> qiymatlari aniqlangan bo'lishi kerak.
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-3 min-h-[56px]">
        <p className="text-justify">
          <span className="font-semibold">
            To'suvchi konstruksiyaning talab etilgan issiqlik uzatilishiga keltirilgan qarshiligi, R
            <sub className="align-baseline text-[0.7em]">o</sub>
            <sup className="align-baseline text-[0.7em]">Tal.</sup>
            {initial?.protectionLevel && (
              <span>{" "}(issiqlik himoyasining {initial.protectionLevel} darajasi)</span>
            )}
          </span>
        </p>
        {RoTalab != null ? (
          <span className="font-semibold text-[#1080c2]">
            R
            <sub className="align-baseline text-[0.7em]">o</sub>
            <sup className="align-baseline text-[0.7em]">Tal.</sup>
            {" "}= {RoTalab.toFixed(2)} m²·°C/Vt
          </span>
        ) : (
          <span className="text-xs text-red-600 text-right">
            {/* ITH dagi batafsil matnni soddalashtirib, umumiy xabar qoldiramiz */}
            RₒTal. ni hisoblash uchun kerakli parametrlarni tanlang.
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-3 min-h-[56px]">
        <p className="text-justify">
          <span className="font-semibold">
            Ko'p qatlamli to'suvchi konstruksiyaning termik qarshiligi, R
            <sub className="align-baseline text-[0.7em]">k</sub>
          </span>
        </p>
        {Rk != null && Rk > 0 ? (
          <span className="font-semibold text-[#1080c2]">
            R
            <sub className="align-baseline text-[0.7em]">k</sub> = {Rk.toFixed(2)} m²·°C/Vt
          </span>
        ) : (
          <span className="text-xs text-red-600 text-right">
            To'suvchi konstruksiya qatlamini kiriting.
          </span>
        )}
      </div>

      <div className="flex items-center justify-between py-3 min-h-[56px]">
        <p className="text-justify">
          <span className="font-semibold">
            To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi, R
            <sub className="align-baseline text-[0.7em]">o</sub>
          </span>
        </p>
        {Ro_calc != null ? (
          <span className="font-semibold text-[#1080c2]">
            R
            <sub className="align-baseline text-[0.7em]">o</sub> = {Ro_calc.toFixed(2)} m²·°C/Vt
          </span>
        ) : (
          <span className="text-xs text-red-600 text-right">
            R
            <sub className="align-baseline text-[0.7em]">o</sub> ni hisoblash uchun α
            <sub className="align-baseline text-[0.7em]">i</sub>, R
            <sub className="align-baseline text-[0.7em]">k</sub> va α
            <sub className="align-baseline text-[0.7em]">t</sub> qiymatlari aniqlangan bo'lishi kerak.
          </span>
        )}
      </div>

      {Ro_calc != null && RoTalab != null && (
        <div className="mt-4 pt-4">
          {(() => {
            const RoVal = Ro_calc;
            const RoTalVal = RoTalab;
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
              <>
                <p className="text-lg font-semibold text-gray-900 text-center">
                  To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi (
                  R
                  <sub className="align-baseline text-[0.7em]">o</sub>
                  {" = "}
                  <span className="text-[#1080c2]">{RoStr}</span> m²·°C/Vt) {relationText} (
                  R
                  <sub className="align-baseline text-[0.7em]">o</sub>
                  <sup className="align-baseline text-[0.7em]">Tal.</sup>
                  {" = "}
                  <span className="text-[#1080c2]">{RoTalStr}</span> m²·°C/Vt) {relationWord}.
                </p>
                <p
                  className={
                    "mt-1 text-2xl font-bold text-center " +
                    (isCompliant ? "text-emerald-600" : "text-red-600")
                  }
                >
                  Shartlarga muvofiq {isCompliant ? "keladi" : "kelmaydi"}!
                </p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// To'suvchi konstruksiya issiqlik texnik ko'rsatkichlari – jadval skeleti (HeatWizard uchun o'ram)
export function ConstructionIndicatorsSkeleton({
  objectType,
  constructionType,
  heatingSeason,
  deltaTtResult,
  alphaI,
  alphaT,
  RoTalSG,
  RoTalab,
  RoResult,
  Rk,
  Ro_calc,
  initial,
}) {
  return (
    <div className="mt-6 bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-6 shadow-sm">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
        To'suvchi konstruksiya issiqlik texnik ko'rsatkichlari
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Hozircha ko'rsatkichlar jadvali skelet tarzida ko'rsatilmoqda. Keyingi bosqichda formulalar va real qiymatlar
        bilan to'ldiriladi.
      </p>

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
        constructionType={constructionType}
      />
    </div>
  );
}
