import React from "react";

/**
 * ClimateDisplay - iqlimiy parametrlarni ko'rsatish uchun umumiy komponent
 * ITH.jsx va HeatWizard.jsx da takrorlangan iqlimiy ma'lumotlarni birlashtiradi
 * 
 * Props:
 * - heatingSeason: { t_is_dav, Z_is_dav, D_is_dav } - isitish davri parametrlari
 * - climate: { t_out } - tashqi havo harorati
 * - compact: ixcham ko'rinish uchun (default: false)
 */
export function ClimateDisplay({ heatingSeason, climate, compact = false }) {
  const textSize = compact ? "text-[0.9rem]" : "text-sm";
  const spacing = compact ? "space-y-2" : "space-y-3";

  return (
    <div className={`${spacing} ${textSize} text-gray-800`}>
      {/* O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning o'rtacha harorati */}
      <div className="pt-1 first:pt-0">
        <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
          <span className="leading-snug flex-1 text-justify">
            O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning o'rtacha
            harorati, t
            <sub className="align-baseline text-[0.75em]">is.dav</sub>
          </span>
          <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
            {heatingSeason.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—"}
          </span>
        </p>
        <p className="text-xs text-gray-500 italic mt-1">
          QMQ 2.01.01-22 "Loyihalash uchun iqlimiy va fizikaviy-geologik maʼlumotlar" 4-jadval
          "Tashqi havoning parametrlari", 20–22-qatorlar o'rtacha qiymati
        </p>
      </div>

      {/* O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning davomiyligi */}
      <div className="pt-2 border-t border-dashed border-gray-200">
        <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
          <span className="leading-snug flex-1 text-justify">
            O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning davomiyligi,
            Z
            <sub className="align-baseline text-[0.75em]">is.dav</sub>
          </span>
          <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
            {heatingSeason.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—"}
          </span>
        </p>
        <p className="text-xs text-gray-500 italic mt-1">
          QMQ 2.01.01-22 "Loyihalash uchun iqlimiy va fizikaviy-geologik maʼlumotlar" 4-jadval
          "Tashqi havoning parametrlari", 19–21-qatorlar o'rtacha qiymati
        </p>
      </div>

      {/* Tashqi havoning hisobiy qishki harorati */}
      <div className="pt-2 border-t border-dashed border-gray-200">
        <p className="flex items-baseline gap-x-2 gap-y-1 font-medium w-full">
          <span className="leading-snug flex-1 text-justify">
            Tashqi havoning hisobiy qishki harorati, t
            <sub className="align-baseline text-[0.75em]">t</sub>
          </span>
          <span className="font-semibold text-[#1080c2] text-right whitespace-nowrap">
            {climate.t_out != null ? `${climate.t_out} °C` : "—"}
          </span>
        </p>
        <p className="text-xs text-gray-500 italic mt-1">
          QMQ 2.01.01-22 bo'yicha ta'minlanganligi 0,92 bo'lgan eng sovuq besh kunlikning o'rtacha
          haroratiga teng. 4-jadval "Tashqi havoning parametrlari", 17-qator
        </p>
      </div>
    </div>
  );
}
