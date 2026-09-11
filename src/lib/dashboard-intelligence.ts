import { User } from "@/types";

export interface DailyBrief {
  greeting: string;
  focusSkill: string;
  plan: { duration: string; task: string; type: "practice" | "review" | "connect" | "challenge" }[];
  recommendedPerson: { user: User; matchScore: number; reason: string };
  dailyChallenge: string;
  quote: string;
}

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: string;
  connections: string[]; // IDs of related skills
  description: string;
}

export interface SkillGapResult {
  role: string;
  description: string;
  completionPercentage: number;
  alreadyKnow: { name: string; level: string }[];
  shouldLearnNext: {
    name: string;
    importance: "Critical" | "High" | "Recommended";
    recommendedMentors: User[];
  }[];
}

export interface LearningModeData {
  skill: string;
  goal: string;
  currentLevel: string;
  targetLevel: string;
  milestones: { step: number; title: string; tasks: string[]; completed: boolean }[];
  practiceTasks: string[];
  aiCoachTip: string;
  recommendedMentors: User[];
}

export interface GeneratedProject {
  title: string;
  skill: string;
  level: string;
  estimatedHours: number;
  overview: string;
  deliverables: string[];
  stepByStep: string[];
}

export interface ProfileImprovementSuggestion {
  completeness: number;
  missingItems: string[];
  suggestedBio: string;
  suggestedSkillsToTeach: string[];
  suggestedSkillsToLearn: string[];
  suggestedGoals: string[];
  tips: string[];
}

export interface PerfectExchangeMatch {
  peer: User;
  teachSkill: string;
  learnSkill: string;
  synergyScore: number;
  rationale: string;
}

// 1. Generate Daily Brief
export function generateDailyBrief(currentUser: User, allUsers: User[]): DailyBrief {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const focusSkill = currentUser.skillsLearn[0]?.name || "Python";
  const teachSkill = currentUser.skillsTeach[0]?.name || "React";

  // Find top peer who teaches user's learnSkill or wants user's teachSkill
  const candidate = allUsers.find(
    (u) =>
      u.id !== currentUser.id &&
      (u.skillsTeach.some((s) => s.name.toLowerCase().includes(focusSkill.toLowerCase())) ||
        u.skillsLearn.some((s) => s.name.toLowerCase().includes(teachSkill.toLowerCase())))
  ) || allUsers.find((u) => u.id !== currentUser.id) || allUsers[0];

  const plan: DailyBrief["plan"] = [
    { duration: "25 min", task: `Hands-on practice: ${focusSkill} interactive drills`, type: "practice" },
    { duration: "15 min", task: `Review core concepts: ${focusSkill} architecture & patterns`, type: "review" },
    { duration: "10 min", task: `Connect with ${candidate.name} (teaches ${candidate.skillsTeach[0]?.name || focusSkill})`, type: "connect" },
    { duration: "20 min", task: `Complete daily micro-project milestone in ${focusSkill}`, type: "challenge" },
  ];

  const challenges = [
    `Build a modular component or code snippet showcasing ${focusSkill}`,
    `Record a 2-minute voice or video walk-through explaining a ${teachSkill} technique`,
    `Schedule a 30-minute peer exchange session with a community learner`,
    `Analyze and refactor one core function or technique in ${focusSkill}`,
  ];

    const charSum = (currentUser.id || "u1").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const challengeIndex = charSum % challenges.length;

  return {
    greeting,
    focusSkill,
    plan,
    recommendedPerson: {
      user: candidate,
      matchScore: 94,
      reason: `Mutual synergy: ${candidate.name} teaches ${candidate.skillsTeach[0]?.name} and seeks ${candidate.skillsLearn[0]?.name}`,
    },
    dailyChallenge: challenges[challengeIndex],
    quote: "Small consistent daily exchanges create exponential mastery.",
  };
}

