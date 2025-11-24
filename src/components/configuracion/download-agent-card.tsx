'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, HardDriveDownload, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function DownloadAgentCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [pcId, setPcId] = useState('');
  const [pcName, setPcName] = useState('');
  const [alias, setAlias] = useState('');
  const [location, setLocation] = useState('');


  const handleDownload = async () => {
    if (!pcId || !pcName) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor, ingrese al menos el ID y el Nombre de la PC.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        pcId,
        pcName,
        alias,
        location
      });
      const response = await fetch(`/api/download-agent?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al generar el paquete del agente.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `softland-agent-${pcName}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Descarga Iniciada',
        description: `Paquete de agente para ${pcName} generado.`,
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
            Descargar Agente
        </CardTitle>
        <CardDescription>
          Genere y descargue el paquete de instalación del agente para una nueva PC cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="pcId">ID de la PC (Único y requerido)</Label>
            <Input 
                id="pcId"
                placeholder="ej: pc-5"
                value={pcId}
                onChange={(e) => setPcId(e.target.value)}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pcName">Nombre de la PC (Requerido)</Label>
            <Input 
                id="pcName"
                placeholder="ej: CAJA-03"
                value={pcName}
                onChange={(e) => setPcName(e.target.value)}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="alias">Alias / Propietario (Opcional)</Label>
            <Input 
                id="alias"
                placeholder="ej: Juan Pérez"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="location">Ubicación (Opcional)</Label>
            <Input 
                id="location"
                placeholder="ej: Tienda Principal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleDownload} disabled={isLoading || !pcId || !pcName}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Descargar Paquete (.zip)
        </Button>
      </CardFooter>
    </Card>
  );
}
