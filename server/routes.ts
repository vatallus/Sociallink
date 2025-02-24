import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertBiolinkSchema, insertSocialLinkSchema, insertAvailabilitySettingSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export async function registerRoutes(app: Express) {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for avatar uploads
  const storageMulter = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storageMulter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF allowed.'));
      }
    }
  });

  // Protect all API routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Biolink routes
  app.post("/api/biolinks", requireAuth, async (req, res) => {
    try {
      const biolinkData = insertBiolinkSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const biolink = await storage.createBiolink(biolinkData);
      res.json(biolink);
    } catch (error) {
      res.status(400).json({ error: "Invalid biolink data" });
    }
  });

  app.get("/api/biolinks", requireAuth, async (req, res) => {
    const biolinks = await storage.getBiolinksByUserId(req.user!.id);
    res.json(biolinks);
  });

  app.get("/api/biolinks/:id", requireAuth, async (req, res) => {
    const biolink = await storage.getBiolink(parseInt(req.params.id));
    if (!biolink || biolink.userId !== req.user!.id) {
      return res.status(404).json({ error: "Biolink not found" });
    }
    res.json(biolink);
  });

  app.patch("/api/biolinks/:id", requireAuth, async (req, res) => {
    try {
      const biolink = await storage.getBiolink(parseInt(req.params.id));
      if (!biolink || biolink.userId !== req.user!.id) {
        return res.status(404).json({ error: "Biolink not found" });
      }
      const updatedBiolink = await storage.updateBiolink(parseInt(req.params.id), req.body);
      res.json(updatedBiolink);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Social link routes
  app.post("/api/biolinks/:biolinkId/social-links", requireAuth, async (req, res) => {
    try {
      const biolink = await storage.getBiolink(parseInt(req.params.biolinkId));
      if (!biolink || biolink.userId !== req.user!.id) {
        return res.status(404).json({ error: "Biolink not found" });
      }
      const socialLinkData = insertSocialLinkSchema.parse({
        ...req.body,
        biolinkId: parseInt(req.params.biolinkId)
      });
      const socialLink = await storage.createSocialLink(socialLinkData);
      res.json(socialLink);
    } catch (error) {
      res.status(400).json({ error: "Invalid social link data" });
    }
  });

  app.get("/api/biolinks/:biolinkId/social-links", requireAuth, async (req, res) => {
    const biolink = await storage.getBiolink(parseInt(req.params.biolinkId));
    if (!biolink || biolink.userId !== req.user!.id) {
      return res.status(404).json({ error: "Biolink not found" });
    }
    const socialLinks = await storage.getSocialLinksByBiolinkId(parseInt(req.params.biolinkId));
    res.json(socialLinks);
  });

  app.patch("/api/social-links/:id", requireAuth, async (req, res) => {
    try {
      const socialLink = await storage.updateSocialLink(parseInt(req.params.id), req.body);
      res.json(socialLink);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/social-links/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSocialLink(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ error: "Failed to delete social link" });
    }
  });

  // Public biolink routes
  app.get("/api/public/biolinks/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const biolinks = await storage.getBiolinksByUserId(user.id);
      if (!biolinks || biolinks.length === 0) {
        return res.status(404).json({ error: "Biolink not found" });
      }

      // Return the first biolink (assuming one biolink per user for now)
      res.json(biolinks[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch biolink" });
    }
  });

  app.get("/api/public/biolinks/:id/social-links", async (req, res) => {
    try {
      const socialLinks = await storage.getSocialLinksByBiolinkId(parseInt(req.params.id));
      res.json(socialLinks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social links" });
    }
  });

  // Updated and new appointment routes
  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  app.get("/api/appointments", requireAuth, async (req, res) => {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const appointments = date
      ? await storage.getAppointmentsByDate(date)
      : await storage.getAppointments();
    res.json(appointments);
  });

  app.patch("/api/appointments/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = updateStatusSchema.parse(req.body);
      const appointment = await storage.updateAppointmentStatus(parseInt(id), status);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid status update request" });
    }
  });

  // New availability routes
  app.post("/api/availability", requireAuth, async (req, res) => {
    try {
      const settingData = insertAvailabilitySettingSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const setting = await storage.createAvailabilitySetting(settingData);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: "Invalid availability setting data" });
    }
  });

  app.get("/api/availability", requireAuth, async (req, res) => {
    const settings = await storage.getAvailabilitySettings(req.user!.id);
    res.json(settings);
  });

  app.patch("/api/availability/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const setting = await storage.updateAvailabilitySetting(parseInt(id), req.body);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: "Invalid availability update request" });
    }
  });

  // Update the available slots route
  app.get("/api/available-slots/:userId/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      if (!date || isNaN(new Date(date).getTime())) {
        return res.status(400).json({ error: "Invalid date" });
      }

      const slots = await storage.getAvailableTimeSlots(parseInt(userId), new Date(date));
      res.json(slots);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch available slots" });
    }
  });

  // Update the profile route
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const { name, address, avatarUrl } = req.body;
      const user = await storage.updateUser(req.user!.id, {
        name,
        address,
        avatarUrl,
      });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  // Add this route with the other public routes
  app.get("/api/public/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Only send non-sensitive user information
      const { password, ...publicUserInfo } = user;
      res.json(publicUserInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user information" });
    }
  });

  // Add avatar upload route
  app.post("/api/user/avatar", requireAuth, upload.single('avatar'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Generate URL for the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;

      // Update user's avatar URL
      await storage.updateUser(req.user!.id, {
        avatarUrl: fileUrl
      });

      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload avatar" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  return createServer(app);
}