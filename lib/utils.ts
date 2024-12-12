import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX").format(date)
}

export const generateReceivablesTemplate = () => {
  const headers = [
    'identifier',
    'name',
    'phone',
    'email',
    'amount',
    'dueDate',
    'notes'
  ]

  const sampleData = [
    {
      identifier: 'DEBT-001',
      name: 'Juan Pérez',
      phone: '1123456789',
      email: 'juan@ejemplo.com',
      amount: '1000.00',
      dueDate: '2024-12-31',
      notes: 'Factura #A-001'
    },
    {
      identifier: 'DEBT-002',
      name: 'María García',
      phone: '1187654321',
      email: 'maria@ejemplo.com',
      amount: '2500.50',
      dueDate: '2024-12-31',
      notes: 'Factura #A-002'
    }
  ]

  const csv = [
    headers.join(','),
    ...sampleData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
  ].join('\n')

  return csv
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalizar caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Evitar guiones múltiples
}