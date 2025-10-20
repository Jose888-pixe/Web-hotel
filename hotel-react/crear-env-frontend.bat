@echo off
echo Creando archivo .env para el FRONTEND...
echo.

(
echo PORT=3003
echo REACT_APP_API_URL=http://localhost:3001
) > .env

echo.
echo ✅ Archivo .env creado exitosamente en hotel-react!
echo.
echo Contenido:
type .env
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
