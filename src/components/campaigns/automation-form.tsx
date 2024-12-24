"use client"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function CampaignAutomationForm() {
  const [triggers, setTriggers] = useState([
    { days: -2, type: "BEFORE_DUE" },
    { days: 0, type: "ON_DUE" },
    { days: 2, type: "AFTER_DUE" }
  ]);

  return (
    <Card className="border-0 p-0 shadow-none">
      <CardHeader>
        <CardTitle>Automatización de llamadas</CardTitle>
        <CardDescription>
          Configura cuándo se realizarán las llamadas automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="automation" />
            <label htmlFor="automation">Activar llamadas automáticas</label>
          </div>

          <div className="space-y-2">
            {triggers.map((trigger, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={Math.abs(trigger.days)}
                  onChange={(e) => {
                    const newTriggers = [...triggers];
                    newTriggers[index].days = 
                      trigger.type === "BEFORE_DUE" 
                        ? -Number(e.target.value)
                        : Number(e.target.value);
                    setTriggers(newTriggers);
                  }}
                  className="w-20"
                />
                <span>días</span>
                <Badge>
                  {trigger.type === "BEFORE_DUE" 
                    ? "antes"
                    : trigger.type === "AFTER_DUE"
                    ? "después"
                    : "el día"}
                </Badge>
                <span>del vencimiento</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}