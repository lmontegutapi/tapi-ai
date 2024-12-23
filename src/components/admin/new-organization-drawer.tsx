"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { Building, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { createOrganizationWithOwner } from "@/actions/organization"
import { UserRole } from "@prisma/client"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres"),
  ownerEmail: z.string().email("Email inválido"),
  ownerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  ownerPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export function NewOrganizationDrawer() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      ownerEmail: "",
      ownerName: "",
      ownerPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      const owner = await authClient.admin.createUser({
        name: values.ownerName,
        email: values.ownerEmail,
        password: values.ownerPassword,
        role: UserRole.OWNER,
      })

      const org = await authClient.organization.create({
        name: values.name,
        slug: values.slug,
        userId: owner.data?.user.id,
      })
      
      /* const result = await createOrganizationWithOwner({
        name: values.name,
        slug: values.slug,
        ownerName: values.ownerName,
        ownerEmail: values.ownerEmail,
        ownerPassword: values.ownerPassword,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al crear la organización')
      } */

      if(org && owner) {
        toast({
          title: "Organización creada exitosamente",
          description: `La organización ha sido creada exitosamente. Se ha enviado un email de invitación a ${values.ownerEmail}`,
        })
      }
      
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear la organización",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Building className="mr-2 h-4 w-4" />
          Crear primera organización
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="mx-auto w-full max-w-lg">
          <SheetHeader>
            <SheetTitle>Nueva Organización</SheetTitle>
            <SheetDescription>
              Crea una nueva organización y su usuario administrador
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Organización</FormLabel>
                      <FormControl>
                        <Input placeholder="Mi Empresa S.A." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="mi-empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Datos del Administrador</h4>
                  
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="juan@empresa.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input placeholder="******" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex !flex-col gap-2 !items-start pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Organización
                </Button>
                <SheetClose asChild className="w-full !mr-0">
                  <Button variant="outline" className="w-full !mr-0">Cancelar</Button>
                </SheetClose>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
} 