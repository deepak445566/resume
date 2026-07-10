import Link from "next/link";
import { Sparkles } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: ["Features", "ATS Score", "Templates", "Pricing"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog"],
  },
  {
    title: "Resources",
    links: ["Resume Tips", "Interview Prep", "Career Advice"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#3b82f6]">
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
                ResumePro
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
              AI-powered resume analysis that helps you get past the bots and
              in front of a human.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-[var(--text)]">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-[var(--text-faint)]">
            © {new Date().getFullYear()} ResumePro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
