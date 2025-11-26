import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { logInfo } from '@/lib/system-logger';

const formSchema = z.object({
  serverUrl: z.string().url().optional().or(z.literal('')),
});


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedBody = formSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json({ message: 'Datos de configuración inválidos', errors: validatedBody.error.flatten() }, { status: 400 });
    }

    const configToSave = validatedBody.data;

    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    const saveConfig = db.transaction((cfg: typeof configToSave) => {
        // Guardar o actualizar la URL del servidor
        if (cfg.serverUrl !== undefined) {
          if (cfg.serverUrl) {
            stmt.run('serverUrl', cfg.serverUrl);
          } else {
            // Si la URL está vacía, la eliminamos para volver a la detección automática
            db.prepare("DELETE FROM settings WHERE key = 'serverUrl'").run();
          }
        }
    });

    saveConfig(configToSave);
    
    // Log the action
    await logInfo('Configuración del sistema guardada', { settings: configToSave });


    return NextResponse.json({ message: 'Configuración guardada correctamente' });

  } catch (error) {
    console.error("Error al guardar la configuración:", error);
    return NextResponse.json({ message: 'Error en el servidor al guardar la configuración.' }, { status: 500 });
  }
}
