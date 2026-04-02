"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  PlayCircle,
  Mic2,
  Search,
  TrendingUp,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const socialNavItems: NavItem[] = [
  { label: "Overview", href: "/social", icon: LayoutDashboard },
  { label: "Instagram", href: "/social/instagram", icon: Camera },
  { label: "TikTok", href: "/social/tiktok", icon: TrendingUp },
  { label: "YouTube", href: "/social/youtube", icon: PlayCircle },
  { label: "Podcast", href: "/social/podcast", icon: Mic2 },
];

const searchNavItems: NavItem[] = [
  { label: "Trends & News", href: "/search", icon: Search },
];

const emailNavItems: NavItem[] = [
  { label: "Email Summary", href: "/email", icon: Mail },
];

function NavSection({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <div className="px-3 py-2">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
        {title}
      </p>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/social"
              ? pathname === "/social"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-5" style={{ borderColor: "var(--sidebar-border)" }}>
        <span className="font-heading text-lg font-semibold tracking-wide text-sidebar-foreground">
          Inspired Media
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <NavSection title="Social Media" items={socialNavItems} />
        <Separator className="my-2" />
        <NavSection title="Search" items={searchNavItems} />
        <Separator className="my-2" />
        <NavSection title="Email" items={emailNavItems} />
      </div>
    </aside>
  );
}
