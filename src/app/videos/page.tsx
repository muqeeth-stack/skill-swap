"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { Recording } from "@/types";

const VideoPlayerModal = dynamic(() => import("@/components/video/VideoPlayerModal").then((m) => m.VideoPlayerModal), { ssr: false });

export default function VideosPage() {
  const { recordings, allUsers, videoProgress } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: "all", label: "All Categories", icon: "✨" },
    { id: "technology", label: "Technology", icon: "💻" },
    { id: "sports", label: "Sports & Fitness", icon: "🏏" },
    { id: "creative", label: "Creative & Media", icon: "🎨" },
    { id: "languages", label: "Languages", icon: "🌍" },
    { id: "business", label: "Business", icon: "💼" },
    { id: "academics", label: "Academics", icon: "📚" },
  ];

  // In-progress videos for Continue Watching row
  const continueWatchingList = useMemo(() => {
    return recordings.filter((r) => {
      const prog = videoProgress[r.id];
      return prog && prog.currentTime > 5 && !prog.completed;
    });
  }, [recordings, videoProgress]);

  // Filtered recordings
  const filteredRecordings = useMemo(() => {
    return recordings.filter((rec) => {
      const teacher = allUsers.find((u) => u.id === rec.teacherId);
      const matchesCategory =
        selectedCategory === "all" || rec.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "all" || rec.level.toLowerCase() === selectedLevel.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === "" ||
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher && teacher.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rec.tags && rec.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [recordings, allUsers, selectedCategory, selectedLevel, searchQuery]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-transparent p-6 sm:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 mb-3">
            <span>🎥 Pre-Recorded Learning Vault</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Curated Masterclasses & Skill Drills
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
            Watch expert tutorials, cricket biomechanics breakdowns, full-stack architecture lessons, and language masterclasses. Your playback position is automatically saved.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/paths"
            className="px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            🗺️ Learning Paths
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            + Publish Masterclass
          </Link>
        </div>
      </div>

      {/* Continue Watching Section (if user has active in-progress items) */}
      {continueWatchingList.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400">⏱️</span> Continue Watching
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {continueWatchingList.length} in progress
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueWatchingList.map((rec) => {
              const teacher = allUsers.find((u) => u.id === rec.teacherId);
              const prog = videoProgress[rec.id];
              const pct = prog && prog.duration > 0 ? Math.min(100, Math.round((prog.currentTime / prog.duration) * 100)) : 0;

              return (
                <div
                  key={`continue-${rec.id}`}
                  onClick={() => setActiveRecording(rec)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-center"
                >
                  <div className="relative w-28 h-18 rounded-xl overflow-hidden bg-black shrink-0">
                    <Image
                      src={rec.thumbnailUrl}
                      alt={rec.title}
                      width={256}
                      height={256}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/90 text-white flex items-center justify-center text-xs shadow-sm">
                        ▶
                      </div>
                    </div>
                    {/* Bottom mini progress line */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-700">
                      <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      {pct}% watched
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate mt-0.5">
                      {rec.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      By {teacher?.name || "Synapse Mentor"}
                    </p>
                    <div className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 mt-1">
                      Resume from {formatDuration(prog?.currentTime || 0)} →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search masterclasses by skill, topic, mentor, or tag..."
              aria-label="Search masterclasses"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Level Filter Dropdown */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            aria-label="Filter by experience level"
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="all">All Experience Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Masterclasses Grid */}
      {filteredRecordings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 space-y-3">
          <div className="text-4xl">🎬</div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No masterclasses matched your filters
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLevel("all");
            }}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((rec) => {
            const teacher = allUsers.find((u) => u.id === rec.teacherId);
            const prog = videoProgress[rec.id];
            const isCompleted = prog?.completed;
            const pct = prog && prog.duration > 0 ? Math.min(100, Math.round((prog.currentTime / prog.duration) * 100)) : 0;

            return (
              <div
                key={rec.id}
                className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden shadow-2xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
              >
                {/* Thumbnail & Video Banner */}
                <div
                  className="relative aspect-video bg-gray-900 cursor-pointer overflow-hidden"
                  onClick={() => setActiveRecording(rec)}
                >
                  <Image
                    src={rec.thumbnailUrl}
                    alt={rec.title}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/95 dark:bg-gray-900/95 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                      ▶
                    </div>
                  </div>

                  {/* Badges Top Left & Right */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                      {rec.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-600/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {rec.level}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                        ✓ Completed
                      </span>
                    ) : prog && pct > 0 ? (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                        {pct}% Watched
                      </span>
                    ) : null}
                  </div>

                  {/* Bottom Duration Badge */}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                    {formatDuration(rec.duration || 600)}
                  </span>

                  {/* Progress Line */}
                  {pct > 0 && (
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/50">
                      <div
                        className={`h-full ${isCompleted ? "bg-emerald-500" : "bg-indigo-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{rec.skill}</span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span>👁️ {rec.views.toLocaleString()}</span>
                        <span>❤️ {rec.likes}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setActiveRecording(rec)}
                      className="font-extrabold text-gray-900 dark:text-white text-base leading-snug cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                    >
                      {rec.title}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  {/* Teacher Row and Watch Button */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    {teacher ? (
                      <Link
                        href={`/profile?id=${teacher.id}`}
                        className="flex items-center gap-2 group/teacher truncate"
                      >
                        <Image
                          src={teacher.avatar}
                          alt={teacher.name}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
                        />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover/teacher:text-indigo-600 dark:group-hover/teacher:text-indigo-400 truncate">
                          {teacher.name}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-500">Synapse Mentor</span>
                    )}

                    <button
                      onClick={() => setActiveRecording(rec)}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      {prog && prog.currentTime > 5 ? "Resume ▶" : "Watch ▶"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Learning Path Hook Banner */}
      <div className="mt-12 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-purple-200">
            Structured Pathways
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            Turn Video Lessons Into Mastered Competencies
          </h3>
          <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
            Combine these recorded drills with hands-on practice projects, milestone evaluations, and 1-on-1 peer exchange sessions in our full Learning Paths.
          </p>
        </div>
        <Link
          href="/paths"
          className="px-6 py-3 bg-white text-indigo-900 hover:bg-purple-50 text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg transition-all shrink-0 cursor-pointer"
        >
          Explore All Learning Paths →
        </Link>
      </div>

      {/* Active Interactive Player Modal */}
      {activeRecording && (
        <VideoPlayerModal
          recording={activeRecording}
          onClose={() => setActiveRecording(null)}
        />
      )}
    </div>
  );
}
