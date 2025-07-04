'use client';
import React from "react";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 bg-white text-black dark:bg-[#18181B] dark:text-white transition-all duration-300 ease-smooth ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 