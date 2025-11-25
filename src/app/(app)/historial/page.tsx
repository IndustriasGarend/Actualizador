import { PageHeader } from '@/components/page-header';
import { HistoryTable } from '@/components/historial/history-table';
import type { LogEntry } from '@/lib/types';
import { db } from '@/lib/db';

// Ahora, los datos se obtienen de la base de datos SQLite.
function getLogs(): LogEntry[] {
  try {
    const stmt = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC');
    return stmt.all() as LogEntry[];
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return [];
  }
}

export default async function HistorialPage() {
  const logs = getLogs();
  
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
