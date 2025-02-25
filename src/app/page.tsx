import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Hệ Thống Quản Lý Hồ Sơ Y Tế
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Nền tảng quản lý hồ sơ y tế và đặt lịch khám trực tuyến
        </p>
        <div className="flex justify-center">
          <a
            href="/auth"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
          >
            Bắt đầu sử dụng
          </a>
        </div>
      </div>
    </main>
  );
}
