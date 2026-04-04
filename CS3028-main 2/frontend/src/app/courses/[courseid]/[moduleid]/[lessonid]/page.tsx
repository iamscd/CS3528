"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SoftSidebar from "@/app/components/SoftSidebar";
import { QuizSection } from "@/app/components/QuizSection";

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correct_option: string;
  type: "multiple-choice"; // future types can be added here
}

interface Lesson {
  id: number;
  title: string;
  content_type: string;
  text_content: string;
  module_id?: number;
}

interface Course {
  id: number;
  title: string;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();

  // Extract IDs from params
  const lessonIdParam = Array.isArray(params.lessonid) ? params.lessonid[0] : params.lessonid;
  const moduleIdParam = Array.isArray(params.moduleid) ? params.moduleid[0] : params.moduleid;
  const courseIdParam = Array.isArray(params.courseid) ? params.courseid[0] : params.courseid;

  // Use state for lesson, quizzes, sidebar items, loading
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Early return if no lessonId
  if (!lessonIdParam) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#efefef]">
        <p className="text-gray-600">Lesson not found.</p>
      </main>
    );
  }

  // Fetch courses for sidebar
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://127.0.0.1:5000/courses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok && res.json())
      .then((data) => data && setCourses(data))
      .catch(console.error);
  }, []);

  // Fetch lesson, quizzes, module lessons
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchLessonData = async () => {
      setLoading(true);
      try {
        // Fetch lesson
        const lessonRes = await fetch(`http://127.0.0.1:5000/lessons/${lessonIdParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!lessonRes.ok) throw new Error("Lesson not found");
        const lessonData: Lesson = await lessonRes.json();
        setLesson(lessonData);

        // Fetch quizzes
        const quizRes = await fetch(`http://127.0.0.1:5000/lessons/${lessonIdParam}/quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (quizRes.ok) {
          const rawQuizzes = await quizRes.json();
          const parsedQuizzes: Quiz[] = rawQuizzes.map((q: any) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
            type: "multiple-choice",
          }));
          setQuizzes(parsedQuizzes);
        }

        // Fetch module lessons if moduleId exists
        if (moduleIdParam) {
          const moduleRes = await fetch(
            `http://127.0.0.1:5000/modules/${moduleIdParam}/lessons`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (moduleRes.ok) {
            const lessons: Lesson[] = await moduleRes.json();
            setModuleLessons(lessons);
          }
        }
      } catch (err) {
        console.error(err);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonIdParam, moduleIdParam, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#efefef]">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#efefef]">
        <p className="text-gray-600">Lesson not found.</p>
      </main>
    );
  }

  // Sidebar items
  const sidebarItems = moduleLessons.length
    ? moduleLessons.map((l) => ({
        label: l.title,
        href: `/courses/${courseIdParam}/${moduleIdParam}/${l.id}`,
        disabled: l.id === lesson.id,
      }))
    : courses.map((c) => ({
        label: c.title,
        href: `/courses/${c.id}`,
      }));

  return (
    <main className="min-h-screen bg-[#efefef] px-6 md:px-10 py-10">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Sidebar */}
        <SoftSidebar
          items={sidebarItems}
          header="Lessons"
          headerHref={`/courses/${courseIdParam}`}
          className="flex-shrink-0"
        />

        {/* Lesson Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Lesson Box */}
          <div className="rounded-3xl p-6 md:p-10 bg-[#efefef] shadow-[-12px_12px_24px_rgba(0,0,0,0.2),12px_-12px_24px_rgba(255,255,255,0.9)]">
            <button
              onClick={() => router.back()}
              className="mb-6 px-4 py-2 rounded-xl text-sm font-medium text-fuchsia-700 bg-[#efefef] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.15)]"
            >
              ← Back
            </button>

            <header>
              <h1 className="text-3xl md:text-4xl font-bold text-fuchsia-700 mb-4">{lesson.title}</h1>
              {lesson.content_type === "text" && (
                <div className="prose max-w-none text-gray-800">{lesson.text_content}</div>
              )}
            </header>
          </div>

          {/* Quiz Section */}
          {quizzes.length > 0 && <QuizSection quizzes={quizzes} lessonId={lessonIdParam} />}
        </div>
      </div>
    </main>
  );
}