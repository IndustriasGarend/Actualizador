'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function BulkAddCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setCsvFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!csvFile) {
      toast({
        title: 'Archivo no seleccionado',
        description: 'Por favor, seleccione un archivo CSV para importar.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch('/api/pcs/bulk', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al importar las PCs.');
      }
      
      toast({
        title: 'Importación Exitosa',
        description: `${result.added} PCs añadidas, ${result.skipped} omitidas (ya existían).`,
      });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error en la importación',
        description: (error as Error).message || 'No se pudo procesar el archivo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setCsvFile(null);
      // Reset file input
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if(fileInput) fileInput.value = '';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileUp className="w-6 h-6" />
            Adición Masiva de PCs
        </CardTitle>
        <CardDescription>
          Añada múltiples PCs al sistema subiendo un archivo CSV. El archivo debe tener hasta 4 columnas: 
          ID (obligatorio), Nombre (obligatorio), Alias (opcional), Ubicación (opcional). No incluya una fila de encabezado.
          <br />
          Ejemplo de formato: `pc-01,CAJA-01,Juan Pérez,Tienda Principal`
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            <Label htmlFor="csvFile">Archivo CSV</Label>
            <Input 
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleImport} disabled={isLoading || !csvFile}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Importar PCs
        </Button>
      </CardFooter>
    </Card>
  );
}
