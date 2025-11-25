'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Package } from '@/lib/types';
import { Loader2, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  description: z.string().optional(),
  packageType: z.enum(['actualizacion_archivos', 'ejecutar_script', 'comando_powershell'], {
    required_error: "Debe seleccionar un tipo de paquete.",
  }),
  // Campos condicionales
  updateFilePath: z.string().optional(),
  localUpdateDir: z.string().optional(),
  installDir: z.string().optional(),
  serviceName: z.string().optional(),
  environmentPath: z.string().optional(),
  command: z.string().optional(),
  postInstallScript: z.string().optional(),
}).refine(data => {
    if (data.packageType === 'actualizacion_archivos') {
        return !!data.updateFilePath && !!data.installDir;
    }
    return true;
}, {
    message: 'La ruta del archivo y el directorio de instalación son requeridos para este tipo de paquete.',
    path: ['installDir'],
}).refine(data => {
    if (data.packageType === 'ejecutar_script') {
        return !!data.updateFilePath;
    }
    return true;
}, {
    message: 'La ruta del archivo es requerida.',
    path: ['updateFilePath'],
}).refine(data => {
    if (data.packageType === 'comando_powershell') {
        return !!data.command;
    }
    return true;
}, {
    message: 'El comando es requerido.',
    path: ['command'],
});


interface PackageFormProps {
  initialPackage?: Package;
}

const HelpTooltip = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
                <p className="max-w-xs">{children}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);


export function PackageForm({ initialPackage }: PackageFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const isNew = !initialPackage;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: initialPackage?.name || '',
        description: initialPackage?.description || '',
        packageType: initialPackage?.packageType || undefined,
        updateFilePath: initialPackage?.updateFilePath || '',
        localUpdateDir: initialPackage?.localUpdateDir || 'C:\\Temp\\Update',
        installDir: initialPackage?.installDir || '',
        serviceName: initialPackage?.serviceName || '',
        environmentPath: initialPackage?.environmentPath || '',
        command: initialPackage?.command || '',
        postInstallScript: initialPackage?.postInstallScript || '',
    },
  });

  const packageType = form.watch('packageType');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      const url = isNew ? '/api/packages' : `/api/packages/${initialPackage.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo guardar el paquete.');
      }

      toast({
        title: 'Paquete Guardado',
        description: 'El paquete se ha guardado correctamente en el catálogo.',
      });

      router.push('/paquetes');
      router.refresh();

    } catch (error) {
       toast({
        title: 'Error al Guardar',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Información del Paquete</CardTitle>
            <CardDescription>Defina un nuevo paquete de software, actualización o comando para su catálogo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre del Paquete</FormLabel>
                        <FormControl>
                        <Input placeholder="Ej: Actualización Verano 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="packageType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Paquete</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un tipo de ejecución" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="actualizacion_archivos">Actualización de Archivos (copiar y pegar)</SelectItem>
                                    <SelectItem value="ejecutar_script">Ejecutar Script (.bat, .ps1)</SelectItem>
                                    <SelectItem value="comando_powershell">Comando PowerShell (ej. winget)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
             <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe brevemente el propósito de este paquete..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
            />

            {packageType && (
                <div className="space-y-6 pt-6 mt-6 border-t">
                    {packageType === 'actualizacion_archivos' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h3 className="text-lg font-medium text-primary">Parámetros de Actualización de Archivos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="updateFilePath" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center">Ruta de archivo comprimido<HelpTooltip>Ruta de red (UNC) al archivo .zip o .7z.</HelpTooltip></FormLabel>
                                        <FormControl><Input placeholder="\\\\servidor\\updates\\update.7z" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="installDir" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center">Directorio de instalación/destino<HelpTooltip>Carpeta en la PC cliente donde se copiarán los archivos.</HelpTooltip></FormLabel>
                                        <FormControl><Input placeholder="C:\\SoftlandERP" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="localUpdateDir" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center">Directorio de actualización local<HelpTooltip>Carpeta temporal en la PC cliente para extraer archivos.</HelpTooltip></FormLabel>
                                        <FormControl><Input placeholder="C:\\Temp\\Update" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="serviceName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center">Nombres de servicios a detener<HelpTooltip>(Opcional) Lista de servicios de Windows a detener, separados por comas.</HelpTooltip></FormLabel>
                                        <FormControl><Input placeholder="Servicio1,Servicio POS" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="environmentPath" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center">Rutas para variable de entorno PATH<HelpTooltip>(Opcional) Rutas a añadir al PATH del sistema, separadas por punto y coma (;).</HelpTooltip></FormLabel>
                                    <FormControl><Textarea placeholder="C:\\Ruta1;C:\\Ruta2" className="min-h-[100px] font-mono text-xs" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {packageType === 'ejecutar_script' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h3 className="text-lg font-medium text-primary">Parámetros de Ejecución de Script</h3>
                            <FormField control={form.control} name="updateFilePath" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center">Ruta de red del script<HelpTooltip>Ruta de red completa (UNC) al archivo .bat o .ps1 que se ejecutará en la PC cliente.</HelpTooltip></FormLabel>
                                    <FormControl><Input placeholder="\\\\servidor\\scripts\\instalar_programa.bat" {...field} /></FormControl>
                                    <FormDescription>El agente descargará y ejecutará este script.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {packageType === 'comando_powershell' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h3 className="text-lg font-medium text-primary">Parámetros de Comando PowerShell</h3>
                            <FormField control={form.control} name="command" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center">Comando a ejecutar<HelpTooltip>El comando exacto que se ejecutará en una terminal de PowerShell en la PC cliente.</HelpTooltip></FormLabel>
                                    <FormControl><Textarea placeholder="winget upgrade --all --accept-package-agreements" className="min-h-[120px] font-mono text-sm" {...field} /></FormControl>
                                    <FormDescription>Ejemplos: `winget install Google.Chrome`, `gpupdate /force`.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {(packageType === 'actualizacion_archivos' || packageType === 'ejecutar_script') && (
                        <>
                            <Separator />
                            <div className="space-y-6 animate-in fade-in">
                                <h3 className="text-lg font-medium">Script Post-Ejecución (Opcional)</h3>
                                 <FormField control={form.control} name="postInstallScript" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center">Script de PowerShell<HelpTooltip>Este script se ejecutará DESPUÉS de que la tarea principal (copiar archivos o ejecutar script) se complete con éxito.</HelpTooltip></FormLabel>
                                        <FormControl>
                                          <Textarea 
                                            placeholder={`# Ejemplo para registrar componentes:
# $ErrorActionPreference = "Stop"
# regsvr32.exe /s C:\\SoftlandERP\\componente1.dll
# & "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\RegAsm.exe" "C:\\SoftlandERP\\componente2.dll" /codebase /tlb`}
                                            className="min-h-[200px] font-mono text-sm" 
                                            {...field} />
                                        </FormControl>
                                        <FormDescription>Úsalo para tareas de limpieza, registro de componentes, iniciar servicios, etc.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </>
                    )}
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !packageType}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Paquete
              </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
