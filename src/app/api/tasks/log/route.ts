
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PC } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { pcId, pcName, action, status, message, versionId, taskId, agentVersion, ip, loggedUser, hardwareInfo } = await request.json();

    if (!pcId || !pcName || !action || !status) {
      return NextResponse.json({ message: 'Faltan parámetros requeridos' }, { status: 400 });
    }
    
    const logStmt = db.prepare(
      'INSERT INTO logs (pcId, pcName, action, status, message, versionId) VALUES (?, ?, ?, ?, ?, ?)'
    );
    logStmt.run(pcId, pcName, action, status, message || '', versionId || null);

    let pcStatus: PC['status'] = 'En progreso';
    if (status === 'Éxito' && (action === 'Actualización completada' || action === 'Versión ya actualizada')) {
        pcStatus = 'Actualizado';
    } else if (status === 'Fallo') {
        pcStatus = 'Error';
    } else if (status === 'Cancelado') {
        pcStatus = 'Cancelado';
    }

    // Solo actualizamos el estado y la fecha si la tarea terminó (no si está "En progreso")
    if (pcStatus !== 'En progreso') {
        let updateQuery = "UPDATE pcs SET status = ?, lastUpdate = datetime('now')";
        const params: (string | number | null)[] = [pcStatus];

        if (pcStatus === 'Actualizado' && versionId) {
            updateQuery += ", versionId = ?";
            params.push(versionId);
        }
        if (agentVersion) {
            updateQuery += ", agentVersion = ?";
            params.push(agentVersion);
        }
        if (ip) {
            updateQuery += ", ip = ?";
            params.push(ip);
        }
        if (loggedUser) {
            updateQuery += ", loggedUser = ?";
            params.push(loggedUser);
        }
        if(hardwareInfo) {
            updateQuery += ", osName = ?, osVersion = ?, cpuModel = ?, cpuCores = ?, totalMemory = ?, disks = ?";
            params.push(
                hardwareInfo.osName || null,
                hardwareInfo.osVersion || null,
                hardwareInfo.cpuModel || null,
                hardwareInfo.cpuCores || null,
                hardwareInfo.totalMemory || null,
                hardwareInfo.disks || null
            );
        }
        
        updateQuery += ", currentTaskId = NULL WHERE id = ?";
        params.push(pcId);
        
        const pcStmt = db.prepare(updateQuery);
        pcStmt.run(...params);
    } else {
        // Si la tarea está en progreso, solo actualizamos los datos que no dependen del estado final
        const updateQueryParts: string[] = [];
        const params: (string | number | null)[] = [];
        
        if (agentVersion) {
            updateQueryParts.push("agentVersion = ?");
            params.push(agentVersion);
        }
        if (ip) {
            updateQueryParts.push("ip = ?");
            params.push(ip);
        }
        if (loggedUser) {
            updateQueryParts.push("loggedUser = ?");
            params.push(loggedUser);
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

        if (updateQueryParts.length > 0) {
            const updateQuery = `UPDATE pcs SET ${updateQueryParts.join(', ')} WHERE id = ?`;
            params.push(pcId);
            const pcStmt = db.prepare(updateQuery);
            pcStmt.run(...params);
        }
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
