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
import type { SystemConfig } from '@/lib/types';
import { Loader2, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  updateFilePath: z.string().min(1, 'La ruta del archivo es requerida.'),
  localUpdateDir: z.string().min(1, 'El directorio local es requerido.'),
  softlandInstallDir: z.string().min(1, 'El directorio de instalación es requerido.'),
  serviceName: z.string().min(1, 'El nombre del servicio es requerido.'),
  environmentPath: z.string().optional(),
});

interface ConfigFormProps {
  initialConfig: Omit<SystemConfig, 'adminUser' | 'adminPass'>;
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


export function ConfigForm({ initialConfig }: ConfigFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialConfig,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo guardar la configuración.');
      }

      toast({
        title: 'Configuración Guardada',
        description: 'Los parámetros del sistema se han actualizado correctamente.',
      });

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
            <CardTitle>Parámetros Generales</CardTitle>
            <CardDescription>Estos valores se usarán para cada ciclo de actualización.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="updateFilePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                        Ruta de archivo de actualización
                        <HelpTooltip>
                            Ruta de red completa (UNC Path) al archivo comprimido (.7z, .zip, etc.) que contiene la actualización de Softland. La cuenta de servicio del agente debe tener permisos de lectura a esta ruta. Ej: \\\\servidor\\updates\\update.7z
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="\\\\servidor\\updates\\update.7z" {...field} />
                    </FormControl>
                    <FormDescription>Ruta de red al archivo comprimido.</FormDescription>
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
                            Carpeta temporal en la PC cliente donde se extraerán los archivos de actualización antes de copiarlos a su destino final. Ej: C:\\Actualizacion
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="C:\\Actualizacion" {...field} />
                    </FormControl>
                    <FormDescription>Carpeta local temporal para la extracción.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="softlandInstallDir"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="flex items-center">
                        Directorio de instalación de Softland
                        <HelpTooltip>
                            Ruta local en la PC cliente donde está instalado Softland. Es la carpeta donde se sobrescribirán los archivos. Ej: C:\\SoftlandERP
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="C:\\SoftlandERP" {...field} />
                    </FormControl>
                    <FormDescription>Directorio raíz de la instalación de Softland.</FormDescription>
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
                            Lista de servicios de Windows que deben ser detenidos antes de la actualización para liberar archivos. Si son varios, sepáralos por comas. Ej: Servicio1,Servicio POS
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Servicio1,Servicio2" {...field} />
                    </FormControl>
                    <FormDescription>Servicios que se detendrán, separados por comas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-8 pt-4 border-t">
              <FormField
                  control={form.control}
                  name="environmentPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                          Rutas adicionales para variable de entorno PATH
                          <HelpTooltip>
                              Pegue aquí las rutas que desea añadir a la variable de entorno PATH del sistema en las PCs cliente. Separe cada ruta con un punto y coma (;). El agente se asegurará de que estas rutas existan y no las duplicará.
                          </HelpTooltip>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="C:\\Ruta1;C:\\Ruta2\\SubRuta" className="min-h-[120px] font-mono text-xs" {...field} />
                      </FormControl>
                      <FormDescription>Rutas a añadir a la variable PATH del sistema, separadas por punto y coma.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Configuración
              </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
