import { Mic2, Headphones, Play, TrendingUp, Users } from "lucide-react";

const stats = [
  { label: "Total Listeners", value: "8.9K", icon: Users, change: "+5.6%" },
  { label: "Downloads", value: "42.3K", icon: Headphones, change: "+7.2%" },
  { label: "Episodes", value: "42", icon: Play, change: "+2 this month" },
  { label: "Avg. Growth", value: "+12%", icon: TrendingUp, change: "month over month" },
];

export default function PodcastPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/30">
          <Mic2 className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Podcast Analytics</h1>
          <p className="text-muted-foreground">Simplecast analytics — episode performance and listener insights.</p>
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
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Episode Performance</h2>
          <p className="text-sm text-muted-foreground">
            Per-episode downloads, listen-through rate, and listener retention coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Listener Geography</h2>
          <p className="text-sm text-muted-foreground">
            Map view of where your listeners are tuning in from coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Distribution Platforms</h2>
          <p className="text-sm text-muted-foreground">
            Breakdown by Spotify, Apple Podcasts, Google Podcasts, and more coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Episode Manager</h2>
          <p className="text-sm text-muted-foreground">
            Publish, schedule, and manage all your Simplecast episodes coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
