"use client";

import { useEffect, useState } from "react";
import SoftList from "@/app/components/SoftList";

interface Course {
  id: number;
  title: string;
  description: string;
}

interface CourseModuleProgress {
  totalModules: number;
  completedModules: number;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<{
    [key: number]: CourseModuleProgress;
  }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const fetchCourses = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/courses", { headers });
        if (!res.ok) throw new Error("Failed to fetch courses");

        const data = await res.json();
        const sliced = data.slice(0, 3);

        setCourses(sliced);

        const newProgress: { [key: number]: CourseModuleProgress } = {};

        await Promise.all(
          sliced.map(async (course: any) => {
            const modulesRes = await fetch(
              `http://127.0.0.1:5000/courses/${course.id}/modules`,
              { headers }
            );

            const modules = modulesRes.ok ? await modulesRes.json() : [];

            newProgress[course.id] = {
              totalModules: modules.length,
              completedModules: 0, // homepage keeps it simple
            };
          })
        );

        setProgressMap(newProgress);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#efefef]">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  const listItems = courses.map((course) => {
    const progress = progressMap[course.id] || {
      totalModules: 0,
      completedModules: 0,
    };

    return {
      type: "catalogue" as const,
      courseId: course.id,
      title: course.title,
      description: course.description,
      totalModules: progress.totalModules,
      completedModules: progress.completedModules,
      isCreateCard: false,
      isLoggedIn,
    };
  });

  return (
    <main className="min-h-screen bg-[#efefef] px-6 md:px-10 py-10">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ===== Hero Section (Soft Style) ===== */}
        <section
          className="
            rounded-3xl p-10 bg-[#efefef]
            shadow-[-12px_12px_24px_rgba(0,0,0,0.2),12px_-12px_24px_rgba(255,255,255,0.9)]
            text-center
          "
        >
          <h1 className="text-4xl md:text-5xl font-bold text-fuchsia-700 mb-4">
            Empowering Education for Endometriosis Awareness
          </h1>

          <p className="text-gray-700 max-w-2xl mx-auto text-base md:text-lg">
            Learn about endometriosis, understand your body,
            and explore interactive courses designed to support and inform.
          </p>
        </section>

        {/* ===== Courses Section ===== */}
        <section>
          <header className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-fuchsia-700 mb-3">
              Featured Courses
            </h2>
            <p className="text-gray-700 text-sm md:text-base max-w-2xl">
              Start with one of our most popular learning paths.
            </p>
          </header>

          <SoftList variant="catalogue" items={listItems} />
        </section>

      </div>
    </main>
  );
}