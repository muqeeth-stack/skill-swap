"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  User,
  Session,
  LearningRoom,
  Review,
  Recording,
  TimeSlot,
  CreditTransaction,
  Connection,
  Message,
  Conversation,
  SkillExchangeOffer,
  LearningPath,
  NotificationItem,
  UserReport,
  SkillDefinition,
  MatchScore,
  MatchWeights,
  VideoProgress,
} from "@/types";
import {
  SKILL_CATALOG,
  DEMO_USERS,
  DEMO_SESSIONS,
  DEMO_ROOMS,
  DEMO_EXCHANGES,
  DEMO_LEARNING_PATHS,
  DEMO_REVIEWS,
  DEMO_RECORDINGS,
  DEMO_TIME_SLOTS,
  DEMO_CREDIT_TRANSACTIONS,
  DEMO_CONNECTIONS,
  DEMO_CONVERSATIONS,
  DEMO_MESSAGES,
  DEMO_NOTIFICATIONS,
} from "@/lib/data";
import {
  DEFAULT_MATCH_WEIGHTS,
  calculateCompatibility,
  findBestMatches,
  parseNaturalLanguageQuery,
  ParsedQuery,
} from "@/lib/matching";
import { aiNormalizeCustomSkill } from "@/lib/ai-assistant";

