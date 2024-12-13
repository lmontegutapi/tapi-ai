// jobs/campaign-automation.ts
import { Job, EventTrigger } from "@trigger.dev/sdk";
import { prisma } from "@/lib/db";
import { initiateCall } from "@/actions/calls";

// Job para verificar y ejecutar llamadas automáticas
export const automatedCalls = new Job({
  id: "automated-calls",
  name: "Automated Campaign Calls",
  version: "1.0.0",
  trigger: new EventTrigger({
    schedule: "0 * * * *" // Correr cada hora
  }),
  run: async (payload, io) => {
    // Obtener todas las campañas activas con automatización
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "ACTIVE",
        automation: {
          isActive: true
        }
      },
      include: {
        automation: true,
        contacts: {
          include: {
            receivables: true
          }
        }
      }
    });

    for (const campaign of campaigns) {
      const { automation, contacts } = campaign;
      const triggers = automation?.triggers as Array<{
        days: number;
        type: string;
      }>;

      for (const contact of contacts) {
        for (const receivable of contact.receivables) {
          const dueDate = new Date(receivable.dueDate);
          const now = new Date();
          
          // Verificar cada trigger configurado
          for (const trigger of triggers) {
            const triggerDate = new Date(dueDate);
            triggerDate.setDate(triggerDate.getDate() + trigger.days);

            // Si es el momento de llamar
            if (isTimeToCall(triggerDate, now, campaign)) {
              await io.runTask("make-call", async () => {
                await initiateCall(receivable.id, {
                  campaignId: campaign.id,
                  triggerType: trigger.type
                });
              });

              // Esperar un tiempo entre llamadas
              await io.wait("delay-between-calls", 30);
            }
          }
        }
      }
    }
  }
});

function isTimeToCall(triggerDate: Date, now: Date, campaign: any): boolean {
  // Verificar si estamos en el horario de llamadas
  const currentHour = now.getHours();
  const [startHour] = campaign.startTime.split(":").map(Number);
  const [endHour] = campaign.endTime.split(":").map(Number);

  // Comparar fechas ignorando la hora
  const isSameDay = triggerDate.toDateString() === now.toDateString();
  
  // Verificar horario de trabajo
  const isWorkingHours = currentHour >= startHour && currentHour < endHour;

  return isSameDay && isWorkingHours;
}