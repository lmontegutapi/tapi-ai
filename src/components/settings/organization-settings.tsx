"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  updateOrganizationSettings,
  getOrganizationSettings,
} from "@/actions/settings";
import { useState } from "react";
import { prisma } from "@/lib/db";
import { Organization } from "@prisma/client";

const organizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  logo: z.string().optional(),
  slug: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export function OrganizationSettings({
  organization,
}: {
  organization: Organization;
}) {
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
      logo: organization.logo || undefined,
      slug: organization.slug || undefined,
    },
  });

  async function onSubmit(data: OrganizationFormValues) {
    try {
      const response = await updateOrganizationSettings(data);
      if (response.success) {
        toast({
          title: "Configuración actualizada",
          description: "Los cambios se guardaron correctamente",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios",
      });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>
            Actualiza la información de tu organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={organization.logo || "/placeholder.jpg"}
                alt="Logo"
              />
              <AvatarFallback>{organization.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {/*           <Button variant="outline"
              onClick={() => {
                // Implementar lógica para cambiar el logo
              }}
            >
              Cambiar logo
            </Button> */}
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la organización</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">Guardar cambios</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
