"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Recording, VideoProgress } from "@/types";
import { useApp } from "@/context/AppContext";
import { daysFromNowISO } from "@/lib/dateUtils";

interface VideoPlayerModalProps {
  recording: Recording;
  onClose: () => void;
}

export function VideoPlayerModal({ recording, onClose }: VideoPlayerModalProps) {
  const { allUsers, videoProgress, updateVideoProgress, showToast, bookSession } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recording.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "drill" | "instructor">("overview");
  const [studentNotes, setStudentNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [hasPromptedResume, setHasPromptedResume] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const teacher = allUsers.find((u) => u.id === recording.teacherId);
  const existingProgress: VideoProgress | undefined = videoProgress[recording.id];
  const isCompleted = existingProgress?.completed ?? false;

  // Load notes from localStorage when recording changes (adjust state during render)
  const [loadedNotesForRecording, setLoadedNotesForRecording] = useState<string | null>(null);
  if (loadedNotesForRecording !== recording.id) {
    setLoadedNotesForRecording(recording.id);
    try {
      const saved = localStorage.getItem(`synapse_video_notes_${recording.id}`);
      if (saved) setStudentNotes(saved);
    } catch {}
  }

  // Handle resume prompt on initial mount if progress exists (one-time check)
  const [resumeChecked, setResumeChecked] = useState(false);
  if (!resumeChecked) {
    setResumeChecked(true);
    if (existingProgress && existingProgress.currentTime > 5 && !existingProgress.completed) {
      setHasPromptedResume(true);
    }
  }

  const handleResume = () => {
    if (videoRef.current && existingProgress) {
      videoRef.current.currentTime = existingProgress.currentTime;
      videoRef.current.play().catch(() => {
        // Fallback for headless environments or autoplay policies
      });
      setIsPlaying(true);
      setHasPromptedResume(false);
      showToast(`Resumed from ${formatTime(existingProgress.currentTime)}`, "info");
    }
  };

  const handleDismissResume = () => {
    setHasPromptedResume(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      // Save progress on pause
      updateVideoProgress(recording.id, videoRef.current.currentTime, videoRef.current.duration || duration);
    } else {
      videoRef.current.play().catch(() => {
        // Fallback for headless environments or autoplay policies
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    const dur = videoRef.current.duration || duration;
    if (dur && dur > 0) {
      setDuration(dur);
    }
    // Save progress periodically (e.g. every 5 seconds)
    if (Math.floor(cur) % 5 === 0) {
      updateVideoProgress(recording.id, cur, dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (dur && !isNaN(dur) && dur > 0) {
      setDuration(dur);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      updateVideoProgress(recording.id, targetTime, duration);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen?.().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen?.().catch((err) => console.warn(err));
    }
  };

  const handleMarkCompleted = () => {
    const dur = duration > 0 ? duration : recording.duration || 600;
    updateVideoProgress(recording.id, dur, dur, true);
    showToast("Masterclass marked as completed! 25 XP earned.", "success");
  };

  const handleSaveNotes = () => {
    try {
      localStorage.setItem(`synapse_video_notes_${recording.id}`, studentNotes);
      setNotesSaved(true);
      showToast("Practice notes saved to local notebook!", "success");
      setTimeout(() => setNotesSaved(false), 3000);
    } catch {}
  };

  const handleQuickBook = () => {
    if (!teacher) return;
    const tomorrow = daysFromNowISO(1);
    bookSession(teacher.id, recording.skill, undefined, tomorrow, 60, "1on1", `Follow-up 1-on-1 after watching ${recording.title}`);
    onClose();
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3 truncate">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              {recording.category}
            </span>
            <h2 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white truncate">
              {recording.title}
            </h2>
          </div>
          <button
            onClick={() => {
              if (videoRef.current) {
                updateVideoProgress(recording.id, videoRef.current.currentTime, videoRef.current.duration || duration);
              }
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer shrink-0"
            title="Close video viewer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

{/* Video Player Container */}
          <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
            {videoError || !recording.videoUrl ? (
              <div className="flex flex-col items-center justify-center text-center p-6 text-white/70">
                <div className="text-5xl mb-3">🎬</div>
                <div className="text-sm font-semibold mb-1">Video placeholder</div>
                <p className="text-xs text-white/50 max-w-sm">
                  The masterclass lecture video is not available in this build. You can still read the lesson overview, take notes, and book a live session with the instructor below.
                </p>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={recording.videoUrl}
                poster={recording.thumbnailUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  handleMarkCompleted();
                }}
                onError={() => {
                  setVideoError(true);
                }}
                playsInline
              />
            )}

            {/* Resume overlay banner if user left off mid-way */}
            {!videoError && hasPromptedResume && existingProgress && (
            <div className="absolute top-4 left-4 right-4 z-20 bg-indigo-950/90 border border-indigo-500/50 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">⏱️</span>
                <div>
                  <div className="text-xs font-bold text-indigo-200">You previously watched this masterclass</div>
                  <div className="text-sm font-semibold">Resume from {formatTime(existingProgress.currentTime)}?</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResume}
                  className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Resume ▶
                </button>
                <button
                  onClick={handleDismissResume}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-indigo-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* Center Big Play Button Overlay when paused */}
          {!videoError && !isPlaying && !hasPromptedResume && (
            <button
              onClick={togglePlay}
              aria-label="Play video"
              className="absolute z-10 w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center text-2xl shadow-xl hover:scale-105 transition-all cursor-pointer"
              title="Play Video"
            >
              ▶
            </button>
          )}

          {/* Controls Bar Overlay */}
          {!videoError && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-95 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
            {/* Seek Bar */}
            <div className="w-full flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Seek"
                className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
                title="Seek"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white text-xs gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>

                <div className="text-gray-300 font-mono text-[11px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Volume & Mute */}
                <div className="hidden sm:flex items-center gap-1.5 ml-2">
                  <button onClick={toggleMute} aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"} className="hover:text-indigo-400 cursor-pointer text-sm">
                    {isMuted || volume === 0 ? "🔇" : "🔊"}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume"
                    className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    title="Volume"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Playback Speed Selector */}
                <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-0.5">
                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                        playbackSpeed === spd ? "bg-indigo-600 text-white" : "text-gray-300 hover:text-white"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:text-indigo-400 cursor-pointer font-bold"
                  title="Toggle Fullscreen"
                >
                  ⛶ Fullscreen
                </button>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Video Interaction Tabs and Information */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white dark:bg-gray-900">
          {/* Action Row: Progress, Status & Completion */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span>✓ Completed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <span>● In Progress ({duration > 0 ? Math.round((currentTime / duration) * 100) : 0}%)</span>
                </span>
              )}
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400">👁️ {recording.views.toLocaleString()} views</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400">❤️ {recording.likes} likes</span>
            </div>

            <div className="flex items-center gap-2">
              {!isCompleted && (
                <button
                  onClick={handleMarkCompleted}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>✓</span>
                  <span>Mark as Completed</span>
                </button>
              )}
              {teacher && (
                <button
                  onClick={handleQuickBook}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📅</span>
                  <span>Book 1-on-1 with {teacher.name.split(" ")[0]}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Overview & Objectives
            </button>
            <button
              onClick={() => setActiveTab("drill")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "drill"
                  ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Interactive Drill & Notes
            </button>
            <button
              onClick={() => setActiveTab("instructor")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "instructor"
                  ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Instructor & Booking
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {recording.description}
              </p>

              {recording.learningObjectives && recording.learningObjectives.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <span>🎯</span> Key Learning Objectives
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                    {recording.learningObjectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold mt-0.5">✓</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recording.tags && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {recording.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Interactive Drill & Student Notes */}
          {activeTab === "drill" && (
            <div className="space-y-4">
              {recording.practicePrompt && (
                <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-800/50 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <span>⚡</span> Hands-On Practice Challenge
                  </h4>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    {recording.practicePrompt}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white">
                  <span>Your Study Notebook & Timestamped Reflections</span>
                  {notesSaved && <span className="text-emerald-500 font-bold">Saved to notebook ✓</span>}
                </div>
                <textarea
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  aria-label="Study notebook"
                  placeholder={`Write your key takeaways, timestamp notes (e.g. 03:20 cover drive elbow angle), and practice drill outcomes here...`}
                  rows={5}
                  className="w-full p-3.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Instructor & 1-on-1 Booking */}
          {activeTab === "instructor" && teacher && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <Image
                  src={teacher.avatar}
                  alt={teacher.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{teacher.name}</h4>
                    <span className="text-xs text-amber-500 font-bold">⭐ {teacher.rating.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{teacher.bio}</p>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                    {teacher.totalSessionsTaught} sessions taught · {teacher.completedExchanges} successful exchanges
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleQuickBook}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold text-center shadow-xs transition-all cursor-pointer"
                >
                  Book 1-on-1 Practice Session
                </button>
                <Link
                  href={`/profile?id=${teacher.id}`}
                  onClick={onClose}
                  className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-xs font-bold text-center transition-all"
                >
                  View Full Mentor Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
