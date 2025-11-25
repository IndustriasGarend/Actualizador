'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { PC } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface EditPcModalProps {
  pc: PC;
  onClose: () => void;
  onSave: (updatedPc: PC) => void;
}

const formSchema = z.object({
  alias: z.string().optional(),
  location: z.string().optional(),
});

export function EditPcModal({ pc, onClose, onSave }: EditPcModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alias: pc.alias || '',
      location: pc.location || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/pcs/${pc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo guardar los cambios.');
      }
      
      const updatedPc = await response.json();

      toast({
        title: 'PC Actualizada',
        description: `Los datos de ${pc.name} han sido guardados.`,
      });
      onSave(updatedPc);
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
    <Dialog open={true} onOpenChange={isSaving ? undefined : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {pc.name}</DialogTitle>
          <DialogDescription>
            Actualice el alias o la ubicación de la PC.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias / Propietario</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tienda Principal, Bodega #2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
