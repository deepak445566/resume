"use client";

import { XCircle } from "lucide-react";

/**
 * Grid of the skills the selected role expects that were NOT found
 * in the resume — the keyword gaps to close.
 */
export default function MissingSkills({ skills = [] }) {
  if (!skills.length) {
    return (
      <div className="glass-card rounded-2xl border-[var(--score)]/25 p-6 text-center text-sm text-[var(--text-muted)]">
        Nothing missing — your resume covers every skill this role expects.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">
          Missing skills
        </h3>
        <span className="font-data text-xs text-[var(--text-faint)]">
          {skills.length} to add
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Weave these keywords into your resume wherever they genuinely apply.
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="flex items-center gap-2 rounded-lg border border-[#f45c6a]/25 bg-[#f45c6a]/10 px-3 py-2 text-sm text-[var(--text)]"
          >
            <XCircle className="h-3.5 w-3.5 shrink-0 text-[#f45c6a]" />
            <span className="truncate">{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
