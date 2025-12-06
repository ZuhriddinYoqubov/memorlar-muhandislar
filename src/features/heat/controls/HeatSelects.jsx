import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { REGIONS } from "../data/regions";
import { WINDOWS } from "../data/windowsRo";

// Umumiy select komponenti (HeatWizard va boshqa issiqlik modullari uchun)
export function CustomSelect({ value, onChange, options = [], placeholder = "Tanlang", error = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ left: 0, top: 0, width: 0 });

  useEffect(() => {
    const onDocClick = (e) => {
      const rawTarget = e.target;
      const target = rawTarget && rawTarget.nodeType === 3 ? rawTarget.parentElement : rawTarget;
      if (target && target.closest && target.closest('[data-region-portal="true"]')) {
        return;
      }
      if (ref.current && !ref.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const updatePos = () => {
      if (!ref.current) return;
      const btn = ref.current.querySelector("button[data-trigger='select']");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      setMenuStyle({ left: r.left, top: r.bottom + 8, width: r.width });
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  const selectedLabel = options?.find((o) => o.value === value)?.label || "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`w-full text-left pl-4 pr-12 py-3 rounded-xl border cursor-pointer text-gray-900 ${
          error ? "border-red-400 bg-red-50" : "border-[#E5E7EB] bg-gray-50"
        }`}
        data-trigger="select"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{value ? selectedLabel : placeholder}</span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open &&
        createPortal(
          <div
            className="fixed z-50"
            style={{ left: menuStyle.left, top: menuStyle.top, width: menuStyle.width }}
            data-region-portal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden">
              <ul className="max-h-64 overflow-auto py-1">
                <li>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-50"
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                  >
                    {placeholder}
                  </button>
                </li>
                {options?.map((o) => (
                  <li key={o.value}>
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        value === o.value ? "bg-gray-100 text-gray-900" : "text-gray-900"
                      }`}
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                    >
                      {o.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

// Deraza/fonar turlarini (WINDOWS jadvali) tanlash uchun wrapper
export function CustomWindowSelect({ groupId, typeName, onSelectGroup, onSelectType }) {
  const selectedLabel = useMemo(() => {
    if (!groupId || !typeName) return "";
    const group = WINDOWS.find((w) => w.id === Number(groupId));
    const variant = group?.tur?.find((v) => v.name === typeName);
    if (!group || !variant) return "";
    // Agar guruhda faqat 1ta tur bo'lsa, faqat tur nomini ko'rsatamiz
    if (group.tur.length === 1) return variant.name;
    // Aks holda: guruh — tur (em dash)
    return `${group.group} — ${variant.name}`;
  }, [groupId, typeName]);

  return (
    <CustomTwoLevelSelect
      title="Deraza va fonar turlarini tanlash"
      placeholder="Deraza/Fonar turi"
      selectedLabel={selectedLabel}
      categories={WINDOWS}
      getSubItems={(group) => Array.isArray(group.tur) ? group.tur : []}
      getCategoryKey={(group) => String(group.id)}
      getCategoryLabel={(group) => {
        // Agar guruhda faqat bitta variant bo'lsa, Ro qiymatini guruh qatorida ko'rsatamiz
        const singleVariant = group.tur?.length === 1 ? group.tur[0] : null;
        return (
          <div className="flex items-center justify-between gap-3 w-full">
            <span className="flex-1">
              <span className="font-semibold mr-1">{group.id}.</span>
              {group.group}
            </span>
            {singleVariant && singleVariant.Ro != null && (
              <span className="flex-shrink-0 text-xs font-semibold text-[#1080c2]">
                R<sub className="text-[0.6em]">o</sub> = {singleVariant.Ro.toFixed(2)}
              </span>
            )}
          </div>
        );
      }}
      getSubItemKey={(item) => item.name}
      getSubItemLabel={(item, group) => {
        // Agar guruhda faqat bitta variant bo'lsa, Ro ni ko'rsatmaymiz (guruhda ko'rsatilgan)
        const showRo = group.tur?.length > 1;
        return (
          <div className="flex items-center justify-between gap-3 w-full">
            <span className="flex-1">{item.name}</span>
            {showRo && item.Ro != null && (
              <span className="flex-shrink-0 text-xs font-semibold text-[#1080c2]">
                R<sub className="text-[0.6em]">o</sub> = {item.Ro.toFixed(2)}
              </span>
            )}
          </div>
        );
      }}
      onSelect={(group, item) => {
        onSelectGroup && onSelectGroup(String(group.id));
        onSelectType && onSelectType(item.name);
      }}
      useExpandCollapse={true}
    />
  );
}

// REGIONS dan tumanlar ro'yxatini hosil qilish uchun yordamchi funksiya
function getDistricts(provinceName) {
  const prov = (REGIONS || []).find((p) => p?.viloyat === provinceName);
  const list = prov?.hududlar || [];
  return list.map((h, idx) => {
    const t092 = h?.eng_sov_davr_harorat?.["yillik_taminot_b"]?.["0,92"];
    const t5 = h?.eng_sov_davr_harorat?.["yillik_taminot_5_kunlik"];
    return {
      id: String(idx),
      label: h?.hudud || "",
      t_out: typeof t092 === "number" ? t092 : typeof t5 === "number" ? t5 : undefined,
    };
  });
}

// Universal ikki darajali tanlash komponenti (hudud, material, window uchun)
export function CustomTwoLevelSelect({
  title = "Tanlash",
  placeholder = "Tanlang",
  selectedLabel = "",
  categories = [],
  getSubItems = () => [],
  getCategoryKey = (cat) => cat.id || cat.name,
  getCategoryLabel = (cat) => cat.name || cat.label,
  getSubItemKey = (item) => item.id || item.name,
  getSubItemLabel = (item) => item.name || item.label,
  onSelect = () => {},
  error = false,
  useExpandCollapse = false, // hudud uchun true, window/material uchun false
}) {
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <>
      <button
        type="button"
        className={`w-full text-left pl-4 pr-12 py-3 rounded-xl border cursor-pointer text-gray-900 relative ${
          error ? "border-red-400 bg-red-50" : "border-[#E5E7EB] bg-gray-50"
        }`}
        onClick={() => setOpen(true)}
      >
        <span className={selectedLabel ? "text-gray-900" : "text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 h-[560px] max-h-[90vh] flex flex-col" data-region-portal="true">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                  aria-label="Yopish"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                {useExpandCollapse ? (
                  // Hudud usuli: expand/collapse
                  <ul className="py-3 text-sm text-gray-800">
                    {categories.map((cat, idx) => {
                      const catKey = getCategoryKey(cat);
                      const isExpanded = expandedCategory === catKey;
                      const subItems = getSubItems(cat);
                      const hasOnlyOne = subItems.length === 1;
                      
                      return (
                        <li key={catKey || idx} className="mb-1">
                          <button
                            type="button"
                            onClick={() => {
                              // Agar faqat 1ta sub-item bo'lsa, avtomatik tanlash
                              if (hasOnlyOne) {
                                onSelect(cat, subItems[0]);
                                setOpen(false);
                              } else {
                                setExpandedCategory(isExpanded ? null : catKey);
                              }
                            }}
                            className={`w-full text-left px-4 py-1.5 rounded-md ${
                              isExpanded
                                ? "bg-[#1080c2]/10 text-[#1080c2] font-semibold"
                                : "hover:bg-gray-50 text-gray-800"
                            }`}
                          >
                            {getCategoryLabel(cat)}
                          </button>

                          {isExpanded && !hasOnlyOne && (
                            <ul className="mt-1 ml-4 border-l border-gray-200 pl-3">
                              {subItems.map((item, subIdx) => (
                                <li key={getSubItemKey(item) || subIdx} className="mb-1">
                                  <button
                                    type="button"
                                    className="w-full text-left px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-800 text-sm"
                                    onClick={() => {
                                      onSelect(cat, item);
                                      setOpen(false);
                                    }}
                                  >
                                    {getSubItemLabel(item, cat)}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  // Window/Material usuli: ikki ustun
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3 text-sm text-gray-800">
                    {/* Chap ustun */}
                    <div className="space-y-2 border-r border-gray-200 pr-0 md:pr-4">
                      <p className="font-semibold mb-1">Guruh</p>
                      <div className="space-y-1 max-h-full overflow-y-auto">
                        {categories.map((cat, idx) => {
                          const catKey = getCategoryKey(cat);
                          const isActive = selectedCategory === catKey;
                          return (
                            <button
                              key={catKey || idx}
                              type="button"
                              onClick={() => setSelectedCategory(catKey)}
                              className={
                                "w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm border " +
                                (isActive
                                  ? "border-[#1080c2] bg-[#1080c2]/10 text-[#1080c2] font-semibold"
                                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50")
                              }
                            >
                              {getCategoryLabel(cat)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* O'ng ustun */}
                    <div className="space-y-2">
                      <p className="font-semibold mb-1">Tur</p>
                      {selectedCategory ? (
                        <div className="space-y-1 max-h-full overflow-y-auto">
                          {(() => {
                            const cat = categories.find((c) => getCategoryKey(c) === selectedCategory);
                            if (!cat) return null;
                            return getSubItems(cat).map((item, subIdx) => (
                              <button
                                key={getSubItemKey(item) || subIdx}
                                type="button"
                                onClick={() => {
                                  onSelect(cat, item);
                                  setOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                              >
                                {getSubItemLabel(item, cat)}
                              </button>
                            ));
                          })()}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Avval guruhni tanlang.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

// Hudud tanlash uchun wrapper
export function CustomRegionSelect({ province, regionId, onSelectProvince, onSelectDistrict, error = false }) {
  const selectedLabel = useMemo(() => {
    if (!province || !regionId) return "";
    const dists = getDistricts(province);
    const d = dists.find((x) => x.id === regionId);
    return d ? `${province} — ${d.label}` : "";
  }, [province, regionId]);

  return (
    <CustomTwoLevelSelect
      title="Hudud tanlash"
      placeholder="Hudud"
      selectedLabel={selectedLabel}
      categories={REGIONS || []}
      getSubItems={(prov) => getDistricts(prov.viloyat)}
      getCategoryKey={(prov) => prov.viloyat}
      getCategoryLabel={(prov) => prov.viloyat}
      getSubItemKey={(dist) => dist.id}
      getSubItemLabel={(dist) => dist.label}
      onSelect={(prov, dist) => {
        onSelectProvince && onSelectProvince(prov.viloyat);
        onSelectDistrict && onSelectDistrict(String(dist.id), dist.t_out);
      }}
      error={error}
      useExpandCollapse={true}
    />
  );
}
