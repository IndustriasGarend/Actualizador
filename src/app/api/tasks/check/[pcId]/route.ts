import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LATEST_AGENT_VERSION, defaultConfig } from '@/lib/data';
import type { SystemConfig } from '@/lib/types';

function getSystemConfig(): SystemConfig {
  const stmt = db.prepare('SELECT * FROM settings');
  const rows = stmt.all() as { key: string; value: string }[];
  
  const config = rows.reduce((acc, row) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[row.key] = row.value;
    return acc;
  }, {});

  return { ...defaultConfig, ...config };
}


export async function POST(
  request: Request,
  { params }: { params: { pcId: string } }
) {
  const pcId = params.pcId;
  const { agentVersion, pcName } = await request.json();

  try {
    const config = getSystemConfig();

    // 0. Auto-registro de nuevas PCs
    const pcCheckStmt = db.prepare("SELECT id FROM pcs WHERE id = ?");
    const existingPc = pcCheckStmt.get(pcId);
    if (!existingPc) {
        const insertStmt = db.prepare("INSERT INTO pcs (id, name, status) VALUES (?, ?, 'Actualizado')");
        // Usar pcId (hostname) tanto para id como para name
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
    const stmt = db.prepare("SELECT id FROM tasks WHERE pcId = ? AND status = 'pendiente' ORDER BY createdAt DESC LIMIT 1");
    const task = stmt.get(pcId);

    if (task) {
      // Devolver la tarea junto con la configuración actual
      return NextResponse.json({ 
        task: 'actualizar', 
        taskId: task.id,
        config: {
          updateFilePath: config.updateFilePath,
          localUpdateDir: config.localUpdateDir,
          softlandInstallDir: config.softlandInstallDir,
          serviceName: config.serviceName,
          environmentPath: config.environmentPath,
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
