# 🚀 Guía Rápida de Deployment Local

## ✅ Configuración Inicial (Solo una vez)

### 1. Configurar Backend

Edita el archivo `.env` en la raíz del proyecto:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=tu_clave_secreta_super_segura
FRONTEND_URL=http://localhost:3003
EMAIL_HOST=
EMAIL_PORT=
EMAIL_SECURE=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="Azure Suites Hotel <noreply@azuresuites.com>"
```

**IMPORTANTE**: `DATABASE_URL=` debe estar VACÍO (sin valor después del =)

### 2. Configurar Frontend

Crea el archivo `hotel-react/.env`:

```env
REACT_APP_API_URL=http://localhost:3001
PORT=3003
```

---

## 🎯 Modo Desarrollo (Recomendado para trabajar)

### Terminal 1 - Backend:
```powershell
cd "c:\Users\aldoe\OneDrive\Documentos\Universidad\Lenguajes 4\Web-hotel\Web-hotel"
npm run dev
```

### Terminal 2 - Frontend:
```powershell
cd "c:\Users\aldoe\OneDrive\Documentos\Universidad\Lenguajes 4\Web-hotel\Web-hotel\hotel-react"
npm start
```

**Acceder a:**
- Frontend: http://localhost:3003
- Backend API: http://localhost:3001

---

## 🏭 Modo Producción Local

### Paso 1: Editar .env del backend

Cambia estas líneas en `.env`:
```env
NODE_ENV=production
FRONTEND_URL=http://localhost:3001
```

### Paso 2: Crear .env.production en frontend

Crea `hotel-react/.env.production`:
```env
REACT_APP_API_URL=http://localhost:3001
```

### Paso 3: Build y Deploy

```powershell
cd "c:\Users\aldoe\OneDrive\Documentos\Universidad\Lenguajes 4\Web-hotel\Web-hotel"
npm run build:prod
```

**Acceder a:** http://localhost:3001

---

## 🔧 Solución de Problemas

### Error: "Cannot read properties of null"
- Asegúrate que `DATABASE_URL=` esté vacío en `.env`

### Error: "Port 3000 already in use"
- Verifica que el archivo `hotel-react/.env` tenga `PORT=3003`

### Warnings de ESLint
- Son solo advertencias, no afectan la funcionalidad
- El proyecto compilará correctamente

---

## 👥 Usuarios de Prueba

- **Admin**: admin@hotelelegance.com / admin123
- **Operador**: operator@hotelelegance.com / operator123
- **Visitante**: juan@example.com / visitor123

---

## 📝 Comandos Útiles

```powershell
# Poblar base de datos
npm run seed

# Ver scripts disponibles
npm run

# Limpiar node_modules (si hay problemas)
rm -rf node_modules
npm install
```
