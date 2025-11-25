import { PageHeader } from '@/components/page-header';
import { db } from '@/lib/db';
import { ConfigForm } from '@/components/configuracion/config-form';
import type { SystemConfig } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadAgentCard } from '@/components/configuracion/download-agent-card';


function getSettings(): Partial<SystemConfig> {
    try {
        const stmt = db.prepare("SELECT key, value FROM settings WHERE key = 'serverUrl'");
        const rows = stmt.all() as { key: string; value: string }[];
        
        const config: Partial<SystemConfig> = {};
        for (const row of rows) {
            if (row.key === 'serverUrl') {
                config.serverUrl = row.value;
            }
        }
        return config;
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return {};
    }
}


export default function ConfiguracionPage() {
    const settings = getSettings();

    return (
        <main className="flex flex-col h-full">
            <PageHeader
                title="Configuración"
                description="Gestione los parámetros generales del servidor y del agente."
            />
            <div className="flex-1 p-6 space-y-8">
                <ConfigForm initialConfig={settings} />
            </div>
        </main>
    );
}
