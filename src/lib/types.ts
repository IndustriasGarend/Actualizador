export type PCStatus = 'Actualizado' | 'Pendiente' | 'En progreso' | 'Error' | 'Omitido' | 'Cancelado' | 'Deshabilitado';

export interface PC {
  id: string;
  name: string;
  ip: string | null;
  status: PCStatus;
  lastUpdate: string | null;
  versionId: string | null;
  currentTaskId: number | null;
  agentVersion: string | null;
  alias: string | null;
  location: string | null;
  loggedUser: string | null;
  osName: string | null;
  osVersion: string | null;
  cpuModel: string | null;
  cpuCores: number | null;
  totalMemory: number | null;
  disks: string | null; // JSON string para simplicidad
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
  status: 'Éxito' | 'Fallo' | 'Omitido' | 'Cancelado';
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
    environmentPath: string;
}