// 2. Skill Graph Nodes
export const SKILL_GRAPH_NODES: SkillNode[] = [
  { id: "python", name: "Python", category: "technology", level: "Beginner - Advanced", connections: ["data-structures", "fastapi", "machine-learning"], description: "Core programming language for web, automation, and data" },
  { id: "data-structures", name: "Data Structures & Algorithms", category: "academics", level: "Intermediate", connections: ["python", "system-design", "machine-learning"], description: "Computational efficiency, trees, graphs, and dynamic programming" },
  { id: "fastapi", name: "FastAPI & REST APIs", category: "technology", level: "Intermediate", connections: ["python", "react", "cloud-devops"], description: "High-performance asynchronous backend services" },
  { id: "machine-learning", name: "Machine Learning & AI", category: "technology", level: "Advanced", connections: ["python", "deep-learning", "data-analytics"], description: "Predictive models, scikit-learn, regression, and clustering" },
  { id: "deep-learning", name: "Deep Learning & LLMs", category: "technology", level: "Expert", connections: ["machine-learning", "computer-vision"], description: "Transformers, attention mechanisms, PyTorch, and neural architectures" },
  { id: "react", name: "React & Next.js", category: "technology", level: "Intermediate - Expert", connections: ["typescript", "figma", "fastapi"], description: "Component-driven modern web application architecture" },
  { id: "typescript", name: "TypeScript", category: "technology", level: "Intermediate", connections: ["react", "nodejs"], description: "Statically typed JavaScript for robust scalable applications" },
  { id: "figma", name: "UI/UX Design with Figma", category: "creative", level: "Beginner - Expert", connections: ["react", "video-editing", "product-mgmt"], description: "Design systems, interactive prototypes, and UX research" },
  { id: "video-editing", name: "Video Editing & Storytelling", category: "creative", level: "Intermediate", connections: ["figma", "motion-graphics", "content-creation"], description: "Premiere, DaVinci Resolve, pacing, color grading, and audio" },
  { id: "cricket-batting", name: "Cricket: Batting Technique", category: "sports", level: "Beginner - Expert", connections: ["cricket-bowling", "cricket-strategy", "sports-fitness"], description: "Footwork, head position, backlift mechanics, and timing" },
  { id: "cricket-bowling", name: "Cricket: Fast & Spin Bowling", category: "sports", level: "Intermediate", connections: ["cricket-batting", "sports-fitness"], description: "Release biomechanics, seam position, pace variation, and turn" },
  { id: "cricket-strategy", name: "Cricket: Match Strategy & Field", category: "sports", level: "Advanced", connections: ["cricket-batting", "chess-tactics"], description: "Captaincy, field placements, match scenarios, and mental stamina" },
  { id: "sports-fitness", name: "Gym & Athletic Conditioning", category: "sports", level: "All Levels", connections: ["cricket-batting", "yoga"], description: "Mobility, explosive power, core strength, and injury prevention" },
  { id: "chess-tactics", name: "Chess Tactics & Openings", category: "sports", level: "Intermediate - Master", connections: ["cricket-strategy", "data-structures"], description: "Calculation, positional play, tactical forks, and endgame mastery" },
  { id: "spanish-fluent", name: "Conversational Spanish", category: "languages", level: "Beginner - Expert", connections: ["public-speaking"], description: "Fluency, idioms, listening comprehension, and cultural context" },
];

// 3. Skill Gap Analysis Database
export const TARGET_ROLE_BLUEPRINTS: Record<string, { description: string; requiredSkills: { name: string; importance: "Critical" | "High" | "Recommended" }[] }> = {
  "Machine Learning Engineer": {
    description: "Design, build, and deploy production ML models, neural networks, and scalable inference pipelines.",
    requiredSkills: [
      { name: "Python", importance: "Critical" },
      { name: "Machine Learning & AI", importance: "Critical" },
      { name: "Mathematics & Statistics", importance: "Critical" },
      { name: "Data Analytics & SQL", importance: "High" },
      { name: "DevOps & Cloud", importance: "Recommended" },
    ],
  },
  "Full-Stack Web Architect": {
    description: "Architect end-to-end cloud web applications with modern frontend, typed backends, and robust CI/CD.",
    requiredSkills: [
      { name: "React", importance: "Critical" },
      { name: "TypeScript", importance: "Critical" },
      { name: "Node.js", importance: "Critical" },
      { name: "UI/UX Design with Figma", importance: "High" },
      { name: "DevOps & Cloud", importance: "High" },
    ],
  },
  "Cricket All-Rounder & Athlete": {
    description: "Master multi-faceted athletic performance across batting execution, bowling variation, and match fitness.",
    requiredSkills: [
      { name: "Cricket", importance: "Critical" },
      { name: "Gym & Calisthenics", importance: "Critical" },
      { name: "Yoga & Mindfulness", importance: "High" },
      { name: "Public Speaking & Pitching", importance: "Recommended" },
    ],
  },
  "Creative Content & Video Director": {
    description: "Lead cinematic visual storytelling from storyboard, shooting, DaVinci color grading, to viral distribution.",
    requiredSkills: [
      { name: "Video Editing", importance: "Critical" },
      { name: "Content Creation", importance: "Critical" },
      { name: "Photoshop & Photo Editing", importance: "High" },
      { name: "UI/UX Design with Figma", importance: "Recommended" },
      { name: "Digital Marketing & SEO", importance: "High" },
    ],
  },
  "Startup Founder & Product Leader": {
    description: "Transform ideas into validated market products with rapid prototyping, unit economics, and team execution.",
    requiredSkills: [
      { name: "Entrepreneurship & Startups", importance: "Critical" },
      { name: "Product Management", importance: "Critical" },
      { name: "Public Speaking & Pitching", importance: "Critical" },
      { name: "Digital Marketing & SEO", importance: "High" },
      { name: "Personal Finance & Investing", importance: "High" },
    ],
  },
};

