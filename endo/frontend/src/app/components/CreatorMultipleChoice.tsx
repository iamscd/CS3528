import SoftButton from "@/app/components/SoftButton";

const inputClass =
  "w-full p-3 rounded-2xl bg-[#efefef] text-gray-800 placeholder-gray-400 outline-none shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.8),inset_2px_2px_5px_rgba(0,0,0,0.1)] focus:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.9),inset_3px_3px_7px_rgba(0,0,0,0.15)] transition";

interface Props {
  options: string[];
  correctAnswer: string;
  onOptionChange: (index: number, value: string) => void;
  onAddOption: () => void;
  onCorrectAnswerChange: (value: string) => void;
}

export function CreatorMultipleChoice({ options, correctAnswer, onOptionChange, onAddOption, onCorrectAnswerChange }: Props) {
  return (
    <div className="space-y-2">
      {options.map((o, i) => (
        <input
          key={i}
          value={o}
          placeholder={`Option ${i + 1}`}
          onChange={(e) => onOptionChange(i, e.target.value)}
          className={inputClass}
        />
      ))}
      <button onClick={onAddOption} className="text-xs text-fuchsia-700 transition">
        + Add Option
      </button>
      <select
        value={correctAnswer}
        onChange={(e) => onCorrectAnswerChange(e.target.value)}
        className={inputClass}
      >
        <option value="">Select Correct Answer</option>
        {options.map((o, i) => (
          <option key={i} value={o}>{o || `Option ${i + 1}`}</option>
        ))}
      </select>
    </div>
  );
}
