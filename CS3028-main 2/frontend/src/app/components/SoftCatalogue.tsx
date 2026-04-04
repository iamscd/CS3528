"use client";

import SoftButton from "@/app/components/SoftButton";
import ProgressDots from "@/app/components/ProgressDots";

interface SoftCatalogueProps {
  courseId: number;
  title: string;
  description: string;
  totalModules: number;
  completedModules: number;
  isLoggedIn: boolean;
  variant?: "grid" | "list";
  isCreateCard?: boolean; // admin create card
}

export default function SoftCatalogue({
  courseId,
  title,
  description,
  totalModules,
  completedModules,
  isLoggedIn,
  variant = "grid",
  isCreateCard = false,
}: SoftCatalogueProps) {
  const completed = totalModules > 0 && completedModules === totalModules;
  const isList = variant === "list";

  // Render action button text
  const actionText = isCreateCard
    ? "+ Create Course"
    : completed
    ? "Completed"
    : isLoggedIn
    ? "Continue"
    : "Preview";

  return (
    <div
      className={`
        p-5 rounded-2xl
        bg-[#efefef]
        shadow-[-10px_10px_16px_rgba(0,0,0,0.15),10px_-10px_16px_rgba(255,255,255,0.9)]
        ${isList ? "flex items-center gap-6" : "flex flex-col justify-between"}
      `}
    >
      {/* Content */}
      <div className={isList ? "flex-1 flex flex-col gap-2" : ""}>
        {/* Title + Progress in list view */}
        {isList ? (
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-fuchsia-700">
              {title}
            </h3>

            {!isCreateCard && (
              <div className="flex items-center gap-2">
                <ProgressDots total={totalModules} completed={completedModules} />
                <span className="text-xs text-gray-500">
                  {totalModules === 0 ? "No modules" : `${completedModules}/${totalModules}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-1 text-fuchsia-700">
              {title}
            </h3>

            <p className="text-sm text-gray-600 mb-3">{description}</p>

            {!isCreateCard && (
              <>
                <div className="mb-2">
                  <ProgressDots total={totalModules} completed={completedModules} />
                </div>
                <p className="text-xs text-gray-500">
                  {totalModules === 0
                    ? "No modules yet"
                    : `${completedModules} of ${totalModules} modules completed`}
                </p>
              </>
            )}
          </>
        )}

        {/* Description below title in list view */}
        {isList && description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      {/* Action Button */}
      <div className={isList ? "flex-shrink-0" : "mt-4"}>
        <SoftButton
          href={isCreateCard ? "/createcourse" : `/courses/${courseId}`}
          disabled={isCreateCard ? false : !isLoggedIn}
          width={isList ? "w-auto" : "w-full"}
        >
          {actionText}
        </SoftButton>
      </div>
    </div>
  );
}
