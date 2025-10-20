@echo off
echo Creando archivo .env para el BACKEND...
echo.

(
echo PORT=3001
echo NODE_ENV=development
echo DATABASE_URL=
echo JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion
echo FRONTEND_URL=http://localhost:3003
echo EMAIL_HOST=
echo EMAIL_PORT=
echo EMAIL_SECURE=
echo EMAIL_USER=
echo EMAIL_PASSWORD=
echo EMAIL_FROM="Azure Suites Hotel <noreply@azuresuites.com>"
) > .env

echo.
echo ✅ Archivo .env creado exitosamente en la raiz del proyecto!
echo.
echo Contenido:
type .env
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
