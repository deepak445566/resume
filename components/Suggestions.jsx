"use client";

import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  PencilLine,
  MessageCircle,
  Info,
  Map,
  Lightbulb,
} from "lucide-react";
import Loading from "@/components/Loading";

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-[var(--violet-bright)]" />
        <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
      </div>
      <div className="mt-2 pl-6">{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5 text-sm text-[var(--text-muted)]">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--text-faint)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderedList({ items }) {
  return (
    <ol className="space-y-1.5 text-sm text-[var(--text-muted)]">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="font-data shrink-0 text-xs text-[var(--violet-bright)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * AI-written section of the report: professional summary, strengths,
 * weaknesses, career suggestions, resume improvements, and interview
 * readiness — sourced from /api/ai (Gemini, or a rule-based fallback
 * when no API key is configured).
 *
 * Props:
 *  - status: "loading" | "done" | "error"
 *  - data: the suggestions object returned by /api/ai (when status === "done")
 *  - error: error message (when status === "error")
 */
export default function Suggestions({ status = "loading", data = null, error = null }) {
  if (status === "loading") {
    return (
      <div className="glass-card rounded-2xl p-8">
        <Loading label="Generating AI insights..." />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="glass-card flex items-start gap-3 rounded-2xl border-[#f45c6a]/30 p-6 text-sm text-[#f45c6a]">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span>{error || "Couldn't generate AI insights for this report."}</span>
      </div>
    );
  }

  if (!data) return null;

  const {
    professionalSummary,
    strengths = [],
    weaknesses = [],
    missingSkillsNote,
    careerSuggestions = [],
    resumeImprovements = [],
    interviewReadiness,
    learningRoadmap = [],
    projectIdeas = [],
    source,
  } = data;

  return (
    <div className="glass-card space-y-6 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--violet-bright)]" />
          <h3 className="text-base font-semibold text-[var(--text)]">
            AI-powered insights
          </h3>
        </div>
        {source === "fallback" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[var(--text-faint)]">
            <Info className="h-3 w-3" />
            Rule-based estimate
          </span>
        )}
      </div>

      {professionalSummary && (
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          {professionalSummary}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {strengths.length > 0 && (
          <Section icon={CheckCircle2} title="Strengths">
            <BulletList items={strengths} />
          </Section>
        )}

        {weaknesses.length > 0 && (
          <Section icon={AlertTriangle} title="Areas to improve">
            <BulletList items={weaknesses} />
          </Section>
        )}

        {careerSuggestions.length > 0 && (
          <Section icon={Compass} title="Career suggestions">
            <BulletList items={careerSuggestions} />
          </Section>
        )}

        {resumeImprovements.length > 0 && (
          <Section icon={PencilLine} title="Resume improvements">
            <BulletList items={resumeImprovements} />
          </Section>
        )}

        {projectIdeas.length > 0 && (
          <Section icon={Lightbulb} title="Project ideas">
            <BulletList items={projectIdeas} />
          </Section>
        )}
      </div>

      {interviewReadiness && (
        <Section icon={MessageCircle} title="Interview readiness">
          <p className="text-sm text-[var(--text-muted)]">{interviewReadiness}</p>
        </Section>
      )}

      {learningRoadmap.length > 0 && (
        <Section icon={Map} title="Learning roadmap">
          <OrderedList items={learningRoadmap} />
        </Section>
      )}

      {missingSkillsNote && (
        <p className="border-t border-white/5 pt-4 text-xs text-[var(--text-faint)]">
          {missingSkillsNote}
        </p>
      )}

      {source === "fallback" && (
        <p className="text-xs text-[var(--text-faint)]">
          Add a <span className="font-data">GEMINI_API_KEY</span> to your
          environment to enable full AI-written analysis.
        </p>
      )}
    </div>
  );
}
