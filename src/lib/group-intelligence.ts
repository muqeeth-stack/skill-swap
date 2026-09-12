import { User, LearningRoom, SkillLevel } from "@/types";

export interface SmartStudyPod {
  id: string;
  topic: string;
  category: string;
  level: SkillLevel;
  learnerIds: string[];
  learners: User[];
  sharedGoals: string[];
  rationale: string;
  relevanceScore: number;
  existingRoomId?: string;
}

/**
 * Normalizes learning topic text into canonical semantic clusters so that
 * variations like "Python", "Python Web Scraping", "Python Data Analytics"
 * are grouped together intelligently.
 */
interface SemanticCluster {
  canonicalTopic: string;
  category: string;
  level: SkillLevel;
  keywords: string[];
  defaultGoals: string[];
}

const SEMANTIC_CLUSTERS: SemanticCluster[] = [
  {
    canonicalTopic: "Python & Data Science",
    category: "technology",
    level: "Beginner",
    keywords: ["python", "pandas", "data analytics", "data science", "web scraping", "fastapi", "sql", "data engineering"],
    defaultGoals: [
      "Master Python fundamentals and core data structures",
      "Automate data extraction, cleaning, and analysis workflows",
      "Build collaborative real-world portfolio projects together"
    ],
  },
  {
    canonicalTopic: "Cricket Batting & Biomechanics",
    category: "sports",
    level: "Intermediate",
    keywords: ["cricket", "batting", "cover drive", "fast bowling", "spin bowling", "cricket strategy", "fielding"],
    defaultGoals: [
      "Analyze head positioning, stance balance, and bat swing biomechanics",
      "Run peer net drill simulations and footwork video reviews",
      "Develop match-situation tactics and pressure mindset"
    ],
  },
  {
    canonicalTopic: "Conversational Spanish Immersion",
    category: "languages",
    level: "Beginner",
    keywords: ["spanish", "conversational spanish", "grammar", "spanish fluency", "espanol"],
    defaultGoals: [
      "Engage in daily conversational dialogue roleplays",
      "Master high-frequency verb conjugations and idiom usage",
      "Improve native listening comprehension through peer voice drills"
    ],
  },
  {
    canonicalTopic: "React & Next.js Full-Stack Architecture",
    category: "technology",
    level: "Intermediate",
    keywords: ["react", "next.js", "nextjs", "frontend", "component design", "typescript", "tailwind"],
    defaultGoals: [
      "Master Server Components and streaming state patterns",
      "Architect clean custom hooks and API integrations",
      "Review each other's code and component design systems"
    ],
  },
  {
    canonicalTopic: "Video Editing & Color Grading",
    category: "creative",
    level: "Intermediate",
    keywords: ["video editing", "premiere pro", "davinci", "color grading", "compositing", "b-roll", "youtube"],
    defaultGoals: [
      "Learn cinematic node trees and LUT color management in DaVinci",
      "Master fast workflow pacing, sound design, and cut rhythms",
      "Critique peer rough cuts and polish final exports"
    ],
  },
  {
    canonicalTopic: "Machine Learning & AI Engineering",
    category: "technology",
    level: "Advanced",
    keywords: ["machine learning", "ai", "neural networks", "deep learning", "pytorch", "llm", "transformers"],
    defaultGoals: [
      "Understand neural network weight optimizations and loss functions",
      "Build state-of-the-art transformer pipelines and RAG agents",
      "Work through research papers and implement model architectures"
    ],
  },
  {
    canonicalTopic: "Culinary Arts & Traditional Cooking",
    category: "life_skills",
    level: "Beginner",
    keywords: ["cooking", "baking", "italian cuisine", "pasta making", "sourdough"],
    defaultGoals: [
      "Master essential knife skills and foundational sauces",
      "Cook traditional regional recipes in synchronized live sessions",
      "Exchange flavor profiling and ingredient substitutions"
    ],
  },
  {
    canonicalTopic: "Public Speaking & Pitching",
    category: "business",
    level: "Intermediate",
    keywords: ["public speaking", "pitching", "presentation", "voice modulation", "storytelling"],
    defaultGoals: [
      "Deliver 3-minute impromptu lightning talks with peer critique",
      "Structure persuasive pitch decks for founders and leaders",
      "Eliminate vocal fillers and command stage presence"
    ],
  },
];

/**
 * Checks if a user's learning profile relates to a cluster's keywords.
 */
