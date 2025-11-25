'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Ban } from 'lucide-react';
import type { PC } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface UpdateModalProps {
  pc: PC;
  packageId: number;
  onClose: () => void;
  onUpdateComplete: (pcId: string, status: PC['status'], taskId?: number | null) => void;
}


export function UpdateModal({ pc, packageId, onClose, onUpdateComplete }: UpdateModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskId, setTaskId] = useState<number | null>(pc.currentTaskId);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const runUpdate = async () => {
      setIsUpdating(true);
      
      const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pcId: pc.id, packageId }),
      });
      
      const data = await response.json();

      if (!response.ok) {
          toast({
              title: `Error al iniciar la tarea en ${pc.name}`,
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
      
      toast({
        title: `¡Tarea Iniciada!`,
        description: `Se ha enviado la orden de ejecución para ${pc.name}.`,
      });
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


  return (
    <Dialog open={true} onOpenChange={isUpdating || isCancelling ? undefined : onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Procesando tarea para {pc.name}</DialogTitle>
          <DialogDescription>
            La orden ha sido enviada. El agente en la PC cliente se encargará del proceso.
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
