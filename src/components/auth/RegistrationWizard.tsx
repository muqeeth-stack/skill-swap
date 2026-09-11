"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { SKILL_CATEGORIES_METADATA } from "@/types";
import { SkillCategory, SkillLevel, UserSkill } from "@/types";

export function RegistrationWizard() {
  const router = useRouter();
  const { completeRegistration } = useApp();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Account Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("San Francisco, CA");

  // Step 2: Skills to Teach
  const [offeredCategory, setOfferedCategory] = useState(SKILL_CATEGORIES_METADATA[0].id);
  const [offeredSkillName, setOfferedSkillName] = useState("Cricket Batting & Bowling");
  const [offeredLevel, setOfferedLevel] = useState<SkillLevel>("Advanced");
  const [offeredYears, setOfferedYears] = useState(4);
  const [offeredSkillsList, setOfferedSkillsList] = useState<UserSkill[]>([
    { name: "Cricket Batting & Bowling", category: "sports", level: "Advanced", yearsOfExp: 4 }
  ]);

  // Step 3: Skills to Learn
  const [desiredCategory, setDesiredCategory] = useState(SKILL_CATEGORIES_METADATA[1].id);
  const [desiredSkillName, setDesiredSkillName] = useState("Full Stack React & Next.js");
  const [desiredCurrentLevel, setDesiredCurrentLevel] = useState<SkillLevel>("Beginner");
  const [desiredSkillsList, setDesiredSkillsList] = useState<UserSkill[]>([
    { name: "Full Stack React & Next.js", category: "technology", level: "Beginner", yearsOfExp: 1 }
  ]);

  // Step 4: Preferences & Availability
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [timeSlots, setTimeSlots] = useState<("morning" | "afternoon" | "evening" | "night")[]>(["evening", "morning"]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [newLanguage, setNewLanguage] = useState("");

  // Step 5: Goals
  const [primaryGoal, setPrimaryGoal] = useState("Build production portfolio & exchange real skills");

  const handleAddOffered = () => {
    if (!offeredSkillName) return;
    setOfferedSkillsList([...offeredSkillsList, { name: offeredSkillName, category: offeredCategory, level: offeredLevel, yearsOfExp: offeredYears }]);
  };

  const handleAddDesired = () => {
    if (!desiredSkillName) return;
    setDesiredSkillsList([...desiredSkillsList, { name: desiredSkillName, category: desiredCategory, level: desiredCurrentLevel, yearsOfExp: 0 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeRegistration({
      name: name || "Alex Rivera",
      email: email || "alex.rivera@example.com",
      bio: bio || "Passionate about competitive sports and building web products. Love peer skill exchanges!",
      location,
      skillsTeach: offeredSkillsList,
      skillsLearn: desiredSkillsList,
      preferredLanguages: languages,
      weeklyHours: hoursPerWeek,
      availableTimes: timeSlots,
      learningGoals: [primaryGoal],
    });
    router.push("/matches");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-10 max-w-2xl mx-auto">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
          <span>STEP {step} OF {totalSteps}</span>
          <span className="text-indigo-600 dark:text-indigo-400">{Math.round((step / totalSteps) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Your SynapseLearn Profile</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Join our global network of learners and teachers.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  data-testid="reg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  data-testid="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Location / City</label>
              <input
                type="text"
                data-testid="reg-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">About You (Bio)</label>
              <textarea
                data-testid="reg-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Tell other learners about your passions, learning philosophy, and skills you want to exchange."
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">What Can You Teach or Share?</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Add skills you are proficient in (Tech, Sports, Arts, Languages, etc.)</p>

            <div className="space-y-2 mb-4">
              {offeredSkillsList.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs">
                  <div className="font-semibold text-indigo-900 dark:text-indigo-200">
                    {s.name} <span className="font-normal text-indigo-600">({s.level} • {s.yearsOfExp} yrs)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOfferedSkillsList(offeredSkillsList.filter((_, i) => i !== idx))}
                    aria-label="Remove skill"
                    className="text-rose-500 font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Category</label>
                  <select
                    value={offeredCategory}
                    onChange={(e) => setOfferedCategory(e.target.value as SkillCategory)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  >
                    {SKILL_CATEGORIES_METADATA.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Skill Name</label>
                  <input
                    type="text"
                    value={offeredSkillName}
                    onChange={(e) => setOfferedSkillName(e.target.value)}
                    placeholder="e.g. Cricket Fast Bowling"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Proficiency Level</label>
                  <select
                    value={offeredLevel}
                    onChange={(e) => setOfferedLevel(e.target.value as SkillLevel)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={offeredYears}
                    onChange={(e) => setOfferedYears(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddOffered}
                className="w-full py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-800 dark:text-gray-200 rounded-xl cursor-pointer"
              >
                + Add This Skill
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">What Do You Want to Learn?</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Our AI matching engine will match you with partners who teach these.</p>

            <div className="space-y-2 mb-4">
              {desiredSkillsList.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 rounded-xl text-xs">
                  <div className="font-semibold text-purple-900 dark:text-purple-200">
                    {s.name} <span className="font-normal text-purple-600">({s.level})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDesiredSkillsList(desiredSkillsList.filter((_, i) => i !== idx))}
                    aria-label="Remove skill"
                    className="text-rose-500 font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Category</label>
                <select
                  value={desiredCategory}
                  onChange={(e) => setDesiredCategory(e.target.value as SkillCategory)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                >
                  {SKILL_CATEGORIES_METADATA.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Target Skill Name</label>
                  <input
                    type="text"
                    value={desiredSkillName}
                    onChange={(e) => setDesiredSkillName(e.target.value)}
                    placeholder="e.g. Next.js, Badminton, Spanish"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Current Skill Level</label>
                  <select
                    value={desiredCurrentLevel}
                    onChange={(e) => setDesiredCurrentLevel(e.target.value as SkillLevel)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddDesired}
                className="w-full py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-800 dark:text-gray-200 rounded-xl cursor-pointer"
              >
                + Add Learning Goal
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule & Availability</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Help the AI match you with partners in your schedule.</p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Hours Per Week</label>
              <input
                type="number"
                min="1"
                max="20"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Preferred Time Windows</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {([
                  { id: "morning", label: "Mornings" },
                  { id: "afternoon", label: "Afternoons" },
                  { id: "evening", label: "Evenings" },
                  { id: "night", label: "Nights" },
                ] as const).map((slot) => {
                  const checked = timeSlots.includes(slot.id);
                  return (
                    <label
                      key={slot.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                        checked
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-semibold"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setTimeSlots(timeSlots.filter((s) => s !== slot.id));
                          } else {
                            setTimeSlots([...timeSlots, slot.id]);
                          }
                        }}
                      />
                      <span>{slot.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Preferred Languages</label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-lg text-xs font-semibold"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => setLanguages(languages.filter((l) => l !== lang))}
                      className="text-rose-500 font-bold cursor-pointer"
                      aria-label={`Remove ${lang}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const lang = newLanguage.trim();
                      if (lang && !languages.includes(lang)) {
                        setLanguages([...languages, lang]);
                        setNewLanguage("");
                      }
                    }
                  }}
                  aria-label="Add a language"
                  placeholder="e.g. Spanish, Hindi, French"
                  className="flex-1 px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const lang = newLanguage.trim();
                    if (lang && !languages.includes(lang)) {
                      setLanguages([...languages, lang]);
                      setNewLanguage("");
                    }
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Primary Outcome</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Goal Description</label>
              <textarea
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                rows={3}
                placeholder="e.g. Master React and build full-stack web applications while sharing cricket bowling mechanics."
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
                required
              />
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-700 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
          >
            {step === totalSteps ? "Complete & View AI Matches ➔" : "Continue Next ➔"}
          </button>
        </div>
      </form>
    </div>
  );
}
