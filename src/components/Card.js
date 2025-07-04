'use client';
import React from "react";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 bg-gradient-to-br from-white/80 to-indigo-50 dark:from-[#181B2A]/80 dark:to-[#23263A] transition-all duration-300 ease-smooth ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 