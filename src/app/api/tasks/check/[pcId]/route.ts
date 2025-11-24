import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LATEST_AGENT_VERSION } from '@/lib/data';

export async function POST(
  request: Request,
  { params }: { params: { pcId: string } }
) {
  const pcId = params.pcId;
  const { agentVersion } = await request.json();

  try {
    // 1. Detección de agente desactualizado (MÁXIMA PRIORIDAD)
    if (agentVersion !== LATEST_AGENT_VERSION) {
      return NextResponse.json({ task: 'actualizar_agente' });
    }

    // 2. Verificación de tareas de cancelación
    const checkCancelStmt = db.prepare(`
        SELECT t.id, t.status FROM tasks t
        JOIN pcs p ON p.id = t.pcId
        WHERE t.pcId = ? AND p.currentTaskId = t.id AND t.status = 'cancelado'
    `);
    const cancelledTask = checkCancelStmt.get(pcId);

    if (cancelledTask) {
        return NextResponse.json({ task: 'cancelar', taskId: cancelledTask.id });
    }

    // 3. Búsqueda de tareas de actualización pendientes
    const stmt = db.prepare("SELECT id FROM tasks WHERE pcId = ? AND status = 'pendiente' ORDER BY createdAt DESC LIMIT 1");
    const task = stmt.get(pcId);

    if (task) {
      return NextResponse.json({ task: 'actualizar', taskId: task.id });
    }

    // Si no hay tareas pendientes, de cancelación ni de auto-actualización, no hacer nada.
    return NextResponse.json({ task: 'ninguna' });
  } catch (error) {
    console.error(`Error al verificar tareas para ${pcId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
