"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AiSkillSuggestion } from "@/lib/ai-assistant";
import Modal from "@/components/ui/Modal";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PlanShape = { title: string; weeks: { week: number; focus: string; tasks: string[] }[] };

interface DiscoverResponse {
  data: AiSkillSuggestion;
  engine: "gemini" | "local";
}

interface PlanResponse {
  data: PlanShape;
  engine: "gemini" | "local";
}

export default function AiAssistantModal({ isOpen, onClose }: AiAssistantModalProps) {
  const { currentUser, sendConnectionRequest, showToast } = useApp();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AiSkillSuggestion | null>(null);
  const [engine, setEngine] = useState<"gemini" | "local">("local");
  const [studyPlan, setStudyPlan] = useState<PlanShape | null>(null);

  const samplePrompts = [
    "I want to learn how to make websites",
    "I want to become good at making YouTube videos",
    "I want to get better at cricket batting",
    "I want to learn AI and deep learning from scratch",
    "I want to practice conversational Spanish",
  ];

  const handleSearch = async (textToSearch?: string) => {
    const q = textToSearch || query;
    if (!q.trim()) return;

    setLoading(true);
    setStudyPlan(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discover", query: q }),
      });
      const json = (await res.json()) as DiscoverResponse;
      setSuggestion(json.data);
      setEngine(json.engine);
    } catch {
      showToast("AI assistant is temporarily unavailable. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (skillName: string) => {
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "study-plan", query: skillName, hoursPerWeek: currentUser?.weeklyHours || 6 }),
      });
      const json = (await res.json()) as PlanResponse;
      setStudyPlan(json.data);
      setEngine(json.engine);
      showToast(`Generated study plan for ${skillName}!`, "success");
    } catch {
      showToast("Could not generate a study plan right now.", "error");
    }
  };

  const handleConnectMentor = (mentorId: string, mentorName: string) => {
    sendConnectionRequest(mentorId, `Hi ${mentorName}! SynapseLearn AI recommended we connect based on your skills.`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="p-1 sm:p-2">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Synapse AI Learning Assistant
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-full">
                {engine === "gemini" ? "Gemini AI Live" : "Smart Local Engine"}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Discover skills, generate roadmaps, and find matching mentors automatically.
            </p>
          </div>
        </div>

        {/* Input box */}
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            aria-label="Ask AI a learning question"
            placeholder="e.g. 'I want to build mobile apps' or 'How do I improve at chess?'"
            className="w-full pl-4 pr-24 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Ask AI"}
          </button>
        </div>

        {/* Quick sample chips */}
        {!suggestion && !loading && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setQuery(p);
                    handleSearch(p);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/30 text-gray-700 dark:text-gray-300 hover:text-violet-700 dark:hover:text-violet-300 text-xs transition-colors border border-transparent hover:border-violet-200"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Results */}
        {suggestion && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Semantic analysis card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50/50 dark:from-violet-950/30 dark:to-indigo-950/20 border border-violet-100 dark:border-violet-900/40">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-900 dark:text-violet-300">
                  AI Semantic Breakdown
                </h4>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                {suggestion.explanation}
              </p>

              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">Recommended Skill Path:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestion.primarySkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-600 text-white shadow-sm flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {s}
                    </span>
                  ))}
                  {suggestion.relatedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Mentors on SynapseLearn */}
            {suggestion.suggestedMentors.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Matching Mentors & Teachers on SynapseLearn
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {suggestion.suggestedMentors.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{m.name}</p>
                        <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">{m.skill}</p>
                      </div>
                      <button
                        onClick={() => handleConnectMentor(m.id, m.name)}
                        className="mt-2.5 w-full py-1 text-[11px] font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Plan Action Button */}
            {!studyPlan && (
              <button
                onClick={() => handleGeneratePlan(suggestion.primarySkills[0])}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Generate 4-Week Step-by-Step Study Plan for {suggestion.primarySkills[0]}
              </button>
            )}

            {/* Generated Study Plan */}
            {studyPlan && (
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">{studyPlan.title}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    4 Weeks
                  </span>
                </div>
                <div className="space-y-2">
                  {studyPlan.weeks.map((w) => (
                    <div key={w.week} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-1">
                        Week {w.week}: {w.focus}
                      </p>
                      <ul className="space-y-1">
                        {w.tasks.map((t, idx) => (
                          <li key={idx} className="text-[11px] text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export { AiAssistantModal };
