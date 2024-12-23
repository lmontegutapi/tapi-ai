"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { cn, generateReceivablesTemplate } from "@/lib/utils";
import { Download } from "lucide-react";
import { uploadReceivables } from "@/actions/receivables";

const handleDownloadTemplate = () => {
  const csv = generateReceivablesTemplate();
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template-receivables.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default function UploadReceivablesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato no válido",
        description: "Por favor sube un archivo Excel o CSV",
      });
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "El archivo no debe superar los 5MB",
      });
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simular progreso
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      const response = await uploadReceivables(formData);

      clearInterval(interval);
      setProgress(100);

      if (!response.success) {
        throw new Error("Error al procesar el archivo");
      }

      toast({
        title: "Carga exitosa",
        description: `Se procesaron ${response?.data?.count} registros correctamente`,
      });

      // Redirigir al listado después de un momento
      setTimeout(() => {
        router.push("/dashboard/receivables");
        router.refresh();
      }, 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al procesar el archivo",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="container max-w-2xl py-6 m-auto min-h-[calc(100vh-200px)] flex flex-col items-center justify-center w-full">
      <header className="w-full flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Descargar template
        </Button>
      </header>
      <div className="w-full min-h-[60%]">
        <Card className="w-full min-h-[60%]">
          <CardHeader>
            <CardTitle>Cargar Deudas</CardTitle>
          <CardDescription>
            Carga un archivo Excel o CSV con el listado de deudas a procesar.
            Descarga el template para ver el formato esperado.
            Los campos requeridos son: nombre, monto y fecha de vencimiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center",
              isDragging
                ? "border-primary bg-accent"
                : "border-muted-foreground/25",
              file ? "bg-accent/50" : ""
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {!file ? (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">
                    Arrastra tu archivo aquí o{" "}
                    <label className="text-primary cursor-pointer hover:underline">
                      búscalo
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                        onChange={onFileSelect}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    XLSX, XLS o CSV (máx. 5MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <File className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <p className="text-lg font-medium break-all">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Procesando archivo...
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setFile(null)}
              disabled={!file || uploading}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Procesando..." : "Procesar archivo"}
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
