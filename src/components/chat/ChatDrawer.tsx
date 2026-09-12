"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { formatTime, daysFromNowISO } from "@/lib/dateUtils";
import { generatePeerResponse } from "@/lib/chat-intelligence";
import { LiveSessionRoomModal } from "@/components/video/LiveSessionRoomModal";

interface ChatDrawerProps {
  targetUserId: string | null;
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export function ChatDrawer({ targetUserId, isOpen, onClose }: ChatDrawerProps) {
  const {
    currentUser,
    allUsers,
    messages,
    conversations,
    exchangeOffers,
    sendMessage,
    startConversationWithUser,
    clearConversationMessages,
    bookSession,
    acceptExchangeOffer,
    showToast,
  } = useApp();

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTime, setBookingTime] = useState("Tomorrow at 3:00 PM UTC");
  const [bookingDuration, setBookingDuration] = useState(45);
  const [isLiveRoomOpen, setIsLiveRoomOpen] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetUser = allUsers.find((u) => u.id === targetUserId);

  const liveSession = useMemo(() => {
    if (!targetUser || !currentUser) return undefined;
    return {
      id: `barter-sess-${targetUser.id}-${currentUser.id}`,
      teacherId: targetUser.id,
      learnerId: currentUser.id,
      skill: targetUser.skillsTeach[0]?.name || "Skill Barter",
      subSkill: targetUser.skillsTeach[0]?.subSkill,
      scheduledAt: "2026-09-12T12:00:00.000Z",
      duration: 45,
      status: "active" as const,
      credits: 0,
      type: "1on1" as const,
      notes: `# Live 1-on-1 Barter Exchange\n- Mentor: ${targetUser.name} (${targetUser.skillsTeach[0]?.name})\n- Peer: ${currentUser.name} (${currentUser.skillsTeach[0]?.name})\n\n## Shared Practice Scratchpad:\n- `,
    };
  }, [targetUser, currentUser]);

  // Find or determine conversation
  const activeConversation = conversations.find(
    (c) =>
      targetUserId &&
      c.participantIds.includes(targetUserId) &&
      currentUser &&
      c.participantIds.includes(currentUser.id)
  );

  const conversationMessages = activeConversation
    ? messages.filter((m) => m.conversationId === activeConversation.id)
    : [];

