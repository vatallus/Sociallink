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
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your appointment has been booked successfully.",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContinue = () => {
    // Validate required fields for each step
    if (step === 1 && !formData.appointmentDate) {
      toast({
        title: "Error",
        description: "Please select a date for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (step === 2 && (!formData.fullName || !formData.phoneNumber)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      bookingMutation.mutate(formData as InsertAppointment);
    }
  };

  const handleFormSubmit = (data: Partial<InsertAppointment>) => {
    setFormData({ ...formData, ...data });
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
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className={`w-1/4 h-2 rounded-full mx-1 ${
                      num <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between px-1">
                <span className="text-sm">Select Date</span>
                <span className="text-sm">Your Info</span>
                <span className="text-sm">Review</span>
                <span className="text-sm">Confirm</span>
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
                  {step === 4 
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