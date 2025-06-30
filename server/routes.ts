import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertStaffSchema, insertClassMappingSchema, insertTeacherMappingSchema, insertRoleSchema, insertStudentSchema } from "@shared/schema";
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

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
