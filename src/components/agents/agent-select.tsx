"use client"

import { Agent } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bot } from "lucide-react"

interface AgentSelectProps {
  agents: Agent[]
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function AgentSelect({ 
  agents, 
  value, 
  onValueChange,
  disabled 
}: AgentSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar agente" />
      </SelectTrigger>
      <SelectContent>
        {agents.map((agent) => (
          <SelectItem
            key={agent.id}
            value={agent.id}
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            <div className="flex flex-col">
              <span>{agent.name}</span>
              <span className="text-xs text-muted-foreground">
                Voz: {agent.voiceType}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}