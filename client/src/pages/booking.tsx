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
import { BookingSteps } from "@/components/booking/steps";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertAppointment } from "@shared/schema";

export default function Booking() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<InsertAppointment>>({});

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled.",
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

  const handleSubmit = (data: Partial<InsertAppointment>) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);

    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      bookingMutation.mutate(newFormData as InsertAppointment);
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
            </div>

            <BookingSteps
              step={step}
              formData={formData}
              onSubmit={handleSubmit}
              isLoading={bookingMutation.isPending}
            />

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={bookingMutation.isPending}
                >
                  Previous
                </Button>
              )}
              {step === 1 && (
                <Button variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
