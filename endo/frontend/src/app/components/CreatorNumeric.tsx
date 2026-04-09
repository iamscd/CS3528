const inputClass =
  "w-full p-3 rounded-2xl bg-[#efefef] text-gray-800 placeholder-gray-400 outline-none shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.8),inset_2px_2px_5px_rgba(0,0,0,0.1)] focus:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.9),inset_3px_3px_7px_rgba(0,0,0,0.15)] transition";

interface Props {
  value: [number, number, number] | null;
  onChange: (index: 0 | 1 | 2, value: number) => void;
}

export function CreatorNumeric({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <input
        type="number"
        placeholder="Lower bound"
        value={value?.[0] ?? ""}
        onChange={(e) => onChange(0, Number(e.target.value))}
        className={inputClass}
      />
      <input
        type="number"
        placeholder="Answer"
        value={value?.[1] ?? ""}
        onChange={(e) => onChange(1, Number(e.target.value))}
        className={inputClass}
      />
      <input
        type="number"
        placeholder="Upper bound"
        value={value?.[2] ?? ""}
        onChange={(e) => onChange(2, Number(e.target.value))}
        className={inputClass}
      />
    </div>
  );
}