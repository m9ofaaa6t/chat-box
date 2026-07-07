import { NextRequest, NextResponse } from "next/server";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/types";

// Route ini berjalan di server (Next.js backend), sehingga API key
// OpenRouter TIDAK pernah terkirim ke browser/frontend.
export const runtime = "nodejs";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY belum diatur di server (.env.local)" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as ChatRequestBody;

    if (!body?.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Body request tidak valid: 'messages' wajib berupa array" },
        { status: 400 }
      );
    }

    const model = body.model || DEFAULT_MODEL;

    const upstreamRes = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // Header opsional yang direkomendasikan OpenRouter untuk analytics/rate-limit
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "OpenRouter Custom Chatbox",
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
      }),
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      return NextResponse.json(
        { error: `OpenRouter error (${upstreamRes.status}): ${errText}` },
        { status: upstreamRes.status }
      );
    }

    const data = await upstreamRes.json();
    const reply: string =
      data?.choices?.[0]?.message?.content ?? "(tidak ada respons)";

    const result: ChatResponseBody = { reply, model };
    return NextResponse.json(result);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
