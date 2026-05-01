import { assertGmailEnv, getGmailClient } from "@/lib/gmail";
import type { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/email/[id]/trash">
) {
  try {
    assertGmailEnv();
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }

  const { id } = await ctx.params;

  try {
    const gmail = getGmailClient();
    await gmail.users.messages.trash({ userId: "me", id });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[/api/email/[id]/trash]", e);
    return Response.json({ error: "Failed to trash email." }, { status: 502 });
  }
}
