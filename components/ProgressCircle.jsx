"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * Animated circular ATS score gauge — counts up and draws the ring on mount.
 */
export default function ProgressCircle({
  score = 92,
  size = 152,
  strokeWidth = 10,
  label = "ATS Score",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [display, setDisplay] = useState(0);
  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, (v) => circumference - (v / 100) * circumference);

  useEffect(() => {
    const controls = animate(progress, score, {
      duration: 1.4,
      delay: 0.3,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const tone = score >= 80 ? "var(--score)" : score >= 55 ? "#f5b944" : "#f45c6a";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${tone}33, transparent 70%)` }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-data text-3xl font-semibold text-[var(--text)]">
          {display}
        </span>
        <span className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
          {label}
        </span>
      </div>
    </div>
  );
}
