import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex">
        <SidebarNav />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
