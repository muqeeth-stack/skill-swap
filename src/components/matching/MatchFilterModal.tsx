"use client";

import React, { useState } from "react";
import { MatchWeights } from "@/types";
import { useApp } from "@/context/AppContext";

interface MatchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchFilterModal({ isOpen, onClose }: MatchFilterModalProps) {
  const { matchWeights, setMatchWeights } = useApp();
  const [weights, setLocalWeights] = useState<MatchWeights>(matchWeights);

  if (!isOpen) return null;

  const handleSliderChange = (key: keyof MatchWeights, value: number) => {
    setLocalWeights((prev) => ({
      ...prev,
      [key]: value / 100,
    }));
  };

  const applyPreset = (preset: "balanced" | "barter" | "mentor" | "schedule" | "peer") => {
    if (preset === "balanced") {
      setLocalWeights({
        skillExchange: 0.35,
        skillLevel: 0.15,
        learningGoals: 0.15,
        availability: 0.15,
        preferences: 0.10,
        languages: 0.05,
        interests: 0.05,
      });
    } else if (preset === "barter") {
      setLocalWeights({
        skillExchange: 0.60,
        skillLevel: 0.10,
        learningGoals: 0.10,
        availability: 0.10,
        preferences: 0.05,
        languages: 0.025,
        interests: 0.025,
      });
    } else if (preset === "mentor") {
      setLocalWeights({
        skillExchange: 0.25,
        skillLevel: 0.40,
        learningGoals: 0.20,
        availability: 0.10,
        preferences: 0.05,
        languages: 0,
        interests: 0,
      });
    } else if (preset === "schedule") {
      setLocalWeights({
        skillExchange: 0.25,
        skillLevel: 0.10,
        learningGoals: 0.10,
        availability: 0.45,
        preferences: 0.05,
        languages: 0.025,
        interests: 0.025,
      });
    } else if (preset === "peer") {
      setLocalWeights({
        skillExchange: 0.30,
        skillLevel: 0.25,
        learningGoals: 0.20,
        availability: 0.10,
        preferences: 0.10,
        languages: 0.025,
        interests: 0.025,
      });
    }
  };

  const handleSave = () => {
    setMatchWeights(weights);
    onClose();
  };

  const handleReset = () => {
    applyPreset("balanced");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">AI Matching Algorithm Weights</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configure how SynapseLearn ranks your synergy with other learners</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Presets */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Algorithm Presets</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "balanced", label: "Balanced (Recommended)" },
              { id: "barter", label: "Pure Skill Barter" },
              { id: "mentor", label: "Mentor Seeking" },
              { id: "schedule", label: "Schedule First" },
              { id: "peer", label: "Peer Practice" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id as "balanced" | "barter" | "mentor" | "schedule" | "peer")}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 py-2">
          {/* Skill Exchange */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700 dark:text-gray-300">Skill Exchange Synergy</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(weights.skillExchange * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.skillExchange * 100)}
              onChange={(e) => handleSliderChange("skillExchange", Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Level Compatibility */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700 dark:text-gray-300">Skill Level Compatibility</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(weights.skillLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.skillLevel * 100)}
              onChange={(e) => handleSliderChange("skillLevel", Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Learning Goals */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700 dark:text-gray-300">Shared Learning Goals</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(weights.learningGoals * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.learningGoals * 100)}
              onChange={(e) => handleSliderChange("learningGoals", Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Availability */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700 dark:text-gray-300">Availability Overlap</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(weights.availability * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.availability * 100)}
              onChange={(e) => handleSliderChange("availability", Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Preferences */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-700 dark:text-gray-300">Format & Preferences</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(weights.preferences * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.preferences * 100)}
              onChange={(e) => handleSliderChange("preferences", Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-700 mt-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
          >
            Reset Defaults
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm cursor-pointer"
            >
              Apply Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
