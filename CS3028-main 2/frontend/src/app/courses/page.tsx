"use client";

import { useEffect, useState } from "react";
import SoftCourse from "@/app/components/SoftCourse";
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

        const newProgress: {
          [key: number]: CourseModuleProgress;
        } = {};

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

              if (lessons.length === 0) continue;

              const progressChecks = await Promise.all(
                lessons.map((lesson: any) =>
                  fetch(
                    `http://127.0.0.1:5000/lessons/${lesson.id}/progress`,
                    { headers }
                  ).then((r) => r.json())
                )
              );

              const allCompleted = progressChecks.every(
                (p) => p.is_completed
              );

              if (allCompleted) completedModules++;
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

        {/* Courses Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const progress = progressMap[course.course_id] || {
              totalModules: 0,
              completedModules: 0,
            };

            return (
              <SoftCourse
                key={course.course_id}
                courseId={course.course_id}
                title={course.title}
                description={course.description}
                totalModules={progress.totalModules}
                completedModules={progress.completedModules}
                isLoggedIn={isLoggedIn}
              />
            );
          })}

          {/* Admin Create Card */}
          {role === "admin" && (
            <div
              className="
                p-6 rounded-2xl flex flex-col justify-center items-center
                bg-[#efefef]
                shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.08)]
              "
            >
              <h3 className="text-lg font-semibold mb-4 text-fuchsia-700">
                Create New Course
              </h3>

              <SoftButton href="/createcourse">
                + Create Course
              </SoftButton>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
