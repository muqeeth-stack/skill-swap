"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/types";

interface CommunityDiscoverySectionProps {
  currentUser: User;
  allUsers: User[];
  onOpenChat: (userId: string) => void;
  onConnect: (userId: string) => void;
}

interface MicroCommunity {
  id: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  matchKeywords: string[];
  color: {
    badge: string;
    border: string;
  };
}

const MICRO_COMMUNITIES: MicroCommunity[] = [
  {
    id: "sports-biomechanics",
    name: "Cricket & Sports Performance",
    tagline: "Bowling biomechanics, athletic fitness, spin craft & tactical analytics",
    category: "Sports & Fitness",
    icon: "🏏",
    matchKeywords: ["cricket", "bowling", "batting", "fitness", "sports", "yoga"],
    color: {
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
      border: "hover:border-amber-300 dark:hover:border-amber-700",
    },
  },
  {
    id: "fullstack-ai",
    name: "Full-Stack & AI Builders",
    tagline: "Next.js, LLM agent architecture, TypeScript & scalable cloud systems",
    category: "Technology",
    icon: "⚡",
    matchKeywords: ["react", "next.js", "python", "ai", "machine learning", "typescript", "node"],
    color: {
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300",
      border: "hover:border-indigo-300 dark:hover:border-indigo-700",
    },
  },
  {
    id: "creative-motion",
    name: "UI/UX, Motion & 3D Arts",
    tagline: "Design systems, interaction physics, 3D modeling & visual storytelling",
    category: "Creative & Arts",
    icon: "🎨",
    matchKeywords: ["design", "ui", "ux", "figma", "blender", "video", "motion"],
    color: {
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300",
      border: "hover:border-purple-300 dark:hover:border-purple-700",
    },
  },
  {
    id: "polyglots-culture",
    name: "Global Polyglots & Linguistics",
    tagline: "Conversational fluency, natural pronunciation & cultural exchange",
    category: "Languages",
    icon: "🌐",
    matchKeywords: ["spanish", "japanese", "french", "english", "german", "mandarin", "language"],
    color: {
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300",
      border: "hover:border-emerald-300 dark:hover:border-emerald-700",
    },
  },
];

export const CommunityDiscoverySection: React.FC<CommunityDiscoverySectionProps> = ({
  currentUser,
  allUsers,
  onOpenChat,
  onConnect,
}) => {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("sports-biomechanics");

  const selectedCommunity =
    MICRO_COMMUNITIES.find((c) => c.id === selectedCommunityId) || MICRO_COMMUNITIES[0];

  // Filter users that match this community's keywords
  const communityMembers = allUsers
    .filter((u) => u.id !== currentUser.id)
    .filter((u) => {
      const allText = [
        u.bio,
        ...u.skillsTeach.map((s) => s.name),
        ...u.skillsLearn.map((s) => s.name),
        ...u.interests,
        ...u.learningGoals,
      ]
        .join(" ")
        .toLowerCase();

      return selectedCommunity.matchKeywords.some((kw) => allText.includes(kw));
    });

  // Fallback to top users if none match strictly
  const displayMembers =
    communityMembers.length > 0
      ? communityMembers.slice(0, 4)
      : allUsers.filter((u) => u.id !== currentUser.id).slice(0, 4);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🌐 Community Discovery</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300">
              Interest Hubs
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Connect with peers and specialized mentor circles in your specific domain
          </p>
        </div>

        <Link
          href="/groups"
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 self-start sm:self-auto"
        >
          Explore All Learning Rooms ➔
        </Link>
      </div>

      {/* Community Pills Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MICRO_COMMUNITIES.map((comm) => {
          const isSelected = comm.id === selectedCommunityId;
          return (
            <button
              key={comm.id}
              onClick={() => setSelectedCommunityId(comm.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-xs"
                  : "bg-gray-50 dark:bg-gray-750 border-gray-200/70 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="text-xl mb-1">{comm.icon}</div>
              <h4
                className={`font-bold text-xs ${
                  isSelected ? "text-teal-900 dark:text-teal-200" : "text-gray-900 dark:text-white"
                }`}
              >
                {comm.name}
              </h4>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">
                {comm.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Community Details & Members */}
      <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-750/70 border border-gray-200/60 dark:border-gray-750 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/60 dark:border-gray-700/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCommunity.icon}</span>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {selectedCommunity.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedCommunity.tagline}
                </p>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-300 border border-gray-200 dark:border-gray-600 self-start sm:self-auto">
            {displayMembers.length} Active Peers Nearby
          </span>
        </div>

        {/* Member cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayMembers.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 flex flex-col justify-between space-y-3 hover:shadow-xs transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <Image
                    src={
                      member.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`
                    }
                    alt={member.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">
                      {member.name}
                    </h5>
                    <span className="text-[10px] text-gray-400">
                      ⭐ {member.rating.toFixed(1)} • {member.streakDays}d streak
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                  {member.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {member.skillsTeach.slice(0, 2).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => onOpenChat(member.id)}
                  className="flex-1 py-1 px-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white text-[10px] font-bold transition-all text-center cursor-pointer"
                >
                  Say Hi
                </button>
                <button
                  onClick={() => onConnect(member.id)}
                  className="py-1 px-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-[10px] font-bold transition-all text-center cursor-pointer"
                >
                  + Connect
                </button>
                <Link
                  href={`/profile?id=${member.id}`}
                  className="py-1 px-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-[10px] font-semibold transition-all text-center"
                >
                  Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
