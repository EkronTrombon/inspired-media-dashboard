import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";
import type { InboxEmail, PromotionalEmail, SpamEmail } from "./email-types";

// ─── Client ──────────────────────────────────────────────────────────────────

export function getGmailClient(): gmail_v1.Gmail {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth });
}

export function assertGmailEnv() {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GMAIL_REFRESH_TOKEN
  ) {
    throw new Error(
      "Gmail credentials not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in .env.local."
    );
  }
}

// ─── Parsing helpers ─────────────────────────────────────────────────────────

/** Parse "Name <email>" or bare "email" into { name, email }. */
export function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
  if (match) {
    return { name: match[1].trim() || match[2].trim(), email: match[2].trim() };
  }
  return { name: from.trim(), email: from.trim() };
}

/** Format a Gmail internalDate (ms since epoch) into { date, time } strings. */
export function formatMessageDate(internalDate: string): {
  date: string;
  time: string;
} {
  const ts = parseInt(internalDate, 10);
  const msgDate = new Date(ts);
  const now = new Date();

  const isToday =
    msgDate.getFullYear() === now.getFullYear() &&
    msgDate.getMonth() === now.getMonth() &&
    msgDate.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    msgDate.getFullYear() === yesterday.getFullYear() &&
    msgDate.getMonth() === yesterday.getMonth() &&
    msgDate.getDate() === yesterday.getDate();

  const time = msgDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  let date: string;
  if (isToday) {
    date = "Today";
  } else if (isYesterday) {
    date = "Yesterday";
  } else {
    date = msgDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return { date, time };
}

/** Extract a header value from a Gmail message part headers array. */
export function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string {
  return (
    headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

// ─── Message transformers ─────────────────────────────────────────────────────

export function toInboxEmail(msg: gmail_v1.Schema$Message): InboxEmail {
  const headers = msg.payload?.headers ?? [];
  const fromRaw = getHeader(headers, "From");
  const { name, email } = parseFrom(fromRaw);
  const { date, time } = formatMessageDate(msg.internalDate ?? "0");

  return {
    id: msg.id ?? "",
    threadId: msg.threadId ?? "",
    messageId: getHeader(headers, "Message-ID"),
    from: name,
    email,
    subject: getHeader(headers, "Subject") || "(no subject)",
    preview: msg.snippet ?? "",
    date,
    time,
    unread: msg.labelIds?.includes("UNREAD") ?? false,
  };
}

export function toPromotionalEmail(
  msg: gmail_v1.Schema$Message
): PromotionalEmail {
  const headers = msg.payload?.headers ?? [];
  const fromRaw = getHeader(headers, "From");
  const { name, email } = parseFrom(fromRaw);
  const { date } = formatMessageDate(msg.internalDate ?? "0");

  const labels = msg.labelIds ?? [];
  const type: PromotionalEmail["type"] = labels.includes(
    "CATEGORY_PROMOTIONS"
  )
    ? "Promotional"
    : "Newsletter";

  return {
    id: msg.id ?? "",
    threadId: msg.threadId ?? "",
    from: name,
    email,
    subject: getHeader(headers, "Subject") || "(no subject)",
    preview: msg.snippet ?? "",
    date,
    type,
  };
}

export function toSpamEmail(msg: gmail_v1.Schema$Message): SpamEmail {
  const headers = msg.payload?.headers ?? [];
  const fromRaw = getHeader(headers, "From");
  const { email } = parseFrom(fromRaw);
  const { date } = formatMessageDate(msg.internalDate ?? "0");

  return {
    id: msg.id ?? "",
    from: email,
    subject: getHeader(headers, "Subject") || "(no subject)",
    preview: msg.snippet ?? "",
    date,
  };
}

// ─── MIME helpers ────────────────────────────────────────────────────────────

/** Base64url encode a raw MIME message string. */
export function encodeMime(raw: string): string {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/** Build a raw RFC 2822 reply message. */
export function buildReplyMime(opts: {
  from: string;
  to: string;
  subject: string;
  inReplyTo: string;
  body: string;
}): string {
  const subject = opts.subject.startsWith("Re:")
    ? opts.subject
    : `Re: ${opts.subject}`;

  const headers = [
    `MIME-Version: 1.0`,
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${opts.inReplyTo}`,
    `References: ${opts.inReplyTo}`,
    `Content-Type: text/plain; charset=UTF-8`,
  ].join("\r\n");

  return `${headers}\r\n\r\n${opts.body}`;
}
