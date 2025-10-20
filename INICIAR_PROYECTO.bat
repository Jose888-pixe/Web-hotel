@echo off
color 0A
echo ========================================
echo   AZURE SUITES - INICIAR PROYECTO
echo ========================================
echo.

REM Verificar si existe .env en la raiz
if not exist ".env" (
    echo ❌ ERROR: No existe el archivo .env en la raiz
    echo.
    echo Ejecuta primero: crear-env-backend.bat
    echo.
    pause
    exit /b 1
)

REM Verificar si existe .env en hotel-react
if not exist "hotel-react\.env" (
    echo ❌ ERROR: No existe el archivo .env en hotel-react
    echo.
    echo Ejecuta primero: hotel-react\crear-env-frontend.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Archivos .env encontrados
echo.
echo ========================================
echo   INICIANDO BACKEND (Puerto 3001)
echo ========================================
echo.
echo Abriendo nueva terminal para el BACKEND...
start "BACKEND - Azure Suites" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   INICIANDO FRONTEND (Puerto 3003)
echo ========================================
echo.
echo Abriendo nueva terminal para el FRONTEND...
start "FRONTEND - Azure Suites" cmd /k "cd hotel-react && npm start"

echo.
echo ========================================
echo   ✅ PROYECTO INICIADO
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3003
echo.
echo Espera unos segundos a que ambos servicios inicien...
echo El navegador se abrira automaticamente en http://localhost:3003
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
