import { assertGmailEnv, getGmailClient, toInboxEmail } from "@/lib/gmail";

export async function GET() {
  try {
    assertGmailEnv();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }

  try {
    const gmail = getGmailClient();

    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      q: "in:inbox -category:promotions -category:social -category:updates -category:forums newer_than:7d",
      labelIds: ["INBOX"],
    });

    const messageIds = list.data.messages ?? [];

    if (messageIds.length === 0) {
      return Response.json([]);
    }

    const messages = await Promise.all(
      messageIds.map((m) =>
        gmail.users.messages.get({
          userId: "me",
          id: m.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date", "Message-ID"],
        })
      )
    );

    const emails = messages.map((r) => toInboxEmail(r.data));
    return Response.json(emails);
  } catch (e) {
    console.error("[/api/email/inbox]", e);
    return Response.json(
      { error: "Failed to fetch inbox." },
      { status: 502 }
    );
  }
}
