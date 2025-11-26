
import Database from 'better-sqlite3';
import path from 'path';
import type { SystemLogEntry, DateRange } from './types';


// La base de datos ahora siempre será un archivo físico para consistencia entre desarrollo y producción.
const dbPath = path.join(process.cwd(), 'softland-updater.db');

export const db = new Database(dbPath);

console.log(`Base de datos SQLite conectada en: ${dbPath}`);

function runMigrations() {
    db.exec('PRAGMA foreign_keys = ON;');
    
    db.transaction(() => {
        // Usar CREATE TABLE IF NOT EXISTS para que las migraciones sean idempotentes
        
        // Tabla para almacenar la información de las PCs
        db.exec(`
          CREATE TABLE IF NOT EXISTS pcs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            ip TEXT,
            status TEXT NOT NULL DEFAULT 'Pendiente',
            lastUpdate TEXT,
            versionId TEXT,
            currentTaskId INTEGER,
            agentVersion TEXT,
            alias TEXT,
            location TEXT,
            loggedUser TEXT,
            osName TEXT,
            osVersion TEXT,
            cpuModel TEXT,
            cpuCores INTEGER,
            totalMemory INTEGER,
            disks TEXT
          );
        `);

        // Tabla para almacenar los paquetes de software
        db.exec(`
            CREATE TABLE IF NOT EXISTS packages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                version TEXT,
                description TEXT,
                packageType TEXT NOT NULL,
                updateFilePath TEXT,
                localUpdateDir TEXT,
                installDir TEXT,
                serviceName TEXT,
                environmentPath TEXT,
                command TEXT,
                postInstallScript TEXT
            );
        `);

        // Tabla para almacenar las tareas de actualización
        db.exec(`
          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pcId TEXT NOT NULL,
            packageId INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, en_progreso, completado, error, cancelado
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (pcId) REFERENCES pcs(id) ON DELETE CASCADE,
            FOREIGN KEY (packageId) REFERENCES packages(id) ON DELETE CASCADE
          );
        `);

        // Tabla para almacenar los logs de cada paso de la actualización
        db.exec(`
          CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pcId TEXT NOT NULL,
            pcName TEXT NOT NULL,
            timestamp TEXT DEFAULT (datetime('now')),
            action TEXT NOT NULL,
            status TEXT NOT NULL, -- Éxito, Fallo, Omitido, Cancelado
            message TEXT,
            versionId TEXT
          );
        `);

        // Tabla para configuración general del sistema
        db.exec(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
          );
        `);

        // NUEVA TABLA: Para logs del sistema (INFO, WARN, ERROR)
        db.exec(`
          CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            details TEXT
          );
        `);


        // --- Migraciones de Estructura ---
        const packagesTableInfo = db.prepare("PRAGMA table_info(packages)").all();
        
        const postInstallScriptExists = packagesTableInfo.some(col => (col as any).name === 'postInstallScript');
        if (!postInstallScriptExists) {
            console.log("Añadiendo columna 'postInstallScript' a la tabla 'packages'...");
            db.exec('ALTER TABLE packages ADD COLUMN postInstallScript TEXT');
        }

        const versionExists = packagesTableInfo.some(col => (col as any).name === 'version');
        if (!versionExists) {
            console.log("Añadiendo columna 'version' a la tabla 'packages'...");
            db.exec('ALTER TABLE packages ADD COLUMN version TEXT');
        }
        
        // --- Corrección de la migración de la tabla 'tasks' para renombrar 'packageId' a 'packageId' ---
        const tasksTableInfo = db.prepare("PRAGMA table_info(tasks)").all();
        const oldColumnExists = tasksTableInfo.some(col => (col as any).name === 'packageId');

        if (oldColumnExists) {
            console.log("Renombrando columna 'packageId' a 'packageId' en la tabla 'tasks'...");
             db.exec('ALTER TABLE tasks RENAME COLUMN packageId TO packageId');
        }

    })();
    console.log("Migraciones de base de datos verificadas/ejecutadas correctamente.");
}


// Ejecutar las migraciones al iniciar la aplicación.
// Esto asegura que la estructura de la base de datos esté siempre presente.
runMigrations();

// --- NUEVAS FUNCIONES DE ACCESO A DATOS PARA SYSTEM_LOGS ---

/**
 * Adds a new log entry to the system_logs table.
 * @param entry The log entry to add, without id and timestamp.
 */
export async function addSystemLog(entry: Omit<SystemLogEntry, "id" | "timestamp">): Promise<void> {
    try {
        const newEntry = {
            ...entry,
            timestamp: new Date().toISOString(),
            details: entry.details ? JSON.stringify(entry.details) : null,
        };
        db.prepare('INSERT INTO system_logs (timestamp, type, message, details) VALUES (@timestamp, @type, @message, @details)').run(newEntry);
    } catch (error) {
        console.error("FATAL: Failed to add log to database", error);
        console.error("Original Log Message:", entry.message);
    }
}

/**
 * Retrieves system logs from the database based on specified filters.
 * @param filters Optional filters for log type, search term, and date range.
 * @returns A promise that resolves to an array of log entries.
 */
export async function getSystemLogs(filters: {type?: 'operational' | 'system' | 'all'; search?: string; dateRange?: DateRange;} = {}): Promise<SystemLogEntry[]> {
    try {
        let query = 'SELECT * FROM system_logs';
        const whereClauses: string[] = [];
        const params: any[] = [];
        
        if (filters.type && filters.type !== 'all') {
            if (filters.type === 'operational') {
                whereClauses.push("type = 'INFO'");
            } else if (filters.type === 'system') {
                whereClauses.push("type IN ('WARN', 'ERROR')");
            }
        }
        if (filters.search) {
            whereClauses.push("(message LIKE ? OR details LIKE ?)");
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }
        if (filters.dateRange?.from) {
             const fromDate = new Date(filters.dateRange.from);
             fromDate.setHours(0, 0, 0, 0);
             whereClauses.push("timestamp >= ?");
             params.push(fromDate.toISOString());
        }
        if (filters.dateRange?.to) {
            const toDate = new Date(filters.dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            whereClauses.push("timestamp <= ?");
            params.push(toDate.toISOString());
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        
        query += ' ORDER BY timestamp DESC LIMIT 500';

        const logs = db.prepare(query).all(...params) as SystemLogEntry[];
        return logs.map(log => ({...log, details: log.details ? JSON.parse(log.details) : null}));
    } catch (error) {
        console.error("Failed to get logs from database", error);
        return [];
    }
}

/**
 * Clears system logs from the database based on specified criteria.
 * @param clearedBy The name of the user clearing the logs.
 * @param type The type of logs to clear.
 * @param deleteAllTime If true, ignores the 30-day retention period.
 */
export async function clearSystemLogs(clearedBy: string, type: 'operational' | 'system' | 'all', deleteAllTime: boolean): Promise<void> {
    try {
        const auditLog: Omit<SystemLogEntry, "id" | "timestamp"> = { 
            type: 'WARN',
            message: `Limpieza de registros del sistema iniciada por ${clearedBy}`, 
            details: { type, deleteAllTime } 
        };

        let query = 'DELETE FROM system_logs';
        const whereClauses: string[] = [];
        const params: any[] = [];
        
        if (!deleteAllTime) {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            whereClauses.push("timestamp < ?");
            params.push(date.toISOString());
        }
        
        if (type !== 'all') {
            if (type === 'operational') {
                whereClauses.push("type = 'INFO'");
            } else if (type === 'system') {
                whereClauses.push("type IN ('WARN', 'ERROR')");
            }
        }
        
        if(whereClauses.length > 0){
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        db.prepare(query).run(...params);
        await addSystemLog(auditLog); // Add the audit log AFTER the delete operation.

    } catch (error) {
        console.error("Failed to clear system logs from database", error);
        await addSystemLog({ type: 'ERROR', message: `Fallo al limpiar registros del sistema por ${clearedBy}`, details: { error: (error as Error).message } });
    }
}
