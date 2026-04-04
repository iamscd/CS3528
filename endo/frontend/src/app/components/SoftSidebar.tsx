"use client";

import Link from "next/link";

interface SidebarItem {
  label: string;
  href: string;
  disabled?: boolean;
}

interface SoftSidebarProps {
  items: SidebarItem[];
  className?: string;
  header?: string;        // Text for the header
  headerHref?: string;    // Link for the header
}

export default function SoftSidebar({ items, className, header, headerHref = "#" }: SoftSidebarProps) {
  return (
    <div
      className={`rounded-2xl w-64 bg-[#efefef] p-4 flex flex-col relative ${className || ""}
                  shadow-[-10px_10px_16px_rgba(0,0,0,0.18),10px_-10px_16px_rgba(255,255,255,0.9),inset_-1px_1px_1px_rgba(255,255,255,0.8),inset_1px_-1px_1px_rgba(0,0,0,0.1)]`}
    >

      {/* Sidebar header */}
      {header && (
        <Link
          href={headerHref}
          className={`
            inline-flex w-full items-center justify-center
            text-center
            font-semibold text-gray-800 mb-4
            py-2 px-3 rounded-2xl
            bg-[#efefef]
            transition-transform duration-150 ease-in-out
            hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] hover:bg-[#e3e0dd]
          `}
        >
          {header}
        </Link>
      )}

      {/* Sidebar items */}
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 text-sm text-gray-700 transition-shadow rounded duration-200
            ${item.disabled
              ? "opacity-50 pointer-events-none"
              : "hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] hover:bg-[#e3e0dd]"
            }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
