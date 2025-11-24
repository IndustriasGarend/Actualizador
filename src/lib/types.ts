export type PCStatus = 'Actualizado' | 'Pendiente' | 'En progreso' | 'Error' | 'Omitido';

export interface PC {
  id: string;
  name: string;
  ip: string;
  status: PCStatus;
  lastUpdate: string | null;
  versionId: string | null;
}

export type UpdateStatus = 'pending' | 'running' | 'success' | 'error';

export interface UpdateStep {
  name: string;
  status: UpdateStatus;
  error?: string;
}

export interface LogEntry {
  id: number;
  pcId: string;
  pcName: string;
  timestamp: string;
  action: string;
  status: 'Éxito' | 'Fallo' | 'Omitido';
  message: string;
  versionId?: string | null;
}

export interface SystemConfig {
    updateFilePath: string;
    localUpdateDir: string;
    softlandInstallDir: string;
    serviceName: string;
    adminUser: string;
    adminPass: string;
}
