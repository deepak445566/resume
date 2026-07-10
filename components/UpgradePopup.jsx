// components/UpgradePopup.jsx
import Link from "next/link";
import { Crown, X } from "lucide-react";

export default function UpgradePopup({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative max-w-md w-full rounded-2xl border border-white/10 bg-[#0d0a17] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6]">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Upgrade Your Plan</h2>
          <p className="mt-2 text-gray-400">
            You've reached your free limit. Upgrade to continue analyzing resumes.
          </p>
          
          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <span className="text-[#7c5cff]">✓</span>
              <span className="text-sm text-gray-300">Unlimited resume analyses</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <span className="text-[#7c5cff]">✓</span>
              <span className="text-sm text-gray-300">Complete ATS reports</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <span className="text-[#7c5cff]">✓</span>
              <span className="text-sm text-gray-300">Resume history & tracking</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/pricing"
              className="flex-1 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-4 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] text-center"
            >
              View Plans
            </Link>
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}