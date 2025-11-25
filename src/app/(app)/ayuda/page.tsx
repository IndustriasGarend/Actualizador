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
  ToggleRight,
  Cog,
  Package,
  Download
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
    if (!searchTerm) {
        setActiveItem(undefined);
        return;
    }
    
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);


  const helpSections = [
    {
        title: "Introducción a Clic Actualizador Tools",
        icon: <Rocket className="mr-4 h-6 w-6 text-blue-500" />,
        content: (
            <>
                <p>
                ¡Bienvenido a <strong>Clic Actualizador Tools</strong>! Este sistema está diseñado para ser tu centro de control para desplegar software, ejecutar comandos y gestionar actualizaciones en todas las computadoras de tu empresa de manera eficiente.
                </p>
                <p>
                El objetivo es tener una visión clara del estado de cada equipo y poder lanzar tareas remotas con un solo clic, sin necesidad de acceder físicamente a cada máquina.
                </p>
                 <Alert variant="default" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Funcionamiento On-Premise</AlertTitle>
                    <AlertDescription>
                        Este sistema está diseñado para funcionar 100% dentro de tu red local (on-premise). La comunicación se realiza entre este panel de control y un pequeño "agente" que se instala en cada PC cliente.
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
                        <strong>Nombre de la PC:</strong> Es el `hostname` del equipo. Al hacer clic, accederás a una vista detallada con el inventario de hardware.
                    </li>
                    <li>
                        <strong>Estado (<Badge variant="secondary" className="text-xs">Badge</Badge>):</strong> La etiqueta de color te indica el estado actual:
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li><Badge className="bg-accent text-accent-foreground">Actualizado</Badge>: La última tarea se completó con éxito.</li>
                            <li><Badge variant="secondary">Pendiente</Badge>: Se ha enviado una orden, pero el agente aún no la ha comenzado.</li>
                            <li><Badge className="bg-primary/80 text-primary-foreground animate-pulse">En progreso</Badge>: El agente está ejecutando una tarea en este momento.</li>
                            <li><Badge variant="destructive">Error</Badge>: Ocurrió un problema durante la última tarea. Revisa el historial.</li>
                            <li><Badge className="bg-yellow-500 text-white">Cancelado</Badge>: La tarea fue cancelada manualmente.</li>
                            <li><Badge className="bg-slate-500 text-white">Deshabilitado</Badge>: La PC está inactiva y no recibirá nuevas tareas.</li>
                         </ul>
                    </li>
                     <li>
                        <strong>Alias, Ubicación y Usuario Logueado:</strong> Muestran información adicional para identificar la PC.
                    </li>
                    <li>
                        <strong>Versión App (<GitBranch className="inline h-4 w-4"/>):</strong> Muestra el identificador de la versión de la última actualización de archivos realizada.
                    </li>
                    <li>
                        <strong>Versión Agente (<RefreshCw className="inline h-4 w-4"/>):</strong> Muestra la versión del agente. Si aparece en <span className="text-red-500 font-bold">rojo</span>, el sistema intentará actualizarlo automáticamente.
                    </li>
                    <li>
                        <strong>Botón "Actualizar / Instalar":</strong> Este es el disparador principal. Al hacer clic, se despliega un menú con todos los paquetes de software disponibles para enviar a esa PC.
                    </li>
                </ul>
            </div>
        )
    },
    {
        title: "Gestión de Paquetes",
        icon: <Package className="mr-4 h-6 w-6 text-orange-500" />,
        content: (
            <div className="space-y-4">
                <p>
                Esta es la "sala de máquinas" del sistema. Aquí defines los paquetes de software, actualizaciones o comandos que quieres desplegar. Puedes crear tantos como necesites.
                </p>

                <h4 className="font-semibold text-lg pt-2 border-t">Tipos de Paquetes</h4>
                <p>Al crear un nuevo paquete, debes elegir su tipo:</p>
                <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Actualización de Archivos:</strong> Es el método original. Ideal para actualizaciones que solo requieren descomprimir un archivo (.zip, .7z) y copiar su contenido a una carpeta de destino. Perfecto para sistemas como Softland.
                    </li>
                     <li>
                        <strong>Ejecutar Script:</strong> Permite ejecutar un archivo de script (<code>.bat</code> o <code>.ps1</code>) en la PC cliente. El script debe estar en una carpeta de red compartida. Es ideal para instalaciones desatendidas (ejecutables .exe con parámetros silenciosos, .msi) o tareas de configuración complejas.
                    </li>
                     <li>
                        <strong>Comando PowerShell:</strong> Ejecuta una línea de comando directamente en una terminal de PowerShell en la PC cliente. Es la forma más rápida y directa de realizar tareas simples, como usar <strong>Winget</strong> (ej. <code>winget upgrade --all --accept-package-agreements</code>) o forzar políticas de grupo (<code>gpupdate /force</code>).
                    </li>
                </ul>
                <Alert variant="default">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>¡Importante! Instaladores Desatendidos</AlertTitle>
                    <AlertDescription>
                        Para instalar programas usando "Ejecutar Script", asegúrate de que el instalador soporte un modo silencioso o desatendido (ej. <code>setup.exe /S</code>, <code>msiexec /i install.msi /qn</code>). Debes incluir estos comandos dentro de tu archivo <code>.bat</code> o <code>.ps1</code>.
                    </AlertDescription>
                </Alert>
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
                        <strong>Descargar el Paquete de Instalación:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>En la página de <strong>Ayuda</strong> (esta misma página), haz clic en el botón <strong>"Descargar Instalador del Agente (.zip)"</strong>.</li>
                             <li>El paquete `.zip` ya incluye la URL de su servidor pre-configurada.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Preparar la PC Cliente:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>Copia el archivo `.zip` a la PC cliente y descomprímelo en una ubicación permanente (ej. `C:\\ClicUpdaterAgent`).</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Ejecutar el Instalador:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>Navega hasta la carpeta donde descomprimiste los archivos.</li>
                            <li>Haz **clic derecho** en el archivo `install-service.ps1` y selecciona **"Ejecutar con PowerShell"**.</li>
                             <li>Si esta opción no aparece, abre una terminal de PowerShell como Administrador, navega a esta carpeta y ejecuta: `.\\install-service.ps1`</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Verificar la Instalación:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                             <li>Acepta la solicitud de permisos de Administrador (UAC) si aparece.</li>
                             <li>Si todo sale bien, la consola mostrará un mensaje de "¡ÉXITO!". La ventana permanecerá abierta hasta que presiones una tecla.</li>
                             <li>El nuevo servicio llamado `Clic Actualizador Tools Agent` se habrá instalado y estará ejecutándose con la cuenta `Sistema Local`.</li>
                        </ul>
                    </li>
                </ol>
                <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 text-blue-800">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertTitle>PASO MANUAL Y OBLIGATORIO: Configurar Credenciales de Red</AlertTitle>
                    <AlertDescription>
                       <div className="space-y-2">
                        <p>Para que el agente pueda acceder a los archivos en carpetas compartidas de la red, debes cambiar la cuenta con la que se ejecuta el servicio.</p>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Abre la consola de Servicios de Windows (`services.msc`).</li>
                            <li>Busca el servicio <strong>"Clic Actualizador Tools Agent"</strong> y abre sus propiedades.</li>
                            <li>Ve a la pestaña <strong>"Iniciar sesión"</strong>.</li>
                            <li>Selecciona "Esta cuenta" e ingresa las credenciales de un usuario de dominio que tenga permisos de lectura sobre las carpetas de red que usarás.</li>
                            <li>Guarda los cambios y reinicia el servicio.</li>
                        </ol>
                        <p>La nueva PC aparecerá automáticamente en el panel de control después de unos minutos.</p>
                       </div>
                    </AlertDescription>
                </Alert>
            </div>
        )
    },
    {
        title: "Descargar Instalador del Agente",
        icon: <HardDriveDownload className="mr-4 h-6 w-6 text-slate-600" />,
        content: (
            <div className="space-y-4">
                <p>
                Desde aquí puedes descargar el paquete de instalación genérico para el agente. Este mismo paquete `.zip` se utiliza para todas las PCs que desees registrar en el sistema. La URL de su servidor se incluirá automáticamente en el paquete.
                </p>
                <div className="flex justify-center pt-4">
                    <Button onClick={() => window.location.href = '/api/download-agent'}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Instalador del Agente (.zip)
                    </Button>
                </div>
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
                    <p className="text-muted-foreground mt-1">Encuentre respuestas y tutoriales sobre cómo usar Clic Actualizador Tools.</p>
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
