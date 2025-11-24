import { PageHeader } from '@/components/page-header';
import { ConfigForm } from '@/components/configuracion/config-form';
import { defaultConfig } from '@/lib/data';

export default function ConfiguracionPage() {
  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Configuración del Sistema"
        description="Ajuste los parámetros para el proceso de actualización."
      />
      <div className="flex-1 p-6">
        <ConfigForm initialConfig={defaultConfig} />
      </div>
    </main>
  );
}
