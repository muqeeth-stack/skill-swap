"use client";

import React, { useState } from "react";
import { User } from "@/types";

interface TrustSafetyModalProps {
  isOpen: boolean;
  currentUser: User;
  allUsers: User[];
  targetUserId?: string | null;
  onClose: () => void;
  onReportUser: (userId: string, reason: string, details?: string) => void;
  onBlockUser: (userId: string) => void;
}

export const TrustSafetyModal: React.FC<TrustSafetyModalProps> = ({
  isOpen,
  currentUser,
  allUsers,
  targetUserId: initialTargetId,
  onClose,
  onReportUser,
  onBlockUser,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    initialTargetId || (allUsers.find((u) => u.id !== currentUser.id)?.id || "")
  );
  const [reportReason, setReportReason] = useState("Inappropriate behavior or language");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"guidelines" | "report">("guidelines");

  if (!isOpen) return null;

  const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);
  const selectedUser = otherUsers.find((u) => u.id === selectedUserId);

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsSubmitting(true);
    onReportUser(selectedUserId, reportReason, reportDetails);
    setIsSubmitting(false);
    onClose();
  };

  const handleBlock = () => {
    if (!selectedUserId) return;
    if (confirm(`Are you sure you want to block ${selectedUser?.name || "this user"}? You won't see their profile or messages.`)) {
      onBlockUser(selectedUserId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl shadow-sm">
              🛡️
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Trust & Community Safety
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SynapseLearn standards, verified integrity & peer protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-750 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("guidelines")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "guidelines"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            📜 Safety Guidelines
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "report"
                ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 font-bold shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🚩 Report or Block User
          </button>
        </div>

        {/* Tab 1: Guidelines */}
        {activeTab === "guidelines" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700 space-y-1.5">
                <span className="text-xl">🤝</span>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white">Fair Exchange Code</h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Respect booked session times. Synapse credits reflect true reciprocal knowledge exchange.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700 space-y-1.5">
                <span className="text-xl">🔒</span>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white">Privacy & Security</h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Never share sensitive passwords, financial info, or personal credentials during sessions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700 space-y-1.5">
                <span className="text-xl">⭐</span>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white">Verified Badges</h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Look for LinkedIn and GitHub verification badges to validate external identity and credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700 space-y-1.5">
                <span className="text-xl">🛡️</span>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white">Zero Tolerance</h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Harassment, hate speech, spam, and unsolicited commercial solicitation result in immediate suspension.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <span className="font-bold">✨ Need immediate assistance?</span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                You can report any violation directly using the &quot;Report or Block User&quot; tab. Our admin moderation team reviews all reports within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Report or Block */}
        {activeTab === "report" && (
          <form onSubmit={handleReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Select User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
              >
                {otherUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Reason for Report
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="Inappropriate behavior or language">Inappropriate behavior or language</option>
                <option value="Spam or commercial promotion">Spam or commercial promotion</option>
                <option value="No-show or repeated cancellation">No-show or repeated cancellation</option>
                <option value="Harassment or unwelcome contact">Harassment or unwelcome contact</option>
                <option value="Misleading credentials or fake profile">Misleading credentials or fake profile</option>
                <option value="Other safety violation">Other safety violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                placeholder="Provide any specific context, messages, or session times to help our moderation team review..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleBlock}
                className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all cursor-pointer"
              >
                🚫 Block User
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
