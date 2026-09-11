"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, UserSkill, SkillLevel, SKILL_CATEGORIES_METADATA } from "@/types";

interface MySkillsSectionProps {
  currentUser: User;
  onUpdateSkills: (updatedTeach: UserSkill[], updatedLearn: UserSkill[]) => void;
  onStartLearning: (skillName: string) => void;
  onGenerateProject: (skillName: string) => void;
  onFindMentors: (skillName: string) => void;
}

const LEVEL_PROGRESS: Record<SkillLevel, number> = {
  Beginner: 25,
  Intermediate: 55,
  Advanced: 80,
  Expert: 100,
};

const LEVEL_COLORS: Record<SkillLevel, { bg: string; text: string; bar: string }> = {
  Beginner: {
    bg: "bg-blue-50 dark:bg-blue-950/60",
    text: "text-blue-700 dark:text-blue-300",
    bar: "from-blue-500 to-cyan-500",
  },
  Intermediate: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300",
    bar: "from-emerald-500 to-teal-500",
  },
  Advanced: {
    bg: "bg-purple-50 dark:bg-purple-950/60",
    text: "text-purple-700 dark:text-purple-300",
    bar: "from-purple-500 to-indigo-500",
  },
  Expert: {
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-300",
    bar: "from-amber-500 to-orange-500",
  },
};

export const MySkillsSection: React.FC<MySkillsSectionProps> = ({
  currentUser,
  onUpdateSkills,
  onStartLearning,
  onGenerateProject,
  onFindMentors,
}) => {
  const [activeTab, setActiveTab] = useState<"learn" | "teach">("learn");
  const [isAdding, setIsAdding] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("technology");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>("Beginner");
  const [newSkillYears, setNewSkillYears] = useState(1);

  const skillsLearn = currentUser.skillsLearn || [];
  const skillsTeach = currentUser.skillsTeach || [];

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: UserSkill = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
      yearsOfExp: newSkillYears,
    };

    if (activeTab === "learn") {
      onUpdateSkills(skillsTeach, [...skillsLearn, newSkill]);
    } else {
      onUpdateSkills([...skillsTeach, newSkill], skillsLearn);
    }

    setNewSkillName("");
    setIsAdding(false);
  };

  const handleRemoveSkill = (skillToRemove: string, type: "learn" | "teach") => {
    if (type === "learn") {
      onUpdateSkills(
        skillsTeach,
        skillsLearn.filter((s) => s.name.toLowerCase() !== skillToRemove.toLowerCase())
      );
    } else {
      onUpdateSkills(
        skillsTeach.filter((s) => s.name.toLowerCase() !== skillToRemove.toLowerCase()),
        skillsLearn
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = SKILL_CATEGORIES_METADATA.find((c) => c.id === category);
    if (!cat) return "✨";
    switch (cat.id) {
      case "technology":
        return "💻";
      case "creative":
        return "🎨";
      case "business":
        return "💼";
      case "languages":
        return "🌐";
      case "academics":
        return "📚";
      case "sports":
        return "🏏";
      case "life_skills":
        return "🌱";
      case "hobbies":
        return "🎯";
      default:
        return "✨";
    }
  };

  const currentList = activeTab === "learn" ? skillsLearn : skillsTeach;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🎯 My Skills & Mastery</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
              {skillsLearn.length + skillsTeach.length} Total
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your teaching portfolio and structured learning roadmap
          </p>
        </div>

        {/* Tab Selector & Add Button */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-100 dark:bg-gray-750 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab("learn")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "learn"
                  ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🌱 Learning ({skillsLearn.length})
            </button>
            <button
              onClick={() => setActiveTab("teach")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "teach"
                  ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🎓 Teaching ({skillsTeach.length})
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <span>{isAdding ? "✕ Close" : "+ Add Skill"}</span>
          </button>
        </div>
      </div>

      {/* Inline Add Skill Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSkill}
          className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              Add New {activeTab === "learn" ? "Learning Goal" : "Skill to Teach"}
            </h4>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Supports Sports, Tech, Creative, Languages & more
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Skill Name
              </label>
              <input
                type="text"
                placeholder="e.g. Cricket Bowling, React 19, UI Design..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              >
                {SKILL_CATEGORIES_METADATA.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Proficiency
              </label>
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Years Exp.
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              Save Skill
            </button>
          </div>
        </form>
      )}

      {/* Skills Grid */}
      {currentList.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-4xl mb-2">{activeTab === "learn" ? "🌱" : "🎓"}</div>
          <h4 className="font-bold text-gray-900 dark:text-white text-sm">
            No {activeTab === "learn" ? "learning goals" : "teaching skills"} added yet
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {activeTab === "learn"
              ? "Add the skills you want to learn or master to unlock tailored mentor matches and AI practice projects."
              : "Share what you're great at! Add your skills to start earning credits and helping community peers."}
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
          >
            + Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((skill, idx) => {
            const levelStyle = LEVEL_COLORS[skill.level] || LEVEL_COLORS.Beginner;
            const progress = LEVEL_PROGRESS[skill.level] || 25;
            const icon = getCategoryIcon(skill.category);

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-lg shadow-2xs">
                      {icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {skill.name}
                      </h4>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                        {skill.category.replace("_", " ")}
                        {skill.yearsOfExp ? ` • ${skill.yearsOfExp} yrs exp` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${levelStyle.bg} ${levelStyle.text}`}
                    >
                      {skill.level}
                    </span>
                    <button
                      onClick={() => handleRemoveSkill(skill.name, activeTab)}
                      title="Remove skill"
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs p-1 rounded-md transition-all cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    <span>Proficiency Mastery</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${levelStyle.bar} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                  {activeTab === "learn" ? (
                    <>
                      <button
                        onClick={() => onStartLearning(skill.name)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600/10 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white text-[11px] font-bold transition-all text-center cursor-pointer"
                      >
                        🚀 Start Learning
                      </button>
                      <button
                        onClick={() => onGenerateProject(skill.name)}
                        className="py-1.5 px-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white text-[11px] font-bold transition-all text-center cursor-pointer"
                        title="Generate AI practice project"
                      >
                        🛠️ AI Project
                      </button>
                      <button
                        onClick={() => onFindMentors(skill.name)}
                        className="py-1.5 px-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-[11px] font-semibold transition-all text-center cursor-pointer"
                        title="Find mentors for this skill"
                      >
                        👥 Mentors
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/matches"
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-[11px] font-bold transition-all text-center"
                      >
                        👥 Find Learners
                      </Link>
                      <Link
                        href="/exchange"
                        className="py-1.5 px-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-[11px] font-semibold transition-all text-center"
                      >
                        ⇄ Barter Offer
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
