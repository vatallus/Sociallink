import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  address: text("address"),
  avatarUrl: text("avatar_url"),
  specialty: text("specialty"),
  clinicAddress: text("clinic_address"),
  workingHours: text("working_hours"),
});

export const biolinks = pgTable("biolinks", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  theme: text("theme").default("default"),
  specialty: text("specialty"),        
  clinicAddress: text("clinic_address"), 
  workingHours: text("working_hours"), 
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  biolinkId: serial("biolink_id").references(() => biolinks.id), 
  specialty: text("specialty"),        
  clinicAddress: text("clinic_address"), 
});

export const availabilitySettings = pgTable("availability_settings", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  bufferTime: integer("buffer_time").default(15),
  slotDuration: integer("slot_duration").default(30),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
}).extend({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().optional(),
  specialty: z.string().optional(),
  clinicAddress: z.string().optional(),
  workingHours: z.string().optional(),
});

export const insertBiolinkSchema = createInsertSchema(biolinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
}).extend({
  biolinkId: z.number().optional(),
  specialty: z.string().optional(),
  clinicAddress: z.string().optional(),
});

export const insertAvailabilitySettingSchema = createInsertSchema(availabilitySettings).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Biolink = typeof biolinks.$inferSelect;
export type InsertBiolink = z.infer<typeof insertBiolinkSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type AvailabilitySetting = typeof availabilitySettings.$inferSelect;
export type InsertAvailabilitySetting = z.infer<typeof insertAvailabilitySettingSchema>;