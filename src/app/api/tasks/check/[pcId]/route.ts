import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LATEST_AGENT_VERSION } from '@/lib/data';
import type { Package } from '@/lib/types';


export async function POST(
  request: Request,
  { params }: { params: { pcId: string } }
) {
  const pcId = params.pcId;
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

      return NextResponse.json({ 
        task: 'actualizar', 
        taskId: task.id,
        config: {
          updateFilePath: pkg.updateFilePath,
          localUpdateDir: pkg.localUpdateDir,
          softlandInstallDir: pkg.installDir,
          serviceName: pkg.serviceName,
          environmentPath: pkg.environmentPath,
        }
      });
    }

    // Si no hay tareas pendientes, de cancelación ni de auto-actualización, no hacer nada.
    return NextResponse.json({ task: 'ninguna' });
  } catch (error) {
    console.error(`Error al verificar tareas para ${pcId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
