import type { PC, LogEntry, SystemConfig } from './types';

export const pcs: PC[] = [
  { id: 'pc-1', name: 'CAJA-01', ip: '192.168.1.101', status: 'Actualizado', lastUpdate: '2024-05-19T10:00:00Z' },
  { id: 'pc-2', name: 'CAJA-02', ip: '192.168.1.102', status: 'Pendiente', lastUpdate: '2024-05-10T14:30:00Z' },
  { id: 'pc-3', name: 'OFICINA-CONTABLE', ip: '192.168.1.50', status: 'Error', lastUpdate: '2024-05-18T11:00:00Z' },
  { id: 'pc-4', name: 'BODEGA', ip: '192.168.1.200', status: 'Pendiente', lastUpdate: null },
];

export const logs: LogEntry[] = [
    { id: 'log-1', pcName: 'CAJA-01', timestamp: '2024-05-19T10:05:00Z', action: 'Actualización completada', status: 'Éxito', message: 'Todos los módulos actualizados.' },
    { id: 'log-2', pcName: 'CAJA-01', timestamp: '2024-05-19T10:04:00Z', action: 'Registrando módulos', status: 'Éxito', message: 'Softland.RegistroModulos.v700.exe ejecutado.' },
    { id: 'log-3', pcName: 'OFICINA-CONTABLE', timestamp: '2024-05-18T11:02:00Z', action: 'Extrayendo archivos', status: 'Fallo', message: 'Acceso denegado a C:\\SoftlandERP\\sl.dll.' },
    { id: 'log-4', pcName: 'OFICINA-CONTABLE', timestamp: '2024-05-18T11:00:00Z', action: 'Inicio de actualización', status: 'Éxito', message: 'Iniciando proceso para OFICINA-CONTABLE.' },
];

export const defaultConfig: SystemConfig = {
    updateFilePath: '\\\\servidor\\actualizaciones\\softland_update_latest.7z',
    localUpdateDir: 'C:\\Actualizacion',
    softlandInstallDir: 'C:\\SoftlandERP',
    serviceName: 'Softland POS Sincronización',
    adminUser: 'administrador',
    adminPass: '',
};
