import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertStaffSchema, insertClassMappingSchema, insertTeacherMappingSchema, insertRoleSchema, insertSubjectSchema, insertStudentSchema, insertWorkingDaySchema, insertSchoolScheduleSchema, insertTimeTableSchema, insertTimeTableEntrySchema, insertSyllabusMasterSchema, insertPeriodicTestSchema, insertPublicHolidaySchema, insertHandBookSchema, insertNewsletterSchema, insertEventSchema, insertBusRouteSchema, insertNewsCircularSchema, insertPhotoGallerySchema, insertPollSchema, insertSurveySchema, insertMockTestSchema, insertTestResultSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.startsWith('application/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Staff routes
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const result = insertStaffSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const staffMember = await storage.createStaff(result.data);
      res.status(201).json(staffMember);
    } catch (error) {
      console.error("Staff creation error:", error);
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid staff ID" });
      }

      const staffMember = await storage.getStaff(id);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  app.patch("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid staff ID" });
      }

      const result = insertStaffSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const staffMember = await storage.updateStaff(id, result.data);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(staffMember);
    } catch (error) {
      console.error("Staff update error:", error);
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid staff ID" });
      }

      const deleted = await storage.deleteStaff(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Class mapping routes
  app.get("/api/class-mappings", async (req, res) => {
    try {
      const mappings = await storage.getAllClassMappings();
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch class mappings" });
    }
  });

  app.post("/api/class-mappings", async (req, res) => {
    try {
      const result = insertClassMappingSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const mapping = await storage.createClassMapping(result.data);
      res.status(201).json(mapping);
    } catch (error) {
      console.error("Class mapping creation error:", error);
      res.status(500).json({ message: "Failed to create class mapping" });
    }
  });

  app.get("/api/class-mappings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }

      const mapping = await storage.getClassMapping(id);
      if (!mapping) {
        return res.status(404).json({ message: "Class mapping not found" });
      }
      
      res.json(mapping);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch class mapping" });
    }
  });

  app.patch("/api/class-mappings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }

      const result = insertClassMappingSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const mapping = await storage.updateClassMapping(id, result.data);
      if (!mapping) {
        return res.status(404).json({ message: "Class mapping not found" });
      }

      res.json(mapping);
    } catch (error) {
      res.status(500).json({ message: "Failed to update class mapping" });
    }
  });

  app.delete("/api/class-mappings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }

      const deleted = await storage.deleteClassMapping(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Class mapping not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete class mapping" });
    }
  });

  // Teacher mapping routes
  app.get("/api/teacher-mappings", async (req, res) => {
    try {
      const mappings = await storage.getAllTeacherMappings();
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher mappings" });
    }
  });

  app.post("/api/teacher-mappings", async (req, res) => {
    try {
      const result = insertTeacherMappingSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const mapping = await storage.createTeacherMapping(result.data);
      res.status(201).json(mapping);
    } catch (error) {
      console.error("Teacher mapping creation error:", error);
      res.status(500).json({ message: "Failed to create teacher mapping" });
    }
  });

  app.get("/api/teacher-mappings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }

      const mapping = await storage.getTeacherMapping(id);
      if (!mapping) {
        return res.status(404).json({ message: "Teacher mapping not found" });
      }
      
      res.json(mapping);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher mapping" });
    }
  });

  app.patch("/api/teacher-mappings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }

      const result = insertTeacherMappingSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const mapping = await storage.updateTeacherMapping(id, result.data);
      if (!mapping) {
        return res.status(404).json({ message: "Teacher mapping not found" });
      }

      res.json(mapping);
    } catch (error) {
      res.status(500).json({ message: "Failed to update teacher mapping" });
    }
  });

  app.delete("/api/teacher-mappings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }

      const deleted = await storage.deleteTeacherMapping(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Teacher mapping not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete teacher mapping" });
    }
  });

  // Roles routes
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const result = insertRoleSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const role = await storage.createRole(result.data);
      res.status(201).json(role);
    } catch (error) {
      console.error("Role creation error:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  app.patch("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      const result = insertRoleSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const role = await storage.updateRole(id, result.data);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      const deleted = await storage.deleteRole(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Subject Routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const { type } = req.query;
      
      if (type && (type === "core" || type === "elective")) {
        const subjects = await storage.getSubjectsByType(type);
        res.json(subjects);
      } else {
        const subjects = await storage.getAllSubjects();
        res.json(subjects);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const result = insertSubjectSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const subject = await storage.createSubject(result.data);
      res.status(201).json(subject);
    } catch (error) {
      console.error("Subject creation error:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.get("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }

      const subject = await storage.getSubject(id);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  app.patch("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }

      const result = insertSubjectSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const subject = await storage.updateSubject(id, result.data);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }

      const deleted = await storage.deleteSubject(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Student Routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/class/:class/division/:division", async (req, res) => {
    try {
      const { class: className, division } = req.params;
      const students = await storage.getStudentsByClassDivision(className, division);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students for class-division" });
    }
  });

  app.get("/api/students/stats", async (req, res) => {
    try {
      const stats = await storage.getClassDivisionStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch class division stats" });
    }
  });

  // New route for getting students with a specific elective subject
  app.get("/api/students/elective/:subjectName", async (req, res) => {
    try {
      const { subjectName } = req.params;
      const students = await storage.getStudentsWithElectiveSubject(subjectName);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students with elective subject" });
    }
  });

  // New route for updating student's elective subjects
  app.patch("/api/students/:id/electives", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }

      const { electiveSubjects } = req.body;
      if (!Array.isArray(electiveSubjects)) {
        return res.status(400).json({ message: "Elective subjects must be an array" });
      }

      const student = await storage.updateStudentElectiveSubjects(id, electiveSubjects);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to update student elective subjects" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const result = insertStudentSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const student = await storage.createStudent(result.data);
      res.status(201).json(student);
    } catch (error) {
      console.error("Student creation error:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }

      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.patch("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }

      const result = insertStudentSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const student = await storage.updateStudent(id, result.data);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }

      const success = await storage.deleteStudent(id);
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // New endpoint to reorder roll numbers for a class-division
  app.post("/api/students/reorder-roll-numbers", async (req, res) => {
    try {
      const { class: className, division } = req.body;
      
      if (!className || !division) {
        return res.status(400).json({ 
          message: "Class and division are required" 
        });
      }

      await storage.reorderRollNumbers(className, division);
      res.json({ message: "Roll numbers reordered successfully" });
    } catch (error) {
      console.error("Roll number reordering error:", error);
      res.status(500).json({ message: "Failed to reorder roll numbers" });
    }
  });

  // Working Days API routes
  app.get("/api/working-days", async (req, res) => {
    try {
      const workingDays = await storage.getAllWorkingDays();
      res.json(workingDays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch working days" });
    }
  });

  app.post("/api/working-days", async (req, res) => {
    try {
      const workingDayData = insertWorkingDaySchema.parse(req.body);
      const workingDay = await storage.upsertWorkingDay(workingDayData);
      res.status(201).json(workingDay);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid working day data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create working day" });
      }
    }
  });

  app.get("/api/working-days/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workingDay = await storage.getWorkingDay(id);
      
      if (!workingDay) {
        return res.status(404).json({ message: "Working day not found" });
      }
      
      res.json(workingDay);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch working day" });
    }
  });

  app.put("/api/working-days/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workingDayData = insertWorkingDaySchema.parse(req.body);
      const updatedWorkingDay = await storage.updateWorkingDay(id, workingDayData);
      
      if (!updatedWorkingDay) {
        return res.status(404).json({ message: "Working day not found" });
      }
      
      res.json(updatedWorkingDay);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid working day data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update working day" });
      }
    }
  });

  app.delete("/api/working-days/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorkingDay(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Working day not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete working day" });
    }
  });

  // School Schedule routes
  app.get("/api/school-schedules", async (req, res) => {
    try {
      const schedules = await storage.getAllSchoolSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch school schedules" });
    }
  });

  app.get("/api/school-schedules/day/:dayOfWeek", async (req, res) => {
    try {
      const { dayOfWeek } = req.params;
      const schedules = await storage.getSchoolSchedulesByDay(dayOfWeek);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch school schedules for day" });
    }
  });

  app.post("/api/school-schedules", async (req, res) => {
    try {
      const result = insertSchoolScheduleSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const schedule = await storage.createSchoolSchedule(result.data);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to create school schedule" });
    }
  });

  app.delete("/api/school-schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid schedule ID" });
      }

      const deleted = await storage.deleteSchoolSchedule(id);
      if (!deleted) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });

  // Time Table routes
  app.get("/api/time-tables", async (req, res) => {
    try {
      const timeTables = await storage.getAllTimeTables();
      res.json(timeTables);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/time-tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timeTable = await storage.getTimeTable(id);
      
      if (!timeTable) {
        return res.status(404).json({ error: "Time table not found" });
      }
      
      res.json(timeTable);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/time-tables/:id/entries", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entries = await storage.getTimeTableEntriesByTimeTable(id);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/time-tables", async (req, res) => {
    try {
      const validatedData = insertTimeTableSchema.parse(req.body);
      
      // Check if time table already exists for this class-division
      const existing = await storage.getTimeTableByClassDivision(
        validatedData.className, 
        validatedData.division
      );
      
      if (existing) {
        return res.status(400).json({ 
          error: "Time table already exists for this class-division" 
        });
      }
      
      const timeTable = await storage.createTimeTable(validatedData);
      res.status(201).json(timeTable);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/time-table-entries", async (req, res) => {
    try {
      const validatedData = insertTimeTableEntrySchema.parse(req.body);
      
      // Check for teacher conflicts if teacherId is provided
      if (validatedData.teacherId) {
        const hasConflict = await storage.checkTeacherConflict(
          validatedData.dayOfWeek,
          validatedData.scheduleSlot,
          validatedData.teacherId
        );
        
        if (hasConflict) {
          return res.status(409).json({ 
            error: "Teacher conflict: This teacher is already assigned to another class at the same time" 
          });
        }
      }
      
      const entry = await storage.createTimeTableEntry(validatedData);
      res.status(201).json(entry);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/time-table-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTimeTableEntrySchema.partial().parse(req.body);
      
      // Check for teacher conflicts if teacherId is being updated
      if (validatedData.teacherId && validatedData.dayOfWeek && validatedData.scheduleSlot) {
        const existing = await storage.getTimeTableEntries(0).then(entries => 
          entries.find(e => e.id === id)
        );
        
        if (existing) {
          const hasConflict = await storage.checkTeacherConflict(
            validatedData.dayOfWeek,
            validatedData.scheduleSlot,
            validatedData.teacherId,
            existing.timeTableId // Exclude current time table from conflict check
          );
          
          if (hasConflict) {
            return res.status(409).json({ 
              error: "Teacher conflict: This teacher is already assigned to another class at the same time" 
            });
          }
        }
      }
      
      const entry = await storage.updateTimeTableEntry(id, validatedData);
      
      if (!entry) {
        return res.status(404).json({ error: "Time table entry not found" });
      }
      
      res.json(entry);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/time-tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTimeTable(id);
      
      if (!success) {
        return res.status(404).json({ error: "Time table not found" });
      }
      
      res.status(200).json({ message: "Time table deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Syllabus Master routes
  app.get("/api/syllabus-masters", async (req, res) => {
    try {
      const syllabusMasters = await storage.getAllSyllabusMasters();
      res.json(syllabusMasters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch syllabus masters" });
    }
  });

  app.post("/api/syllabus-masters", async (req, res) => {
    try {
      const result = insertSyllabusMasterSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const syllabus = await storage.createSyllabusMaster(result.data);
      res.status(201).json(syllabus);
    } catch (error) {
      console.error("Syllabus master creation error:", error);
      res.status(500).json({ message: "Failed to create syllabus master" });
    }
  });

  app.get("/api/syllabus-masters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid syllabus master ID" });
      }

      const syllabus = await storage.getSyllabusMaster(id);
      if (!syllabus) {
        return res.status(404).json({ message: "Syllabus master not found" });
      }
      
      res.json(syllabus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch syllabus master" });
    }
  });

  app.patch("/api/syllabus-masters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid syllabus master ID" });
      }

      const result = insertSyllabusMasterSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const syllabus = await storage.updateSyllabusMaster(id, result.data);
      if (!syllabus) {
        return res.status(404).json({ message: "Syllabus master not found" });
      }

      res.json(syllabus);
    } catch (error) {
      res.status(500).json({ message: "Failed to update syllabus master" });
    }
  });

  app.delete("/api/syllabus-masters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid syllabus master ID" });
      }

      const deleted = await storage.deleteSyllabusMaster(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Syllabus master not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete syllabus master" });
    }
  });

  // Periodic Test routes
  app.get("/api/periodic-tests", async (req, res) => {
    try {
      const tests = await storage.getAllPeriodicTests();
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch periodic tests" });
    }
  });

  app.post("/api/periodic-tests", async (req, res) => {
    try {
      const result = insertPeriodicTestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const test = await storage.createPeriodicTest(result.data);
      res.status(201).json(test);
    } catch (error) {
      console.error("Periodic test creation error:", error);
      res.status(500).json({ message: "Failed to create periodic test" });
    }
  });

  app.get("/api/periodic-tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid periodic test ID" });
      }

      const test = await storage.getPeriodicTest(id);
      if (!test) {
        return res.status(404).json({ message: "Periodic test not found" });
      }
      
      res.json(test);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch periodic test" });
    }
  });

  app.patch("/api/periodic-tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid periodic test ID" });
      }

      const result = insertPeriodicTestSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const test = await storage.updatePeriodicTest(id, result.data);
      if (!test) {
        return res.status(404).json({ message: "Periodic test not found" });
      }

      res.json(test);
    } catch (error) {
      res.status(500).json({ message: "Failed to update periodic test" });
    }
  });

  app.delete("/api/periodic-tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid periodic test ID" });
      }

      const deleted = await storage.deletePeriodicTest(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Periodic test not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete periodic test" });
    }
  });

  // Public Holiday routes
  app.get("/api/public-holidays", async (req, res) => {
    try {
      const holidays = await storage.getAllPublicHolidays();
      res.json(holidays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public holidays" });
    }
  });

  app.get("/api/public-holidays/year/:year", async (req, res) => {
    try {
      const year = req.params.year;
      const holidays = await storage.getPublicHolidaysByYear(year);
      res.json(holidays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public holidays by year" });
    }
  });

  app.post("/api/public-holidays", async (req, res) => {
    try {
      const result = insertPublicHolidaySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const holiday = await storage.createPublicHoliday(result.data);
      res.status(201).json(holiday);
    } catch (error) {
      console.error("Public holiday creation error:", error);
      res.status(500).json({ message: "Failed to create public holiday" });
    }
  });

  app.get("/api/public-holidays/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid public holiday ID" });
      }

      const holiday = await storage.getPublicHoliday(id);
      if (!holiday) {
        return res.status(404).json({ message: "Public holiday not found" });
      }
      
      res.json(holiday);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public holiday" });
    }
  });

  app.patch("/api/public-holidays/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid public holiday ID" });
      }

      const result = insertPublicHolidaySchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const holiday = await storage.updatePublicHoliday(id, result.data);
      if (!holiday) {
        return res.status(404).json({ message: "Public holiday not found" });
      }

      res.json(holiday);
    } catch (error) {
      res.status(500).json({ message: "Failed to update public holiday" });
    }
  });

  app.delete("/api/public-holidays/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid public holiday ID" });
      }

      const deleted = await storage.deletePublicHoliday(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Public holiday not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete public holiday" });
    }
  });

  // HandBook routes
  app.get("/api/handbooks", async (req, res) => {
    try {
      const handBooks = await storage.getAllHandBooks();
      res.json(handBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch handbooks" });
    }
  });

  app.get("/api/handbooks/year/:year", async (req, res) => {
    try {
      const year = req.params.year;
      const handBooks = await storage.getHandBooksByYear(year);
      res.json(handBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch handbooks by year" });
    }
  });

  app.post("/api/handbooks", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { year } = req.body;
      
      if (!year) {
        return res.status(400).json({ message: "Year is required" });
      }

      const handBookData = {
        year,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
      };

      const result = insertHandBookSchema.safeParse(handBookData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const handBook = await storage.createHandBook(result.data);
      res.status(201).json(handBook);
    } catch (error) {
      console.error("HandBook creation error:", error);
      res.status(500).json({ message: "Failed to create handbook" });
    }
  });

  app.get("/api/handbooks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid handbook ID" });
      }

      const handBook = await storage.getHandBook(id);
      if (!handBook) {
        return res.status(404).json({ message: "Handbook not found" });
      }
      
      res.json(handBook);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch handbook" });
    }
  });

  app.delete("/api/handbooks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid handbook ID" });
      }

      const handBook = await storage.getHandBook(id);
      if (!handBook) {
        return res.status(404).json({ message: "Handbook not found" });
      }

      // Delete the file from filesystem
      if (fs.existsSync(handBook.filePath)) {
        fs.unlinkSync(handBook.filePath);
      }

      const deleted = await storage.deleteHandBook(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Handbook not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete handbook" });
    }
  });

  // Newsletter routes
  app.get("/api/newsletters", async (req, res) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      res.json(newsletters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.post("/api/newsletters", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { year, topicName } = req.body;
      
      if (!year || !topicName) {
        return res.status(400).json({ message: "Year and topic name are required" });
      }

      const newsletterData = {
        year,
        topicName,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
      };

      const result = insertNewsletterSchema.safeParse(newsletterData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const newsletter = await storage.createNewsletter(result.data);
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Newsletter creation error:", error);
      res.status(500).json({ message: "Failed to create newsletter" });
    }
  });

  app.get("/api/newsletters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid newsletter ID" });
      }

      const newsletter = await storage.getNewsletter(id);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      res.json(newsletter);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletter" });
    }
  });

  app.patch("/api/newsletters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid newsletter ID" });
      }

      const result = insertNewsletterSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const newsletter = await storage.updateNewsletter(id, result.data);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }

      res.json(newsletter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update newsletter" });
    }
  });

  app.delete("/api/newsletters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid newsletter ID" });
      }

      const newsletter = await storage.getNewsletter(id);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }

      // Delete the file from filesystem
      if (fs.existsSync(newsletter.filePath)) {
        fs.unlinkSync(newsletter.filePath);
      }

      const deleted = await storage.deleteNewsletter(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete newsletter" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const result = insertEventSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const event = await storage.createEvent(result.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const result = insertEventSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const event = await storage.updateEvent(id, result.data);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const deleted = await storage.deleteEvent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Bus Route routes
  app.get("/api/bus-routes", async (req, res) => {
    try {
      const busRoutes = await storage.getAllBusRoutes();
      res.json(busRoutes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus routes" });
    }
  });

  app.post("/api/bus-routes", async (req, res) => {
    try {
      const result = insertBusRouteSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const busRoute = await storage.createBusRoute(result.data);
      res.status(201).json(busRoute);
    } catch (error) {
      console.error("Bus route creation error:", error);
      res.status(500).json({ message: "Failed to create bus route" });
    }
  });

  app.get("/api/bus-routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bus route ID" });
      }

      const busRoute = await storage.getBusRoute(id);
      if (!busRoute) {
        return res.status(404).json({ message: "Bus route not found" });
      }
      
      res.json(busRoute);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus route" });
    }
  });

  app.patch("/api/bus-routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bus route ID" });
      }

      const result = insertBusRouteSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const busRoute = await storage.updateBusRoute(id, result.data);
      if (!busRoute) {
        return res.status(404).json({ message: "Bus route not found" });
      }

      res.json(busRoute);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bus route" });
    }
  });

  app.delete("/api/bus-routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bus route ID" });
      }

      const deleted = await storage.deleteBusRoute(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Bus route not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bus route" });
    }
  });

  // News/Circular routes
  app.get("/api/news-circulars", async (req, res) => {
    try {
      const newsCirculars = await storage.getAllNewsCirculars();
      res.json(newsCirculars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news/circulars" });
    }
  });

  app.post("/api/news-circulars", upload.single('file'), async (req, res) => {
    try {
      const newsCircularData = req.body;
      
      // Add file information if file was uploaded
      if (req.file) {
        newsCircularData.fileName = req.file.filename;
        newsCircularData.filePath = req.file.path;
        newsCircularData.fileSize = req.file.size;
      }
      
      const result = insertNewsCircularSchema.safeParse(newsCircularData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const newsCircular = await storage.createNewsCircular(result.data);
      res.status(201).json(newsCircular);
    } catch (error) {
      console.error("News/Circular creation error:", error);
      res.status(500).json({ message: "Failed to create news/circular" });
    }
  });

  app.get("/api/news-circulars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid news/circular ID" });
      }

      const newsCircular = await storage.getNewsCircular(id);
      if (!newsCircular) {
        return res.status(404).json({ message: "News/circular not found" });
      }

      res.json(newsCircular);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news/circular" });
    }
  });

  app.put("/api/news-circulars/:id", upload.single('file'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid news/circular ID" });
      }

      const newsCircularData = req.body;
      
      // Add file information if file was uploaded
      if (req.file) {
        newsCircularData.fileName = req.file.filename;
        newsCircularData.filePath = req.file.path;
        newsCircularData.fileSize = req.file.size;
      }

      const result = insertNewsCircularSchema.partial().safeParse(newsCircularData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const newsCircular = await storage.updateNewsCircular(id, result.data);
      if (!newsCircular) {
        return res.status(404).json({ message: "News/circular not found" });
      }

      res.json(newsCircular);
    } catch (error) {
      res.status(500).json({ message: "Failed to update news/circular" });
    }
  });

  app.delete("/api/news-circulars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid news/circular ID" });
      }

      const deleted = await storage.deleteNewsCircular(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "News/circular not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete news/circular" });
    }
  });

  // Photo Gallery routes
  app.get("/api/photo-galleries", async (req, res) => {
    try {
      const photoGalleries = await storage.getAllPhotoGalleries();
      res.json(photoGalleries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photo galleries" });
    }
  });

  app.post("/api/photo-galleries", upload.array('images', 20), async (req, res) => {
    try {
      const photoGalleryData = req.body;
      
      // Process uploaded images
      if (req.files && Array.isArray(req.files)) {
        photoGalleryData.imagePaths = req.files.map(file => file.path);
        photoGalleryData.imageCount = req.files.length;
      } else {
        photoGalleryData.imagePaths = [];
        photoGalleryData.imageCount = 0;
      }

      const result = insertPhotoGallerySchema.safeParse(photoGalleryData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const photoGallery = await storage.createPhotoGallery(result.data);
      res.status(201).json(photoGallery);
    } catch (error) {
      console.error("Photo gallery creation error:", error);
      res.status(500).json({ message: "Failed to create photo gallery" });
    }
  });

  app.get("/api/photo-galleries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid photo gallery ID" });
      }

      const photoGallery = await storage.getPhotoGallery(id);
      if (!photoGallery) {
        return res.status(404).json({ message: "Photo gallery not found" });
      }

      res.json(photoGallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photo gallery" });
    }
  });

  app.put("/api/photo-galleries/:id", upload.array('images', 20), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid photo gallery ID" });
      }

      const photoGalleryData = req.body;
      
      // Process uploaded images if any
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        photoGalleryData.imagePaths = req.files.map(file => file.path);
        photoGalleryData.imageCount = req.files.length;
      }

      const result = insertPhotoGallerySchema.partial().safeParse(photoGalleryData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const photoGallery = await storage.updatePhotoGallery(id, result.data);
      if (!photoGallery) {
        return res.status(404).json({ message: "Photo gallery not found" });
      }

      res.json(photoGallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to update photo gallery" });
    }
  });

  app.delete("/api/photo-galleries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid photo gallery ID" });
      }

      const deleted = await storage.deletePhotoGallery(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Photo gallery not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo gallery" });
    }
  });

  // Poll routes
  app.get("/api/polls", async (req, res) => {
    try {
      const polls = await storage.getAllPolls();
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  app.post("/api/polls", async (req, res) => {
    try {
      const result = insertPollSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const poll = await storage.createPoll(result.data);
      res.status(201).json(poll);
    } catch (error) {
      console.error("Poll creation error:", error);
      res.status(500).json({ message: "Failed to create poll" });
    }
  });

  app.get("/api/polls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }

      const poll = await storage.getPoll(id);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }

      res.json(poll);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch poll" });
    }
  });

  app.put("/api/polls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }

      const result = insertPollSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const poll = await storage.updatePoll(id, result.data);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }

      res.json(poll);
    } catch (error) {
      res.status(500).json({ message: "Failed to update poll" });
    }
  });

  app.delete("/api/polls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid poll ID" });
      }

      const deleted = await storage.deletePoll(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Poll not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete poll" });
    }
  });

  // Survey routes
  app.get("/api/surveys", async (req, res) => {
    try {
      const surveys = await storage.getAllSurveys();
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  app.post("/api/surveys", async (req, res) => {
    try {
      const result = insertSurveySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const survey = await storage.createSurvey(result.data);
      res.status(201).json(survey);
    } catch (error) {
      console.error("Survey creation error:", error);
      res.status(500).json({ message: "Failed to create survey" });
    }
  });

  app.get("/api/surveys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }

      const survey = await storage.getSurvey(id);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }

      res.json(survey);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });

  app.put("/api/surveys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }

      const result = insertSurveySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const survey = await storage.updateSurvey(id, result.data);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }

      res.json(survey);
    } catch (error) {
      res.status(500).json({ message: "Failed to update survey" });
    }
  });

  app.delete("/api/surveys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }

      const deleted = await storage.deleteSurvey(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete survey" });
    }
  });

  // Mock Test routes
  app.get("/api/mock-tests", async (req, res) => {
    try {
      const mockTests = await storage.getAllMockTests();
      res.json(mockTests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mock tests" });
    }
  });

  app.post("/api/mock-tests", upload.single('file'), async (req, res) => {
    try {
      const bodyData = { ...req.body };
      
      // Handle file upload
      if (req.file) {
        bodyData.fileName = req.file.originalname;
        bodyData.filePath = req.file.path;
        bodyData.fileSize = req.file.size;
      }

      // Parse JSON strings
      if (typeof bodyData.subjects === 'string') {
        bodyData.subjects = JSON.parse(bodyData.subjects);
      }
      if (typeof bodyData.class === 'string') {
        bodyData.class = JSON.parse(bodyData.class);
      }
      if (typeof bodyData.division === 'string') {
        bodyData.division = JSON.parse(bodyData.division);
      }
      if (typeof bodyData.questions === 'string') {
        bodyData.questions = JSON.parse(bodyData.questions);
      }
      
      // Convert string booleans to actual booleans
      if (typeof bodyData.hasFileUpload === 'string') {
        bodyData.hasFileUpload = bodyData.hasFileUpload === 'true';
      }

      const result = insertMockTestSchema.safeParse(bodyData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const mockTest = await storage.createMockTest(result.data);
      res.status(201).json(mockTest);
    } catch (error) {
      console.error("Mock test creation error:", error);
      res.status(500).json({ message: "Failed to create mock test" });
    }
  });

  app.get("/api/mock-tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mock test ID" });
      }

      const mockTest = await storage.getMockTest(id);
      if (!mockTest) {
        return res.status(404).json({ message: "Mock test not found" });
      }

      res.json(mockTest);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mock test" });
    }
  });

  app.put("/api/mock-tests/:id", upload.single('file'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mock test ID" });
      }

      const bodyData = { ...req.body };
      
      // Handle file upload
      if (req.file) {
        bodyData.fileName = req.file.originalname;
        bodyData.filePath = req.file.path;
        bodyData.fileSize = req.file.size;
      }

      // Parse JSON strings
      if (typeof bodyData.subjects === 'string') {
        bodyData.subjects = JSON.parse(bodyData.subjects);
      }
      if (typeof bodyData.class === 'string') {
        bodyData.class = JSON.parse(bodyData.class);
      }
      if (typeof bodyData.division === 'string') {
        bodyData.division = JSON.parse(bodyData.division);
      }
      if (typeof bodyData.questions === 'string') {
        bodyData.questions = JSON.parse(bodyData.questions);
      }
      
      // Convert string booleans to actual booleans
      if (typeof bodyData.hasFileUpload === 'string') {
        bodyData.hasFileUpload = bodyData.hasFileUpload === 'true';
      }

      const result = insertMockTestSchema.partial().safeParse(bodyData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const mockTest = await storage.updateMockTest(id, result.data);
      if (!mockTest) {
        return res.status(404).json({ message: "Mock test not found" });
      }

      res.json(mockTest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update mock test" });
    }
  });

  app.delete("/api/mock-tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mock test ID" });
      }

      const deleted = await storage.deleteMockTest(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Mock test not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete mock test" });
    }
  });

  // Test Results routes
  app.get("/api/test-results", async (req, res) => {
    try {
      const testResults = await storage.getAllTestResults();
      res.json(testResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  app.get("/api/test-results/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid test result ID" });
      }

      const testResult = await storage.getTestResult(id);
      if (!testResult) {
        return res.status(404).json({ message: "Test result not found" });
      }

      res.json(testResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test result" });
    }
  });

  app.get("/api/test-results/periodic-test/:periodicTestId", async (req, res) => {
    try {
      const periodicTestId = parseInt(req.params.periodicTestId);
      if (isNaN(periodicTestId)) {
        return res.status(400).json({ message: "Invalid periodic test ID" });
      }

      const testResults = await storage.getTestResultsByPeriodicTest(periodicTestId);
      res.json(testResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test results for periodic test" });
    }
  });

  app.get("/api/test-results/class/:class/division/:division", async (req, res) => {
    try {
      const { class: className, division } = req.params;
      const testResults = await storage.getTestResultsByClassDivision(className, division);
      res.json(testResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test results for class/division" });
    }
  });

  app.post("/api/test-results", async (req, res) => {
    try {
      const result = insertTestResultSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const testResult = await storage.createTestResult(result.data);
      res.status(201).json(testResult);
    } catch (error) {
      console.error("Test result creation error:", error);
      res.status(500).json({ message: "Failed to create test result" });
    }
  });

  app.post("/api/test-results/bulk", async (req, res) => {
    try {
      const results = z.array(insertTestResultSchema).safeParse(req.body);
      
      if (!results.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: results.error.errors 
        });
      }

      const testResults = await storage.bulkCreateTestResults(results.data);
      res.status(201).json(testResults);
    } catch (error) {
      console.error("Bulk test result creation error:", error);
      res.status(500).json({ message: "Failed to create test results" });
    }
  });

  app.put("/api/test-results/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid test result ID" });
      }

      const result = insertTestResultSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors 
        });
      }

      const testResult = await storage.updateTestResult(id, result.data);
      if (!testResult) {
        return res.status(404).json({ message: "Test result not found" });
      }

      res.json(testResult);
    } catch (error) {
      console.error("Test result update error:", error);
      res.status(500).json({ message: "Failed to update test result" });
    }
  });

  app.delete("/api/test-results/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid test result ID" });
      }

      const success = await storage.deleteTestResult(id);
      if (!success) {
        return res.status(404).json({ message: "Test result not found" });
      }

      res.json({ message: "Test result deleted successfully" });
    } catch (error) {
      console.error("Test result deletion error:", error);
      res.status(500).json({ message: "Failed to delete test result" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
