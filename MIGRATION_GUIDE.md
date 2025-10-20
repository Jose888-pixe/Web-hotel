# Guía de Migración: SQLite → PostgreSQL

Esta guía te ayudará a migrar tu base de datos de SQLite a PostgreSQL manteniendo todos tus datos.

## 📋 Requisitos Previos

- Tener Node.js instalado
- Tener acceso a tu base de datos SQLite local
- Tener una cuenta en Render.com

---

## 🚀 Paso 1: Crear Base de Datos PostgreSQL en Render

1. **Ir a Render Dashboard**
   - Ve a https://dashboard.render.com

2. **Crear nueva base de datos**
   - Click en "New +" → "PostgreSQL"
   - **Name:** `azure-suites-db` (o el nombre que prefieras)
   - **Database:** `hotel_db`
   - **User:** (se genera automáticamente)
   - **Region:** Selecciona la más cercana
   - **Plan:** Free (0$/mes)
   - Click en "Create Database"

3. **Esperar a que se cree** (1-2 minutos)

4. **Copiar la URL de conexión**
   - En la página de tu base de datos, busca "Connections"
   - Copia la **Internal Database URL** (empieza con `postgres://`)
   - Ejemplo: `postgres://user:password@dpg-xxxxx.oregon-postgres.render.com/hotel_db`

---

## 🔧 Paso 2: Exportar Datos de SQLite (Local)

En tu terminal, en la carpeta del proyecto:

```bash
cd backend
npm run export
```

Esto creará un archivo `backend/scripts/data-export.json` con todos tus datos.

**Verifica que se exportó correctamente:**
- Deberías ver un resumen de usuarios, habitaciones, reservas, etc.
- El archivo `data-export.json` debe existir en `backend/scripts/`

---

## 🔄 Paso 3: Configurar PostgreSQL Localmente

1. **Crear archivo `.env` en backend** (si no existe)

```bash
# En la carpeta backend, crea o edita .env
```

2. **Agregar la URL de PostgreSQL**

```env
# PostgreSQL Configuration
DATABASE_URL=postgres://user:password@dpg-xxxxx.oregon-postgres.render.com/hotel_db

# Other configurations
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_aqui
PORT=3001

# Email configuration (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
EMAIL_FROM=noreply@azuresuites.com
```

**⚠️ IMPORTANTE:** Reemplaza la `DATABASE_URL` con la que copiaste de Render.

---

## 📥 Paso 4: Importar Datos a PostgreSQL

```bash
npm run import
```

Esto:
1. Se conectará a PostgreSQL
2. Creará todas las tablas
3. Importará todos los datos de SQLite
4. Mantendrá las relaciones entre usuarios, habitaciones y reservas

**Verifica que se importó correctamente:**
- Deberías ver un resumen final con el conteo de registros
- Todos los números deben coincidir con la exportación

---

## 🌐 Paso 5: Configurar PostgreSQL en Producción (Render)

1. **Ir a tu servicio "Azure Suites" en Render**

2. **Ir a "Environment"**

3. **Agregar/Actualizar variables de entorno:**

```
NODE_ENV=production
DATABASE_URL=postgres://user:password@dpg-xxxxx.oregon-postgres.render.com/hotel_db
JWT_SECRET=tu_jwt_secret_seguro
FRONTEND_URL=https://azure-suites.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
EMAIL_FROM=noreply@azuresuites.com
```

4. **Guardar cambios**

5. **Manual Deploy**
   - Click en "Manual Deploy" → "Deploy latest commit"

---

## ✅ Paso 6: Verificar la Migración

### En Desarrollo (Local):

1. **Iniciar el servidor:**
```bash
npm run dev
```

2. **Verificar en el navegador:**
   - Ve a http://localhost:3003
   - Deberías ver todas tus habitaciones
   - Intenta hacer login con tus usuarios existentes
   - Verifica que las reservas estén presentes

### En Producción (Render):

1. **Esperar a que termine el deploy** (3-5 minutos)

2. **Visitar tu sitio:**
   - Ve a https://azure-suites.onrender.com
   - Verifica que todo funcione igual que en local

---

## 🔍 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que la `DATABASE_URL` sea correcta
- Asegúrate de usar la **Internal Database URL** de Render
- Verifica que la base de datos esté activa en Render

### Error: "Export file not found"
- Asegúrate de ejecutar `npm run export` primero
- Verifica que el archivo `backend/scripts/data-export.json` exista

### Los datos no aparecen
- Verifica que el import se completó sin errores
- Revisa los logs del servidor para ver si hay errores de conexión
- Asegúrate de que `NODE_ENV=production` esté configurado en Render

### Passwords no funcionan después de la migración
- Los passwords deberían funcionar igual
- Si no funcionan, puedes resetearlos desde el panel de admin

---

## 📊 Comandos Útiles

```bash
# Exportar datos de SQLite
npm run export

# Importar datos a PostgreSQL
npm run import

# Hacer ambos (migración completa)
npm run migrate

# Ver datos exportados
cat scripts/data-export.json
```

---

## 🎯 Ventajas de PostgreSQL

✅ **Datos persistentes** - No se pierden en redeploys
✅ **Mejor rendimiento** - Optimizado para producción
✅ **Escalabilidad** - Crece con tu aplicación
✅ **Backups automáticos** - Render hace backups diarios
✅ **Concurrencia** - Múltiples usuarios simultáneos

---

## ⚠️ Notas Importantes

1. **Backup de SQLite:** Guarda una copia de `hotel_elegance.db` antes de migrar
2. **Variables de entorno:** Nunca subas el archivo `.env` a GitHub
3. **Testing:** Prueba en desarrollo antes de migrar producción
4. **Rollback:** Si algo sale mal, puedes volver a SQLite eliminando `DATABASE_URL`

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema durante la migración:
1. Revisa los logs del servidor
2. Verifica las variables de entorno
3. Asegúrate de que la base de datos PostgreSQL esté activa en Render
