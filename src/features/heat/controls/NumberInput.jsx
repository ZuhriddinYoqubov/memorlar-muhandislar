import React from "react";

// Reusable number input component
export function NumberInput({ 
  label, 
  value, 
  onChange, 
  unit, 
  placeholder = "0", 
  step = "0.01",
  required = false,
  error = false,
  isInteger = false
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-3/4 text-sm font-medium text-gray-700">
        {label}
      </div>
      <div className="relative w-1/4">
        <input
          type="text"
          inputMode={isInteger ? "numeric" : "decimal"}
          value={value}
          onChange={(e) => {
            const raw = e.target.value;

            // Faqat raqamli qiymatlarga ruxsat beramiz
            if (raw === "") {
              onChange("");
              return;
            }

            if (isInteger) {
              // Butun son: faqat 0-9
              if (/^\d+$/.test(raw)) {
                onChange(raw);
              }
              return;
            }

            // O'nlik son: raqamlar, bitta nuqta yoki vergul
            const normalized = raw.replace(",", ".");
            if (/^\d*(\.\d*)?$/.test(normalized)) {
              onChange(normalized);
            }
          }}
          className={`w-full px-4 py-3 ${unit ? 'pr-20' : 'pr-4'} rounded-xl border text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] ${
            error ? "border-red-400 bg-red-50" : "border-[#E5E7EB] bg-gray-50"
          }`}
          placeholder={placeholder}
          step={isInteger ? "1" : step}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
