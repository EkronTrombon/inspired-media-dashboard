import { assertGmailEnv, getGmailClient, toPromotionalEmail } from "@/lib/gmail";

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
      q: "(category:promotions OR category:updates OR category:social OR category:forums) newer_than:7d",
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
          metadataHeaders: ["From", "Subject", "Date"],
        })
      )
    );

    const emails = messages.map((r) => toPromotionalEmail(r.data));
    return Response.json(emails);
  } catch (e) {
    console.error("[/api/email/promotions]", e);
    return Response.json(
      { error: "Failed to fetch promotions." },
      { status: 502 }
    );
  }
}
