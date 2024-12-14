import { NextRequest, NextResponse } from "next/server";
import { previewVoice } from "@/lib/services/elevenlabs";

export async function GET(req: NextRequest) {
  try {
    const voiceId = req.nextUrl.searchParams.get("voiceId");
    
    if (!voiceId) {
      return NextResponse.json(
        { error: "Voice ID is required" },
        { status: 400 }
      );
    }

    const audioData = await previewVoice(voiceId);
    return new NextResponse(audioData);
  } catch (error) {
    console.error("Error in voice preview:", error);
    return NextResponse.json(
      { error: "Failed to preview voice" },
      { status: 500 }
    );
  }
} 