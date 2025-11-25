import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const packageSchema = z.object({
  name: z.string().min(1, 'El nombre del paquete es requerido.'),
  description: z.string().optional(),
  packageType: z.enum(['actualizacion_archivos', 'ejecutar_script', 'comando_powershell']),
  updateFilePath: z.string().optional(),
  localUpdateDir: z.string().optional(),
  installDir: z.string().optional(),
  serviceName: z.string().optional(),
  environmentPath: z.string().optional(),
  command: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    const stmt = db.prepare("SELECT * FROM packages WHERE id = ?");
    const pkg = stmt.get(id);

    if (!pkg) {
      return NextResponse.json({ message: 'El paquete no se encontró' }, { status: 404 });
    }
    return NextResponse.json(pkg);
  } catch (error) {
    console.error(`Error al obtener el paquete ${params.id}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const validatedBody = packageSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json({ message: 'Datos de paquete inválidos', errors: validatedBody.error.flatten() }, { status: 400 });
    }
    
    const { name, description, packageType, updateFilePath, localUpdateDir, installDir, serviceName, environmentPath, command } = validatedBody.data;
    
    const stmt = db.prepare(
        `UPDATE packages SET 
            name = ?, 
            description = ?, 
            packageType = ?,
            updateFilePath = ?, 
            localUpdateDir = ?, 
            installDir = ?, 
            serviceName = ?, 
            environmentPath = ?,
            command = ?
        WHERE id = ?`
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
        command || null,
        id
    );

    if (result.changes === 0) {
      return NextResponse.json({ message: 'El paquete no se encontró' }, { status: 404 });
    }

    const updatedPackageStmt = db.prepare("SELECT * FROM packages WHERE id = ?");
    const updatedPackage = updatedPackageStmt.get(id);

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error(`Error al actualizar el paquete ${params.id}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
     if (isNaN(id)) {
        return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const stmt = db.prepare("DELETE FROM packages WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json({ message: 'El paquete no se encontró' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Paquete eliminado correctamente' });
  } catch (error) {
    console.error(`Error al eliminar el paquete ${params.id}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
