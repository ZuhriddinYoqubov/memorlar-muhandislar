import React from "react";

/**
 * MaterialLayersTable - qatlamlar jadvali komponenti
 * HeatWizard.jsx va ITH.jsx da bir xil dizaynda material qatlamlarini ko'rsatish uchun
 * 
 * Props:
 * - layers: qatlamlar massivi
 * - updateLayer: qatlam xususiyatlarini yangilash funksiyasi
 * - removeLayer: qatlamni o'chirish funksiyasi
 * - setMaterialModal: material tanlash modalini ochish funksiyasi
 * - draggingLayerId: drag & drop uchun hozirgi tortilayotgan qatlam ID'si
 * - setDraggingLayerId: drag state'ini o'rnatish funksiyasi
 * - moveLayer: qatlamlarni tartiblash funksiyasi
 */
export function MaterialLayersTable({
  layers,
  updateLayer,
  removeLayer,
  setMaterialModal,
  draggingLayerId,
  setDraggingLayerId,
  moveLayer,
  showSColumn = false,
  showDColumn = false,
  humidityCondition = "A", // Default "A" (quruq/normal)
  thicknessInputWidth,
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        To'suvchi konstruksiya materiallarining xususiyatlari
      </h2>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="text-gray-600 bg-gray-50 font-medium">
              <th className="py-2 px-3 text-center">#</th>
              <th className="py-2 px-3 text-left w-4/5">
                <div className="flex items-center gap-3">
                  <div className="leading-tight">
                    <div>
                      Material
                      <span className="text-xs italic font-normal">(Tashqaridan ichkariga)</span>
                    </div>
                  </div>
                </div>
              </th>
              <th className="py-2 px-3 text-center leading-tight">
                <div>
                  Qalinlik<br />
                  <span>mm</span><br />
                  <span className="text-[#1080c2]">δ</span>
                </div>
              </th>
              <th className="py-2 px-2 text-center leading-tight">
                <div>
                  Zichlik<br />
                  kg/m³<br />
                  <span className="text-[#1080c2]">
                    γ<sub className="align-baseline text-[0.7em]">o</sub>
                  </span>
                </div>
              </th>
              <th className="py-2 px-3 text-center leading-tight">
                <div>
                  Issiqlik o'tk.lik<br />
                  <span className="text-[#1080c2]">
                    λ
                  </span>
                </div>
              </th>
              <th className="py-2 px-2 text-center leading-tight">
                <div>
                  Termik qarshilik<br />
                  <span className="text-[#1080c2]">R</span>
                </div>
              </th>
              {showSColumn && (
                <th className="py-2 px-2 text-center leading-tight">
                  <div>
                    Issiqlik o'zl.rish<br />
                    <span className="text-[#1080c2]">S</span>
                  </div>
                </th>
              )}
              {showDColumn && (
                <th className="py-2 px-2 text-center leading-tight">
                  <div>
                    Issiqlik inersiyasi<br />
                    <span className="text-[#1080c2]">D</span>
                  </div>
                </th>
              )}
              <th className="py-2 px-3 text-center leading-tight">
                <div>Amal</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {layers.map((L, idx) => {
              const d_m = (Number(L.thickness_mm) || 0) / 1000;
              const lam = Number(L.lambda) || 0;
              const R = d_m > 0 && lam > 0 ? d_m / lam : 0;
              return (
                <tr
                  key={L.id}
                  className="border-t border-[#E5E7EB]"
                  draggable
                  onDragStart={() => setDraggingLayerId(L.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggingLayerId && draggingLayerId !== L.id) {
                      moveLayer(draggingLayerId, L.id);
                    }
                  }}
                  onDragEnd={() => setDraggingLayerId(null)}
                >
                  <td className="py-2 pr-4 pl-3">{idx + 1}</td>
                  <td className="py-2 pr-4 align-top">
                    <div className="w-full max-w-none">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setMaterialModal({ open: true, layerId: L.id })}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-800 hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4 text-[#1080c2]"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M5 12h14M5 17h14" />
                          </svg>
                          <span>{L.name || "Material tanlang"}</span>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-center">
                    <input
                      type="number"
                      value={L.thickness_mm}
                      onChange={(e) => updateLayer(L.id, "thickness_mm", e.target.value)}
                      className={`px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-right ${thicknessInputWidth || "w-20"}`}
                    />
                  </td>
                  <td className="py-2 pr-4 text-center">
                    <span className="inline-block min-w-[4.5rem] text-center">
                      {L.rho != null && L.rho !== "" ? Number(L.rho) : "" ? Number(L.rho).toFixed(0): ""}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-center">
                    <span className="inline-block min-w-[4.5rem] text-center">
                      {L.lambda != null && L.lambda !== "" ? Number(L.lambda).toFixed(3) : ""}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-center">
                    <span className="inline-block min-w-[4.5rem] text-center">
                      {R > 0 ? R.toFixed(3) : ""}
                    </span>
                  </td>
                  {showSColumn && (
                    <td className="py-2 pr-4 text-center">
                      <span className="inline-block min-w-[4.5rem] text-center">
                        {(() => {
                           if (L.s == null || L.s === "") return "";
                           if (typeof L.s === 'object') {
                             const val = L.s[humidityCondition] ?? L.s.A;
                             return val != null ? Number(val).toFixed(3) : "";
                           }
                           return Number(L.s).toFixed(3);
                        })()}
                      </span>
                    </td>
                  )}
                  {showDColumn && (
                    <td className="py-2 pr-4 text-center">
                      <span className="inline-block min-w-[3rem] text-center">
                        {(() => {
                           let s_val = 0;
                           if (L.s != null && L.s !== "") {
                             if (typeof L.s === 'object') {
                               s_val = Number(L.s[humidityCondition] ?? L.s.A ?? 0);
                             } else {
                               s_val = Number(L.s);
                             }
                           }
                           const D = R * s_val;
                           return D > 0 ? D.toFixed(3) : "";
                        })()}
                      </span>
                    </td>
                  )}
                  <td className="py-2 pr-4 text-center">
                    <button
                      onClick={() => removeLayer(L.id)}
                      aria-label="O'chirish"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
