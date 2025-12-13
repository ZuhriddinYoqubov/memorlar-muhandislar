// Isitishga me'yoriy solishtirma issiqlik sarfi bosqichi
import React, { useState, useMemo } from "react";
import { CustomSelect } from "./HeatSelects";
import { FieldHelp } from "./FieldHelp";

const ROOF_TYPES = [
    { value: "tomyopma", label: "Tomyopma" },
    { value: "ochiq_chortoq", label: "Ochiq chordoq" },
    { value: "chortoq_orayopmasi", label: "Chordoq orayopmasi" },
];

export function NormativeQStep({
    objectName,
    climate,
    heatingSeason,
    layers,
    onExportPDF
}) {
    // Dastlabki ma'lumotlar - bino geometriyasi
    const [P_m, setP_m] = useState(""); // Bino perimetri, m
    const [H_m, setH_m] = useState(""); // Balandligi, m
    const [A_f, setA_f] = useState(""); // Bino umumiy maydoni, m²
    const [V_h, setV_h] = useState(""); // Binoning isitiladigan hajmi, V_h, m³

    // Boshqa parametrlar
    const [Xodim, setXodim] = useState(""); // Bino hisobiy quvvati, kishi

    // Tomyopma turi
    const [roofType, setRoofType] = useState(""); // Tomyopma turi

    // Bino to'suvchi konstruksiyalari orqali me'yoriy issiqlik yo'qotishlarini aniqlash hisobi
    const [A_W, setA_W] = useState(""); // Tashqi devorlarning maydoni, A_Fas, m²
    const [A_L, setA_L] = useState(""); // Derazalar va vitrinalar maydoni, m²
    const [A_D, setA_D] = useState(""); // Eshiklar maydoni, m²
    const [A_CG, setA_CG] = useState(""); // Yerdagi pol hamda yer sathidan pastdagi devorlar maydoni, A_CG, m²
    const [A_G, setA_G] = useState(""); // Isitilmaydigan yerto'la ustidagi pol maydoni, A_G, m²
    const [A_R, setA_R] = useState(""); // Tomyopmalar (yoki chortoq orayopmalari)ning jami maydoni, A_R, m²

    // Harorat parametrlari - avtomatik tortiladi
    const t_i = climate?.t_in || 0;
    const t_e = climate?.t_out || 0;

    // Gradussutka hisoblash: D_d = (t_i - t_is.dav) × Z_is.dav
    const D_d = useMemo(() => {
        const t_is_dav = heatingSeason?.t_is_dav || 0;
        const Z_is_dav = heatingSeason?.Z_is_dav || 0;
        if (!t_i || !t_is_dav || !Z_is_dav) return 0;
        return (t_i - t_is_dav) * Z_is_dav;
    }, [t_i, heatingSeason]);

    // Tashqi devor - eng qalin qatlam
    const thickestLayer = useMemo(() => {
        if (!layers || layers.length === 0) return null;
        return layers.reduce((max, layer) => {
            const thickness = Number(layer.thickness_mm) || 0;
            const maxThickness = Number(max?.thickness_mm) || 0;
            return thickness > maxThickness ? layer : max;
        }, layers[0]);
    }, [layers]);

    // Izolyatsiya - eng ko'p izolyatsiya qilayotgan qatlam (eng kichik lambda)
    const bestInsulationLayer = useMemo(() => {
        if (!layers || layers.length === 0) return null;
        return layers.reduce((best, layer) => {
            const lambda = Number(layer.lambda) || Infinity;
            const bestLambda = Number(best?.lambda) || Infinity;
            return lambda < bestLambda ? layer : best;
        }, layers[0]);
    }, [layers]);

    // Tashqi devorlarning maydoni (deraza va tashqi eshiklar maydonini hisobga olmaganda)
    const A_W_net = useMemo(() => {
        const fas = Number(A_W) || 0; // A_Fas
        const AL = Number(A_L) || 0;
        const AD = Number(A_D) || 0;
        return fas - AL - AD;
    }, [A_W, A_L, A_D]);

    // ΣA_G = A_GC + A_G
    const sumA_G = useMemo(() => {
        const gc = Number(A_CG) || 0;
        const g = Number(A_G) || 0;
        return gc + g;
    }, [A_CG, A_G]);

    return (
        <div className="space-y-6">
            {/* Kirish ma'lumotlari */}
            <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900">Dastlabki ma'lumotlar</h2>
                
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
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Bino perimetri, P
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={P_m}
                                            onChange={(e) => setP_m(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m</span>
                                    </div>
                                </td>
                            </tr>
                            
                            {/* Balandligi */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Balandligi, H
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={H_m}
                                            onChange={(e) => setH_m(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m</span>
                                    </div>
                                </td>
                            </tr>
                            
                            {/* Bino umumiy maydoni */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Bino umumiy maydoni, A<sub className="text-[0.7em]">f</sub>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={A_f}
                                            onChange={(e) => setA_f(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </td>
                            </tr>
                            
                            {/* Binoning hisobiy quvvati */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Binoning hisobiy quvvati
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={Xodim}
                                            onChange={(e) => setXodim(e.target.value)}
                                            className="w-full px-3 py-2 pr-16 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">kishi</span>
                                    </div>
                                </td>
                            </tr>
                            
                            {/* Tomyopma turi */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Tomyopma turi
                                </td>
                                <td className="py-2 px-3">
                                    <div className="w-[60%] ml-auto">
                                        <CustomSelect
                                            value={roofType}
                                            onChange={setRoofType}
                                            options={ROOF_TYPES}
                                            placeholder="Tanlang"
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Harorat parametrlari - avtomatik */}
                <div className="space-y-3 pt-4 ">
                    <h4 className="text-base font-semibold text-gray-800">Harorat parametrlari</h4>

                    <div className="space-y-2 text-[0.9rem] bg-gray-50 rounded-lg p-4">
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="font-medium text-gray-700">
                                Ichki havo hisobiy harorati, t<sub className="text-[0.7em]">i</sub>
                            </span>
                            <span className="text-right text-[#1080c2] font-semibold">
                                {t_i ? `${t_i} °C` : "—"}
                            </span>
                        </div>
                        <div className="border-t border-dashed border-gray-300" />
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="font-medium text-gray-700">
                                Tashqi havo hisobiy harorati, t<sub className="text-[0.7em]">e</sub>
                            </span>
                            <span className="text-right text-[#1080c2] font-semibold">
                                {t_e ? `${t_e} °C` : "—"}
                            </span>
                        </div>
                        <div className="border-t border-dashed border-gray-300" />
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="font-medium text-gray-700">
                                Gradussutka, D<sub className="text-[0.7em]">d</sub>
                            </span>
                            <span className="text-right text-[#1080c2] font-semibold">
                                {D_d ? `${D_d} °C·sutka` : "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tashqi devor va Izolyatsiya - avtomatik */}
                <div className="space-y-3 pt-4 ">
                    <h4 className="text-base font-semibold text-gray-800">Material parametrlari</h4>

                    <div className="space-y-4">
                        {/* Tashqi devor - eng qalin qatlam */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-800 mb-3">Tashqi devor</h5>
                            <div className="space-y-2 text-[0.9rem] border-t border-dashed border-gray-300 pt-2">
                                <div className="flex items-baseline justify-between gap-3 ">
                                    <span className="font-medium text-gray-700">Material nomi</span>
                                    <span className="text-right text-[#1080c2] font-semibold">
                                        {thickestLayer?.name || "—"}
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-gray-300" />
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-medium text-gray-700">Zichlik, γ</span>
                                    <span className="text-right text-[#1080c2] font-semibold">
                                        {thickestLayer?.rho ? `${thickestLayer.rho} kg/m³` : "—"}
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-gray-300" />
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-medium text-gray-700">Qalinlik, δ</span>
                                    <span className="text-right text-[#1080c2] font-semibold">
                                        {thickestLayer?.thickness_mm ? `${thickestLayer.thickness_mm} mm` : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Izolyatsiya - eng yaxshi izolyatsiya */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-800 mb-3">Izolyatsiya </h5>
                            <div className="space-y-2 text-[0.9rem] border-t border-dashed border-gray-300 pt-2">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-medium text-gray-700">Material nomi</span>
                                    <span className="text-right text-[#1080c2] font-semibold">
                                        {bestInsulationLayer?.name || "—"}
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-gray-300" />
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-medium text-gray-700">Zichlik, γ</span>
                                    <span className="text-right text-[#1080c2] font-semibold">
                                        {bestInsulationLayer?.rho ? `${bestInsulationLayer.rho} kg/m³` : "—"}
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-gray-300" />
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-medium text-gray-700">Qalinlik, δ</span>
                                    <span className="text-right text-[#1080c2] font-semibold">
                                        {bestInsulationLayer?.thickness_mm ? `${bestInsulationLayer.thickness_mm} mm` : "—"}
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-gray-300" />
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-medium text-gray-700">Issiqlik o'tkazuvchanlik, λ</span>
                                    <span className="text-right text-[#1080c2] font-semibold">
                                        {bestInsulationLayer?.lambda ? `${bestInsulationLayer.lambda} Vt/(m·°C)` : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bino to'suvchi konstruksiyalari orqali me'yoriy issiqlik yo'qotishlarini aniqlash hisobi */}
            <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Bino to'suvchi konstruksiyalari orqali me'yoriy issiqlik yo'qotishlarini aniqlash hisobi
                </h2>

                <div className="rounded-xl border border-[#E5E7EB]">
                    <table className="w-full text-xs md:text-sm">
                        <thead>
                            <tr className="text-gray-600 bg-gray-50">
                                <th className="py-2 px-3 text-left w-2/3">Ko'rsatkich</th>
                                <th className="py-2 px-3 text-center w-1/3">Qiymat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* A_Fas */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Fasad maydoni, A<sub className="text-[0.7em]">Fas</sub>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={A_W}
                                            onChange={(e) => setA_W(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </td>
                            </tr>

                            {/* A_W (net) */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Tashqi devorlarning maydoni (deraza va tashqi eshiklar maydonini hisobga olmaganda), A<sub className="text-[0.7em]">W</sub>
                                </td>
                                <td className="py-2 px-3 text-sm font-semibold text-[#1080c2] text-right">
                                    {A_W_net > 0 ? `${A_W_net.toFixed(2)} m²` : "—"}
                                </td>
                            </tr>

                            {/* A_L */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Derazalar va vitrinalar maydoni, A<sub className="text-[0.7em]">L</sub>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={A_L}
                                            onChange={(e) => setA_L(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </td>
                            </tr>

                            {/* A_D */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Eshiklar maydoni, A<sub className="text-[0.7em]">D</sub>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={A_D}
                                            onChange={(e) => setA_D(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </td>
                            </tr>

                            {/* A_CG */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Yerdagi pol hamda yer sathidan pastdagi devorlar maydoni, A<sub className="text-[0.7em]">GC</sub>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={A_CG}
                                            onChange={(e) => setA_CG(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </td>
                            </tr>

                            {/* A_G */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Isitilmaydigan yerto'la ustidagi pol maydoni, A<sub className="text-[0.7em]">G</sub>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={A_G}
                                            onChange={(e) => setA_G(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </td>
                            </tr>

                            {/* ΣA_G */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Jami pol maydoni, ΣA<sub className="text-[0.7em]">G</sub>
                                </td>
                                <td className="py-2 px-3 text-sm font-semibold text-[#1080c2] text-right">
                                    {sumA_G > 0 ? `${sumA_G.toFixed(2)} m²` : "—"}
                                </td>
                            </tr>

                            {/* A_R */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    Tomyopmalar (yoki chordoq orayopmalari)ning jami maydoni, A<sub className="text-[0.7em]">R</sub>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={A_R}
                                            onChange={(e) => setA_R(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </td>
                            </tr>

                            {/* V_h */}
                            <tr className="border-t border-[#E5E7EB] h-[45px]">
                                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span>Binoning isitiladigan hajmi, V<sub className="text-[0.7em]">h</sub></span>
                                        <FieldHelp text="Tashqi devorlar ichki yuzasi va pastki qavat polidan yuqori qavat shiftigacha bo'lgan hajm hisoblanadi." />
                                    </div>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="relative w-[60%] ml-auto">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={V_h}
                                            onChange={(e) => setV_h(e.target.value)}
                                            className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m³</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* PDF eksport tugmasi */}
            {onExportPDF && (
                <div className="flex justify-center pt-6">
                    <button
                        onClick={onExportPDF}
                        className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-base font-semibold transition-colors flex items-center gap-3 shadow-md hover:shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF hisobotni yuklab olish
                    </button>
                </div>
            )}
        </div>
    );
}
