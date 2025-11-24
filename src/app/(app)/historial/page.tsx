import { PageHeader } from '@/components/page-header';
import { HistoryTable } from '@/components/historial/history-table';
import { logs } from '@/lib/data';

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
