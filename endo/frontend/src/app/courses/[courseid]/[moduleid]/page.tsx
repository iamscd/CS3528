"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Lesson {
  id: number;
  title: string;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  course_id?: number;
}

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();

  const moduleid = Array.isArray(params.moduleid)
    ? params.moduleid[0]
    : params.moduleid;

  const courseid = Array.isArray(params.courseid)
    ? params.courseid[0]
    : params.courseid;

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleid) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const moduleRes = await fetch(
          `https://cs3028.onrender.com/modules/${moduleid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (moduleRes.status === 401) {
          throw new Error("You are not authorized. Please log in again.");
        }

        if (!moduleRes.ok) {
          throw new Error("Module not found");
        }

        const moduleData = await moduleRes.json();

        const lessonsRes = await fetch(
          `https://cs3028.onrender.com/modules/${moduleid}/lessons`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const lessonsData = lessonsRes.ok ? await lessonsRes.json() : [];

        setModule(moduleData);
        setLessons(lessonsData);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setModule(null);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleid, router]);

  // Loading / error states with consistent styling
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 dark:text-fuchsia-100/80 text-center">
          Loading...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-500 dark:text-red-400 text-center">
          {error}
        </p>
      </main>
    );
  }

  if (!module) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 dark:text-fuchsia-100/80 text-center">
          Module not found.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center px-4 py-10">
      <div
        className="
          w-full max-w-3xl
          rounded-3xl
          shadow-2xl
          px-6 py-8 md:px-10 md:py-10

          /* LIGHT MODE */
          bg-gradient-to-b from-fuchsia-50 to-fuchsia-100
          text-gray-800

          /* DARK MODE */
          dark:bg-gradient-to-b dark:from-purple-900 dark:to-fuchsia-900
          dark:text-fuchsia-100
        "
      >
        {/* Module Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fuchsia-700 dark:text-fuchsia-100">
            {module.title}
          </h1>
          {module.description && (
            <p className="mt-2 text-sm md:text-base text-gray-700 dark:text-fuchsia-100/80">
              {module.description}
            </p>
          )}
        </header>

        {/* Lessons */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-fuchsia-700 dark:text-fuchsia-100 mb-4">
            Lessons
          </h2>

          {lessons.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-fuchsia-100/80">
              No lessons available for this module yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  {/* ✅ Link path unchanged */}
                  <Link
                    href={`/courses/${courseid}/${moduleid}/${lesson.id}`}
                    className="
                      block p-4 rounded-2xl transition

                      /* LIGHT MODE */
                      bg-white shadow-sm hover:shadow-md hover:scale-[1.01]

                      /* DARK MODE */
                      dark:bg-white/5 dark:border dark:border-white/10
                      dark:hover:bg-white/10
                    "
                  >
                    <span className="font-medium text-fuchsia-700 dark:text-fuchsia-50">
                      {lesson.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => router.back()}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              border border-fuchsia-300
              text-fuchsia-700
              bg-white/70
              hover:bg-white
              transition

              dark:bg-transparent dark:border-fuchsia-200
              dark:text-fuchsia-100 dark:hover:bg-white/5
            "
          >
            Back
          </button>

          {courseid && (
            <Link
              href={`/courses/${courseid}`}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-fuchsia-600 text-white
                hover:bg-fuchsia-700
                transition
              "
            >
              Back to Course
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