  // Find any active barter offer between these two users
  const relatedOffer = exchangeOffers.find(
    (o) =>
      (targetUserId && o.userId === targetUserId) ||
      (currentUser && targetUserId && o.userId === currentUser.id)
  );

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length, isTyping, isOpen]);

  if (!isOpen || !targetUser || !currentUser) return null;

  const triggerPeerReply = (convId: string, userMsg: string) => {
    setIsTyping(true);
    // Natural humanized typing delay between 1.1s and 1.8s
    const delay = 1100 + Math.min(userMsg.length * 20, 700);
    setTimeout(() => {
      const reply = generatePeerResponse({
        targetUser,
        currentUser,
        messageText: userMsg,
        activeOffer: relatedOffer,
      });
      sendMessage(convId, reply, targetUser.id);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let convId = activeConversation?.id;
    if (!convId) {
      convId = startConversationWithUser(targetUser.id);
    }

    const textToSend = inputText.trim();
    sendMessage(convId, textToSend, currentUser.id);
    setInputText("");

    triggerPeerReply(convId, textToSend);
  };

  const sendQuickChip = (text: string) => {
    let convId = activeConversation?.id;
    if (!convId) {
      convId = startConversationWithUser(targetUser.id);
    }
    sendMessage(convId, text, currentUser.id);
    triggerPeerReply(convId, text);
  };

  const handleConfirmBarter = () => {
    if (relatedOffer) {
      acceptExchangeOffer(relatedOffer.id);
    }
    let convId = activeConversation?.id;
    if (!convId) {
      convId = startConversationWithUser(targetUser.id);
    }
    const confirmMsg = `🤝 Barter Agreement Confirmed: I'll teach ${currentUser.skillsTeach[0]?.name || "my skills"} in exchange for your ${targetUser.skillsTeach[0]?.name || "mentorship"}! Let's lock in our first session.`;
    sendMessage(convId, confirmMsg, currentUser.id);
    showToast("Barter agreement confirmed! Notified peer.", "success");
    triggerPeerReply(convId, confirmMsg);
  };

  const handleBookSessionFromChat = (e: React.FormEvent) => {
    e.preventDefault();
    let convId = activeConversation?.id;
    if (!convId) {
      convId = startConversationWithUser(targetUser.id);
    }

    const scheduledDate = daysFromNowISO(1);
    bookSession(
      targetUser.id,
      targetUser.skillsTeach[0]?.name || "Skill Barter",
      undefined,
      scheduledDate,
      bookingDuration,
      "1on1",
      `Barter session arranged via Synapse Chat (${bookingTime})`
    );

    const bookingCardMsg = `🗓️ Barter Session Scheduled!\n• Topic: ${targetUser.skillsTeach[0]?.name || "Skill Exchange"}\n• Time: ${bookingTime} (${bookingDuration} min)\n• Format: Live 1-on-1 Video Call with Shared Notes`;
    sendMessage(convId, bookingCardMsg, currentUser.id);

    setIsBookingOpen(false);
    showToast(`Session booked with ${targetUser.name}!`, "success");

    setIsTyping(true);
    setTimeout(() => {
      const peerConfirm = `Awesome! I've marked down ${bookingTime} in my calendar. I'll see you in the live video room then!`;
      sendMessage(convId, peerConfirm, targetUser.id);
      setIsTyping(false);
    }, 1400);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setMessageReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? "" : emoji,
    }));
  };

  const handleClearChat = () => {
    if (activeConversation && confirm(`Clear chat history with ${targetUser.name}?`)) {
      clearConversationMessages(activeConversation.id);
      showToast("Conversation cleared.", "info");
    }
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/90 dark:bg-gray-850/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <Image
                src={targetUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetUser.name)}`}
                alt={targetUser.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 leading-tight">
                {targetUser.name}
                {targetUser.isLinkedInVerified && (
                  <span className="text-indigo-600 dark:text-indigo-400 text-xs" title="LinkedIn Verified">✓</span>
                )}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Online</span>
                <span>•</span>
                <span>★ {targetUser.rating || 4.9}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsLiveRoomOpen(true)}
              title="Launch Live Video Room"
              className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>🎥</span>
              <span className="hidden sm:inline text-[11px]">Room</span>
            </button>

            <button
              onClick={() => setIsBookingOpen(!isBookingOpen)}
              title="Schedule Barter Session"
              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>📅</span>
              <span className="hidden sm:inline text-[11px]">Book</span>
            </button>

            {conversationMessages.length > 0 && (
              <button
                onClick={handleClearChat}
                title="Clear Conversation"
                className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-xs"
              >
                🗑️
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close chat"
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ml-1 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Barter Pact Card / Summary */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-50/80 via-indigo-50/60 to-purple-50/80 dark:from-emerald-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border-b border-indigo-100/60 dark:border-indigo-900/40 text-[11px] shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span>⇄</span> Barter Agreement Terms
            </span>
            <span className="px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 font-bold text-[9px] uppercase">
              {relatedOffer?.status === "in_progress" ? "Active Pact" : "Open Barter"}
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium">
            <span>They teach: <strong className="text-emerald-600 dark:text-emerald-400">{targetUser.skillsTeach[0]?.name}</strong></span>
            <span>You teach: <strong className="text-purple-600 dark:text-purple-400">{currentUser.skillsTeach[0]?.name}</strong></span>
          </div>
          <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-indigo-100/40 dark:border-indigo-800/40">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Zero Fees • 1 hr/week cadence</span>
            <button
              onClick={handleConfirmBarter}
              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Confirm Terms ✓
            </button>
          </div>
        </div>

        {/* Inline Booking Form Accordion */}
        {isBookingOpen && (
          <div className="p-3 bg-amber-50/90 dark:bg-amber-950/50 border-b border-amber-200/80 dark:border-amber-800/60 shrink-0 text-xs animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200 mb-2">
              <span>📅 Schedule 1-on-1 Barter Session</span>
              <button onClick={() => setIsBookingOpen(false)} className="text-amber-700 dark:text-amber-300 hover:font-black">✕</button>
            </div>
            <form onSubmit={handleBookSessionFromChat} className="space-y-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 mb-0.5">Proposed Timeslot</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 text-xs text-gray-800 dark:text-gray-200"
                >
                  <option value="Tomorrow at 3:00 PM UTC">Tomorrow at 3:00 PM UTC</option>
                  <option value="This Saturday at 11:00 AM UTC">This Saturday at 11:00 AM UTC</option>
                  <option value="This Saturday at 4:00 PM UTC">This Saturday at 4:00 PM UTC</option>
                  <option value="This Sunday at 2:00 PM UTC">This Sunday at 2:00 PM UTC</option>
                  <option value="Next Monday at 10:00 AM UTC">Next Monday at 10:00 AM UTC</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 mb-0.5">Duration</label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 text-xs text-gray-800 dark:text-gray-200"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes (Standard)</option>
                    <option value={60}>60 Minutes (Deep Dive)</option>
                  </select>
                </div>
                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs text-xs cursor-pointer"
                  >
                    Confirm & Post 🗓️
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0">
          {conversationMessages.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-400">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl shadow-xs">
                💬
              </div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Start an Active Barter Conversation</p>
              <p className="text-[11px] mt-1 text-gray-500 dark:text-gray-400 leading-relaxed">
                Propose a trade, ask about their syllabus, or suggest a weekend kickoff session. {targetUser.name} is active and ready to respond.
              </p>
            </div>
          ) : (
            conversationMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isBookingMsg = msg.text.includes("🗓️ Barter Session Scheduled");
              const isAgreementMsg = msg.text.includes("🤝 Barter Agreement");
              const currentReaction = messageReactions[msg.id];

              return (
                <div key={msg.id} className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-end gap-1.5 max-w-[85%]">
                    {!isMe && (
                      <Image
                        src={targetUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetUser.name)}`}
                        alt={targetUser.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover shrink-0 mb-1"
                      />
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed transition-all ${
                        isBookingMsg
                          ? "bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 shadow-sm"
                          : isAgreementMsg
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 shadow-sm"
                          : isMe
                          ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-xs border border-gray-200/50 dark:border-gray-700/50"
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Interactive Buttons on Booking Cards */}
                      {isBookingMsg && (
                        <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center gap-2">
                          <button
                            onClick={() => setIsLiveRoomOpen(true)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <span>🎥 Enter Room</span>
                          </button>
                          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">Ready for session</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Meta & Reactions */}
                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400 dark:text-gray-500">
                    <span>{formatTime(msg.createdAt)}</span>
                    {currentReaction && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] shadow-2xs">
                        {currentReaction}
                      </span>
                    )}
                    {/* Hover Reaction Bar */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
                      {["👍", "⚡", "🤝", "❤️"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform text-[11px] cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs py-1.5 px-1 animate-pulse">
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200/60 dark:border-gray-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 ml-1">
                  {targetUser.name} is typing...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
          <button
            onClick={() => sendQuickChip(`Hi ${targetUser.name}! Are you free for a 45m skill exchange session this weekend?`)}
            className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer font-medium transition-colors"
          >
            🤝 Propose Barter
          </button>
          <button
            onClick={() => sendQuickChip(`I saw you teach ${targetUser.skillsTeach[0]?.name}. What is your current curriculum and syllabus?`)}
            className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer font-medium transition-colors"
          >
            📚 Ask Syllabus
          </button>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="whitespace-nowrap px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 cursor-pointer font-bold transition-colors"
          >
            📅 Book Session
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            aria-label={`Message ${targetUser.name}`}
            placeholder={`Message ${targetUser.name}...`}
            className="flex-1 px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Send message"
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

      {/* Live Video Room Modal */}
      {isLiveRoomOpen && (
        <LiveSessionRoomModal
          session={liveSession}
          onClose={() => setIsLiveRoomOpen(false)}
        />
      )}
    </>
  );
}
