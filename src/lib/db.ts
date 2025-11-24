import Database from 'better-sqlite3';
import path from 'path';

// Determina la ruta de la base de datos.
// En producción, se usará una ruta persistente. En desarrollo, una en memoria para facilitar las pruebas.
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'softland-updater.db') 
  : ':memory:';

export const db = new Database(dbPath);

console.log(`Base de datos SQLite conectada en: ${dbPath}`);

// -- Creación de Tablas --

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
    location TEXT
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

// Habilitar claves foráneas
db.exec('PRAGMA foreign_keys = ON;');


// -- Datos Iniciales (Solo para desarrollo/demostración) --
if (process.env.NODE_ENV !== 'production') {
    // Limpiar tablas para un estado limpio en cada reinicio en desarrollo
    db.exec('DELETE FROM logs');
    db.exec('DELETE FROM tasks');
    db.exec('DELETE FROM pcs');

    const pcs = [
        { id: 'pc-1', name: 'CAJA-01', ip: '192.168.1.101', status: 'Actualizado', lastUpdate: '2024-05-19T10:00:00Z', versionId: '2024.05.18', currentTaskId: null, agentVersion: "1.0", alias: 'Juan Pérez', location: 'Tienda Principal' },
        { id: 'pc-2', name: 'CAJA-02', ip: '192.168.1.102', status: 'Pendiente', lastUpdate: '2024-05-10T14:30:00Z', versionId: '2024.05.10', currentTaskId: null, agentVersion: "0.9", alias: 'Ana Gómez', location: 'Tienda Principal' },
        { id: 'pc-3', name: 'OFICINA-CONTABLE', ip: '192.168.1.50', status: 'Error', lastUpdate: '2024-05-18T11:00:00Z', versionId: '2024.05.10', currentTaskId: null, agentVersion: "1.0", alias: 'Contabilidad', location: 'Oficinas Centrales' },
        { id: 'pc-4', name: 'BODEGA', ip: '192.168.1.200', status: 'Deshabilitado', lastUpdate: null, versionId: null, currentTaskId: null, agentVersion: null, alias: 'Carlos Ruiz', location: 'Bodega Central' },
    ];

    const logs = [
        { id: 1, pcId: 'pc-1', pcName: 'CAJA-01', timestamp: '2024-05-19T10:05:00Z', action: 'Actualización completada', status: 'Éxito', message: 'Todos los módulos actualizados.', versionId: '2024.05.18' },
        { id: 2, pcId: 'pc-1', pcName: 'CAJA-01', timestamp: '2024-05-19T10:04:00Z', action: 'Registrando módulos', status: 'Éxito', message: 'Softland.RegistroModulos.v700.exe ejecutado.', versionId: null },
        { id: 3, pcId: 'pc-3', pcName: 'OFICINA-CONTABLE', timestamp: '2024-05-18T11:02:00Z', action: 'Extrayendo archivos', status: 'Fallo', message: 'Acceso denegado a C:\\SoftlandERP\\sl.dll.', versionId: null },
        { id: 4, pcId: 'pc-3', pcName: 'OFICINA-CONTABLE', timestamp: '2024-05-18T11:00:00Z', action: 'Inicio de actualización', status: 'Éxito', message: 'Iniciando proceso para OFICINA-CONTABLE.', versionId: null },
    ];
    
    const insertPc = db.prepare('INSERT OR IGNORE INTO pcs (id, name, ip, status, lastUpdate, versionId, currentTaskId, agentVersion, alias, location) VALUES (@id, @name, @ip, @status, @lastUpdate, @versionId, @currentTaskId, @agentVersion, @alias, @location)');
    const insertLog = db.prepare('INSERT OR IGNORE INTO logs (id, pcId, pcName, timestamp, action, status, message, versionId) VALUES (@id, @pcId, @pcName, @timestamp, @action, @status, @message, @versionId)');

    const insertManyPcs = db.transaction((items) => {
        for (const item of items) insertPc.run(item);
    });

    const insertManyLogs = db.transaction((items) => {
        for (const item of items) insertLog.run(item);
    });

    insertManyPcs(pcs);
    insertManyLogs(logs);

    console.log('Base de datos populada con datos de demostración.');
}
