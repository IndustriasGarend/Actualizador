import { PageHeader } from '@/components/page-header';
import { PcList } from '@/components/dashboard/pc-list';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import type { PC, Package } from '@/lib/types';

function getPcs(): PC[] {
  try {
    const stmt = db.prepare('SELECT * FROM pcs ORDER BY name');
    const result = stmt.all() as PC[] | undefined;
    return result || [];
  } catch (error) {
    console.error("Failed to fetch PCs:", error);
    return [];
  }
}

function getPackages(): Package[] {
  try {
    const stmt = db.prepare('SELECT * FROM packages ORDER BY name');
    const result = stmt.all() as Package[] | undefined;
    return result || [];
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const pcs = getPcs();
  const packages = getPackages();

  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Panel de Control"
        description="Monitoree y ejecute tareas en las PCs de la empresa."
      />
      <div className="flex-1 p-6">
        <Suspense fallback={<p className="text-center">Cargando PCs...</p>}>
          <PcList initialPcs={pcs} packages={packages} />
        </Suspense>
      </div>
    </main>
  );
}
