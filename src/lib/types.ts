export type PCStatus = 'Actualizado' | 'Pendiente' | 'En progreso' | 'Error';

export interface PC {
  id: string;
  name: string;
  ip: string;
  status: PCStatus;
  lastUpdate: string | null;
}

export type UpdateStatus = 'pending' | 'running' | 'success' | 'error';

export interface UpdateStep {
  name: string;
  status: UpdateStatus;
  error?: string;
}

export interface LogEntry {
  id: string;
  pcName: string;
  timestamp: string;
  action: string;
  status: 'Éxito' | 'Fallo';
  message: string;
}

export interface SystemConfig {
    updateFilePath: string;
    localUpdateDir: string;
    softlandInstallDir: string;
    serviceName: string;
    adminUser: string;
    adminPass: string;
}
