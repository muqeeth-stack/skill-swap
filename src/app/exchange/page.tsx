"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { SkillExchangeOffer, SkillLevel } from "@/types";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { formatDate } from "@/lib/dateUtils";

export default function ExchangePage() {
  const { currentUser, exchangeOffers, allUsers, createExchangeOffer, acceptExchangeOffer, sendConnectionRequest, startConversationWithUser, sendMessage } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // New offer form state
  const [teachSkill, setTeachSkill] = useState(currentUser?.skillsTeach[0]?.name || "Cricket Batting");
  const [teachLevel] = useState<SkillLevel>("Advanced");
  const [learnSkill, setLearnSkill] = useState(currentUser?.skillsLearn[0]?.name || "React Development");
  const [learnLevel] = useState<SkillLevel>("Beginner");
  const [description, setDescription] = useState("");

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !description) return;

    createExchangeOffer(teachSkill, teachLevel, learnSkill, learnLevel, description);
    setIsModalOpen(false);
    setDescription("");
  };

  const handleProposeTrade = (offer: SkillExchangeOffer) => {
    if (!currentUser) return;
    acceptExchangeOffer(offer.id);
    sendConnectionRequest(offer.userId, `Hi, I accepted your barter offer: ${offer.teachSkill} for ${offer.learnSkill}!`);
    const convId = startConversationWithUser(offer.userId);
    sendMessage(convId, `Hi! I would love to proceed with our skill exchange (${offer.teachSkill} ⇄ ${offer.learnSkill}). When are you free?`);
    setChatUserId(offer.userId);
    setIsChatOpen(true);
  };

  const filteredOffers = exchangeOffers.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.teachSkill.toLowerCase().includes(q) ||
        o.learnSkill.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <span>Direct Peer-to-Peer Barter Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Skill Exchange Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Post and discover 1-on-1 skill trade proposals. Barter your expertise directly without fees.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <span>+ Post Barter Offer</span>
        </button>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skill offers by keyword..."
          aria-label="Search skill offers"
          className="w-full px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => {
          const creator = allUsers.find((u) => u.id === offer.userId);
          const isMine = offer.userId === currentUser?.id;

          return (
            <div
              key={offer.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={creator?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={creator?.name || "User"}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white">{creator?.name}</div>
                      <div className="text-[10px] text-gray-600">{creator?.location}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 uppercase">
                    {offer.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {offer.description}
                </p>

                <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-700/60 space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-[11px]">Offering:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{offer.teachSkill} ({offer.teachLevel})</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-gray-700/60 pt-1.5">
                    <span className="text-gray-600 text-[11px]">Seeking:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{offer.learnSkill} ({offer.learnLevel})</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <span className="text-[10px] text-gray-600">
                  {formatDate(offer.createdAt)}
                </span>
                {isMine ? (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                    Your Offer
                  </span>
                ) : (
                  <button
                    onClick={() => handleProposeTrade(offer)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Accept & Trade ⇄
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Create Skill Barter Offer</h3>
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skill You Offer</label>
                  <input
                    type="text"
                    value={teachSkill}
                    onChange={(e) => setTeachSkill(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skill You Want</label>
                  <input
                    type="text"
                    value={learnSkill}
                    onChange={(e) => setLearnSkill(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what you will teach and the frequency/format..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
                >
                  Publish Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ChatDrawer
        targetUserId={chatUserId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
