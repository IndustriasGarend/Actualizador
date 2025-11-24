import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { pcId } = await request.json();
    if (!pcId) {
      return NextResponse.json({ message: 'pcId es requerido' }, { status: 400 });
    }

    const stmt = db.prepare("INSERT INTO tasks (pcId, status) VALUES (?, 'pendiente')");
    const result = stmt.run(pcId);

    // Actualizar inmediatamente el estado de la PC a 'Pendiente'
    const updatePcStmt = db.prepare("UPDATE pcs SET status = 'Pendiente' WHERE id = ?");
    updatePcStmt.run(pcId);

    return NextResponse.json({ message: 'Tarea de actualización creada', taskId: result.lastInsertRowid });
  } catch (error) {
    console.error('Error al crear la tarea:', error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
