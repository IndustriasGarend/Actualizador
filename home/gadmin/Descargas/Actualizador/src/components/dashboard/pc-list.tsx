'use client';
/**
 * @fileoverview
 * Este componente es el corazón del Dashboard.
 * Muestra una lista de tarjetas, cada una representando una PC monitoreada.
 * Permite iniciar actualizaciones, editar y eliminar PCs.
 */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Computer, ServerCrash, GitBranch, Ban, MoreVertical, Trash2, ToggleLeft, ToggleRight, MapPin, UserCircle, Edit, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import type { PC } from '@/lib/types';
import { UpdateModal } from './update-modal';
import { EditPcModal } from './edit-pc-modal';
import { ClientFormattedDate } from '@/components/shared/client-formatted-date';
import { cn } from '@/lib/utils';
import { LATEST_AGENT_VERSION } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
import { toast } from '@/hooks/use-toast';

interface PcListProps {
  initialPcs: PC[];
}

export function PcList({ initialPcs }: PcListProps) {
  const [pcs, setPcs] = useState<PC[]>(initialPcs);
  const [selectedPcForUpdate, setSelectedPcForUpdate] = useState<PC | null>(null);
  const [selectedPcForEdit, setSelectedPcForEdit] = useState<PC | null>(null);
  const [pcToDelete, setPcToDelete] = useState<PC | null>(null);
  const router = useRouter();

  const handleUpdate = (pc: PC) => {
    setSelectedPcForUpdate(pc);
  };
  
  const handleCloseUpdateModal = () => {
    setSelectedPcForUpdate(null);
    router.refresh();
  };
  
  const handleCloseEditModal = () => {
    setSelectedPcForEdit(null);
  };

  const handleUpdateComplete = (pcId: string, status: PC['status'], taskId?: number | null) => {
    setPcs(pcs.map(p => p.id === pcId ? {...p, status, lastUpdate: new Date().toISOString(), currentTaskId: taskId || p.currentTaskId} : p));
    if (status !== 'En progreso') {
        setSelectedPcForUpdate(null);
    }
  };

  const handleEditComplete = (updatedPc: PC) => {
    setPcs(pcs.map(p => p.id === updatedPc.id ? updatedPc : p));
    setSelectedPcForEdit(null);
  }

  const handleDeletePc = async () => {
    if (!pcToDelete) return;
    try {
      const response = await fetch(`/api/pcs/${pcToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo eliminar la PC.');
      }
      setPcs(pcs.filter(p => p.id !== pcToDelete.id));
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

  const handleTogglePcStatus = async (pc: PC) => {
    const newStatus = pc.status === 'Deshabilitado' ? 'Pendiente' : 'Deshabilitado';
    try {
      // Simulación en la UI
      setPcs(pcs.map(p => p.id === pc.id ? { ...p, status: newStatus } : p));
      toast({
        title: `PC ${newStatus === 'Deshabilitado' ? 'Deshabilitada' : 'Habilitada'}`,
        description: `La PC ${pc.name} ha sido ${newStatus === 'Deshabilitado' ? 'deshabilitada' : 'habilitada'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  if (pcs.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
            <ServerCrash className="w-16 h-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No se encontraron PCs</h2>
            <p className="mt-2 text-muted-foreground">Aún no se ha registrado ninguna PC. Instale el agente en un equipo cliente para que aparezca aquí automáticamente.</p>
        </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pcs.map((pc) => {
          const isEnabled = pc.status !== 'Deshabilitado';
          const isAgentOutdated = pc.agentVersion && pc.agentVersion !== LATEST_AGENT_VERSION;
          return (
            <Card key={pc.id} className={cn("flex flex-col hover:shadow-lg transition-shadow duration-300", !isEnabled && "bg-muted/50")}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Computer className={cn("w-8 h-8 text-muted-foreground", !isEnabled && "text-muted-foreground/50")} />
                  <div className="flex items-center gap-1">
                    <Badge variant={
                        pc.status === 'Error' ? 'destructive' : 
                        pc.status === 'Cancelado' ? 'secondary' :
                        pc.status === 'Pendiente' ? 'secondary' :
                        pc.status === 'Deshabilitado' ? 'secondary' :
                        'default'
                      } className={cn(
                        'text-xs',
                        pc.status === 'Actualizado' && 'bg-accent text-accent-foreground hover:bg-accent/80',
                        pc.status === 'En progreso' && 'bg-primary/80 animate-pulse',
                        pc.status === 'Cancelado' && 'bg-yellow-500 text-white',
                        pc.status === 'Deshabilitado' && 'bg-slate-500 text-white'
                      )}>
                        {pc.status === 'Cancelado' && <Ban className="w-3 h-3 mr-1.5" />}
                        {pc.status}
                    </Badge>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => setSelectedPcForEdit(pc)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                            </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePcStatus(pc)}>
                            {isEnabled ? (
                              <><ToggleLeft className="mr-2 h-4 w-4" /><span>Deshabilitar</span></>
                            ) : (
                              <><ToggleRight className="mr-2 h-4 w-4" /><span>Habilitar</span></>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setPcToDelete(pc)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </div>
                <CardTitle className="pt-2">
                    <Link href={`/pcs/${pc.id}`} className="hover:underline">
                        {pc.name}
                    </Link>
                </CardTitle>
                <CardDescription>Última IP: {pc.ip || 'Desconocida'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="space-y-1 text-sm">
                   {pc.alias && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <UserCircle className="w-4 h-4" />
                            <p>{pc.alias}</p>
                        </div>
                    )}
                    {pc.loggedUser && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <UserCircle className="w-4 h-4" />
                            <p>Usuario: <span className="font-medium text-foreground/80">{pc.loggedUser}</span></p>
                        </div>
                    )}
                    {pc.location && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <p>{pc.location}</p>
                        </div>
                    )}
                </div>
                <div className="text-sm text-muted-foreground border-t pt-4">
                  <p>Última actualización:</p>
                  <p className="font-medium text-foreground/80">
                    <ClientFormattedDate dateString={pc.lastUpdate} />
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                    {pc.versionId && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <GitBranch className="w-4 h-4" />
                            <p>Versión App: <span className="font-medium text-foreground/80">{pc.versionId}</span></p>
                        </div>
                    )}
                     {pc.agentVersion && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            <p>Versión Agente: <span className={cn("font-medium text-foreground/80", isAgentOutdated && "text-red-500 font-bold")}>{pc.agentVersion}</span></p>
                        </div>
                    )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleUpdate(pc)} 
                  disabled={pc.status === 'En progreso' || !isEnabled}
                  className="w-full"
                >
                  Actualizar Ahora
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {selectedPcForUpdate && <UpdateModal pc={selectedPcForUpdate} onClose={handleCloseUpdateModal} onUpdateComplete={handleUpdateComplete} />}
      {selectedPcForEdit && <EditPcModal pc={selectedPcForEdit} onClose={handleCloseEditModal} onSave={handleEditComplete} />}
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
