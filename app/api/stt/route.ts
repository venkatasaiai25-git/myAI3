import { NextResponse } from "next/server";

export const runtime = "nodejs"; // guarantees Whisper support

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No audio file received" },
        { status: 400 }
      );
    }

    const openaiData = new FormData();
    openaiData.append("file", file);
    openaiData.append("model", "whisper-1");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      body: openaiData,
    });

    const data = await res.json();
    return NextResponse.json({ text: data.text || "" });

  } catch (err) {
    console.error("STT API Error:", err);
    return NextResponse.json({ error: "Internal STT Error" }, { status: 500 });
  }
}
