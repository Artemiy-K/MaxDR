import React, { useEffect, useMemo, useState } from "react";

interface GlitchTextProps {
  text: string;
  intensity?: number; // 0 - 1 (насколько часто ломаются символы)
  speed?: number; // скорость обновления в мс
  className?: string;
}

const GLITCH_CHARS =
  "█▓▒░<>?/\\|{}[]!@#$%^&*()_+-=~アイウエオカキクケコサシスセソ";

const getRandomChar = () =>
  GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  intensity = 0.3,
  speed = 70,
  className = "",
}) => {
  const [displayText, setDisplayText] = useState(text);

  const characters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      const glitched = characters
        .map((char) => {
          if (char === " ") return " ";
          if (Math.random() < intensity) {
            return getRandomChar();
          }
          return char;
        })
        .join("");

      setDisplayText(glitched);
    }, speed);

    return () => clearInterval(interval);
  }, [characters, intensity, speed]);

  return (
    <span
      className={`font-extrabold tracking-widest relative inline-block ${className}`}
      data-text={displayText}
    >
      {displayText}
    </span>
  );
};
