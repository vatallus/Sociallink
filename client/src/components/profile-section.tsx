import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Award, MapPin, Clock } from "lucide-react";

export default function ProfileSection() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-32 h-32 border-4 border-primary/10">
            <AvatarImage
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2"
              alt="Bác sĩ Nguyễn Văn A"
            />
            <AvatarFallback>BS</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">Bác sĩ Nguyễn Văn A</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary mb-4">
              <Award className="h-5 w-5" />
              <span className="font-medium">Bác sĩ Chuyên khoa II - Nội Tổng quát</span>
            </div>
            <div className="flex flex-col gap-2 text-muted-foreground mb-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4" />
                <span>Bệnh viện Đa khoa Trung ương</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Clock className="h-4 w-4" />
                <span>Thời gian làm việc: 8:00 - 17:00</span>
              </div>
            </div>
            <p className="max-w-2xl">
              Với hơn 15 năm kinh nghiệm trong lĩnh vực Nội Tổng quát, tôi chuyên điều trị các bệnh lý nội khoa và tư vấn chăm sóc sức khỏe toàn diện. Luôn đặt sự an toàn và hiệu quả điều trị của bệnh nhân lên hàng đầu.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}