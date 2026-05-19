@echo off
setlocal

set "ROOT=%~dp0"
set "ROOT_NO_SLASH=%ROOT:~0,-1%"

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo No se encontro powershell.exe en el PATH.
  echo.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%ROOT%src\crear-acceso-escritorio.ps1" -ProjectRoot "%ROOT_NO_SLASH%"

if errorlevel 1 (
  echo.
  echo No se pudo crear el acceso directo.
  echo.
  pause
  exit /b 1
)

echo.
pause
