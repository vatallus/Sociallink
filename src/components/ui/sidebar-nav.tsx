"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Calendar, Link as LinkIcon } from "lucide-react";

export const adminNavItems = [
  {
    title: "Lịch hẹn",
    href: "/admin",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    title: "Hồ sơ",
    href: "/biolinks",
    icon: <LinkIcon className="h-4 w-4" />,
  },
  {
    title: "Thông tin cá nhân",
    href: "/profile",
    icon: <User className="h-4 w-4" />,
  },
];

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col space-y-2", className)}>
      {adminNavItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            pathname === item.href
              ? "bg-accent hover:bg-accent"
              : "hover:bg-transparent hover:underline"
          )}
          asChild
        >
          <Link href={item.href}>
            <div className="flex items-center">
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </div>
          </Link>
        </Button>
      ))}
    </nav>
  );
}
