@echo off
cls

echo Este script instalara el agente como un servicio de Windows.
echo Se requeriran credenciales de administrador para configurar el servicio.
echo.
pause

set "params=-NoProfile -ExecutionPolicy Bypass -File ""%~dp0install-service.ps1"""
powershell -Command "Start-Process powershell -ArgumentList '%params%' -Verb RunAs" >NUL 2>&1

echo.
echo El proceso de instalacion ha sido lanzado en una nueva ventana.
echo Puede cerrar esta ventana ahora.
echo.
pause
