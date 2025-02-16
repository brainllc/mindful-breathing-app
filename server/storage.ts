import { users, sessions, type User, type InsertUser, type Session, type InsertSession } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(id: number, exercise: string, rounds: number): Promise<User>;
  createSession(session: InsertSession): Promise<Session>;
  getSessionsByUser(userId: number): Promise<Session[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private currentUserId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      currentExercise: null,
      completedRounds: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProgress(id: number, exercise: string, rounds: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      currentExercise: exercise,
      completedRounds: user.completedRounds + rounds,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const newSession: Session = {
      ...session,
      id,
      completed: false,
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async getSessionsByUser(userId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId
    );
  }
}

export const storage = new MemStorage();
