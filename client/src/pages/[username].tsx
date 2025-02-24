import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Loader2, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SOCIAL_PLATFORMS, type Platform } from "@/components/social-link-validator";
import type { Biolink, SocialLink, User as UserType } from "@shared/schema";
import { Link } from "wouter";

export default function PublicBiolinkPage() {
  const [, params] = useRoute("/:username");
  const username = params?.username;

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: [`/api/public/users/${username}`],
    enabled: !!username,
  });

  const { data: biolink, isLoading: biolinkLoading } = useQuery<Biolink>({
    queryKey: [`/api/public/biolinks/${username}`],
    enabled: !!username,
  });

  const { data: socialLinks, isLoading: socialLinksLoading } = useQuery<SocialLink[]>({
    queryKey: [`/api/public/biolinks/${biolink?.id}/social-links`],
    enabled: !!biolink?.id,
  });

  if (userLoading || biolinkLoading || socialLinksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!biolink || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested profile could not be found.
        </p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name || user.username} />
                ) : (
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{biolink.title}</CardTitle>
            <CardDescription className="mt-2">{biolink.description}</CardDescription>
            {user.name && (
              <p className="text-sm text-muted-foreground mt-2">{user.name}</p>
            )}
          </CardHeader>
          <CardContent>
            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="grid gap-4">
                {socialLinks.map((link) => {
                  const platform = SOCIAL_PLATFORMS[link.platform as Platform];
                  const Icon = platform?.icon;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span>{platform?.name}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {/* Booking Button */}
            <div className="mt-8">
              <Link href={`/booking?username=${username}`}>
                <Button className="w-full">
                  Book an Appointment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}