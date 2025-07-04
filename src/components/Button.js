'use client';
import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "primary", // 'primary' | 'secondary' | 'pill'
  ...props
}) {
  let base =
    "px-4 py-2 font-semibold transition-all duration-300 ease-smooth focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl shadow-soft hover:shadow-premium ";
  let variants = {
    primary:
      "bg-gradient-to-r from-primary via-accent-purple to-accent-blue text-white hover:from-accent-blue hover:to-primary/90 hover:via-primary/80 ",
    secondary:
      "bg-white/60 dark:bg-card-dark/60 border border-border dark:border-border-dark text-foreground hover:bg-white/80 dark:hover:bg-card-dark/80 backdrop-blur-md ",
    pill:
      "bg-gradient-to-r from-primary via-accent-purple to-accent-blue text-white rounded-pill hover:from-accent-blue hover:to-primary/90 hover:via-primary/80 ",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base}${variants[variant] || ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 