import { NextResponse } from "next/server";
import Ably from "ably";
import { WebSocket } from "ws";

export const runtime = "nodejs";

const ably = new Ably.Realtime(process.env.ABLY_API_KEY!);
const elevenlabsWs = new WebSocket(
  `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${process.env.ELEVENLABS_AGENT_ID}`
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json({ error: "Missing channelId" }, { status: 400 });
  }

  const channel = ably.channels.get(channelId);

  // Manejar mensajes de ElevenLabs
  elevenlabsWs.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString());
      switch (message.type) {
        case "audio":
          if (message.audio_event?.audio_base64) {
            await channel.publish("audio", {
              payload: message.audio_event.audio_base64,
            });
          }
          break;
        case "interruption":
          await channel.publish("clear", {});
          break;
      }
    } catch (error) {
      console.error("Error procesando mensaje:", error);
    }
  });

  // Suscribirse a mensajes del cliente
  channel.subscribe("media", async (message) => {
    if (elevenlabsWs.readyState === WebSocket.OPEN) {
      const audioMessage = {
        user_audio_chunk: message.data.payload,
      };
      elevenlabsWs.send(JSON.stringify(audioMessage));
    }
  });

  channel.subscribe("stop", () => {
    elevenlabsWs.close();
    channel.detach();
  });

  return NextResponse.json({ success: true });
}
