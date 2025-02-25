import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Link as LinkIcon, Upload, User, Plus, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarInput } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Appointment, InsertAppointment } from "@shared/schema";
import { SidebarNav, adminNavItems } from "@/components/sidebar-nav";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy"
};

const INITIAL_APPOINTMENT = {
  fullName: "",
  phoneNumber: "",
  appointmentDate: new Date(),
  notes: "",
  duration: 30,
  status: "pending",
};

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<Partial<InsertAppointment> | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsAppointmentModalOpen(false);
      setEditingAppointment(null);
      toast({
        title: "Thành công",
        description: "Đã tạo lịch hẹn mới.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo lịch hẹn.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAppointment> }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsAppointmentModalOpen(false);
      setEditingAppointment(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật lịch hẹn.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật lịch hẹn.",
        variant: "destructive",
      });
    },
  });

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTime) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn thời gian khám",
        variant: "destructive",
      });
      return;
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      fullName: formData.get('fullName') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      appointmentDate: selectedTime,
      notes: formData.get('notes') as string,
      status: formData.get('status') as string || "pending",
    };

    if (editingAppointment?.id) {
      updateAppointmentMutation.mutate({
        id: editingAppointment.id as number,
        data,
      });
    } else {
      createAppointmentMutation.mutate(data as InsertAppointment);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setSelectedTime(new Date(appointment.appointmentDate));
    setIsAppointmentModalOpen(true);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái lịch hẹn.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái.",
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments?.filter(
    (apt) => statusFilter === "all" || apt.status === statusFilter
  );

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Không thể tải lên ảnh đại diện');
      return res.json();
    },
    onSuccess: (data) => {
      updateProfileMutation.mutate({ avatarUrl: data.url });
      toast({
        title: "Thành công",
        description: "Đã tải lên ảnh đại diện.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải lên ảnh đại diện.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatarMutation.mutateAsync(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; address?: string; avatarUrl?: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin cá nhân.",
      });
      setIsProfileOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin.",
        variant: "destructive",
      });
    },
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex">
        <div className="w-64 min-h-screen bg-card border-r p-6">
          <div className="flex items-center gap-2 mb-6">
            <Avatar className="h-8 w-8">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user?.name || user?.username} />
              ) : (
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium">{user?.name || user?.username}</span>
          </div>
          <SidebarNav items={adminNavItems} />
        </div>

        <div className="flex-1 p-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Quản lý Lịch hẹn</h1>
            <Button
              onClick={() => {
                setEditingAppointment(null);
                setSelectedTime(undefined);
                setIsAppointmentModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm lịch hẹn
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách lịch hẹn</CardTitle>
              <CardDescription>
                Xem và quản lý các lịch hẹn khám bệnh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ xác nhận</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments?.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{appointment.fullName}</TableCell>
                      <TableCell>{appointment.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "confirmed"
                              ? "default"
                              : appointment.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {STATUS_LABELS[appointment.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            Chỉnh sửa
                          </Button>
                          {appointment.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(appointment.id, "confirmed")}
                                disabled={updateStatusMutation.isPending}
                              >
                                Xác nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                                disabled={updateStatusMutation.isPending}
                              >
                                Hủy
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Thông tin</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cá nhân của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center">
              <Avatar className="h-24 w-24">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user?.name || user?.username} />
                ) : (
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="grid gap-2">
              <Label>Ảnh đại diện</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Tải lên ảnh đại diện
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input
                id="name"
                defaultValue={user?.name || ""}
                onChange={(e) =>
                  updateProfileMutation.mutate({ name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                defaultValue={user?.address || ""}
                onChange={(e) =>
                  updateProfileMutation.mutate({ address: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsProfileOpen(false)}
              variant="outline"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Chỉnh sửa lịch hẹn" : "Thêm lịch hẹn mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết để {editingAppointment ? "cập nhật" : "tạo"} lịch hẹn
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAppointmentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Họ tên</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={editingAppointment?.fullName || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  defaultValue={editingAppointment?.phoneNumber || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Ngày giờ khám</Label>
                <CalendarInput
                  mode="single"
                  selected={selectedTime}
                  onSelect={setSelectedTime}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select name="status" defaultValue={editingAppointment?.status || "pending"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xác nhận</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingAppointment?.notes || ""}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAppointmentModalOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {editingAppointment ? "Cập nhật" : "Tạo lịch hẹn"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}