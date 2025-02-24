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

  // Configure uploads directory
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

  // Public endpoints that don't require authentication
  app.get("/api/public/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...publicUserInfo } = user;
      res.json(publicUserInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user information" });
    }
  });

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

      const biolink = biolinks[0];
      const socialLinks = await storage.getSocialLinksByBiolinkId(biolink.id);

      res.json({
        ...biolink,
        socialLinks
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch biolink" });
    }
  });

  // Authentication middleware for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Apply authentication middleware to protected routes
  app.use('/api/biolinks', requireAuth);
  app.use('/api/social-links', requireAuth);
  app.use('/api/appointments', requireAuth);
  app.use('/api/availability', requireAuth);
  app.use('/api/user', requireAuth);

  // Protected routes
  app.post("/api/biolinks", async (req, res) => {
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

  app.get("/api/biolinks", async (req, res) => {
    const biolinks = await storage.getBiolinksByUserId(req.user!.id);
    res.json(biolinks);
  });

  app.get("/api/biolinks/:id", async (req, res) => {
    const biolink = await storage.getBiolink(parseInt(req.params.id));
    if (!biolink || biolink.userId !== req.user!.id) {
      return res.status(404).json({ error: "Biolink not found" });
    }
    res.json(biolink);
  });

  app.patch("/api/biolinks/:id", async (req, res) => {
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

  app.delete("/api/biolinks/:id", async (req, res) => {
    try {
      const biolink = await storage.getBiolink(parseInt(req.params.id));
      if (!biolink || biolink.userId !== req.user!.id) {
        return res.status(404).json({ error: "Biolink not found" });
      }
      await storage.deleteBiolink(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete biolink" });
    }
  });

  app.post("/api/biolinks/:biolinkId/social-links", async (req, res) => {
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

  app.get("/api/biolinks/:biolinkId/social-links", async (req, res) => {
    const biolink = await storage.getBiolink(parseInt(req.params.biolinkId));
    if (!biolink || biolink.userId !== req.user!.id) {
      return res.status(404).json({ error: "Biolink not found" });
    }
    const socialLinks = await storage.getSocialLinksByBiolinkId(parseInt(req.params.biolinkId));
    res.json(socialLinks);
  });

  // User profile and avatar routes
  app.patch("/api/user/profile", async (req, res) => {
    try {
      const { name, address, avatarUrl } = req.body;
      const user = await storage.updateUser(req.user!.id, { name, address, avatarUrl });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/user/avatar", upload.single('avatar'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      await storage.updateUser(req.user!.id, { avatarUrl: fileUrl });
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload avatar" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  return createServer(app);
}