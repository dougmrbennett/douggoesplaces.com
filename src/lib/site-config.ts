import rawConfig from "../../config/site.json";

export interface SiteConfig {
  channelName: string;
  tagline: string;
  description: string;
  social: {
    youtubeUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
    email: string;
    buyMeACoffeeUrl: string;
  };
  youtube: {
    channelHandle: string;
    channelId: string;
  };
  hero: {
    type: "image" | "youtube" | "video";
    youtubeVideoId: string;
    videoFile: string;
    image: string;
  };
  avatarImage: string;
  featuredVideoId: string;
}

export const siteConfig: SiteConfig = rawConfig as SiteConfig;
