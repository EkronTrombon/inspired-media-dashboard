"use client";

import { useState } from "react";
import { Mail, Inbox, BellOff, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InboxEmail {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  time: string;
  date: string;
  unread: boolean;
}

interface SubscriptionEmail {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  date: string;
  type: "Newsletter" | "Promotional" | "Product";
  frequency: string;
}

interface SpamEmail {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
}

// ─── Placeholder data ─────────────────────────────────────────────────────────

const inboxEmails: InboxEmail[] = [
  {
    id: "i1",
    from: "Sarah Johnson",
    email: "sarah.johnson@agency.com",
    subject: "Q2 Content Strategy Review",
    preview: "Hi Alyssa, I wanted to follow up on the content calendar we discussed last week and share some initial thoughts on the Q2 direction...",
    time: "10:24 AM",
    date: "Today",
    unread: true,
  },
  {
    id: "i2",
    from: "Podcast Today",
    email: "hello@podcasttoday.com",
    subject: "Your episode hit 10K downloads! 🎉",
    preview: "Congratulations! Episode 47 of your podcast has crossed 10,000 downloads — here's a breakdown of your listener data...",
    time: "9:12 AM",
    date: "Today",
    unread: false,
  },
  {
    id: "i3",
    from: "Marcus Rivera",
    email: "marcus@nikepartnerships.com",
    subject: "Brand Partnership Opportunity — Spring Campaign",
    preview: "Hi Alyssa, I'm reaching out on behalf of Nike to explore a potential collaboration for our upcoming Spring 2026 campaign...",
    time: "4:30 PM",
    date: "Yesterday",
    unread: true,
  },
  {
    id: "i4",
    from: "Canva Team",
    email: "noreply@canva.com",
    subject: "New templates designed for content creators",
    preview: "We've added 40+ new templates tailored for Instagram Reels covers, podcast episode artwork, and YouTube thumbnails...",
    time: "2:15 PM",
    date: "Yesterday",
    unread: false,
  },
  {
    id: "i5",
    from: "Christina Martinez",
    email: "christina@brandhouse.co",
    subject: "April collab — are you available?",
    preview: "Hey! Loved your last TikTok series. I'm working with a skincare brand that's a perfect fit and thought of you immediately...",
    time: "11:05 AM",
    date: "Mar 31, 2026",
    unread: true,
  },
  {
    id: "i6",
    from: "Spotify for Podcasters",
    email: "no-reply@spotifyforpodcasters.com",
    subject: "Your March listener report is ready",
    preview: "Here's your monthly summary: total streams, follower growth, top episodes, and audience demographics for March 2026...",
    time: "8:00 AM",
    date: "Mar 30, 2026",
    unread: false,
  },
];

const subscriptionEmails: SubscriptionEmail[] = [
  {
    id: "u1",
    from: "Mailchimp",
    email: "newsletter@mailchimp.com",
    subject: "Your weekly email marketing insights 📈",
    preview: "This week: open rate benchmarks by industry, the best time to send in 2026, and a deep-dive on re-engagement sequences...",
    date: "2 days ago",
    type: "Newsletter",
    frequency: "Weekly",
  },
  {
    id: "u2",
    from: "Shopify Partners",
    email: "partners@shopify.com",
    subject: "Today's trending products for your audience",
    preview: "Based on your niche, here are the top-selling products your followers are already buying — ready to promote...",
    date: "3 days ago",
    type: "Promotional",
    frequency: "Daily",
  },
  {
    id: "u3",
    from: "HubSpot Blog",
    email: "blog@hubspot.com",
    subject: "The creator economy is changing — here's how",
    preview: "New data from our State of Marketing 2026 report reveals a 38% increase in creator-led brand deals. What it means for you...",
    date: "4 days ago",
    type: "Newsletter",
    frequency: "3× / week",
  },
  {
    id: "u4",
    from: "Typeform",
    email: "digest@typeform.com",
    subject: "New form templates + product updates",
    preview: "We've added audience survey templates, a new logic branching feature, and integration with Notion — this week in Typeform...",
    date: "5 days ago",
    type: "Product",
    frequency: "Weekly",
  },
  {
    id: "u5",
    from: "Later Social",
    email: "hello@later.com",
    subject: "This week in social media scheduling",
    preview: "Instagram's new scheduling limits, TikTok's updated best-post times, and how to plan your content calendar for May...",
    date: "6 days ago",
    type: "Newsletter",
    frequency: "Weekly",
  },
];

const spamEmails: SpamEmail[] = [
  {
    id: "s1",
    from: "promo@deals-unlimited.net",
    subject: "YOU HAVE BEEN SELECTED!!!",
    preview: "Congratulations! You've been personally selected for an exclusive opportunity. Click here to claim your reward before it expires...",
    date: "Today",
  },
  {
    id: "s2",
    from: "noreply@free-iphone.win",
    subject: "Claim your free iPhone 16 Pro — offer expires tonight",
    preview: "As a valued customer you have been chosen to receive a complimentary iPhone 16 Pro. Complete the short survey to claim...",
    date: "Yesterday",
  },
  {
    id: "s3",
    from: "info@investment-returns.biz",
    subject: "Make $5,000/day working from home — guaranteed",
    preview: "Our proprietary system has helped thousands achieve financial freedom. No experience needed. Start earning today...",
    date: "Mar 31, 2026",
  },
  {
    id: "s4",
    from: "lottery@intl-prize.org",
    subject: "URGENT: You have won £1,500,000 — claim now",
    preview: "You have been selected as the winner of the International Digital Lottery. To claim your prize transfer a small processing fee...",
    date: "Mar 30, 2026",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const typeColors: Record<SubscriptionEmail["type"], string> = {
  Newsletter: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  Promotional: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  Product: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const [draftEmail, setDraftEmail] = useState<InboxEmail | null>(null);
  const [draftText, setDraftText] = useState("");
  const [unsubscribed, setUnsubscribed] = useState<Set<string>>(new Set());
  const [removedSpam, setRemovedSpam] = useState<Set<string>>(new Set());

  const unreadCount = inboxEmails.filter((e) => e.unread).length;
  const visibleSpam = spamEmails.filter((e) => !removedSpam.has(e.id));

  function openDraft(email: InboxEmail) {
    setDraftText("");
    setDraftEmail(email);
  }

  function closeDraft() {
    setDraftEmail(null);
    setDraftText("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/40">
          <Mail className="h-6 w-6 text-indigo-500 dark:text-indigo-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Summary</h1>
          <p className="text-muted-foreground">
            Inbox overview, unsubscribe suggestions, and spam review.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Unread</p>
          <p className="mt-1 text-3xl font-bold">{unreadCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">of {inboxEmails.length} inbox emails</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Unsubscribe Suggestions</p>
          <p className="mt-1 text-3xl font-bold">{subscriptionEmails.length - unsubscribed.size}</p>
          <p className="mt-1 text-xs text-muted-foreground">from the last 7 days</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Spam to Review</p>
          <p className="mt-1 text-3xl font-bold">{visibleSpam.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">emails in spam folder</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unsubscribe" className="flex items-center gap-2">
            <BellOff className="h-4 w-4" />
            Unsubscribe
          </TabsTrigger>
          <TabsTrigger value="spam" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Spam
            {visibleSpam.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                {visibleSpam.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Inbox ── */}
        <TabsContent value="inbox" className="mt-4">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Inbox</h2>
              <p className="text-sm text-muted-foreground">Your most recent emails</p>
            </div>
            <div className="divide-y">
              {inboxEmails.map((email) => (
                <div
                  key={email.id}
                  className={cn(
                    "flex items-start gap-4 px-6 py-4",
                    email.unread && "bg-muted/20"
                  )}
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(email.from)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-sm", email.unread ? "font-semibold" : "font-medium")}>
                        {email.from}
                      </span>
                      {email.unread && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {email.date} · {email.time}
                      </span>
                    </div>
                    <p className={cn("text-sm", email.unread ? "font-medium" : "text-muted-foreground")}>
                      {email.subject}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {email.preview}
                    </p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => openDraft(email)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "shrink-0"
                    )}
                  >
                    Draft Reply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Unsubscribe ── */}
        <TabsContent value="unsubscribe" className="mt-4">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Unsubscribe Suggestions</h2>
              <p className="text-sm text-muted-foreground">
                Newsletters and promotional emails from the last 7 days
              </p>
            </div>
            <div className="divide-y">
              {subscriptionEmails.map((email) => {
                const done = unsubscribed.has(email.id);
                return (
                  <div key={email.id} className="flex items-start gap-4 px-6 py-4">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {initials(email.from)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{email.from}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", typeColors[email.type])}>
                          {email.type}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {email.frequency}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {email.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{email.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{email.preview}</p>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() =>
                        setUnsubscribed((prev) => {
                          const next = new Set(prev);
                          next.add(email.id);
                          return next;
                        })
                      }
                      disabled={done}
                      className={cn(
                        buttonVariants({ variant: done ? "ghost" : "outline", size: "sm" }),
                        "shrink-0",
                        done && "cursor-default text-muted-foreground"
                      )}
                    >
                      {done ? "Unsubscribed ✓" : "Unsubscribe"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── Spam ── */}
        <TabsContent value="spam" className="mt-4">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Spam Folder</h2>
              <p className="text-sm text-muted-foreground">
                Review emails flagged as spam — move legit ones back to inbox
              </p>
            </div>
            {visibleSpam.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No spam emails to review.
              </div>
            ) : (
              <div className="divide-y">
                {visibleSpam.map((email) => (
                  <div key={email.id} className="flex items-start gap-4 px-6 py-4">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-semibold text-destructive">
                      {email.from[0].toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{email.from}</span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {email.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{email.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{email.preview}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() =>
                          setRemovedSpam((prev) => new Set([...prev, email.id]))
                        }
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Not Spam
                      </button>
                      <button
                        onClick={() =>
                          setRemovedSpam((prev) => new Set([...prev, email.id]))
                        }
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-destructive hover:text-destructive")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Draft Reply Sheet ── */}
      <Sheet open={!!draftEmail} onOpenChange={(open) => !open && closeDraft()}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b p-4 pr-12">
            <SheetTitle>Draft Reply</SheetTitle>
            <SheetDescription className="truncate">
              To: {draftEmail?.from} · Re: {draftEmail?.subject}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {/* AI notice */}
            <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              AI drafting will be available once the Claude API is connected. Type your reply manually below.
            </div>

            {/* Original email preview */}
            <div className="rounded-lg border bg-muted/20 px-4 py-3">
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Original message
              </p>
              <p className="text-xs text-muted-foreground line-clamp-3">{draftEmail?.preview}</p>
            </div>

            {/* Compose area */}
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Write your reply here..."
              rows={8}
              className="w-full flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <SheetFooter className="border-t p-4">
            <div className="flex w-full items-center gap-2">
              <button
                onClick={closeDraft}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Discard
              </button>
              <button
                disabled
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "ml-auto cursor-not-allowed opacity-60")}
                title="Connect Gmail to send emails"
              >
                Send
              </button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
