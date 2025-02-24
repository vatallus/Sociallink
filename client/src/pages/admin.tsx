import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Link as LinkIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Appointment } from "@shared/schema";

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment status updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment status.",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Navigation Bar */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/admin">
            <Button variant="outline" className="flex items-center gap-2">
              Appointments
            </Button>
          </Link>
          <Link href="/biolinks">
            <Button variant="outline" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Biolinks
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Management</CardTitle>
          <CardDescription>
            Welcome {user?.username}! View and manage all appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments?.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {format(new Date(appointment.appointmentDate), "PPP p")}
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
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {appointment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(appointment.id, "confirmed")}
                            disabled={updateStatusMutation.isPending}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                            disabled={updateStatusMutation.isPending}
                          >
                            Cancel
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
  );
}