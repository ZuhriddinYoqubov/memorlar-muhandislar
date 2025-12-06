// Bino parametrlari bosqichi
import React, { useMemo } from "react";
import { BuildingParameterInput } from "./BuildingParameterInput";
import { FieldHelp } from "./FieldHelp";
import { CustomSelect } from "./HeatSelects";
import { exportNormativeStepPdf } from "../utils/exportHeatPdf";

const ROOF_TYPES = [
    { value: "tomyopma", label: "Tomyopma" },
    { value: "ochiq_chortoq", label: "Ochiq chordoq" },
    { value: "chortoq_orayopmasi", label: "Chordoq orayopmasi" },
];

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

export function BuildingParametersStep({
    objectName,
    climate,
    heatingSeason,
    layers,
    onExportPDF,
    buildingParams = {},
    setBuildingParams,
    clearTempDefaults
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
    const roofType = buildingParams.roofType || "";
    const A_W = buildingParams.A_W || "";
    const A_L = buildingParams.A_L || "";
    const A_D = buildingParams.A_D || "";
    const A_CG = buildingParams.A_CG || "";
    const A_G = buildingParams.A_G || "";
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

    // ΣA_G = A_CG + A_G
    const sumA_G = useMemo(() => {
        const cg = Number(A_CG) || 0;
        const g = Number(A_G) || 0;
        return cg + g;
    }, [A_CG, A_G]);

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
                            
                            {/* Tomyopma turi */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Tomyopma turi
                                </td>
                                <td className="py-2 px-3">
                                    <div className="w-[60%] ml-auto">
                                        <CustomSelect
                                            value={roofType}
                                            onChange={(value) => updateBuildingParam('roofType', value)}
                                            options={ROOF_TYPES}
                                            placeholder="Tanlang"
                                        />
                                    </div>
                                </td>
                            </tr>

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

                            {/* A_G */}
                            <BuildingParameterInput
                                label="Isitilmaydigan yerto'la ustidagi pol maydoni, A"
                                subscript="G"
                                value={A_G}
                                onChange={(e) => updateBuildingParam('A_G', validateFloat(e.target.value))}
                                unit="m²"
                            />

                            {/* ΣA_G */}
                            <BuildingParameterInput
                                label="Jami pol maydoni, ΣA"
                                subscript="G"
                                value={sumA_G}
                                isReadOnly={true}
                                unit="m²"
                            />

                            {/* A_R */}
                            <BuildingParameterInput
                                label="Tomyopmalar (yoki chordoq orayopmalari)ning jami maydoni, A"
                                subscript="R"
                                value={A_R}
                                onChange={(e) => updateBuildingParam('A_R', validateFloat(e.target.value))}
                                unit="m²"
                            />

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
