# 📧 Sistema de Emails Automáticos

Este documento describe el sistema completo de notificaciones por email implementado en Azure Suites Hotel.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Configuración](#configuración)
- [Tipos de Emails](#tipos-de-emails)
- [Sistema de Rotación](#sistema-de-rotación)
- [Recordatorios Automáticos](#recordatorios-automáticos)
- [Modo de Desarrollo](#modo-de-desarrollo)

---

## ✨ Características

### **Emails a Visitantes:**
1. ✅ **Bienvenida**: Cuando se registra un usuario
2. ✅ **Reserva Confirmada**: Cuando un operador confirma la reserva
3. ✅ **Reserva Cancelada**: Cuando se cancela una reserva
4. ✅ **Recordatorio de Check-in**: Un día antes del check-in

### **Emails a Operadores:**
1. ✅ **Nueva Reserva**: Con toda la información y mensaje del usuario
2. ✅ **Mensaje de Contacto**: Del formulario de contacto
3. 🔄 **Rotación Automática**: Se distribuyen equitativamente entre operadores

---

## ⚙️ Configuración

### **1. Modo de Desarrollo (Ethereal - Por Defecto)**

Si NO configuras variables de email, el sistema usará automáticamente **Ethereal Email**, un servicio de prueba que permite ver los emails sin enviarlos realmente.

**Ventajas:**
- ✅ No requiere configuración
- ✅ Funciona inmediatamente
- ✅ Muestra URLs de vista previa en la consola
- ✅ Perfecto para desarrollo local

**Consola mostrará:**
```
📧 Email service using Ethereal (test mode)
📧 Preview emails at: https://ethereal.email/messages
📧 User: your-test-user@ethereal.email
📧 Pass: your-test-password
```

Puedes ver todos los emails enviados en: https://ethereal.email/messages

---

### **2. Modo de Producción (SMTP Real)**

#### **Opción A: Gmail (Más Simple)**

1. Ve a tu cuenta de Google → Seguridad
2. Habilita "Verificación en 2 pasos"
3. Crea una "Contraseña de aplicación"
4. Agrega al `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
EMAIL_FROM="Azure Suites Hotel <noreply@azuresuites.com>"
```

#### **Opción B: SendGrid (Profesional)**

1. Crea cuenta en [SendGrid](https://sendgrid.com)
2. Genera una API Key
3. Agrega al `.env`:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=tu_sendgrid_api_key
EMAIL_FROM="Azure Suites Hotel <noreply@azuresuites.com>"
```

#### **Opción C: Mailgun**

1. Crea cuenta en [Mailgun](https://mailgun.com)
2. Verifica tu dominio
3. Agrega al `.env`:

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@tu-dominio.com
EMAIL_PASSWORD=tu_mailgun_password
EMAIL_FROM="Azure Suites Hotel <noreply@azuresuites.com>"
```

---

## 📨 Tipos de Emails

### **1. Email de Bienvenida**

**Cuándo:** Cuando un usuario se registra  
**A quién:** Usuario nuevo  
**Incluye:**
- Saludo personalizado
- Beneficios de tener cuenta
- Enlace al sitio web

**Ejemplo:**
```
Asunto: ¡Bienvenido a Azure Suites Hotel!

¡Hola Juan!

Gracias por registrarte en Azure Suites Hotel.
Tu cuenta ha sido creada exitosamente...
```

---

### **2. Nueva Reserva (Operador)**

**Cuándo:** Cuando un usuario crea una reserva  
**A quién:** Operador en rotación  
**Incluye:**
- Número de reserva
- Datos del huésped (nombre, email, teléfono)
- Detalles de la habitación
- Fechas de check-in/check-out
- Número de huéspedes
- Total a pagar
- **Mensaje especial del usuario** (si lo escribió)
- Estado: PENDIENTE

**Ejemplo:**
```
Asunto: Nueva Reserva - RES1729195847123

Hola Operador,

Se ha recibido una nueva reserva que requiere tu atención.

Número de Reserva: RES1729195847123
Estado: ⏳ PENDIENTE

Datos del Huésped:
- Nombre: Juan Pérez
- Email: juan@example.com
- Teléfono: +34 91 123 4567

Mensaje del Huésped:
"Por favor, habitación con vista al mar si es posible."

[Ver en Panel de Operador]
```

---

### **3. Reserva Confirmada**

**Cuándo:** Cuando un operador confirma una reserva  
**A quién:** Usuario que hizo la reserva  
**Incluye:**
- Número de reserva
- Habitación asignada
- Fechas completas
- Horarios de check-in/check-out
- Total a pagar

---

### **4. Reserva Cancelada**

**Cuándo:** Cuando se cancela una reserva  
**A quién:** Usuario afectado  
**Incluye:**
- Número de reserva cancelada
- Habitación que tenía asignada
- Fechas originales
- Enlace para hacer nuevas reservas

---

### **5. Recordatorio de Check-in**

**Cuándo:** Automáticamente a las 9:00 AM, un día antes del check-in  
**A quién:** Usuario con reserva para mañana  
**Incluye:**
- Recordatorio de fecha
- Número de reserva
- Habitación asignada
- Horarios de check-in
- Indicaciones para llegar
- Documentos necesarios

**Ejemplo:**
```
Asunto: Recordatorio: Check-in mañana - RES1729195847123

¡Hola Juan!

Te recordamos que mañana es tu día de check-in en Azure Suites Hotel.

📅 Mañana, viernes 18 de octubre

Habitación #207 - Habitación Doble Superior

Horario de check-in: A partir de las 15:00 hrs
```

---

### **6. Mensaje de Contacto (Operador)**

**Cuándo:** Cuando alguien envía el formulario de contacto  
**A quién:** Operador en rotación  
**Incluye:**
- Nombre del remitente
- Email del remitente
- Asunto
- Mensaje completo
- Fecha y hora

---

## 🔄 Sistema de Rotación de Operadores

### **¿Cómo Funciona?**

El sistema usa **Round-Robin** (rotación circular) para distribuir emails equitativamente:

1. Se obtienen todos los operadores de la base de datos (ordenados por ID)
2. Cada vez que se necesita enviar un email:
   - Se selecciona el siguiente operador en la lista
   - El índice avanza circularmente
3. Cuando llega al último operador, vuelve al primero

### **Ejemplo con 3 Operadores:**

```
Operadores en BD:
1. operator1@hotel.com
2. operator2@hotel.com  
3. operator3@hotel.com

Secuencia de emails:
Email #1 → operator1@hotel.com
Email #2 → operator2@hotel.com
Email #3 → operator3@hotel.com
Email #4 → operator1@hotel.com (vuelve al primero)
Email #5 → operator2@hotel.com
...
```

### **Casos de Uso:**

**Nueva Reserva:**
- Reserva 1 → Operador 1
- Reserva 2 → Operador 2
- Reserva 3 → Operador 1

**Mensaje de Contacto:**
- Mensaje 1 → Operador 2
- Mensaje 2 → Operador 1
- Mensaje 3 → Operador 2

**Garantías:**
✅ Cada operador recibe carga equitativa  
✅ No se salta ningún operador  
✅ Funciona con cualquier número de operadores  
✅ Si hay 1 solo operador, recibe todos los emails

---

## ⏰ Recordatorios Automáticos (Cron Jobs)

### **Check-in Reminders**

**Programación:** Diariamente a las 9:00 AM  
**Función:** Enviar recordatorios a usuarios con check-in mañana

**Proceso:**
1. Cada día a las 9:00 AM se ejecuta automáticamente
2. Busca todas las reservas con check-in = mañana
3. Filtra solo reservas confirmadas o pendientes
4. Envía email de recordatorio a cada usuario
5. Registra en logs cuántos emails se enviaron

**Logs en Consola:**
```
🕐 9:00 AM - Running scheduled check-in reminders
🔔 Running check-in reminder task...
📋 Found 3 reservations with check-in tomorrow
✅ Reminder sent to juan@example.com for reservation RES...
✅ Reminder sent to maria@example.com for reservation RES...
✅ Reminder sent to pedro@example.com for reservation RES...
✅ Check-in reminder task completed
```

### **Testing Manual:**

Para probar sin esperar al cron, puedes llamar manualmente:

```javascript
const { triggerCheckInReminders } = require('./services/cronService');
triggerCheckInReminders();
```

---

## 🧪 Modo de Desarrollo

### **Ethereal Email (Recomendado para Dev)**

**Sin configurar nada**, el sistema usará Ethereal automáticamente:

1. **Inicia el servidor:**
   ```bash
   npm start
   ```

2. **Verás en consola:**
   ```
   📧 Email service using Ethereal (test mode)
   📧 Preview emails at: https://ethereal.email/messages
   📧 User: example.user@ethereal.email
   📧 Pass: your-test-password
   ```

3. **Cuando se envíe un email, verás:**
   ```
   📧 Email sent: <message-id>
   📧 Preview URL: https://ethereal.email/message/abc123...
   ```

4. **Haz click en el Preview URL** o ve a https://ethereal.email e inicia sesión con las credenciales mostradas

### **Ventajas:**
- ✅ No necesita configuración
- ✅ Ver emails en formato HTML completo
- ✅ Probar templates sin enviar emails reales
- ✅ No consume cuota de servicios de email
- ✅ No riesgo de spam accidental

---

## 🎨 Plantillas de Email

Todas las plantillas usan:
- ✅ HTML responsive
- ✅ Estilos inline (compatibilidad con clientes de email)
- ✅ Colores del brand (gradientes azul/púrpura)
- ✅ Iconos emoji para visual appeal
- ✅ Botones CTA bien diseñados
- ✅ Footer con copyright

---

## 📊 Logs y Monitoreo

El sistema registra en consola:

```
📧 Welcome email sent to user@example.com
📧 Reservation notification sent to operator: op1@hotel.com
👤 Operator 1/2 selected: op1@hotel.com
📧 confirmed email sent to user@example.com
```

**Prefijos:**
- `📧` = Email enviado exitosamente
- `⚠️` = Error al enviar (no fatal)
- `❌` = Error crítico
- `👤` = Operador seleccionado
- `🔔` = Tarea programada ejecutada

---

## 🚀 Inicio Rápido

### **Para Empezar (Sin Configuración):**

1. Instalar dependencias (ya hecho):
   ```bash
   npm install nodemailer node-cron
   ```

2. Iniciar servidor:
   ```bash
   npm start
   ```

3. Registrar un usuario nuevo → Recibirás welcome email en Ethereal

4. Crear una reserva → Operador recibe notificación

5. Ver emails en: https://ethereal.email

### **Para Producción:**

1. Elige un servicio SMTP (Gmail, SendGrid, Mailgun)
2. Configura las variables en `.env`
3. Reinicia el servidor
4. ✅ Emails se enviarán realmente

---

## 🔧 Troubleshooting

### **"No operators found in database"**
**Causa:** No hay usuarios con role='operator'  
**Solución:** Ejecuta `npm run seed` para crear operadores

### **"Failed to send email"**
**Causa:** Credenciales SMTP incorrectas  
**Solución:** 
- Verifica EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD
- Para Gmail, usa contraseña de aplicación, no la normal
- Revisa que EMAIL_PORT sea correcto (587 normalmente)

### **Emails no llegan a Gmail (van a spam)**
**Causa:** Falta configuración SPF/DKIM  
**Solución:** 
- Para pruebas, revisa carpeta de spam
- Para producción, usa un servicio profesional (SendGrid)
- Configura SPF y DKIM en tu dominio

### **"Cron job not running"**
**Causa:** El servidor se reinició  
**Solución:** Los cron jobs se inicializan al arrancar el servidor

---

## 📝 Mantenimiento

### **Verificar Estado de Rotación:**

```javascript
const { getRotationStatus } = require('./services/operatorRotationService');
const status = await getRotationStatus();
console.log(status);
```

### **Reiniciar Rotación:**

```javascript
const { resetRotation } = require('./services/operatorRotationService');
resetRotation();
```

### **Trigger Manual de Recordatorios:**

```javascript
const { triggerCheckInReminders } = require('./services/cronService');
await triggerCheckInReminders();
```

---

## 🎯 Resumen

| Evento | Email a | Cuándo | Rotación |
|--------|---------|--------|----------|
| Usuario se registra | Visitante | Inmediato | - |
| Reserva creada | Operador | Inmediato | ✅ Sí |
| Reserva confirmada | Visitante | Al confirmar | - |
| Reserva cancelada | Visitante | Al cancelar | - |
| Check-in mañana | Visitante | 9:00 AM diario | - |
| Mensaje de contacto | Operador | Inmediato | ✅ Sí |

---

## 📧 Contacto y Soporte

Si tienes problemas o preguntas sobre el sistema de emails, revisa los logs de consola que proporcionan información detallada de cada operación.

**¡El sistema está listo para usar!** 🎉
