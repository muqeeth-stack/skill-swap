export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type LearningMethod =
  | "video"
  | "voice"
  | "chat"
  | "screen_share"
  | "in_person"
  | "group"
  | "project_based";

export interface UserSkill {
  name: string;
  category: string;
  subSkill?: string;
  level: SkillLevel;
  yearsOfExp?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location?: string;
  preferredLanguages: string[];
  weeklyHours: number;
  availableDays: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  availableTimes: ("morning" | "afternoon" | "evening" | "night")[];
  preferredMethods: LearningMethod[];
  learningGoals: string[];
  interests: string[];
  skillsTeach: UserSkill[];
  skillsLearn: UserSkill[];
  credits: number;
  linkedinUrl?: string;
  githubUrl?: string;
  isLinkedInVerified: boolean;
  isGitHubVerified: boolean;
  rating: number;
  totalReviews: number;
  totalSessionsTaught: number;
  totalSessionsLearned: number;
  completedExchanges: number;
  streakDays: number;
  badges: string[];
  projects?: { title: string; link: string; description: string }[];
  role?: "user" | "admin";
  isBlocked?: boolean;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Session {
  id: string;
  teacherId: string;
  learnerId: string;
  skill: string;
  subSkill?: string;
  scheduledAt: string;
  duration: number; // minutes
  status: "pending" | "active" | "completed" | "cancelled";
  type: "1on1" | "group" | "prerecorded";
  credits: number;
  meetingLink?: string;
  notes?: string;
}

export interface LearningRoom {
  id: string;
  title: string;
  description: string;
  category: string;
  skill: string;
  subSkill?: string;
  level: SkillLevel;
  hostId: string;
  participants: string[];
  maxParticipants: number;
  scheduledAt: string;
  duration: number;
  status: "open" | "full" | "in_progress" | "completed";
  credits: number;
  goals: string[];
  chatMessages: RoomMessage[];
}

export interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  skillTaught: string;
  sessionQuality?: "Excellent" | "Good" | "Average" | "Needs Improvement";
  createdAt: string;
}

export interface Recording {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  category: SkillCategory;
  skill: string;
  level: SkillLevel;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in seconds
  views: number;
  likes: number;
  learningObjectives?: string[];
  relatedSkills?: string[];
  practicePrompt?: string;
  published?: boolean;
  createdAt: string;
  tags: string[];
}

export type VideoLesson = Recording;

export interface VideoProgress {
  videoId: string;
  userId: string;
  currentTime: number; // in seconds
  duration: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "earned" | "spent";
  description: string;
  createdAt: string;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface SkillExchangeOffer {
  id: string;
  userId: string;
  teachSkill: string;
  teachLevel: SkillLevel;
  learnSkill: string;
  learnLevel: SkillLevel;
  description: string;
  status: "active" | "in_progress" | "completed";
  createdAt: string;
}

export interface LearningPathStage {
  stage: number;
  title: string;
  description: string;
  skillsRequired: string[];
  recommendedMentorIds: string[];
  projects: string[];
  practiceTasks: string[];
  completed?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  targetRole: string;
  estimatedWeeks: number;
  stages: LearningPathStage[];
}

export interface MatchScore {
  targetUser: User;
  overallScore: number;
  skillExchangeScore: number;
  levelScore: number;
  goalScore: number;
  availabilityScore: number;
  preferencesScore: number;
  languageScore: number;
  interestScore: number;
  reasons: string[];
  matchType: "1on1_exchange" | "mentor_match" | "peer_partner" | "group_compatible";
}

export interface MatchWeights {
  skillExchange: number; // default 0.35
  skillLevel: number;    // default 0.15
  learningGoals: number; // default 0.15
  availability: number;  // default 0.15
  preferences: number;   // default 0.10
  languages: number;     // default 0.05
  interests: number;     // default 0.05
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: "connection_request" | "connection_accepted" | "message" | "match" | "room_invite" | "review" | "ai_recommendation";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
}

export type SkillCategory =
  | "technology"
  | "creative"
  | "business"
  | "languages"
  | "academics"
  | "sports"
  | "life_skills"
  | "hobbies";

export interface SkillDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  parentSkill?: string;
  subSkills: string[];
  description: string;
  isPopular?: boolean;
  icon?: string;
}

export const SKILL_CATEGORIES_METADATA: { id: SkillCategory; name: string; icon: string; description: string }[] = [
  { id: "technology", name: "Technology", icon: "code", description: "Software development, AI, data science, cybersecurity and infrastructure" },
  { id: "creative", name: "Creative & Arts", icon: "palette", description: "Design, video, photography, music, and digital media production" },
  { id: "business", name: "Business & Career", icon: "briefcase", description: "Entrepreneurship, marketing, finance, leadership, and public speaking" },
  { id: "languages", name: "Languages", icon: "globe", description: "Global languages, conversational practice, and grammar mastery" },
  { id: "academics", name: "Academics", icon: "book", description: "Mathematics, physics, chemistry, economics, and computer science" },
  { id: "sports", name: "Sports & Fitness", icon: "trophy", description: "Cricket, football, badminton, chess, yoga, gym, and athletics" },
  { id: "life_skills", name: "Life & Practical Skills", icon: "heart", description: "Cooking, personal finance, time management, gardening, and DIY" },
  { id: "hobbies", name: "Hobbies & Activities", icon: "sparkles", description: "Gaming, travel planning, podcasting, crafting, and woodworking" },
];

export const BADGE_DEFINITIONS: Record<string, { title: string; description: string; color: string }> = {
  "Helpful Teacher": { title: "Helpful Teacher", description: "Consistently rated 4.8+ by learners", color: "emerald" },
  "Fast Learner": { title: "Fast Learner", description: "Mastered 3+ new skills with high engagement", color: "blue" },
  "Consistent Learner": { title: "Consistent Learner", description: "Maintained a 14+ day learning streak", color: "amber" },
  "Top Mentor": { title: "Top Mentor", description: "Conducted over 30 successful 1-on-1 teaching sessions", color: "violet" },
  "Skill Explorer": { title: "Skill Explorer", description: "Participated across 4 different skill categories", color: "rose" },
  "Community Builder": { title: "Community Builder", description: "Created popular learning rooms and practice groups", color: "indigo" },
};
