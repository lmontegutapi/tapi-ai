import axios from "axios";

export const ElevenLabsClient = {
  async generateAudio({ text, voiceId }: { text: string, voiceId: string }) {
    const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      text,
    }, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}