"use client";

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Laptop,
  User,
  MapPin,
  RefreshCcw,
  GitBranch,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  PackageCheck,
  ChevronDown,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import type { PC, Package } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ClientFormattedDate } from '@/components/shared/client-formatted-date';
import { LATEST_AGENT_VERSION } from '@/lib/data';

interface PcCardProps {
  pc: PC;
  packages: Package[];
  highlight: 'none' | 'match' | 'mismatch';
  onUpdateClick: (packageId: number) => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onToggleStatus: () => void;
}

const getStatusStyles = (status: PC['status']) => {
  switch (status) {
    case 'Actualizado':
      return 'bg-accent text-accent-foreground';
    case 'Pendiente':
      return 'bg-secondary text-secondary-foreground';
    case 'En progreso':
      return 'bg-primary/80 text-primary-foreground animate-pulse';
    case 'Error':
      return 'bg-destructive text-destructive-foreground';
    case 'Cancelado':
      return 'bg-yellow-500 text-white';
    case 'Deshabilitado':
      return 'bg-slate-500 text-white';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const InfoItem = ({
  icon,
  text,
  className,
}: {
  icon: React.ReactNode;
  text: string | null | undefined;
  className?: string;
}) => {
  if (!text) return null;
  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {icon}
      <span className="truncate">{text}</span>
    </div>
  );
};

export function PcCard({
  pc,
  packages,
  highlight,
  onUpdateClick,
  onEditClick,
  onDeleteClick,
  onToggleStatus,
}: PcCardProps) {
  const isAgentOutdated = pc.agentVersion && pc.agentVersion !== LATEST_AGENT_VERSION;
  const isDisabled = pc.status === 'En progreso' || pc.status === 'Deshabilitado';

  const highlightStyles = {
    match: 'border-green-500 border-2 shadow-lg',
    mismatch: 'border-yellow-500 border-2 shadow-lg',
    none: '',
  };

  return (
    <Card className={cn('flex flex-col transition-all', highlightStyles[highlight])}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className='flex-1 min-w-0'>
          <CardTitle className="text-xl truncate">
            <Link href={`/pcs/${pc.id}`} className="hover:underline">
              {pc.name}
            </Link>
          </CardTitle>
          <CardDescription>
            <ClientFormattedDate dateString={pc.lastUpdate} />
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {highlight === 'match' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {highlight === 'mismatch' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          <Badge className={cn('text-xs', getStatusStyles(pc.status))}>
            {pc.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditClick}>
                <Edit />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleStatus}>
                {pc.status === 'Deshabilitado' ? (
                  <ToggleRight />
                ) : (
                  <ToggleLeft />
                )}
                {pc.status === 'Deshabilitado' ? 'Habilitar' : 'Deshabilitar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDeleteClick} className="text-destructive">
                <Trash2 />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-muted-foreground">
        <InfoItem icon={<Laptop className="h-4 w-4" />} text={pc.alias} />
        <InfoItem icon={<MapPin className="h-4 w-4" />} text={pc.location} />
        <InfoItem icon={<User className="h-4 w-4" />} text={pc.loggedUser} />
        <InfoItem icon={<GitBranch className="h-4 w-4" />} text={pc.versionId} />
        <InfoItem
          icon={<RefreshCcw className="h-4 w-4" />}
          text={pc.agentVersion}
          className={cn(isAgentOutdated && 'font-bold text-destructive')}
        />
      </CardContent>
      <CardFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full" disabled={isDisabled}>
              <PackageCheck className="mr-2 h-4 w-4" />
              Actualizar / Instalar
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Seleccione un paquete</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {packages.map((pkg) => (
                <DropdownMenuItem key={pkg.id} onSelect={() => onUpdateClick(pkg.id)}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  <span>{pkg.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
