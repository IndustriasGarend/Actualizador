import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pcId = searchParams.get('pcId');
    const pcName = searchParams.get('pcName');
    const alias = searchParams.get('alias');
    const location = searchParams.get('location');
    const forUpdate = searchParams.get('forUpdate') === 'true';

    if (!forUpdate && (!pcId || !pcName)) {
        return NextResponse.json({ message: 'pcId y pcName son requeridos para un nuevo agente' }, { status: 400 });
    }

    try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || `http://${request.headers.get('host')}`;

        // Leer los templates de los scripts
        const agentTemplatePath = path.join(process.cwd(), 'scripts', 'agent.ps1.template');
        const installTemplatePath = path.join(process.cwd(), 'scripts', 'install-service.ps1.template');

        const agentScriptTemplate = await fs.readFile(agentTemplatePath, 'utf-8');
        const installScriptTemplate = await fs.readFile(installTemplatePath, 'utf-8');

        // Reemplazar los placeholders en los scripts
        const agentScriptContent = agentScriptTemplate
            .replace('__SERVER_URL__', serverUrl)
            .replace('__PC_ID__', pcId || '__PC_ID_PLACEHOLDER__'); // Placeholder si es para update
            
        const installScriptContent = installScriptTemplate
            .replace('__PC_NAME__', pcName || '__PC_NAME_PLACEHOLDER__'); // Placeholder si es para update
        
        // Crear el archivo ZIP en memoria
        const zip = new JSZip();
        zip.file('agent.ps1', agentScriptContent);
        zip.file('install-service.ps1', installScriptContent);
        
        let zipFilename = `softland-agent-update.zip`;

        if (!forUpdate) {
            zipFilename = `softland-agent-${pcName}.zip`;
            zip.file('README.txt', `Paquete de agente para ${pcName} (ID: ${pcId})\n\nInstrucciones:\n1. Copie esta carpeta a la PC cliente (ej: C:\\SoftlandAgent).\n2. Abra una consola de PowerShell como Administrador.\n3. Navegue a la carpeta donde copió los archivos.\n4. Ejecute el siguiente comando para permitir la ejecución de scripts: Set-ExecutionPolicy Unrestricted -Force\n5. Ejecute el script de instalación: .\\install-service.ps1\n\nEl servicio 'SoftlandUpdateAgent_${pcName}' será creado e iniciado.`);
            
            // Insertar la PC en la base de datos si no existe
            const stmt = db.prepare('INSERT OR IGNORE INTO pcs (id, name, alias, location, ip, status) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(pcId, pcName, alias, location, 'Desconocida', 'Pendiente');
        }


        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

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
