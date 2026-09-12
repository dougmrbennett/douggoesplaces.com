"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { SocialLinks } from "./SocialLinks";
import { YouTubeSubscribeButton } from "./YouTubeSubscribeButton";

// Everything here reads from config/site.json, so swapping the hero video,
// image, or tagline never requires touching this file.
export function Hero() {
  const { hero, channelName, tagline } = siteConfig;
  const [imageFailed, setImageFailed] = useState(false);
  // A server-rendered <img> that 404s can fail before React finishes
  // hydrating and attaches the onError listener, so the "hide on failure"
  // handler below would never run. Rendering the image only after mount
  // sidesteps that race.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative flex min-h-[70vh] w-full items-end overflow-hidden bg-ink text-white sm:min-h-[85vh] lg:min-h-[90vh]">
      {/* Warm gradient shown at all times as a base layer, so the hero never
          looks broken even before real photos/video are added. */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean-dark via-ink to-sunset/40" />

      {hero.type === "youtube" && hero.youtubeVideoId ? (
        <iframe
          className="pointer-events-none absolute inset-0 h-full w-full scale-150 object-cover"
          src={`https://www.youtube-nocookie.com/embed/${hero.youtubeVideoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${hero.youtubeVideoId}&modestbranding=1&playsinline=1&rel=0`}
          title="Background video"
          allow="autoplay; encrypted-media"
        />
      ) : hero.type === "video" && hero.videoFile ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={hero.videoFile}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : null}

      {mounted && hero.type === "image" && hero.image && !imageFailed ? (
        <Image
          src={hero.image}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={80}
          onError={() => setImageFailed(true)}
          className="object-cover"
        />
      ) : null}

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10 pt-32 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] sm:px-10 sm:pb-24 sm:pt-40">
        <div className="mb-4 flex items-center gap-3 sm:gap-4">
          {siteConfig.avatarImage ? (
            <Image
              src={siteConfig.avatarImage}
              alt={channelName}
              width={200}
              height={200}
              priority
              className="h-14 w-14 shrink-0 rounded-full border-2 border-white/70 object-cover shadow-lg sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-[168px] lg:w-[168px] xl:h-[192px] xl:w-[192px]"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.1em] text-sunset-light sm:text-sm sm:tracking-[0.2em]">
              {siteConfig.youtube.channelHandle}
            </p>
          </div>
        </div>
        {/* The banner photo already shows the "Doug Goes Places" wordmark and
            tagline, so we don't repeat them visually here. This heading stays
            for screen readers and search engines. */}
        <h1 className="sr-only">
          {channelName} — {tagline}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-4">
          <YouTubeSubscribeButton />
          <SocialLinks variant="outline" />
        </div>
      </div>
    </section>
  );
}
