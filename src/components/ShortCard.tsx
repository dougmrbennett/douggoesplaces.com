import Image from "next/image";
import type { Video } from "@/lib/types";

export function ShortCard({
  video,
  matchSnippet,
  onClick,
}: {
  video: Video;
  matchSnippet?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left"
      aria-label={`Play ${video.title}`}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-sand-dark">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 40vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.durationLabel}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-xs font-medium text-cloud group-hover:text-sunset-light sm:text-sm">
        {video.title}
      </h3>
      {matchSnippet ? (
        <p className="mt-1 line-clamp-2 text-xs text-cloud/50 italic">&ldquo;{matchSnippet}&rdquo;</p>
      ) : null}
    </button>
  );
}