export interface ToastInfo {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

interface AppState {
  currentUser: User | null;
  users: User[];
  allUsers: User[];
  skills: SkillDefinition[];
  skillCatalog: SkillDefinition[];
  sessions: Session[];
  rooms: LearningRoom[];
  exchanges: SkillExchangeOffer[];
  exchangeOffers: SkillExchangeOffer[];
  learningPaths: LearningPath[];
  connections: Connection[];
  conversations: Conversation[];
  messages: Message[];
  reviews: Review[];
  recordings: Recording[];
  videoProgress: Record<string, VideoProgress>;
  timeSlots: TimeSlot[];
  creditTransactions: CreditTransaction[];
  notifications: NotificationItem[];
  reports: UserReport[];
  matchWeights: MatchWeights;
  isAuthenticated: boolean;
  registrationStep: number;
  theme: "light" | "dark";
  toasts: ToastInfo[];
}

interface AppContextType extends AppState {
  login: (email: string, password?: string) => boolean;
  loginWithGoogle: () => boolean;
  quickLogin: (userEmail: string) => void;
  logout: () => void;
  register: (step: number, data: Partial<User>) => void;
  setRegistrationStep: (step: number) => void;
  completeRegistration: (data?: Partial<User>) => void;
  updateProfile: (data: Partial<User>) => void;
  linkSocial: (platform: "linkedin" | "github", url: string) => void;
  unlinkSocial: (platform: "linkedin" | "github") => void;
  getMatches: () => MatchScore[];
  setMatchWeights: (weights: MatchWeights) => void;
  searchWithAI: (query: string) => { parsed: ParsedQuery; matches: MatchScore[] };
  sendConnectionRequest: (targetUserId: string, note?: string) => boolean;
  acceptConnection: (connectionId: string) => void;
  rejectConnection: (connectionId: string) => void;
  removeConnection: (connectionId: string) => void;
  blockUser: (userId: string) => void;
  reportUser: (userId: string, reason: string) => void;
  startConversationWithUser: (targetUserId: string) => string;
  sendMessage: (conversationId: string, text: string) => void;
  markMessagesRead: (conversationId: string) => void;
  bookSession: (
    teacherId: string,
    skill: string,
    subSkill: string | undefined,
    scheduledAt: string,
    duration: number,
    type?: "1on1" | "group" | "prerecorded",
    notes?: string
  ) => Session | null;
  cancelSession: (sessionId: string) => void;
  completeSession: (sessionId: string) => void;
  createRoom: (
    title: string,
    description: string,
    category: string,
    skill: string,
    subSkill: string | undefined,
    level: User["skillsTeach"][0]["level"],
    maxParticipants: number,
    scheduledAt: string,
    duration: number,
    goals: string[]
  ) => LearningRoom | null;
  joinRoom: (roomId: string) => boolean;
  leaveRoom: (roomId: string) => void;
  sendRoomMessage: (roomId: string, text: string) => void;
  createExchangeOffer: (
    teachSkill: string,
    teachLevel: User["skillsTeach"][0]["level"],
    learnSkill: string,
    learnLevel: User["skillsLearn"][0]["level"],
    description: string
  ) => SkillExchangeOffer | null;
  acceptExchangeOffer: (exchangeId: string) => void;
  togglePathStage: (pathId: string, stageNum: number) => void;
  submitReview: (
    sessionId: string,
    revieweeId: string,
    rating: number,
    comment: string,
    skillTaught: string,
    sessionQuality?: "Excellent" | "Good" | "Average" | "Needs Improvement"
  ) => void;
  updateVideoProgress: (videoId: string, currentTime: number, duration: number, completed?: boolean) => void;
  addRecording: (recording: Omit<Recording, "id">) => Recording;
  updateRecording: (id: string, updates: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  addCustomSkill: (name: string, description?: string) => SkillDefinition;
  addTimeSlot: (dayOfWeek: number, startTime: string, endTime: string) => void;
  removeTimeSlot: (slotId: string) => void;
  toggleTimeSlot: (slotId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  adminToggleUserStatus: (userId: string) => void;
  adminVerifyUser: (userId: string, type: "linkedin" | "github") => void;
  adminResolveReport: (reportId: string, status: "reviewed" | "resolved" | "dismissed") => void;
  adminAddCatalogSkill: (skill: Omit<SkillDefinition, "id">) => void;
  showToast: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  removeToast: (id: string) => void;
  toggleTheme: () => void;
  getUserById: (id: string) => User | undefined;
  getSessionsForUser: (userId: string) => Session[];
  getReviewsForUser: (userId: string) => Review[];
  getUserTimeSlots: (userId: string) => TimeSlot[];
  getCreditHistory: (userId: string) => CreditTransaction[];
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: DEMO_USERS.find((u) => u.name === "Priya Patel") || DEMO_USERS[0],
    users: DEMO_USERS,
    allUsers: DEMO_USERS,
    skills: SKILL_CATALOG,
    skillCatalog: SKILL_CATALOG,
    sessions: DEMO_SESSIONS,
    rooms: DEMO_ROOMS,
    exchanges: DEMO_EXCHANGES,
    exchangeOffers: DEMO_EXCHANGES,
    learningPaths: DEMO_LEARNING_PATHS,
    connections: DEMO_CONNECTIONS,
    conversations: DEMO_CONVERSATIONS,
    messages: DEMO_MESSAGES,
    reviews: DEMO_REVIEWS,
    recordings: DEMO_RECORDINGS,
    videoProgress: {},
    timeSlots: DEMO_TIME_SLOTS,
    creditTransactions: DEMO_CREDIT_TRANSACTIONS,
    notifications: DEMO_NOTIFICATIONS,
    reports: [],
    matchWeights: DEFAULT_MATCH_WEIGHTS,
    isAuthenticated: true,
    registrationStep: 1,
    theme: "light",
    toasts: [],
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate persistent state from localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("synapselearn_state_v2");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
            // Hydrating from localStorage: legitimate external store sync
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState((prev) => {
              const mergedUsers = parsed.users || prev.users;
              const mergedCurrentUser = parsed.currentUser
                ? mergedUsers.find((u: User) => u.id === parsed.currentUser.id) || parsed.currentUser
                : null;
              const mergedRecordings = Array.isArray(parsed.recordings) && parsed.recordings.length > 0 ? parsed.recordings : prev.recordings;
              const mergedVideoProgress = parsed.videoProgress || {};

              return {
                ...prev,
                ...parsed,
                users: mergedUsers,
                allUsers: mergedUsers,
                currentUser: mergedCurrentUser,
                recordings: mergedRecordings,
                videoProgress: mergedVideoProgress,
                toasts: [],
              };
            });

            if (parsed.theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not load SynapseLearn state from localStorage:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist state updates to localStorage whenever state changes after hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window !== "undefined") {
        const toPersist = { ...state, toasts: undefined };
        localStorage.setItem("synapselearn_state_v2", JSON.stringify(toPersist));
      }
    } catch (err) {
      console.warn("Could not persist SynapseLearn state to localStorage:", err);
    }
  }, [state, isHydrated]);

