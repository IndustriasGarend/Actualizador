import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/pcs/[pcId] - Elimina una PC
export async function DELETE(
  request: Request,
  { params }: { params: { pcId: string } }
) {
  const pcId = params.pcId;
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
