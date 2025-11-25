@echo off
REM Script para instalar el servicio del agente de Softland Updater

echo Este script instalara el agente como un servicio de Windows.
echo Se requeriran credenciales de administrador para configurar el servicio.
echo.

set "SCRIPT_PATH=%~dp0"
set "POWERSHELL_SCRIPT_PATH=%SCRIPT_PATH%install-service.ps1"

REM Ejecutar el script de PowerShell como administrador
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process powershell.exe -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ""%POWERSHELL_SCRIPT_PATH%""' -Verb RunAs}" > NUL 2>&1
