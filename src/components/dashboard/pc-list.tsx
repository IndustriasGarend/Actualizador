'use client';

import { useState, useEffect } from 'react';
import { Computer, ServerCrash, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PC } from '@/lib/types';
import { UpdateModal } from './update-modal';
import { cn } from '@/lib/utils';

function ClientFormattedDate({ dateString }: { dateString: string | null }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (dateString) {
      setFormattedDate(new Date(dateString).toLocaleString('es-ES'));
    } else {
      setFormattedDate('Nunca');
    }
  }, [dateString]);

  return <>{formattedDate || <span className="opacity-50">Cargando...</span>}</>;
}

interface PcListProps {
  initialPcs: PC[];
}

export function PcList({ initialPcs }: PcListProps) {
  const [pcs, setPcs] = useState<PC[]>(initialPcs);
  const [selectedPc, setSelectedPc] = useState<PC | null>(null);

  const handleUpdate = (pc: PC) => {
    setSelectedPc(pc);
  };
  
  const handleCloseModal = () => {
    setSelectedPc(null);
  };

  const handleUpdateComplete = (pcId: string, status: PC['status']) => {
    setPcs(pcs.map(p => p.id === pcId ? {...p, status, lastUpdate: new Date().toISOString()} : p));
    setSelectedPc(null);
  };

  if (pcs.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
            <ServerCrash className="w-16 h-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No se encontraron PCs</h2>
            <p className="mt-2 text-muted-foreground">Agregue PCs en el panel de configuración para comenzar.</p>
        </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pcs.map((pc) => {
          return (
            <Card key={pc.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Computer className="w-8 h-8 text-muted-foreground" />
                  <Badge variant={
                      pc.status === 'Error' ? 'destructive' : 
                      pc.status === 'Pendiente' ? 'secondary' :
                      'default'
                    } className={cn(
                      pc.status === 'Actualizado' && 'bg-accent text-accent-foreground hover:bg-accent/80',
                      pc.status === 'En progreso' && 'bg-primary/80 animate-pulse',
                    )}>
                      {pc.status}
                  </Badge>
                </div>
                <CardTitle className="pt-4">{pc.name}</CardTitle>
                <CardDescription>IP: {pc.ip}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Última actualización:</p>
                  <p className="font-medium text-foreground/80">
                    <ClientFormattedDate dateString={pc.lastUpdate} />
                  </p>
                </div>
                {pc.versionId && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        <p>Versión: <span className="font-medium text-foreground/80">{pc.versionId}</span></p>
                    </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleUpdate(pc)} 
                  disabled={pc.status === 'En progreso'}
                  className="w-full"
                >
                  Actualizar Ahora
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {selectedPc && <UpdateModal pc={selectedPc} onClose={handleCloseModal} onUpdateComplete={handleUpdateComplete} />}
    </>
  );
}
