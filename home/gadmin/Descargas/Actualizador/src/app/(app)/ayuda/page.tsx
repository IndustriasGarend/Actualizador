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
  Cog
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
        title: "Introduccion al Sistema",
        icon: <Rocket className="mr-4 h-6 w-6 text-blue-500" />,
        content: (
            <>
                <p>
                ¡Bienvenido a <strong>Softland Updater</strong>! Este sistema esta diseñado para ser tu centro de control centralizado para gestionar y desplegar actualizaciones del software Softland en todas las computadoras de tu empresa de manera eficiente y segura.
                </p>
                <p>
                El objetivo es simple: tener una vision clara del estado de actualizacion de cada equipo, obtener un inventario basico de su hardware y poder lanzar actualizaciones remotas con un solo clic, sin necesidad de acceder fisicamente a cada maquina.
                </p>
                 <Alert variant="default" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Funcionamiento On-Premise</AlertTitle>
                    <AlertDescription>
                        Este sistema esta diseñado para funcionar 100% dentro de tu red local (on-premise). No depende de servicios en la nube. La comunicacion se realiza entre este panel de control y un pequeño "agente" que se instala en cada PC cliente.
                    </AlertDescription>
                </Alert>
            </>
        )
    },
    {
        title: "Guia del Panel de Control (Dashboard)",
        icon: <Computer className="mr-4 h-6 w-6 text-green-500" />,
        content: (
             <div className="space-y-4">
                <p>
                El panel de control es tu vista principal. Aqui veras una tarjeta por cada PC registrada en el sistema.
                </p>
                
                <h4 className="font-semibold text-lg pt-2 border-t">Entendiendo la Tarjeta de una PC</h4>
                <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Nombre de la PC:</strong> Es el `hostname` del equipo. Al hacer clic, accederas a una vista detallada con el inventario de hardware.
                    </li>
                    <li>
                        <strong>Estado (<Badge variant="secondary" className="text-xs">Badge</Badge>):</strong> La etiqueta de color en la esquina superior derecha te indica el estado actual:
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li><Badge className="bg-accent text-accent-foreground">Actualizado</Badge>: La PC tiene la ultima version disponible.</li>
                            <li><Badge variant="secondary">Pendiente</Badge>: Se ha enviado una orden de actualizacion, pero el agente aun no la ha comenzado.</li>
                            <li><Badge className="bg-primary/80 text-primary-foreground animate-pulse">En progreso</Badge>: El agente esta ejecutando una actualizacion en este momento.</li>
                            <li><Badge variant="destructive">Error</Badge>: Ocurrio un problema durante el ultimo intento de actualizacion. Revisa el historial para mas detalles.</li>
                            <li><Badge className="bg-yellow-500 text-white">Cancelado</Badge>: La tarea de actualizacion fue cancelada manualmente desde el panel.</li>
                            <li><Badge className="bg-slate-500 text-white">Deshabilitado</Badge>: La PC esta inactiva y no recibira ordenes de actualizacion.</li>
                         </ul>
                    </li>
                     <li>
                        <strong>Alias, Ubicacion y Usuario Logueado:</strong> Muestran informacion adicional para identificar la PC, su ubicacion fisica y el ultimo usuario que inicio sesion.
                    </li>
                    <li>
                        <strong>Version App (<GitBranch className="inline h-4 w-4"/>):</strong> Muestra el identificador de la version de Softland que la PC tiene instalada.
                    </li>
                    <li>
                        <strong>Version Agente (<RefreshCw className="inline h-4 w-4"/>):</strong> Muestra la version del agente instalado. Si aparece en <span className="text-red-500 font-bold">rojo</span>, significa que el agente esta desactualizado. El sistema intentara actualizarlo automaticamente.
                    </li>
                    <li>
                        <strong>Boton "Actualizar Ahora":</strong> Este es el disparador principal. Al hacer clic, se crea una tarea de actualizacion.
                    </li>
                    <li>
                        <strong>Menu de Acciones (⋮):</strong> Este menu te da opciones adicionales:
                         <ul className="list-[square] space-y-2 pl-5 mt-2 text-sm">
                            <li><span className="inline-flex items-center gap-2"><strong>Editar:</strong></span> Permite cambiar el alias y la ubicacion de la PC.</li>
                             <li><span className="inline-flex items-center gap-2"><ToggleLeft className="h-4 w-4"/> <strong>Deshabilitar/Habilitar:</strong></span> Permite marcar una PC como inactiva.</li>
                             <li><span className="inline-flex items-center gap-2"><Trash2 className="h-4 w-4 text-destructive"/> <strong>Eliminar:</strong></span> Borra permanentemente la PC del sistema.</li>
                         </ul>
                    </li>
                </ul>

                <Alert variant="default" className="mt-4">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>¿No ves ninguna PC?</AlertTitle>
                    <AlertDescription>
                        Si el panel esta vacio, significa que aun no se ha registrado ninguna PC. Dirigete a la seccion de <strong>Instalacion del Agente</strong> para aprender como hacerlo.
                    </AlertDescription>
                </Alert>
            </div>
        )
    },
    {
        title: "Guia de la Pagina de Configuracion",
        icon: <Settings className="mr-4 h-6 w-6 text-slate-600" />,
        content: (
            <div className="space-y-4">
                <p>
                Esta es la "sala de maquinas" del sistema. Aqui defines como funcionaran las actualizaciones y gestionas la lista de equipos.
                </p>

                <h4 className="font-semibold text-lg pt-2 border-t">Parametros Generales</h4>
                <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Ruta de archivo de actualizacion:</strong> La ruta de red completa (UNC Path) donde el agente buscara el archivo comprimido con la actualizacion (ej. `\\\\servidor\\updates\\update.7z`).
                    </li>
                     <li>
                        <strong>Directorio de instalacion de Softland:</strong> La ruta local en las PCs cliente donde esta instalado Softland (ej. `C:\\SoftlandERP`).
                    </li>
                     <li>
                        <strong>Nombres de los servicios:</strong> Define los servicios de Windows que deben detenerse antes de actualizar. **Puedes listar varios servicios separandolos por comas** (ej: `Servicio1,Servicio POS`).
                    </li>
                     <li>
                        <strong>Rutas para variable de entorno PATH:</strong> Permite añadir rutas al PATH del sistema de las PCs cliente de forma centralizada. Separa cada ruta con un punto y coma (;). El agente se asegurara de no añadir rutas duplicadas.
                    </li>
                     <li>
                        <strong>Usuario Administrador:</strong> Define la cuenta de usuario con la que se debe instalar el servicio del agente. Es crucial que esta cuenta tenga permisos de administrador local en la PC y acceso a la ruta de red. El formato debe ser `DOMINIO\\usuario` (ej. `ING\\admin.softland`).
                    </li>
                </ul>

                <h4 className="font-semibold text-lg pt-2 border-t">Descargar Instalador del Agente (<HardDriveDownload className="inline h-4 w-4"/>)</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>Esta seccion te permite descargar el **paquete de instalacion generico** para el agente.</li>
                    <li>Este paquete `.zip` es el mismo para todas las PCs. Descargalo una vez y usalo en todos los equipos que quieras registrar.</li>
                 </ul>
            </div>
        )
    },
    {
        title: "Tutorial: Instalacion del Agente en una PC Cliente",
        icon: <FileTerminal className="mr-4 h-6 w-6 text-cyan-500" />,
        content: (
            <div className="space-y-4">
                <p>
                El agente es un pequeño programa que se ejecuta en cada PC cliente y se comunica con el servidor central. Su instalacion es un paso unico y fundamental.
                </p>

                <h4 className="font-semibold text-lg pt-2 border-t">Pasos para la Instalacion</h4>
                <ol className="list-decimal space-y-4 pl-6">
                    <li>
                        <strong>Descargar el Paquete de Instalacion:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>En el panel de control, ve a <strong>Configuracion</strong> y haz clic en el boton <strong>"Descargar Instalador del Agente (.zip)"</strong>.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Preparar la PC Cliente:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>Copia el archivo `.zip` a la PC cliente y descomprimelo en una ubicacion permanente (ej. `C:\\SoftlandUpdaterAgent`).</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Ejecutar el Instalador:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                            <li>Navega hasta la carpeta donde descomprimiste los archivos.</li>
                            <li>Haz **doble clic** en el archivo `install.bat`.</li>
                            <li>Si aparece una ventana de Control de Cuentas de Usuario (UAC), haz clic en "Si" para permitir que el script se ejecute como Administrador.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Ingresar la URL del Servidor:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                             <li>La consola te pedira que ingreses la URL base de este servidor. Ejemplo: `http://192.168.1.100:9002`.</li>
                             <li>Esta URL se guarda en un archivo `config.json` local para que el agente sepa a donde comunicarse.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Ingresar Credenciales del Servicio:</strong>
                         <ul className="list-[circle] space-y-2 pl-5 mt-2 text-sm">
                             <li>
                                <div>
                                A continuacion, la consola te pedira un usuario y contraseña. Debes ingresar las credenciales de la cuenta de servicio que definiste en la configuracion general del panel (ej. `ING\\admin.softland`).
                                </div>
                             </li>
                             <li>Estas credenciales se usan para que el servicio de Windows se ejecute con los permisos adecuados. **No se guardan en ningun archivo de texto plano.**</li>
                        </ul>
                    </li>
                </ol>
                <Alert variant="default" className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>¡Instalacion Completa!</AlertTitle>
                    <AlertDescription>
                        Si todo salio bien, el script confirmara que el servicio fue creado e iniciado. La nueva PC aparecera automaticamente en el panel de control, usando su propio `hostname` como identificador unico. El script de instalacion es inteligente: buscara y desinstalara versiones antiguas del agente antes de instalar la nueva.
                    </AlertDescription>
                </Alert>
            </div>
        )
    },
    {
        title: "Auto-Actualizacion del Agente y Logica de Funcionamiento",
        icon: <Cog className="mr-4 h-6 w-6 text-orange-500" />,
        content: (
            <div className="space-y-4">
                <p>
                Para mantener el sistema de gestion eficiente, el propio agente tiene la capacidad de actualizarse a si mismo y sigue una logica de operacion clara.
                </p>
                <h4 className="font-semibold text-lg pt-2 border-t">Paso 1: Recoleccion de Datos y Comunicacion</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>
                        El agente inicia y recolecta informacion clave: su propia version, el nombre del equipo (`hostname`), la IP actual, el usuario con sesion activa y un inventario basico de hardware.
                    </li>
                     <li>
                        Envía toda esta informacion al servidor para solicitar instrucciones. Si es la primera vez que se conecta, el servidor lo registrara como una nueva PC.
                    </li>
                </ul>
                 <h4 className="font-semibold text-lg pt-2 border-t">Paso 2: Recepcion y Priorizacion de Ordenes</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>
                        El servidor analiza los datos y decide que hacer, siguiendo un orden de prioridad estricto:
                         <ol className="list-decimal space-y-2 pl-5 mt-2">
                             <li><strong>Auto-Actualizacion del Agente:</strong> Si la version del agente es antigua, el servidor ordena una auto-actualizacion. Esta es la maxima prioridad.</li>
                             <li><strong>Cancelacion de Tarea:</strong> Si una tarea activa fue cancelada manually, el servidor ordena detenerla.</li>
                             <li><strong>Actualizacion de Softland:</strong> Si hay una actualizacion de Softland pendiente, el servidor envia la orden.</li>
                             <li><strong>Ninguna Tarea:</strong> Si no hay nada que hacer, el agente se pone en espera.</li>
                         </ol>
                    </li>
                </ul>
                <h4 className="font-semibold text-lg pt-2 border-t">Paso 3: Ejecucion de la Tarea</h4>
                 <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Si la orden es auto-actualizar:</strong> El agente antiguo descarga el nuevo paquete del instalador generico, ejecuta el nuevo instalador (que limpia versiones viejas) y luego se detiene. Este proceso es automatico y garantiza que los agentes se mantengan al dia sin intervencion manual.
                    </li>
                     <li>
                        <strong>Si la orden es actualizar Softland:</strong> El agente ejecuta el proceso de actualizacion paso a paso, enviando logs al servidor sobre el progreso y resultado de cada etapa. Estos pasos incluyen el desbloqueo de archivos descargados para evitar problemas de seguridad de Windows y el registro automatico de componentes basado en el archivo `ERPReg.xml` que venga en la actualizacion.
                    </li>
                     <li>
                        <strong>Si no hay tareas:</strong> El agente espera un intervalo de tiempo y vuelve a empezar el ciclo desde el Paso 1.
                    </li>
                </ul>
                <Alert variant="default" className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Proceso 100% Automatico</AlertTitle>
                    <AlertDescription>
                        No necesitas hacer nada para mantener los agentes actualizados. Si ves una version de agente en rojo en el panel, el sistema lo corregira automaticamente en el proximo ciclo de comunicacion.
                    </AlertDescription>
                </Alert>
            </div>
        )
    },
    {
        title: "Guia del Historial y Solucion de Problemas",
        icon: <History className="mr-4 h-6 w-6 text-purple-500" />,
        content: (
            <div className="space-y-4">
                <p>
                La pagina de Historial es tu mejor herramienta para entender que ha sucedido en el sistema y para diagnosticar problemas.
                </p>
                <h4 className="font-semibold text-lg pt-2 border-t">Interpretando los Registros</h4>
                <ul className="list-disc space-y-3 pl-6">
                    <li>
                        <strong>Exito:</strong> La operacion se completo correctamente.
                    </li>
                     <li>
                        <strong>Fallo:</strong> Ocurrio un error. El mensaje en el log te dara una pista crucial sobre que salio mal (ej. "Acceso denegado a C:\\SoftlandERP\\sl.dll", "No se pudo detener el servicio 'Servicio1'").
                    </li>
                     <li>
                        <strong>Omitido:</strong> El agente determino que la actualizacion no era necesaria porque la PC ya tenia la ultima version.
                    </li>
                    <li>
                        <strong>Cancelado:</strong> La tarea fue cancelada manualmente desde el panel de control antes de que pudiera completarse.
                    </li>
                </ul>
                 <h4 className="font-semibold text-lg pt-2 border-t">¿Como Cancelar una Tarea en Progreso?</h4>
                 <ol className="list-decimal space-y-2 pl-5 mt-2">
                    <li>
                        <strong>Iniciar la Tarea:</strong> Haz clic en "Actualizar Ahora". Aparecera una ventana emergente mostrando que la tarea esta en progreso.
                    </li>
                    <li>
                        <strong>Localizar el Boton de Cancelar:</strong> Dentro de esa ventana emergente, veras un boton rojo que dice <span className="inline-flex items-center"><Button variant="destructive" size="sm" disabled><Ban className="mr-2 h-4 w-4" />Cancelar Tarea</Button></span>.
                    </li>
                    <li>
                        <strong>Enviar la Orden de Cancelacion:</strong> Al hacer clic en ese boton, el panel envia una "señal de cancelacion" al servidor, que marca la tarea activa como `cancelado` en la base de datos.
                    </li>
                    <li>
                        <strong>El Agente se Detiene:</strong> En su siguiente punto de control, el agente en la PC cliente vera que la tarea ha sido cancelada, detendra su proceso, y reportara el estado de "Cancelado" al panel.
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
                    <p className="text-muted-foreground mt-1">Encuentre respuestas y tutoriales sobre como usar Softland Updater.</p>
                </div>
            </div>
        </header>

        <div className="flex-1 p-6">
            <Card>
                 <CardHeader className="border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar en la documentacion..." 
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
