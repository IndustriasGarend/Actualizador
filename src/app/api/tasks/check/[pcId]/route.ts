
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LATEST_AGENT_VERSION } from '@/lib/data';
import type { Package } from '@/lib/types';


export async function POST(
  request: Request,
  context: { params: { pcId: string } }
) {
  const pcId = context.params.pcId;
  const { agentVersion, pcName } = await request.json();

  try {
    // 0. Auto-registro de nuevas PCs
    const pcCheckStmt = db.prepare("SELECT id FROM pcs WHERE id = ?");
    const existingPc = pcCheckStmt.get(pcId);
    if (!existingPc) {
        const insertStmt = db.prepare("INSERT INTO pcs (id, name, status) VALUES (?, ?, 'Actualizado')");
        insertStmt.run(pcId, pcName || pcId);
    }

    // 1. Detección de agente desactualizado (MÁXIMA PRIORIDAD)
    if (agentVersion !== LATEST_AGENT_VERSION) {
      return NextResponse.json({ task: 'actualizar_agente' });
    }

    // 2. Verificación de tareas de cancelación pendientes
    const checkCancelStmt = db.prepare(`
        SELECT id FROM tasks 
        WHERE pcId = ? AND status = 'cancelado' 
        ORDER BY updatedAt DESC LIMIT 1
    `);
    const cancelledTask = checkCancelStmt.get(pcId) as { id: number } | undefined;

    if (cancelledTask) {
        db.prepare("UPDATE tasks SET status = 'cancelado_confirmado' WHERE id = ?").run(cancelledTask.id);
        return NextResponse.json({ task: 'cancelar', taskId: cancelledTask.id });
    }

    // 3. Búsqueda de tareas de actualización pendientes
    const taskStmt = db.prepare("SELECT id, packageId FROM tasks WHERE pcId = ? AND status = 'pendiente' ORDER BY createdAt DESC LIMIT 1");
    const task = taskStmt.get(pcId) as { id: number; packageId: number } | undefined;

    if (task) {
      const packageStmt = db.prepare("SELECT * FROM packages WHERE id = ?");
      const pkg = packageStmt.get(task.packageId) as Package | undefined;
      
      if (!pkg) {
        // Marcar tarea como errónea si el paquete no existe
        db.prepare("UPDATE tasks SET status = 'error' WHERE id = ?").run(task.id);
        return NextResponse.json({ task: 'ninguna' });
      }

      // Devolver toda la información del paquete en el objeto de configuración
      return NextResponse.json({ 
        task: 'actualizar', 
        taskId: task.id,
        config: pkg // pkg contiene todos los campos necesarios
      });
    }

    // Si no hay tareas pendientes, de cancelación ni de auto-actualización, no hacer nada.
    return NextResponse.json({ task: 'ninguna' });
  } catch (error) {
    console.error(`Error al verificar tareas para ${pcId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
