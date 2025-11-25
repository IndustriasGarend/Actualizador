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
        const installTemplatePath = path.join(process.cwd(), 'scripts', 'install-service.ps1.template');
        const installBatPath = path.join(process.cwd(), 'scripts', 'install.bat');

        const agentScriptTemplate = await fs.readFile(agentTemplatePath, 'utf-8');
        const installScriptTemplate = await fs.readFile(installTemplatePath, 'utf-8');
        const installBatContent = await fs.readFile(installBatPath, 'utf-8');
        
        // Crear el archivo ZIP en memoria
        const zip = new JSZip();
        // Guardar scripts de PS con codificacion UTF-8 con BOM
        zip.file('agent.ps1', getUtf8BomBuffer(agentScriptTemplate));
        zip.file('install-service.ps1', getUtf8BomBuffer(installScriptTemplate));
        zip.file('install.bat', installBatContent);
        
        // Incluir 7za.exe en el zip para que este disponible para el agente
        const sevenZipPath = path.join(process.cwd(), 'scripts', '7za.exe');
        const sevenZipBuffer = await fs.readFile(sevenZipPath);
        zip.file('7za.exe', sevenZipBuffer, { binary: true });

        const readmeContent = `
Paquete de Agente Generico para Softland Updater
=================================================

Instrucciones de Instalacion:
-----------------------------

1. Copie esta carpeta a una ubicacion permanente en la PC cliente (ej: C:\\SoftlandAgent).
2. Haga doble clic en el archivo 'install.bat'.
3. Acepte la solicitud de permisos de Administrador (UAC).
4. La consola le pedira la URL del servidor. Ingrese la direccion completa, incluyendo el puerto (ej: http://192.168.1.100:9002).
5. A continuacion, se le pediran las credenciales de la cuenta de servicio para ejecutar el agente.
6. El script instalara y arrancara el servicio. La PC se registrara automaticamente en el panel de control.
`;
        zip.file('LEEME.txt', readmeContent);

        const zipFilename = `softland-agent-installer.zip`;
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
