"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Audience {
  id: string
  name: string
  delinquencyBucket: string
  contactPreference: string
}

interface AudienceSelectProps {
  audiences: Audience[]
  selectedIds?: string[]
  onSelect: (value: string[]) => void
}

export function AudienceSelect({ audiences, selectedIds = [], onSelect }: AudienceSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedIds.length === 0 && "Seleccionar audiencias..."}
          {selectedIds.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {selectedIds.map((id) => {
                const audience = audiences.find((a) => a.id === id)
                return (
                  <Badge variant="secondary" key={id}>
                    {audience?.name}
                  </Badge>
                )
              })}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Buscar audiencia..." />
          <CommandEmpty>No se encontraron audiencias.</CommandEmpty>
          <ScrollArea className="h-[300px]">
            <CommandGroup>
              {audiences?.map((audience) => (
                <CommandItem
                  key={audience.id}
                  onSelect={() => {
                    const newSelection = selectedIds.includes(audience.id)
                      ? selectedIds.filter((id) => id !== audience.id)
                      : [...selectedIds, audience.id]
                    onSelect(newSelection)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedIds.includes(audience.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{audience.name}</span>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {audience.delinquencyBucket}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {audience.contactPreference}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}