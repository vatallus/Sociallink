import { Button } from "@/components/ui/button";
import {
  SiLinkedin,
  SiX,
  SiInstagram,
  SiFacebook
} from "react-icons/si";

export default function SocialLinks() {
  const links = [
    {
      icon: SiLinkedin,
      label: "LinkedIn",
      href: "https://linkedin.com",
    },
    {
      icon: SiX,
      label: "X (Twitter)",
      href: "https://x.com",
    },
    {
      icon: SiInstagram,
      label: "Instagram",
      href: "https://instagram.com",
    },
    {
      icon: SiFacebook,
      label: "Facebook",
      href: "https://facebook.com",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
      {links.map((link) => (
        <Button
          key={link.label}
          variant="outline"
          size="icon"
          className="w-10 h-10"
          asChild
        >
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
          >
            <link.icon className="w-5 h-5" />
          </a>
        </Button>
      ))}
    </div>
  );
}