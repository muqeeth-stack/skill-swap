"use client";

import React, { useState } from "react";
import { User, UserSkill, SkillLevel } from "@/types";
import { useApp } from "@/context/AppContext";

interface ProfileEditorModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditorModal({ user, isOpen, onClose }: ProfileEditorModalProps) {
  const { updateProfile } = useApp();

  const [activeTab, setActiveTab] = useState<"general" | "teach" | "learn" | "goals" | "availability">("general");
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [weeklyHours, setWeeklyHours] = useState(user.weeklyHours || 4);

  // Skills
  const [skillsTeach, setSkillsTeach] = useState<UserSkill[]>(user.skillsTeach || []);
  const [skillsLearn, setSkillsLearn] = useState<UserSkill[]>(user.skillsLearn || []);

  // New Teach Skill form inputs
  const [newTeachName, setNewTeachName] = useState("");
  const [newTeachCat, setNewTeachCat] = useState("technology");
  const [newTeachLevel, setNewTeachLevel] = useState<SkillLevel>("Advanced");
  const [newTeachYears, setNewTeachYears] = useState(3);

  // New Learn Skill form inputs
  const [newLearnName, setNewLearnName] = useState("");
  const [newLearnCat, setNewLearnCat] = useState("technology");
  const [newLearnLevel, setNewLearnLevel] = useState<SkillLevel>("Beginner");

  // Goals & Interests
  const [learningGoals, setLearningGoals] = useState<string[]>(user.learningGoals || []);
  const [newGoal, setNewGoal] = useState("");
  const [interests, setInterests] = useState<string[]>(user.interests || []);
  const [newInterest, setNewInterest] = useState("");
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(user.preferredLanguages || ["English"]);
  const [newLang, setNewLang] = useState("");

  // Availability
  const [availableDays, setAvailableDays] = useState<number[]>(user.availableDays || [1, 2, 3, 4, 5]);
  const [availableTimes, setAvailableTimes] = useState<("morning" | "afternoon" | "evening" | "night")[]>(
    user.availableTimes || ["evening"]
  );

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddTeachSkill = () => {
    if (!newTeachName.trim()) return;
    const newSkill: UserSkill = {
      name: newTeachName.trim(),
      category: newTeachCat,
      level: newTeachLevel,
      yearsOfExp: Number(newTeachYears),
    };
    setSkillsTeach([...skillsTeach, newSkill]);
    setNewTeachName("");
  };

  const handleRemoveTeachSkill = (index: number) => {
    setSkillsTeach(skillsTeach.filter((_, i) => i !== index));
  };

  const handleAddLearnSkill = () => {
    if (!newLearnName.trim()) return;
    const newSkill: UserSkill = {
      name: newLearnName.trim(),
      category: newLearnCat,
      level: newLearnLevel,
    };
    setSkillsLearn([...skillsLearn, newSkill]);
    setNewLearnName("");
  };

  const handleRemoveLearnSkill = (index: number) => {
    setSkillsLearn(skillsLearn.filter((_, i) => i !== index));
  };

  const handleAddGoal = () => {
    if (!newGoal.trim() || learningGoals.includes(newGoal.trim())) return;
    setLearningGoals([...learningGoals, newGoal.trim()]);
    setNewGoal("");
  };

  const handleRemoveGoal = (goal: string) => {
    setLearningGoals(learningGoals.filter((g) => g !== goal));
  };

