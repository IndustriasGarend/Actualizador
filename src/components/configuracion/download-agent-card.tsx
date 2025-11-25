'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, HardDriveDownload, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export function DownloadAgentCard() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {    
    setIsLoading(true);
    try {
      const response = await fetch('/api/download-agent');

      if (!response.ok) {
        throw new Error('Error al generar el paquete del agente.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const disposition = response.headers.get('content-disposition');
      let filename = 'softland-agent-installer.zip';
      if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
      }

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Descarga Iniciada',
        description: 'Se esta descargando el paquete de instalacion generico del agente.',
      });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error en la descarga',
        description: (error as Error).message || 'No se pudo descargar el paquete del agente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <HardDriveDownload className="w-6 h-6" />
            Instalador del Agente
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-5 w-5 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">Descarga un paquete de instalacion (.zip) generico. Este mismo paquete se puede usar en todas las PCs que se quieran registrar en el sistema.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Descargue el paquete de instalacion del agente, que es el mismo para todas las PCs.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <p className="text-sm text-muted-foreground">
              El paquete `.zip` contiene los scripts necesarios para instalar el agente como un servicio de Windows. Durante la instalacion, el script le solicitara la URL de este servidor.
          </p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleDownload} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Descargar Instalador del Agente (.zip)
        </Button>
      </CardFooter>
    </Card>
  );
}
