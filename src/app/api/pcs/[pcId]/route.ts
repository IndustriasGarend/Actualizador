import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PC } from '@/lib/types';

// GET /api/pcs/[pcId] - Obtiene una PC específica
export async function GET(
  request: Request,
  context: { params: { pcId: string } }
) {
  try {
    const stmt = db.prepare("SELECT * FROM pcs WHERE id = ?");
    const pc = stmt.get(context.params.pcId);

    if (!pc) {
      return NextResponse.json({ message: 'La PC no se encontró' }, { status: 404 });
    }
    return NextResponse.json(pc);
  } catch (error) {
    console.error(`Error al obtener la PC ${context.params.pcId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}

// PUT /api/pcs/[pcId] - Actualiza una PC
export async function PUT(
  request: Request,
  context: { params: { pcId: string } }
) {
  const pcId = context.params.pcId;
  if (!pcId) {
    return NextResponse.json({ message: 'ID de PC inválido' }, { status: 400 });
  }

  try {
    const { alias, location } = await request.json() as Partial<PC>;
    
    if (alias === undefined && location === undefined) {
      return NextResponse.json({ message: 'Se requiere al menos un campo (alias o location) para actualizar.' }, { status: 400 });
    }
    
    const stmt = db.prepare("UPDATE pcs SET alias = ?, location = ? WHERE id = ?");
    const result = stmt.run(alias, location, pcId);

    if (result.changes === 0) {
      return NextResponse.json({ message: 'La PC no se encontró' }, { status: 404 });
    }

    const updatedPcStmt = db.prepare("SELECT * FROM pcs WHERE id = ?");
    const updatedPc = updatedPcStmt.get(pcId);

    return NextResponse.json(updatedPc);
  } catch (error) {
    console.error(`Error al actualizar la PC ${pcId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}


// DELETE /api/pcs/[pcId] - Elimina una PC
export async function DELETE(
  request: Request,
  context: { params: { pcId: string } }
) {
  const pcId = context.params.pcId;
  if (!pcId) {
    return NextResponse.json({ message: 'ID de PC inválido' }, { status: 400 });
  }

  try {
    // La base de datos está configurada con ON DELETE CASCADE,
    // por lo que las tareas y logs asociados también se eliminarán.
    const stmt = db.prepare("DELETE FROM pcs WHERE id = ?");
    const result = stmt.run(pcId);

    if (result.changes === 0) {
      return NextResponse.json({ message: 'La PC no se encontró' }, { status: 404 });
    }

    return NextResponse.json({ message: 'PC eliminada correctamente' });
  } catch (error) {
    console.error(`Error al eliminar la PC ${pcId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
