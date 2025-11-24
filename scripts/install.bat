@echo off
:: =================================================================
:: Script de Instalación del Agente de Softland Updater
:: =================================================================
:: Este script simplifica la instalación del agente en una PC cliente.
:: 1. Verifica y solicita permisos de Administrador si es necesario.
:: 2. Configura la política de ejecución de PowerShell temporalmente.
:: 3. Llama al script de PowerShell que realiza la instalación real.
:: =================================================================

echo.
echo =======================================================
echo ==    Instalador del Agente - Softland Updater       ==
echo =======================================================
echo.

:: --- 1. Verificar Permisos de Administrador ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Solicitando permisos de Administrador...
    goto UACPrompt
) else (
    goto gotAdmin
)

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params = %*:"="
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"


:: --- 2. Ejecutar el script de PowerShell ---
echo Iniciando el script de instalacion de PowerShell...
echo Se te pedira un usuario y contrasena para el servicio.
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& './install-service.ps1'"

echo.
echo Proceso de script de PowerShell finalizado.
echo.

:: --- Finalización ---
popd
pause
exit

    