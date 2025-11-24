'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Circle, Ban } from 'lucide-react';
import type { PC, UpdateStep, UpdateStatus } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UpdateModalProps {
  pc: PC;
  onClose: () => void;
  onUpdateComplete: (pcId: string, status: PC['status'], taskId?: number | null) => void;
}

const initialSteps: UpdateStep[] = [
  { name: "Verificando versión actual", status: 'pending' },
  { name: "Deteniendo servicios necesarios", status: 'pending' },
  { name: 'Copiando archivos de actualización', status: 'pending' },
  { name: 'Extrayendo archivos', status: 'pending' },
  { name: 'Desbloqueando archivos', status: 'pending' },
  { name: 'Configurando nuevos componentes', status: 'pending' },
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
  const [taskId, setTaskId] = useState<number | null>(pc.currentTaskId);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const runUpdate = async () => {
      setIsUpdating(true);
      
      const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pcId: pc.id }),
      });
      
      const data = await response.json();

      if (!response.ok) {
          toast({
              title: `Error al iniciar la actualización de ${pc.name}`,
              description: data.message || 'No se pudo crear la tarea en el servidor.',
              variant: 'destructive',
          });
          setIsUpdating(false);
          onUpdateComplete(pc.id, 'Error');
          return;
      }
      
      const newTaskId = data.taskId;
      setTaskId(newTaskId);
      onUpdateComplete(pc.id, 'En progreso', newTaskId);
      
      // La simulación ya no es necesaria, la UI se actualizará por otros medios (websockets o polling en una versión más avanzada)
      // Por ahora, solo mostramos el mensaje de que la tarea fue enviada.
      
      toast({
        title: `¡Tarea Iniciada!`,
        description: `Se ha enviado la orden de actualización para ${pc.name}.`,
      });

      // Se mantiene el modal abierto pero ya no simula pasos.
      // El estado de la tarea real se verá reflejado en el Dashboard.
      // setIsUpdating(false); // Se mantiene true para que se muestre el botón Cancelar
    };

    runUpdate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async () => {
    if (!taskId) return;
    setIsCancelling(true);
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al cancelar la tarea.');
        }
        toast({
            title: 'Cancelación enviada',
            description: `Se envió la orden de cancelación para ${pc.name}.`,
            variant: 'default'
        });
        onUpdateComplete(pc.id, 'Cancelado', taskId);
        onClose();

    } catch (error) {
        toast({
            title: 'Error',
            description: (error as Error).message,
            variant: 'destructive',
        });
    } finally {
        setIsCancelling(false);
    }
  };


  const progressValue = 0; // Simulación eliminada

  return (
    <Dialog open={true} onOpenChange={isUpdating || isCancelling ? undefined : onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizando {pc.name}</DialogTitle>
          <DialogDescription>
            La orden de actualización ha sido enviada. El agente en la PC cliente se encargará del proceso.
            Puede cerrar esta ventana o cancelarla.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center text-primary p-4 bg-primary/10 rounded-md">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4 font-medium">Tarea en progreso...</p>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={isUpdating || isCancelling}>
            Cerrar
          </Button>
          <Button onClick={handleCancel} variant="destructive" disabled={isCancelling || !isUpdating}>
            {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
            Cancelar Tarea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
