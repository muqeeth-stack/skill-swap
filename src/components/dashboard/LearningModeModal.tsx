"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User } from "@/types";
import Modal from "@/components/ui/Modal";
import { getLearningModeData, LearningModeData } from "@/lib/dashboard-intelligence";

interface LearningModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  currentUser: User;
  allUsers: User[];
  onConnectMentor: (userId: string) => void;
}

export function LearningModeModal({
  isOpen,
  onClose,
  skillName,
  currentUser,
  allUsers,
  onConnectMentor,
}: LearningModeModalProps) {
  const data: LearningModeData = getLearningModeData(skillName || "Python", currentUser, allUsers);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="p-1 sm:p-2 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                🚀 Synapse Learning Mode
              </span>
              <span className="text-xs text-gray-400">Deep Practice Hub</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              Mastering {data.skill}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Goal: {data.goal}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-bold text-gray-400">Progression</div>
            <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {data.currentLevel} ➔ {data.targetLevel}
            </div>
          </div>
        </div>

        {/* AI Coach Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              AI Coach Guidance & Technique
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
              {data.aiCoachTip}
            </p>
          </div>
        </div>

        {/* Milestones Roadmap */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Learning Roadmap & Milestones ({completedSteps.length}/{data.milestones.length} Reached)
          </h3>

          <div className="space-y-2.5">
            {data.milestones.map((milestone) => {
              const isDone = completedSteps.includes(milestone.step);
              return (
                <div
                  key={milestone.step}
                  onClick={() => toggleStep(milestone.step)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isDone
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 text-gray-400"
                      : "bg-white dark:bg-gray-800 border-gray-200 hover:border-indigo-400 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleStep(milestone.step)}
                        aria-label={`Step ${milestone.step}: ${milestone.title}`}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Step {milestone.step}: {milestone.title}
                      </span>
                    </div>
                    {isDone && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Completed ✓
                      </span>
                    )}
                  </div>
                  <ul className="pl-7 mt-2 space-y-1 text-[11px] text-gray-600 dark:text-gray-400 list-disc">
                    {milestone.tasks.map((task, tidx) => (
                      <li key={tidx}>{task}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Tasks + Mentor Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 space-y-2">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Daily Practice Drills
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
              {data.practiceTasks.map((t, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              Recommended Mentors & Partners
            </h4>
            <div className="space-y-2">
              {data.recommendedMentors.map((mentor) => (
                <div key={mentor.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Image
                      src={
                        mentor.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mentor.name)}`
                      }
                      alt={mentor.name}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">{mentor.name}</div>
                      <div className="text-[10px] text-gray-600">★ {mentor.rating.toFixed(1)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onConnectMentor(mentor.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-300"
          >
            Close Learning Mode
          </button>
        </div>
      </div>
    </Modal>
  );
}
