import { PageHeader } from '@/components/page-header';
import { ConfigForm } from '@/components/configuracion/config-form';
import { DownloadAgentCard } from '@/components/configuracion/download-agent-card';
import { defaultConfig } from '@/lib/data';
import { BulkAddCard } from '@/components/configuracion/bulk-add-card';
import { db } from '@/lib/db';
import type { SystemConfig } from '@/lib/types';

function getSystemConfig(): SystemConfig {
  const stmt = db.prepare('SELECT * FROM settings');
  const rows = stmt.all() as { key: string; value: string }[];
  
  const config = rows.reduce((acc, row) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[row.key] = row.value;
    return acc;
  }, {});

  return { ...defaultConfig, ...config };
}


export default function ConfiguracionPage() {
  const config = getSystemConfig();

  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Configuración del Sistema"
        description="Ajuste los parámetros y gestione los equipos cliente."
      />
      <div className="flex-1 p-6 space-y-8">
        <ConfigForm initialConfig={config} />
        <BulkAddCard />
        <DownloadAgentCard />
      </div>
    </main>
  );
}
