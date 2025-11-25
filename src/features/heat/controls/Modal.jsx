import React from "react";
import { createPortal } from "react-dom";

/**
 * Modal - umumiy modal overlay komponenti
 * Barcha modallar uchun bir xil overlay va container dizaynini ta'minlaydi
 * 
 * Props:
 * - open: modal ochiq/yopiq holati
 * - onClose: modalni yopish funksiyasi
 * - children: modal ichidagi kontent
 * - size: modal o'lchami ('sm', 'md', 'lg', 'xl')
 * - closeOnOverlayClick: overlay bosilganda yopilsinmi (default: true)
 */
export function Modal({ 
  open, 
  onClose, 
  children, 
  size = 'md', 
  closeOnOverlayClick = true 
}) {
  if (!open) return null;

  // Modal o'lchamlarini aniqlash
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl', 
    lg: 'max-w-2xl',
    xl: 'max-w-5xl'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={handleOverlayClick}
    >
      <div 
        className={`bg-white rounded-2xl shadow-xl ${sizeClasses[size]} w-full mx-4 p-6 text-sm text-gray-800`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/**
 * ModalHeader - modal sarlavhasi uchun komponent
 * Sarlavha va yopish tugmasini o'z ichiga oladi
 */
export function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-3">
      <h2 className="text-base font-semibold text-gray-900">
        {title}
      </h2>
      {onClose && (
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Yopish"
        >
          ×
        </button>
      )}
    </div>
  );
}

/**
 * LargeModal - katta modallar uchun maxsus komponent
 * Material tanlash, hudud tanlash kabi katta modallar uchun
 */
export function LargeModal({ open, onClose, children, title }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 h-[560px] max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Yopish"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
