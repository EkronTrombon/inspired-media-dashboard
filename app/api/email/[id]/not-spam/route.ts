import { assertGmailEnv, getGmailClient } from "@/lib/gmail";
import type { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/email/[id]/not-spam">
) {
  try {
    assertGmailEnv();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }

  const { id } = await ctx.params;

  try {
    const gmail = getGmailClient();
    await gmail.users.messages.modify({
      userId: "me",
      id,
      requestBody: {
        removeLabelIds: ["SPAM"],
        addLabelIds: ["INBOX"],
      },
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[/api/email/[id]/not-spam]", e);
    return Response.json(
      { error: "Failed to move email out of spam." },
      { status: 502 }
    );
  }
}
