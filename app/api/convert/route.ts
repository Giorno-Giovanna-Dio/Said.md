import { convertVideo, toErrorPayload } from "@/lib/transcript";
import { parseYouTubeVideoId } from "@/lib/youtube-url";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_URL", message: "Please provide a valid YouTube URL." },
      { status: 400, headers: corsHeaders },
    );
  }

  const url =
    typeof body === "object" && body && "url" in body
      ? String((body as { url?: unknown }).url ?? "")
      : "";
  const videoId = parseYouTubeVideoId(url);

  if (!videoId) {
    return NextResponse.json(
      {
        error: "INVALID_URL",
        message: "That doesn’t look like a YouTube URL. Paste a watch, Shorts, or youtu.be link.",
      },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const result = await convertVideo(videoId);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    const payload = toErrorPayload(error);
    return NextResponse.json(payload.body, {
      status: payload.status,
      headers: corsHeaders,
    });
  }
}
