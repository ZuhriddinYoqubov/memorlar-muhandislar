// Isitishga me'yoriy solishtirma issiqlik sarfi bosqichi
import React, { useState, useMemo } from "react";
import { NumberInput } from "./NumberInput";
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
    layers
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
    const [A_I, setA_I] = useState(""); // Qo'shimcha yerga nisbatan konstruksiya maydoni, A_I, m²
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

    // ΣA_G = A_CG + A_G
    const sumA_G = useMemo(() => {
        const cg = Number(A_CG) || 0;
        const g = Number(A_G) || 0;
        return cg + g;
    }, [A_CG, A_G]);

    return (
        <div className="space-y-6">
            {/* Kirish ma'lumotlari */}
            <section className="bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-6 shadow-sm space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    Dastlabki ma'lumotlar
                </h3>

                {/* Bino geometriyasi */}
                <div className="space-y-4">
                    <div className="space-y-3 divide-y divide-gray-200">
                        <NumberInput
                            label="Bino perimetri, P"
                            value={P_m}
                            onChange={setP_m}
                            unit="m"
                            required={true}
                        />

                        <NumberInput
                            label="Balandligi, H"
                            value={H_m}
                            onChange={setH_m}
                            unit="m"
                            required={true}
                        />

                        <NumberInput
                            label={<>Bino umumiy maydoni, A<sub className="text-[0.7em]">f</sub></>}
                            value={A_f}
                            onChange={setA_f}
                            unit="m²"
                            required={true}
                        />

                        <NumberInput
                            label="Binoning hisobiy quvvati"
                            value={Xodim}
                            onChange={setXodim}
                            unit="kishi"
                            required={true}
                            isInteger={true}
                        />

                        {/* Tomyopma turi dropdown */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="w-3/4 text-sm font-medium text-gray-700">
                                Tomyopma turi
                            </div>
                            <div className="w-1/4">
                                <div className="relative">
                                    <CustomSelect
                                        value={roofType}
                                        onChange={setRoofType}
                                        options={ROOF_TYPES}
                                        placeholder="Tanlang"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Harorat parametrlari - avtomatik */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
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
                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <h4 className="text-base font-semibold text-gray-800">Material parametrlari</h4>

                    <div className="space-y-4">
                        {/* Tashqi devor - eng qalin qatlam */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-800 mb-3">Tashqi devor</h5>
                            <div className="space-y-2 text-[0.9rem]">
                                <div className="flex items-baseline justify-between gap-3">
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
                            <div className="space-y-2 text-[0.9rem]">
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
            <section className="bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-6 shadow-sm space-y-4">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    Bino to'suvchi konstruksiyalari orqali me'yoriy issiqlik yo'qotishlarini aniqlash hisobi
                </h3>

                <div className="space-y-3 divide-y divide-gray-200">
                    {/* A_Fas */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700">
                            Fasad maydoni, A
                            <sub className="text-[0.7em]">Fas</sub>
                        </div>
                        <div className="w-1/4">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={A_W}
                                    onChange={(e) => setA_W(e.target.value)}
                                    className="w-full px-4 py-3 pr-16 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                            </div>
                        </div>
                    </div>

                    {/* A_W (net) */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700">
                            Tashqi devorlarning maydoni (deraza va tashqi eshiklar maydonini hisobga olmaganda), A
                            <sub className="text-[0.7em]">W</sub>
                        </div>
                        <div className="w-1/4 text-sm font-semibold text-[#1080c2] text-right">
                            {A_W_net > 0 ? `${A_W_net.toFixed(2)} m²` : "—"}
                        </div>
                    </div>

                    {/* A_L */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700">
                            Derazalar va vitrinalar maydoni, A
                            <sub className="text-[0.7em]">L</sub>
                        </div>
                        <div className="w-1/4">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={A_L}
                                    onChange={(e) => setA_L(e.target.value)}
                                    className="w-full px-4 py-3 pr-16 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                            </div>
                        </div>
                    </div>

                    {/* A_D */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700">
                            Eshiklar maydoni, A
                            <sub className="text-[0.7em]">D</sub>
                        </div>
                        <div className="w-1/4">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={A_D}
                                    onChange={(e) => setA_D(e.target.value)}
                                    className="text-right w-full px-4 py-3 pr-16 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                            </div>
                        </div>
                    </div>

                    {/* A_CG */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700">
                            Yerdagi pol hamda yer sathidan pastdagi devorlar maydoni, A
                            <sub className="text-[0.7em]">CG</sub>
                        </div>
                        <div className="w-1/4">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={A_CG}
                                    onChange={(e) => setA_CG(e.target.value)}
                                    className="w-full px-4 py-3 pr-16 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] text-right"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                            </div>
                        </div>
                    </div>

                    {/* A_G */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700">
                            Isitilmaydigan yerto'la ustidagi pol maydoni, A
                            <sub className="text-[0.7em]">G</sub>
                        </div>
                        <div className="w-1/4">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={A_G}
                                    onChange={(e) => setA_G(e.target.value)}
                                    className="text-right w-full px-4 py-3 pr-16 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                            </div>
                        </div>
                    </div>

                    {/* ΣA_G */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700">
                            Jami pol maydoni, ΣA
                            <sub className="text-[0.7em]">G</sub> 
                        </div>
                        <div className="w-1/4 text-sm font-semibold text-[#1080c2] text-right">
                            {sumA_G > 0 ? `${sumA_G.toFixed(2)} m²` : "—"}
                        </div>
                    </div>

            

                    {/* A_R */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700">
                            Tomyopmalar (yoki chordoq orayopmalari)ning jami maydoni, A
                            <sub className="text-[0.7em]">R</sub>
                        </div>
                        <div className="w-1/4 text-right">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={A_R}
                                    onChange={(e) => setA_R(e.target.value)}
                                    className="w-full px-4 py-3 pr-16 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                            </div>
                        </div>
                    </div>

                    {/* V_h */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-3/4 text-sm font-medium text-gray-700 flex items-center">
                            <span>
                                Binoning isitiladigan hajmi, V
                                <sub className="text-[0.7em]">h</sub>
                            </span>
                            <FieldHelp text="Tashqi devorlar ichki yuzasi va pastki qavat polidan yuqori qavat shiftigacha bo'lgan hajm hisoblanadi." />
                        </div>
                        <div className="w-1/4">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={V_h}
                                    onChange={(e) => setV_h(e.target.value)}
                                    className="w-full px-4 py-3 pr-16 rounded-xl border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">m³</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
