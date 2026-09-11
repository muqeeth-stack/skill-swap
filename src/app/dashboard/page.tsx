"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/dateUtils";
import { UserSkill } from "@/types";

// Dashboard Specialized Subcomponents
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WhatToDoNext } from "@/components/dashboard/WhatToDoNext";
import { SynapseDailyBrief } from "@/components/dashboard/SynapseDailyBrief";
import { NaturalLanguageDiscovery } from "@/components/dashboard/NaturalLanguageDiscovery";
import { PerfectExchangeSection } from "@/components/dashboard/PerfectExchangeSection";
import { MySkillsSection } from "@/components/dashboard/MySkillsSection";
import { SkillGapAnalyzer } from "@/components/dashboard/SkillGapAnalyzer";
import { SkillGraphExplorer } from "@/components/dashboard/SkillGraphExplorer";
import { AiRecommendationsSection } from "@/components/dashboard/AiRecommendationsSection";
import { CommunityDiscoverySection } from "@/components/dashboard/CommunityDiscoverySection";

// Interactive Modals (lazy-loaded for faster initial paint)
const LearningModeModal = dynamic(() => import("@/components/dashboard/LearningModeModal").then((m) => m.LearningModeModal), { ssr: false });
const AiProjectGeneratorModal = dynamic(() => import("@/components/dashboard/AiProjectGeneratorModal").then((m) => m.AiProjectGeneratorModal), { ssr: false });
const AiProfileImproveModal = dynamic(() => import("@/components/dashboard/AiProfileImproveModal").then((m) => m.AiProfileImproveModal), { ssr: false });
const TrustSafetyModal = dynamic(() => import("@/components/dashboard/TrustSafetyModal").then((m) => m.TrustSafetyModal), { ssr: false });
const ChatDrawer = dynamic(() => import("@/components/chat/ChatDrawer").then((m) => m.ChatDrawer), { ssr: false });
const AiAssistantModal = dynamic(() => import("@/components/ai/AiAssistantModal").then((m) => m.default), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    allUsers,
    learningPaths,
    rooms,
    sessions,
    notifications,
    getMatches,
    searchWithAI,
    updateProfile,
    reportUser,
    blockUser,
    sendConnectionRequest,
    joinRoom,
    createExchangeOffer,
    showToast,
  } = useApp();

  // Chat & AI Modal states
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // New Intelligent Modals
  const [isLearningModeOpen, setIsLearningModeOpen] = useState(false);
  const [activeLearningSkill, setActiveLearningSkill] = useState("");

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [activeProjectSkill, setActiveProjectSkill] = useState("");

  const [isProfileImproveOpen, setIsProfileImproveOpen] = useState(false);
  const [isTrustSafetyOpen, setIsTrustSafetyOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="text-5xl">🔐</div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Please sign in to access your SynapseLearn Dashboard
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Connect with vetted peers, exchange skills 1-on-1, and track your personalized mastery milestones.
        </p>
        <Link
          href="/login"
          className="inline-block px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-md transition-all cursor-pointer"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  // Calculate top matches
  const topMatches = getMatches().slice(0, 6);

  // Active user learning paths
  const userPaths = learningPaths.slice(0, 2);

  // User's booked sessions
  const userSessions = sessions.filter(
    (s) => s.teacherId === currentUser.id || s.learnerId === currentUser.id
  );

  // Handlers
  const handleOpenChat = (userId: string) => {
    setChatUserId(userId);
    setIsChatOpen(true);
  };

  const handleStartLearning = (skillName: string) => {
    setActiveLearningSkill(skillName);
    setIsLearningModeOpen(true);
  };

  const handleGenerateProject = (skillName: string) => {
    setActiveProjectSkill(skillName);
    setIsProjectModalOpen(true);
  };

  const handleUpdateSkills = (updatedTeach: UserSkill[], updatedLearn: UserSkill[]) => {
    updateProfile({
      skillsTeach: updatedTeach,
      skillsLearn: updatedLearn,
    });
  };

  const handleStartExchangeWithPeer = (peerId: string) => {
    const peer = allUsers.find((u) => u.id === peerId);
    if (!peer) return;

    // Find cross skills
    const teach = currentUser.skillsTeach[0]?.name || "Web Development";
    const learn = peer.skillsTeach[0]?.name || "Cricket Bowling";

    createExchangeOffer(
      teach,
      "Intermediate",
      learn,
      "Beginner",
      `1-on-1 barter exchange initiated with ${peer.name}: offering ${teach} in return for ${learn}.`
    );
    showToast(`Exchange offer created with ${peer.name}! Opening direct chat...`, "success");
    handleOpenChat(peerId);
  };

  return (
    <div className="space-y-8 py-3 pb-16">
      {/* 1. Header with Profile Strength, Quick Metrics & AI Profile Action */}
      <DashboardHeader
        currentUser={currentUser}
        onOpenProfileImprove={() => setIsProfileImproveOpen(true)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />

      {/* 2. What To Do Next (prioritized actions) */}
      <WhatToDoNext onOpenAiAssistant={() => setIsAiModalOpen(true)} />

      {/* 3. Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "AI Matches",
            href: "/matches",
            icon: "⚡",
            tag: "Synergy",
            color: "hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40",
          },
          {
            label: "Masterclasses",
            href: "/videos",
            icon: "🎥",
            tag: "Video Vault",
            color: "hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/40",
          },
          {
            label: "Skill Barter",
            href: "/exchange",
            icon: "⇄",
            tag: "Zero-Cost",
            color: "hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40",
          },
          {
            label: "Learning Paths",
            href: "/paths",
            icon: "🗺️",
            tag: "Curated",
            color: "hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40",
          },
          {
            label: "Study Rooms",
            href: "/groups",
            icon: "🎙️",
            tag: "Live Circles",
            color: "hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/40",
          },
          {
            label: "Synapse AI",
            onClick: () => setIsAiModalOpen(true),
            icon: "✨",
            tag: "Assistant",
            color: "hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/40",
          },
        ].map((action, idx) => {
          const content = (
            <>
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl">{action.icon}</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  {action.tag}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white mt-1">
                {action.label}
              </span>
            </>
          );

          if (action.href) {
            return (
              <Link
                key={idx}
                href={action.href}
                className={`p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex flex-col items-start justify-between shadow-xs transition-all ${action.color}`}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={idx}
              onClick={action.onClick}
              className={`p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex flex-col items-start justify-between shadow-xs transition-all cursor-pointer text-left ${action.color}`}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* 3. AI Daily Learning Brief ("Your Synapse Brief") */}
      <SynapseDailyBrief
        currentUser={currentUser}
        allUsers={allUsers}
        onConnectPerson={handleOpenChat}
        onStartLearning={handleStartLearning}
      />

      {/* 4. Natural-Language Skill Discovery Search */}
      <NaturalLanguageDiscovery
        onSearch={(q: string) => searchWithAI(q).matches}
        onOpenChat={handleOpenChat}
      />

      {/* 5. Perfect Skill Exchange ("Double Barter" suggestions with 1-click start) */}
      <PerfectExchangeSection
        currentUser={currentUser}
        allUsers={allUsers}
        onStartExchange={handleStartExchangeWithPeer}
      />

      {/* 6. Main Content Layout: Deep Modules & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Core Intelligence Modules */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Skills & Mastery Hub */}
          <MySkillsSection
            currentUser={currentUser}
            onUpdateSkills={handleUpdateSkills}
            onStartLearning={handleStartLearning}
            onGenerateProject={handleGenerateProject}
            onFindMentors={(skill) => {
              router.push(`/matches?skill=${encodeURIComponent(skill)}`);
            }}
          />

          {/* AI Skill Gap Analysis */}
          <SkillGapAnalyzer
            currentUser={currentUser}
            allUsers={allUsers}
            onConnectMentor={handleOpenChat}
            onStartLearning={handleStartLearning}
          />

          {/* Interactive Visual Skill Graph Explorer */}
          <SkillGraphExplorer
            currentUser={currentUser}
            allUsers={allUsers}
            onSelectSkill={handleStartLearning}
            onConnectMentor={handleOpenChat}
          />

          {/* AI-Powered Platform Recommendations (Mentors, Trending, Rooms, Roadmaps) */}
          <AiRecommendationsSection
            currentUser={currentUser}
            topMatches={topMatches}
            rooms={rooms}
            learningPaths={learningPaths}
            onOpenChat={handleOpenChat}
            onConnect={(id) => sendConnectionRequest(id)}
            onJoinRoom={(id) => {
              joinRoom(id);
              showToast("Joined learning room!", "success");
            }}
          />

          {/* Micro-Community Discovery (Sports, AI, Design, Polyglots) */}
          <CommunityDiscoverySection
            currentUser={currentUser}
            allUsers={allUsers}
            onOpenChat={handleOpenChat}
            onConnect={(id) => sendConnectionRequest(id)}
          />
        </div>

        {/* Right 1 Column: Sessions, Roadmaps, Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Booked Sessions Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <span>📅 Scheduled Sessions</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                {userSessions.length} active
              </span>
            </div>

            {userSessions.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs space-y-2">
                <div className="text-3xl">🗓️</div>
                <p>No active sessions scheduled yet.</p>
                <Link
                  href="/matches"
                  className="text-indigo-600 dark:text-indigo-400 font-bold block hover:underline"
                >
                  Find a mentor to book ➔
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userSessions.map((s) => {
                  const otherUser = allUsers.find(
                    (u) => u.id === (s.teacherId === currentUser.id ? s.learnerId : s.teacherId)
                  );
                  const isTeaching = s.teacherId === currentUser.id;

                  return (
                    <div
                      key={s.id}
                      className="p-3 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200/60 dark:border-gray-700 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">{s.skill}</span>
                        <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 uppercase">
                          {s.status}
                        </span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 flex items-center justify-between text-[11px]">
                        <span>
                          {isTeaching ? "Teaching" : "Learning with"} {otherUser?.name || "Peer"}
                        </span>
                        <span>⏰ {formatDate(s.scheduledAt)}</span>
                      </div>
                      {otherUser && (
                        <button
                          onClick={() => handleOpenChat(otherUser.id)}
                          className="w-full py-1 text-center font-semibold rounded-lg bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 text-[10px] cursor-pointer"
                        >
                          Message Partner
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Curated Roadmaps */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">
                🗺️ Active Roadmaps
              </h3>
              <Link
                href="/paths"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All Paths ➔
              </Link>
            </div>

            <div className="space-y-3">
              {userPaths.map((path) => {
                const totalStages = path.stages.length;
                const completedCount = path.stages.filter((s) => s.completed).length;
                const progressPct = Math.round((completedCount / (totalStages || 1)) * 100);

                return (
                  <div
                    key={path.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/60 dark:border-gray-700 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {path.category}
                        </span>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white mt-0.5">
                          {path.title}
                        </h4>
                      </div>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {progressPct}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{completedCount}/{totalStages} milestones finished</span>
                      <Link
                        href="/paths"
                        className="text-indigo-600 dark:text-indigo-400 font-semibold"
                      >
                        Resume ➔
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Learning Rooms Hub */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">
                🎙️ Learning Rooms
              </h3>
              <Link
                href="/groups"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Browse All
              </Link>
            </div>

            <div className="space-y-2.5">
              {rooms.slice(0, 3).map((room) => (
                <Link
                  key={room.id}
                  href="/groups"
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/60 hover:border-indigo-300 dark:border-gray-700 block transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-indigo-600">
                      {room.title}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      👥 {room.participants.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {room.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Feed */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <span>⚡ Recent Activity</span>
              </h3>
              <span className="text-[10px] text-gray-400 font-semibold">Live stream</span>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "/connections"}
                  className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-750/70 border border-gray-100 dark:border-gray-700/60 block hover:border-indigo-300 transition-all"
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-indigo-500">●</span>
                    <span className="truncate">{n.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {n.message}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Community Trust & Security Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/60 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                Verified Skill Exchange
              </h4>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
              Every barter session is backed by transparent reviews and Synapse safety standards.
            </p>
            <button
              onClick={() => setIsTrustSafetyOpen(true)}
              className="w-full py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Review Safety Guidelines
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <LearningModeModal
        isOpen={isLearningModeOpen}
        skillName={activeLearningSkill}
        currentUser={currentUser}
        allUsers={allUsers}
        onClose={() => setIsLearningModeOpen(false)}
        onConnectMentor={handleOpenChat}
      />

      <AiProjectGeneratorModal
        isOpen={isProjectModalOpen}
        initialSkill={activeProjectSkill}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <AiProfileImproveModal
        isOpen={isProfileImproveOpen}
        currentUser={currentUser}
        onClose={() => setIsProfileImproveOpen(false)}
        onApplyImprovements={(data) => {
          updateProfile(data);
          showToast("AI improvements applied to your profile!", "success");
        }}
      />

      <TrustSafetyModal
        isOpen={isTrustSafetyOpen}
        currentUser={currentUser}
        allUsers={allUsers}
        onClose={() => setIsTrustSafetyOpen(false)}
        onReportUser={(userId, reason, details) => {
          reportUser(userId, `${reason}${details ? `: ${details}` : ""}`);
          showToast("User report submitted to moderation team.", "success");
        }}
        onBlockUser={(userId) => {
          blockUser(userId);
          showToast("User blocked.", "info");
        }}
      />

      <ChatDrawer
        targetUserId={chatUserId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
