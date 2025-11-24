import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { db } from '@/lib/db';

// Helper para crear un buffer con BOM (Byte Order Mark) para UTF-8
function getUtf8BomBuffer(content: string): Buffer {
    // BOM for UTF-8 is EF BB BF
    const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
    const bufferContent = Buffer.from(content, 'utf-8');
    return Buffer.concat([bom, bufferContent]);
}

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
        const installBatPath = path.join(process.cwd(), 'scripts', 'install.bat');


        const agentScriptTemplate = await fs.readFile(agentTemplatePath, 'utf-8');
        const installScriptTemplate = await fs.readFile(installTemplatePath, 'utf-8');
        const installBatContent = await fs.readFile(installBatPath, 'utf-8');

        // Reemplazar los placeholders en los scripts
        const agentScriptContent = agentScriptTemplate
            .replace('__SERVER_URL__', serverUrl)
            .replace('__PC_ID__', pcId || '__PC_ID_PLACEHOLDER__'); // Placeholder si es para update
            
        const installScriptContent = installScriptTemplate
            .replace('__PC_NAME__', pcName || '__PC_NAME_PLACEHOLDER__'); // Placeholder si es para update
        
        // Crear el archivo ZIP en memoria
        const zip = new JSZip();
        // Guardar scripts de PS con codificacion UTF-8 con BOM
        zip.file('agent.ps1', getUtf8BomBuffer(agentScriptContent));
        zip.file('install-service.ps1', getUtf8BomBuffer(installScriptContent));
        zip.file('install.bat', installBatContent);
        
        // Incluir 7za.exe en el zip para que este disponible para el agente
        const sevenZipPath = path.join(process.cwd(), 'scripts', '7za.exe');
        const sevenZipBuffer = await fs.readFile(sevenZipPath);
        zip.file('7za.exe', sevenZipBuffer, { binary: true });


        let zipFilename = `softland-agent-update.zip`;

        if (!forUpdate) {
            zipFilename = `softland-agent-${pcName}.zip`;
            zip.file('README.txt', `Paquete de agente para ${pcName} (ID: ${pcId})\n\nInstrucciones:\n1. Copie esta carpeta a la PC cliente (ej: C:\\SoftlandAgent).\n2. Haga doble clic en el archivo 'install.bat'.\n3. Acepte la solicitud de permisos de Administrador.\n4. Ingrese la cuenta y contrasena para el usuario de servicio cuando se solicite.\n\nEl servicio 'SoftlandUpdateAgent_${pcName}' sera creado e iniciado.`);
            
            // Insertar la PC en la base de datos si no existe
            const stmt = db.prepare('INSERT OR IGNORE INTO pcs (id, name, alias, location, ip, status) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(pcId, pcName, alias, location, 'Desconocida', 'Pendiente');
        }


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
