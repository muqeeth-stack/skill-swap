"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

interface WhatToDoNextProps {
  onOpenAiAssistant: () => void;
}

interface ActionItem {
  id: string;
  priority: number;
  label: string;
  detail: string;
  href?: string;
  onAction?: () => void;
  icon: string;
  accent: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatSessionTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const month = MONTHS[d.getUTCMonth()];
  const day = d.getUTCDate();
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${month} ${day} · ${hours}:${minutes} UTC`;
}

export function WhatToDoNext({ onOpenAiAssistant }: WhatToDoNextProps) {
  const { currentUser, sessions, videoProgress, recordings, connections, learningPaths, getMatches, smartPods } = useApp();
  if (!currentUser) return null;

  const actions: ActionItem[] = [];

  // Check if 3+ co-learners are detected for one of currentUser's learning skills
  const matchingPod = smartPods.find((pod) =>
    pod.learnerIds.includes(currentUser.id) ||
    currentUser.skillsLearn.some((s) =>
      pod.topic.toLowerCase().includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(pod.topic.toLowerCase())
    )
  );

  if (matchingPod) {
    actions.push({
      id: "smart-pod",
      priority: 85,
      label: "AI Smart Study Pod detected",
      detail: `${matchingPod.learners.length} peers are currently learning ${matchingPod.topic}. Join their circle!`,
      href: "/groups",
      icon: "🤖",
      accent: "border-teal-300 bg-teal-50 dark:bg-teal-950/40 dark:border-teal-800/60",
    });
  }

  const upcoming = sessions
    .filter((s) => (s.teacherId === currentUser.id || s.learnerId === currentUser.id) && s.status === "pending")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  if (upcoming) {
    actions.push({
      id: "session",
      priority: 90,
      label: "Upcoming session",
      detail: `${upcoming.skill}${upcoming.subSkill ? ` · ${upcoming.subSkill}` : ""} · ${formatSessionTime(upcoming.scheduledAt)}`,
      href: "/sessions",
      icon: "📅",
      accent: "border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800/60",
    });
  }

  const pendingRequests = connections.filter((c) => c.receiverId === currentUser.id && c.status === "pending");
  if (pendingRequests.length > 0) {
    actions.push({
      id: "connections",
      priority: 80,
      label: "Respond to connection request",
      detail: `${pendingRequests.length} pending request${pendingRequests.length > 1 ? "s" : ""} waiting for your reply`,
      href: "/connections",
      icon: "🤝",
      accent: "border-blue-300 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800/60",
    });
  }

  const inProgressVideo = Object.values(videoProgress).find((p) => !p.completed && p.currentTime > 5);
  if (inProgressVideo) {
    const recording = recordings.find((r) => r.id === inProgressVideo.videoId);
    if (recording) {
      const pct = Math.round((inProgressVideo.currentTime / Math.max(inProgressVideo.duration, 1)) * 100);
      actions.push({
        id: "video",
        priority: 70,
        label: "Resume a masterclass",
        detail: `${recording.title} · ${pct}% watched`,
        href: "/videos",
        icon: "🎥",
        accent: "border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800/60",
      });
    }
  }

  const topMatches = getMatches();
  if (topMatches.length === 0) {
    actions.push({
      id: "discover",
      priority: 60,
      label: "Let AI discover what to learn next",
      detail: "Complete your skill profile so our matching engine can find your synergy",
      onAction: onOpenAiAssistant,
      icon: "✨",
      accent: "border-violet-300 bg-violet-50 dark:bg-violet-950/40 dark:border-violet-800/60",
    });
  } else {
    actions.push({
      id: "matches",
      priority: 55,
      label: "Review your AI mentor matches",
      detail: `${topMatches.length} high-synergy peer${topMatches.length > 1 ? "s" : ""} ready to exchange skills`,
      href: "/matches",
      icon: "⚡",
      accent: "border-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-800/60",
    });
  }

  const incompletePath = learningPaths.find((p) => p.stages.some((st) => !st.completed));
  if (incompletePath) {
    actions.push({
      id: "path",
      priority: 50,
      label: "Continue your learning path",
      detail: incompletePath.title,
      href: "/paths",
      icon: "🗺️",
      accent: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800/60",
    });
  } else {
    actions.push({
      id: "explore",
      priority: 40,
      label: "Explore curated learning paths",
      detail: "Structured roadmaps built by top mentors on SynapseLearn",
      href: "/paths",
      icon: "🧭",
      accent: "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700",
    });
  }

  const sorted = actions.sort((a, b) => b.priority - a.priority).slice(0, 3);

  const cardClass = (a: ActionItem) =>
    `flex items-start gap-3 p-3.5 rounded-2xl border ${a.accent} hover:shadow-md transition-all ${
      a.href || a.onAction ? "cursor-pointer" : ""
    }`;

  return (
    <section className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
            🎯 What Should You Do Next?
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Prioritized actions from your sessions, matches, progress and path milestones.
          </p>
        </div>
        <Link
          href="/paths"
          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-2">
        {sorted.map((a, idx) => {
          const inner = (
            <>
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-base shrink-0">
                {a.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{a.label}</p>
                  {idx === 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      Next
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate mt-0.5">{a.detail}</p>
              </div>
              <span className="ml-auto text-gray-300 dark:text-gray-600 shrink-0">›</span>
            </>
          );
          const cls = cardClass(a);
          if (a.onAction) {
            return (
              <button key={a.id} onClick={a.onAction} className={`${cls} w-full text-left`}>
                {inner}
              </button>
            );
          }
          if (a.href) {
            return (
              <Link key={a.id} href={a.href} className={`${cls} block`}>
                {inner}
              </Link>
            );
          }
          return (
            <div key={a.id} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}