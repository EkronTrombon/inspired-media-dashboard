import { assertGmailEnv, buildReplyMime, encodeMime, getGmailClient } from "@/lib/gmail";

interface SendBody {
  to: string;
  subject: string;
  inReplyTo: string;
  threadId: string;
  body: string;
}

export async function POST(request: Request) {
  try {
    assertGmailEnv();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }

  let payload: SendBody;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { to, subject, inReplyTo, threadId, body } = payload;
  if (!to || !subject || !body) {
    return Response.json(
      { error: "Missing required fields: to, subject, body." },
      { status: 400 }
    );
  }

  try {
    const gmail = getGmailClient();

    // Get the authenticated user's email address for the From header
    const profile = await gmail.users.getProfile({ userId: "me" });
    const from = profile.data.emailAddress ?? "me";

    const raw = buildReplyMime({ from, to, subject, inReplyTo, body });

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeMime(raw),
        threadId: threadId || undefined,
      },
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error("[/api/email/send]", e);
    return Response.json({ error: "Failed to send email." }, { status: 502 });
  }
}
