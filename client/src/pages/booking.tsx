import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertAppointment, Biolink } from "@shared/schema";
import { StepContent } from "@/components/booking/steps";
import { Loader2, CheckCircle } from "lucide-react";

export default function Booking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<InsertAppointment>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  // Get username from URL query
  const username = new URLSearchParams(search).get("username");

  // Fetch user's biolink
  const { data: biolink, isLoading: biolinkLoading } = useQuery<Biolink>({
    queryKey: [`/api/public/biolinks/${username}`],
    enabled: !!username,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const formattedData = {
        ...data,
        appointmentDate: new Date(data.appointmentDate).toISOString(),
      };
      const res = await apiRequest("POST", "/api/appointments", formattedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your appointment has been booked successfully.",
      });
      setIsSuccess(true);
    },
    onError: (error: Error) => {
      console.error('Booking error:', error);
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

    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      // Validate required fields
      if (!newData.appointmentDate || !newData.fullName || !newData.phoneNumber) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Submit the appointment
      bookingMutation.mutate(newData as InsertAppointment);
    }
  };

  if (biolinkLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!username || !biolink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested profile could not be found.
        </p>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                <p className="text-muted-foreground max-w-md">
                  Your appointment with {biolink.title} has been successfully booked. 
                  You will receive a confirmation shortly.
                </p>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => {
                    setStep(1);
                    setFormData({});
                    setIsSuccess(false);
                  }}>
                    Book Another
                  </Button>
                  <Button onClick={() => navigate(`/${username}`)}>
                    Return to Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle>Book an Appointment with {biolink.title}</CardTitle>
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
                  <Button variant="outline" onClick={() => navigate(`/${username}`)}>
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const currentForm = document.querySelector(
                      step === 1 ? '#dateForm' : '#infoForm'
                    ) as HTMLFormElement;
                    if (currentForm) {
                      currentForm.requestSubmit();
                    } else if (step >= 3) {
                      handleFormSubmit(formData);
                    }
                  }}
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