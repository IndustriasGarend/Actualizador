@echo off
:: install.bat
:: Script para instalar el servicio del Agente Softland Updater.
:: Este script debe ejecutarse como Administrador.

setlocal

:: --- Verificacion de Privilegios ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo.
    echo ======================================================
    echo  ERROR: Se requieren privilegios de Administrador.
    echo ======================================================
    echo.
    echo Por favor, haz clic derecho sobre este archivo y
    echo selecciona "Ejecutar como administrador".
    echo.
    goto :pause_and_exit
)

:: --- Inicio del Proceso ---
title Instalador del Agente Softland Updater
echo ======================================================
echo  Instalador del Agente Softland Updater
echo ======================================================
echo.
echo Este script instalara el agente como un servicio de Windows.
echo.

:: Obtiene la ruta del directorio donde se esta ejecutando el script
set "SCRIPT_DIR=%~dp0"
:: Quita la barra invertida final si existe
if %SCRIPT_DIR:~-1%==\ set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: --- Ejecucion del script de PowerShell ---
echo Ejecutando el script de configuracion de PowerShell...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%\install-service.ps1" -ScriptPath "%SCRIPT_DIR%"

:: Verifica si PowerShell termino con un error
if %errorlevel% NEQ 0 (
    echo.
    echo ------------------------------------------------------
    echo  LA INSTALACION FALLO.
    echo  Revisa el mensaje de error de arriba para mas detalles.
    echo ------------------------------------------------------
    echo.
) else (
    echo.
    echo ------------------------------------------------------
    echo  LA INSTALACION PARECE HABER SIDO EXITOSA.
    echo ------------------------------------------------------
    echo.
)

:pause_and_exit
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
exit
