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
  CheckCircle,
  Ban,
  GitBranch,
  Trash2,
  ToggleLeft,
  RefreshCw,
  ToggleRight
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


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
  const [activeItem, setActiveItem] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (searchTerm) {
        const firstMatch = helpSections.find(section => {
            const searchTerms = normalizeText(searchTerm).split(" ").filter(Boolean);
            if (searchTerms.length === 0) return false;
            const contentString = (title: string, content: React.ReactNode) => {
                 const getText = (node: React.ReactNode): string => {
                    if (typeof node === "string") return node;
                    if (Array.isArray(node)) return node.map(getText).join(" ");
                    if (typeof node === "object" && node !== null && "props" in node && node.props.children) {
                        return getText(node.props.children);
                    }
                    return "";
                };
                return title + " " + getText(content);
            }
            const targetText = normalizeText(contentString(section.title, section.content));
            return searchTerms.every((term) => targetText.includes(term));
        });
        setActiveItem(firstMatch?.title);
    } else {
        setActiveItem(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);


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
                            <li><BadgeUI className="bg-slate-500 text-white">Deshabilitado</BadgeUI>: La PC está inactiva y no recibirá órdenes de actualización.</li>
                         </ul>
                    </li>
                    <li>
                        <strong>Versión App (<GitBranch className="inline h-4 w-4"/>):</strong> Muestra el identificador de la versión de Softland que la PC tiene instalada.
                    </li>
                    <li>
                        <strong>Versión Agente (<RefreshCw className="inline h-4 w-4"/>):</strong> Muestra la versión del agente instalado. Si aparece en <span className="text-red-500 font-bold">rojo</span>, significa que el agente está desactualizado y necesita ser actualizado. El sistema intentará actualizarlo automáticamente.
                    </li>
                    <li>
                        <strong>Botón "Actualizar Ahora":</strong> Este es el disparador principal. Al hacer clic, se crea una tarea de actualización. Si la PC ya tiene la última versión de Softland, el agente lo detectará y simplemente reportará que no necesita actualizarse.
                    </li>
                    <li>
                        <strong>Menú de Acciones (⋮):</strong> Este menú te da opciones adicionales:
                         <ul className="list-[square] space-y-2 pl-5 mt-2 text-sm">
                             <li><span className="inline-flex items-center gap-2"><ToggleLeft className="h-4 w-4"/> <strong>Deshabilitar/Habilitar:</strong></span> Permite marcar una PC como inactiva. No recibirá tareas de actualización.</li>
                             <li><span className="inline-flex items-center gap-2"><Trash2 className="h-4 w-4 text-destructive"/> <strong>Eliminar:</strong></span> Borra permanentemente la PC del sistema.</li>
                         </ul>
                    </li>
                </ul>

                <Alert variant="default" className="mt-4">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>¿No ves ninguna PC?</AlertTitle>
                    <AlertDescription>
                        Si el panel está vacío, significa que aún no has agregado ninguna PC. Dirígete a la sección de <strong>Configuración</strong> para aprender cómo hacerlo.
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
                        <strong>Directorio de instalación de Softland:</strong> La ruta local en las PCs cliente donde está instalado Softland (ej. `C:\SoftlandERP`).
                    </li>
                     <li>
                        <strong>Nombres de los servicios:</strong> Define los servicios de Windows que deben detenerse antes de actualizar. **Puedes listar varios servicios separándolos por comas** (ej: `Servicio1,Servicio POS`).
                    </li>
                     <li>
                        <strong>Usuario Administrador:</strong> Define la cuenta de usuario con la que se debe instalar el servicio del agente. Es crucial que esta cuenta tenga permisos de administrador local en la PC y acceso a la ruta de red. El formato debe ser `DOMINIO\usuario` (ej. `ING\admin.softland`).
                    </li>
                </ul>

                <h4 className="font-semibold text-lg pt-2 border-t">Adición Masiva de PCs (<FileUp className="inline h-4 w-4"/>)</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>
                        Esta herramienta te permite agregar muchos equipos a la vez.
                        <ol className="list-decimal space-y-2 pl-5 mt-2">
                            <li>Prepara un archivo de texto con extensión `.csv`.</li>
                            <li>En cada línea, escribe el ID único de la PC, una coma, y el nombre de la PC. No incluyas encabezados. Ejemplo: `pc-01,CAJA-01`.</li>
                            <li>Sube el archivo y haz clic en "Importar PCs".</li>
                        </ol>
                    </li>
                </ul>

                <h4 className="font-semibold text-lg pt-2 border-t">Descargar Agente (<HardDriveDownload className="inline h-4 w-4"/>)</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>Esta es la herramienta para generar el paquete de instalación para una nueva PC.</li>
                    <li>Ingresa un **ID único** y un **Nombre** para la PC que quieres añadir.</li>
                    <li>Haz clic en "Descargar Paquete (.zip)". Esto generará un archivo ZIP con todo lo necesario para instalar el agente en la PC cliente.</li>
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
                        </ul>
                    </li>
                    <li>
                        <strong>Ejecutar el Instalador como Administrador:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>Abre una consola de <strong>PowerShell como Administrador</strong>.</li>
                            <li>Navega hasta la carpeta donde descomprimiste los archivos (ej. `cd C:\SoftlandUpdaterAgent`).</li>
                            <li>Ejecuta `Set-ExecutionPolicy Unrestricted -Force` para permitir la ejecución de scripts.</li>
                            <li>Ejecuta el instalador: `.\install-service.ps1`.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Ingresar Credenciales (¡Paso Crucial!):</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                             <li>El script te pedirá un usuario y contraseña. Debes ingresar las credenciales de la cuenta de servicio que definiste en la configuración (ej. `ING\admin.softland`).</li>
                             <li>Estas credenciales se usan para que el servicio de Windows se ejecute con los permisos adecuados. **No se guardan en ningún archivo de texto plano.** Son almacenadas de forma segura por el sistema operativo.</li>
                        </ul>
                    </li>
                </ol>
                <Alert variant="default" className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>¡Instalación Completa!</AlertTitle>
                    <AlertDescription>
                        Si todo salió bien, el script confirmará que el servicio (ej. `SoftlandUpdateAgent_CAJA-01`) fue creado e iniciado. La nueva PC aparecerá automáticamente en el panel de control. El servicio ahora buscará y desinstalará versiones antiguas del agente antes de iniciar, garantizando que solo la última versión esté en ejecución.
                    </AlertDescription>
                </Alert>
            </div>
        )
    },
    {
        title: "Auto-Actualización del Agente",
        icon: <RefreshCw className="mr-4 h-6 w-6 text-orange-500" />,
        content: (
             <div className="space-y-4">
                <p>
                Para mantener el sistema de gestión eficiente, el propio agente tiene la capacidad de actualizarse a sí mismo.
                </p>
                <h4 className="font-semibold text-lg pt-2 border-t">¿Cómo funciona?</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Detección de Versión:</strong> Cada vez que un agente se comunica con el servidor, reporta su versión actual. El servidor la compara con la última versión disponible.
                    </li>
                     <li>
                        <strong>Orden de Auto-Actualización:</strong> Si el servidor detecta que el agente está desactualizado (lo verás en <span className="text-red-500 font-bold">rojo</span> en el panel), su primera instrucción para el agente será que se auto-actualice, ignorando cualquier otra tarea.
                    </li>
                     <li>
                        <strong>Proceso de Reemplazo:</strong> El agente antiguo descargará el nuevo paquete de instalación, lo ejecutará en un segundo plano, y el nuevo instalador se encargará de detener y reemplazar el servicio antiguo por el nuevo antes de terminar el proceso.
                    </li>
                </ul>
                <Alert variant="default" className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Proceso Automático</AlertTitle>
                    <AlertDescription>
                        No necesitas hacer nada. Si ves una versión de agente en rojo, el sistema intentará corregirlo en el próximo ciclo de comunicación del agente. Solo necesitas asegurarte de que el servidor tenga la última versión de los scripts del agente.
                    </AlertDescription>
                </Alert>
            </div>
        )
    },
    {
        title: "Guía del Historial y Solución de Problemas",
        icon: <History className="mr-4 h-6 w-6 text-purple-500" />,
        content: (
             <div className="space-y-4">
                <p>
                La página de Historial es tu mejor herramienta para entender qué ha sucedido en el sistema y para diagnosticar problemas.
                </p>
                <h4 className="font-semibold text-lg pt-2 border-t">Interpretando los Registros</h4>
                <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Éxito:</strong> La operación se completó correctamente.
                    </li>
                     <li>
                        <strong>Fallo:</strong> Ocurrió un error. El mensaje en el log te dará una pista crucial sobre qué salió mal (ej. "Acceso denegado a C:\SoftlandERP\sl.dll", "No se pudo detener el servicio 'Servicio1'").
                    </li>
                     <li>
                        <strong>Omitido:</strong> El agente determinó que la actualización no era necesaria porque la PC ya tenía la última versión.
                    </li>
                    <li>
                        <strong>Cancelado:</strong> La tarea fue cancelada manualmente desde el panel de control antes de que pudiera completarse.
                    </li>
                </ul>
                 <h4 className="font-semibold text-lg pt-2 border-t">¿Cómo Cancelar una Tarea en Progreso?</h4>
                 <ol className="list-decimal space-y-2 pl-5 mt-2">
                    <li>
                        <strong>Iniciar la Tarea:</strong> Haz clic en "Actualizar Ahora". Aparecerá una ventana emergente mostrando que la tarea está en progreso.
                    </li>
                    <li>
                        <strong>Localizar el Botón de Cancelar:</strong> Dentro de esa ventana emergente, verás un botón rojo que dice <span className="inline-flex items-center"><Button variant="destructive" size="sm" disabled><Ban className="mr-2 h-4 w-4" />Cancelar Tarea</Button></span>.
                    </li>
                    <li>
                        <strong>Enviar la Orden de Cancelación:</strong> Al hacer clic en ese botón, el panel envía una "señal de cancelación" al servidor, que marca la tarea activa como `cancelado` en la base de datos.
                    </li>
                    <li>
                        <strong>El Agente se Detiene:</strong> En su siguiente punto de control, el agente en la PC cliente verá que la tarea ha sido cancelada, detendrá su proceso, y reportará el estado de "Cancelado" al panel.
                    </li>
                </ol>
            </div>
        )
    },
  ];

  return (
    <main className="flex flex-col h-full">
        <header className="p-6 pb-4">
            <div className="flex items-center gap-4">
                <LifeBuoy className="w-10 h-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Centro de Ayuda</h1>
                    <p className="text-muted-foreground mt-1">Encuentre respuestas y tutoriales sobre cómo usar Softland Updater.</p>
                </div>
            </div>
        </header>

        <div className="flex-1 p-6">
            <Card>
                 <CardHeader className="border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar en la documentación..." 
                            className="pl-10 text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Accordion 
                        type="single" 
                        collapsible 
                        className="w-full"
                        value={activeItem}
                        onValueChange={setActiveItem}
                    >
                    {helpSections.map((section) => (
                        <HelpSection
                        key={section.title}
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
