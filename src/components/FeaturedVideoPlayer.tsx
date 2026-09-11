"use client";

import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/types";
import { formatPublishedDate, formatViewCount } from "@/lib/format";

// The big preview card at the top of the Videos section. It silently
// autoplays (muted, as all browsers require for autoplay) once scrolled
// into view, and swaps back to a static thumbnail once it scrolls away, so
// we're not running an invisible player in the background. Clicking it any
// time opens the full modal player with sound.
export function FeaturedVideoPlayer({ video, onOpenModal }: { video: Video; onOpenModal: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="mx-auto mb-8 w-4/5">
      <button
        onClick={onOpenModal}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-sand-dark text-left"
        aria-label={`Play ${video.title}`}
      >
        {inView ? (
          <iframe
            className="pointer-events-none absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&modestbranding=1&playsinline=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media"
          />
        ) : video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- background preview swap, not the primary content image
          <img src={video.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute bottom-4 right-4 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
          {video.durationLabel}
        </span>
      </button>
      <h3 className="mt-3 text-lg font-semibold text-cloud sm:text-xl">{video.title}</h3>
      <p className="mt-1 text-sm text-cloud/60">
        {formatPublishedDate(video.publishedAt)} · {formatViewCount(video.viewCount)}
      </p>
    </div>
  );
}
