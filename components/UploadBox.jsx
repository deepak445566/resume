"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function validateFile(file) {
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );
  const hasValidType = ACCEPTED_TYPES.includes(file.type) || hasValidExtension;

  if (!hasValidType) {
    return "Only PDF and DOCX files are supported.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File is too large. Maximum size is 5MB.";
  }
  return null;
}

/**
 * Drag & drop / browse dropzone. Validates type (PDF/DOCX) and size (5MB max)
 * before handing the file up to the parent.
 */
export default function UploadBox({ onFileAccepted, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        onError?.(error);
        return;
      }
      onFileAccepted?.(file);
    },
    [onFileAccepted, onError]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`glass-card flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
        isDragging
          ? "border-[var(--violet-bright)] bg-[#7c5cff]/[0.06]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff]/20 to-[#3b82f6]/20">
        <UploadCloud className="h-6 w-6 text-[var(--violet-bright)]" />
      </span>

      <p className="mt-5 text-base font-medium text-[var(--text)]">
        Drag & drop your resume here
      </p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        or{" "}
        <span className="font-medium text-[var(--violet-bright)] underline underline-offset-2">
          browse your files
        </span>
      </p>
      <p className="mt-4 text-xs text-[var(--text-faint)]">
        Supports PDF and DOCX &middot; Max file size 5MB
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  );
}
