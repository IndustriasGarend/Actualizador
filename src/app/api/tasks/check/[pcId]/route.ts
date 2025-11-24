import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { pcId: string } }
) {
  const pcId = params.pcId;

  try {
    const stmt = db.prepare("SELECT id FROM tasks WHERE pcId = ? AND status = 'pendiente' ORDER BY createdAt DESC LIMIT 1");
    const task = stmt.get(pcId);

    if (task) {
      return NextResponse.json({ task: 'actualizar', taskId: task.id });
    }

    return NextResponse.json({ task: 'ninguna' });
  } catch (error) {
    console.error(`Error al verificar tareas para ${pcId}:`, error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
