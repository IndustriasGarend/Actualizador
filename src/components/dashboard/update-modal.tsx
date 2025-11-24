'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Circle } from 'lucide-react';
import type { PC, UpdateStep, UpdateStatus } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UpdateModalProps {
  pc: PC;
  onClose: () => void;
  onUpdateComplete: (pcId: string, status: PC['status']) => void;
}

const initialSteps: UpdateStep[] = [
  { name: "Deteniendo servicio 'Softland POS Sincronización'", status: 'pending' },
  { name: "Cerrando procesos 'Softland'", status: 'pending' },
  { name: 'Copiando archivos de actualización', status: 'pending' },
  { name: 'Extrayendo archivos', status: 'pending' },
  { name: 'Desbloqueando archivos', status: 'pending' },
  { name: 'Registrando módulos', status: 'pending' },
];

const StatusIcon = ({ status }: { status: UpdateStatus }) => {
  switch (status) {
    case 'running':
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-accent" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-destructive" />;
    case 'pending':
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
};

export function UpdateModal({ pc, onClose, onUpdateComplete }: UpdateModalProps) {
  const [steps, setSteps] = useState<UpdateStep[]>(initialSteps);
  const [isUpdating, setIsUpdating] = useState(false);
  const [overallStatus, setOverallStatus] = useState<PC['status']>('En progreso');

  useEffect(() => {
    const runUpdate = async () => {
      setIsUpdating(true);
      onUpdateComplete(pc.id, 'En progreso');
      
      const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pcId: pc.id }),
      });

      if (!response.ok) {
          toast({
              title: `Error al iniciar la actualización de ${pc.name}`,
              description: 'No se pudo crear la tarea en el servidor.',
              variant: 'destructive',
          });
          setIsUpdating(false);
          onUpdateComplete(pc.id, 'Error');
          return;
      }
      
      // La simulación de los pasos se mantiene para la UI, pero ya no controla el estado.
      // El estado real vendrá del agente a través de la base de datos en una implementación completa.
      // Aquí, simulamos el éxito para cerrar el modal.
      
      for (let i = 0; i < steps.length; i++) {
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'success' } : s));
      }
      
      setOverallStatus('Actualizado');
      onUpdateComplete(pc.id, 'Actualizado');
      toast({
        title: `¡Tarea Iniciada!`,
        description: `Se ha enviado la orden de actualización para ${pc.name}.`,
      });

      setIsUpdating(false);
      // Cerramos el modal automáticamente al "finalizar"
      setTimeout(onClose, 1000);
    };

    runUpdate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedSteps = steps.filter(s => s.status === 'success').length;
  const progressValue = (completedSteps / steps.length) * 100;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizando {pc.name}</DialogTitle>
          <DialogDescription>
            El proceso de actualización está en curso. Por favor no cierre esta ventana.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Progress value={progressValue} className="w-full" />
          <ul className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex items-center gap-3">
                <StatusIcon status={step.status} />
                <span className={cn(step.status === 'error' ? 'text-destructive' : 'text-foreground/80')}>{step.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={isUpdating}>
            {isUpdating ? 'En Progreso...' : 'Cerrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
