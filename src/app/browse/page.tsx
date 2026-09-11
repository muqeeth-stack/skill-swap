"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { SKILL_CATEGORIES_METADATA } from "@/types";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

export default function BrowsePage() {
  const { currentUser, allUsers } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const filteredUsers = allUsers.filter((u) => {
    if (currentUser && u.id === currentUser.id) return false;
    if (selectedCategory !== "all") {
      const teachesCat = u.skillsTeach.some((s) => s.category === selectedCategory);
      const learnsCat = u.skillsLearn.some((s) => s.category === selectedCategory);
      if (!teachesCat && !learnsCat) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = u.name.toLowerCase().includes(q);
      const matchesSkills = u.skillsTeach.some((s) => s.name.toLowerCase().includes(q)) ||
        u.skillsLearn.some((s) => s.name.toLowerCase().includes(q));
      return matchesName || matchesSkills;
    }
    return true;
  });

  return (
    <div className="space-y-8 py-2">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          <span>Global Synapse Community</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Browse Mentors, Athletes & Learners
        </h1>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, skill, drill, or city..."
          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
        />

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
              selectedCategory === "all" ? "bg-indigo-600 text-white font-bold" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            All Categories
          </button>
          {SKILL_CATEGORIES_METADATA.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                selectedCategory === c.id ? "bg-indigo-600 text-white font-bold" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  width={52}
                  height={52}
                  className="w-13 h-13 rounded-2xl object-cover"
                />
                <div>
                  <Link href={`/profile?id=${user.id}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-indigo-600">
                    {user.name}
                  </Link>
                  <p className="text-[11px] text-gray-500">{user.location}</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                {user.bio}
              </p>

              <div className="space-y-1.5 mb-3">
                <div className="text-[10px] uppercase font-bold text-gray-400">Can Teach:</div>
                <div className="flex flex-wrap gap-1">
                  {user.skillsTeach.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px]">
                      {s.name} ({s.level})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <Link href={`/profile?id=${user.id}`} className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600">
                View Profile ➔
              </Link>
              <button
                onClick={() => {
                  setChatUserId(user.id);
                  setIsChatOpen(true);
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                💬 Message
              </button>
              <Link
                href={`/matches?q=${encodeURIComponent(user.name)}`}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Match & Book
              </Link>
            </div>
          </div>
        ))}
      </div>

      <ChatDrawer
        targetUserId={chatUserId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
