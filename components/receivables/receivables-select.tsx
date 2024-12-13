// components/receivables/receivables-select.tsx
"use client"

import { useEffect, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReceivableWithContact } from "@/types/receivables"

interface ReceivablesSelectProps {
  receivables: ReceivableWithContact[]
  onSelect: (ids: string[]) => void
  selectedIds: string[]
}

export function ReceivablesSelect({
  receivables,
  onSelect,
  selectedIds
}: ReceivablesSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredReceivables = receivables.filter(
    r => r.status === "OPEN" || r.status === "OVERDUE"
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedIds.length > 0 ? (
            <Badge>{selectedIds.length} deudas seleccionadas</Badge>
          ) : (
            "Seleccionar deudas"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar deudas..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No se encontraron deudas</CommandEmpty>
          <CommandGroup>
            {filteredReceivables.map((receivable) => (
              <CommandItem
                key={receivable.id}
                onSelect={() => {
                  const isSelected = selectedIds.includes(receivable.id)
                  onSelect(
                    isSelected
                      ? selectedIds.filter(id => id !== receivable.id)
                      : [...selectedIds, receivable.id]
                  )
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedIds.includes(receivable.id) 
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{receivable.contact.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${receivable.amount.toString()} - Vence: {new Date(receivable.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}