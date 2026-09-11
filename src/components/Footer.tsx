import { siteConfig } from "@/lib/site-config";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="mt-20 bg-ink py-12 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 text-center">
        <p className="text-lg font-semibold">{siteConfig.channelName}</p>
        <SocialLinks />
        <p className="text-sm text-white/50">
          &copy; {new Date().getFullYear()} {siteConfig.channelName}. All videos property of their
          respective owner.
        </p>
      </div>
    </footer>
  );
}
