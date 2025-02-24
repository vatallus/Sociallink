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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bookingFormSchema, type InsertAppointment } from "@shared/schema";

interface BookingStepsProps {
  step: number;
  formData: Partial<InsertAppointment>;
  onSubmit: (data: Partial<InsertAppointment>) => void;
  isLoading: boolean;
}

export function BookingSteps({
  step,
  formData,
  onSubmit,
  isLoading,
}: BookingStepsProps) {
  const form = useForm<InsertAppointment>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: formData,
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Continue</Button>
            </form>
          </Form>
        );

      case 2:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Continue</Button>
            </form>
          </Form>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Appointment Details</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="font-medium">Date</label>
                  <p>
                    {formData.appointmentDate
                      ? format(formData.appointmentDate, "PPP")
                      : "Not selected"}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Duration</label>
                  <p>{formData.duration} minutes</p>
                </div>
                <div>
                  <label className="font-medium">Full Name</label>
                  <p>{formData.fullName}</p>
                </div>
                <div>
                  <label className="font-medium">Phone Number</label>
                  <p>{formData.phoneNumber}</p>
                </div>
              </div>
            </div>
            <Button onClick={() => onSubmit(formData)}>Continue</Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <h3 className="text-lg font-medium">Confirm Booking</h3>
            <p>
              Please review your appointment details above. Click confirm to
              schedule your appointment.
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

      default:
        return null;
    }
  };

  return renderStep();
}
