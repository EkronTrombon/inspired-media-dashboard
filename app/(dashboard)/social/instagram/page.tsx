import { Camera, Heart, Users, MessageCircle, TrendingUp } from "lucide-react";

const stats = [
  { label: "Followers", value: "24.5K", icon: Users, change: "+2.4%" },
  { label: "Likes", value: "18.2K", icon: Heart, change: "+5.1%" },
  { label: "Comments", value: "1.3K", icon: MessageCircle, change: "+1.8%" },
  { label: "Reach", value: "312K", icon: TrendingUp, change: "+8.3%" },
];

export default function InstagramPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-pink-50 p-2 dark:bg-pink-950/30">
          <Camera className="h-6 w-6 text-pink-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instagram Manager</h1>
          <p className="text-muted-foreground">Manage your Instagram presence and analytics.</p>
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
          <h2 className="mb-2 text-lg font-semibold">Feed Management</h2>
          <p className="text-sm text-muted-foreground">
            Post scheduling, caption editor, hashtag suggestions, and grid preview coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Stories & Reels</h2>
          <p className="text-sm text-muted-foreground">
            Stories analytics, Reels performance, and content calendar coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Audience Insights</h2>
          <p className="text-sm text-muted-foreground">
            Demographics, peak hours, and follower growth charts coming soon.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Top Posts</h2>
          <p className="text-sm text-muted-foreground">
            Best performing posts ranked by engagement coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
