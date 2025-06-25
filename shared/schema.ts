import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  inst_name: text("inst_name").notNull(),
  inst_location: text("inst_location").notNull(),
  inst_address: text("inst_address").notNull(),
  inst_logo: text("inst_logo"),
  inst_Official_Website: text("inst_Official_Website"),
  inst_Official_Contact_Number: text("inst_Official_Contact_Number").notNull(),
  inst_Official_Email_Id: text("inst_Official_Email_Id").notNull(),
  inst_branches: json("inst_branches").notNull(),
  inst_contact_person: json("inst_contact_person").notNull(),
});

const contactPersonSchema = z.object({
  contact_person_name: z.string().min(1, "Name is required"),
  contact_person_designation: z.string().min(1, "Designation is required"),
  contact_person_mobile_number: z.string().min(1, "Mobile number is required"),
  contact_person_email: z.string().email("Valid email is required"),
});

const superAdminSchema = z.object({
  branch_super_admin_name: z.string().min(1, "Name is required"),
  branch_super_admin_mobile_number: z.string().min(1, "Mobile number is required"),
  branch_super_admin_email: z.string().email("Valid email is required"),
});

const mobileAppSchema = z.object({
  branch_mobile_license_count: z.string().min(1, "License count is required"),
  branch_bhagen_logo_flag: z.enum(["yes", "no"]).default("yes"),
});

const branchSchema = z.object({
  branch_name: z.string().min(1, "Branch name is required"),
  branch_address: z.string().min(1, "Branch address is required"),
  branch_contact_person_name: z.string().min(1, "Contact person name is required"),
  branch_contact_person_designation: z.string().min(1, "Contact person designation is required"),
  branch_contact_person_mobile_number: z.string().min(1, "Contact person mobile number is required"),
  branch_contact_person_email: z.string().email("Valid contact person email is required"),
  branch_super_admins: z.array(superAdminSchema).min(1, "At least one super admin is required"),
  branch_mobile_app: z.array(mobileAppSchema).length(1, "Mobile app configuration is required"),
});

export const insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true,
}).extend({
  inst_contact_person: z.array(contactPersonSchema).min(1, "At least one contact person is required"),
  inst_branches: z.array(branchSchema).min(1, "At least one branch is required"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = typeof institutions.$inferSelect;
export type ContactPerson = z.infer<typeof contactPersonSchema>;
export type Branch = z.infer<typeof branchSchema>;
export type SuperAdmin = z.infer<typeof superAdminSchema>;
export type MobileApp = z.infer<typeof mobileAppSchema>;
