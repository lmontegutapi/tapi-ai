"use client"

import {  useState } from "react"
import { Bot, Play } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { Voice } from "@/types/voices"

interface VoiceSelectorProps {
  onSelect: (voice: { id: string, name: string, previewUrl: string }) => void
  value: string
}

export function VoiceSelector({ onSelect, value }: VoiceSelectorProps) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const { data: voices, isLoading } = useQuery({
    queryKey: ["voices"],
    queryFn: async () => {
      const response = await fetch("/api/voices")
      const data = await response.json()
      return data.voices as Voice[]
    },
  })

  if (isLoading) return <div>Cargando...</div>

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
          const voice = voices?.find((v: Voice) => v.voice_id === value)
          if (voice) {
            onSelect({
              id: voice.voice_id,
              name: voice.name,
              previewUrl: voice.preview_url
            })
          }
        }}
        defaultValue={value}
      >
        <SelectTrigger className="h-[40px]">
          <SelectValue placeholder="Selecciona una voz" />
        </SelectTrigger>
        <SelectContent className="w-full">
          {voices?.map((voice) => (
            <SelectItem 
              key={voice.voice_id} 
              value={voice.voice_id}
              onMouseEnter={() => playPreview(voice.preview_url, voice.voice_id)}
              onMouseLeave={() => {
                if (audio) {
                  audio.pause()
                  setPlaying(null)
                }
              }}
              className="flex items-center justify-between p-2 relative group"
            >
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 text-foreground p-2 rounded-full 
                  ${playing === voice.voice_id ? "text-white bg-black" : "bg-gray-200"}`}
                >
                  {playing === voice.voice_id ? <Play className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className="flex items-center gap-2">
                  <span>{voice.name}</span>
                </div>
                <div className="flex items-center gap-2 ">
                  {Object.entries(voice.labels).map(([key, value]) => (
                    <div key={key} className="text-xs break-all bg-gray-200 text-foreground px-2 py-1 rounded-lg">
                      {value}
                    </div>
                  ))}
                </div>
              </div>
              {/* <Volume2 
                className={`
                  absolute right-2 
                  transition-opacity
                  ${playing === voice.voice_id ? "opacity-100 text-primary animate-pulse" : "opacity-0 group-hover:opacity-100"}
                `} 
              /> */}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

