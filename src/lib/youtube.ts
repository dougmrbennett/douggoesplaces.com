import { parseIsoDuration, formatDuration } from "./duration";
import type { ChannelData, Video } from "./types";
import sampleData from "@/data/sample-videos.json";

// How long Next.js should keep the fetched YouTube data before checking for
// new uploads again. 6 hours means new videos show up on the live site
// within 6 hours of publishing, with no manual redeploy needed.
const REVALIDATE_SECONDS = 6 * 60 * 60;

// YouTube caps Shorts at 3 minutes; anything longer is never a Short, so we
// only bother checking videos at or under this length (with a small buffer).
const MAYBE_SHORT_SECONDS = 210;
// How many "is this really a Short?" checks to run at once.
const SHORT_CHECK_CONCURRENCY = 8;

const API_BASE = "https://www.googleapis.com/youtube/v3";

interface RawThumbnail {
  url: string;
  width?: number;
  height?: number;
}

interface RawVideoItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    tags?: string[];
    thumbnails?: Record<string, RawThumbnail>;
  };
  contentDetails?: {
    duration?: string;
  };
  statistics?: {
    viewCount?: string;
  };
}

function pickThumbnail(thumbnails?: Record<string, RawThumbnail>): RawThumbnail | undefined {
  if (!thumbnails) return undefined;
  return (
    thumbnails.maxres ??
    thumbnails.standard ??
    thumbnails.high ??
    thumbnails.medium ??
    thumbnails.default
  );
}

// The YouTube Data API has no "is this a Short" field, so we use the one
// public signal that reliably tells them apart: youtube.com/shorts/{id}
// redirects to the normal watch page for anything that isn't actually a
// Short, but stays put (200, no redirect) for a real Short. This is more
// reliable than guessing from thumbnail shape, which YouTube sometimes
// reports as landscape even for vertical Shorts.
async function isShortByRedirectCheck(videoId: string): Promise<boolean> {
  try {
    // HEAD avoids downloading the (multi-megabyte) page body — we only care
    // where it redirects to.
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: "HEAD",
      redirect: "follow",
      next: { revalidate: REVALIDATE_SECONDS },
    });
    return res.url.includes("/shorts/");
  } catch {
    // If the check fails for any reason, don't block the whole build over
    // one video — just leave it classified as a regular video.
    return false;
  }
}

async function classifyShorts(videos: Video[]): Promise<void> {
  const candidates = videos.filter((v) => v.durationSeconds > 0 && v.durationSeconds <= MAYBE_SHORT_SECONDS);

  for (const batch of chunk(candidates, SHORT_CHECK_CONCURRENCY)) {
    const results = await Promise.all(batch.map((v) => isShortByRedirectCheck(v.id)));
    batch.forEach((video, i) => {
      video.isShort = results[i];
    });
  }
}

async function youtubeFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API request to ${path} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

async function getUploadsPlaylistId(apiKey: string, channelId: string): Promise<string> {
  const data = await youtubeFetch<{
    items: { contentDetails: { relatedPlaylists: { uploads: string } } }[];
  }>("channels", {
    part: "contentDetails",
    id: channelId,
    key: apiKey,
  });
  const uploadsId = data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) {
    throw new Error(
      "Could not find an uploads playlist for that channel ID. Double-check YOUTUBE_CHANNEL_ID."
    );
  }
  return uploadsId;
}

async function getAllPlaylistVideoIds(apiKey: string, playlistId: string): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      part: "contentDetails",
      playlistId,
      maxResults: "50",
      key: apiKey,
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await youtubeFetch<{
      items: { contentDetails: { videoId: string } }[];
      nextPageToken?: string;
    }>("playlistItems", params);

    for (const item of data.items) {
      ids.push(item.contentDetails.videoId);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return ids;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function getVideoDetails(apiKey: string, videoIds: string[]): Promise<Video[]> {
  const videos: Video[] = [];

  for (const idBatch of chunk(videoIds, 50)) {
    const data = await youtubeFetch<{ items: RawVideoItem[] }>("videos", {
      part: "snippet,contentDetails,statistics",
      id: idBatch.join(","),
      key: apiKey,
    });

    for (const item of data.items) {
      // Skip private/deleted videos, which come back with no snippet.
      if (!item.snippet || !item.contentDetails?.duration) continue;

      const durationSeconds = parseIsoDuration(item.contentDetails.duration);
      const thumbnail = pickThumbnail(item.snippet.thumbnails);

      videos.push({
        id: item.id,
        title: item.snippet.title ?? "(untitled)",
        description: item.snippet.description ?? "",
        publishedAt: item.snippet.publishedAt ?? new Date(0).toISOString(),
        tags: item.snippet.tags ?? [],
        thumbnailUrl: thumbnail?.url ?? "",
        durationSeconds,
        durationLabel: formatDuration(durationSeconds),
        viewCount: Number(item.statistics?.viewCount ?? 0),
        isShort: false,
      });
    }
  }

  await classifyShorts(videos);

  return videos;
}

async function fetchLiveChannelData(apiKey: string, channelId: string): Promise<ChannelData> {
  const uploadsPlaylistId = await getUploadsPlaylistId(apiKey, channelId);
  const videoIds = await getAllPlaylistVideoIds(apiKey, uploadsPlaylistId);
  const allVideos = await getVideoDetails(apiKey, videoIds);

  const videos = allVideos.filter((v) => !v.isShort);
  const shorts = allVideos.filter((v) => v.isShort);

  return {
    videos,
    shorts,
    fetchedAt: new Date().toISOString(),
    usingSampleData: false,
  };
}

function getSampleChannelData(): ChannelData {
  return {
    videos: sampleData.videos as Video[],
    shorts: sampleData.shorts as Video[],
    fetchedAt: new Date().toISOString(),
    usingSampleData: true,
  };
}

// The one function the rest of the site calls. Falls back to bundled sample
// data (clearly labeled) if the API key/channel ID aren't configured yet, or
// if the YouTube API call fails for any reason, so the site never goes down
// just because of a missing key or a temporary API hiccup.
export async function getChannelData(): Promise<ChannelData> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    console.warn(
      "[youtube] YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID is not set — showing sample data instead of real videos."
    );
    return getSampleChannelData();
  }

  try {
    return await fetchLiveChannelData(apiKey, channelId);
  } catch (err) {
    console.error("[youtube] Failed to fetch real channel data, falling back to sample data:", err);
    return getSampleChannelData();
  }
}
