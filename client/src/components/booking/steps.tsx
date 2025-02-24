import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { bookingFormSchema, type InsertAppointment } from "@shared/schema";

interface StepContentProps {
  step: number;
  formData: Partial<InsertAppointment>;
  onSubmit: (data: Partial<InsertAppointment>) => void;
  isLoading: boolean;
}

export function StepContent({
  step,
  formData,
  onSubmit,
  isLoading,
}: StepContentProps) {
  if (step === 1) {
    const dateForm = useForm<Partial<InsertAppointment>>({
      resolver: zodResolver(bookingFormSchema.pick({ appointmentDate: true })),
      defaultValues: {
        appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate) : undefined,
      },
    });

    return (
      <Form {...dateForm}>
        <form id="dateForm" onSubmit={dateForm.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={dateForm.control}
            name="appointmentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Select Date</FormLabel>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => field.onChange(date)}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  }

  if (step === 2) {
    const infoForm = useForm<Partial<InsertAppointment>>({
      resolver: zodResolver(bookingFormSchema.pick({ fullName: true, phoneNumber: true })),
      defaultValues: {
        fullName: formData.fullName || '',
        phoneNumber: formData.phoneNumber || '',
      },
    });

    return (
      <Form {...infoForm}>
        <form id="infoForm" onSubmit={infoForm.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={infoForm.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your full name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={infoForm.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" placeholder="Enter your phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-4">Review Your Appointment</h3>
          <div className="space-y-4">
            <div>
              <label className="font-medium block">Selected Date</label>
              <p className="text-muted-foreground">
                {formData.appointmentDate
                  ? format(new Date(formData.appointmentDate), "PPP")
                  : "Not selected"}
              </p>
            </div>
            <div>
              <label className="font-medium block">Full Name</label>
              <p className="text-muted-foreground">{formData.fullName}</p>
            </div>
            <div>
              <label className="font-medium block">Phone Number</label>
              <p className="text-muted-foreground">{formData.phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="space-y-6 text-center">
        <h3 className="text-lg font-medium">Confirm Your Booking</h3>
        <p className="text-muted-foreground">
          Please review your appointment details above. Click confirm to schedule your appointment.
        </p>
      </div>
    );
  }

  return null;
}