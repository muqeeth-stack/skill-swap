"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { SKILL_CATEGORIES_METADATA } from "@/types";

function SkillsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const { skillCatalog, addCustomSkill } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customSkillName, setCustomSkillName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const handleSaveCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkillName.trim()) return;
    addCustomSkill(customSkillName.trim(), customDescription.trim());
    setIsModalOpen(false);
    setCustomSkillName("");
    setCustomDescription("");
  };

  const filteredCategories = SKILL_CATEGORIES_METADATA.filter((c) => {
    if (selectedCategory !== "all" && c.id !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <span>Standardized Skill & Sports Taxonomy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Explore Skills, Disciplines & Sports Mode
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hierarchical breakdown across 8 core domains with subskills, levels, and prerequisite trees.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <span>✨ Add Custom Skill (AI Normalized)</span>
        </button>
      </div>

      {/* Sports Mode Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
            <span>🏏 CRICKET & ATHLETICS MODE ACTIVE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Trade Sports Coaching & Athletic Biomechanics
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Exchange Cricket batting & fast bowling techniques, Football positioning, Badminton smashes, Chess tactical openings, and Strength & Conditioning directly with competitive athletes.
          </p>
        </div>
        <button
          onClick={() => setSelectedCategory("sports")}
          className="px-5 py-2.5 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 shrink-0 cursor-pointer"
        >
          Filter Sports Mode ➔
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
              selectedCategory === "all" ? "bg-indigo-600 text-white font-bold" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            All Domains
          </button>
          {SKILL_CATEGORIES_METADATA.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                selectedCategory === c.id ? "bg-indigo-600 text-white font-bold" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subskills, drills..."
            aria-label="Search subskills and drills"
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
          />
        </div>
      </div>

      {/* Skills Catalog Trees */}
      <div className="space-y-10">
        {filteredCategories.map((category) => {
          const skillsInCat = skillCatalog.filter(
            (s) =>
              s.category === category.id &&
              (!searchQuery.trim() ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.subSkills.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase())))
          );

          if (skillsInCat.length === 0) return null;

          return (
            <div key={category.id} className="space-y-4">
              <div className="pb-2 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{category.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {skillsInCat.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                        {skill.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {skill.description}
                      </p>

                      <div className="space-y-1 mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                          Subdisciplines & Drills:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {skill.subSkills.map((sub, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end">
                      <Link
                        href={`/matches?q=${encodeURIComponent(skill.name)}`}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold"
                      >
                        Find Tutors ➔
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-3">Add Custom Skill</h3>
            <form onSubmit={handleSaveCustomSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  placeholder="e.g. Cricket Spin Bowling Tactics"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={2}
                  placeholder="What makes this skill unique?"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default function SkillsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading skill catalog...</div>}>
      <SkillsContent />
    </React.Suspense>
  );
}
