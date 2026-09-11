"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function ConnectionsPage() {
  const { currentUser, connections, allUsers, acceptConnection, rejectConnection, removeConnection } = useApp();
  const [activeTab, setActiveTab] = useState<"connections" | "incoming" | "sent">("connections");

  if (!currentUser) return null;

  const myAcceptedConnections = connections.filter(
    (c) => c.status === "accepted" && (c.requesterId === currentUser.id || c.receiverId === currentUser.id)
  );

  const incomingRequests = connections.filter(
    (c) => c.status === "pending" && c.receiverId === currentUser.id
  );

  const sentRequests = connections.filter(
    (c) => c.status === "pending" && c.requesterId === currentUser.id
  );

  return (
    <div className="space-y-8 py-2">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          <span>Social Network & Endorsements</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          My Synapse Connections & Network
        </h1>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("connections")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "connections"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500"
          }`}
        >
          Active Connections ({myAcceptedConnections.length})
        </button>
        <button
          onClick={() => setActiveTab("incoming")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "incoming"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500"
          }`}
        >
          Incoming Requests ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "sent"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500"
          }`}
        >
          Sent Requests ({sentRequests.length})
        </button>
      </div>

      {activeTab === "connections" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAcceptedConnections.map((conn) => {
            const otherId = conn.requesterId === currentUser.id ? conn.receiverId : conn.requesterId;
            const otherUser = allUsers.find((u) => u.id === otherId);
            if (!otherUser) return null;

            return (
              <div
                key={conn.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5 mb-3">
                  <Image
                    src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(otherUser.name)}`}
                    alt={otherUser.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{otherUser.name}</h3>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">{otherUser.location}</p>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      🪙 {otherUser.credits} credits • ★ {otherUser.rating.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                  <button
                    onClick={() => removeConnection(conn.id)}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    Disconnect
                  </button>
                  <Link
                    href={`/messages?user=${otherUser.id}`}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                  >
                    Message 💬
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingRequests.map((req) => {
            const sender = allUsers.find((u) => u.id === req.requesterId);
            if (!sender) return null;

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <Image
                    src={sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sender.name)}`}
                    alt={sender.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{sender.name}</h3>
                    <p className="text-xs text-indigo-600 mt-1 italic">&quot;{req.message}&quot;</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rejectConnection(req.id)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => acceptConnection(req.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Accept ✓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "sent" && (
        <div className="space-y-4">
          {sentRequests.map((req) => {
            const receiver = allUsers.find((u) => u.id === req.receiverId);
            if (!receiver) return null;

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <Image
                    src={receiver.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(receiver.name)}`}
                    alt={receiver.name}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{receiver.name}</h3>
                    <span className="text-[10px] text-amber-600 font-bold">⏳ Awaiting Response</span>
                  </div>
                </div>
                <button
                  onClick={() => rejectConnection(req.id)}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
