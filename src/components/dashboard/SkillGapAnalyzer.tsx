"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User } from "@/types";
import {
  TARGET_ROLE_BLUEPRINTS,
  analyzeSkillGap,
  SkillGapResult,
} from "@/lib/dashboard-intelligence";

interface SkillGapAnalyzerProps {
  currentUser: User;
  allUsers: User[];
  onConnectMentor: (userId: string) => void;
  onStartLearning: (skillName: string) => void;
}

export function SkillGapAnalyzer({
  currentUser,
  allUsers,
  onConnectMentor,
  onStartLearning,
}: SkillGapAnalyzerProps) {
  const roles = Object.keys(TARGET_ROLE_BLUEPRINTS);
  const [selectedRole, setSelectedRole] = useState<string>(roles[0]);

  const analysis: SkillGapResult = analyzeSkillGap(selectedRole, currentUser, allUsers);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header & Role Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
            <span>Career & Discipline Pathway</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🎯 AI Skill Gap Analysis</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
              {analysis.completionPercentage}% Role Readiness
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {analysis.description}
          </p>
        </div>

        {/* Role Picker Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
            Target Goal:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">
            Curriculum Alignment
          </span>
          <span className="font-extrabold text-violet-600 dark:text-violet-400">
            {analysis.alreadyKnow.length} of {analysis.alreadyKnow.length + analysis.shouldLearnNext.length} capabilities acquired
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${analysis.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Comparison Grid: You Already Know vs Should Learn Next */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Acquired Skills */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <span>✓ You Already Know ({analysis.alreadyKnow.length})</span>
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold">Validated</span>
          </div>

          {analysis.alreadyKnow.length === 0 ? (
            <p className="text-xs text-gray-400 py-3">No overlapping competencies recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {analysis.alreadyKnow.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {item.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills to Learn Next */}
        <div className="p-5 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
              <span>→ You Should Learn Next ({analysis.shouldLearnNext.length})</span>
            </h3>
            <span className="text-[10px] text-violet-600 font-bold">Recommended</span>
          </div>

          {analysis.shouldLearnNext.length === 0 ? (
            <p className="text-xs text-emerald-600 font-bold py-3">
              🎉 Outstanding! You have mastered all core capabilities for this role.
            </p>
          ) : (
            <div className="space-y-3">
              {analysis.shouldLearnNext.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-violet-100 dark:border-violet-900/60 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-violet-500 font-bold">→</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        item.importance === "Critical"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                      }`}
                    >
                      {item.importance}
                    </span>
                  </div>

                  {/* Mentor Recommendations for this skill */}
                  {item.recommendedMentors.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] text-gray-400">Available Mentors:</span>
                        <div className="flex -space-x-1.5">
                          {item.recommendedMentors.slice(0, 3).map((m) => (
                            <Image
                              key={m.id}
                              src={
                                m.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`
                              }
                              alt={m.name}
                              width={20}
                              height={20}
                              title={m.name}
                              className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500 truncate">
                          {item.recommendedMentors[0]?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onConnectMentor(item.recommendedMentors[0].id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Connect ➔
                        </button>
                        <button
                          onClick={() => onStartLearning(item.name)}
                          className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Study Plan ➔
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
