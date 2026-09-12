"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { SkillExchangeOffer, SkillLevel } from "@/types";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { formatDate } from "@/lib/dateUtils";

export default function ExchangePage() {
  const {
    currentUser,
    exchangeOffers,
    allUsers,
    createExchangeOffer,
    acceptExchangeOffer,
    deleteExchangeOffer,
    sendConnectionRequest,
    startConversationWithUser,
    sendMessage,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "synergy" | "my" | "active">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Chat Drawer State
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Post Barter Offer Modal State
  const [teachSkill, setTeachSkill] = useState(currentUser?.skillsTeach[0]?.name || "Cricket Batting & Athletic Fitness");
  const [teachLevel, setTeachLevel] = useState<SkillLevel>("Advanced");
  const [learnSkill, setLearnSkill] = useState(currentUser?.skillsLearn[0]?.name || "React Development & Next.js");
  const [learnLevel, setLearnLevel] = useState<SkillLevel>("Beginner");
  const [cadence, setCadence] = useState("1 session / week (45 min)");
  const [description, setDescription] = useState(
    "Looking for a committed barter partner to exchange weekly coaching. I will provide structured drills and direct review in exchange for hands-on mentorship."
  );

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !description.trim()) return;

    createExchangeOffer(teachSkill, teachLevel, learnSkill, learnLevel, description.trim());
    setIsModalOpen(false);
    showToast("Your barter proposal has been posted to the marketplace!", "success");
  };

  const handleProposeTrade = (offer: SkillExchangeOffer) => {
    if (!currentUser) {
      showToast("Please sign in to propose a skill barter trade.", "warning");
      return;
    }

    acceptExchangeOffer(offer.id);
    sendConnectionRequest(
      offer.userId,
      `Hi! I would love to trade ${currentUser.skillsTeach[0]?.name || "my skills"} for your ${offer.teachSkill} coaching!`
    );

    const convId = startConversationWithUser(offer.userId);
    const initialTradeMsg = `🤝 Barter Proposal: Hi! I accepted your marketplace barter offer (${offer.teachSkill} ⇄ ${offer.learnSkill}). I can teach ${currentUser.skillsTeach[0]?.name || "my skills"} in return. When are you free for our first 1-on-1 kickoff?`;
    sendMessage(convId, initialTradeMsg, currentUser.id);

    setChatUserId(offer.userId);
    setIsChatOpen(true);
    showToast("Barter proposal accepted! Opened direct agreement chat.", "success");
  };

  const handleOpenChat = (userId: string) => {
    setChatUserId(userId);
    setIsChatOpen(true);
  };

  // Find ongoing barters involving the current user
  const myOngoingBarters = exchangeOffers.filter(
    (o) => o.status === "in_progress" && (o.userId === currentUser?.id || o.userId === "u1" || o.userId === "u2")
  );

  // Filter offers based on active controls
  const filteredOffers = exchangeOffers.filter((offer) => {
    const isMine = offer.userId === currentUser?.id;

    // Tab filter
    if (activeTab === "my" && !isMine) return false;
    if (activeTab === "active" && offer.status !== "in_progress") return false;
    if (activeTab === "synergy" && currentUser) {
      const teachesWhatIWant = currentUser.skillsLearn.some(
        (sl) => offer.teachSkill.toLowerCase().includes(sl.name.toLowerCase()) || sl.name.toLowerCase().includes(offer.teachSkill.toLowerCase())
      );
      const wantsWhatITeach = currentUser.skillsTeach.some(
        (st) => offer.learnSkill.toLowerCase().includes(st.name.toLowerCase()) || st.name.toLowerCase().includes(offer.learnSkill.toLowerCase())
      );
      if (!teachesWhatIWant && !wantsWhatITeach) return false;
    }

    // Category filter
    if (selectedCategory !== "all") {
      const creator = allUsers.find((u) => u.id === offer.userId);
      const matchedTeach = creator?.skillsTeach.find((s) => s.name.toLowerCase() === offer.teachSkill.toLowerCase());
      if (matchedTeach && matchedTeach.category !== selectedCategory) {
        return false;
      }
    }

    // Level filter
    if (selectedLevel !== "all" && offer.teachLevel !== selectedLevel) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        offer.teachSkill.toLowerCase().includes(q) ||
        offer.learnSkill.toLowerCase().includes(q) ||
        offer.description.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-8 py-2">
      {/* Hero Header & Marketplace Intelligence */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-3">
              <span>✦ Direct P2P Skill Barter Board</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Skill Exchange Marketplace
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 mt-2 leading-relaxed">
              Trade expertise 1-on-1 without cash. Share your mastery in sports, coding, design, or languages, and learn from verified peers hour-for-hour.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
            >
              {showHowItWorks ? "Hide Guide ✕" : "How Barter Works 💡"}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer hover:scale-105"
            >
              <span>+ Post Barter Offer</span>
            </button>
          </div>
        </div>

        {/* Live Marketplace Velocity Stats Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-indigo-700/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-700/30">
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400">100% Cashless</div>
            <div className="text-[11px] text-indigo-200/80 font-medium">Zero Financial Fees</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-700/30">
            <div className="text-lg sm:text-xl font-extrabold text-amber-300">28 Active Pacts</div>
            <div className="text-[11px] text-indigo-200/80 font-medium">Live Exchanges This Week</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-700/30">
            <div className="text-lg sm:text-xl font-extrabold text-purple-300">98.4% Verified</div>
            <div className="text-[11px] text-indigo-200/80 font-medium">Peer Trust Rating</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-700/30">
            <div className="text-lg sm:text-xl font-extrabold text-cyan-300">&lt; 2 Hours</div>
            <div className="text-[11px] text-indigo-200/80 font-medium">Average Response Time</div>
          </div>
        </div>
      </div>

      {/* How It Works Explainer Banner */}
      {showHowItWorks && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-gray-800 border border-indigo-200/80 dark:border-indigo-900/60 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
              <span>💡</span> The SynapseLearn 3-Step Barter System
            </h3>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              Dismiss ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center mb-2.5 shadow-xs">
                1
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Discover Synergistic Match</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Browse peer proposals where someone is teaching what you want to learn, and looking for what you have to teach.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center mb-2.5 shadow-xs">
                2
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Align Terms in Barter Chat</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Open direct chat to negotiate curriculum topics, cadence (e.g. 1 hr/week), and lock in mutually convenient slots.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center mb-2.5 shadow-xs">
                3
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Live 1-on-1 Practice & Badges</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Hop into encrypted WebRTC video rooms with shared notes. Complete exchanges to earn peer endorsements and skill badges.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ongoing Barters Shelf (if any exist) */}
      {myOngoingBarters.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-indigo-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <span className="animate-pulse">🟢</span> Your Active Barter Exchanges ({myOngoingBarters.length})
            </h3>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              Live Collaboration Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myOngoingBarters.slice(0, 2).map((b) => {
              const partner = allUsers.find((u) => u.id === b.userId);
              return (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Image
                      src={partner?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(partner?.name || "Peer")}`}
                      alt={partner?.name || "Peer"}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-emerald-500/30"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {partner?.name || "Exchange Partner"}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                        {b.teachSkill} ⇄ {b.learnSkill}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenChat(b.userId)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <span>💬 Chat</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Discovery Filters & Navigation Suite */}
      <div className="space-y-4">
        {/* Scope Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "Explore All Proposals", icon: "🌐" },
            { id: "synergy", label: "High Synergy With Me", icon: "⚡" },
            { id: "my", label: "My Barter Offers", icon: "👤" },
            { id: "active", label: "In Progress", icon: "🤝" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Secondary Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill, topic, or keyword..."
              aria-label="Search barter proposals"
              className="w-full pl-8 pr-8 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category & Level Dropdowns */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by skill category"
              className="flex-1 md:flex-initial px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white cursor-pointer font-medium"
            >
              <option value="all">All Categories</option>
              <option value="technology">💻 Technology</option>
              <option value="creative">🎨 Creative & Design</option>
              <option value="sports">🏸 Sports & Fitness</option>
              <option value="languages">🗣️ Languages</option>
              <option value="business">📈 Business & Growth</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Filter by proficiency level"
              className="flex-1 md:flex-initial px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white cursor-pointer font-medium"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Barter Proposals Grid */}
      {filteredOffers.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl">
            ⇄
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">No barter offers found matching filters</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try resetting your search filters or be the first to post a new trade proposal in this category!
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLevel("all");
              setActiveTab("all");
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => {
            const creator = allUsers.find((u) => u.id === offer.userId);
            const isMine = offer.userId === currentUser?.id;

            // Compute profile synergy highlight
            const synergyMatch =
              currentUser &&
              (currentUser.skillsLearn.some((sl) => offer.teachSkill.toLowerCase().includes(sl.name.toLowerCase())) ||
                currentUser.skillsTeach.some((st) => offer.learnSkill.toLowerCase().includes(st.name.toLowerCase())));

            return (
              <div
                key={offer.id}
                className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isMine
                    ? "bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-gray-800 border-indigo-200 dark:border-indigo-800/60"
                    : "bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                } p-5 sm:p-6`}
              >
                <div>
                  {/* Creator Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={creator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator?.name || "Mentor")}`}
                        alt={creator?.name || "User"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
                          {creator?.name || "Verified Peer"}
                          {creator?.isLinkedInVerified && (
                            <span className="text-indigo-600 dark:text-indigo-400 text-xs" title="LinkedIn Verified">✓</span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span>{creator?.location || "Global Peer"}</span>
                          <span>•</span>
                          <span className="text-amber-500 font-bold">★ {creator?.rating || "4.9"}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full tracking-wider shrink-0 ${
                        offer.status === "in_progress"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                      }`}
                    >
                      {offer.status === "in_progress" ? "In Progress" : "Active"}
                    </span>
                  </div>

                  {/* Synergy Tag */}
                  {synergyMatch && !isMine && (
                    <div className="mb-3 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800/60 text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <span className="text-amber-500">✨</span>
                      <span>High Synergy with your profile learning goals</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                    &ldquo;{offer.description}&rdquo;
                  </p>

                  {/* Two-Way Exchange Card Box */}
                  <div className="p-3.5 rounded-2xl bg-gray-50/90 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 space-y-2.5 mb-4">
                    {/* Offering Row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Offers to Teach:</span>
                      </div>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-right">
                        {offer.teachSkill} <span className="text-[10px] font-semibold opacity-80">({offer.teachLevel})</span>
                      </span>
                    </div>

                    {/* Trade Cadence Bar */}
                    <div className="flex items-center justify-center gap-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
                      <span>⇄ 1-on-1 Barter • 1 hr/week</span>
                    </div>

                    {/* Seeking Row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Wants to Learn:</span>
                      </div>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400 text-right">
                        {offer.learnSkill} <span className="text-[10px] font-semibold opacity-80">({offer.learnLevel})</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer & Action Buttons */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    Posted {formatDate(offer.createdAt)}
                  </span>

                  {isMine ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                        Your Offer
                      </span>
                      <button
                        onClick={() => deleteExchangeOffer(offer.id)}
                        className="px-2 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-xs font-semibold cursor-pointer"
                        title="Withdraw Proposal"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenChat(offer.userId)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        💬 Chat
                      </button>

                      <button
                        onClick={() => handleProposeTrade(offer)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Accept & Trade ⇄</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Barter Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Post Skill Barter Proposal</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Offer your skills in return for another member&apos;s expertise.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              {/* Teaching Section */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 space-y-2.5">
                <span className="block text-[11px] font-extrabold uppercase text-emerald-800 dark:text-emerald-400">
                  What You Offer to Teach
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={teachSkill}
                      onChange={(e) => setTeachSkill(e.target.value)}
                      placeholder="e.g. Cricket Batting, React, Spanish"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-xl dark:text-white font-medium"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={teachLevel}
                      onChange={(e) => setTeachLevel(e.target.value as SkillLevel)}
                      className="w-full px-2.5 py-2 text-xs bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-xl dark:text-white font-medium"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seeking Section */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 space-y-2.5">
                <span className="block text-[11px] font-extrabold uppercase text-purple-800 dark:text-purple-400">
                  What You Want to Learn in Return
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={learnSkill}
                      onChange={(e) => setLearnSkill(e.target.value)}
                      placeholder="e.g. Python Data Science, UI Design"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-xl dark:text-white font-medium"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={learnLevel}
                      onChange={(e) => setLearnLevel(e.target.value as SkillLevel)}
                      className="w-full px-2.5 py-2 text-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-xl dark:text-white font-medium"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cadence & Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Exchange Cadence
                </label>
                <select
                  value={cadence}
                  onChange={(e) => setCadence(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                >
                  <option value="1 session / week (45 min)">1 session / week (45 min)</option>
                  <option value="2 sessions / week (45 min)">2 sessions / week (45 min)</option>
                  <option value="Bi-weekly deep dive (60 min)">Bi-weekly deep dive (60 min)</option>
                  <option value="Flexible / Asynchronous Code Review">Flexible / Asynchronous Code Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description & Syllabus Highlights
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your syllabus, experience, and what you hope to achieve..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md cursor-pointer"
                >
                  Publish Barter Offer 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Chat Drawer */}
      <ChatDrawer
        targetUserId={chatUserId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
