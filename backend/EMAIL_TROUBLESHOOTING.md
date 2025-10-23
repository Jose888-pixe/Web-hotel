# 🔧 Solución de Problemas de Email

## Problemas Identificados

### 1. **Timeout Largo (30-60 segundos)**
El formulario tarda mucho en responder porque:
- No había timeouts configurados en el transporter de Nodemailer
- Gmail puede tardar mucho en responder si hay problemas de autenticación

**✅ SOLUCIONADO**: Agregados timeouts de 10-15 segundos

### 2. **Emails No Llegan**
Los emails no llegan por una de estas razones:
- App Password incorrecto
- Verificación en 2 pasos no activada
- Configuración SMTP incorrecta

## Soluciones Implementadas

### ✅ Cambios en `emailService.js`:
1. **Timeouts agregados**:
   - `connectionTimeout: 10000` (10 segundos)
   - `greetingTimeout: 10000` (10 segundos)
   - `socketTimeout: 15000` (15 segundos)

2. **Verificación de conexión al iniciar**:
   - El servidor ahora verifica la conexión SMTP al arrancar
   - Muestra errores claros si la configuración es incorrecta

3. **Mejor logging**:
   - Muestra tiempo de envío de cada email
   - Errores más descriptivos (ETIMEDOUT, EAUTH, etc.)

### ✅ Cambios en `server.js`:
1. **Endpoint de contacto mejorado**:
   - Guarda el mensaje en la base de datos PRIMERO
   - Intenta enviar el email DESPUÉS
   - Si el email falla, el mensaje se guarda igual
   - Responde con `emailSent: true/false` para debugging

## Cómo Verificar la Configuración

### Paso 1: Verificar Variables de Entorno

Ejecuta en el backend:
```bash
node checkEmailConfig.js
```

Debes ver:
```
✅ EMAIL_HOST         = smtp.gmail.com
✅ EMAIL_PORT         = 587
✅ EMAIL_USER         = azuresuiteshotel@gmail.com
✅ EMAIL_PASSWORD     = ***CONFIGURED***
✅ EMAIL_SECURE       = false
✅ EMAIL_FROM         = Azure Suites Hotel <noreply@azuresuites.com>
```

### Paso 2: Probar Envío de Email

Ejecuta:
```bash
node testEmailQuick.js
```

Este script:
1. Verifica la configuración
2. Inicializa el transporter
3. Envía un email de prueba
4. Muestra el resultado y tiempo de envío

### Paso 3: Verificar Gmail App Password

**IMPORTANTE**: Gmail NO acepta contraseñas normales. Necesitas un **App Password**.

#### Cómo crear un App Password:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa **Verificación en 2 pasos** (si no está activada)
3. Ve a **Seguridad** → **Contraseñas de aplicaciones**
4. Selecciona **Correo** y **Otro (nombre personalizado)**
5. Escribe "Azure Suites Backend"
6. Copia el password de 16 caracteres (sin espacios)
7. Actualiza `EMAIL_PASSWORD` en Render con este valor

## Configuración Correcta para Gmail

En Render Dashboard → Environment:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=azuresuiteshotel@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (16 caracteres, sin espacios)
EMAIL_FROM=Azure Suites Hotel <noreply@azuresuites.com>
```

⚠️ **IMPORTANTE**: 
- `EMAIL_SECURE` debe ser `false` para puerto 587
- `EMAIL_PASSWORD` debe ser un App Password de 16 caracteres
- Marca `EMAIL_PASSWORD` como **Secret** en Render

## Verificar que Funciona

### En Desarrollo (Local):

1. Reinicia el servidor backend
2. Deberías ver en la consola:
   ```
   📧 Email service configured with custom SMTP
   📧 Host: smtp.gmail.com:587
   📧 User: azuresuiteshotel@gmail.com
   📧 Secure: false
   ✅ SMTP connection verified successfully
   ```

3. Llena el formulario de contacto
4. Deberías ver:
   ```
   📝 Creating contact message from: usuario@ejemplo.com
   ✅ Contact message saved to database, ID: 1
   📧 Attempting to send email to operator: operador@email.com
   📧 Sending email to: operador@email.com
   📧 Subject: Nuevo Mensaje de Contacto - Asunto del mensaje
   ✅ Email sent successfully in 1234ms
   📧 Message ID: <...>
   ✅ Contact message forwarded to operator: operador@email.com
   ```

### En Producción (Render):

1. Ve a Logs en Render Dashboard
2. Busca los mismos mensajes de arriba
3. Si ves `❌ SMTP connection verification failed`, revisa tu App Password

## Problemas Comunes

### ❌ Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solución**: 
- Verifica que estés usando un App Password, no tu contraseña de Gmail
- Regenera el App Password si es necesario

### ❌ Error: "ETIMEDOUT" o "Connection timeout"
**Solución**:
- Verifica tu conexión a internet
- Asegúrate de que Render puede conectarse a smtp.gmail.com
- Verifica que el puerto 587 no esté bloqueado

### ❌ Error: "EAUTH - Authentication failed"
**Solución**:
- Regenera el App Password
- Verifica que la verificación en 2 pasos esté activada
- Asegúrate de copiar el password sin espacios

### ⏱️ El formulario tarda mucho
**Solución**:
- Con los nuevos timeouts, debería responder en máximo 15 segundos
- Si sigue tardando, verifica los logs para ver dónde se atasca

## Monitoreo

Para ver los logs en tiempo real en Render:
1. Ve a tu servicio backend
2. Click en "Logs"
3. Envía un mensaje de contacto
4. Observa los logs para ver el proceso completo

## Alternativa: Usar Ethereal (Modo Test)

Si no quieres configurar Gmail, puedes usar Ethereal para testing:

1. Elimina o comenta las variables `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`
2. El servidor usará automáticamente Ethereal
3. Los emails no se envían realmente, pero puedes verlos en la URL que aparece en los logs

Ejemplo:
```
📧 Email service using Ethereal (test mode)
📧 Preview emails at: https://ethereal.email/messages
📧 User: test.account@ethereal.email
📧 Pass: testpassword123
```

## Resumen de Mejoras

✅ Timeouts agregados (10-15 segundos máximo)
✅ Verificación de conexión al iniciar
✅ Logging detallado con tiempos
✅ Mensajes de error más claros
✅ El formulario guarda el mensaje aunque el email falle
✅ Script de prueba rápida (`testEmailQuick.js`)
✅ Documentación completa

## Siguiente Paso

Ejecuta `node testEmailQuick.js` para verificar que todo funciona correctamente.
