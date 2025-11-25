import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const packageSchema = z.object({
  name: z.string().min(1, 'El nombre del paquete es requerido.'),
  description: z.string().optional(),
  packageType: z.enum(['actualizacion_archivos', 'ejecutar_script', 'comando_powershell', 'registro_componentes']),
  updateFilePath: z.string().optional(),
  localUpdateDir: z.string().optional(),
  installDir: z.string().optional(),
  serviceName: z.string().optional(),
  environmentPath: z.string().optional(),
  command: z.string().optional(),
});

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM packages ORDER BY name');
    const packages = stmt.all();
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    return NextResponse.json({ message: 'Error al obtener los paquetes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedBody = packageSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json({ message: 'Datos de paquete inválidos', errors: validatedBody.error.flatten() }, { status: 400 });
    }
    
    const { name, description, packageType, updateFilePath, localUpdateDir, installDir, serviceName, environmentPath, command } = validatedBody.data;

    const stmt = db.prepare(
      `INSERT INTO packages (
        name, description, packageType, updateFilePath, localUpdateDir, installDir, serviceName, environmentPath, command
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
        name, 
        description || null, 
        packageType,
        updateFilePath || null, 
        localUpdateDir || null, 
        installDir || null, 
        serviceName || null, 
        environmentPath || null,
        command || null
    );

    return NextResponse.json({ message: 'Paquete creado correctamente', packageId: result.lastInsertRowid });

  } catch (error) {
    console.error("Error al crear el paquete:", error);
    return NextResponse.json({ message: 'Error en el servidor al crear el paquete.' }, { status: 500 });
  }
}
