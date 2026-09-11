"use client";

import { useEffect } from "react";
import type { Video } from "@/lib/types";

export function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className={`relative w-full ${video.isShort ? "max-w-sm" : "max-w-4xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-10 right-0 text-2xl text-white/80 hover:text-white"
        >
          &times;
        </button>

        <div className={`overflow-hidden rounded-lg bg-black ${video.isShort ? "aspect-[9/16]" : "aspect-video"}`}>
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="mt-3 flex items-start justify-between gap-4 text-white">
          <h3 className="line-clamp-2 text-sm font-medium sm:text-base">{video.title}</h3>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 whitespace-nowrap rounded-full bg-sunset px-4 py-2 text-xs font-semibold hover:scale-105"
          >
            Watch on YouTube ↗
          </a>
        </div>
      </div>
    </div>
  );
}
