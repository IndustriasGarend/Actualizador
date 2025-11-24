import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { pcId: string } }
) {
  const pcId = params.pcId;

  try {
    // Primero, verificar si hay una tarea 'en_progreso' que haya sido cancelada
    const checkCancelStmt = db.prepare(`
        SELECT t.id, t.status FROM tasks t
        JOIN pcs p ON p.id = t.pcId
        WHERE t.pcId = ? AND p.currentTaskId = t.id AND t.status = 'cancelado'
    `);
    const cancelledTask = checkCancelStmt.get(pcId);

    if (cancelledTask) {
        return NextResponse.json({ task: 'cancelar', taskId: cancelledTask.id });
    }

    // Si no, buscar una tarea pendiente
    const stmt = db.prepare("SELECT id FROM tasks WHERE pcId = ? AND status = 'pendiente' ORDER BY createdAt DESC LIMIT 1");
    const task = stmt.get(pcId);

    if (task) {
      return NextResponse.json({ task: 'actualizar', taskId: task.id });
    }

    // Si no hay tareas pendientes ni canceladas, no hacer nada
    return NextResponse.json({ task: 'ninguna' });
  } catch (error) {
    console.error(`Error al verificar tareas para ${pcId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
