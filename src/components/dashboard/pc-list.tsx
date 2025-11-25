'use client';

import { useState } from 'react';
import type { PC, Package } from '@/lib/types';
import { ServerCrash, FileUp } from 'lucide-react';
import { PcCard } from '@/components/dashboard/pc-card';
import { UpdateModal } from '@/components/dashboard/update-modal';
import { EditPcModal } from '@/components/dashboard/edit-pc-modal';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { BulkImportModal } from './bulk-import-modal';

interface PcListProps {
  initialPcs: PC[];
  packages: Package[];
}

export function PcList({ initialPcs, packages }: PcListProps) {
  const router = useRouter();
  const [pcs, setPcs] = useState<PC[]>(initialPcs);
  const [taskData, setTaskData] = useState<{pc: PC, packageId: number} | null>(null);
  const [selectedPcForEdit, setSelectedPcForEdit] = useState<PC | null>(null);
  const [pcToDelete, setPcToDelete] = useState<PC | null>(null);
  const [isImporting, setIsImporting] = useState(false);


  const handleUpdate = (pc: PC, packageId: number) => {
    setTaskData({ pc, packageId });
  };

  const handleCloseUpdateModal = () => {
    setTaskData(null);
    router.refresh();
  };

  const handleUpdateComplete = (pcId: string, status: PC['status'], taskId?: number | null) => {
    setPcs(currentPcs => currentPcs.map(p => p.id === pcId ? { ...p, status, lastUpdate: new Date().toISOString(), currentTaskId: taskId || p.currentTaskId } : p));
    if (status !== 'En progreso') {
      setTaskData(null);
    }
  };

  const handleEditComplete = (updatedPc: PC) => {
    setPcs(currentPcs => currentPcs.map(p => p.id === updatedPc.id ? updatedPc : p));
    setSelectedPcForEdit(null);
  };

  const confirmDelete = (pc: PC) => {
    setPcToDelete(pc);
  };

  const handleDeletePc = async () => {
    if (!pcToDelete) return;
    try {
      const response = await fetch(`/api/pcs/${pcToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo eliminar la PC.');
      }
      setPcs(currentPcs => currentPcs.filter(p => p.id !== pcToDelete.id));
      toast({
        title: "PC Eliminada",
        description: `La PC ${pcToDelete.name} ha sido eliminada del sistema.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setPcToDelete(null);
    }
  };

  const handleTogglePcStatus = (pc: PC) => {
    const newStatus = pc.status === 'Deshabilitado' ? 'Pendiente' : 'Deshabilitado';
    setPcs(currentPcs => currentPcs.map(p => p.id === pc.id ? { ...p, status: newStatus } : p));
    toast({
      title: `PC ${newStatus === 'Deshabilitado' ? 'Deshabilitada' : 'Habilitada'}`,
      description: `La PC ${pc.name} ha sido ${newStatus === 'Deshabilitado' ? 'deshabilitada' : 'habilitada'}.`,
    });
  };

  const handleImportSuccess = () => {
    setIsImporting(false);
    router.refresh();
  }

  if (pcs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
        <ServerCrash className="w-16 h-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No se encontraron PCs</h2>
        <p className="mt-2 text-muted-foreground">Aún no se ha registrado ninguna PC. Instale el agente o importe un archivo CSV.</p>
         <Button className="mt-4" onClick={() => setIsImporting(true)}>
          <FileUp className="mr-2 h-4 w-4" />
          Importar desde CSV
        </Button>
         {isImporting && <BulkImportModal onClose={() => setIsImporting(false)} onImportSuccess={handleImportSuccess} />}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsImporting(true)}>
          <FileUp className="mr-2 h-4 w-4" />
          Importar desde CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pcs.map((pc) => (
          <PcCard
            key={pc.id}
            pc={pc}
            packages={packages}
            onUpdateClick={(packageId) => handleUpdate(pc, packageId)}
            onEditClick={() => setSelectedPcForEdit(pc)}
            onDeleteClick={() => confirmDelete(pc)}
            onToggleStatus={() => handleTogglePcStatus(pc)}
          />
        ))}
      </div>
      {taskData && <UpdateModal pc={taskData.pc} packageId={taskData.packageId} onClose={handleCloseUpdateModal} onUpdateComplete={handleUpdateComplete} />}
      {selectedPcForEdit && <EditPcModal pc={selectedPcForEdit} onClose={() => setSelectedPcForEdit(null)} onSave={handleEditComplete} />}
      {isImporting && <BulkImportModal onClose={() => setIsImporting(false)} onImportSuccess={handleImportSuccess} />}
      <AlertDialog open={pcToDelete !== null} onOpenChange={() => setPcToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que deseas eliminar esta PC?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la PC <span className="font-bold">{pcToDelete?.name}</span> y todo su historial de actualizaciones del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePc} className={buttonVariants({ variant: "destructive" })}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
