'use client';
/**
 * @fileoverview
 * Muestra una tabla con los registros de logs del sistema.
 * Es un componente reutilizable que puede mostrar todos los logs o los de una PC específica.
 */
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
import { FileText, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientFormattedDate } from '@/components/shared/client-formatted-date';

interface HistoryTableProps {
  logs: LogEntry[];
}

export function HistoryTable({ logs }: HistoryTableProps) {
    if (logs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Registros Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
                        <FileText className="w-16 h-16 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-semibold">No hay registros</h2>
                        <p className="mt-2 text-muted-foreground">El historial de actualizaciones aparecerá aquí una vez que se realicen operaciones.</p>
                    </div>
                </CardContent>
            </Card>
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
                <TableHead>Mensaje / Versión</TableHead>
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
                    <Badge variant={
                        log.status === 'Éxito' ? 'default' : 
                        log.status === 'Omitido' ? 'secondary' :
                        'destructive'
                    } className={cn(
                        log.status === 'Éxito' && 'bg-accent hover:bg-accent/90',
                    )}>
                        {log.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                        {log.message}
                        {log.versionId && (
                            <div className="flex items-center gap-1.5 text-xs pt-1">
                                <GitBranch className="w-3 h-3" />
                                <span>{log.versionId}</span>
                            </div>
                        )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
