
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PC } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { pcId, pcName, action, status, message, versionId, taskId, agentVersion, ip, loggedUser, hardwareInfo } = await request.json();

    if (!pcId || !pcName || !action || !status) {
      return NextResponse.json({ message: 'Faltan parámetros requeridos' }, { status: 400 });
    }
    
    // 1. Insertar el registro de log
    const logStmt = db.prepare(
      'INSERT INTO logs (pcId, pcName, action, status, message, versionId) VALUES (?, ?, ?, ?, ?, ?)'
    );
    logStmt.run(pcId, pcName, action, status, message || '', versionId || null);

    // 2. Determinar el estado final de la PC basado en el log
    let pcFinalStatus: PC['status'] | null = null;
    if (status === 'Éxito' && (action === 'Actualización completada' || action === 'Versión ya actualizada')) {
        pcFinalStatus = 'Actualizado';
    } else if (status === 'Fallo') {
        pcFinalStatus = 'Error';
    } else if (status === 'Cancelado') {
        pcFinalStatus = 'Cancelado';
    }
    
    // 3. Construir la consulta de actualización para la PC de forma dinámica
    const updateQueryParts: string[] = [];
    const params: (string | number | null)[] = [];

    // Siempre actualizamos estos datos si vienen en el payload
    if (ip) {
        updateQueryParts.push("ip = ?");
        params.push(ip);
    }
    if (loggedUser) {
        updateQueryParts.push("loggedUser = ?");
        params.push(loggedUser);
    }
    if (agentVersion) {
        updateQueryParts.push("agentVersion = ?");
        params.push(agentVersion);
    }
    if(hardwareInfo) {
        updateQueryParts.push("osName = ?, osVersion = ?, cpuModel = ?, cpuCores = ?, totalMemory = ?, disks = ?");
        params.push(
            hardwareInfo.osName || null,
            hardwareInfo.osVersion || null,
            hardwareInfo.cpuModel || null,
            hardwareInfo.cpuCores || null,
            hardwareInfo.totalMemory || null,
            hardwareInfo.disks || null
        );
    }

    // Solo actualizamos el estado y la fecha si la tarea ha terminado
    if (pcFinalStatus) {
        updateQueryParts.push("status = ?");
        params.push(pcFinalStatus);
        
        updateQueryParts.push("lastUpdate = datetime('now')");

        if (pcFinalStatus === 'Actualizado' && versionId) {
            updateQueryParts.push("versionId = ?");
            params.push(versionId);
        }
        
        updateQueryParts.push("currentTaskId = NULL");
    }

    // Ejecutar la actualización si hay algo que cambiar
    if (updateQueryParts.length > 0) {
        const updateQuery = `UPDATE pcs SET ${updateQueryParts.join(', ')} WHERE id = ?`;
        params.push(pcId);
        const pcStmt = db.prepare(updateQuery);
        pcStmt.run(...params);
    }

    // 4. Actualizar el estado de la tarea si corresponde (SOLO si hay taskId y la tarea tiene estado final)
    if(taskId && pcFinalStatus) {
        let taskStatus: string;
        switch(pcFinalStatus) {
            case 'Actualizado': taskStatus = 'completado'; break;
            case 'Error': taskStatus = 'error'; break;
            case 'Cancelado': taskStatus = 'cancelado'; break;
            default: taskStatus = 'en_progreso'; break; // No debería ocurrir, pero como fallback
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