  const handleAddInterest = () => {
    if (!newInterest.trim() || interests.includes(newInterest.trim())) return;
    setInterests([...interests, newInterest.trim()]);
    setNewInterest("");
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleAddLang = () => {
    if (!newLang.trim() || preferredLanguages.includes(newLang.trim())) return;
    setPreferredLanguages([...preferredLanguages, newLang.trim()]);
    setNewLang("");
  };

  const handleRemoveLang = (item: string) => {
    setPreferredLanguages(preferredLanguages.filter((l) => l !== item));
  };

  const toggleDay = (day: number) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day].sort());
    }
  };

  const toggleTime = (time: "morning" | "afternoon" | "evening" | "night") => {
    if (availableTimes.includes(time)) {
      setAvailableTimes(availableTimes.filter((t) => t !== time));
    } else {
      setAvailableTimes([...availableTimes, time]);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    updateProfile({
      name: name.trim() || user.name,
      bio: bio.trim() || user.bio,
      location: location.trim() || user.location,
      avatar: avatar.trim() || user.avatar,
      weeklyHours: Number(weeklyHours) || 4,
      skillsTeach,
      skillsLearn,
      learningGoals,
      interests,
      preferredLanguages,
      availableDays,
      availableTimes,
    });

    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 400);
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✏️</span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                Edit Your Synapse Profile
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Update your skills, goals, availability, and barter preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-gray-100 dark:border-gray-800 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "general"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            👤 General Info
          </button>
          <button
            onClick={() => setActiveTab("teach")}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "teach"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🎓 Skills to Teach ({skillsTeach.length})
          </button>
          <button
            onClick={() => setActiveTab("learn")}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "learn"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🎯 Skills to Learn ({skillsLearn.length})
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "goals"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            💡 Goals & Interests
          </button>
          <button
            onClick={() => setActiveTab("availability")}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "availability"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            📅 Availability
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Bio & Introduction</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Weekly Available Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Teach Skills Tab */}
          {activeTab === "teach" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Current Teaching Skills</h3>
                <div className="space-y-2">
                  {skillsTeach.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{skill.name}</div>
                        <div className="text-[10px] text-gray-600">
                          {skill.category} · {skill.level} Tier · {skill.yearsOfExp || 1} yrs exp
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeachSkill(idx)}
                        className="px-2 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Teach Skill */}
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <h4 className="font-bold text-indigo-700 dark:text-indigo-300">Add Skill You Can Teach</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    aria-label="Skill name"
                    placeholder="Skill Name (e.g. React, Fast Bowling)"
                    value={newTeachName}
                    onChange={(e) => setNewTeachName(e.target.value)}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                  <select
                    value={newTeachCat}
                    onChange={(e) => setNewTeachCat(e.target.value)}
                    aria-label="Category"
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    <option value="technology">Technology</option>
                    <option value="sports">Sports & Fitness</option>
                    <option value="creative">Creative & Arts</option>
                    <option value="languages">Languages</option>
                    <option value="business">Business</option>
                    <option value="academics">Academics</option>
                    <option value="life_skills">Life Skills</option>
                  </select>
                  <select
                    value={newTeachLevel}
                    onChange={(e) => setNewTeachLevel(e.target.value as SkillLevel)}
                    aria-label="Proficiency level"
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    placeholder="Years of Exp"
                    aria-label="Years of experience"
                    value={newTeachYears}
                    onChange={(e) => setNewTeachYears(Number(e.target.value))}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTeachSkill}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer transition-all"
                >
                  + Add Teaching Skill
                </button>
              </div>
            </div>
          )}

          {/* Learn Skills Tab */}
          {activeTab === "learn" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Current Target Skills</h3>
                <div className="space-y-2">
                  {skillsLearn.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-purple-950 dark:text-purple-200">{skill.name}</div>
                        <div className="text-[10px] text-purple-600 dark:text-purple-400">
                          {skill.category} · Target Level: {skill.level}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveLearnSkill(idx)}
                        className="px-2 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Learn Skill */}
              <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/50 space-y-3">
                <h4 className="font-bold text-purple-800 dark:text-purple-300">Add Skill You Desire to Learn</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    aria-label="Skill name"
                    placeholder="Skill Name (e.g. Python, Video Editing)"
                    value={newLearnName}
                    onChange={(e) => setNewLearnName(e.target.value)}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                  <select
                    value={newLearnCat}
                    onChange={(e) => setNewLearnCat(e.target.value)}
                    aria-label="Category"
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    <option value="technology">Technology</option>
                    <option value="sports">Sports & Fitness</option>
                    <option value="creative">Creative & Arts</option>
                    <option value="languages">Languages</option>
                    <option value="business">Business</option>
                    <option value="academics">Academics</option>
                    <option value="life_skills">Life Skills</option>
                  </select>
                  <select
                    value={newLearnLevel}
                    onChange={(e) => setNewLearnLevel(e.target.value as SkillLevel)}
                    aria-label="Target level"
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddLearnSkill}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold cursor-pointer transition-all"
                >
                  + Add Target Skill
                </button>
              </div>
            </div>
          )}

          {/* Goals & Interests Tab */}
          {activeTab === "goals" && (
            <div className="space-y-4 text-xs">
              {/* Learning Goals */}
              <div className="space-y-2">
                <label className="font-bold text-gray-800 dark:text-gray-200">Learning Goals</label>
                <div className="flex flex-wrap gap-2">
                  {learningGoals.map((goal) => (
                    <span
                      key={goal}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full font-medium flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
                    >
                      <span>{goal}</span>
                      <button onClick={() => handleRemoveGoal(goal)} aria-label={`Remove goal ${goal}`} className="text-gray-400 hover:text-rose-500">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add a new milestone or goal..."
                    aria-label="New learning goal"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Add Goal
                  </button>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <label className="font-bold text-gray-800 dark:text-gray-200">Hobbies & Interests</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium flex items-center gap-1.5 border border-gray-200 dark:border-gray-700"
                    >
                      <span>{item}</span>
                      <button onClick={() => handleRemoveInterest(item)} aria-label={`Remove interest ${item}`} className="text-gray-400 hover:text-rose-500">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add an interest..."
                    aria-label="New interest"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Preferred Languages */}
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <label className="font-bold text-gray-800 dark:text-gray-200">Spoken Languages</label>
                <div className="flex flex-wrap gap-2">
                  {preferredLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full font-medium flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800"
                    >
                      <span>{lang}</span>
                      <button onClick={() => handleRemoveLang(lang)} aria-label={`Remove language ${lang}`} className="text-gray-400 hover:text-rose-500">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add language (e.g. Spanish, Hindi)..."
                    aria-label="New language"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddLang}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === "availability" && (
            <div className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-gray-800 dark:text-gray-200">Available Days of the Week</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {dayNames.map((dName, dayIdx) => {
                    const isSelected = availableDays.includes(dayIdx);
                    return (
                      <button
                        key={dName}
                        type="button"
                        onClick={() => toggleDay(dayIdx)}
                        className={`py-2 rounded-xl font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {dName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <label className="font-bold text-gray-800 dark:text-gray-200">Preferred Session Time Slots</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["morning", "afternoon", "evening", "night"] as const).map((tSlot) => {
                    const isSelected = availableTimes.includes(tSlot);
                    return (
                      <button
                        key={tSlot}
                        type="button"
                        onClick={() => toggleTime(tSlot)}
                        className={`p-2.5 rounded-xl font-bold capitalize text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {tSlot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving Profile..." : "Save Changes ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
