"use client";

import React, { useState } from "react";

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
  const safeOptions = quiz.options ?? [];
  const correct = quiz.correct_option;

  return (
    <div
      className="rounded-2xl p-5 space-y-3 bg-[#efefef]"
      style={{
        boxShadow:
          "inset -3px -3px 6px rgba(255,255,255,0.8), inset 3px 3px 6px rgba(0,0,0,0.15)",
      }}
    >
      <p className="font-semibold text-gray-800">{quiz.question}</p>

      {safeOptions.length ? (
        <div className="space-y-2">
          {safeOptions.map((option) => {
            // default style
            let optionStyle = {
              backgroundColor: "#efefef",
              color: "#4B5563", // text-gray-700
            };

            if (!submitted && answer === option) {
              // selected before submission – slightly darker
              optionStyle = { backgroundColor: "#e0e0e0", color: "#4B5563" };
            } else if (submitted && answer === option) {
              // selected and submitted
              optionStyle = { backgroundColor: "#d1fae5", color: "#065f46" }; // green-100 / green-900
            } else if (submitted && option === correct && answer !== correct) {
              // correct option after wrong submission
              optionStyle = { backgroundColor: "#fee2e2", color: "#991b1b" }; // red-100 / red-900
            }

            return (
              <button
                key={option}
                disabled={submitted}
                onClick={() => onSelectAnswer(quiz.id, option)}
                style={{
                  ...optionStyle,
                  boxShadow:
                    "inset -2px -2px 5px rgba(255,255,255,0.8), inset 2px 2px 5px rgba(0,0,0,0.1)",
                  borderRadius: "0.75rem",
                }}
                className="w-full text-left px-4 py-2 transition-all hover:shadow-[inset_-4px_-4px_6px_rgba(255,255,255,0.8),inset_4px_4px_6px_rgba(0,0,0,0.1)]"
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 italic">No options available</p>
      )}

      {submitted && answer !== correct && (
        <p className="text-sm text-gray-700">
          Correct Answer: <span className="font-semibold">{correct}</span>
        </p>
      )}
    </div>
  );
};

// Example usage
export default function QuizPage() {
  const quiz: MultipleChoiceQuiz = {
    id: 1,
    type: "multiple-choice",
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Rome"],
    correct_option: "Paris",
  };

  const [answer, setAnswer] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="p-10 max-w-md mx-auto space-y-4">
      <QuizMultipleChoice
        quiz={quiz}
        answer={answer}
        submitted={submitted}
        onSelectAnswer={(id, val) => setAnswer(val)}
      />
      <button
        onClick={() => setSubmitted(true)}
        disabled={submitted || !answer}
        className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:bg-gray-300"
      >
        Submit
      </button>
    </div>
  );
}