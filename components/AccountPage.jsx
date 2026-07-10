"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07050d] text-gray-400">
        Loading…
      </main>
    );
  }

  if (!user) {
    // middleware.js should already redirect unauthenticated requests to
    // /login before this ever renders; this is just a safety net for the
    // brief moment before the client-side session check resolves.
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07050d] text-gray-400">
        Redirecting to login…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07050d] px-6 py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#0d0a17] p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">Your account</h1>

        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-3">
            <dt className="text-gray-400">Name</dt>
            <dd className="text-white">{user.name}</dd>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-3">
            <dt className="text-gray-400">Email</dt>
            <dd className="text-white">{user.email}</dd>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-3">
            <dt className="text-gray-400">Current plan</dt>
            <dd className="text-white">{user.plan}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Resume analyses used</dt>
            <dd className="text-white">{user.resumeAnalysisCount}</dd>
          </div>
        </dl>

        <button
          onClick={handleLogout}
          className="mt-8 w-full rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
        >
          Log out
        </button>
      </div>
    </main>
  );
}