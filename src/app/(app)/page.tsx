import { PageHeader } from '@/components/page-header';
import { PcList } from '@/components/dashboard/pc-list';
import { Suspense } from 'react';
import type { PC } from '@/lib/types';

// En un futuro, estos datos vendrán de la base de datos.
const pcs: PC[] = [
  { id: 'pc-1', name: 'CAJA-01', ip: '192.168.1.101', status: 'Actualizado', lastUpdate: '2024-05-19T10:00:00Z' },
  { id: 'pc-2', name: 'CAJA-02', ip: '192.168.1.102', status: 'Pendiente', lastUpdate: '2024-05-10T14:30:00Z' },
  { id: 'pc-3', name: 'OFICINA-CONTABLE', ip: '192.168.1.50', status: 'Error', lastUpdate: '2024-05-18T11:00:00Z' },
  { id: 'pc-4', name: 'BODEGA', ip: '192.168.1.200', status: 'Pendiente', lastUpdate: null },
];

export default function DashboardPage() {
  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Panel de Actualización"
        description="Monitoree y ejecute actualizaciones en las PCs de la empresa."
      />
      <div className="flex-1 p-6">
        <Suspense fallback={<p className="text-center">Cargando PCs...</p>}>
          <PcList initialPcs={pcs} />
        </Suspense>
      </div>
    </main>
  );
}
