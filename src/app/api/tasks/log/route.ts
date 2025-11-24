import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { pcId, pcName, action, status, message } = await request.json();

    if (!pcId || !pcName || !action || !status) {
      return NextResponse.json({ message: 'Faltan parámetros requeridos' }, { status: 400 });
    }
    
    // Insertar en la tabla de logs
    const logStmt = db.prepare(
      'INSERT INTO logs (pcId, pcName, action, status, message) VALUES (?, ?, ?, ?, ?)'
    );
    logStmt.run(pcId, pcName, action, status, message || '');

    // Actualizar el estado de la PC
    let pcStatus = 'En progreso';
    if (action === 'Actualización completada' && status === 'Éxito') {
        pcStatus = 'Actualizado';
    } else if (status === 'Fallo') {
        pcStatus = 'Error';
    }

    const pcStmt = db.prepare("UPDATE pcs SET status = ?, lastUpdate = datetime('now') WHERE id = ?");
    pcStmt.run(pcStatus, pcId);

    return NextResponse.json({ message: 'Log guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar el log:', error);
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
