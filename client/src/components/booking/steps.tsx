import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { data: timeSlots } = useQuery({
    queryKey: ["/api/time-slots/available", formData.appointmentDate],
    enabled: !!formData.appointmentDate,
  });

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
                  onSelect={field.onChange}
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
    const timeSlotForm = useForm<Partial<InsertAppointment>>({
      resolver: zodResolver(bookingFormSchema.pick({ timeSlotId: true })),
      defaultValues: {
        timeSlotId: formData.timeSlotId,
      },
    });

    return (
      <Form {...timeSlotForm}>
        <form id="timeSlotForm" onSubmit={timeSlotForm.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={timeSlotForm.control}
            name="timeSlotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Time Slot</FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots?.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id.toString()}>
                        {format(new Date(`2000-01-01T${slot.startTime}`), 'h:mm a')} - 
                        {format(new Date(`2000-01-01T${slot.endTime}`), 'h:mm a')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  }

  if (step === 3) {
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

  if (step === 4) {
    const selectedTimeSlot = timeSlots?.find(slot => slot.id === formData.timeSlotId);

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
              <label className="font-medium block">Selected Time</label>
              <p className="text-muted-foreground">
                {selectedTimeSlot
                  ? `${format(new Date(`2000-01-01T${selectedTimeSlot.startTime}`), 'h:mm a')} - 
                     ${format(new Date(`2000-01-01T${selectedTimeSlot.endTime}`), 'h:mm a')}`
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

  if (step === 5) {
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