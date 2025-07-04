import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertStaffSchema, insertClassMappingSchema, insertTeacherMappingSchema, insertRoleSchema, insertSubjectSchema, insertStudentSchema, insertWorkingDaySchema, insertSchoolScheduleSchema } from "@shared/schema";
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
    if (file.mimetype.startsWith('image/')) {
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
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
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

      const deleted = await storage.deleteStudent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
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

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
