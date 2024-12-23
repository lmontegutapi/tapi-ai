"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createReceivables } from "@/actions/receivables";
import { useReceivablesStore } from "@/stores/receivables.store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

const receivableSchema = z.object({
  amountCents: z.coerce.number().positive("El monto debe ser positivo"),
  dueDate: z.string().transform((str) => new Date(str)),
  status: z.enum(["OPEN", "CLOSED", "OVERDUE", "PENDING_DUE"]),
  notes: z.string().optional(),
  contact: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
  }),
});

export function NewReceivableDrawer() {
  const { openNewReceivableDrawer, setOpenNewReceivableDrawer } =
    useReceivablesStore((state) => state);
  const router = useRouter();

  const form = useForm<z.infer<typeof receivableSchema>>({
    resolver: zodResolver(receivableSchema),
    defaultValues: {
      amountCents: 0,
      status: "OPEN",
      dueDate: new Date(),
      notes: "",
      contact: {
        name: "",
        phone: "",
        email: "",
      },
    },
  });

  async function onSubmit(data: z.infer<typeof receivableSchema>) {
    try {
      const receivableData = {
        amountCents: data.amountCents,
        dueDate: data.dueDate,
        status: data.status,
        contactName: data.contact.name,
        contactPhone: data.contact.phone,
        contactEmail: data.contact.email || null,
      };

      const result = await createReceivables([receivableData]);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Deuda creada",
        description: "La deuda se ha registrado correctamente",
      });

      setOpenNewReceivableDrawer(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudo crear la deuda",
      });
    }
  }

  const clearErrorsWhenOpen = () => {
    form.clearErrors();
    form.reset();
  };

  useEffect(() => {
    clearErrorsWhenOpen();
  }, [openNewReceivableDrawer]);

  return (
    <Sheet
      open={openNewReceivableDrawer}
      onOpenChange={setOpenNewReceivableDrawer}
    >
      <SheetTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Deuda
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Registrar Nueva Deuda</SheetTitle>
          <SheetDescription>
            Ingresa los datos de la deuda manualmente
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
                      <FormLabel>Nombre completo</FormLabel>
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} type="number" step="0.01" />
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
                        <Input
                          {...field}
                          type="date"
                          value={field.value.toString()}
                        />
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
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OPEN">Abierta</SelectItem>
                          <SelectItem value="PENDING_DUE">
                            Por vencer
                          </SelectItem>
                          <SelectItem value="OVERDUE">Vencida</SelectItem>
                          <SelectItem value="CLOSED">Cerrada</SelectItem>
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

            <div className="flex justify-end gap-3 pt-4 flex-col">
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setOpenNewReceivableDrawer(!openNewReceivableDrawer)
                }
                disabled={form.formState.isSubmitting}
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
                    Creando...
                  </>
                ) : (
                  "Crear deuda"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
