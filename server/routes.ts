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

  app.get("/api/available-slots", requireAuth, async (req, res) => {
    try {
      const date = new Date(req.query.date as string);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid date" });
      }

      const slots = await storage.getAvailableTimeSlots(req.user!.id, date);
      res.json(slots);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch available slots" });
    }
  });

  return createServer(app);
}