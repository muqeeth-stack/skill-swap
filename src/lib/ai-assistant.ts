import { SKILL_CATALOG, SEMANTIC_SEARCH_MAP, DEMO_USERS } from "./data";
import { SkillDefinition, SkillCategory } from "@/types";

export interface AiSkillSuggestion {
  primarySkills: string[];
  relatedSkills: string[];
  explanation: string;
  followUpQuestion: string;
  suggestedMentors: { id: string; name: string; avatar: string; skill: string }[];
}

export function aiDiscoverSkills(input: string): AiSkillSuggestion {
  const normalized = input.toLowerCase().trim();

  // Check semantic map first
  const mapped = SEMANTIC_SEARCH_MAP.find((m) =>
    normalized.includes(m.query) || m.query.split(" ").some((w) => normalized.includes(w))
  );

  if (mapped) {
    const suggestedMentors = DEMO_USERS.filter((u) =>
      u.skillsTeach.some((s) => mapped.suggestedSkills.some((ms) => ms.toLowerCase().includes(s.name.toLowerCase())))
    ).map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      skill: u.skillsTeach[0].name,
    }));

    return {
      primarySkills: mapped.suggestedSkills.slice(0, 3),
      relatedSkills: mapped.suggestedSkills.slice(3),
      explanation: mapped.reason,
      followUpQuestion: `What is your current experience level with ${mapped.suggestedSkills[0]}?`,
      suggestedMentors: suggestedMentors.slice(0, 3),
    };
  }

  // Check catalog skills
  const matchedCatalog = SKILL_CATALOG.filter(
    (s) =>
      normalized.includes(s.name.toLowerCase()) ||
      s.subSkills.some((sub) => normalized.includes(sub.toLowerCase()))
  );

  if (matchedCatalog.length > 0) {
    const main = matchedCatalog[0];
    const mentors = DEMO_USERS.filter((u) =>
      u.skillsTeach.some((s) => s.name.toLowerCase().includes(main.name.toLowerCase()))
    ).map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      skill: main.name,
    }));

    return {
      primarySkills: [main.name, ...main.subSkills.slice(0, 2)],
      relatedSkills: main.subSkills.slice(2),
      explanation: `Matched "${main.name}" under ${main.category.replace("_", " ")}: ${main.description}`,
      followUpQuestion: `Are you looking for 1-on-1 mentoring or group practice for ${main.name}?`,
      suggestedMentors: mentors.slice(0, 3),
    };
  }

  // Default smart fallback
  return {
    primarySkills: ["Web Development", "Python", "UI/UX Design with Figma"],
    relatedSkills: ["Content Creation", "Digital Marketing & SEO", "Time Management & Productivity"],
    explanation: `We've categorized your interest into relevant technical and creative disciplines.`,
    followUpQuestion: `Could you tell us more about what specific projects or goals you have in mind?`,
    suggestedMentors: DEMO_USERS.slice(0, 3).map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      skill: u.skillsTeach[0].name,
    })),
  };
}

export function aiNormalizeCustomSkill(name: string, description?: string): SkillDefinition {
  const lower = (name + " " + (description || "")).toLowerCase();
  let category: SkillCategory = "technology";

  if (lower.includes("cricket") || lower.includes("football") || lower.includes("badminton") || lower.includes("chess") || lower.includes("yoga") || lower.includes("fitness") || lower.includes("gym") || lower.includes("sport") || lower.includes("workout")) {
    category = "sports";
  } else if (lower.includes("video") || lower.includes("photo") || lower.includes("design") || lower.includes("music") || lower.includes("guitar") || lower.includes("piano") || lower.includes("art") || lower.includes("drawing") || lower.includes("figma")) {
    category = "creative";
  } else if (lower.includes("business") || lower.includes("market") || lower.includes("seo") || lower.includes("sales") || lower.includes("finance") || lower.includes("invest") || lower.includes("startup") || lower.includes("public speak")) {
    category = "business";
  } else if (lower.includes("spanish") || lower.includes("english") || lower.includes("german") || lower.includes("japanese") || lower.includes("french") || lower.includes("hindi") || lower.includes("language") || lower.includes("speak")) {
    category = "languages";
  } else if (lower.includes("cook") || lower.includes("bake") || lower.includes("drive") || lower.includes("garden") || lower.includes("time") || lower.includes("habit")) {
    category = "life_skills";
  } else if (lower.includes("game") || lower.includes("podcast") || lower.includes("craft") || lower.includes("wood")) {
    category = "hobbies";
  } else if (lower.includes("math") || lower.includes("physics") || lower.includes("chemistry") || lower.includes("theory") || lower.includes("academic")) {
    category = "academics";
  }

  // Generate subskills
  const subSkills = [
    `${name} Fundamentals`,
    `Intermediate ${name} Techniques`,
    `Advanced ${name} & Best Practices`,
    `Practical Hands-On Projects`,
  ];

  return {
    id: `custom-${Date.now()}`,
    name: name.trim(),
    category,
    subSkills,
    description: description || `Custom user-defined skill categorized under ${category}.`,
    isPopular: false,
    icon: "sparkles",
  };
}

export function aiGenerateStudyPlan(topic: string, hoursPerWeek: number = 5): { title: string; weeks: { week: number; focus: string; tasks: string[] }[] } {
  return {
    title: `SynapseLearn Accelerated Study Plan: ${topic}`,
    weeks: [
      {
        week: 1,
        focus: "Foundations & Core Mental Models",
        tasks: [
          `Connect with a verified SynapseLearn teacher in ${topic}`,
          "Complete baseline setup and review key terminology",
          `Allocate ${Math.round(hoursPerWeek / 3)} hours to guided 1-on-1 learning`,
        ],
      },
      {
        week: 2,
        focus: "Hands-on Drills & Real-world Practice",
        tasks: [
          "Join a relevant SynapseLearn Group Room or study circle",
          "Complete initial mini-project or practical drill assignment",
          "Receive peer feedback from an experienced exchange partner",
        ],
      },
      {
        week: 3,
        focus: "Advanced Techniques & Edge Cases",
        tasks: [
          "Tackle complex real-world scenarios and performance optimization",
          "Teach back a core concept to a beginner peer to reinforce mastery",
          "Refine execution speed and precision",
        ],
      },
      {
        week: 4,
        focus: "Capstone Project & Community Showcase",
        tasks: [
          "Publish a completed project or record a demonstration video",
          "Earn the 'Fast Learner' or 'Top Mentor' badge on SynapseLearn",
          "Begin offering teaching sessions in return for your next desired skill",
        ],
      },
    ],
  };
}
