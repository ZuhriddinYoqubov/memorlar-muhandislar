import React from "react";

// Universal yordamchi savol/izoh komponenti
// text prop orqali ko'rsatiladigan matn beriladi
export function FieldHelp({ text }) {
  return (
    <span className="inline-flex items-center ml-2 align-middle">
      <span className="relative group inline-flex items-center justify-center w-4 h-4 rounded-full border border-[#9CA3AF] text-[0.65rem] text-[#4B5563] bg-white cursor-default">
        ?
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-[#111827] px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {text}
        </span>
      </span>
    </span>
  );
}
