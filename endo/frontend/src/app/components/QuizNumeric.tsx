"use client";


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
  // destructure numeric range: [lower, correctAnswer, upper]
  const [min, correctAnswer, max] = quiz.correct_numeric_answer ?? [0, 0, 100];

  const safeAnswer = answer ?? min;

  // Compute percentage for a visual progress bar
  const percent = ((safeAnswer - min) / (max - min)) * 100;

  return (
    <div style={{
      background: "rgba(180,160,240,0.08)",
      border: "0.5px solid rgba(180,160,240,0.2)",
      borderRadius: 14,
      padding: 20,
    }}>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#3C3489", margin: "0 0 16px" }}>{quiz.question}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#7F77DD" }}>{min}</span>

        <div style={{ flex: 1, position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, borderRadius: 2, background: "rgba(180,160,240,0.2)", transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: 0, height: 4, borderRadius: 2, background: "#7F77DD", width: `${percent}%`, transform: "translateY(-50%)" }} />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={safeAnswer}
            disabled={submitted}
            onChange={(e) => onSelectAnswer(quiz.id, Number(e.target.value))}
style={{ position: "relative", width: "100%", appearance: "none", background: "transparent", cursor: submitted ? "not-allowed" : "pointer", opacity: submitted ? 0.7 : 1 }}
          />
        </div>

        <span style={{ fontSize: 13, color: "#7F77DD" }}>{max}</span>
      </div>

      <div style={{
        marginTop: 12, width: "fit-content", margin: "12px auto 0",
        padding: "4px 14px", borderRadius: 8,
        background: "rgba(83,74,183,0.1)", border: "0.5px solid rgba(180,160,240,0.35)",
        fontSize: 14, fontWeight: 600, color: "#534AB7",
      }}>
        {safeAnswer}
      </div>

      {submitted && answer !== correctAnswer && (
        <p style={{ fontSize: 13, fontWeight: 600, color: "#A32D2D", textAlign: "center", marginTop: 10 }}>
          Correct answer: {correctAnswer}
        </p>
      )}
    </div>
  );
};