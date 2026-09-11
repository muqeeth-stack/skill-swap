"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { generateAiProject, GeneratedProject } from "@/lib/dashboard-intelligence";

interface AiProjectGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSkill?: string;
  initialLevel?: string;
  onSaveProject?: (project: GeneratedProject) => void;
}

export function AiProjectGeneratorModal({
  isOpen,
  onClose,
  initialSkill = "Python",
  initialLevel = "Intermediate",
  onSaveProject,
}: AiProjectGeneratorModalProps) {
  const [skill, setSkill] = useState(initialSkill);
  const [level, setLevel] = useState(initialLevel);
  const [project, setProject] = useState<GeneratedProject>(() =>
    generateAiProject(initialSkill, initialLevel)
  );
  const [copied, setCopied] = useState(false);

  const handleRegenerate = () => {
    const p = generateAiProject(skill, level);
    setProject(p);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Project: ${project.title}\nLevel: ${project.level}\nOverview: ${project.overview}\nDeliverables:\n- ${project.deliverables.join("\n- ")}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="p-1 sm:p-2 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                ✨ Synapse AI Studio
              </span>
              <span className="text-xs text-gray-400">Project Architect</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
              AI Practice Project Generator
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Instantly architect a portfolio-ready project tailored to your skill and current mastery level.
            </p>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Skill</label>
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. Python, Video Editing, Cricket..."
                className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Proficiency</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced / Expert</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 self-end sm:self-auto"
          >
            ⚡ Generate Project
          </button>
        </div>

        {/* Generated Project Showcase Card */}
        <div className="p-6 bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-white dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-gray-850 rounded-2xl border border-purple-200/80 dark:border-purple-900/60 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                  {project.skill} • {project.level}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  ⏱️ ~{project.estimatedHours} Hours
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1.5">
                {project.title}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {project.overview}
          </p>

          {/* Key Deliverables */}
          <div className="space-y-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
              Expected Deliverables:
            </h4>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
              {project.deliverables.map((deliv, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{deliv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step-by-Step Implementation */}
          <div className="space-y-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
              Execution Sequence:
            </h4>
            <div className="space-y-1.5">
              {project.stepByStep.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-purple-200 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? "Copied to Clipboard! ✓" : "Copy Project Brief 📋"}
          </button>

          <button
            onClick={() => {
              if (onSaveProject) onSaveProject(project);
              onClose();
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Adopt This Project 🚀
          </button>
        </div>
      </div>
    </Modal>
  );
}
