# 📧 Configuración de Emails - Azure Suites

## 🎯 Funcionalidades Implementadas

### 1️⃣ Formulario de Contacto
Cuando un usuario completa el formulario de contacto, se envía un email automáticamente a la empresa (tu Gmail).

### 2️⃣ Confirmación de Reserva
Cuando un operador confirma una reserva desde su panel, se envía automáticamente un email de confirmación al usuario (al email que usó para registrarse).

---

## ⚙️ Configuración en Render

### Variables de Entorno Necesarias

Ve a tu servicio backend en Render → **Environment** y configura:

#### 1. EMAIL_HOST
```
Key:   EMAIL_HOST
Value: smtp.gmail.com
```

#### 2. EMAIL_PORT
```
Key:   EMAIL_PORT
Value: 587
```

#### 3. EMAIL_SECURE
```
Key:   EMAIL_SECURE
Value: false
```

#### 4. EMAIL_USER
```
Key:   EMAIL_USER
Value: tu-email@gmail.com
```
✅ Marca como **Secret**

**Ejemplo:** `azuresuiteshotel@gmail.com`

#### 5. EMAIL_PASSWORD
```
Key:   EMAIL_PASSWORD
Value: tu_app_password_de_16_caracteres
```
✅ Marca como **Secret**

**⚠️ IMPORTANTE:** Debe ser una **App Password** de Gmail, NO tu contraseña normal.

**Cómo generar App Password:**
1. Ve a https://myaccount.google.com/apppasswords
2. Nombre: "Azure Suites Hotel"
3. Copia la contraseña de 16 caracteres
4. Pégala en Render

#### 6. EMAIL_FROM
```
Key:   EMAIL_FROM
Value: Azure Suites Hotel <tu-email@gmail.com>
```

**Ejemplo:** `Azure Suites Hotel <azuresuiteshotel@gmail.com>`

#### 7. COMPANY_EMAIL (Opcional)
```
Key:   COMPANY_EMAIL
Value: tu-email@gmail.com
```

**Nota:** Si no configuras `COMPANY_EMAIL`, se usará `EMAIL_USER` por defecto para recibir los mensajes del formulario de contacto.

#### 8. FRONTEND_URL
```
Key:   FRONTEND_URL
Value: https://azure-suites.onrender.com
```

Reemplaza con tu URL real de Render.

---

## 📋 Resumen de Variables

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=azuresuiteshotel@gmail.com          # [Secret]
EMAIL_PASSWORD=abcd efgh ijkl mnop              # [Secret] App Password de 16 chars
EMAIL_FROM=Azure Suites Hotel <azuresuiteshotel@gmail.com>
COMPANY_EMAIL=azuresuiteshotel@gmail.com        # Opcional (usa EMAIL_USER si no está)
FRONTEND_URL=https://azure-suites.onrender.com
```

---

## 🧪 Verificar Configuración

### Opción 1: Desde tu terminal local

```bash
cd backend
node checkEmailConfig.js
```

Deberías ver:
```
✅ EMAIL_HOST = smtp.gmail.com
✅ EMAIL_PORT = 587
✅ EMAIL_USER = azuresuiteshotel@gmail.com
✅ EMAIL_PASSWORD = ***CONFIGURED***
✅ EMAIL_SECURE = false
✅ EMAIL_FROM = Azure Suites Hotel <azuresuiteshotel@gmail.com>
✅ COMPANY_EMAIL = azuresuiteshotel@gmail.com
✅ FRONTEND_URL = https://azure-suites.onrender.com
```

### Opción 2: Verificar en logs de Render

Después de redesplegar, revisa los logs. Deberías ver:
```
📧 Email service configured with custom SMTP
📧 Host: smtp.gmail.com:587
📧 User: azuresuiteshotel@gmail.com
✅ SMTP connection verified successfully
```

---

## 🎬 Flujo de Emails

### Formulario de Contacto

1. Usuario completa formulario en: `https://tu-app.onrender.com/#contact`
2. Se guarda en la base de datos
3. Se envía email a `COMPANY_EMAIL` (o `EMAIL_USER`)
4. **Recibes el email** con:
   - Nombre del usuario
   - Email del usuario
   - Asunto
   - Mensaje

### Confirmación de Reserva

1. Usuario hace una reserva (estado: "pending")
2. Operador entra a su panel: `https://tu-app.onrender.com/operator`
3. Operador confirma la reserva (cambia estado a "confirmed")
4. **El usuario recibe un email** con:
   - ✅ Confirmación de reserva
   - Número de reserva
   - Detalles de la habitación
   - Fechas de check-in/check-out
   - Total a pagar
   - Horarios importantes

---

## 📧 Tipos de Emails Automáticos

El sistema envía estos emails automáticamente:

### A los Usuarios:
- ✅ **Bienvenida** - Al registrarse
- ✅ **Confirmación de reserva** - Cuando operador confirma
- ✅ **Cancelación de reserva** - Cuando se cancela
- ✅ **Recordatorio de check-in** - 1 día antes (9:00 AM)

### A la Empresa (tu email):
- ✅ **Mensajes del formulario de contacto**

---

## 🔍 Troubleshooting

### Error: "SMTP connection verification failed"

**Causa:** Credenciales incorrectas o App Password no generada.

**Solución:**
1. Verifica que `EMAIL_USER` sea tu email de Gmail correcto
2. Genera una nueva App Password en Google
3. Actualiza `EMAIL_PASSWORD` en Render
4. Redesplegar

### Error: "Invalid login"

**Causa:** Estás usando tu contraseña normal de Gmail en lugar de App Password.

**Solución:**
1. Ve a https://myaccount.google.com/apppasswords
2. Genera una nueva App Password
3. Usa esa contraseña de 16 caracteres en `EMAIL_PASSWORD`

### Los emails no llegan

**Solución:**
1. Revisa la carpeta de SPAM
2. Verifica los logs de Render para ver si se envió
3. Verifica que `EMAIL_FROM` contenga un email válido
4. Asegúrate de que Gmail no esté bloqueando el acceso

### Email llega pero sin formato

**Causa:** El cliente de email no soporta HTML.

**Solución:** Los templates están en HTML. La mayoría de clientes modernos (Gmail, Outlook) los soportan correctamente.

---

## ✅ Checklist de Configuración

- [ ] App Password de Gmail generada
- [ ] Variables configuradas en Render:
  - [ ] `EMAIL_HOST`
  - [ ] `EMAIL_PORT`
  - [ ] `EMAIL_SECURE`
  - [ ] `EMAIL_USER` (marcado como Secret)
  - [ ] `EMAIL_PASSWORD` (marcado como Secret)
  - [ ] `EMAIL_FROM`
  - [ ] `COMPANY_EMAIL` (opcional)
  - [ ] `FRONTEND_URL`
- [ ] Redespliegue completado
- [ ] Verificación en logs: "SMTP connection verified successfully"
- [ ] Prueba de formulario de contacto exitosa
- [ ] Prueba de confirmación de reserva exitosa

---

## 🎉 ¡Listo!

Tu sistema de emails está completamente configurado y funcionando. Los usuarios recibirán emails profesionales y tú recibirás todos los mensajes del formulario de contacto.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Render
2. Ejecuta `node checkEmailConfig.js` localmente
3. Verifica que la App Password sea correcta
4. Asegúrate de que Gmail no esté bloqueando el acceso
