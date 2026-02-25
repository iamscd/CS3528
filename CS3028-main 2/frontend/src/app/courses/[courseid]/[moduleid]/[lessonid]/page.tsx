"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SoftSidebar from "@/app/components/SoftSidebar";

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correct_option: string;
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

  const lessonId = Array.isArray(params.lessonid)
    ? params.lessonid[0]
    : params.lessonid;

  const courseId = Array.isArray(params.courseid)
    ? params.courseid[0]
    : params.courseid;

  const moduleId = Array.isArray(params.moduleid)
    ? params.moduleid[0]
    : params.moduleid;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  /* ================= Fetch sidebar courses ================= */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const fetchCourses = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setCourses(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  /* ================= Fetch lesson + quizzes + module lessons ================= */
  useEffect(() => {
    if (!lessonId) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Lesson
        const lessonRes = await fetch(
          `http://127.0.0.1:5000/lessons/${lessonId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!lessonRes.ok) throw new Error("Lesson not found");
        const lessonData = await lessonRes.json();
        setLesson(lessonData);

        // Quizzes
        const quizRes = await fetch(
          `http://127.0.0.1:5000/lessons/${lessonId}/quizzes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (quizRes.ok) {
          const raw = await quizRes.json();
          setQuizzes(
            raw.map((q: any) => ({
              ...q,
              options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
            }))
          );
        }

        // Module lessons (for sidebar)
        if (moduleId) {
          const moduleRes = await fetch(
            `http://127.0.0.1:5000/modules/${moduleId}/lessons`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (moduleRes.ok) {
            setModuleLessons(await moduleRes.json());
          }
        }

        // Progress
        const progressRes = await fetch(
          `http://127.0.0.1:5000/lessons/${lessonId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          if (progressData.is_completed) setPassed(true);
        }
      } catch {
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, moduleId, router]);

  /* ================= Quiz functions ================= */
  const selectAnswer = (quizId: number, option: string) => {
    if (submitted || passed) return;
    setAnswers((prev) => ({ ...prev, [quizId]: option }));
  };

  const submitQuiz = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !lesson) return;

    const allCorrect = quizzes.every((q) => answers[q.id] === q.correct_option);
    setSubmitted(true);
    setPassed(allCorrect);

    if (allCorrect) {
      await fetch(`http://127.0.0.1:5000/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  };

  const tryAgain = () => {
    setAnswers({});
    setSubmitted(false);
    setPassed(null);
  };

  /* ================= Loading / Error ================= */
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

  /* ================= Sidebar items ================= */
  const sidebarItems = moduleLessons.length > 0
    ? moduleLessons.map((l) => ({
        label: l.title,
        href: `/courses/${courseId}/${moduleId}/${l.id}`,
        disabled: l.id === lesson.id,
      }))
    : courses.map((c) => ({ label: c.title, href: `/courses/${c.id}` }));

  /* ================= Render ================= */
  return (
    <main className="min-h-screen bg-[#efefef] px-6 md:px-10 py-10">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Sidebar */}
        <SoftSidebar
          items={sidebarItems}
          header="Lessons"
          headerHref={`/courses/${courseId}`}
          className="flex-shrink-0"
        />

        {/* Lesson Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* ===== Lesson Box ===== */}
          <div className="rounded-3xl p-6 md:p-10 bg-[#efefef] shadow-[-12px_12px_24px_rgba(0,0,0,0.2),12px_-12px_24px_rgba(255,255,255,0.9)]">
            <button
              onClick={() => router.back()}
              className="mb-6 px-4 py-2 rounded-xl text-sm font-medium text-fuchsia-700 bg-[#efefef] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.15)]"
            >
              ← Back
            </button>

            <header>
              <h1 className="text-3xl md:text-4xl font-bold text-fuchsia-700 mb-4">
                {lesson.title}
              </h1>
              {lesson.content_type === "text" && (
                <div className="prose max-w-none text-gray-800">
                  {lesson.text_content}
                </div>
              )}
            </header>
          </div>

          {/* ===== Quiz Box ===== */}
          {quizzes.length > 0 && (
            <div className="rounded-3xl p-6 md:p-10 bg-[#efefef] shadow-[-12px_12px_24px_rgba(0,0,0,0.2),12px_-12px_24px_rgba(255,255,255,0.9)]">
              <h2 className="text-2xl font-semibold text-fuchsia-700 mb-4">
                Quiz
              </h2>

              {quizzes.map((quiz) => (
                <div key={quiz.id} className="rounded-2xl p-5 space-y-3 bg-[#efefef] shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.8),inset_3px_3px_6px_rgba(0,0,0,0.15)]">
                  <p className="font-semibold text-gray-800">{quiz.question}</p>
                  <div className="space-y-2">
                    {quiz.options.map((option, idx) => {
                      const selected = answers[quiz.id] === option;
                      const correct = option === quiz.correct_option;
                      const show = submitted || passed;

                      let style = "bg-[#efefef] text-gray-700";
                      if (show && selected && correct) style = "bg-green-100 text-green-900";
                      else if (show && selected && !correct) style = "bg-red-100 text-red-900";
                      else if (!show && selected) style = "bg-fuchsia-100 text-fuchsia-900";

                      return (
                        <button
                          key={idx}
                          onClick={() => selectAnswer(quiz.id, option)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.15)] ${style}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!passed && !submitted && (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(answers).length !== quizzes.length}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 transition disabled:opacity-60"
                >
                  Submit
                </button>
              )}

              {submitted && passed === false && (
                <div className="space-y-2 mt-2">
                  <p className="text-red-600 font-semibold">Some answers are incorrect.</p>
                  <button
                    onClick={tryAgain}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {passed && <p className="text-green-600 font-semibold mt-2">Lesson completed successfully.</p>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}