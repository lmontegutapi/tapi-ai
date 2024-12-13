"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { createReceivables } from "@/actions/receivables";
import { Contact } from "@prisma/client";

const receivableSchema = z.object({
  contactId: z.string().min(1, "Debes seleccionar un contacto"),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  dueDate: z.string().transform((str) => new Date(str)),
  status: z.enum(["OPEN", "CLOSED", "OVERDUE", "PENDING_DUE"]),
  // Campos opcionales para crear un nuevo contacto si no existe
  newContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email("Email inválido").optional(),
    })
    .optional(),
});

interface NewReceivableDrawerProps {
  contacts: Contact[];
}

export function NewReceivableDrawer({ contacts }: NewReceivableDrawerProps) {
  const [open, setOpen] = useState(false);
  const [isNewContact, setIsNewContact] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof receivableSchema>>({
    resolver: zodResolver(receivableSchema),
    defaultValues: {
      amount: 0,
      status: "OPEN",
      dueDate: new Date(),
      newContact: {
        name: "",
        phone: "",
        email: "",
      },
    },
  });

  async function onSubmit(data: z.infer<typeof receivableSchema>) {
    try {
      const receivableData = {
        ...data,
        contactName: data.newContact?.name || contacts.find(c => c.id === data.contactId)?.name || ''
      };
      
      const result = await createReceivables([receivableData]);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Deuda creada",
        description: "La deuda se ha registrado correctamente",
      });

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la deuda",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
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
            <div className="flex items-center justify-between">
              <div className="text-sm">Contacto existente</div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsNewContact(!isNewContact)}
              >
                {isNewContact ? "Seleccionar existente" : "Crear nuevo"}
              </Button>
            </div>

            {isNewContact ? (
              // Formulario para nuevo contacto
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="newContact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del contacto</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newContact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+54 11 1234-5678"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newContact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="email@ejemplo.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              // Selector de contacto existente
              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar contacto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            <div className="flex flex-col">
                              <span>{contact.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {contact.phone || contact.email}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
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
                    <Input {...field} type="date" value={field.value.toISOString().split('T')[0]} />
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
                      <SelectItem value="PENDING_DUE">Por vencer</SelectItem>
                      <SelectItem value="OVERDUE">Vencida</SelectItem>
                      <SelectItem value="CLOSED">Cerrada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
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
