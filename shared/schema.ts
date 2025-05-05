import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  university: text("university"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  color: text("color").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  courseId: integer("course_id"),
  dueDate: timestamp("due_date"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mindMapNodes = pgTable("mind_map_nodes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  parentId: integer("parent_id"),
  position: jsonb("position").notNull(),
  color: text("color"),
  taskId: integer("task_id"),
});

export const mindMapEdges = pgTable("mind_map_edges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sourceId: integer("source_id").notNull(),
  targetId: integer("target_id").notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  progress: integer("progress").notNull().default(0),
  color: text("color"),
  courseId: integer("course_id"),
});

export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").notNull(), // in minutes
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  university: true,
}).extend({
  password: z.string().min(8)
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  name: true,
  code: true,
  color: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  courseId: true,
  dueDate: true,
  priority: true,
  completed: true,
}).extend({
  dueDate: z.string().nullable().optional().or(z.date().nullable().optional())
});

export const updateTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  courseId: true,
  dueDate: true,
  priority: true,
  completed: true,
}).extend({
  dueDate: z.string().nullable().optional().or(z.date().nullable().optional())
}).partial();

export const insertMindMapNodeSchema = createInsertSchema(mindMapNodes).pick({
  title: true,
  parentId: true,
  position: true,
  color: true,
  taskId: true,
});

export const insertMindMapEdgeSchema = createInsertSchema(mindMapEdges).pick({
  sourceId: true,
  targetId: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  title: true,
  progress: true,
  color: true,
  courseId: true,
});

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).pick({
  taskId: true,
  startTime: true,
  endTime: true,
  duration: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertMindMapNode = z.infer<typeof insertMindMapNodeSchema>;
export type MindMapNode = typeof mindMapNodes.$inferSelect;
export type InsertMindMapEdge = z.infer<typeof insertMindMapEdgeSchema>;
export type MindMapEdge = typeof mindMapEdges.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
