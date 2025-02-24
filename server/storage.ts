import { appointments, type Appointment, type InsertAppointment } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
}

export class DatabaseStorage implements IStorage {
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