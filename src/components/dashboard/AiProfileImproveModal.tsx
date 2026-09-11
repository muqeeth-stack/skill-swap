"use client";

import React, { useState } from "react";
import { User, UserSkill } from "@/types";

interface AiProfileImproveModalProps {
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onApplyImprovements: (data: Partial<User>) => void;
}

export const AiProfileImproveModal: React.FC<AiProfileImproveModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onApplyImprovements,
}) => {
  const [applyBio, setApplyBio] = useState(true);
  const [applyGoals, setApplyGoals] = useState(true);
  const [applySkills, setApplySkills] = useState(true);

  if (!isOpen) return null;

  // Generate intelligent suggestions based on currentUser
  const currentBio = currentUser.bio || "Passionate about learning and sharing skills.";
  const proposedBio = currentBio.length < 80
    ? `${currentBio} Actively exchanging practical knowledge across technology and sports fitness. Looking to collaborate on real-world projects and accelerate skill mastery.`
    : `🚀 ${currentBio.replace(/^🚀\s*/, "")} | Open to peer mentoring and 1-on-1 collaborative practice.`;

  const proposedGoals = [
    "Master advanced practical problem solving with peer feedback",
    "Complete 2 real-world exchange projects this month",
    "Reach verified consistency with 14-day learning streak",
  ];

  const suggestedSkillsToAdd: UserSkill[] = [
    {
      name: "Cricket Bowling Mechanics",
      category: "sports",
      level: "Intermediate",
      yearsOfExp: 2,
    },
    {
      name: "AI Prompt Engineering & Agents",
      category: "technology",
      level: "Beginner",
      yearsOfExp: 1,
    },
  ];

  const handleConfirm = () => {
    const updates: Partial<User> = {};

    if (applyBio) {
      updates.bio = proposedBio;
    }

    if (applyGoals) {
      const mergedGoals = Array.from(new Set([...(currentUser.learningGoals || []), ...proposedGoals]));
      updates.learningGoals = mergedGoals;
    }

    if (applySkills) {
      // Add suggested skills to skillsLearn if not already present
      const existingNames = new Set((currentUser.skillsLearn || []).map((s) => s.name.toLowerCase()));
      const newSkills = suggestedSkillsToAdd.filter((s) => !existingNames.has(s.name.toLowerCase()));
      updates.skillsLearn = [...(currentUser.skillsLearn || []), ...newSkills];
    }

    onApplyImprovements(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md">
              ✨
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                AI Profile Optimization
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enhance your profile visibility, credibility, and match synergy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Profile Strength Score */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              Profile Synergy Score
            </div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              85 / 100 <span className="text-xs font-semibold text-emerald-600">▲ +15 potential</span>
            </div>
          </div>
          <span className="text-xs px-3 py-1 bg-white dark:bg-gray-700 rounded-full font-bold shadow-2xs text-gray-700 dark:text-gray-200">
            High Quality
          </span>
        </div>

        {/* Optimization Proposals with Checkboxes */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Select Improvements to Apply
          </h4>

          {/* Proposal 1: Bio */}
          <div
            onClick={() => setApplyBio(!applyBio)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              applyBio
                ? "bg-purple-50/50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700"
                : "bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={applyBio}
                  onChange={(e) => setApplyBio(e.target.checked)}
                  aria-label="Apply enhanced outcome-driven bio"
                  className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                1. Enhanced Outcome-Driven Bio
              </span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                Recommended
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="text-gray-400 line-through">Current: &quot;{currentBio}&quot;</div>
              <div className="font-medium text-purple-900 dark:text-purple-200 bg-white/70 dark:bg-gray-800/70 p-2 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                Proposed: &quot;{proposedBio}&quot;
              </div>
            </div>
          </div>

          {/* Proposal 2: Structured Learning Goals */}
          <div
            onClick={() => setApplyGoals(!applyGoals)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              applyGoals
                ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700"
                : "bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={applyGoals}
                  onChange={(e) => setApplyGoals(e.target.checked)}
                  aria-label="Apply concrete learning milestones"
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                2. Concrete Learning Milestones
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                +3 Milestones
              </span>
            </div>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
              {proposedGoals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>

          {/* Proposal 3: Add High-Demand Cross-Disciplinary Skills */}
          <div
            onClick={() => setApplySkills(!applySkills)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              applySkills
                ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                : "bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={applySkills}
                  onChange={(e) => setApplySkills(e.target.checked)}
                  aria-label="Apply high-demand sports and AI skills"
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                3. Expand Wishlist with High-Demand Skills (Sports & AI)
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                +2 Skills
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {suggestedSkillsToAdd.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold"
                >
                  + {s.name} ({s.category})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
          >
            Keep Current
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all cursor-pointer"
          >
            Apply Selected AI Improvements
          </button>
        </div>
      </div>
    </div>
  );
};
