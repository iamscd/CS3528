"use client";

interface ProgressDotsProps {
  total: number;
  completed: number;
  size?: number; 
}

export default function ProgressDots({
  total,
  completed,
  size = 12,
}: ProgressDotsProps) {
  if (total <= 0) return null;

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < completed;

        return (
          <span
            key={i}
            style={{ width: size, height: size }}
            className={`
              rounded-full transition-all
              ${
                done
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
