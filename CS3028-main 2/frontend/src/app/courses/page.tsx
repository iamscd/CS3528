"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Course {
  course_id: number;
  title: string;
  description: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<{ [key: number]: number }>({});
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        const mapped = data.map((c: any) => ({
          course_id: c.id,
          title: c.title,
          description: c.description,
        }));
        setCourses(mapped);

        const progressObj: { [key: number]: number } = {};

        await Promise.all(
          mapped.map(async (course) => {
            const modulesRes = await fetch(
              `http://127.0.0.1:5000/courses/${course.course_id}/modules`,
              { headers }
            );
            const modules = modulesRes.ok ? await modulesRes.json() : [];

            let totalLessons = 0;
            let completedLessons = 0;

            for (const module of modules) {
              const lessonsRes = await fetch(
                `http://127.0.0.1:5000/modules/${module.id}/lessons`,
                { headers }
              );
              const lessons = lessonsRes.ok ? await lessonsRes.json() : [];

              totalLessons += lessons.length;

              const progressChecks = await Promise.all(
                lessons.map((lesson: any) =>
                  fetch(
                    `http://127.0.0.1:5000/lessons/${lesson.id}/progress`,
                    { headers }
                  ).then((r) => r.json())
                )
              );

              completedLessons += progressChecks.filter(
                (p) => p.is_completed
              ).length;
            }

            progressObj[course.course_id] =
              totalLessons === 0 ? 0 : completedLessons / totalLessons;
          })
        );

        setCourseProgress(progressObj);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCoursesAndProgress();
  }, []);

  return (
    <main className="min-h-screen flex justify-center px-4 py-10">
      <div className="w-full max-w-6xl rounded-3xl shadow-2xl px-6 py-10 md:px-12 md:py-14 bg-gradient-to-b from-fuchsia-50 to-fuchsia-100 dark:bg-gradient-to-b dark:from-purple-900 dark:to-fuchsia-900">
        <section className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-fuchsia-700 dark:text-fuchsia-200">
            Browse Courses
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-fuchsia-100/80 max-w-2xl mx-auto">
            Explore interactive lessons at your own pace.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progress = courseProgress[course.course_id] || 0;
            const completed = progress === 1;

            return (
              <div
                key={course.course_id}
                className="p-5 rounded-2xl flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition dark:bg-white/5 dark:border dark:border-white/10"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-fuchsia-700 dark:text-fuchsia-50">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-fuchsia-100/80 mb-3">
                    {course.description}
                  </p>

                  <div className="w-full h-3 bg-gray-300 dark:bg-white/20 rounded-full mb-1">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        completed ? "bg-green-500" : "bg-fuchsia-500"
                      }`}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-fuchsia-100/80">
                    {Math.round(progress * 100)}% complete
                  </p>
                </div>

                <Link
                  href={`/courses/${course.course_id}`}
                  className={`mt-4 inline-block text-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                    completed
                      ? "bg-green-600 text-white"
                      : "bg-fuchsia-600 text-white hover:bg-fuchsia-700"
                  }`}
                >
                  {completed ? "Completed" : isLoggedIn ? "Continue" : "Preview"}
                </Link>
              </div>
            );
          })}

          {role === "admin" && (
            <div className="p-5 rounded-2xl flex flex-col justify-center items-center bg-fuchsia-100 border-2 border-dashed border-fuchsia-400 hover:bg-fuchsia-200 transition dark:bg-white/5 dark:border-fuchsia-300">
              <h3 className="text-lg font-semibold mb-2 text-fuchsia-700 dark:text-fuchsia-50">
                Create New Course
              </h3>
              <Link
                href="/createcourse"
                className="px-4 py-2 rounded-lg bg-fuchsia-600 text-white text-sm font-medium hover:bg-fuchsia-700"
              >
                + Create Course
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
