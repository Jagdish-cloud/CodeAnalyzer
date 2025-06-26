import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertInstitutionSchema, insertStaffSchema, insertClassMappingSchema } from "@shared/schema";
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
  // Get all institutions
  app.get("/api/institutions", async (req, res) => {
    try {
      const institutions = await storage.getAllInstitutions();
      res.json(institutions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch institutions" });
    }
  });

  // Get single institution
  app.get("/api/institutions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid institution ID" });
      }

      const institution = await storage.getInstitution(id);
      if (!institution) {
        return res.status(404).json({ message: "Institution not found" });
      }

      res.json(institution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch institution" });
    }
  });

  // Create institution with file upload
  app.post("/api/institutions", upload.single('inst_logo'), async (req, res) => {
    try {
      let institutionData;
      
      try {
        institutionData = JSON.parse(req.body.institutionData || '{}');
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid JSON data" });
      }

      // Add logo path if file was uploaded
      if (req.file) {
        institutionData.inst_logo = `/uploads/${req.file.filename}`;
      }

      // Validate the data
      const validatedData = insertInstitutionSchema.parse(institutionData);

      const institution = await storage.createInstitution(validatedData);
      res.status(201).json(institution);
    } catch (error) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }

      res.status(500).json({ message: "Failed to create institution" });
    }
  });

  // Update institution
  app.patch("/api/institutions/:id", upload.single('inst_logo'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid institution ID" });
      }

      let updateData;
      
      try {
        updateData = JSON.parse(req.body.institutionData || '{}');
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid JSON data" });
      }

      // Add logo path if file was uploaded
      if (req.file) {
        updateData.inst_logo = `/uploads/${req.file.filename}`;
      }

      const institution = await storage.updateInstitution(id, updateData);
      if (!institution) {
        return res.status(404).json({ message: "Institution not found" });
      }

      res.json(institution);
    } catch (error) {
      // Clean up uploaded file if update fails
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      res.status(500).json({ message: "Failed to update institution" });
    }
  });

  // Delete institution
  app.delete("/api/institutions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid institution ID" });
      }

      const deleted = await storage.deleteInstitution(id);
      if (!deleted) {
        return res.status(404).json({ message: "Institution not found" });
      }

      res.json({ message: "Institution deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete institution" });
    }
  });

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

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
