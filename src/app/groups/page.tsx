"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { LiveSessionRoomModal } from "@/components/video/LiveSessionRoomModal";

export default function GroupsPage() {
  const { currentUser, rooms, createRoom, joinRoom, sendRoomMessage, smartPods, joinSmartPod } = useApp();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const selectedRoom = (selectedRoomId ? rooms.find((r) => r.id === selectedRoomId) : null) || rooms[0] || null;
  const [roomChatText, setRoomChatText] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLiveRoomOpen, setIsLiveRoomOpen] = useState(false);

  // New room state
  const [roomTitle, setRoomTitle] = useState("");
  const [roomCategory, setRoomCategory] = useState("technology");
  const [roomTopic, setRoomTopic] = useState("Next.js & AI Full-Stack");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomMaxParticipants, setRoomMaxParticipants] = useState(12);

  const handleSendRoomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomChatText.trim() || !selectedRoom || !currentUser) return;
    sendRoomMessage(selectedRoom.id, roomChatText.trim());
    setRoomChatText("");
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTitle.trim() || !currentUser) return;

    const created = createRoom(
      roomTitle.trim(),
      roomDescription.trim(),
      roomCategory,
      roomTopic.trim() || roomTitle.trim(),
      undefined,
      "Intermediate",
      Number(roomMaxParticipants) || 10,
      new Date(Date.now() + 86400000).toISOString(),
      60,
      ["Collaborative peer practice and interactive Q&A"]
    );
    if (created) setSelectedRoomId(created.id);
    setIsCreateModalOpen(false);
    setRoomTitle("");
    setRoomDescription("");
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <span>Group Masterminds & Peer Practice Hubs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Learning Rooms & Peer Circles
          </h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer shrink-0"
        >
          <span>+ Create Learning Room</span>
        </button>
      </div>

      {/* AI Smart Study Pods (3+ Co-Learners Detected) */}
      <section className="bg-gradient-to-br from-teal-950/40 via-gray-900 to-indigo-950/30 rounded-3xl border border-teal-500/30 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 text-sm">
              🤖
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                AI Smart Study Pods
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-400 text-gray-950">
                  3+ Co-Learners Detected
                </span>
              </h2>
              <p className="text-xs text-teal-200/70">
                Intelligently clustered study groups automatically identified from mutual learner objectives across the platform.
              </p>
            </div>
          </div>
        </div>

        {smartPods.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs">
            No 3+ co-learner cohorts detected yet. As members add learning goals to their profiles, intelligent study groups will automatically appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {smartPods.map((pod) => {
            const hasExistingRoom = Boolean(pod.existingRoomId && rooms.some((r) => r.id === pod.existingRoomId));
            const isUserJoined = hasExistingRoom && rooms.find((r) => r.id === pod.existingRoomId)?.participants.includes(currentUser?.id || "");

            return (
              <div
                key={pod.id}
                className="bg-white/5 hover:bg-white/8 backdrop-blur-md rounded-2xl border border-teal-500/20 p-4 space-y-3.5 flex flex-col justify-between transition-all hover:border-teal-400/40 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                      {pod.category} • {pod.level}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-500/30">
                      👥 {pod.learners.length} Co-Learners
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-tight">
                    {pod.topic}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                    {pod.rationale}
                  </p>

                  {/* Co-learner Avatars */}
                  <div className="pt-1 flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      {pod.learners.slice(0, 4).map((learner) => (
                        <div
                          key={learner.id}
                          className="relative w-7 h-7 rounded-full border-2 border-gray-900 overflow-hidden"
                          title={`${learner.name} is learning this`}
                        >
                          <Image
                            src={learner.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                            alt={learner.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {pod.learners.length > 4 && (
                      <span className="text-[10px] text-teal-300 font-bold">
                        +{pod.learners.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Shared Goals / Topics */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-teal-400/80 uppercase">Shared Objectives:</span>
                    <div className="flex flex-wrap gap-1">
                      {pod.sharedGoals.slice(0, 2).map((goal, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-black/40 text-gray-300 px-2 py-0.5 rounded-md border border-white/5 line-clamp-1"
                        >
                          • {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const room = joinSmartPod(pod);
                    if (room) {
                      setSelectedRoomId(room.id);
                      if (typeof document !== "undefined") {
                        const el = document.getElementById("active-room-view");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                    isUserJoined
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-gray-950"
                  }`}
                >
                  {isUserJoined ? "✓ You Are In This Circle (Open)" : "⚡ Form & Join Circle"}
                </button>
              </div>
            );
          })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {rooms.map((room) => {
            const isSelected = selectedRoom?.id === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-50/70 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/20"
                    : "bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{room.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">
                    👥 {room.participants.length}/{room.maxParticipants}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{room.description}</p>
              </div>
            );
          })}
        </div>

        {selectedRoom && (
          <div
            id="active-room-view"
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 shadow-xs flex flex-col justify-between space-y-6 scroll-mt-24"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {selectedRoom.title}
                  </h2>
                  <p className="text-xs text-gray-500">{selectedRoom.skill} • {selectedRoom.duration} mins</p>
                </div>

                {currentUser && !selectedRoom.participants.includes(currentUser.id) ? (
                  <button
                    onClick={() => joinRoom(selectedRoom.id)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Join Room 👥
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                      ✓ Member
                    </span>
                    <button
                      onClick={() => setIsLiveRoomOpen(true)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-gray-950 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>🎥 Launch Live Circle</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {selectedRoom.description}
                </p>
              </div>

              {/* Group Discussion Feed */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-500">Live Room Discussion:</h3>
                <div className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 max-h-64 overflow-y-auto space-y-3">
                  {selectedRoom.chatMessages.map((msg) => (
                    <div key={msg.id} className="text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">{msg.senderName}: </span>
                      <span className="text-gray-700 dark:text-gray-300">{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSendRoomChat} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={roomChatText}
                onChange={(e) => setRoomChatText(e.target.value)}
                placeholder="Message the room..."
                aria-label="Message the room"
                className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Create Learning Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Room Title</label>
                <input
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="e.g. Full-Stack Next.js 15 & AI Agents Workshop"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={roomCategory}
                    onChange={(e) => setRoomCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  >
                    <option value="technology">Technology</option>
                    <option value="sports">Sports & Fitness</option>
                    <option value="creative">Creative & Arts</option>
                    <option value="business">Business & Career</option>
                    <option value="languages">Languages</option>
                    <option value="academics">Academics</option>
                    <option value="life_skills">Life Skills</option>
                    <option value="hobbies">Hobbies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Max Peers</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={roomMaxParticipants}
                    onChange={(e) => setRoomMaxParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Focus Skill</label>
                <input
                  type="text"
                  value={roomTopic}
                  onChange={(e) => setRoomTopic(e.target.value)}
                  placeholder="e.g. Next.js, Cricket Bowling, Spanish Fluency"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="What will peers learn and practice in this room?"
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLiveRoomOpen && selectedRoom && (
        <LiveSessionRoomModal
          room={selectedRoom}
          onClose={() => setIsLiveRoomOpen(false)}
        />
      )}
    </div>
  );
}
