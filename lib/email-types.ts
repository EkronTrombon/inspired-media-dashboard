// Shared types used by both API routes and the email page component.

export interface InboxEmail {
  id: string;
  threadId: string;
  messageId: string; // RFC 2822 Message-ID header, used for In-Reply-To when replying
  from: string;
  email: string;
  subject: string;
  preview: string;
  time: string;
  date: string;
  unread: boolean;
}

export interface PromotionalEmail {
  id: string;
  threadId: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  date: string;
  type: "Newsletter" | "Promotional";
}

export interface SpamEmail {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
}
