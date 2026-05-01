import { assertGmailEnv, buildReplyMime, encodeMime, getGmailClient, getHeader } from "@/lib/gmail";
import type { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/email/[id]/unsubscribe">
) {
  try {
    assertGmailEnv();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }

  const { id } = await ctx.params;

  try {
    const gmail = getGmailClient();

    // Fetch full message to read the List-Unsubscribe header
    const msg = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["List-Unsubscribe", "List-Unsubscribe-Post", "From", "Subject"],
    });

    const headers = msg.data.payload?.headers ?? [];
    const listUnsub = getHeader(headers, "List-Unsubscribe");

    if (!listUnsub) {
      return Response.json(
        { error: "This email has no unsubscribe header." },
        { status: 422 }
      );
    }

    // Parse List-Unsubscribe: may contain <mailto:...> and/or <https://...>
    const httpsMatch = listUnsub.match(/<(https?:\/\/[^>]+)>/i);
    const mailtoMatch = listUnsub.match(/<mailto:([^>]+)>/i);

    if (httpsMatch) {
      // Prefer HTTP unsubscribe (RFC 8058 — should be a POST)
      const unsubUrl = httpsMatch[1];
      const listUnsubPost = getHeader(headers, "List-Unsubscribe-Post");
      const method = listUnsubPost ? "POST" : "GET";
      const body = listUnsubPost ? listUnsubPost : undefined;

      await fetch(unsubUrl, {
        method,
        headers: body
          ? { "Content-Type": "application/x-www-form-urlencoded" }
          : {},
        body,
      });
    } else if (mailtoMatch) {
      // Fall back to sending an unsubscribe email
      const mailtoValue = mailtoMatch[1]; // e.g. "unsub@list.com?subject=unsubscribe"
      const [address, queryString] = mailtoValue.split("?");
      const params = new URLSearchParams(queryString ?? "");
      const subject = params.get("subject") ?? "unsubscribe";

      const profile = await gmail.users.getProfile({ userId: "me" });
      const from = profile.data.emailAddress ?? "me";

      const raw = buildReplyMime({
        from,
        to: address,
        subject,
        inReplyTo: "",
        body: "Unsubscribe",
      });

      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodeMime(raw) },
      });
    } else {
      return Response.json(
        { error: "Could not parse unsubscribe link." },
        { status: 422 }
      );
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("[/api/email/[id]/unsubscribe]", e);
    return Response.json(
      { error: "Failed to unsubscribe." },
      { status: 502 }
    );
  }
}
