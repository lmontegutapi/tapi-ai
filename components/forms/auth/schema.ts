import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Ingresa un email válido.",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
  organizationName: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email({
    message: "Ingresa un email válido.",
  }),
  password: z.string().min(1, {
    message: "Ingresa tu contraseña.",
  }),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
