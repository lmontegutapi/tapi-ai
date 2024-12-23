"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
/* import { createOrganization, getOrganization } from "@/actions/organization"; */
import { generateSlug } from "@/lib/utils";
import { UserRole } from "@/lib/constants/roles";
import { updateUser } from "@/actions/user";
import { authClient } from "@/lib/auth-client";

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
          /* const organizationName =
            data.organizationName || `${data.name}'s Organization`;
          const baseSlug = generateSlug(organizationName); */
          
          // Verificar si el slug ya existe y agregar sufijo si es necesario
          /* const slug = baseSlug;

          console.log("@ctx", ctx);

          const user = await authClient.updateUser(ctx.data.id, {
            ...ctx.data,
            role: "OWNER",
          });

          console.log("@user updated", user);

          const organization = authClient.organization.create({
            name: organizationName,
            slug,
            userId: ctx.data.id,
            metadata: {
              createdAt: new Date(),
              isDefault: !data.organizationName, // Marcar si es la org por defecto
            },
          });

          console.log("@organization", organization); */

 /*          const user = updateUser(ctx.data.id, {
            ...ctx.data,
            role: UserRole.OWNER,
          }); */

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

          /* const organization = await createOrganization({
            name: organizationName,
            slug,
            userId: ctx.data.id,
            role: UserRole.OWNER,
            metadata: {
              createdAt: new Date(),
              isDefault: !data.organizationName, // Marcar si es la org por defecto
            },
          });

          const user = await updateUser(ctx.data.id, {
            role: UserRole.OWNER,
          });
 */
          /* if (!organization) {
            setError("Error al crear la organización");
            return;
          } */

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
        <Link href="/sign-in"> Iniciar sesión </Link>
      </div>
    </Form>
  );
}
