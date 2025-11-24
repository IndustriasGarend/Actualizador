@echo off
cls
echo Este script instalara el agente como un servicio de Windows.
echo Se requeriran credenciales de administrador para configurar el servicio.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& {
    $scriptPath = (Get-Item -Path '.').FullName
    $installScript = Join-Path $scriptPath 'install-service.ps1'

    if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
        Start-Process powershell.exe -Verb RunAs -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File ""{0}""' -f $installScript)
    } else {
        & $installScript
    }
    Read-Host 'Presione Enter para cerrar esta ventana:'
}"
