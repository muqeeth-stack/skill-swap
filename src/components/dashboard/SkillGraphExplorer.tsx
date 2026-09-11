"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User } from "@/types";
import { SKILL_GRAPH_NODES } from "@/lib/dashboard-intelligence";

interface SkillGraphExplorerProps {
  currentUser: User;
  allUsers: User[];
  onSelectSkill: (skillName: string) => void;
  onConnectMentor: (userId: string) => void;
}

export function SkillGraphExplorer({
  currentUser,
  allUsers,
  onSelectSkill,
  onConnectMentor,
}: SkillGraphExplorerProps) {
  const [activeNodeId, setActiveNodeId] = useState<string>("python");

  const activeNode = SKILL_GRAPH_NODES.find((n) => n.id === activeNodeId) || SKILL_GRAPH_NODES[0];

  // Connected nodes
  const connectedNodes = SKILL_GRAPH_NODES.filter((n) =>
    activeNode.connections.includes(n.id)
  );

  // Mentors for active node
  const mentors = allUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      u.skillsTeach.some((s) => s.name.toLowerCase().includes(activeNode.name.toLowerCase()) || activeNode.name.toLowerCase().includes(s.name.toLowerCase()))
  ).slice(0, 3);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "sports":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800";
      case "creative":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800";
      case "languages":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800";
      default:
        return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <span>Intelligent Knowledge Topology</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🕸️ Interactive Skill Graph</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Explore Adjacent Disciplines
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Click any node in the network to visualize prerequisite links, adjacent capabilities, and available community mentors.
          </p>
        </div>

        {/* Category Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All Nodes", "Technology", "Sports Mode", "Creative"].map((tab, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Visual Graph Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200/70 dark:border-gray-700/80 space-y-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase">
              Selected Anchor Node:
            </div>

            {/* Active Highlighted Node */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-indigo-500 shadow-md flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getCategoryColor(activeNode.category)}`}>
                    {activeNode.category}
                  </span>
                  <span className="text-xs text-gray-400">{activeNode.level}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                  {activeNode.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {activeNode.description}
                </p>
              </div>

              <button
                onClick={() => onSelectSkill(activeNode.name)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-all"
              >
                Learn Node ➔
              </button>
            </div>

            {/* Downward / Connected arrows */}
            <div className="flex items-center justify-center gap-2 text-indigo-500 font-bold text-xs">
              <span>↓</span>
              <span>Directly Connected Pathways & Subskills ({connectedNodes.length})</span>
              <span>↓</span>
            </div>

            {/* Connected Adjacent Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {connectedNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setActiveNodeId(node.id)}
                  className="p-3 bg-white dark:bg-gray-800 hover:border-indigo-400 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition-all hover:shadow-md cursor-pointer group"
                >
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${getCategoryColor(node.category)}`}>
                    {node.category}
                  </span>
                  <div className="font-bold text-xs text-gray-900 dark:text-white mt-1.5 group-hover:text-indigo-600 truncate">
                    {node.name}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-0.5">{node.level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Node Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-bold text-gray-400">Explore Quick Branches:</span>
            {SKILL_GRAPH_NODES.slice(0, 7).map((node) => (
              <button
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  node.id === activeNodeId
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                }`}
              >
                {node.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Mentors who teach this Node */}
        <div className="p-5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                Mentors for &ldquo;{activeNode.name}&rdquo;
              </h4>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                {mentors.length} Verified
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {mentors.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  <p>No active mentors found for this node.</p>
                  <p className="mt-1">Be the first to teach this skill on Synapse!</p>
                </div>
              ) : (
                mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={
                          mentor.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mentor.name)}`
                        }
                        alt={mentor.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {mentor.name}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {mentor.skillsTeach[0]?.subSkill || mentor.location}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-500">★ {mentor.rating.toFixed(1)}</span>
                    </div>

                    <button
                      onClick={() => onConnectMentor(mentor.id)}
                      className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Connect with {mentor.name.split(" ")[0]} ➔
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400">
            💡 <strong>Topological Insight:</strong> Learning adjacent nodes simultaneously increases knowledge retention by up to 60%.
          </div>
        </div>
      </div>
    </div>
  );
}
