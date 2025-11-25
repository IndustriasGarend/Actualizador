/**
 * @fileOverview ClientFormattedDate component
 * 
 * Este componente está diseñado para renderizar una fecha y hora en la zona horaria local del navegador del cliente.
 * Utiliza 'useEffect' para formatear la fecha solo en el lado del cliente, evitando así errores de hidratación de Next.js
 * al garantizar que el renderizado inicial del servidor y el cliente coincidan.
 */
'use client';

import { useEffect, useState } from 'react';

interface ClientFormattedDateProps {
  dateString: string | null | undefined;
}

export function ClientFormattedDate({ dateString }: ClientFormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (dateString) {
      // Formatear la fecha a la configuración regional del navegador del usuario.
      const date = new Date(dateString);
      setFormattedDate(date.toLocaleString());
    } else {
      setFormattedDate('Nunca');
    }
  }, [dateString]);

  // Durante el renderizado del servidor o el primer renderizado del cliente,
  // se devuelve 'Cargando...' o un valor provisional para evitar el mismatch de hidratación.
  return <>{formattedDate || 'Cargando...'}</>;
}
