import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI API key not configured (OPENAI_API_KEY)" },
        { status: 503 }
      );
    }

    // ✅ Validación estilo Laikad: token por header (desde localStorage)
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // (Opcional pero recomendado) acá podrías validar el token contra tu backend real
    // o decodificar JWT si es JWT. Por ahora solo verificamos que exista.

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    const systemContent = `
Sos el asistente interno de Laikad, una plataforma de performance marketing afiliado.
Respondé en español, claro, práctico y orientado a operaciones.
No inventes datos. Si falta info, preguntá lo mínimo.
`.trim();

    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemContent },
      ...messages
        .filter((m: { role?: string; content?: string }) => m.content)
        .map((m: { role?: string; content?: string }) => ({
          role: (m.role === "assistant" || m.role === "user" ? m.role : "user") as "system" | "user" | "assistant",
          content: String(m.content),
        })),
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
    });

    const text = response.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI error:", error);
    return NextResponse.json(
      { error: "AI failed", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
