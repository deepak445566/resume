"use client";

import { CheckCircle2 } from "lucide-react";

/**
 * Grid of the skills that were found in the resume for the selected role.
 */
export default function SkillsTable({ skills = [] }) {
  if (!skills.length) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-sm text-[var(--text-muted)]">
        No matching skills were found for this role yet.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">
          Matched skills
        </h3>
        <span className="font-data text-xs text-[var(--text-faint)]">
          {skills.length} found
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="flex items-center gap-2 rounded-lg border border-[var(--score)]/25 bg-[var(--score)]/10 px-3 py-2 text-sm text-[var(--text)]"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--score)]" />
            <span className="truncate">{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
