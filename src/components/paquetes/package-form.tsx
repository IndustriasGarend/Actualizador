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

const formSchema = z.object({
  name: z.string().min(1, 'El nombre del paquete es requerido.'),
  description: z.string().optional(),
  updateFilePath: z.string().min(1, 'La ruta del archivo es requerida.'),
  localUpdateDir: z.string().min(1, 'El directorio local es requerido.'),
  installDir: z.string().min(1, 'El directorio de instalación es requerido.'),
  serviceName: z.string().optional(),
  environmentPath: z.string().optional(),
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
        updateFilePath: initialPackage?.updateFilePath || '',
        localUpdateDir: initialPackage?.localUpdateDir || 'C:\\Temp\\Update',
        installDir: initialPackage?.installDir || '',
        serviceName: initialPackage?.serviceName || '',
        environmentPath: initialPackage?.environmentPath || '',
    },
  });

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
            <CardDescription>Estos valores definirán cómo se despliega este paquete de software.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Paquete</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Actualización Softland Verano 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
            />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <FormField
                control={form.control}
                name="updateFilePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                        Ruta de archivo de actualización
                        <HelpTooltip>
                            Ruta de red completa (UNC Path) al archivo comprimido (.7z, .zip, etc.) que contiene el software. La cuenta de servicio del agente debe tener permisos de lectura.
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="\\\\servidor\\updates\\update.7z" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="localUpdateDir"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="flex items-center">
                        Directorio de actualización local
                        <HelpTooltip>
                            Carpeta temporal en la PC cliente donde se extraerán los archivos antes de copiarlos a su destino final.
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="C:\\Temp\\Update" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="installDir"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="flex items-center">
                        Directorio de instalación/destino
                        <HelpTooltip>
                            Ruta local en la PC cliente donde se copiarán los archivos. Es la carpeta donde se sobrescribirán los archivos existentes.
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="C:\\SoftlandERP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceName"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="flex items-center">
                        Nombres de los servicios
                        <HelpTooltip>
                            (Opcional) Lista de servicios de Windows que deben ser detenidos antes de la actualización para liberar archivos. Si son varios, sepáralos por comas.
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Servicio1,Servicio POS" {...field} />
                    </FormControl>
                    <FormDescription>Servicios a detener, separados por comas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 pt-4 border-t">
              <FormField
                  control={form.control}
                  name="environmentPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                          Rutas adicionales para variable de entorno PATH
                          <HelpTooltip>
                              (Opcional) Pegue aquí las rutas que desea añadir a la variable de entorno PATH del sistema en las PCs cliente. Separe cada ruta con un punto y coma (;). El agente no añade rutas duplicadas.
                          </HelpTooltip>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="C:\\Ruta1;C:\\Ruta2\\SubRuta" className="min-h-[100px] font-mono text-xs" {...field} />
                      </FormControl>
                      <FormDescription>Rutas a añadir al PATH, separadas por punto y coma.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Paquete
              </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
