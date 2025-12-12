// Bino parametrlari bosqichi
import React, { useMemo } from "react";
import { BuildingParameterInput } from "./BuildingParameterInput";
import { FieldHelp } from "./FieldHelp";
import { CustomSelect } from "./HeatSelects";
import { exportNormativeStepPdf } from "../utils/exportHeatPdf";

const OBJECT_TYPES = [
    { value: "turar_joylar", label: "Turar joylar" },
    { value: "yakka_turjoy", label: "Yakka tartibdagi turar joylar" },
    { value: "maktabgacha", label: "Maktabgacha taʼlim tashkilotlari" },
    { value: "umumtalim_maktablar", label: "Umumtaʼlim va ixtisoslashtirilgan maktablar" },
    { value: "akademik_litsey", label: "Akademik litsey va professional taʼlim binolari" },
    { value: "soglomni_saqlash", label: "Sogʻliqni saqlash va tibbiy-ijtimoiy muassasalar" },
    { value: "poliklinika", label: "Poliklinika, dispanser va ambulatoriyalar" },
    { value: "konsert_zallari", label: "Konsert zallari, teatrlar" },
    { value: "ijodiy_uy", label: "Boʻsh vaqtni oʻtkazish va ijod uylari (ijodiyot markazlari, internet-studiyalar va boshqalar)" },
    { value: "loyiha_tashkilot", label: "Loyiha va konstruktorlik tashkilotlari" },
    { value: "savdo_majmualari", label: "Savdo majmualari" },
    { value: "umumiy_ovqatlanish", label: "Umumiy ovqatlanish shoxobchalari" },
    { value: "maishiy_xizmat", label: "Maishiy xizmat koʻrsatish korxonalari" },
    { value: "sport_soglomlashtirish", label: "Sport-sogʻlomlashtirish majmualari, bir qavatli" },
    { value: "dam_olish", label: "Dam olish va turizm muassasalarining yotoq korpuslari binolari" },
    { value: "sanatoriyalar", label: "Sanatoriyalar" },
    { value: "boshqalar", label: "Boshqalar" },
];

// Orayopma turlari va ularning nomlari
const ORAYOPMA_TYPES = {
    tomyopma: { label: "Tomyopma", subscript: "R", fieldKey: "A_tomyopma" },
    ochiq_chortoq: { label: "Chordoq usti (Ochiq chordoq)", subscript: "R.och", fieldKey: "A_ochiq_chortoq" },
    chordoq_orayopma: { label: "Chordoq orayopmasi", subscript: "R.ch", fieldKey: "A_chordoq_orayopma" },
};

