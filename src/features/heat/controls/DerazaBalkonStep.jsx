// Deraza va balkon eshiklari uchun issiqlik texnik hisob bosqichi
import React, { useMemo, useState } from "react";
import { MaterialLayersTable } from "./MaterialLayersTable";
import { AirLayerControls } from "./ConstructionBlocks";
import { CustomSelect, CustomWindowSelect } from "../controls/HeatSelects";
import { WINDOWS } from "../data/windowsRo";
import { InitialDataBlock } from "./InitialDataBlock";

const DERAZA_TYPES = [
    { value: "deraza_balkon", label: "Deraza va balkon eshiklari" },
    { value: "fonarlar", label: "Fonarlar" },
];

export function DerazaBalkonStep({
    hududLabel,
    climate,
    heatingSeason,
    RoTalSG,
    RoTalED,
    RoTalDF,
    Rk,
    Ro_calc,
    RoResult,
    alphaI,
    alphaT,
    derazaType,
    setDerazaType,
    protectionLevel,
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
    // Tanlangan variantlar uchun proplar
    selectedWindowGroup,
    setSelectedWindowGroup,
    selectedWindowVariant,
    setSelectedWindowVariant,
    selectedWindowGroup2,
    setSelectedWindowGroup2,
    selectedWindowVariant2,
    setSelectedWindowVariant2,
}) {

    // 1-variant bo'yicha Ro qiymatini olish
    const windowRo = useMemo(() => {
        if (!selectedWindowGroup || !selectedWindowVariant) return null;
        const group = WINDOWS.find((w) => w.id === Number(selectedWindowGroup));
        if (!group || !Array.isArray(group.tur)) return null;
        const variant = group.tur.find((v) => v.name === selectedWindowVariant);
        return variant ? variant.Ro : null;
    }, [selectedWindowGroup, selectedWindowVariant]);

    // 2-variant bo'yicha Ro qiymatini olish
    const windowRo2 = useMemo(() => {
        if (!selectedWindowGroup2 || !selectedWindowVariant2) return null;
        const group = WINDOWS.find((w) => w.id === Number(selectedWindowGroup2));
        if (!group || !Array.isArray(group.tur)) return null;
        const variant = group.tur.find((v) => v.name === selectedWindowVariant2);
        return variant ? variant.Ro : null;
    }, [selectedWindowGroup2, selectedWindowVariant2]);

    // Tanlangan deraza/fonar turi uchun matn
    const selectedWindowLabel = useMemo(() => {
        if (!selectedWindowGroup || !selectedWindowVariant) return "";
        const group = WINDOWS.find((w) => w.id === Number(selectedWindowGroup));
        const variant = group?.tur?.find((v) => v.name === selectedWindowVariant);
        if (!group || !variant) return "";
        // Agar guruhda faqat 1ta tur bo'lsa, faqat tur nomini ko'rsatamiz
        if (group.tur.length === 1) return variant.name;
        // Aks holda: guruh - tur
        return `${group.group} — ${variant.name}`;
    }, [selectedWindowGroup, selectedWindowVariant]);

    // Ro ni avtomatik hisoblash: Ro = Rk + 1/αᵢ + 1/αₜ
    const Ro = useMemo(() => {
        if (Rk == null || !alphaI || !alphaT) return null;
        if (!Number.isFinite(Rk) || !Number.isFinite(alphaI) || !Number.isFinite(alphaT)) return null;
        if (alphaI === 0 || alphaT === 0) return null;

        return Rk + 1 / alphaI + 1 / alphaT;
    }, [Rk, alphaI, alphaT]);

    // Xatolik ro'yxatini hisoblash
    const validationErrors = useMemo(() => {
        const errors = [];
        
        // Ikkala variant ham majburiy
        if (!selectedWindowGroup || !selectedWindowVariant) {
            errors.push("1-variant: Deraza/fonar turini tanlang");
        }
        if (!selectedWindowGroup2 || !selectedWindowVariant2) {
            errors.push("2-variant: Deraza/fonar turini tanlang");
        }
        
        return errors;
    }, [selectedWindowGroup, selectedWindowVariant, selectedWindowGroup2, selectedWindowVariant2]);

    // Qaysi variant shartni bajarganini aniqlash
    const acceptedVariant = useMemo(() => {
        if (RoTalDF == null) return null;

        const variant1Passes = windowRo != null && windowRo >= RoTalDF;
        const variant2Passes = windowRo2 != null && windowRo2 >= RoTalDF;

        // Agar ikkala variant ham o'tsa, kichikroq qiymatdagisini qabul qilamiz
        if (variant1Passes && variant2Passes) {
            return windowRo <= windowRo2 ? { number: 1, Ro: windowRo } : { number: 2, Ro: windowRo2 };
        }

        // Agar faqat bitta variant o'tsa, o'shani qabul qilamiz
        if (variant1Passes) return { number: 1, Ro: windowRo };
        if (variant2Passes) return { number: 2, Ro: windowRo2 };

        // Agar hech qaysi variant o'tmasa, birinchi variantni ko'rsatamiz (xato holat uchun)
        if (windowRo != null) return { number: 1, Ro: windowRo };
        if (windowRo2 != null) return { number: 2, Ro: windowRo2 };

        return null;
    }, [windowRo, windowRo2, RoTalDF]);

    const [showInitial, setShowInitial] = useState(false);

    return (
        <div className="space-y-6">

            {/* Dastlabki malumotlar bloki */}
            <InitialDataBlock
                hududLabel={hududLabel}
                climate={climate}
                heatingSeason={heatingSeason}
                collapsible
                isOpen={showInitial}
                onToggle={() => setShowInitial((v) => !v)}
            />

            <div className="border-t border-dashed border-gray-200 my-4" />

            {/* RoTal.D.F. ko'rsatkichi */}
            {RoTalDF != null && (
                <div className="p-2">
                    <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
                        <span className="leading-snug flex-1 text-justify text-sm">
                            {derazaType === "fonarlar"
                                ? "Fonarlarning talab etilgan issiqlik uzatilishiga qarshiligi"
                                : "Deraza va balkon eshiklarining talab etilgan issiqlik uzatilishiga qarshiligi"
                            }, R
                            <sub className="align-baseline text-[0.7em]">o</sub>
                            <sup className="align-baseline text-[0.7em]">Tal.D.F.</sup>
                            {protectionLevel && (
                                <span className="text-xs text-gray-600">
                                    {" "}(issiqlik himoyasining {protectionLevel} darajasi)
                                </span>
                            )}
                        </span>
                        <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
                            {RoTalDF.toFixed(2)} m²·°C/Vt
                        </span>
                    </p>
                    <p className="text-xs text-gray-500 italic mt-1">
                        SHNQ 2.01.04-2018, Issiqlik himoyasi darajasi va D<sub className="text-[0.6em]">is.dav</sub> ga bog'liq holda jadvaldan olinadi.
                    </p>
                </div>
            )}

            {/* Deraza varianti tanlash – modal orqali*/}
            <section className="space-y-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    Yuqoridagilarni hisobga olgan holda, issiqlik himoyasining {protectionLevel || "II"} darajasini ta'minlashning ikkita varianti mavjud:
                </h3>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">1-variant</label>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-3xl">
                            <CustomWindowSelect
                                groupId={selectedWindowGroup}
                                typeName={selectedWindowVariant}
                                onSelectGroup={setSelectedWindowGroup}
                                onSelectType={setSelectedWindowVariant}
                            />
                        </div>
                        {windowRo != null && (
                            <div className="flex-shrink-0 text-sm font-semibold text-[#1080c2]">
                                R<sub className="text-[0.7em]">o</sub> = {windowRo.toFixed(2)} m²·°C/Vt
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">2-variant</label>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-3xl">
                            <CustomWindowSelect
                                groupId={selectedWindowGroup2}
                                typeName={selectedWindowVariant2}
                                onSelectGroup={setSelectedWindowGroup2}
                                onSelectType={setSelectedWindowVariant2}
                            />
                        </div>
                        {windowRo2 != null && (
                            <div className="flex-shrink-0 text-sm font-semibold text-[#1080c2]">
                                R<sub className="text-[0.7em]">o</sub> = {windowRo2.toFixed(2)} m²·°C/Vt
                            </div>
                        )}
                    </div>
                </div>
                <div className="my-8" />

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

                {/* Shart tekshiruvi - faqat xatolik yopilganda ko'rinadi */}
                {validationErrors.length === 0 && windowRo != null && windowRo2 != null && RoTalDF != null && (() => {
                    // Qaysi variant shartni bajarganini aniqlash
                    const variant1Passes = windowRo >= RoTalDF;
                    const variant2Passes = windowRo2 >= RoTalDF;
                    
                    let bestVariant = null;
                    if (variant1Passes && variant2Passes) {
                        bestVariant = windowRo <= windowRo2 ? { number: 1, Ro: windowRo } : { number: 2, Ro: windowRo2 };
                    } else if (variant1Passes) {
                        bestVariant = { number: 1, Ro: windowRo };
                    } else if (variant2Passes) {
                        bestVariant = { number: 2, Ro: windowRo2 };
                    } else {
                        // Hech qaysi variant o'tmasa, kattaroq qiymatdagisini ko'rsatamiz
                        bestVariant = windowRo >= windowRo2 ? { number: 1, Ro: windowRo } : { number: 2, Ro: windowRo2 };
                    }
                    
                    const isCompliant = bestVariant.Ro >= RoTalDF;
                    
                    return (
                        <div className="mt-8 p-4 rounded-xl border-2"
                            style={{
                                backgroundColor: isCompliant ? "#f0fdf4" : "#fef2f2",
                                borderColor: isCompliant ? "#86efac" : "#fca5a5"
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 mb-3 text-center">
                                        {isCompliant
                                            ? <>Shart {bestVariant.number} - variant uchun bajarilmoqda: R<sub className="text-[0.7em]">o</sub> = {bestVariant.Ro.toFixed(2)} ≥ R<sub className="text-[0.7em]">o</sub><sup className="text-[0.7em]">Tal.D.F.</sup> = {RoTalDF.toFixed(2)}</>
                                            : `${derazaType === "fonarlar" ? "Fonarlar" : "Deraza va balkon eshiklari"} bo'yicha issiqlik himoyasi darajasi talabi bajarilmadi.`
                                        }
                                    </p>
                                    {isCompliant && (
                                        <p className="text-xl text-gray-700 font-bold text-center text-green-700">
                                            Tanlangan variant issiqlik himoyasi talabiga muvofiq keladi!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </section>

        </div>
    );
}
