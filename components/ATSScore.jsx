"use client";

import { Info } from "lucide-react";
import ProgressCircle from "@/components/ProgressCircle";

// Verdict copy/thresholds intentionally mirror ProgressCircle's own
// score-to-color bands so the ring color and the headline always agree.
function getVerdict(score) {
  if (score >= 80) {
    return {
      title: "Strong match",
      detail: "You're in great shape for this role.",
    };
  }
  if (score >= 55) {
    return {
      title: "Good match",
      detail: "A few gaps to close before you apply.",
    };
  }
  return {
    title: "Needs work",
    detail: "Several key skills are missing — worth addressing first.",
  };
}

/**
 * Headline score card for the report page: the animated progress ring
 * plus the role name, a plain-language verdict, and the raw fraction.
 *
 * `source` ("gemini" | "fallback") indicates where the comparison came
 * from — when it's "fallback" (no GEMINI_API_KEY configured), a small
 * badge makes clear this is a generic estimate, not a role-specific AI
 * analysis.
 */
export default function ATSScore({ role, score, matchedCount, totalSkills, source }) {
  const verdict = getVerdict(score);

  return (
    <div className="glass-card flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <ProgressCircle score={score} />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--violet-bright)]">
            {role}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
            {verdict.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {verdict.detail}
          </p>
          <p className="mt-3 font-data text-xs text-[var(--text-faint)]">
            {matchedCount} of {totalSkills} required skills found
          </p>
        </div>
      </div>

      {source === "fallback" && (
        <span className="inline-flex shrink-0 items-center gap-1.5 self-center rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[var(--text-faint)] sm:ml-auto sm:self-start">
          <Info className="h-3 w-3" />
          Generic estimate — add GEMINI_API_KEY for a role-specific score
        </span>
      )}
    </div>
  );
}
