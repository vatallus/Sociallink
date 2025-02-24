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

export default function Booking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<InsertAppointment>>({});
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  // Get slug from URL query
  const slug = new URLSearchParams(search).get("slug");

  // Fetch biolink data using slug
  const { data: biolinkData, isLoading: biolinkLoading } = useQuery<Biolink & { user: any }>({
    queryKey: [`/api/public/biolinks/by-slug/${slug}`],
    enabled: !!slug,
  });

  // Fetch available time slots when date is selected
  const { data: availableSlots } = useQuery<Array<{ start: Date; end: Date }>>({
    queryKey: [`/api/availability/${biolinkData?.userId}/${formData.appointmentDate?.toISOString()}`],
    enabled: !!biolinkData?.userId && !!formData.appointmentDate,
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
        title: "Thành công!",
        description: "Đã đặt lịch khám thành công.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đặt lịch khám. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: Partial<InsertAppointment>) => {
    const newData = { ...formData, ...data };
    setFormData(newData);

    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4 && newData.appointmentDate && newData.fullName && newData.phoneNumber) {
      bookingMutation.mutate(newData as InsertAppointment);
    }
  };

  if (!slug || !biolinkData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy hồ sơ</h1>
        <p className="text-muted-foreground mb-4">
          Không tìm thấy hồ sơ bác sĩ bạn yêu cầu.
        </p>
        <Button onClick={() => navigate("/")}>Về trang chủ</Button>
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
            <CardTitle>Đặt lịch khám với {biolinkData.title}</CardTitle>
            <CardDescription>
              Hoàn thành các bước bên dưới để đặt lịch khám bệnh
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
                <span className="text-sm">Chọn ngày</span>
                <span className="text-sm">Thông tin</span>
                <span className="text-sm">Xem lại</span>
                <span className="text-sm">Xác nhận</span>
              </div>
            </div>

            {/* Form Steps */}
            <div className="mt-6">
              <StepContent
                step={step}
                formData={formData}
                onSubmit={handleFormSubmit}
                isLoading={bookingMutation.isPending}
                availableSlots={availableSlots}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={bookingMutation.isPending}
                  >
                    Quay lại
                  </Button>
                )}
                {step === 1 && (
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Hủy
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
                    ? (bookingMutation.isPending ? "Đang đặt lịch..." : "Xác nhận đặt lịch")
                    : "Tiếp tục"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}