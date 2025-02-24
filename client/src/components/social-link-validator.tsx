import { useState } from "react";
import { z } from "zod";
import { 
  SiFacebook, 
  SiInstagram, 
  SiLinkedin, 
  SiYoutube, 
  SiTiktok,
  SiGithub
} from "react-icons/si";
import { FaTwitter } from "react-icons/fa";
import { CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SOCIAL_PLATFORMS = {
  facebook: {
    name: "Facebook",
    icon: SiFacebook,
    pattern: /^https?:\/\/(www\.)?(facebook|fb)\.com\/[a-zA-Z0-9.]+\/?$/,
    example: "https://facebook.com/username",
  },
  twitter: {
    name: "Twitter",
    icon: FaTwitter,
    pattern: /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/,
    example: "https://twitter.com/username",
  },
  instagram: {
    name: "Instagram",
    icon: SiInstagram,
    pattern: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
    example: "https://instagram.com/username",
  },
  linkedin: {
    name: "LinkedIn",
    icon: SiLinkedin,
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/,
    example: "https://linkedin.com/in/username",
  },
  youtube: {
    name: "YouTube",
    icon: SiYoutube,
    pattern: /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?[a-zA-Z0-9_-]+\/?$/,
    example: "https://youtube.com/c/channel-name",
  },
  tiktok: {
    name: "TikTok",
    icon: SiTiktok,
    pattern: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+\/?$/,
    example: "https://tiktok.com/@username",
  },
  github: {
    name: "GitHub",
    icon: SiGithub,
    pattern: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
    example: "https://github.com/username",
  },
};

const urlSchema = z.string().url().refine((url) => {
  return Object.values(SOCIAL_PLATFORMS).some(
    (platform) => platform.pattern.test(url)
  );
}, "Invalid social media URL format");

export type Platform = keyof typeof SOCIAL_PLATFORMS;

interface SocialLinkValidatorProps {
  url: string;
  platform: Platform;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
}

export function SocialLinkValidator({
  url,
  platform,
  onChange,
  onValidChange,
}: SocialLinkValidatorProps) {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const platformInfo = SOCIAL_PLATFORMS[platform];

  const validateUrl = (value: string) => {
    try {
      urlSchema.parse(value);
      const isValidPlatform = platformInfo.pattern.test(value);
      setIsValid(isValidPlatform);
      setError(null);
      onValidChange?.(isValidPlatform);
    } catch (err) {
      setIsValid(false);
      setError("Please enter a valid URL");
      onValidChange?.(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);
    validateUrl(value);
  };

  const Icon = platformInfo.icon;

  return (
    <div className="space-y-2">
      <Label>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" />
          {platformInfo.name}
        </div>
      </Label>
      <div className="relative">
        <Input
          type="url"
          value={url}
          onChange={handleChange}
          placeholder={platformInfo.example}
          className={`pr-8 ${
            url
              ? isValid
                ? "border-green-500 focus-visible:ring-green-500"
                : "border-red-500 focus-visible:ring-red-500"
              : ""
          }`}
        />
        {url && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && url && !isValid && (
        <Alert>
          <AlertDescription>
            Expected format: {platformInfo.example}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export { SOCIAL_PLATFORMS };