import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Loader2, User, Award, BookOpen, Clock, MapPin, Phone } from "lucide-react";
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
import { getQueryFn } from "@/lib/queryClient";

interface ExtendedBiolink extends Biolink {
  socialLinks: SocialLink[];
  user: UserType;
}

export default function PublicBiolinkPage() {
  const [, params] = useRoute("/bio/:slug");
  const slug = params?.slug;

  const { data: biolink, isLoading } = useQuery<ExtendedBiolink>({
    queryKey: [`/api/public/biolinks/by-slug/${slug}`],
    queryFn: getQueryFn({ on401: "throw", credentials: "omit" }),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!biolink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy hồ sơ</h1>
        <p className="text-muted-foreground mb-4">
          Hồ sơ bạn yêu cầu không tồn tại.
        </p>
        <Button asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    );
  }

  const { user } = biolink;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <Avatar className="h-32 w-32 border-4 border-primary/10">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name || user.username} />
                ) : (
                  <AvatarFallback>
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <CardTitle className="text-3xl mb-2">{user.name}</CardTitle>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Award className="h-5 w-5" />
              <span className="font-medium">{biolink.title}</span>
            </div>
            <CardDescription className="mt-4 text-lg">
              {biolink.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6">
              {/* Professional Info */}
              <div className="grid gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                  <span>Chuyên khoa Nội Tổng quát</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>Thời gian làm việc: 8:00 - 17:00</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>Bệnh viện Đa khoa Trung ương</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5" />
                  <span>Liên hệ khám: 0123.456.789</span>
                </div>
              </div>

              {/* Social Links */}
              {biolink.socialLinks && biolink.socialLinks.length > 0 && (
                <div className="grid gap-3">
                  {biolink.socialLinks.map((link) => {
                    const platform = SOCIAL_PLATFORMS[link.platform as Platform];
                    const Icon = platform?.icon;

                    if (!platform) return null;

                    return (
                      <Button
                        key={link.id}
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 justify-start w-full"
                        >
                          {Icon && <Icon className="w-5 h-5" />}
                          <span>{platform.name}</span>
                        </a>
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Booking Button */}
              <div className="mt-4">
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/booking?slug=${slug}`}>
                    Đặt lịch khám
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}