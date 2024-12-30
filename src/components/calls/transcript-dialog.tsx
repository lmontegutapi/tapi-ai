import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TranscriptDialogProps {
  conversationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TranscriptDialog({ conversationId, open, onOpenChange }: TranscriptDialogProps) {
  const [transcript, setTranscript] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && conversationId) {
      fetchTranscript()
    }
  }, [open, conversationId])

  async function fetchTranscript() {
    try {
      setLoading(true)
      const response = await fetch(`/api/calls/${conversationId}/transcript`)
      const data = await response.json()
      setTranscript(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transcripción de llamada</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {transcript?.transcript.map((turn: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2 p-2 rounded",
                    turn.role === "agent" ? "bg-muted" : "bg-primary/10"
                  )}
                >
                  <span className="font-medium min-w-[60px]">
                    {turn.role === "agent" ? "Agente:" : "Cliente:"}
                  </span>
                  <p>{turn.message}</p>
                </div>
              ))}
            </div>
            {transcript?.analysis?.transcript_summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{transcript.analysis.transcript_summary}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}