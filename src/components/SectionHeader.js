'use client';
import React from "react";

export default function SectionHeader({ title, children, className = "" }) {
  return (
    <div className={`flex justify-between items-center mb-2 ${className}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
} 