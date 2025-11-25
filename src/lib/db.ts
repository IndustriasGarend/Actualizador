
import Database from 'better-sqlite3';
import path from 'path';

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
            versionId TEXT,
            FOREIGN KEY (pcId) REFERENCES pcs(id) ON DELETE CASCADE
          );
        `);

        // Tabla para configuración general del sistema
        db.exec(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
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

    })();
    console.log("Migraciones de base de datos verificadas/ejecutadas correctamente.");
}


// Ejecutar las migraciones al iniciar la aplicación.
// Esto asegura que la estructura de la base de datos esté siempre presente.
runMigrations();

    
