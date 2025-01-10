"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateReceivable } from "@/actions/receivables";
import { type ReceivableWithContact } from "@/types/receivables";
import { ScrollArea } from "@/components/ui/scroll-area";

const receivableSchema = z.object({
  amountCents: z.coerce.number().positive("El monto debe ser positivo"),
  dueDate: z.string(),
  status: z.enum(["OPEN", "CLOSED", "OVERDUE", "PENDING_DUE"]),
  notes: z.string().optional(),
  contact: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
  }),
});

type ReceivableFormValues = z.infer<typeof receivableSchema>;

interface EditReceivableDrawerProps {
  receivable: ReceivableWithContact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditReceivableDrawer({
  receivable,
  open,
  onOpenChange,
  onSuccess,
}: EditReceivableDrawerProps) {
  const form = useForm<ReceivableFormValues>({
    resolver: zodResolver(receivableSchema),
    defaultValues: {
      amountCents: Number(receivable.amountCents),
      dueDate: new Date(receivable.dueDate).toISOString().split("T")[0],
      status: receivable.status,
      notes: receivable.notes || "",
      contact: {
        name: receivable.contact.name,
        phone: receivable.contact.phone || "",
        email: receivable.contact.email || "",
      },
    },
  });

  async function onSubmit(data: ReceivableFormValues) {
    try {
      const result = await updateReceivable(receivable.id, {
        ...data,
        dueDate: new Date(data.dueDate),
        contact: {
          ...data.contact,
          email: data.contact.email || null,
          phone: data.contact.phone || null,
        },
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Deuda actualizada",
        description: "Los cambios se guardaron correctamente",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudieron guardar los cambios",
      });
    }
  }

  const clearErrorsWhenOpen = () => {
    form.clearErrors();
    form.reset();
  };

  useEffect(() => {
    clearErrorsWhenOpen();
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Deuda</SheetTitle>
          <SheetDescription>
            Actualiza la información de la deuda y el contacto
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <ScrollArea className="max-h-max">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Información de contacto</h4>

                <FormField
                  control={form.control}
                  name="contact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="amountCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de vencimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OPEN">Abierta</SelectItem>
                          <SelectItem value="CLOSED">Cerrada</SelectItem>
                          <SelectItem value="OVERDUE">Vencida</SelectItem>
                          <SelectItem value="PENDING_DUE">
                            Por vencer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concepto de pago</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: Deuda pago de colegio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-4 pt-4 flex-col">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
