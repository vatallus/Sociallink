import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export async function registerRoutes(app: Express) {
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const appointments = date 
      ? await storage.getAppointmentsByDate(date)
      : await storage.getAppointments();
    res.json(appointments);
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
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