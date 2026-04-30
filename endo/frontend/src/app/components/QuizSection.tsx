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
      await fetch(`process.env.NEXT_PUBLIC_API_URL/lessons/${lessonId}/progress`, {
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

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.55)",
    border: "0.5px solid rgba(255,255,255,0.8)",
    borderRadius: 24,
    padding: "28px 28px",
  };

  const primaryBtnStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    padding: "9px 20px", borderRadius: 10, border: "none",
    background: "#534AB7", color: "#fff", cursor: "pointer",
  };

  const secondaryBtnStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    padding: "9px 20px", borderRadius: 10,
    border: "0.5px solid rgba(83,74,183,0.3)",
    background: "transparent", color: "#534AB7", cursor: "pointer",
  };

  return (
    <div style={cardStyle}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", margin: "0 0 20px" }}>
        Quiz
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            <p key={quiz.id} style={{ fontSize: 13, color: "#7F77DD", fontStyle: "italic" }}>
              Invalid quiz data
            </p>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={submitQuiz}
          disabled={Object.keys(answers).length !== quizzes.length}
          style={{ ...primaryBtnStyle, marginTop: 20, opacity: Object.keys(answers).length !== quizzes.length ? 0.5 : 1 }}
        >
          Submit
        </button>
      )}

      {submitted && passed === false && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#A32D2D", margin: 0 }}>Some answers are incorrect.</p>
          <div>
            <button onClick={tryAgain} style={secondaryBtnStyle}>Try Again</button>
          </div>
        </div>
      )}

      {passed && (
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a7a3a", marginTop: 16 }}>
          Lesson completed successfully.
        </p>
      )}
    </div>
  );
};
