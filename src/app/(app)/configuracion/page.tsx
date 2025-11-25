import { PageHeader } from '@/components/page-header';
import { ConfigForm } from '@/components/configuracion/config-form';
import { DownloadAgentCard } from '@/components/configuracion/download-agent-card';
import { defaultConfig } from '@/lib/data';
import { db } from '@/lib/db';
import type { SystemConfig } from '@/lib/types';

function getSystemConfig(): SystemConfig {
  const stmt = db.prepare('SELECT key, value FROM settings');
  const rows = stmt.all() as { key: string; value: string }[];
  
  const settingsMap = new Map(rows.map(row => [row.key, row.value]));

  const config: SystemConfig = {
    updateFilePath: settingsMap.get('updateFilePath') || defaultConfig.updateFilePath,
    localUpdateDir: settingsMap.get('localUpdateDir') || defaultConfig.localUpdateDir,
    softlandInstallDir: settingsMap.get('softlandInstallDir') || defaultConfig.softlandInstallDir,
    serviceName: settingsMap.get('serviceName') || defaultConfig.serviceName,
    adminUser: settingsMap.get('adminUser') || defaultConfig.adminUser,
    environmentPath: settingsMap.get('environmentPath') || defaultConfig.environmentPath,
    adminPass: '', // La contraseña nunca se carga, siempre está vacía en el formulario
  };

  return config;
}


export default function ConfiguracionPage() {
  const config = getSystemConfig();

  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Configuracion del Sistema"
        description="Ajuste los parametros de actualizacion y descargue el agente para nuevas PCs."
      />
      <div className="flex-1 p-6 space-y-8">
        <ConfigForm initialConfig={config} />
        <DownloadAgentCard />
      </div>
    </main>
  );
}
