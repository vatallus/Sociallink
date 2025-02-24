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
import { Button } from "@/components/ui/button";
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
  const form = useForm<InsertAppointment>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      ...formData,
      appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate) : undefined,
    },
  });

  if (step === 1) {
    return (
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit((data) => onSubmit(data))} 
          className="space-y-6"
        >
          <FormField
            control={form.control}
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
          <Button 
            type="submit" 
            className="w-full"
          >
            Continue
          </Button>
        </form>
      </Form>
    );
  }

  if (step === 2) {
    return (
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit((data) => onSubmit(data))} 
          className="space-y-6"
        >
          <FormField
            control={form.control}
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
            control={form.control}
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
          <Button 
            type="submit" 
            className="w-full"
          >
            Continue
          </Button>
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
        <Button 
          onClick={() => onSubmit(formData)}
          className="w-full"
        >
          Continue to Confirmation
        </Button>
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
        <Button
          onClick={() => onSubmit(formData)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Booking..." : "Confirm Booking"}
        </Button>
      </div>
    );
  }

  return null;
}