import { Link } from "wouter";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Calendar, Link as LinkIcon } from "lucide-react";

interface SidebarNavProps {
  items: {
    title: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const [location] = useLocation();

  return (
    <nav className="flex flex-col space-y-2">
      {items.map((item) => (
        <Button
          key={item.href}
          variant={location === item.href ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            location === item.href
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
