
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { db } from '@/lib/db';
import { LATEST_AGENT_VERSION } from '@/lib/data';

export const dynamic = 'force-dynamic';

function getCustomServerUrl(): string | null {
    try {
        const stmt = db.prepare("SELECT value FROM settings WHERE key = 'serverUrl'");
        const result = stmt.get() as { value: string } | undefined;
        return result ? result.value : null;
    } catch (e) {
        console.error("Could not fetch custom server URL from DB", e);
        return null;
    }
}

export async function GET(request: Request) {
    try {
        // Leer los templates de los scripts
        const agentTemplatePath = path.join(process.cwd(), 'scripts', 'agent.ps1.template');
        const installScriptTemplatePath = path.join(process.cwd(), 'scripts', 'install-service.ps1.template');
        
        let agentScriptContent = await fs.readFile(agentTemplatePath, 'utf-8');
        const installScriptContent = await fs.readFile(installScriptTemplatePath, 'utf-8');
        
        // Inyectar la versión del agente en el script
        agentScriptContent = agentScriptContent.replace(/{{AGENT_VERSION}}/g, LATEST_AGENT_VERSION);

        // --- Generación dinámica del config.json ---
        const customUrl = getCustomServerUrl();
        let serverUrl: string;

        if (customUrl) {
            serverUrl = customUrl;
        } else {
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            const host = request.headers.get('host');
            if (!host) {
                throw new Error('No se pudo determinar el host del servidor.');
            }
            serverUrl = `${protocol}://${host}`;
        }
        
        const configContent = JSON.stringify({ serverUrl }, null, 2);
        
        // Crear el archivo ZIP en memoria
        const zip = new JSZip();

        zip.file('agent.ps1', agentScriptContent);
        zip.file('install-service.ps1', installScriptContent);
        zip.file('config.json', configContent);
        
        // Incluir nssm.exe desde la carpeta /scripts
        try {
            const exePath = path.join(process.cwd(), 'scripts', 'nssm.exe');
            const exeBuffer = await fs.readFile(exePath);
            zip.file('nssm.exe', exeBuffer, { binary: true });
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                console.error("CRÍTICO: El archivo 'nssm.exe' no se encontró en la carpeta /scripts. El usuario debe colocarlo allí. No se puede generar el agente.");
                throw new Error("El archivo 'nssm.exe' no se encontró en la carpeta /scripts del servidor. Por favor, pida al administrador que lo coloque allí.");
            }
            throw e; // Relanzar otros errores
        }
        
        const readmeContent = `
Paquete de Agente para Clic Actualizador Tools (Versión ${LATEST_AGENT_VERSION})
=================================================

La URL de su servidor (${serverUrl}) ya ha sido configurada. 'nssm.exe' está incluido.

Instrucciones de Instalacion:
-----------------------------

1. Copie esta carpeta a una ubicacion permanente en la PC cliente (ej: C:\\ClicUpdaterAgent).

2. Haga clic derecho en 'install-service.ps1' y seleccione 'Ejecutar con PowerShell'.
   Si esta opcion no aparece, abra una terminal de PowerShell como Administrador, 
   navegue a esta carpeta y ejecute: .\\install-service.ps1

3. Acepte la solicitud de permisos de Administrador (UAC) si aparece.

4. (OBLIGATORIO) Vaya a services.msc, busque el servicio "Clic Actualizador Tools Agent", 
   y en Propiedades > Iniciar sesion, configure una cuenta de dominio con acceso a las carpetas de red.

5. Reinicie el servicio para aplicar el cambio de cuenta.
`;
        zip.file('LEEME.txt', readmeContent);

        const zipFilename = `clic-actualizador-agent-v${LATEST_AGENT_VERSION}.zip`;
        const zipContent = await zip.generateAsync({ type: 'nodebuffer', platform: 'DOS' });

        return new NextResponse(zipContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${zipFilename}"`,
            },
        });

    } catch (error) {
        console.error("Error al generar el paquete del agente:", error);
        const errorMessage = (error instanceof Error) ? error.message : 'Error desconocido del servidor.';
        return NextResponse.json({ message: `Error al generar el paquete del agente: ${errorMessage}` }, { status: 500 });
    }
}
