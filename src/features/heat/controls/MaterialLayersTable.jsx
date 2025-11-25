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
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        To'suvchi konstruksiya materiallarining xususiyatlari
      </h2>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="text-gray-600 bg-gray-50">
              <th className="py-2 px-3 text-center">#</th>
              <th className="py-2 px-3 text-left w-4/5">
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
                  <span>
                    Qalinlik <span className="text-[#1080c2]">δ</span>
                  </span>
                  <br />
                  <span>mm</span>
                </div>
              </th>
              <th className="py-2 px-2 text-center leading-tight">
                <div>
                  Zichlik <span className="text-[#1080c2]">
                    γ
                  </span>
                  <sub className="align-baseline text-[0.7em] text-[#1080c2]">0</sub>, kg/m³
                </div>
              </th>
              <th className="py-2 px-3 text-center leading-tight">
                <div>
                  Issiqlik o'tk.lik <span className="text-[#1080c2]">
                    λ
                  </span>
                </div>
              </th>
              <th className="py-2 px-2 text-center leading-tight">
                <div>
                  Termik qarshilik <span className="text-[#1080c2]">R</span>
                </div>
              </th>
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
                      className="w-28 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-right"
                    />
                  </td>
                  <td className="py-2 pr-4 text-center">
                    <span className="inline-block min-w-[4.5rem] text-center">
                      {L.rho != null && L.rho !== "" ? Number(L.rho) : ""}
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
                  <td className="py-2 pr-4 text-center">
                    <button
                      onClick={() => removeLayer(L.id)}
                      aria-label="O'chirish"
                      className="p-2 rounded-lg border text-red-600 border-red-300 hover:bg-red-50 inline-flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
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
