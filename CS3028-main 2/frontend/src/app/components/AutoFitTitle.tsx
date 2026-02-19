"use client";

import { useEffect, useRef, useState } from "react";

export default function AutoFitTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(144); // 9xl ≈ 144px

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const maxHeight = 2 * 144 * 1.1; // 2 lines * font size * line-height
    let size = 144;

    el.style.fontSize = `${size}px`;

    while (el.scrollHeight > maxHeight && size > 48) {
      size -= 2;
      el.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [text]);

  return (
    <h1
      ref={ref}
      className="font-bold text-fuchsia-700 leading-tight break-words"
      style={{ fontSize }}
    >
      {text}
    </h1>
  );
}
