"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, MatchScore } from "@/types";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MatchCardProps {
  user: User;
  score: MatchScore;
  onOpenChat?: (userId: string) => void;
}

export function MatchCard({ user, score, onOpenChat }: MatchCardProps) {
  const router = useRouter();
  const { currentUser, connections, sendConnectionRequest, bookSession } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(user.availableTimes[0] || "evening");
  const [sessionTopic, setSessionTopic] = useState(user.skillsTeach[0]?.name || "");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Determine connection status
  const connection = connections.find(
    (c) =>
      (c.requesterId === currentUser?.id && c.receiverId === user.id) ||
      (c.receiverId === currentUser?.id && c.requesterId === user.id)
  );

  const getScoreColor = (total: number) => {
    if (total >= 90) return "from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800";
    if (total >= 80) return "from-blue-500 to-indigo-600 text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800";
    if (total >= 70) return "from-violet-500 to-purple-600 text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800";
    return "from-amber-500 to-orange-600 text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800";
  };

  const getScoreBadge = (total: number, type: string) => {
    if (type === "1on1_exchange") return "⚡ Perfect 2-Way Exchange";
    if (type === "mentor_match") return "🎓 Mentor Match";
    if (type === "peer_partner") return "🤝 Peer Practice Partner";
    if (total >= 90) return "🌟 Top AI Match";
    return "✨ High Synergy";
  };

  const handleConnect = () => {
    if (!connection) {
      sendConnectionRequest(user.id, `Hi ${user.name}, I discovered your profile on SynapseLearn and would love to connect and exchange skills!`);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic || !currentUser) return;
    bookSession(user.id, sessionTopic, undefined, new Date(Date.now() + 86400000).toISOString(), 45, "1on1");
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModalOpen(false);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Compatibility Score */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <Image
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-sm"
              />
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-emerald-500"
                title="Active on Synapse"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link href={`/profile?id=${user.id}`} className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 transition-colors">
                  {user.name}
                </Link>
                {user.isLinkedInVerified && (
                  <span className="text-indigo-600 dark:text-indigo-400" title="Verified Synapse Member">
                    <svg className="w-4 h-4 inline-block fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                {user.rating >= 4.8 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md">
                    Top Rated
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {user.location || "San Francisco, CA"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center text-amber-500 font-medium">
                  ★ {user.rating.toFixed(1)} <span className="text-gray-400 ml-0.5">({user.totalReviews})</span>
                </span>
                <span>•</span>
                <span>{user.totalSessionsTaught + user.totalSessionsLearned} sessions</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">🪙 {user.credits} credits</span>
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 shadow-xs ${getScoreColor(score.overallScore)}`}>
              <span className="text-base font-extrabold">{score.overallScore}% Match</span>
            </div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 text-right font-medium">
              {getScoreBadge(score.overallScore, score.matchType)}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
          {user.bio}
        </p>

        {/* Skills They Teach */}
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-500 mb-1.5 flex items-center justify-between">
            <span>Can Teach You</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
              {user.skillsTeach.length} skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsTeach.slice(0, 3).map((skill, idx) => {
              const isMatch = score.reasons.some((r) => r.toLowerCase().includes(skill.name.toLowerCase()));
              return (
                <span
                  key={idx}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    isMatch
                      ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs ring-1 ring-indigo-500/20"
                      : "bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {skill.name}
                  <span className="ml-1 text-[10px] opacity-75 font-normal">({skill.level})</span>
                </span>
              );
            })}
            {user.skillsTeach.length > 3 && (
              <span className="px-2 py-1 text-[11px] text-gray-600 bg-gray-50 dark:bg-gray-800 rounded-lg">
                +{user.skillsTeach.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Skills They Want To Learn */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-500 mb-1.5 flex items-center justify-between">
            <span>Wants To Learn From You</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsLearn.slice(0, 3).map((skill, idx) => {
              const isMutual = currentUser?.skillsTeach.some(
                (mySkill) => mySkill.name.toLowerCase() === skill.name.toLowerCase()
              );
              return (
                <span
                  key={idx}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                    isMutual
                      ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-500/20"
                      : "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40"
                  }`}
                >
                  {isMutual && <span className="mr-1 text-emerald-600 font-bold">⇄</span>}
                  {skill.name}
                  <span className="ml-1 text-[10px] opacity-75 font-normal">({skill.level})</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Why You Match Dropdown / Breakdown */}
        <div className="border-t border-gray-100 dark:border-gray-700/60 pt-3 mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Why You Match ({score.reasons.length} synergy factors)
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="mt-3 space-y-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-xs">
              {/* Synergy Bullet Reasons */}
              <div className="space-y-1.5">
                {score.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                    <span className="leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>

              {/* Dimension Score Bars */}
              <div className="mt-3 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 space-y-1.5">
                <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400">
                  <span>Skill Complementarity (35%)</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{score.skillExchangeScore}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${score.skillExchangeScore}%` }} />
                </div>

                <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400 pt-1">
                  <span>Availability Overlap (15%)</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{score.availabilityScore}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${score.availabilityScore}%` }} />
                </div>

                <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400 pt-1">
                  <span>Goals & Learning Style (25%)</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {Math.round((score.goalScore + score.preferencesScore) / 2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${(score.goalScore + score.preferencesScore) / 2}%` }} />
                </div>
              </div>

              {/* Extra Details */}
              <div className="pt-2 text-[11px] text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                <div>🗣️ {user.preferredLanguages.join(", ")}</div>
                <div>⏰ Available: {user.availableTimes.join(", ")}</div>
                <div>📅 Commitment: ~{user.weeklyHours}h/week</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:px-6 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Quick Connect Button */}
          {connection ? (
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                connection.status === "accepted"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              }`}
            >
              {connection.status === "accepted" ? "✓ Connected" : "⏳ Pending"}
            </span>
          ) : (
            <button
              onClick={handleConnect}
              className="px-3.5 py-1.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 text-xs font-semibold rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Connect
            </button>
          )}

          {/* Direct Message Button */}
          <button
            onClick={() => onOpenChat ? onOpenChat(user.id) : router.push(`/messages?user=${user.id}`)}
            aria-label="Send message"
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors cursor-pointer"
            title="Send Message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Book Session / Trade Button */}
        <button
          onClick={() => setBookingModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-indigo-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book Session
        </button>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative">
            <button
              onClick={() => setBookingModalOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session Booked!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We have booked your session with {user.name}. You can coordinate details in Synapse chat!
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <Image
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Book Synapse Session</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">With {user.name} • {score.overallScore}% AI Match</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="match-session-topic" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Skill Topic to Focus On
                  </label>
                  <select
                    id="match-session-topic"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
                    required
                  >
                    <option value="">Select a skill...</option>
                    {user.skillsTeach.map((s, idx) => (
                      <option key={idx} value={s.name}>
                        {s.name} ({s.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Select Available Time
                  </label>
                  <div className="space-y-2">
                    {user.availableTimes.map((slot, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedSlot === slot
                            ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-semibold"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span className="flex items-center gap-2 capitalize">
                          <input
                            type="radio"
                            name="timeSlot"
                            checked={selectedSlot === slot}
                            onChange={() => setSelectedSlot(slot)}
                            className="text-indigo-600"
                          />
                          {slot} Sessions
                        </span>
                        <span className="text-[11px] text-gray-600">1-on-1 Interactive</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                  <span>🪙 Barter Mode / Skill Credit</span>
                  <span className="font-bold">1 Token (Direct Barter)</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm cursor-pointer"
                  >
                    Confirm Session Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
