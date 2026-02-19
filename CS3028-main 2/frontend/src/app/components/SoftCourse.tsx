"use client";

import Link from "next/link";
import SoftButton from "@/app/components/SoftButton";

interface SoftCourseProps {
  courseId: number;
  title: string;
  description: string;

  /** Number of modules in the course */
  totalModules: number;

  /** Number of completed modules */
  completedModules: number;

  /** Auth state */
  isLoggedIn: boolean;
}

export default function SoftCourse({
  courseId,
  title,
  description,
  totalModules,
  completedModules,
  isLoggedIn,
}: SoftCourseProps) {
  const completed = totalModules > 0 && completedModules === totalModules;

  return (
    <div
      className="
        p-5 rounded-2xl flex flex-col justify-between
        bg-[#efefef]
        shadow-[-10px_10px_16px_rgba(0,0,0,0.15),10px_-10px_16px_rgba(255,255,255,0.9)]
      "
    >
      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold mb-1 text-fuchsia-700">
          {title}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-2">
          {Array.from({ length: totalModules }).map((_, i) => {
            const done = i < completedModules;

            return (
              <span
                key={i}
                className={`
                  w-3 h-3 rounded-full
                  transition-all
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

        <p className="text-xs text-gray-500 mb-4">
          {totalModules === 0
            ? "No modules yet"
            : `${completedModules} of ${totalModules} modules completed`}
        </p>
      </div>

      {/* Action */}
      <SoftButton
        href={`/courses/${courseId}`}
        disabled={!isLoggedIn}
      >
        {completed ? "Completed" : isLoggedIn ? "Continue" : "Preview"}
      </SoftButton>
    </div>
  );
}
