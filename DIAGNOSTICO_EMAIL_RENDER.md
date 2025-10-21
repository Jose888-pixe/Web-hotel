# 🔍 Diagnóstico de Emails en Render

## ⚠️ Problema

Has configurado las variables de entorno en Render pero los emails siguen sin funcionar.

---

## 🛠️ Diagnóstico Paso a Paso

### **Paso 1: Verificar Configuración en Render**

**Ve a este URL en tu navegador:**
```
https://azure-suites-backend.onrender.com/api/email-config
```

**Deberías ver algo así:**
```json
{
  "configured": true,
  "host": "smtp.gmail.com",
  "port": "587",
  "secure": "false",
  "user": "azuresuitshotel@gmail.com",
  "passwordSet": true,
  "from": "Azure Suites Hotel <noreply@azuresuites.com>",
  "mode": "SMTP",
  "timestamp": "2025-10-20T..."
}
```

**Si ves esto, las variables ESTÁN configuradas ✅**

**Si ves `"mode": "Ethereal (Test)"`, las variables NO están configuradas ❌**

---

### **Paso 2: Verificar Logs de Render**

1. Ve al Dashboard de Render
2. Click en **azure-suites-backend**
3. Click en **Logs**
4. Busca estas líneas al inicio del deploy:

```
✅ Database connected
✅ Database synced
✅ Email service initialized
📧 Email service configured with custom SMTP  ← DEBE DECIR ESTO
✅ Cron jobs initialized
🌟 Server running on http://localhost:3001
```

**Si dice:**
```
📧 Email service using Ethereal (test mode)
```
**❌ Las variables NO están siendo leídas**

---

### **Paso 3: Probar Envío de Email**

**Usa este comando en tu terminal o Postman:**

```bash
curl -X POST https://azure-suites-backend.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"azuresuitshotel@gmail.com"}'
```

**O desde tu navegador con DevTools:**
```javascript
fetch('https://azure-suites-backend.onrender.com/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to: 'azuresuitshotel@gmail.com' })
})
.then(r => r.json())
.then(d => console.log(d));
```

**Respuesta esperada si funciona:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "<...>"
}
```

**Revisa tu inbox en `azuresuitshotel@gmail.com`**

---

## 🔧 Soluciones por Problema

### **Problema 1: Variables No Se Leen**

**Síntoma:** El endpoint `/api/email-config` muestra `"mode": "Ethereal (Test)"`

**Causa:** Las variables de entorno no se aplicaron al servicio.

**Solución:**

1. Ve a Render Dashboard → **azure-suites-backend**
2. Ve a **Environment**
3. Verifica que TODAS estas variables existan:
   - ✅ `EMAIL_HOST` = `smtp.gmail.com`
   - ✅ `EMAIL_PORT` = `587`
   - ✅ `EMAIL_SECURE` = `false`
   - ✅ `EMAIL_USER` = `azuresuitshotel@gmail.com`
   - ✅ `EMAIL_PASSWORD` = `[tu contraseña de aplicación]`
   - ✅ `EMAIL_FROM` = `"Azure Suites Hotel <noreply@azuresuites.com>"`

4. **IMPORTANTE:** Después de agregar variables, debes hacer:
   - Click en **Manual Deploy** → **Clear build cache & deploy**
   - O simplemente hacer un nuevo **Deploy**

---

### **Problema 2: Error "Invalid login" o "EAUTH"**

**Síntoma:** El test de email falla con error de autenticación

**Causa:** Contraseña incorrecta o no es App Password

**Solución:**

1. **Verifica que usas App Password de Gmail:**
   - Ve a https://myaccount.google.com/apppasswords
   - Genera una nueva App Password
   - Copia la contraseña SIN espacios (16 caracteres)

2. **Actualiza la variable en Render:**
   - Ve a Environment
   - Edita `EMAIL_PASSWORD`
   - Pega la nueva contraseña
   - **Deploy** de nuevo

3. **Verifica que el email es correcto:**
   - `EMAIL_USER` debe ser el email completo: `azuresuitshotel@gmail.com`
   - NO solo el nombre de usuario

---

### **Problema 3: Contraseña Con Espacios**

**Síntoma:** Error de autenticación a pesar de tener App Password

**Causa:** Gmail genera la contraseña con espacios: `abcd efgh ijkl mnop`

**Solución:**

**QUITA LOS ESPACIOS:**
- ❌ Incorrecto: `abcd efgh ijkl mnop`
- ✅ Correcto: `abcdefghijklmnop`

Actualiza en Render y redeploy.

---

### **Problema 4: Variables en Quotes Incorrectos**

**Síntoma:** Valores extraños en `/api/email-config`

**Causa:** Formato incorrecto en Render

**Solución:**

En Render Environment, las variables NO deben tener comillas:

❌ **Incorrecto:**
```
EMAIL_FROM = "Azure Suites Hotel <noreply@azuresuites.com>"
```

✅ **Correcto:**
```
EMAIL_FROM = Azure Suites Hotel <noreply@azuresuites.com>
```

❌ **Incorrecto:**
```
EMAIL_SECURE = "false"
```

✅ **Correcto:**
```
EMAIL_SECURE = false
```

---

### **Problema 5: No Re-Deploy Después de Cambios**

**Síntoma:** Agregaste las variables pero siguen sin aparecer

**Causa:** Render no detectó los cambios automáticamente

**Solución:**

**Después de cambiar variables de entorno, SIEMPRE:**

1. Ve al Dashboard de Render
2. Click en tu servicio **azure-suites-backend**
3. Click en **Manual Deploy**
4. Selecciona **Clear build cache & deploy**
5. Espera a que termine
6. Verifica con `/api/email-config`

---

## 📝 Checklist de Verificación

Marca cada paso que verificaste:

- [ ] `/api/email-config` muestra `"mode": "SMTP"` ✅
- [ ] `"configured": true` en el endpoint
- [ ] `"passwordSet": true` en el endpoint
- [ ] Logs muestran "Email service configured with custom SMTP"
- [ ] App Password de Gmail generado (16 caracteres)
- [ ] Contraseña SIN espacios
- [ ] Variables en Render SIN comillas
- [ ] Hice re-deploy después de agregar variables
- [ ] Test email (`/api/test-email`) funciona
- [ ] Email de prueba llega a mi inbox

---

## 🧪 Test Completo

Sigue estos pasos EN ORDEN:

### **1. Verificar Variables**
```
https://azure-suites-backend.onrender.com/api/email-config
```
✅ `"configured": true` y `"mode": "SMTP"`

### **2. Ver Logs**
Dashboard → Logs → Buscar "Email service configured with custom SMTP"

### **3. Enviar Test**
```bash
curl -X POST https://azure-suites-backend.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"TU_EMAIL@gmail.com"}'
```

### **4. Verificar Inbox**
Revisa tu email (puede tardar 1-2 minutos)

### **5. Probar en la App**
Registra un nuevo usuario y verifica que llegue el email de bienvenida

---

## 🚨 Si Nada Funciona

### **Último Recurso: Recrear Variables**

1. **Borra TODAS las variables de email en Render**
2. **Deploy** (para limpiar)
3. **Agrega las variables de nuevo una por una:**

```
EMAIL_HOST
smtp.gmail.com

