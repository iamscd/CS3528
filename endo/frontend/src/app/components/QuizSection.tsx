"use client";

import { useState } from "react";
import { QuizMultipleChoice } from "./QuizMultipleChoice";
import { QuizNumeric } from "./QuizNumeric";

// Updated types
type RawQuiz = {
  id: number;
  question: string;
  options?: string[] | null;
  correct_option?: string | null;
  correct_numeric_answer?: [number, number, number] | null; // [min, correctAnswer, max]
};

type LessonQuiz = RawQuiz & { type: "numeric" | "multiple-choice" | "invalid" };

interface Props {
  quizzes: RawQuiz[];
  lessonId: string;
}

export const QuizSection = ({ quizzes, lessonId }: Props) => {
  const [answers, setAnswers] = useState<{ [key: number]: string | number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);

  const selectAnswer = (quizId: number, value: string | number) => {
    if (submitted && passed) return;
    setAnswers((prev) => ({ ...prev, [quizId]: value }));
  };

  // Detect quiz type
  const getQuizType = (quiz: RawQuiz): "numeric" | "multiple-choice" | "invalid" => {
    if (quiz.correct_numeric_answer != null) return "numeric";
    if (quiz.correct_option != null && Array.isArray(quiz.options)) return "multiple-choice";
    return "invalid";
  };

  const submitQuiz = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const allCorrect = quizzes.every((q) => {
      const answer = answers[q.id];
      const type = getQuizType(q);

      if (type === "multiple-choice" && typeof answer === "string") {
        return answer === (q.correct_option ?? "");
      }

      if (type === "numeric" && typeof answer === "number") {
        const [min, correctAnswer, max] = q.correct_numeric_answer ?? [0, 0, 100];
        return answer === correctAnswer; // exact match; can adjust tolerance if needed
      }

      return false;
    });

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

  return (
    <div className="rounded-3xl p-6 md:p-10 bg-[#efefef] shadow-[-12px_12px_24px_rgba(0,0,0,0.2),12px_-12px_24px_rgba(255,255,255,0.9)]">
      <h2 className="text-2xl font-semibold text-fuchsia-700 mb-4">Quiz</h2>

      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const type = getQuizType(quiz);

          if (type === "multiple-choice") {
            return (
              <QuizMultipleChoice
                key={quiz.id}
                quiz={{
                  ...quiz,
                  options: quiz.options ?? [],
                  correct_option: quiz.correct_option ?? "",
                  type,
                }}
                answer={answers[quiz.id] as string | undefined}
                onSelectAnswer={selectAnswer}
                submitted={submitted}
              />
            );
          }

          if (type === "numeric") {
            // Ensure correct_numeric_answer is [min, answer, max] or undefined
            const numericQuiz = {
              ...quiz,
              type,
              correct_numeric_answer: quiz.correct_numeric_answer ?? undefined,
            };

            return (
              <QuizNumeric
                key={quiz.id}
                quiz={numericQuiz}
                answer={answers[quiz.id] as number | undefined}
                onSelectAnswer={selectAnswer}
                submitted={submitted}
                step={1}
              />
            );
          }

          return (
            <p key={quiz.id} className="text-gray-500 italic">
              Invalid quiz data
            </p>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={submitQuiz}
          disabled={Object.keys(answers).length !== quizzes.length}
          className="mt-4 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 transition disabled:opacity-60"
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

      {passed && (
        <p className="text-green-600 font-semibold mt-2">
          Lesson completed successfully.
        </p>
      )}
    </div>
  );
};