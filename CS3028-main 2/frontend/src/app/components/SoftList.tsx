"use client";

import { useState } from "react";
import SoftCatalogue from "@/app/components/SoftCatalogue";
import SoftButton from "@/app/components/SoftButton";

type Variant = "catalogue" | "list";

interface CatalogueItem {
  type: "catalogue";
  courseId: number;
  title: string;
  description: string;
  totalModules: number;
  completedModules: number;
  isLoggedIn: boolean;
  isCreateCard: boolean;
}

interface SoftListProps {
  variant: Variant;
  items: CatalogueItem[];
  role?: "admin" | "user";
}

export default function SoftList({ variant, items, role }: SoftListProps) {
  const [view, setView] = useState<Variant>(variant);

  return (
    <div className="space-y-6">
      {/* ===== View Switch ===== */}
      <div className="flex gap-2">
        <SoftButton
          width="w-auto"
          onClick={() => setView("catalogue")}
          disabled={view === "catalogue"}
        >
          Grid
        </SoftButton>

        <SoftButton
          width="w-auto"
          onClick={() => setView("list")}
          disabled={view === "list"}
        >
          List
        </SoftButton>
      </div>

      {/* ===== Catalogue / List View ===== */}
      <div
        className={`${
          view === "catalogue"
            ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            : "flex flex-col gap-6"
        }`}
      >
        {/* ===== Admin Create Card (INLINE) ===== */}
        {role === "admin" && (
          <div
            className={`rounded-2xl p-6 bg-[#efefef]
            shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.08)]
            flex ${
              view === "list"
                ? "flex-row justify-between items-center"
                : "flex-col justify-center items-center min-h-[220px]"
            }`}
          >
            <div className={view === "list" ? "text-left" : "text-center"}>
              <h3 className="text-lg font-semibold text-fuchsia-700">
                Create New Course
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Add a new course to your catalogue
              </p>
            </div>

            <div className={view === "list" ? "" : "mt-4"}>
              <SoftButton href="/createcourse">
                + Create Course
              </SoftButton>
            </div>
          </div>
        )}

        {/* ===== Existing Courses ===== */}
        {items.map((item) => (
          <SoftCatalogue
            key={item.courseId}
            courseId={item.courseId}
            title={item.title}
            description={item.description}
            totalModules={item.totalModules}
            completedModules={item.completedModules}
            isLoggedIn={item.isLoggedIn}
            isCreateCard={item.isCreateCard}
            variant={view === "list" ? "list" : "grid"}
          />
        ))}
      </div>
    </div>
  );
}
