// app/history/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FolderClock,
  AlertCircle,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Download,
  Filter,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=history");
    }
  }, [user, authLoading, router]);

  // Fetch reports
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/history", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load history");
      }

      setReports(data.reports || []);
      setFilteredReports(data.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search reports
  useEffect(() => {
    let result = [...reports];

    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter((r) => r.status === filterStatus);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.fileName.toLowerCase().includes(query) ||
          (r.role && r.role.toLowerCase().includes(query)) ||
          (r.company && r.company.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "score-high":
        result.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
        break;
      case "score-low":
        result.sort((a, b) => (a.atsScore || 0) - (b.atsScore || 0));
        break;
      default:
        break;
    }

    setFilteredReports(result);
  }, [reports, searchQuery, filterStatus, sortBy]);

  const handleViewReport = (report) => {
    router.push(`/report/${report.id}`);
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    try {
      const response = await fetch(`/api/history/${reportToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete report");
      }

      // Remove from list
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (err) {
      console.error("Error deleting report:", err);
      setError(err.message);
    }
  };

  const handleExportReport = (report) => {
    // Download report as JSON
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `report-${report.id}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 70) return "bg-green-500/20 border-green-500/30 text-green-400";
    if (score >= 50) return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
    return "bg-red-500/20 border-red-500/30 text-red-400";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Completed</span>;
      case "processing":
        return <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">Processing</span>;
      case "failed":
        return <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full">Failed</span>;
      default:
        return <span className="text-xs text-gray-400 bg-gray-500/20 px-2 py-1 rounded-full">{status}</span>;
    }
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#07050d] flex items-center justify-center">
          <Loading label="Loading..." />
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#07050d] py-20">
        {/* Background Effect */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#7c5cff]/15 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Resume History</h1>
            <p className="mt-3 text-lg text-gray-400">
              View all your previous resume analyses and track your progress
            </p>
            {user.plan !== "Free" && (
              <p className="mt-1 text-sm text-[#7c5cff]">
                ✨ {user.plan} plan • Unlimited history
              </p>
            )}
          </div>

          {/* Stats */}
          {reports.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-4 text-center">
                <p className="text-2xl font-bold text-white">{reports.length}</p>
                <p className="text-xs text-gray-400">Total Analyses</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {Math.round(reports.reduce((acc, r) => acc + (r.atsScore || 0), 0) / reports.length) || 0}%
                </p>
                <p className="text-xs text-gray-400">Average Score</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {reports.filter(r => r.atsScore >= 70).length}
                </p>
                <p className="text-xs text-gray-400">High Scores (70%+)</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {new Set(reports.map(r => r.role)).size}
                </p>
                <p className="text-xs text-gray-400">Unique Roles</p>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="mt-8 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by file name, role, or company..."
                  className="w-full rounded-lg border border-white/10 bg-[#0d0a17] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-[#7c5cff]/50 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0d0a17] px-3 py-2.5 text-sm text-white focus:border-[#7c5cff]/50 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0d0a17] px-3 py-2.5 text-sm text-white focus:border-[#7c5cff]/50 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="score-high">Score: High to Low</option>
                  <option value="score-low">Score: Low to High</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || filterStatus !== "all") && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#7c5cff]/20 px-3 py-1 text-xs text-[#7c5cff]">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filterStatus !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#7c5cff]/20 px-3 py-1 text-xs text-[#7c5cff]">
                    Status: {filterStatus}
                    <button onClick={() => setFilterStatus("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                    setSortBy("newest");
                  }}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="mt-12">
              <Loading label="Loading your history..." />
            </div>
          ) : error ? (
            <div className="mt-12 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
              <p className="mt-2 text-red-400">{error}</p>
              <button
                onClick={fetchReports}
                className="mt-4 rounded-full bg-[#7c5cff] px-4 py-2 text-sm text-white hover:bg-[#6b4cdf]"
              >
                Try Again
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 rounded-2xl border border-white/10 bg-[#0d0a17] p-12 text-center"
            >
              {reports.length === 0 ? (
                <>
                  <FolderClock className="mx-auto h-12 w-12 text-gray-500" />
                  <h3 className="mt-4 text-lg font-medium text-white">No reports yet</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Upload your first resume to get started
                  </p>
                  <Link
                    href="/upload"
                    className="mt-4 inline-block rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-6 py-2 text-sm font-medium text-white"
                  >
                    Upload Resume
                  </Link>
                </>
              ) : (
                <>
                  <Search className="mx-auto h-12 w-12 text-gray-500" />
                  <h3 className="mt-4 text-lg font-medium text-white">No results found</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-4"
            >
              <p className="text-sm text-gray-400">
                Showing {filteredReports.length} of {reports.length} reports
              </p>

              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group rounded-xl border border-white/10 bg-[#0d0a17] p-6 transition-all hover:border-[#7c5cff]/30 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[#7c5cff]/20 p-2">
                          <FileText className="h-5 w-5 text-[#7c5cff]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {report.fileName}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {report.role && (
                              <span className="text-sm text-gray-400">
                                {report.role}
                              </span>
                            )}
                            {report.company && (
                              <>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-sm text-gray-400">
                                  {report.company}
                                </span>
                              </>
                            )}
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section */}
                    <div className="flex items-center gap-4">
                      {report.atsScore !== undefined && (
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${getScoreColor(report.atsScore)}`}>
                            {report.atsScore}%
                          </p>
                          <p className="text-xs text-gray-400">Score</p>
                        </div>
                      )}

                      <div className="hidden sm:block">
                        {getStatusBadge(report.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#7c5cff]/20 hover:text-[#7c5cff]"
                        title="View Report"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleExportReport(report)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#7c5cff]/20 hover:text-[#7c5cff]"
                        title="Export Report"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setReportToDelete(report);
                          setShowDeleteModal(true);
                        }}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                        title="Delete Report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300">
                      <span className="flex items-center gap-1">
                        View Details
                        <ChevronDown className="h-3 w-3" />
                      </span>
                    </summary>
                    <div className="mt-3 space-y-2 rounded-lg bg-white/5 p-4">
                      {report.skills && report.skills.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400">Skills Identified:</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {report.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-[#7c5cff]/20 px-2 py-0.5 text-xs text-[#7c5cff]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {report.wordCount && (
                        <p className="text-xs text-gray-400">
                          Word Count: <span className="text-white">{report.wordCount}</span>
                        </p>
                      )}
                      {report.fileSize && (
                        <p className="text-xs text-gray-400">
                          File Size: <span className="text-white">{(report.fileSize / 1024).toFixed(1)} KB</span>
                        </p>
                      )}
                    </div>
                  </details>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && reportToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0a17] p-6"
            >
              <h2 className="text-xl font-semibold text-white">Delete Report?</h2>
              <p className="mt-2 text-sm text-gray-400">
                Are you sure you want to delete "{reportToDelete.fileName}"? This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReport}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}