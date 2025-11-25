# Softland Auto Updater

**Softland Auto Updater** es una aplicación web diseñada para operar en una red local (on-premise) que permite a los administradores de sistemas monitorear, gestionar y desplegar actualizaciones del software Softland ERP de forma centralizada a múltiples PCs clientes.

El sistema consta de un panel de control central (este proyecto) y un agente liviano que se instala en cada PC cliente.

---

## Arquitectura del Sistema

- **Panel de Control (Servidor):**
  - **Framework:** Next.js con React (App Router).
  - **UI:** ShadCN UI y Tailwind CSS.
  - **Base de Datos:** SQLite para persistencia de datos (PCs, logs, configuración). Se almacena en un archivo `softland-updater.db` en la raíz del proyecto.
  - **Entorno de Ejecución:** Node.js.
  - **Gestor de Procesos (Recomendado):** PM2 para mantener el servidor funcionando de forma persistente.

- **Agente (Cliente):**
  - **Lenguaje:** PowerShell.
  - **Funcionalidad:** Se instala como un servicio de Windows. Contacta periódicamente al servidor para buscar tareas (actualizar Softland, auto-actualizarse), ejecuta las tareas y reporta el estado y los logs.
  - **Instalación:** A través de un paquete `.zip` que contiene un script de instalación (`install.bat`).

---

## Requisitos del Sistema

### Para el Servidor (Panel de Control)

- **Sistema Operativo:**
  - Linux (Ubuntu Server 20.04+ recomendado).
  - Windows Server 2019+.
- **Software:**
  - **Node.js:** v18.17.0 o superior.
  - **npm** (usualmente incluido con Node.js).
- **Recursos:** Mínimo 1 CPU, 512MB RAM.

### Para las PCs Clientes (donde se instala el Agente)

- **Sistema Operativo:** Windows 10 o superior.
- **Software:** PowerShell 5.1 o superior (incluido por defecto en Windows 10).
- **Permisos:** Se necesitan credenciales de una cuenta con permisos de administrador local para instalar el servicio del agente.

---

## Instrucciones de Instalación y Ejecución

### 1. Instalación del Servidor (Panel de Control)

Descargue o clone este proyecto en su servidor.

#### En Ubuntu Server:

1.  Asegúrese de tener Node.js y npm instalados.
2.  Navegue a la carpeta del proyecto.
3.  Ejecute el script de instalación. Este instalará dependencias, `pm2` (un gestor de procesos), construirá el proyecto para producción y lo iniciará.

    ```bash
    chmod +x install-server.sh
    ./install-server.sh
    ```
4.  El script configurará la aplicación para que se inicie automáticamente tras reinicios del servidor.
5.  **Acceso:** Por defecto, la aplicación se ejecutará en el puerto 9002. Acceda a ella desde un navegador en `http://<IP_DEL_SERVIDOR>:9002`.

#### En Windows Server:

1.  Asegúrese de tener Node.js y npm instalados.
2.  Abra una terminal de **PowerShell como Administrador**.
3.  Navegue a la carpeta del proyecto.
4.  Ejecute el script de instalación de PowerShell. Este instalará dependencias, `pm2`, construirá el proyecto y lo configurará como un servicio persistente.

    ```powershell
    # Permite la ejecución de scripts locales en esta sesión
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    
    # Ejecuta el instalador
    .\install-server.ps1
    ```
5.  El script se encargará de todo. La aplicación se iniciará automáticamente y se reiniciará si el servidor se reinicia.
6.  **Acceso:** Por defecto, la aplicación se ejecutará en el puerto 9002. Acceda a ella en `http://<IP_DEL_SERVIDOR>:9002`.


### 2. Configuración Inicial

1.  Abra el panel de control en su navegador.
2.  Vaya a la sección **Configuración**.
3.  Rellene todos los **Parámetros Generales**. Estos son cruciales para que los agentes sepan de dónde descargar las actualizaciones y cómo instalarlas. Guarde la configuración.

### 3. Instalación del Agente en una PC Cliente

1.  En el panel de control, vaya a **Configuración** y haga clic en **"Descargar Instalador del Agente (.zip)"**. Esto descargará un paquete genérico.
2.  Copie y descomprima este archivo `.zip` en una carpeta permanente en la PC cliente (ej. `C:\SoftlandAgent`).
3.  Ejecute el archivo `install.bat` como Administrador (clic derecho -> Ejecutar como administrador).
4.  La consola le pedirá **la URL del servidor** (ej. `http://192.168.1.100:9002`).
5.  A continuación, le pedirá las **credenciales de una cuenta de servicio** (ej. `DOMINIO\usuario`) que tenga permisos de administrador en esa PC.
6.  El script instalará el servicio. La PC aparecerá automáticamente en el panel de control en unos instantes.
7.  Repita este proceso para todas las PCs que desee gestionar.

---

## Estructura del Proyecto

- `src/app/(app)/`: Contiene las páginas principales del panel de control (Dashboard, Configuración, Historial).
- `src/app/api/`: Endpoints de la API REST que usa el agente para comunicarse.
- `src/components/`: Componentes de React reutilizables.
  - `ui/`: Componentes base de ShadCN.
  - `dashboard/`, `configuracion/`, `historial/`: Componentes específicos para cada página.
  - `shared/`: Componentes reutilizados en múltiples páginas.
- `src/lib/`: Lógica de negocio principal.
  - `db.ts`: Configuración y conexión con la base de datos SQLite.
  - `types.ts`: Definiciones de tipos de TypeScript.
- `scripts/`: Contiene los templates para los scripts del agente (`.ps1`, `.bat`).
- `install-server.sh`: Script de instalación para servidores Linux.
- `install-server.ps1`: Script de instalación para servidores Windows.

---

## Dependencias Externas Clave

- **Next.js:** Framework de React para el frontend y backend.
- **ShadCN UI:** Colección de componentes de UI.
- **Tailwind CSS:** Framework de CSS para estilizado.
- **Lucide React:** Librería de íconos.
- **better-sqlite3:** Driver de SQLite para Node.js.
- **pm2:** Gestor de procesos para Node.js en producción.

---

## Licencia

Este proyecto es de uso interno y se distribuye sin una licencia de código abierto específica. Su uso está restringido a la organización para la que fue desarrollado.
