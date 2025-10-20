# 🏨 Azure Suites Hotel - Sistema de Gestión Hotelera

Sistema completo de gestión hotelera desarrollado con React y Node.js, que incluye gestión de habitaciones, reservas, usuarios y un panel administrativo completo.

![Azure Suites](https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Roles y Permisos](#-roles-y-permisos)
- [Funcionalidades](#-funcionalidades)
- [Credenciales de Prueba](#-credenciales-de-prueba)

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **Sistema de Autenticación**: Login/Registro con JWT
- **Gestión de Habitaciones**: CRUD completo con imágenes
- **Sistema de Reservas**: Calendario interactivo con validación de disponibilidad
- **Panel Administrativo**: Dashboard con estadísticas y gestión completa
- **Panel de Operador**: Gestión de reservas y check-in/check-out
- **Gestión de Imágenes**: Upload de fotos reales con drag & drop
- **Sistema de Pagos**: Integración con modal de pago
- **Notificaciones**: Alertas personalizadas con animaciones
- **Responsive Design**: Optimizado para móviles y tablets

### 🎨 Características de UI/UX

- Diseño moderno con gradientes y animaciones
- Tema oscuro/claro adaptable
- Navegación intuitiva con smooth scroll
- Modales interactivos
- Feedback visual en todas las acciones
- Calendario personalizado con drag & drop

---

## 🛠 Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **React Router DOM** - Navegación
- **React Bootstrap** - Componentes UI
- **Axios** - Cliente HTTP
- **Font Awesome** - Iconos
- **CSS3** - Estilos personalizados

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Sequelize** - ORM
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **CORS** - Manejo de peticiones cross-origin

### Herramientas
- **npm** - Gestor de paquetes
- **Git** - Control de versiones
- **VS Code** - Editor recomendado

---

## 📦 Instalación

### Prerrequisitos

- Node.js >= 14.0.0
- npm >= 6.0.0

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/azure-suites-hotel.git
cd azure-suites-hotel/Web-hotel
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
```

4. **Configurar variables de entorno**
```bash
# En backend/
cp .env.example .env
```

5. **Inicializar la base de datos**
```bash
cd backend
npm run seed
```

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
PORT=3001
JWT_SECRET=tu_clave_secreta_muy_segura
NODE_ENV=development
DB_PATH=./database.sqlite
```

### Base de Datos

La base de datos SQLite se crea automáticamente al ejecutar el seed:

```bash
npm run seed
```

Esto creará:
- 3 usuarios (Admin, Operador, Visitante)
- 26 habitaciones de diferentes tipos
- 2 reservas de ejemplo

---

## 🚀 Uso

### Iniciar el Backend

```bash
cd backend
npm start
```

El servidor estará disponible en `http://localhost:3001`

### Iniciar el Frontend

```bash
cd frontend
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

#### Backend
```bash
npm start          # Iniciar servidor
npm run dev        # Iniciar con nodemon
npm run seed       # Poblar base de datos
npm run reset-db   # Resetear base de datos
```

#### Frontend
```bash
npm start          # Iniciar en desarrollo
npm run build      # Compilar para producción
npm test           # Ejecutar tests
npm run eject      # Exponer configuración
```

---

## 📁 Estructura del Proyecto

```
azure-suites-hotel/
└── Web-hotel/
    ├── backend/                 # Backend (Node.js + Express)
    │   ├── config/
    │   │   └── database.js      # Configuración de Sequelize
    │   ├── models/
    │   │   ├── User.js          # Modelo de usuarios
    │   │   ├── Room.js          # Modelo de habitaciones
    │   │   └── Reservation.js   # Modelo de reservas
    │   ├── middleware/
    │   │   └── auth.js          # Middleware de autenticación
    │   ├── services/
    │   │   ├── emailService.js
    │   │   └── cronService.js
    │   ├── scripts/
    │   │   └── seed.js          # Script de población de datos
    │   ├── server.js            # Punto de entrada
    │   └── package.json
    │
    └── frontend/                # Frontend (React)
    ├── public/
    ├── src/
    │   ├── components/          # Componentes reutilizables
    │   │   ├── Navigation.jsx
    │   │   ├── Footer.jsx
    │   │   ├── LoginModal.jsx
    │   │   ├── RegisterModal.jsx
    │   │   ├── ReservationModal.jsx
    │   │   ├── PaymentModal.jsx
    │   │   ├── CustomAlert.jsx
    │   │   ├── DatePicker.jsx
    │   │   ├── FileUpload.jsx
    │   │   └── ReservationDetailsModal.jsx
    │   │
    │   ├── pages/               # Páginas principales
    │   │   ├── HomePage.jsx
    │   │   ├── RoomDetailsPage.jsx
    │   │   ├── ReservationsPage.jsx
    │   │   ├── AdminPage.jsx
    │   │   └── OperatorPage.jsx
    │   │
    │   ├── styles/              # Estilos CSS
    │   │   ├── global.css
    │   │   ├── App.css
    │   │   ├── AdminPage.css
    │   │   ├── DatePicker.css
    │   │   ├── FileUpload.css
    │   │   └── CustomAlert.css
    │   │
    │   ├── context/             # Contextos de React
    │   │   └── AuthContext.jsx
    │   │
    │   ├── hooks/               # Custom Hooks
    │   │   └── useWebStorage.js
    │   │
    │   ├── services/            # Servicios API
    │   │   └── api.js
    │   │
    │   ├── App.jsx              # Componente principal
    │   └── index.jsx            # Punto de entrada
    │
    └── package.json
```

---

## 🔌 API Endpoints

### Autenticación

```http
POST   /api/auth/register       # Registrar usuario
POST   /api/auth/login          # Iniciar sesión
GET    /api/auth/me             # Obtener usuario actual
```

### Habitaciones

```http
GET    /api/rooms               # Listar habitaciones
GET    /api/rooms/:id           # Obtener habitación
POST   /api/rooms               # Crear habitación (Admin)
PUT    /api/rooms/:id           # Actualizar habitación (Admin)
DELETE /api/rooms/:id           # Eliminar habitación (Admin)
GET    /api/rooms/:id/availability  # Verificar disponibilidad
```

### Reservas

```http
GET    /api/reservations        # Listar reservas
GET    /api/reservations/:id    # Obtener reserva
POST   /api/reservations        # Crear reserva
PUT    /api/reservations/:id    # Actualizar reserva
DELETE /api/reservations/:id    # Cancelar reserva
PATCH  /api/reservations/:id/status  # Cambiar estado
```

### Usuarios

```http
GET    /api/users               # Listar usuarios (Admin)
GET    /api/users/:id           # Obtener usuario (Admin)
PUT    /api/users/:id           # Actualizar usuario (Admin)
DELETE /api/users/:id           # Eliminar usuario (Admin)
```

---

## 👥 Roles y Permisos

### Admin (Administrador)
- ✅ Acceso completo al sistema
- ✅ Gestión de habitaciones (CRUD)
- ✅ Gestión de reservas (CRUD)
- ✅ Gestión de usuarios (CRUD)
- ✅ Subir imágenes de habitaciones
- ✅ Ver estadísticas y dashboard
- ✅ Configurar disponibilidad

### Operator (Operador)
- ✅ Ver habitaciones
- ✅ Gestionar reservas
- ✅ Check-in / Check-out
- ✅ Cambiar estado de reservas
- ✅ Ver calendario de ocupación
- ❌ No puede modificar habitaciones
- ❌ No puede gestionar usuarios

### Visitor (Usuario/Cliente)
- ✅ Ver habitaciones disponibles
- ✅ Crear reservas
- ✅ Ver sus propias reservas
- ✅ Cancelar sus reservas
- ❌ No puede ver reservas de otros
- ❌ No tiene acceso administrativo

---

## 🎯 Funcionalidades

### 1. Sistema de Autenticación

#### Registro de Usuario
- Formulario con validación
- Encriptación de contraseñas con bcrypt
- Generación automática de JWT
- Feedback visual de éxito/error

#### Inicio de Sesión
- Validación de credenciales
- Token JWT almacenado en localStorage
- Redirección según rol
- Sesión persistente

### 2. Gestión de Habitaciones

#### Visualización
- Grid responsive de habitaciones
- Filtros por tipo (Individual, Doble, Suite, Deluxe, Presidencial)
- Badges de estado (Disponible, Ocupada, Mantenimiento)
- Imágenes con efecto hover
- Precio destacado

#### Detalles de Habitación
- Carousel de imágenes
- Información completa (capacidad, tamaño, piso)
- Lista de amenidades con iconos
- Botón de reserva
- Políticas del hotel

#### Administración (Admin)
- Crear nuevas habitaciones
- Editar información existente
- Cambiar estado (disponible, mantenimiento, limpieza)
- Subir múltiples imágenes
- Configurar opciones de visualización
- Eliminar habitaciones

### 3. Sistema de Reservas

#### Calendario Interactivo
- Visualización mensual
- Fechas ocupadas marcadas
- Selección de rango (check-in/check-out)
- Validación de disponibilidad en tiempo real
- Smooth scroll entre meses
- Leyenda de colores

#### Crear Reserva
- Formulario con validación
- Selección de fechas con calendario
- Cálculo automático de precio
- Selección de huéspedes (adultos/niños)
- Notas adicionales
- Confirmación visual

#### Gestión de Reservas
- Lista de todas las reservas
- Filtros por estado
- Búsqueda por número de reserva
- Detalles completos en modal
- Cambio de estado (Operador/Admin)
- Cancelación con confirmación

### 4. Panel Administrativo

#### Dashboard
- Estadísticas en tiempo real
- Habitaciones disponibles/ocupadas
- Reservas pendientes/confirmadas
- Ingresos totales
- Gráficos visuales

#### Gestión de Habitaciones
- Tabla con todas las habitaciones
- Acciones rápidas (Editar, Eliminar, Upload)
- Modal de edición completo
- Sistema de imágenes con preview
- Cambio de estado rápido

#### Gestión de Reservas
- Tabla de todas las reservas
- Filtros avanzados
- Cambio de estado
- Detalles completos
- Historial de cambios

#### Gestión de Usuarios
- Lista de usuarios registrados
- Roles y permisos
- Editar información
- Desactivar/Activar usuarios
- Estadísticas por usuario

### 5. Sistema de Imágenes

#### Upload de Imágenes
- Drag & Drop funcional
- Soporte para múltiples archivos
- Preview instantáneo
- Validación de tipo y tamaño
- Barra de progreso
- Almacenamiento en localStorage

#### Configuración de Visualización
- Mostrar en página principal
- Mostrar en detalles de habitación
- Ambas opciones simultáneas
- Badge "Foto Real" en HomePage
- Carousel en RoomDetails

#### Galería de Imágenes
- Vista previa de todas las imágenes
- Información de tamaño
- Badges de ubicación
- Eliminar con confirmación
- Hover effects

### 6. Notificaciones y Feedback

#### Custom Alerts
- Diseño personalizado
- Animaciones suaves
- Auto-dismiss configurable
- Posición fixed top
- Variantes (success, error, warning, info)
- Iconos contextuales

#### Confirmaciones
- Modales de confirmación
- Mensajes descriptivos
- Botones de acción claros
- Prevención de acciones accidentales

### 7. Responsive Design

#### Mobile First
- Diseño optimizado para móviles
- Touch events en componentes
- Menú hamburguesa
- Cards apiladas
- Formularios adaptables

#### Tablet & Desktop
- Grid responsive
- Sidebar en admin
- Tablas con scroll horizontal
- Modales centrados
- Navegación completa

---

## 🔐 Credenciales de Prueba

### Administrador
```
Email: admin@hotelelegance.com
Password: admin123
```

### Operador
```
Email: operator@hotelelegance.com
Password: operator123
```

### Usuario/Visitante
```
Email: juan@example.com
Password: visitor123
```

---

## 🎨 Paleta de Colores

```css
/* Colores Principales */
--primary-color: #005187      /* Azul principal */
--secondary-color: #f4f4f4    /* Gris claro */
--accent-color: #d4af37       /* Dorado */

/* Colores de Estado */
--success: #28a745            /* Verde */
--danger: #dc3545             /* Rojo */
--warning: #ffc107            /* Amarillo */
--info: #17a2b8               /* Azul claro */

/* Texto */
--text-dark: #1a1a1a          /* Negro suave */
--text-light: #6c757d         /* Gris medio */
```

---

## 📱 Capturas de Pantalla

### Página Principal
![HomePage](docs/screenshots/homepage.png)

### Panel Administrativo
![AdminPanel](docs/screenshots/admin-panel.png)

### Sistema de Reservas
![Reservations](docs/screenshots/reservations.png)

### Detalles de Habitación
![RoomDetails](docs/screenshots/room-details.png)

---

## 🐛 Solución de Problemas

### Error: Puerto ya en uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Error: Base de datos bloqueada
```bash
cd Web-hotel
rm database.sqlite
npm run seed
```

### Error: Módulos no encontrados
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🚧 Roadmap

### Próximas Funcionalidades

- [ ] Sistema de pagos real (Stripe/PayPal)
- [ ] Notificaciones por email
- [ ] Chat en vivo con soporte
- [ ] Sistema de reseñas y calificaciones
- [ ] Multi-idioma (i18n)
- [ ] Exportar reportes PDF
- [ ] Integración con Google Maps
- [ ] Sistema de descuentos y promociones
- [ ] App móvil (React Native)
- [ ] Panel de analíticas avanzado

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@example.com

---

## 🙏 Agradecimientos

- React Team por la increíble biblioteca
- Bootstrap por los componentes UI
- Font Awesome por los iconos
- Unsplash por las imágenes de alta calidad
- Comunidad de Stack Overflow

---

## 📞 Soporte

Si tienes alguna pregunta o problema:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Busca en [Issues](https://github.com/tu-usuario/azure-suites-hotel/issues)
3. Crea un nuevo Issue si es necesario
4. Contacta por email: soporte@azuresuites.com

---

## 📊 Estado del Proyecto

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/react-18.0.0-blue)
![Node](https://img.shields.io/badge/node-14.0.0-green)

---

**Desarrollado con ❤️ para Azure Suites Hotel**

*Última actualización: Octubre 2025*
