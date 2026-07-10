"use client";

import { Briefcase } from "lucide-react";

// Just a handful of quick-pick suggestions for convenience — clicking one
// fills the text field below, but any role name can be typed in directly.
// This is UI convenience only, not a fixed list the analysis is limited to
// (that's the whole point of removing data/roles.json).
const SUGGESTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
];

/**
 * RoleSelector
 * Freeform role input — the AI comparison (lib/aiCompare.js) works out
 * what any typed role requires, so this is no longer limited to a fixed
 * list from data/roles.json.
 *
 * Props:
 *  - selectedRole: string | null — the role currently typed/selected
 *  - onSelect: (roleName: string) => void — called on every change
 */
export default function RoleSelector({ selectedRole, onSelect }) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="role-input"
          className="mb-2 block text-sm font-medium text-[var(--text)]"
        >
          What role are you applying for?
        </label>
        <div className="relative">
          <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            id="role-input"
            type="text"
            value={selectedRole || ""}
            onChange={(e) => onSelect(e.target.value)}
            placeholder="e.g. Full Stack Developer, Data Scientist, Product Manager..."
            maxLength={80}
            className="w-full rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] py-3 pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--violet-bright)]/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((role) => {
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => onSelect(role)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "border-[var(--violet-bright)]/70 bg-[var(--violet)]/15 text-[var(--violet-bright)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              }`}
            >
              {role}
            </button>
          );
        })}
      </div>
    </div>
  );
}
