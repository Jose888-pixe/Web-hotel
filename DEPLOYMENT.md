# 🚀 Guía de Deployment en Render.com

## ✅ Pre-requisitos Completados
- [x] Migración a PostgreSQL configurada
- [x] Variables de entorno configuradas
- [x] .gitignore creado
- [x] Proyecto listo para GitHub

---

## 📋 Paso 1: Subir a GitHub

### 1.1 Abrir GitHub Desktop
- Abre la aplicación GitHub Desktop que ya tienes instalada

### 1.2 Agregar el Repositorio
1. File → Add Local Repository
2. Selecciona la carpeta: `C:\Users\Choch\OneDrive\Desktop\Vs Code\Lenguajes IV\Web hotel`
3. Si dice "No Git repository found", click en "Create a repository"

### 1.3 Configurar el Repositorio
- **Name**: `hotel-azure-suites`
- **Description**: `Sistema de reservas de hotel con React y Node.js`
- **Local Path**: (ya está seleccionado)
- Click en "Create Repository"

### 1.4 Hacer el Primer Commit
1. Verás todos los archivos en la lista
2. En el campo "Summary", escribe: `Initial commit - Hotel reservation system`
3. Click en "Commit to main"
4. Click en "Publish repository" (arriba a la derecha)
5. **IMPORTANTE**: Desmarca "Keep this code private" si quieres que sea público
6. Click en "Publish Repository"

---

## 🌐 Paso 2: Crear Servicios en Render

### 2.1 Crear Base de Datos PostgreSQL

1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Login con tu cuenta (joseodriozolarieszer@gmail.com)
3. Click en "New +" → "PostgreSQL"
4. Configuración:
   - **Name**: `hotel-database`
   - **Database**: `hotel_db`
   - **User**: `hotel_user` (autocompletado)
   - **Region**: `Oregon (US West)` o el más cercano
   - **Plan**: **Free**
5. Click en "Create Database"
6. **IMPORTANTE**: Espera 2-3 minutos hasta que diga "Available"
7. Copia el "Internal Database URL" (lo necesitarás para el backend)

### 2.2 Crear Web Service (Backend)

1. Click en "New +" → "Web Service"
2. Selecciona "Build and deploy from a Git repository" → Next
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Busca y selecciona el repo `hotel-azure-suites`
5. Click en "Connect"

**Configuración del Backend:**
- **Name**: `hotel-backend`
- **Root Directory**: (dejar vacío)
- **Environment**: `Node`
- **Region**: Mismo que la base de datos
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free**

**Variables de Entorno** (Click en "Advanced" → "Add Environment Variable"):

```
NODE_ENV = production
PORT = 3001
JWT_SECRET = tu_secreto_super_seguro_cambiar_esto_12345
DATABASE_URL = [Pega aquí el Internal Database URL de tu base de datos]
```

6. Click en "Create Web Service"
7. Espera 5-10 minutos a que termine el build
8. **Copia la URL del backend** (algo como `https://hotel-backend-xxxx.onrender.com`)

### 2.3 Crear Static Site (Frontend)

1. Click en "New +" → "Static Site"
2. Selecciona tu repo `hotel-azure-suites`
3. Click en "Connect"

**Configuración del Frontend:**
- **Name**: `hotel-frontend`
- **Root Directory**: `hotel-react`
- **Branch**: `main`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

**Variables de Entorno:**
```
REACT_APP_API_URL = [Pega aquí la URL del backend que copiaste antes]
```

4. Click en "Create Static Site"
5. Espera 5-10 minutos a que termine el build

---

## 🔧 Paso 3: Configurar CORS en Backend

1. Ve al dashboard de Render → Tu servicio `hotel-backend`
2. Click en "Environment"
3. Agrega una nueva variable:
   ```
   FRONTEND_URL = [URL de tu frontend, ejemplo: https://hotel-frontend.onrender.com]
   ```
4. Click en "Save Changes"
5. El backend se reiniciará automáticamente

---

## 🗄️ Paso 4: Poblar la Base de Datos

### Opción A: Desde el Shell de Render (Recomendado)

1. Ve a tu servicio `hotel-backend` en Render
2. Click en "Shell" (en el menú lateral)
3. Ejecuta:
   ```bash
   npm run seed
   ```

### Opción B: Desde una herramienta SQL

1. En tu base de datos de Render, encuentra "External Database URL"
2. Usa una herramienta como pgAdmin o TablePlus para conectarte
3. Ejecuta los scripts SQL para crear usuarios y habitaciones iniciales

---

## ✅ Paso 5: Probar la Aplicación

1. Abre la URL de tu frontend: `https://hotel-frontend.onrender.com`
2. Prueba login con:
   - **Admin**: admin@hotelelegance.com / admin123
   - **Operador**: operator@hotelelegance.com / operator123
   - **Visitante**: juan@example.com / visitor123

---

## 🐛 Troubleshooting

### El backend no se conecta a la base de datos
- Verifica que el `DATABASE_URL` esté correctamente copiado
- Asegúrate de usar el "Internal Database URL" (no el External)

### El frontend no puede comunicarse con el backend
- Verifica que `REACT_APP_API_URL` tenga la URL correcta del backend
- Verifica que `FRONTEND_URL` en el backend tenga la URL correcta del frontend
- Asegúrate de incluir `https://` en las URLs

### Los servicios se duermen después de 15 minutos
- Es normal en el plan gratuito
- Se reactivan automáticamente cuando alguien accede
- La primera carga puede tardar ~30 segundos

### Errores de CORS
- Verifica que ambas URLs estén correctamente configuradas
- El backend debe tener la URL del frontend en `FRONTEND_URL`
- Reinicia el backend después de cambiar variables

---

## 📝 Notas Importantes

- **Primer acceso**: Puede tardar 30-60 segundos
- **Inactividad**: Los servicios gratuitos se duermen después de 15 minutos sin uso
- **Base de datos**: Los datos se mantienen, solo el servicio se duerme
- **Límites gratuitos**: 
  - 750 horas de servidor por mes (suficiente para 1 aplicación)
  - 100GB de ancho de banda
  - Base de datos con 1GB de almacenamiento

---

## 🎉 URLs Finales

Después del deployment, tendrás:
- **Frontend**: `https://hotel-frontend.onrender.com`
- **Backend API**: `https://hotel-backend-xxxx.onrender.com`
- **Base de Datos**: Interna, solo accesible por el backend

¡Tu aplicación está en producción! 🚀
