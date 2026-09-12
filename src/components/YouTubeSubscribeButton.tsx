"use client";

import Script from "next/script";
import { siteConfig } from "@/lib/site-config";

// YouTube's official embeddable Subscribe button. When a visitor is already
// signed in to YouTube, this subscribes them in place with one click — no
// redirect to youtube.com. There's no notification-bell equivalent: YouTube
// doesn't expose that as something a third-party site can trigger, so
// visitors still tap the bell themselves on YouTube after subscribing.
//
// Requires youtube.channelId in config/site.json. Until that's filled in
// (see README), this falls back to a normal link button.
function PlainSubscribeLink() {
  return (
    <a
      href={siteConfig.social.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-sunset px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
    >
      Subscribe on YouTube
    </a>
  );
}

export function YouTubeSubscribeButton() {
  const channelId = siteConfig.youtube.channelId;

  if (!channelId) {
    return <PlainSubscribeLink />;
  }

  return (
    <>
      {/* Google's official widget (data-layout="full") renders as a fixed
          ~450px-wide iframe with no responsive option, which overflows a
          phone screen. Use our own compact button below that width instead,
          and reserve the richer official widget for screens it actually
          fits on. */}
      <div className="sm:hidden">
        <PlainSubscribeLink />
      </div>
      <div className="hidden sm:block">
        <Script src="https://apis.google.com/js/platform.js" strategy="lazyOnload" />
        <div
          className="g-ytsubscribe"
          data-channelid={channelId}
          data-layout="full"
          data-count="default"
          data-theme="dark"
        />
      </div>
    </>
  );
}
