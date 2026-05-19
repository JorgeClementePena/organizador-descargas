@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js en el PATH.
  echo Instala Node.js o abre esta carpeta desde una terminal donde node funcione.
  echo.
  pause
  exit /b 1
)

:menu
cls
echo Organizador de descargas
echo ========================
echo.
echo Carpeta del proyecto: %ROOT%
echo.
echo 1. Simular organizacion ^(no mueve nada^)
echo 2. Organizar descargas ahora
echo 3. Ver lotes para deshacer
echo 4. Simular deshacer ultimo lote ^(no mueve nada^)
echo 5. Deshacer ultimo lote
echo 0. Salir
echo.
set "OPTION="
set /p "OPTION=Elige una opcion: "

if "%OPTION%"=="1" goto dryrun
if "%OPTION%"=="2" goto apply
if "%OPTION%"=="3" goto undolist
if "%OPTION%"=="4" goto undodryrun
if "%OPTION%"=="5" goto undo
if "%OPTION%"=="0" goto end

echo.
echo Opcion no valida.
pause
goto menu

:dryrun
cls
node src\app.js --dry-run
echo.
pause
goto menu

:apply
cls
node src\app.js --dry-run
echo.
set /p "CONFIRM=Quieres ejecutar estos movimientos de verdad? Escribe SI: "
if /i not "%CONFIRM%"=="SI" goto cancelled
echo.
node src\app.js --apply
echo.
pause
goto menu

:undolist
cls
node src\undo.js --list
echo.
pause
goto menu

:undodryrun
cls
node src\undo.js --dry-run
echo.
pause
goto menu

:undo
cls
node src\undo.js --dry-run
echo.
set /p "CONFIRM=Quieres deshacer el ultimo lote de verdad? Escribe SI: "
if /i not "%CONFIRM%"=="SI" goto cancelled
echo.
node src\undo.js
echo.
pause
goto menu

:cancelled
echo.
echo Operacion cancelada.
pause
goto menu

:end
endlocal
