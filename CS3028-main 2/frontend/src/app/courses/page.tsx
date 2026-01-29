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
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    setRole(localStorage.getItem("role"));

    const fetchCourses = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // ✅ API URL from FIRST component
        const res = await fetch("http://127.0.0.1:5000/courses", { headers });
        if (!res.ok) throw new Error("Failed to fetch courses");

        const data = await res.json();
        const mapped = data.map((c: any) => ({
          course_id: c.id,
          title: c.title,
          description: c.description,
        }));
        setCourses(mapped);
        console.table(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <main className="min-h-screen flex justify-center px-4 py-10">
      <div
        className="
          w-full max-w-6xl
          rounded-3xl
          shadow-2xl
          px-6 py-10 md:px-12 md:py-14

          /* LIGHT MODE */
          bg-gradient-to-b from-fuchsia-50 to-fuchsia-100
          text-gray-800

          /* DARK MODE */
          dark:bg-gradient-to-b dark:from-purple-900 dark:to-fuchsia-900
          dark:text-fuchsia-100
        "
      >
        {/* Header (text from FIRST, styling from SECOND) */}
        <section className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-fuchsia-700 dark:text-fuchsia-200">
            Browse Courses
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-fuchsia-100/80 max-w-2xl mx-auto">
            Explore a series of interactive lessons designed to help you
            understand and manage endometriosis at your own pace.
          </p>
        </section>

        {/* Courses Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {courses.length === 0 && (
            <p className="col-span-full text-center text-gray-500 dark:text-fuchsia-100/80">
              Loading courses...
            </p>
          )}

          {courses.map((course, index) => (
            <div
              key={`${course.course_id}-${index}`}
              className="
                p-5 rounded-2xl flex flex-col justify-between transition hover:scale-[1.02]

                /* LIGHT MODE */
                bg-white shadow-sm hover:shadow-md

                /* DARK MODE */
                dark:bg-white/5 dark:border dark:border-white/10
                dark:hover:bg-white/10
              "
            >
              <div>
                <h3 className="text-lg font-semibold mb-2 text-fuchsia-700 dark:text-fuchsia-50">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-fuchsia-100/90 mb-4">
                  {course.description}
                </p>
              </div>

              {/* ✅ Link + button behavior from FIRST component */}
              <Link
                href={`/courses/${course.course_id}`}
                className={`inline-block text-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isLoggedIn
                    ? "bg-fuchsia-600 text-white hover:bg-fuchsia-700"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                }`}
              >
                {isLoggedIn ? "View Course" : "Preview Course"}
              </Link>
            </div>
          ))}

          {/* ✅ Admin Create Card: links/labels from FIRST, styling from SECOND */}
          {role === "admin" && (
            <div
              className="
                p-5 rounded-2xl flex flex-col justify-center items-center transition hover:scale-[1.02]

                /* LIGHT MODE */
                bg-fuchsia-100 border-2 border-dashed border-fuchsia-400 hover:bg-fuchsia-200

                /* DARK MODE */
                dark:bg-white/5 dark:border-fuchsia-300
                dark:hover:bg-white/10
              "
            >
              <h3 className="text-lg font-semibold mb-2 text-fuchsia-700 dark:text-fuchsia-50">
                Create New Course
              </h3>
              <Link
                href="/createcourse"
                className="inline-block text-center px-4 py-2 mt-1 rounded-lg bg-fuchsia-600 text-white text-sm font-medium hover:bg-fuchsia-700 transition"
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
