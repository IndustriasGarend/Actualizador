import { PageHeader } from '@/components/page-header';
import { PcList } from '@/components/dashboard/pc-list';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import type { PC } from '@/lib/types';

// Ahora, los datos se obtienen de la base de datos SQLite.
function getPcs() {
  const stmt = db.prepare('SELECT * FROM pcs ORDER BY name');
  return stmt.all() as PC[];
}

export default function DashboardPage() {
  const pcs = getPcs();

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
