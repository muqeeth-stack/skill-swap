"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatDateTime } from "@/lib/dateUtils";
import { Session } from "@/types";

export default function SessionsPage() {
  const { currentUser, sessions, allUsers, completeSession, cancelSession, submitReview } = useApp();
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [reviewingSession, setReviewingSession] = useState<Session | null>(null);
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

      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        {(["all", "active", "completed", "cancelled"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`pb-3 px-4 text-xs font-bold border-b-2 capitalize transition-colors cursor-pointer ${
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
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-md uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {s.status}
                </span>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300">
                ⏰ Scheduled: {formatDateTime(s.scheduledAt)}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                {s.status === "active" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => completeSession(s.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                    >
                      Mark Done ✓
                    </button>
                    <button
                      onClick={() => cancelSession(s.id)}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : s.status === "completed" ? (
                  <button
                    onClick={() => setReviewingSession(s)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold"
                  >
                    ★ Leave Review
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">Cancelled</span>
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
