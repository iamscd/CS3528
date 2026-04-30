"use client";

import { useState } from "react";
import Link from "next/link";

interface DropdownItem {
  label: React.ReactNode;
  href: string;
}

interface SoftDropdownProps {
  label: React.ReactNode;
  items: DropdownItem[];
  disabled?: boolean;
  maxHeight?: string;
  totalModules?: number;
  completedModules?: number;
  dotSize?: number;
}

interface ProgressDotsProps {
  total: number;
  completed: number;
  dotSize?: number;
}

function ProgressDots({ total, completed, dotSize = 12 }: ProgressDotsProps) {
  if (total <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < completed;
        return (
          <span
            key={i}
            style={{ width: dotSize, height: dotSize }}
            className={`
              flex-shrink-0 rounded-full transition-all
              ${done
                ? "bg-[#70cc30] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.25),inset_-1px_-1px_1px_rgba(255,255,255,0.4)]"
                : "bg-[#e0e0e0] shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.8),inset_1px_1px_1px_rgba(0,0,0,0.1)]"
              }
            `}
          />
        );
      })}
    </div>
  );
}

export default function SoftDropdown({
  label,
  items,
  disabled = false,
  maxHeight,
  totalModules = 0,
  completedModules = 0,
  dotSize = 12,
}: SoftDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`w-full rounded-2xl py-3 bg-[#efefef]
        shadow-[-10px_10px_16px_rgba(0,0,0,0.2),10px_-10px_16px_rgba(255,255,255,0.9),inset_-1px_1px_1px_rgba(255,255,255,0.8),inset_1px_-1px_1px_rgba(0,0,0,0.1)]
        ${disabled ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3
          text-lg font-medium text-gray-700
          bg-transparent rounded-t-2xl
          focus:outline-none
          transition-shadow duration-500
          active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]
        `}
      >
        <div className="flex items-center gap-2">
          <span><h1>{label}</h1></span>

          {totalModules > 0 && (
            <div className="flex items-center gap-2">
              <ProgressDots total={totalModules} completed={completedModules}
              />
              <span className="text-xs text-gray-500">
                {completedModules}/{totalModules}
              </span>
            </div>
          )}
        </div>

        <span>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown content */}
      <div
        className={`overflow-hidden transition-all duration-300
          ${open ? maxHeight ?? "max-h-60 py-2" : "max-h-0"}
        `}
      >
        <div className="flex flex-col px-2 pb-2">
          {items.map((item) => (
            <div key={item.href} className="flex flex-col">
              {/* Divider */}
              <div
                className="mx-2 my-1 h-[3px] rounded
                  bg-[#e9e7e4]
                  shadow-[inset_-1px_-1px_0_rgba(255,255,255,0.8),inset_1px_1px_0_rgba(0,0,0,0.1)]"
              />

              {/* Item */}
              <Link
                href={item.href}
                className="px-3 py-2 text-sm text-gray-700 rounded-lg
                  transition-shadow duration-200
                  hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.6)]
                  hover:bg-[#e3e0dd]
                "
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
