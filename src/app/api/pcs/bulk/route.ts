import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No se encontró el archivo' }, { status: 400 });
    }

    const fileContent = await file.text();

    const parseResult = Papa.parse<string[]>(fileContent.trim(), {
      header: false,
    });
    
    if (parseResult.errors.length > 0) {
        console.error('Error parsing CSV:', parseResult.errors);
        return NextResponse.json({ message: 'Error al analizar el archivo CSV.', errors: parseResult.errors }, { status: 400 });
    }

    const pcsToAdd = parseResult.data
      .map(row => ({ 
        id: row[0]?.trim(), 
        name: row[1]?.trim(),
        alias: row[2]?.trim(),
        location: row[3]?.trim(),
      }))
      .filter(pc => pc.id && pc.name);

    if (pcsToAdd.length === 0) {
      return NextResponse.json({ message: 'El archivo CSV está vacío o no tiene el formato correcto.' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT OR IGNORE INTO pcs (id, name, alias, location, ip, status) VALUES (?, ?, ?, ?, ?, ?)');
    const insertMany = db.transaction((pcs) => {
      let changes = 0;
      for (const pc of pcs) {
        // La IP la dejamos como 'Desconocida' hasta el primer reporte del agente
        const result = stmt.run(pc.id, pc.name, pc.alias, pc.location, 'Desconocida', 'Pendiente');
        changes += result.changes;
      }
      return changes;
    });

    const addedCount = insertMany(pcsToAdd);
    const skippedCount = pcsToAdd.length - addedCount;

    return NextResponse.json({
      message: 'Proceso de importación masiva completado.',
      added: addedCount,
      skipped: skippedCount,
    });

  } catch (error) {
    console.error("Error en la importación masiva:", error);
    return NextResponse.json({ message: 'Error en el servidor al procesar la importación.' }, { status: 500 });
  }
}
