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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!dateString) {
    return <>Nunca</>;
  }

  // En el servidor o antes del primer render en cliente, mostrar la fecha en un formato simple.
  if (!isClient) {
    return <>{dateString.split('T')[0]}</>;
  }

  // En el cliente, formatear a la zona horaria local.
  const date = new Date(dateString);
  // Corrección para mostrar la fecha correcta sin importar la zona horaria del servidor
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  
  // Usar toLocaleString para un formato amigable al usuario
  const formattedDate = correctedDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
  });

  return <>{formattedDate}</>;
}
