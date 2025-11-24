import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { pcId, pcName, action, status, message, versionId } = await request.json();

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
    if (action === 'Actualización completada' && status === 'Éxito') {
        pcStatus = 'Actualizado';
    } else if (status === 'Fallo') {
        pcStatus = 'Error';
    } else if (status === 'Omitido') {
        pcStatus = 'Actualizado';
    }

    // Solo actualiza la versión si es una actualización exitosa y se proporciona una versionId
    if (pcStatus === 'Actualizado' && versionId) {
        const pcStmt = db.prepare("UPDATE pcs SET status = ?, lastUpdate = datetime('now'), versionId = ? WHERE id = ?");
        pcStmt.run(pcStatus, versionId, pcId);
    } else {
        const pcStmt = db.prepare("UPDATE pcs SET status = ? WHERE id = ? AND status != 'Actualizado'");
        pcStmt.run(pcStatus, pcId);
    }

    return NextResponse.json({ message: 'Log guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar el log:', error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
