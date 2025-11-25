import { PageHeader } from '@/components/page-header';
import { db } from '@/lib/db';
import type { Package } from '@/lib/types';
import { PackageList } from '@/components/paquetes/package-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

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

export default async function PaquetesPage() {
  const packages = getPackages();

  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Gestión de Paquetes"
        description="Cree, edite y administre los paquetes de software para despliegue."
        action={
            <Button asChild>
                <Link href="/paquetes/nuevo">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Paquete
                </Link>
            </Button>
        }
      />
      <div className="flex-1 p-6">
        <PackageList packages={packages} />
      </div>
    </main>
  );
}
