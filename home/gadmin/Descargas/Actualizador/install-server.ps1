# install-server.ps1
# Script de PowerShell para instalar y configurar el servidor de Softland Updater en Windows.
# Se debe ejecutar con privilegios de Administrador.

# --- Configuracion ---
$AppName = "softland-updater-server"
$NodePort = 9002

# --- Funciones de Ayuda ---
function Write-Host-Color($Message, $Color) {
    Write-Host $Message -ForegroundColor $Color
}

# =============================================================================
# --- INICIO DEL SCRIPT ---
# =============================================================================

Clear-Host
Write-Host-Color "=== Iniciando Instalacion del Servidor Softland Updater en Windows ===" -Color Green

# --- Paso 1: Verificar prerrequisitos ---
Write-Host-Color "`n[1/6] Verificando prerrequisitos..." -Color Yellow
$nodePath = Get-Command node.exe -ErrorAction SilentlyContinue
$npmPath = Get-Command npm.cmd -ErrorAction SilentlyContinue

if (-not $nodePath) {
    Write-Host-Color "Error: Node.js no esta instalado. Por favor, instalalo y vuelve a intentarlo." -Color Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
if (-not $npmPath) {
    Write-Host-Color "Error: npm no esta instalado. Por favor, instalalo y vuelve a intentarlo." -Color Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host "Node.js y npm encontrados."
node --version
npm --version

# --- Paso 2: Instalar PM2 (Process Manager) ---
Write-Host-Color "`n[2/6] Verificando el gestor de procesos PM2..." -Color Yellow
$pm2Path = Get-Command pm2.cmd -ErrorAction SilentlyContinue
if (-not $pm2Path) {
    Write-Host "PM2 no encontrado. Instalando PM2 globalmente..."
    try {
        npm install pm2 -g
        Write-Host-Color "PM2 instalado correctamente." -Color Green
    } catch {
        Write-Host-Color "Error: Fallo la instalacion de PM2. Verifica tu conexion a internet y vuelve a intentarlo." -Color Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
} else {
    Write-Host "PM2 ya esta instalado."
}

# --- Paso 3: Instalar dependencias del proyecto ---
Write-Host-Color "`n[3/6] Instalando dependencias del proyecto con npm..." -Color Yellow
try {
    npm install
    Write-Host-Color "Dependencias instaladas correctamente." -Color Green
} catch {
    Write-Host-Color "Error: Fallo 'npm install'. Revisa los errores e intentalo de nuevo." -Color Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- Paso 4: Construir la aplicacion para produccion ---
Write-Host-Color "`n[4/6] Construyendo la aplicacion Next.js para produccion..." -Color Yellow
try {
    npm run build
    Write-Host-Color "Aplicacion construida correctamente." -Color Green
} catch {
    Write-Host-Color "Error: Fallo 'npm run build'. Revisa los errores de compilacion e intentalo de nuevo." -Color Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- Paso 5: Iniciar la aplicacion con PM2 ---
Write-Host-Color "`n[5/6] Iniciando la aplicacion con PM2..." -Color Yellow
# Detener cualquier instancia previa con el mismo nombre
pm2 delete $AppName --silent

try {
    # Iniciar el servidor de Next.js en el puerto especificado
    pm2 start npm --name $AppName -- --start -p $NodePort
    Write-Host-Color "Servidor iniciado correctamente con PM2 bajo el nombre '$AppName'." -Color Green
    Write-Host "Puedes ver los logs con: pm2 logs $AppName"
    Write-Host "Puedes ver el estado con: pm2 status"
} catch {
    Write-Host-Color "Error: Fallo al iniciar la aplicacion con PM2." -Color Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- Paso 6: Configurar PM2 para inicio automatico en el arranque del sistema ---
Write-Host-Color "`n[6/6] Configurando PM2 para reinicio automatico..." -Color Yellow
pm2 save
$startupResult = pm2 startup
Write-Host $startupResult
if ($LASTEXITCODE -eq 0) {
    Write-Host-Color "`n¡Instalacion completada!" -Color Green
    Write-Host-Color "El servidor Softland Updater esta ahora en ejecucion y se reiniciara automaticamente." -Color Green
} else {
    Write-Host-Color "`nAdvertencia: No se pudo configurar el inicio automatico de PM2." -Color Yellow
    Write-Host-Color "Es posible que necesites ejecutar manualmente el comando que PM2 sugirio arriba en una nueva terminal de administrador." -Color Yellow
}

Write-Host-Color "`n=== Fin del Proceso de Instalacion ===" -Color Green
Read-Host "Presiona Enter para cerrar esta ventana"
