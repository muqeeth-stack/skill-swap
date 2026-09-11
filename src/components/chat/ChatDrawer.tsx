"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { formatTime } from "@/lib/dateUtils";

interface ChatDrawerProps {
  targetUserId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatDrawer({ targetUserId, isOpen, onClose }: ChatDrawerProps) {
  const { currentUser, allUsers, messages, conversations, sendMessage, startConversationWithUser } = useApp();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetUser = allUsers.find((u) => u.id === targetUserId);

  // Find conversation
  const activeConversation = conversations.find(
    (c) => targetUserId && c.participantIds.includes(targetUserId) && currentUser && c.participantIds.includes(currentUser.id)
  );

  const conversationMessages = activeConversation
    ? messages.filter((m) => m.conversationId === activeConversation.id)
    : [];

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.id, isOpen]);

  if (!isOpen || !targetUser || !currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let convId = activeConversation?.id;
    if (!convId) {
      convId = startConversationWithUser(targetUser.id);
    }

    sendMessage(convId, inputText.trim());
    setInputText("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2200);
  };

  const sendQuickChip = (text: string) => {
    let convId = activeConversation?.id;
    if (!convId) {
      convId = startConversationWithUser(targetUser.id);
    }
    sendMessage(convId, text);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/80 dark:bg-gray-850">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={targetUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetUser.name)}`}
              alt={targetUser.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 bg-emerald-500" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              {targetUser.name}
              {targetUser.isLinkedInVerified && (
                <span className="text-indigo-600 text-xs">✓</span>
              )}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Active on SynapseLearn
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Skills banner */}
      <div className="px-4 py-2 bg-indigo-50/60 dark:bg-indigo-950/40 border-b border-indigo-100/60 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
        <span>⚡ Teaches: <strong>{targetUser.skillsTeach[0]?.name}</strong></span>
        <span>Learns: <strong>{targetUser.skillsLearn[0]?.name}</strong></span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversationMessages.length === 0 ? (
          <div className="text-center py-10 px-4 text-gray-400">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">
              💬
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Start an Exchange Conversation</p>
            <p className="text-[11px] mt-1 text-gray-400">Propose a barter, ask about their experience, or schedule a session.</p>
          </div>
        ) : (
          conversationMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-xs"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs py-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] ml-1">{targetUser.name} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-700/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => sendQuickChip(`Hi ${targetUser.name}! Are you free for a 30m skill swap this weekend?`)}
          className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          🤝 Propose Barter
        </button>
        <button
          onClick={() => sendQuickChip(`I saw you teach ${targetUser.skillsTeach[0]?.name}. What is your current curriculum?`)}
          className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          📚 Ask Syllabus
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${targetUser.name}...`}
          className="flex-1 px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
        />
        <button
          type="submit"
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  );
}
