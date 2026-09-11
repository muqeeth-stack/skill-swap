"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { daysFromNowISO } from "@/lib/dateUtils";

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("user");
  const initialConvId = searchParams.get("convId");

  const {
    currentUser,
    allUsers,
    messages,
    conversations,
    sendMessage,
    startConversationWithUser,
    markMessagesRead,
    bookSession,
    showToast,
  } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId || null);
  const [inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTopic, setBookingTopic] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // One-time initial selection from URL params / default partner (adjusting state during render)
  const [selectionInitDone, setSelectionInitDone] = useState(false);
  if (!selectionInitDone && currentUser) {
    let target: string | null = null;
    let fromUrl = false;
    if (initialConvId) {
      const conv = conversations.find((c) => c.id === initialConvId);
      const other = conv?.participantIds.find((id) => id !== currentUser.id);
      if (other) { target = other; fromUrl = true; }
    }
    if (!target && initialUserId) { target = initialUserId; fromUrl = true; }
    if (target) {
      setSelectedUserId(target);
      if (fromUrl) setMobileShowChat(true);
    } else if (allUsers.length > 1) {
      const other = allUsers.find((u) => u.id !== currentUser.id);
      if (other) setSelectedUserId(other.id);
    }
    setSelectionInitDone(true);
  }

  const activeUser = allUsers.find((u) => u.id === selectedUserId);

  const activeConversation = conversations.find(
    (c) =>
      selectedUserId &&
      c.participantIds.includes(selectedUserId) &&
      currentUser &&
      c.participantIds.includes(currentUser.id)
  );

  const conversationMessages = activeConversation
    ? messages.filter((m) => m.conversationId === activeConversation.id)
    : [];

  const activeConvId = activeConversation?.id;
  const hasUnread = activeConversation?.unreadCount && activeConversation.unreadCount > 0;
  const markedReadRef = useRef<string | null>(null);

  // Automatically mark unread messages as read when viewing this conversation
  useEffect(() => {
    if (activeConvId && hasUnread && markedReadRef.current !== activeConvId) {
      markedReadRef.current = activeConvId;
      markMessagesRead(activeConvId);
    }
    if (!activeConvId) {
      markedReadRef.current = null;
    }
  }, [activeConvId, hasUnread, markMessagesRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length, selectedUserId]);

  if (!currentUser) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400 text-sm">
        Please sign in to view your messages and exchange sessions.
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser) return;

    let convId = activeConversation?.id;
    if (!convId) {
      convId = startConversationWithUser(activeUser.id);
    }

    sendMessage(convId, inputText.trim());
    setInputText("");
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !bookingTopic) return;
    const tomorrow = daysFromNowISO(1);
    bookSession(activeUser.id, bookingTopic, undefined, tomorrow, 45, "1on1", "Scheduled via Synapse Chat");
    setIsBookingOpen(false);
    showToast(`Session booked with ${activeUser.name}!`, "success");
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] max-w-7xl mx-auto flex rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-xl overflow-hidden animate-fadeIn">
      {/* Left Sidebar: Conversation List */}
      <div
        className={`w-full sm:w-80 md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/60 ${
          mobileShowChat ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>💬</span> Synapse Messages
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              {conversations.length} active
            </span>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
              className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* User Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {allUsers
            .filter((u) => u.id !== currentUser.id)
            .filter((u) => !searchFilter || u.name.toLowerCase().includes(searchFilter.toLowerCase()) || (u.skillsTeach[0]?.name && u.skillsTeach[0].name.toLowerCase().includes(searchFilter.toLowerCase())))
            .map((u) => {
              const isSelected = u.id === selectedUserId;
              const conv = conversations.find(
                (c) => c.participantIds.includes(u.id) && c.participantIds.includes(currentUser.id)
              );
              const unread = conv?.unreadCount && conv.unreadCount > 0 ? conv.unreadCount : 0;

              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-l-4 border-indigo-600"
                      : "hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Image
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`}
                      alt={u.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                    />
                    {u.rating >= 4.9 && (
                      <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {u.name}
                      </h4>
                      {conv?.lastMessageTime && (
                        <span className="text-[10px] text-gray-600 shrink-0">
                          {formatMessageTime(conv.lastMessageTime)}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate mt-0.5">
                      {conv?.lastMessage || `Teaches: ${u.skillsTeach[0]?.name || "Skill Barter"}`}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        {u.skillsTeach[0]?.name}
                      </span>
                      {unread > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Right Chat Pane */}
      {activeUser ? (
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-gray-800 ${
            mobileShowChat ? "flex" : "hidden sm:flex"
          }`}
        >
          {/* Active User Header */}
          <div className="p-3.5 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/70 dark:bg-gray-900/40 gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileShowChat(false)}
                className="sm:hidden p-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs font-bold cursor-pointer"
                title="Back to conversation list"
              >
                ← Back
              </button>

              <Image
                src={activeUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser.name)}`}
                alt={activeUser.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {activeUser.name}
                  </h3>
                  <span className="text-[11px] text-amber-500 font-bold">
                    ★ {activeUser.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                  Teaches: {activeUser.skillsTeach.map((s) => s.name).join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBookingTopic(activeUser.skillsTeach[0]?.name || "");
                  setIsBookingOpen(true);
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📅</span>
                <span className="hidden sm:inline">Book 1-on-1</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-gray-50/20 dark:bg-gray-900/20">
            {conversationMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-gray-400">
                <div className="text-3xl">👋</div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Start the conversation with {activeUser.name}
                </div>
                <p className="text-[11px] max-w-xs">
                  Discuss skill exchange topics, coordinate video study sessions, or ask questions about their drills.
                </p>
              </div>
            ) : (
              conversationMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs shadow-2xs leading-relaxed ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-xs font-medium"
                          : "bg-white dark:bg-gray-750 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-xs font-normal"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-600 mt-1 px-1">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3.5 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800"
          >
            <input
              type="text"
              data-testid="message-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeUser.name.split(" ")[0]}...`}
              aria-label={`Message ${activeUser.name.split(" ")[0]}`}
              className="flex-1 px-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              data-testid="send-message-btn"
              disabled={!inputText.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              Send ✈
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 flex-col items-center justify-center text-gray-400 text-xs space-y-2">
          <div className="text-3xl">💬</div>
          <div>Select a conversation from the left to start messaging.</div>
        </div>
      )}

      {/* 1-on-1 Session Booking Modal */}
      {isBookingOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Schedule 1-on-1 Session
                </h3>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Book a live 45-minute exchange session with <strong>{activeUser.name}</strong>. Both peers earn Synapse exchange credits.
            </p>

            <form onSubmit={handleConfirmBooking} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Exchange Topic / Skill
                </label>
                <input
                  type="text"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  placeholder="e.g. Next.js App Router, Cricket Batting Drills"
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300">
                ⚡ Automatically generates a calendar invite and Jitsi Meet video room upon confirmation.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading conversations...</div>}>
      <MessagesContent />
    </React.Suspense>
  );
}
