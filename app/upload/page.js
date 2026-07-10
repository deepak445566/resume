"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UploadBox from "@/components/UploadBox";
import ResumePreview from "@/components/ResumePreview";
import Loading from "@/components/Loading";
import RoleSelector from "@/components/RoleSelector";
import UpgradePopup from "@/components/UpgradePopup";
import { useAuth } from "@/context/AuthContext";

// Status flow for this page: idle -> file selected -> uploading -> done
const STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  DONE: "done",
};

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [result, setResult] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [navigating, setNavigating] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [userLimit, setUserLimit] = useState({ canAnalyze: true, remaining: 3, plan: "Free" });

  // Check user limit on load
  useEffect(() => {
    if (user) {
      checkUserLimit();
    }
  }, [user]);

  const checkUserLimit = async () => {
    try {
      const response = await fetch("/api/upload", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setUserLimit({
          canAnalyze: data.canAnalyze,
          remaining: data.remaining,
          plan: data.plan,
        });
      }
    } catch (error) {
      console.error("Error checking limit:", error);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=upload");
    }
  }, [user, authLoading, router]);

  const handleFileAccepted = (newFile) => {
    setError(null);
    setResult(null);
    setSelectedRole(null);
    setNavigating(false);
    setFile(newFile);
    setStatus(STATUS.IDLE);
  };

  const handleError = (message) => {
    setError(message);
  };

  const handleRemove = () => {
    setFile(null);
    setResult(null);
    setSelectedRole(null);
    setNavigating(false);
    setStatus(STATUS.IDLE);
    setError(null);
  };

  const handleRoleSelect = (roleName) => {
    setSelectedRole(roleName);
  };

  const handleContinue = () => {
    const role = selectedRole?.trim();
    if (!role || !result) return;
    setNavigating(true);
    try {
      sessionStorage.setItem(
        "resume-analyzer:pending-report",
        JSON.stringify({
          resumeText: result.text,
          role,
          fileName: result.fileName,
          reportId: result.reportId,
          atsData: result.atsData, // Store ATS data
        })
      );
    } catch {
      // sessionStorage can fail in private-browsing edge cases
    }
    router.push("/report");
  };

  const handleAnalyze = async () => {
    if (!file) return;

    // Check if user can analyze
    if (!userLimit.canAnalyze) {
      setShowUpgradePopup(true);
      return;
    }

    setStatus(STATUS.UPLOADING);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.needsUpgrade) {
          setShowUpgradePopup(true);
          throw new Error("You've reached your free limit. Please upgrade.");
        }
        throw new Error(data.error || "Something went wrong reading this file.");
      }

      // Update user limit after analysis
      await checkUserLimit();

      setResult(data.data);
      setStatus(STATUS.DONE);

      // Show success message
      console.log("Analysis complete!", data);

    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message);
      setStatus(STATUS.IDLE);
    }
  };

  // Step 1 = choosing/uploading a resume, Step 2 = picking a job role
  const step = status === STATUS.DONE && result ? 2 : 1;

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#07050d] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7c5cff] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="relative flex-1 bg-grid">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#7c5cff]/15 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-2xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[#7c5cff]">
              Step {step} of 3
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {step === 1 ? "Upload your resume" : "Choose a job role"}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-gray-400">
              {step === 1
                ? "We'll analyze your resume and provide detailed ATS insights."
                : "Select the role you're applying for — our AI will compare your resume against industry standards."}
            </p>

            {/* Plan Status Badge */}
            <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#0d0a17] px-4 py-1.5">
              <span className="text-xs text-gray-400">Plan:</span>
              <span className="text-xs font-medium text-white">{userLimit.plan}</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-400">Remaining:</span>
              <span className={`text-xs font-medium ${userLimit.remaining === "Unlimited" ? "text-[#7c5cff]" : "text-white"}`}>
                {userLimit.remaining === "Unlimited" ? "∞" : userLimit.remaining}
              </span>
            </div>
          </div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="dropzone"
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <UploadBox
                    onFileAccepted={handleFileAccepted}
                    onError={handleError}
                    disabled={!userLimit.canAnalyze}
                  />
                  {!userLimit.canAnalyze && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-red-400">
                        You reached your free limit. 
                        <button 
                          onClick={() => setShowUpgradePopup(true)}
                          className="ml-2 text-[#7c5cff] hover:underline"
                        >
                          Upgrade to continue
                        </button>
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <ResumePreview
                    file={file}
                    onRemove={handleRemove}
                    disabled={status === STATUS.UPLOADING}
                  />

                  {status === STATUS.UPLOADING && (
                    <div className="glass-card rounded-2xl">
                      <Loading label="Analyzing your resume..." />
                    </div>
                  )}

                  {status === STATUS.DONE && result && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Success Message */}
                      <div className="glass-card rounded-2xl border-green-500/30 bg-green-500/10 p-5">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                          <div>
                            <p className="text-sm font-medium text-green-400">
                              Analysis Complete!
                            </p>
                            <p className="text-xs text-gray-400">
                              {result.wordCount} words extracted • {result.atsData?.totalSkills || 0} skills identified
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ATS Score Preview */}
                      {result.atsData && (
                        <div className="glass-card rounded-2xl border border-white/10 p-5">
                          <h3 className="text-sm font-medium text-white mb-3">ATS Score Preview</h3>
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16">
                              <svg className="h-16 w-16 -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="#1a1a2e"
                                  strokeWidth="6"
                                  fill="none"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke={
                                    result.atsData.atsScore >= 70 ? "#22c55e" :
                                    result.atsData.atsScore >= 50 ? "#eab308" :
                                    "#ef4444"
                                  }
                                  strokeWidth="6"
                                  fill="none"
                                  strokeDasharray={`${(result.atsData.atsScore / 100) * 175.93} 175.93`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                                {result.atsData.atsScore}%
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">
                                Skills Matched: {result.atsData.matchedCount}/{result.atsData.totalSkills}
                              </p>
                              <p className="text-sm text-gray-400">
                                Role: {result.atsData.role || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer select-none text-[#7c5cff] hover:text-[#8b7cff]">
                          Preview extracted text
                        </summary>
                        <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/20 p-3 leading-relaxed text-gray-300">
                          {result.text.slice(0, 1200)}
                          {result.text.length > 1200 ? "…" : ""}
                        </p>
                      </details>

                      {/* Role Selection */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-5"
                      >
                        <RoleSelector
                          selectedRole={selectedRole}
                          onSelect={handleRoleSelect}
                          suggestedRole={result.atsData?.role || ""}
                        />

                        <div className="flex flex-col items-center gap-3">
                          <button
                            type="button"
                            disabled={!selectedRole?.trim() || navigating}
                            onClick={handleContinue}
                            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-6 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(124,92,255,0.4)] transition-transform enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                          >
                            {navigating ? (
                              <Loading label="Preparing your report..." inline size={16} />
                            ) : (
                              <>
                                {selectedRole?.trim()
                                  ? `View Detailed Report for ${selectedRole.trim()}`
                                  : "Enter a role to continue"}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {status !== STATUS.UPLOADING && status !== STATUS.DONE && (
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={!userLimit.canAnalyze}
                      className={`group flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-all ${
                        userLimit.canAnalyze
                          ? "bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] shadow-[0_0_30px_rgba(124,92,255,0.4)] hover:scale-[1.01]"
                          : "bg-gray-600 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {!userLimit.canAnalyze ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Limit Reached - Upgrade to Continue
                        </>
                      ) : (
                        <>
                          Analyze Resume
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />

      {/* Upgrade Popup */}
      {showUpgradePopup && (
        <UpgradePopup onClose={() => setShowUpgradePopup(false)} />
      )}
    </>
  );
}