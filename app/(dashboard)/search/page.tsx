import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Newspaper, Bell } from "lucide-react";

const trendItems = [
  { rank: 1, topic: "AI-powered content creation", volume: "2.4M searches", change: "+142%" },
  { rank: 2, topic: "Short-form video marketing", volume: "1.8M searches", change: "+98%" },
  { rank: 3, topic: "Podcast advertising ROI", volume: "1.1M searches", change: "+67%" },
  { rank: 4, topic: "Instagram Threads growth", volume: "890K searches", change: "+54%" },
  { rank: 5, topic: "UGC content strategy", volume: "745K searches", change: "+43%" },
];

const newsItems = [
  {
    title: "Meta Announces New Creator Monetization Tools",
    source: "Social Media Today",
    time: "2 hours ago",
    summary: "Meta is rolling out expanded monetization features for Instagram and Facebook creators, including new subscription tiers and bonus programs.",
  },
  {
    title: "TikTok Introduces Extended Video Format",
    source: "TechCrunch",
    time: "5 hours ago",
    summary: "TikTok is testing videos up to 30 minutes long as it continues to compete with YouTube for long-form content audiences.",
  },
  {
    title: "YouTube Shorts Surpasses 70 Billion Daily Views",
    source: "The Verge",
    time: "1 day ago",
    summary: "YouTube reports that Shorts have reached a new milestone, with the platform investing further in creator incentive programs.",
  },
  {
    title: "Podcast Ad Revenue Projected to Hit $4B in 2026",
    source: "Advertising Age",
    time: "2 days ago",
    summary: "Industry analysts forecast continued strong growth in podcast advertising as the medium matures and measurement tools improve.",
  },
];

const updateItems = [
  {
    platform: "Instagram",
    update: "Algorithm update prioritizes Reels with original audio",
    date: "Apr 1, 2026",
    type: "Algorithm",
  },
  {
    platform: "TikTok",
    update: "New analytics dashboard launched for Business accounts",
    date: "Mar 28, 2026",
    type: "Feature",
  },
  {
    platform: "YouTube",
    update: "YouTube Studio rolls out AI-generated chapter markers",
    date: "Mar 25, 2026",
    type: "Feature",
  },
  {
    platform: "Simplecast",
    update: "Enhanced listener demographics now available for all plans",
    date: "Mar 20, 2026",
    type: "Feature",
  },
];

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search & Insights</h1>
        <p className="text-muted-foreground">
          Top marketing trends, industry news, and platform updates.
        </p>
      </div>

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            News
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-4">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Top Marketing Trends</h2>
              <p className="text-sm text-muted-foreground">Most searched marketing topics this week</p>
            </div>
            <div className="divide-y">
              {trendItems.map((item) => (
                <div key={item.rank} className="flex items-center gap-4 px-6 py-4">
                  <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                    {item.rank}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.topic}</p>
                    <p className="text-sm text-muted-foreground">{item.volume}</p>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="mt-4">
          <div className="space-y-4">
            {newsItems.map((item) => (
              <div key={item.title} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium">{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="updates" className="mt-4">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Platform Updates</h2>
              <p className="text-sm text-muted-foreground">Latest changes across your platforms</p>
            </div>
            <div className="divide-y">
              {updateItems.map((item) => (
                <div key={item.update} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{item.platform}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{item.update}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
