// Dastlabki ma'lumotlar bloki - umumiy komponent
import React from "react";

export function InitialDataBlock({ hududLabel, climate, heatingSeason }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900">Dastlabki ma'lumotlar</h3>

      {/* Hudud va ichki harorat – alohida qatorda */}
      <div className="space-y-2 text-[0.9rem]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-medium">Hudud</span>
          <span className="text-right text-[#1080c2] font-semibold">{hududLabel}</span>
        </div>
        <div className="border-t border-dashed border-gray-200" />
        <div className="flex items-baseline justify-between gap-3 pt-1">
          <span className="font-medium">
            Ichki havoning hisobiy harorati t
            <sub className="align-baseline text-[0.7em]">i</sub> °C
          </span>
          <span className="text-right text-[#1080c2] font-semibold">
            {climate.t_in != null && climate.t_in !== ""
              ? `${climate.t_in} °C`
              : "—"}
          </span>
        </div>
      </div>

      {/* Iqlimiy hosila qiymatlar – 1-bosqichdagi matnlar bilan */}
      <div className="space-y-3 text-[0.9rem] text-gray-800 pt-2 border-t border-dashed border-gray-200">
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
    </section>
  );
}
