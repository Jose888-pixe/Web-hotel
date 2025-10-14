# 🏨 Azure Suites - Sistema de Reservas de Hotel

Un sistema completo de gestión hotelera desarrollado con **React + JavaScript** y **Node.js/Express**, con tres roles de usuario y deployment en la nube.

[![Deploy en Render](https://img.shields.io/badge/Deploy-Render-46E3B7)](https://render.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)](https://postgresql.org/)

## 🏨 Características Principales

### Roles de Usuario

#### 👤 Usuario Visitante
- Ver listado de habitaciones con fotos, descripciones y precios
- Acceder a información de servicios del hotel
- Realizar reservas online con formulario validado
- Enviar consultas por formulario de contacto

#### 🏢 Operador del Hotel
- Consultar disponibilidad mediante mapa interactivo
- Gestionar reservas (consultar, confirmar, liberar)
- Cambiar estado de habitaciones (disponible/ocupada/mantenimiento/limpieza)
- Procesar pagos de reservas
- Responder correos de clientes

#### 👑 Administrador
- CRUD completo de habitaciones
- CRUD de operadores y usuarios
- Consultas parametrizadas sobre reservas y pagos
- Panel de control completo

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js** para API REST
- **PostgreSQL** con **Sequelize ORM** (producción)
- **SQLite** para desarrollo local
- **JWT** para autenticación segura
- **Bcrypt** para encriptación de contraseñas
- **CORS** y **Helmet** para seguridad

### Frontend
- **React 18** con **JavaScript** (NO TypeScript)
- **React Router v6** para navegación SPA
- **React Bootstrap** + **Bootstrap 5** para UI
- **Chart.js** para dashboards y estadísticas
- **Axios** para peticiones HTTP
- **Context API** para estado global

### Base de Datos
- **PostgreSQL 14+** en producción (Render)
- **SQLite** en desarrollo local
- Modelos: User, Room, Reservation, Payment, Contact
- Relaciones y constraints con Sequelize

### APIs y Servicios
- **Render.com** para deployment completo
- **Cloudflare** para CDN (opcional)
- Integración de email con **Nodemailer**

## 🎨 Diseño Visual

### Inspiración
- Sitios de **Behance** y **Awwwards**
- Fotografías profesionales de **Unsplash**
- Paleta de colores elegante (dorado #d4af37 + negro #1a1a1a)

### UX/UI Features
- Navegación clara y intuitiva
- Formularios amigables con validación
- Diseño responsive para todos los dispositivos
- Animaciones suaves y transiciones
- Tipografía legible y jerarquía visual clara

## 📊 Estructura de Base de Datos

### Colecciones Principales

#### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['visitor', 'operator', 'admin'],
  phone: String,
  isActive: Boolean
}
```

#### Rooms
```javascript
{
  number: String (unique),
  type: ['single', 'double', 'suite', 'deluxe', 'presidential'],
  name: String,
  description: String,
  price: Number,
  capacity: Number,
  size: Number,
  amenities: [String],
  images: [{url, alt, isPrimary}],
  features: {wifi, airConditioning, minibar, balcony, etc.},
  status: ['available', 'occupied', 'maintenance', 'cleaning']
}
```

#### Reservations
```javascript
{
  reservationNumber: String (auto-generated),
  user: ObjectId,
  room: ObjectId,
  checkIn: Date,
  checkOut: Date,
  guests: {adults, children},
  totalAmount: Number,
  status: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
  paymentStatus: ['pending', 'partial', 'paid', 'refunded'],
  guestInfo: {firstName, lastName, email, phone}
}
```

#### Payments
```javascript
{
  reservation: ObjectId,
  amount: Number,
  method: ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'paypal'],
  status: ['pending', 'completed', 'failed', 'refunded'],
  transactionId: String,
  processedBy: ObjectId
}
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (v16 o superior)
- **npm** o **yarn**
- **Git** y **GitHub Desktop** (para deployment)

### Desarrollo Local

#### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/hotel-azure-suites.git
cd hotel-azure-suites
```

#### 2. Instalar dependencias del Backend
```bash
npm install
```

#### 3. Instalar dependencias del Frontend
```bash
cd hotel-react
npm install
cd ..
```

#### 4. Configurar variables de entorno
```bash
# En la raíz del proyecto
cp .env.example .env
# Editar .env (usa SQLite por defecto en desarrollo)
```

#### 5. Poblar base de datos local
```bash
npm run seed
```

#### 6. Iniciar servidores

**Terminal 1 - Backend:**
```bash
npm start
# Corre en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd hotel-react
npm start
# Corre en http://localhost:3003
```

### Variables de Entorno

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=tu_clave_secreta_super_segura
DATABASE_URL=  # Solo en producción con PostgreSQL
FRONTEND_URL=http://localhost:3003
```

#### Frontend (hotel-react/.env)
```env
REACT_APP_API_URL=http://localhost:3001
PORT=3003
```

## 📱 Uso del Sistema

### Usuarios de Prueba
- **Admin**: admin@hotelelegance.com / admin123
- **Operador**: operator@hotelelegance.com / operator123
- **Visitante**: juan@example.com / visitor123

### Funcionalidades Principales

#### Para Visitantes
1. Navegar por habitaciones disponibles
2. Usar filtros por tipo, precio, capacidad
3. Realizar reservas con formulario completo
4. Enviar consultas por contacto

#### Para Operadores
1. Ver mapa de disponibilidad en tiempo real
2. Gestionar reservas existentes
3. Procesar pagos y cambiar estados
4. Responder consultas de clientes

#### Para Administradores
1. Gestión completa de habitaciones
2. Administración de usuarios y operadores
3. Reportes y estadísticas avanzadas
4. Configuración del sistema

## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Contraseñas encriptadas con bcrypt
- Validación de datos en frontend y backend
- Rate limiting para prevenir ataques
- Sanitización de inputs
- CORS configurado apropiadamente

## 📈 Características Avanzadas

### APIs Integradas
- **Geolocalización**: Mapa interactivo con ubicación del hotel
- **Subida de archivos**: Para comprobantes de pago e imágenes
- **Email**: Notificaciones automáticas y respuestas

### Responsive Design
- Mobile-first approach
- Breakpoints optimizados
- Touch-friendly interfaces
- Imágenes optimizadas

### Performance
- Lazy loading de imágenes
- Compresión de assets
- Caching de datos
- Optimización de consultas DB

## 🚀 Deployment en Render.com

Este proyecto está optimizado para deployment en **Render.com** con PostgreSQL.

### Guía Completa
Ver archivo **[DEPLOYMENT.md](DEPLOYMENT.md)** para instrucciones detalladas paso a paso.

### Resumen Rápido

1. **Subir a GitHub**
   - Usar GitHub Desktop
   - Crear repositorio `hotel-azure-suites`
   - Push inicial

2. **Crear en Render**
   - PostgreSQL Database (Free tier)
   - Backend Web Service (Node.js)
   - Frontend Static Site (React)

3. **Configurar Variables**
   - `DATABASE_URL` en Backend (auto)
   - `JWT_SECRET` en Backend
   - `FRONTEND_URL` en Backend
   - `REACT_APP_API_URL` en Frontend

4. **Poblar DB**
   - Shell de Render: `npm run seed`

### URLs de Producción
- Frontend: `https://hotel-frontend.onrender.com`
- Backend API: `https://hotel-backend-xxxx.onrender.com`

### Características del Plan Gratuito
- ✅ 750 horas/mes de servidor
- ✅ 100GB de ancho de banda
- ✅ 1GB de base de datos PostgreSQL
- ⚠️ Se duerme tras 15 min inactividad
- ⚠️ Primer acceso tarda ~30 seg

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@hotelelegance.com
- Documentación: [Wiki del proyecto]
- Issues: [GitHub Issues]

---

**Hotel Elegance** - Sistema de Reservas Moderno y Elegante 🏨✨
