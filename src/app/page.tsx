import { getChannelData } from "@/lib/youtube";
import { Hero } from "@/components/Hero";
import { HomeClient } from "@/components/HomeClient";
import { Footer } from "@/components/Footer";

// Belt-and-suspenders alongside the `next: { revalidate }` option already set
// on each YouTube API fetch — this keeps the whole page on the same refresh
// schedule even if a fetch call is ever added without its own option.
export const revalidate = 21600; // 6 hours

export default async function Home() {
  const { videos, shorts, usingSampleData } = await getChannelData();

  return (
    <div className="flex flex-1 flex-col">
      {usingSampleData ? (
        <div className="bg-gold px-4 py-2 text-center text-sm font-medium text-ink">
          Showing sample videos — connect the YouTube API to display your real channel. See the README.
        </div>
      ) : null}
      <Hero />
      <HomeClient videos={videos} shorts={shorts} />
      <Footer />
    </div>
  );
}
