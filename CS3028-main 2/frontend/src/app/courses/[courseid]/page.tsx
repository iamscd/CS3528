"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SoftDropdown from "@/app/components/SoftDropdown";
import SoftSidebar from "@/app/components/SoftSidebar";
import SoftButton from "@/app/components/SoftButton";
import AutoFitTitle from "@/app/components/AutoFitTitle";
interface Lesson {
  id: number;
  title: string;
}

interface Module {
  id: number;
  title: string;
  description?: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

export default function CoursePage() {
  const { courseid } = useParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleLessons, setModuleLessons] = useState<{ [key: number]: Lesson[] }>({});
  const [moduleProgress, setModuleProgress] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchCourses = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/courses", { headers });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data: Course[] = await res.json();
        setCourses(data.map(c => ({ id: c.id, title: c.title, description: c.description })));
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!courseid) return;

    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchData = async () => {
      setLoading(true);
      try {
        const courseRes = await fetch(`http://127.0.0.1:5000/courses/${courseid}`, { headers });
        if (!courseRes.ok) throw new Error("Course not found");
        const courseData = await courseRes.json();
        setCourse(courseData);

        const modulesRes = await fetch(`http://127.0.0.1:5000/courses/${courseid}/modules`, { headers });
        const modulesData: Module[] = modulesRes.ok ? await modulesRes.json() : [];
        setModules(modulesData);

        const lessonsObj: { [key: number]: Lesson[] } = {};
        const progressObj: { [key: number]: number } = {};

        await Promise.all(
          modulesData.map(async (module) => {
            const lessonsRes = await fetch(`http://127.0.0.1:5000/modules/${module.id}/lessons`, { headers });
            const lessonsData: Lesson[] = lessonsRes.ok ? await lessonsRes.json() : [];
            lessonsObj[module.id] = lessonsData;

            if (lessonsData.length === 0) {
              progressObj[module.id] = 0;
              return;
            }

            const progressResults = await Promise.all(
              lessonsData.map((lesson) =>
                fetch(`http://127.0.0.1:5000/lessons/${lesson.id}/progress`, { headers }).then(res => res.json())
              )
            );

            const completedCount = progressResults.filter(p => p.is_completed).length;
            progressObj[module.id] = completedCount / lessonsData.length;
          })
        );

        setModuleLessons(lessonsObj);
        setModuleProgress(progressObj);
      } catch {
        setCourse(null);
        setModules([]);
        setModuleLessons({});
        setModuleProgress({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseid]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#efefef]">
        <p className="text-gray-600 text-center">Loading...</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#efefef]">
        <p className="text-gray-600 text-center">Course not found.</p>
      </main>
    );
  }

  const sidebarItems = courses.map(c => ({
    label: c.title,
    href: `/courses/${c.id}`,
  }));

  return (
      <main className="min-h-screen mx-auto p-4 flex px-10 py-10 gap-6 bg-[#efefef] shadow-[inset_0px_8px_16px_rgba(0,0,0,0.2)]">
        {/* Sidebar */}
        <SoftSidebar items={sidebarItems} header={"Courses" } headerHref={"/courses"} className="flex-shrink-0" />

        {/* Main Content */}
        <div className="flex-1 rounded-3xl bg-[#efefef] text-gray-800 p-6 md:p-10 shadow-none">
          {/* Course Header */}
          <header className="mb-8">
            <div className="mb-3 max-h-[316px] overflow-hidden">
              <AutoFitTitle text={course.title} />
            </div>
            <p className="text-sm md:text-base text-gray-700">{course.description}</p>
          </header>

          {/* Modules Section */}
          <section>
            <h2 className="text-2xl font-semibold text-fuchsia-700 mb-4">Modules</h2>
            {modules.length === 0 ? (
              <p className="text-gray-600 text-sm">No modules found for this course.</p>
            ) : (
              <ul className="space-y-10">
                {modules.map(module => {
                  const lessons = moduleLessons[module.id] || [];
                  const progress = moduleProgress[module.id] || 0;
                  const completed = progress === 1;

                  const items = lessons.length === 0
                    ? [{ label: "No lessons available", href: "#" }]
                    : lessons.map(lesson => ({
                        label: lesson.title,
                        href: `/courses/${courseid}/${module.id}/${lesson.id}`,
                      }));

                  return (
                    <li key={module.id}>
                      <SoftDropdown
                        label={
                          <div className={`font-semibold ${completed ? "text-green-800" : "text-fuchsia-700"}`}>
                            {module.title} — {Math.round(progress * 100)}%
                          </div>
                        }
                        items={items}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Back Button */}
          <div className="mt-6 flex flex-wrap gap-3">
            <SoftButton
              href="/courses"
              width="w-20"
            >
              Back
            </SoftButton>
          </div>
        </div>
      </main>
  );
}
``