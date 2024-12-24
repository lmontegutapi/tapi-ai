"use client"

import { useRef, useState } from "react"
import { Bot, Play } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"

interface Agent {
  agent_id: string
  name: string
  created_at_unix_secs: number
  access_level: string
}

interface AgentSelectorProps {
  value: string
  onSelect: (agent: { id: string }) => void
}

export function AgentSelector({ value, onSelect }: AgentSelectorProps) {
  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await fetch("/api/agents")
      const data = await response.json()

      console.log(data)
      return data.agents as Agent[]
    },
  })

  if (isLoading) return <div>Cargando...</div>

  if (!agents) return <div>No hay agentes</div>

  const agentOptions = agents.map((agent) => (
    <SelectItem key={agent.agent_id} value={agent.agent_id}>
      {agent.name}
    </SelectItem>
  ))

  return (
    <Select
      onValueChange={(value) => {
        const agent = agents.find((a) => a.agent_id === value)
        if (agent) {
          onSelect({ id: agent.agent_id })
        }
      }}
      defaultValue={value}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona un agente" />
      </SelectTrigger>
      <SelectContent>
        {agentOptions}
      </SelectContent>
    </Select>
  )
}