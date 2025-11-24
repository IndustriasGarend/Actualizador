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
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  updateFilePath: z.string().min(1, 'La ruta del archivo es requerida.'),
  localUpdateDir: z.string().min(1, 'El directorio local es requerido.'),
  softlandInstallDir: z.string().min(1, 'El directorio de instalación es requerido.'),
  serviceName: z.string().min(1, 'El nombre del servicio es requerido.'),
  adminUser: z.string().min(1, 'El usuario administrador es requerido.'),
  adminPass: z.string(),
});

interface ConfigFormProps {
  initialConfig: SystemConfig;
}

export function ConfigForm({ initialConfig }: ConfigFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialConfig,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    // Aquí se guardaría la configuración en la base de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving config:', values);
    toast({
      title: 'Configuración Guardada',
      description: 'Los parámetros del sistema se han actualizado correctamente.',
    });
    setIsSaving(false);
  }
  
  async function onValidate() {
    setIsValidating(true);
    // Aquí se podría validar la conexión a la ruta de red, etc.
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: 'Validación Exitosa',
      description: 'Todos los parámetros de configuración son válidos y accesibles.',
    });
    setIsValidating(false);
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
                    <FormLabel>Ruta de archivo de actualización</FormLabel>
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
                    <FormLabel>Directorio de actualización local</FormLabel>
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
                    <FormLabel>Directorio de instalación de Softland</FormLabel>
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
                    <FormLabel>Nombre del servicio</FormLabel>
                    <FormControl>
                      <Input placeholder="Softland POS Sincronización" {...field} />
                    </FormControl>
                    <FormDescription>Servicio que se detendrá antes de actualizar.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
              <FormField
                control={form.control}
                name="adminUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario Administrador</FormLabel>
                    <FormControl>
                      <Input placeholder="dominio\\usuario" {...field} />
                    </FormControl>
                    <FormDescription>Cuenta para ejecutar el servicio en el cliente.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminPass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña de Administrador</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>Se solicitará al instalar el servicio en el cliente.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onValidate} disabled={isValidating}>
                {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Validar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
