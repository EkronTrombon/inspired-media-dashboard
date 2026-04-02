import { TrendingUp, Users, Heart, Play, Share2 } from "lucide-react";

const stats = [
  { label: "Followers", value: "58.1K", icon: Users, change: "+12.4%" },
  { label: "Likes", value: "432K", icon: Heart, change: "+18.7%" },
  { label: "Video Views", value: "2.3M", icon: Play, change: "+23.5%" },
  { label: "Shares", value: "14.2K", icon: Share2, change: "+9.1%" },
];

export default function TikTokPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/30">
          <TrendingUp className="h-6 w-6 text-slate-800 dark:text-slate-200" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">TikTok Manager</h1>
          <p className="text-muted-foreground">Track your TikTok performance and viral content.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">{stat.change} this month</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Video Performance</h2>
          <p className="text-sm text-muted-foreground">
            Per-video analytics, watch time, completion rate, and trend tracking coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Trending Sounds & Hashtags</h2>
          <p className="text-sm text-muted-foreground">
            Discover trending audio and hashtags relevant to your niche coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Content Calendar</h2>
          <p className="text-sm text-muted-foreground">
            Schedule and plan your TikTok content in advance coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Audience Demographics</h2>
          <p className="text-sm text-muted-foreground">
            Age, location, and interest breakdowns for your TikTok audience coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
