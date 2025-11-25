import React from "react";

/**
 * CalculationResultRow - hisoblash natijalarini ko'rsatish uchun umumiy qator komponenti
 * ITH.jsx va HeatWizard.jsx da takrorlangan hisoblash natijalarini birlashtiradi
 */
export function CalculationResultRow({ 
  label, 
  value, 
  unit = "", 
  errorMessage = null,
  description = null 
}) {
  return (
    <div className="flex items-center justify-between py-3 min-h-[56px]">
      <p className="text-justify">
        <span className="font-semibold">{label}</span>
        {description && (
          <span className="block text-xs text-gray-500 italic mt-1">{description}</span>
        )}
      </p>
      {value != null ? (
        <span className="font-semibold text-[#1080c2]">
          {typeof value === 'number' ? value.toFixed(value < 1 ? 3 : 2) : value} {unit}
        </span>
      ) : (
        <span className="text-xs text-red-600 text-right">
          {errorMessage || "Ma'lumot mavjud emas"}
        </span>
      )}
    </div>
  );
}

/**
 * CalculationResultsPanel - hisoblash natijalarini ko'rsatish uchun umumiy panel
 * Bir nechta hisoblash natijalarini vertikal ro'yxat ko'rinishida ko'rsatadi
 */
export function CalculationResultsPanel({ children, title }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
      {title && (
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      <div className="text-sm text-gray-800 divide-y divide-gray-200">
        {children}
      </div>
    </div>
  );
}
