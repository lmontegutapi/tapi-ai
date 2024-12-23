"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoicePreviewButtonProps {
  voiceId: string;
}

export function VoicePreviewButton({ voiceId }: VoicePreviewButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  async function handlePreview() {
    try {
      if (isPlaying) {
        audio?.pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      const response = await fetch(`/api/voice/preview?voiceId=${voiceId}`);
      
      if (!response.ok) throw new Error("Error al obtener preview");
      
      const audioData = await response.text();
      const audioElement = new Audio(audioData);
      
      audioElement.onended = () => {
        setIsPlaying(false);
        setAudio(null);
      };

      setAudio(audioElement);
      audioElement.play();
      setIsPlaying(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reproducir la voz",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePreview}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Square className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      <span className="ml-2">{isPlaying ? "Detener" : "Escuchar"}</span>
    </Button>
  );
} 