EMAIL_PORT
587

EMAIL_SECURE
false

EMAIL_USER
azuresuitshotel@gmail.com

EMAIL_PASSWORD
[tu app password SIN espacios]

EMAIL_FROM
Azure Suites Hotel <noreply@azuresuites.com>
```

4. **Deploy con cache limpio**
5. **Verifica** con `/api/email-config`

---

## 📊 Interpretación de Respuestas

### **Email Config Response**

```json
{
  "configured": true,     ← true = Todo OK | false = Falta algo
  "host": "smtp.gmail.com", ← Debe ser smtp.gmail.com
  "port": "587",          ← Debe ser 587
  "secure": "false",      ← Debe ser false (string)
  "user": "azuresuitshotel@gmail.com", ← Tu email completo
  "passwordSet": true,    ← true = Contraseña configurada
  "from": "Azure Suites Hotel <noreply@azuresuites.com>",
  "mode": "SMTP"          ← SMTP = Configurado | Ethereal = NO configurado
}
```

### **Test Email Response**

**✅ Exitoso:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "<...@gmail.com>"
}
```

**❌ Falló:**
```json
{
  "success": false,
  "message": "Failed to send test email",
  "error": "Invalid login: 535-5.7.8 Username and Password not accepted..."
}
```

---

## 💡 Tip Rápido

**El error más común es:**
1. ✅ Variables configuradas en Render
2. ❌ No hacer re-deploy después
3. ❌ El código viejo sigue corriendo sin las variables

**Solución:** SIEMPRE hacer **Deploy** después de cambiar variables.

---

## 🎯 Comandos Rápidos

**Ver configuración:**
```bash
curl https://azure-suites-backend.onrender.com/api/email-config
```

**Enviar test:**
```bash
curl -X POST https://azure-suites-backend.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"TU_EMAIL@gmail.com"}'
```

**Verificar logs (desde tu navegador DevTools):**
```javascript
fetch('https://azure-suites-backend.onrender.com/api/email-config')
  .then(r => r.json())
  .then(d => console.table(d));
```

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir TODOS estos pasos los emails siguen sin funcionar:

1. Comparte el resultado de `/api/email-config`
2. Comparte las primeras 50 líneas de los Logs de Render
3. Comparte el error exacto que te sale al enviar el test

¡Con esa información puedo ayudarte exactamente!
