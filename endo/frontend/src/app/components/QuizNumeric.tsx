"use client";

import { useState } from "react";

interface NumericQuiz {
  id: number;
  type: "numeric";
  question: string;
  correct_numeric_answer?: [number, number, number]; // [lower, answer, upper]
}

interface QuizNumericProps {
  quiz: NumericQuiz;
  answer?: number;
  onSelectAnswer: (quizId: number, value: number) => void;
  submitted: boolean;
  step: number;
}

export const QuizNumeric = ({
  quiz,
  answer,
  onSelectAnswer,
  submitted,
  step,
}: QuizNumericProps) => {
  const [hover, setHover] = useState(false);

  // destructure numeric range: [lower, correctAnswer, upper]
  const [min, correctAnswer, max] = quiz.correct_numeric_answer ?? [0, 0, 100];

  const safeAnswer = answer ?? min;

  // Compute percentage for a visual progress bar
  const percent = ((safeAnswer - min) / (max - min)) * 100;

  return (
    <div
      className={`
        p-5 rounded-2xl bg-[#efefef]
        shadow-[-8px_8px_16px_rgba(0,0,0,0.2),
                8px_-8px_16px_rgba(255,255,255,0.7),
                inset_-1px_1px_2px_rgba(255,255,255,0.7),
                inset_1px_-1px_2px_rgba(0,0,0,0.1)]
      `}
    >
      <p className="text-gray-700 font-medium mb-4">{quiz.question}</p>

      <div className="relative flex items-center gap-3">
        <span className="text-gray-500">{min}</span>

        <div className="flex-1 relative">
          {/* Range track background */}
          <div className="absolute inset-0 h-3 rounded-full bg-[#e0e0e0]"></div>
          {/* Filled portion */}
          <div
            className="absolute h-4 rounded-full bg-fuchsia-300"
            style={{ width: `${percent}%` }}
          ></div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={safeAnswer}
            disabled={submitted}
            onChange={(e) => onSelectAnswer(quiz.id, Number(e.target.value))}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={`
              relative w-full  appearance-none bg-transparent
              cursor-pointer
              ${submitted ? "opacity-60 cursor-not-allowed" : ""}
            `}
          />
        </div>

        <span className="text-gray-500">{max}</span>
      </div>

      {/* Thumb value bubble */}
      <div
        className={`
          mt-3 w-max mx-auto px-3 py-1 rounded-xl text-gray-700 font-semibold
          bg-[#efefef] shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.7),
                               inset_1px_1px_2px_rgba(0,0,0,0.1)]
        `}
      >
        {safeAnswer}
      </div>

      {submitted && answer !== correctAnswer && (
        <p className="text-red-500 mt-3 text-center font-medium">
          Correct answer: {correctAnswer}
        </p>
      )}
    </div>
  );
};