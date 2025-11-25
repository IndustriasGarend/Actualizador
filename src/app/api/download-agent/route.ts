import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';

// Helper para crear un buffer con BOM (Byte Order Mark) para UTF-8
function getUtf8BomBuffer(content: string): Buffer {
    // BOM for UTF-8 is EF BB BF
    const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
    const bufferContent = Buffer.from(content, 'utf-8');
    return Buffer.concat([bom, bufferContent]);
}

export async function GET(request: Request) {
    try {
        // Leer los templates de los scripts
        const agentTemplatePath = path.join(process.cwd(), 'scripts', 'agent.ps1.template');
        const installScriptPath = path.join(process.cwd(), 'scripts', 'install-service.ps1.template');

        const agentScriptContent = await fs.readFile(agentTemplatePath, 'utf-8');
        const installScriptContent = await fs.readFile(installScriptPath, 'utf-8');
        
        // --- Generación dinámica del config.json ---
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        if (!host) {
            throw new Error('No se pudo determinar el host del servidor.');
        }
        const serverUrl = `${protocol}://${host}`;
        const configContent = JSON.stringify({ serverUrl }, null, 2);
        // ---

        // Crear el archivo ZIP en memoria
        const zip = new JSZip();

        // 1. Añadir scripts de PS con codificación UTF-8 con BOM
        zip.file('agent.ps1', getUtf8BomBuffer(agentScriptContent));
        zip.file('install-service.ps1', getUtf8BomBuffer(installScriptContent));

        // 2. Añadir el config.json generado dinámicamente
        zip.file('config.json', configContent);
        
        // 3. Incluir 7za.exe en el zip para que este disponible para el agente
        const sevenZipPath = path.join(process.cwd(), 'scripts', '7za.exe');
        const sevenZipBuffer = await fs.readFile(sevenZipPath);
        zip.file('7za.exe', sevenZipBuffer, { binary: true });

        // 4. Añadir LEEME.txt con instrucciones actualizadas
        const readmeContent = `
Paquete de Agente para Clic Actualizador Tools
=================================================

La URL de su servidor (${serverUrl}) ya ha sido configurada en el archivo 'config.json'.

Instrucciones de Instalacion:
-----------------------------

1. Copie esta carpeta a una ubicacion permanente en la PC cliente (ej: C:\\ClicUpdaterAgent).

2. Haga clic derecho en 'install-service.ps1' y seleccione 'Ejecutar con PowerShell'.
   Si esta opcion no aparece, abra una terminal de PowerShell como Administrador, 
   navegue a esta carpeta y ejecute: .\\install-service.ps1

3. Acepte la solicitud de permisos de Administrador (UAC) si aparece.

4. El script instalara y arrancara el servicio 'Clic Actualizador Tools Agent'.

5. (OBLIGATORIO) Vaya a services.msc, busque el servicio, y en Propiedades > Iniciar sesion, 
   configure una cuenta de usuario de dominio que tenga acceso a las carpetas de red compartidas.

6. Reinicie el servicio para aplicar el cambio de cuenta.
`;
        zip.file('LEEME.txt', getUtf8BomBuffer(readmeContent));

        const zipFilename = `clic-actualizador-agent-installer.zip`;
        const zipContent = await zip.generateAsync({ type: 'nodebuffer', platform: 'DOS' });

        // Devolver el ZIP para descarga
        return new NextResponse(zipContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${zipFilename}"`,
            },
        });

    } catch (error) {
        console.error("Error al generar el paquete del agente:", error);
        return NextResponse.json({ message: 'Error al generar el paquete del agente.' }, { status: 500 });
    }
}