export function analyzeSkillGap(targetRole: string, currentUser: User, allUsers: User[]): SkillGapResult {
  const blueprint = TARGET_ROLE_BLUEPRINTS[targetRole] || TARGET_ROLE_BLUEPRINTS["Machine Learning Engineer"];
  const userKnownSkillNames = [
    ...currentUser.skillsTeach.map((s) => s.name.toLowerCase()),
    ...currentUser.skillsLearn.filter((s) => s.level !== "Beginner").map((s) => s.name.toLowerCase()),
  ];

  const alreadyKnow: SkillGapResult["alreadyKnow"] = [];
  const shouldLearnNext: SkillGapResult["shouldLearnNext"] = [];

  blueprint.requiredSkills.forEach((req) => {
    const isKnown = userKnownSkillNames.some((k) => k.includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(k));
    if (isKnown) {
      alreadyKnow.push({ name: req.name, level: "Proficient" });
    } else {
      // Find mentors who teach this skill
      const mentors = allUsers.filter(
        (u) =>
          u.id !== currentUser.id &&
          u.skillsTeach.some((s) => s.name.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(s.name.toLowerCase()))
      ).slice(0, 3);

      shouldLearnNext.push({
        name: req.name,
        importance: req.importance,
        recommendedMentors: mentors.length > 0 ? mentors : allUsers.slice(0, 2),
      });
    }
  });

  const completionPercentage = Math.round((alreadyKnow.length / blueprint.requiredSkills.length) * 100);

  return {
    role: targetRole,
    description: blueprint.description,
    completionPercentage,
    alreadyKnow,
    shouldLearnNext,
  };
}

// 4. Learning Mode Data Generator
export function getLearningModeData(skillName: string, currentUser: User, allUsers: User[]): LearningModeData {
  const mentors = allUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      u.skillsTeach.some((s) => s.name.toLowerCase().includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(s.name.toLowerCase()))
  ).slice(0, 3);

  return {
    skill: skillName,
    goal: `Achieve intermediate-to-advanced project independence in ${skillName}`,
    currentLevel: currentUser.skillsLearn.find((s) => s.name === skillName)?.level || "Beginner",
    targetLevel: "Advanced",
    milestones: [
      { step: 1, title: `Foundational Mechanics of ${skillName}`, tasks: ["Core syntax / fundamentals setup", "First hello-world execution", "Environment checklist"], completed: true },
      { step: 2, title: "Applied Problem Solving", tasks: ["Build structured exercise", "Peer review session with mentor", "Refactor for best practices"], completed: false },
      { step: 3, title: "Real-World Portfolio Project", tasks: ["Design architecture & scope", "Implement full solution", "Publish & showcase on SynapseLearn"], completed: false },
      { step: 4, title: "Reciprocal Knowledge Exchange", tasks: ["Host a 1-on-1 session teaching back what was learned", "Receive peer endorsement badge"], completed: false },
    ],
    practiceTasks: [
      `Practice 20 minutes daily focused on ${skillName} edge cases`,
      "Record an interactive question to send to your mentor",
      "Review sample open-source repositories and study techniques",
    ],
    aiCoachTip: `Focus 70% on active construction and 30% on passive review. Book a weekly review session on SynapseLearn to stay accountable.`,
    recommendedMentors: mentors.length > 0 ? mentors : allUsers.slice(0, 2),
  };
}

