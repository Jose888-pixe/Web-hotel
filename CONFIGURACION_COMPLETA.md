# 🔧 CONFIGURACIÓN COMPLETA - INSTRUCCIONES

## ⚠️ IMPORTANTE: Debes crear estos archivos MANUALMENTE

Los archivos `.env` están en `.gitignore`, por lo que debes crearlos tú mismo.

---

## 📁 Archivo 1: `.env` en la RAÍZ del proyecto

**Ruta:** `c:\Users\aldoe\OneDrive\Documentos\Universidad\Lenguajes 4\Web-hotel\Web-hotel\.env`

**Contenido:**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion
FRONTEND_URL=http://localhost:3003
EMAIL_HOST=
EMAIL_PORT=
EMAIL_SECURE=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="Azure Suites Hotel <noreply@azuresuites.com>"
```

**CRÍTICO:** La línea `DATABASE_URL=` debe estar VACÍA (sin nada después del =)

---

## 📁 Archivo 2: `.env` en la carpeta FRONTEND

**Ruta:** `c:\Users\aldoe\OneDrive\Documentos\Universidad\Lenguajes 4\Web-hotel\Web-hotel\hotel-react\.env`

**Contenido:**
```env
PORT=3003
REACT_APP_API_URL=http://localhost:3001
```

---

## 🚀 PASOS PARA EJECUTAR

### 1. Crear los archivos .env (MANUALMENTE)

Abre tu editor de texto y crea los dos archivos con el contenido exacto de arriba.

### 2. Abrir DOS terminales

### Terminal 1 - Backend:
```powershell
cd "c:\Users\aldoe\OneDrive\Documentos\Universidad\Lenguajes 4\Web-hotel\Web-hotel"
npm run dev
```

**Debes ver:**
```
🌟 Server running on http://localhost:3001
```

### Terminal 2 - Frontend:
```powershell
cd "c:\Users\aldoe\OneDrive\Documentos\Universidad\Lenguajes 4\Web-hotel\Web-hotel\hotel-react"
npm start
```

**Debes ver:**
```
Local: http://localhost:3003
```

### 3. Abrir el navegador

Ve a: **http://localhost:3003**

---

## ✅ Verificación

Si todo está correcto, verás:

✅ Backend en consola: `Server running on http://localhost:3001`
✅ Frontend en consola: `Local: http://localhost:3003`
✅ En el navegador: La página de Azure Suites cargando correctamente
✅ Sin errores de "Error al cargar las habitaciones"

---

## 🐛 Si algo falla

### Error: "Cannot read properties of null"
- Verifica que `DATABASE_URL=` esté VACÍO en el .env del backend

### Error: "Port 3001 already in use"
- Cierra cualquier proceso que esté usando ese puerto
- O cambia el puerto en el .env

### Frontend no carga habitaciones
- Verifica que el backend esté corriendo
- Verifica que `REACT_APP_API_URL=http://localhost:3001` esté en el .env del frontend

---

## 👥 Usuarios de Prueba

- **Admin**: admin@hotelelegance.com / admin123
- **Operador**: operator@hotelelegance.com / operator123
- **Visitante**: juan@example.com / visitor123
