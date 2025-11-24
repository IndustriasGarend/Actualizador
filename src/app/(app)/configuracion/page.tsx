import { PageHeader } from '@/components/page-header';
import { ConfigForm } from '@/components/configuracion/config-form';
import { DownloadAgentCard } from '@/components/configuracion/download-agent-card';
import { defaultConfig } from '@/lib/data';
import { BulkAddCard } from '@/components/configuracion/bulk-add-card';

export default function ConfiguracionPage() {
  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Configuración del Sistema"
        description="Ajuste los parámetros y gestione los equipos cliente."
      />
      <div className="flex-1 p-6 space-y-8">
        <ConfigForm initialConfig={defaultConfig} />
        <BulkAddCard />
        <DownloadAgentCard />
      </div>
    </main>
  );
}