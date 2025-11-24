// Bosqichlar bo'yicha navigatsiya tugmalari uchun umumiy komponentlar
// Eslatma: bu tugmalar HeatWizard ichida qayta ishlatiladi (tepada va pastda).

import React from "react";

// Asosiy "Keyingi bosqich" tugmasi
export function WizardPrimaryButton({ children, className = "", ...rest }) {
  const base =
    "px-4 py-2 rounded-xl bg-[#1080c2] text-sm font-semibold text-white hover:bg-[#0b6ca8] disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <button type="button" className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
}

// Ikkinchi darajali "Oldingi bosqich" kabi tugmalar
export function WizardSecondaryButton({ children, className = "", ...rest }) {
  const base =
    "px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <button type="button" className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
}
