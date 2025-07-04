'use client';
import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "primary", // 'primary' | 'secondary' | 'pill'
  disabled = false,
  ...props
}) {
  let base =
    "px-4 py-2 font-semibold transition-all duration-300 ease-smooth focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl shadow-soft hover:shadow-premium ";
  let variants = {
    primary:
      "bg-gradient-to-r from-primary via-accent-purple to-accent-blue text-white hover:from-accent-blue hover:to-primary/90 hover:via-primary/80 ",
    secondary:
      "bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-300 dark:border-indigo-600 text-indigo-800 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800/80 ",
    pill:
      "bg-gradient-to-r from-primary via-accent-purple to-accent-blue text-white rounded-pill hover:from-accent-blue hover:to-primary/90 hover:via-primary/80 ",
  };
  let disabledStyles =
    'opacity-50 bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none ';
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      className={`${base}${variants[variant] || ''} ${disabled ? disabledStyles : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
} 