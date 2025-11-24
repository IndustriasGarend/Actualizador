import { PageHeader } from '@/components/page-header';
import { ConfigForm } from '@/components/configuracion/config-form';
import { DownloadAgentCard } from '@/components/configuracion/download-agent-card';
import { defaultConfig } from '@/lib/data';
import { BulkAddCard } from '@/components/configuracion/bulk-add-card';
import { db } from '@/lib/db';
import type { SystemConfig } from '@/lib/types';

function getSystemConfig(): SystemConfig {
  const stmt = db.prepare('SELECT key, value FROM settings');
  const rows = stmt.all() as { key: string; value: string }[];
  
  // Convertir el array de filas en un objeto para fácil acceso
  const settingsMap = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  // Construir el objeto de configuración, usando los valores de la DB o los por defecto
  const config: SystemConfig = {
    updateFilePath: settingsMap.updateFilePath || defaultConfig.updateFilePath,
    localUpdateDir: settingsMap.localUpdateDir || defaultConfig.localUpdateDir,
    softlandInstallDir: settingsMap.softlandInstallDir || defaultConfig.softlandInstallDir,
    serviceName: settingsMap.serviceName || defaultConfig.serviceName,
    adminUser: settingsMap.adminUser || defaultConfig.adminUser,
    environmentPath: settingsMap.environmentPath || defaultConfig.environmentPath,
    adminPass: '', // La contraseña nunca se carga, siempre está vacía en el formulario
  };

  return config;
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
