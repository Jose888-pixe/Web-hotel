# 🏨 Azure Suites - Sistema de Reservas Hoteleras

Sistema completo de gestión y reservas hoteleras con arquitectura moderna, roles de usuario y base de datos PostgreSQL.

![Status](https://img.shields.io/badge/status-production-success)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB)
![Backend](https://img.shields.io/badge/backend-Node.js-339933)

## 🌐 Demo en Vivo

**URL:** [https://azure-suites.onrender.com](https://azure-suites.onrender.com)

### Credenciales de Prueba

- **Admin:** admin@azuresuites.com / admin123
- **Operador:** operator@azuresuites.com / operator123
- **Visitante:** juan@example.com / visitor123

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API](#-api)
- [Base de Datos](#-base-de-datos)
- [Deployment](#-deployment)
- [Contribución](#-contribución)

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **Sistema de Reservas Completo**
  - Búsqueda y filtrado de habitaciones
  - Calendario de disponibilidad
  - Gestión de check-in/check-out
  - Historial de reservas

- **Gestión de Habitaciones**
  - CRUD completo de habitaciones
  - Múltiples tipos (Individual, Doble, Suite, Presidencial)
  - Galería de imágenes
  - Estado en tiempo real

- **Sistema de Usuarios**
  - Autenticación JWT
  - Roles: Admin, Operador, Visitante
  - Perfiles personalizables
  - Gestión de permisos

- **Panel de Administración**
  - Dashboard con estadísticas
  - Gestión de usuarios
  - Reportes y métricas
  - Configuración del sistema

- **Notificaciones por Email**
  - Confirmación de reservas
  - Recordatorios de check-in
  - Actualizaciones de estado
  - Sistema de contacto

### 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Encriptación de contraseñas con bcrypt
- Validación de datos con express-validator
- Rate limiting para prevenir ataques
- Sanitización de entradas
- CORS configurado
- Helmet para headers seguros

### 📱 Responsive Design

- Diseño adaptable a todos los dispositivos
- Interfaz moderna con TailwindCSS
- Componentes reutilizables
- Experiencia de usuario optimizada

---

## 🛠 Tecnologías

### Frontend

- **React 18** - Librería de UI
- **React Router v6** - Navegación
- **Axios** - Cliente HTTP
- **TailwindCSS** - Estilos
- **Lucide React** - Iconos
- **Date-fns** - Manejo de fechas

### Backend

- **Node.js** - Runtime
- **Express** - Framework web
- **Sequelize** - ORM
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación
- **Nodemailer** - Emails
- **Node-cron** - Tareas programadas

### DevOps

- **Render** - Hosting y deployment
- **Git/GitHub** - Control de versiones
- **npm** - Gestor de paquetes

---

## 🏗 Arquitectura

```
azure-suites/
├── frontend/                 # Aplicación React
│   ├── public/              # Archivos estáticos
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # API calls
│   │   ├── utils/           # Utilidades
│   │   └── App.js           # Componente principal
│   └── package.json
│
├── backend/                  # API Node.js
│   ├── config/              # Configuraciones
│   │   └── database.js      # Conexión PostgreSQL
│   ├── models/              # Modelos Sequelize
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Reservation.js
│   │   ├── Payment.js
│   │   └── Contact.js
│   ├── middleware/          # Middlewares
│   │   ├── auth.js          # Autenticación
│   │   └── validation.js    # Validaciones
│   ├── services/            # Servicios
│   │   └── emailService.js  # Envío de emails
│   ├── scripts/             # Scripts útiles
│   │   ├── seedDataMultiple.js
│   │   ├── seedProduction.js
│   │   ├── exportData.js
│   │   └── importData.js
│   ├── server.js            # Servidor principal
│   └── package.json
│
├── .gitignore
├── MIGRATION_GUIDE.md       # Guía de migración
└── README.md                # Este archivo
```

---

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 16.x
- npm >= 8.x
- PostgreSQL >= 14.x (o cuenta en Render)
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Jose888-pixe/Web-hotel.git
cd Web-hotel
```

### 2. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuración

### 1. Crear Base de Datos PostgreSQL

**Opción A: Render (Recomendado para producción)**
1. Ir a [Render Dashboard](https://dashboard.render.com)
2. New → PostgreSQL
3. Configurar y crear
4. Copiar la Internal Database URL

**Opción B: Local**
```bash
createdb azuresuites
```

### 2. Configurar Variables de Entorno

Crear archivo `backend/.env`:

```env
# PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# Environment
NODE_ENV=development

# JWT Secret (generar uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Server Port
PORT=3001

# Email Configuration (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion
EMAIL_FROM=noreply@azuresuites.com
```

### 3. Poblar Base de Datos

```bash
cd backend
npm run seed
```

Esto creará:
- 3 usuarios (admin, operador, visitante)
- 26 habitaciones de diferentes tipos
- 2 reservas de ejemplo

---

## 💻 Uso

### Desarrollo Local

#### 1. Iniciar Backend
```bash
cd backend
npm run dev
```
Servidor corriendo en: `http://localhost:3001`

#### 2. Iniciar Frontend
```bash
cd frontend
npm start
```
Aplicación corriendo en: `http://localhost:3003`

### Producción

```bash
# Backend
cd backend
npm start

# Frontend (build)
cd frontend
npm run build
```

---

## 📡 API

### Autenticación

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
```

### Habitaciones

```http
GET    /api/rooms              # Listar habitaciones
GET    /api/rooms/:id          # Obtener habitación
POST   /api/rooms              # Crear habitación (Admin)
PUT    /api/rooms/:id          # Actualizar habitación (Admin)
DELETE /api/rooms/:id          # Eliminar habitación (Admin)
```

### Reservas

```http
GET    /api/reservations       # Listar reservas
GET    /api/reservations/:id   # Obtener reserva
POST   /api/reservations       # Crear reserva
PUT    /api/reservations/:id   # Actualizar reserva
DELETE /api/reservations/:id   # Cancelar reserva
```

### Usuarios

```http
GET    /api/users              # Listar usuarios (Admin)
GET    /api/users/:id          # Obtener usuario (Admin)
POST   /api/users              # Crear usuario (Admin)
PUT    /api/users/:id          # Actualizar usuario (Admin)
DELETE /api/users/:id          # Eliminar usuario (Admin)
PUT    /api/users/profile/me   # Actualizar perfil propio
```

### Contacto

```http
POST   /api/contact            # Enviar mensaje
GET    /api/contact            # Listar mensajes (Admin)
GET    /api/contact/:id        # Obtener mensaje (Admin)
PUT    /api/contact/:id        # Responder mensaje (Admin)
DELETE /api/contact/:id        # Eliminar mensaje (Admin)
```

---

## 🗄️ Base de Datos

### Modelos

#### User
- id, firstName, lastName, email, password
- phone, role, isActive, lastLogin
- notifications, language
- address (street, city, state, zipCode, country)

#### Room
- id, number, type, name, description
- price, capacity, size, floor
- features (wifi, tv, airConditioning, etc.)
- images, status, isActive
- lastCleaned, maintenanceUntil

#### Reservation
- id, reservationNumber, userId, roomId
- guestInfo (firstName, lastName, email, phone, idNumber, nationality)
- checkIn, checkOut, adults, children
- totalAmount, status, paymentStatus, paymentMethod
- specialRequests, notes

#### Payment
- id, transactionId, reservationId, userId
- amount, currency, method, status
- paymentDate, receiptUrl
- refundInfo (amount, date, reason)

#### Contact
- id, name, email, phone, subject, message
- status, priority, assignedToId
- responseMessage, respondedById, respondedAt

### Relaciones

```
User 1:N Reservation
User 1:N Payment
Room 1:N Reservation
Reservation 1:N Payment
User 1:N Contact (assigned)
User 1:N Contact (responded)
```

---

## 🚢 Deployment

### Render (Recomendado)

#### 1. Crear PostgreSQL Database
- New → PostgreSQL
- Copiar Internal Database URL

#### 2. Crear Web Service
- New → Web Service
- Conectar repositorio GitHub
- Configurar:
  - **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
  - **Start Command:** `cd backend && npm start`

#### 3. Variables de Entorno
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=noreply@azuresuites.com
```

#### 4. Deploy
- Manual Deploy → Deploy latest commit
- Esperar 3-5 minutos

### Migración de Datos

Si necesitas migrar datos de SQLite a PostgreSQL, consulta [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## 🔧 Scripts Disponibles

### Backend

```bash
npm start          # Iniciar servidor
npm run dev        # Desarrollo con nodemon
npm run seed       # Poblar base de datos
npm run export     # Exportar datos a JSON
npm run import     # Importar datos desde JSON
npm run migrate    # Exportar e importar (migración)
npm test           # Ejecutar tests
```

### Frontend

```bash
npm start          # Desarrollo
npm run build      # Build para producción
npm test           # Ejecutar tests
```

---

## 🎨 Características de UI

### Páginas Principales

- **Home** - Página de inicio con búsqueda
- **Rooms** - Catálogo de habitaciones
- **Room Details** - Detalles y reserva
- **Login/Register** - Autenticación
- **Profile** - Perfil de usuario
- **Reservations** - Mis reservas
- **Admin Dashboard** - Panel de administración
- **Operator Dashboard** - Panel de operador

### Componentes

- Navbar responsive
- Footer informativo
- Modales de reserva
- Calendarios de disponibilidad
- Filtros avanzados
- Galerías de imágenes
- Formularios validados
- Notificaciones toast

---

## 🔐 Roles y Permisos

### Visitante (Visitor)
- Ver habitaciones
- Hacer reservas
- Ver sus propias reservas
- Actualizar perfil
- Enviar mensajes de contacto

### Operador (Operator)
- Todo lo de Visitante +
- Ver todas las reservas
- Actualizar estado de reservas
- Gestionar check-in/check-out
- Ver mensajes de contacto

### Administrador (Admin)
- Todo lo de Operador +
- Gestionar habitaciones (CRUD)
- Gestionar usuarios (CRUD)
- Ver estadísticas y reportes
- Configurar sistema
- Responder mensajes de contacto

---

## 📊 Características Técnicas

### Backend

- **Arquitectura RESTful** - API bien estructurada
- **Middleware Chain** - Autenticación, validación, sanitización
- **Error Handling** - Manejo centralizado de errores
- **Logging** - Morgan para logs HTTP
- **Rate Limiting** - Protección contra ataques
- **CORS** - Configurado para producción
- **Compression** - Respuestas comprimidas
- **Cron Jobs** - Tareas automáticas (recordatorios, limpieza)

### Frontend

- **Context API** - Gestión de estado global
- **Protected Routes** - Rutas protegidas por rol
- **Lazy Loading** - Carga optimizada de componentes
- **Error Boundaries** - Manejo de errores en UI
- **Responsive Design** - Mobile-first approach
- **Accessibility** - ARIA labels y navegación por teclado

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

---

## 👥 Autores

- **Equipo de Desarrollo** - Azure Suites Team

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

Para soporte, envía un email a support@azuresuites.com o abre un issue en GitHub.

---

## 🎯 Roadmap

- [ ] Integración con pasarelas de pago (Stripe, PayPal)
- [ ] Sistema de reviews y calificaciones
- [ ] Chat en vivo con soporte
- [ ] App móvil (React Native)
- [ ] Sistema de puntos y fidelización
- [ ] Integración con redes sociales
- [ ] Multi-idioma (i18n)
- [ ] Dashboard analytics avanzado
- [ ] Exportación de reportes (PDF, Excel)
- [ ] API pública para integraciones

---

## 📚 Documentación Adicional

- [Guía de Migración](./MIGRATION_GUIDE.md) - Migración de SQLite a PostgreSQL
- [API Documentation](./docs/API.md) - Documentación completa de la API
- [Deployment Guide](./docs/DEPLOYMENT.md) - Guía detallada de deployment

---

## 🙏 Agradecimientos

- React Team por la increíble librería
- Sequelize por el ORM robusto
- Render por el hosting gratuito
- Comunidad open source

---

**Hecho con ❤️ por el equipo de Azure Suites**
