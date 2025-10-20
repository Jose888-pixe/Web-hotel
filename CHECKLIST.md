# ✅ CHECKLIST DE CONFIGURACIÓN

Marca cada paso a medida que lo completes:

## 📋 Configuración Inicial

- [ ] **Paso 1:** Ejecutar `crear-env-backend.bat` (o crear `.env` manualmente en la raíz)
- [ ] **Paso 2:** Ejecutar `hotel-react\crear-env-frontend.bat` (o crear `.env` en hotel-react)
- [ ] **Paso 3:** Verificar que `DATABASE_URL=` esté VACÍO en el .env del backend
- [ ] **Paso 4:** Ejecutar `npm run seed` para poblar la base de datos

## 🚀 Iniciar Aplicación

- [ ] **Opción A:** Ejecutar `INICIAR_PROYECTO.bat`
  
  **O**

- [ ] **Opción B - Terminal 1:** Ejecutar `npm run dev` en la raíz
- [ ] **Opción B - Terminal 2:** Ejecutar `npm start` en hotel-react

## ✅ Verificación

- [ ] Backend muestra: `🌟 Server running on http://localhost:3001`
- [ ] Frontend muestra: `Local: http://localhost:3003`
- [ ] Navegador abre automáticamente en `http://localhost:3003`
- [ ] La página principal carga sin errores
- [ ] Se ven las habitaciones en la sección "Nuestras Habitaciones"
- [ ] No hay error "Error al cargar las habitaciones"

## 🧪 Pruebas Funcionales

- [ ] Hacer clic en "Iniciar Sesión"
- [ ] Probar login con: `admin@hotelelegance.com` / `admin123`
- [ ] Verificar que se muestra el nombre del usuario en la barra de navegación
- [ ] Navegar a diferentes secciones (Habitaciones, Servicios, Contacto)
- [ ] Probar el formulario de contacto
- [ ] Cerrar sesión

## 🎯 Configuración de Puertos

Verifica que estos puertos estén correctos:

| Servicio | Puerto | Archivo de Configuración |
|----------|--------|--------------------------|
| Backend  | 3001   | `.env` (raíz) → `PORT=3001` |
| Frontend | 3003   | `hotel-react/.env` → `PORT=3003` |

## 🐛 Solución de Problemas

Si algo falla, verifica:

- [ ] Los archivos `.env` existen en ambas ubicaciones
- [ ] `DATABASE_URL=` está vacío (sin valor después del =)
- [ ] No hay otros procesos usando los puertos 3001 o 3003
- [ ] Ambas terminales están abiertas y corriendo
- [ ] No hay errores en las consolas de las terminales

## 📊 Estado Final

Si todos los checks están marcados, ¡tu aplicación está funcionando correctamente! 🎉

**URLs Importantes:**
- Frontend: http://localhost:3003
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

**Usuarios de Prueba:**
- Admin: `admin@hotelelegance.com` / `admin123`
- Operador: `operator@hotelelegance.com` / `operator123`
- Visitante: `juan@example.com` / `visitor123`
