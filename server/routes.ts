import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export async function registerRoutes(app: Express) {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Protect appointment routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

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

  return createServer(app);
}