import { PageHeader } from '@/components/page-header';
import { PackageForm } from '@/components/paquetes/package-form';
import { db } from '@/lib/db';
import type { Package } from '@/lib/types';
import { notFound } from 'next/navigation';

function getPackage(id: string): Package | undefined {
  if (id === 'nuevo') {
    return undefined;
  }
  try {
    const stmt = db.prepare('SELECT * FROM packages WHERE id = ?');
    const result = stmt.get(id) as Package | undefined;
    return result;
  } catch (error) {
    console.error(`Failed to fetch package ${id}:`, error);
    return undefined;
  }
}

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const pkg = getPackage(params.id);

  if (params.id !== 'nuevo' && !pkg) {
    notFound();
  }

  const isNew = params.id === 'nuevo';

  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title={isNew ? 'Nuevo Paquete' : 'Editar Paquete'}
        description={isNew ? 'Defina un nuevo paquete de software para su catálogo.' : `Editando el paquete "${pkg?.name}".`}
      />
      <div className="flex-1 p-6">
        <PackageForm initialPackage={pkg} />
      </div>
    </main>
  );
}
