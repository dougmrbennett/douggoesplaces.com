"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Video } from "@/lib/types";

// Don't let one abnormally long or zero-length duration value break the
// sequence — always wait at least this long before advancing.
const MIN_SLIDE_SECONDS = 3;

function ShortSlide({
  video,
  active,
  onOpenModal,
  registerRef,
}: {
  video: Video;
  active: boolean;
  onOpenModal: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={registerRef} className="w-[45%] shrink-0 snap-center sm:w-[28%] lg:w-[18%]">
      <button
        onClick={onOpenModal}
        className="group relative block aspect-[9/16] w-full overflow-hidden rounded-xl bg-sand-dark"
        aria-label={`Play ${video.title}`}
      >
        {active ? (
          <iframe
            className="pointer-events-none absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&modestbranding=1&playsinline=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media"
          />
        ) : video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.durationLabel}
        </span>
      </button>
      <h3 className="mt-2 line-clamp-2 text-xs font-medium text-cloud sm:text-sm">{video.title}</h3>
    </div>
  );
}

// A sideways-scrolling row of Shorts that plays itself: it autoplays the
// first one, then automatically scrolls to and plays the next after that
// clip's real length, cycling through the whole row. Clicking any card
// still opens it in the full modal player.
export function ShortsCarousel({ shorts, onOpenModal }: { shorts: Video[]; onOpenModal: (v: Video) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef(new Map<number, HTMLDivElement>());
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (shorts.length === 0) return;
    const seconds = Math.max(shorts[activeIndex]?.durationSeconds ?? 0, MIN_SLIDE_SECONDS);
    const timer = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % shorts.length);
    }, seconds * 1000);
    return () => clearTimeout(timer);
  }, [activeIndex, shorts]);

  useEffect(() => {
    const slide = slideRefs.current.get(activeIndex);
    const track = trackRef.current;
    if (!slide || !track) return;
    // Scroll only the carousel track itself, not the page — scrollIntoView()
    // can also scroll the whole document to bring an off-screen element into
    // view, which was yanking the page down to this section on load.
    const targetLeft = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
    track.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [activeIndex]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="scrollbar-none -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2 sm:-mx-10 sm:px-10"
      >
        {shorts.map((video, index) => (
          <ShortSlide
            key={video.id}
            video={video}
            active={index === activeIndex}
            onOpenModal={() => onOpenModal(video)}
            registerRef={(el) => {
              if (el) slideRefs.current.set(index, el);
              else slideRefs.current.delete(index);
            }}
          />
        ))}
      </div>
      {/* Edge fades hint that the row scrolls sideways */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-sand to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-sand to-transparent sm:w-16" />
    </div>
  );
}
