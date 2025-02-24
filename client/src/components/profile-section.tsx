import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import SocialLinks from "./social-links";

export default function ProfileSection() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-32 h-32">
            <AvatarImage
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf"
              alt="Dr. Sarah Wilson"
            />
            <AvatarFallback>SW</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">Dr. Sarah Wilson</h1>
            <p className="text-xl text-muted-foreground mb-4">
              Board Certified Family Physician
            </p>
            <p className="max-w-2xl mb-4">
              With over 15 years of experience in family medicine, I am dedicated to providing comprehensive healthcare for patients of all ages. My focus is on preventive care and building long-lasting relationships with my patients.
            </p>
            <SocialLinks />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
