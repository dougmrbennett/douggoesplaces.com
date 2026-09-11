export interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  thumbnailUrl: string;
  durationSeconds: number;
  durationLabel: string;
  viewCount: number;
  isShort: boolean;
}

export interface ChannelData {
  videos: Video[];
  shorts: Video[];
  fetchedAt: string;
  usingSampleData: boolean;
}
