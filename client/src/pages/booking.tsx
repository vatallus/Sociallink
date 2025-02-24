import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertAppointment } from "@shared/schema";
import { StepContent } from "@/components/booking/steps";

export default function Booking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<InsertAppointment>>({});
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      // Format the date to ISO string before sending
      const formattedData = {
        ...data,
        appointmentDate: data.appointmentDate.toISOString(),
      };
      const res = await apiRequest("POST", "/api/appointments", formattedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your appointment has been booked successfully.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: Partial<InsertAppointment>) => {
    const newData = { ...formData, ...data };
    setFormData(newData);

    if (step < 5) {
      setStep(step + 1);
    } else if (step === 5 && newData.appointmentDate && newData.timeSlotId && newData.fullName && newData.phoneNumber) {
      bookingMutation.mutate(newData as InsertAppointment);
    }
  };

  const handleContinue = () => {
    // Submit the current form
    const formId = 
      step === 1 ? '#dateForm' : 
      step === 2 ? '#timeSlotForm' : 
      step === 3 ? '#infoForm' : null;

    const currentForm = formId ? document.querySelector(formId) as HTMLFormElement : null;
    if (currentForm) {
      currentForm.requestSubmit();
    } else if (step >= 4) {
      // For review and confirmation steps, just proceed
      handleFormSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-3xl"
      >
        <Card>
          <CardHeader>
            <CardTitle>Book an Appointment</CardTitle>
            <CardDescription>
              Complete the form below to schedule your appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className={`w-1/5 h-2 rounded-full mx-1 ${
                      num <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between px-1 text-sm">
                <span>Select Date</span>
                <span>Select Time</span>
                <span>Your Info</span>
                <span>Review</span>
                <span>Confirm</span>
              </div>
            </div>

            {/* Form Steps */}
            <div className="mt-6">
              <StepContent
                step={step}
                formData={formData}
                onSubmit={handleFormSubmit}
                isLoading={bookingMutation.isPending}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={bookingMutation.isPending}
                  >
                    Back
                  </Button>
                )}
                {step === 1 && (
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleContinue}
                  disabled={bookingMutation.isPending}
                  className="ml-auto"
                >
                  {step === 5 
                    ? (bookingMutation.isPending ? "Booking..." : "Confirm Booking")
                    : "Continue"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}