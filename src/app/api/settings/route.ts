import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SystemConfig } from '@/lib/types';
import { z } from 'zod';

const formSchema = z.object({
  updateFilePath: z.string().min(1),
  localUpdateDir: z.string().min(1),
  softlandInstallDir: z.string().min(1),
  serviceName: z.string().min(1),
  adminUser: z.string().min(1),
  adminPass: z.string().optional(),
  environmentPath: z.string().optional(),
});


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedBody = formSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json({ message: 'Datos de configuración inválidos', errors: validatedBody.error.flatten() }, { status: 400 });
    }

    const config = validatedBody.data;
    
    // El adminPass no se guarda en la base de datos por seguridad
    const { adminPass, ...configToSave } = config;

    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    const saveConfig = db.transaction((cfg) => {
        for (const [key, value] of Object.entries(cfg)) {
            // Solo guardar si el valor no es undefined
            if (value !== undefined) {
                stmt.run(key, String(value));
            }
        }
    });

    saveConfig(configToSave);

    return NextResponse.json({ message: 'Configuración guardada correctamente' });

  } catch (error) {
    console.error("Error al guardar la configuración:", error);
    return NextResponse.json({ message: 'Error en el servidor al guardar la configuración.' }, { status: 500 });
  }
}
