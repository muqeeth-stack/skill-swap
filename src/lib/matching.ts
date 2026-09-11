import { User, MatchScore, MatchWeights } from "@/types";

export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  skillExchange: 0.35,
  skillLevel: 0.15,
  learningGoals: 0.15,
  availability: 0.15,
  preferences: 0.10,
  languages: 0.05,
  interests: 0.05,
};

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function calculateCompatibility(
  currentUser: User,
  targetUser: User,
  weights: MatchWeights = DEFAULT_MATCH_WEIGHTS
): MatchScore {
  if (currentUser.id === targetUser.id) {
    return {
      targetUser,
      overallScore: 0,
      skillExchangeScore: 0,
      levelScore: 0,
      goalScore: 0,
      availabilityScore: 0,
      preferencesScore: 0,
      languageScore: 0,
      interestScore: 0,
      reasons: [],
      matchType: "peer_partner",
    };
  }

  const reasons: string[] = [];

  // 1. Skill Exchange Compatibility (35%)
  const targetWants = targetUser.skillsLearn.map((s) => s.name.toLowerCase());
  const targetTeaches = targetUser.skillsTeach.map((s) => s.name.toLowerCase());

  // Can target teach what current user wants?
  const targetCanTeachMe = currentUser.skillsLearn.filter((s) =>
    targetTeaches.some((t) => t.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(t))
  );

  // Can current user teach what target wants?
  const iCanTeachTarget = currentUser.skillsTeach.filter((s) =>
    targetWants.some((t) => t.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(t))
  );

  let skillExchangeScore = 0.3; // baseline for general community synergy
  if (targetCanTeachMe.length > 0 && iCanTeachTarget.length > 0) {
    skillExchangeScore = 1.0;
    const myTeach = iCanTeachTarget[0].name;
    const targetTeach = targetCanTeachMe[0].name;
    reasons.push(`Perfect 2-way skill exchange: You teach ${myTeach} ⇄ ${targetUser.name.split(" ")[0]} teaches ${targetTeach}`);
  } else if (targetCanTeachMe.length > 0) {
    skillExchangeScore = 0.85;
    reasons.push(`${targetUser.name.split(" ")[0]} can mentor you in ${targetCanTeachMe.map((s) => s.name).join(", ")}`);
  } else if (iCanTeachTarget.length > 0) {
    skillExchangeScore = 0.75;
    reasons.push(`You can mentor ${targetUser.name.split(" ")[0]} in ${iCanTeachTarget.map((s) => s.name).join(", ")}`);
  } else {
    // Check category overlap
    const userCategories = new Set([
      ...currentUser.skillsTeach.map((s) => s.category),
      ...currentUser.skillsLearn.map((s) => s.category),
    ]);
    const targetCategories = new Set([
      ...targetUser.skillsTeach.map((s) => s.category),
      ...targetUser.skillsLearn.map((s) => s.category),
    ]);
    const sharedCategories = Array.from(userCategories).filter((c) => targetCategories.has(c));
    if (sharedCategories.length > 0) {
      skillExchangeScore = 0.5;
      reasons.push(`Shared domain focus in ${sharedCategories.join(", ")}`);
    }
  }

  // 2. Skill Level Compatibility (15%)
  let levelScore = 0.6;
  const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
  if (targetCanTeachMe.length > 0) {
    const targetTeacherSkill = targetUser.skillsTeach.find((t) =>
      targetCanTeachMe.some((m) => m.name.toLowerCase() === t.name.toLowerCase())
    );
    const myLearnSkill = targetCanTeachMe[0];
    if (targetTeacherSkill) {
      const teacherLvl = levelOrder[targetTeacherSkill.level] || 2;
      const learnerLvl = levelOrder[myLearnSkill.level] || 1;
      if (teacherLvl >= learnerLvl + 1) {
        levelScore = 1.0;
        reasons.push(`Expertise level alignment: ${targetUser.name.split(" ")[0]} is ${targetTeacherSkill.level} level`);
      } else if (teacherLvl >= learnerLvl) {
        levelScore = 0.85;
        reasons.push(`Complementary peer experience level`);
      } else {
        levelScore = 0.65;
      }
    }
  } else {
    levelScore = 0.7;
  }

  // 3. Learning Goals (15%)
  let goalScore = 0.4;
  const userGoalsStr = (currentUser.learningGoals || []).join(" ").toLowerCase();
  const targetGoalsStr = (targetUser.learningGoals || []).join(" ").toLowerCase();
  const goalKeywords = ["build", "master", "career", "practice", "project", "python", "video", "cricket", "spanish", "ai", "figma", "react", "fitness"];
  const matchedKeywords = goalKeywords.filter((k) => userGoalsStr.includes(k) && targetGoalsStr.includes(k));
  if (matchedKeywords.length >= 2) {
    goalScore = 0.95;
    reasons.push(`Aligned learning ambitions: Focused on ${matchedKeywords.slice(0, 2).join(" & ")}`);
  } else if (matchedKeywords.length === 1) {
    goalScore = 0.75;
    reasons.push(`Similar learning goal direction (${matchedKeywords[0]})`);
  } else {
    goalScore = 0.5;
  }

  // 4. Availability Overlap (15%)
  let availabilityScore = 0.3;
  const sharedDays = (currentUser.availableDays || []).filter((d) => (targetUser.availableDays || []).includes(d));
  const sharedTimes = (currentUser.availableTimes || []).filter((t) => (targetUser.availableTimes || []).includes(t));
  if (sharedDays.length >= 2 && sharedTimes.length >= 1) {
    availabilityScore = 1.0;
    const dayNames = sharedDays.slice(0, 2).map((d) => DAY_NAMES[d]).join(" & ");
    reasons.push(`High schedule compatibility on ${dayNames} (${sharedTimes.join(", ")})`);
  } else if (sharedDays.length >= 1) {
    availabilityScore = 0.75;
    const dayName = DAY_NAMES[sharedDays[0]];
    reasons.push(`Matching free days on ${dayName}`);
  } else {
    availabilityScore = 0.45;
  }

  // 5. Learning Preferences (10%)
  let preferencesScore = 0.4;
  const sharedMethods = (currentUser.preferredMethods || []).filter((m) => (targetUser.preferredMethods || []).includes(m));
  if (sharedMethods.length >= 2) {
    preferencesScore = 0.95;
    const formatted = sharedMethods.slice(0, 2).map((m) => m.replace("_", " ")).join(" & ");
    reasons.push(`Preferred learning formats match (${formatted})`);
  } else if (sharedMethods.length === 1) {
    preferencesScore = 0.75;
  } else {
    preferencesScore = 0.5;
  }

  // 6. Language Compatibility (5%)
  let languageScore = 0.4;
  const userLangs = currentUser.preferredLanguages || ["English"];
  const targetLangs = targetUser.preferredLanguages || ["English"];
  const sharedLangs = userLangs.filter((l) => targetLangs.includes(l));
  if (sharedLangs.length > 0) {
    languageScore = 1.0;
    reasons.push(`Fluent communication in ${sharedLangs.join(", ")}`);
  } else {
    languageScore = 0.3;
  }

  // 7. Interests & Topics (5%)
  let interestScore = 0.3;
  const userInterests = currentUser.interests || [];
  const targetInterests = targetUser.interests || [];
  const sharedInterests = userInterests.filter((i) =>
    targetInterests.some((t) => t.toLowerCase() === i.toLowerCase())
  );
  if (sharedInterests.length >= 2) {
    interestScore = 1.0;
    reasons.push(`Shared interests in ${sharedInterests.join(", ")}`);
  } else if (sharedInterests.length === 1) {
    interestScore = 0.75;
    reasons.push(`Mutual interest in ${sharedInterests[0]}`);
  } else {
    interestScore = 0.4;
  }

  // Compute weighted overall score
  const totalWeight =
    weights.skillExchange +
    weights.skillLevel +
    weights.learningGoals +
    weights.availability +
    weights.preferences +
    weights.languages +
    weights.interests;

  const rawWeighted =
    skillExchangeScore * weights.skillExchange +
    levelScore * weights.skillLevel +
    goalScore * weights.learningGoals +
    availabilityScore * weights.availability +
    preferencesScore * weights.preferences +
    languageScore * weights.languages +
    interestScore * weights.interests;

  const normalized = rawWeighted / (totalWeight || 1);
  const overallScore = Math.min(99, Math.max(55, Math.round(normalized * 100)));

  // Determine match type
  let matchType: MatchScore["matchType"] = "peer_partner";
  if (targetCanTeachMe.length > 0 && iCanTeachTarget.length > 0) {
    matchType = "1on1_exchange";
  } else if (targetCanTeachMe.length > 0 && levelScore >= 0.8) {
    matchType = "mentor_match";
  } else if (sharedMethods.includes("group")) {
    matchType = "group_compatible";
  }

  return {
    targetUser,
    overallScore,
    skillExchangeScore: Math.round(skillExchangeScore * 100),
    levelScore: Math.round(levelScore * 100),
    goalScore: Math.round(goalScore * 100),
    availabilityScore: Math.round(availabilityScore * 100),
    preferencesScore: Math.round(preferencesScore * 100),
    languageScore: Math.round(languageScore * 100),
    interestScore: Math.round(interestScore * 100),
    reasons: reasons.slice(0, 4),
    matchType,
  };
}