// 5. AI Project Generator
export function generateAiProject(skillName: string, level: string): GeneratedProject {
  const isBeginner = level.toLowerCase().includes("begin");

  if (skillName.toLowerCase().includes("python")) {
    return {
      title: isBeginner ? "Automated Personal Expense & Budget Tracker" : "Asynchronous Distributed Data Scraper & Analytics Pipeline",
      skill: skillName,
      level,
      estimatedHours: isBeginner ? 6 : 14,
      overview: isBeginner
        ? "Build a CLI application that parses monthly CSV banking statements, categorizes spending automatically, and exports visual monthly summaries."
        : "Build a resilient high-throughput web scraper using Python, Asyncio, and SQLite with automated data cleaning and summary analytics.",
      deliverables: ["Modular Python scripts with docstrings", "Input validation and error handling", "Clean README with CLI documentation"],
      stepByStep: [
        "Initialize virtual environment and install dependencies",
        "Implement data ingestion module for CSV / web input",
        "Add business logic filters and transformation rules",
        "Generate final formatted reports and run unit tests",
      ],
    };
  }

  if (skillName.toLowerCase().includes("video")) {
    return {
      title: isBeginner ? "30-Second Cinematic Travel Reel" : "Multi-Cam Narrative Documentary Sequence with Sound Design",
      skill: skillName,
      level,
      estimatedHours: isBeginner ? 4 : 12,
      overview: "Craft a fast-paced, emotionally engaging video sequence showcasing rhythm cuts, clean audio transitions, and stylized color grading.",
      deliverables: ["Final 4K/1080p master export", "Project file with organized bin structure", "Before/after color grade stills"],
      stepByStep: [
        "Select music track and mark rhythmic beats",
        "Assemble primary A-roll cut prioritizing story momentum",
        "Layer B-roll cutaways, sound effects, and Foley ambient tracks",
        "Apply color grade corrections and export optimized reel",
      ],
    };
  }

  if (skillName.toLowerCase().includes("cricket")) {
    return {
      title: "Comprehensive Net Batting & Biomechanics Routine",
      skill: skillName,
      level,
      estimatedHours: 8,
      overview: "Design and execute a 4-week progressive batting curriculum analyzing front-foot balance, backlift alignment, and spin defense.",
      deliverables: ["Video breakdown of stance & trigger movements", "Weekly drill scorecard (100 balls/session)", "Coach feedback log"],
      stepByStep: [
        "Record 10 balls each of front foot drive and pull shot on high-speed video",
        "Identify head tilt and weight transfer angles",
        "Execute 30 minutes of top-hand-only cone drills",
        "Simulate match pressure scenarios with field targets",
      ],
    };
  }

  // Default fallback project
  return {
    title: `Practical Real-World Showcase: ${skillName}`,
    skill: skillName,
    level,
    estimatedHours: 8,
    overview: `Design and complete a practical portfolio piece applying ${skillName} fundamentals to solve an everyday workflow challenge.`,
    deliverables: [`Completed ${skillName} project asset`, "Self-reflection learning log", "Peer feedback endorsement on SynapseLearn"],
    stepByStep: [
      `Define project requirements and review ${skillName} best practices`,
      "Draft initial prototype and conduct self-review",
      "Refine implementation addressing feedback",
      "Publish completed project to community exchange board",
    ],
  };
}

// 6. Profile Improvement Analyzer
export function analyzeProfileImprovement(user: User): ProfileImprovementSuggestion {
  const missingItems: string[] = [];
  let score = 50;

  if (user.bio && user.bio.length > 40) score += 15;
  else missingItems.push("Expand bio to highlight your teaching philosophy");

  if (user.skillsTeach.length >= 2) score += 15;
  else missingItems.push("Add at least 2 skills you can teach or mentor");

  if (user.skillsLearn.length >= 2) score += 10;
  else missingItems.push("Add 1 more skill you want to learn");

  if (user.availableDays && user.availableDays.length > 0) score += 10;
  else missingItems.push("Specify your weekly availability schedule");

  const primaryTeach = user.skillsTeach[0]?.name || "Web Development";
  const primaryLearn = user.skillsLearn[0]?.name || "Data Science";

  const suggestedBio = `Passionate ${primaryTeach} specialist dedicated to collaborative peer learning. Eager to master ${primaryLearn} through hands-on barters and real-world project exchange. Open to 1-on-1 mentoring and group masterminds!`;

  return {
    completeness: Math.min(score, 100),
    missingItems,
    suggestedBio,
    suggestedSkillsToTeach: ["System Design", "Agile Collaboration", "Code Review & Refactoring"],
    suggestedSkillsToLearn: ["Cloud & DevOps", "Public Speaking", "Data Analytics & SQL"],
    suggestedGoals: [
      `Complete 5 peer exchanges in ${primaryLearn}`,
      `Earn Top Mentor badge in ${primaryTeach}`,
      "Host a monthly learning room on SynapseLearn",
    ],
    tips: [
      "Profiles with verified credentials receive 3x more exchange requests",
      "Adding specific subskills increases match accuracy by 45%",
      "Setting weekly available hours helps mentors book sessions without friction",
    ],
  };
}

