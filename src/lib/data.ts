import type { SystemConfig } from './types';

// La configuración por defecto ahora se usará como fallback si no se encuentra en la base de datos
export const defaultConfig: Omit<SystemConfig, 'adminUser' | 'adminPass'> = {
    updateFilePath: '\\\\servidor\\actualizaciones\\softland_update_latest.7z',
    localUpdateDir: 'C:\\Actualizacion',
    softlandInstallDir: 'C:\\SoftlandERP',
    serviceName: 'Softland POS Sincronización',
    environmentPath: '',
};

export const LATEST_AGENT_VERSION = "1.2";
