@echo off
:: =======================================================================
::          Instalador del Agente de Clic Actualizador Tools
:: =======================================================================
::
:: Este script es un contenedor para ejecutar el script de PowerShell 
:: principal con los permisos necesarios.

echo =======================================================================
echo          Instalador del Agente de Clic Actualizador Tools
echo =======================================================================
echo.
echo Este script instalara el agente como un servicio de Windows.
echo.

:: Obtener la ruta del directorio actual
set "current_dir=%~dp0"

:: Comando de PowerShell a ejecutar
set "ps_command=Powershell -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process Powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ""%current_dir%install-service.ps1""' -Verb RunAs}" "

:: Ejecutar el comando
echo Ejecutando el script de configuracion de PowerShell...
%ps_command%

:: Verificar el código de salida
if %errorlevel% neq 0 (
    echo.
    echo ------------------------------------------------------
    echo  INSTALACION INTERRUMPIDA.
    echo  El script de PowerShell no pudo ejecutarse.
    echo  Asegurese de aceptar la solicitud de permisos de Administrador (UAC).
    echo ------------------------------------------------------
)

echo.
pause
