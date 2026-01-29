'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Module {
  course_id: number;
  title: string;
  description: string;
}

export default function Home() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      const token = localStorage.getItem('access_token');

      try {
        const res = await fetch('https://cs3028.onrender.com/courses', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          setModules([]);
        } else {
          const data = await res.json();
          const mapped = data.map((c: any) => ({
            course_id: c.id,
            title: c.title,
            description: c.description,
          }));
          // keep original logic: only show first 3 courses
          setModules(mapped.slice(0, 3));
        }
      } catch {
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-b from-fuchsia-50 to-fuchsia-100
        dark:from-fuchsia-950 dark:to-fuchsia-900
        text-gray-800 dark:text-gray-100
        rounded-3xl
      "
    >
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-6xl font-bold text-fuchsia-700 dark:text-fuchsia-400 mb-4 leading-tight">
          <span className="block">Empowering Education</span>
          <span className="block">for Endometriosis Awareness</span>
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
          Learn about endometriosis, understand your body, and connect with a supportive community.
        </p>
        {/* link kept from the FIRST component */}
        <Link
          href="/courses"
          className="px-6 py-3 bg-fuchsia-600 text-white rounded-xl hover:bg-fuchsia-700 transition"
        >
          Start Learning
        </Link>
      </section>

      {/* Courses */}
      <section id="learn" className="px-6 py-16">
        <h3 className="text-3xl font-semibold text-center text-fuchsia-700 dark:text-fuchsia-400 mb-10">
          Explore Our Courses
        </h3>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            Loading courses...
          </p>
        ) : modules.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No courses available.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {modules.map((module) => (
              // link kept from the FIRST component
              <Link
                key={module.course_id}
                href={`/courses/${module.course_id}`}
                className="
                  p-6
                  bg-fuchsia-50 dark:bg-fuchsia-950/60
                  rounded-2xl
                  shadow-sm
                  hover:shadow-md hover:scale-[1.02]
                  transition
                  block
                "
              >
                <h4 className="text-xl font-semibold text-fuchsia-700 dark:text-fuchsia-300 mb-2">
                  {module.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {module.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
