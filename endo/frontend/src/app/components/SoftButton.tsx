"use client";

import Link from "next/link";
import React from "react";

interface BaseProps {
  disabled?: boolean;
  children: React.ReactNode;
  width?: string;
  onClick?: () => void;
}

interface LinkButtonProps extends BaseProps {
  href: string;
}

interface ActionButtonProps extends BaseProps {
  href?: never;
}

type SoftButtonProps = LinkButtonProps | ActionButtonProps;

export default function SoftButton({
  href,
  disabled = false,
  children,
  width = "w-full",
  onClick,
}: SoftButtonProps) {
  const className = `
    ${width} inline-flex relative items-center justify-center
    text-center py-3 px-4
    rounded-2xl
    text-sm font-medium text-gray-800
    bg-[#efefef]
    shadow-[-10px_10px_16px_rgba(0,0,0,0.2),10px_-10px_16px_rgba(255,255,255,0.9),inset_-1px_1px_1px_rgba(255,255,255,0.8),inset_1px_-1px_1px_rgba(0,0,0,0.1)]
    transition-shadow duration-200
    active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]
    ${disabled ? "opacity-50 pointer-events-none" : ""}
  `;

  if (href) {
    return (
      <Link href={disabled ? "#" : href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}
