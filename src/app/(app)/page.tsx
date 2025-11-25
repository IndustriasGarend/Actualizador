import { PageHeader } from '@/components/page-header';
import { PcList } from '@/components/dashboard/pc-list';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import type { PC } from '@/lib/types';

// Se mueve la función fuera del componente para que sea reutilizable y clara.
function getPcs(): PC[] {
  try {
    const stmt = db.prepare('SELECT * FROM pcs ORDER BY name');
    // Aseguramos que devolvemos un array aunque no haya resultados.
    const result = stmt.all() as PC[] | undefined;
    return result || [];
  } catch (error) {
    console.error("Failed to fetch PCs:", error);
    // En caso de error en la base de datos, devolvemos un array vacío
    // para evitar que la página se rompa por completo.
    return [];
  }
}

// Se convierte el componente de página en una función asíncrona.
export default async function DashboardPage() {
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
