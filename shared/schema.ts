import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  currentExercise: text("current_exercise"),
  completedRounds: integer("completed_rounds").default(0),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  exerciseId: text("exercise_id").notNull(),
  rounds: integer("rounds").notNull(),
  completed: boolean("completed").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  exerciseId: true,
  rounds: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
