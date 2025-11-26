import { db } from '@/lib/db';
import type { PC } from '@/lib/types';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive, Cpu, MemoryStick, Save, Info } from 'lucide-react';
import { HistoryTable } from '@/components/historial/history-table';

function getPc(id: string): PC | undefined {
    const stmt = db.prepare('SELECT * FROM pcs WHERE id = ?');
    return stmt.get(id) as PC | undefined;
}

function getLogsForPc(pcId: string) {
    const stmt = db.prepare('SELECT * FROM logs WHERE pcId = ? ORDER BY timestamp DESC LIMIT 20');
    return stmt.all(pcId) as any[];
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="text-muted-foreground mt-0.5">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}

function DiskInfo({ disksJson }: { disksJson: string | null }) {
    if (!disksJson) return <DetailItem icon={<Save className="w-5 h-5" />} label="Discos" value="No disponible" />;

    try {
        const disks = JSON.parse(disksJson);
        if (!Array.isArray(disks) || disks.length === 0) return null;

        return (
            <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5"><Save className="w-5 h-5" /></div>
                <div>
                    <p className="text-sm text-muted-foreground">Discos</p>
                    <ul className="font-medium space-y-1">
                        {disks.map((disk, index) => (
                            <li key={index} className="text-sm">
                                {disk.model} ({disk.size} GB)
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )

    } catch (e) {
        return <DetailItem icon={<Save className="w-5 h-5" />} label="Discos" value="Dato inválido" />;
    }
}

interface PcDetailPageProps {
  params: { id: string };
}

export default async function PcDetailPage({ params }: PcDetailPageProps) {
    const pc = getPc(params.id);
    const logs = getLogsForPc(params.id);

    if (!pc) {
        notFound();
    }

    return (
        <main className="flex flex-col h-full">
            <PageHeader
                title={pc.name}
                description={`Detalles e inventario del equipo ${pc.alias ? `(${pc.alias})` : ''}`}
            />
            <div className="flex-1 p-6 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Inventario de Hardware</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DetailItem icon={<Info className="w-5 h-5" />} label="Sistema Operativo" value={`${pc.osName || ''} ${pc.osVersion || ''}`} />
                        <DetailItem icon={<Cpu className="w-5 h-5" />} label="Procesador" value={pc.cpuModel} />
                        <DetailItem icon={<Cpu className="w-5 h-5" />} label="Núcleos de CPU" value={pc.cpuCores} />
                        <DetailItem icon={<MemoryStick className="w-5 h-5" />} label="Memoria RAM" value={pc.totalMemory ? `${pc.totalMemory} MB` : ''} />
                        <DiskInfo disksJson={pc.disks} />
                    </CardContent>
                </Card>

                <HistoryTable logs={logs} />
            </div>
        </main>
    );
}
