// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Crown, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Check if user can analyze more resumes
  const canAnalyze = () => {
    if (!user) return false;
    
    // Paid users have unlimited access
    if (user.plan && user.plan !== "Free") {
      return true;
    }
    
    // Free users: check if they have used less than 3 analyses
    return (user.resumeAnalysisCount || 0) < 3;
  };

  // Get remaining analyses
  const getRemainingAnalyses = () => {
    if (!user) return 0;
    if (user.plan && user.plan !== "Free") {
      return "Unlimited";
    }
    return Math.max(0, 3 - (user.resumeAnalysisCount || 0));
  };

  const handleAnalyzeClick = () => {
    if (!canAnalyze()) {
      setShowUpgradePopup(true);
      return;
    }
    router.push("/upload");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#07050d] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7c5cff] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#07050d] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-400 mt-2">Here's your dashboard overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-6">
              <p className="text-sm text-gray-400">Current Plan</p>
              <p className="mt-2 text-2xl font-bold text-white">{user.plan || "Free"}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-6">
              <p className="text-sm text-gray-400">Analyses Used</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {user.resumeAnalysisCount || 0}
                {user.plan !== "Free" && <span className="text-sm font-normal text-gray-400 ml-2">/ Unlimited</span>}
                {user.plan === "Free" && <span className="text-sm font-normal text-gray-400 ml-2">/ 3</span>}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-6">
              <p className="text-sm text-gray-400">Remaining</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {getRemainingAnalyses()}
                {user.plan !== "Free" && <span className="text-sm font-normal text-[#7c5cff] ml-2">✨ Unlimited</span>}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-6">
              <p className="text-sm text-gray-400">Status</p>
              <p className="mt-2">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                  canAnalyze() 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {canAnalyze() ? "✅ Active" : "🔒 Limited"}
                </span>
              </p>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="mt-8">
            <button
              onClick={handleAnalyzeClick}
              className={`rounded-full px-8 py-3 text-white font-medium transition-all ${
                canAnalyze()
                  ? "bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] hover:scale-[1.02]"
                  : "bg-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              {canAnalyze() ? "📄 Analyze Resume" : "🔒 Analyze Resume (Limit Reached)"}
            </button>

            {!canAnalyze() && user.plan === "Free" && (
              <p className="mt-2 text-sm text-red-400">
                You've used all 3 free analyses. Upgrade to continue.
              </p>
            )}
          </div>

          {/* Recent Activity or other content */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Link
                href={canAnalyze() ? "/upload" : "#"}
                onClick={(e) => {
                  if (!canAnalyze()) {
                    e.preventDefault();
                    setShowUpgradePopup(true);
                  }
                }}
                className={`rounded-xl border border-white/10 bg-[#0d0a17] p-6 transition-all hover:border-white/20 ${
                  !canAnalyze() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <h3 className="text-white font-medium">Analyze Resume</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Upload and analyze your resume
                </p>
              </Link>

              <Link
                href="/pricing"
                className="rounded-xl border border-white/10 bg-[#0d0a17] p-6 transition-all hover:border-white/20"
              >
                <h3 className="text-white font-medium">Upgrade Plan</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Unlock unlimited analyses
                </p>
              </Link>

              <Link
                href="/history"
                className="rounded-xl border border-white/10 bg-[#0d0a17] p-6 transition-all hover:border-white/20"
              >
                <h3 className="text-white font-medium">View History</h3>
                <p className="mt-1 text-sm text-gray-400">
                  See your previous analyses
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Popup */}
      {showUpgradePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-md w-full rounded-2xl border border-white/10 bg-[#0d0a17] p-8 shadow-2xl">
            <button
              onClick={() => setShowUpgradePopup(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6]">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Upgrade Your Plan</h2>
              <p className="mt-2 text-gray-400">
                You've used all your free analyses. Upgrade to Basic or Pro for unlimited access.
              </p>
              <div className="mt-6 rounded-lg bg-white/5 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Free Plan</span>
                  <span className="text-red-400">3 analyses used</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Basic Plan</span>
                  <span className="text-[#7c5cff]">Unlimited analyses</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Pro Plan</span>
                  <span className="text-[#7c5cff]">Unlimited + Premium</span>
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
                  onClick={() => setShowUpgradePopup(false)}
                  className="flex-1 rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}