import { siteConfig } from "@/lib/site-config";

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .25 2.4.42.6.24 1.05.53 1.5.98.45.45.74.9.98 1.5.17.4.36 1.2.42 2.4.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 2-.42 2.4-.24.6-.53 1.05-.98 1.5-.45.45-.9.74-1.5.98-.4.17-1.2.36-2.4.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-2-.25-2.4-.42a4.05 4.05 0 0 1-1.5-.98 4.05 4.05 0 0 1-.98-1.5c-.17-.4-.36-1.2-.42-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-2 .42-2.4.24-.6.53-1.05.98-1.5.45-.45.9-.74 1.5-.98.4-.17 1.2-.36 2.4-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.14 0-3.5 0-4.75.07-1 .05-1.6.22-1.96.36-.5.19-.85.42-1.22.79-.37.37-.6.72-.79 1.22-.14.36-.31.94-.36 1.96C2.8 8.5 2.8 8.86 2.8 12s0 3.5.07 4.75c.05 1 .22 1.6.36 1.96.19.5.42.85.79 1.22.37.37.72.6 1.22.79.36.14.94.31 1.96.36C8.5 21.2 8.86 21.2 12 21.2s3.5 0 4.75-.07c1-.05 1.6-.22 1.96-.36.5-.19.85-.42 1.22-.79.37-.37.6-.72.79-1.22.14-.36.31-.94.36-1.96.07-1.25.07-1.61.07-4.75s0-3.5-.07-4.75c-.05-1-.22-1.6-.36-1.96a3.3 3.3 0 0 0-.79-1.22 3.3 3.3 0 0 0-1.22-.79c-.36-.14-.94-.31-1.96-.36C15.5 3.8 15.14 3.8 12 3.8Zm0 3.5a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 1.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm4.9-2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M16.6 2h-3.3v13.3a2.9 2.9 0 1 1-2.05-2.77v-3.4a6.3 6.3 0 1 0 5.35 6.23V9.1a7.9 7.9 0 0 0 4.5 1.4V7.2a4.6 4.6 0 0 1-4.5-4.6V2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}

const links = [
  { key: "youtube", label: "YouTube", href: () => siteConfig.social.youtubeUrl, Icon: YouTubeIcon, external: true },
  { key: "instagram", label: "Instagram", href: () => siteConfig.social.instagramUrl, Icon: InstagramIcon, external: true },
  { key: "tiktok", label: "TikTok", href: () => siteConfig.social.tiktokUrl, Icon: TikTokIcon, external: true },
  { key: "email", label: "Email", href: () => `mailto:${siteConfig.social.email}`, Icon: MailIcon, external: false },
] as const;

export function SocialLinks({ variant = "solid" }: { variant?: "solid" | "outline" }) {
  return (
    <div className="flex items-center gap-3">
      {links.map(({ key, label, href, Icon, external }) => (
        <a
          key={key}
          href={href()}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={label}
          className={
            variant === "solid"
              ? "flex h-10 w-10 items-center justify-center rounded-full bg-sunset text-white transition-transform hover:scale-105"
              : "flex h-10 w-10 items-center justify-center rounded-full bg-ink/75 text-white transition-colors hover:bg-ink/90"
          }
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
