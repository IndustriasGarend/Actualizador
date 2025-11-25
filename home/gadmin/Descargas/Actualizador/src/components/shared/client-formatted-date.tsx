'use client';
/**
 * @fileoverview
 * Componente para formatear fechas en el lado del cliente de forma segura,
 * evitando errores de hidratación y parpadeo en la UI.
 */
import { useState, useEffect } from "react";

interface ClientFormattedDateProps {
  dateString: string | null;
}

export function ClientFormattedDate({ dateString }: ClientFormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('Nunca');

  useEffect(() => {
    if (dateString) {
      const date = new Date(dateString);
      // Corrección para mostrar la fecha correcta sin importar la zona horaria del servidor
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const correctedDate = new Date(date.getTime() + userTimezoneOffset);
      
      // Usar toLocaleString para un formato amigable al usuario
      const newFormattedDate = correctedDate.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC' // La corrección ya se hizo, ahora se formatea como UTC
      });
      setFormattedDate(newFormattedDate);
    } else {
      setFormattedDate('Nunca');
    }
  }, [dateString]);

  // Durante el SSR o antes de que el efecto se ejecute, se muestra el valor inicial 'Nunca'
  // o el valor anterior, evitando el parpadeo y la falta de coincidencia de hidratación.
  return <>{formattedDate}</>;
}
