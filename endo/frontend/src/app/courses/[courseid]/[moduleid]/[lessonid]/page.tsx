"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchAll = async () => {
      try {
        const lessonRes = await fetch(
          `https://cs3028.onrender.com/lessons/${lessonId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!lessonRes.ok) throw new Error("Lesson not found");
        const lessonData = await lessonRes.json();
        setLesson(lessonData);

        const quizRes = await fetch(
          `https://cs3028.onrender.com/lessons/${lessonId}/quizzes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!quizRes.ok) {
          setQuizzes([]);
          return;
        }

        const rawQuizzes = await quizRes.json();
        const parsedQuizzes = rawQuizzes.map((q: any) => ({
          ...q,
          options: Array.isArray(q.options)
            ? q.options
            : JSON.parse(q.options),
        }));

        setQuizzes(parsedQuizzes);
      } catch {
        setLesson(null);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [lessonId, router]);

  const selectAnswer = (quizId: number, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [quizId]: option }));
  };

  const submitQuiz = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !lesson) return;

    const allCorrect = quizzes.every(
      (q) => answers[q.id] === q.correct_option
    );

    setSubmitted(true);
    setPassed(allCorrect);

    if (!allCorrect) return;

    await fetch(
      `https://cs3028.onrender.com/lessons/${lessonId}/progress`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (courseId && moduleId) {
      router.push(`/courses/${courseId}/${moduleId}`);
    } else {
      router.push("/courses");
    }
  };

  const tryAgain = () => {
    setAnswers({});
    setSubmitted(false);
    setPassed(null);
  };

  // Loading & empty states styled to match app
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 dark:text-fuchsia-100/80 text-center">
          Loading...
        </p>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 dark:text-fuchsia-100/80 text-center">
          Lesson not found.
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
        {/* Lesson Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fuchsia-700 dark:text-fuchsia-100 mb-3">
            {lesson.title}
          </h1>

          {lesson.content_type === "text" && (
            <div className="prose max-w-none text-gray-800 dark:text-fuchsia-100/90">
              {lesson.text_content}
            </div>
          )}
        </header>

        {/* Quiz Section */}
        {quizzes.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-fuchsia-700 dark:text-fuchsia-100">
              Quiz
            </h2>

            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="
                  rounded-2xl p-5 space-y-3

                  /* LIGHT MODE */
                  bg-white shadow-sm

                  /* DARK MODE */
                  dark:bg-white/5 dark:border dark:border-white/10
                "
              >
                <p className="font-semibold text-gray-800 dark:text-fuchsia-50">
                  {quiz.question}
                </p>

                <div className="space-y-2">
                  {quiz.options.map((option, idx) => {
                    const selected = answers[quiz.id] === option;
                    const correct = option === quiz.correct_option;
                    const show = submitted;

                    let baseClasses =
                      "w-full text-left border rounded-xl px-3 py-2 text-sm cursor-pointer transition";
                    let stateClasses =
                      "border-fuchsia-200 bg-white hover:bg-fuchsia-50 text-gray-800";

                    if (show && selected && correct) {
                      stateClasses =
                        "border-green-400 bg-green-100 text-green-900";
                    } else if (show && selected && !correct) {
                      stateClasses =
                        "border-red-400 bg-red-100 text-red-900";
                    } else if (show && correct) {
                      stateClasses =
                        "border-green-300 bg-green-50 text-green-900";
                    } else if (!show && selected) {
                      stateClasses =
                        "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-900";
                    }

                    const darkClasses =
                      "dark:border-white/20 dark:text-fuchsia-50 dark:bg-transparent dark:hover:bg-white/10";

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectAnswer(quiz.id, option)}
                        className={`${baseClasses} ${stateClasses} ${darkClasses}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Actions under quiz */}
            {!submitted && (
              <button
                onClick={submitQuiz}
                disabled={
                  Object.keys(answers).length !== quizzes.length
                }
                className={`
                  px-5 py-2.5 rounded-xl text-sm font-medium
                  bg-fuchsia-600 text-white hover:bg-fuchsia-700
                  transition 
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                Submit
              </button>
            )}

            {submitted && passed === false && (
              <div className="mt-2 space-y-2">
                <p className="text-red-600 dark:text-red-400 font-semibold">
                  Some answers are incorrect. Try again.
                </p>
                <button
                  onClick={tryAgain}
                  className="
                    px-4 py-2 rounded-xl text-sm font-medium
                    bg-yellow-500 text-white hover:bg-yellow-600
                    transition
                  "
                >
                  Try Again
                </button>
              </div>
            )}

            {submitted && passed === true && (
              <p className="text-green-600 dark:text-green-400 font-semibold mt-2">
                Lesson completed successfully.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
