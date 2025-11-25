import React from "react";
import { Modal, ModalHeader } from "./Modal";
import { ProtectionLevelNoteText } from "../heatSharedTexts";

/**
 * ProtectionLevelInfoModal - issiqlik himoyasi darajasi haqida eslatma modali
 * ITH.jsx va HeatWizard.jsx da bir xil matnni ko'rsatadi
 */
export function ProtectionLevelInfoModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader 
        title="Issiqlik himoyasi darajasi bo'yicha eslatma" 
        onClose={onClose} 
      />
      <div className="text-sm text-gray-700">
        <ProtectionLevelNoteText />
      </div>
    </Modal>
  );
}

/**
 * RibHeightInfoModal - qovurg'a balandligi nisbati haqida eslatma modali
 * ITH.jsx va HeatWizard.jsx da bir xil matnni ko'rsatadi
 */
export function RibHeightInfoModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader 
        title="Qovurg'a balandligi nisbati, h/a bo'yicha eslatma" 
        onClose={onClose} 
      />
      <div className="text-sm text-gray-700">
        <p>
          Orayopma tekis yoki turtib chiqgan qovurg'alari balandligi h-ning qo'shni qovurg'alar qirralari
          orasidagi masofa a-ga nisbati 0.3 gacha bo'lsa h/a ≤ 0.3 tanlang.
        </p>
      </div>
    </Modal>
  );
}
