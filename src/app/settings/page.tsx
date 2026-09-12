"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { LearningMethod } from "@/types";

type SettingsTab = "profile" | "learning" | "notifications" | "security" | "data";

export default function SettingsPage() {
  const {
    currentUser,
    updateProfile,
    theme,
    toggleTheme,
    resetToDefaultData,
    showToast,
    authProvider,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [location, setLocation] = useState(currentUser?.location || "");
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(currentUser?.githubUrl || "");

  // Learning Form State
  const [weeklyHours, setWeeklyHours] = useState(currentUser?.weeklyHours || 5);
  const [preferredMethods, setPreferredMethods] = useState<LearningMethod[]>(
    currentUser?.preferredMethods || ["video", "chat", "project_based"]
  );

  // Track which user's data we've hydrated into form fields
  const [formOwnerId, setFormOwnerId] = useState<string | undefined>(currentUser?.id);

// Notification toggles
const [emailAlerts, setEmailAlerts] = useState(true);
const [sessionReminders, setSessionReminders] = useState(true);
const [matchAlerts, setMatchAlerts] = useState(true);
const [communityUpdates, setCommunityUpdates] = useState(false);
const [notifOwnerId, setNotifOwnerId] = useState<string | undefined>(currentUser?.id);

  // Derive profile inputs from currentUser when user changes (adjust state during render)
  if (currentUser && formOwnerId !== currentUser.id) {
    setFormOwnerId(currentUser.id);
    setName(currentUser.name || "");
    setBio(currentUser.bio || "");
    setLocation(currentUser.location || "");
    setLinkedinUrl(currentUser.linkedinUrl || "");
    setGithubUrl(currentUser.githubUrl || "");
    setWeeklyHours(currentUser.weeklyHours || 5);
    if (currentUser.preferredMethods) {
      setPreferredMethods(currentUser.preferredMethods);
    }
    return null;
  }

  // Hydrate notification preferences for the active user (adjust state during render)
  if (currentUser && notifOwnerId !== currentUser.id) {
    setNotifOwnerId(currentUser.id);
    try {
      const raw = window.localStorage.getItem(`synapse_notif_prefs_${currentUser.id}`);
      if (raw) {
        const prefs = JSON.parse(raw) as { email?: boolean; reminders?: boolean; matches?: boolean; community?: boolean };
        setEmailAlerts(prefs.email ?? true);
        setSessionReminders(prefs.reminders ?? true);
        setMatchAlerts(prefs.matches ?? true);
        setCommunityUpdates(prefs.community ?? false);
      }
    } catch {}
    return null;
  }

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Please sign in to view Settings</h2>
        <Link href="/login" className="mt-4 inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      linkedinUrl: linkedinUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      isLinkedInVerified: currentUser.isLinkedInVerified,
      isGitHubVerified: currentUser.isGitHubVerified,
    });
    showToast("Profile settings saved successfully", "success");
  };

  const handleSaveLearning = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      weeklyHours: Number(weeklyHours),
      preferredMethods,
    });
    showToast("Learning preferences updated", "success");
  };

  const toggleMethod = (method: LearningMethod) => {
    setPreferredMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleSaveNotifications = () => {
    if (!currentUser) return;
    try {
      window.localStorage.setItem(
        `synapse_notif_prefs_${currentUser.id}`,
        JSON.stringify({
          email: emailAlerts,
          reminders: sessionReminders,
          matches: matchAlerts,
          community: communityUpdates,
        })
      );
      showToast("Notification preferences saved", "success");
    } catch {
      showToast("Could not save notification preferences", "error");
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `synapselearn-${currentUser.name.toLowerCase().replace(/\s+/g, "_")}-data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Profile portfolio exported as JSON", "success");
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all SynapseLearn data to the default demo state? Custom skills, sessions, and messages will be reset.")) {
      resetToDefaultData();
    }
  };

  return (
    <div className="space-y-6 py-3 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>⚙️ Account & Platform Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal details, learning commitment, notifications, and security preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-semibold overflow-x-auto">
        {[
          { id: "profile", label: "👤 Profile & Bio" },
          { id: "learning", label: "🎯 Learning Preferences" },
          { id: "notifications", label: "🔔 Notifications" },
          { id: "security", label: "🔒 Security & Login" },
          { id: "data", label: "💾 Data & System" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Bio */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
            <Image
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`}
              alt={currentUser.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md"
            />
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{currentUser.name}</h3>
              <p className="text-xs text-gray-400">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {currentUser.role || "Member"}
                </span>
                {currentUser.isLinkedInVerified && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    LinkedIn Verified ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or London, UK"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio / Headline</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other learners and mentors about your background and goals..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Learning Preferences */}
      {activeTab === "learning" && (
        <form onSubmit={handleSaveLearning} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Learning Rhythm & Format</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Customize how many hours you dedicate and which session formats work best for you.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Weekly Learning & Teaching Commitment: <strong className="text-indigo-600">{weeklyHours} hours/week</strong>
            </label>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>1 hr (Casual)</span>
              <span>10 hrs (Dedicated)</span>
              <span>25 hrs (Intensive)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Preferred Learning & Exchange Formats
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: "video", label: "📹 1-on-1 Video Call" },
                { id: "chat", label: "💬 Async Chat & Code Review" },
                { id: "project_based", label: "🛠️ Hands-on Project Collaboration" },
                { id: "voice", label: "🎙️ Voice Audio Session" },
                { id: "screen_share", label: "🖥️ Screen Sharing & Pair Coding" },
                { id: "group", label: "👥 Group Room Study Circles" },
              ].map((fmt) => {
                const isSelected = preferredMethods.includes(fmt.id as LearningMethod);
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => toggleMethod(fmt.id as LearningMethod)}
                    className={`p-3 rounded-2xl border text-xs font-medium text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                        : "bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {fmt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === "notifications" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Notification Settings</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Control when and how SynapseLearn notifies you about exchanges, sessions, and mentors.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "email",
                title: "Email Notifications",
                desc: "Receive summaries of new messages and connection requests in your inbox.",
                val: emailAlerts,
                set: setEmailAlerts,
              },
              {
                id: "reminders",
                title: "Scheduled Session Reminders",
                desc: "Get notified 15 minutes before any booked exchange or room begins.",
                val: sessionReminders,
                set: setSessionReminders,
              },
              {
                id: "matches",
                title: "New AI Match Alerts",
                desc: "Notify me when a peer who teaches my desired skill joins the platform.",
                val: matchAlerts,
                set: setMatchAlerts,
              },
              {
                id: "community",
                title: "Weekly Learning Digest",
                desc: "Receive curated community highlights and trending skills once a week.",
                val: communityUpdates,
                set: setCommunityUpdates,
              },
            ].map((n) => (
              <div key={n.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700">
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white">{n.title}</h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400">{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={n.val}
                  onChange={(e) => n.set(e.target.checked)}
                  aria-label={n.title}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="pt-1 flex justify-end">
            <button
              onClick={handleSaveNotifications}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Save Preferences ➔
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Login */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Login & Authentication</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Passwords are managed by your identity provider, not stored on SynapseLearn.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700">
              <div>
                <div className="font-bold text-xs text-gray-900 dark:text-white">
                  {authProvider === "google"
                    ? "Google Account"
                    : authProvider === "password"
                      ? "Email & Password Account"
                      : "SynapseLearn Demo Session"}
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  {currentUser?.email || "Signed in as a demo persona"}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  authProvider === "google"
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : authProvider === "password"
                      ? "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {authProvider === "google"
                  ? "Google Verified ✓"
                  : authProvider === "password"
                    ? "Password Account"
                    : "Demo Mode"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
              <p className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">🔒 Secure sign-in</p>
              <p>
                {authProvider === "password"
                  ? "You are signed in with an email & password account. Passwords are salted and hashed with PBKDF2-SHA256 before storage — SynapseLearn never stores plaintext passwords."
                  : "To use a real account, sign in with your email & password or Google on the "}
                {authProvider !== "password" && (
                  <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Sign In
                  </Link>
                )}
                {authProvider === "password"
                  ? " Reset your password any time from the "
                  : " page."}
                {authProvider === "password" && (
                  <Link href="/forgot-password" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Forgot Password
                  </Link>
                )}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Tab 5: Data & System */}
      {activeTab === "data" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Data Portability & Cache</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Export your personal learning portfolio or reset local cache to clean demo data.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white">Export Learning Data</h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">Download your skills, achievements, and session history as JSON.</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-600 text-xs font-bold cursor-pointer"
            >
              📥 Export JSON
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">Reset Local Demo State</h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">Resets localStorage and restores all demo personas, catalog skills, and rooms.</p>
            </div>
            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              🔄 Reset State
            </button>
          </div>
        </div>
      )}

      {/* Interface & Appearance — always visible */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">🎨 Interface & Appearance</h3>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/70 dark:border-gray-700">
          <div>
            <div className="font-bold text-xs text-gray-900 dark:text-white">Theme Mode: {theme === "dark" ? "Dark Mode" : "Light Mode"}</div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Toggle between high-contrast light and dark appearance.</p>
          </div>
          <button
            onClick={toggleTheme}
            data-testid="settings-theme-toggle"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
          >
            Switch to {theme === "dark" ? "Light Mode ☀️" : "Dark Mode 🌙"}
          </button>
        </div>
      </div>
    </div>
  );
}
