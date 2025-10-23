# 🚨 Solución: SMTP Timeout en Render

## ❌ Problema

```
❌ SMTP connection verification failed: Connection timeout
code: 'ETIMEDOUT'
```

**Causa:** Render bloquea conexiones SMTP salientes (puertos 587, 465, 25) en su plan gratuito para prevenir spam.

---

## ✅ SOLUCIÓN: Usar SendGrid

SendGrid usa **API HTTP** en lugar de SMTP, por lo que funciona perfectamente en Render.

---

## 📋 Pasos para Configurar SendGrid

### 1️⃣ Crear Cuenta en SendGrid

1. Ve a https://sendgrid.com/
2. Click **"Start for Free"**
3. Completa el registro
4. Verifica tu email

**Plan gratuito:** 100 emails/día (suficiente para desarrollo)

---

### 2️⃣ Verificar tu Email (Single Sender)

1. En SendGrid Dashboard → **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Completa el formulario:
   ```
   From Name: Azure Suites Hotel
   From Email: maxiecha98@gmail.com
   Reply To: maxiecha98@gmail.com
   Company Address: Dique Cabra Corral
   City: Salta
   Zip Code: 4400
   Country: Argentina
   Nickname: Azure Suites
   ```
4. Click **"Create"**
5. **⚠️ IMPORTANTE:** Revisa tu email (maxiecha98@gmail.com)
6. Click en el link de verificación
7. Espera el check verde ✅ en SendGrid

---

### 3️⃣ Crear API Key

1. **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Configuración:
   - **Name:** `Azure Suites Production`
   - **Permissions:** **Restricted Access**
   - Expande **Mail Send** → Selecciona **Full Access**
   - Todo lo demás: **No Access**
4. Click **"Create & View"**
5. **⚠️ COPIA LA API KEY AHORA** (solo se muestra una vez)
   ```
   Ejemplo: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### 4️⃣ Instalar Dependencia

En tu proyecto local:

```bash
cd backend
npm install @sendgrid/mail
```

---

### 5️⃣ Configurar en Render

1. Ve a tu servicio backend en Render
2. Click **"Environment"**
3. **ELIMINA o COMENTA** las variables SMTP antiguas:
   - `EMAIL_HOST` (opcional: déjala comentada)
   - `EMAIL_PORT` (opcional: déjala comentada)
   - `EMAIL_USER` (opcional: déjala comentada)
   - `EMAIL_PASSWORD` (opcional: déjala comentada)
   - `EMAIL_SECURE` (opcional: déjala comentada)

4. **AGREGA** las nuevas variables de SendGrid:

#### Variable 1: SENDGRID_API_KEY
```
Key:   SENDGRID_API_KEY
Value: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
✅ Marca como **Secret**

#### Variable 2: EMAIL_FROM
```
Key:   EMAIL_FROM
Value: Azure Suites Hotel <maxiecha98@gmail.com>
```
⚠️ **IMPORTANTE:** Debe ser el MISMO email verificado en SendGrid

#### Variable 3: COMPANY_EMAIL
```
Key:   COMPANY_EMAIL
Value: maxiecha98@gmail.com
```

#### Variable 4: FRONTEND_URL (si no existe)
```
Key:   FRONTEND_URL
Value: https://azure-suites.onrender.com
```

5. Click **"Save Changes"**
6. Render redesplegará automáticamente

---

### 6️⃣ Verificar Logs

Después del redespliegue, deberías ver:

```
📧 Email service configured with SendGrid API
📧 From: Azure Suites Hotel <maxiecha98@gmail.com>
✅ Email service initialized
```

**NO** deberías ver:
```
❌ SMTP connection verification failed
```

---

### 7️⃣ Probar

1. Ve a https://azure-suites.onrender.com/#contact
2. Completa el formulario de contacto
3. Enviar

**Logs esperados:**
```
📝 Creating contact message from: test@example.com
✅ Contact message saved to database
📧 Attempting to send contact form to company: maxiecha98@gmail.com
📧 Sending email to: maxiecha98@gmail.com
📧 Subject: Nuevo Mensaje de Contacto - ...
✅ Email sent via SendGrid in 234ms
📧 Status: 202
✅ Contact message forwarded to company: maxiecha98@gmail.com
```

4. **Verifica tu Gmail** - Deberías recibir el email

---

## 📊 Comparación: SMTP vs SendGrid

| Característica | SMTP (Gmail) | SendGrid |
|----------------|--------------|----------|
| **Funciona en Render** | ❌ No (timeout) | ✅ Sí |
| **Configuración** | Compleja (App Password) | Simple (API Key) |
| **Límite gratuito** | N/A | 100/día |
| **Confiabilidad** | Baja en hosting | Alta |
| **Velocidad** | Lenta | Rápida |
| **Recomendado para producción** | ❌ No | ✅ Sí |

---

## 🔧 Resumen de Variables en Render

### ✅ CON SENDGRID (Recomendado):

```env
SENDGRID_API_KEY=SG.xxxxxxxx...                    [Secret]
EMAIL_FROM=Azure Suites Hotel <maxiecha98@gmail.com>
COMPANY_EMAIL=maxiecha98@gmail.com
FRONTEND_URL=https://azure-suites.onrender.com
```

### ❌ CON SMTP (No funciona en Render):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=maxiecha98@gmail.com                    [Secret]
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx                 [Secret]
EMAIL_FROM=Azure Suites Hotel <maxiecha98@gmail.com>
COMPANY_EMAIL=maxiecha98@gmail.com
FRONTEND_URL=https://azure-suites.onrender.com
```

---

## 🎯 Checklist

- [ ] Cuenta de SendGrid creada
- [ ] Email verificado en SendGrid (check verde ✅)
- [ ] API Key creada y copiada
- [ ] `npm install @sendgrid/mail` ejecutado
- [ ] Variables configuradas en Render:
  - [ ] `SENDGRID_API_KEY`
  - [ ] `EMAIL_FROM`
  - [ ] `COMPANY_EMAIL`
  - [ ] `FRONTEND_URL`
- [ ] Redespliegue completado
- [ ] Logs verificados (sin errores SMTP)
- [ ] Email de prueba enviado exitosamente
- [ ] Email recibido en Gmail

---

## 🆘 Troubleshooting

### Error: "Sender email not verified"
**Solución:** Ve a SendGrid → Settings → Sender Authentication y verifica que tu email tenga el check verde ✅

### Error: "Invalid API Key"
**Solución:** Verifica que copiaste la API Key completa (empieza con `SG.`)

### Error: "403 Forbidden"
**Solución:** La API Key no tiene permisos de Mail Send. Crea una nueva con los permisos correctos.

### Los emails no llegan
**Solución:**
1. Verifica en SendGrid → Activity si se enviaron
2. Revisa la carpeta de SPAM
3. Verifica que `EMAIL_FROM` coincida con el email verificado

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Render
2. Verifica que el email esté verificado en SendGrid (check verde)
3. Asegúrate de que la API Key sea correcta
4. Revisa SendGrid → Activity para ver el estado de los emails

---

**¡Con SendGrid tus emails funcionarán perfectamente en Render! 🎉**
