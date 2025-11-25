@echo off
setlocal

:: ============================================================================
:: Script de Instalacion del Agente de Softland Updater
:: ============================================================================

:: Configuración
set "SERVICE_NAME=SoftlandUpdaterAgent"
set "SCRIPT_DIR=%~dp0"
set "POWERSHELL_SCRIPT=%SCRIPT_DIR%install-service.ps1"

:: Encabezado
echo.
echo =============================================================
echo    Instalador del Agente de Softland Updater
echo =============================================================
echo.
echo Este script instalara el agente como un servicio de Windows.
echo.

:run_powershell
echo Ejecutando el script de configuracion de PowerShell...
echo.

:: Ejecutar el script de PowerShell sin restricciones y capturar la salida
powershell -NoProfile -ExecutionPolicy Bypass -File "%POWERSHELL_SCRIPT%" -ServiceName "%SERVICE_NAME%"
set "ps_errorlevel=%errorlevel%"

echo.
echo ------------------------------------------------------

:: Verificar si PowerShell reportó un error (errorlevel no es 0)
if %ps_errorlevel% neq 0 (
    echo.
    echo  LA INSTALACION FALLO.
    echo  Revisa el mensaje de error de arriba para mas detalles.
    echo.
) else (
    echo.
    echo  INSTALACION COMPLETADA CON EXITO.
    echo.
    echo  --> SIGUIENTE PASO IMPORTANTE:
    echo.
    echo  1. Abra la consola de Servicios (services.msc).
    echo  2. Busque el servicio "Softland Updater Agent".
    echo  3. En Propiedades > Iniciar sesion, cambie la cuenta a un
    echo     usuario de dominio con acceso a la red.
    echo.
)

echo ------------------------------------------------------
echo.
pause
exit /b
