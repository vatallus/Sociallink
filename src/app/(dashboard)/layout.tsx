import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

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
        <div className="w-64 min-h-screen bg-card border-r p-6">
          <div className="flex items-center gap-2 mb-6">
            <Avatar className="h-8 w-8">
              {session.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name || ""} />
              ) : (
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium">{session.user?.name || session.user?.email}</span>
          </div>
          <SidebarNav />
        </div>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}