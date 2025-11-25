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
import { Loader2, HelpCircle, Server } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  serverUrl: z.string().url({ message: 'Debe ser una URL válida (ej. http://192.168.1.100:9002).' }).optional().or(z.literal('')),
});

interface ConfigFormProps {
  initialConfig: Partial<SystemConfig>;
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
    defaultValues: {
      serverUrl: initialConfig.serverUrl || ''
    },
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
             <div className="flex items-center gap-3">
                <Server className="w-7 h-7 text-primary" />
                <div>
                    <CardTitle>Configuración General del Servidor</CardTitle>
                    <CardDescription>Parámetros que afectan el comportamiento global del sistema.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
              <FormField
                control={form.control}
                name="serverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                        URL Canónica del Servidor
                        <HelpTooltip>
                            Esta es la URL que los agentes usarán para comunicarse con este servidor. Si se deja en blanco, el sistema intentará detectarla automáticamente. Defina una URL aquí si los agentes están en una red diferente o si usa un proxy inverso.
                        </HelpTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: http://192.168.1.100:9002" {...field} />
                    </FormControl>
                    <FormDescription>La dirección base que los agentes usarán para conectarse. Déjelo en blanco para detección automática.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
