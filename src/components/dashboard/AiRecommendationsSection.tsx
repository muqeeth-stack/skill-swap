"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, MatchScore, LearningRoom, LearningPath } from "@/types";

interface AiRecommendationsSectionProps {
  currentUser: User;
  topMatches: MatchScore[];
  rooms: LearningRoom[];
  learningPaths: LearningPath[];
  onOpenChat: (userId: string) => void;
  onConnect: (userId: string) => void;
  onJoinRoom: (roomId: string) => void;
}

export const AiRecommendationsSection: React.FC<AiRecommendationsSectionProps> = ({
  currentUser,
  topMatches,
  rooms,
  learningPaths,
  onOpenChat,
  onConnect,
  onJoinRoom,
}) => {
  const [activeTab, setActiveTab] = useState<"mentors" | "trending" | "rooms" | "paths">("mentors");
  const [selectedMatchForBreakdown, setSelectedMatchForBreakdown] = useState<MatchScore | null>(null);

  // Trending platform skills
  const trendingSkills = [
    {
      name: "Cricket Biomechanics & Fast Bowling",
      category: "Sports & Fitness",
      learnersCount: 38,
      demandLevel: "Very High",
      icon: "🏏",
    },
    {
      name: "Next.js 15 & AI Agent Architectures",
      category: "Technology",
      learnersCount: 64,
      demandLevel: "Extreme",
      icon: "⚡",
    },
    {
      name: "UI Motion & Micro-Interactions (Framer)",
      category: "Creative & Arts",
      learnersCount: 29,
      demandLevel: "High",
      icon: "🎨",
    },
    {
      name: "Conversational Spanish & Fluency",
      category: "Languages",
      learnersCount: 41,
      demandLevel: "High",
      icon: "🌐",
    },
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-6">
      {/* Header with pill tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>✨ AI-Powered Recommendations</span>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
              Synapse Engine
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Dynamic suggestions tailored to your goals, learning velocity, and peer network
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-750 rounded-xl text-xs font-semibold overflow-x-auto max-w-full min-w-0">
          <button
            onClick={() => setActiveTab("mentors")}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === "mentors"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            👥 Top Mentors ({topMatches.length})
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === "trending"
                ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-xs font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🔥 High Demand
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === "rooms"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🎙️ Live Rooms
          </button>
          <button
            onClick={() => setActiveTab("paths")}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === "paths"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🗺️ Roadmaps
          </button>
        </div>
      </div>

      {/* Tab 1: Top Mentors with Synergy Breakdown */}
      {activeTab === "mentors" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMatches.map((match) => {
              const target = match.targetUser;
              const matchPct = Math.round(match.overallScore * 100);

              return (
                <div
                  key={target.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={
                            target.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(target.name)}`
                          }
                          alt={target.name}
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{target.name}</h4>
                            {target.isLinkedInVerified && (
                              <span className="text-[10px] text-blue-500 font-bold" title="Verified">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            ⭐ {target.rating.toFixed(1)} ({target.totalReviews})
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 text-xs font-extrabold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          {matchPct}% Fit
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{target.bio}</p>

                    {/* Skill highlight */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teaches:</div>
                      <div className="flex flex-wrap gap-1">
                        {target.skillsTeach.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-indigo-700 dark:text-indigo-300"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI explanation highlight */}
                    {match.reasons && match.reasons.length > 0 && (
                      <div className="p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 text-[11px] text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/60">
                        <span className="font-bold">💡 Synergy:</span> {match.reasons[0]}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center gap-2">
                    <button
                      onClick={() => onConnect(target.id)}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                    >
                      + Connect
                    </button>
                    <button
                      onClick={() => onOpenChat(target.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                    >
                      💬 Message
                    </button>
                    <button
                      onClick={() => setSelectedMatchForBreakdown(match)}
                      className="py-1.5 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all cursor-pointer"
                      title="Inspect match factors"
                    >
                      📊 Breakdown
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/matches"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Explore all community matches with custom weights ➔
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Trending Platform Skills */}
      {activeTab === "trending" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingSkills.map((trend, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700/80 hover:border-purple-300 dark:hover:border-purple-600 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{trend.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                  {trend.demandLevel} Demand
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{trend.name}</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{trend.category}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                <span>👥 {trend.learnersCount} looking for mentors</span>
              </div>
              <Link
                href={`/matches?skill=${encodeURIComponent(trend.name)}`}
                className="block w-full py-1.5 text-center text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer"
              >
                Find Instructors
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Collaborative Rooms */}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.slice(0, 3).map((room) => {
            const isUserInRoom = room.participants.includes(currentUser.id);
            return (
              <div
                key={room.id}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700/80 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {room.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      👥 {room.participants.length}/{room.maxParticipants}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{room.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{room.description}</p>
                </div>

                <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    🪙 {room.credits === 0 ? "Free Exchange" : `${room.credits} Credits`}
                  </span>
                  {isUserInRoom ? (
                    <Link
                      href="/groups"
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                    >
                      Enter Room ➔
                    </Link>
                  ) : (
                    <button
                      onClick={() => onJoinRoom(room.id)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-all"
                    >
                      Join Room
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Curated Roadmaps */}
      {activeTab === "paths" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPaths.slice(0, 4).map((path) => {
            const completedStages = path.stages.filter((s) => s.completed).length;
            const pct = Math.round((completedStages / (path.stages.length || 1)) * 100);

            return (
              <div
                key={path.id}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {path.category} • ~{path.estimatedWeeks} Weeks
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">{path.title}</h4>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{pct}%</span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{path.description}</p>

                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {completedStages}/{path.stages.length} Milestones
                  </span>
                  <Link
                    href="/paths"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Roadmap ➔
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Synergy Breakdown Modal */}
      {selectedMatchForBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={
                    selectedMatchForBreakdown.targetUser.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      selectedMatchForBreakdown.targetUser.name
                    )}`
                  }
                  alt={selectedMatchForBreakdown.targetUser.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {selectedMatchForBreakdown.targetUser.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Overall Synergy: {Math.round(selectedMatchForBreakdown.overallScore * 100)}%
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMatchForBreakdown(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Score Factor Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Multi-Factor Synergy Breakdown
              </h4>

              {[
                { label: "Skill Exchange Reciprocity", val: selectedMatchForBreakdown.skillExchangeScore, weight: "35%" },
                { label: "Proficiency Level Harmony", val: selectedMatchForBreakdown.levelScore, weight: "15%" },
                { label: "Learning Goals Alignment", val: selectedMatchForBreakdown.goalScore, weight: "15%" },
                { label: "Availability Overlap", val: selectedMatchForBreakdown.availabilityScore, weight: "15%" },
                { label: "Preferred Learning Methods", val: selectedMatchForBreakdown.preferencesScore, weight: "10%" },
                { label: "Language & Interests", val: selectedMatchForBreakdown.languageScore, weight: "10%" },
              ].map((factor, idx) => {
                const pct = Math.round(factor.val * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-700 dark:text-gray-300">
                        {factor.label} <span className="text-gray-400 text-[10px]">({factor.weight})</span>
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-750 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Match Reasons List */}
            {selectedMatchForBreakdown.reasons.length > 0 && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900 text-xs space-y-1">
                <span className="font-bold text-indigo-900 dark:text-indigo-200">Key Match Signals:</span>
                <ul className="list-disc list-inside space-y-0.5 text-indigo-800 dark:text-indigo-300">
                  {selectedMatchForBreakdown.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedMatchForBreakdown(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const targetId = selectedMatchForBreakdown.targetUser.id;
                  setSelectedMatchForBreakdown(null);
                  onOpenChat(targetId);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
