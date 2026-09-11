import Image from "next/image";
import type { Video } from "@/lib/types";
import { formatPublishedDate, formatViewCount } from "@/lib/format";

export function VideoCard({
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
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-sand-dark">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.durationLabel}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-cloud group-hover:text-sunset-light sm:text-base">
        {video.title}
      </h3>
      <p className="mt-1 text-xs text-cloud/60">
        {formatPublishedDate(video.publishedAt)} · {formatViewCount(video.viewCount)}
      </p>
      {matchSnippet ? (
        <p className="mt-1 line-clamp-2 text-xs text-cloud/50 italic">&ldquo;{matchSnippet}&rdquo;</p>
      ) : null}
    </button>
  );
}
