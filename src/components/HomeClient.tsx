"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse, { type FuseResultMatch } from "fuse.js";
import type { Video } from "@/lib/types";
import { VideoCard } from "./VideoCard";
import { ShortCard } from "./ShortCard";
import { VideoModal } from "./VideoModal";
import { FeaturedVideoPlayer } from "./FeaturedVideoPlayer";
import { ShortsCarousel } from "./ShortsCarousel";

type SortOption = "newest" | "oldest" | "views";
type SearchItem = Video & { kind: "video" | "short" };

// How many non-featured videos to reveal per "Show more" click.
const VIDEOS_PAGE_SIZE = 6;

const SNIPPET_RADIUS = 60;

function getSnippet(item: SearchItem, matches: readonly FuseResultMatch[] | undefined): string | undefined {
  if (!matches) return undefined;
  // Prefer a description match (most informative), then tags, then title.
  const descriptionMatch = matches.find((m) => m.key === "description");
  const tagMatch = matches.find((m) => m.key === "tags");

  if (descriptionMatch?.indices?.length) {
    const [start, end] = descriptionMatch.indices[descriptionMatch.indices.length - 1];
    const from = Math.max(0, start - SNIPPET_RADIUS);
    const to = Math.min(item.description.length, end + SNIPPET_RADIUS);
    const prefix = from > 0 ? "…" : "";
    const suffix = to < item.description.length ? "…" : "";
    return `${prefix}${item.description.slice(from, to).trim()}${suffix}`;
  }

  if (tagMatch) {
    return `Tagged “${item.tags[Number(tagMatch.refIndex ?? 0)] ?? tagMatch.value}”`;
  }

  return undefined;
}

export function HomeClient({ videos, shorts }: { videos: Video[]; shorts: Video[] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [videosShown, setVideosShown] = useState(VIDEOS_PAGE_SIZE);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const v of videos) for (const t of v.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [videos]);

  const fuse = useMemo(() => {
    const items: SearchItem[] = [
      ...videos.map((v) => ({ ...v, kind: "video" as const })),
      ...shorts.map((v) => ({ ...v, kind: "short" as const })),
    ];
    return new Fuse(items, {
      keys: [
        { name: "title", weight: 2 },
        { name: "description", weight: 1 },
        { name: "tags", weight: 1.5 },
      ],
      includeMatches: true,
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [videos, shorts]);

  const trimmedQuery = query.trim();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return null;
    return fuse.search(trimmedQuery);
  }, [fuse, trimmedQuery]);

  const matchedVideos = searchResults?.filter((r) => r.item.kind === "video") ?? [];
  const matchedShorts = searchResults?.filter((r) => r.item.kind === "short") ?? [];

  const visibleVideos = useMemo(() => {
    let list = filterTag ? videos.filter((v) => v.tags.includes(filterTag)) : videos;
    list = [...list].sort((a, b) => {
      if (sortBy === "newest") return b.publishedAt.localeCompare(a.publishedAt);
      if (sortBy === "oldest") return a.publishedAt.localeCompare(b.publishedAt);
      return b.viewCount - a.viewCount;
    });
    return list;
  }, [videos, filterTag, sortBy]);

  // Reset back to the first page whenever the list underneath it changes.
  useEffect(() => {
    setVideosShown(VIDEOS_PAGE_SIZE);
  }, [filterTag, sortBy]);

  const [featuredVideo, ...restVideos] = visibleVideos;
  const shownVideos = restVideos.slice(0, videosShown);
  const hasMoreVideos = restVideos.length > videosShown;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10">
      {/* Search */}
      <div className="mx-auto max-w-xl">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations, hotels, airlines…"
          className="w-full rounded-full border border-cloud/15 bg-sand-dark px-5 py-3 text-sm text-cloud shadow-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/30"
        />
      </div>

      {trimmedQuery ? (
        <div className="mt-10">
          <p className="text-sm text-cloud/60">
            {matchedVideos.length + matchedShorts.length} result
            {matchedVideos.length + matchedShorts.length === 1 ? "" : "s"} for &ldquo;{trimmedQuery}
            &rdquo;
          </p>

          {matchedVideos.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-cloud">Videos</h2>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {matchedVideos.map(({ item, matches }) => (
                  <VideoCard
                    key={item.id}
                    video={item}
                    matchSnippet={getSnippet(item, matches)}
                    onClick={() => setActiveVideo(item)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {matchedShorts.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-cloud">Shorts &amp; Reels</h2>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
                {matchedShorts.map(({ item, matches }) => (
                  <ShortCard
                    key={item.id}
                    video={item}
                    matchSnippet={getSnippet(item, matches)}
                    onClick={() => setActiveVideo(item)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {matchedVideos.length === 0 && matchedShorts.length === 0 ? (
            <p className="mt-6 text-cloud/60">No videos match that search yet — try a different destination, hotel, or airline.</p>
          ) : null}
        </div>
      ) : (
        <>
          <div id="videos" className="mt-14">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-cloud">Videos</h2>
              <div className="flex flex-wrap items-center gap-3">
                {allTags.length > 0 ? (
                  <select
                    value={filterTag ?? ""}
                    onChange={(e) => setFilterTag(e.target.value || null)}
                    className="rounded-full border border-cloud/15 bg-sand-dark px-4 py-2 text-sm text-cloud outline-none focus:border-ocean"
                  >
                    <option value="">All destinations</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                ) : null}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-full border border-cloud/15 bg-sand-dark px-4 py-2 text-sm text-cloud outline-none focus:border-ocean"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="views">Most viewed</option>
                </select>
              </div>
            </div>

            {featuredVideo ? (
              <div className="mt-6">
                <FeaturedVideoPlayer video={featuredVideo} onOpenModal={() => setActiveVideo(featuredVideo)} />
              </div>
            ) : null}

            <div className="relative">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {shownVideos.map((video) => (
                  <VideoCard key={video.id} video={video} onClick={() => setActiveVideo(video)} />
                ))}
              </div>
              {hasMoreVideos ? (
                <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-32 bg-gradient-to-t from-sand to-transparent" />
              ) : null}
            </div>
            {hasMoreVideos ? (
              <div className="relative z-10 -mt-6 flex justify-center">
                <button
                  onClick={() => setVideosShown((n) => n + VIDEOS_PAGE_SIZE)}
                  className="rounded-full border border-cloud/10 bg-sand-dark px-6 py-3 text-sm font-semibold text-cloud shadow-md transition-colors hover:bg-ink"
                >
                  Show more videos
                </button>
              </div>
            ) : null}
          </div>

          {shorts.length > 0 ? (
            <div id="shorts" className="mt-16">
              <h2 className="text-2xl font-bold text-cloud">Shorts &amp; Reels</h2>
              <p className="mt-1 text-sm text-cloud/60">
                The same vertical videos posted to Instagram and TikTok, all in one place. Scroll sideways to browse.
              </p>
              <div className="mt-6">
                <ShortsCarousel shorts={shorts} onOpenModal={(video) => setActiveVideo(video)} />
              </div>
            </div>
          ) : null}
        </>
      )}

      {activeVideo ? <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} /> : null}
    </div>
  );
}