// 7. Find Perfect Exchanges
export function findPerfectExchanges(currentUser: User, allUsers: User[]): PerfectExchangeMatch[] {
  const results: PerfectExchangeMatch[] = [];

  for (const peer of allUsers) {
    if (peer.id === currentUser.id) continue;

    // What I can teach that they want to learn
    const iCanTeachThem = currentUser.skillsTeach.find((myTeach) =>
      peer.skillsLearn.some((peerLearn) => peerLearn.name.toLowerCase() === myTeach.name.toLowerCase())
    );

    // What they can teach that I want to learn
    const theyCanTeachMe = peer.skillsTeach.find((peerTeach) =>
      currentUser.skillsLearn.some((myLearn) => myLearn.name.toLowerCase() === peerTeach.name.toLowerCase())
    );

    if (iCanTeachThem && theyCanTeachMe) {
      results.push({
        peer,
        teachSkill: iCanTeachThem.name,
        learnSkill: theyCanTeachMe.name,
        synergyScore: 98,
        rationale: `Double reciprocal barter: You teach ${iCanTeachThem.name} ⇄ ${peer.name} teaches ${theyCanTeachMe.name}`,
      });
    } else if (theyCanTeachMe) {
      results.push({
        peer,
        teachSkill: currentUser.skillsTeach[0]?.name || "Skill",
        learnSkill: theyCanTeachMe.name,
        synergyScore: 88,
        rationale: `${peer.name} is an expert in ${theyCanTeachMe.name} matching your learning goals`,
      });
    }
  }

  // If no strict reciprocal pairs, create synthetic top matches from peers
  if (results.length === 0) {
    for (const peer of allUsers.slice(0, 3)) {
      if (peer.id === currentUser.id) continue;
      results.push({
        peer,
        teachSkill: currentUser.skillsTeach[0]?.name || "Web Development",
        learnSkill: peer.skillsTeach[0]?.name || "Python",
        synergyScore: 91,
        rationale: `High compatibility match based on complementary disciplines and active availability`,
      });
    }
  }

  return results.slice(0, 3);
}

// 8. Community Discovery Clustered by Interests
export interface InterestCommunity {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  description: string;
  icon: string;
  tags: string[];
}

export const INTEREST_COMMUNITIES: InterestCommunity[] = [
  {
    id: "comm-cricket",
    name: "Cricket Biomechanics & Performance Circle",
    category: "Sports",
    memberCount: 48,
    description: "Batting mechanics, bowling speed variations, video drill analysis, and match strategy discussions.",
    icon: "🏏",
    tags: ["Cricket", "Batting", "Bowling", "Sports Science"],
  },
  {
    id: "comm-ai",
    name: "AI Engineers & PyTorch Builders",
    category: "Technology",
    memberCount: 112,
    description: "Hands-on implementation of LLMs, neural networks, fine-tuning, and open-source models.",
    icon: "🤖",
    tags: ["Python", "Machine Learning", "Neural Nets", "PyTorch"],
  },
  {
    id: "comm-video",
    name: "Cinematic Creators & Storytellers",
    category: "Creative",
    memberCount: 76,
    description: "Peer feedback on edits, pacing, DaVinci Resolve color grades, sound design, and YouTube strategy.",
    icon: "🎬",
    tags: ["Video Editing", "DaVinci", "Color Grading", "Storytelling"],
  },
  {
    id: "comm-polyglot",
    name: "Polyglot Language Exchange Lounge",
    category: "Languages",
    memberCount: 94,
    description: "Real-time voice channels and conversational practice in Spanish, Japanese, French, and Hindi.",
    icon: "🌍",
    tags: ["Spanish", "Japanese", "Language Exchange", "Culture"],
  },
];
