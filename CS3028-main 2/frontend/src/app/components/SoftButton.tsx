"use client";

import Link from "next/link";

interface SoftButtonProps {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
  width?: string;
}

export default function SoftButton({
  href,
  disabled = false,
  children,
  width = "w-full",
}: SoftButtonProps) {
  return (
    <Link
      href={disabled ? "#" : href}
      className={`
        ${width} inline-flex relative items-center justify-center
        text-center
        py-3 px-4
        rounded-2xl
        text-sm font-medium text-gray-800
        bg-[#efefef]
        shadow-[-10px_10px_16px_rgba(0,0,0,0.2),10px_-10px_16px_rgba(255,255,255,0.9),inset_-1px_1px_1px_rgba(255,255,255,0.8),inset_1px_-1px_1px_rgba(0,0,0,0.1)]
        transition-shadow duration-200
        active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]
      `}
    >
      {children}
    </Link>
  );
}
