'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileSpreadsheet, Check, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GoogleSheetIcon from '@/app/google-sheet-icon.png'
import { read, utils } from 'xlsx'
import { toast } from '../hooks/use-toast'
import { parse } from 'date-fns'
import { cn } from '../lib/utils'

interface FileUpload {
  file: File
  name: string
  size: number
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

interface DebtUploadCsv {
  name: string
  amount: string
  dueDate: string
  phone: string
}

const UploadModal = ({ borderCard = false }: { borderCard?: boolean }) => {
  const [files, setFiles] = useState<FileUpload[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function StringToDate(date: string) {
    return parse(date, 'dd/MM/yyyy', new Date())
  }

  const processFile = async (fileUpload: FileUpload) => {
    try {
      const data = await fileUpload.file.arrayBuffer()
      const workbook = read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = utils.sheet_to_json<DebtUploadCsv>(sheet, { raw: false })
      
      // Validar y transformar datos
      const debts = rows.map(row => ({
        name: row.name?.trim(),
        amountInCents: Math.round(parseFloat(row.amount) * 100),
        dueDate: StringToDate(row.dueDate),
        phone: row.phone?.replace(/\D/g, '') // Eliminar no-dígitos
      }))

      if (debts.length === 0) {
        throw new Error('No se encontraron registros válidos en el archivo')
      }

      // Enviar al servidor
      const response = await fetch('/api/upload-debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debts)
      })

      if (!response.ok) {
        throw new Error('Error al cargar los datos')
      }

      // Actualizar estado del archivo
      setFiles(prev => prev.map(f => 
        f.name === fileUpload.name 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ))

      toast({
        title: 'Archivo procesado correctamente',
        description: `Se importaron ${debts.length} registros de deuda`
      })

    } catch (error) {
      console.error(error)
      setFiles(prev => prev.map(f => 
        f.name === fileUpload.name 
          ? { ...f, status: 'error', progress: 100 }
          : f
      ))

      toast({
        variant: 'destructive',
        title: 'Error al procesar el archivo',
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return

    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const
    }))

    setFiles(prev => [...prev, ...newFiles])
    newFiles.forEach(processFile)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const borderClass = borderCard ? '' : 'border-none'

  return (
    <Card className={cn('w-[480px]', borderClass)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Upload size={20} />
          <h2 className="text-lg font-semibold">Importar deudas</h2>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">
          Sube un archivo CSV para importar datos de deudas a tu sistema.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8
            flex flex-col items-center justify-center gap-4
            transition-colors duration-200 mb-6
            ${isDragging ? 'border-primary bg-accent' : 'border-border'}
          `}
        >
          <div className="flex -space-x-2">
            <img src={GoogleSheetIcon.src} className="rounded-full w-8 h-8 border-2 border-background" />
            <img src={GoogleSheetIcon.src} className="rounded-full w-8 h-8 border-2 border-background" />
            <img src={GoogleSheetIcon.src} className="rounded-full w-8 h-8 border-2 border-background" />
          </div>
          
          <p className="text-sm text-center">
            <span className="text-primary font-medium">
              Arrastra el CSV aquí para importar deudas
            </span>
            <br />
            <span className="text-muted-foreground">
              o haz clic para buscar (máximo 4 MB)
            </span>
          </p>
          
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Seleccionar archivos
          </Button>
        </div>

        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 py-2"
            >
              <FileSpreadsheet size={20} className="text-primary" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-muted-foreground">{Math.round(file.size / 1024)}KB</span>
                </div>
                <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${file.status === 'error' ? 'bg-destructive' : 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${file.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              {file.status === 'completed' && (
                <Check size={16} className="text-green-500" />
              )}
              {file.status === 'error' && (
                <AlertCircle size={16} className="text-destructive" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            O importa desde Google Sheets
          </p>
          <Input
            type="text"
            placeholder="https://docs.google.com/spreadsheets/..."
            className="mt-2"
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button variant="ghost">
          Cancelar
        </Button>
        <Button onClick={() => fileInputRef.current?.click()}>
          Importar deudas
        </Button>
      </CardFooter>
    </Card>
  )
}

export default UploadModal