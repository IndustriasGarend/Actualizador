"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, FileUp, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface BulkImportModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

export function BulkImportModal({ onClose, onImportSuccess }: BulkImportModalProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: 'Ningún archivo seleccionado',
        description: 'Por favor, seleccione un archivo CSV para importar.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/pcs/bulk', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Error al importar el archivo.');
      }
      
      toast({
        title: 'Importación Exitosa',
        description: `${result.added} PCs agregadas, ${result.skipped} omitidas (ya existían).`,
      });
      onImportSuccess();
    } catch (error) {
      toast({
        title: 'Error de Importación',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "ID_Unico,Hostname,Alias,Ubicacion\n" +
                       "PC001,DESKTOP-VENTAS01,Juan Perez,Tienda Principal\n" +
                       "PC002,LAPTOP-GERENCIA,Ana Gomez,Oficina Gerencia\n" +
                       "PC003,POS-BODEGA,Balanza,Bodega Central\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "plantilla_importacion_pcs.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  return (
    <Dialog open={true} onOpenChange={isImporting ? undefined : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importación Masiva de PCs</DialogTitle>
          <DialogDescription>
            Suba un archivo CSV para registrar múltiples PCs en el sistema de una sola vez.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Alert>
                <AlertTitle>Formato del Archivo CSV</AlertTitle>
                <AlertDescription>
                    <p>El archivo no debe tener encabezados y debe contener 4 columnas en este orden:</p>
                    <ul className="list-disc list-inside text-sm mt-2 text-muted-foreground">
                        <li>Columna 1: ID Único (ej. PC001, ACT-1020)</li>
                        <li>Columna 2: Hostname del equipo</li>
                        <li>Columna 3: Alias / Propietario (opcional)</li>
                        <li>Columna 4: Ubicación (opcional)</li>
                    </ul>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2" onClick={downloadTemplate}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar plantilla de ejemplo
                    </Button>
                </AlertDescription>
            </Alert>

            <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isImporting}
            />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isImporting}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !selectedFile}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
