"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ProfileEditorModal } from "@/components/profile/ProfileEditorModal";
import { BADGE_DEFINITIONS } from "@/types";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");

  const {
    currentUser,
    allUsers,
    reviews,
    sendConnectionRequest,
    connections,
    startConversationWithUser,
    bookSession,
  } = useApp();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "skills" | "reviews" | "badges" | "availability">("about");

  const displayedUser = targetId
    ? allUsers.find((u) => u.id === targetId) || currentUser
    : currentUser;

  if (!displayedUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="text-4xl">🔍</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Profile Not Found</h2>
        <p className="text-xs text-gray-500">The user you are looking for does not exist or has been removed.</p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isMe = displayedUser.id === currentUser?.id;
  const userReviews = reviews.filter((r) => r.revieweeId === displayedUser.id);
  const existingConn = connections.find(
    (c) =>
      (c.requesterId === currentUser?.id && c.receiverId === displayedUser.id) ||
      (c.requesterId === displayedUser.id && c.receiverId === currentUser?.id)
  );

  const handleStartChat = () => {
    if (!currentUser) return;
    const convId = startConversationWithUser(displayedUser.id);
    router.push(`/messages?convId=${convId}`);
  };

  const handleDirectBook = () => {
    if (!currentUser) return;
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const firstTeachSkill = displayedUser.skillsTeach[0]?.name || "Skill Exchange";
    bookSession(displayedUser.id, firstTeachSkill, undefined, tomorrow, 60, "1on1", "Direct booking via profile page");
    router.push("/sessions");
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Header Profile Hero Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 shadow-xl overflow-hidden">
        {/* Banner with gradient & credit badge */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-indigo-900 via-indigo-700 to-purple-800 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5">
              <span>🪙</span>
              <span>{displayedUser.credits} Credits</span>
            </span>
          </div>
        </div>

        {/* User Info Bar */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-20 sm:-mt-24 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative">
                <Image
                  src={displayedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayedUser.name)}`}
                  alt={displayedUser.name}
                  width={144}
                  height={144}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-2xl bg-gray-900"
                />
                {displayedUser.streakDays > 5 && (
                  <span
                    title={`${displayedUser.streakDays} Day Learning Streak!`}
                    className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-black shadow-md flex items-center gap-1"
                  >
                    🔥 {displayedUser.streakDays}d
                  </span>
                )}
              </div>

              <div className="mb-2 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    {displayedUser.name}
                  </h1>
                  {displayedUser.isLinkedInVerified && (
                    <span
                      title="LinkedIn Identity Verified"
                      className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold rounded-lg flex items-center gap-1"
                    >
                      <span>in</span>
                      <span>Verified</span>
                    </span>
                  )}
                  {displayedUser.isGitHubVerified && (
                    <span
                      title="GitHub Developer Verified"
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-[10px] font-bold rounded-lg flex items-center gap-1"
                    >
                      <span>gh</span>
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>📍 {displayedUser.location || "Remote / Global"}</span>
                  <span>·</span>
                  <span>🕒 {displayedUser.weeklyHours || 4} hrs/week available</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isMe ? (
                <>
                  <button
                    onClick={() => setIsEditorOpen(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✏️</span>
                    <span>Edit Profile</span>
                  </button>
                  <Link
                    href="/settings"
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-all"
                  >
                    ⚙️ Settings
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDirectBook}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📅</span>
                    <span>Book 1-on-1</span>
                  </button>
                  <button
                    onClick={handleStartChat}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>💬</span>
                    <span>Message</span>
                  </button>
                  {!existingConn && (
                    <button
                      onClick={() => sendConnectionRequest(displayedUser.id)}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      🤝 Connect
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-4 border-y border-gray-100 dark:border-gray-700/80 my-4 text-center">
            <div className="p-2">
              <div className="text-xl font-extrabold text-amber-500">
                ★ {displayedUser.rating.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">{displayedUser.totalReviews} Reviews</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {displayedUser.totalSessionsTaught}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">Sessions Taught</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                {displayedUser.totalSessionsLearned}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">Sessions Learned</div>
            </div>
            <div className="p-2">
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {displayedUser.completedExchanges}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">Completed Swaps</div>
            </div>
            <div className="p-2 col-span-2 sm:col-span-1">
              <div className="text-xl font-extrabold text-rose-500">
                🔥 {displayedUser.streakDays}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">Day Streak</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 overflow-x-auto text-xs font-bold scrollbar-none">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "about"
                  ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Overview & Goals
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "skills"
                  ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Skills Matrix ({displayedUser.skillsTeach.length + displayedUser.skillsLearn.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Reviews ({userReviews.length})
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "badges"
                  ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Badges ({displayedUser.badges?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("availability")}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "availability"
                  ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Schedule & Availability
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Overview & Goals */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                About & Teaching Philosophy
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {displayedUser.bio}
              </p>
            </div>

            {displayedUser.learningGoals && displayedUser.learningGoals.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <span>🎯</span> Learning Goals & Current Milestones
                </h3>
                <div className="flex flex-wrap gap-2">
                  {displayedUser.learningGoals.map((goal, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl text-xs font-semibold"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {displayedUser.interests && displayedUser.interests.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <span>✨</span> Personal Interests & Passions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {displayedUser.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Communication & Languages
              </h3>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Languages Spoken</div>
                <div className="flex flex-wrap gap-1.5">
                  {(displayedUser.preferredLanguages || ["English"]).map((lang) => (
                    <span
                      key={lang}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50 text-xs font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Preferred Methods</div>
                <div className="flex flex-wrap gap-1.5">
                  {(displayedUser.preferredMethods || ["video", "chat"]).map((method) => (
                    <span
                      key={method}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs capitalize"
                    >
                      {method.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {displayedUser.projects && displayedUser.projects.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Featured Portfolio
                </h3>
                {displayedUser.projects.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-2xl space-y-1">
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {proj.title} ↗
                    </a>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Skills Matrix */}
      {activeTab === "skills" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills to Teach */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎓</span> Skills Offered to Teach
              </h3>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {displayedUser.skillsTeach.length} skills
              </span>
            </div>

            <div className="space-y-3">
              {displayedUser.skillsTeach.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3 hover:border-indigo-300 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{skill.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {skill.level}
                      </span>
                    </div>
                    {skill.subSkill && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Focus: {skill.subSkill}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-400">
                      Category: {skill.category} · {skill.yearsOfExp || 1} yrs experience
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => {
                        const tomorrow = new Date(Date.now() + 86400000).toISOString();
                        bookSession(displayedUser.id, skill.name, skill.subSkill, tomorrow, 60, "1on1");
                        router.push("/sessions");
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      Book 📅
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎯</span> Skills Desired to Learn
              </h3>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {displayedUser.skillsLearn.length} skills
              </span>
            </div>

            <div className="space-y-3">
              {displayedUser.skillsLearn.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/50 flex items-center justify-between gap-3 hover:border-purple-300 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-purple-950 dark:text-purple-200 flex items-center gap-2">
                      <span>{skill.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 dark:bg-purple-900/70 text-purple-700 dark:text-purple-300">
                        Target: {skill.level}
                      </span>
                    </div>
                    {skill.subSkill && (
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Focus: {skill.subSkill}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-400">
                      Category: {skill.category}
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={handleStartChat}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      Offer Swap 🤝
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reviews & Endorsements */}
      {activeTab === "reviews" && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                Learner Reviews & Session Feedback
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verified reviews from 1-on-1 teaching and peer skill exchanges
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-amber-500">★ {displayedUser.rating.toFixed(2)}</div>
              <div className="text-[11px] text-gray-400">{userReviews.length} total reviews</div>
            </div>
          </div>

          {userReviews.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 space-y-2">
              <div className="text-3xl">⭐</div>
              <div className="text-xs font-bold text-gray-600 dark:text-gray-300">No reviews yet</div>
              <p className="text-[11px] text-gray-400">Completed sessions and ratings will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userReviews.map((rev) => {
                const reviewer = allUsers.find((u) => u.id === rev.reviewerId);
                return (
                  <div
                    key={rev.id}
                    className="p-5 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={reviewer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.reviewerId)}`}
                          alt={reviewer?.name || "Reviewer"}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                            {reviewer?.name || "Verified Learner"}
                          </div>
                          <div className="text-[10px] text-gray-400">Skill: {rev.skillTaught}</div>
                        </div>
                      </div>

                      <div className="text-amber-500 font-bold text-xs">
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(5 - rev.rating)}
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                      <span>Quality: {rev.sessionQuality || "Excellent"}</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Badges & Achievements */}
      {activeTab === "badges" && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
              Platform Badges & Honors
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recognizing teaching excellence, learning velocity, and community mentorship
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(displayedUser.badges || ["Fast Learner"]).map((badgeKey) => {
              const def = BADGE_DEFINITIONS[badgeKey] || {
                title: badgeKey,
                description: "Recognized learner on SynapseLearn",
                color: "indigo",
              };

              return (
                <div
                  key={badgeKey}
                  className="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-gray-750 dark:to-gray-800 rounded-2xl border border-indigo-100 dark:border-gray-700 flex items-start gap-3.5 shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
                    🏆
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{def.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {def.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Availability & Scheduling */}
      {activeTab === "availability" && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
              Weekly Availability & Preferred Hours
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Times when {displayedUser.name.split(" ")[0]} is open for 1-on-1 calls and live drill sessions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Available Days
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                  const isAvailable = (displayedUser.availableDays || []).includes(dayIdx);
                  return (
                    <div
                      key={dayIdx}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                        isAvailable
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-gray-50 dark:bg-gray-800/40 text-gray-400 border-gray-100 dark:border-gray-800"
                      }`}
                    >
                      <span>{dayNames[dayIdx]}</span>
                      <span>{isAvailable ? "✓ Open" : "Closed"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Time Blocks
              </h4>
              <div className="space-y-2">
                {(["morning", "afternoon", "evening", "night"] as const).map((block) => {
                  const isActive = (displayedUser.availableTimes || []).includes(block);
                  return (
                    <div
                      key={block}
                      className={`p-3 rounded-xl border text-xs capitalize flex items-center justify-between ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-bold"
                          : "bg-gray-50 dark:bg-gray-800/40 text-gray-400 border-gray-100 dark:border-gray-800"
                      }`}
                    >
                      <span>{block}</span>
                      <span>{isActive ? "✓ Available" : "Unavailable"}</span>
                    </div>
                  );
                })}
              </div>

              {!isMe && (
                <div className="pt-3">
                  <button
                    onClick={handleDirectBook}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Request a Time Slot 📅
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Editor Modal */}
      {isEditorOpen && currentUser && (
        <ProfileEditorModal
          user={currentUser}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading profile...</div>}>
      <ProfileContent />
    </React.Suspense>
  );
}
