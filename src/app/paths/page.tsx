"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function PathsPage() {
  const { learningPaths, togglePathStage } = useApp();
  const [selectedPathId, setSelectedPathId] = useState(learningPaths[0]?.id || "");

  const activePath = learningPaths.find((p) => p.id === selectedPathId) || learningPaths[0];

  return (
    <div className="space-y-8 py-2">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          <span>AI-Curated Roadmaps & Milestone Trackers</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Curated Learning Paths & Skill Milestones
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Follow structured stages, complete milestone drills, and connect directly with mentors who guide each stage.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {learningPaths.map((p) => {
          const isSelected = p.id === activePath?.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPathId(p.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700"
              }`}
            >
              {p.title}
            </button>
          );
        })}
      </div>

      {activePath && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
              <span>{activePath.category}</span>
              <span>•</span>
              <span>~{activePath.estimatedWeeks} Weeks Total</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{activePath.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">{activePath.description}</p>
          </div>

          <div className="space-y-4">
            {activePath.stages.map((stage) => (
              <div
                key={stage.stage}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm flex items-center justify-center">
                      {stage.stage}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{stage.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stage.description}</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!stage.completed}
                      onChange={() => togglePathStage(activePath.id, stage.stage)}
                      className="accent-indigo-600 w-4 h-4 rounded-md"
                    />
                    <span>{stage.completed ? "✓ Completed" : "Mark Stage Done"}</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-500 uppercase">Practice Tasks:</div>
                  <div className="flex flex-wrap gap-2">
                    {stage.practiceTasks.map((task, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-750 text-xs text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700">
                        📌 {task}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
