'use client';
/**
 * @fileoverview
 * Este componente es el corazón del Dashboard.
 * Muestra una lista de tarjetas, cada una representando una PC monitoreada.
 * Permite iniciar actualizaciones, editar y eliminar PCs.
 */
import { useState } from 'react';
import type { PC } from '@/lib/types';
import { ServerCrash } from 'lucide-react';
import { PcCard } from './pc-card';

interface PcListProps {
  initialPcs: PC[];
}

export function PcList({ initialPcs }: PcListProps) {
  const [pcs, setPcs] = useState<PC[]>(initialPcs);
  
  const onPcUpdate = (updatedPc: PC) => {
    setPcs(currentPcs => currentPcs.map(p => p.id === updatedPc.id ? updatedPc : p));
  };

  const onPcDelete = (pcId: string) => {
    setPcs(currentPcs => currentPcs.filter(p => p.id !== pcId));
  }

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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pcs.map((pc) => (
        <PcCard 
          key={pc.id} 
          pc={pc}
          onUpdate={onPcUpdate}
          onDelete={onPcDelete}
        />
      ))}
    </div>
  );
}
