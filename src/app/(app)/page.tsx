import { PageHeader } from '@/components/page-header';
import { PcList } from '@/components/dashboard/pc-list';
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Panel de Actualización"
        description="Monitoree y ejecute actualizaciones en las PCs de la empresa."
      />
      <div className="flex-1 p-6">
        <Suspense fallback={<p className="text-center">Cargando PCs...</p>}>
          <PcList />
        </Suspense>
      </div>
    </main>
  );
}
