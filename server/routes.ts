import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertBiolinkSchema, insertSocialLinkSchema, insertAvailabilitySettingSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export async function registerRoutes(app: Express) {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Protect all API routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

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
      console.error("Error fetching biolink:", error);
      res.status(500).json({ error: "Failed to fetch biolink" });
    }
  });

  app.get("/api/public/biolinks/:id/social-links", async (req, res) => {
    try {
      const socialLinks = await storage.getSocialLinksByBiolinkId(parseInt(req.params.id));
      res.json(socialLinks);
    } catch (error) {
      console.error("Error fetching social links:", error);
      res.status(500).json({ error: "Failed to fetch social links" });
    }
  });

  // Public booking endpoints
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        status: "pending", // Always set initial status as pending
      });
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  // Protected routes below this line
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

  return createServer(app);
}