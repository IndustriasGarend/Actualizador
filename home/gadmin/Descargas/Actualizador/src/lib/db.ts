import Database from 'better-sqlite3';
import path from 'path';

// La base de datos ahora siempre será un archivo físico para consistencia entre desarrollo y producción.
const dbPath = path.join(process.cwd(), 'softland-updater.db');

export const db = new Database(dbPath);

console.log(`Base de datos SQLite conectada en: ${dbPath}`);

// --- Inicialización del Esquema de la Base de Datos ---

function initializeDb() {
    // Habilitar claves foráneas
    db.exec('PRAGMA foreign_keys = ON;');

    // Crear las tablas solo si no existen.
    // Usamos una transacción para asegurar que todo se cree de una sola vez.
    const setupTransaction = db.transaction(() => {
        // Tabla para almacenar la configuración del sistema como pares clave-valor
        db.exec(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
          );
        `);

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

        // Tabla para almacenar las tareas de actualización
        db.exec(`
          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pcId TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, en_progreso, completado, error, cancelado
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (pcId) REFERENCES pcs(id) ON DELETE CASCADE
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
            versionId TEXT,
            FOREIGN KEY (pcId) REFERENCES pcs(id) ON DELETE CASCADE
          );
        `);
    });
    
    // Ejecutar la transacción de configuración
    setupTransaction();
}

// Ejecutar la inicialización
initializeDb();
