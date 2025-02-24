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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { bookingFormSchema, type InsertAppointment, type Biolink } from "@shared/schema";

interface StepContentProps {
  step: number;
  formData: Partial<InsertAppointment>;
  onSubmit: (data: Partial<InsertAppointment>) => void;
  isLoading: boolean;
  biolinkData?: Biolink & { user: any };
  availableSlots?: Array<{ start: Date; end: Date }>;
}

export function StepContent({
  step,
  formData,
  onSubmit,
  isLoading,
  biolinkData,
  availableSlots,
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
          {biolinkData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{biolinkData.title}</CardTitle>
                <CardDescription>
                  <div className="space-y-2 mt-2">
                    <p><strong>Chuyên khoa:</strong> {biolinkData.specialty}</p>
                    <p><strong>Địa chỉ khám:</strong> {biolinkData.clinicAddress}</p>
                    <p><strong>Giờ làm việc:</strong> {biolinkData.workingHours}</p>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          <FormField
            control={dateForm.control}
            name="appointmentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Chọn ngày giờ khám</FormLabel>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
                {availableSlots && availableSlots.length > 0 && (
                  <div className="mt-4">
                    <FormLabel>Các khung giờ trống</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => field.onChange(slot.start)}
                          className={`p-2 text-sm rounded-md border transition-colors ${
                            field.value?.getTime() === slot.start.getTime()
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent'
                          }`}
                        >
                          {format(slot.start, 'HH:mm')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
      resolver: zodResolver(bookingFormSchema.pick({ fullName: true, phoneNumber: true, notes: true })),
      defaultValues: {
        fullName: formData.fullName || '',
        phoneNumber: formData.phoneNumber || '',
        notes: formData.notes || '',
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
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập họ tên của bạn" />
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
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" placeholder="Nhập số điện thoại" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={infoForm.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lý do khám</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Mô tả ngắn gọn lý do bạn muốn đặt lịch khám"
                    className="min-h-[100px]"
                  />
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
    if (!biolinkData) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Xem lại thông tin đặt khám</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Thông tin bác sĩ</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Bác sĩ: {biolinkData.title}</p>
                <p>Chuyên khoa: {biolinkData.specialty}</p>
                <p>Địa chỉ khám: {biolinkData.clinicAddress}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Thông tin lịch hẹn</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Thời gian: {formData.appointmentDate
                  ? format(new Date(formData.appointmentDate), "dd/MM/yyyy HH:mm")
                  : "Chưa chọn"}
                </p>
                <p>Họ tên: {formData.fullName}</p>
                <p>Số điện thoại: {formData.phoneNumber}</p>
                {formData.notes && (
                  <div>
                    <p className="font-medium">Lý do khám:</p>
                    <p className="whitespace-pre-wrap">{formData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="space-y-6 text-center">
        <h3 className="text-lg font-medium">Xác nhận đặt lịch</h3>
        <p className="text-muted-foreground">
          Vui lòng kiểm tra lại thông tin lịch hẹn ở trên. Nhấn xác nhận để hoàn tất đặt lịch.
        </p>
      </div>
    );
  }

  return null;
}