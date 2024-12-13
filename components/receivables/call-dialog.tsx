// components/receivables/call-dialog.tsx
"use client";

import { useState } from "react";
import { Phone, Loader2, XCircle } from "lucide-react";
import { ReceivableWithContact } from "@/types/receivables";
import * as Ably from "ably";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { initiateCall } from "@/actions/calls";

interface CallDialogProps {
  receivable: ReceivableWithContact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallDialog({
  receivable,
  open,
  onOpenChange,
}: CallDialogProps) {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "failed"
  >("idle");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);

  const handleCall = async () => {
    try {
      setStatus("connecting");

      const result = await initiateCall(receivable.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Conectar con Ably para monitorear la llamada
      const ably = new Ably.Realtime({
        key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
      });
      const channel = ably.channels.get(result.data?.channelId);

      setStatus("connected");

      // Escuchar eventos de la llamada
      channel.subscribe("transcript", (message) => {
        setTranscript((prev) => [...prev, message.data.text]);
      });

      channel.subscribe("end", () => {
        setStatus("idle");
        ably.close();
        toast({
          title: "Llamada finalizada",
          description: "La llamada ha terminado correctamente",
        });
        setTimeout(() => onOpenChange(false), 2000);
      });

      // Actualizar duración
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      channel.subscribe("error", () => {
        clearInterval(interval);
        setStatus("failed");
        ably.close();
        toast({
          variant: "destructive",
          title: "Error",
          description: "Ocurrió un error durante la llamada",
        });
      });
    } catch (error) {
      setStatus("failed");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar la llamada",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Llamada a {receivable.contact.name}</DialogTitle>
          <DialogDescription>
            {status === "idle" && "Iniciar llamada con el agente AI"}
            {status === "connecting" && "Conectando llamada..."}
            {status === "connected" && "Llamada en curso"}
            {status === "failed" && "Error en la llamada"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info del contacto */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Teléfono</span>
                <span>{receivable.contact.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monto</span>
                <span>{formatCurrency(Number(receivable.amount))}</span>
              </div>
              {status === "connected" && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Duración
                  </span>
                  <span>{formatTime(duration)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estado de la llamada */}
          {status !== "idle" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    status === "connected"
                      ? "default"
                      : status === "connecting"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {status === "connected"
                    ? "En llamada"
                    : status === "connecting"
                      ? "Conectando"
                      : "Error"}
                </Badge>
                {status === "connected" && (
                  <span className="text-sm text-muted-foreground animate-pulse">
                    ● Grabando
                  </span>
                )}
              </div>

              {status === "connecting" && (
                <Progress value={45} className="animate-pulse" />
              )}
            </div>
          )}

          {/* Transcripción en vivo */}
          {transcript.length > 0 && (
            <div className="h-[200px] overflow-y-auto border rounded-md p-4 space-y-2">
              {transcript.map((text, i) => (
                <p key={i} className="text-sm">
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {status === "idle" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCall}>
                <Phone className="mr-2 h-4 w-4" />
                Iniciar llamada
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              onClick={() => onOpenChange(false)}
              className="w-full"
              disabled={status === "connecting"}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Terminar llamada
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
