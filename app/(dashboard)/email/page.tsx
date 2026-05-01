"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Inbox, BellOff, ShieldAlert, RefreshCw, Sparkles, Loader2 } from "lucide-react";
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
import type { InboxEmail, PromotionalEmail, SpamEmail } from "@/lib/email-types";

// ─── Types ────────────────────────────────────────────────────────────────────

type LoadState<T> = { status: "idle" } | { status: "loading" } | { status: "ok"; data: T } | { status: "error"; message: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const typeColors: Record<PromotionalEmail["type"], string> = {
  Newsletter: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  Promotional: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 px-6 py-4 animate-pulse">
      <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
      <div className="h-8 w-20 shrink-0 rounded bg-muted" />
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorRow({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <button
        onClick={onRetry}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailPage() {
  // ── Fetch state ──
  const [inbox, setInbox] = useState<LoadState<InboxEmail[]>>({ status: "idle" });
  const [promos, setPromos] = useState<LoadState<PromotionalEmail[]>>({ status: "idle" });
  const [spam, setSpam] = useState<LoadState<SpamEmail[]>>({ status: "idle" });

  // ── Draft reply sheet ──
  const [draftEmail, setDraftEmail] = useState<InboxEmail | null>(null);
  const [draftText, setDraftText] = useState("");
  const [draftGenerating, setDraftGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // ── Optimistic action sets ──
  const [unsubscribed, setUnsubscribed] = useState<Set<string>>(new Set());
  const [unsubscribing, setUnsubscribing] = useState<Set<string>>(new Set());
  const [removedSpam, setRemovedSpam] = useState<Set<string>>(new Set());

  // ── Data fetchers ──

  const fetchInbox = useCallback(async () => {
    setInbox({ status: "loading" });
    try {
      const res = await fetch("/api/email/inbox");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setInbox({ status: "ok", data: await res.json() });
    } catch (e) {
      setInbox({ status: "error", message: (e as Error).message });
    }
  }, []);

  const fetchPromos = useCallback(async () => {
    setPromos({ status: "loading" });
    try {
      const res = await fetch("/api/email/promotions");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setPromos({ status: "ok", data: await res.json() });
    } catch (e) {
      setPromos({ status: "error", message: (e as Error).message });
    }
  }, []);

  const fetchSpam = useCallback(async () => {
    setSpam({ status: "loading" });
    try {
      const res = await fetch("/api/email/spam");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setSpam({ status: "ok", data: await res.json() });
    } catch (e) {
      setSpam({ status: "error", message: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    fetchInbox();
    fetchPromos();
    fetchSpam();
  }, [fetchInbox, fetchPromos, fetchSpam]);

  // ── Derived counts ──

  const inboxEmails = inbox.status === "ok" ? inbox.data : [];
  const promoEmails = promos.status === "ok" ? promos.data : [];
  const spamEmails = spam.status === "ok" ? spam.data : [];

  const unreadCount = inboxEmails.filter((e) => e.unread).length;
  const visibleSpam = spamEmails.filter((e) => !removedSpam.has(e.id));
  const visiblePromos = promoEmails.filter((e) => !unsubscribed.has(e.id));

  // ── Draft reply ──

  function openDraft(email: InboxEmail) {
    setDraftText("");
    setSendError(null);
    setDraftEmail(email);
  }

  function closeDraft() {
    setDraftEmail(null);
    setDraftText("");
    setSendError(null);
  }

  async function generateDraft() {
    if (!draftEmail) return;
    setDraftGenerating(true);
    try {
      const res = await fetch("/api/email/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${draftEmail.from} <${draftEmail.email}>`,
          subject: draftEmail.subject,
          preview: draftEmail.preview,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to generate draft");
      setDraftText(body.draft);
    } catch (e) {
      setDraftText("");
      setSendError((e as Error).message);
    } finally {
      setDraftGenerating(false);
    }
  }

  async function sendReply() {
    if (!draftEmail || !draftText.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: draftEmail.email,
          subject: draftEmail.subject,
          inReplyTo: draftEmail.messageId,
          threadId: draftEmail.threadId,
          body: draftText,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to send");
      closeDraft();
    } catch (e) {
      setSendError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  // ── Unsubscribe ──

  async function handleUnsubscribe(email: PromotionalEmail) {
    setUnsubscribing((prev) => new Set([...prev, email.id]));
    try {
      const res = await fetch(`/api/email/${email.id}/unsubscribe`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.warn("Unsubscribe failed:", body.error);
      }
      // Optimistically remove regardless — unsubscribe requests are best-effort
      setUnsubscribed((prev) => new Set([...prev, email.id]));
    } finally {
      setUnsubscribing((prev) => {
        const next = new Set(prev);
        next.delete(email.id);
        return next;
      });
    }
  }

  // ── Spam actions ──

  async function handleNotSpam(id: string) {
    setRemovedSpam((prev) => new Set([...prev, id])); // optimistic
    try {
      await fetch(`/api/email/${id}/not-spam`, { method: "POST" });
    } catch {
      // silent — optimistic update already applied
    }
  }

  async function handleTrash(id: string) {
    setRemovedSpam((prev) => new Set([...prev, id])); // optimistic
    try {
      await fetch(`/api/email/${id}/trash`, { method: "POST" });
    } catch {
      // silent — optimistic update already applied
    }
  }

  // ── Render ──

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
          <p className="mt-1 text-3xl font-bold">
            {inbox.status === "loading" ? "—" : unreadCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {inbox.status === "ok" ? `of ${inboxEmails.length} inbox emails` : "last 7 days"}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Unsubscribe Suggestions</p>
          <p className="mt-1 text-3xl font-bold">
            {promos.status === "loading" ? "—" : visiblePromos.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">from the last 7 days</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Spam to Review</p>
          <p className="mt-1 text-3xl font-bold">
            {spam.status === "loading" ? "—" : visibleSpam.length}
          </p>
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
              {inbox.status === "loading" && (
                <>{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</>
              )}
              {inbox.status === "error" && (
                <ErrorRow message={inbox.message} onRetry={fetchInbox} />
              )}
              {inbox.status === "ok" && inboxEmails.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No emails in the last 7 days.
                </div>
              )}
              {inbox.status === "ok" && inboxEmails.map((email) => (
                <div
                  key={email.id}
                  className={cn(
                    "flex items-start gap-4 px-6 py-4",
                    email.unread && "bg-muted/20"
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(email.from)}
                  </div>
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
                  <button
                    onClick={() => openDraft(email)}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
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
              {promos.status === "loading" && (
                <>{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</>
              )}
              {promos.status === "error" && (
                <ErrorRow message={promos.message} onRetry={fetchPromos} />
              )}
              {promos.status === "ok" && visiblePromos.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No promotional emails to review.
                </div>
              )}
              {promos.status === "ok" && visiblePromos.map((email) => {
                const isBusy = unsubscribing.has(email.id);
                return (
                  <div key={email.id} className="flex items-start gap-4 px-6 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {initials(email.from)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{email.from}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", typeColors[email.type])}>
                          {email.type}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {email.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{email.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{email.preview}</p>
                    </div>
                    <button
                      onClick={() => handleUnsubscribe(email)}
                      disabled={isBusy}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "shrink-0 gap-1.5",
                        isBusy && "cursor-default opacity-60"
                      )}
                    >
                      {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {isBusy ? "Unsubscribing…" : "Unsubscribe"}
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
            {spam.status === "loading" && (
              <div className="divide-y">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            )}
            {spam.status === "error" && (
              <ErrorRow message={spam.message} onRetry={fetchSpam} />
            )}
            {spam.status === "ok" && visibleSpam.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No spam emails to review.
              </div>
            )}
            {spam.status === "ok" && visibleSpam.length > 0 && (
              <div className="divide-y">
                {visibleSpam.map((email) => (
                  <div key={email.id} className="flex items-start gap-4 px-6 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-semibold text-destructive">
                      {email.from[0].toUpperCase()}
                    </div>
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
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleNotSpam(email.id)}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Not Spam
                      </button>
                      <button
                        onClick={() => handleTrash(email.id)}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "text-destructive hover:text-destructive"
                        )}
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
            {/* AI generate button */}
            <button
              onClick={generateDraft}
              disabled={draftGenerating}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full gap-2",
                draftGenerating && "cursor-default opacity-60"
              )}
            >
              {draftGenerating
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</>
                : <><Sparkles className="h-3.5 w-3.5" />Generate AI Draft</>
              }
            </button>

            {/* Original email preview */}
            <div className="rounded-lg border bg-muted/20 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Original message
              </p>
              <p className="line-clamp-3 text-xs text-muted-foreground">{draftEmail?.preview}</p>
            </div>

            {/* Compose area */}
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Write your reply here, or click Generate AI Draft above…"
              rows={8}
              className="w-full flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {sendError && (
              <p className="text-xs text-destructive">{sendError}</p>
            )}
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
                onClick={sendReply}
                disabled={sending || !draftText.trim()}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "ml-auto gap-2",
                  (sending || !draftText.trim()) && "cursor-not-allowed opacity-60"
                )}
              >
                {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
