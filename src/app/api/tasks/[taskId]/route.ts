
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/tasks/[taskId] - Cancela una tarea
export async function DELETE(
  request: Request,
  context: { params: { taskId: string } }
) {
  const taskId = parseInt(context.params.taskId, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ message: 'ID de tarea inválido' }, { status: 400 });
  }

  try {
    const stmt = db.prepare("UPDATE tasks SET status = 'cancelado', updatedAt = datetime('now') WHERE id = ? AND status IN ('pendiente', 'en_progreso')");
    const result = stmt.run(taskId);

    if (result.changes === 0) {
      return NextResponse.json({ message: 'La tarea no se encontró o ya no se puede cancelar' }, { status: 404 });
    }

    // Opcional: Actualizar el estado de la PC a 'Cancelado' si esta era su tarea actual
    const pcStmt = db.prepare("UPDATE pcs SET status = 'Cancelado' WHERE currentTaskId = ?");
    pcStmt.run(taskId);


    return NextResponse.json({ message: 'Tarea cancelada correctamente' });
  } catch (error) {
    console.error(`Error al cancelar la tarea ${taskId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
