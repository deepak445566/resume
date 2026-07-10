"use client";

import { motion } from "framer-motion";
import { FileText, FileType2, X, CheckCircle2 } from "lucide-react";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResumePreview({ file, onRemove, disabled = false }) {
  if (!file) return null;

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const Icon = isPdf ? FileText : FileType2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex items-center gap-4 rounded-2xl p-5"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          isPdf
            ? "bg-[#f45c6a]/15 text-[#f45c6a]"
            : "bg-[#3b82f6]/15 text-[#3b82f6]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text)]">
          {file.name}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{formatBytes(file.size)}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--text-faint)]" />
          <span className="inline-flex items-center gap-1 text-[var(--score)]">
            <CheckCircle2 className="h-3 w-3" />
            Ready to analyze
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove file"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-[var(--text-muted)] transition-colors hover:border-white/20 hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
