'use client';
import { useEffect, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { LogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { FileText } from 'lucide-react';

interface HistoryTableProps {
  logs: LogEntry[];
}

function ClientFormattedDate({ dateString }: { dateString: string | null }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (dateString) {
      setFormattedDate(new Date(dateString).toLocaleString('es-ES'));
    }
  }, [dateString]);

  return <>{formattedDate || dateString}</>;
}


export function HistoryTable({ logs }: HistoryTableProps) {

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
                <FileText className="w-16 h-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No hay registros</h2>
                <p className="mt-2 text-muted-foreground">El historial de actualizaciones aparecerá aquí una vez que se realicen operaciones.</p>
            </div>
        );
    }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros Recientes</CardTitle>
        <CardDescription>Mostrando los últimos registros de actividad del sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>PC</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Mensaje</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map((log) => (
                <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.pcName}</TableCell>
                    <TableCell>
                      <ClientFormattedDate dateString={log.timestamp} />
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                    <Badge variant={log.status === 'Éxito' ? 'default' : 'destructive'} className={log.status === 'Éxito' ? 'bg-accent hover:bg-accent/90' : ''}>
                        {log.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.message}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
