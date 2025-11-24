import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { pcId, pcName, action, status, message, versionId, taskId } = await request.json();

    if (!pcId || !pcName || !action || !status) {
      return NextResponse.json({ message: 'Faltan parámetros requeridos' }, { status: 400 });
    }
    
    // Insertar en la tabla de logs
    const logStmt = db.prepare(
      'INSERT INTO logs (pcId, pcName, action, status, message, versionId) VALUES (?, ?, ?, ?, ?, ?)'
    );
    logStmt.run(pcId, pcName, action, status, message || '', versionId || null);

    // Actualizar el estado de la PC
    let pcStatus = 'En progreso';
    if (status === 'Éxito' && (action === 'Actualización completada' || action === 'Versión ya actualizada')) {
        pcStatus = 'Actualizado';
    } else if (status === 'Fallo') {
        pcStatus = 'Error';
    } else if (status === 'Cancelado') {
        pcStatus = 'Cancelado';
    }

    // Solo actualiza la versión si es una actualización exitosa y se proporciona una versionId
    if (pcStatus === 'Actualizado' && versionId) {
        const pcStmt = db.prepare("UPDATE pcs SET status = ?, lastUpdate = datetime('now'), versionId = ?, currentTaskId = NULL WHERE id = ?");
        pcStmt.run(pcStatus, versionId, pcId);
    } else if (pcStatus !== 'En progreso') {
        const pcStmt = db.prepare("UPDATE pcs SET status = ?, currentTaskId = NULL WHERE id = ?");
        pcStmt.run(pcStatus, pcId);
    }

    if(taskId) {
        let taskStatus = 'en_progreso';
        if (status === 'Éxito' && (action === 'Actualización completada' || action === 'Versión ya actualizada')) {
            taskStatus = 'completado';
        } else if (status === 'Fallo') {
            taskStatus = 'error';
        } else if (status === 'Cancelado') {
            taskStatus = 'cancelado';
        }
        
        if (taskStatus !== 'en_progreso') {
            const taskStmt = db.prepare("UPDATE tasks SET status = ?, updatedAt = datetime('now') WHERE id = ?");
            taskStmt.run(taskStatus, taskId);
        }
    }


    return NextResponse.json({ message: 'Log guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar el log:', error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
