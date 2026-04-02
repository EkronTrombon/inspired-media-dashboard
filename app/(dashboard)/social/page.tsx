import { Camera, PlayCircle, Mic2, TrendingUp, Users, Heart, Eye, BarChart3 } from "lucide-react";

const platformStats = [
  {
    platform: "Instagram",
    icon: Camera,
    followers: "24.5K",
    engagement: "4.2%",
    posts: 312,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    platform: "TikTok",
    icon: TrendingUp,
    followers: "58.1K",
    engagement: "7.8%",
    posts: 145,
    color: "text-slate-800 dark:text-slate-200",
    bg: "bg-slate-50 dark:bg-slate-800/30",
  },
  {
    platform: "YouTube",
    icon: PlayCircle,
    followers: "12.3K",
    engagement: "3.1%",
    posts: 87,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  {
    platform: "Podcast",
    icon: Mic2,
    followers: "8.9K",
    engagement: "—",
    posts: 42,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
];

const summaryStats = [
  { label: "Total Followers", value: "103.8K", icon: Users },
  { label: "Total Engagement", value: "18.4K", icon: Heart },
  { label: "Total Reach", value: "2.1M", icon: Eye },
  { label: "Content Published", value: "586", icon: BarChart3 },
];

export default function SocialOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Social Media Overview</h1>
        <p className="text-muted-foreground">
          A summary of your performance across all platforms.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {platformStats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.platform}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className={`mb-4 inline-flex rounded-lg p-2 ${item.bg}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <h3 className="font-semibold">{item.platform}</h3>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Followers</span>
                  <span className="font-medium text-foreground">{item.followers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement</span>
                  <span className="font-medium text-foreground">{item.engagement}</span>
                </div>
                <div className="flex justify-between">
                  <span>Posts</span>
                  <span className="font-medium text-foreground">{item.posts}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">
          Detailed analytics, post scheduling, and content management coming soon.
        </p>
      </div>
    </div>
  );
}
