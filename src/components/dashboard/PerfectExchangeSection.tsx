"use client";

import React from "react";
import Image from "next/image";
import { User } from "@/types";
import { findPerfectExchanges, PerfectExchangeMatch } from "@/lib/dashboard-intelligence";
import Link from "next/link";

interface PerfectExchangeSectionProps {
  currentUser: User;
  allUsers: User[];
  onStartExchange: (peerId: string) => void;
}

export function PerfectExchangeSection({
  currentUser,
  allUsers,
  onStartExchange,
}: PerfectExchangeSectionProps) {
  const exchanges: PerfectExchangeMatch[] = findPerfectExchanges(currentUser, allUsers);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <span>Reciprocal 2-Way Barter</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>⇄ Perfect Skill Exchanges</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Zero Currency • Pure Skill Trade
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Both parties teach what the other seeks. Exchange 1-on-1 sessions without spending credits.
          </p>
        </div>

        <Link
          href="/exchange"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
        >
          View Exchange Board ➔
        </Link>
      </div>

      {/* Exchange Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {exchanges.map((ex, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/40 via-white to-gray-50/60 dark:from-emerald-950/20 dark:via-gray-800 dark:to-gray-850 border border-emerald-200/80 dark:border-emerald-900/40 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
          >
            {/* Peer Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Image
                    src={
                      ex.peer.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ex.peer.name)}`
                    }
                    alt={ex.peer.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {ex.peer.name}
                    </h4>
                    <p className="text-[11px] text-gray-400">{ex.peer.location}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 text-xs font-extrabold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {ex.synergyScore}% Synergy
                </span>
              </div>

              {/* 2-Way Trade Diagram */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">You Teach:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[140px]">
                    {ex.teachSkill}
                  </span>
                </div>
                <div className="flex items-center justify-center text-emerald-500 font-bold text-sm">
                  ⇄
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">They Teach:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[140px]">
                    {ex.learnSkill}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {ex.rationale}
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onStartExchange(ex.peer.id)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Start Skill Exchange</span>
              <span>⇄</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
