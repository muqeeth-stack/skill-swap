"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MatchScore } from "@/types";
import { useRouter } from "next/navigation";

interface NaturalLanguageDiscoveryProps {
  onSearch: (query: string) => MatchScore[];
  onOpenChat: (userId: string) => void;
}

export function NaturalLanguageDiscovery({
  onSearch,
  onOpenChat,
}: NaturalLanguageDiscoveryProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MatchScore[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const samplePrompts = [
    "I want to learn cricket batting from an experienced coach",
    "Teach me Python and machine learning on weekends",
    "I can teach React and want to learn video editing",
    "Conversational Spanish practice with native speaker",
  ];

  const handleExecuteSearch = (qToUse?: string) => {
    const text = qToUse || query;
    if (!text.trim()) return;

    setHasSearched(true);
    const matches = onSearch(text.trim());
    setResults(matches);
  };

  return (
    <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl text-white p-6 sm:p-8 shadow-lg space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>✨ Semantic AI Match Query</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Natural-Language Skill Discovery
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mt-1">
            Describe your goals, schedule preferences, or barter proposal in plain English. Synapse AI extracts reciprocity and ranks compatibility in real time.
          </p>
        </div>
      </div>

      {/* Input Box */}
      <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-white/50 transition-all">
        <span className="pl-3 pr-2 text-xl">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleExecuteSearch()}
          placeholder="e.g. 'I want to learn cricket fast bowling and I can teach Next.js'..."
          className="w-full bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder-indigo-200/70 focus:outline-none"
        />
        <button
          onClick={() => handleExecuteSearch()}
          className="px-5 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
        >
          Find Synergy ➔
        </button>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-indigo-200 text-[11px] font-semibold">Try queries:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(prompt);
              handleExecuteSearch(prompt);
            }}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-[11px] text-white transition-all cursor-pointer"
          >
            &ldquo;{prompt}&rdquo;
          </button>
        ))}
      </div>

      {/* Results Dropdown Container */}
      {hasSearched && results && (
        <div className="mt-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white space-y-4 animate-in fade-in-50 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <span>🎯 Matched Candidates ({results.length})</span>
              <span className="text-xs font-normal text-gray-400">ranked by AI compatibility score</span>
            </h4>
            <button
              onClick={() => {
                router.push(`/matches?q=${encodeURIComponent(query)}`);
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open in Match Center ➔
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.slice(0, 3).map((match) => (
              <div
                key={match.targetUser.id}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          match.targetUser.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(match.targetUser.name)}`
                        }
                        alt={match.targetUser.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs">{match.targetUser.name}</div>
                        <div className="text-[10px] text-gray-400">{match.targetUser.location}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">
                      {match.overallScore}%
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-2 space-y-1">
                    <div>⚡ Teaches: <strong>{match.targetUser.skillsTeach[0]?.name}</strong></div>
                    <div>🎯 Wants: <strong>{match.targetUser.skillsLearn[0]?.name}</strong></div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenChat(match.targetUser.id)}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Message {match.targetUser.name.split(" ")[0]} 💬
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
