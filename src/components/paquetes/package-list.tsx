'use client';

import { useState } from 'react';
import type { Package } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Package as PackageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from '../ui/button';
import { useRouter } from 'next/navigation';


interface PackageListProps {
  packages: Package[];
}

export function PackageList({ packages: initialPackages }: PackageListProps) {
    const router = useRouter();
    const [packages, setPackages] = useState(initialPackages);
    const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
    
    const handleDelete = async () => {
        if (!packageToDelete) return;
        try {
            const response = await fetch(`/api/packages/${packageToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo eliminar el paquete.');
            }
            setPackages(packages.filter(p => p.id !== packageToDelete.id));
            toast({
                title: "Paquete Eliminado",
                description: `El paquete "${packageToDelete.name}" ha sido eliminado.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: 'destructive',
            });
        } finally {
            setPackageToDelete(null);
        }
    };

    if (packages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
                <PackageIcon className="w-16 h-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No hay paquetes</h2>
                <p className="mt-2 text-muted-foreground">Cree su primer paquete de software para empezar a desplegarlo en sus equipos.</p>
            </div>
        );
    }
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Catálogo de Software</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Ruta del Archivo</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packages.map((pkg) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium">{pkg.name}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-sm truncate">{pkg.description}</TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-xs">{pkg.updateFilePath}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/paquetes/${pkg.id}`)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setPackageToDelete(pkg)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
             <AlertDialog open={packageToDelete !== null} onOpenChange={() => setPackageToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que deseas eliminar este paquete?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el paquete <span className="font-bold">{packageToDelete?.name}</span>. Las tareas asociadas a este paquete podrían fallar.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: "destructive" })}>
                    Sí, eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
