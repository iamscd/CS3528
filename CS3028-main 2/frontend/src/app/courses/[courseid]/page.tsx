"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Module {
  id: number;
  title: string;
  description: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

export default function CoursePage() {
  const { courseid } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseid) return;

    const token = localStorage.getItem("access_token");

    const fetchData = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const courseRes = await fetch(
          `http://127.0.0.1:5000/courses/${courseid}`,
          { headers }
        );
        if (!courseRes.ok) throw new Error("Course not found");
        const courseData = await courseRes.json();

        const modulesRes = await fetch(
          `http://127.0.0.1:5000/courses/${courseid}/modules`,
          { headers }
        );
        if (!modulesRes.ok) throw new Error("Modules not found");
        const modulesData = await modulesRes.json();

        setCourse(courseData);
        setModules(modulesData);

        const progressObj: { [key: number]: number } = {};

        await Promise.all(
          modulesData.map(async (module: Module) => {
            const lessonsRes = await fetch(
              `http://127.0.0.1:5000/modules/${module.id}/lessons`,
              { headers }
            );
            const lessonsData = lessonsRes.ok ? await lessonsRes.json() : [];

            if (lessonsData.length === 0) {
              progressObj[module.id] = 0;
              return;
            }

            const progressResults = await Promise.all(
              lessonsData.map((lesson: any) =>
                fetch(`http://127.0.0.1:5000/lessons/${lesson.id}/progress`, {
                  headers,
                }).then((res) => res.json())
              )
            );

            const completedCount = progressResults.filter(
              (p) => p.is_completed
            ).length;

            progressObj[module.id] = completedCount / lessonsData.length;
          })
        );

        setModuleProgress(progressObj);
      } catch {
        setCourse(null);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseid]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 dark:text-fuchsia-100/80 text-center">
          Loading...
        </p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 dark:text-fuchsia-100/80 text-center">
          Course not found.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl px-6 py-8 md:px-10 md:py-10 bg-gradient-to-b from-fuchsia-50 to-fuchsia-100 text-gray-800 dark:bg-gradient-to-b dark:from-purple-900 dark:to-fuchsia-900 dark:text-fuchsia-100">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fuchsia-700 dark:text-fuchsia-100 mb-3">
            {course.title}
          </h1>
          <p className="text-sm md:text-base text-gray-700 dark:text-fuchsia-100/80">
            {course.description}
          </p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold text-fuchsia-700 dark:text-fuchsia-100 mb-4">
            Modules
          </h2>

          {modules.length === 0 ? (
            <p className="text-gray-600 dark:text-fuchsia-100/80 text-sm">
              No modules found for this course.
            </p>
          ) : (
            <ul className="space-y-4">
              {modules.map((module) => {
                const progress = moduleProgress[module.id] || 0;
                const completed = progress === 1;

                return (
                  <li key={module.id}>
                    <Link
                      href={`/courses/${courseid}/${module.id}`}
                      className={`block p-4 rounded-2xl transition shadow-sm hover:shadow-md hover:scale-[1.01] ${
                        completed
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-white dark:bg-white/5 dark:text-fuchsia-50 text-fuchsia-700"
                      }`}
                    >
                      <h3 className="font-semibold mb-1">{module.title}</h3>
                      <p className="text-sm mb-2">{module.description}</p>

                      <div className="w-full h-3 bg-gray-300 rounded-full dark:bg-white/20">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            completed ? "bg-green-500" : "bg-fuchsia-500"
                          }`}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-gray-700 dark:text-fuchsia-100/80">
                        {Math.round(progress * 100)}% Completed
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => history.back()}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-fuchsia-300 text-fuchsia-700 bg-white/70 hover:bg-white transition dark:bg-transparent dark:border-fuchsia-200 dark:text-fuchsia-100 dark:hover:bg-white/5"
          >
            Back
          </button>
        </div>
      </div>
    </main>
  );
}
