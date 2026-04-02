import { PlayCircle, Users, Eye, ThumbsUp, Clock } from "lucide-react";

const stats = [
  { label: "Subscribers", value: "12.3K", icon: Users, change: "+3.2%" },
  { label: "Total Views", value: "892K", icon: Eye, change: "+6.4%" },
  { label: "Likes", value: "28.1K", icon: ThumbsUp, change: "+4.7%" },
  { label: "Watch Time", value: "4.2K hrs", icon: Clock, change: "+11.2%" },
];

export default function YouTubePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/30">
          <PlayCircle className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">YouTube Manager</h1>
          <p className="text-muted-foreground">Monitor your YouTube channel growth and video performance.</p>
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
          <h2 className="mb-2 text-lg font-semibold">Video Library</h2>
          <p className="text-sm text-muted-foreground">
            Browse, manage, and analyze all your YouTube videos coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Revenue & Monetization</h2>
          <p className="text-sm text-muted-foreground">
            Ad revenue, RPM, and monetization insights coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">SEO & Discoverability</h2>
          <p className="text-sm text-muted-foreground">
            Keyword analysis, title optimization, and search ranking coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Community & Comments</h2>
          <p className="text-sm text-muted-foreground">
            Comment moderation, community posts, and subscriber interactions coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
