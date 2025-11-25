import Database from 'better-sqlite3';
import path from 'path';

// La base de datos ahora siempre será un archivo físico para consistencia entre desarrollo y producción.
const dbPath = path.join(process.cwd(), 'softland-updater.db');

export const db = new Database(dbPath);

console.log(`Base de datos SQLite conectada en: ${dbPath}`);

function runMigrations() {
    db.exec('PRAGMA user_version;');
    const userVersion = (db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version;

    if (userVersion < 1) {
        console.log('Ejecutando migración inicial a v1...');
        
        db.transaction(() => {
            // Habilitar claves foráneas
            db.exec('PRAGMA foreign_keys = ON;');

            // Tabla para almacenar la información de las PCs
            db.exec(`
              CREATE TABLE pcs (
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
                CREATE TABLE packages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    updateFilePath TEXT NOT NULL,
                    localUpdateDir TEXT NOT NULL,
                    installDir TEXT NOT NULL,
                    serviceName TEXT,
                    environmentPath TEXT
                );
            `);
            
            // Insertar un paquete de ejemplo
            db.exec(`
                INSERT INTO packages (name, description, updateFilePath, localUpdateDir, installDir, serviceName, environmentPath) 
                VALUES (
                    'Actualización de Softland', 
                    'Paquete de actualización estándar para Softland ERP.',
                    '\\\\servidor\\actualizaciones\\softland_update.7z',
                    'C:\\Temp\\Update',
                    'C:\\SoftlandERP',
                    'Softland POS Sincronización',
                    ''
                );
            `);

            // Tabla para almacenar las tareas de actualización
            db.exec(`
              CREATE TABLE tasks (
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
              CREATE TABLE logs (
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
            
            db.exec('PRAGMA user_version = 1;');
            console.log('Base de datos migrada a v1.');
        })();
    }
}


// Verificar si las tablas ya existen antes de intentar crearlas o poblarlas
const tableCheckStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pcs'");
const tablesExist = !!tableCheckStmt.get();

if (!tablesExist) {
    console.log('Creando esquema de base de datos por primera vez...');
    runMigrations();
} else {
    // Para futuras migraciones.
    runMigrations();
}
