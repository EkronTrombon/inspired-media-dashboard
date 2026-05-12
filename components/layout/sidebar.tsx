"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Camera,
  PlayCircle,
  Mic2,
  Search,
  TrendingUp,
  Mail,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { hasRole, type Role } from "@/lib/auth-roles";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: Role[];
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
  {
    label: "Email Summary",
    href: "/email",
    icon: Mail,
    roles: ["admin", "editor"],
  },
];

const settingsNavItems: NavItem[] = [
  {
    label: "Users",
    href: "/settings/users",
    icon: Users,
    roles: ["admin"],
  },
];

function NavSection({
  title,
  items,
  role,
}: {
  title: string;
  items: NavItem[];
  role: Role | undefined;
}) {
  const pathname = usePathname();

  const visible = items.filter((item) => hasRole(role, item.roles));
  if (visible.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
        {title}
      </p>
      <nav className="space-y-1">
        {visible.map((item) => {
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
  const { data: session } = useSession();
  const role = session?.user?.role;

  const showEmail = emailNavItems.some((item) => hasRole(role, item.roles));
  const showSettings = settingsNavItems.some((item) => hasRole(role, item.roles));

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-sidebar">
      <div
        className="flex h-14 items-center border-b px-5"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <span className="font-heading text-lg font-semibold tracking-wide text-sidebar-foreground">
          Inspired Media
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <NavSection title="Social Media" items={socialNavItems} role={role} />
        <Separator className="my-2" />
        <NavSection title="Search" items={searchNavItems} role={role} />
        {showEmail ? (
          <>
            <Separator className="my-2" />
            <NavSection title="Email" items={emailNavItems} role={role} />
          </>
        ) : null}
        {showSettings ? (
          <>
            <Separator className="my-2" />
            <NavSection title="Settings" items={settingsNavItems} role={role} />
          </>
        ) : null}
      </div>
    </aside>
  );
}
