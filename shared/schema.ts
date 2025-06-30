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
  managerName: text("manager_name"),
  status: text("status").notNull(),
  lastWorkingDay: text("last_working_day"),
});

export const classMappings = pgTable("class_mappings", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  class: text("class").notNull(),
  division: text("division").notNull(),
  subjects: text("subjects").array().notNull(),
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

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  sex: text("sex").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address").notNull(),
  contactNumber: text("contact_number").notNull(),
  emailId: text("email_id").notNull(),
  class: text("class").notNull(),
  division: text("division").notNull(),
  rollNumber: integer("roll_number").notNull(),
  fatherName: text("father_name").notNull(),
  fatherMobileNumber: text("father_mobile_number").notNull(),
  fatherEmailId: text("father_email_id").notNull(),
  motherName: text("mother_name").notNull(),
  motherMobileNumber: text("mother_mobile_number").notNull(),
  motherEmailId: text("mother_email_id").notNull(),
  apaarId: text("apaar_id").notNull(),
  aadharNumber: text("aadhar_number").notNull(),
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

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  rollNumber: true, // Auto-generated based on alphabetical order
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
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
