/**
 * @fileoverview
 * Página de configuración del sistema. Permite a los administradores
 * ajustar parámetros globales y descargar el paquete del agente.
 */
import { PageHeader } from '@/components/page-header';
import { ConfigForm } from '@/components/configuracion/config-form';
import { DownloadAgentCard } from '@/components/configuracion/download-agent-card';
import { defaultConfig } from '@/lib/data';
import { db } from '@/lib/db';
import type { SystemConfig } from '@/lib/types';

/**
 * Obtiene la configuración del sistema desde la base de datos.
 * Si no se encuentra un valor para una clave, utiliza el valor de `defaultConfig`.
 * @returns {SystemConfig} El objeto de configuración del sistema.
 */
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
    adminPass: '', // La contraseña nunca se carga por seguridad.
  };

  return config;
}


export default function ConfiguracionPage() {
  const config = getSystemConfig();

  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Configuración del Sistema"
        description="Ajuste los parámetros de actualización y descargue el agente para nuevas PCs."
      />
      <div className="flex-1 p-6 space-y-8">
        <ConfigForm initialConfig={config} />
        <DownloadAgentCard />
      </div>
    </main>
  );
}
