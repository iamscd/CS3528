"use client";

import React from "react";

interface MultipleChoiceQuiz {
  id: number;
  type: "multiple-choice";
  question: string;
  options?: string[];
  correct_option: string;
}

interface QuizMultipleChoiceProps {
  quiz: MultipleChoiceQuiz;
  answer?: string;
  onSelectAnswer: (quizId: number, value: string) => void;
  submitted: boolean;
}

export const QuizMultipleChoice = ({
  quiz,
  answer,
  onSelectAnswer,
  submitted,
}: QuizMultipleChoiceProps) => {
  const options = quiz.options ?? [];
  const correct = quiz.correct_option;

  const containerStyle: React.CSSProperties = {
    background: "rgba(180,160,240,0.08)",
    border: "0.5px solid rgba(180,160,240,0.2)",
    borderRadius: 14,
    padding: 20,
  };

  const getOptionStyle = (option: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: "100%",
      textAlign: "left",
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 14,
      cursor: submitted ? "default" : "pointer",
      transition: "background 0.15s",
      border: "0.5px solid rgba(180,160,240,0.35)",
      color: "#534AB7",
      background: "transparent",
    };

    if (!submitted && answer === option) {
      return { ...base, background: "rgba(83,74,183,0.12)", border: "0.5px solid rgba(83,74,183,0.5)" };
    }

    if (submitted) {
      if (option === correct) {
        return { ...base, background: "rgba(39,174,96,0.12)", border: "0.5px solid rgba(39,174,96,0.4)", color: "#1a7a3a", cursor: "default" };
      }
      if (option === answer && answer !== correct) {
        return { ...base, background: "rgba(163,45,45,0.1)", border: "0.5px solid rgba(163,45,45,0.35)", color: "#A32D2D", cursor: "default" };
      }
      return { ...base, opacity: 0.5, cursor: "default" };
    }

    return base;
  };

  return (
    <div style={containerStyle}>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#3C3489", margin: "0 0 12px" }}>{quiz.question}</p>

      {options.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((option) => (
            <button
              key={option}
              disabled={submitted}
              onClick={() => onSelectAnswer(quiz.id, option)}
              style={getOptionStyle(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "#7F77DD", fontStyle: "italic" }}>No options available</p>
      )}

      {submitted && answer === correct && (
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a7a3a", textAlign: "center", marginTop: 10 }}>
          Correct
        </p>
      )}
      {submitted && answer !== correct && (
        <p style={{ fontSize: 13, fontWeight: 600, color: "#A32D2D", textAlign: "center", marginTop: 10 }}>
          Incorrect — Correct Answer: {correct}
        </p>
      )}
    </div>
  );
};
