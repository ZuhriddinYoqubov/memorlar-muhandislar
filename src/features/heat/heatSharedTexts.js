// Umumiy issiqlik hisobi matnlari va kichik komponentlar
// Eslatma: bu fayl .js bo'lgani uchun JSX o'rniga React.createElement ishlatyapmiz.

import React from "react";

export function ProtectionLevelNoteText() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "p",
      { className: "mb-2" },
      "Davlat kapital mablag'lari yoki mahalliy byudjet hisobiga amalga oshiriladigan turar-joy,",
      " davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar qurilishi,",
      " rekonstruksiyasi va kapital ta'mirida issiqlik himoyasining 2-darajasini qabul qilish lozim"
    ),
    React.createElement(
      "p",
      null,
      "Byudjetdan tashqari mablag'lar hisobiga amalga oshiriladigan turar-joy, jamoat va sanoat",
      " binolarini qurish, rekonstruksiya qilish va kapital ta'mirlashda loyihalash topshirig'iga",
      " muvofiq issiqlik himoyasining 2-yoki 3-darajasini qabul qilish tavsiya etiladi (QMQ",
      " 2.01.04-18, 2.1* bandi)."
    )
  );
}
