import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { REGIONS } from "../data/regions";

// Umumiy select komponenti (HeatWizard va boshqa issiqlik modullari uchun)
export function CustomSelect({ value, onChange, options, placeholder = "Tanlang", error = false }) {
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

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

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
                {options.map((o) => (
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

// Hudud (viloyat + tuman) tanlash uchun umumiy komponent
export function CustomRegionSelect({ province, regionId, onSelectProvince, onSelectDistrict, error = false }) {
  const [open, setOpen] = useState(false);
  const [expandedProvince, setExpandedProvince] = useState(null);

  const selectedLabel = useMemo(() => {
    if (!province || !regionId) return "Hudud";
    const dists = getDistricts(province);
    const d = dists.find((x) => x.id === regionId);
    return d ? `${province} — ${d.label}` : "Hudud";
  }, [province, regionId]);

  return (
    <>
      <button
        type="button"
        className={`w-full text-left pl-4 pr-12 py-3 rounded-xl border cursor-pointer text-gray-900 relative ${
          error ? "border-red-400 bg-red-50" : "border-[#E5E7EB] bg-gray-50"
        }`}
        onClick={() => setOpen(true)}
      >
        <span className={regionId ? "text-gray-900" : "text-gray-400"}>{selectedLabel}</span>
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
                <h2 className="text-lg font-semibold text-gray-900">Hudud tanlash</h2>
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
                <ul className="py-3 text-sm text-gray-800">
                  {(REGIONS || []).map((p, pi) => (
                    <li key={p.viloyat || pi} className="mb-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (expandedProvince === p.viloyat) {
                            setExpandedProvince(null);
                          } else {
                            setExpandedProvince(p.viloyat);
                          }
                        }}
                        className={`w-full text-left px-4 py-1.5 rounded-md ${
                          expandedProvince === p.viloyat
                            ? "bg-[#1080c2]/10 text-[#1080c2] font-semibold"
                            : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        {p.viloyat}
                      </button>

                      {expandedProvince === p.viloyat && (p.hududlar || []).length > 0 && (
                        <ul className="mt-1 ml-4 border-l border-gray-200 pl-3">
                          {(p.hududlar || []).map((h, idx) => {
                            const dists = getDistricts(p.viloyat);
                            const d = dists[idx];
                            return (
                              <li key={h.hudud || idx} className="mb-1">
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-800 text-sm"
                                  onClick={() => {
                                    onSelectProvince && onSelectProvince(p.viloyat);
                                    onSelectDistrict && onSelectDistrict(String(d.id), d.t_out);
                                    setOpen(false);
                                  }}
                                >
                                  {h.hudud}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
