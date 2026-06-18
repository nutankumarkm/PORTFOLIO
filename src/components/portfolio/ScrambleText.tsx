"use client";

import { useEffect, useRef, useState } from "react";

interface ScrambleTextProps {
  text: string;
  className?: string;
  trigger?: "hover" | "view" | "mount";
  speed?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?/\\|";

export function ScrambleText({
  text,
  className = "",
  trigger = "mount",
  speed = 1,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (trigger !== "mount") return;
    setStarted(true);
  }, [trigger]);

  useEffect(() => {
    if (trigger !== "view" || !ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStarted(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [trigger]);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const totalFrames = Math.floor(text.length * 4 / speed);
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const revealed = Math.floor(progress * text.length);
      const scrambled = text
        .split("")
        .map((ch, i) => {
          if (i < revealed || ch === " ") return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");
      setDisplay(scrambled);
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  const handleEnter = () => {
    if (trigger !== "hover") return;
    setStarted(false);
    setTimeout(() => setStarted(true), 20);
  };

  return (
    <span ref={ref} className={className} onMouseEnter={handleEnter}>
      {display}
    </span>
  );
}
