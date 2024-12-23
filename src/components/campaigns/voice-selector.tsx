"use client"

import { useEffect, useState } from "react"
import { Bot, Volume2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Voice {
  voice_id: string
  name: string
  preview_url: string
}

interface VoiceSelectorProps {
  onSelect: (voice: { id: string, name: string, previewUrl: string }) => void
}

export function VoiceSelector({ onSelect }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchVoices()
  }, [])

  async function fetchVoices() {
    try {
      const response = await fetch('/api/voices')
      const data = await response.json()
      setVoices(data.voices)
    } catch (error) {
      console.error('Error fetching voices:', error)
    } finally {
      setLoading(false)
    }
  }

  function playPreview(url: string, voiceId: string) {
    if (audio) {
      audio.pause()
    }
    const newAudio = new Audio(url)
    setAudio(newAudio)
    setPlaying(voiceId)
    
    newAudio.play()
    newAudio.onended = () => {
      setPlaying(null)
    }
  }

  return (
    <div className="space-y-4">
      <Select 
        onValueChange={(value) => {
          const voice = voices.find(v => v.voice_id === value)
          if (voice) {
            onSelect({
              id: voice.voice_id,
              name: voice.name,
              previewUrl: voice.preview_url
            })
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una voz" />
        </SelectTrigger>
        <SelectContent>
          {voices.map((voice) => (
            <SelectItem key={voice.voice_id} value={voice.voice_id}>
              <Card className="flex items-center justify-between p-2 w-full">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span>{voice.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    playPreview(voice.preview_url, voice.voice_id)
                  }}
                >
                  <Volume2 className={playing === voice.voice_id ? "text-primary animate-pulse" : ""} />
                </Button>
              </Card>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}