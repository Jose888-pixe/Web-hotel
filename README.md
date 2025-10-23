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

# Email Configuration (SendGrid - Recomendado para Render)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Azure Suites Hotel <tu_email@gmail.com>"
COMPANY_EMAIL=tu_email@gmail.com

# Alternativa: Gmail SMTP (puede no funcionar en Render)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=tu_email@gmail.com
# EMAIL_PASSWORD=tu_app_password_de_16_caracteres

# Frontend URL (para emails)
FRONTEND_URL=http://localhost:3003
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

# SendGrid (Recomendado - funciona en Render)
SENDGRID_API_KEY=SG.xxxxxxxx...
EMAIL_FROM="Azure Suites Hotel <tu_email@gmail.com>"
COMPANY_EMAIL=tu_email@gmail.com
FRONTEND_URL=https://tu-app.onrender.com
```

**Notas importantes:**
- **SENDGRID_API_KEY:** Obtén una en [SendGrid](https://sendgrid.com) (100 emails/día gratis)
  - Debes verificar tu email en SendGrid antes de enviar
  - La API Key debe tener permisos de "Mail Send"
- **EMAIL_FROM:** Debe ser el mismo email verificado en SendGrid
- **COMPANY_EMAIL:** Email donde llegarán los mensajes del formulario de contacto

**⚠️ Importante:** Render bloquea conexiones SMTP en su plan gratuito, por eso se recomienda SendGrid que usa API HTTP.

#### 4. Deploy
- Manual Deploy → Deploy latest commit
- Esperar 3-5 minutos

### Verificar Configuración de Email

```bash
cd backend
node checkEmailConfig.js
```

Esto verificará que todas las variables de email estén correctamente configuradas.

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

## 📧 Configuración de Emails

### Servicio Utilizado
- **Proveedor:** Gmail SMTP
- **Puerto:** 587 (TLS)
- **Autenticación:** App Password

### Emails Automáticos

#### A los Usuarios:
- ✅ **Bienvenida** - Al registrarse en la plataforma
- ✅ **Confirmación de reserva** - Cuando un operador confirma su reserva
- ✅ **Cancelación de reserva** - Cuando se cancela una reserva
- ✅ **Recordatorio de check-in** - 1 día antes de la llegada (9:00 AM)

#### A la Empresa:
- ✅ **Mensajes del formulario de contacto** - Enviados a `COMPANY_EMAIL`

### Configuración de SendGrid (Recomendado para Render)

#### 1. Crear cuenta en SendGrid
1. Ve a https://sendgrid.com/
2. Regístrate gratis (100 emails/día)
3. Verifica tu email

#### 2. Verificar Sender Identity
1. **Settings** → **Sender Authentication** → **"Verify a Single Sender"**
2. Completa el formulario con tu email
3. Verifica el email que SendGrid te envía
4. Espera el check verde ✅

#### 3. Crear API Key
1. **Settings** → **API Keys** → **"Create API Key"**
2. Name: "Azure Suites Production"
3. Permissions: **Restricted Access** → **Mail Send: Full Access**
4. Copia la API Key (empieza con `SG.`)

#### 4. Configurar en Render
Agrega estas variables de entorno:
```
SENDGRID_API_KEY=SG.xxxxxxxx...
EMAIL_FROM=Azure Suites Hotel <tu_email@gmail.com>
COMPANY_EMAIL=tu_email@gmail.com
FRONTEND_URL=https://tu-app.onrender.com
```

#### 5. Instalar dependencia
```bash
cd backend
npm install @sendgrid/mail
```

### ¿Por qué SendGrid y no Gmail SMTP?

**Render bloquea conexiones SMTP** (puertos 587, 465, 25) en su plan gratuito para prevenir spam. SendGrid usa **API HTTP** en lugar de SMTP, por lo que funciona perfectamente.

**Comparación:**
| Característica | Gmail SMTP | SendGrid |
|----------------|------------|----------|
| Funciona en Render | ❌ No | ✅ Sí |
| Configuración | Compleja | Simple |
| Límite gratuito | N/A | 100/día |
| Confiabilidad | Baja | Alta |

---

## 📊 Visualizar Base de Datos

### Opción 1: pgAdmin (Recomendado)

**pgAdmin** es la herramienta oficial de PostgreSQL para administrar bases de datos.

#### Instalación:
1. Descarga desde: https://www.pgadmin.org/download/
2. Instala según tu sistema operativo

#### Conectar a Render:
1. Abre pgAdmin
2. Click derecho en "Servers" → "Register" → "Server"
3. En la pestaña "General":
   - Name: `Azure Suites - Render`
4. En la pestaña "Connection":
   - Host: (copia de Render Dashboard → Database → External Database URL)
   - Port: `5432`
   - Database: (nombre de tu base de datos)
   - Username: (usuario de la base de datos)
   - Password: (contraseña de la base de datos)
5. Click "Save"

#### Ver Diagrama ER:
1. En pgAdmin, navega a tu base de datos
2. Click derecho en la base de datos → **"ERD For Database"**
3. Se abrirá un diagrama con todas las tablas y relaciones

### Opción 2: DBeaver (Alternativa gratuita)

1. Descarga desde: https://dbeaver.io/download/
2. Instala y abre DBeaver
3. Click en "New Database Connection"
4. Selecciona "PostgreSQL"
5. Ingresa los datos de conexión de Render
6. Para ver el diagrama: Click derecho en tu base de datos → **"View Diagram"**

### Opción 3: DataGrip (JetBrains - Pago)

1. Descarga desde: https://www.jetbrains.com/datagrip/
2. Conecta con los datos de Render
3. Click derecho en la base de datos → **"Diagrams" → "Show Visualization"**

### Opción 4: Render Dashboard (Limitado)

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu base de datos PostgreSQL
3. Click en **"Connect"** → **"External Connection"**
4. Usa las credenciales para conectarte con cualquier cliente SQL

### Obtener Credenciales de Render:

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en tu base de datos PostgreSQL
3. En la sección "Connections":
   - **Internal Database URL:** Para conectar desde servicios de Render
   - **External Database URL:** Para conectar desde tu computadora
4. Copia la URL externa y extrae:
   ```
   postgresql://usuario:contraseña@host:puerto/database
   ```

### Estructura de la Base de Datos:

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │──1:N──│ Reservation  │──N:1──│    Room     │
│             │       │              │       │             │
│ - id        │       │ - id         │       │ - id        │
│ - email     │       │ - userId     │       │ - number    │
│ - role      │       │ - roomId     │       │ - type      │
│ - ...       │       │ - checkIn    │       │ - price     │
└─────────────┘       │ - checkOut   │       │ - ...       │
      │               │ - ...        │       └─────────────┘
      │               └──────────────┘              
      │                      │                       
      │                      │                       
      │               ┌──────────────┐              
      └──────1:N──────│   Payment    │              
                      │              │              
                      │ - id         │              
                      │ - userId     │              
                      │ - reservationId              
                      │ - amount     │              
                      │ - ...        │              
                      └──────────────┘              
```

## 🙏 Agradecimientos

- React Team por la increíble librería
- Sequelize por el ORM robusto
- Render por el hosting gratuito
- SendGrid por el servicio de emails
- Comunidad open source

---

**Hecho con ❤️ por el equipo de Azure Suites**
