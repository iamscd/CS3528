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
  const options = quiz.options ?? [];
  const correct = quiz.correct_option;

  return (
    <div className="rounded-2xl p-5 space-y-3 bg-gray-100 shadow-inner">
      <p className="font-semibold text-gray-800">{quiz.question}</p>

      {options.length ? (
        <div className="space-y-2">
          {options.map((option) => {
            let bgColor = "bg-gray-100";
            let textColor = "text-gray-700";

            if (!submitted && answer === option) {
              bgColor = "bg-gray-200";
            } else if (submitted) {
              if (option === correct) {
                bgColor = "bg-green-100";
                textColor = "text-green-800";
              } else if (option === answer && answer !== correct) {
                bgColor = "bg-red-100";
                textColor = "text-red-800";
              }
            }

            return (
              <button
                key={option}
                disabled={submitted}
                onClick={() => onSelectAnswer(quiz.id, option)}
                className={`w-full text-left px-4 py-2 rounded-lg ${bgColor} ${textColor} transition`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 italic">No options available</p>
      )}

      {submitted && answer === correct && (
        <p className="text-green-800 font-medium text-center mt-2">
          Correct
        </p>
      )}
      {submitted && answer !== correct && (
        <p className="text-red-800 font-medium text-center mt-2">
          Incorrect — Correct Answer: {correct}
        </p>
      )}
    </div>
  );
};