
"use server";

import { addSystemLog as dbAddLog, getSystemLogs as dbGetLogs, clearSystemLogs as dbClearLogs } from '@/lib/db';
import type { SystemLogEntry, DateRange } from "@/lib/types";

/**
 * Logs an informational message.
 * @param message The main message to log.
 * @param details Optional structured data to include.
 */
export async function logInfo(message: string, details?: Record<string, any>) {
  await dbAddLog({ type: "INFO", message, details });
}

/**
 * Logs a warning message.
 * @param message The warning message to log.
 * @param details Optional structured data to include.
 */
export async function logWarn(message: string, details?: Record<string, any>) {
  await dbAddLog({ type: "WARN", message, details });
}

/**
 * Logs an error message.
 * @param message The error message to log.
 * @param details Optional structured data, often including the error object.
 */
export async function logError(context: string, details?: Record<string, any>) {
  await dbAddLog({ type: "ERROR", message: context, details });
}

/**
 * Retrieves logs from the database based on specified filters.
 * @param filters Optional filters for log type, search term, and date range.
 * @returns A promise that resolves to an array of log entries.
 */
export async function getLogs(filters: {
    type?: 'operational' | 'system' | 'all';
    search?: string;
    dateRange?: DateRange;
} = {}): Promise<SystemLogEntry[]> {
  return await dbGetLogs(filters);
}

/**
 * Clears logs from the database based on specified criteria.
 * @param {string} clearedBy - The name of the user clearing the logs.
 * @param {'operational' | 'system' | 'all'} type - The type of logs to clear.
 * @param {boolean} deleteAllTime - If true, ignores the 30-day retention period and deletes all specified logs.
 */
export async function clearLogs(clearedBy: string, type: 'operational' | 'system' | 'all', deleteAllTime: boolean) {
  // Para simplificar, asumimos que no hay un objeto `user` complejo, usamos un string.
  // Si tuvieras un sistema de autenticación, aquí usarías el `user.name` o `user.id`.
  await dbClearLogs(clearedBy, type, deleteAllTime);
  await logInfo(`El usuario '${clearedBy}' realizó una limpieza de logs.`, { type, deleteAllTime });
}
