"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Modal from "@/components/ui/Modal";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  group: "People" | "Skills" | "Masterclasses" | "Learning Rooms" | "Learning Paths";
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { allUsers, skills, recordings, rooms, learningPaths } = useApp();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const results = useMemo<SearchResult[]>(() => {
    if (!q) return [];
    const out: SearchResult[] = [];

    allUsers.forEach((u) => {
      const teaches = u.skillsTeach.map((s) => s.name).join(" ");
      const learns = u.skillsLearn.map((s) => s.name).join(" ");
      if (
        u.name.toLowerCase().includes(q) ||
        teaches.toLowerCase().includes(q) ||
        learns.toLowerCase().includes(q) ||
        (u.bio || "").toLowerCase().includes(q)
      ) {
        out.push({
          id: `p-${u.id}`,
          group: "People",
          title: u.name,
          subtitle: `${u.skillsTeach[0]?.name || "Learner"}${u.location ? ` · ${u.location}` : ""}`,
          href: `/profile?id=${u.id}`,
        });
      }
    });

    skills.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.subSkills.some((sub) => sub.toLowerCase().includes(q))) {
        out.push({
          id: `s-${s.id}`,
          group: "Skills",
          title: s.name,
          subtitle: `${s.subSkills.slice(0, 2).join(" · ")}${s.description ? ` — ${s.description.slice(0, 60)}` : ""}`,
          href: `/skills?q=${encodeURIComponent(s.name)}`,
        });
      }
    });

    recordings.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.skill.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q))) {
        out.push({
          id: `v-${r.id}`,
          group: "Masterclasses",
          title: r.title,
          subtitle: `${r.skill} · ${r.level} (${r.duration} min)`,
          href: "/videos",
        });
      }
    });

    rooms.forEach((rm) => {
      if (rm.title.toLowerCase().includes(q) || rm.skill.toLowerCase().includes(q) || (rm.description || "").toLowerCase().includes(q)) {
        out.push({
          id: `g-${rm.id}`,
          group: "Learning Rooms",
          title: rm.title,
          subtitle: rm.skill,
          href: "/groups",
        });
      }
    });

    learningPaths.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)) {
        out.push({
          id: `lp-${p.id}`,
          group: "Learning Paths",
          title: p.title,
          subtitle: p.category,
          href: "/paths",
        });
      }
    });

    const order: SearchResult["group"][] = ["People", "Skills", "Masterclasses", "Learning Rooms", "Learning Paths"];
    return out
      .sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group))
      .slice(0, 24);
  }, [q, allUsers, skills, recordings, rooms, learningPaths]);

  const grouped = orderByGroup(results);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="p-1 sm:p-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🔍</span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Global Search</h2>
          <span className="ml-auto hidden sm:inline px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md">
            People · Skills · Videos · Rooms · Paths
          </span>
        </div>

        <div className="relative mt-3 mb-4">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results.length > 0) handleSelect(results[0].href);
            }}
            placeholder="Search mentors, skills, masterclasses, rooms, paths..."
            aria-label="Search SynapseLearn"
            className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        {q && results.length === 0 && (
          <p className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
            No results for &quot;{query.trim()}&quot;. Try a skill, mentor name, or topic.
          </p>
        )}

        {!q && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-6">
            {[
              { label: "Cricket", path: "skills?q=Cricket" },
              { label: "React / Next.js", path: "skills?q=React" },
              { label: "Video Editing", path: "skills?q=Video%20Editing" },
              { label: "Spanish", path: "skills?q=Spanish" },
              { label: "Masterclasses", path: "videos" },
              { label: "Learning Rooms", path: "groups" },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => handleSelect(`/${s.path}`)}
                className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-center transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {q && (
          <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-4">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{group}</p>
                <div className="space-y-1.5">
                  {items.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r.href)}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{r.title}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{r.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function orderByGroup(results: SearchResult[]): Record<string, SearchResult[]> {
  const map: Record<string, SearchResult[]> = {};
  for (const r of results) {
    (map[r.group] = map[r.group] || []).push(r);
  }
  return map;
}