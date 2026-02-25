"use client";

import { useEffect, useState } from "react";
import SoftList from "@/app/components/SoftList";
import SoftButton from "@/app/components/SoftButton";

interface Course {
  course_id: number;
  title: string;
  description: string;
}

interface CourseModuleProgress {
  totalModules: number;
  completedModules: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<{
    [key: number]: CourseModuleProgress;
  }>({});
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    setRole(localStorage.getItem("role"));

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const fetchCoursesAndProgress = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/courses", { headers });
        if (!res.ok) throw new Error("Failed to fetch courses");

        const data = await res.json();

        const mapped: Course[] = data.map((c: any) => ({
          course_id: c.id,
          title: c.title,
          description: c.description,
        }));

        setCourses(mapped);

        const newProgress: { [key: number]: CourseModuleProgress } = {};

        await Promise.all(
          mapped.map(async (course) => {
            const modulesRes = await fetch(
              `http://127.0.0.1:5000/courses/${course.course_id}/modules`,
              { headers }
            );

            const modules = modulesRes.ok ? await modulesRes.json() : [];

            let completedModules = 0;

            for (const module of modules) {
              const lessonsRes = await fetch(
                `http://127.0.0.1:5000/modules/${module.id}/lessons`,
                { headers }
              );

              const lessons = lessonsRes.ok ? await lessonsRes.json() : [];
              if (!lessons.length) continue;

              const progressChecks = await Promise.all(
                lessons.map((lesson: any) =>
                  fetch(
                    `http://127.0.0.1:5000/lessons/${lesson.id}/progress`,
                    { headers }
                  ).then((r) => r.json())
                )
              );

              if (progressChecks.every((p) => p.is_completed)) {
                completedModules++;
              }
            }

            newProgress[course.course_id] = {
              totalModules: modules.length,
              completedModules,
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

    fetchCoursesAndProgress();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#efefef]">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  // Build list items for SoftList
  const listItems = [
    ...courses.map((course) => {
      const progress = progressMap[course.course_id] || {
        totalModules: 0,
        completedModules: 0,
      };

      return {
        type: "catalogue" as const,
        courseId: course.course_id,
        title: course.title,
        description: course.description,
        totalModules: progress.totalModules,
        completedModules: progress.completedModules,
        isCreateCard: false,
        isLoggedIn,
      };
    }),
  ];

  // Add admin “Create Course” as a card at the end
  if (role === "admin") {
    listItems.push({
      type: "catalogue" as const,
      courseId: -1, // fake id
      title: "Create New Course",
      description: "Add a new course to the catalogue",
      totalModules: 0,
      completedModules: 0,
      isLoggedIn: true, // always clickable
      // special flag so SoftCatalogue knows it’s the create button
      isCreateCard: true,
    } as any);
  }

  return (
    <main className="min-h-screen bg-[#efefef] px-6 md:px-10 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-fuchsia-700 mb-3">
            Browse Courses
          </h1>
          <p className="text-gray-700 text-sm md:text-base max-w-2xl">
            Explore interactive lessons at your own pace.
          </p>
        </header>

        {/* Courses List */}
        <SoftList variant="list" items={listItems} />
      </div>
    </main>
  );
}
