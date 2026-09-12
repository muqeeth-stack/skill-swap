"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatDateTime } from "@/lib/dateUtils";
import { downloadICSFile, getGoogleCalendarUrl } from "@/lib/ics";
import { LiveSessionRoomModal } from "@/components/video/LiveSessionRoomModal";
import { Session } from "@/types";

export default function SessionsPage() {
  const { currentUser, sessions, allUsers, completeSession, cancelSession, confirmSession, submitReview } = useApp();
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "completed" | "cancelled">("all");
  const [reviewingSession, setReviewingSession] = useState<Session | null>(null);
  const [activeLiveSession, setActiveLiveSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!currentUser) return null;

  const userSessions = sessions.filter(
    (s) => s.teacherId === currentUser.id || s.learnerId === currentUser.id
  );

  const filtered = userSessions.filter((s) => (filter === "all" ? true : s.status === filter));

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSession) return;
    submitReview(
      reviewingSession.id,
      reviewingSession.teacherId === currentUser.id ? reviewingSession.learnerId : reviewingSession.teacherId,
      rating,
      comment,
      reviewingSession.skill,
      "Excellent"
    );
    setReviewingSession(null);
    setComment("");
  };

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <span>Live 1-on-1 & Group Exchanges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            My Learning Sessions
          </h1>
        </div>

        <Link
          href="/matches"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          + Book New Session
        </Link>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
        {(["all", "active", "pending", "completed", "cancelled"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`pb-3 px-4 text-xs font-bold border-b-2 capitalize transition-colors cursor-pointer whitespace-nowrap ${
              filter === t ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500"
            }`}
          >
            {t} ({t === "all" ? userSessions.length : userSessions.filter((s) => s.status === t).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((s) => {
          const isTeacher = s.teacherId === currentUser.id;
          const otherUserId = isTeacher ? s.learnerId : s.teacherId;
          const otherUser = allUsers.find((u) => u.id === otherUserId);

          const statusBadgeCls =
            s.status === "active"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40"
              : s.status === "pending"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40"
              : s.status === "completed"
              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300/40"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-300/40";

          return (
            <div
              key={s.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {isTeacher ? "Teaching" : "Learning"} • {s.duration} mins
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mt-0.5">{s.skill}</h3>
                  <p className="text-xs text-gray-500">With {otherUser?.name || "Partner"}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase ${statusBadgeCls}`}>
                  {s.status}
                </span>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300">
                ⏰ Scheduled: {formatDateTime(s.scheduledAt)}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                {s.status === "active" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveLiveSession(s)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-gray-950 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      🎥 Join Live Room
                    </button>
                    <button
                      onClick={() => completeSession(s.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Mark Done ✓
                    </button>
                    <button
                      onClick={() => cancelSession(s.id)}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : s.status === "pending" ? (
                  <div className="flex items-center gap-2">
                    {isTeacher ? (
                      <>
                        <button
                          onClick={() => confirmSession(s.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Accept &amp; Confirm ✓
                        </button>
                        <button
                          onClick={() => cancelSession(s.id)}
                          className="text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800/40">
                          ⏳ Awaiting Teacher Confirmation
                        </span>
                        <button
                          onClick={() => cancelSession(s.id)}
                          className="text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      </>
                    )}
                  </div>
                ) : s.status === "completed" ? (
                  <button
                    onClick={() => setReviewingSession(s)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    ★ Leave Review
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">Session Cancelled</span>
                )}

                {s.status === "active" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const start = new Date(s.scheduledAt);
                        const end = new Date(start.getTime() + (s.duration || 60) * 60000);
                        downloadICSFile({
                          id: s.id,
                          title: `SynapseLearn: ${s.skill} Session with ${otherUser?.name || "Partner"}`,
                          description: `Skill Exchange session on SynapseLearn.\nRole: ${isTeacher ? "Teacher" : "Learner"}\nPartner: ${otherUser?.name || "Partner"} (${otherUser?.email || ""})`,
                          startTime: start,
                          endTime: end,
                          url: typeof window !== "undefined" ? window.location.origin + `/sessions` : undefined,
                        });
                      }}
                      title="Download .ics for Apple / Outlook / Google Calendar"
                      className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors cursor-pointer"
                    >
                      📅 .ics
                    </button>
                    <a
                      href={getGoogleCalendarUrl({
                        id: s.id,
                        title: `SynapseLearn: ${s.skill} Session with ${otherUser?.name || "Partner"}`,
                        description: `Skill Exchange session on SynapseLearn.\nRole: ${isTeacher ? "Teacher" : "Learner"}\nPartner: ${otherUser?.name || "Partner"}`,
                        startTime: new Date(s.scheduledAt),
                        endTime: new Date(new Date(s.scheduledAt).getTime() + (s.duration || 60) * 60000),
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Add to Google Calendar"
                      className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                    >
                      Google Cal ↗
                    </a>
                  </div>
                )}
                <Link
                  href={`/messages?user=${otherUserId}`}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Chat ➔
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {activeLiveSession && (
        <LiveSessionRoomModal
          session={activeLiveSession}
          onClose={() => setActiveLiveSession(null)}
        />
      )}

      {reviewingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-3">Rate Your Session</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                >
                  <option value={5}>★★★★★ (5 Stars - Outstanding)</option>
                  <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                  <option value={2}>★★☆☆☆ (2 Stars - Needs Improvement)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Feedback Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="What went well? How was the lesson structure?"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingSession(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
