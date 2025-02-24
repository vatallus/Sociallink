import { appointments, timeSlots, type Appointment, type InsertAppointment, type TimeSlot, type InsertTimeSlot } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
  // New methods for time slots
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  getAvailableTimeSlots(date: Date): Promise<TimeSlot[]>;
  updateTimeSlotAvailability(id: number, isAvailable: boolean): Promise<TimeSlot>;
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

    // Update time slot availability
    if (appointment.timeSlotId) {
      await this.updateTimeSlotAvailability(appointment.timeSlotId, false);
    }

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

    // If appointment is cancelled, make the time slot available again
    if (status === "cancelled") {
      const appointment = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id))
        .limit(1);

      if (appointment[0]?.timeSlotId) {
        await this.updateTimeSlotAvailability(appointment[0].timeSlotId, true);
      }
    }

    return result;
  }

  // Time slot methods
  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [result] = await db
      .insert(timeSlots)
      .values(timeSlot)
      .returning();
    return result;
  }

  async getAvailableTimeSlots(date: Date): Promise<TimeSlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(timeSlots)
      .where(eq(timeSlots.isAvailable, true)) //Corrected to true from "true" string
      .orderBy(timeSlots.startTime);
  }

  async updateTimeSlotAvailability(id: number, isAvailable: boolean): Promise<TimeSlot> {
    const [result] = await db
      .update(timeSlots)
      .set({ isAvailable: isAvailable.toString() })
      .where(eq(timeSlots.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();