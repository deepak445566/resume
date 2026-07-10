"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why ResumePro", href: "#why-us" },
];

const routeLinks = [
  { label: "History", href: "/dashboard" },
  { label: "ATS Score", href: "/AtsScorePage" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = () => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    const index = (user?.email?.length || 0) % colors.length;
    return colors[index];
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07050d]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#3b82f6]">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
            ResumePro
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
          {routeLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-700"></div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-[#7c5cff]/50 focus:outline-none"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-white ${getAvatarColor()}`}>
                  {getUserInitials()}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0d0a17] py-2 shadow-xl">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    <p className="mt-1 text-xs text-[#7c5cff]">Plan: {user.plan || "Free"}</p>
                  </div>
                  
                  <div className="my-1 border-t border-white/5"></div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Dashboard
                  </Link>
                  
                  <div className="my-1 border-t border-white/5"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(124,92,255,0.35)] transition-transform hover:scale-[1.03]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[var(--text)] md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-4 pt-4">
            {user && (
              <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/5 p-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white ${getAvatarColor()}`}>
                  {getUserInitials()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            )}

            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--text-muted)]"
              >
                {link.label}
              </a>
            ))}
            {routeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--text-muted)]"
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="text-sm text-[var(--text-muted)]"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-sm text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm text-[var(--text-muted)]"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-4 py-2 text-center text-sm font-medium text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}