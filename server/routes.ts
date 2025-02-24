import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertTimeSlotSchema } from "@shared/schema";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export async function registerRoutes(app: Express) {
  // Time slots routes
  app.post("/api/time-slots", async (req, res) => {
    try {
      const timeSlotData = insertTimeSlotSchema.parse(req.body);
      const timeSlot = await storage.createTimeSlot(timeSlotData);
      res.json(timeSlot);
    } catch (error) {
      res.status(400).json({ error: "Invalid time slot data" });
    }
  });

  app.get("/api/time-slots/available", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const timeSlots = await storage.getAvailableTimeSlots(date);
      res.json(timeSlots);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch time slots" });
    }
  });

  // Existing appointment routes
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