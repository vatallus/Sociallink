import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Stethoscope, Calendar, UserPlus, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <span className="text-2xl font-bold text-primary">MedLink</span>
        </Link>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link href="/auth">Đăng nhập</Link>
          </Button>
          <Button asChild>
            <Link href="/auth">Đăng ký</Link>
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nền tảng hồ sơ trực tuyến dành cho
            <span className="text-primary block mt-2">Bác sĩ chuyên khoa</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Tạo trang hồ sơ chuyên nghiệp, chia sẻ thông tin chuyên môn và kết nối với bệnh nhân dễ dàng
          </p>
          <Button size="lg" asChild className="font-semibold">
            <Link href="/auth">Tạo hồ sơ ngay</Link>
          </Button>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 rounded-lg bg-card text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hồ sơ chuyên nghiệp</h3>
            <p className="text-muted-foreground">
              Tạo trang hồ sơ chuyên nghiệp thể hiện trình độ chuyên môn và kinh nghiệm của bạn
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Đặt lịch thông minh</h3>
            <p className="text-muted-foreground">
              Quản lý lịch khám và đặt hẹn trực tuyến một cách hiệu quả
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Kết nối bệnh nhân</h3>
            <p className="text-muted-foreground">
              Tạo kênh kết nối trực tiếp với bệnh nhân qua các nền tảng mạng xã hội
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chia sẻ dễ dàng</h3>
            <p className="text-muted-foreground">
              Chia sẻ thông tin và đường dẫn hồ sơ của bạn một cách thuận tiện
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}