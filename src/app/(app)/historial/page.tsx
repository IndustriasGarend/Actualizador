import { PageHeader } from '@/components/page-header';
import { HistoryTable } from '@/components/historial/history-table';
import type { LogEntry } from '@/lib/types';

// En un futuro, estos datos vendrán de la base de datos.
const logs: LogEntry[] = [
    { id: 'log-1', pcName: 'CAJA-01', timestamp: '2024-05-19T10:05:00Z', action: 'Actualización completada', status: 'Éxito', message: 'Todos los módulos actualizados.' },
    { id: 'log-2', pcName: 'CAJA-01', timestamp: '2024-05-19T10:04:00Z', action: 'Registrando módulos', status: 'Éxito', message: 'Softland.RegistroModulos.v700.exe ejecutado.' },
    { id: 'log-3', pcName: 'OFICINA-CONTABLE', timestamp: '2024-05-18T11:02:00Z', action: 'Extrayendo archivos', status: 'Fallo', message: 'Acceso denegado a C:\\SoftlandERP\\sl.dll.' },
    { id: 'log-4', pcName: 'OFICINA-CONTABLE', timestamp: '2024-05-18T11:00:00Z', action: 'Inicio de actualización', status: 'Éxito', message: 'Iniciando proceso para OFICINA-CONTABLE.' },
];

export default function HistorialPage() {
  return (
    <main className="flex flex-col h-full">
      <PageHeader
        title="Historial de Actualizaciones"
        description="Registro detallado de todas las operaciones realizadas por el sistema."
      />
      <div className="flex-1 p-6">
        <HistoryTable logs={logs} />
      </div>
    </main>
  );
}
