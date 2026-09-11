"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { User } from "@/types";
import { generateDailyBrief } from "@/lib/dashboard-intelligence";

interface SynapseDailyBriefProps {
  currentUser: User;
  allUsers: User[];
  onConnectPerson: (userId: string) => void;
  onStartLearning: (skillName: string) => void;
}

export function SynapseDailyBrief({
  currentUser,
  allUsers,
  onConnectPerson,
  onStartLearning,
}: SynapseDailyBriefProps) {
  const brief = useMemo(() => generateDailyBrief(currentUser, allUsers), [currentUser, allUsers]);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-white dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-gray-850 rounded-3xl border border-indigo-100/90 dark:border-indigo-900/60 p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100/70 dark:border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-lg shadow-md shadow-indigo-500/20">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                Your Synapse Daily Learning Brief
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                AI Synthesized
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Target Focus: <strong className="text-indigo-600 dark:text-indigo-400">{brief.focusSkill}</strong> • {brief.quote}
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartLearning(brief.focusSkill)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>Launch Learning Mode ➔</span>
        </button>
      </div>

      {/* Grid: Daily Plan + Recommended Mentor + Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Daily Plan Checklist */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Today&apos;s High-Impact Schedule ({completedTasks.length}/{brief.plan.length} Completed)
            </h3>
          </div>

          <div className="space-y-2.5">
            {brief.plan.map((item, idx) => {
              const isChecked = completedTasks.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 text-gray-400 line-through"
                      : "bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-indigo-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTask(idx)}
                      aria-label={`Mark task ${idx + 1} as ${isChecked ? "incomplete" : "complete"}`}
                      className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <div className={`text-xs font-bold ${isChecked ? "text-gray-400" : "text-gray-900 dark:text-white"}`}>
                        {item.task}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 shrink-0">
                    ⏱️ {item.duration}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3: Recommended Connect + Daily Challenge */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Peer Match Spotlight */}
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                ⭐ Peer to Connect Today
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                {brief.recommendedPerson.matchScore}% Match
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Image
                src={
                  brief.recommendedPerson.user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(brief.recommendedPerson.user.name)}`
                }
                alt={brief.recommendedPerson.user.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {brief.recommendedPerson.user.name}
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                  Teaches: {brief.recommendedPerson.user.skillsTeach[0]?.name || "Expert"}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
              {brief.recommendedPerson.reason}
            </p>

            <button
              onClick={() => onConnectPerson(brief.recommendedPerson.user.id)}
              className="w-full py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
            >
              Connect & Start Chat 💬
            </button>
          </div>

          {/* Daily Micro Challenge */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <span>🎯 Daily Challenge</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">+50 XP</span>
            </div>

            <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
              {brief.dailyChallenge}
            </p>

            <button
              onClick={() => setChallengeCompleted(!challengeCompleted)}
              className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                challengeCompleted
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              }`}
            >
              {challengeCompleted ? "✓ Challenge Completed!" : "Mark Challenge Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
