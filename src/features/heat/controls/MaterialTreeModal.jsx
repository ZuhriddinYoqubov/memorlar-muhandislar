import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MATERIALS } from "../data/materials";

export function MaterialTreeModal({ open, onClose, onApply }) {
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(null);

  const groups = MATERIALS || [];
  const activeGroup =
    selectedGroupIdx != null && selectedGroupIdx >= 0 && selectedGroupIdx < groups.length
      ? groups[selectedGroupIdx] || {}
      : {};
  const classes = activeGroup.classes || [];
  const activeClass =
    selectedClassIdx != null && selectedClassIdx >= 0 && selectedClassIdx < classes.length
      ? classes[selectedClassIdx] || {}
      : {};
  const materials = activeClass.materials || [];

  const activeMaterial = useMemo(() => {
    if (!selectedMaterialId) return null;
    return materials.find((m) => (m.id || m.name || m.material_name) === selectedMaterialId) || null;
  }, [materials, selectedMaterialId]);

  const variants = activeMaterial?.variants || [];
  const activeVariant = selectedVariantIdx != null ? variants[Number(selectedVariantIdx)] : null;

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 h-[560px] max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Material tanlash</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Yopish"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <ul className="py-3 text-sm text-gray-800">
            {groups.map((g, gi) => (
              <li key={g.group_id || gi} className="mb-1">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedGroupIdx === gi) {
                      setSelectedGroupIdx(null);
                      setSelectedClassIdx(null);
                      setSelectedMaterialId(null);
                      setSelectedVariantIdx(null);
                    } else {
                      setSelectedGroupIdx(gi);
                      setSelectedClassIdx(0);
                      setSelectedMaterialId(null);
                      setSelectedVariantIdx(null);
                    }
                  }}
                  className={`w-full text-left px-4 py-1.5 rounded-md ${
                    gi === selectedGroupIdx ? "bg-[#1080c2]/10 text-[#1080c2] font-semibold" : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  {g.group_name || "Guruh"}
                </button>

                {gi === selectedGroupIdx && (classes || []).length > 0 && (
                  <ul className="mt-1 ml-4 border-l border-gray-200 pl-3">
                    {(classes || []).map((cls, ci) => (
                      <li key={cls.class_id || ci} className="mb-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedClassIdx === ci) {
                              setSelectedClassIdx(null);
                              setSelectedMaterialId(null);
                              setSelectedVariantIdx(null);
                            } else {
                              setSelectedClassIdx(ci);
                              setSelectedMaterialId(null);
                              setSelectedVariantIdx(null);
                            }
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-md ${
                            ci === selectedClassIdx ? "bg-[#1080c2]/5 text-[#1080c2]" : "hover:bg-gray-50 text-gray-800"
                          }`}
                        >
                          {cls.class_name || "Sinf"}
                        </button>

                        {ci === selectedClassIdx && (materials || []).length > 0 && (
                          <ul className="mt-1 ml-4 border-l border-dashed border-gray-200 pl-3">
                            {(activeClass.materials || []).map((m, mi) => {
                              const matId = m.id || m.name || m.material_name || String(mi);
                              const matVariants = m.variants || [];

                              if (!matVariants.length) {
                                const isSelected = selectedMaterialId === matId && selectedVariantIdx == null;
                                return (
                                  <li key={matId} className="mb-0.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedMaterialId(matId);
                                        setSelectedVariantIdx(null);
                                      }}
                                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs ${
                                        isSelected ? "bg-[#1080c2]/10 text-[#1080c2]" : "hover:bg-gray-50 text-gray-800"
                                      }`}
                                    >
                                      {m.name || m.material_name || "Material"}
                                    </button>
                                  </li>
                                );
                              }

                              return matVariants.map((v, vi) => {
                                const isSelected = selectedMaterialId === matId && String(selectedVariantIdx) === String(vi);
                                const labelBase = m.name || m.material_name || "Material";
                                const dens = v.density || v.zichlik;
                                const label = dens ? `${labelBase} (${dens} kg/m³)` : labelBase;
                                return (
                                  <li key={`${matId}-${vi}`} className="mb-0.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedMaterialId(matId);
                                        setSelectedVariantIdx(String(vi));
                                      }}
                                      onDoubleClick={() => {
                                        const variantIndex = String(vi);
                                        const payload = {
                                          material: m,
                                          materialId: matId,
                                          variantIdx: variantIndex,
                                          variant: v,
                                        };
                                        onApply && onApply(payload);
                                        onClose && onClose();
                                      }}
                                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs ${
                                        isSelected ? "bg-[#1080c2]/10 text-[#1080c2]" : "hover:bg-gray-50 text-gray-800"
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  </li>
                                );
                              });
                            })}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            disabled={!activeMaterial || (variants.length > 1 && selectedVariantIdx == null)}
            onClick={() => {
              if (!activeMaterial) return;
              let variantIndex = selectedVariantIdx;
              if (variants.length === 1 && variantIndex == null) variantIndex = 0;
              const v = variants.length ? variants[Number(variantIndex)] : null;
              onApply && onApply({
                material: activeMaterial,
                materialId: activeMaterial.id || activeMaterial.name || activeMaterial.material_name,
                variantIdx: variants.length ? String(variantIndex) : null,
                variant: v,
              });
              onClose && onClose();
            }}
            className="px-4 py-2 rounded-lg text-sm text-white bg-[#1080c2] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Tanlash
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
