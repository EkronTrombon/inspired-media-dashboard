import Anthropic from "@anthropic-ai/sdk";

interface DraftBody {
  from: string;
  subject: string;
  preview: string;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 503 }
    );
  }

  let payload: DraftBody;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { from, subject, preview } = payload;
  if (!from || !subject) {
    return Response.json(
      { error: "Missing required fields: from, subject." },
      { status: 400 }
    );
  }

  try {
    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are helping Alyssa, a content creator, draft a professional email reply.

Original email:
From: ${from}
Subject: ${subject}
Preview: ${preview || "(no preview)"}

Write a concise, warm, and professional reply. Keep it to 2–4 sentences. Return only the body text — no subject line, no greeting like "Hi [Name]," just the reply content itself.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return Response.json({ draft: text });
  } catch (e) {
    console.error("[/api/email/draft]", e);
    return Response.json(
      { error: "Failed to generate draft." },
      { status: 502 }
    );
  }
}
