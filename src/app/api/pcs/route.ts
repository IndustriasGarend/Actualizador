import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM pcs ORDER BY name');
    const pcs = stmt.all();
    return NextResponse.json(pcs);
  } catch (error) {
    console.error('Failed to fetch PCs:', error);
    return NextResponse.json({ message: 'Error al obtener las PCs' }, { status: 500 });
  }
}
