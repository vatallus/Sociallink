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

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  biolinkId: serial("biolink_id").references(() => biolinks.id),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  order: serial("order").notNull(),
  isActive: text("is_active").default("true"),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull().default(30),
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

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
}).extend({
  duration: z.number().min(15).max(180),
  biolinkId: z.number().optional(),
  specialty: z.string().optional(),
  clinicAddress: z.string().optional(),
});

export const insertAvailabilitySettingSchema = createInsertSchema(availabilitySettings).omit({
  id: true,
});

export const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  phoneNumber: z.string().min(10, "Vui lòng nhập số điện thoại hợp lệ"),
  appointmentDate: z.date(),
  duration: z.number().min(15).max(180),
  notes: z.string().optional(),
  biolinkId: z.number().optional(), 
  specialty: z.string().optional(),
  clinicAddress: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBiolink = z.infer<typeof insertBiolinkSchema>;
export type Biolink = typeof biolinks.$inferSelect;

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type AvailabilitySetting = typeof availabilitySettings.$inferSelect;
export type InsertAvailabilitySetting = z.infer<typeof insertAvailabilitySettingSchema>;