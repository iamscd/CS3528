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
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
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
          `http://127.0.0.1:5000/modules/${moduleid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (moduleRes.status === 401)
          throw new Error("You are not authorized. Please log in again.");
        if (!moduleRes.ok) throw new Error("Module not found");
        const moduleData = await moduleRes.json();

        const lessonsRes = await fetch(
          `http://127.0.0.1:5000/modules/${moduleid}/lessons`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const lessonsData = lessonsRes.ok ? await lessonsRes.json() : [];

        setModule(moduleData);
        setLessons(lessonsData);

        const progressResults = await Promise.all(
          lessonsData.map((lesson: Lesson) =>
            fetch(`http://127.0.0.1:5000/lessons/${lesson.id}/progress`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json())
          )
        );

        const completedIds = progressResults
          .map((p, idx) => (p.is_completed ? lessonsData[idx].id : null))
          .filter(Boolean) as number[];

        setCompletedLessons(completedIds);
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

  const completedCount = completedLessons.length;
  const totalCount = lessons.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
        <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
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
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl px-6 py-8 md:px-10 md:py-10 bg-gradient-to-b from-fuchsia-50 to-fuchsia-100 text-gray-800 dark:bg-gradient-to-b dark:from-purple-900 dark:to-fuchsia-900 dark:text-fuchsia-100">
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

        <div className="mb-6">
          <div className="w-full h-3 bg-gray-300 rounded-full dark:bg-white/20">
            <div
              className="h-3 bg-green-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm mt-1 text-gray-700 dark:text-fuchsia-100/80">
            {completedCount}/{totalCount} Lessons Completed
          </p>
        </div>

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
              {lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${courseid}/${moduleid}/${lesson.id}`}
                      className={`block p-4 rounded-2xl transition shadow-sm hover:shadow-md hover:scale-[1.01] ${
                        isCompleted
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-white text-fuchsia-700 dark:bg-white/5 dark:text-fuchsia-50"
                      }`}
                    >
                      <span className="font-medium">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-fuchsia-300 text-fuchsia-700 bg-white/70 hover:bg-white transition dark:bg-transparent dark:border-fuchsia-200 dark:text-fuchsia-100 dark:hover:bg-white/5"
          >
            Back
          </button>

          {courseid && (
            <Link
              href={`/courses/${courseid}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
            >
              Back to Course
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