export function BuildingParametersStep({
    objectName,
    climate,
    heatingSeason,
    layers,
    onExportPDF,
    buildingParams = {},
    setBuildingParams,
    clearTempDefaults,
    heatSteps = []
}) {
    // State'larni propsdan olish
    const objectType = buildingParams.objectType || "";
    const P_m = buildingParams.P_m || "";
    const H_m = buildingParams.H_m || "";
    const floors = buildingParams.floors || "";
    const A_f = buildingParams.A_f || "";
    const A_mc1 = buildingParams.A_mc1 || "";
    const V_h = buildingParams.V_h || "";
    const weeklyHours = buildingParams.weeklyHours || "";
    const Xodim = buildingParams.Xodim || "";
    // roofType endi ishlatilmaydi - dinamik ravishda heatSteps dan olinadi
    const A_W = buildingParams.A_W || "";
    const A_L = buildingParams.A_L || "";
    const A_L2 = buildingParams.A_L2 || ""; // Fonarlar maydoni
    const A_D = buildingParams.A_D || "";
    const A_CG = buildingParams.A_CG || "";
    // A_G endi alohida orayopmalar uchun dinamik - buildingParams.orayopmaAreas dan olinadi
    const A_R = buildingParams.A_R || "";

    // State update funksiyalari
    const updateBuildingParam = (field, value) => {
        if (setBuildingParams) {
            setBuildingParams(prev => ({ ...prev, [field]: value }));
        }
    };

    // Tashqi devorlarning maydoni (deraza va tashqi eshiklar maydonini hisobga olmaganda)
    const A_W_net = useMemo(() => {
        const fas = Number(A_W) || 0; // A_Fas
        const AL = Number(A_L) || 0;
        const AD = Number(A_D) || 0;
        return fas - AL - AD;
    }, [A_W, A_L, A_D]);

    // HeatSteps dan bajarilgan orayopma turlarini aniqlash
    const completedOrayopmaTypes = useMemo(() => {
        const types = [];
        heatSteps.forEach(step => {
            const ct = step.presetConstructionType || step.savedState?.constructionType;
            if (ct === "tomyopma") {
                types.push("tomyopma");
            } else if (ct === "ochiq_chordoq") {
                types.push("ochiq_chortoq");
            } else if (ct === "chordoq_orayopma") {
                types.push("chordoq_orayopma");
            }
        });
        return [...new Set(types)]; // Takrorlanishlarni olib tashlash
    }, [heatSteps]);

    // Fonarlar ITH ishlangan bo'lsa
    const hasFonar = useMemo(() => {
        return heatSteps.some(step => {
            const ct = step.presetConstructionType || step.savedState?.constructionType;
            return ct === "fonarlar";
        });
    }, [heatSteps]);

    // Orayopma maydonlari (dinamik)
    const orayopmaAreas = buildingParams.orayopmaAreas || {};

    // ΣA_G = A_CG + barcha orayopma maydonlari yig'indisi
    const sumA_G = useMemo(() => {
        const cg = Number(A_CG) || 0;
        let totalOrayopma = 0;
        Object.values(orayopmaAreas).forEach(val => {
            totalOrayopma += Number(val) || 0;
        });
        return cg + totalOrayopma;
    }, [A_CG, orayopmaAreas]);

    // Orayopma maydonini yangilash
    const updateOrayopmaArea = (fieldKey, value) => {
        if (setBuildingParams) {
            setBuildingParams(prev => ({
                ...prev,
                orayopmaAreas: {
                    ...prev.orayopmaAreas,
                    [fieldKey]: value
                }
            }));
        }
    };

    // Validatsiya funksiyalari
    const validateFloat = (value) => {
        if (value === "" || value === null || value === undefined) return "";
        // Vergulni nuqtaga almashtirish
        const normalizedValue = value.replace(',', '.');
        const num = parseFloat(normalizedValue);
        if (isNaN(num)) return "";
        // O'z qiymatini qaytarish, vergul va nuqta bilan
        return normalizedValue;
    };

    const validateInt = (value) => {
        if (value === "" || value === null || value === undefined) return "";
        const num = parseInt(value);
        if (isNaN(num)) return "";
        return num.toString();
    };

    // Obekt toifasiga qarab A_mc1 va weeklyHours ko'rsatish
    const isResidential = objectType === "turar_joylar" || objectType === "yakka_turjoy";
    const showWeeklyHours = !isResidential;

    return (
        <div className="space-y-6">
            {/* Vaqtinchalik defaultlarni tozalash tugmasi */}
            {clearTempDefaults && (
                <div className="flex justify-end">
                    <button
                        onClick={clearTempDefaults}
                        className="text-xs text-gray-500 hover:text-red-600 transition-colors underline"
                        title="Vaqtinchalik defaultlarni tozalash"
                    >
                        Vaqtinchalik defaultlarni tozalash
                    </button>
                </div>
            )}

            {/* Obekt toifasi */}
            <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900">Obekt toifasi</h2>
                
                <div className="rounded-xl border border-[#E5E7EB]">
                    <div className="p-4">
                        <CustomSelect
                            value={objectType}
                            onChange={(value) => updateBuildingParam('objectType', value)}
                            options={OBJECT_TYPES}
                            placeholder="Obekt toifasini tanlang"
                        />
                    </div>
                </div>
            </section>

            {/* Obekt ma'lumotlar */}
            <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900">Obekt ma'lumotlari</h2>
                
                <div className="rounded-xl border border-[#E5E7EB]">
                    <table className="w-full text-xs md:text-sm">
                        <thead>
                            <tr className="text-gray-600 bg-gray-50">
                                <th className="py-2 px-3 text-left w-2/3">Ko'rsatkich</th>
                                <th className="py-2 px-3 text-center w-1/3">Qiymat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Bino perimetri */}
                            <BuildingParameterInput
                                label="Bino perimetri, P"
                                value={P_m}
                                onChange={(e) => updateBuildingParam('P_m', validateFloat(e.target.value))}
                                unit="m"
                            />
                            
                            {/* Balandligi */}
                            <BuildingParameterInput
                                label="Balandligi, H"
                                value={H_m}
                                onChange={(e) => updateBuildingParam('H_m', validateFloat(e.target.value))}
                                unit="m"
                            />
                            
                            {/* Qavatlilik */}
                            <BuildingParameterInput
                                label="Qavatlilik"
                                value={floors}
                                onChange={(e) => updateBuildingParam('floors', validateInt(e.target.value))}
                                unit="qavat"
                                inputMode="numeric"
                            />
                            
                            {/* Bino umumiy maydoni */}
                            <BuildingParameterInput
                                label="Bino umumiy maydoni, A"
                                subscript="f"
                                value={A_f}
                                onChange={(e) => updateBuildingParam('A_f', validateFloat(e.target.value))}
                                unit="m²"
                            />

                            {/* A_mc.1 - turar joy yoki jamoat binosiga qarab */}
                            {objectType && (
                                <BuildingParameterInput
                                    label={isResidential ? "Xonalar va oshxonalar jami maydoni, A" : "Orgtexnikali xonalarning jami maydoni, A"}
                                    subscript="mc.1"
                                    value={A_mc1}
                                    onChange={(e) => updateBuildingParam('A_mc1', validateFloat(e.target.value))}
                                    unit="m²"
                                />
                            )}

                            {/* Jamoat binosi ish soatlari - faqat turar joy bo'lmaganlar uchun */}
                            {showWeeklyHours && objectType && (
                                <BuildingParameterInput
                                    label="Jamoat binosi ish soatlarining bir haftalik hisobiy soni"
                                    value={weeklyHours}
                                    onChange={(e) => updateBuildingParam('weeklyHours', validateInt(e.target.value))}
                                    unit="s/h"
                                    inputMode="numeric"
                                />
                            )}
                            
                            {/* Binoning hisobiy quvvati */}
                            <BuildingParameterInput
                                label="Binoning hisobiy quvvati"
                                value={Xodim}
                                onChange={(e) => updateBuildingParam('Xodim', validateInt(e.target.value))}
                                unit="kishi"
                                placeholder="0"
                                inputMode="numeric"
                            />
                            
                            {/* Tomyopma turi - dinamik ravishda heatSteps dan olinadi */}
                            {completedOrayopmaTypes.length > 0 && (
                                <tr className="border-t border-[#E5E7EB] h-[45px]">
                                    <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                        Tomyopma turi
                                    </td>
                                    <td className="py-2 px-3 text-right text-sm text-gray-900">
                                        {completedOrayopmaTypes.map(type => ORAYOPMA_TYPES[type]?.label || type).join(", ")}
                                    </td>
                                </tr>
                            )}

                            {/* A_Fas */}
                            <BuildingParameterInput
                                label="Fasad maydoni, A"
                                subscript="Fas"
                                value={A_W}
                                onChange={(e) => updateBuildingParam('A_W', validateFloat(e.target.value))}
                                unit="m²"
                            />

                            {/* A_W (net) */}
                            <BuildingParameterInput
                                label="Tashqi devorlarning maydoni (deraza va tashqi eshiklar maydonini hisobga olmaganda), A"
                                subscript="W"
                                value={A_W_net}
                                isReadOnly={true}
                                unit="m²"
                            />

                            {/* A_L */}
                            <BuildingParameterInput
                                label="Derazalar va vitrinalar maydoni, A"
                                subscript="L"
                                value={A_L}
                                onChange={(e) => updateBuildingParam('A_L', validateFloat(e.target.value))}
                                unit="m²"
                            />

                            {/* A_L2 - faqat fonar ITH ishlangan bo'lsa */}
                            {hasFonar && (
                                <BuildingParameterInput
                                    label="Fonarlar maydoni, A"
                                    subscript="L2"
                                    value={A_L2}
                                    onChange={(e) => updateBuildingParam('A_L2', validateFloat(e.target.value))}
                                    unit="m²"
                                />
                            )}

                            {/* A_D */}
                            <BuildingParameterInput
                                label="Eshiklar maydoni, A"
                                subscript="D"
                                value={A_D}
                                onChange={(e) => updateBuildingParam('A_D', validateFloat(e.target.value))}
                                unit="m²"
                            />

                            {/* A_CG */}
                            <BuildingParameterInput
                                label="Yerdagi pol hamda yer sathidan pastdagi devorlar maydoni, A"
                                subscript="CG"
                                value={A_CG}
                                onChange={(e) => updateBuildingParam('A_CG', validateFloat(e.target.value))}
                                unit="m²"
                            />

                            {/* Dinamik orayopma maydonlari - har bir bajarilgan orayopma turi uchun */}
                            {completedOrayopmaTypes.map(type => {
                                const config = ORAYOPMA_TYPES[type];
                                if (!config) return null;
                                return (
                                    <BuildingParameterInput
                                        key={type}
                                        label={`${config.label} maydoni, A`}
                                        subscript={config.subscript}
                                        value={orayopmaAreas[config.fieldKey] || ""}
                                        onChange={(e) => updateOrayopmaArea(config.fieldKey, validateFloat(e.target.value))}
                                        unit="m²"
                                    />
                                );
                            })}

                            {/* ΣA_G - faqat orayopma maydonlari bo'lsa ko'rsatiladi */}
                            {completedOrayopmaTypes.length > 0 && (
                                <BuildingParameterInput
                                    label="Jami orayopma maydoni, ΣA"
                                    subscript="R"
                                    value={sumA_G}
                                    isReadOnly={true}
                                    unit="m²"
                                />
                            )}

                            {/* V_h */}
                            <BuildingParameterInput
                                label="Binoning isitiladigan hajmi, V"
                                subscript="h"
                                value={V_h}
                                onChange={(e) => updateBuildingParam('V_h', validateFloat(e.target.value))}
                                unit="m³"
                                helpText="Tashqi devorlar ichki yuzasi va pastki qavat polidan yuqori qavat shiftigacha bo'lgan hajm hisoblanadi."
                            />
                        </tbody>
                    </table>
                </div>
            </section>

            {/* PDF eksport tugmasi */}
            <div className="flex justify-end pt-6">
                <button
                    onClick={onExportPDF}
                    className="px-6 py-2 bg-[#1080c2] text-white rounded-lg hover:bg-[#0d6bb5] transition-colors text-sm font-medium"
                >
                    PDF eksport
                </button>
            </div>
        </div>
    );
}
