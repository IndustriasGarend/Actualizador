@echo off
setlocal

:: =================================================================
:: Instalador del Servicio del Agente de Clic Actualizador Tools
:: =================================================================

:: Solicita privilegios de administrador si no los tiene
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Solicitando privilegios de administrador...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params= %*
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
pushd "%CD%"
CD /D "%~dp0"

cls
echo =======================================================================
echo          Instalador del Agente de Clic Actualizador Tools
echo =======================================================================
echo.
echo Este script instalara el agente como un servicio de Windows.
echo.

:: Ejecuta el script de PowerShell
echo Ejecutando el script de configuracion de PowerShell...
PowerShell.exe -NoProfile -ExecutionPolicy Bypass -File ".\install-service.ps1"

:: Revisa si PowerShell devolvio un error
if %ERRORLEVEL% neq 0 (
    echo.
    echo ------------------------------------------------------
    echo  LA INSTALACION FALLO.
    echo  Revisa el mensaje de error de arriba para mas detalles.
    echo ------------------------------------------------------
) else (
    echo.
    echo ------------------------------------------------------
    echo  INSTALACION COMPLETADA.
    echo  El servicio "Clic Actualizador Tools Agent" esta corriendo.
    echo  (Puedes cerrar esta ventana)
    echo ------------------------------------------------------
)

echo.
pause
exit
