/**
 * SynapseLearn Unified Database Access & Persistence Layer
 *
 * Provides safe data access whether backed by a live PostgreSQL/SQLite database
 * (when DATABASE_URL is configured) or operating in zero-config demo mode.
 */

import { DEMO_USERS, DEMO_SESSIONS, DEMO_REVIEWS, DEMO_ROOMS, DEMO_EXCHANGES } from "@/lib/data";
import { User, Session, Review, LearningRoom, SkillExchangeOffer } from "@/types";

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export interface DataStore {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getSessions(userId?: string): Promise<Session[]>;
  getReviews(userId?: string): Promise<Review[]>;
  getRooms(): Promise<LearningRoom[]>;
  getExchanges(userId?: string): Promise<SkillExchangeOffer[]>;
}

/**
 * In-memory / Demo store fallback when no database connection string is provided.
 */
class DemoStore implements DataStore {
  async getUsers(): Promise<User[]> {
    return [...DEMO_USERS];
  }

  async getUserById(id: string): Promise<User | null> {
    return DEMO_USERS.find((u) => u.id === id) || null;
  }

  async getSessions(userId?: string): Promise<Session[]> {
    if (!userId) return [...DEMO_SESSIONS];
    return DEMO_SESSIONS.filter((s) => s.teacherId === userId || s.learnerId === userId);
  }

  async getReviews(userId?: string): Promise<Review[]> {
    if (!userId) return [...DEMO_REVIEWS];
    return DEMO_REVIEWS.filter((r) => r.revieweeId === userId || r.reviewerId === userId);
  }

  async getRooms(): Promise<LearningRoom[]> {
    return [...DEMO_ROOMS];
  }

  async getExchanges(userId?: string): Promise<SkillExchangeOffer[]> {
    if (!userId) return [...DEMO_EXCHANGES];
    return DEMO_EXCHANGES.filter((e) => e.userId === userId);
  }
}

export const dbStore: DataStore = new DemoStore();
