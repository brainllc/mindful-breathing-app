import { users, sessions, type User, type InsertUser, type Session, type InsertSession } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(id: number, exercise: string, rounds: number): Promise<User>;
  createSession(session: InsertSession): Promise<Session>;
  getSessionsByUser(userId: number): Promise<Session[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserProgress(id: number, exercise: string, rounds: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        currentExercise: exercise,
        completedRounds: rounds,
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSessionsByUser(userId: number): Promise<Session[]> {
    return db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId));
  }
}

export const storage = new DatabaseStorage();