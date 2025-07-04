'use client';
import React, { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, className = "" }) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />
      <div
        className={`relative bg-card dark:bg-card-dark rounded-2xl shadow-premium p-6 w-full max-w-md mx-auto z-10 animate-fadeIn ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
} 