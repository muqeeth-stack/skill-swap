"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { SkillCategory, SkillLevel } from "@/types";

export default function AdminPage() {
  const {
    allUsers,
    sessions,
    exchangeOffers,
    reports,
    recordings,
    addRecording,
    deleteRecording,
    adminToggleUserStatus,
    adminVerifyUser,
    adminResolveReport,
    blockUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"moderation" | "users" | "videos" | "analytics">("moderation");
  const pendingReports = reports.filter((r) => r.status === "pending");

  // Video CMS Form State
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoCategory, setVideoCategory] = useState<SkillCategory>("technology");
  const [videoSkill, setVideoSkill] = useState("");
  const [videoLevel, setVideoLevel] = useState<SkillLevel>("Intermediate");
  const [videoTeacherId, setVideoTeacherId] = useState(allUsers[0]?.id || "u1");
  const [videoUrl, setVideoUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  const [videoThumb, setVideoThumb] = useState("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800");
  const [videoDuration, setVideoDuration] = useState(600);
  const [videoObjectives, setVideoObjectives] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");

  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoSkill.trim()) return;

    const objectivesList = videoObjectives
      .split("\n")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    addRecording({
      title: videoTitle.trim(),
      description: videoDesc.trim(),
      category: videoCategory,
      skill: videoSkill.trim(),
      level: videoLevel,
      teacherId: videoTeacherId,
      videoUrl: videoUrl.trim(),
      thumbnailUrl: videoThumb.trim(),
      duration: Number(videoDuration) || 600,
      views: 0,
      likes: 0,
      learningObjectives: objectivesList.length > 0 ? objectivesList : ["Master key foundational concepts"],
      practicePrompt: videoPrompt.trim() || "Complete the accompanying drill exercise and document your results.",
      published: true,
      tags: [videoCategory, videoSkill.trim()],
      createdAt: new Date().toISOString(),
    });

    // Reset Form
    setVideoTitle("");
    setVideoDesc("");
    setVideoSkill("");
    setVideoObjectives("");
    setVideoPrompt("");
    setIsAddingVideo(false);
  };

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
          <span>🛡️ Safety, Trust & Platform Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          SynapseLearn Admin & CMS Panel
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage member safety, review reported incidents, verify credentials, curate masterclass videos, and monitor platform health.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total Members", value: allUsers.length, icon: "👥" },
          { label: "Active Sessions", value: sessions.length, icon: "📅" },
          { label: "Open Barters", value: exchangeOffers.length, icon: "⇄" },
          { label: "Masterclasses", value: recordings.length, icon: "🎥" },
          { label: "Pending Flags", value: pendingReports.length, icon: "🚨" },
        ].map((m, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-xs">
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{m.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "moderation"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <span>🚨 Moderation Queue</span>
          {pendingReports.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-100 text-rose-700 font-bold">
              {pendingReports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "users"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          👥 Member Directory ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab("videos")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "videos"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <span>🎥 Video CMS ({recordings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === "analytics"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          📊 System Health & Audits
        </button>
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Flagged Content & Incident Reports
            </h3>
            <span className="text-xs text-gray-400">Auto-prioritized by AI trust classifier</span>
          </div>

          {pendingReports.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 space-y-2">
              <div className="text-3xl">🛡️</div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Moderation Queue is Clear</h4>
              <p className="text-xs text-gray-400">All community safety flags have been reviewed. SynapseLearn network is healthy.</p>
            </div>
          ) : (
            pendingReports.map((report) => (
              <div key={report.id} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800 uppercase">
                      Incident #{report.id}
                    </span>
                    <span className="text-xs text-gray-400">Reported on {report.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Reason: {report.reason}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{report.details}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => adminResolveReport(report.id, "resolved")}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Dismiss Flag
                  </button>
                  <button
                    onClick={() => {
                      blockUser(report.reportedUserId);
                      adminResolveReport(report.id, "resolved");
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Suspend User
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Member Directory */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-xs uppercase text-gray-400">
            Registered Community Members ({allUsers.length})
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {allUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</h4>
                    <p className="text-xs text-gray-400">{user.email} • {user.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adminVerifyUser(user.id, "linkedin")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      user.isLinkedInVerified ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50"
                    }`}
                  >
                    {user.isLinkedInVerified ? "LinkedIn ✓" : "Verify LinkedIn"}
                  </button>
                  <button
                    onClick={() => adminToggleUserStatus(user.id)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    {user.isBlocked ? "Unblock User" : "Active Member"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Video CMS */}
      {activeTab === "videos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Masterclass Video Library Content Management
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Publish, edit, and curate pre-recorded skill drills and masterclasses.
              </p>
            </div>
            <button
              onClick={() => setIsAddingVideo(!isAddingVideo)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {isAddingVideo ? "✕ Cancel" : "+ Add New Masterclass"}
            </button>
          </div>

          {/* New Masterclass Form */}
          {isAddingVideo && (
            <form
              onSubmit={handleCreateVideo}
              className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-4 text-xs animate-fadeIn"
            >
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                Create & Publish Masterclass
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Video Title</label>
                  <input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Advanced Batting Footwork & Weight Transfer"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Primary Skill Name</label>
                  <input
                    type="text"
                    required
                    value={videoSkill}
                    onChange={(e) => setVideoSkill(e.target.value)}
                    placeholder="e.g. Cricket, React, Video Editing"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Lesson Description</label>
                <textarea
                  rows={3}
                  required
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  placeholder="Detailed breakdown of what is covered in this masterclass video..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value as SkillCategory)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    <option value="technology">Technology</option>
                    <option value="sports">Sports & Fitness</option>
                    <option value="creative">Creative & Media</option>
                    <option value="languages">Languages</option>
                    <option value="business">Business</option>
                    <option value="academics">Academics</option>
                    <option value="life_skills">Life Skills</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Skill Level</label>
                  <select
                    value={videoLevel}
                    onChange={(e) => setVideoLevel(e.target.value as SkillLevel)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Instructor</label>
                  <select
                    value={videoTeacherId}
                    onChange={(e) => setVideoTeacherId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.skillsTeach[0]?.name || "Mentor"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Direct Video MP4 URL</label>
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Duration (seconds)</label>
                  <input
                    type="number"
                    min={30}
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Thumbnail Image URL</label>
                <input
                  type="url"
                  required
                  value={videoThumb}
                  onChange={(e) => setVideoThumb(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Key Learning Objectives (one per line)
                </label>
                <textarea
                  rows={3}
                  value={videoObjectives}
                  onChange={(e) => setVideoObjectives(e.target.value)}
                  placeholder="Master the fundamental stance&#10;Execute proper wrist rotation&#10;Avoid common edge mistakes"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Interactive Practice Challenge Prompt
                </label>
                <textarea
                  rows={2}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Record 20 repetitions of this drill focusing on balance..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingVideo(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Publish Masterclass 🚀
                </button>
              </div>
            </form>
          )}

          {/* Masterclasses Table */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 overflow-hidden shadow-xs">
            <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {recordings.map((rec) => {
                const teacher = allUsers.find((u) => u.id === rec.teacherId);
                return (
                  <div key={rec.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <Image
                        src={rec.thumbnailUrl}
                        alt={rec.title}
                        width={80}
                        height={56}
                        className="w-20 h-14 rounded-xl object-cover bg-black shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 uppercase">
                            {rec.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">{rec.level}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {rec.title}
                        </h4>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          Instructor: {teacher?.name || "Synapse Mentor"} · {Math.floor(rec.duration / 60)} mins · 👁️ {rec.views} views
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href="/videos"
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold"
                      >
                        View in Player ↗
                      </a>
                      <button
                        onClick={() => deleteRecording(rec.id)}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeTab === "analytics" && (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Platform Health & Safety Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-gray-400">Matching Quality Score</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">98.4%</div>
              <p className="text-[11px] text-gray-500 mt-1">Reciprocal skill satisfaction rate</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-gray-400">Average Session Rating</div>
              <div className="text-2xl font-black text-amber-500 mt-1">4.92 / 5.0</div>
              <p className="text-[11px] text-gray-500 mt-1">Across 320+ peer exchanges</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-gray-400">Response SLA</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">&lt; 15 mins</div>
              <p className="text-[11px] text-gray-500 mt-1">Average connection request response time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
