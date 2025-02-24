import { appointments, users, biolinks, socialLinks, availabilitySettings, 
  type Appointment, type InsertAppointment, type User, type InsertUser, 
  type Biolink, type InsertBiolink, type SocialLink, type InsertSocialLink,
  type AvailabilitySetting, type InsertAvailabilitySetting } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, between } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;

  // Biolink methods
  createBiolink(biolink: InsertBiolink): Promise<Biolink>;
  getBiolink(id: number): Promise<Biolink | undefined>;
  getBiolinkBySlug(slug: string): Promise<Biolink | undefined>;
  getBiolinksByUserId(userId: number): Promise<Biolink[]>;
  updateBiolink(id: number, biolink: Partial<InsertBiolink>): Promise<Biolink>;
  deleteBiolink(id: number): Promise<void>;

  // Social link methods
  createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink>;
  getSocialLinksByBiolinkId(biolinkId: number): Promise<SocialLink[]>;
  updateSocialLink(id: number, socialLink: Partial<InsertSocialLink>): Promise<SocialLink>;
  deleteSocialLink(id: number): Promise<void>;

  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;

  // Availability methods
  createAvailabilitySetting(setting: InsertAvailabilitySetting): Promise<AvailabilitySetting>;
  getAvailabilitySettings(userId: number): Promise<AvailabilitySetting[]>;
  updateAvailabilitySetting(id: number, setting: Partial<InsertAvailabilitySetting>): Promise<AvailabilitySetting>;
  getAvailableTimeSlots(userId: number, date: Date): Promise<Array<{ start: Date; end: Date }>>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Biolink methods
  async createBiolink(biolink: InsertBiolink): Promise<Biolink> {
    const [result] = await db
      .insert(biolinks)
      .values(biolink)
      .returning();
    return result;
  }

  async getBiolink(id: number): Promise<Biolink | undefined> {
    const [biolink] = await db.select().from(biolinks).where(eq(biolinks.id, id));
    return biolink;
  }

  async getBiolinkBySlug(slug: string): Promise<Biolink | undefined> {
    const [biolink] = await db.select().from(biolinks).where(eq(biolinks.slug, slug));
    return biolink;
  }

  async getBiolinksByUserId(userId: number): Promise<Biolink[]> {
    return await db.select().from(biolinks).where(eq(biolinks.userId, userId));
  }

  async updateBiolink(id: number, biolink: Partial<InsertBiolink>): Promise<Biolink> {
    const [result] = await db
      .update(biolinks)
      .set(biolink)
      .where(eq(biolinks.id, id))
      .returning();
    return result;
  }

  async deleteBiolink(id: number): Promise<void> {
    // First delete all social links associated with this biolink
    await db.delete(socialLinks).where(eq(socialLinks.biolinkId, id));
    // Then delete the biolink
    await db.delete(biolinks).where(eq(biolinks.id, id));
  }

  // Social link methods
  async createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink> {
    const [result] = await db
      .insert(socialLinks)
      .values(socialLink)
      .returning();
    return result;
  }

  async getSocialLinksByBiolinkId(biolinkId: number): Promise<SocialLink[]> {
    return await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.biolinkId, biolinkId))
      .orderBy(socialLinks.order);
  }

  async updateSocialLink(id: number, socialLink: Partial<InsertSocialLink>): Promise<SocialLink> {
    const [result] = await db
      .update(socialLinks)
      .set(socialLink)
      .where(eq(socialLinks.id, id))
      .returning();
    return result;
  }

  async deleteSocialLink(id: number): Promise<void> {
    await db.delete(socialLinks).where(eq(socialLinks.id, id));
  }

  // Appointment methods
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [result] = await db
      .insert(appointments)
      .values({
        ...appointment,
        status: "pending"
      })
      .returning();
    return result;
  }

  async getAppointments(): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .orderBy(appointments.appointmentDate);
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startDate),
          lte(appointments.appointmentDate, endDate)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const [result] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return result;
  }

  // Availability methods
  async createAvailabilitySetting(setting: InsertAvailabilitySetting): Promise<AvailabilitySetting> {
    const [result] = await db
      .insert(availabilitySettings)
      .values(setting)
      .returning();
    return result;
  }

  async getAvailabilitySettings(userId: number): Promise<AvailabilitySetting[]> {
    return await db
      .select()
      .from(availabilitySettings)
      .where(eq(availabilitySettings.userId, userId))
      .orderBy(availabilitySettings.dayOfWeek);
  }

  async updateAvailabilitySetting(
    id: number,
    setting: Partial<InsertAvailabilitySetting>
  ): Promise<AvailabilitySetting> {
    const [result] = await db
      .update(availabilitySettings)
      .set(setting)
      .where(eq(availabilitySettings.id, id))
      .returning();
    return result;
  }

  async getAvailableTimeSlots(userId: number, date: Date): Promise<Array<{ start: Date; end: Date }>> {
    const dayOfWeek = date.getDay();
    const settings = await db
      .select()
      .from(availabilitySettings)
      .where(
        and(
          eq(availabilitySettings.userId, userId),
          eq(availabilitySettings.dayOfWeek, dayOfWeek),
          eq(availabilitySettings.isAvailable, true)
        )
      );

    if (!settings.length) return [];

    const setting = settings[0];
    // Set default values if null
    const slotDuration = setting.slotDuration || 30;
    const bufferTime = setting.bufferTime || 15;

    const [startHour, startMinute] = setting.startTime.split(":").map(Number);
    const [endHour, endMinute] = setting.endTime.split(":").map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    const slots: Array<{ start: Date; end: Date }> = [];
    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

      if (slotEnd <= endTime) {
        slots.push({
          start: new Date(currentSlot),
          end: new Date(slotEnd),
        });
      }

      currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration + bufferTime);
    }

    // Filter out slots that overlap with existing appointments
    const existingAppointments = await this.getAppointmentsByDate(date);

    return slots.filter(slot => {
      return !existingAppointments.some(appointment => {
        const appointmentEnd = new Date(appointment.appointmentDate);
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration);

        return (
          (slot.start >= appointment.appointmentDate && slot.start < appointmentEnd) ||
          (slot.end > appointment.appointmentDate && slot.end <= appointmentEnd)
        );
      });
    });
  }
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();