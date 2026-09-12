"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Session, LearningRoom } from "@/types";
import { useApp } from "@/context/AppContext";

interface LiveSessionRoomModalProps {
  session?: Session;
  room?: LearningRoom;
  onClose: () => void;
}

export function LiveSessionRoomModal({ session, room, onClose }: LiveSessionRoomModalProps) {
  const { currentUser, allUsers, completeSession, showToast } = useApp();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes");

  const initialNotes = session
    ? session.notes || `# ${session.skill} Exchange Notes\n- Key objectives:\n- Practice drills:`
    : room
    ? `# ${room.title} Circle Notes\n- Focus Skill: ${room.skill}\n- Learning Goals: ${(room.goals || []).join(", ")}\n\n## Collaborative Practice Scratchpad:\n- `
    : `# Study Session Notes\n- `;

  const [sharedNotes, setSharedNotes] = useState(initialNotes);
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([
    { id: "1", sender: "System", text: "Connected to encrypted peer room.", time: "Just now" },
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isTeacher = session ? currentUser?.id === session.teacherId : false;
  const partnerId = session ? (isTeacher ? session.learnerId : session.teacherId) : null;
  const partner = partnerId ? allUsers.find((u) => u.id === partnerId) : null;
  const roomCoLearners = room ? allUsers.filter((u) => room.participants.includes(u.id) && u.id !== currentUser?.id) : [];

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request camera/mic stream when video is active
  useEffect(() => {
    let active = true;
    if (isVideoOn && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: isMicOn })
        .then((stream) => {
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission denied or headless environment - fallback gracefully
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isVideoOn, isMicOn]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !currentUser) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: currentUser.name,
        text: inputMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInputMsg("");
  };

  const handleExportNotes = () => {
    if (typeof window === "undefined") return;
    const baseTitle = room?.title || session?.skill || "study-session";
    const filename = `${baseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-notes.md`;
    const blob = new Blob([sharedNotes], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Notes exported as Markdown file!", "success");
  };

  const handleEndAndComplete = () => {
    if (session) {
      completeSession(session.id);
      showToast(`Session completed! ${session.credits} credits settled.`, "success");
    } else if (room) {
      showToast(`Study circle live session completed! Attendance recorded and XP awarded.`, "success");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-gray-950 text-white rounded-3xl w-full max-w-5xl h-[90vh] max-h-[800px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Room Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gray-900/80">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                {session ? session.skill : room?.title || "Live Circle Room"}
                <span className="text-xs font-normal text-gray-400">
                  ({session ? `${session.duration} min exchange` : `${room?.duration || 60} min study circle`})
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {session ? (
                  <>Partner: <span className="text-teal-300 font-semibold">{partner?.name || "Peer Partner"}</span> • Role: {isTeacher ? "Mentor/Teacher" : "Learner"}</>
                ) : (
                  <>{room?.skill} • <span className="text-teal-300 font-semibold">{roomCoLearners.length + 1} Active Learners in Circle</span></>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span>● REC</span>
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Stage */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden min-h-0">
          {/* Video Grid (2 Cols) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
            {/* Remote Peer Stream */}
            <div className="relative rounded-2xl bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center min-h-[220px]">
              <div className="text-center space-y-3 p-4">
                <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-teal-400 shadow-lg">
                  <Image
                    src={
                      partner?.avatar ||
                      roomCoLearners[0]?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    }
                    alt={partner?.name || roomCoLearners[0]?.name || "Co-Learners"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {partner?.name || (roomCoLearners.length > 0 ? `${roomCoLearners[0].name}${roomCoLearners.length > 1 ? ` +${roomCoLearners.length - 1} peers` : ""}` : "Study Circle Peers")}
                  </h4>
                  <p className="text-xs text-teal-400 font-medium">
                    {session ? (partner?.skillsTeach[0]?.name || "Connected") : `${room?.skill || "Study Circle"} (Live)`}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                {session ? `${partner?.name || "Partner"} (Remote)` : "Co-Learner Feed (Encrypted)"}
              </div>
            </div>

            {/* Local User Stream */}
            <div className="relative rounded-2xl bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center min-h-[220px]">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center space-y-2 p-4">
                  <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg">
                    <Image
                      src={currentUser?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
                      alt={currentUser?.name || "You"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Camera Paused</p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                You ({currentUser?.name}) {isMicOn ? "🎤" : "🔇"}
              </div>
            </div>
          </div>

          {/* Right Panel: Collaborative Scratchpad & In-Room Chat */}
          <div className="rounded-2xl bg-gray-900/90 border border-white/10 flex flex-col overflow-hidden min-h-0">
            <div className="flex border-b border-white/10 text-xs font-bold">
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeTab === "notes" ? "bg-white/10 text-teal-300 border-b-2 border-teal-400" : "text-gray-400 hover:text-white"
                }`}
              >
                📝 Collaborative Notes
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeTab === "chat" ? "bg-white/10 text-teal-300 border-b-2 border-teal-400" : "text-gray-400 hover:text-white"
                }`}
              >
                💬 Room Chat ({messages.length})
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto min-h-0 text-xs">
              {activeTab === "notes" ? (
                <div className="flex flex-col h-full space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Markdown Scratchpad</span>
                    <button
                      type="button"
                      onClick={handleExportNotes}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-teal-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Download notes as markdown file"
                    >
                      <span>📥 Export .md</span>
                    </button>
                  </div>
                  <textarea
                    value={sharedNotes}
                    onChange={(e) => setSharedNotes(e.target.value)}
                    placeholder="Type shared lesson notes, code snippets, drill steps..."
                    className="flex-1 w-full bg-transparent resize-none focus:outline-hidden font-mono text-gray-200 placeholder-gray-500 text-xs"
                  />
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {messages.map((m) => (
                      <div key={m.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="font-semibold text-teal-300">{m.sender}</span>
                          <span>{m.time}</span>
                        </div>
                        <p className="bg-white/5 rounded-xl p-2 text-gray-200">{m.text}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:ring-1 focus:ring-teal-400"
                    />
                    <button type="submit" className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl cursor-pointer">
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Room Bottom Control Bar */}
        <div className="px-6 py-3.5 bg-gray-900 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isMicOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-rose-600 text-white"
              }`}
            >
              {isMicOn ? "🎤 Mic On" : "🔇 Mic Off"}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isVideoOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-rose-600 text-white"
              }`}
            >
              {isVideoOn ? "📹 Cam On" : "🚫 Cam Off"}
            </button>
            <button
              onClick={() => {
                setIsScreenSharing(!isScreenSharing);
                showToast(isScreenSharing ? "Stopped screen sharing" : "Screen sharing started", "info");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isScreenSharing ? "bg-teal-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              🖥️ {isScreenSharing ? "Sharing Screen" : "Share Screen"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEndAndComplete}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              {session ? "✓ Complete Exchange & Settle" : "✓ Finish Circle Session"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
