"use client";

import { motion } from "framer-motion";

/**
 * Reusable loading indicator. `inline` renders a small spinner for buttons;
 * otherwise renders a centered spinner with an optional label for full sections.
 */
export default function Loading({ label = "Processing...", inline = false, size = 18 }) {
  const spinner = (
    <motion.span
      className="inline-block rounded-full border-2 border-white/20"
      style={{
        width: size,
        height: size,
        borderTopColor: "var(--violet-bright)",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {spinner}
        {label && <span>{label}</span>}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <motion.span
        className="inline-block rounded-full border-[3px] border-white/10"
        style={{ width: 40, height: 40, borderTopColor: "var(--violet-bright)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
      {label && (
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
      )}
    </div>
  );
}
