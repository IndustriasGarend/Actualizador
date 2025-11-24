"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Rocket,
  Computer,
  Settings,
  HardDriveDownload,
  History,
  FileUp,
  Search,
  LifeBuoy,
  AlertTriangle,
  ServerCrash,
  FileTerminal,
  Badge,
  CheckCircle,
  XCircle,
  Loader2,
  Ban,
  GitBranch,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// --- Helper Functions ---
const normalizeText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const HighlightedText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  const normalizedHighlight = normalizeText(highlight);
  const parts = text.split(
    new RegExp(
      `(${normalizedHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    )
  );

  return (
    <>
      {parts.map((part, i) =>
        normalizeText(part).toLowerCase() === normalizedHighlight ? (
          <mark key={i} className="bg-yellow-300 p-0 m-0">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const HelpSection = ({
  title,
  icon,
  content,
  searchTerm,
}: {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  searchTerm: string;
}) => {
  const contentString = useMemo(() => {
    const getText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(getText).join(" ");
      if (typeof node === "object" && node !== null && "props" in node && node.props.children) {
        return getText(node.props.children);
      }
      return "";
    };
    return getText(content);
  }, [content]);

  const isVisible = useMemo(() => {
    const searchTerms = normalizeText(searchTerm).split(" ").filter(Boolean);
    if (searchTerms.length === 0) return true;
    const targetText = normalizeText(title + " " + contentString);
    return searchTerms.every((term) => targetText.includes(term));
  }, [searchTerm, title, contentString]);

  if (!isVisible) return null;

  return (
    <AccordionItem value={title}>
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center">
          {icon}
          <HighlightedText text={title} highlight={searchTerm} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="prose max-w-none text-base">
        {content}
      </AccordionContent>
    </AccordionItem>
  );
};

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const helpSections = [
    {
        title: "Introducción al Sistema",
        icon: <Rocket className="mr-4 h-6 w-6 text-blue-500" />,
        content: (
            <>
                <p>
                ¡Bienvenido a <strong>Softland Updater</strong>! Este sistema está diseñado para ser tu centro de control centralizado para gestionar y desplegar actualizaciones del software Softland en todas las computadoras de tu empresa de manera eficiente y segura.
                </p>
                <p>
                El objetivo es simple: tener una visión clara del estado de actualización de cada equipo y poder lanzar actualizaciones remotas con un solo clic, sin necesidad de acceder físicamente a cada máquina.
                </p>
                 <Alert variant="default" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Funcionamiento On-Premise</AlertTitle>
                    <AlertDescription>
                        Este sistema está diseñado para funcionar 100% dentro de tu red local (on-premise). No depende de servicios en la nube. La comunicación se realiza entre este panel de control y un pequeño "agente" que se instala en cada PC cliente.
                    </AlertDescription>
                </Alert>
            </>
        )
    },
    {
        title: "Guía del Panel de Control (Dashboard)",
        icon: <Computer className="mr-4 h-6 w-6 text-green-500" />,
        content: (
             <div className="space-y-4">
                <p>
                El panel de control es tu vista principal. Aquí verás una tarjeta por cada PC registrada en el sistema.
                </p>
                
                <h4 className="font-semibold text-lg pt-2 border-t">Entendiendo la Tarjeta de una PC</h4>
                <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Nombre de la PC e IP:</strong> Identifican el equipo en la red. La IP es reportada por el agente.
                    </li>
                    <li>
                        <strong>Estado (<BadgeUI variant="secondary" className="text-xs">Badge</BadgeUI>):</strong> La etiqueta de color en la esquina superior derecha te indica el estado actual:
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li><BadgeUI className="bg-accent text-accent-foreground">Actualizado</BadgeUI>: La PC tiene la última versión disponible.</li>
                            <li><BadgeUI variant="secondary">Pendiente</BadgeUI>: Se ha enviado una orden de actualización, pero el agente aún no la ha comenzado.</li>
                            <li><BadgeUI className="bg-primary/80 text-primary-foreground animate-pulse">En progreso</BadgeUI>: El agente está ejecutando una actualización en este momento.</li>
                            <li><BadgeUI variant="destructive">Error</BadgeUI>: Ocurrió un problema durante el último intento de actualización. Revisa el historial para más detalles.</li>
                            <li><BadgeUI className="bg-yellow-500 text-white">Cancelado</BadgeUI>: La tarea de actualización fue cancelada manualmente desde el panel.</li>
                         </ul>
                    </li>
                    <li>
                        <strong>Versión (<GitBranch className="inline h-4 w-4"/>):</strong> Muestra el identificador de la versión de software que la PC tiene instalada actualmente.
                    </li>
                    <li>
                        <strong>Botón "Actualizar Ahora":</strong> Este es el disparador principal. Al hacer clic, se crea una tarea de actualización para esa PC. El sistema es inteligente: si la PC ya tiene la última versión, el agente lo detectará y simplemente reportará que no necesita actualizarse.
                    </li>
                </ul>

                <Alert variant="default" className="mt-4">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>¿No ves ninguna PC?</AlertTitle>
                    <AlertDescription>
                        Si el panel está vacío, significa que aún no has agregado ninguna PC al sistema. Dirígete a la sección de <strong>Configuración</strong> para aprender cómo hacerlo.
                    </AlertDescription>
                </Alert>
            </div>
        )
    },
    {
        title: "Guía de la Página de Configuración",
        icon: <Settings className="mr-4 h-6 w-6 text-slate-600" />,
        content: (
            <div className="space-y-4">
                <p>
                Esta es la "sala de máquinas" del sistema. Aquí defines cómo funcionarán las actualizaciones y gestionas la lista de equipos.
                </p>

                <h4 className="font-semibold text-lg pt-2 border-t">Parámetros Generales</h4>
                <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Ruta de archivo de actualización:</strong> La ruta de red completa (UNC Path) donde el agente buscará el archivo comprimido con la actualización (ej. `\\servidor\updates\update.7z`).
                    </li>
                     <li>
                        <strong>Directorio de instalación de Softland:</strong> La ruta local en las PCs cliente donde está instalado Softland (ej. `C:\SoftlandERP`). El agente usará esta ruta para reemplazar los archivos.
                    </li>
                     <li>
                        <strong>Usuario Administrador:</strong> Define la cuenta de usuario (preferiblemente de dominio) con la que se debe instalar el servicio del agente. Esto es crucial para que el agente tenga los permisos necesarios para detener servicios y modificar archivos.
                    </li>
                </ul>

                <h4 className="font-semibold text-lg pt-2 border-t">Adición Masiva de PCs (<FileUp className="inline h-4 w-4"/>)</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>
                        Esta herramienta te permite agregar muchos equipos a la vez.
                        <ol className="list-decimal space-y-2 pl-5 mt-2">
                            <li>Prepara un archivo de texto con extensión `.csv`.</li>
                            <li>En cada línea, escribe el ID único de la PC, una coma, y el nombre de la PC. No incluyas encabezados. Ejemplo: `pc-01,CAJA-01`.</li>
                            <li>Sube el archivo usando el selector y haz clic en "Importar PCs". El sistema añadirá todos los equipos nuevos a la base de datos.</li>
                        </ol>
                    </li>
                </ul>

                <h4 className="font-semibold text-lg pt-2 border-t">Descargar Agente (<HardDriveDownload className="inline h-4 w-4"/>)</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>Esta es la herramienta para generar el paquete de instalación para una nueva PC.</li>
                    <li>Ingresa un **ID único** y un **Nombre** para la PC que quieres añadir. Estos datos se incrustarán en el agente.</li>
                    <li>Haz clic en "Descargar Paquete (.zip)". Esto generará y descargará un archivo ZIP que contiene todo lo necesario para instalar el agente en la PC cliente.</li>
                 </ul>
            </div>
        )
    },
    {
        title: "Tutorial: Instalación del Agente en una PC Cliente",
        icon: <FileTerminal className="mr-4 h-6 w-6 text-cyan-500" />,
        content: (
            <div className="space-y-4">
                <p>
                El agente es un pequeño programa que se ejecuta en cada PC cliente y se comunica con el servidor central. Su instalación es un paso único y fundamental.
                </p>

                <h4 className="font-semibold text-lg pt-2 border-t">Pasos para la Instalación</h4>
                <ol className="list-decimal space-y-4 pl-6">
                    <li>
                        <strong>Generar y Descargar el Paquete:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>En el panel de control, ve a <strong>Configuración &gt; Descargar Agente</strong>.</li>
                            <li>Ingresa el ID y Nombre para la nueva PC y descarga el archivo `.zip`.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Preparar la PC Cliente:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>Copia el archivo `.zip` a la PC cliente y descomprímelo en una ubicación permanente (ej. `C:\SoftlandUpdaterAgent`).</li>
                            <li>El contenido será: `agent.ps1`, `install-service.ps1` y un `README.txt`.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Ejecutar el Instalador como Administrador:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>Abre una consola de **PowerShell como Administrador**.</li>
                            <li>Navega hasta la carpeta donde descomprimiste los archivos. (ej. `cd C:\SoftlandUpdaterAgent`).</li>
                            <li>Ejecuta `Set-ExecutionPolicy Unrestricted -Force` para permitir la ejecución de scripts.</li>
                            <li>Ejecuta el instalador: `.\install-service.ps1`.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Ingresar Credenciales:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                             <li>El script te pedirá un usuario y contraseña. Debes ingresar las credenciales de la cuenta de servicio que definiste en la configuración (ej. `DOMINIO\usuario.servicio`).</li>
                             <li>Estas credenciales se usarán para que el servicio de Windows se ejecute con los permisos adecuados. **No se guardan en ningún archivo de texto plano.**</li>
                        </ul>
                    </li>
                </ol>
                <Alert variant="default" className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>¡Instalación Completa!</AlertTitle>
                    <AlertDescription>
                        Si todo salió bien, el script confirmará que el servicio (ej. `SoftlandUpdateAgent_CAJA-01`) fue creado e iniciado. La nueva PC aparecerá automáticamente en el panel de control en unos minutos con el estado "Pendiente".
                    </AlertDescription>
                </Alert>
            </div>
        )
    },
     {
        title: "Guía del Historial de Actualizaciones",
        icon: <History className="mr-4 h-6 w-6 text-purple-500" />,
        content: (
             <div className="space-y-4">
                <p>
                Esta sección es tu bitácora de todo lo que ha sucedido en el sistema. Es invaluable para auditar y diagnosticar problemas.
                </p>
                <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Información Registrada:</strong> Cada fila representa un evento. Verás qué PC lo generó, la fecha y hora, la acción realizada y el resultado.
                    </li>
                    <li>
                        <strong>Estado del Evento:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li><BadgeUI className="bg-accent text-accent-foreground">Éxito</BadgeUI>: El paso se completó correctamente.</li>
                            <li><BadgeUI variant="destructive">Fallo</BadgeUI>: Ocurrió un error. El mensaje te dará una pista de qué salió mal (ej. "Acceso denegado").</li>
                            <li><BadgeUI variant="secondary">Omitido</BadgeUI>: El agente determinó que no era necesario realizar la acción. El caso más común es cuando se envía una orden de actualización a una PC que ya tiene la última versión.</li>
                            <li><BadgeUI className="bg-yellow-500 text-white">Cancelado</BadgeUI>: La tarea fue cancelada manualmente desde el panel.</li>
                         </ul>
                    </li>
                    <li>
                        <strong>Diagnóstico de Errores:</strong> Si una actualización falla, este es el primer lugar que debes revisar. El mensaje de error del log que falló te dirá exactamente por qué no pudo continuar (ej: no se pudo encontrar el archivo de actualización, no se pudo detener el servicio, etc.).
                    </li>
                </ul>
            </div>
        )
    },
    {
        title: "Guía para Cancelar una Actualización",
        icon: <Ban className="mr-4 h-6 w-6 text-yellow-500" />,
        content: (
             <div className="space-y-4">
                <p>
                Si iniciaste una actualización por error o necesitas detenerla por alguna razón, puedes hacerlo mientras está en el estado "En progreso".
                </p>
                <ol className="list-decimal space-y-3 pl-6">
                    <li>
                        <strong>Iniciar la Actualización:</strong> Haz clic en "Actualizar Ahora" en una PC. Se abrirá una ventana emergente (modal) indicando que la tarea ha sido enviada.
                    </li>
                    <li>
                        <strong>Localizar el Botón de Cancelar:</strong> Dentro de esa ventana emergente, verás un botón rojo que dice <span className="inline-flex items-center"><Button variant="destructive" size="sm" disabled><Ban className="mr-2 h-4 w-4" />Cancelar Tarea</Button></span>.
                    </li>
                    <li>
                        <strong>Enviar la Orden de Cancelación:</strong> Al hacer clic en ese botón, el panel envía una "señal de cancelación" al servidor, que marca la tarea activa como `cancelado` en la base de datos.
                    </li>
                    <li>
                        <strong>El Agente se Detiene:</strong> El agente en la PC cliente está diseñado para verificar periódicamente si su tarea ha sido cancelada. En cuanto detecte la señal (normalmente en pocos segundos), detendrá lo que esté haciendo, reportará el estado "Cancelado" y terminará su ejecución. La PC aparecerá en el panel con la etiqueta amarilla de "Cancelado".
                    </li>
                </ol>
            </div>
        )
    },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                <LifeBuoy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                    Manual de Usuario de Softland Updater
                </CardTitle>
                <CardDescription>
                  Guía completa sobre cómo utilizar las herramientas y funcionalidades del sistema.
                </CardDescription>
              </div>
            </div>
            <div className="relative mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Escribe para buscar en la ayuda (ej: 'agente', 'cancelar', 'csv')..."
                className="w-full pl-10 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {helpSections.map((section, index) => (
                <HelpSection
                  key={index}
                  title={section.title}
                  icon={section.icon}
                  content={section.content}
                  searchTerm={searchTerm}
                />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
