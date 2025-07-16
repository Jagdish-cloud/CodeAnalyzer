import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
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

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  subjectName: text("subject_name").notNull().unique(),
  status: text("status").notNull().default("active"),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  sex: text("sex").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  // Address fields
  flatBuildingNo: text("flat_building_no").notNull(),
  areaLocality: text("area_locality").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  landmark: text("landmark"),
  // Optional contact details
  contactNumber: text("contact_number"),
  emailId: text("email_id"),
  class: text("class").notNull(),
  division: text("division").notNull(),
  rollNumber: integer("roll_number").notNull(),
  // Father information (optional)
  fatherName: text("father_name"),
  fatherMobileNumber: text("father_mobile_number"),
  fatherEmailId: text("father_email_id"),
  // Mother information (optional)
  motherName: text("mother_name"),
  motherMobileNumber: text("mother_mobile_number"),
  motherEmailId: text("mother_email_id"),
  // Guardian information (optional)
  guardianName: text("guardian_name"),
  guardianMobileNumber: text("guardian_mobile_number"),
  guardianEmailId: text("guardian_email_id"),
  guardianRelation: text("guardian_relation"),
  apaarId: text("apaar_id").notNull(),
  aadharNumber: text("aadhar_number").notNull(),
});

export const workingDays = pgTable("working_days", {
  id: serial("id").primaryKey(),
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, etc.
  dayType: text("day_type").notNull(), // FullDay, HalfDay, Holiday, AlternateWeek
  alternateWeeks: text("alternate_weeks").array(), // W1, W2, W3, W4, W5
  timingFrom: text("timing_from"),
  timingTo: text("timing_to"),
});

export const schoolSchedule = pgTable("school_schedule", {
  id: serial("id").primaryKey(),
  dayOfWeek: text("day_of_week").notNull(),
  type: text("type").notNull(), // Period, Break, Others
  name: text("name").notNull(), // Period-1, Morning Break, etc.
  timingFrom: text("timing_from").notNull(),
  timingTo: text("timing_to").notNull(),
});

export const timeTables = pgTable("time_tables", {
  id: serial("id").primaryKey(),
  academicYear: text("academic_year").notNull(),
  className: text("class_name").notNull(),
  division: text("division").notNull(),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: text("created_at").notNull(),
});

export const timeTableEntries = pgTable("time_table_entries", {
  id: serial("id").primaryKey(),
  timeTableId: integer("time_table_id").references(() => timeTables.id).notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  scheduleSlot: text("schedule_slot").notNull(), // Maps to schedule name like "Period-1", "Break-1", etc.
  subjectId: integer("subject_id").references(() => subjects.id),
  teacherId: integer("teacher_id").references(() => staff.id),
});

export const syllabusMasters = pgTable("syllabus_masters", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  subject: text("subject").notNull(),
  class: text("class").notNull(),
  divisions: text("divisions").array().notNull(), // Array of divisions
  chapterLessonNo: text("chapter_lesson_no").notNull(),
  topic: text("topic").notNull(),
  description: text("description"), // Optional field
  status: text("status").notNull().default("active"),
});

export const periodicTests = pgTable("periodic_tests", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  class: text("class").notNull(),
  divisions: text("divisions").array().notNull(), // Array of divisions
  subject: text("subject").notNull(),
  chapters: text("chapters").array().notNull(), // Array of chapter/lesson numbers
  testDate: text("test_date").notNull(),
  testTime: text("test_time").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const publicHolidays = pgTable("public_holidays", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  holidayDescription: text("holiday_description").notNull(),
  holidayType: text("holiday_type").notNull(), // 'full' or 'half'
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  rollNumber: true, // Auto-generated based on alphabetical order
});

export const insertWorkingDaySchema = createInsertSchema(workingDays).omit({
  id: true,
});

export const insertSchoolScheduleSchema = createInsertSchema(schoolSchedule).omit({
  id: true,
});

export const insertTimeTableSchema = createInsertSchema(timeTables).omit({
  id: true,
});

export const insertTimeTableEntrySchema = createInsertSchema(timeTableEntries).omit({
  id: true,
});

export const insertSyllabusMasterSchema = createInsertSchema(syllabusMasters).omit({
  id: true,
});

export const insertPeriodicTestSchema = createInsertSchema(periodicTests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPublicHolidaySchema = createInsertSchema(publicHolidays).omit({
  id: true,
  createdAt: true,
});

export const handBooks = pgTable("hand_books", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertHandBookSchema = createInsertSchema(handBooks).omit({
  id: true,
  uploadedAt: true,
});

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  topicName: text("topic_name").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Bus Route schema
export const busRoutes = pgTable("bus_routes", {
  id: serial("id").primaryKey(),
  routeNumber: text("route_number").notNull(),
  routeName: text("route_name").notNull(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  busNumber: text("bus_number").notNull(),
  stops: json("stops").$type<Array<{
    address: string;
    lat: number;
    lng: number;
  }>>().default([]),
  vehicleNumber: text("vehicle_number").notNull(),
  driverName: text("driver_name").notNull(),
  driverContactNumber: text("driver_contact_number").notNull(),
  busAttenderName: text("bus_attender_name").notNull(),
  busAttenderContactNumber: text("bus_attender_contact_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBusRouteSchema = createInsertSchema(busRoutes).omit({
  id: true,
  createdAt: true,
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
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertWorkingDay = z.infer<typeof insertWorkingDaySchema>;
export type WorkingDay = typeof workingDays.$inferSelect;
export type InsertSchoolSchedule = z.infer<typeof insertSchoolScheduleSchema>;
export type SchoolSchedule = typeof schoolSchedule.$inferSelect;
export type InsertTimeTable = z.infer<typeof insertTimeTableSchema>;
export type TimeTable = typeof timeTables.$inferSelect;
export type InsertTimeTableEntry = z.infer<typeof insertTimeTableEntrySchema>;
export type TimeTableEntry = typeof timeTableEntries.$inferSelect;
export type InsertSyllabusMaster = z.infer<typeof insertSyllabusMasterSchema>;
export type SyllabusMaster = typeof syllabusMasters.$inferSelect;
export type InsertPeriodicTest = z.infer<typeof insertPeriodicTestSchema>;
export type PeriodicTest = typeof periodicTests.$inferSelect;
export type InsertPublicHoliday = z.infer<typeof insertPublicHolidaySchema>;
export type PublicHoliday = typeof publicHolidays.$inferSelect;
export type InsertHandBook = z.infer<typeof insertHandBookSchema>;
export type HandBook = typeof handBooks.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertBusRoute = z.infer<typeof insertBusRouteSchema>;
export type BusRoute = typeof busRoutes.$inferSelect;