  const showToast = useCallback((message: string, type: "success" | "info" | "warning" | "error" = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setState((prev) => ({
      ...prev,
      toasts: [...prev.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        toasts: prev.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      toasts: prev.toasts.filter((t) => t.id !== id),
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => {
      const newTheme = prev.theme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return { ...prev, theme: newTheme };
    });
  }, []);

  const login = useCallback((email: string) => {
    const found = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setState((prev) => ({ ...prev, currentUser: found, isAuthenticated: true }));
      showToast(`Welcome back, ${found.name}!`, "success");
      return true;
    }
    showToast("Invalid credentials", "error");
    return false;
  }, [state.users, showToast]);

  const loginWithGoogle = useCallback(() => {
    const defaultUser = state.users.find((u) => u.name === "Priya Patel") || state.users[0];
    setState((prev) => ({ ...prev, currentUser: defaultUser, isAuthenticated: true }));
    showToast(`Signed in with Google as ${defaultUser.name}`, "success");
    return true;
  }, [state.users, showToast]);

  const quickLogin = useCallback((userEmail: string) => {
    const found = state.users.find((u) => u.email === userEmail);
    if (found) {
      setState((prev) => ({ ...prev, currentUser: found, isAuthenticated: true }));
      showToast(`Switched persona to ${found.name} (${found.skillsTeach[0]?.name || "Learner"})`, "info");
    }
  }, [state.users, showToast]);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUser: null, isAuthenticated: false }));
    showToast("Signed out successfully", "info");
  }, [showToast]);

  const register = useCallback((step: number, data: Partial<User>) => {
    setState((prev) => {
      const updatedUser = prev.currentUser ? { ...prev.currentUser, ...data } : ({ ...DEMO_USERS[0], ...data } as User);
      return { ...prev, currentUser: updatedUser, registrationStep: step };
    });
  }, []);

  const setRegistrationStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, registrationStep: step }));
  }, []);

  const completeRegistration = useCallback((data?: Partial<User>) => {
    setState((prev) => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data?.name || "New Learner",
        email: data?.email || "learner@example.com",
        avatar: data?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        bio: data?.bio || "Passionate about exchanging skills on SynapseLearn.",
        location: data?.location || "San Francisco, CA",
        preferredLanguages: data?.preferredLanguages || ["English"],
        weeklyHours: data?.weeklyHours || 4,
        availableDays: data?.availableDays || [1, 2, 3, 4, 5],
        availableTimes: data?.availableTimes || ["evening"],
        preferredMethods: data?.preferredMethods || ["video", "chat"],
        learningGoals: data?.learningGoals || ["Skill mastery"],
        interests: data?.interests || ["Sports", "Coding"],
        skillsTeach: data?.skillsTeach || [{ name: "Cricket Fast Bowling", category: "sports", level: "Advanced", yearsOfExp: 3 }],
        skillsLearn: data?.skillsLearn || [{ name: "Full Stack Next.js", category: "technology", level: "Beginner" }],
        credits: 120,
        isLinkedInVerified: false,
        isGitHubVerified: false,
        rating: 5.0,
        totalReviews: 0,
        totalSessionsTaught: 0,
        totalSessionsLearned: 0,
        completedExchanges: 0,
        streakDays: 1,
        badges: ["Fast Learner"],
        role: "user",
        createdAt: new Date().toISOString(),
        ...data,
      };

      const updatedUsers = [newUser, ...prev.users];
      return {
        ...prev,
        users: updatedUsers,
        allUsers: updatedUsers,
        currentUser: newUser,
        isAuthenticated: true,
        registrationStep: 1,
      };
    });
    showToast("Registration completed! Welcome to SynapseLearn.", "success");
  }, [showToast]);

  const updateProfile = useCallback((data: Partial<User>) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const updated = { ...prev.currentUser, ...data };
      const updatedUsers = prev.users.map((u) => (u.id === updated.id ? updated : u));
      return { ...prev, currentUser: updated, users: updatedUsers, allUsers: updatedUsers };
    });
    showToast("Profile updated successfully", "success");
  }, [showToast]);

  const linkSocial = useCallback((platform: "linkedin" | "github", url: string) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const updated: User = {
        ...prev.currentUser,
        ...(platform === "linkedin" ? { linkedinUrl: url, isLinkedInVerified: true } : { githubUrl: url, isGitHubVerified: true }),
      };
      const updatedUsers = prev.users.map((u) => (u.id === updated.id ? updated : u));
      return { ...prev, currentUser: updated, users: updatedUsers, allUsers: updatedUsers };
    });
    showToast(`${platform === "linkedin" ? "LinkedIn" : "GitHub"} profile verified!`, "success");
  }, [showToast]);

  const unlinkSocial = useCallback((platform: "linkedin" | "github") => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const updated: User = {
        ...prev.currentUser,
        ...(platform === "linkedin" ? { linkedinUrl: undefined, isLinkedInVerified: false } : { githubUrl: undefined, isGitHubVerified: false }),
      };
      const updatedUsers = prev.users.map((u) => (u.id === updated.id ? updated : u));
      return { ...prev, currentUser: updated, users: updatedUsers, allUsers: updatedUsers };
    });
    showToast(`Unlinked ${platform}`, "info");
  }, [showToast]);

  const getMatches = useCallback((): MatchScore[] => {
    if (!state.currentUser) return [];
    return findBestMatches(state.currentUser, state.users, state.matchWeights);
  }, [state.currentUser, state.users, state.matchWeights]);

  const setMatchWeights = useCallback((weights: MatchWeights) => {
    setState((prev) => ({ ...prev, matchWeights: weights }));
    showToast("AI matching algorithm weights updated", "success");
  }, [showToast]);

  const searchWithAI = useCallback(
    (query: string) => {
      const parsed = parseNaturalLanguageQuery(query);
      if (!state.currentUser) return { parsed, matches: [] };

      let candidateUsers = state.users.filter((u) => u.id !== state.currentUser?.id && !u.isBlocked);

      if (parsed.categoryFilter) {
        candidateUsers = candidateUsers.filter((u) =>
          u.skillsTeach.some((s) => s.category.toLowerCase() === parsed.categoryFilter?.toLowerCase()) ||
          u.skillsLearn.some((s) => s.category.toLowerCase() === parsed.categoryFilter?.toLowerCase())
        );
      }

      if (parsed.teachFilter) {
        candidateUsers = candidateUsers.filter((u) =>
          u.skillsTeach.some((st) => st.name.toLowerCase().includes(parsed.teachFilter!.toLowerCase()) || (st.subSkill && st.subSkill.toLowerCase().includes(parsed.teachFilter!.toLowerCase())))
        );
      }

      if (parsed.learnFilter) {
        candidateUsers = candidateUsers.filter((u) =>
          u.skillsLearn.some((sl) => sl.name.toLowerCase().includes(parsed.learnFilter!.toLowerCase()))
        );
      }

      if (parsed.languageFilter) {
        candidateUsers = candidateUsers.filter((u) =>
          (u.preferredLanguages || []).some((l) => l.toLowerCase().includes(parsed.languageFilter!.toLowerCase()))
        );
      }

      const matches = candidateUsers
        .map((target) => calculateCompatibility(state.currentUser!, target, state.matchWeights))
        .sort((a, b) => b.overallScore - a.overallScore);

      return { parsed, matches };
    },
    [state.currentUser, state.users, state.matchWeights]
  );

  const sendConnectionRequest = useCallback(
    (targetUserId: string, note?: string) => {
      if (!state.currentUser) return false;
      const target = state.users.find((u) => u.id === targetUserId);
      if (!target) return false;

      const existing = state.connections.find(
        (c) =>
          (c.requesterId === state.currentUser!.id && c.receiverId === targetUserId) ||
          (c.requesterId === targetUserId && c.receiverId === state.currentUser!.id)
      );

      if (existing) {
        showToast("Connection or invite already exists", "info");
        return false;
      }

      const newConn: Connection = {
        id: `conn-${Date.now()}`,
        requesterId: state.currentUser.id,
        receiverId: targetUserId,
        status: "pending",
        message: note || "Hi! I'd love to connect on SynapseLearn to exchange skills.",
        createdAt: new Date().toISOString(),
      };

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        type: "connection_request",
        title: "New Connection Request",
        message: `${state.currentUser.name} sent you a connection request.`,
        link: "/connections",
        read: false,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        connections: [...prev.connections, newConn],
        notifications: [newNotif, ...prev.notifications],
      }));

      showToast(`Connection request sent to ${target.name}!`, "success");
      return true;
    },
    [state.currentUser, state.users, state.connections, showToast]
  );

  const acceptConnection = useCallback(
    (connectionId: string) => {
      setState((prev) => {
        const conn = prev.connections.find((c) => c.id === connectionId);
        if (!conn) return prev;

        const updated = prev.connections.map((c) => (c.id === connectionId ? { ...c, status: "accepted" as const } : c));

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: conn.requesterId,
          type: "connection_accepted",
          title: "Connection Accepted!",
          message: `${prev.currentUser?.name} accepted your connection request.`,
          link: `/profile?id=${prev.currentUser?.id}`,
          read: false,
          createdAt: new Date().toISOString(),
        };

        return {
          ...prev,
          connections: updated,
          notifications: [newNotif, ...prev.notifications],
        };
      });
      showToast("Connection request accepted!", "success");
    },
    [showToast]
  );

  const rejectConnection = useCallback((connectionId: string) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connectionId),
    }));
    showToast("Connection request removed", "info");
  }, [showToast]);

  const removeConnection = useCallback((connectionId: string) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connectionId),
    }));
    showToast("Connection disconnected", "info");
  }, [showToast]);

  const blockUser = useCallback(
    (userId: string) => {
      setState((prev) => {
        const updatedUsers = prev.users.map((u) => (u.id === userId ? { ...u, isBlocked: true } : u));
        const filteredConnections = prev.connections.filter(
          (c) => c.requesterId !== userId && c.receiverId !== userId
        );
        return {
          ...prev,
          users: updatedUsers,
          allUsers: updatedUsers,
          connections: filteredConnections,
        };
      });
      showToast("User suspended/blocked successfully", "warning");
    },
    [showToast]
  );

  const reportUser = useCallback(
    (userId: string, reason: string) => {
      if (!state.currentUser) return;
      const newReport: UserReport = {
        id: `rep-${Date.now()}`,
        reporterId: state.currentUser.id,
        reportedUserId: userId,
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        reports: [...prev.reports, newReport],
      }));
      showToast("Thank you. Safety report submitted for moderation review.", "success");
    },
    [state.currentUser, showToast]
  );

  const startConversationWithUser = useCallback(
    (targetUserId: string): string => {
      if (!state.currentUser) return "";
      const existing = state.conversations.find(
        (c) => c.participantIds.includes(state.currentUser!.id) && c.participantIds.includes(targetUserId)
      );
      if (existing) return existing.id;

      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        participantIds: [state.currentUser.id, targetUserId],
        lastMessage: "Conversation started",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };

      setState((prev) => ({
        ...prev,
        conversations: [newConv, ...prev.conversations],
      }));
      return newConv.id;
    },
    [state.currentUser, state.conversations]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      if (!state.currentUser || !text.trim()) return;
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: state.currentUser.id,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        read: false,
      };

      setState((prev) => {
        const updatedConversations = prev.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: text.trim(), lastMessageTime: newMsg.createdAt }
            : c
        );
        return {
          ...prev,
          messages: [...prev.messages, newMsg],
          conversations: updatedConversations,
        };
      });
    },
    [state.currentUser]
  );

  const markMessagesRead = useCallback((conversationId: string) => {
    setState((prev) => {
      const conv = prev.conversations.find((c) => c.id === conversationId);
      const hasUnreadMsgs = prev.messages.some((m) => m.conversationId === conversationId && !m.read);
      if (!hasUnreadMsgs && (!conv || conv.unreadCount === 0)) {
        return prev;
      }
      const updatedMessages = prev.messages.map((m) =>
        m.conversationId === conversationId ? { ...m, read: true } : m
      );
      const updatedConversations = prev.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      );
      return {
        ...prev,
        messages: updatedMessages,
        conversations: updatedConversations,
      };
    });
  }, []);

  const bookSession = useCallback(
    (
      teacherId: string,
      skill: string,
      subSkill: string | undefined,
      scheduledAt: string,
      duration: number,
      type: "1on1" | "group" | "prerecorded" = "1on1",
      notes?: string
    ): Session | null => {
      if (!state.currentUser) return null;
      const teacher = state.users.find((u) => u.id === teacherId);
      if (!teacher) return null;

      const newSession: Session = {
        id: `sess-${Date.now()}`,
        teacherId,
        learnerId: state.currentUser.id,
        skill,
        subSkill,
        scheduledAt,
        duration,
        status: "active",
        type,
        credits: 1,
        meetingLink: "https://meet.jit.si/synapselearn-" + Math.random().toString(36).substr(2, 6),
        notes,
      };

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: teacherId,
        type: "match",
        title: "New Session Booked!",
        message: `${state.currentUser.name} booked a ${duration}m session with you for ${skill}.`,
        link: "/sessions",
        read: false,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        sessions: [newSession, ...prev.sessions],
        notifications: [newNotif, ...prev.notifications],
      }));

      showToast(`Session booked with ${teacher.name} for ${skill}!`, "success");
      return newSession;
    },
    [state.currentUser, state.users, showToast]
  );

  const cancelSession = useCallback(
    (sessionId: string) => {
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, status: "cancelled" } : s)),
      }));
      showToast("Session cancelled", "info");
    },
    [showToast]
  );

  const completeSession = useCallback(
    (sessionId: string) => {
      setState((prev) => {
        const sess = prev.sessions.find((s) => s.id === sessionId);
        if (!sess) return prev;

        const updatedSessions = prev.sessions.map((s) =>
          s.id === sessionId ? { ...s, status: "completed" as const } : s
        );

        // Grant credits to teacher and update counts
        const updatedUsers = prev.users.map((u) => {
          if (u.id === sess.teacherId) {
            return {
              ...u,
              credits: u.credits + sess.credits,
              totalSessionsTaught: u.totalSessionsTaught + 1,
              completedExchanges: u.completedExchanges + 1,
            };
          }
          if (u.id === sess.learnerId) {
            return {
              ...u,
              credits: Math.max(0, u.credits - sess.credits),
              totalSessionsLearned: u.totalSessionsLearned + 1,
              completedExchanges: u.completedExchanges + 1,
            };
          }
          return u;
        });

        const currentUpdated = updatedUsers.find((u) => u.id === prev.currentUser?.id) || prev.currentUser;

        return {
          ...prev,
          sessions: updatedSessions,
          users: updatedUsers,
          allUsers: updatedUsers,
          currentUser: currentUpdated,
        };
      });
      showToast("Session completed! Credits transferred.", "success");
    },
    [showToast]
  );

  const createRoom = useCallback(
    (
      title: string,
      description: string,
      category: string,
      skill: string,
      subSkill: string | undefined,
      level: User["skillsTeach"][0]["level"],
      maxParticipants: number,
      scheduledAt: string,
      duration: number,
      goals: string[]
    ): LearningRoom | null => {
      if (!state.currentUser) return null;

      const newRoom: LearningRoom = {
        id: `room-${Date.now()}`,
        title,
        description,
        category,
        skill,
        subSkill,
        level,
        hostId: state.currentUser.id,
        participants: [state.currentUser.id],
        maxParticipants,
        scheduledAt,
        duration,
        status: "open",
        credits: 1,
        goals,
        chatMessages: [
          {
            id: `rm-${Date.now()}`,
            senderId: state.currentUser.id,
            senderName: state.currentUser.name,
            text: `Welcome to ${title}! Feel free to post study notes or drill questions here.`,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      setState((prev) => ({
        ...prev,
        rooms: [newRoom, ...prev.rooms],
      }));

      showToast(`Learning room "${title}" launched!`, "success");
      return newRoom;
    },
    [state.currentUser, showToast]
  );

  const joinRoom = useCallback(
    (roomId: string): boolean => {
      if (!state.currentUser) return false;
      const room = state.rooms.find((r) => r.id === roomId);
      if (!room) return false;
      if (room.participants.includes(state.currentUser.id)) {
        showToast("You are already in this room", "info");
        return true;
      }
      if (room.participants.length >= room.maxParticipants) {
        showToast("Room is currently full", "warning");
        return false;
      }

      setState((prev) => {
        const updatedRooms = prev.rooms.map((r) =>
          r.id === roomId
            ? {
                ...r,
                participants: [...r.participants, prev.currentUser!.id],
                status: r.participants.length + 1 >= r.maxParticipants ? ("full" as const) : r.status,
              }
            : r
        );
        return { ...prev, rooms: updatedRooms };
      });

      showToast(`Joined ${room.title}!`, "success");
      return true;
    },
    [state.currentUser, state.rooms, showToast]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (!state.currentUser) return;
      setState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r) =>
          r.id === roomId ? { ...r, participants: r.participants.filter((p) => p !== prev.currentUser?.id) } : r
        ),
      }));
      showToast("Left room", "info");
    },
    [state.currentUser, showToast]
  );

  const sendRoomMessage = useCallback(
    (roomId: string, text: string) => {
      if (!state.currentUser || !text.trim()) return;
      const newMsg = {
        id: `rm-${Date.now()}`,
        senderId: state.currentUser.id,
        senderName: state.currentUser.name,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r) =>
          r.id === roomId ? { ...r, chatMessages: [...r.chatMessages, newMsg] } : r
        ),
      }));
    },
    [state.currentUser]
  );

  const createExchangeOffer = useCallback(
    (
      teachSkill: string,
      teachLevel: User["skillsTeach"][0]["level"],
      learnSkill: string,
      learnLevel: User["skillsLearn"][0]["level"],
      description: string
    ): SkillExchangeOffer | null => {
      if (!state.currentUser) return null;

      const newOffer: SkillExchangeOffer = {
        id: `ex-${Date.now()}`,
        userId: state.currentUser.id,
        teachSkill,
        teachLevel,
        learnSkill,
        learnLevel,
        description,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        exchanges: [newOffer, ...prev.exchanges],
        exchangeOffers: [newOffer, ...prev.exchangeOffers],
      }));

      showToast("Skill barter proposal published to marketplace!", "success");
      return newOffer;
    },
    [state.currentUser, showToast]
  );

  const acceptExchangeOffer = useCallback(
    (exchangeId: string) => {
      setState((prev) => {
        const updated = prev.exchanges.map((e) =>
          e.id === exchangeId ? { ...e, status: "in_progress" as const } : e
        );
        return { ...prev, exchanges: updated, exchangeOffers: updated };
      });
      showToast("Skill exchange accepted!", "success");
    },
    [showToast]
  );

  const togglePathStage = useCallback(
    (pathId: string, stageNum: number) => {
      setState((prev) => {
        const updatedPaths = prev.learningPaths.map((p) => {
          if (p.id !== pathId) return p;
          const updatedStages = p.stages.map((s) =>
            s.stage === stageNum ? { ...s, completed: !s.completed } : s
          );
          return { ...p, stages: updatedStages };
        });
        return { ...prev, learningPaths: updatedPaths };
      });
      showToast(`Learning path stage ${stageNum} updated!`, "success");
    },
    [showToast]
  );

  const submitReview = useCallback(
    (
      sessionId: string,
      revieweeId: string,
      rating: number,
      comment: string,
      skillTaught: string,
      sessionQuality: "Excellent" | "Good" | "Average" | "Needs Improvement" = "Excellent"
    ) => {
      if (!state.currentUser) return;
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        sessionId,
        reviewerId: state.currentUser.id,
        revieweeId,
        rating,
        comment,
        skillTaught,
        sessionQuality,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => {
        const updatedReviews = [newReview, ...prev.reviews];
        // recalculate rating for reviewee
        const targetReviews = updatedReviews.filter((r) => r.revieweeId === revieweeId);
        const avg = targetReviews.reduce((sum, r) => sum + r.rating, 0) / targetReviews.length;

        const updatedUsers = prev.users.map((u) =>
          u.id === revieweeId ? { ...u, rating: avg, totalReviews: targetReviews.length } : u
        );

        return {
          ...prev,
          reviews: updatedReviews,
          users: updatedUsers,
          allUsers: updatedUsers,
        };
      });

      showToast("Review submitted successfully! Thank you for the feedback.", "success");
    },
    [state.currentUser, showToast]
  );

  const updateVideoProgress = useCallback(
    (videoId: string, currentTime: number, duration: number, completed?: boolean) => {
      if (!state.currentUser) return;
      const isCompleted = completed ?? (duration > 0 && currentTime / duration >= 0.9);
      const progressEntry: VideoProgress = {
        videoId,
        userId: state.currentUser.id,
        currentTime: Math.floor(currentTime),
        duration: Math.floor(duration),
        completed: isCompleted,
        lastWatchedAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        videoProgress: {
          ...prev.videoProgress,
          [videoId]: progressEntry,
        },
      }));
    },
    [state.currentUser]
  );

  const addRecording = useCallback(
    (recording: Omit<Recording, "id">): Recording => {
      const newRec: Recording = {
        id: `rec-${Date.now()}`,
        ...recording,
      };
      setState((prev) => ({
        ...prev,
        recordings: [newRec, ...prev.recordings],
      }));
      showToast(`Masterclass "${newRec.title}" published!`, "success");
      return newRec;
    },
    [showToast]
  );

  const updateRecording = useCallback(
    (id: string, updates: Partial<Recording>) => {
      setState((prev) => ({
        ...prev,
        recordings: prev.recordings.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }));
      showToast("Masterclass updated", "info");
    },
    [showToast]
  );

  const deleteRecording = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        recordings: prev.recordings.filter((r) => r.id !== id),
      }));
      showToast("Masterclass removed", "info");
    },
    [showToast]
  );

  const addCustomSkill = useCallback(
    (name: string, description?: string): SkillDefinition => {
      const normalized = aiNormalizeCustomSkill(name, description);
      const newSkill: SkillDefinition = {
        id: `custom-${Date.now()}`,
        name: normalized.name,
        category: normalized.category,
        parentSkill: normalized.parentSkill,
        subSkills: normalized.subSkills,
        description: description || normalized.description,
        isPopular: false,
      };

      setState((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
        skillCatalog: [...prev.skillCatalog, newSkill],
      }));

      showToast(`Custom skill "${newSkill.name}" categorized under ${newSkill.category}!`, "success");
      return newSkill;
    },
    [showToast]
  );

  const addTimeSlot = useCallback((dayOfWeek: number, startTime: string, endTime: string) => {
    if (!state.currentUser) return;
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      userId: state.currentUser.id,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable: true,
    };
    setState((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, newSlot],
    }));
    showToast("Availability slot added", "success");
  }, [state.currentUser, showToast]);

  const removeTimeSlot = useCallback((slotId: string) => {
    setState((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((s) => s.id !== slotId),
    }));
    showToast("Time slot removed", "info");
  }, [showToast]);

  const toggleTimeSlot = useCallback((slotId: string) => {
    setState((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((s) => (s.id === slotId ? { ...s, isAvailable: !s.isAvailable } : s)),
    }));
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
    showToast("Notifications cleared", "info");
  }, [showToast]);

  const adminToggleUserStatus = useCallback((userId: string) => {
    setState((prev) => {
      const updated = prev.users.map((u) => (u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
      return { ...prev, users: updated, allUsers: updated };
    });
    showToast("User status updated by admin", "info");
  }, [showToast]);

  const adminVerifyUser = useCallback((userId: string, type: "linkedin" | "github") => {
    setState((prev) => {
      const updated = prev.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              ...(type === "linkedin" ? { isLinkedInVerified: true } : { isGitHubVerified: true }),
            }
          : u
      );
      return { ...prev, users: updated, allUsers: updated };
    });
    showToast("User verified by admin", "success");
  }, [showToast]);

  const adminResolveReport = useCallback((reportId: string, status: "reviewed" | "resolved" | "dismissed") => {
    setState((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
    }));
    showToast(`Report ${status}`, "info");
  }, [showToast]);

  const adminAddCatalogSkill = useCallback((skill: Omit<SkillDefinition, "id">) => {
    const newSkill: SkillDefinition = {
      id: `skill-${Date.now()}`,
      ...skill,
    };
    setState((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
      skillCatalog: [...prev.skillCatalog, newSkill],
    }));
    showToast(`Catalog skill "${newSkill.name}" created`, "success");
  }, [showToast]);

  const getUserById = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);
  const getSessionsForUser = useCallback(
    (userId: string) => state.sessions.filter((s) => s.teacherId === userId || s.learnerId === userId),
    [state.sessions]
  );
  const getReviewsForUser = useCallback(
    (userId: string) => state.reviews.filter((r) => r.revieweeId === userId),
    [state.reviews]
  );
  const getUserTimeSlots = useCallback(
    (userId: string) => state.timeSlots.filter((t) => t.userId === userId),
    [state.timeSlots]
  );
  const getCreditHistory = useCallback(
    (userId: string) => state.creditTransactions.filter((c) => c.userId === userId),
    [state.creditTransactions]
  );

  const resetToDefaultData = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("synapselearn_state_v2");
      }
    } catch {}

    const defaultUser = DEMO_USERS.find((u) => u.name === "Priya Patel") || DEMO_USERS[0];
    setState({
      currentUser: defaultUser,
      users: DEMO_USERS,
      allUsers: DEMO_USERS,
      skills: SKILL_CATALOG,
      skillCatalog: SKILL_CATALOG,
      sessions: DEMO_SESSIONS,
      rooms: DEMO_ROOMS,
      exchanges: DEMO_EXCHANGES,
      exchangeOffers: DEMO_EXCHANGES,
      learningPaths: DEMO_LEARNING_PATHS,
      connections: DEMO_CONNECTIONS,
      conversations: DEMO_CONVERSATIONS,
      messages: DEMO_MESSAGES,
      reviews: DEMO_REVIEWS,
      recordings: DEMO_RECORDINGS,
      videoProgress: {},
      timeSlots: DEMO_TIME_SLOTS,
      creditTransactions: DEMO_CREDIT_TRANSACTIONS,
      notifications: DEMO_NOTIFICATIONS,
      reports: [],
      matchWeights: DEFAULT_MATCH_WEIGHTS,
      isAuthenticated: true,
      registrationStep: 1,
      theme: "light",
      toasts: [],
    });
    showToast("Application state reset to default demo data", "info");
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        loginWithGoogle,
        quickLogin,
        logout,
        register,
        setRegistrationStep,
        completeRegistration,
        updateProfile,
        linkSocial,
        unlinkSocial,
        getMatches,
        setMatchWeights,
        searchWithAI,
        sendConnectionRequest,
        acceptConnection,
        rejectConnection,
        removeConnection,
        blockUser,
        reportUser,
        startConversationWithUser,
        sendMessage,
        markMessagesRead,
        bookSession,
        cancelSession,
        completeSession,
        createRoom,
        joinRoom,
        leaveRoom,
        sendRoomMessage,
        createExchangeOffer,
        acceptExchangeOffer,
        togglePathStage,
        submitReview,
        updateVideoProgress,
        addRecording,
        updateRecording,
        deleteRecording,
        addCustomSkill,
        addTimeSlot,
        removeTimeSlot,
        toggleTimeSlot,
        markNotificationRead,
        clearAllNotifications,
        adminToggleUserStatus,
        adminVerifyUser,
        adminResolveReport,
        adminAddCatalogSkill,
        showToast,
        removeToast,
        toggleTheme,
        getUserById,
        getSessionsForUser,
        getReviewsForUser,
        getUserTimeSlots,
        getCreditHistory,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
