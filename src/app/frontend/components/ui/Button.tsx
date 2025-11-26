"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "light";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-full px-6 py-4 font-semibold tracking-wide transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer";

  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30",
    secondary:
      "bg-gray-800 text-white hover:bg-gray-900 hover:shadow-lg hover:shadow-gray-500/30",
    light:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
