import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: text("status").notNull().default("pending"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  appointmentDate: z.date(),
});