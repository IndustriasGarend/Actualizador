import Database from 'better-sqlite3';
import path from 'path';

// La base de datos ahora siempre será un archivo físico para consistencia entre desarrollo y producción.
const dbPath = path.join(process.cwd(), 'softland-updater.db');

export const db = new Database(dbPath);

console.log(`Base de datos SQLite conectada en: ${dbPath}`);

// -- Creación de Tablas --

// Habilitar claves foráneas
db.exec('PRAGMA foreign_keys = ON;');

// Verificar si las tablas ya existen antes de intentar crearlas o poblarlas
const tableCheckStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'");
const tablesExist = !!tableCheckStmt.get();

if (!tablesExist) {
    console.log('Creando esquema de base de datos por primera vez...');
    
    // Tabla para almacenar la configuración del sistema como pares clave-valor
    db.exec(`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

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

    // Tabla para almacenar las tareas de actualización
    db.exec(`
      CREATE TABLE tasks (
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

    // -- Datos Iniciales (Solo para la primera vez que se crea la DB) --
    console.log('Poblando base de datos con datos de demostración...');
    
    const pcs = [
        { id: 'pc-1', name: 'CAJA-01', ip: '192.168.1.101', status: 'Actualizado', lastUpdate: '2024-05-19T10:00:00Z', versionId: '2024.05.18', currentTaskId: null, agentVersion: "1.1", alias: 'Juan Pérez', location: 'Tienda Principal', loggedUser: 'jperez', osName: 'Microsoft Windows 10 Pro', osVersion: '10.0.19045', cpuModel: 'Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz', cpuCores: 8, totalMemory: 16384, disks: '[{"model": "Samsung SSD 970 EVO Plus 500GB", "size": 500}]' },
        { id: 'pc-2', name: 'CAJA-02', ip: '192.168.1.102', status: 'Pendiente', lastUpdate: '2024-05-10T14:30:00Z', versionId: '2024.05.10', currentTaskId: null, agentVersion: "1.0", alias: 'Ana Gómez', location: 'Tienda Principal', loggedUser: 'agomez', osName: 'Microsoft Windows 10 Pro', osVersion: '10.0.19045', cpuModel: 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz', cpuCores: 12, totalMemory: 32768, disks: '[{"model": "WDC PC SN730 SDBPNTY-1T00-1002", "size": 1024}]' },
        { id: 'pc-3', name: 'OFICINA-CONTABLE', ip: '192.168.1.50', status: 'Error', lastUpdate: '2024-05-18T11:00:00Z', versionId: '2024.05.10', currentTaskId: null, agentVersion: "1.1", alias: 'Contabilidad', location: 'Oficinas Centrales', loggedUser: null, osName: 'Microsoft Windows 11 Home', osVersion: '10.0.22621', cpuModel: 'AMD Ryzen 5 5600X 6-Core Processor', cpuCores: 12, totalMemory: 16384, disks: '[{"model": "Crucial CT500P2SSD8", "size": 500}, {"model": "ST1000DM010-2EP102", "size": 1000}]' },
        { id: 'pc-4', name: 'BODEGA', ip: '192.168.1.200', status: 'Deshabilitado', lastUpdate: null, versionId: null, currentTaskId: null, agentVersion: null, alias: 'Carlos Ruiz', location: 'Bodega Central', loggedUser: null, osName: null, osVersion: null, cpuModel: null, cpuCores: null, totalMemory: null, disks: null },
    ];

    const logs = [
        { id: 1, pcId: 'pc-1', pcName: 'CAJA-01', timestamp: '2024-05-19T10:05:00Z', action: 'Actualización completada', status: 'Éxito', message: 'Todos los módulos actualizados.', versionId: '2024.05.18' },
        { id: 2, pcId: 'pc-1', pcName: 'CAJA-01', timestamp: '2024-05-19T10:04:00Z', action: 'Configurando nuevos componentes', status: 'Éxito', message: 'ERPReg.xml procesado.', versionId: null },
        { id: 3, pcId: 'pc-3', pcName: 'OFICINA-CONTABLE', timestamp: '2024-05-18T11:02:00Z', action: 'Extrayendo archivos', status: 'Fallo', message: 'Acceso denegado a C:\\SoftlandERP\\sl.dll.', versionId: null },
        { id: 4, pcId: 'pc-3', pcName: 'OFICINA-CONTABLE', timestamp: '2024-05-18T11:00:00Z', action: 'Inicio de actualización', status: 'Éxito', message: 'Iniciando proceso para OFICINA-CONTABLE.', versionId: null },
    ];
    
    const insertPc = db.prepare('INSERT INTO pcs (id, name, ip, status, lastUpdate, versionId, currentTaskId, agentVersion, alias, location, loggedUser, osName, osVersion, cpuModel, cpuCores, totalMemory, disks) VALUES (@id, @name, @ip, @status, @lastUpdate, @versionId, @currentTaskId, @agentVersion, @alias, @location, @loggedUser, @osName, @osVersion, @cpuModel, @cpuCores, @totalMemory, @disks)');
    const insertLog = db.prepare('INSERT INTO logs (id, pcId, pcName, timestamp, action, status, message, versionId) VALUES (@id, @pcId, @pcName, @timestamp, @action, @status, @message, @versionId)');

    const insertManyPcs = db.transaction((items) => {
        for (const item of items) insertPc.run(item);
    });

    const insertManyLogs = db.transaction((items) => {
        for (const item of items) insertLog.run(item);
    });

    insertManyPcs(pcs);
    insertManyLogs(logs);
}