export function findBestMatches(
  currentUser: User,
  allUsers: User[],
  weights: MatchWeights = DEFAULT_MATCH_WEIGHTS
): MatchScore[] {
  return allUsers
    .filter((u) => u.id !== currentUser.id && !u.isBlocked)
    .map((target) => calculateCompatibility(currentUser, target, weights))
    .sort((a, b) => b.overallScore - a.overallScore);
}

export interface ParsedQuery {
  rawQuery: string;
  teachFilter?: string;
  learnFilter?: string;
  categoryFilter?: string;
  levelFilter?: string;
  availabilityFilter?: string;
  languageFilter?: string;
  isGroupRequest?: boolean;
  intentSummary: string;
}

export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const q = query.toLowerCase().trim();
  const parsed: ParsedQuery = {
    rawQuery: query,
    intentSummary: "Searching matches across SynapseLearn community",
  };

  // Check for dual swap intent: "teach me X and wants to learn Y"
  const teachMeMatch = q.match(/(?:teach(?: me)?|learn)\s+([a-z0-9\s#+.]+?)(?:\s+(?:and|who|in exchange for|wants to learn|wants)\s+([a-z0-9\s#+.]+))?$/i);
  if (teachMeMatch) {
    if (teachMeMatch[1]) parsed.teachFilter = teachMeMatch[1].trim();
    if (teachMeMatch[2]) parsed.learnFilter = teachMeMatch[2].replace(/^(?:wants to learn|learn|wants)\s+/i, "").trim();
  }

  // Check cricket / sports
  if (q.includes("cricket") || q.includes("batting") || q.includes("bowling")) {
    parsed.categoryFilter = "sports";
    parsed.teachFilter = "Cricket";
    parsed.intentSummary = "Looking for Cricket coaches and batting/bowling practice partners";
  } else if (q.includes("football") || q.includes("soccer")) {
    parsed.categoryFilter = "sports";
    parsed.teachFilter = "Football";
    parsed.intentSummary = "Looking for Football teammates and skill training";
  } else if (q.includes("badminton")) {
    parsed.categoryFilter = "sports";
    parsed.teachFilter = "Badminton";
    parsed.intentSummary = "Looking for Badminton coaches and court partners";
  } else if (q.includes("chess")) {
    parsed.categoryFilter = "sports";
    parsed.teachFilter = "Chess";
    parsed.intentSummary = "Looking for Chess masters and sparring partners";
  }

  // Check languages
  if (q.includes("english")) {
    parsed.languageFilter = "English";
    parsed.teachFilter = "English Fluency";
  } else if (q.includes("spanish")) {
    parsed.languageFilter = "Spanish";
    parsed.teachFilter = "Spanish";
  } else if (q.includes("arabic")) {
    parsed.languageFilter = "Arabic";
    parsed.teachFilter = "Arabic";
  }

  // Check days / weekends
  if (q.includes("weekend") || q.includes("saturday") || q.includes("sunday")) {
    parsed.availabilityFilter = "weekends";
    parsed.intentSummary += " with weekend availability";
  }

  // Check groups
  if (q.includes("group") || q.includes("circle") || q.includes("study group")) {
    parsed.isGroupRequest = true;
  }

  // Check beginner / expert
  if (q.includes("beginner")) parsed.levelFilter = "Beginner";
  else if (q.includes("expert") || q.includes("advanced")) parsed.levelFilter = "Advanced";

  return parsed;
}
