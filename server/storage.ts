import { appointments, users, biolinks, socialLinks, type Appointment, type InsertAppointment, type User, type InsertUser, type Biolink, type InsertBiolink, type SocialLink, type InsertSocialLink } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Biolink methods
  createBiolink(biolink: InsertBiolink): Promise<Biolink>;
  getBiolink(id: number): Promise<Biolink | undefined>;
  getBiolinkBySlug(slug: string): Promise<Biolink | undefined>;
  getBiolinksByUserId(userId: number): Promise<Biolink[]>;
  updateBiolink(id: number, biolink: Partial<InsertBiolink>): Promise<Biolink>;

  // Social link methods
  createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink>;
  getSocialLinksByBiolinkId(biolinkId: number): Promise<SocialLink[]>;
  updateSocialLink(id: number, socialLink: Partial<InsertSocialLink>): Promise<SocialLink>;
  deleteSocialLink(id: number): Promise<void>;

  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
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

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const [result] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();