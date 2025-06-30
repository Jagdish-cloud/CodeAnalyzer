import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});



export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  staffId: text("staff_id").notNull().unique(),
  role: text("role").notNull(),
  newRole: text("new_role"),
  mobileNumber: text("mobile_number").notNull(),
  email: text("email").notNull().unique(),
  managerName: text("manager_name").notNull(),
  status: text("status").notNull(),
  lastWorkingDay: text("last_working_day"),
});

export const classMappings = pgTable("class_mappings", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  class: text("class").notNull(),
  division: text("division").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("Current working"),
});

export const teacherMappings = pgTable("teacher_mappings", {
  id: serial("id").primaryKey(),
  class: text("class").notNull(),
  subject: text("subject").notNull(),
  divisions: json("divisions").notNull(), // Array of {division: string, teacherId: number, teacherName: string}
  status: text("status").notNull().default("Current working"),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  roleName: text("role_name").notNull(),
  status: text("status").notNull().default("active"),
});



export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export const insertClassMappingSchema = createInsertSchema(classMappings).omit({
  id: true,
});

export const insertTeacherMappingSchema = createInsertSchema(teacherMappings).omit({
  id: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertClassMapping = z.infer<typeof insertClassMappingSchema>;
export type ClassMapping = typeof classMappings.$inferSelect;
export type InsertTeacherMapping = z.infer<typeof insertTeacherMappingSchema>;
export type TeacherMapping = typeof teacherMappings.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;