function userMatchesCluster(user: User, cluster: SemanticCluster): boolean {
  const userTexts: string[] = [
    ...user.skillsLearn.map((s) => `${s.name} ${s.subSkill || ""}`.toLowerCase()),
    ...(user.learningGoals || []).map((g) => g.toLowerCase()),
    ...(user.interests || []).map((i) => i.toLowerCase()),
  ];

  return cluster.keywords.some((kw) =>
    userTexts.some((text) => text.includes(kw.toLowerCase()))
  );
}

/**
 * Intelligently scans all users in the system and detects when 3 or more learners
 * are pursuing the same or semantically related topic.
 *
 * Avoids generating duplicate pods if an active room already represents that cluster.
 */
export function detectSmartStudyPods(
  users: User[],
  existingRooms: LearningRoom[] = []
): SmartStudyPod[] {
  const pods: SmartStudyPod[] = [];

  for (const cluster of SEMANTIC_CLUSTERS) {
    // Find all users who are learning or wanting to learn this topic
    const matchingLearners = users.filter((u) => userMatchesCluster(u, cluster));

    // Core rule: Require at least 3 distinct learners
    if (matchingLearners.length >= 3) {
      // Check if an existing room already matches this canonical topic
      const existingRoom = existingRooms.find((r) =>
        r.title.toLowerCase().includes(cluster.canonicalTopic.toLowerCase()) ||
        r.skill.toLowerCase().includes(cluster.keywords[0])
      );

      // Synthesize goals from learners or use curated cluster goals
      const synthesizedGoals = Array.from(
        new Set([
          ...cluster.defaultGoals,
          ...matchingLearners.flatMap((l) => l.learningGoals || []).slice(0, 2),
        ])
      ).slice(0, 3);

      pods.push({
        id: `pod-${cluster.canonicalTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        topic: cluster.canonicalTopic,
        category: cluster.category,
        level: cluster.level,
        learnerIds: matchingLearners.map((u) => u.id),
        learners: matchingLearners,
        sharedGoals: synthesizedGoals,
        rationale: `AI identified ${matchingLearners.length} active learners (${matchingLearners.map((m) => m.name.split(" ")[0]).join(", ")}) pursuing ${cluster.canonicalTopic}.`,
        relevanceScore: Math.min(100, 75 + matchingLearners.length * 5),
        existingRoomId: existingRoom?.id,
      });
    }
  }

  // Dynamic ad-hoc clustering: Automatically detect 3+ learners for any custom skill
  const dynamicLearnersMap = new Map<string, { users: Set<User>; category: string }>();

  for (const user of users) {
    for (const skill of user.skillsLearn) {
      const normalized = skill.name.trim().toLowerCase();
      if (!normalized) continue;

      // Avoid duplicate pods if already covered by a canonical cluster
      const isCovered = pods.some((p) =>
        p.topic.toLowerCase().includes(normalized) ||
        normalized.includes(p.topic.toLowerCase())
      );
      if (isCovered) continue;

      if (!dynamicLearnersMap.has(normalized)) {
        dynamicLearnersMap.set(normalized, {
          users: new Set(),
          category: skill.category || "technology",
        });
      }
      dynamicLearnersMap.get(normalized)!.users.add(user);
    }
  }

  for (const [topic, info] of dynamicLearnersMap.entries()) {
    const matchingLearners = Array.from(info.users);
    if (matchingLearners.length >= 3) {
      const formattedTitle = topic.replace(/\b\w/g, (c) => c.toUpperCase());
      const existingRoom = existingRooms.find((r) =>
        r.title.toLowerCase().includes(topic) || r.skill.toLowerCase().includes(topic)
      );

      const synthesizedGoals = Array.from(
        new Set([
          `Master core principles and practical patterns of ${formattedTitle}`,
          `Collaborate on hands-on peer projects and drill exercises`,
          ...matchingLearners.flatMap((l) => l.learningGoals || []).slice(0, 2),
        ])
      ).slice(0, 3);

      pods.push({
        id: `pod-adhoc-${topic.replace(/[^a-z0-9]+/g, "-")}`,
        topic: formattedTitle,
        category: info.category,
        level: "Intermediate",
        learnerIds: matchingLearners.map((u) => u.id),
        learners: matchingLearners,
        sharedGoals: synthesizedGoals,
        rationale: `AI detected ${matchingLearners.length} active co-learners pursuing ${formattedTitle}.`,
        relevanceScore: Math.min(100, 70 + matchingLearners.length * 5),
        existingRoomId: existingRoom?.id,
      });
    }
  }

  // Sort by relevance / group size descending
  return pods.sort((a, b) => b.learners.length - a.learners.length);
}
