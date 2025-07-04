'use client';
import React from "react";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`relative group overflow-hidden rounded-2xl shadow-soft p-6 border border-transparent bg-white/70 dark:bg-card-dark/60 backdrop-blur-md transition-all duration-300 ease-smooth hover:shadow-premium hover:bg-white/80 dark:hover:bg-card-dark/80 hover:backdrop-blur-xl ${className}`}
      style={{
        borderImage: 'linear-gradient(120deg, #6366F1 0%, #A78BFA 100%) 1',
        borderWidth: '1.5px',
      }}
      {...props}
    >
      <div className="absolute inset-0 pointer-events-none rounded-2xl group-hover:opacity-60 opacity-40 transition-all duration-300 bg-gradient-to-br from-accent-purple/20 via-white/10 to-accent-teal/10 dark:from-accent-purple/30 dark:via-card-dark/10 dark:to-accent-teal/20 z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
} 