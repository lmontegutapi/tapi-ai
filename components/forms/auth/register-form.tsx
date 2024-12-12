"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterFormValues } from "./schema";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createOrganization, getOrganization } from "@/actions/organization";
import { generateSlug } from "@/lib/utils";

enum OrganizationRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member"
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organizationName: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    const { email, password, name, organizationName } = data;

    const result = await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onRequest: () => {
          setError("");
          // Aquí podrías mostrar un loading state
        },
        onSuccess: async (ctx) => {
          const organizationName =
            data.organizationName || `${data.name}'s Organization`;
          const baseSlug = generateSlug(organizationName);
          console.log("baseSlug", baseSlug)
          // Verificar si el slug ya existe y agregar sufijo si es necesario
          let slug = baseSlug;
          //TODO: Agregar validacion de slug para que no se repita
          /* const isOrganizationExists = await getOrganization(slug);

            while (!isOrganizationExists) {
            slug = `${baseSlug}-${counter}`;
            counter++;
            isOrganizationExists = await getOrganization(slug);
          } */

          /* if(isOrganizationExists) {
            setError("El nombre de la empresa ya existe. Por favor, elige otro nombre.");
            return;
          } */

          const organization = await createOrganization({
            name: organizationName,
            slug,
            userId: ctx.data.id,
            role: OrganizationRole.OWNER,
            metadata: {
              createdAt: new Date(),
              isDefault: !data.organizationName, // Marcar si es la org por defecto
            },
          });

          console.log("organization111", organization)

          if (!organization.success) {
            setError(organization.error || "Error al crear la organización");
            return;
          }

          console.log("organization222", organization)

          router.push("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          toast({
            title: "Error",
            description: ctx.error.message,
            variant: "destructive",
          });
        },
      }
    );

    console.log("result", result)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="juan@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>Mínimo 8 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la empresa (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Mi Empresa S.A." {...field} />
              </FormControl>
              <FormDescription>
                Puedes configurar tu empresa más tarde
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>

      <Separator className="my-4" />

      <div className="flex justify-center items-center gap-2">
        <p className="text-sm text-muted-foreground">¿Ya tienes una cuenta?</p>
        <Link href="/login"> Iniciar sesión </Link>
      </div>
    </Form>
  );
}
